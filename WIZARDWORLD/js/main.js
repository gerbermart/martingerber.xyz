import { Game } from './src/game.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = new Game({ canvas, ctx });
game.start();
