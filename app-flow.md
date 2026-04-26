# Web-Militia — App Flow

## 1. Login Screen
- Full-screen background image.
- Background music plays on load.
- "Touch to Start" text shown over the image (clicking / tapping anywhere proceeds).
- Tap → go to Home Screen.

## 2. Home Screen
- Player character displayed in the center.
- **Player name** shown above the character — editable inline by the user.
- Bottom of screen:
  - **Quick Play** button — creates a public lobby; other players auto-join the same lobby via matchmaking.
  - **Host Lobby** button — creates a private lobby and generates a join code; only players with the code can join.

## 3. Lobby
- Players gather (public via Quick Play, private via host code).
- Once enough players are in, proceed to map selection.

## 4. Map Selection
- All players in the lobby see the available maps.
- v1 maps: **Outpost** and **Catacombs**.
- Each player votes for one map.
- Map with the most votes is selected → game starts.

## 5. In-Game
- Player **spawns without any weapon**.
- Weapons spawn on the ground at **random locations** at **random intervals**.
- Player walks over a weapon to pick it up.
- **Controls:** WASD to move, mouse to aim and fire.
- **Realtime chat** is available in-match (text).
- On a successful kill, the **kill sound** plays as feedback.

## 6. End of Match — Scoring
- **Score formula:** `points = kills − deaths`
- **Winner:** top scorer with the fewest deaths.
- Players earn points based on their final position + kills.
- Earned points increase the player's **badge tier** (persistent across matches).

## 7. Post-Match
- Show match summary (rankings, kills, deaths, points earned, badge progress).
- "Play Again" returns to Home / Quick Play.

---

## Notes — assets implied by this flow (added to `assets.md`)
- Login screen background image + background music (already listed).
- Two playable maps for v1: **Outpost** and **Catacombs**.
- **Badge assets** (one sprite per tier — bronze / silver / gold / etc.).
- **Kill sound** SFX (separate from generic UI ping).
- Editable player-name UI element.
- Lobby UI (Quick Play vs Host Lobby + join-code input).
- Map-vote UI.
- In-match chat UI.
