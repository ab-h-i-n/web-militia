# Web-Militia — Product Requirements Document

**Project codename:** `web-militia`
**Author:** Abhin
**Status:** Draft v0.1
**Last updated:** 2026-04-26

---

## 1. Overview

### 1.1 Vision
Build a browser-native 2D multiplayer shooter inspired by *Mini Militia: Doodle Army 2*. Players control jetpack-equipped doodle soldiers in fast, skill-based deathmatches across hand-crafted 2D maps — joinable from any modern browser with zero install, zero downloads, instant play.

### 1.2 Why a web version
- **Reach:** No app-store gatekeepers, no install friction. Share-a-link onboarding.
- **Cross-platform:** Single codebase runs on desktop, mobile web, tablets.
- **Live updates:** Push gameplay tweaks without app reviews.
- **Audience gap:** The original is mobile-only; PC players have no first-class option.

### 1.3 Non-goals (v1)
- Mobile-native apps (PWA wrapper is fine, no React Native / Capacitor).
- Console support.
- 3D rendering.
- Story/single-player campaign (Survival mode is post-v1).
- User-generated maps (post-v1).
- Monetization beyond optional cosmetics.

### 1.4 Legal / IP guardrails
Gameplay mechanics are not copyrightable, but **names, art, logos, and audio are**. To stay clear of Appsomniacs' IP:
- Do **not** ship under the name "Mini Militia" or "Doodle Army".
- Do **not** copy sprites, sound effects, or map layouts pixel-for-pixel.
- Use original doodle-style art and original map designs that *evoke* the same feel.
- Original soundtrack and SFX (commission or use CC0 packs).
- Branding: pick an original name (`Web-Militia` is a working title — final name TBD; consider `Doodle Drop`, `JetSquad`, `Stick Skirmish`).

---

## 2. Target audience & success metrics

### 2.1 Personas
- **Nostalgia player (18–28):** Played Mini Militia in school. Wants the same feel on a laptop during a break.
- **Casual web gamer (12–35):** Browses krunker.io / agar.io / 1v1.lol-style sites. Low patience for installs.
- **LAN/party crew:** Wants to play with friends in 5 seconds via a shareable room link.

### 2.2 v1 success metrics (first 90 days post-launch)
| Metric | Target |
|---|---|
| Daily active users (DAU) | 2,000 |
| Avg session length | ≥ 8 min |
| 7-day retention | ≥ 15% |
| Median match join time | ≤ 6 s |
| P95 in-game latency (same region) | ≤ 90 ms |
| Crash-free sessions | ≥ 99% |

---

## 3. Core gameplay

### 3.1 Pillars
1. **Skill-based aerial combat.** Jetpack movement is the core skill ceiling.
2. **Read-and-react flow.** Sub-second time-to-kill rewards positioning and aim.
3. **Always-on action.** No respawn timers > 3 s, no lobbies > 30 s.
4. **Snackable matches.** A round is 6–10 minutes.

### 3.2 Player movement
- **Dual-stick scheme.** Left = movement (WASD / virtual joystick). Right = aim & fire (mouse / right thumb).
- **Jetpack:** Hold jump (Space / on-screen) to thrust upward. Limited fuel that regenerates while grounded or coasting. Short bursts > sustained flight.
- **Wall slide & wall jump:** Soldiers cling briefly to vertical surfaces.
- **Crouch & prone:** Reduce hitbox; prone disables jetpack.
- **Melee shove + jetpack speed boost:** Melee while thrusting gives a brief speed burst (lighter weapons = bigger boost).

### 3.3 Combat
- **Health:** 100 HP. No regen by default; regen via med-kit pickups or game mode rules.
- **Weapons (v1 set, ~12):**
  - **Sidearms:** Pistol, Magnum (dual-wieldable).
  - **SMGs:** Uzi, MP5.
  - **Rifles:** AK-style, M14 marksman.
  - **Shotguns:** Pump shotgun.
  - **Snipers:** Bolt-action sniper.
  - **Heavy:** Rocket launcher (SMAW analog), flamethrower.
  - **Special:** EMP gun (disables enemy jetpack briefly), laser gun.
- **Throwables:** Frag grenade, smoke, proxy mine.
- **Equipment:** Riot shield (blocks frontal damage, slows movement).
- **Dual wield:** Sidearms only. Trade reload speed for raw output.
- **Pickups on map:** Ammo, health, special weapon spawns on timer.

### 3.4 Game modes (v1)
| Mode | Players | Win condition |
|---|---|---|
| **Free-for-all (Deathmatch)** | 2–6 | First to 25 kills, or highest at 8 min |
| **Team Deathmatch** | 2v2, 3v3 | First team to 40 kills |
| **Capture the Flag** | 3v3 | First team to 3 captures, 10 min cap |
| **1v1 duel (private rooms)** | 2 | Best of 5, no pickups |

Post-v1: Survival (PvE waves), King of the Hill, Custom maps.

### 3.5 Maps (v1: 5 maps, expand to 8 by month 3)
Original designs that cover the archetypes from the source game:
1. **Open Outpost** — large, vertical, long sightlines (Outpost analog).
2. **Catacomb Tunnels** — tight underground corridors, ambush play.
3. **Suburb Rooftops** — mid-range, multi-level buildings (Subdivision analog).
4. **Bottleneck Pass** — single chokepoint, forces engagements.
5. **High Tower** — vertical tower, jetpack-heavy.

Map size target: ~3–4 screens wide, 2 screens tall. Designed for 6 players max.

### 3.6 Progression & cosmetics
- **Level / XP:** XP per kill, assist, capture, win. Cosmetic unlocks every level.
- **Customization:** Head, body, hat, weapon skins. All cosmetic — no pay-to-win.
- **No loot boxes.** Direct unlocks only.

---

## 4. UX & interface

### 4.1 Player journey
1. Land on `web-militia.com` → click **Play** (no signup required, anonymous guest accounts work).
2. Choose mode → matchmaker drops you in a room within 6 s, or joins a friend via shareable link `web-militia.com/r/{roomCode}`.
3. Match starts, HUD appears: health, ammo, mini-map, scoreboard tab.
4. Match ends → kill-feed summary, XP earned, **Play Again** CTA front-and-center.

### 4.2 Screens
- **Home / lobby:** Mode picker, friends list, level/XP bar.
- **Loadout:** Pick primary, secondary, throwable, shield (subject to mode).
- **In-game HUD:** Health bar, ammo, weapon icon, jetpack fuel meter, mini-map, kill-feed, scoreboard (tab).
- **Match summary:** Per-player K/D/A, MVP, XP delta.
- **Settings:** Sensitivity, audio, key rebind, color-blind mode.

### 4.3 Input modes
- **Desktop:** Mouse + keyboard (WASD + mouse aim, Space jetpack, R reload, 1-4 weapon swap, Q throwable).
- **Touch:** Two virtual joysticks + on-screen buttons. Auto-detect on touch devices.
- **Gamepad:** XInput-style support post-v1.

### 4.4 Accessibility
- Color-blind palettes for team colors (red/blue → orange/cyan options).
- Hold-to-shoot toggle.
- Adjustable HUD scale and font size.
- Subtitled SFX cues (footsteps, reload).

---

## 5. Technical architecture

### 5.1 Stack summary

| Layer | Choice | Why |
|---|---|---|
| **Client renderer** | Phaser 3 (TypeScript) | Best 2D HTML5 engine, sprite + tilemap + camera baked in, large community |
| **Client physics** | Planck.js (client-side prediction only) | Box2D port, deterministic, matches server |
| **Server** | Node.js 22 LTS + TypeScript | Shared code with client (movement, hit detection) |
| **Multiplayer framework** | **Colyseus** | Authoritative rooms, automatic state sync (delta-compressed), matchmaking, reconnection — purpose-built for this |
| **Server physics** | Planck.js (authoritative) | Same lib as client → identical sim, no drift |
| **Transport** | WebSocket (Colyseus default); WebRTC DataChannel as v2 optimization | WS works everywhere; WebRTC ~30–50 ms lower latency for v2 |
| **Build / bundler** | Vite + pnpm workspaces | Fast HMR, monorepo for shared types |
| **Auth** | Custom JWT (anonymous + email/Google OAuth) | Anonymous guests are first-class; OAuth for persistence |
| **Database** | PostgreSQL (managed: Neon / Supabase) | Accounts, stats, cosmetics inventory |
| **Cache / sessions** | Redis (Upstash) | Matchmaking queue, room presence, rate limits |
| **Asset CDN** | Cloudflare R2 + Cloudflare CDN | Cheap egress, global edge |
| **Hosting (game servers)** | Fly.io (multi-region) | Run Colyseus nodes near players (US-East, US-West, EU, India, SEA) |
| **Hosting (web app)** | Vercel or Cloudflare Pages | Static SPA, fast global delivery |
| **Audio** | Howler.js | Web Audio with sprite support for SFX |
| **Observability** | Sentry (errors) + Grafana Cloud (metrics) + Loki (logs) | Standard stack |
| **Anti-cheat (v1 baseline)** | Server-authoritative sim + input rate limits + obfuscated client bundle | Real anti-cheat post-v1 |

### 5.2 Architecture diagram (text)

```
 ┌──────────────────────┐         ┌──────────────────────────────┐
 │  Browser (Phaser)    │  WSS    │  Game Server (Colyseus)      │
 │  - Render            │ ──────► │  - Authoritative sim          │
 │  - Input capture     │ ◄────── │  - Planck.js physics tick    │
 │  - Client prediction │  state  │  - Hit detection             │
 │  - Reconciliation    │  diffs  │  - Match state machine       │
 └──────────────────────┘         └──────────┬───────────────────┘
                                             │
        ┌────────────────────┬───────────────┼───────────────────┐
        ▼                    ▼               ▼                   ▼
  ┌──────────┐        ┌─────────────┐   ┌─────────┐        ┌──────────┐
  │ Postgres │        │   Redis     │   │  Auth   │        │  CDN     │
  │ (stats)  │        │ (matchmake) │   │ Service │        │ (assets) │
  └──────────┘        └─────────────┘   └─────────┘        └──────────┘
```

### 5.3 Networking model
- **Authoritative server.** Clients send inputs (move vector, aim angle, fire flags) at 30 Hz. Server simulates at 60 Hz, broadcasts state at 20 Hz.
- **Client-side prediction.** Local player applies inputs immediately for zero perceived input lag.
- **Server reconciliation.** When server state for a past tick disagrees with predicted state, client rewinds and re-simulates.
- **Entity interpolation.** Remote players render 100 ms in the past, interpolated between two server snapshots — smooths jitter.
- **Lag compensation for hitscan weapons.** Server rewinds opponent positions to the firing client's view-time when validating hits (Source-engine style).
- **Bandwidth target:** ≤ 8 KB/s per client at 6-player max.

### 5.4 Tick & state details
- Server tick: **60 Hz** (16.67 ms).
- Snapshot broadcast: **20 Hz** (every 3 ticks), delta-compressed via Colyseus schema.
- Input rate from client: **30 Hz** (every 33 ms), buffered server-side.
- Reconnection grace: 10 s — player avatar freezes; resumes on reconnect.

### 5.5 Repository layout (monorepo)

```
web-militia/
├── apps/
│   ├── client/                # Phaser game (Vite, TS)
│   ├── server/                # Colyseus game server (Node, TS)
│   └── web/                   # Marketing site, auth UI (Next.js or Astro)
├── packages/
│   ├── shared/                # Shared types, constants, math
│   ├── physics/               # Planck.js wrapper, deterministic config
│   ├── protocol/              # Colyseus schemas (state, messages)
│   └── assets/                # Sprite atlases, audio, map JSON
├── tools/
│   ├── map-editor/            # Custom map authoring tool
│   └── balance-sheet/         # Weapon tuning spreadsheet → JSON
├── infra/
│   └── fly/                   # fly.toml per region
├── package.json               # pnpm workspace root
└── PRD.md
```

### 5.6 Critical shared code
The `packages/physics` module **must** run identically on client and server. Rules:
- Same Planck.js version pinned exactly.
- No `Math.random()` in sim — use seeded PRNG.
- No `Date.now()` — use tick number.
- Fixed timestep, no variable dt.

---

## 6. Build phases

### Phase 0 — Foundations (week 0–2)
- Monorepo scaffold, CI (GitHub Actions: typecheck, lint, test).
- Bare Phaser scene rendering a player sprite.
- Bare Colyseus room broadcasting tick.
- Pick & lock the final product name; secure domain.

### Phase 1 — Single-player prototype (week 2–5)
- One map, one weapon (pistol).
- Local jetpack movement, gravity, collision.
- Bot opponent (dumb pathfinding, shoots at player).
- Goal: *playable solo, feels right.*

### Phase 2 — Multiplayer vertical slice (week 5–9)
- Two human players via Colyseus, one map, two weapons.
- Client prediction + server reconciliation working.
- Hit registration with lag comp.
- Goal: *2 friends across the country can play and it feels fair.*

### Phase 3 — v1 content (week 9–16)
- 5 maps, 12 weapons, 3 game modes (FFA, TDM, CTF).
- Loadout screen, match summary, basic XP.
- Anonymous accounts + Google OAuth.
- Matchmaking queue.
- Goal: *closed beta with ~50 invited players.*

### Phase 4 — Polish & launch (week 16–20)
- Audio pass, juice (screen shake, hit-flash, kill cam).
- Mobile touch controls + responsive HUD.
- Multi-region deploy (US, EU, India).
- Marketing site, social share previews.
- Goal: *public launch.*

### Phase 5 — Post-launch (ongoing)
- Survival mode, more maps, weapon balance patches, cosmetics drop, anti-cheat hardening, custom map editor.

---

## 7. Risks & open questions

| Risk | Mitigation |
|---|---|
| **IP claim from Appsomniacs** | Original art, original name, no copied assets. Get a brief legal review before public launch. |
| **Cheating (aimbots, speed hacks)** | Server-authoritative sim handles speed/teleport hacks. Aimbots are harder — defer to post-v1 with input-pattern detection. |
| **Mobile web performance** | Target 60 fps on a 2022 mid-range Android in Chrome. Profile early, cap effects on low-end devices. |
| **Multi-region cost creep** | Start with 2 regions (US-East, EU). Add more only when DAU justifies it. |
| **Latency in India / SEA** | Fly.io has Mumbai + Singapore regions — deploy there once we see traction in those markets. |
| **Asset pipeline bottleneck** | Lock art style early. Hire a single doodle-style illustrator on contract; don't try to crowd-source. |

### Open questions
- **Final product name?** Affects domain, branding, social handles.
- **Monetization model?** Pure cosmetics? Optional ad in match summary? Battle pass post-v1?
- **Account requirement?** Force signup after N matches, or keep guests forever?
- **Map editor in v1?** Big scope add — recommend deferring.

---

## 8. Out-of-scope reminders
- No native mobile builds.
- No 3D.
- No PvE campaign in v1.
- No voice chat in v1 (text quick-chat only).
- No clan/guild system in v1.

---

## 9. Appendix

### 9.1 Reference inspirations
- *Mini Militia: Doodle Army 2* (Appsomniacs) — core gameplay reference.
- *Krunker.io* — web-shooter UX, instant-play onboarding.
- *Stick Fight: The Game* — physics doodle aesthetic.
- *Surviv.io* — 2D web shooter networking benchmarks.

### 9.2 Glossary
- **Tick:** One server simulation step.
- **Snapshot:** Serialized world state broadcast to clients.
- **Lag compensation:** Server rewinds opponent positions to validate hitscan shots from a laggy client's perspective.
- **Reconciliation:** Client correcting its predicted state when it diverges from server truth.
