import { contentConfig } from '../content/config.js';

const steps = contentConfig.questSteps;

const state = {
  current: 0,
  completed: false
};

function normalize(text) {
  return text.toLowerCase().trim();
}

function renderProgress() {
  const bar = document.querySelector('[data-progress-bar]');
  const label = document.querySelector('[data-progress-label]');
  const percent = Math.round(((state.current) / steps.length) * 100);
  if (bar) bar.style.width = `${percent}%`;
  if (label) label.textContent = `${state.current}/${steps.length}`;
}

function setMessage(text, mood = 'note') {
  const el = document.querySelector('[data-message]');
  if (el) {
    el.textContent = text;
    el.dataset.mood = mood;
  }
}

function disableControls(disabled) {
  document.querySelectorAll('[data-step-control]').forEach((btn) => {
    btn.disabled = disabled;
  });
}

function showPoem() {
  const poemWrap = document.querySelector('[data-poem]');
  if (!poemWrap) return;
  poemWrap.innerHTML = '';
  contentConfig.poemText.forEach((line) => {
    const p = document.createElement('p');
    p.className = 'poem-line';
    p.textContent = line;
    poemWrap.appendChild(p);
  });
  document.querySelector('[data-poem-section]')?.classList.remove('hidden');
}

function copyPoem() {
  const text = contentConfig.poemText.join('\n');
  navigator.clipboard?.writeText(text).then(() => {
    setMessage('Текст стиха скопирован. Сохрани как талисман.', 'note');
  });
}

function resetQuest() {
  state.current = 0;
  state.completed = false;
  document.querySelector('[data-poem-section]')?.classList.add('hidden');
  document.querySelector('[data-poem]')?.replaceChildren();
  document.querySelector('[data-input]')?.value = '';
  renderStep();
  renderProgress();
  setMessage('Готова к маленькому приключению?', 'note');
  disableControls(false);
}

function handleChoice(answer) {
  const step = steps[state.current];
  const buttons = document.querySelectorAll('[data-option]');
  buttons.forEach((btn) => btn.classList.remove('correct', 'wrong'));
  const match = normalize(answer) === normalize(step.answer);
  const targetButton = Array.from(buttons).find((btn) => btn.dataset.option === answer);
  if (targetButton) {
    targetButton.classList.add(match ? 'correct' : 'wrong');
  }
  if (match) {
    advance(step.success);
  } else {
    setMessage(step.hint || 'Почти 😊', 'note');
  }
}

function handleInput() {
  const step = steps[state.current];
  const value = document.querySelector('[data-input]')?.value || '';
  const match = normalize(value) === normalize(step.answer);
  if (match) {
    advance(step.success);
  } else {
    setMessage(step.hint || 'Чуть-чуть точнее 🙌', 'note');
  }
}

function advance(message) {
  state.current += 1;
  renderProgress();
  setMessage(message, 'success');
  if (state.current >= steps.length) {
    state.completed = true;
    disableControls(true);
    showPoem();
    return;
  }
  renderStep();
}

function renderStep() {
  const step = steps[state.current];
  const titleEl = document.querySelector('[data-step-title]');
  const questionEl = document.querySelector('[data-step-question]');
  const optionsEl = document.querySelector('[data-step-options]');
  const inputRow = document.querySelector('[data-input-row]');

  if (titleEl) titleEl.textContent = `${step.id}. ${step.title}`;
  if (questionEl) questionEl.textContent = step.question;

  if (step.type === 'choice') {
    optionsEl.innerHTML = '';
    optionsEl.classList.remove('hidden');
    inputRow?.classList.add('hidden');
    step.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.dataset.option = opt;
      btn.dataset.stepControl = 'true';
      btn.addEventListener('click', () => handleChoice(opt));
      btn.textContent = opt;
      optionsEl.appendChild(btn);
    });
  } else {
    optionsEl?.classList.add('hidden');
    inputRow?.classList.remove('hidden');
    document.querySelector('[data-input]')?.focus();
  }
}

export function initQuest() {
  renderProgress();
  renderStep();
  setMessage('Готова к маленькому приключению?', 'note');

  document.querySelector('[data-submit-input]')?.addEventListener('click', handleInput);
  document.querySelectorAll('[data-reset]').forEach((btn) => btn.addEventListener('click', resetQuest));
  document.querySelector('[data-copy-poem]')?.addEventListener('click', copyPoem);
}

document.addEventListener('DOMContentLoaded', initQuest);
