# Combat and island relations

## Prisoners

Crew detained after boarding are **prisoners** in boarding messages, the ship's
stores, inventory snapshots and game-over statistics. Recruitment and prisoner
counts work as before. High scores/settings never stored this count, so no save
migration is needed.

## Weapons by era

`src/game/weapons.ts` is the central technology table. Before naval cannon are
available, broadsides use archery and pulley-drawn bolt launchers. The same rule
applies to player ships, enemies, bosses, and island forts. Arrows and bolts are
non-explosive projectiles with their own rendering and bowstring sounds; early
hulls cannot use the exploding-mortar path. Firing controls and upgrade balance
are unchanged.

Mechanical eras: Viking, Roman, Greek, Macedonian, Egyptian, Byzantine, Chola,
Monsoon Seas (1200), Bạch Đằng (1288), and Inca Pacific Voyages. This is a gameplay
table of **naval cannon availability**, not a universal date for the invention of
gunpowder. Inca waters also predate local access to cannon. Other playable eras
retain gunpowder weapons.

Early-era upgrades use matching names and effects: Deck Archers, Chase Ballistas,
Arrow Storm, Rigging Bolts, stronger bows/pulleys, and additional bow stations.
The era picker shows the technology before setting sail.

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
