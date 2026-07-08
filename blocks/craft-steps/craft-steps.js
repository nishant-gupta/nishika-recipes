import { createOptimizedPicture } from '../../scripts/aem.js';

function parseCraft(block) {
  const data = {
    title: '',
    image: null,
    time: '',
    age: '',
    difficulty: '',
    supplies: [],
    steps: [],
    challenge: '',
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();

    if (key === 'title') {
      data.title = value;
    } else if (key === 'image') {
      data.image = cells[1].querySelector('picture');
    } else if (key === 'time') {
      data.time = value;
    } else if (key === 'age') {
      data.age = value;
    } else if (key === 'difficulty') {
      data.difficulty = value;
    } else if (key === 'supply') {
      data.supplies.push(value);
    } else if (key === 'supplies') {
      const items = cells[1].querySelectorAll('li');
      if (items.length) {
        data.supplies = [...items].map((li) => li.textContent.trim()).filter(Boolean);
      } else {
        data.supplies = value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
      }
    } else if (key === 'step') {
      const picture = cells[1].querySelector('picture');
      data.steps.push({ text: value, picture: picture || null });
    } else if (key === 'challenge') {
      data.challenge = value;
    }
  });

  return data;
}

class CraftGame {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.current = 0;

    this.slides = ['intro', 'supplies'];
    data.steps.forEach((_, i) => this.slides.push(i));
    if (data.challenge) this.slides.push('challenge');
    this.slides.push('complete');
  }

  render(buildFn) {
    const old = this.container.querySelector('.craft-screen');
    if (old) old.classList.add('exit');

    const screen = document.createElement('div');
    screen.className = 'craft-screen';
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

  goTo(index) {
    const clamped = Math.max(0, Math.min(index, this.slides.length - 1));
    this.current = clamped;
    const slide = this.slides[clamped];
    if (slide === 'intro') this.renderIntro();
    else if (slide === 'supplies') this.renderSupplies();
    else if (typeof slide === 'number') this.renderStep(slide);
    else if (slide === 'challenge') this.renderChallenge();
    else this.renderComplete();
  }

  makeNavRow(nextLabel, onNext) {
    const { current } = this;
    const row = document.createElement('div');
    row.className = 'craft-nav-row';

    if (current > 0) {
      const back = document.createElement('button');
      back.className = 'btn btn-ghost craft-back-btn';
      back.textContent = '← Back';
      back.addEventListener('click', () => this.goTo(current - 1));
      row.appendChild(back);
    }

    if (nextLabel) {
      const next = document.createElement('button');
      next.className = 'btn btn-primary';
      next.textContent = nextLabel;
      next.addEventListener('click', onNext);
      row.appendChild(next);
    }

    return row;
  }

  // ── Slide 1: Intro ────────────────────────────────
  renderIntro() {
    const {
      title, image, time, age, difficulty,
    } = this.data;

    this.render((screen) => {
      screen.classList.add('craft-intro-screen');

      if (image) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'craft-intro-image';
        const img = image.querySelector('img');
        if (img) {
          imgWrap.appendChild(
            createOptimizedPicture(img.src, img.alt || title, false, [{ width: '800' }]),
          );
        }
        screen.appendChild(imgWrap);
      }

      const body = document.createElement('div');
      body.className = 'craft-intro-body';

      const titleEl = document.createElement('h2');
      titleEl.className = 'craft-title';
      titleEl.textContent = title;
      body.appendChild(titleEl);

      if (time || age || difficulty) {
        const meta = document.createElement('div');
        meta.className = 'craft-meta';

        const badges = [
          time ? { icon: '/icons/craft-time.svg', text: time } : null,
          age ? { icon: '/icons/craft-age.svg', text: `Age ${age}` } : null,
          difficulty ? { icon: '/icons/craft-difficulty.svg', text: difficulty } : null,
        ].filter(Boolean);

        badges.forEach(({ icon, text }) => {
          const badge = document.createElement('span');
          badge.className = 'craft-badge';
          const badgeImg = document.createElement('img');
          badgeImg.src = icon;
          badgeImg.width = 14;
          badgeImg.height = 14;
          badgeImg.alt = '';
          const badgeText = document.createElement('span');
          badgeText.textContent = text;
          badge.append(badgeImg, badgeText);
          meta.appendChild(badge);
        });

        body.appendChild(meta);
      }

      body.appendChild(this.makeNavRow('Start Crafting →', () => this.goTo(1)));
      screen.appendChild(body);
    });
  }

  // ── Slide 2: Supplies ─────────────────────────────
  renderSupplies() {
    const { supplies } = this.data;

    this.render((screen) => {
      const heading = document.createElement('p');
      heading.className = 'craft-stage-label';
      heading.textContent = 'What you\'ll need';

      const hint = document.createElement('p');
      hint.className = 'craft-hint';
      hint.textContent = 'Tap each item as you gather it';

      const list = document.createElement('div');
      list.className = 'craft-supply-list';

      supplies.forEach((supply) => {
        const item = document.createElement('div');
        item.className = 'craft-supply-item';

        const check = document.createElement('span');
        check.className = 'craft-supply-check';

        const text = document.createElement('span');
        text.className = 'craft-supply-text';
        text.textContent = supply;

        item.append(check, text);
        list.appendChild(item);

        item.addEventListener('click', () => {
          item.classList.toggle('checked');
        });
      });

      screen.append(heading, hint, list, this.makeNavRow('Ready! Let\'s make it →', () => this.goTo(2)));
    });
  }

  // ── Slides 3…N: Steps ────────────────────────────
  renderStep(stepIndex) {
    const { steps } = this.data;
    const total = steps.length;
    const stepNum = stepIndex + 1;
    const pct = Math.round((stepNum / total) * 100);
    const isLast = stepIndex === total - 1;
    const { text, picture } = steps[stepIndex];

    this.render((screen) => {
      // Step progress
      const progressWrap = document.createElement('div');
      progressWrap.className = 'craft-step-progress';

      const counter = document.createElement('div');
      counter.className = 'craft-step-counter';
      counter.textContent = `Step ${stepNum} of ${total}`;

      const barWrap = document.createElement('div');
      barWrap.className = 'craft-progress-wrap';
      const bar = document.createElement('div');
      bar.className = 'craft-progress-bar';
      barWrap.appendChild(bar);

      progressWrap.append(counter, barWrap);

      // Step number circle
      const numEl = document.createElement('div');
      numEl.className = 'craft-step-num';
      numEl.textContent = stepNum;

      // Optional step image
      if (picture) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'craft-step-image';
        const img = picture.querySelector('img');
        if (img) {
          imgWrap.appendChild(
            createOptimizedPicture(img.src, img.alt || `Step ${stepNum}`, false, [{ width: '600' }]),
          );
        }
        screen.append(progressWrap, numEl, imgWrap);
      } else {
        screen.append(progressWrap, numEl);
      }

      // Step instruction
      const textEl = document.createElement('div');
      textEl.className = 'craft-step-text';
      textEl.textContent = text;

      let nextLabel;
      if (isLast) {
        nextLabel = this.data.challenge ? 'Creative Challenge!' : 'All Done!';
      } else {
        nextLabel = 'Next Step →';
      }

      screen.append(textEl, this.makeNavRow(nextLabel, () => this.goTo(this.current + 1)));

      requestAnimationFrame(() => { bar.style.width = `${pct}%`; });
    });
  }

  // ── Challenge slide ───────────────────────────────
  renderChallenge() {
    const { challenge } = this.data;

    this.render((screen) => {
      screen.classList.add('craft-challenge-screen');

      const iconEl = document.createElement('div');
      iconEl.className = 'craft-challenge-icon';
      const iconImg = document.createElement('img');
      iconImg.src = '/icons/craft-challenge.svg';
      iconImg.width = 80;
      iconImg.height = 80;
      iconImg.alt = '';
      iconEl.appendChild(iconImg);

      const heading = document.createElement('h2');
      heading.className = 'craft-challenge-heading';
      heading.textContent = 'Creative Challenge!';

      const text = document.createElement('p');
      text.className = 'craft-challenge-text';
      text.textContent = challenge;

      screen.append(iconEl, heading, text, this.makeNavRow('I did it!', () => this.goTo(this.current + 1)));
    });
  }

  // ── Complete slide ────────────────────────────────
  renderComplete() {
    const { title } = this.data;

    this.render((screen) => {
      screen.classList.add('craft-complete-screen');

      const heading = document.createElement('h2');
      heading.className = 'craft-complete-heading';
      heading.textContent = 'Amazing Work!';

      const titleEl = document.createElement('div');
      titleEl.className = 'craft-complete-craft';
      titleEl.textContent = `You made: "${title}"`;

      const againBtn = document.createElement('button');
      againBtn.className = 'btn btn-ghost';
      againBtn.textContent = 'Make it again';
      againBtn.addEventListener('click', () => this.goTo(0));

      screen.append(heading, titleEl, againBtn);
    });
  }
}

export default function decorate(block) {
  const data = parseCraft(block);

  if (!data.title) {
    block.innerHTML = '<p style="text-align:center;padding:40px">No craft found. Add Title / Image / Time / Age / Difficulty / Supply / Step rows.</p>';
    return;
  }

  block.textContent = '';

  const game = new CraftGame(block, data);
  game.renderIntro();

  let touchStartX = 0;
  block.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  block.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) game.goTo(diff > 0 ? game.current + 1 : game.current - 1);
  });

  block.setAttribute('tabindex', '0');
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') game.goTo(game.current + 1);
    if (e.key === 'ArrowLeft') game.goTo(game.current - 1);
  });
}
