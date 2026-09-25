# Combat and island relations

## Prisoners

Crew detained after boarding are **prisoners** in boarding messages, the ship's
stores, inventory snapshots and game-over statistics. Recruitment and prisoner
counts work as before. High scores/settings never stored this count, so no save
migration is needed.

## Weapons by era

`src/game/weapons.ts` is the central technology table, and it has two layers:
`ERA_WEAPONS` says whether a sea has naval cannon at all, and `ERA_ARMAMENTS`
says what the ships of a sea without cannon actually throw.

**Pre-gunpowder seas carry no shot that goes off on impact.** Every broadside,
chaser, deck station, fort salvo and reinforcement in those eras comes from the
mechanical armament table:

| Sea | Heavy engines (broadside) | Light stations |
| --- | --- | --- |
| Viking Age | winch-drawn bolts | arrows |
| Roman | ballista stones | arrows |
| Greek | oxybeles bolts | arrows |
| Macedonian | torsion stones | bolts |
| Egyptian | winch-drawn bolts | arrows |
| Arab (Monsoon Seas) | naphtha fire (Greek fire) | arrows |
| Byzantine | Greek fire siphons | fire arrows |
| Chola | winch-drawn bolts | arrows |
| Bạch Đằng (1288) | winch-drawn bolts | fire arrows |
| Inca Pacific | sling stones | atlatl darts |

A broadside mixes the two columns: the after stations throw the light shot and
the forward ones the heavy engines. Bows, winches and slings are heard as a
bowstring snap; a fire siphon gets its own rasping roar. `SHOT_PROFILE` in the
same file holds what each shot does to a hull — damage, whether it sets a fire,
how long that fire burns, and whether it throws sparks (only powder-era shot
does).

### Fire is the killer where there is no powder

- **Fire arrows** light a target about half the time; a **Greek-fire siphon
  always does**, for a little less direct damage. A burning hull loses hull
  points every tick for several seconds (roughly 4% of its own maximum from a
  fire arrow, 8% from a siphon), and the hit itself drags at the rigging.
  Fire can jump to a ship lying alongside.
- The player's own crew turns out with buckets and wet canvas: fire aboard the
  player's ship is shorter and milder than fire in an enemy's.
- **Greek fire that misses does not go out.** It leaves a slick of burning
  naphtha on the water for a few seconds; any ship of the other side that
  crosses it is burned and can be set alight. Fireships, burning wrecks and
  slicks are all drawn with their own glow.
- The all-round close-range volley is an **Arrow Storm** in the bow-and-bolt
  seas and a **Fire Pot Volley** where the siphons are; both replace Grape &
  Canister.

### Nothing explodes before gunpowder

- `blastKindFor(era)` is the single rule: `powder` for the gunpowder seas,
  `fire` for every other. A sunk hull, a fire ship reaching its target, a fort's
  walls coming down and the player's own last moments all read from it.
- In a `fire` sea a wreck goes up in a sheet of flame and smoke with its own
  whoosh-and-crackle sound; a fort collapses in dust and rubble (no magazine to
  go up); a fire ship is a bonfire, not a bomb. The text says *ABLAZE!*, never
  *KABOOM!*.
- Damage numbers are unchanged by this: only the effects and the sounds differ,
  plus the new burning damage from incendiaries.

Mechanical eras: Viking, Roman, Greek, Macedonian, Egyptian, Byzantine, Arab
(Monsoon Seas), Chola, Bạch Đằng (1288), and Inca Pacific Voyages. This is a
gameplay table of **naval cannon availability**, not a universal date for the
invention of gunpowder. Inca waters also predate local access to cannon. Other
playable eras retain gunpowder weapons.

Early-era upgrades use matching names and effects: Deck Archers, Chase
Ballistas, Arrow Storm, Rigging Bolts, stronger bows/pulleys, and additional bow
stations. In the fire seas they read as Deck Fire Pots, Bow Siphons, Fire Pot
Volley and Thicker Naphtha. The era picker shows the armament before setting
sail.

## New eras: steel navies and the Barbary shore

Four later eras sail in their own seas, each with era-authentic ships, weapons
and music. All four count as gunpowder eras in the technology table.

- **Barbary War (1801)** — the Barbary Coast. You sail the schooner USS
  Enterprise against Tripolitan xebecs, polacres and gunboats; the Bashaw's
  Meshuda leads their fleet. Prize ships and tribute convoys to take.
  The band plays *Hail, Columbia*.
- **Great War at Sea (1916)** — the Dogger Bank. You command HMS Havoc of the
  Dover patrol against Kaiserliche Marine torpedo boats, U-boats, raiders and a
  dreadnought; munitions ships are the richest prizes. The band plays *It's a
  Long Way to Tipperary* and *Mademoiselle from Armentières*.
- **Second World War at Sea (1943)** — the Solomons. You command USS Kestrel
  against Tokyo Express destroyers, escorts, submarines and a super battleship;
  marus and troop transports are the prizes. The band plays the Navy Hymn and
  *Colonel Bogey March*.
- **Tanker War (1988)** — the Strait of Hormuz. You command the Kaman-class
  fast attack craft IRIS Tir against US Navy patrol boats, guided-missile
  destroyers and a frigate; laden tankers and a supertanker are the prizes.
  The band plays *Tangeh-ye Hormoz*.

Steel eras (Great War, Second World War, Tanker War, and the Ironclads) burn
coal or oil: the wind means nothing to them, their HUD reads STEAM, and they
sail without canvas. Tanker War destroyers and the IRIS Tir fire guided
missiles instead of shot: fast, hard-hitting, non-dodgeable once launched.
The Second World War battleship lobs arcing shells with a dodgeable landing
marker. Mechanical eras still see no ship explosions anywhere: hulls burn and
go down by fire, not by magazine (see *Nothing explodes before gunpowder*).

## Peoples and alliances

Each new chart distributes inhabited islands among up to six procedural peoples.
Where at least four islands are inhabited, multiple islands share each people
and two distinct peoples form the **Tide Pact**. Larger charts also have peoples
outside that pact. Group labels are drawn from local village names; they do not
assign a temperament to any real-world ethnicity. Wild islands have no politics.

- Local patience still determines when an offence starts a fight.
- Hitting, sinking, or capturing village boats, and striking the island itself,
  can provoke its inhabitants. Very forgiving villages retain their existing
  exception for boat grievances.
- Once an island is provoked into hostility, all islands of its people and all
  peoples in its pact become hostile, regardless of their individual patience.
- Unrelated islands are unaffected. Further accepted offences refresh the bloc's
  hostility. Initial hostility alone does not summon allies until provoked.
- Each hostile island independently launches a war party when approached. A
  party from one beach cannot block another island's response. Forts join in too.
- As before, tempers cool when left alone (roughly 65 seconds after a network
  grievance). Naturally hostile villages never stand down. Existing war parties
  return home when their village stands down.
- On-island labels show village, people, alliance and current hostility. A
  notification announces when other islands join the fight.

## Verification

Run `npm test` for rules and headless engine regressions (including all eras,
weapon upgrades, island solidarity, independent defenders, forts, and prisoners).
Run `npm run build` for TypeScript checking and the production bundle.
