import { createTreeScene } from '../components/treeScene.js';
import { createHandController } from '../components/handController.js';
import { contentConfig } from '../content/config.js';

const statusLabel = document.querySelector('[data-camera-status]');
const messageEl = document.querySelector('[data-gesture-message]');
const nextButton = document.querySelector('[data-next]');
const openBtn = document.querySelector('[data-assemble]');
const scatterBtn = document.querySelector('[data-scatter]');
const startCamBtn = document.querySelector('[data-start-camera]');
const helperText = document.querySelector('[data-helper]');
const nameEl = document.querySelector('[data-name]');
const videoEl = document.querySelector('[data-video]');
const preview = document.querySelector('[data-preview]');

let treeScene;
let unlocked = false;

function updateStatus(text, mood = '') {
  if (statusLabel) {
    statusLabel.textContent = text;
    statusLabel.dataset.mood = mood;
  }
}

function setMessage(text) {
  if (messageEl) messageEl.textContent = text;
}

function unlockQuest() {
  if (unlocked) return;
  unlocked = true;
  nextButton?.classList.remove('hidden');
  setMessage('Магия сработала — можно к подсказкам.');
}

function initTree() {
  const container = document.querySelector('[data-tree]');
  if (!container) return;
  treeScene = createTreeScene(container);

  openBtn?.addEventListener('click', () => {
    treeScene.assembleTree();
    unlockQuest();
  });

  scatterBtn?.addEventListener('click', () => {
    treeScene.scatterTree();
    setMessage('Отпустили. Попробуй снова собрать.');
  });
}

function initHandControls() {
  if (!videoEl) return null;
  const controller = createHandController(videoEl, {
    onOpenPalm: () => {
      treeScene?.assembleTree();
      unlockQuest();
      setMessage('Ладонь поймана. Елка собирается.');
    },
    onFist: () => {
      treeScene?.scatterTree();
      setMessage('Сжала кулак — части разлетаются.');
    },
    onStatus: (status) => {
      if (status === 'loading') updateStatus('Запрашиваем камеру…', 'muted');
      if (status === 'ready') {
        updateStatus('Камера активна. Видео не сохраняется.', 'ok');
        preview?.classList.remove('hidden');
      }
      if (status === 'error') {
        updateStatus('Камера отключена. Используй кнопки.', 'warn');
        if (startCamBtn) {
          startCamBtn.disabled = false;
          startCamBtn.textContent = 'Включить камеру';
        }
      }
    }
  });
  return controller;
}

function setupCopy() {
  const copyBtn = document.querySelector('[data-copy-phrase]');
  copyBtn?.addEventListener('click', async () => {
    const text = contentConfig.catchphrase;
    await navigator.clipboard?.writeText(text);
    if (helperText) helperText.textContent = 'Фраза сохранена в буфер обмена.';
  });
}

function init() {
  nameEl.textContent = contentConfig.recipientName;
  setMessage('Покажи ладонь — соберу. Сожми кулак — отпущу.');
  helperText.textContent = 'Видео не сохраняется. Жест держи 0.4 секунды.';

  initTree();
  setupCopy();

  const controller = initHandControls();
  startCamBtn?.addEventListener('click', () => {
    controller?.start();
    startCamBtn.textContent = 'Камера включена';
    startCamBtn.disabled = true;
  });
}

document.addEventListener('DOMContentLoaded', init);
