function parseIdiom(block) {
  const data = {
    idiom: '', meaning: '', example: '', options: [], answer: '', blank: '',
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();

    if (key === 'idiom') {
      data.idiom = value;
    } else if (key === 'meaning') {
      data.meaning = value;
    } else if (key === 'example') {
      data.example = value;
    } else if (key === 'options') {
      const items = cells[1].querySelectorAll('li');
      if (items.length) {
        data.options = [...items].map((li) => li.textContent.trim()).filter(Boolean);
      } else {
        data.options = value.split(/[,·\n]/).map((s) => s.trim()).filter(Boolean);
      }
    } else if (key === 'answer') {
      data.answer = value;
    } else if (key === 'blank') {
      data.blank = value;
    }
  });

  return data;
}

function normalize(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function containsIdiom(input, idiom) {
  const words = normalize(idiom).split(' ').filter((w) => w.length > 3);
  return words.some((w) => normalize(input).includes(w));
}

const STEPS = [
  { icon: '/icons/idiom-book.svg', label: 'Idiom' },
  { icon: '/icons/idiom-bulb.svg', label: 'Meaning' },
  { icon: '/icons/idiom-chat.svg', label: 'Example' },
  { icon: '/icons/idiom-target.svg', label: 'Challenge' },
  { icon: '/icons/idiom-pencil.svg', label: 'Use It' },
];

class IdiomGame {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.stars = 0;
  }

  render(buildFn) {
    const old = this.container.querySelector('.idiom-screen');
    if (old) old.classList.add('exit');

    const screen = document.createElement('div');
    screen.className = 'idiom-screen';
    buildFn(screen);
    this.container.appendChild(screen);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        screen.classList.add('visible');
        if (old) old.remove();
      });
    });
    return screen;
  }

  static makeProgress(active, onStepClick) {
    const wrap = document.createElement('div');
    wrap.className = 'idiom-progress';
    STEPS.forEach(({ icon, label }, i) => {
      const step = document.createElement('div');
      let cls = 'idiom-step';
      if (i < active) cls += ' done clickable';
      if (i === active) cls += ' active';
      step.className = cls;

      if (i < active && onStepClick) {
        step.addEventListener('click', () => onStepClick(i));
      }

      const iconEl = document.createElement('div');
      iconEl.className = 'idiom-step-icon';
      if (i < active) {
        iconEl.textContent = '✓';
      } else {
        const stepImg = document.createElement('img');
        stepImg.src = icon;
        stepImg.width = 16;
        stepImg.height = 16;
        stepImg.alt = '';
        iconEl.appendChild(stepImg);
      }

      const labelEl = document.createElement('div');
      labelEl.className = 'idiom-step-label';
      labelEl.textContent = label;

      step.append(iconEl, labelEl);
      if (i < STEPS.length - 1) {
        const line = document.createElement('div');
        line.className = `idiom-step-line${i < active ? ' done' : ''}`;
        wrap.append(step, line);
      } else {
        wrap.appendChild(step);
      }
    });
    return wrap;
  }

  goToStep(index) {
    const steps = [
      () => this.renderIdiom(),
      () => this.renderMeaning(),
      () => this.renderExample(),
      () => this.renderChallenge(),
      () => this.renderUseIt(),
    ];
    if (steps[index]) steps[index]();
  }

  // ── Stage 1: Idiom Name ───────────────────────────
  renderIdiom() {
    const { idiom } = this.data;

    this.render((screen) => {
      screen.appendChild(IdiomGame.makeProgress(0, (i) => this.goToStep(i)));

      const label = document.createElement('p');
      label.className = 'idiom-stage-label';
      label.textContent = 'Idiom of the Week';

      const idiomEl = document.createElement('h2');
      idiomEl.className = 'idiom-name-display';
      idiomEl.textContent = `"${idiom}"`;

      const hint = document.createElement('p');
      hint.className = 'idiom-hint-text';
      hint.textContent = 'What do you think this means?';

      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.textContent = 'Discover the meaning →';

      screen.append(label, idiomEl, hint, nextBtn);
      nextBtn.addEventListener('click', () => this.renderMeaning());
    });
  }

  // ── Stage 2: Meaning ──────────────────────────────
  renderMeaning() {
    const { idiom, meaning } = this.data;

    this.render((screen) => {
      screen.appendChild(IdiomGame.makeProgress(1, (i) => this.goToStep(i)));

      const label = document.createElement('p');
      label.className = 'idiom-stage-label';
      label.textContent = 'Here\'s what it means';

      const idiomEl = document.createElement('div');
      idiomEl.className = 'idiom-name-small';
      idiomEl.textContent = `"${idiom}"`;

      const card = document.createElement('div');
      card.className = 'idiom-def-card';

      const defLabel = document.createElement('span');
      defLabel.className = 'idiom-def-label';
      defLabel.textContent = 'Meaning';

      const defText = document.createElement('p');
      defText.className = 'idiom-def-text';
      defText.textContent = meaning;

      card.append(defLabel, defText);

      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.textContent = 'See it in action →';

      screen.append(label, idiomEl, card, nextBtn);
      nextBtn.addEventListener('click', () => this.renderExample());
    });
  }

  // ── Stage 3: Example ──────────────────────────────
  renderExample() {
    const { idiom, example } = this.data;

    this.render((screen) => {
      screen.appendChild(IdiomGame.makeProgress(2, (i) => this.goToStep(i)));

      const label = document.createElement('p');
      label.className = 'idiom-stage-label';
      label.textContent = 'Example in real life';

      const idiomEl = document.createElement('div');
      idiomEl.className = 'idiom-name-small';
      idiomEl.textContent = `"${idiom}"`;

      const card = document.createElement('div');
      card.className = 'idiom-def-card';

      const exLabel = document.createElement('span');
      exLabel.className = 'idiom-def-label';
      exLabel.textContent = 'Usage';

      const exText = document.createElement('p');
      exText.className = 'idiom-def-text idiom-example';
      exText.textContent = `"${example}"`;

      card.append(exLabel, exText);

      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.textContent = 'Test your knowledge →';

      screen.append(label, idiomEl, card, nextBtn);
      nextBtn.addEventListener('click', () => this.renderChallenge());
    });
  }

  // ── Stage 4: Challenge ────────────────────────────
  renderChallenge() {
    const { idiom, options, answer } = this.data;
    const labels = ['A', 'B', 'C', 'D'];

    this.render((screen) => {
      screen.appendChild(IdiomGame.makeProgress(3, (i) => this.goToStep(i)));

      const label = document.createElement('p');
      label.className = 'idiom-stage-label';
      label.textContent = 'Which is the correct meaning?';

      const idiomEl = document.createElement('div');
      idiomEl.className = 'idiom-challenge-title';
      idiomEl.textContent = `"${idiom}"`;

      const optionsEl = document.createElement('div');
      optionsEl.className = 'idiom-options';

      options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'idiom-option';
        btn.dataset.text = opt;
        btn.innerHTML = `<span class="idiom-opt-label">${labels[i]}</span><span class="idiom-opt-text">${opt}</span>`;
        optionsEl.appendChild(btn);

        btn.addEventListener('click', () => {
          const correct = normalize(opt) === normalize(answer);
          if (correct) this.stars += 1;

          optionsEl.querySelectorAll('.idiom-option').forEach((b) => {
            b.disabled = true;
            if (normalize(b.dataset.text) === normalize(answer)) b.classList.add('correct');
            else if (b === btn && !correct) b.classList.add('incorrect');
          });

          const fb = document.createElement('div');
          fb.className = `idiom-feedback ${correct ? 'correct' : 'incorrect'}`;
          fb.textContent = correct ? '✓ Correct!' : `✗ It was: "${answer}"`;
          screen.appendChild(fb);
          requestAnimationFrame(() => fb.classList.add('visible'));

          const nextBtn = document.createElement('button');
          nextBtn.className = 'btn btn-primary';
          nextBtn.textContent = 'Now use it →';
          screen.appendChild(nextBtn);
          nextBtn.addEventListener('click', () => this.renderUseIt());
        });
      });

      screen.append(label, idiomEl, optionsEl);
    });
  }

  // ── Stage 5: Use It ───────────────────────────────
  renderUseIt() {
    const { idiom, blank } = this.data;
    const hasBlank = blank && blank.includes('___');

    this.render((screen) => {
      screen.appendChild(IdiomGame.makeProgress(4, (i) => this.goToStep(i)));

      const label = document.createElement('p');
      label.className = 'idiom-stage-label';
      label.textContent = 'Now use it!';

      screen.appendChild(label);

      let inputEl;

      if (hasBlank) {
        const parts = blank.split('___');
        const [firstPart, secondPart] = parts;
        const sentenceWrap = document.createElement('div');
        sentenceWrap.className = 'idiom-blank-wrap';

        const before = document.createElement('span');
        before.textContent = firstPart;

        inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.className = 'idiom-blank-input';
        inputEl.placeholder = '…';
        inputEl.autocomplete = 'off';

        const after = document.createElement('span');
        after.textContent = secondPart || '';

        sentenceWrap.append(before, inputEl, after);
        screen.appendChild(sentenceWrap);
      } else {
        const prompt = document.createElement('p');
        prompt.className = 'idiom-prompt';
        prompt.textContent = `Write your own sentence using "${idiom}":`;
        screen.appendChild(prompt);

        inputEl = document.createElement('textarea');
        inputEl.className = 'idiom-textarea';
        inputEl.placeholder = `Your sentence with "${idiom}"…`;
        inputEl.rows = 3;
        screen.appendChild(inputEl);
      }

      const checkBtn = document.createElement('button');
      checkBtn.className = 'btn btn-primary';
      checkBtn.textContent = 'Check ✓';
      screen.appendChild(checkBtn);

      inputEl.focus();

      const check = () => {
        const val = (inputEl.value || inputEl.textContent || '').trim();
        if (!val) return;

        const correct = containsIdiom(val, idiom);
        if (correct) this.stars += 1;
        inputEl.disabled = true;
        checkBtn.remove();

        const fb = document.createElement('div');
        fb.className = `idiom-feedback ${correct ? 'correct' : 'incorrect'}`;
        fb.textContent = correct
          ? '✓ Great sentence!'
          : `Try to include "${idiom}" in your answer`;
        screen.appendChild(fb);
        requestAnimationFrame(() => fb.classList.add('visible'));

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        nextBtn.textContent = 'See my results →';
        screen.appendChild(nextBtn);
        nextBtn.addEventListener('click', () => this.renderComplete());
      };

      checkBtn.addEventListener('click', check);
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) check();
      });
    });
  }

  // ── Stage 6: Complete ─────────────────────────────
  renderComplete() {
    const { idiom } = this.data;
    const { stars } = this;

    let trophyIcon = '/icons/quiz-strength.svg';
    if (stars === 2) trophyIcon = '/icons/quiz-trophy.svg';
    else if (stars === 1) trophyIcon = '/icons/idiom-star.svg';

    let badge = 'Keep Practising';
    if (stars === 2) badge = 'Idiom Master';
    else if (stars === 1) badge = 'Word Wizard';

    this.render((screen) => {
      screen.className = 'idiom-screen idiom-complete-screen';

      const trophy = document.createElement('div');
      trophy.className = 'idiom-trophy';
      const trophyImg = document.createElement('img');
      trophyImg.src = trophyIcon;
      trophyImg.width = 80;
      trophyImg.height = 80;
      trophyImg.alt = '';
      trophy.appendChild(trophyImg);

      const heading = document.createElement('h2');
      heading.className = 'idiom-complete-heading';
      heading.textContent = 'Idiom unlocked!';

      const titleEl = document.createElement('div');
      titleEl.className = 'idiom-complete-idiom';
      titleEl.textContent = `"${idiom}"`;

      const starsRow = document.createElement('div');
      starsRow.className = 'idiom-stars-row';
      const starEls = [];
      for (let i = 0; i < 2; i += 1) {
        const star = document.createElement('span');
        star.className = `idiom-star${i < stars ? ' filled' : ''}`;
        star.textContent = '★';
        starsRow.appendChild(star);
        starEls.push(star);
      }

      const badgeEl = document.createElement('div');
      badgeEl.className = 'idiom-badge';
      badgeEl.textContent = badge;

      const againBtn = document.createElement('button');
      againBtn.className = 'btn idiom-play-again';
      againBtn.setAttribute('aria-label', 'Try Again');
      const replayImg = document.createElement('img');
      replayImg.src = '/icons/quiz-replay.svg';
      replayImg.width = 32;
      replayImg.height = 32;
      replayImg.alt = '';
      againBtn.appendChild(replayImg);
      againBtn.addEventListener('click', () => {
        this.stars = 0;
        this.renderIdiom();
      });

      screen.append(trophy, heading, titleEl, starsRow, badgeEl, againBtn);

      requestAnimationFrame(() => {
        starEls.forEach((star, i) => {
          if (star.classList.contains('filled')) {
            setTimeout(() => star.classList.add('animate'), i * 320);
          }
        });
      });
    });
  }
}

function buildCarouselForGroup(blocks) {
  const first = blocks[0];
  const parent = first.parentNode;

  const carousel = document.createElement('div');
  carousel.className = 'idiom-carousel';
  parent.insertBefore(carousel, first);

  blocks.forEach((block, i) => {
    if (i > 0) block.classList.add('idiom-carousel-hidden');
    carousel.appendChild(block);
  });

  const nav = document.createElement('div');
  nav.className = 'idiom-carousel-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'idiom-carousel-btn';
  prevBtn.innerHTML = '&#8592; Prev';
  prevBtn.setAttribute('aria-label', 'Previous idiom');

  const dotsEl = document.createElement('div');
  dotsEl.className = 'idiom-carousel-dots';
  blocks.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `idiom-carousel-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Idiom ${i + 1}`);
    dotsEl.appendChild(dot);
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'idiom-carousel-btn';
  nextBtn.innerHTML = 'Next &#8594;';
  nextBtn.setAttribute('aria-label', 'Next idiom');

  nav.append(prevBtn, dotsEl, nextBtn);
  carousel.appendChild(nav);

  let current = 0;
  const allDots = [...dotsEl.querySelectorAll('.idiom-carousel-dot')];

  function goTo(index) {
    blocks[current].classList.add('idiom-carousel-hidden');
    allDots[current].classList.remove('active');
    current = (index + blocks.length) % blocks.length;
    blocks[current].classList.remove('idiom-carousel-hidden');
    allDots[current].classList.add('active');
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  allDots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });
}

export default function decorate(block) {
  const data = parseIdiom(block);

  if (!data.idiom) {
    block.innerHTML = '<p style="text-align:center;padding:40px">No idiom found. Add Idiom / Meaning / Example / Options / Answer / Blank rows.</p>';
    return;
  }

  block.textContent = '';

  // Mark decorated synchronously so carousel detection still works correctly
  // even though the game itself is initialized after first paint.
  block.dataset.idiomDecorated = 'true';

  const section = block.closest('.section') || block.parentNode;
  const allInSection = [...section.querySelectorAll('.idiom-of-week')];
  const decorated = allInSection.filter((b) => b.dataset.idiomDecorated);

  if (decorated.length === allInSection.length && allInSection.length >= 2) {
    buildCarouselForGroup(allInSection);
  }

  // Defer heavy game init until after first paint to reduce TBT
  const init = () => {
    const game = new IdiomGame(block, data);
    game.renderIdiom();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(init, { timeout: 3000 });
  } else {
    setTimeout(init, 0);
  }
}
