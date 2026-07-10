import { loadFragment } from '../fragment/fragment.js';

// Guard against re-entrant decoration (e.g. when the issue page itself
// appears in the query index and gets loaded as a fragment)
const decorating = new Set();

// Canonical content type order — determines section sequence on the issue page
const CONTENT_TYPES = [
  {
    id: 'riddle', label: 'Riddle', icon: '/icons/type-riddle.svg', blockType: 'riddle-interactive',
  },
  {
    id: 'idiom', label: 'Idiom', icon: '/icons/type-idiom.svg', blockType: 'idiom-of-week',
  },
  {
    id: 'science', label: 'Science', icon: '/icons/type-science.svg', blockType: 'science-experiment',
  },
  {
    id: 'poem', label: 'Poem', icon: '/icons/type-poem.svg', blockType: 'poem',
  },
  {
    id: 'story', label: 'Storybook', icon: '/icons/type-story.svg', blockType: 'storybook',
  },
  {
    id: 'narrative', label: 'Narrative', icon: '/icons/type-narrative.svg', blockType: 'narrative-writing',
  },
  {
    id: 'craft', label: 'Craft', icon: '/icons/type-craft.svg', blockType: 'craft-steps',
  },
];

function makeIcon(src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.width = 16;
  img.height = 16;
  img.setAttribute('aria-hidden', 'true');
  return img;
}

function buildSectionHeading(sec) {
  const heading = document.createElement('div');
  heading.className = `issue-section-heading issue-section-heading-${sec.id}`;

  const pill = document.createElement('span');
  pill.className = 'issue-section-pill';

  const iconWrap = document.createElement('span');
  iconWrap.className = 'issue-section-pill-icon';
  iconWrap.appendChild(makeIcon(sec.icon, sec.label));

  const label = document.createElement('span');
  label.textContent = sec.label;

  pill.append(iconWrap, label);
  heading.append(pill);
  return heading;
}

function makeNavBtn(href, text, className) {
  const btn = document.createElement('a');
  btn.className = `issue-nav-btn ${className}`;
  btn.href = href;
  btn.textContent = text;
  return btn;
}

export default async function decorate(block) {
  const currentPath = window.location.pathname;
  if (decorating.has(currentPath)) return;
  decorating.add(currentPath);

  const rows = [...block.children];

  // Row 0: issue number | date | title
  const headerCells = [...(rows[0]?.children || [])];
  const issueNum = headerCells[0]?.textContent.trim() || '';
  const issueDate = headerCells[1]?.textContent.trim() || '';
  const issueTitle = headerCells[2]?.textContent.trim() || '';

  // Row 1: tagline
  const tagline = rows[1]?.children[0]?.textContent.trim() || '';

  // Issue tag derived from page URL: /issues/issue-1 → issue-1
  const issueTag = window.location.pathname.split('/').filter(Boolean).pop() || '';

  // Force the section flush against the header — eliminates any gap
  // from the global `main > .section { margin: 40px 0 }` rule
  const coverSection = block.closest('.section');
  if (coverSection) {
    coverSection.style.margin = '0';
    coverSection.style.background = 'linear-gradient(135deg, #2d0a3e 0%, #5a1878 50%, #7c3f87 100%)';
  }

  // ── Fetch content pieces from query index ────────────
  let sections = [];
  let prevPath = null;
  let nextPath = null;
  try {
    const resp = await fetch('/query-index.json');
    if (resp.ok) {
      const { data } = await resp.json();
      sections = data
        .filter((p) => p.issue === issueTag && p.type && p.path !== currentPath)
        .sort((a, b) => {
          const ai = CONTENT_TYPES.findIndex((t) => t.id === a.type);
          const bi = CONTENT_TYPES.findIndex((t) => t.id === b.type);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        })
        .map((p) => {
          const meta = CONTENT_TYPES.find((t) => t.id === p.type) || {
            id: p.type, label: p.type, icon: '/icons/type-facts.svg', blockType: p.type,
          };
          return { ...meta, path: p.path };
        });

      // Derive prev/next issue paths from the index
      const numMatch = issueTag.match(/^(.*?)(\d+)$/);
      if (numMatch) {
        const prefix = numMatch[1];
        const n = parseInt(numMatch[2], 10);
        const issuePaths = new Set(
          data.filter((p) => p.path?.startsWith('/issues/')).map((p) => p.path),
        );
        if (n > 1 && issuePaths.has(`/issues/${prefix}${n - 1}`)) prevPath = `/issues/${prefix}${n - 1}`;
        if (issuePaths.has(`/issues/${prefix}${n + 1}`)) nextPath = `/issues/${prefix}${n + 1}`;
      }
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
      const wrapperEl = document.querySelector('.issue-sticky-wrapper');
      const stripHeight = wrapperEl ? wrapperEl.getBoundingClientRect().height : 0;
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

    const iconWrap = document.createElement('span');
    iconWrap.className = 'issue-hero-content-icon';
    iconWrap.appendChild(makeIcon(sec.icon, sec.label));

    const labelSpan = document.createElement('span');
    labelSpan.textContent = sec.label;

    li.append(iconWrap, labelSpan);
    contentList.append(li);
  });

  heroRight.append(decorNum, contentList);
  hero.append(heroLeft, heroRight);

  // Prev / Next footer bar spanning the full card bottom
  if (prevPath || nextPath) {
    const heroFooter = document.createElement('div');
    heroFooter.className = 'issue-hero-footer';
    if (prevPath) heroFooter.append(makeNavBtn(prevPath, '← Prev issue', 'issue-nav-prev'));
    else heroFooter.append(document.createElement('span'));
    if (nextPath) heroFooter.append(makeNavBtn(nextPath, 'Next issue →', 'issue-nav-next'));
    hero.append(heroFooter);
  }

  block.textContent = '';
  block.append(hero);

  // No content sections — hero-only render, nothing more to do
  if (sections.length === 0) return;

  // ── Build sticky context bar ──────────────────────────
  const context = document.createElement('div');
  context.className = 'issue-sticky-context';

  const ctxMeta = document.createElement('div');
  ctxMeta.className = 'issue-sticky-meta';

  const ctxBadge = document.createElement('span');
  ctxBadge.className = 'issue-cover-badge';
  ctxBadge.textContent = `✦ ${issueNum}`;

  const ctxTitle = document.createElement('span');
  ctxTitle.className = 'issue-sticky-title';
  ctxTitle.textContent = issueTitle;

  ctxMeta.append(ctxBadge, ctxTitle);
  context.append(ctxMeta);

  if (prevPath || nextPath) {
    const ctxNav = document.createElement('div');
    ctxNav.className = 'issue-sticky-nav';
    if (prevPath) ctxNav.append(makeNavBtn(prevPath, '← Prev', 'issue-nav-prev'));
    if (nextPath) ctxNav.append(makeNavBtn(nextPath, 'Next →', 'issue-nav-next'));
    context.append(ctxNav);
  }

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
    icon.appendChild(makeIcon(sec.icon, sec.label));

    const label = document.createElement('span');
    label.className = 'issue-progress-label';
    label.textContent = sec.label;

    item.append(icon, label);
    inner.append(item);
  });

  strip.append(inner);

  // ── Wrap context bar + strip in a single sticky container ──
  const stickyWrapper = document.createElement('div');
  stickyWrapper.className = 'issue-sticky-wrapper';
  stickyWrapper.append(context, strip);

  const issueSection = block.closest('.section');
  if (issueSection) {
    issueSection.after(stickyWrapper);
  } else {
    const headerEl = document.querySelector('header');
    if (headerEl) headerEl.after(stickyWrapper);
    else document.body.prepend(stickyWrapper);
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
    const stripHeight = stickyWrapper.getBoundingClientRect().height;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navHeight - stripHeight - 16, behavior: 'smooth' });
  });

  // ── Load fragments and inject sections into main ──────
  const main = document.querySelector('main');
  if (!main) return;

  // Load all fragments in parallel, preserve order
  const loadedSections = await Promise.all(sections.map(async (sec) => {
    let fragment;
    try {
      fragment = await loadFragment(sec.path, sec.blockType);
    } catch {
      return null;
    }
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

  // ── IntersectionObserver for section progress (set up after sections are in DOM) ──
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

  // ── Hero observer — reveal sticky context bar on scroll ──
  const heroObserver = new IntersectionObserver(
    ([entry]) => context.classList.toggle('visible', !entry.isIntersecting),
    {
      rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 64}px 0px 0px 0px`,
      threshold: 0,
    },
  );
  heroObserver.observe(hero);
}
