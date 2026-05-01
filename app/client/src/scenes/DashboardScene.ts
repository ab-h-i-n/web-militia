import Phaser from 'phaser';
import { addText } from '../util/text';
import {
  REGISTRY_MUSIC_MUTED,
  REGISTRY_SFX_MUTED,
  REGISTRY_THEME_MUSIC,
  SFX_CLICK_KEY,
} from './LoadingScene';
import { setAudioPref } from '../util/audio-prefs';
import {
  Character,
  CHARACTER_ATLAS_IMG,
  CHARACTER_ATLAS_JSON,
  CHARACTER_ATLAS_KEY,
} from '../game/character';

const BG_KEY = 'dashboard_bg';
const BG_PATH = '/images/loading_screen.webp';

type IconKind = 'training' | 'play_online' | 'settings';
type AudioToggleKind = 'music' | 'sfx';

interface MenuButtonOpts {
  y: number;
  icon: IconKind;
  label: string;
  onClick: () => void;
}

const BUTTON_W = 320;
const BUTTON_H = 68;
const BUTTON_RADIUS = 14;
const BUTTON_GAP = 16;
const EDGE_PADDING = 32;

// Highlight color (idle = white tint, hover/press = green).
const HIGHLIGHT_COLOR = 0x4ade80; // tailwind green-400
const ICON_IDLE_COLOR = 0xffffff;
const ICON_MUTED_COLOR = 0xff6b6b; // soft red for "off" state

// Top-right audio toggles
const TOGGLE_SIZE = 48;
const TOGGLE_RADIUS = 12;
const TOGGLE_GAP = 12;
const TOGGLE_PADDING = 24;

// Music
const MUSIC_FADE_TARGET = 0.5;
const MUSIC_FADE_MS = 2000;

export class DashboardScene extends Phaser.Scene {
  static readonly KEY = 'DashboardScene';

  constructor() {
    super(DashboardScene.KEY);
  }

  preload(): void {
    this.load.image(BG_KEY, BG_PATH);
    this.load.atlas(CHARACTER_ATLAS_KEY, CHARACTER_ATLAS_IMG, CHARACTER_ATLAS_JSON);
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.image(width / 2, height / 2, BG_KEY);
    bg.setScale(Math.max(width / bg.width, height / bg.height));

    this.add.rectangle(0, 0, width, height, 0x000000, 0.95).setOrigin(0, 0);

    // Character on the left half. No animation per spec — static pose.
    new Character(this, width * 0.32, height * 0.5, { scale: 0.4 });

    const buttonRightX = width - EDGE_PADDING - BUTTON_W / 2;
    const buttonBottomY = height - EDGE_PADDING - BUTTON_H / 2;

    this.buildButton({
      y: buttonBottomY - 2 * (BUTTON_H + BUTTON_GAP),
      icon: 'training',
      label: 'TRAINING',
      onClick: () => this.goToMapSelection(),
    }).setX(buttonRightX);

    this.buildButton({
      y: buttonBottomY - (BUTTON_H + BUTTON_GAP),
      icon: 'play_online',
      label: 'PLAY ONLINE',
      onClick: () => console.log('[dashboard] play online'),
    }).setX(buttonRightX);

    this.buildButton({
      y: buttonBottomY,
      icon: 'settings',
      label: 'SETTINGS',
      onClick: () => console.log('[dashboard] settings'),
    }).setX(buttonRightX);

    this.buildAudioToggles();

    // Re-apply persisted mute state in case the scene is re-entered.
    this.applyMusicMute(Boolean(this.registry.get(REGISTRY_MUSIC_MUTED)));

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.fadeInThemeMusic();
  }

  // ------------------------------------------------------------------------
  // Top-right audio toggles: SFX (left) + Music (right)
  // ------------------------------------------------------------------------
  private buildAudioToggles(): void {
    const { width } = this.scale;
    const y = TOGGLE_PADDING + TOGGLE_SIZE / 2;
    const musicX = width - TOGGLE_PADDING - TOGGLE_SIZE / 2;
    const sfxX = musicX - TOGGLE_SIZE - TOGGLE_GAP;

    this.buildAudioToggleButton(sfxX, y, 'sfx');
    this.buildAudioToggleButton(musicX, y, 'music');
  }

  private buildAudioToggleButton(
    x: number,
    y: number,
    kind: AudioToggleKind,
  ): Phaser.GameObjects.Container {
    const registryKey = kind === 'music' ? REGISTRY_MUSIC_MUTED : REGISTRY_SFX_MUTED;
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    const iconG = this.add.graphics();
    container.add([bg, iconG]);

    const isMuted = () => Boolean(this.registry.get(registryKey));

    const draw = (state: 'idle' | 'hover' | 'press') => {
      bg.clear();
      const fillAlpha = state === 'idle' ? 0.06 : state === 'hover' ? 0.18 : 0.28;
      bg.fillStyle(0xffffff, fillAlpha);
      bg.fillRoundedRect(
        -TOGGLE_SIZE / 2,
        -TOGGLE_SIZE / 2,
        TOGGLE_SIZE,
        TOGGLE_SIZE,
        TOGGLE_RADIUS,
      );
      bg.lineStyle(1.5, 0xffffff, state === 'idle' ? 0.22 : 0.6);
      bg.strokeRoundedRect(
        -TOGGLE_SIZE / 2,
        -TOGGLE_SIZE / 2,
        TOGGLE_SIZE,
        TOGGLE_SIZE,
        TOGGLE_RADIUS,
      );

      const muted = isMuted();
      const iconColor = muted
        ? ICON_MUTED_COLOR
        : state === 'idle'
          ? ICON_IDLE_COLOR
          : HIGHLIGHT_COLOR;
      drawAudioIcon(iconG, kind, iconColor, muted);
    };

    draw('idle');

    container.setSize(TOGGLE_SIZE, TOGGLE_SIZE);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => draw('hover'));
    container.on('pointerout', () => draw('idle'));
    container.on('pointerdown', () => draw('press'));
    container.on('pointerup', () => {
      const next = !isMuted();
      setAudioPref(this, kind, next);
      if (kind === 'music') this.applyMusicMute(next);
      // Confirmation click — only when SFX is enabled after the toggle.
      if (!this.registry.get(REGISTRY_SFX_MUTED)) {
        this.sound.play(SFX_CLICK_KEY, { volume: 0.7 });
      }
      draw('hover');
    });

    return container;
  }

  private applyMusicMute(muted: boolean): void {
    const music = this.registry.get(REGISTRY_THEME_MUSIC) as
      | (Phaser.Sound.BaseSound & { mute: boolean })
      | undefined;
    if (!music) return;
    music.mute = muted;
  }

  private goToMapSelection(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MapSelectionScene');
    });
  }

  private fadeInThemeMusic(): void {
    const music = this.registry.get(REGISTRY_THEME_MUSIC) as
      | Phaser.Sound.BaseSound & { volume: number }
      | undefined;

    if (!music) return;

    this.tweens.add({
      targets: music,
      volume: MUSIC_FADE_TARGET,
      duration: MUSIC_FADE_MS,
      ease: 'Sine.easeIn',
    });
  }

  // ------------------------------------------------------------------------
  // Menu button: rounded-rect bg + drawn icon + Bangers label
  // ------------------------------------------------------------------------
  private buildButton(opts: MenuButtonOpts): Phaser.GameObjects.Container {
    const container = this.add.container(0, opts.y);

    const bg = this.add.graphics();
    container.add(bg);

    const iconG = this.add.graphics();
    iconG.setPosition(-BUTTON_W / 2 + 40, 0);
    container.add(iconG);

    const label = addText(this, -BUTTON_W / 2 + 76, 0, opts.label, {
      fontFamily: '"Bangers", system-ui, sans-serif',
      fontSize: '30px',
      color: '#ffffff',
      padding: { x: 4, y: 8 },
    }).setOrigin(0, 0.5);
    label.setLetterSpacing(3);
    container.add(label);

    const drawBg = (state: 'idle' | 'hover' | 'press') => {
      bg.clear();
      const fillColor = state === 'idle' ? 0xffffff : HIGHLIGHT_COLOR;
      const fillAlpha = state === 'idle' ? 0.06 : state === 'hover' ? 0.18 : 0.28;
      const strokeColor = state === 'idle' ? 0xffffff : HIGHLIGHT_COLOR;
      const strokeAlpha = state === 'idle' ? 0.22 : 0.7;
      const strokeWidth = state === 'idle' ? 1.5 : 2;

      bg.fillStyle(fillColor, fillAlpha);
      bg.fillRoundedRect(-BUTTON_W / 2, -BUTTON_H / 2, BUTTON_W, BUTTON_H, BUTTON_RADIUS);
      bg.lineStyle(strokeWidth, strokeColor, strokeAlpha);
      bg.strokeRoundedRect(-BUTTON_W / 2, -BUTTON_H / 2, BUTTON_W, BUTTON_H, BUTTON_RADIUS);
    };

    const drawIconForState = (state: 'idle' | 'hover' | 'press') => {
      const color = state === 'idle' ? ICON_IDLE_COLOR : HIGHLIGHT_COLOR;
      drawIcon(iconG, opts.icon, color);
    };

    drawBg('idle');
    drawIconForState('idle');

    container.setSize(BUTTON_W, BUTTON_H);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      drawBg('hover');
      drawIconForState('hover');
      this.tweens.add({ targets: container, scale: 1.02, duration: 120, ease: 'Sine.easeOut' });
    });
    container.on('pointerout', () => {
      drawBg('idle');
      drawIconForState('idle');
      this.tweens.add({ targets: container, scale: 1, duration: 120, ease: 'Sine.easeOut' });
    });
    container.on('pointerdown', () => {
      drawBg('press');
      drawIconForState('press');
      this.tweens.add({ targets: container, scale: 0.97, duration: 80, ease: 'Sine.easeOut' });
    });
    container.on('pointerup', () => {
      drawBg('hover');
      drawIconForState('hover');
      this.tweens.add({ targets: container, scale: 1.02, duration: 120, ease: 'Sine.easeOut' });
      if (!this.registry.get(REGISTRY_SFX_MUTED)) {
        this.sound.play(SFX_CLICK_KEY, { volume: 0.7 });
      }
      opts.onClick();
    });

    return container;
  }
}

// ---------------------------------------------------------------------------
// Drawn icons (no font dependency). Each icon is centered at (0, 0).
// ---------------------------------------------------------------------------
function drawIcon(g: Phaser.GameObjects.Graphics, kind: IconKind, color: number): void {
  g.clear();
  g.lineStyle(2.5, color, 1);

  if (kind === 'training') {
    // Crosshair / target
    g.strokeCircle(0, 0, 14);
    g.strokeCircle(0, 0, 6);
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, 2);
    g.lineStyle(2.5, color, 1);
    g.lineBetween(-20, 0, -10, 0);
    g.lineBetween(10, 0, 20, 0);
    g.lineBetween(0, -20, 0, -10);
    g.lineBetween(0, 10, 0, 20);
    return;
  }

  if (kind === 'play_online') {
    // Globe: circle + vertical ellipse (meridian curves) + equator line
    g.strokeCircle(0, 0, 16);
    g.strokeEllipse(0, 0, 14, 32);
    g.lineBetween(-16, 0, 16, 0);
    return;
  }

  if (kind === 'settings') {
    // Three horizontal sliders with a knob on each — modern "settings" mark
    g.lineBetween(-14, -10, 14, -10);
    g.lineBetween(-14, 0, 14, 0);
    g.lineBetween(-14, 10, 14, 10);
    g.fillStyle(color, 1);
    g.fillCircle(-6, -10, 4);
    g.fillCircle(6, 0, 4);
    g.fillCircle(-2, 10, 4);
    return;
  }
}

function drawAudioIcon(
  g: Phaser.GameObjects.Graphics,
  kind: AudioToggleKind,
  color: number,
  muted: boolean,
): void {
  g.clear();

  if (kind === 'sfx') {
    // Speaker: rectangular back + trapezoidal horn.
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(-12, -3);
    g.lineTo(-6, -3);
    g.lineTo(4, -8);
    g.lineTo(4, 8);
    g.lineTo(-6, 3);
    g.lineTo(-12, 3);
    g.closePath();
    g.fillPath();

    if (!muted) {
      // Two sound-wave arcs to the right of the cone.
      g.lineStyle(2, color, 1);
      g.beginPath();
      g.arc(8, 0, 4, -0.6, 0.6, false);
      g.strokePath();
      g.beginPath();
      g.arc(8, 0, 8, -0.6, 0.6, false);
      g.strokePath();
    }
  } else {
    // Eighth note: head + stem + flag.
    g.fillStyle(color, 1);
    g.fillEllipse(-4, 8, 11, 8);
    g.lineStyle(2.5, color, 1);
    g.lineBetween(2, 8, 2, -10);
    g.lineBetween(2, -10, 10, -4);
  }

  if (muted) {
    // Diagonal slash to mark the muted state.
    g.lineStyle(3, color, 1);
    g.lineBetween(-12, -12, 12, 12);
  }
}
