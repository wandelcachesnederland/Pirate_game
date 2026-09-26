// Era traits: the one signature gameplay mechanic each age sails with.
// See `docs/era-identities.md` for the full design. This module is pure data
// plus testable math — the engine behaviour lives in `engineCore/traits.ts`.
import type { EraId, ShipDef, ShipKind } from './types';
import { angDiff } from './math';

export interface EraTraitDef {
  id: EraId;
  /** Short name shown on the HUD and the picker. */
  name: string;
  /** One line for the era card / shipyard report. */
  pitch: string;
  /** One line of orders shown when the voyage begins. */
  hint: string;
}

export const ERA_TRAITS: Record<EraId, EraTraitDef> = {
  golden: {
    id: 'golden', name: 'False Colours & Bounty',
    pitch: 'Fly false colours until the first shot — your bounty fattens every prize.',
    hint: 'Hold fire to stay unseen; sink navy hulls to raise your bounty.',
  },
  exploration: {
    id: 'exploration', name: 'Uncharted Waters',
    pitch: 'Fog hides the chart — sail to each island to chart it for gold.',
    hint: 'Chart islands for gold, and keep fruit in the holds against scurvy.',
  },
  napoleonic: {
    id: 'napoleonic', name: 'The Weather Gauge',
    pitch: 'The upwind ship shoots harder — tack for the gauge, then signal.',
    hint: 'Fight from upwind for +25% shot; a signal buffs every wave.',
  },
  barbary: {
    id: 'barbary', name: 'Tribute or War',
    pitch: 'Hail traders (F) to demand tribute — gold with no fight.',
    hint: 'Press F near a trader to demand tribute. Payers you spare pay again.',
  },
  viking: {
    id: 'viking', name: 'Strandhögg',
    pitch: 'Beach on a wild shore to raid it — shove off before the war party.',
    hint: 'Drift slow onto a shore to raid; press sail (W) to shove off.',
  },
  ironclad: {
    id: 'ironclad', name: 'Iron Angles',
    pitch: 'Sloped armour shrugs off shot from ahead; mines drift the channels.',
    hint: 'Charge bow-on: half damage from ahead. Mind the drifting mines.',
  },
  ww1: {
    id: 'ww1', name: 'U-Boats & Hydrophones',
    pitch: 'U-boats run submerged — the hydrophone ping finds them; ram them.',
    hint: 'Watch for the ping: revealed boats surface to attack. Ram them.',
  },
  ww2: {
    id: 'ww2', name: 'Night Actions',
    pitch: 'Every even wave is fought at night by star shell — for danger pay.',
    hint: 'At night the enemy shoots half as far. Close in and earn the bonus.',
  },
  hormuz: {
    id: 'hormuz', name: 'Missile Lock',
    pitch: 'Incoming missiles shriek a lock tone — turn hard to break the lock.',
    hint: 'LOCK tone? Turn hard across the missile. Spare the neutral tankers.',
  },
  roman: {
    id: 'roman', name: 'The Corvus',
    pitch: 'Touch an enemy and the spiked bridge drops — board her at once.',
    hint: 'Ram alongside: grappled foes slow, and prizes board themselves.',
  },
  greek: {
    id: 'greek', name: 'Diekplous',
    pitch: 'Row clean through the enemy line to shock her crew senseless.',
    hint: 'Pass fast along an enemy hull side-to-side to shock her reload.',
  },
  arab: {
    id: 'arab', name: 'Ride the Monsoon',
    pitch: 'The monsoon reverses on a calendar — lateen hulls fly downwind.',
    hint: 'Sail with the monsoon (+speed); ambush the downwind trade lanes.',
  },
  chinese: {
    id: 'chinese', name: 'Floating Fortress',
    pitch: 'Anchor (T or bare poles) into a fortress — or hail tribute ships.',
    hint: 'T: anchor for +damage. F near a trader: tribute pact over loot.',
  },
  japanese: {
    id: 'japanese', name: 'Grapples & Teppo',
    pitch: 'Foes grapple and drag you — answer with the teppo bow volley (T).',
    hint: 'T: teppo volley ahead. Kill grapplers fast or be dragged down.',
  },
  maori: {
    id: 'maori', name: 'Utu',
    pitch: 'Every sinking names avengers — kill the marked to stack Mana.',
    hint: 'Marked kin hunt you; killing them stacks Mana (damage) — keep feeding it.',
  },
  hawaii: {
    id: 'hawaii', name: 'Unify the Islands',
    pitch: 'Beat each island’s canoes to vassalize it for per-wave tribute.',
    hint: 'Sink 3 boats of one island to vassalize it. Unify them all.',
  },
  macedon: {
    id: 'macedon', name: 'Siege Tower Afloat',
    pitch: 'Siege catapults outrange everything — but the mosquitoes swarm.',
    hint: 'Your range is vast; small fry die on your hull. Keep turning.',
  },
  maya: {
    id: 'maya', name: 'Reef Guerrilla',
    pitch: 'Spanish keels bleed on the reef; your canoes pass free.',
    hint: 'Fight inside the reef ring. Hail the first stranger for a gift.',
  },
  inca: {
    id: 'inca', name: 'Humboldt & Spondylus',
    pitch: 'Ride the current lanes; dive the shell beds for gold.',
    hint: 'Currents push all hulls. Linger slow over pink beds to dive.',
  },
  lepanto: {
    id: 'lepanto', name: 'The Grand Melee',
    pitch: 'No end to boarding in the melee — chain prize to prize.',
    hint: 'Boarding reach is long; every prize rows freed men to your crew.',
  },
  korea: {
    id: 'korea', name: 'The Myeongnyang Tide',
    pitch: 'The strait current reverses — your turtle ship barely feels it.',
    hint: 'Lure light foes into the tide; it sweeps them onto rocks and guns.',
  },
  byzantium: {
    id: 'byzantium', name: 'Chain & Burning Sea',
    pitch: 'The chain funnels the foe to one gap; Greek fire drifts and spreads.',
    hint: 'Hold the chain gap; your slicks drift with the wind and linger.',
  },
  egypt: {
    id: 'egypt', name: 'Pharaoh’s Shore Archers',
    pitch: 'Friendly shores loose volleys for you; reeds hide ambushers.',
    hint: 'Fight near friendly shores for archer support. Sweep the reeds.',
  },
  chola: {
    id: 'chola', name: 'Across the Bay',
    pitch: 'Far from home: double supply drain, double temple gold, monsoon storms.',
    hint: 'Stores burn twice as fast — but jackpots pay twice as much.',
  },
  vietnam: {
    id: 'vietnam', name: 'Stakes of Bạch Đằng',
    pitch: 'At low tide the stake barrages bare their teeth for deep keels.',
    hint: 'Watch the tide clock: bait deep hulls over the stakes at LOW tide.',
  },
  aztec: {
    id: 'aztec', name: 'Causeways of Texcoco',
    pitch: 'A maze of causeways — canoes slip the gaps brigantines cannot.',
    hint: 'Fight from the gaps; deep Spanish hulls ground and crawl.',
  },
  phoenicia: {
    id: 'phoenicia', name: 'The Purple Run',
    pitch: 'Carry cargo between friendly harbours for wave-scaling profit.',
    hint: 'Touch a friendly fort to load, another to sell. Spare your partners.',
  },
  hanse: {
    id: 'hanse', name: 'Pfundgeld',
    pitch: 'Hail convoy traders (F) for the League toll — or fight them all.',
    hint: 'F near a trader: demand the toll. Refusers call the whole convoy.',
  },
  portugal: {
    id: 'portugal', name: 'Monsoon & Feitoria',
    pitch: 'The wind reverses every 3 waves; feitoria forts mend and feed you.',
    hint: 'Mind the monsoon calendar; linger by friendly forts to recover.',
  },
  armada: {
    id: 'armada', name: 'Gales & Fire Ships',
    pitch: 'Gales scatter every formation; the crescent guards its treasure.',
    hint: 'Gales push all hulls downwind. Crack the crescent for the jackpot.',
  },
  dutch: {
    id: 'dutch', name: 'Shifting Sands',
    pitch: 'Sandbanks drift across the Texel and ground deep English keels.',
    hint: 'Your shallow hull skims the banks — lure deep hunters onto them.',
  },
  ottoman: {
    id: 'ottoman', name: 'Oar-Sprint',
    pitch: 'Sprint (T) into the ram — boarded galleys row freed men to you.',
    hint: 'T: sprint burst, then exhausted oars. Board for hands, not gold.',
  },
  predread: {
    id: 'predread', name: 'Cross the T',
    pitch: 'Rake bows and sterns; hold one target to bracket the range.',
    hint: 'Fire into bow/stern for +50%. Stay on one victim to aim truer.',
  },
  falklands: {
    id: 'falklands', name: 'Air Raid Warning',
    pitch: 'Exocets streak in from off-screen — comb the wake or be hit.',
    hint: 'Raid arrow? Turn into it and keep moving. Chaff fittings help.',
  },
  somali: {
    id: 'somali', name: 'Hijack & Ransom',
    pitch: 'Boarded merchants become hostages — the ransom ticks up while you hold.',
    hint: 'Board traders, then survive: the ransom grows every second.',
  },
};

export function traitDef(era: EraId): EraTraitDef {
  return ERA_TRAITS[era] ?? ERA_TRAITS.golden;
}

// ── waterworks ────────────────────────────────────────────────────────────

export type TraitZoneKind = 'stakes' | 'mine' | 'sand' | 'reef' | 'spond' | 'wall';

export interface TraitZone {
  x: number; y: number; r: number;
  kind: TraitZoneKind;
  /** 'foe' hurts/slows only team-1 hulls; 'all' touches everyone. */
  side: 'foe' | 'all';
  dps: number;
  /** Speed multiplier inside (1 = none). */
  slow: number;
  /** Wall segments use an end-point and a half-width. */
  x2?: number; y2?: number; w?: number;
  seed: number;
  /** Mines spend themselves; walls never do. */
  live: boolean;
  /** Drift with the wind (mines, sandbanks). */
  drift: number;
}

export interface TraitCurrent {
  x: number; y: number; r: number;
  dx: number; dy: number;
  /** Push in world units per second at the centre. */
  str: number;
}

export function makeZone(
  x: number, y: number, r: number, kind: TraitZoneKind, side: 'foe' | 'all' = 'foe',
): TraitZone {
  return { x, y, r, kind, side, dps: 0, slow: 1, seed: Math.random() * Math.PI * 2, live: true, drift: 0 };
}

// ── per-ship trait memory (kept in a WeakMap on the engine) ────────────────

export interface TraitShip {
  /** ww1: 0 = not a boat, 1 = submerged, 2 = surfaced. */
  sub: 0 | 1 | 2;
  /** maori: a marked avenger — worth Mana. */
  marked: boolean;
  /** greek: which side of her the player was last on (diekplous). */
  side: number;
}

export function freshTraitShip(): TraitShip {
  return { sub: 0, marked: false, side: 0 };
}

// ── voyage trait state ────────────────────────────────────────────────────

export interface TraitState {
  t: number;
  bounty: number; firstShot: boolean;
  charted: number[];
  signalT: number;
  rep: number; tribute: number; giftTaken: boolean;
  raiding: boolean; raidT: number; raidTick: number; raidSpawned: boolean;
  zones: TraitZone[]; currents: TraitCurrent[];
  curT: number; curSign: number;
  pingT: number; revealT: number;
  lockCool: number;
  raidAtkT: number; raidWarnT: number; raidWarnA: number;
  cargo: number; cargoCool: number;
  ransomT: number; ransomRate: number;
  utu: Record<string, number>; mana: number; manaT: number;
  vassal: number[]; vassalKills: Record<number, number>;
  sprintT: number; sprintCool: number;
  anchored: boolean; anchorT: number;
  teppoCool: number;
  shoreT: number; fortT: number;
  galeT: number; galeCool: number;
  diveTick: number;
  msgT: number;
  bracketId: number; bracketT: number;
  crushId: number; crushT: number;
  kills: number;
}

export function freshTraitState(): TraitState {
  return {
    t: 0,
    bounty: 0, firstShot: false,
    charted: [],
    signalT: 0,
    rep: 1, tribute: 0, giftTaken: false,
    raiding: false, raidT: 0, raidTick: 0, raidSpawned: false,
    zones: [], currents: [],
    curT: 20, curSign: 1,
    pingT: 4, revealT: 0,
    lockCool: 0,
    raidAtkT: 30, raidWarnT: 0, raidWarnA: 0,
    cargo: 0, cargoCool: 0,
    ransomT: 0, ransomRate: 0,
    utu: {}, mana: 0, manaT: 0,
    vassal: [], vassalKills: {},
    sprintT: 0, sprintCool: 0,
    anchored: false, anchorT: 0,
    teppoCool: 0,
    shoreT: 2, fortT: 1,
    galeT: 0, galeCool: 25,
    diveTick: 0,
    msgT: 0,
    bracketId: -1, bracketT: 0,
    crushId: -1, crushT: 0,
    kills: 0,
  };
}

// ── pure helpers ──────────────────────────────────────────────────────────

/** Bạch Đằng tide: full high→low→high cycle in seconds. */
export const TIDE_PERIOD = 80;

export function tidePhase(t: number): number {
  return ((t % TIDE_PERIOD) + TIDE_PERIOD) % TIDE_PERIOD / TIDE_PERIOD;
}

/** Stakes are bare (and lethal) around the low-water half of the cycle. */
export function tideIsLow(t: number): boolean {
  return Math.cos(tidePhase(t) * Math.PI * 2) < -0.15;
}

/** Monsoon calendar: wind holds one heading for `every` waves, then reverses. */
export function monsoonAngle(wave: number, a: number, b: number, every = 3): number {
  const idx = Math.floor((Math.max(1, wave) - 1) / every);
  return idx % 2 === 0 ? a : b;
}

/** ww2: even waves (2+) are night actions. */
export function isNightWave(wave: number): boolean {
  return wave >= 2 && wave % 2 === 0;
}

/**
 * Weather gauge (napoleonic): the attacker standing upwind of her target —
 * wind blowing from attacker toward target — shoots harder.
 */
export function gaugeMult(ax: number, ay: number, tx: number, ty: number, windAngle: number): number {
  const dx = ax - tx;
  const dy = ay - ty;
  const d = Math.hypot(dx, dy) || 1;
  const along = (dx / d) * Math.cos(windAngle) + (dy / d) * Math.sin(windAngle);
  if (along < -0.35) return 1.25; // upwind: the gauge is yours
  if (along > 0.35) return 0.92; // downwind: shooting uphill
  return 1;
}

/**
 * Raking fire (predread): shot arriving along the target's keel — into bow
 * or stern — does half again. Give the shooter's position and the target.
 */
export function rakeMult(sx: number, sy: number, tx: number, ty: number, targetAngle: number): number {
  const bearing = Math.atan2(sy - ty, sx - tx); // target → shooter
  const d = Math.abs(angDiff(targetAngle, bearing));
  // near 0 (shooter ahead) or PI (shooter astern) = raking her length
  return d < 0.5 || d > Math.PI - 0.5 ? 1.5 : 1;
}

/**
 * Armour slope (ironclad): shot arriving within 60° of the target's bow is
 * halved; anything on the broadside lands full.
 */
export function armorMult(targetAngle: number, fx: number, fy: number, tx: number, ty: number): number {
  const bearing = Math.atan2(fy - ty, fx - tx);
  return Math.abs(angDiff(targetAngle, bearing)) < 1.05 ? 0.5 : 1;
}

/** Hail tribute / toll gold for a trader of `value` on `wave` at standing `rep`. */
export function hailGold(wave: number, value: number, rep: number): number {
  return Math.max(20, Math.round((55 + wave * 22 + value * 0.3) * rep));
}

/** Deep-draft hulls suffer stakes, reefs and sandbanks; boats skim over. */
export function deepDraft(def: ShipDef): boolean {
  if (def.oared) return false;
  return def.length >= 55;
}

/** ww1 submersibles run the dive–ping–surface loop. */
export function isSubKind(kind: ShipKind): boolean {
  return kind === 'germUboat';
}
