import Phaser from 'phaser';
import { SplashScene } from './scenes/SplashScene';
import { LoadingScene } from './scenes/LoadingScene';
import { DashboardScene } from './scenes/DashboardScene';
import { MapSelectionScene } from './scenes/MapSelectionScene';
import { TrainingScene } from './scenes/TrainingScene';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#050608',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    fps: {
      target: 60,
      min: 30,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [SplashScene, LoadingScene, DashboardScene, MapSelectionScene, TrainingScene],
  };

  return new Phaser.Game(config);
}
