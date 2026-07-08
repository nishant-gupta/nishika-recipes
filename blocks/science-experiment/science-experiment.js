import { createOptimizedPicture } from '../../scripts/aem.js';

function parseScienceExperiment(block) {
  const data = {
    title: '',
    image: null,
    time: '',
    age: '',
    difficulty: '',
    hypothesis: '',
    materials: [],
    steps: [],
    observation: '',
    explanation: '',
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();

    if (key === 'title') data.title = value;
    else if (key === 'image') data.image = cells[1].querySelector('picture');
    else if (key === 'time') data.time = value;
    else if (key === 'age') data.age = value;
    else if (key === 'difficulty') data.difficulty = value;
    else if (key === 'hypothesis') data.hypothesis = value;
    else if (key === 'material') data.materials.push(value);
    else if (key === 'materials') {
      const items = cells[1].querySelectorAll('li');
      if (items.length) {
        data.materials = [...items].map((li) => li.textContent.trim()).filter(Boolean);
      } else {
        data.materials = value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
      }
    } else if (key === 'step') {
      const picture = cells[1].querySelector('picture');
      data.steps.push({ text: value, picture: picture || null });
    } else if (key === 'observation') data.observation = value;
    else if (key === 'explanation') data.explanation = value;
  });

  return data;
}

const PHASES = [
  { icon: '/icons/science-predict.svg', label: 'Predict' },
  { icon: '/icons/science-gather.svg', label: 'Gather' },
  { icon: '/icons/science-experiment.svg', label: 'Experiment' },
  { icon: '/icons/science-observe.svg', label: 'Observe' },
  { icon: '/icons/science-discover.svg', label: 'Discover' },
];

class ScienceGame {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.current = 0;
    this.hypothesisText = '';
    this.observationText = '';

    this.slides = ['intro'];
    if (data.hypothesis) this.slides.push('hypothesis');
    if (data.materials.length) this.slides.push('materials');
    data.steps.forEach((_, i) => this.slides.push(i));
    if (data.observation) this.slides.push('observation');
    this.slides.push('conclusion');
  }

  getPhase() {
    const slide = this.slides[this.current];
    if (slide === 'intro') return -1;
    if (slide === 'hypothesis') return 0;
    if (slide === 'materials') return 1;
    if (typeof slide === 'number') return 2;
    if (slide === 'observation') return 3;
    return 4;
  }

  render(buildFn) {
    const old = this.container.querySelector('.science-screen');
    if (old) old.classList.add('exit');

    const screen = document.createElement('div');
    screen.className = 'science-screen';
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
    else if (slide === 'hypothesis') this.renderHypothesis();
    else if (slide === 'materials') this.renderMaterials();
    else if (typeof slide === 'number') this.renderStep(slide);
    else if (slide === 'observation') this.renderObservation();
    else this.renderConclusion();
  }

  makeProgress(activePhase) {
    const wrap = document.createElement('div');
    wrap.className = 'science-progress';

    PHASES.forEach(({ icon, label }, i) => {
      const step = document.createElement('div');
      let cls = 'science-phase';
      if (i < activePhase) cls += ' done';
      if (i === activePhase) cls += ' active';
      step.className = cls;

      const iconEl = document.createElement('div');
      iconEl.className = 'science-phase-icon';
      if (i < activePhase) {
        iconEl.textContent = '✓';
      } else {
        const img = document.createElement('img');
        img.src = icon;
        img.width = 16;
        img.height = 16;
        img.alt = '';
        iconEl.appendChild(img);
      }

      const labelEl = document.createElement('div');
      labelEl.className = 'science-phase-label';
      labelEl.textContent = label;

      step.append(iconEl, labelEl);

      if (i < PHASES.length - 1) {
        const line = document.createElement('div');
        line.className = `science-phase-line${i < activePhase ? ' done' : ''}`;
        wrap.append(step, line);
      } else {
        wrap.appendChild(step);
      }
    });

    return wrap;
  }

  makeNavRow(nextLabel, onNext) {
    const row = document.createElement('div');
    row.className = 'science-nav-row';

    if (this.current > 0) {
      const back = document.createElement('button');
      back.className = 'btn btn-ghost science-back-btn';
      back.textContent = '← Back';
      back.addEventListener('click', () => this.goTo(this.current - 1));
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

  makeBadge(iconSrc, text) {
    const badge = document.createElement('span');
    badge.className = 'science-badge';
    const img = document.createElement('img');
    img.src = iconSrc;
    img.width = 14;
    img.height = 14;
    img.alt = '';
    const span = document.createElement('span');
    span.textContent = text;
    badge.append(img, span);
    return badge;
  }

  // ── Intro ──────────────────────────────────────────
  renderIntro() {
    const {
      title, image, time, age, difficulty,
    } = this.data;

    this.render((screen) => {
      screen.classList.add('science-intro-screen');

      if (image) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'science-intro-image';
        const img = image.querySelector('img');
        if (img) {
          imgWrap.appendChild(
            createOptimizedPicture(img.src, img.alt || title, false, [{ width: '800' }]),
          );
        }
        screen.appendChild(imgWrap);
      }

      const body = document.createElement('div');
      body.className = 'science-intro-body';

      const iconEl = document.createElement('div');
      iconEl.className = 'science-intro-icon';
      const iconImg = document.createElement('img');
      iconImg.src = '/icons/science-flask.svg';
      iconImg.width = 80;
      iconImg.height = 80;
      iconImg.alt = '';
      iconEl.appendChild(iconImg);

      const titleEl = document.createElement('h2');
      titleEl.className = 'science-title';
      titleEl.textContent = title;

      body.append(iconEl, titleEl);

      if (time || age || difficulty) {
        const meta = document.createElement('div');
        meta.className = 'science-meta';
        if (time) meta.appendChild(this.makeBadge('/icons/craft-time.svg', time));
        if (age) meta.appendChild(this.makeBadge('/icons/craft-age.svg', `Age ${age}`));
        if (difficulty) meta.appendChild(this.makeBadge('/icons/craft-difficulty.svg', difficulty));
        body.appendChild(meta);
      }

      body.appendChild(this.makeNavRow('Begin Experiment →', () => this.goTo(1)));
      screen.appendChild(body);
    });
  }

  // ── Hypothesis ────────────────────────────────────
  renderHypothesis() {
    this.render((screen) => {
      screen.appendChild(this.makeProgress(0));

      const label = document.createElement('p');
      label.className = 'science-stage-label';
      label.textContent = 'Make your prediction';

      const questionEl = document.createElement('div');
      questionEl.className = 'science-question-card';
      questionEl.textContent = this.data.hypothesis;

      const textareaEl = document.createElement('textarea');
      textareaEl.className = 'science-textarea';
      textareaEl.placeholder = 'I think that…';
      textareaEl.rows = 3;
      if (this.hypothesisText) textareaEl.value = this.hypothesisText;

      const nav = this.makeNavRow('Lock in prediction →', () => {
        this.hypothesisText = textareaEl.value.trim();
        this.goTo(this.current + 1);
      });

      screen.append(label, questionEl, textareaEl, nav);
      requestAnimationFrame(() => textareaEl.focus());
    });
  }

  // ── Materials ─────────────────────────────────────
  renderMaterials() {
    const { materials } = this.data;

    this.render((screen) => {
      screen.appendChild(this.makeProgress(1));

      const label = document.createElement('p');
      label.className = 'science-stage-label';
      label.textContent = 'Gather your materials';

      const hint = document.createElement('p');
      hint.className = 'science-hint';
      hint.textContent = 'Tap each item as you collect it';

      const list = document.createElement('div');
      list.className = 'science-supply-list';

      materials.forEach((mat) => {
        const item = document.createElement('div');
        item.className = 'science-supply-item';

        const check = document.createElement('span');
        check.className = 'science-supply-check';

        const text = document.createElement('span');
        text.className = 'science-supply-text';
        text.textContent = mat;

        item.append(check, text);
        list.appendChild(item);
        item.addEventListener('click', () => item.classList.toggle('checked'));
      });

      screen.append(label, hint, list, this.makeNavRow('Ready! Start the experiment →', () => this.goTo(this.current + 1)));
    });
  }

  // ── Steps ─────────────────────────────────────────
  renderStep(stepIndex) {
    const { steps } = this.data;
    const total = steps.length;
    const stepNum = stepIndex + 1;
    const pct = Math.round((stepNum / total) * 100);
    const isLast = stepIndex === total - 1;
    const { text, picture } = steps[stepIndex];

    this.render((screen) => {
      screen.appendChild(this.makeProgress(2));

      const progressWrap = document.createElement('div');
      progressWrap.className = 'science-step-progress';

      const counter = document.createElement('div');
      counter.className = 'science-step-counter';
      counter.textContent = `Step ${stepNum} of ${total}`;

      const barWrap = document.createElement('div');
      barWrap.className = 'science-progress-wrap';
      const bar = document.createElement('div');
      bar.className = 'science-progress-bar';
      barWrap.appendChild(bar);
      progressWrap.append(counter, barWrap);

      const numEl = document.createElement('div');
      numEl.className = 'science-step-num';
      numEl.textContent = stepNum;

      if (picture) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'science-step-image';
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

      const textEl = document.createElement('div');
      textEl.className = 'science-step-text';
      textEl.textContent = text;

      let nextLabel;
      if (isLast) {
        nextLabel = this.slides.includes('observation') ? 'Record what you observed →' : 'See the science →';
      } else {
        nextLabel = 'Next Step →';
      }

      screen.append(textEl, this.makeNavRow(nextLabel, () => this.goTo(this.current + 1)));
      requestAnimationFrame(() => { bar.style.width = `${pct}%`; });
    });
  }

  // ── Observation ───────────────────────────────────
  renderObservation() {
    this.render((screen) => {
      screen.appendChild(this.makeProgress(3));

      const label = document.createElement('p');
      label.className = 'science-stage-label';
      label.textContent = 'Record your observations';

      const promptEl = document.createElement('div');
      promptEl.className = 'science-question-card';
      promptEl.textContent = this.data.observation;

      const textareaEl = document.createElement('textarea');
      textareaEl.className = 'science-textarea';
      textareaEl.placeholder = 'I observed that…';
      textareaEl.rows = 4;
      if (this.observationText) textareaEl.value = this.observationText;

      const nav = this.makeNavRow('See the science →', () => {
        this.observationText = textareaEl.value.trim();
        this.goTo(this.current + 1);
      });

      screen.append(label, promptEl, textareaEl, nav);
      requestAnimationFrame(() => textareaEl.focus());
    });
  }

  // ── Conclusion ────────────────────────────────────
  renderConclusion() {
    const { explanation } = this.data;

    this.render((screen) => {
      screen.classList.add('science-conclusion-screen');
      screen.appendChild(this.makeProgress(4));

      const iconEl = document.createElement('div');
      iconEl.className = 'science-conclusion-icon';
      const iconImg = document.createElement('img');
      iconImg.src = '/icons/science-discover.svg';
      iconImg.width = 80;
      iconImg.height = 80;
      iconImg.alt = '';
      iconEl.appendChild(iconImg);

      const heading = document.createElement('h2');
      heading.className = 'science-conclusion-heading';
      heading.textContent = 'The Science Behind It';

      const explEl = document.createElement('div');
      explEl.className = 'science-explanation-card';
      explEl.textContent = explanation;

      screen.append(iconEl, heading, explEl);

      if (this.hypothesisText) {
        const recap = document.createElement('div');
        recap.className = 'science-hypothesis-recap';
        const recapLabel = document.createElement('div');
        recapLabel.className = 'science-recap-label';
        recapLabel.textContent = 'Your prediction was:';
        const recapText = document.createElement('div');
        recapText.className = 'science-recap-text';
        recapText.textContent = `"${this.hypothesisText}"`;
        recap.append(recapLabel, recapText);
        screen.appendChild(recap);
      }

      const againBtn = document.createElement('button');
      againBtn.className = 'btn science-play-again';
      againBtn.setAttribute('aria-label', 'Try Again');
      const replayImg = document.createElement('img');
      replayImg.src = '/icons/quiz-replay.svg';
      replayImg.width = 32;
      replayImg.height = 32;
      replayImg.alt = '';
      againBtn.appendChild(replayImg);
      againBtn.addEventListener('click', () => {
        this.hypothesisText = '';
        this.observationText = '';
        this.goTo(0);
      });

      screen.appendChild(againBtn);
    });
  }
}

export default function decorate(block) {
  const data = parseScienceExperiment(block);

  if (!data.title) {
    block.innerHTML = '<p style="text-align:center;padding:40px">No experiment found. Add Title / Image / Time / Age / Difficulty / Hypothesis / Material / Step / Observation / Explanation rows.</p>';
    return;
  }

  block.textContent = '';
  const game = new ScienceGame(block, data);
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
