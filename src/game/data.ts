import type { EraId, ShipDef, ShipKind, UpgradeDef } from './types';
import { ERA_ROSTERS, SAIL_ROSTER } from './rosters';
import { SAIL_DEFS } from './shipDefs/sail';
import { SMALL_CRAFT_DEFS } from './shipDefs/smallCraft';
import { ANCIENT_DEFS } from './shipDefs/ancient';
import { MEDITERRANEAN_DEFS } from './shipDefs/mediterranean';
import { ARABIA_DEFS } from './shipDefs/arabia';
import { ASIA_DEFS } from './shipDefs/asia';
import { PACIFIC_DEFS } from './shipDefs/pacific';
import { AMERICAS_DEFS } from './shipDefs/americas';
import { MODERN_DEFS } from './shipDefs/modern';

/**
 * Every ship in the game, keyed by kind. The definitions live per sea/era in
 * `./shipDefs/*`; the `Record` annotation guarantees every `ShipKind` is covered.
 */
export const SHIP_DEFS: Record<ShipKind, ShipDef> = {
  ...SAIL_DEFS,
  ...SMALL_CRAFT_DEFS,
  ...ANCIENT_DEFS,
  ...MEDITERRANEAN_DEFS,
  ...ARABIA_DEFS,
  ...ASIA_DEFS,
  ...PACIFIC_DEFS,
  ...AMERICAS_DEFS,
  ...MODERN_DEFS,
};

export const UPGRADES: UpgradeDef[] = [
  { id: 'cannons', name: 'Extra Cannons', desc: '+1 gun on each broadside', max: 4 },
  { id: 'reload', name: 'Veteran Gun Crew', desc: 'Reload 15% faster', max: 5 },
  { id: 'damage', name: 'Heavy Shot', desc: '+25% cannonball damage', max: 5 },
  { id: 'hull', name: 'Oak Planking', desc: '+30 max hull & full repair', max: 5 },
  { id: 'sails', name: 'Silk Sails', desc: '+10% top speed', max: 4 },
  { id: 'rudder', name: 'Balanced Rudder', desc: '+18% turning speed', max: 3 },
  { id: 'range', name: 'Long Nines', desc: '+18% cannon range & velocity', max: 3 },
  { id: 'magnet', name: 'Greedy Parrot', desc: 'Grab loot from much further away', max: 3 },
  { id: 'carpenter', name: "Ship's Carpenter", desc: 'Repair 1.5 hull every second', max: 3 },
  { id: 'swivel', name: 'Swivel Guns', desc: 'Deck guns auto-fire at close foes', max: 3 },
  { id: 'chain', name: 'Chain Shot', desc: 'Your hits slow enemy ships', max: 1 },
  {
    id: 'grapeshot',
    name: 'Grape & Canister',
    desc: 'R: a point-blank blast all round — death to open boats',
    max: 3,
  },
  { id: 'chaser', name: 'Chase Guns', desc: 'Bow & stern guns fire on their own — rake your pursuers', max: 3 },
];

export function waveTitle(n: number): string {
  return waveTitleFor('golden', n);
}

export function waveTitleFor(era: EraId, n: number): string {
  const r = ERA_ROSTERS[era] ?? SAIL_ROSTER;
  if (n >= 1 && n <= 5) return r.titles[n - 1];
  if (n % 5 === 0) return r.bossTitle;
  return r.lines[n % r.lines.length];
}

export function waveComposition(n: number): ShipKind[] {
  return waveCompositionFor('golden', n);
}

export function waveCompositionFor(era: EraId, n: number, budgetMul = 1): ShipKind[] {
  const r = ERA_ROSTERS[era] ?? SAIL_ROSTER;
  if (n >= 1 && n <= 5) return [...r.early[n - 1]];
  const list: ShipKind[] = [];
  if (n % 5 === 0) {
    const bosses = Math.min(3, Math.floor(n / 5));
    for (let i = 0; i < bosses; i++) list.push(r.boss);
    list.push(r.jackpot);
  }
  list.push(r.trader);
  let budget = (6 + (n - 5) * 1.7) * Math.max(0, budgetMul);
  const pool = r.pool.filter((p) => n >= (p.minWave ?? 0) && !(n % 5 === 0 && p.noBossWave));
  if (pool.length === 0) return list;
  const totalW = pool.reduce((a, p) => a + p.weight, 0);
  let guard = 0;
  while (budget > 0 && guard++ < 60) {
    let x = Math.random() * totalW;
    let pick = pool[0];
    for (const p of pool) {
      x -= p.weight;
      if (x <= 0) {
        pick = p;
        break;
      }
    }
    list.push(pick.kind);
    budget -= pick.cost;
  }
  return list;
}
