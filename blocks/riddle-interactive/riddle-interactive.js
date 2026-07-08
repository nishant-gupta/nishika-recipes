function parseRiddles(block) {
  const levelsMap = new Map();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const levelText = cells[0].textContent.trim();
    const question = cells[1].textContent.trim();
    const answer = cells[2].textContent.trim();
    const hint = cells[3] ? cells[3].textContent.trim() : '';

    if (!question || !answer) return;

    // Extract number from "Level 1", "Level 2", etc.
    const match = levelText.match(/(\d+)/);
    const levelNum = match ? parseInt(match[1], 10) : 1;
    const levelKey = levelNum;

    if (!levelsMap.has(levelKey)) {
      levelsMap.set(levelKey, { name: levelText, number: levelNum, questions: [] });
    }

    levelsMap.get(levelKey).questions.push({ question, answer, hint });
  });

  return [...levelsMap.values()].sort((a, b) => a.number - b.number);
}

function stem(word) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function normalize(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(a|an|the)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(stem)
    .join(' ');
}

function checkAnswer(userAnswer, correctAnswer) {
  return normalize(userAnswer) === normalize(correctAnswer);
}

function getStarCount(correct, total) {
  const ratio = correct / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

class RiddleGame {
  constructor(container, levels) {
    this.container = container;
    this.levels = levels;
    this.currentLevel = 0;
    this.currentQuestion = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.levelResults = [];
    this.hintUsed = false;
    this.allLevelStars = [];
  }

  render(buildFn) {
    // Slide out old screen
    const old = this.container.querySelector('.riddle-screen');
    if (old) {
      old.classList.add('exit');
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'riddle-screen';
    buildFn(wrapper);
    this.container.appendChild(wrapper);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrapper.classList.add('visible');
        if (old) old.remove();
      });
    });

    return wrapper;
  }

  init() {
    this.renderLevelIntro();
  }

  renderLevelIntro() {
    const level = this.levels[this.currentLevel];
    const isFirst = this.currentLevel === 0;
    const prevStars = this.allLevelStars;

    this.render((wrapper) => {
      const el = document.createElement('div');
      el.className = 'level-intro';

      const badge = document.createElement('div');
      badge.className = 'level-badge';
      badge.textContent = `Level ${level.number}`;

      const title = document.createElement('h2');
      title.className = 'level-title';
      title.textContent = `Level ${level.number}`;

      const meta = document.createElement('p');
      meta.className = 'level-meta';
      meta.textContent = `${level.questions.length} riddle${level.questions.length !== 1 ? 's' : ''} to crack`;

      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = isFirst ? '🎮 Start Game' : '▶ Start Level';

      if (!isFirst && prevStars.length) {
        const summary = document.createElement('div');
        summary.className = 'score-summary';
        summary.innerHTML = `⭐ ${this.score} points so far`;
        el.append(badge, title, meta, summary, btn);
      } else {
        el.append(badge, title, meta, btn);
      }

      btn.addEventListener('click', () => {
        this.currentQuestion = 0;
        this.levelResults = [];
        this.maxStreak = 0;
        this.renderQuestion();
      });

      wrapper.appendChild(el);
    });
  }

  renderQuestion() {
    const level = this.levels[this.currentLevel];
    const q = level.questions[this.currentQuestion];
    const qNum = this.currentQuestion + 1;
    const total = level.questions.length;
    const progress = ((this.currentQuestion) / total) * 100;
    this.hintUsed = false;

    this.render((wrapper) => {
      // Header
      const header = document.createElement('div');
      header.className = 'game-header';

      const lvlInd = document.createElement('div');
      lvlInd.className = 'level-indicator';
      lvlInd.textContent = `Level ${level.number}`;

      const scoreEl = document.createElement('div');
      scoreEl.className = 'score-display';
      scoreEl.textContent = `⭐ ${this.score}`;

      header.append(lvlInd);

      if (this.streak >= 2) {
        const streakEl = document.createElement('div');
        streakEl.className = 'streak-badge';
        streakEl.textContent = `🔥 ${this.streak}`;
        header.append(streakEl);
      }

      header.append(scoreEl);

      // Progress bar
      const progressWrap = document.createElement('div');
      progressWrap.className = 'progress-bar-wrap';
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      progressWrap.appendChild(progressBar);

      const counter = document.createElement('div');
      counter.className = 'question-counter';
      counter.textContent = `${qNum} / ${total}`;

      // Riddle card
      const card = document.createElement('div');
      card.className = 'riddle-card';

      const icon = document.createElement('div');
      icon.className = 'riddle-icon';
      icon.textContent = '🤔';

      const text = document.createElement('p');
      text.className = 'riddle-text';
      text.textContent = q.question;

      card.append(icon, text);

      // Hint
      const hintSection = document.createElement('div');
      hintSection.className = 'hint-section';

      let hintBtn = null;
      let hintTextEl = null;

      if (q.hint) {
        hintBtn = document.createElement('button');
        hintBtn.className = 'btn btn-hint';
        hintBtn.textContent = '💡 Show Hint';

        hintTextEl = document.createElement('div');
        hintTextEl.className = 'hint-text';
        hintTextEl.textContent = q.hint;
        hintTextEl.hidden = true;

        hintSection.append(hintBtn, hintTextEl);
      }

      // Answer input
      const answerSection = document.createElement('div');
      answerSection.className = 'answer-section';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'answer-input';
      input.placeholder = 'Type your answer...';
      input.autocomplete = 'off';

      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-primary';
      submitBtn.textContent = 'Submit';

      answerSection.append(input, submitBtn);

      wrapper.append(header, progressWrap, counter, card, hintSection, answerSection);

      // Set progress bar after render
      requestAnimationFrame(() => {
        progressBar.style.width = `${progress}%`;
      });

      input.focus();

      if (hintBtn) {
        hintBtn.addEventListener('click', () => {
          this.hintUsed = true;
          hintTextEl.hidden = false;
          hintBtn.disabled = true;
          hintBtn.textContent = '💡 Hint shown (-50pts)';
        });
      }

      const submit = () => {
        const val = input.value.trim();
        if (!val) {
          input.classList.remove('shake');
          requestAnimationFrame(() => input.classList.add('shake'));
          input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
          return;
        }
        this.handleAnswer(val, q);
      };

      submitBtn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    });
  }

  handleAnswer(userAnswer, q) {
    const correct = checkAnswer(userAnswer, q.answer);
    let points = 0;
    if (correct) points = this.hintUsed ? 50 : 100;

    if (correct) {
      this.score += points;
      this.streak += 1;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
    } else {
      this.streak = 0;
    }

    this.levelResults.push({ correct, usedHint: this.hintUsed, points });
    this.renderResult(correct, q.answer, points, userAnswer);
  }

  renderResult(correct, correctAnswer, points, userAnswer) {
    const level = this.levels[this.currentLevel];
    const isLast = this.currentQuestion === level.questions.length - 1;

    this.render((wrapper) => {
      const screen = document.createElement('div');
      screen.className = `result-screen ${correct ? 'correct' : 'incorrect'}`;

      const icon = document.createElement('div');
      icon.className = 'result-icon';
      icon.textContent = correct ? '🎉' : '😔';

      const title = document.createElement('h2');
      title.className = 'result-title';
      title.textContent = correct ? 'Correct!' : 'Not quite...';

      screen.append(icon, title);

      if (correct && points) {
        const pts = document.createElement('div');
        pts.className = 'points-gained';
        pts.textContent = `+${points} pts${this.hintUsed ? ' (hint used)' : ''}`;
        screen.appendChild(pts);
      }

      if (!correct) {
        const yourAnswerEl = document.createElement('div');
        yourAnswerEl.className = 'your-answer';
        yourAnswerEl.innerHTML = `You said: <em>${this.escapeHtml(userAnswer)}</em>`;

        const correctEl = document.createElement('div');
        correctEl.className = 'correct-answer';
        correctEl.innerHTML = `The answer was: <strong>${this.escapeHtml(correctAnswer)}</strong>`;

        screen.append(yourAnswerEl, correctEl);
      }

      if (this.streak >= 2) {
        const streakEl = document.createElement('div');
        streakEl.className = 'streak-notice';
        streakEl.textContent = `🔥 ${this.streak} in a row!`;
        screen.appendChild(streakEl);
      }

      const totalEl = document.createElement('div');
      totalEl.className = 'score-total';
      totalEl.textContent = `Total: ⭐ ${this.score}`;
      screen.appendChild(totalEl);

      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.textContent = isLast ? '📊 See Results' : 'Next Riddle →';
      screen.appendChild(nextBtn);

      wrapper.appendChild(screen);

      nextBtn.addEventListener('click', () => {
        if (isLast) {
          this.renderLevelComplete();
        } else {
          this.currentQuestion += 1;
          this.renderQuestion();
        }
      });
    });
  }

  renderLevelComplete() {
    const level = this.levels[this.currentLevel];
    const correctCount = this.levelResults.filter((r) => r.correct).length;
    const total = level.questions.length;
    const stars = getStarCount(correctCount, total);
    const isLastLevel = this.currentLevel === this.levels.length - 1;
    const levelPoints = this.levelResults.reduce((sum, r) => sum + r.points, 0);

    this.allLevelStars.push(stars);

    this.render((wrapper) => {
      const screen = document.createElement('div');
      screen.className = 'level-complete';

      const iconEl = document.createElement('div');
      iconEl.className = 'complete-icon';
      iconEl.textContent = isLastLevel ? '🏆' : '✅';

      const heading = document.createElement('h2');
      heading.textContent = isLastLevel ? 'Game Complete!' : `Level ${level.number} Complete!`;

      // Stars
      const starsRow = document.createElement('div');
      starsRow.className = 'stars-row';
      const starEls = [];
      for (let i = 0; i < 3; i += 1) {
        const star = document.createElement('span');
        star.className = `star${i < stars ? ' filled' : ''}`;
        star.textContent = '★';
        starsRow.appendChild(star);
        starEls.push(star);
      }

      // Stats
      const statsRow = document.createElement('div');
      statsRow.className = 'level-stats';

      const makestat = (val, label) => {
        const stat = document.createElement('div');
        stat.className = 'stat';
        stat.innerHTML = `<span class="stat-val">${val}</span><span class="stat-label">${label}</span>`;
        return stat;
      };

      statsRow.append(
        makestat(`${correctCount}/${total}`, 'Correct'),
        makestat(`+${levelPoints}`, 'Points'),
        makestat(`${this.maxStreak}🔥`, 'Streak'),
      );

      // Review dots
      const reviewRow = document.createElement('div');
      reviewRow.className = 'question-review';
      this.levelResults.forEach((r, i) => {
        const dot = document.createElement('div');
        dot.className = `review-item ${r.correct ? 'review-correct' : 'review-wrong'}`;
        dot.textContent = `${r.correct ? '✓' : '✗'} Q${i + 1}`;
        reviewRow.appendChild(dot);
      });

      screen.append(iconEl, heading, starsRow, statsRow, reviewRow);

      if (isLastLevel) {
        const finalScore = document.createElement('div');
        finalScore.className = 'final-score';
        finalScore.textContent = `Final Score: ⭐ ${this.score}`;

        const allStarsRow = document.createElement('div');
        allStarsRow.className = 'all-levels-stars';
        this.allLevelStars.forEach((s, i) => {
          const lvlStars = document.createElement('div');
          lvlStars.className = 'lvl-star-row';
          lvlStars.innerHTML = `<span class="lvl-label">L${i + 1}</span>${'★'.repeat(s)}<span class="star-empty">${'★'.repeat(3 - s)}</span>`;
          allStarsRow.appendChild(lvlStars);
        });

        const playAgainBtn = document.createElement('button');
        playAgainBtn.className = 'btn btn-primary';
        playAgainBtn.textContent = '🔄 Play Again';

        screen.append(finalScore, allStarsRow, playAgainBtn);

        wrapper.appendChild(screen);

        playAgainBtn.addEventListener('click', () => {
          this.currentLevel = 0;
          this.currentQuestion = 0;
          this.score = 0;
          this.streak = 0;
          this.maxStreak = 0;
          this.levelResults = [];
          this.allLevelStars = [];
          this.renderLevelIntro();
        });
      } else {
        const nextLevelBtn = document.createElement('button');
        nextLevelBtn.className = 'btn btn-primary';
        nextLevelBtn.textContent = 'Next Level →';
        screen.appendChild(nextLevelBtn);

        wrapper.appendChild(screen);

        nextLevelBtn.addEventListener('click', () => {
          this.currentLevel += 1;
          this.renderLevelIntro();
        });
      }

      // Animate stars in sequence
      requestAnimationFrame(() => {
        starEls.forEach((star, i) => {
          if (star.classList.contains('filled')) {
            setTimeout(() => star.classList.add('animate'), i * 300);
          }
        });
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

export default function decorate(block) {
  const levels = parseRiddles(block);

  if (!levels.length || !levels.some((l) => l.questions.length)) {
    block.innerHTML = '<p style="text-align:center;padding:40px">No riddles found. Add Level / Question / Answer rows to this block.</p>';
    return;
  }

  block.textContent = '';
  const game = new RiddleGame(block, levels);
  game.init();
}
