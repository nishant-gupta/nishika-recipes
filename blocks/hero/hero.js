function groupButtons(container) {
  const btns = [...container.querySelectorAll('.button-container')];
  if (btns.length < 2) return;
  const wrap = document.createElement('div');
  wrap.className = 'hero-buttons';
  btns[0].before(wrap);
  btns.forEach((b) => wrap.append(b));
}

function buildPostcard(postcard) {
  const picture = postcard.querySelector('picture');
  if (!picture) return;
  // Hero postcard image is above the fold — force eager load so the browser
  // fetches it immediately rather than waiting until after layout (lazy default).
  const img = picture.querySelector('img');
  if (img) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  }
  picture.remove();
  const imgWrap = document.createElement('div');
  imgWrap.className = 'hero-postcard-image';
  imgWrap.appendChild(picture);
  const body = document.createElement('div');
  body.className = 'hero-postcard-body';
  while (postcard.firstChild) body.appendChild(postcard.firstChild);

  // Drop empty headings left over from document authoring (e.g. an
  // accidental blank Heading 3 style) — an empty heading is never valid,
  // regardless of level, and previously broke the page's H1→H2→H3 order.
  body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    if (!h.textContent.trim()) h.remove();
  });

  postcard.appendChild(imgWrap);
  postcard.appendChild(body);
}

export default function decorate(block) {
  const [row] = block.children;
  if (!row) return;

  const cells = [...row.children];

  if (cells.length >= 2) {
    const content = document.createElement('div');
    content.className = 'hero-content';
    while (cells[0].firstChild) content.append(cells[0].firstChild);

    const postcard = document.createElement('div');
    postcard.className = 'hero-postcard';
    while (cells[1].firstChild) postcard.append(cells[1].firstChild);

    block.textContent = '';
    block.append(content, postcard);
    buildPostcard(postcard);
  } else {
    const content = document.createElement('div');
    content.className = 'hero-content';
    while (cells[0].firstChild) content.append(cells[0].firstChild);
    block.textContent = '';
    block.append(content);
  }

  const heroContent = block.querySelector('.hero-content');
  if (heroContent) groupButtons(heroContent);
}
