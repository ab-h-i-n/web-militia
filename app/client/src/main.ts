import { createGame } from './game';
import { setupOrientationLock } from './ui/orientation';
import { setupFullscreenButton } from './ui/fullscreen';

const gameRoot = document.getElementById('game');
const rotateOverlay = document.getElementById('rotate-overlay');
const fullscreenBtn = document.getElementById('fullscreen-btn');

if (!gameRoot || !rotateOverlay || !(fullscreenBtn instanceof HTMLButtonElement)) {
  throw new Error('Missing required DOM nodes (#game, #rotate-overlay, #fullscreen-btn)');
}

// Force-load Bangers before booting Phaser. Phaser renders text to canvas,
// which silently falls back to system fonts if the requested font isn't ready
// at draw time — leading to a visible flash on the first frame.
try {
  await document.fonts.load('1em "Bangers"');
} catch {
  // FontFaceSet API unsupported or network blocked — fall back to system stack.
}

const game = createGame(gameRoot);

setupOrientationLock(rotateOverlay, game);
setupFullscreenButton(fullscreenBtn);
