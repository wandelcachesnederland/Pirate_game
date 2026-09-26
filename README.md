# Broadside!

**Scourge of the Spanish Main** — a swashbuckling naval-combat arcade game that runs in the browser.
Sail a hero ship through **26 eras and 23 stretches of water**, from Egyptian galleys fighting the Sea
Peoples (1178 BC) to a guided-missile boat in the Strait of Hormuz (1988). Turn broadside to the enemy,
maul them until they strike their colours, then lay them aboard for the full prize.

It is a hand-drawn-canvas arcade game, not a simulation: distances, speeds, hit points and ship counts
are scaled for play, and every sea is fought with the weapons that sea actually had — winch-drawn bolts,
sling stones, fire arrows and Greek fire where there is no powder, shells and missiles where there is.

Nothing to install to play: `npm run build` produces **one self-contained `index.html`** you can open
from a USB stick or drop on any static host.

---

## Quick start

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm test         # rules + headless engine regression tests (75 tests)
npm run build    # tsc --noEmit + vite build -> dist/index.html (single file)
npm run preview  # serve the production build
```

Requires Node `^20.19.0 || >=22.12.0` (Vite 7's floor). There is no asset pipeline: every sprite,
island, sound and note of music is generated in code at runtime — the only downloads are the two display
fonts from Google Fonts.

---

## How to play

You are always one ship — the era's hero hull — against a growing fleet. Waves arrive with a title,
every fifth wave sends a boss, and clearing a wave opens a refit screen with three upgrades to choose
between. Between waves the ship is repaired and the crew brought back up to strength.

On the start screen you also pick the **difficulty** of the voyage — five degrees of peril that scale
every foe, fort and fortune. See [Difficulty](#difficulty) below.

### Controls

| Action | Keyboard |
| --- | --- |
| Steer | `A` / `D` or `←` / `→` |
| Trim sails (speed) | `W` / `S` or `↑` / `↓` |
| Fire port / starboard broadside | `Q` / `E` (or `J` / `L`) |
| Smart broadside at the nearest target | `Space` (or `K`), or click |
| Board a prize alongside | `F` (or `B`) |
| Special volley — grape, arrow storm or fire pots | `R` (once the upgrade is fitted) |
| Pause | `P` or `Esc` |

On touch devices a left-thumb joystick steers and trims sail, and buttons on the right fire, launch the
special volley and board.

**The one rule that matters:** weapons fire from the *sides*. Turn broadside to the enemy, or you will
sail past doing nothing.

### What the fight is made of

- **Prize money** — coins and treasure chests drop from wrecks; crates repair your hull. A live streak
  raises a score multiplier up to ×8, and a flawless wave pays half again as much.
- **Striking colours** — a mauled enemy may surrender rather than die. Close in and board her for her
  *full* cargo, prisoners to ransom and her colours for the log; sink her instead and most of the prize
  goes to the bottom with her.
- **Supplies** — water and food are consumed by every hand aboard. Prizes replenish the holds; run dry
  and the crew starts dying.
- **Refits** — thirteen upgrades, renamed for each era (Long Nines become Stronger Bows & Pulleys, Grape
  & Canister becomes Arrow Storm or a Fire Pot Volley).
- **Scores** are local: captain's name, era, difficulty, settings and a top-ten table live in `localStorage`.

### Difficulty

Putting to sea is one screen per decision: a title marquee, sign-on, then the **Peril** screen —
five degrees of danger, each sailing under its own colours — and finally the era and her hero ship.

| Peril | Skulls | The gist |
| --- | --- | --- |
| Landlubber | ☠ | Few, frail and slow-shooting foes; quick to strike their colours; a stouter flagship. |
| Swashbuckler | ☠☠ | A fair fight, only slightly crooked. |
| Buccaneer | ☠☠☠ | The voyage as it was sailed — the game's baseline, every modifier at 1. |
| Dread Captain | ☠☠☠☠ | Hardened foes, faster broadsides, colours struck only at the last gasp. |
| King of the Seas | ☠☠☠☠☠ | Every sail a hunter, every fort a grave. |

The peril touches everything an enemy is — hull, shot, reload, speed, crews, aim — plus how many sails
a wave fields, how fast they arrive, how willing they are to surrender, fortress walls and guns, the
drip of the stores, and your own flagship's hull at sailing. Deeper peril pays richer plunder: all score
and loot pay out by the same hand, so a King of the Seas run is worth half again a Landlubber's. The
choice is saved and stamped on the Hall of Legends and the epitaph.

---

## The eras

Every era is a hero hull, a home sea and its own music. The picker shows three squadrons.

| Squadron | Eras |
| --- | --- |
| **Age of Sail** (6) | Golden Age of Piracy (1710) · Age of Exploration (1500) · Napoleonic Wars (1805) · Barbary War (1801) · Viking Age (900) · Ironclad Era (1862) |
| **Steel Navies** (3) | Great War at Sea (1916) · Second World War at Sea (1943) · Tanker War (1988) |
| **Heritage Seas** (17) | First Punic War (260 BC) · Persian Wars (480 BC) · Macedon at Sea (306 BC) · Against the Sea Peoples (1178 BC) · Monsoon Seas (1200) · Chola Across the Bay (1025) · Bạch Đằng River (1288) · Siege of Constantinople (717) · Ming Treasure Voyages (1405) · Sengoku Period (1575) · Lepanto (1571) · Imjin War (1597) · Māori Musket Wars (1820) · Hawaiian Unification (1795) · Maya First Contact (1517) · Fall of Tenochtitlan (1521) · Inca Pacific Voyages (1465) |

Picking an era picks the whole world: flagship, enemy roster, island art, water colour, weather feel,
music and the weapons both sides carry.

---

## Weapons by era

`src/game/weapons.ts` is the single source of truth, in two layers: `ERA_WEAPONS` says whether a sea had
naval cannon, and `ERA_ARMAMENTS` says what ships throw when it did not.

| Sea | Heavy engines (broadside) | Light stations |
| --- | --- | --- |
| Viking / Greek / Egyptian / Chola | winch-drawn bolts | arrows |
| Roman | ballista stones | arrows |
| Macedonian | torsion stones | bolts |
| Inca Pacific | sling stones | atlatl darts |
| Arab (Monsoon Seas) | naphtha fire siphons | arrows |
| Byzantine | Greek fire siphons | fire arrows |
| Bạch Đằng (1288) | winch-drawn bolts | fire arrows |

**Fire is what kills where there is no powder.** Fire arrows light a hull about half the time; a Greek-fire
siphon always does. A burning hull loses hull points every tick, and fire can leap to a ship lying
alongside. Greek fire that misses does not go out — it leaves naphtha burning on the water that ignites
whatever crosses it.

**Nothing explodes before gunpowder.** One rule, `blastKindFor(era)`, decides how a wreck ends: powder
seas lose a magazine in a white blast, pre-gunpowder seas go up in a sheet of flame, a fort collapses in
dust and rubble, and a fire ship is a bonfire rather than a bomb.

Full rules, numbers and rationale: [`docs/gameplay-rules.md`](docs/gameplay-rules.md).

---

## Islands, peoples and forts

Inhabited islands are not scenery. Each has a village name, a people, a friendliness roll and a patience
threshold; where at least four islands are inhabited, peoples share kin and form a defensive **Tide Pact**.

- Hit, sink or capture a village's boats, or put a round into the village itself, and you spend its
  patience. Cross the line and its people turn hostile — and so do their kin and everyone in their pact.
- Hostile islands launch war canoes when you approach. Raiders only press the attack so far from their own
  beach, so sailing clear of their waters shakes them off.
- Some islands carry a **stone fort**: a battery that answers a hostile sail with shot (or, in the
  mechanical eras, archers and bolt launchers on the walls).

Leave people alone and tempers cool — unless they were never friendly to begin with.

---

## Music and sound

There are no audio files. `src/game/audio.ts` synthesises every effect and every note with the Web Audio
API, and each song is a **cassette**: a small data structure of notes, chords, instrument choices and
drum patterns under `src/game/music/cassettes/`. Melodies are written in a tiny ABC-notation subset
(`src/game/music/notation.ts`), so a tune can be pasted in as plain text.

The deck is adaptive: songs speed up with the wave number, thin out to melody and bass when nothing is
afoot, and bring in extra voices mid-fight. When a warship comes for you the band switches to that era's
**dirge** — the same tape at half speed, an octave down, with only a heartbeat left of the drums.

---

## How the project is built

Two worlds, cleanly split: **React owns the menus, the engine owns the game.**

- The `Engine` (`src/game/engine.ts`) owns the simulation *and* the canvas: one `requestAnimationFrame`
  loop, fixed-step physics, pooled particles, and all combat rules.
- React renders the start screen, era carousel, pause/refit/game-over overlays and touch controls.
- They meet in two narrow places: the engine reports state changes through callbacks (`onScreen`,
  `onUpgrade`, `onGameOver`) and React polls it through explicit getters (`getInventory`,
  `getBoardCandidate`, `getGrapeshot`, `getEra`). No shared mutable state, no framework inside the loop.

| File | What it owns |
| --- | --- |
| `src/game/engine.ts` | The game: world, ships, ballistics, AI, boarding, forts, settlements, camera, HUD |
| `src/game/weapons.ts` | Armament table per era, projectile profiles, blast rule, era-renamed upgrades |
| `src/game/data.ts` | 104 ship definitions, the upgrade list, wave titles and fleet compositions |
| `src/game/rosters.ts` | Per-era enemy rosters, captains, boss hulls and their leaders |
| `src/game/worlds.ts` | 23 regions: water palettes, island themes, peoples, village names |
| `src/game/terrain.ts` · `render.ts` | Island and water painting, forts, ruins, pickups, vignettes |
| `src/game/sprites/` | Hull, deck, rigging and flag art, **baked once per hull and cached** |
| `src/game/settlements.ts` | Peoples, pacts, patience, grievance and cooling rules |
| `src/game/boarding.ts` | Surrender chances and boarding outcomes (pure tables) |
| `src/game/audio.ts` · `music/` | Synthesised SFX, the cassette player, ABC notation, all songs |
| `src/game/difficulty.ts` | The five perils: every modifier that scales foes, forts, spawns and plunder |
| `src/game/storage.ts` · `input.ts` | `localStorage` scores/settings/era/difficulty, keyboard + touch input |
| `src/game/ships/` | Hero hulls: `era/` (flagships) and `heritage/` (one per culture) |
| `src/components/` | React overlays: start, era carousel, pause, refit, game over, touch UI |

Performance is deliberate: hull sprites and island sprites are pre-rendered to offscreen canvases and
reused, particles come from a fixed pool, and the device pixel ratio steps down automatically if frames
get slow.

---

## Tests

```bash
npm test
```

Rules and regressions run headlessly in `node:test` via `tsx` — no DOM, no canvas, no browser. The engine
harness builds a real `Engine` on its prototype and exercises actual combat methods, which keeps the
tests fast and honest about what the game really does.

- `tests/weapons.test.ts` — every era has an explicit armament; no pre-gunpowder shot explodes;
  incendiary profiles; upgrade renaming.
- `tests/engine.test.ts` — firing, hits, boarding, forts, island solidarity, fire behaviour, and a
  per-era guarantee that no powder blast or explosion sound ever plays before gunpowder.
- `tests/settlements.test.ts` — peoples, pacts, patience, grievance spread and cooling.

`npm run build` also type-checks the whole project (`tsc --noEmit`).

---

## Adding to the game

- **An era** — add a hero `ShipDef` (see `src/game/ships/heritage/`), register it in `ships/era/index.ts`
  with a region, and add entries to `ERA_WEAPONS`, `ERA_ARMAMENTS` and the music map.
- **A ship** — add a `ShipDef` to `SHIP_DEFS` in `data.ts` and put it in an era roster in `rosters.ts`.
  The sprite painter derives the hull from the definition, so a new style usually needs no new art code.
- **A song** — copy a cassette in `src/game/music/cassettes/`, write the melody with `abc(...)`, and add
  it to the box in `src/game/music/index.ts`.
- **An upgrade** — append to `UPGRADES` in `data.ts` and wire its effect in the engine (and give it a
  pre-gunpowder name in `weapons.ts` if it applies to the mechanical eras).
- **New weapons** — extend `ProjectileKind`, give it a `SHOT_PROFILE`, art in `drawBalls` and a sound.

Two rules worth keeping: **never mutate a shared `ShipDef`** (eras adapt *copies* — see `armShipForEra`),
and **read the era from the armament/blast tables** rather than hard-coding "no cannon means fire".

---

## Documentation and layout

- [`docs/gameplay-rules.md`](docs/gameplay-rules.md) — prisoners, weapons by era, fire, the blast rule,
  island politics, the steel navies and the Barbary shore.

## Credits

Built with React 19, Vite, Tailwind CSS and TypeScript. Type comes from *Pirata One* and *IM Fell English*
(Google Fonts) and icons from `lucide-react`. Ships, islands, effects and all audio are original code.

The music is period-*inspired*, not documentary: some tapes are arrangements of traditional tunes, others
are newly composed in the idioms of their sea, and the boss dirges are cut from the era's own tapes.
Historical framing is arcade interpretation throughout — the trappings are real, the numbers are a game.
