import Phaser from 'phaser';
import { addText } from '../util/text';

const LOGO_KEY = 'app_text';
const LOGO_PATH = '/images/app_text.webp';
const LOGO_TARGET_WIDTH = 600;

const HOLD_MS = 1400;
const FADE_IN_MS = 700;
const FADE_OUT_MS = 500;

export class SplashScene extends Phaser.Scene {
  static readonly KEY = 'SplashScene';

  constructor() {
    super(SplashScene.KEY);
  }

  preload(): void {
    this.load.image(LOGO_KEY, LOGO_PATH);
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x050608).setOrigin(0, 0);

    const logo = this.add.image(width / 2, height / 2 - 20, LOGO_KEY).setAlpha(0);
    logo.setScale(LOGO_TARGET_WIDTH / logo.width);

    const credit = addText(
      this,
      width / 2,
      logo.y + logo.displayHeight / 2 + 36,
      'made with ❤ by abhin',
      {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        fontSize: '16px',
        color: '#cfcfd4',
        align: 'center',
      },
    )
      .setOrigin(0.5)
      .setAlpha(0);

    // Logo fades + drifts up; credit follows a beat later.
    this.tweens.add({
      targets: logo,
      alpha: 1,
      y: logo.y - 6,
      ease: 'Sine.easeOut',
      duration: FADE_IN_MS,
    });

    this.tweens.add({
      targets: credit,
      alpha: 1,
      ease: 'Sine.easeOut',
      duration: FADE_IN_MS,
      delay: 280,
    });

    this.time.delayedCall(FADE_IN_MS + HOLD_MS, () => {
      this.cameras.main.fadeOut(FADE_OUT_MS, 5, 6, 8);
    });

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('LoadingScene');
    });
  }
}
