import { createOptimizedPicture } from '../../scripts/aem.js';

function parseCards(block) {
  return [...block.children].map((row) => {
    const cells = [...row.children];
    const title = cells[0]?.textContent.trim() || '';
    const fact = cells[1]?.textContent.trim() || '';
    const picture = cells[2]?.querySelector('picture') || cells[0]?.querySelector('picture') || null;
    return { title, fact, picture };
  }).filter((c) => c.title || c.fact);
}

function buildCard(card) {
  const el = document.createElement('div');
  el.className = 'fact-card';

  if (card.picture) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'fact-card-image';
    const img = card.picture.querySelector('img');
    if (img) {
      imgWrap.appendChild(createOptimizedPicture(img.src, img.alt || card.title, false, [{ width: '600' }]));
    }
    el.appendChild(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'fact-card-body';

  if (card.title) {
    if (!card.picture) {
      const icon = document.createElement('div');
      icon.className = 'fact-icon';
      icon.textContent = '💡';
      body.appendChild(icon);
    }

    const titleEl = document.createElement('h3');
    titleEl.className = 'fact-title';
    titleEl.textContent = card.title;
    body.appendChild(titleEl);
  }

  if (card.fact) {
    const factEl = document.createElement('p');
    factEl.className = 'fact-text';
    factEl.textContent = card.fact;
    body.appendChild(factEl);
  }

  el.appendChild(body);
  return el;
}

export default function decorate(block) {
  const cards = parseCards(block);

  if (!cards.length) {
    block.innerHTML = '<p style="text-align:center;padding:40px">No facts found.</p>';
    return;
  }

  block.textContent = '';

  // Track
  const track = document.createElement('div');
  track.className = 'fact-cards-track';
  cards.forEach((card) => track.appendChild(buildCard(card)));

  // Arrows
  const prev = document.createElement('button');
  prev.className = 'fact-arrow fact-arrow-prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '&#8592;';

  const next = document.createElement('button');
  next.className = 'fact-arrow fact-arrow-next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '&#8594;';

  // Dots
  const dots = document.createElement('div');
  dots.className = 'fact-dots';
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `fact-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Go to fact ${i + 1}`);
    dots.appendChild(dot);
  });

  // Counter
  const counter = document.createElement('div');
  counter.className = 'fact-counter';

  // Viewport clips the track so only one card shows
  const viewport = document.createElement('div');
  viewport.className = 'fact-cards-viewport';
  viewport.appendChild(track);
  viewport.appendChild(counter);

  block.append(prev, viewport, next, dots);

  let current = 0;

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('.fact-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    counter.textContent = `${current + 1} / ${cards.length}`;
    prev.disabled = false;
    next.disabled = false;
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.querySelectorAll('.fact-dot').forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  // Keyboard
  block.setAttribute('tabindex', '0');
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  goTo(0);
}
