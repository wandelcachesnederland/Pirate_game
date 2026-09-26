# Era Identities — one signature mechanic per era

> **Status: implemented.** `src/game/eraTraits.ts` holds the trait table, state and pure
> helpers; `src/game/engineCore/traits.ts` is the engine layer (between `EngineShips`
> and `EngineWeapons`); `tests/eraTraits.test.ts` covers defs, math and hook regressions.
>
> Controls: **F** with no prize alongside hails traders (Barbary, Hansa, China, Maya);
> **T** fires the era action (Ottoman oar-sprint, Chinese anchor, Japanese teppo volley). Goal: every era should change at least one
> **decision** the captain makes, not just the paint, the guns and the music.
> Each trait below is historically rooted, reuses an existing system where
> possible (wind, shallows, fire slicks, boarding, supplies, forts, waves),
> and is sized S / M / L for build cost.

## Design rules for all traits

1. **One verb or pressure per era.** No era gets two systems; depth comes from
   the interaction with the existing game (broadside angles, boarding greed,
   supply drain, island tempers).
2. **Telegraphed in-world.** Every trait has a HUD element or water/sky cue —
   tide clock, current streaks, lock tone, gale warning — never a hidden modifier.
3. **Counterplay both ways.** Where the trait helps the player it must also be
   usable (or at least legible) against them.
4. **Picker-visible.** Each trait gets one line on the era card and the
   shipyard report, so choosing an era means choosing its game.

---

## Age of Sail

### `golden` — Golden Age of Piracy (1710) — *False Colours & the Bounty Board*
- **History:** pirates flew a friendly flag until the last moment; the Royal
  Navy answered with bounties.
- **Rule:** hold your fire and sail slowly near merchants and they don't spook
  (false flag up). Your first broadside after raising the black deals bonus
  damage. Every navy ship sunk raises your **Bounty**: merchants sail fatter
  … and hunter waves get heavier.
- **Decision:** farm a high bounty for riches, or lie low and pick off strays?
- **Build:** M (proximity stealth state + bounty ladder + first-salvo bonus).

### `exploration` — Age of Exploration (1500) — *Uncharted Waters*
- **History:** sailing off the edge of the map; scurvy killed more than cannon.
- **Rule:** fog of war over the chart. Sail close to an island to **Chart it**
  (+gold, reef locations revealed). Uncharted reefs bite deep hulls. Scurvy:
  without fresh food (fruit islands, prizes) max crew slowly rots.
- **Decision:** explore for chart gold and safe water, or rush the waves?
- **Build:** M (fog layer + charting pings + reef damage + scurvy drain).

### `napoleonic` — Napoleonic Wars (1805) — *The Weather Gauge*
- **History:** everything was about being upwind of the enemy.
- **Rule:** the upwind ship in any duel shoots straighter and hits harder
  (visible gauge ribbon on the HUD wind arrow). Once per wave,
  **"England Expects"**: a signal hoist that buffs reload for 20s.
- **Decision:** tack for the gauge before opening fire; time the signal.
- **Build:** S (relative-bearing bonus + one signal button).

### `barbary` — Barbary War (1801) — *Tribute or War*
- **History:** the corsairs sold passes; Jefferson sent a squadron instead.
- **Rule:** press the hail key near an unalerted trader to **demand tribute**:
  gold with no fight, small chance she refuses and runs. Attacking a payer
  blackens your name (worse tribute, angrier gunboats).
- **Decision:** steady tribute income vs. the full prize — and your reputation.
- **Build:** M (hail interaction + reputation track).

### `viking` — Viking Age (900) — *Strandhögg: Beach & Raid*
- **History:** vikings beached anywhere and marched inland.
- **Rule:** deliberately beach on a wild/hostile shore: your crew goes raiding
  (gold + supplies tick up) while the ship lies helpless. War parties converge
  — shove off before they reach the beach.
- **Decision:** how greedy a raid before the locals arrive?
- **Build:** M (beach state + raid ticker + converging parties).

### `ironclad` — Ironclad Era (1862) — *Iron Angles*
- **History:** sloped armour shrugged off shot from ahead; mines and rams
  decided river fights.
- **Rule:** damage taken from ahead is halved (armour slope), full from the
  broadside — so ramming runs are safe and gun duels demand turning. Drifting
  contact mines seed the channels.
- **Decision:** bow-on charges vs. broadside exposure; mine-channel routing.
- **Build:** S (facing-based mitigation + mine entities).

### `hanse` — Hanseatic League (1360) — *Pfundgeld: Toll of the League*
- **History:** the Hansa taxed every keel through its waters.
- **Rule:** traders sail in escorted convoys. Hail the convoy leader to demand
  the **toll**: pay up or fight the whole convoy at once. Toll scales with wave.
- **Decision:** safe toll money, or a hard fight for the full convoy?
- **Build:** S (convoy grouping + hail choice; reuses tribute tech).

### `portugal` — Estado da Índia (1502) — *Monsoon & Feitoria*
- **History:** the Portuguese Empire ran on the monsoon timetable and stone forts.
- **Rule:** the wind **reverses every 3 waves** on a published monsoon calendar.
  Friendly feitoria forts slowly repair and resupply you in their radius.
- **Decision:** plan fights around the calendar; hug your forts when hurt.
- **Build:** S/M (wind calendar + fort aura).

### `armada` — Spanish Armada (1588) — *Gales & Fire Ships*
- **History:** "God blew, and they were scattered" — after the fireships of Gravelines.
- **Rule:** periodic **gales** push every ship downwind (dragging anchors,
  scattered formations). Unmanned fire ships drift with the gale — windward
  positioning turns them on their owners. The Spanish sail in crescent
  formation with the jackpot guarded in the middle.
- **Decision:** stay windward of drifting death; crack the crescent.
- **Build:** M (gale events + drifting hazards + formation spawn).

### `dutch` — Dutch Golden Age (1666) — *Shifting Sands of the Texel*
- **History:** Dutch pilots threaded sandbanks that wrecked deep English hulls.
- **Rule:** visible **sandbanks drift** between waves. Deep-draft enemies that
  blunder onto one run aground (slowed + grinding damage); your shallow Dutch
  hull skims over.
- **Decision:** lure deep hunters onto the banks; mind your own escape lanes.
- **Build:** M (drifting hazard zones + draft check).

---

## Steel Navies

### `ww1` — Great War at Sea (1916) — *U-Boats & Hydrophones*
- **History:** the unseen killer of the North Sea; destroyers hunted by ear.
- **Rule:** submerged U-boats show only a **periscope wake** until close. Your
  hydrophone pulses every few seconds and briefly reveals them. Kill with the
  ram bow or depth-charge rails (spikes fitting).
- **Decision:** watch the water, time the ping, run down the contact.
- **Build:** M/L (submerged state + reveal pulse + wake rendering).

### `ww2` — Second World War at Sea (1943) — *Night Actions*
- **History:** the Tokyo Express ran at night; battles were fought by star shell.
- **Rule:** waves alternate **day and night**. At night you see only nearby
  water plus whatever your star shells (auto flares over the enemy) light up.
  Night waves pay a danger bonus.
- **Decision:** close in blind for rich night prizes, or hold off till dawn?
- **Build:** M (lighting state + flare reveals + night pay modifier).

### `hormuz` — Tanker War (1988) — *Missile Lock*
- **History:** Exocets and Silkworms made the Gulf a lock-and-launch war.
- **Rule:** incoming missiles give a **lock tone + bearing** and 2s to break it:
  hard turn across the missile, or chaff if fitted. Neutral tankers crowd the
  strait — hitting one costs bounty and sours the navies.
- **Decision:** geometry under pressure; keep your fire clear of neutrals.
- **Build:** M (lock warning + break-lock check + neutral penalty).

### `predread` — Tsushima (1905) — *Cross the T*
- **History:** Tōgō crossed the Russian T and bracketed them at range.
- **Rule:** firing a full broadside into an enemy's **bow or stern rakes her**
  (big bonus). Holding fire on one target **brackets the range**: accuracy
  tightens the longer you stay on her; switching targets resets it.
- **Decision:** manoeuvre for the rake; commit to one victim or spread fire?
- **Build:** S (firing-geometry bonus + per-target accuracy ramp).

### `falklands` — Falklands War (1982) — *Air Raid Warning*
- **History:** Exocets arrived with minutes of warning; ships combed the tracks.
- **Rule:** raids announce with a **bearing arrow**: Exocets streak in from
  off-screen. Turn toward them (**comb the wake**) to slip past, or let chaff
  fittings seduce them. Civilian exclusion-zone traffic must not be hit.
- **Decision:** read the arrow, turn into danger, keep firing solutions.
- **Build:** M (off-screen raid events + comb-the-wake dodge).

### `somali` — Somali Pirates (2009) — *Hijack & Ransom*
- **History:** a hijacked VLCC was worth millions — if you could hold her.
- **Rule:** boarded merchants become **hostages, not instant loot**: the ransom
  ticks up every second you keep her, while navy pressure escalates. Cash out
  any time — or lose her (and the ransom) if she re-takes or sinks.
- **Decision:** the purest greed dial in the game: bank it or bleed it?
- **Build:** M (hostage state + ransom ticker + escalation).

---

## Heritage Seas — galleys & the ancient Mediterranean

### `roman` — First Punic War (260 BC) — *The Corvus*
- **History:** Rome turned sea fights into land fights with a spiked bridge.
- **Rule:** touching an enemy **drops the corvus automatically**: both ships
  lock together (slowed) and a boarding attempt begins at extended range. Rome
  doesn't sink you — it walks aboard.
- **Decision:** every contact is a boarding gambit; pick victims you can beat.
- **Build:** S/M (contact grapple + auto boarding hookup).

### `greek` — Persian Wars (480 BC) — *Diekplous in the Narrows*
- **History:** at Salamis the Greeks rowed through the Persian line and turned.
- **Rule:** the chart is cut by **narrow straits** where light triremes fly.
  Row clean through an enemy formation (**diekplous**) and the shock resets
  her reload and lifts her surrender chance.
- **Decision:** thread the line for shock, or stand off and shoot?
- **Build:** M (strait terrain + line-crossing detection).

### `macedon` — Macedon at Sea (306 BC) — *Siege Tower Afloat*
- **History:** Demetrius sailed the largest warships ever built — floating siege works.
- **Rule:** your Sixteen **bombards forts at double range** (siege catapults)
  and crushes small galleys by contact — but the enemy knows it and swarms you
  with fast light craft from every side.
- **Decision:** elephant vs. mosquitoes: keep turning, keep crushing, don't get stung to death.
- **Build:** S (bombard range + swarm-weighted roster + contact crush).

### `phoenicia` — Phoenician Seas (800 BC) — *The Purple Run*
- **History:** Tyre grew rich carrying everyone's cargo — purple dye paid for fleets.
- **Rule:** a **cargo hold**: embark goods at one friendly harbour, sell at
  another for wave-scaling profit. Fighting inside a partner's waters blackens
  the deal. Piracy vs. profit on every wave.
- **Decision:** run the trade lanes, or eat your own customers?
- **Build:** M (hold + buy/sell on harbour proximity + partner standing).

### `egypt` — Against the Sea Peoples (1178 BC) — *Pharaoh's Shore Archers*
- **History:** Ramesses III fought the first naval battle with archers on shore and ship together.
- **Rule:** friendly shores and forts fire **supporting archer volleys** at
  your enemies when you fight inside their reach. Reed beds hide small craft
  until you're nearly atop them — ambush water.
- **Decision:** drag the Sea Peoples under your archers; sweep the reeds first.
- **Build:** M (shore-support aura + concealment terrain).

### `byzantium` — Siege of Constantinople (717) — *The Chain & the Burning Sea*
- **History:** the Great Chain closed the Golden Horn; Greek fire burned the water itself.
- **Rule:** a **chain boom** funnels enemies through one gap — your kill zone.
  Greek-fire slicks **drift with the wind and merge** into spreading burns.
- **Decision:** herd the Caliph's fleet into the gap and set the sea alight.
- **Build:** M (barrier terrain + drifting/merging slicks).

---

## Heritage Seas — Asia

### `arab` — Monsoon Seas (1200) — *Ride the Monsoon*
- **History:** the whole Indian Ocean sailed on the monsoon's breath.
- **Rule:** a seasonal wind calendar (with the Portuguese system): **downwind
  sailing is 30% faster** for lateen rigs, and dhow traders only sail with the
  monsoon — their lanes are predictable enough to ambush.
- **Decision:** schedule ambushes on the monsoon lanes; never fight to windward.
- **Build:** S (wind calendar + downwind bonus + lane-routed traders).

### `chola` — Chola Across the Bay (1025) — *Across the Bay*
- **History:** a 2,000-mile expedition to Kadaram — logistics was the battle.
- **Rule:** **supply drain doubled** (far from home) — but temple-ship jackpots
  pay double. Waves alternate monsoon calm and storm.
- **Decision:** an expedition gamble: can your logistics survive your greed?
- **Build:** S (drain + jackpot multipliers + alternating weather).

### `chinese` — Ming Treasure Voyages (1405) — *Floating Fortress*
- **History:** Zheng He's baochuan were castles that happened to float.
- **Rule:** toggle **anchor stance**: stop dead to gain all-round fire and fast
  reload (a fortress), at the cost of all movement. Tribute ships from a dozen
  nations: **spare them for per-wave tribute**, or loot them once.
- **Decision:** when to plant and when to run; mercy income vs. one rich murder.
- **Build:** M (stance toggle + tribute choice).

### `japanese` — Sengoku Period (1575) — *Grapples & Teppo*
- **History:** Japanese sea fights ended locked together, decided by arquebus volleys.
- **Rule:** enemies throw **grapples** that slow and drag you; kill their crew
  or burst away to tear free. Your **teppo volley** (bow super-shot, long
  reload) rewards a head-on approach.
- **Decision:** break grapples fast or embrace the lock and out-shoot them.
- **Build:** M (grapple tethers + bow volley weapon).

### `korea` — Imjin War (1597) — *The Myeongnyang Tide*
- **History:** Yi Sun-sin beat 133 ships with 13 by fighting the tide itself.
- **Rule:** the strait current **reverses on a timer** (visible whirlpools).
  Your heavy turtle ship barely feels it; light Japanese hulls are **swept into
  rocks and your guns**. Lure, wait for the turn, watch them come apart.
- **Decision:** the whole battle is about where the enemy will be swept next.
- **Build:** M (timed reversing current + mass-based push + rock damage).

### `vietnam` — Bạch Đằng River (1288) — *The Stakes of Bạch Đằng*
- **History:** Ngô Quyền's heirs lured the Mongol fleet onto iron-tipped stakes at low tide.
- **Rule:** a **tide clock** cycles high/low. At low tide, hidden **stake
  barrages** are exposed: deep Mongol hulls lured over them are impaled
  (massive damage); your shallow junks float over at high tide.
- **Decision:** bait the deep water at high tide, spring the trap at low.
- **Build:** M (tide cycle + hidden-until-low hazards + draft check).

### `ottoman` — Kapudan Pasha (1538) — *Oar-Sprint & Freed Banks*
- **History:** galleys sprinted into the ram; Preveza freed a thousand Christian oarsmen.
- **Rule:** **sprint burst**: double speed for 4s, then exhausted oars (slow
  until recovered). Every galley you board **frees rowers who join your crew**.
- **Decision:** spend the sprint to ram or to escape; board for hands, not gold.
- **Build:** S (sprint/exhaust cooldown + crew-from-boarding).

### `lepanto` — Lepanto (1571) — *The Grand Melee*
- **History:** 400 galleys locked in the last great oar battle — a boarding brawl.
- **Rule:** **no boarding cooldown**: chain from prize to prize while the melee
  lasts, and every boarding frees oarsmen into your crew. The wave only ends
  when the water is clear.
- **Decision:** keep the chain going — momentum is survival.
- **Build:** S (cooldown removal + crew snowball + clear-to-end waves).

---

## Heritage Seas — the Pacific

### `maori` — Māori Musket Wars (1820) — *Utu (Vengeance)*
- **History:** utu demanded balance; every death named its avengers.
- **Rule:** sinking a rival waka incurs **Utu**: her kin spawn marked and
  harder. Killing marked avengers grants **Mana**: stacking crew buffs that
  decay — keep killing kin or lose the fire.
- **Decision:** feed the feud for power, or break the cycle and breathe?
- **Build:** M (kin-marking + decaying stack buff).

### `hawaii` — Hawaiian Unification (1795) — *Unify the Islands*
- **History:** Kamehameha brought every island under one rule.
- **Rule:** each island starts independent: defeat its war canoes to
  **vassalize it** for per-wave tribute (supplies + gold). Unify them all for a
  jackpot flourish. Attacking a vassal breaks it free — and angers all.
- **Decision:** a conquest layer over the waves: which island next, and can you hold them?
- **Build:** M (island allegiance + tribute ticks + unity bonus).

### `inca` — Inca Pacific Voyages (1465) — *The Humboldt & Spondylus Beds*
- **History:** balsa rafts rode the Humboldt current; spondylus shell was worth more than gold.
- **Rule:** visible **current lanes** push every ship along them — ride them
  for free speed, fight across them at your peril. **Spondylus beds**: linger
  over one to dive (gold ticks up) while slowed and exposed.
- **Decision:** current-riding routes; dive greed vs. helplessness.
- **Build:** M (current vectors + harvest zones).

---

## Heritage Seas — the Americas

### `maya` — Maya First Contact (1517) — *Reef Guerrilla*
- **History:** Spanish hulls feared the reef; canoes owned the shallows.
- **Rule:** a coral maze: deep Spanish hulls take **reef damage in the
  shallows**, your canoes pass free. First Contact: the strangers' first wave
  offers **one trade** (free supplies + gold) before the war begins.
- **Decision:** fight from the reef you know; take the strangers' gift first.
- **Build:** S/M (reef damage by draft + one-time trade event).

### `aztec` — Fall of Tenochtitlan (1521) — *Causeways of Texcoco*
- **History:** Cortés's brigantines ruled deep water; canoes ruled the canals.
- **Rule:** the shallow lake is a maze of **causeway walls with removable
  bridge gaps**: brigantines are slow and ground-prone, canoes slip through
  gaps they can't follow. Trap them in dead water.
- **Decision:** maze warfare — be where deep hulls can't go.
- **Build:** M (wall/gap terrain + draft-based grounding).

---

## Suggested build order (value per effort)

**Phase 1 — cheap duels & choices (mostly S):** Weather Gauge (napoleonic),
Cross the T (predread), Iron Angles (ironclad), Monsoon calendars (arab,
portugal), Tolls (hanse), Grand Melee (lepanto), Freed Banks (ottoman),
Siege Tower (macedon), Across the Bay (chola), Reef Guerrilla first half (maya).

**Phase 2 — water as a weapon (terrain/current systems, M):** Stakes & Tide
(vietnam), Myeongnyang Tide (korea), Sandbanks (dutch), Humboldt & diving
(inca), Chain & Burning Sea (byzantium), Narrows & Diekplous (greek),
Causeways (aztec), Gales & Crescents (armada), Shore Archers & reeds (egypt).

**Phase 3 — detection, stealth & economy (new verbs, M/L):** False Colours &
Bounty (golden), Uncharted Waters (exploration), Tribute (barbary), Strandhögg
(viking), U-Boats (ww1), Night Actions (ww2), Missile Lock (hormuz), Air Raids
(falklands), Purple Run (phoenicia), Floating Fortress + tribute (chinese),
Grapples & Teppo (japanese), Corvus (roman), Utu (maori), Unification
(hawaii), Hijack & Ransom (somali).

## Implementation sketch (for when we build)

- New table `ERA_TRAITS: Record<EraId, EraTrait>` in `src/game/eraTraits.ts`:
  id, name, HUD widget kind, tuning numbers, hint text.
- Engine hooks (small, guarded by trait id): wind factor, damage in/out,
  boarding attempt, wave spawn, supply tick, terrain collision, visibility.
- One shared "water hazard" + "current field" + "hail interaction" framework
  so Phase 2/3 traits reuse the same machinery.
- Tests: one headless regression per trait (like the existing era tests).
- Picker: one trait line per era card + shipyard report entry.
