import Phaser from 'phaser';
import { addText } from '../util/text';
import { MAPS, type MapDef } from '../data/maps';
import { REGISTRY_SFX_MUTED, SFX_CLICK_KEY } from './LoadingScene';

const BACKDROP_KEY = 'mapsel_backdrop';
const BACKDROP_PATH = '/images/loading_screen.webp';

const TITLE_Y = 90;
const CARDS_Y = 410;
const CARD_W = 340;
const CARD_H = 240;
const CARD_GAP = 32;
const CARD_RADIUS = 14;

const HIGHLIGHT_COLOR = 0x4ade80;
const LOCKED_TEXT_COLOR = '#9aa0a6';
const LOCKED_FILL = 0x141821;

export class MapSelectionScene extends Phaser.Scene {
  static readonly KEY = 'MapSelectionScene';

  constructor() {
    super(MapSelectionScene.KEY);
  }

  preload(): void {
    this.load.image(BACKDROP_KEY, BACKDROP_PATH);
    for (const map of MAPS) {
      if (map.bgPath) this.load.image(map.bgKey, map.bgPath);
    }
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.image(width / 2, height / 2, BACKDROP_KEY);
    bg.setScale(Math.max(width / bg.width, height / bg.height));
    this.add.rectangle(0, 0, width, height, 0x000000, 0.95).setOrigin(0, 0);

    const title = addText(this, width / 2, TITLE_Y, 'SELECT MAP', {
      fontFamily: '"Bangers", system-ui, sans-serif',
      fontSize: '64px',
      color: '#ffffff',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true },
      padding: { x: 8, y: 12 },
    }).setOrigin(0.5);
    title.setLetterSpacing(6);

    this.buildBackButton();
    this.buildCards();

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private buildCards(): void {
    const { width } = this.scale;
    const totalW = MAPS.length * CARD_W + (MAPS.length - 1) * CARD_GAP;
    const leftEdge = (width - totalW) / 2;

    MAPS.forEach((map, i) => {
      const cx = leftEdge + CARD_W / 2 + i * (CARD_W + CARD_GAP);
      this.buildCard(map, cx, CARDS_Y);
    });
  }

  private buildCard(map: MapDef, cx: number, cy: number): void {
    const W = CARD_W;
    const H = CARD_H;
    const R = CARD_RADIUS;

    // Card body fill — visible behind the thumbnail (or as the only fill for locked cards).
    const fillBg = this.add.graphics();
    fillBg.fillStyle(map.unlocked ? 0x0e1115 : LOCKED_FILL, 1);
    fillBg.fillRoundedRect(cx - W / 2, cy - H / 2, W, H, R);

    // Thumbnail clipped to the rounded rect via a geometry mask.
    if (map.unlocked && map.bgKey) {
      const thumb = this.add.image(cx, cy, map.bgKey);
      const scale = Math.max(W / thumb.width, H / thumb.height);
      thumb.setScale(scale);

      const maskShape = this.make.graphics({});
      maskShape.fillStyle(0xffffff);
      maskShape.fillRoundedRect(cx - W / 2, cy - H / 2, W, H, R);
      thumb.setMask(maskShape.createGeometryMask());

      // Bottom gradient backdrop for label legibility — also masked to corners.
      const fade = this.add.graphics();
      fade.fillStyle(0x000000, 0.6);
      fade.fillRect(cx - W / 2, cy + H / 2 - 64, W, 64);
      const fadeMask = this.make.graphics({});
      fadeMask.fillStyle(0xffffff);
      fadeMask.fillRoundedRect(cx - W / 2, cy - H / 2, W, H, R);
      fade.setMask(fadeMask.createGeometryMask());
    } else {
      // Lock icon centered for placeholder cards.
      const lock = this.add.graphics();
      drawLock(lock, cx, cy - 18, 0x6b7280);
    }

    const label = addText(
      this,
      cx,
      map.unlocked ? cy + H / 2 - 30 : cy + 38,
      map.name,
      {
        fontFamily: '"Bangers", system-ui, sans-serif',
        fontSize: map.unlocked ? '34px' : '24px',
        color: map.unlocked ? '#ffffff' : LOCKED_TEXT_COLOR,
        padding: { x: 4, y: 6 },
      },
    ).setOrigin(0.5);
    label.setLetterSpacing(3);

    const border = this.add.graphics();
    const drawBorder = (state: 'idle' | 'hover' | 'press') => {
      border.clear();
      if (!map.unlocked) {
        border.lineStyle(1.5, 0xffffff, 0.12);
        border.strokeRoundedRect(cx - W / 2, cy - H / 2, W, H, R);
        return;
      }
      const color = state === 'idle' ? 0xffffff : HIGHLIGHT_COLOR;
      const alpha = state === 'idle' ? 0.28 : 0.85;
      const lineW = state === 'idle' ? 1.5 : 2.5;
      border.lineStyle(lineW, color, alpha);
      border.strokeRoundedRect(cx - W / 2, cy - H / 2, W, H, R);
    };
    drawBorder('idle');

    const hit = this.add
      .zone(cx, cy, W, H)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: map.unlocked });

    if (!map.unlocked) return;

    hit.on('pointerover', () => drawBorder('hover'));
    hit.on('pointerout', () => drawBorder('idle'));
    hit.on('pointerdown', () => drawBorder('press'));
    hit.on('pointerup', () => {
      drawBorder('hover');
      if (!this.registry.get(REGISTRY_SFX_MUTED)) {
        this.sound.play(SFX_CLICK_KEY, { volume: 0.7 });
      }
      this.startTraining(map);
    });
  }

  private startTraining(map: MapDef): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('TrainingScene', { mapId: map.id });
    });
  }

  private buildBackButton(): void {
    buildIconButton(this, 56, 56, 'back', () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('DashboardScene');
      });
    });
  }
}

// ---------------------------------------------------------------------------
// Shared icon button (back arrow) — kept local since only this scene + training
// use it so far. Promote to util/ if a third caller appears.
// ---------------------------------------------------------------------------
export function buildIconButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kind: 'back',
  onClick: () => void,
): Phaser.GameObjects.Container {
  const SIZE = 48;
  const RADIUS = 12;
  const container = scene.add.container(x, y);
  const bg = scene.add.graphics();
  const icon = scene.add.graphics();
  container.add([bg, icon]);

  const draw = (state: 'idle' | 'hover' | 'press') => {
    bg.clear();
    const fillAlpha = state === 'idle' ? 0.06 : state === 'hover' ? 0.18 : 0.28;
    bg.fillStyle(0xffffff, fillAlpha);
    bg.fillRoundedRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE, RADIUS);
    bg.lineStyle(1.5, 0xffffff, state === 'idle' ? 0.22 : 0.6);
    bg.strokeRoundedRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE, RADIUS);

    const color = state === 'idle' ? 0xffffff : HIGHLIGHT_COLOR;
    icon.clear();
    icon.lineStyle(2.5, color, 1);
    if (kind === 'back') {
      icon.lineBetween(-9, 0, 9, 0);
      icon.lineBetween(-9, 0, -3, -6);
      icon.lineBetween(-9, 0, -3, 6);
    }
  };

  draw('idle');

  container.setSize(SIZE, SIZE);
  container.setInteractive({ useHandCursor: true });
  container.on('pointerover', () => draw('hover'));
  container.on('pointerout', () => draw('idle'));
  container.on('pointerdown', () => draw('press'));
  container.on('pointerup', () => {
    draw('hover');
    if (!scene.registry.get(REGISTRY_SFX_MUTED)) {
      scene.sound.play(SFX_CLICK_KEY, { volume: 0.7 });
    }
    onClick();
  });

  return container;
}

function drawLock(g: Phaser.GameObjects.Graphics, cx: number, cy: number, color: number): void {
  // Shackle (top arc)
  g.lineStyle(3.5, color, 1);
  g.beginPath();
  g.arc(cx, cy - 4, 11, Math.PI, 0, false);
  g.strokePath();
  // Body
  g.fillStyle(color, 1);
  g.fillRoundedRect(cx - 14, cy + 2, 28, 22, 3);
  // Keyhole
  g.fillStyle(0x000000, 0.55);
  g.fillCircle(cx, cy + 11, 2.5);
  g.fillRect(cx - 1, cy + 11, 2, 6);
}
