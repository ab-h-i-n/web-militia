import Phaser from 'phaser';
import { addText } from '../util/text';
import { loadAudioPrefs } from '../util/audio-prefs';

// Asset keys + paths
const BG_KEY = 'ls_bg';
const BG_PATH = '/images/loading_scene/loading_scene_bg.webp';
const CHAR_KEY = 'ls_char';
const CHAR_PATH = '/images/loading_scene/loading_scene_character.webp';
const BULLET_KEY = 'ls_bullet';
const BULLET_PATH = '/images/loading_scene/bullet.webp';
const LOGO_KEY = 'ls_logo';
const LOGO_PATH = '/images/app_text.webp';
const MUSIC_KEY = 'theme_song';
const MUSIC_PATH = '/sounds/theme_song.mp3';
const CLICK_KEY = 'click';
const CLICK_PATH = '/sounds/click.mp3';

// Stash key for handing the playing music to the next scene.
export const REGISTRY_THEME_MUSIC = 'themeMusic';
// Re-exported so other scenes use the same key when playing the click SFX.
export const SFX_CLICK_KEY = CLICK_KEY;
// Audio mute prefs — shared across scenes via the global game registry.
export const REGISTRY_MUSIC_MUTED = 'musicMuted';
export const REGISTRY_SFX_MUTED = 'sfxMuted';

// Composition: pixel sizes assume the canvas is 1280x720 (game.ts).
const LOGO_TARGET_WIDTH = 620;
const CHAR_TARGET_HEIGHT = 360;
const LOGO_REST_Y = 130;
const CHAR_REST_Y = 410;
const BG_ZOOM = 1.35;            // multiplier on top of cover-fit so bg fills more aggressively

// Muzzle position relative to character display dims (measured from sprite art).
const MUZZLE_X_RATIO = 0.43;   // distance from character center, fraction of displayWidth
const MUZZLE_Y_RATIO = -0.13;  // negative = above character center

// Bullet visuals + flight
const BULLET_SCALE = 0.18;
const BULLET_INTERVAL_MS = 130;
const BULLET_FLIGHT_MS = 600;
const BULLET_DISTANCE = 820;

// Intro timing
const INTRO_BG_FADE_MS = 600;
const INTRO_LOGO_DROP_MS = 800;
const INTRO_LOGO_DELAY = 200;
const INTRO_CHAR_DROP_MS = 720;
const INTRO_CHAR_DELAY = 480;

export class LoadingScene extends Phaser.Scene {
  static readonly KEY = 'LoadingScene';

  private bg!: Phaser.GameObjects.Image;
  private logo!: Phaser.GameObjects.Image;
  private character!: Phaser.GameObjects.Image;

  private bulletTimer?: Phaser.Time.TimerEvent;
  private bulletToggle = false;
  private tapText?: Phaser.GameObjects.Text;
  private transitioning = false;

  constructor() {
    super(LoadingScene.KEY);
  }

  preload(): void {
    this.load.image(BG_KEY, BG_PATH);
    this.load.image(CHAR_KEY, CHAR_PATH);
    this.load.image(BULLET_KEY, BULLET_PATH);
    this.load.image(LOGO_KEY, LOGO_PATH);
    this.load.audio(MUSIC_KEY, MUSIC_PATH);
    this.load.audio(CLICK_KEY, CLICK_PATH);
  }

  create(): void {
    loadAudioPrefs(this);
    this.buildScene();
    this.runIntro();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  // ------------------------------------------------------------------------
  // Scene composition
  // ------------------------------------------------------------------------
  private buildScene(): void {
    const { width, height } = this.scale;

    // Background, scaled to cover the canvas (then zoomed past for a tighter framing).
    this.bg = this.add.image(width / 2, height / 2, BG_KEY).setAlpha(0);
    const bgScale = Math.max(width / this.bg.width, height / this.bg.height) * BG_ZOOM;
    this.bg.setScale(bgScale);

    // Logo, starting off-screen above.
    this.logo = this.add.image(width / 2, -240, LOGO_KEY).setAlpha(0);
    this.logo.setScale(LOGO_TARGET_WIDTH / this.logo.width);

    // Character, starting off-screen below.
    this.character = this.add.image(width / 2, height + 260, CHAR_KEY).setAlpha(0);
    this.character.setScale(CHAR_TARGET_HEIGHT / this.character.height);
  }

  // ------------------------------------------------------------------------
  // Intro animations: bg → logo drop → character drop → idle + bullets
  // ------------------------------------------------------------------------
  private runIntro(): void {
    this.tweens.add({
      targets: this.bg,
      alpha: 1,
      duration: INTRO_BG_FADE_MS,
      ease: 'Sine.easeOut',
    });

    this.tweens.add({
      targets: this.logo,
      y: LOGO_REST_Y,
      alpha: 1,
      duration: INTRO_LOGO_DROP_MS,
      ease: 'Bounce.easeOut',
      delay: INTRO_LOGO_DELAY,
    });

    this.tweens.add({
      targets: this.character,
      y: CHAR_REST_Y,
      alpha: 1,
      duration: INTRO_CHAR_DROP_MS,
      ease: 'Back.easeOut',
      delay: INTRO_CHAR_DELAY,
      onComplete: () => {
        this.startIdleAnimations();
        this.startBullets();
        this.showTapToPlay();
      },
    });
  }

  // ------------------------------------------------------------------------
  // Tap-to-play prompt
  // ------------------------------------------------------------------------
  private showTapToPlay(): void {
    const { width, height } = this.scale;

    this.tapText = addText(this, width / 2, height - 80, 'TAP TO PLAY', {
      fontFamily: '"Bangers", system-ui, sans-serif',
      fontSize: '56px',
      color: '#ffffff',
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true,
      },
      // Phaser under-measures descender + shadow extent for display fonts —
      // padding prevents the bottom of "Y", "P" etc. from being clipped.
      padding: { x: 8, y: 16 },
    })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tapText.setLetterSpacing(4);

    this.tweens.add({
      targets: this.tapText,
      alpha: 1,
      duration: 500,
      ease: 'Sine.easeOut',
    });

    // Hover affordance: pointer cursor, slight shrink, dim. Pointerout resets.
    this.tapText
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.tweens.add({
          targets: this.tapText,
          scale: 0.94,
          alpha: 0.75,
          duration: 120,
          ease: 'Sine.easeOut',
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: this.tapText,
          scale: 1,
          alpha: 1,
          duration: 120,
          ease: 'Sine.easeOut',
        });
      });

    // Whole scene is tappable (text or anywhere) — once is enough.
    this.input.once('pointerdown', () => this.transitionToDashboard());
  }

  private transitionToDashboard(): void {
    if (this.transitioning) return;
    this.transitioning = true;

    this.bulletTimer?.remove();

    // Click feedback for the tap itself.
    if (!this.registry.get(REGISTRY_SFX_MUTED)) {
      this.sound.play(CLICK_KEY, { volume: 0.6 });
    }

    // Start the theme song silently. The tap is the user gesture that unlocks
    // Web Audio, and we hand the sound off to the dashboard via the registry
    // (tweens are scene-scoped, so the actual fade-in lives in DashboardScene).
    const music = this.sound.add(MUSIC_KEY, { loop: true, volume: 0 });
    music.play();
    this.registry.set(REGISTRY_THEME_MUSIC, music);

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('DashboardScene');
    });
  }

  // ------------------------------------------------------------------------
  // Idle animations — different frequencies fake parallax depth
  // ------------------------------------------------------------------------
  private startIdleAnimations(): void {
    // Background: slow horizontal drift (distant clouds creeping past)
    this.tweens.add({
      targets: this.bg,
      x: this.bg.x - 36,
      duration: 9000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Logo: gentle vertical bob + subtle scale breath
    const baseLogoScaleX = this.logo.scaleX;
    const baseLogoScaleY = this.logo.scaleY;
    this.tweens.add({
      targets: this.logo,
      y: LOGO_REST_Y - 8,
      duration: 1900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: this.logo,
      scaleX: baseLogoScaleX * 1.035,
      scaleY: baseLogoScaleY * 1.035,
      duration: 2300,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Character: jet-boot float bob (faster than logo so foreground feels alive)
    this.tweens.add({
      targets: this.character,
      y: CHAR_REST_Y - 14,
      duration: 1300,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  // ------------------------------------------------------------------------
  // Bullet emission — alternates between pistols
  // ------------------------------------------------------------------------
  private startBullets(): void {
    this.bulletTimer = this.time.addEvent({
      delay: BULLET_INTERVAL_MS,
      loop: true,
      callback: () => {
        this.bulletToggle = !this.bulletToggle;
        this.spawnBullet(this.bulletToggle ? 'left' : 'right');
      },
    });
  }

  private spawnBullet(side: 'left' | 'right'): void {
    const xOffset = this.character.displayWidth * MUZZLE_X_RATIO;
    const yOffset = this.character.displayHeight * MUZZLE_Y_RATIO;
    const muzzleX = this.character.x + (side === 'left' ? -xOffset : xOffset);
    const muzzleY = this.character.y + yOffset;

    // Phaser angle convention: 0 = right, 90 = down, 180 = left, 270 = up.
    // Tilt the bullet slightly upward and add small random spread.
    const baseAngleDeg = side === 'left' ? 180 : 0;
    const upTiltDeg = side === 'left'
      ? 8 + Math.random() * 14   // 180→210 = up-and-left
      : -(8 + Math.random() * 14); // 0→-22 = up-and-right
    const spreadDeg = (Math.random() - 0.5) * 16;
    const angleDeg = baseAngleDeg + upTiltDeg + spreadDeg;
    const angleRad = Phaser.Math.DegToRad(angleDeg);

    const bullet = this.add.image(muzzleX, muzzleY, BULLET_KEY);
    bullet.setScale(BULLET_SCALE);
    bullet.setRotation(angleRad);
    bullet.setAlpha(0);

    const targetX = muzzleX + Math.cos(angleRad) * BULLET_DISTANCE;
    const targetY = muzzleY + Math.sin(angleRad) * BULLET_DISTANCE;

    this.tweens.add({ targets: bullet, alpha: 1, duration: 70 });
    this.tweens.add({
      targets: bullet,
      x: targetX,
      y: targetY,
      duration: BULLET_FLIGHT_MS,
      ease: 'Sine.easeOut',
      onComplete: () => bullet.destroy(),
    });
    this.tweens.add({
      targets: bullet,
      alpha: 0,
      delay: BULLET_FLIGHT_MS - 220,
      duration: 220,
    });
  }

  private cleanup(): void {
    this.bulletTimer?.remove();
  }
}
