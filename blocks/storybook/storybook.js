function buildPage(cell, side) {
  const page = document.createElement('div');
  page.className = `storybook-page storybook-page-${side}`;

  if (!cell) {
    page.classList.add('storybook-page-blank');
    return page;
  }

  const pictures = [...cell.querySelectorAll('picture')];
  if (pictures.length) {
    page.classList.add('storybook-page-image');
    const firstPic = pictures[0];
    const img = firstPic.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.draggable = false; // prevent native image drag from hijacking gestures
    }
    const wrap = document.createElement('div');
    wrap.className = 'storybook-image-wrap';
    wrap.append(firstPic);
    page.append(wrap);
  } else {
    page.classList.add('storybook-page-text');
    const content = document.createElement('div');
    content.className = 'storybook-page-content';
    content.innerHTML = cell.innerHTML;
    // strip any stray pictures that may have been embedded in text content
    content.querySelectorAll('picture').forEach((p) => p.remove());
    page.append(content);
  }

  return page;
}

export default function decorate(block) {
  const rows = [...block.children];

  block.textContent = '';

  const outer = document.createElement('div');
  outer.className = 'storybook-outer';

  // perspective wrapper
  const bookWrap = document.createElement('div');
  bookWrap.className = 'storybook-book-wrap';

  const book = document.createElement('div');
  book.className = 'storybook-book';
  book.setAttribute('role', 'region');
  book.setAttribute('aria-label', 'Storybook');

  // Spine
  const spine = document.createElement('div');
  spine.className = 'storybook-spine';
  spine.setAttribute('aria-hidden', 'true');
  book.append(spine);

  // Build spreads
  const spreadEls = rows.map((row, i) => {
    const cells = [...row.children];
    const el = document.createElement('div');
    el.className = 'storybook-spread';
    if (i === 0) el.classList.add('active', 'cover');
    if (i === rows.length - 1) el.classList.add('ending');
    el.dataset.index = i;
    el.append(buildPage(cells[0] || null, 'left'));
    el.append(buildPage(cells[1] || null, 'right'));
    return el;
  });

  spreadEls.forEach((el) => book.append(el));

  // Turning page overlay (used for 3D flip animation)
  const turning = document.createElement('div');
  turning.className = 'storybook-turn';
  turning.setAttribute('aria-hidden', 'true');
  const turnFront = document.createElement('div');
  turnFront.className = 'storybook-turn-face storybook-turn-front';
  const turnBack = document.createElement('div');
  turnBack.className = 'storybook-turn-face storybook-turn-back';
  turning.append(turnFront, turnBack);
  book.append(turning);

  bookWrap.append(book);

  // Controls
  const controls = document.createElement('div');
  controls.className = 'storybook-controls';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'storybook-btn storybook-btn-prev';
  prevBtn.setAttribute('aria-label', 'Previous spread');
  prevBtn.textContent = '← Prev';

  const indicator = document.createElement('span');
  indicator.className = 'storybook-indicator';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'storybook-btn storybook-btn-next';
  nextBtn.setAttribute('aria-label', 'Next spread');
  nextBtn.textContent = 'Next →';

  controls.append(prevBtn, indicator, nextBtn);
  outer.append(bookWrap, controls);
  block.append(outer);

  // ── State ────────────────────────────────────────────
  let current = 0;
  let busy = false;
  const total = rows.length;
  const mq = window.matchMedia('(width <= 700px)');

  function updateUI() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    indicator.textContent = `${current + 1} / ${total}`;
  }

  function clonePage(spreadIdx, side) {
    const pg = spreadEls[spreadIdx]?.querySelector(`.storybook-page-${side}`);
    return pg ? pg.cloneNode(true) : document.createElement('div');
  }

  // ── Mobile slide transition ────────────────────────────
  function doTurnMobile(dir) {
    const next = current + dir;
    const enterClass = dir === 1 ? 'entering-fwd' : 'entering-bwd';
    spreadEls[current].classList.remove('active');
    spreadEls[next].classList.add('active', enterClass);
    setTimeout(() => {
      spreadEls[next].classList.remove(enterClass);
      current = next;
      busy = false;
      updateUI();
    }, 400);
  }

  // ── Page turn ─────────────────────────────────────────
  function doTurn(dir) {
    if (busy) return;
    const next = current + dir;
    if (next < 0 || next >= total) return;
    busy = true;

    if (mq.matches) { doTurnMobile(dir); return; }

    // Show next spread underneath
    spreadEls[next].classList.add('pending');

    turnFront.innerHTML = '';
    turnBack.innerHTML = '';

    if (dir === 1) {
      // Forward: right page flips over to reveal next left page
      turning.classList.add('turn-fwd');
      turning.classList.remove('turn-bwd');
      turnFront.append(clonePage(current, 'right'));
      turnBack.append(clonePage(next, 'left'));
    } else {
      // Backward: left page flips over to reveal prev right page
      turning.classList.add('turn-bwd');
      turning.classList.remove('turn-fwd');
      turnFront.append(clonePage(current, 'left'));
      turnBack.append(clonePage(next, 'right'));
    }

    // Reset without transition, then animate
    turning.style.transition = 'none';
    turning.style.transform = 'rotateY(0deg)';
    turning.classList.add('turning');
    // eslint-disable-next-line no-unused-expressions
    turning.offsetHeight; // force reflow
    turning.style.transition = 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)';
    turning.style.transform = dir === 1 ? 'rotateY(-180deg)' : 'rotateY(180deg)';

    setTimeout(() => {
      spreadEls[current].classList.remove('active');
      spreadEls[next].classList.remove('pending');
      spreadEls[next].classList.add('active');
      turning.classList.remove('turning', 'turn-fwd', 'turn-bwd');
      turning.style.transition = '';
      turning.style.transform = '';
      current = next;
      busy = false;
      updateUI();
    }, 680);
  }

  // ── Live drag ─────────────────────────────────────────
  let dragStartX = 0;
  let dragging = false;
  let dragDir = 0;

  function dragStart(x) {
    if (busy) return;
    dragStartX = x;
    dragging = false;
    dragDir = 0;
  }

  function dragMove(x) {
    const dx = x - dragStartX;
    if (!dragging && Math.abs(dx) < 8) return;

    if (!dragging) {
      // Determine direction and set up turn element
      dragDir = dx < 0 ? 1 : -1;
      const next = current + dragDir;
      if (next < 0 || next >= total) { dragging = false; return; }

      dragging = true;
      busy = true;
      spreadEls[next].classList.add('pending');

      turnFront.innerHTML = '';
      turnBack.innerHTML = '';
      if (dragDir === 1) {
        turning.classList.add('turn-fwd');
        turning.classList.remove('turn-bwd');
        turnFront.append(clonePage(current, 'right'));
        turnBack.append(clonePage(next, 'left'));
      } else {
        turning.classList.add('turn-bwd');
        turning.classList.remove('turn-fwd');
        turnFront.append(clonePage(current, 'left'));
        turnBack.append(clonePage(next, 'right'));
      }
      turning.style.transition = 'none';
      turning.style.transform = 'rotateY(0deg)';
      turning.classList.add('turning');
      // eslint-disable-next-line no-unused-expressions
      turning.offsetHeight;
    }

    if (!dragging) return;
    const bookWidth = book.offsetWidth * 0.5;
    const pct = Math.max(0, Math.min(1, Math.abs(dx) / bookWidth));
    const angle = pct * 180 * dragDir * -1;
    turning.style.transform = `rotateY(${angle}deg)`;
  }

  function dragEnd(x) {
    if (!dragging) { busy = false; return; }
    dragging = false;
    const dx = x - dragStartX;
    const next = current + dragDir;

    turning.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

    if (Math.abs(dx) > 60) {
      if (mq.matches) {
        // Mobile: clean up pending and use slide animation
        spreadEls[next].classList.remove('pending');
        doTurnMobile(dragDir);
      } else {
        // Desktop: complete 3D flip
        turning.style.transform = dragDir === 1 ? 'rotateY(-180deg)' : 'rotateY(180deg)';
        setTimeout(() => {
          spreadEls[current].classList.remove('active');
          spreadEls[next].classList.remove('pending');
          spreadEls[next].classList.add('active');
          turning.classList.remove('turning', 'turn-fwd', 'turn-bwd');
          turning.style.transition = '';
          turning.style.transform = '';
          current = next;
          busy = false;
          updateUI();
        }, 360);
      }
    } else {
      // Snap back
      spreadEls[next].classList.remove('pending');
      if (mq.matches) {
        turning.classList.remove('turning', 'turn-fwd', 'turn-bwd');
        busy = false;
      } else {
        turning.style.transform = 'rotateY(0deg)';
        setTimeout(() => {
          turning.classList.remove('turning', 'turn-fwd', 'turn-bwd');
          turning.style.transition = '';
          turning.style.transform = '';
          busy = false;
        }, 360);
      }
    }
  }

  // Touch
  book.addEventListener('touchstart', (e) => dragStart(e.touches[0].clientX), { passive: true });
  book.addEventListener('touchmove', (e) => dragMove(e.touches[0].clientX), { passive: true });
  book.addEventListener('touchend', (e) => dragEnd(e.changedTouches[0].clientX), { passive: true });

  // Mouse drag
  book.addEventListener('mousedown', (e) => { dragStart(e.clientX); book.classList.add('dragging'); });
  window.addEventListener('mousemove', (e) => { if (book.classList.contains('dragging')) dragMove(e.clientX); });
  window.addEventListener('mouseup', (e) => { if (book.classList.contains('dragging')) { book.classList.remove('dragging'); dragEnd(e.clientX); } });

  // Click left/right zones
  book.addEventListener('click', (e) => {
    if (busy) return;
    const rect = book.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.25) doTurn(-1);
    else if (x > rect.width * 0.75) doTurn(1);
  });

  // Buttons
  prevBtn.addEventListener('click', () => doTurn(-1));
  nextBtn.addEventListener('click', () => doTurn(1));

  // Keyboard
  outer.setAttribute('tabindex', '0');
  outer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') doTurn(1);
    if (e.key === 'ArrowLeft') doTurn(-1);
  });

  updateUI();

  // ── Mobile: lock book to max natural spread height ─────
  // Prevents the book from resizing on each page turn, which causes
  // jarring layout shifts. Spreads overlay each other (position:absolute)
  // inside a fixed-height container.
  function lockMobileHeight() {
    if (!mq.matches) return;

    // Temporarily put all spreads in-flow so we can measure their natural heights
    spreadEls.forEach((el) => {
      el.style.cssText = 'position:relative;opacity:0;visibility:hidden;height:auto;overflow:visible;pointer-events:none;';
    });

    // eslint-disable-next-line no-unused-expressions
    book.offsetHeight; // force reflow so scrollHeight is accurate

    const maxH = Math.max(...spreadEls.map((el) => el.scrollHeight));

    // Restore — CSS handles everything else
    spreadEls.forEach((el) => { el.style.cssText = ''; });

    if (maxH > 0) book.style.height = `${maxH}px`;
  }

  // Run after first paint so images have contributed their aspect-ratio height
  requestAnimationFrame(lockMobileHeight);

  // Re-lock on resize (orientation change, etc.)
  window.addEventListener('resize', () => {
    if (mq.matches) {
      book.style.height = '';
      requestAnimationFrame(lockMobileHeight);
    } else {
      book.style.height = '';
    }
  }, { passive: true });
}
