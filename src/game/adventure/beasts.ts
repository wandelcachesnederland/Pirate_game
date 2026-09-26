// The perils of the Adventure chart.
//
// Every mode that sails the chart shares one map, and Adventure peoples that
// map: a fixed set of lairs, each holding either a sea beast or a named rival,
// placed by longitude and latitude exactly like the ports are. The lair never
// moves; the thing in it does, hunting you when you sail close and slinking
// home when you run for open water.
//
// Nothing here touches the DOM, so the whole gallery can be reasoned about (and
// tested) without a canvas.

import { project, nudgeToSea, isLand, WORLD_W, WORLD_H } from '../chart/world';
import { PORTS_PROJ } from '../chart/ports';

export type FoeKind = 'beast' | 'rival';

/** What a lair holds before stats are applied. */
export interface FoeSeed {
  id: string;
  name: string;
  /** Epithet under the name — 'Butcher of the Bahama Bank'. */
  title: string;
  kind: FoeKind;
  /** 1 (a first prize) to 4 (the thing songs are written about). */
  tier: number;
  lon: number;
  lat: number;
  /** Spoken when it stirs. */
  tale: string;
}

export interface FoeDef extends FoeSeed {
  /** Projected lair position in world space. */
  x: number;
  y: number;
  hp: number;
  damage: number;
  range: number;
  reload: number;
  speed: number;
  turn: number;
  renown: number;
  salvage: number;
  color: string;
  size: number;
}

const BEAST_COLOR = '#4f9f7a';
const RIVAL_COLOR = '#b3453a';

const SEEDS: FoeSeed[] = [
  // ── Tier 1 — the first blood
  {
    id: 'gulper',
    name: 'The Brine Gulper',
    title: 'Glutton of the Sargasso',
    kind: 'beast',
    tier: 1,
    lon: -52,
    lat: 27,
    tale: 'The weed parts and something long and pale rises to look at you.',
  },
  {
    id: 'vane',
    name: 'Commodore Asher Vane',
    title: 'Butcher of the Bahama Bank',
    kind: 'rival',
    tier: 1,
    lon: -28,
    lat: 37,
    tale:
      'A black flag with a red chevron breaks out off the Azores. Run out of the Caribbean by the Navy, Vane has been waiting for a ship like yours.',
  },

  // ── Tier 2 — the sea lanes bite back
  {
    id: 'serpent',
    name: 'The Ryūjin Serpent',
    title: 'Coil of the Black Current',
    kind: 'beast',
    tier: 2,
    lon: 160,
    lat: 25,
    tale: 'Green coils unwind under the keel, longer than the ship by twice.',
  },
  {
    id: 'sarr',
    name: 'Captain Fulani Sarr',
    title: 'Wolf of the Guinea Coast',
    kind: 'rival',
    tier: 2,
    lon: -21,
    lat: 3,
    tale: 'Sarr runs out his guns without a word. He takes hulls, not cargo.',
  },
  {
    id: 'bonnet',
    name: 'Black Bonnet Anne',
    title: 'Ghost of the Windward Isles',
    kind: 'rival',
    tier: 2,
    lon: -44,
    lat: 5,
    tale: 'She comes about without wind. The crew will not look at her.',
  },

  // ── Tier 3 — the deep water
  {
    id: 'kraken',
    name: 'The Málstrom Kraken',
    title: 'Terror of the Norwegian Sea',
    kind: 'beast',
    tier: 3,
    lon: 3,
    lat: 68,
    tale: 'The water goes still. Then an arm as thick as the mainmast reaches aboard.',
  },
  {
    id: 'leviathan',
    name: 'The Cape Leviathan',
    title: 'Breaker of the Roaring Forties',
    kind: 'beast',
    tier: 3,
    lon: 19,
    lat: -41,
    tale: 'It does not surface so much as the sea simply stands up.',
  },
  {
    id: 'rooke',
    name: 'Captain Cordelia Rooke',
    title: 'Queen of the Empty Ocean',
    kind: 'rival',
    tier: 3,
    lon: 82,
    lat: -38,
    tale: 'Rooke has sailed three oceans to find you. She means to finish it here.',
  },
  {
    id: 'takeda',
    name: 'Admiral Takeda Kageyuki',
    title: 'Tiger of the Inland Sea',
    kind: 'rival',
    tier: 3,
    lon: 131,
    lat: 31,
    tale: 'Signal drums beat across the water. The Tiger has come out to meet you.',
  },

  // ── Tier 4 — the last name on the chart
  {
    id: 'sable',
    name: 'Admiral Sable',
    title: 'The Dread Commodore',
    kind: 'rival',
    tier: 4,
    lon: -27,
    lat: -26,
    tale: 'A flagship with no colours at all. Every tale you have heard ends here.',
  },
];

export const TIERS = [1, 2, 3, 4] as const;

/** Base combat numbers per tier, before beast/rival character is applied. */
const TIER_BASE: Record<number, { hp: number; damage: number; range: number; reload: number; speed: number; turn: number; renown: number; salvage: number; size: number }> = {
  1: { hp: 110, damage: 6, range: 74, reload: 1.7, speed: 40, turn: 1.9, renown: 60, salvage: 240, size: 8 },
  2: { hp: 175, damage: 8, range: 80, reload: 1.5, speed: 44, turn: 2.1, renown: 120, salvage: 430, size: 9.5 },
  3: { hp: 265, damage: 10, range: 86, reload: 1.3, speed: 47, turn: 2.3, renown: 210, salvage: 780, size: 11 },
  4: { hp: 420, damage: 13, range: 94, reload: 1.1, speed: 51, turn: 2.5, renown: 420, salvage: 1400, size: 13 },
};

/**
 * Turn a seed into full stats. Beasts are tougher and faster but fight at knife
 * range; rivals stand off and throw shot.
 */
export function statsFor(seed: FoeSeed): Omit<FoeDef, keyof FoeSeed> {
  const b = TIER_BASE[seed.tier] ?? TIER_BASE[1];
  const beast = seed.kind === 'beast';
  return {
    x: 0,
    y: 0,
    hp: Math.round(b.hp * (beast ? 1.2 : 1)),
    damage: Math.round(b.damage * (beast ? 1.5 : 1) * 10) / 10,
    range: beast ? 42 : b.range,
    reload: beast ? 1.15 : b.reload,
    speed: b.speed + (beast ? 9 : 0),
    turn: b.turn,
    renown: b.renown,
    salvage: b.salvage,
    color: beast ? BEAST_COLOR : RIVAL_COLOR,
    size: b.size * (beast ? 1.15 : 1),
  };
}

/** Lairs are nudged to open water so nothing lairs inland. */
export const FOES: FoeDef[] = SEEDS.map((seed) => {
  const stats = statsFor(seed);
  const [px, py] = project(seed.lon, seed.lat);
  const [x, y] = nudgeToSea(px, py);
  return { ...seed, ...stats, x, y };
});

export const FOE_BY_ID: Record<string, FoeDef> = Object.fromEntries(FOES.map((f) => [f.id, f]));

export function foeById(id: string): FoeDef | undefined {
  return FOE_BY_ID[id];
}

export function foesOfTier(tier: number): FoeDef[] {
  return FOES.filter((f) => f.tier === tier);
}

export function nearestFoe(x: number, y: number, pool: FoeDef[] = FOES): { foe: FoeDef; d: number } | null {
  let best: FoeDef | null = null;
  let bestD = Infinity;
  for (const f of pool) {
    const d = Math.hypot(f.x - x, f.y - y);
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best ? { foe: best, d: bestD } : null;
}

/** Defeated foes are remembered by id so a saved voyage can restore the chart. */
export function liveFoes(defeated: Iterable<string>): FoeDef[] {
  const dead = new Set(defeated);
  return FOES.filter((f) => !dead.has(f.id));
}

// ----------------------------------------------------------------- contracts

export interface Contract {
  foeId: string;
  /** Extra renown for a contract honourably finished. */
  renown: number;
  /** Extra salvage paid by the harbourmaster. */
  salvage: number;
}

export const CONTRACT_RENOWN = 40;
export const CONTRACT_SALVAGE = 150;

/**
 * The bounty board: the harbourmaster offers the trouble closest to his own
 * port that is still alive. Returns null once the chart is clear.
 */
export function contractOffer(
  portId: string | null,
  defeated: Iterable<string>,
  fallback?: { x: number; y: number },
): Contract | null {
  const alive = liveFoes(defeated);
  if (alive.length === 0) return null;
  const port = PORTS_PROJ.find((p) => p.id === portId);
  const from = port ? { x: port.x, y: port.y } : fallback;
  const near = from ? nearestFoe(from.x, from.y, alive) : null;
  const foe = near?.foe ?? alive[0];
  return {
    foeId: foe.id,
    renown: CONTRACT_RENOWN + foe.tier * 20,
    salvage: CONTRACT_SALVAGE + foe.tier * 90,
  };
}

// ----------------------------------------------------------------- refits

export type RefitId = 'guns' | 'hull' | 'gunners' | 'copper';

export interface RefitDef {
  id: RefitId;
  name: string;
  desc: string;
  /** Salvage cost of the first purchase; each later purchase costs more. */
  base: number;
  /** Hard ceiling: how many times it can be taken. */
  max: number;
}

export const REFITS: RefitDef[] = [
  { id: 'guns', name: 'Heavier Guns', desc: '+1 shot damage', base: 220, max: 6 },
  { id: 'hull', name: 'Reinforce Hull', desc: '+25 hull', base: 260, max: 6 },
  { id: 'gunners', name: 'Drill the Gunners', desc: 'faster reload', base: 300, max: 4 },
  { id: 'copper', name: 'Copper Sheathing', desc: '+4 speed', base: 240, max: 4 },
];

export const REFIT_BY_ID: Record<RefitId, RefitDef> = Object.fromEntries(
  REFITS.map((r) => [r.id, r]),
) as Record<RefitId, RefitDef>;

/** Cost of the next purchase of a refit, or null when maxed out. */
export function refitCost(id: RefitId, level: number): number | null {
  const def = REFIT_BY_ID[id];
  if (!def || level >= def.max) return null;
  return Math.round(def.base * (1 + level * 0.75));
}

/** Salvage to caulk the hull back to full: 2 per point of damage. */
export function repairCost(missing: number): number {
  return Math.ceil(Math.max(0, missing) * 2);
}

// ----------------------------------------------------------------- renown

export const RENOWN_RANKS: { at: number; rank: string }[] = [
  { at: 0, rank: 'Unknown Hand' },
  { at: 120, rank: 'Freebooter' },
  { at: 320, rank: 'Sea Rover' },
  { at: 620, rank: 'Dread Corsair' },
  { at: 1000, rank: 'Scourge of the Deep' },
  { at: 1500, rank: 'Legend of the Chart' },
];

export function rankFor(renown: number): string {
  let rank = RENOWN_RANKS[0].rank;
  for (const r of RENOWN_RANKS) if (renown >= r.at) rank = r.rank;
  return rank;
}

/**
 * How close you must sail before a lair stirs — far enough that the home port
 * is not already under a beast's nose, close enough to feel like blundering in.
 */
export const WAKE_RANGE = 120;
/** How far a woken foe will chase before it turns for home. */
export const LEASH_RANGE = 380;

/** Guard for tests and saves: every lair sits inside the chart. */
export function lairsInBounds(): boolean {
  return FOES.every((f) => f.x >= 0 && f.x <= WORLD_W && f.y >= 0 && f.y <= WORLD_H && !isLand(f.x, f.y));
}
