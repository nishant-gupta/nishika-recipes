import { loadFragment } from '../fragment/fragment.js';

// Canonical content type order — determines section sequence on the issue page
const CONTENT_TYPES = [
  { id: 'riddle',  label: 'Riddle',   emoji: '🧩', blockType: 'riddle-interactive' },
  { id: 'idiom',   label: 'Idiom',    emoji: '💬', blockType: 'idiom-of-week' },
  { id: 'science', label: 'Science',  emoji: '🔬', blockType: 'science-experiment' },
  { id: 'poem',    label: 'Poem',     emoji: '📖', blockType: 'poem' },
  { id: 'craft',   label: 'Craft',    emoji: '✂️', blockType: 'craft-steps' },
];

function buildSectionHeading(sec) {
  const heading = document.createElement('div');
  heading.className = `issue-section-heading issue-section-heading-${sec.id}`;

  const pill = document.createElement('span');
  pill.className = 'issue-section-pill';

  const icon = document.createElement('span');
  icon.className = 'issue-section-pill-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = sec.emoji;

  const label = document.createElement('span');
  label.textContent = sec.label;

  pill.append(icon, label);
  heading.append(pill);
  return heading;
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Row 0: issue number | date | title
  const headerCells = [...(rows[0]?.children || [])];
  const issueNum  = headerCells[0]?.textContent.trim() || '';
  const issueDate = headerCells[1]?.textContent.trim() || '';
  const issueTitle = headerCells[2]?.textContent.trim() || '';

  // Row 1: tagline
  const tagline = rows[1]?.children[0]?.textContent.trim() || '';

  // Issue tag derived from page URL: /issues/issue-1 → issue-1
  const issueTag = window.location.pathname.split('/').filter(Boolean).pop() || '';

  block.textContent = '';

  // ── Fetch content pieces from query index ────────────
  let sections = [];
  try {
    const resp = await fetch('/query-index.json');
    if (resp.ok) {
      const { data } = await resp.json();
      sections = data
        .filter((p) => p.issue === issueTag && p.type)
        .sort((a, b) => {
          const ai = CONTENT_TYPES.findIndex((t) => t.id === a.type);
          const bi = CONTENT_TYPES.findIndex((t) => t.id === b.type);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        })
        .map((p) => {
          const meta = CONTENT_TYPES.find((t) => t.id === p.type)
            || { id: p.type, label: p.type, emoji: '📄', blockType: p.type };
          return { ...meta, path: p.path };
        });
    }
  } catch {
    // query-index unavailable — hero renders without dynamic sections
  }

  // ── Build hero card ──────────────────────────────────
  const hero = document.createElement('div');
  hero.className = 'issue-hero';

  // Left column
  const heroLeft = document.createElement('div');
  heroLeft.className = 'issue-hero-left';

  const metaRow = document.createElement('div');
  metaRow.className = 'issue-cover-meta';

  const badge = document.createElement('span');
  badge.className = 'issue-cover-badge';
  badge.textContent = `✦ ${issueNum}`;

  const dateEl = document.createElement('span');
  dateEl.className = 'issue-cover-date';
  dateEl.textContent = issueDate;

  metaRow.append(badge, dateEl);

  const titleEl = document.createElement('h1');
  titleEl.className = 'issue-cover-title';
  titleEl.textContent = issueTitle;

  const taglineEl = document.createElement('p');
  taglineEl.className = 'issue-cover-tagline';
  taglineEl.textContent = tagline;

  heroLeft.append(metaRow, titleEl, taglineEl);

  if (sections.length > 0) {
    const countBtn = document.createElement('button');
    countBtn.className = 'issue-hero-count';
    countBtn.type = 'button';
    countBtn.textContent = `${sections.length} piece${sections.length !== 1 ? 's' : ''} this week ↓`;
    countBtn.addEventListener('click', () => {
      const first = document.getElementById(sections[0].id);
      if (!first) return;
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 64;
      const stripEl = document.querySelector('.issue-progress');
      const stripHeight = stripEl ? stripEl.getBoundingClientRect().height : 0;
      window.scrollTo({ top: first.getBoundingClientRect().top + window.scrollY - navHeight - stripHeight - 16, behavior: 'smooth' });
    });
    heroLeft.append(countBtn);
  }

  // Right column
  const heroRight = document.createElement('div');
  heroRight.className = 'issue-hero-right';

  const decorNum = document.createElement('div');
  decorNum.className = 'issue-hero-number';
  decorNum.setAttribute('aria-hidden', 'true');
  decorNum.textContent = issueNum.replace(/\D/g, '');

  const contentList = document.createElement('ul');
  contentList.className = 'issue-hero-contents';

  sections.forEach((sec) => {
    const li = document.createElement('li');
    li.className = `issue-hero-content-item issue-hero-content-item-${sec.id}`;

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'issue-hero-content-emoji';
    emojiSpan.setAttribute('aria-hidden', 'true');
    emojiSpan.textContent = sec.emoji;

    const labelSpan = document.createElement('span');
    labelSpan.textContent = sec.label;

    li.append(emojiSpan, labelSpan);
    contentList.append(li);
  });

  heroRight.append(decorNum, contentList);
  hero.append(heroLeft, heroRight);
  block.append(hero);

  // ── Build sticky progress strip ──────────────────────
  const strip = document.createElement('div');
  strip.className = 'issue-progress';
  strip.setAttribute('role', 'navigation');
  strip.setAttribute('aria-label', 'Issue contents');

  const inner = document.createElement('div');
  inner.className = 'issue-progress-inner';

  sections.forEach((sec, i) => {
    if (i > 0) {
      const connector = document.createElement('div');
      connector.className = 'issue-progress-connector';
      connector.setAttribute('aria-hidden', 'true');
      inner.append(connector);
    }

    const item = document.createElement('a');
    item.className = 'issue-progress-item';
    item.dataset.cat = sec.id;
    item.href = `#${sec.id}`;
    item.setAttribute('aria-label', sec.label);

    const icon = document.createElement('span');
    icon.className = 'issue-progress-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = sec.emoji;

    const label = document.createElement('span');
    label.className = 'issue-progress-label';
    label.textContent = sec.label;

    item.append(icon, label);
    inner.append(item);
  });

  strip.append(inner);

  const headerEl = document.querySelector('header');
  if (headerEl) {
    headerEl.after(strip);
  } else {
    document.body.prepend(strip);
  }

  // ── Progress strip interaction ───────────────────────
  const progressItems = [...inner.querySelectorAll('.issue-progress-item')];

  function setActive(id) {
    progressItems.forEach((item) => item.classList.toggle('active', item.dataset.cat === id));
    const activeItem = inner.querySelector(`.issue-progress-item[data-cat="${id}"]`);
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  if (sections.length > 0) setActive(sections[0].id);

  inner.addEventListener('click', (e) => {
    const link = e.target.closest('.issue-progress-item');
    if (!link) return;
    e.preventDefault();
    const target = document.getElementById(link.dataset.cat);
    if (!target) return;
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 64;
    const stripHeight = strip.getBoundingClientRect().height;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navHeight - stripHeight - 16, behavior: 'smooth' });
  });

  // ── Load fragments and inject sections into main ──────
  const main = document.querySelector('main');
  if (!main || sections.length === 0) return;

  // Load all fragments in parallel, preserve order
  const loadedSections = await Promise.all(sections.map(async (sec) => {
    const fragment = await loadFragment(sec.path, sec.blockType);
    if (!fragment) return null;

    const section = document.createElement('div');
    section.className = 'section';

    const anchor = document.createElement('span');
    anchor.id = sec.id;
    anchor.className = 'issue-section-anchor';
    anchor.setAttribute('aria-hidden', 'true');

    section.append(anchor, buildSectionHeading(sec));

    fragment.querySelectorAll(':scope > .section').forEach((fs) => {
      [...fs.children].forEach((child) => section.append(child));
    });

    return section;
  }));

  // Append in canonical order
  loadedSections.forEach((section) => {
    if (section) main.append(section);
  });

  // ── IntersectionObserver (set up after sections are in DOM) ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-64px 0px -50% 0px', threshold: 0 },
  );

  sections.forEach((sec) => {
    const anchor = document.getElementById(sec.id);
    if (anchor) observer.observe(anchor);
  });
}
