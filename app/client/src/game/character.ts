import Phaser from 'phaser';

export const CHARACTER_ATLAS_KEY = 'noobie';
export const CHARACTER_ATLAS_IMG = '/images/characters/noobie.webp';
export const CHARACTER_ATLAS_JSON = '/images/characters/noobie.json';

// Per-part rig spec.
//   x, y — offset from container origin in source pixels (torso is the anchor)
//   z    — render order; lower draws first (further back), higher draws on top
//
// Parts are large here (head ≈288px, leg ≈412px) — head sits on torso top,
// legs hang below torso, hands attach at each shoulder. Bump a part's z to
// pull it forward (e.g., set torso.z above handBack.z to hide the back arm
// behind the body).
const PARTS = {
  head:      { x: 0,    y: -245, z: 5 },
  torso:     { x: 0,    y: 0,    z: 4 },
  legBack:   { x: -35,  y: 285,  z: 2 },  // left leg — sits above right leg
  legFront:  { x: 35,   y: 285,  z: 1 },  // right leg — deepest
  handBack:  { x: -110, y: 60,   z: 6 },  // left hand — in front of torso
  handFront: { x: 110,  y: 60,   z: 3 },  // right hand — under torso
} as const;

// Source-pixel offsets of the visible character relative to the container's
// torso anchor. The leg sprite has transparent padding below the boot, so the
// foot silhouette ends above the leg image's bottom edge.
//   TOP    — top of helmet silhouette
//   BOTTOM — bottom of boot silhouette  (used for spawn placement + body sizing)
//   WIDTH  — approximate widest extent across the body
// To fine-tune: increase BOTTOM if the box clips the boots, decrease if the
// box extends below them.
export const CHARACTER_VISUAL_TOP_SRC = -389;
export const CHARACTER_VISUAL_BOTTOM_SRC = 491;
export const CHARACTER_VISUAL_WIDTH_SRC = 280;

// Border framing the character. Source-pixel coords (scaled with the container).
// Border bottom = BORDER_RECT.y + BORDER_RECT.h; aim for ~10px padding past
// CHARACTER_VISUAL_BOTTOM_SRC so the box visually breathes around the boots.
const BORDER_RECT = { x: -180, y: -400, w: 380, h: 799 };
const BORDER_RADIUS = 40;
const BORDER_COLOR = 0xff8888;   // light red
const BORDER_ALPHA = 0.7;
const BORDER_WIDTH = 6;          // source px; ≈2.4px on screen at scale 0.4
const BORDER_Z = 100;            // always on top by default

export interface CharacterOptions {
  /** Multiplier on the native part sizes. 1 = source atlas pixels. */
  scale?: number;
}

/**
 * Assembles the noobie soldier from atlas parts into a Container.
 * Render order is determined by each part's `z` in PARTS (lowest first).
 * Whole-body left/right facing is done by flipping Container.scaleX.
 */
export class Character extends Phaser.GameObjects.Container {
  head: Phaser.GameObjects.Image;
  torso: Phaser.GameObjects.Image;
  legBack: Phaser.GameObjects.Image;
  legFront: Phaser.GameObjects.Image;
  handBack: Phaser.GameObjects.Image;
  handFront: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: CharacterOptions = {}) {
    super(scene, x, y);

    // The leg/hand sprites are drawn facing the wrong way in the atlas, so
    // every limb is flipped on x to point the correct direction. (legL/legR
    // and handL/handR share the same atlas region — see noobie.json's `note`.)
    this.legBack   = scene.add.image(PARTS.legBack.x,   PARTS.legBack.y,   CHARACTER_ATLAS_KEY, 'legL');
    this.legFront  = scene.add.image(PARTS.legFront.x,  PARTS.legFront.y,  CHARACTER_ATLAS_KEY, 'legR');
    this.torso     = scene.add.image(PARTS.torso.x,     PARTS.torso.y,     CHARACTER_ATLAS_KEY, 'body');
    this.head      = scene.add.image(PARTS.head.x,      PARTS.head.y,      CHARACTER_ATLAS_KEY, 'head');
    this.handBack  = scene.add.image(PARTS.handBack.x,  PARTS.handBack.y,  CHARACTER_ATLAS_KEY, 'handL').setFlipX(true);
    this.handFront = scene.add.image(PARTS.handFront.x, PARTS.handFront.y, CHARACTER_ATLAS_KEY, 'handR');

    const border = scene.add.graphics();
    border.lineStyle(BORDER_WIDTH, BORDER_COLOR, BORDER_ALPHA);
    border.strokeRoundedRect(
      BORDER_RECT.x, BORDER_RECT.y, BORDER_RECT.w, BORDER_RECT.h, BORDER_RADIUS,
    );

    // Sort by z so PARTS.<name>.z controls back-to-front draw order.
    const ordered = [
      { go: this.legBack,   z: PARTS.legBack.z },
      { go: this.legFront,  z: PARTS.legFront.z },
      { go: this.torso,     z: PARTS.torso.z },
      { go: this.head,      z: PARTS.head.z },
      { go: this.handBack,  z: PARTS.handBack.z },
      { go: this.handFront, z: PARTS.handFront.z },
      { go: border,         z: BORDER_Z },
    ].sort((a, b) => a.z - b.z);

    this.add(ordered.map((p) => p.go));

    if (opts.scale !== undefined) this.setScale(opts.scale);

    scene.add.existing(this);
  }

  /** Face left (true) or right (false) by flipping the container's scaleX. */
  setFacing(left: boolean): this {
    const s = Math.abs(this.scaleX);
    this.setScale(left ? -s : s, this.scaleY);
    return this;
  }

  /**
   * Drive a simple sine-based walking gait. Pass an accumulated millisecond
   * counter that resets when the character stops; legs and arms swing in
   * opposing phase. Rotation is around each part's image center, so the foot
   * tip arcs slightly forward and up — reads as a step at this scale.
   */
  playWalk(elapsedMs: number): void {
    const phase = (elapsedMs / 1000) * 5 * Math.PI * 2; // 5 Hz cycle
    const legAmp = 0.26;  // ~15°
    const armAmp = 0.17;  // ~10°
    this.legFront.rotation = Math.sin(phase) * legAmp;
    this.legBack.rotation = Math.sin(phase + Math.PI) * legAmp;
    this.handFront.rotation = Math.sin(phase + Math.PI) * armAmp;
    this.handBack.rotation = Math.sin(phase) * armAmp;
  }

  /** Reset all limb rotations to a neutral idle pose. */
  resetPose(): void {
    this.legFront.rotation = 0;
    this.legBack.rotation = 0;
    this.handFront.rotation = 0;
    this.handBack.rotation = 0;
  }
}
