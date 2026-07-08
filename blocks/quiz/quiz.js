function normalizeText(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function parseQuiz(block) {
  let title = 'Quiz';
  const questions = [];
  let currentQuestion = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();

    if (key === 'title') {
      title = value;
    } else if (key === 'question') {
      currentQuestion = { question: value, options: [], answer: '' };
      questions.push(currentQuestion);
    } else if (key === 'options' && currentQuestion) {
      // New format: bullet list in one cell
      const items = cells[1].querySelectorAll('li');
      currentQuestion.options = [...items].map((li, i) => ({
        label: String.fromCharCode(65 + i),
        text: li.textContent.trim(),
      }));
    } else if (['a', 'b', 'c', 'd'].includes(key) && currentQuestion) {
      // Legacy format: individual A/B/C/D rows
      currentQuestion.options.push({ label: key.toUpperCase(), text: value });
    } else if (key === 'answer' && currentQuestion) {
      currentQuestion.answer = value;
    }
  });

  return { title, questions };
}

// Registry so all quizzes on the page can coordinate
const quizRegistry = [];
let chooserRendered = false;

function renderChooser() {
  if (chooserRendered || quizRegistry.length < 2) return;
  chooserRendered = true;

  quizRegistry.forEach(({ block }) => {
    block.classList.add('quiz-collapsed');

    const lobby = block.querySelector('.quiz-lobby');
    if (!lobby) return;

    // Clicking start collapses others — game.start() is handled by lobby button's own listener
    const btn = lobby.querySelector('.quiz-start-btn');
    btn?.addEventListener('click', () => {
      quizRegistry.forEach(({ block: b }) => {
        if (b !== block) b.classList.add('quiz-collapsed');
        else b.classList.remove('quiz-collapsed');
      });
    }, { once: true });
  });
}

class QuizGame {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.current = 0;
    this.score = 0;
    this.answered = false;
  }

  render(buildFn) {
    const old = this.container.querySelector('.quiz-screen');
    if (old) {
      old.classList.add('exit');
    }
    const screen = document.createElement('div');
    screen.className = 'quiz-screen';
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

  renderLobby() {
    this.render((screen) => {
      const lobby = document.createElement('div');
      lobby.className = 'quiz-lobby';

      const icon = document.createElement('div');
      icon.className = 'quiz-lobby-icon';
      const iconImg = document.createElement('img');
      iconImg.src = '/icons/quiz-bulb.svg';
      iconImg.alt = '';
      iconImg.width = 140;
      iconImg.height = 140;
      icon.appendChild(iconImg);

      const title = document.createElement('h2');
      title.className = 'quiz-title';
      title.textContent = this.data.title;

      const meta = document.createElement('p');
      meta.className = 'quiz-meta';
      meta.textContent = `${this.data.questions.length} question${this.data.questions.length !== 1 ? 's' : ''}`;

      const btn = document.createElement('button');
      btn.className = 'btn btn-primary quiz-start-btn';
      btn.textContent = '▶ Start Quiz';

      lobby.append(icon, title, meta, btn);
      screen.appendChild(lobby);

      btn.addEventListener('click', () => this.start(), { once: true });
    });
  }

  start() {
    this.current = 0;
    this.score = 0;
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.data.questions[this.current];
    const total = this.data.questions.length;
    const progress = (this.current / total) * 100;
    this.answered = false;

    this.render((screen) => {
      // Header
      const header = document.createElement('div');
      header.className = 'quiz-header';

      const titleEl = document.createElement('div');
      titleEl.className = 'quiz-header-title';
      titleEl.textContent = this.data.title;

      const scoreEl = document.createElement('div');
      scoreEl.className = 'quiz-score';
      scoreEl.textContent = `⭐ ${this.score}`;

      header.append(titleEl, scoreEl);

      // Progress
      const progressWrap = document.createElement('div');
      progressWrap.className = 'quiz-progress-wrap';
      const progressBar = document.createElement('div');
      progressBar.className = 'quiz-progress-bar';
      progressWrap.appendChild(progressBar);

      const counter = document.createElement('div');
      counter.className = 'quiz-counter';
      counter.textContent = `${this.current + 1} / ${total}`;

      // Question
      const qEl = document.createElement('div');
      qEl.className = 'quiz-question';
      qEl.textContent = q.question;

      // Options
      const optionsEl = document.createElement('div');
      optionsEl.className = 'quiz-options';

      q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.dataset.label = opt.label;
        btn.innerHTML = `<span class="quiz-option-label">${opt.label}</span><span class="quiz-option-text">${opt.text}</span>`;
        optionsEl.appendChild(btn);

        btn.addEventListener('click', () => this.handleAnswer(opt.label, opt.text, optionsEl, screen));
      });

      screen.append(header, progressWrap, counter, qEl, optionsEl);

      requestAnimationFrame(() => { progressBar.style.width = `${progress}%`; });
    });
  }

  handleAnswer(chosenLabel, chosenText, optionsEl, screen) {
    if (this.answered) return;
    this.answered = true;

    const q = this.data.questions[this.current];
    const correct = normalizeText(chosenText) === normalizeText(q.answer);
    const correctOpt = q.options.find((o) => normalizeText(o.text) === normalizeText(q.answer));
    const correctLabel = correctOpt?.label;
    if (correct) this.score += 10;

    // Reveal all options
    optionsEl.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.label === correctLabel) {
        btn.classList.add('correct');
      } else if (btn.dataset.label === chosenLabel && !correct) {
        btn.classList.add('incorrect');
      }
    });

    // Feedback bar
    const feedback = document.createElement('div');
    feedback.className = `quiz-feedback ${correct ? 'correct' : 'incorrect'}`;
    feedback.textContent = correct ? '✓ Correct!' : `✗ The answer was: ${q.answer}`;
    screen.appendChild(feedback);
    requestAnimationFrame(() => feedback.classList.add('visible'));

    // Next button
    const isLast = this.current === this.data.questions.length - 1;
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary quiz-next-btn';
    nextBtn.textContent = isLast ? '📊 See Results' : 'Next →';
    screen.appendChild(nextBtn);

    nextBtn.addEventListener('click', () => {
      if (isLast) {
        this.renderResults();
      } else {
        this.current += 1;
        this.renderQuestion();
      }
    });
  }

  renderResults() {
    const total = this.data.questions.length;
    const maxScore = total * 10;
    const pct = Math.round((this.score / maxScore) * 100);
    let grade;
    let resultIcon;
    if (pct === 100) {
      grade = 'Perfect!'; resultIcon = '/icons/quiz-trophy.svg';
    } else if (pct >= 70) {
      grade = 'Great job!'; resultIcon = '/icons/quiz-celebrate.svg';
    } else if (pct >= 40) {
      grade = 'Good effort!'; resultIcon = '/icons/quiz-celebrate.svg';
    } else {
      grade = 'Keep trying!'; resultIcon = '/icons/quiz-strength.svg';
    }

    this.render((screen) => {
      const results = document.createElement('div');
      results.className = 'quiz-results';

      const emojiEl = document.createElement('div');
      emojiEl.className = 'quiz-results-icon';
      const resultImg = document.createElement('img');
      resultImg.src = resultIcon;
      resultImg.alt = '';
      resultImg.width = 80;
      resultImg.height = 80;
      emojiEl.appendChild(resultImg);

      const gradeEl = document.createElement('h2');
      gradeEl.className = 'quiz-results-grade';
      gradeEl.textContent = grade;

      const scoreEl = document.createElement('div');
      scoreEl.className = 'quiz-results-score';
      scoreEl.textContent = `${this.score} / ${maxScore}`;

      const pctEl = document.createElement('div');
      pctEl.className = 'quiz-results-pct';
      pctEl.textContent = `${pct}% correct`;

      // Score ring
      const ring = document.createElement('div');
      ring.className = 'quiz-ring';
      ring.style.setProperty('--pct', pct);
      const circ = 2 * Math.PI * 15.9; // ≈ 99.9
      let ringColor = '#ff6b6b';
      if (pct === 100) ringColor = '#64dc64';
      else if (pct >= 70) ringColor = '#ffd700';
      else if (pct >= 40) ringColor = '#ff9f40';
      ring.innerHTML = `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" fill="none" stroke-width="2.5" class="ring-bg"/><circle cx="18" cy="18" r="15.9" fill="none" stroke-width="2.5" stroke-linecap="round" stroke="${ringColor}" class="ring-fill" stroke-dasharray="0 ${circ}" stroke-dashoffset="0"/></svg>`;
      requestAnimationFrame(() => {
        const fill = ring.querySelector('.ring-fill');
        if (fill) fill.setAttribute('stroke-dasharray', `${(pct / 100) * circ} ${circ}`);
      });

      const playAgain = document.createElement('button');
      playAgain.className = 'btn btn-primary quiz-play-again';
      playAgain.setAttribute('aria-label', 'Play Again');
      const replayImg = document.createElement('img');
      replayImg.src = '/icons/quiz-replay.svg';
      replayImg.alt = '';
      replayImg.width = 32;
      replayImg.height = 32;
      playAgain.appendChild(replayImg);
      playAgain.addEventListener('click', () => this.start());

      results.append(emojiEl, gradeEl, ring, scoreEl, pctEl, playAgain);
      screen.appendChild(results);
    });
  }
}

export default function decorate(block) {
  const data = parseQuiz(block);

  if (!data.questions.length) {
    block.innerHTML = '<p style="text-align:center;padding:40px">No questions found. Add Title / Question / A / B / C / D / Answer rows.</p>';
    return;
  }

  block.textContent = '';

  const game = new QuizGame(block, data);
  game.renderLobby();

  // Register for chooser coordination
  const entry = {
    block,
    data,
    startFn: () => game.start(),
  };
  quizRegistry.push(entry);

  // After all blocks load, check if chooser needed
  requestAnimationFrame(() => renderChooser());
}
