# Web-Militia — Assets List

> **Conventions**
> - Reference game resolution: **1280×720 (16:9)**. Source assets at 2× (2560×1440) for high-DPI displays.
> - Sprite formats: **PNG** with transparency. Sprite sheets for animated VFX.
> - Sprite dimensions in **powers of 2** where possible (16, 32, 64, 128, 256).
> - Audio: **OGG** (primary) + **MP3** fallback. SFX 44.1 kHz mono; music 44.1 kHz stereo.
> - Each item lists **aspect ratio — (suggested source pixel size)**.

## UI / Screens
- [ ] Loading screen — **16:9** (1920×1080)
- [ ] Login screen background image — **16:9** (1920×1080)
- [ ] "Touch to Start" overlay text style — **4:1** (800×200)
- [ ] Home screen layout — **16:9** (1920×1080)
- [ ] Lobby UI — **16:9** (1920×1080)
- [ ] Host Lobby join-code input + display — **4:1** (600×150)
- [ ] Map vote UI — **16:9** modal; map cards **16:9** (480×270 each)
- [ ] In-match chat UI (overlay) — **4:3** panel (480×360)
- [ ] Match summary / scoreboard screen — **16:9** (1920×1080)

## Badges (player rank tiers)
- [ ] Bronze — **1:1** (256×256)
- [ ] Silver — **1:1** (256×256)
- [ ] Gold — **1:1** (256×256)
- [ ] Platinum — **1:1** (256×256)
- [ ] Diamond — **1:1** (256×256)

## Characters
### Noobie player (rigged sprite parts)
- [ ] Head — **1:1** (64×64)
- [ ] Body — **2:3** (64×96)
- [ ] Hand — **1:2** (32×64) — mirrored at runtime
- [ ] Leg — **1:2** (32×64) — mirrored at runtime
- [ ] Shoe booster (on/off states sprite sheet) — **1:1** (32×32 per frame)

## Throwables
- [ ] Grenade — **1:1** (32×32)
- [ ] Poison smoke bomb — **1:1** (32×32)
- [ ] Proxy bomb (mine) — **1:1** (32×32)

## Weapons (v1 — pick 5)
- [ ] Pistol — **2:1** (64×32)
- [ ] Uzi — **2:1** (64×32)
- [ ] AK-47 — **3:1** (96×32)
- [ ] Shotgun — **3:1** (96×32)
- [ ] Sniper — **4:1** (128×32)
- [ ] Missile launcher (rocket) — **8:3** (128×48)

## Projectiles
- [ ] Bullet (small — pistol / uzi / AK) — **3:1** (24×8)
- [ ] Shotgun pellet — **1:1** (8×8)
- [ ] Sniper round (long tracer) — **6:1** (48×8)
- [ ] Rocket / missile sprite — **3:1** (96×32)

## Effects / VFX (sprite sheets, ~6–10 frames each)
- [ ] Grenade blast — **1:1** (256×256 per frame)
- [ ] Poison gas cloud — **1:1** (256×256 per frame)
- [ ] Proxy bomb blast — **1:1** (256×256 per frame)
- [ ] Muzzle flash (per weapon) — **1:1** (64×64)
- [ ] Bullet impact / spark — **1:1** (32×32)
- [ ] Blood splatter / hit feedback — **1:1** (64×64)
- [ ] Shoe booster flame / thrust trail — **1:2** (32×64)

## Environment / Map
### Terrain (tile-based; recommend **64×64** tiles)
- [ ] Ground tileset (dirt / grass top edges) — **1:1** (64×64 per tile)
- [ ] Platform / floating ground blocks — **1:1** (64×64 per tile)
- [ ] Stone / rock tiles (cover) — **1:1** (64×64 per tile)
- [ ] Background ground layer (far) — **16:9** seamless (1920×1080)

### Foliage
- [ ] Tree (large) — **1:2** (256×512)
- [ ] Tree (small / bush) — **1:1** (128×128)
- [ ] Plant / grass tufts — **1:1** (64×64)
- [ ] Hanging vine / leaves — **1:3** (64×192)

### Props / Decoration
- [ ] Rocks / boulders (small / medium / large) — **1:1** (32×32 / 64×64 / 128×128)
- [ ] Pebbles / debris — **1:1** (16×16)

### Background layers (parallax)
- [ ] Sky gradient — **16:9** (1920×1080)
- [ ] Clouds — **3:1** (384×128) — multiple variants
- [ ] Distant mountains / silhouette — **32:9** seamless (3840×1080)

### Maps (v1 — full playable layouts, built from 64×64 tiles)
- [ ] Outpost (open / vertical) — **16:3** world (~5120×960)
- [ ] Catacombs (tight underground) — **8:3** world (~3840×1440)

## Audio
> Format: **OGG** (primary) + **MP3** fallback. SFX mono 44.1 kHz; music stereo 44.1 kHz.

### Weapon SFX (one per gun) — short, 0.1–0.5s
- [ ] Pistol shot
- [ ] Uzi shot (loop / burst)
- [ ] AK-47 shot (loop / burst)
- [ ] Shotgun shot
- [ ] Sniper shot
- [ ] Missile launch + rocket whoosh (~1s)
- [ ] Reload (generic per weapon class) — 0.5–1.5s
- [ ] Empty / dry-fire click — 0.1s

### Explosion / Throwable SFX — 0.5–2s
- [ ] Grenade blast
- [ ] Proxy bomb blast
- [ ] Poison gas hiss / cloud loop (loopable, 2s)
- [ ] Throwable bounce / land — 0.2s

### Player SFX
- [ ] Footsteps (walk loop, surface variants) — loopable, 0.4s
- [ ] Jetpack / shoe booster (flying loop) — loopable, 1s
- [ ] Jump / land thud — 0.2s
- [ ] Melee attack swing + hit — 0.3s
- [ ] Hit / damage taken (grunt) — 0.3s
- [ ] Death cry — 0.5–1s

### UI SFX — 0.1–0.4s
- [ ] Button click (primary)
- [ ] Button hover
- [ ] Menu open / close
- [ ] Match start beep
- [ ] Match end / victory chime — 1–2s
- [ ] Kill confirm ping
- [ ] Kill sound (in-match feedback)
- [ ] Chat message received ping

### Music — loopable, 60–180s, 128–192 kbps
- [ ] Loading screen track
- [ ] Main menu / dashboard theme
- [ ] In-match ambient (low-key)
- [ ] Victory / end-of-match sting (~5s, non-loop)
