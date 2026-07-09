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
  picture.remove();
  const imgWrap = document.createElement('div');
  imgWrap.className = 'hero-postcard-image';
  imgWrap.appendChild(picture);
  const body = document.createElement('div');
  body.className = 'hero-postcard-body';
  while (postcard.firstChild) body.appendChild(postcard.firstChild);
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
