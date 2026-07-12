const VERSE_THEMES = [
  {
    type: 'water',
    icon: '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6" opacity="0.7"/><circle cx="12" cy="12" r="10" opacity="0.4"/>',
  },
  {
    type: 'light',
    icon: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  },
  {
    type: 'growth',
    icon: '<path d="M12 21V10"/><path d="M12 10C12 6 9 5 6 5c0 4 2 6 6 6z"/><path d="M12 13c0-4 3-5 6-5 0 4-2 6-6 6z"/>',
  },
];

const BOOK_SVG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 5c2.5-1.3 5-1.3 7 0v14c-2-1.3-4.5-1.3-7 0V5z"/><path d="M21 5c-2.5-1.3-5-1.3-7 0v14c2-1.3 4.5-1.3 7 0V5z"/></svg>';
const SPARKLE_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0l1.8 8.2L22 10l-8.2 1.8L12 20l-1.8-8.2L2 10l8.2-1.8z"/></svg>';

// Per-poem decorative sheet color pairs [c1=::before, c2=::after]
const POEM_SCHEMES = [
  { c1: '#cfe0cf', c2: '#e7c0aa' },
  { c1: '#c7cfe3', c2: '#e8c468' },
  { c1: '#e8c468', c2: '#cfe0cf' },
  { c1: '#e7c0aa', c2: '#c7cfe3' },
];

function makeVerseIcon(paths) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${paths}</svg>`;
}

function parseStanza(cell) {
  const paras = [...cell.querySelectorAll('p')];
  if (!paras.length) {
    const parts = cell.textContent.split('\n').map((s) => s.trim()).filter(Boolean);
    const [label, ...rest] = parts;
    return { label: label || '', lines: rest };
  }
  const [first, ...rest] = paras;
  const label = first.textContent.trim();
  const lines = rest.flatMap((p) => {
    const clone = p.cloneNode(true);
    [...clone.querySelectorAll('br')].forEach((br) => br.replaceWith('\n'));
    return clone.textContent.split('\n').map((l) => l.trim()).filter(Boolean);
  });
  return { label, lines };
}

function parsePoem(block) {
  const data = {
    title: '',
    kicker: 'Poetry corner \u00b7 read aloud',
    stanzas: [],
    pullquote: '',
    revealLabel: '',
    revealBody: [],
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const [, cell] = cells;
    const value = cell.textContent.trim();

    if (key === 'title') {
      data.title = value;
    } else if (key === 'kicker') {
      data.kicker = value;
    } else if (key === 'stanza') {
      data.stanzas.push(parseStanza(cell));
    } else if (key === 'pullquote') {
      data.pullquote = value;
    } else if (key === 'reveal') {
      data.revealLabel = value;
    } else if (key === 'meaning') {
      const paras = [...cell.querySelectorAll('p')];
      data.revealBody = paras.length
        ? paras.map((p) => p.textContent.trim()).filter(Boolean)
        : value.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    }
  });

  return data;
}

function buildVerse(stanza, index) {
  const theme = VERSE_THEMES[index % VERSE_THEMES.length];
  const { label, lines } = stanza;

  const li = document.createElement('li');
  li.className = `poem-verse verse-${theme.type}`;
  li.style.animationDelay = `${0.05 + index * 0.15}s`;

  const iconSpan = document.createElement('span');
  iconSpan.className = 'verse-icon';
  iconSpan.innerHTML = makeVerseIcon(theme.icon);

  const content = document.createElement('div');

  const labelSpan = document.createElement('span');
  labelSpan.className = 'poem-verse-label';
  labelSpan.textContent = label;

  const linesPara = document.createElement('p');
  lines.forEach((line, i) => {
    linesPara.appendChild(document.createTextNode(line));
    if (i < lines.length - 1) linesPara.appendChild(document.createElement('br'));
  });

  content.append(labelSpan, linesPara);
  li.append(iconSpan, content);
  return li;
}

function makeSparkle(cls, styleStr) {
  const el = document.createElement('span');
  el.className = cls;
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = styleStr;
  el.innerHTML = SPARKLE_SVG;
  return el;
}

function buildPage(data) {
  const page = document.createElement('div');
  page.className = 'poem-page';

  const kicker = document.createElement('span');
  kicker.className = 'poem-kicker';
  kicker.textContent = data.kicker;
  page.appendChild(kicker);

  const headingRow = document.createElement('div');
  headingRow.className = 'poem-page-heading';
  headingRow.innerHTML = BOOK_SVG;
  const heading = document.createElement('h2');
  heading.className = 'poem-heading';
  heading.textContent = data.title;
  headingRow.appendChild(heading);
  page.appendChild(headingRow);

  const versesList = document.createElement('ol');
  versesList.className = 'poem-verses';
  data.stanzas.forEach((stanza, i) => versesList.appendChild(buildVerse(stanza, i)));
  page.appendChild(versesList);

  if (data.pullquote) {
    const bq = document.createElement('blockquote');
    bq.className = 'poem-pullquote';
    bq.textContent = data.pullquote;
    page.appendChild(bq);
  }

  if (data.revealLabel && data.revealBody.length) {
    const details = document.createElement('details');
    details.className = 'poem-reveal';
    const summary = document.createElement('summary');
    summary.textContent = data.revealLabel;
    const revealBody = document.createElement('div');
    revealBody.className = 'poem-reveal-body';
    data.revealBody.forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para;
      revealBody.appendChild(p);
    });
    details.append(summary, revealBody);
    page.appendChild(details);
  }

  return page;
}

async function fetchFragmentPoem(path) {
  try {
    const resp = await fetch(`${path}.plain.html`);
    if (!resp.ok) return null;
    const wrap = document.createElement('div');
    wrap.innerHTML = await resp.text();
    const poemBlock = wrap.querySelector('.poem');
    return poemBlock ? parsePoem(poemBlock) : null;
  } catch {
    return null;
  }
}

function applyScheme(stack, index) {
  const { c1, c2 } = POEM_SCHEMES[index % POEM_SCHEMES.length];
  stack.style.setProperty('--stack-c1', c1);
  stack.style.setProperty('--stack-c2', c2);
}

// Animation timings (ms)
const FOLD_DURATION = 380;
const UNFOLD_DURATION = 380;
const FOLD_UNFOLD_OVERLAP = 60; // unfold starts this many ms before fold ends

function initCarousel(viewport, stack, allPoems) {
  let current = 0;
  let animating = false;

  const nav = document.createElement('div');
  nav.className = 'poem-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'poem-nav-btn poem-nav-prev';
  prevBtn.setAttribute('aria-label', 'Previous poem');
  prevBtn.textContent = '←';

  const counter = document.createElement('span');
  counter.className = 'poem-nav-counter';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'poem-nav-btn poem-nav-next';
  nextBtn.setAttribute('aria-label', 'Next poem');
  nextBtn.textContent = '→';

  nav.append(prevBtn, counter, nextBtn);

  function updateNav() {
    counter.textContent = `${current + 1} / ${allPoems.length}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === allPoems.length - 1;
  }

  function goTo(nextIndex) {
    if (animating || nextIndex === current) return;
    if (nextIndex < 0 || nextIndex >= allPoems.length) return;
    animating = true;

    const goingNext = nextIndex > current;
    const foldOutClass = goingNext ? 'poem-page-fold-out-left' : 'poem-page-fold-out-right';
    const unfoldInClass = goingNext ? 'poem-page-unfold-in-left' : 'poem-page-unfold-in-right';

    const oldPage = viewport.querySelector('.poem-page');
    const newPage = buildPage(allPoems[nextIndex]);

    // Lock viewport height so layout doesn't jump during swap
    viewport.style.height = `${viewport.offsetHeight}px`;

    // Old page must be absolutely positioned so new page can sit underneath
    oldPage.style.cssText = 'position:absolute;inset:0;width:100%;z-index:2';
    oldPage.classList.add(foldOutClass);

    // New page sits beneath while old page folds away, then unfolds on top
    newPage.style.zIndex = '1';
    viewport.appendChild(newPage);

    // Update background + sheet colors while fold is in progress
    applyScheme(stack, nextIndex);
    current = nextIndex;
    updateNav();

    // Start unfold slightly before fold finishes for seamless feel
    const unfoldDelay = FOLD_DURATION - FOLD_UNFOLD_OVERLAP;
    setTimeout(() => {
      newPage.style.zIndex = '2';
      newPage.classList.add(unfoldInClass);
    }, unfoldDelay);

    // Cleanup after both animations complete
    const total = unfoldDelay + UNFOLD_DURATION + 30;
    setTimeout(() => {
      oldPage.remove();
      newPage.classList.remove(unfoldInClass);
      newPage.style.cssText = '';
      viewport.style.height = '';
      animating = false;
    }, total);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  updateNav();
  return nav;
}

export default async function decorate(block) {
  const fragmentPaths = [];
  const contentRows = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    if (key === 'fragment') {
      const linkEl = cells[1].querySelector('a');
      const path = linkEl ? linkEl.getAttribute('href') : cells[1].textContent.trim();
      if (path) fragmentPaths.push(path);
    } else {
      contentRows.push(row);
    }
  });

  const allPoems = [];
  if (contentRows.length) {
    const inlineBlock = document.createElement('div');
    contentRows.forEach((r) => inlineBlock.appendChild(r.cloneNode(true)));
    const inlineData = parsePoem(inlineBlock);
    if (inlineData.title || inlineData.stanzas.length) allPoems.push(inlineData);
  }

  if (fragmentPaths.length) {
    const results = await Promise.all(fragmentPaths.map(fetchFragmentPoem));
    results.forEach((data) => {
      if (data && (data.title || data.stanzas.length)) allPoems.push(data);
    });
  }

  block.textContent = '';

  if (!allPoems.length) {
    const msg = document.createElement('p');
    msg.style.cssText = 'text-align:center;padding:40px';
    msg.textContent = 'No poem found. Add Title / Stanza / Pullquote / Reveal / Meaning rows.';
    block.appendChild(msg);
    return;
  }

  // ── Stage ──────────────────────────────────────────
  const stage = document.createElement('div');
  stage.className = 'poem-stage';
  stage.appendChild(makeSparkle('poem-sparkle poem-sparkle-lg', 'top: 6px; left: 8%;'));
  stage.appendChild(makeSparkle('poem-sparkle poem-sparkle-sm', 'top: 28px; right: 10%;'));

  // ── Page stack ─────────────────────────────────────
  const stack = document.createElement('div');
  stack.className = 'poem-page-stack';

  const viewport = document.createElement('div');
  viewport.className = 'poem-page-viewport';
  viewport.appendChild(buildPage(allPoems[0]));
  stack.appendChild(viewport);

  stage.appendChild(stack);

  if (allPoems.length > 1) {
    // Carousel mode: apply first scheme and add bg to stage
    block.classList.add('poem-carousel');
    applyScheme(stack, 0);
    const nav = initCarousel(viewport, stack, allPoems);
    stage.appendChild(nav);
  } else {
    // Single poem: use default sheet colors, no stage bg
    stack.style.setProperty('--stack-c1', '#cfe0cf');
    stack.style.setProperty('--stack-c2', '#e7c0aa');
  }

  block.appendChild(stage);
}
