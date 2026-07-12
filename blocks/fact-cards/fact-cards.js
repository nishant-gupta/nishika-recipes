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
      const bulbImg = document.createElement('img');
      bulbImg.src = '/icons/idiom-bulb.svg';
      bulbImg.width = 40;
      bulbImg.height = 40;
      bulbImg.alt = '';
      icon.appendChild(bulbImg);
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

  // Section heading for the whole carousel — without this, the first card's
  // h3 title had no preceding h2 and broke the page's heading hierarchy.
  const heading = document.createElement('h2');
  heading.className = 'fact-cards-heading';
  heading.textContent = 'Fun Facts';
  block.append(heading);

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

  // Defer interactive wiring until after first paint to reduce TBT
  const initInteraction = () => {
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

    // Touch swipe — listen on viewport (track translates away after first swipe)
    let touchStartX = 0;
    let touchStartY = 0;
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        goTo(dx > 0 ? current + 1 : current - 1);
      }
    });

    // Keyboard
    block.setAttribute('tabindex', '0');
    block.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    goTo(0);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initInteraction, { timeout: 3000 });
  } else {
    setTimeout(initInteraction, 0);
  }
}
