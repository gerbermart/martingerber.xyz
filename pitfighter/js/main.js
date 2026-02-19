import { Game } from './src/game.js?v=menu3';

const BUILD_ID = "menu3-" + Date.now();
console.log("RUNNING BUILD", BUILD_ID);

const stamp = document.getElementById("buildStamp");
if (stamp) stamp.textContent = "BUILD: " + BUILD_ID;

const canvas = document.getElementById('game');
const game = new Game(canvas);
game.buildId = BUILD_ID;

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

// Loop (never silently dies)
let resetHeld = false;

function loop(ts) {
  try {
    game.tick(ts);

    // Gamepad "+" (Start) reset: player 1 is enough for now
    const now = game.input && game.input.gpDown(1, 'reset');
    if (now && !resetHeld) game.reset();
    resetHeld = now;

  } catch (err) {
    console.error("Game loop crashed:", err);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Keyboard restart
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r') game.reset();
});
