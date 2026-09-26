// Harbour towns: an island that keeps a fort is no fishing village. Its
// garrison guards a proper port — a town, a walled basin, quays and moored
// craft, all built the way that sea built them in the era being sailed.
// Carthaginian ship-sheds, the chain across the Golden Horn, the Pharos,
// whitewashed corsair roofs under a minaret, coaling wharves and cranes in 1916,
// gantries and oil tanks in 1988.
//
// When the town is roused it does not send canoes. It sends that era's harbour
// squadron: gunboats and cutters off a Caribbean fort, lembi and galleys off a
// Punic one, torpedo boats in the North Sea, patrol boats in the Gulf.
//
// The painting is decoration baked into the island's sprite, like the rest of
// the island. The only thing gameplay reads back is `harbourMouth`, where the
// squadron puts out from.

import { TAU } from './math';
import { islandRadiusAt, type Harmonic } from './terrain';
import type { EraId, ShipKind } from './types';

// ── the squadron ──────────────────────────────────────────────────────────

export interface HarbourFleet {
  /** Guard boats — what every sortie is made of. */
  light: ShipKind[];
  /** A proper warship, sent out later in the voyage. */
  heavy: ShipKind[];
  /** Called out when the squadron puts out. */
  sortie: string;
}

/**
 * Each era's harbour craft, drawn from the ships that era already fights
 * with, so a harbour's boats always match the rest of the fleet.
 */
export const HARBOUR_FLEETS: Record<EraId, HarbourFleet> = {
  golden: { light: ['gunboat', 'cutter'], heavy: ['sloop', 'brig'], sortie: 'Gunboats and cutters put out from the harbour!' },
  exploration: { light: ['pinnace', 'caravel'], heavy: ['carrack'], sortie: 'Caravels put out from the harbour!' },
  napoleonic: { light: ['gunbrig', 'cutter'], heavy: ['brig', 'frigate'], sortie: 'The harbour gun-brigs put out!' },
  viking: { light: ['snekkja'], heavy: ['norseLongship'], sortie: 'The jarl’s longships put out from the harbour!' },
  ironclad: { light: ['gunboat', 'monitor'], heavy: ['steamFrigate', 'ramShip'], sortie: 'Steam gunboats and monitors put out from the harbour!' },
  roman: { light: ['cilician', 'liburna'], heavy: ['carthGalley'], sortie: 'Galleys row out from the ship-sheds!' },
  greek: { light: ['ionianGalley', 'bireme'], heavy: ['phoenTrireme'], sortie: 'Triremes run out of the ship-sheds!' },
  arab: { light: ['ghurab', 'sambuk'], heavy: ['warDhow'], sortie: 'War dhows put out from the harbour!' },
  chinese: { light: ['wokouJunk'], heavy: ['warlordJunk', 'fuchuan'], sortie: 'Battle junks put out from the harbour!' },
  japanese: { light: ['kobaya'], heavy: ['sekiBune'], sortie: 'Kobaya and seki-bune put out!' },
  maori: { light: ['rivalWaka'], heavy: ['rivalWaka'], sortie: 'Waka taua put out from the pā!' },
  hawaii: { light: ['rivalWaa'], heavy: ['rivalWaa'], sortie: 'War waʻa put out from the harbour!' },
  macedon: { light: ['rhodesTrieres', 'cilician'], heavy: ['ptolemGalley'], sortie: 'Galleys row out under the Pharos!' },
  maya: { light: ['mayaRival'], heavy: ['mayaRival'], sortie: 'Great war canoes put out from the port!' },
  inca: { light: ['punaBalsa'], heavy: ['rivalBalsa'], sortie: 'War balsas put out from the harbour!' },
  lepanto: { light: ['venetianGalley'], heavy: ['spanishGalley'], sortie: 'Galleys row out from the arsenal!' },
  korea: { light: ['kobaya'], heavy: ['sekiBune'], sortie: 'Kobaya and seki-bune put out!' },
  byzantium: { light: ['shalandi'], heavy: ['umayyadGalley'], sortie: 'The chain drops — galleys row out!' },
  egypt: { light: ['sherdenRaider'], heavy: ['sherdenGalley'], sortie: 'Raiders row out from the harbour!' },
  chola: { light: ['srivScout'], heavy: ['srivJong'], sortie: 'Prahus and jongs put out from the harbour!' },
  vietnam: { light: ['yuanScout'], heavy: ['warlordJunk'], sortie: 'Junks put out from the harbour!' },
  aztec: { light: ['tlaxCanoe'], heavy: ['tlaxCanoe'], sortie: 'Great war canoes put out from the causeway port!' },
  ww1: { light: ['germDrifter'], heavy: ['germTB', 'germCruiser'], sortie: 'Patrol trawlers and torpedo boats sortie!' },
  ww2: { light: ['ijnEscort'], heavy: ['ijnDestroyer', 'ijnCruiser'], sortie: 'Escorts sortie from the harbour!' },
  hormuz: { light: ['usPatrol'], heavy: ['usPatrol'], sortie: 'Patrol boats scramble from the harbour!' },
  barbary: { light: ['tripoliGunboat'], heavy: ['corsairXebec'], sortie: 'Gunboats and xebecs put out from the mole!' },
  phoenicia: { light: ['pentekonter'], heavy: ['bireme'], sortie: 'Pentekonters row out from the mole!' },
  hanse: { light: ['cog'], heavy: ['nef'], sortie: 'Cogs put out from the kontor!' },
  portugal: { light: ['fusta', 'caravelaLatina'], heavy: ['carrack'], sortie: 'Fustas and caravels put out from the harbour!' },
  armada: { light: ['flyboat'], heavy: ['galleass'], sortie: 'Flyboats and galleasses put out!' },
  dutch: { light: ['jacht'], heavy: ['pinas'], sortie: 'Yachts and pinassen put out from the harbour!' },
  ottoman: { light: ['venetianGalley'], heavy: ['spanishGalley'], sortie: 'League galleys row out from the arsenal!' },
  predread: { light: ['tb1890'], heavy: ['protectedCruiser'], sortie: 'Torpedo boats and cruisers sortie!' },
  falklands: { light: ['argCorvette'], heavy: ['argDestroyer'], sortie: 'Corvettes scramble from the harbour!' },
  somali: { light: ['rivalSkiff'], heavy: ['pmpfBoat'], sortie: 'Skiffs race out from the beach — the clan wants its cut!' },
};

/** At most this many of a harbour's boats out at once. */
export const HARBOUR_SQUADRON_CAP = 3;
/** The first wave a harbour may send out a proper warship. */
export const HARBOUR_HEAVY_WAVE = 5;

/**
 * The boats one sortie sends. A garrisoned harbour sends a pair of guard boats
 * and, deeper into the voyage, a warship with them. Once the fort is down, the
 * town can still man a guard boat or two, but nothing heavier.
 */
export function harbourSortie(era: EraId, wave: number, garrisoned: boolean, rnd: () => number = Math.random): ShipKind[] {
  const fleet = HARBOUR_FLEETS[era] ?? HARBOUR_FLEETS.golden;
  const pick = (list: ShipKind[]) => list[Math.floor(rnd() * list.length) % list.length];
  if (!garrisoned) return rnd() < 0.5 ? [pick(fleet.light)] : [pick(fleet.light), pick(fleet.light)];
  const out: ShipKind[] = [];
  if (wave >= HARBOUR_HEAVY_WAVE && rnd() < Math.min(0.85, 0.35 + (wave - HARBOUR_HEAVY_WAVE) * 0.08)) out.push(pick(fleet.heavy));
  while (out.length < 2) out.push(pick(fleet.light));
  return out;
}

// ── the town ──────────────────────────────────────────────────────────────

type Roof = 'tile' | 'slate' | 'thatch' | 'turf' | 'flat' | 'mud' | 'pagoda' | 'shingle' | 'concrete' | 'quonset';
type Quay = 'stone' | 'timber' | 'concrete' | 'mud';
type Boat = 'galley' | 'square' | 'lateen' | 'junk' | 'canoe' | 'double' | 'longship' | 'balsa' | 'steam' | 'reedboat' | 'launch';
type Feature =
  | 'lighthouse'
  | 'pharos'
  | 'chain'
  | 'shipsheds'
  | 'crane'
  | 'gantry'
  | 'tanks'
  | 'coal'
  | 'radar'
  | 'warehouse'
  | 'palisade'
  | 'torii'
  | 'stilts'
  | 'church'
  | 'mosque'
  | 'pagoda'
  | 'temple'
  | 'pyramid'
  | 'heiau';

export interface HarbourStyle {
  quay: Quay;
  roof: Roof;
  /** Roof colours, lit / shaded, picked per house. */
  roofs: [string, string][];
  /** House walls (seen at the eaves). */
  wall: string;
  /** Streets and yards. */
  ground: string;
  boats: Boat;
  features: Feature[];
  /** Houses in the town. */
  houses: number;
}

const TILE: [string, string][] = [['#d0703f', '#a8522c'], ['#c4623a', '#9a4a28'], ['#d98a52', '#b06a3a']];
const SLATE: [string, string][] = [['#6a7580', '#4b545e'], ['#7a8490', '#59626c'], ['#5e6770', '#434a52']];
const THATCH: [string, string][] = [['#c9a860', '#a08440'], ['#bb9a52', '#937636']];
const WHITE: [string, string][] = [['#f6f4ec', '#dcd7c8'], ['#efe9da', '#d4cdb8']];
const MUD: [string, string][] = [['#c8a878', '#a88a5e'], ['#bf9e6c', '#9c7e54']];
const DARKTILE: [string, string][] = [['#5a5f68', '#3e434b'], ['#4d525a', '#353940']];
const GREENTILE: [string, string][] = [['#4f7a64', '#3a5c4b'], ['#b0443a', '#86322a']];
const CONCRETE: [string, string][] = [['#b9b6ae', '#98958d'], ['#c8c4ba', '#a5a197'], ['#a9aca8', '#8a8d89']];
const SHINGLE: [string, string][] = [['#8c8e92', '#686a70'], ['#a4483a', '#7e3328'], ['#7d6a54', '#5e4f3e']];

export const HARBOUR_STYLES: Record<EraId, HarbourStyle> = {
  golden: { quay: 'timber', roof: 'tile', roofs: [...TILE, ...SHINGLE.slice(0, 1)], wall: '#efe6cf', ground: '#cdb489', boats: 'square', features: ['warehouse', 'church', 'crane'], houses: 13 },
  exploration: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#f1ead6', ground: '#d2bb8e', boats: 'square', features: ['church', 'warehouse'], houses: 11 },
  napoleonic: { quay: 'stone', roof: 'slate', roofs: SLATE, wall: '#e3ddcc', ground: '#b9ad95', boats: 'square', features: ['lighthouse', 'warehouse', 'church', 'crane'], houses: 14 },
  viking: { quay: 'timber', roof: 'turf', roofs: [['#6a7a44', '#4e5d32'], ['#77864c', '#58663a']], wall: '#6b4a2a', ground: '#8f8062', boats: 'longship', features: ['palisade'], houses: 8 },
  ironclad: { quay: 'timber', roof: 'shingle', roofs: SHINGLE, wall: '#efeee6', ground: '#b8ab8e', boats: 'steam', features: ['warehouse', 'lighthouse', 'coal'], houses: 12 },
  roman: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#e8dcb8', ground: '#cbb88e', boats: 'galley', features: ['shipsheds', 'temple'], houses: 11 },
  greek: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#ece3c8', ground: '#d0bf98', boats: 'galley', features: ['shipsheds', 'temple'], houses: 11 },
  arab: { quay: 'mud', roof: 'flat', roofs: MUD, wall: '#b8976a', ground: '#d7bf8e', boats: 'lateen', features: ['mosque', 'warehouse'], houses: 13 },
  chinese: { quay: 'timber', roof: 'pagoda', roofs: [...DARKTILE, ['#8a5a3a', '#6a4028']], wall: '#d8c8a8', ground: '#b9a47e', boats: 'junk', features: ['pagoda', 'warehouse'], houses: 12 },
  japanese: { quay: 'stone', roof: 'pagoda', roofs: DARKTILE, wall: '#ece6d6', ground: '#bfb192', boats: 'junk', features: ['torii', 'warehouse'], houses: 12 },
  maori: { quay: 'timber', roof: 'thatch', roofs: [['#9a7a4a', '#76592f'], ['#a3834f', '#7c6036']], wall: '#6b4a2a', ground: '#8f7c58', boats: 'canoe', features: ['palisade'], houses: 8 },
  hawaii: { quay: 'stone', roof: 'thatch', roofs: THATCH, wall: '#7a5a34', ground: '#b49c6e', boats: 'double', features: ['heiau'], houses: 8 },
  macedon: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#ece3c8', ground: '#d0bf98', boats: 'galley', features: ['pharos', 'shipsheds', 'temple'], houses: 12 },
  maya: { quay: 'stone', roof: 'thatch', roofs: [...THATCH, ['#e8e0cc', '#c9bfa6']], wall: '#e6dcc2', ground: '#d9ceb0', boats: 'canoe', features: ['pyramid'], houses: 10 },
  inca: { quay: 'stone', roof: 'mud', roofs: [['#b99668', '#95744c'], ['#c4a070', '#a07e52']], wall: '#a8865a', ground: '#c9ae82', boats: 'balsa', features: ['temple'], houses: 10 },
  lepanto: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#efe4c8', ground: '#cdbb92', boats: 'galley', features: ['church', 'lighthouse', 'warehouse', 'shipsheds'], houses: 13 },
  korea: { quay: 'stone', roof: 'pagoda', roofs: DARKTILE, wall: '#ece4d0', ground: '#b9ab8c', boats: 'junk', features: ['pagoda', 'warehouse'], houses: 11 },
  byzantium: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#eadfc2', ground: '#c9b891', boats: 'galley', features: ['chain', 'church', 'warehouse'], houses: 13 },
  egypt: { quay: 'mud', roof: 'mud', roofs: MUD, wall: '#b8976a', ground: '#d2b98a', boats: 'reedboat', features: ['temple'], houses: 11 },
  chola: { quay: 'timber', roof: 'thatch', roofs: [...THATCH, ['#b0443a', '#86322a']], wall: '#8a6a42', ground: '#b49a6c', boats: 'lateen', features: ['stilts', 'temple'], houses: 10 },
  vietnam: { quay: 'timber', roof: 'pagoda', roofs: [...GREENTILE, ...DARKTILE.slice(0, 1)], wall: '#e0d2b0', ground: '#b4a27c', boats: 'junk', features: ['pagoda', 'stilts'], houses: 11 },
  aztec: { quay: 'stone', roof: 'flat', roofs: [['#efe8d8', '#d2c9b4'], ['#e6d9c0', '#c8b99c']], wall: '#d8c8a8', ground: '#cfc09c', boats: 'canoe', features: ['pyramid'], houses: 12 },
  ww1: { quay: 'concrete', roof: 'slate', roofs: [...SLATE, ['#9a4a3a', '#763628']], wall: '#d8d0c0', ground: '#9e9a90', boats: 'steam', features: ['crane', 'coal', 'lighthouse', 'warehouse'], houses: 14 },
  ww2: { quay: 'concrete', roof: 'quonset', roofs: [['#8a9278', '#6c745c'], ['#9aa08a', '#7a806a']], wall: '#b8b4a4', ground: '#a8a088', boats: 'launch', features: ['crane', 'tanks', 'radar'], houses: 9 },
  hormuz: { quay: 'concrete', roof: 'concrete', roofs: CONCRETE, wall: '#d8d2c2', ground: '#c9bea4', boats: 'launch', features: ['gantry', 'tanks', 'radar', 'mosque'], houses: 11 },
  barbary: { quay: 'stone', roof: 'flat', roofs: WHITE, wall: '#e4dccb', ground: '#d8c9a4', boats: 'lateen', features: ['mosque', 'warehouse', 'lighthouse'], houses: 14 },
  phoenicia: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#eadfc2', ground: '#c9b891', boats: 'galley', features: ['shipsheds', 'temple'], houses: 12 },
  hanse: { quay: 'timber', roof: 'tile', roofs: TILE, wall: '#d8c8a8', ground: '#b9a47e', boats: 'square', features: ['warehouse', 'crane', 'church'], houses: 12 },
  portugal: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#f1ead6', ground: '#d2bb8e', boats: 'lateen', features: ['church', 'warehouse', 'lighthouse'], houses: 12 },
  armada: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#efe4c8', ground: '#cdbb92', boats: 'square', features: ['church', 'lighthouse', 'warehouse'], houses: 13 },
  dutch: { quay: 'timber', roof: 'slate', roofs: SLATE, wall: '#e3ddcc', ground: '#b9ad95', boats: 'square', features: ['warehouse', 'crane', 'church'], houses: 14 },
  ottoman: { quay: 'stone', roof: 'tile', roofs: TILE, wall: '#efe4c8', ground: '#cdbb92', boats: 'galley', features: ['mosque', 'shipsheds', 'warehouse'], houses: 13 },
  predread: { quay: 'concrete', roof: 'slate', roofs: [...SLATE, ['#9a4a3a', '#763628']], wall: '#d8d0c0', ground: '#9e9a90', boats: 'steam', features: ['crane', 'coal', 'lighthouse', 'warehouse'], houses: 13 },
  falklands: { quay: 'concrete', roof: 'quonset', roofs: [['#8a9278', '#6c745c'], ['#9aa08a', '#7a806a']], wall: '#b8b4a4', ground: '#a8a088', boats: 'launch', features: ['crane', 'radar', 'tanks'], houses: 8 },
  somali: { quay: 'stone', roof: 'flat', roofs: WHITE, wall: '#ece4d2', ground: '#d8c49a', boats: 'launch', features: ['mosque', 'lighthouse', 'warehouse'], houses: 12 },
};

export function harbourStyleFor(era: EraId | undefined): HarbourStyle {
  return (era && HARBOUR_STYLES[era]) || HARBOUR_STYLES.golden;
}

// ── geometry ──────────────────────────────────────────────────────────────

type Ctx = CanvasRenderingContext2D;
type Rnd = () => number;
interface Base {
  r: number;
  harm: Harmonic[];
}

/** How far out beyond the shoreline the harbour mouth opens. */
export const HARBOUR_REACH = 34;

/** Where a harbour's boats put out: just outside its mouth (island-local). */
export function harbourMouth(base: Base, angle: number, out = HARBOUR_REACH + 18): { x: number; y: number } {
  const d = islandRadiusAt(base, angle) + out;
  return { x: Math.cos(angle) * d, y: Math.sin(angle) * d };
}

/** A local frame on the shore: +x out to sea, +y along the coast. */
interface Frame {
  ox: number;
  oy: number;
  ux: number;
  uy: number;
  /** island-local point of a frame point */
  at: (lx: number, ly: number) => [number, number];
  /** is this frame point on dry land, with `pad` to spare? */
  land: (lx: number, ly: number, pad: number) => boolean;
  /** where the waterline crosses this line along the coast */
  coast: (ly: number) => number;
}

function frameFor(base: Base, angle: number): Frame {
  const R0 = islandRadiusAt(base, angle);
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const ox = ux * R0;
  const oy = uy * R0;
  const at = (lx: number, ly: number): [number, number] => [ox + ux * lx - uy * ly, oy + uy * lx + ux * ly];
  const land = (lx: number, ly: number, pad: number) => {
    const [x, y] = at(lx, ly);
    return Math.hypot(x, y) < islandRadiusAt(base, Math.atan2(y, x)) - pad;
  };
  const coast = (ly: number) => {
    // walk out from well inland until the ground gives way to water
    let lo = -90;
    let hi = 70;
    if (!land(lo, ly, 0)) return lo;
    for (let k = 0; k < 18; k++) {
      const mid = (lo + hi) / 2;
      if (land(mid, ly, 0)) lo = mid;
      else hi = mid;
    }
    return lo;
  };
  return { ox, oy, ux, uy, at, land, coast };
}

// ── colour ────────────────────────────────────────────────────────────────

function shade(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(t < 0 ? v * (1 + t) : v + (255 - v) * t),
  );
  return `#${((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1)}`;
}

const QUAY_COLOR: Record<Quay, string> = {
  stone: '#a8a294',
  timber: '#8a6338',
  concrete: '#b4b2aa',
  mud: '#b39468',
};

// ── the painter ───────────────────────────────────────────────────────────

export interface HarbourPaint {
  ctx: Ctx;
  base: Base;
  r: number;
  angle: number;
  style: HarbourStyle;
  rnd: Rnd;
  /** Water colour for the dredged basin. */
  water: string;
  /** Ground the town must keep off (the fort), island-local. */
  avoid: { x: number; y: number; r: number }[];
}

/** Paint a harbour town onto an island sprite (island-local coordinates). */
export function paintHarbourTown(p: HarbourPaint) {
  const { ctx, base, style, rnd } = p;
  const F = frameFor(base, p.angle);
  const k = Math.max(0.8, Math.min(1.15, p.r / 125));
  const W = 22 * k; // half-width of the basin along the coast
  const cut = 13 * k; // how far the basin is dredged into the land
  const quay = QUAY_COLOR[style.quay];

  // the coast either side of the basin; the harbour works off its outermost
  const cs: number[] = [];
  for (let ly = -W - 10; ly <= W + 10; ly += 4) cs.push(F.coast(ly));
  const cMax = Math.max(...cs);
  const cMin = Math.min(...cs);
  const reach = cMax + HARBOUR_REACH * k - 4;

  ctx.save();
  ctx.translate(F.ox, F.oy);
  ctx.rotate(p.angle);
  // (from here on: x = out to sea from the shore point, y = along the coast)
  const cx = F.coast; // frame x of the waterline at a point along the coast

  // ── town ground: streets and yards behind the waterfront
  const spots = townSpots(F, p, k, cMin, W, cut);
  ctx.fillStyle = style.ground;
  for (const s of spots) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 14.5 * k + (s.big ? 6 : 0), 0, TAU);
    ctx.fill();
  }
  // the waterfront street along the basin
  ctx.beginPath();
  ctx.moveTo(cx(-W - 8) - 2, -W - 8);
  for (let ly = -W - 8; ly <= W + 8; ly += 4) ctx.lineTo(cx(ly) - cut - 9 * k, ly);
  for (let ly = W + 8; ly >= -W - 8; ly -= 4) ctx.lineTo(cx(ly) + 1, ly);
  ctx.closePath();
  ctx.fill();

  // ── the basin: dredged into the land, faced with a quay
  const basin = new Path2D();
  basin.moveTo(cx(-W) + 2, -W);
  for (let ly = -W; ly <= W; ly += 3) basin.lineTo(cx(ly) - cut, ly);
  basin.lineTo(cx(W) + 2, W);
  basin.closePath();
  ctx.fillStyle = p.water;
  ctx.fill(basin);
  ctx.fillStyle = 'rgba(10,40,60,0.18)';
  ctx.fill(basin);
  ctx.strokeStyle = quay;
  ctx.lineWidth = 3 * k;
  ctx.beginPath();
  ctx.moveTo(cx(-W) + 1, -W);
  for (let ly = -W; ly <= W; ly += 3) ctx.lineTo(cx(ly) - cut, ly);
  ctx.lineTo(cx(W) + 1, W);
  ctx.stroke();
  quayDetail(ctx, style.quay, k, () => {
    ctx.moveTo(cx(-W) + 1, -W);
    for (let ly = -W; ly <= W; ly += 3) ctx.lineTo(cx(ly) - cut, ly);
    ctx.lineTo(cx(W) + 1, W);
  });

  // ── the moles: two arms reaching out and curling in to leave a mouth
  const mouth = 9 * k;
  const moleW = style.quay === 'timber' ? 4.2 * k : 5.5 * k;
  const arm = (side: 1 | -1) => {
    const y0 = side * (W + 2);
    ctx.beginPath();
    ctx.moveTo(cx(y0) - 4, y0);
    ctx.lineTo(reach - 8 * k, side * (W + 4));
    ctx.quadraticCurveTo(reach + 2 * k, side * (W + 2), reach, side * (mouth + 2));
  };
  for (const side of [-1, 1] as const) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = moleW + 2;
    ctx.save();
    ctx.translate(1.5, 2.5);
    arm(side);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = shade(quay, -0.35);
    ctx.lineWidth = moleW + 1.4;
    arm(side);
    ctx.stroke();
    ctx.strokeStyle = quay;
    ctx.lineWidth = moleW;
    arm(side);
    ctx.stroke();
    quayDetail(ctx, style.quay, k, () => arm(side));
  }
  // the water inside the moles reads calmer than the sea outside
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.moveTo(cMax, -W);
  ctx.lineTo(reach - 6 * k, -W);
  ctx.lineTo(reach - 6 * k, W);
  ctx.lineTo(cMax, W);
  ctx.closePath();
  ctx.fill();

  const has = (f: Feature) => style.features.includes(f);

  // ── ship-sheds: roofed slipways where the galleys are hauled out
  if (has('shipsheds')) {
    const n = 5;
    for (let i = 0; i < n; i++) {
      const ly = -W + 5 * k + i * ((2 * W - 10 * k) / (n - 1));
      const x0 = cx(ly) - cut;
      ctx.save();
      ctx.translate(x0, ly);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(-22 * k + 2, -3.2 * k + 2.5, 22 * k, 6.4 * k);
      ctx.fillStyle = style.roofs[0][0];
      ctx.fillRect(-22 * k, -3.2 * k, 22 * k, 3.2 * k);
      ctx.fillStyle = style.roofs[0][1];
      ctx.fillRect(-22 * k, 0, 22 * k, 3.2 * k);
      ctx.strokeStyle = shade(style.roofs[0][1], -0.35);
      ctx.lineWidth = 0.7;
      ctx.strokeRect(-22 * k, -3.2 * k, 22 * k, 6.4 * k);
      // a hull's stern poking out of the shed onto the slip
      ctx.fillStyle = '#5a3d22';
      ctx.beginPath();
      ctx.ellipse(1.5 * k, 0, 3.5 * k, 1.6 * k, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── moored craft in the basin
  const berths = has('shipsheds') ? 2 : 4;
  for (let i = 0; i < berths; i++) {
    const ly = (i - (berths - 1) / 2) * ((2 * W - 12 * k) / (berths - 1));
    const len = boatLength(style.boats) * k * (0.85 + rnd() * 0.25);
    const bx = cx(ly) - cut + len / 2 + 2;
    // moored bow-out off the quay, clear of the mouth
    if (bx + len / 2 > reach - 6 * k) continue;
    drawMoored(ctx, style.boats, bx, ly, 0, len, rnd);
  }
  // one more lying alongside the inside of a mole
  {
    const len = boatLength(style.boats) * k * 0.9;
    const side = rnd() < 0.5 ? 1 : -1;
    const bx = (cMax + reach) / 2;
    if (bx - len / 2 > cMax - 6) drawMoored(ctx, style.boats, bx, side * (W - 4 * k), 0, len, rnd);
  }

  // ── stilt houses standing out over the water beside the harbour
  if (has('stilts')) {
    for (let i = 0; i < 4; i++) {
      const side = i % 2 ? 1 : -1;
      const ly = side * (W + 14 * k + Math.floor(i / 2) * 13 * k);
      const x = cx(ly) + 6 * k;
      ctx.fillStyle = '#4a3220';
      for (const [dx, dy] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) {
        ctx.beginPath();
        ctx.arc(x + dx * k, ly + dy * k, 0.9, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = '#6b4a2a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 6 * k, ly);
      ctx.lineTo(cx(ly) - 2, ly);
      ctx.stroke();
      house(ctx, style, 'thatch', x, ly, 9 * k, 7 * k, 0, style.roofs[i % style.roofs.length]);
    }
  }

  // ── the town
  let bigDone = false;
  for (const s of spots) {
    if (s.big && !bigDone) {
      bigDone = true;
      landmark(ctx, style, s.x, s.y, k, rnd);
      continue;
    }
    if (s.wharf && has('warehouse')) {
      // long stores along the waterfront
      house(ctx, style, style.roof, s.x, s.y, 11.5 * k, 9 * k, Math.PI / 2, style.roofs[1 % style.roofs.length]);
      continue;
    }
    const w = (9 + rnd() * 5) * k;
    const h = (7 + rnd() * 3) * k;
    house(ctx, style, style.roof, s.x, s.y, w, h, (rnd() - 0.5) * 0.35 + (rnd() < 0.5 ? 0 : Math.PI / 2), style.roofs[Math.floor(rnd() * style.roofs.length)]);
  }

  // ── a palisade round the town (stakes and a gate on the waterfront)
  if (has('palisade')) {
    const far = spots.reduce((m, s) => Math.min(m, s.x), 0) - 12 * k;
    ctx.strokeStyle = '#5a3d20';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([2, 1.2]);
    // a quadratic sweep round the back of the town, drawn only where it
    // stands on dry ground
    const pts: [number, number][] = [];
    const a0: [number, number] = [cx(-W - 24 * k) - 4, -W - 24 * k];
    const a1: [number, number] = [cx(W + 24 * k) - 4, W + 24 * k];
    const segs: [[number, number], [number, number], [number, number]][] = [
      [a0, [far, -W - 34 * k], [far, 0]],
      [[far, 0], [far, W + 34 * k], a1],
    ];
    for (const [q0, q1, q2] of segs) {
      for (let t = 0; t <= 1.0001; t += 0.04) {
        const u = 1 - t;
        pts.push([u * u * q0[0] + 2 * u * t * q1[0] + t * t * q2[0], u * u * q0[1] + 2 * u * t * q1[1] + t * t * q2[1]]);
      }
    }
    ctx.beginPath();
    let pen = false;
    for (const [x, y] of pts) {
      if (F.land(x, y, 3)) {
        if (pen) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        pen = true;
      } else pen = false;
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── waterfront works
  if (has('crane')) crane(ctx, reach - 14 * k, (W + 4) * (rnd() < 0.5 ? 1 : -1), k, style.quay === 'concrete');
  if (has('gantry')) gantry(ctx, cx(-W * 0.4) - cut - 6 * k, -W * 0.4, k);
  if (has('coal')) {
    for (let i = 0; i < 3; i++) {
      const ly = W * 0.3 + i * 5 * k;
      const x = cx(ly) - cut - 7 * k;
      ctx.fillStyle = '#1f1f22';
      ctx.beginPath();
      ctx.ellipse(x, ly, 4 * k, 3 * k, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#3a3a40';
      ctx.beginPath();
      ctx.arc(x - k, ly - k, 1.4 * k, 0, TAU);
      ctx.fill();
    }
  }
  if (has('tanks')) {
    const inl = spots.filter((s) => !s.big && !s.wharf).slice(-3);
    for (const s of inl) tank(ctx, s.x, s.y, 7 * k);
  }
  if (has('radar')) {
    const s = spots.filter((q) => !q.big)[0];
    if (s) radar(ctx, s.x - 4 * k, s.y + 12 * k, k);
  }

  // ── the harbour mouth: a light, a pharos, a chain
  const tipY = mouth + 2;
  if (has('lighthouse')) lighthouse(ctx, reach, -tipY - 1, k);
  if (has('pharos')) pharos(ctx, reach + 1, tipY + 1, k);
  if (has('chain')) {
    tower(ctx, reach, -tipY, 4 * k, quay);
    tower(ctx, reach, tipY, 4 * k, quay);
    ctx.strokeStyle = '#2a2622';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([1.6, 1.2]);
    ctx.beginPath();
    ctx.moveTo(reach, -tipY);
    ctx.quadraticCurveTo(reach + 3 * k, 0, reach, tipY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (has('torii')) torii(ctx, reach + 14 * k, -(W + 10 * k), k);

  ctx.restore();
}

/** Where the town's buildings stand: a waterfront row, then rows inland. */
function townSpots(F: Frame, p: HarbourPaint, k: number, cMin: number, W: number, cut: number) {
  const spots: { x: number; y: number; big?: boolean; wharf?: boolean }[] = [];
  const c0 = F.coast(0);
  const fortClear = (lx: number, ly: number) => {
    const [x, y] = F.at(lx, ly);
    return p.avoid.every((a) => Math.hypot(a.x - x, a.y - y) > a.r + 9 * k);
  };
  const ok = (lx: number, ly: number, pad: number) =>
    F.land(lx, ly, pad) && fortClear(lx, ly) && spots.every((s) => Math.hypot(s.x - lx, s.y - ly) > (s.big ? 22 : 13) * k);
  // the landmark first: the town's church, temple, mosque or pyramid
  const wantBig = p.style.features.some((f) => BIG.includes(f));
  if (wantBig) {
    for (const [dx, dy] of [[-40, 0], [-44, 14], [-44, -14], [-52, 0], [-36, 20], [-36, -20], [-30, 0]]) {
      const lx = c0 - cut + dx * k;
      const ly = dy * k;
      if (F.land(lx, ly, 16 * k) && fortClear(lx, ly)) {
        spots.push({ x: lx, y: ly, big: true });
        break;
      }
    }
  }
  // the waterfront row, just behind the quay (warehouses go here)
  for (let ly = -W - 16 * k; ly <= W + 16 * k; ly += 13 * k) {
    const lx = F.coast(ly) - (Math.abs(ly) < W + 2 ? cut + 9 * k : 10 * k);
    if (ok(lx, ly, 5)) spots.push({ x: lx, y: ly, wharf: Math.abs(ly) < W + 6 });
    if (spots.length >= p.style.houses) return spots;
  }
  // and the lanes behind it
  for (let row = 1; row < 5; row++) {
    const span = W + (20 - row * 3) * k;
    for (let ly = -span; ly <= span; ly += 12.5 * k) {
      const lx = Math.min(c0, cMin + 6) - cut - (9 + row * 14) * k + ((row * 7 + ly) % 5);
      if (ok(lx, ly, 6)) spots.push({ x: lx, y: ly + (row % 2) * 4 * k });
      if (spots.length >= p.style.houses + (wantBig ? 1 : 0)) return spots;
    }
  }
  return spots;
}

const BIG: Feature[] = ['church', 'mosque', 'pagoda', 'temple', 'pyramid', 'heiau'];

function boatLength(b: Boat): number {
  switch (b) {
    case 'galley':
    case 'longship':
      return 24;
    case 'steam':
      return 22;
    case 'junk':
    case 'square':
    case 'lateen':
      return 18;
    case 'double':
    case 'balsa':
      return 14;
    case 'launch':
      return 13;
    default:
      return 15;
  }
}

/** Planking, dressed stone or expansion joints along a quay or mole. */
function quayDetail(ctx: Ctx, q: Quay, k: number, path: () => void) {
  ctx.save();
  ctx.beginPath();
  path();
  if (q === 'timber') {
    ctx.strokeStyle = 'rgba(60,38,18,0.55)';
    ctx.lineWidth = 2.6 * k;
    ctx.setLineDash([0.7, 2.6]);
  } else if (q === 'stone') {
    ctx.strokeStyle = 'rgba(60,56,48,0.35)';
    ctx.lineWidth = 3 * k;
    ctx.setLineDash([0.6, 3.4]);
  } else if (q === 'concrete') {
    ctx.strokeStyle = 'rgba(40,40,40,0.25)';
    ctx.lineWidth = 3.4 * k;
    ctx.setLineDash([0.5, 6]);
  } else {
    ctx.strokeStyle = 'rgba(90,64,32,0.3)';
    ctx.lineWidth = 2 * k;
    ctx.setLineDash([2, 3]);
  }
  ctx.stroke();
  ctx.restore();
}

/** One house from above: footing shadow, eaves in the wall colour, a roof. */
function house(ctx: Ctx, style: HarbourStyle, roof: Roof, x: number, y: number, w: number, h: number, rot: number, cols: [string, string]) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.26)';
  if (roof === 'thatch' || roof === 'turf') {
    ctx.beginPath();
    ctx.ellipse(2, 3, w / 2, h / 2, 0, 0, TAU);
    ctx.fill();
  } else ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
  const [lit, dark] = cols;
  const edge = shade(dark, -0.35);
  switch (roof) {
    case 'flat':
    case 'mud':
    case 'concrete': {
      ctx.fillStyle = lit;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.1;
      ctx.strokeRect(-w / 2 + 0.8, -h / 2 + 0.8, w - 1.6, h - 1.6);
      if (roof === 'concrete') {
        // rooftop plant: a water tank and an air-conditioning box
        ctx.fillStyle = '#e8e6e0';
        ctx.beginPath();
        ctx.arc(w * 0.22, -h * 0.15, Math.min(w, h) * 0.16, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#7d8084';
        ctx.fillRect(-w * 0.3, h * 0.05, w * 0.2, h * 0.22);
      } else if (roof === 'mud') {
        ctx.fillStyle = shade(dark, -0.2);
        ctx.fillRect(-w * 0.18, -h * 0.18, w * 0.36, h * 0.36); // a courtyard / roof stair
      } else {
        ctx.fillStyle = '#3f6fa0';
        ctx.fillRect(w / 2 - 2.4, -1, 1.6, 2.2); // a painted door on the roof stair
      }
      break;
    }
    case 'thatch':
    case 'turf': {
      ctx.fillStyle = style.wall;
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = lit;
      ctx.beginPath();
      ctx.ellipse(0, -0.4, w / 2 - 1, h / 2 - 0.8, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(0, 0.4, w / 2 - 1, h / 2 - 0.8, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = edge;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 2, 0);
      ctx.lineTo(w / 2 - 2, 0);
      ctx.stroke();
      break;
    }
    case 'quonset': {
      // a Quonset hut: a half-round corrugated shell
      ctx.fillStyle = dark;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = lit;
      ctx.fillRect(-w / 2, -h / 2, w, h * 0.45);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let t = -w / 2 + 1.5; t < w / 2; t += 1.8) (ctx.moveTo(t, -h / 2), ctx.lineTo(t, h / 2));
      ctx.stroke();
      break;
    }
    case 'pagoda': {
      // hipped tile roof with upswept corners
      ctx.fillStyle = style.wall;
      ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2);
      ctx.fillStyle = lit;
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 1.5, -h / 2 - 1.5);
      ctx.lineTo(w / 2 + 1.5, -h / 2 - 1.5);
      ctx.lineTo(w / 2 - h * 0.35, 0);
      ctx.lineTo(-w / 2 + h * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 1.5, h / 2 + 1.5);
      ctx.lineTo(w / 2 + 1.5, h / 2 + 1.5);
      ctx.lineTo(w / 2 - h * 0.35, 0);
      ctx.lineTo(-w / 2 + h * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(lit, -0.12);
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 1.5, -h / 2 - 1.5);
      ctx.lineTo(-w / 2 + h * 0.35, 0);
      ctx.lineTo(-w / 2 - 1.5, h / 2 + 1.5);
      ctx.closePath();
      ctx.moveTo(w / 2 + 1.5, -h / 2 - 1.5);
      ctx.lineTo(w / 2 - h * 0.35, 0);
      ctx.lineTo(w / 2 + 1.5, h / 2 + 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = edge;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + h * 0.35, 0);
      ctx.lineTo(w / 2 - h * 0.35, 0);
      ctx.stroke();
      break;
    }
    default: {
      // a pitched roof: tile, slate or shingle
      ctx.fillStyle = style.wall;
      ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      ctx.fillStyle = lit;
      ctx.fillRect(-w / 2, -h / 2, w, h / 2);
      ctx.fillStyle = dark;
      ctx.fillRect(-w / 2, 0, w, h / 2);
      if (roof === 'tile') {
        ctx.strokeStyle = 'rgba(90,35,15,0.35)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let t = -w / 2 + 2; t < w / 2; t += 2) (ctx.moveTo(t, -h / 2), ctx.lineTo(t, h / 2));
        ctx.stroke();
      }
      ctx.strokeStyle = edge;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
      ctx.stroke();
      if (roof === 'slate' || roof === 'shingle') {
        ctx.fillStyle = '#6b5a4a';
        ctx.fillRect(w / 2 - 3.5, -h / 2 + 1, 2.2, 2.2); // a chimney
      }
    }
  }
  ctx.restore();
}

/** The town's great building: church, mosque, pagoda, temple or pyramid. */
function landmark(ctx: Ctx, style: HarbourStyle, x: number, y: number, k: number, rnd: Rnd) {
  const kind = style.features.find((f) => BIG.includes(f));
  ctx.save();
  ctx.translate(x, y);
  const shadow = (w: number, h: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
  };
  switch (kind) {
    case 'church': {
      // a cross-shaped church with a bell tower at the west end
      const L = 26 * k;
      const B = 10 * k;
      shadow(L, B);
      ctx.fillStyle = style.wall;
      ctx.fillRect(-L / 2 - 1, -B / 2 - 1, L + 2, B + 2);
      ctx.fillStyle = style.roofs[0][0];
      ctx.fillRect(-L / 2, -B / 2, L, B / 2);
      ctx.fillStyle = style.roofs[0][1];
      ctx.fillRect(-L / 2, 0, L, B / 2);
      ctx.fillStyle = style.roofs[0][0];
      ctx.fillRect(-B * 0.2, -B * 1.1, B * 0.9, B * 2.2); // transepts
      ctx.fillStyle = style.roofs[0][1];
      ctx.fillRect(-B * 0.2 + B * 0.45, -B * 1.1, B * 0.45, B * 2.2);
      ctx.fillStyle = shade(style.wall, -0.15);
      ctx.fillRect(L / 2 - 1, -B * 0.45, B * 0.9, B * 0.9); // tower
      ctx.fillStyle = '#5a5f68';
      ctx.beginPath();
      ctx.moveTo(L / 2 - 1, -B * 0.45);
      ctx.lineTo(L / 2 - 1 + B * 0.45, 0);
      ctx.lineTo(L / 2 - 1, B * 0.45);
      ctx.lineTo(L / 2 - 1 + B * 0.9, B * 0.45);
      ctx.lineTo(L / 2 - 1 + B * 0.45, 0);
      ctx.lineTo(L / 2 - 1 + B * 0.9, -B * 0.45);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'mosque': {
      // a courtyard, a prayer hall with a great dome, and a minaret
      const S = 22 * k;
      shadow(S, S);
      ctx.fillStyle = style.wall;
      ctx.fillRect(-S / 2, -S / 2, S, S);
      ctx.fillStyle = shade(style.ground, 0.15);
      ctx.fillRect(-S / 2 + 2, -S / 2 + 2, S * 0.45, S - 4); // courtyard
      ctx.fillStyle = '#e9e4d6';
      ctx.fillRect(0, -S / 2 + 1, S / 2 - 1, S - 2);
      const g = ctx.createRadialGradient(S * 0.2, -S * 0.05, 1, S * 0.25, 0, S * 0.3);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, style.roof === 'concrete' ? '#4f8aa0' : '#bfb7a2');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(S * 0.25, 0, S * 0.26, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-S / 2 - 1 + 3, -S / 2 - 1 + 4, 6 * k, 6 * k);
      ctx.fillStyle = '#f2eee2';
      ctx.beginPath();
      ctx.arc(-S / 2 + 2 * k, -S / 2 + 2 * k, 3.2 * k, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#8a8272';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      break;
    }
    case 'pagoda': {
      // a tiered pagoda: stacked roofs seen from above
      const S = 17 * k;
      shadow(S, S);
      for (let t = 0; t < 4; t++) {
        const s = S * (1 - t * 0.2);
        const [lit, dark] = style.roofs[0];
        ctx.fillStyle = t % 2 ? dark : lit;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.strokeStyle = shade(dark, -0.4);
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
      }
      ctx.fillStyle = '#c9a23a';
      ctx.beginPath();
      ctx.arc(0, 0, 1.6 * k, 0, TAU);
      ctx.fill();
      break;
    }
    case 'temple': {
      // a columned temple on a stepped platform (or a mud-brick sanctuary)
      const L = 24 * k;
      const B = 14 * k;
      shadow(L, B);
      const mud = style.roof === 'mud' || style.roof === 'thatch';
      ctx.fillStyle = mud ? shade(style.wall, 0.15) : '#e8e2d0';
      ctx.fillRect(-L / 2 - 2, -B / 2 - 2, L + 4, B + 4);
      if (mud) {
        // pylons and a court: Egypt, the Andes, the Coromandel coast
        ctx.fillStyle = shade(style.wall, -0.1);
        ctx.fillRect(L / 2 - 5 * k, -B / 2 - 2, 5 * k, B * 0.4);
        ctx.fillRect(L / 2 - 5 * k, B * 0.1 + 2, 5 * k, B * 0.4);
        ctx.fillStyle = style.roofs[0][1];
        ctx.fillRect(-L / 2, -B / 2 + 2, L * 0.55, B - 4);
        ctx.fillStyle = shade(style.ground, 0.1);
        ctx.fillRect(-L / 2 + L * 0.58, -B / 2 + 2, L * 0.25, B - 4);
      } else {
        ctx.fillStyle = style.roofs[0][0];
        ctx.fillRect(-L / 2, -B / 2, L, B / 2);
        ctx.fillStyle = style.roofs[0][1];
        ctx.fillRect(-L / 2, 0, L, B / 2);
        ctx.fillStyle = '#f4efe0';
        for (let t = -L / 2 + 1; t <= L / 2 - 1; t += 3 * k) {
          ctx.beginPath();
          ctx.arc(t, -B / 2 - 0.5, 0.9 * k, 0, TAU);
          ctx.arc(t, B / 2 + 0.5, 0.9 * k, 0, TAU);
          ctx.fill();
        }
      }
      break;
    }
    case 'heiau': {
      // a stone temple platform with thatched houses and an oracle tower
      const S = 22 * k;
      shadow(S, S * 0.8);
      ctx.fillStyle = '#6f6a62';
      ctx.fillRect(-S / 2, -S * 0.4, S, S * 0.8);
      ctx.fillStyle = '#88827a';
      ctx.fillRect(-S / 2 + 2, -S * 0.4 + 2, S - 4, S * 0.8 - 4);
      house(ctx, style, 'thatch', -S * 0.18, -S * 0.1, 9 * k, 6 * k, 0, style.roofs[0]);
      ctx.fillStyle = '#e8e0cc';
      ctx.fillRect(S * 0.2, -S * 0.28, 3.5 * k, 3.5 * k); // the white-draped ʻanuʻu tower
      break;
    }
    case 'pyramid': {
      // a stepped temple-pyramid with a shrine on top
      const S = 24 * k;
      shadow(S, S);
      for (let t = 0; t < 4; t++) {
        const s = S * (1 - t * 0.2);
        ctx.fillStyle = shade('#d8ccb0', -t * 0.06);
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.strokeStyle = 'rgba(80,60,40,0.4)';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
      }
      ctx.fillStyle = '#c6b89a';
      ctx.fillRect(S * 0.1, -2 * k, S * 0.4, 4 * k); // the stair
      ctx.fillStyle = '#b0443a';
      ctx.fillRect(-3.5 * k, -3.5 * k, 7 * k, 7 * k);
      ctx.fillStyle = '#e8e0cc';
      ctx.fillRect(-1.5 * k, -1.5 * k, 3 * k, 3 * k);
      break;
    }
    default:
      house(ctx, style, style.roof, 0, 0, 16 * k, 11 * k, rnd() * 0.3, style.roofs[0]);
  }
  ctx.restore();
}

function drawMoored(ctx: Ctx, kind: Boat, x: number, y: number, rot: number, len: number, rnd: Rnd) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const w = len * (kind === 'galley' || kind === 'longship' ? 0.2 : kind === 'balsa' ? 0.42 : 0.3);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(1, 2, len / 2, w / 2 + 0.5, 0, 0, TAU);
  ctx.fill();
  const hullPath = () => {
    ctx.beginPath();
    ctx.moveTo(len / 2, 0);
    ctx.quadraticCurveTo(len * 0.2, -w / 2 - 0.4, -len * 0.4, -w / 2);
    ctx.lineTo(-len / 2, -w * 0.3);
    ctx.lineTo(-len / 2, w * 0.3);
    ctx.lineTo(-len * 0.4, w / 2);
    ctx.quadraticCurveTo(len * 0.2, w / 2 + 0.4, len / 2, 0);
    ctx.closePath();
  };
  switch (kind) {
    case 'steam':
    case 'launch': {
      const grey = kind === 'steam' ? '#3e4247' : '#5d646a';
      hullPath();
      ctx.fillStyle = grey;
      ctx.fill();
      ctx.fillStyle = kind === 'steam' ? '#8a8578' : '#c9c6bc';
      ctx.fillRect(-len * 0.25, -w * 0.25, len * 0.35, w * 0.5); // deckhouse
      if (kind === 'steam') {
        ctx.fillStyle = '#1e1e20';
        ctx.beginPath();
        ctx.arc(-len * 0.02, 0, w * 0.2, 0, TAU); // funnel
        ctx.fill();
        ctx.fillStyle = 'rgba(200,200,200,0.35)';
        ctx.beginPath();
        ctx.arc(-len * 0.1, -w * 0.4, w * 0.3, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'canoe':
    case 'reedboat': {
      ctx.fillStyle = kind === 'reedboat' ? '#c8b060' : '#6a4a2a';
      ctx.beginPath();
      ctx.ellipse(0, 0, len / 2, w / 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = kind === 'reedboat' ? '#a89040' : '#8d6a3f';
      ctx.beginPath();
      ctx.ellipse(0, 0, len / 2 - 2, w / 2 - 1, 0, 0, TAU);
      ctx.fill();
      if (kind === 'reedboat') {
        ctx.strokeStyle = 'rgba(90,70,20,0.5)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let t = -len / 2 + 2; t < len / 2 - 1; t += 1.6) (ctx.moveTo(t, -w / 2 + 0.6), ctx.lineTo(t, w / 2 - 0.6));
        ctx.stroke();
      }
      break;
    }
    case 'double': {
      for (const s of [-1, 1]) {
        ctx.fillStyle = '#6a4a2a';
        ctx.beginPath();
        ctx.ellipse(0, s * w * 0.55, len / 2, w * 0.22, 0, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#9a7a4a';
      for (const t of [-len * 0.2, 0, len * 0.2]) ctx.fillRect(t - 0.7, -w * 0.6, 1.4, w * 1.2);
      ctx.fillStyle = '#d8c89a';
      ctx.beginPath();
      ctx.moveTo(-2, -w * 0.55);
      ctx.quadraticCurveTo(3, 0, -2, w * 0.55);
      ctx.fill();
      break;
    }
    case 'balsa': {
      ctx.fillStyle = '#c8aa6a';
      ctx.fillRect(-len / 2, -w / 2, len, w);
      ctx.strokeStyle = '#8a6a3a';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let t = -w / 2 + 1.2; t < w / 2; t += 1.6) (ctx.moveTo(-len / 2, t), ctx.lineTo(len / 2, t));
      ctx.stroke();
      ctx.fillStyle = '#e8dcc0';
      ctx.fillRect(-1, -w * 0.45, 2.4, w * 0.9);
      break;
    }
    default: {
      hullPath();
      ctx.fillStyle = kind === 'junk' ? '#5a3a22' : '#5c3b20';
      ctx.fill();
      ctx.fillStyle = kind === 'junk' ? '#8a6038' : '#a47a48';
      ctx.fillRect(-len * 0.38, -w * 0.28, len * 0.7, w * 0.56);
      if (kind === 'galley' || kind === 'longship') {
        // oars shipped along both sides, and a row of shields on a longship
        ctx.strokeStyle = '#3a2716';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let t = -len * 0.34; t <= len * 0.3; t += 2.4) {
          ctx.moveTo(t, -w / 2);
          ctx.lineTo(t - 1, -w / 2 - 2.6);
          ctx.moveTo(t, w / 2);
          ctx.lineTo(t - 1, w / 2 + 2.6);
        }
        ctx.stroke();
        if (kind === 'longship') {
          for (let t = -len * 0.3; t <= len * 0.3; t += 3) {
            ctx.fillStyle = Math.round(t) % 2 ? '#c8a23a' : '#a8322a';
            ctx.beginPath();
            ctx.arc(t, -w / 2, 1, 0, TAU);
            ctx.arc(t, w / 2, 1, 0, TAU);
            ctx.fill();
          }
        }
      }
      // furled canvas along the yard
      ctx.strokeStyle = kind === 'junk' ? '#9a6a3a' : '#efe6cc';
      ctx.lineWidth = kind === 'junk' ? 2 : 1.6;
      ctx.beginPath();
      if (kind === 'lateen') {
        ctx.moveTo(len * 0.3, -w * 0.8);
        ctx.lineTo(-len * 0.35, w * 0.8);
      } else if (kind === 'square') {
        for (const t of [len * 0.15, -len * 0.15]) (ctx.moveTo(t, -w * 0.85), ctx.lineTo(t, w * 0.85));
      } else {
        ctx.moveTo(0, -w * 0.7);
        ctx.lineTo(0, w * 0.7);
      }
      ctx.stroke();
      if (rnd() < 0.4) {
        ctx.fillStyle = '#b3261e';
        ctx.fillRect(-len / 2 - 2, -1, 2.4, 2);
      }
    }
  }
  ctx.restore();
}

function tower(ctx: Ctx, x: number, y: number, rad: number, col: string) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(x + 1.5, y + 2.5, rad, 0, TAU);
  ctx.fill();
  ctx.fillStyle = shade(col, 0.1);
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = shade(col, -0.4);
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function lighthouse(ctx: Ctx, x: number, y: number, k: number) {
  tower(ctx, x, y, 4 * k, '#e8e4da');
  ctx.fillStyle = '#b3261e';
  ctx.beginPath();
  ctx.arc(x, y, 2.4 * k, 0, TAU);
  ctx.fill();
  const g = ctx.createRadialGradient(x, y, 0, x, y, 9 * k);
  g.addColorStop(0, 'rgba(255,236,160,0.75)');
  g.addColorStop(1, 'rgba(255,236,160,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 9 * k, 0, TAU);
  ctx.fill();
}

/** A great stepped light-tower, a fire burning on its top. */
function pharos(ctx: Ctx, x: number, y: number, k: number) {
  const S = 11 * k;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - S / 2 + 3, y - S / 2 + 4, S, S);
  ctx.fillStyle = '#e4dcc6';
  ctx.fillRect(x - S / 2, y - S / 2, S, S);
  ctx.strokeStyle = '#9a9078';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x - S / 2, y - S / 2, S, S);
  ctx.fillStyle = '#f0e8d4';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const px = x + Math.cos(a) * S * 0.32;
    const py = y + Math.sin(a) * S * 0.32;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const g = ctx.createRadialGradient(x, y, 0, x, y, 12 * k);
  g.addColorStop(0, 'rgba(255,200,90,0.95)');
  g.addColorStop(0.35, 'rgba(255,150,50,0.5)');
  g.addColorStop(1, 'rgba(255,150,50,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 12 * k, 0, TAU);
  ctx.fill();
}

function crane(ctx: Ctx, x: number, y: number, k: number, steel: boolean) {
  const col = steel ? '#c9a23a' : '#6b4a2a';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - 3 * k + 2, y - 3 * k + 3, 6 * k, 6 * k);
  ctx.fillStyle = col;
  ctx.fillRect(x - 3 * k, y - 3 * k, 6 * k, 6 * k);
  // the jib, swung out over the water
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.8 * k;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 4 * k, y - Math.sign(y || 1) * 16 * k);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

/** A container gantry on the quay, stacks of boxes behind it. */
function gantry(ctx: Ctx, x: number, y: number, k: number) {
  const cols = ['#b3261e', '#2f6fa0', '#d49a2a', '#3f7f4a', '#8a8f96'];
  for (let i = 0; i < 6; i++) {
    const bx = x - 8 * k - (i % 3) * 4.5 * k;
    const by = y - 6 * k + Math.floor(i / 3) * 9 * k;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(bx + 1.5, by + 2, 4 * k, 8 * k);
    ctx.fillStyle = cols[i % cols.length];
    ctx.fillRect(bx, by, 4 * k, 8 * k);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - 2 * k + 3, y - 12 * k + 4, 5 * k, 24 * k);
  ctx.fillStyle = '#c94a2a';
  ctx.fillRect(x - 2 * k, y - 12 * k, 5 * k, 24 * k);
  ctx.fillStyle = '#e8e4da';
  ctx.fillRect(x - 2 * k, y - 12 * k, 22 * k, 3 * k); // boom out over the berth
  ctx.fillRect(x - 2 * k, y + 9 * k, 22 * k, 3 * k);
}

function tank(ctx: Ctx, x: number, y: number, rad: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(x + 2, y + 3, rad, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#e4e2dc';
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#9a9890';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, rad * 0.6, 0, TAU);
  ctx.stroke();
}

function radar(ctx: Ctx, x: number, y: number, k: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - 2 * k + 2, y - 2 * k + 3, 4 * k, 4 * k);
  ctx.fillStyle = '#7d8084';
  ctx.fillRect(x - 2 * k, y - 2 * k, 4 * k, 4 * k);
  ctx.strokeStyle = '#d8d6d0';
  ctx.lineWidth = 1.4 * k;
  ctx.beginPath();
  ctx.moveTo(x - 6 * k, y - 3 * k);
  ctx.lineTo(x + 6 * k, y + 3 * k);
  ctx.stroke();
}

function torii(ctx: Ctx, x: number, y: number, k: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x - 1 + 2, y - 7 * k + 3, 2.2 * k, 14 * k);
  ctx.fillStyle = '#c8321e';
  ctx.fillRect(x - 1, y - 7 * k, 2.2 * k, 14 * k);
  ctx.fillStyle = '#2a1a14';
  ctx.fillRect(x - 1.6, y - 5 * k, 3.2 * k, 1.6 * k);
  ctx.fillRect(x - 1.6, y + 3.4 * k, 3.2 * k, 1.6 * k);
}
