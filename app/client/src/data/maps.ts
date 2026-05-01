// Adding a map = drop assets under /assets/images/maps/<id>/ and append an
// entry below. Locked entries render as "COMING SOON" placeholder cards.
export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Spawn coordinates are where the character's FEET should land — typically
// the top y of a platform. TrainingScene offsets the container internally.
export interface SpawnPoint {
  x: number;
  y: number;
}

export interface MapDef {
  id: string;
  name: string;
  bgKey: string;
  bgPath: string;
  unlocked: boolean;
  // Gameplay layout (only required for unlocked, playable maps).
  worldWidth?: number;
  worldHeight?: number;
  platforms?: Platform[];
  spawnPoints?: SpawnPoint[];
}

export const MAPS: MapDef[] = [
  {
    id: 'outpost',
    name: 'OUTPOST',
    bgKey: 'map_outpost_bg',
    bgPath: '/images/maps/outpost/outpost_bg.webp',
    unlocked: true,
    worldWidth: 1280,
    worldHeight: 720,
    // Placeholder platform layout — tune coordinates against the backdrop.
    platforms: [
      // Ground floor
      { x: 0,    y: 668, w: 1280, h: 52 },
      // Lower ledges
      { x: 120,  y: 520, w: 240,  h: 24 },
      { x: 520,  y: 560, w: 220,  h: 24 },
      { x: 880,  y: 480, w: 260,  h: 24 },
      // Upper ledges
      { x: 460,  y: 360, w: 320,  h: 24 },
      { x: 920,  y: 260, w: 220,  h: 24 },
    ],
    spawnPoints: [{ x: 220, y: 668 }],
  },
  {
    id: 'placeholder_1',
    name: 'COMING SOON',
    bgKey: '',
    bgPath: '',
    unlocked: false,
  },
  {
    id: 'placeholder_2',
    name: 'COMING SOON',
    bgKey: '',
    bgPath: '',
    unlocked: false,
  },
];

export function getMap(id: string): MapDef | undefined {
  return MAPS.find((m) => m.id === id);
}
