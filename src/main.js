import Renderer from './ui/Renderer.js';
import Controller from './ui/Controller.js';

const renderer = new Renderer();
const controller = new Controller(renderer);

window.addEventListener('DOMContentLoaded', () => {
  console.log('PokerGT loaded. Click "New Game" to start!');
});
