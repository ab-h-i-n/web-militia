import Phaser from 'phaser';
import { addText } from '../util/text';
import { getMap, type MapDef, type Platform } from '../data/maps';
import { buildIconButton } from './MapSelectionScene';
import {
  Character,
  CHARACTER_ATLAS_IMG,
  CHARACTER_ATLAS_JSON,
  CHARACTER_ATLAS_KEY,
  CHARACTER_VISUAL_BOTTOM_SRC,
  CHARACTER_VISUAL_TOP_SRC,
  CHARACTER_VISUAL_WIDTH_SRC,
} from '../game/character';

interface TrainingSceneData {
  mapId: string;
}

const CHARACTER_SCALE = 0.18;

// Movement tuning
const WALK_SPEED = 240;       // px/sec
const JUMP_VELOCITY = 620;    // initial upward velocity
const GRAVITY_Y = 1500;       // px/sec²

// Placeholder platform palette
const PLATFORM_BODY = 0x8b6f47;
const PLATFORM_GRASS = 0x6b8e23;
const PLATFORM_OUTLINE = 0x000000;
const PLATFORM_GRASS_HEIGHT = 8;

interface InputKeys {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  SPACE: Phaser.Input.Keyboard.Key;
}

export class TrainingScene extends Phaser.Scene {
  static readonly KEY = 'TrainingScene';

  private map!: MapDef;
  private character!: Character;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: InputKeys;
  private walkElapsed = 0;

  constructor() {
    super(TrainingScene.KEY);
  }

  init(data: TrainingSceneData): void {
    const map = getMap(data?.mapId);
    if (!map) throw new Error(`TrainingScene: unknown mapId "${data?.mapId}"`);
    this.map = map;
    this.walkElapsed = 0;
  }

  preload(): void {
    if (this.map.bgPath) this.load.image(this.map.bgKey, this.map.bgPath);
    this.load.atlas(CHARACTER_ATLAS_KEY, CHARACTER_ATLAS_IMG, CHARACTER_ATLAS_JSON);
  }

  create(): void {
    const worldW = this.map.worldWidth ?? this.scale.width;
    const worldH = this.map.worldHeight ?? this.scale.height;

    // Backdrop, cover-fit to the world bounds.
    const bg = this.add.image(worldW / 2, worldH / 2, this.map.bgKey);
    bg.setScale(Math.max(worldW / bg.width, worldH / bg.height));

    this.physics.world.gravity.y = GRAVITY_Y;
    this.physics.world.setBounds(0, 0, worldW, worldH);

    const platformGroup = this.buildPlatforms(this.map.platforms ?? []);

    this.character = this.spawnCharacter();
    this.physics.add.collider(this.character, platformGroup);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,D,SPACE') as InputKeys;

    this.showMapBanner();

    buildIconButton(this, 56, 56, 'back', () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MapSelectionScene');
      });
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  override update(_time: number, delta: number): void {
    if (!this.character) return;

    const body = this.character.body as Phaser.Physics.Arcade.Body;

    const left = this.keys.A.isDown || this.cursors.left?.isDown;
    const right = this.keys.D.isDown || this.cursors.right?.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up));

    if (left && !right) {
      body.setVelocityX(-WALK_SPEED);
      this.character.setFacing(true);
    } else if (right && !left) {
      body.setVelocityX(WALK_SPEED);
      this.character.setFacing(false);
    } else {
      body.setVelocityX(0);
    }

    if (jumpPressed && body.blocked.down) {
      body.setVelocityY(-JUMP_VELOCITY);
    }

    const walking = (left || right) && body.blocked.down;
    if (walking) {
      this.walkElapsed += delta;
      this.character.playWalk(this.walkElapsed);
    } else {
      this.character.resetPose();
      this.walkElapsed = 0;
    }
  }

  // ------------------------------------------------------------------------
  // Spawning + physics body
  // ------------------------------------------------------------------------
  private spawnCharacter(): Character {
    const spawn = this.map.spawnPoints?.[0] ?? {
      x: (this.map.worldWidth ?? this.scale.width) / 2,
      y: (this.map.worldHeight ?? this.scale.height) / 2,
    };

    // spawn.y = where feet should land. Offset container upward so the
    // visible foot bottom lines up with the spawn y.
    const feetOffset = CHARACTER_VISUAL_BOTTOM_SRC * CHARACTER_SCALE;
    const character = new Character(this, spawn.x, spawn.y - feetOffset, {
      scale: CHARACTER_SCALE,
    });

    this.physics.add.existing(character);
    const body = character.body as Phaser.Physics.Arcade.Body;

    // Body matches the visible character extent so collisions feel right.
    const bodyW = CHARACTER_VISUAL_WIDTH_SRC * CHARACTER_SCALE;
    const bodyH = (CHARACTER_VISUAL_BOTTOM_SRC - CHARACTER_VISUAL_TOP_SRC) * CHARACTER_SCALE;
    body.setSize(bodyW, bodyH);
    body.setOffset(-bodyW / 2, CHARACTER_VISUAL_TOP_SRC * CHARACTER_SCALE);
    body.setCollideWorldBounds(true);

    return character;
  }

  // ------------------------------------------------------------------------
  // Platforms — visual graphics + invisible static physics rectangles
  // ------------------------------------------------------------------------
  private buildPlatforms(platforms: Platform[]): Phaser.Physics.Arcade.StaticGroup {
    const g = this.add.graphics();
    const group = this.physics.add.staticGroup();

    for (const p of platforms) {
      // Earth body (sits below the grass strip).
      g.fillStyle(PLATFORM_BODY, 1);
      g.fillRoundedRect(p.x, p.y + PLATFORM_GRASS_HEIGHT, p.w, p.h - PLATFORM_GRASS_HEIGHT, 4);
      // Grass top.
      g.fillStyle(PLATFORM_GRASS, 1);
      g.fillRoundedRect(p.x, p.y, p.w, PLATFORM_GRASS_HEIGHT + 4, 4);
      // Outline.
      g.lineStyle(2, PLATFORM_OUTLINE, 0.75);
      g.strokeRoundedRect(p.x, p.y, p.w, p.h, 4);

      // Invisible static rect that carries the physics body.
      const hit = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 0x000000, 0);
      this.physics.add.existing(hit, true);
      group.add(hit);
    }

    return group;
  }

  private showMapBanner(): void {
    const { width } = this.scale;
    const banner = addText(this, width / 2, 130, this.map.name, {
      fontFamily: '"Bangers", system-ui, sans-serif',
      fontSize: '78px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 6, fill: true },
      padding: { x: 8, y: 14 },
    })
      .setOrigin(0.5)
      .setAlpha(0);
    banner.setLetterSpacing(6);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 400,
      ease: 'Sine.easeOut',
      yoyo: true,
      hold: 1200,
      onComplete: () => banner.destroy(),
    });
  }
}
