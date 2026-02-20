import { Game } from './src/game.js?v=menu6';

const BUILD_ID = "menu6-" + Date.now();
console.log("RUNNING BUILD", BUILD_ID);

const stamp = document.getElementById("buildStamp");
if (stamp) stamp.textContent = "BUILD: " + BUILD_ID;

const canvas = document.getElementById('game');
const game = new Game(canvas);
game.buildId = BUILD_ID;

// Reset button
const btnReset = document.getElementById('btnReset');
if (btnReset) {
  btnReset.addEventListener('click', (e) => {
    e.preventDefault();
    game.reset();
    try { canvas.focus(); } catch {}
  }, { passive:false });
}

// iOS Safari anti-zoom guards (best-effort)
document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive:false });
document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive:false });
document.addEventListener('gestureend', (e) => e.preventDefault(), { passive:false });

// Block double-tap zoom by preventing the second tap
let lastTouchStart = 0;
let lastTouchX = 0;
let lastTouchY = 0;

document.addEventListener('touchstart', (e) => {
  if (!e.touches || e.touches.length !== 1) return;

  const t = e.touches[0];
  const now = Date.now();
  const dt = now - lastTouchStart;

  const dx = Math.abs(t.clientX - lastTouchX);
  const dy = Math.abs(t.clientY - lastTouchY);

  // If two taps happen close in time and space, kill the second one
  if (dt > 0 && dt < 330 && dx < 24 && dy < 24) {
    e.preventDefault();
  }

  lastTouchStart = now;
  lastTouchX = t.clientX;
  lastTouchY = t.clientY;
}, { passive:false });

// Menu wiring
const overlay = document.getElementById('menuOverlay');
const menuMode = document.getElementById('menuMode');
const menuDiff = document.getElementById('menuDifficulty');

const btn1p = document.getElementById('btn1p');
const btn2p = document.getElementById('btn2p');
const btnEasy = document.getElementById('btnEasy');
const btnMedium = document.getElementById('btnMedium');
const btnHard = document.getElementById('btnHard');

function hideOverlay() { overlay.classList.add('hidden'); }
function showDifficulty() {
  menuMode.classList.add('hidden');
  menuDiff.classList.remove('hidden');
}

btn2p.addEventListener('click', () => {
  game.setMode({ mode: '2p' });
  hideOverlay();
  try { canvas.focus(); } catch {}
}, { passive:false });

btn1p.addEventListener('click', () => showDifficulty(), { passive:false });

btnEasy.addEventListener('click', () => {
  game.setMode({ mode: '1p', difficulty: 'easy' });
  hideOverlay();
  try { canvas.focus(); } catch {}
}, { passive:false });

btnMedium.addEventListener('click', () => {
  game.setMode({ mode: '1p', difficulty: 'medium' });
  hideOverlay();
  try { canvas.focus(); } catch {}
}, { passive:false });

btnHard.addEventListener('click', () => {
  game.setMode({ mode: '1p', difficulty: 'hard' });
  hideOverlay();
  try { canvas.focus(); } catch {}
}, { passive:false });

// Loop + Joy-Con "+" reset
let resetHeld = false;
function loop(ts) {
  try {
    game.tick(ts);

    const now = game.input && game.input.gpDown(1, 'reset');
    if (now && !resetHeld) game.reset();
    resetHeld = now;

  } catch (err) {
    console.error("Game loop crashed:", err);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Keyboard reset
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r') game.reset();
});
