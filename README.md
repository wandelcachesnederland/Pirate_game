# Broadside!

**Scourge of the Spanish Main** — a swashbuckling naval-combat arcade game that runs in the browser.
Sail a hero ship through **27 eras and 23 stretches of water**, from Egyptian galleys fighting the Sea
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
npm test         # rules + headless engine regression tests (173 tests)
npm run build    # tsc --noEmit + vite build -> dist/index.html (single file)
npm run preview  # serve the production build
```

Requires Node `^20.19.0 || >=22.12.0` (Vite 7's floor). There is no asset pipeline: every sprite,
island, sound and note of music is generated in code at runtime — the only downloads are the two display
fonts from Google Fonts.

---

## How to play

From the start screen you pick one of three modes:

| Mode | What it is |
| --- | --- |
| **Arcade** | The classic cabinet brawl: 27 eras, waves, bosses, refits. |
| **Trade** | Buy low, sell high across the whole world — see [The chart](#the-chart-trade-and-adventure). |
| **Adventure** | Hunt the lairs of that same world map: sea beasts, named rivals, contracts and renown. |

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
| Board a prize alongside — or hail a trader where tribute is due | `F` (or `B`) |
| Era trait action — oar-sprint, anchor stance, teppo volley | `T` |
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
five degrees of danger, each sailing under its own colours — then the **era** and its waters, and
finally the **hero ship** you take into them. The era chart and the shipyard are separate screens:
the chart wears the age's name and year on a plate across the picture — the two things you are really
choosing — and then its sea, its trait and its music; the hull's portrait, numbers and scouting report
get the screen after it. Both drive the same choice (every age sails exactly one flagship), so stepping
back and forth never desynchronises them.

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

### Hull fittings

Three refit slots are fixed to the hull itself. They never fire; they work when hulls touch, and every
era fits its own (`src/game/hullFittings.ts`):

| Slot | What it does |
| --- | --- |
| **Ram** | Driving your bow into an enemy at speed does heavy damage, and your own bow takes less of the blow. |
| **Side fitting** | Any enemy scraping your hull takes damage, plus an era effect: *slows her*, *holes her*, *sets her alight* or *stuns her crews*. |
| **Fenders** | Up to 60% less damage from collisions, war-canoe bites and fire-ship blasts, less fire time aboard, and enemies get shoved off. |

Some examples: Bronze Rostrum + Corvus Boarding Bridge + Oak Wales (Rome), Iron-Spiked Turtle Roof (Korea),
Vinegar-Soaked Felt against Greek fire (Byzantium), Cast-Iron Ram Bow + Boiler Scald Hoses (Ironclad),
Depth-Charge Rails (WW2), Welded Steel Bow Plate + Hooked Boarding Ladders + Truck-Tyre Fenders (Somali).

### Somali Pirates (2009)

Sail the hijacked-trawler mothership *Sahan* out of the Gulf of Aden with RPG-7s and PKMs. Bulk carriers
and container ships are the prey; a VLCC is the jackpot; rival clan skiffs, navy boarding RHIBs, Puntland
Maritime Police boats and EU NAVFOR frigates hunt you; USS Bainbridge is the boss. The islands have bare red
jebels, coral beaches, whitewashed towns, Guardafui's lighthouse and Socotra's dragon's blood trees. Three
original tapes in the Somali idiom: *Dhaanto Badweyn* (dhaanto dance), *Hees Badmaax* (a sailor's work
song) and *Xamar Nights* (Mogadishu funk).

---

## The eras

Every era is a hero hull, a home sea and its own music. The era screen shows three squadrons, and each
era gets its own **title card**: her hulls mid-fight with the weapons of the age (broadside smoke,
bolt volleys, a jet of Greek fire, a missile run), the weather and the shore those waters are known
for, and a logo plate with the era's name, year, emblem and sea — all painted in code
(`src/game/eraArt/`), live at 30fps. The screen fits the cabinet: on a desktop nothing scrolls.

The screen after it is the shipyard (`src/components/HeroShipPicker.tsx`): the hero hull painted live
by the game's own portrait painter, her numbers measured against every hero afloat, her strengths and
weaknesses, and the whole roster of flagships on one strip — choose a hull there and you choose her
age too.

| Squadron | Eras |
| --- | --- |
| **Age of Sail** (6) | Golden Age of Piracy (1710) · Age of Exploration (1500) · Napoleonic Wars (1805) · Barbary War (1801) · Viking Age (900) · Ironclad Era (1862) |
| **Steel Navies** | Great War at Sea (1916) · Second World War at Sea (1943) · Tanker War (1988) · Somali Pirates (2009) |
| **Heritage Seas** (17) | First Punic War (260 BC) · Persian Wars (480 BC) · Macedon at Sea (306 BC) · Against the Sea Peoples (1178 BC) · Monsoon Seas (1200) · Chola Across the Bay (1025) · Bạch Đằng River (1288) · Siege of Constantinople (717) · Ming Treasure Voyages (1405) · Sengoku Period (1575) · Lepanto (1571) · Imjin War (1597) · Māori Musket Wars (1820) · Hawaiian Unification (1795) · Maya First Contact (1517) · Fall of Tenochtitlan (1521) · Inca Pacific Voyages (1465) |

Picking an era picks the whole world: flagship, enemy roster, island art, water colour, weather feel,
music and the weapons both sides carry. The shipyard screen that follows is where that flagship is
studied and confirmed — it is the same single choice, seen from the hull rather than the chart.

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
- Hostile villages launch war canoes when you approach. Raiders only press the attack so far from their own
  beach, so sailing clear of their waters shakes them off.
- Some islands carry a **stone fort**: a battery that answers a hostile sail with shot (or, in the
  mechanical eras, archers and bolt launchers on the walls).
- A fortified island is a **harbour town** (marked ⚓ on the chart), built the way that era built one.
  You get walled basins, quays and moored craft. Some eras add their own touches: Greek and Punic
  ship-sheds, the Pharos, the chain across the Golden Horn, whitewashed Tripoli under a minaret, Viking
  and Māori palisades, coaling wharves in 1916, and gantries and oil tanks in 1988
  (`src/game/harbour.ts`).
- A roused harbour town doesn't send canoes. It sends that era's **harbour squadron** out through the
  harbour mouth: armed guard boats, joined by a proper warship from wave 5. Examples are gunboats and
  cutters in the Caribbean, lembi and Carthaginian galleys in 260 BC, torpedo boats off Dogger Bank,
  and patrol boats in the Gulf. At most three are out at once. They answer to their harbour, putting
  back once you're clear of its waters or once the town stands down. Raze the fort and the town can
  only man a guard boat or two.

Leave people alone and tempers cool — unless they were never friendly to begin with.

---

## Music and sound

**Start-up sting.** The game opens on the **Bit Squirrel** studio card. The mascot is animated: it trots
onto an empty plate in four hops on the sting's eighth notes — one per note, dust at every landing —
skids, flicks its plume and blinks, and then the studio name stamps down a letter per beat and lands on
the big final chord. From there the card *is* the still logo, with the squirrel still breathing, blinking
and flicking its tail until it fades. Every frame is drawn from `src/game/splash/pixels.ts` (the sprite,
and a 5×7 bitmap font) on the timeline in `src/game/splash/anim.ts` — no image assets, and no easing
between sprite pixels: motion snaps to the pixel grid like real 8-bit art. The sting
(`src/game/splash/fanfare.ts`) is a short "wall of sound": stacked, detuned chip voices across three
octaves, pulse stabs, glockenspiel, tambourine and a "boom, boom-boom, crack" beat in a big generated
reverb. After about 5 seconds the logo and the music fade out together onto the title screen. Any key or
tap skips it. Browsers that block autoplay hold the card on the squirrel alone — "Press any key or tap" —
and that press starts the sting and the whole card with it. If music is switched off, the card plays
without sound; `prefers-reduced-motion` skips straight to the still logo.

**Attract theme.** The screen the sting hands over to — the title marquee, the attract-mode page the
player sees next — has a tune of its own: **"The Broadside March"**
(`src/game/music/cassettes/broadsideMarch.ts`). It is written as a cassette like any sea's tape, and it
keeps the sting's sound and its chords (D – Bm – G – A) so the logo and the title screen read as one
piece of music: the same wall of stacked, detuned saws, glockenspiel, off-beat stabs, tambourine and
"boom, boom-boom" drums, now carrying a real melody — an eight-bar arch that lifts, answers, falls and
cadences into the leading tone, with a snare roll in the last bar that throws the loop back to the top.
It starts as the logo fades, runs under sign-on and peril, and crossfades out when the era chart loads
one of the sea's own tapes; setting sail hands the deck to the voyage.


There are no audio files. `src/game/audio.ts` synthesises every effect and every note with the Web Audio
API, and each song is a **cassette**: a small data structure of notes, chords, instrument choices and
drum patterns under `src/game/music/cassettes/`. Melodies are written in a tiny ABC-notation subset
(`src/game/music/notation.ts`), so a tune can be pasted in as plain text.

The deck is adaptive: songs speed up with the wave number, thin out to melody and bass when nothing is
afoot, and bring in extra voices mid-fight. When a warship comes for you the band switches to that era's
**dirge** — the same tape at half speed, an octave down, with only a heartbeat left of the drums.

---

## The chart: Trade and Adventure

Trade and Adventure are two different games played on **one map**. The chart lives in `src/game/chart/`
and neither mode keeps a copy of it: the continents, the projection, the ports and the little WebAudio
sound set are imported by both, and the shared painter in `chart/paint.ts` draws the same coastline in
each mode's own palette. Learn a coast in Trade and it is the same coast in Adventure.

| File | What it owns |
| --- | --- |
| `src/game/chart/world.ts` | Equirectangular projection, the hand-drawn continents, `isLand`, `nudgeToSea` |
| `src/game/chart/ports.ts` | The 55 ports of the world by longitude/latitude, with their maritime regions |
| `src/game/chart/goods.ts` | Trade goods and the price model |
| `src/game/chart/paint.ts` | The shared chart painter: sea, graticule, land, ports, ships, compass, labels |
| `src/game/chart/audio.ts` | `VoyageAudio` — the small synthesised sound set both modes sail with |

### Trade — Fortune & Rum

Sail the world, buy where a good is grown and sell where it is wanted, dodge the pirates that work the
sea lanes, and refit at shipyard ports. The market drifts globally, so the whole world booms and busts
together. Reach 15,000 gold to corner the markets of the globe.

### Adventure — Chart the Unknown

The same map, peopled. **Ten lairs** are marked on the chart by longitude and latitude — five sea
beasts and five named rivals, tiered from a first prize to *Admiral Sable, the Dread Commodore*. A lair
sleeps until you sail within its reach; then the thing in it wakes, names itself, and hunts you across
its home water. Past its leash it turns for home, sleeps, and heals — you cannot nibble it to death.

- **Renown** is the score. Prizes, raiders and contracts all pay it, and it buys you a reputation:
  *Unknown Hand* → *Freebooter* → *Sea Rover* → *Dread Corsair* → *Scourge of the Deep* → *Legend of the Chart*.
- **Salvage** is the currency. Ports caulk your hull and sell refits: heavier guns, a reinforced hull,
  drilled gunners (faster reload) and copper sheathing (speed). Every refit costs more than the last.
- **The bounty board** in each harbour offers the trouble nearest that port — renown and salvage on
  delivery. One contract at a time; tear it up if the wind changes.
- **Raiders** find you as your name grows, and pay in salvage when they sink.
- **The voyage ends** when the last lair is empty (*The Chart Is Yours*) or the sea takes your ship.

| File | What it owns |
| --- | --- |
| `src/game/adventure/beasts.ts` | The gallery: lair positions, tiers, beast/rival stats, contracts, refits, ranks |
| `src/game/adventure/engine.ts` | `AdventureEngine`: its own loop, sailing, waking, hunting, prizes, ports, saving |
| `src/game/adventure/render.ts` | Adventure's dress for the shared chart: lairs, beasts, rivals, targets, wake |
| `src/components/AdventureScreen.tsx` | HUD, port panel, bounty board, pause, help and the end-of-voyage reckoning |

---

## How the project is built

Two worlds, cleanly split: **React owns the menus, the engine owns the game.**

- The `Engine` (`src/game/engine.ts`) owns the simulation *and* the canvas: one `requestAnimationFrame`
  loop, fixed-step physics, pooled particles, and all combat rules.
- React renders the start screen, era carousel, hero-ship picker, pause/refit/game-over overlays and
  touch controls.
- They meet in two narrow places: the engine reports state changes through callbacks (`onScreen`,
  `onUpgrade`, `onGameOver`) and React polls it through explicit getters (`getInventory`,
  `getBoardCandidate`, `getGrapeshot`, `getEra`). No shared mutable state, no framework inside the loop.

| File | What it owns |
| --- | --- |
| `src/game/engine.ts` | The `Engine`: lifecycle, public API, world setup, waves, main loop |
| `src/game/engineCore/` | Engine layers, each extending the previous: `state` → `fx` (particles, camera) → `hud` → `worldRender` → `combat` (ballistics, fire, boarding, loot) → `ships` (physics, AI, natives, forts, settlements) → `weapons` (player guns) |
| `src/game/weapons.ts` | Armament table per era, projectile profiles, blast rule, era-renamed upgrades |
| `src/game/data.ts` · `shipDefs/` | 104 ship definitions (one file per sea/era in `shipDefs/`), the upgrade list, wave titles and fleet compositions |
| `src/game/rosters.ts` | Per-era enemy rosters, captains, boss hulls and their leaders |
| `src/game/worlds.ts` | 23 regions: water palettes, island themes, peoples, village names |
| `src/game/terrain/` · `render.ts` | Island and water painting, forts, ruins, pickups, vignettes |
| `src/game/sprites/` | Hull, deck, rigging and flag art, **baked once per hull and cached** |
| `src/game/eraArt/` | The era picker's title cards: per-era action scenes, coasts, weather, emblems and logo plates |
| `src/game/settlements.ts` | Peoples, pacts, patience, grievance and cooling rules |
| `src/game/boarding.ts` | Surrender chances and boarding outcomes (pure tables) |
| `src/game/splash/` | The studio card: the squirrel sprite and bitmap font (`pixels.ts`), its animation timeline and painter (`anim.ts`), the sting (`fanfare.ts`) |
| `src/game/audio.ts` · `music/` | Synthesised SFX, the cassette player, ABC notation, all songs |
| `src/game/difficulty.ts` | The five perils: every modifier that scales foes, forts, spawns and plunder |
| `src/game/storage.ts` · `input.ts` | `localStorage` scores/settings/era/difficulty, keyboard + touch input |
| `src/game/ships/` | Hero hulls: `era/` (flagships) and `heritage/` (one per culture) |
| `src/components/` | React overlays: start (sign-on, peril, era, hero ship), pause, refit, game over, touch UI |
| `src/components/EraCarousel.tsx` · `HeroShipPicker.tsx` | The two picker screens: the era chart, then the hero hull's portrait and scouting report |

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
- `tests/chart.test.ts` — the shared map: projection, continents, ports in bounds, lairs afloat, and a
  recording canvas proving Trade and Adventure paint the same coastline.
- `tests/adventure.test.ts` — lairs, tiers, wake and leash rules, gunnery arcs, contracts, refits and
  the prize payout, exercised on the real engine prototype.
- `tests/adventureVoyage.test.ts` — whole voyages sailed headlessly on a mocked canvas: making way,
  waking a lair, putting in at a port, clearing the chart for a victory, and resuming a saved voyage.

`npm run build` also type-checks the whole project (`tsc --noEmit`).

---

## Adding to the game

- **An era** — add a hero `ShipDef` (see `src/game/ships/heritage/`), register it in `ships/era/index.ts`
  with a region, and add entries to `ERA_WEAPONS`, `ERA_ARMAMENTS` and the music map.
- **A ship** — add a `ShipDef` to the matching file in `src/game/shipDefs/` and put it in an era roster in `rosters.ts`.
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
