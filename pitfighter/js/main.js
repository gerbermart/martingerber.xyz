import { Game } from './src/game.js?v=menu5';

const BUILD_ID = "menu5-" + Date.now();
console.log("RUNNING BUILD", BUILD_ID);

const stamp = document.getElementById("buildStamp");
if (stamp) stamp.textContent = "BUILD: " + BUILD_ID;

const canvas = document.getElementById('game');
const game = new Game(canvas);
game.buildId = BUILD_ID;

// Reset button
const btnReset = document.getElementById('btnReset');
if (btnReset) btnReset.addEventListener('click', () => game.reset());

// Prevent double-tap zoom (best-effort; iOS can still be stubborn)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive:false });

// Menu elements
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
  canvas.focus();
});
btn1p.addEventListener('click', () => showDifficulty());

btnEasy.addEventListener('click', () => {
  game.setMode({ mode: '1p', difficulty: 'easy' });
  hideOverlay();
  canvas.focus();
});
btnMedium.addEventListener('click', () => {
  game.setMode({ mode: '1p', difficulty: 'medium' });
  hideOverlay();
  canvas.focus();
});
btnHard.addEventListener('click', () => {
  game.setMode({ mode: '1p', difficulty: 'hard' });
  hideOverlay();
  canvas.focus();
});

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
