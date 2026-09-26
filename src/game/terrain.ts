// Island terrain — what an island in a given sea is actually made of.
//
// The tropical seas share one painter (see `buildIsland` in render.ts): a sand
// ring, a jungle heart and palms on the beach. Every other stretch of water
// carries a `Terrain` recipe instead, and this module paints from it: the
// coastline's character, what the shore is made of, what covers the ground,
// which trees grow, what the summit looks like, how the locals build, and the
// landmark a sailor would know the waters by — chalk cliffs and a lighthouse in
// Biscay, heather, skerries and a stone ring in the North Sea, a whitewashed
// village under a hilltop temple in the Aegean, chinampas and a twin-shrined
// pyramid on Lake Texcoco.
//
// Everything here is decoration baked once into the island's sprite. The only
// thing that touches gameplay is the coastline (`terrainHarmonics`), which the
// engine reads back through `islandRadiusAt` for collisions, so the shoreline a
// ship bumps into is always the one that was painted.

import { TAU } from './math';
import type { IslandTheme } from './worlds';

// ── recipe ────────────────────────────────────────────────────────────────

/** Coastline character. */
export type TerrainShape =
  /** Rounded, like the tropical islands. */
  | 'round'
  /** Ragged headlands and coves. */
  | 'craggy'
  /** Deeply notched: narrow inlets between rocky arms. */
  | 'fjord'
  /** Long, low and wriggly — marsh and mud islands. */
  | 'low'
  /** Drawn out along one axis, like the banks of a strait. */
  | 'long'
  /** Near-circular: a volcanic cone or a steep stone islet. */
  | 'cone';

/** What the waterline is made of. */
export type TerrainShore = 'sand' | 'shingle' | 'chalk' | 'mud' | 'rock' | 'reed' | 'guano';

/** What covers the island inside the shore. */
export type TerrainGround =
  | 'scrub'
  | 'moor'
  | 'marsh'
  | 'dunes'
  | 'bocage'
  | 'forest'
  | 'fields'
  | 'chinampas'
  | 'barren'
  | 'terraces'
  | 'grass';

export type TerrainTree =
  | 'pine'
  | 'cypress'
  | 'olive'
  | 'date'
  | 'oak'
  | 'blackPine'
  | 'pohutukawa'
  | 'fern'
  | 'cactus'
  | 'willow'
  | 'reeds'
  | 'papyrus';

export type TerrainPeak = 'none' | 'limestone' | 'granite' | 'snowcap' | 'volcano' | 'jebel';

/** How the locals build. */
export type TerrainVillage =
  | 'stone'
  | 'longhouse'
  | 'clapboard'
  | 'terracotta'
  | 'whitewash'
  | 'mudbrick'
  | 'japanese'
  | 'hanok'
  | 'whare'
  | 'adobe'
  | 'stucco';

/** The thing a sailor knows these waters by. */
export type TerrainLandmark =
  | 'lighthouse'
  | 'screwpile'
  | 'standingStones'
  | 'temple'
  | 'church'
  | 'windmill'
  | 'obelisk'
  | 'oasis'
  | 'torii'
  | 'beacon'
  | 'pa'
  | 'huaca'
  | 'pyramid'
  | 'vineyard'
  | 'watchtower'
  | 'causeway'
  | 'seaWall';

/** What litters the shallows. */
export type TerrainOffshore = 'rocks' | 'skerries' | 'stacks' | 'stakes' | 'reeds' | 'sealions' | 'flats';

export interface Terrain {
  shape: TerrainShape;
  shore: TerrainShore;
  ground: TerrainGround;
  /** Base colour of the ground; defaults to the theme's foliage colour. */
  groundColor?: string;
  /** Trees and how thickly they grow (1 ≈ a well-wooded island). */
  trees: [TerrainTree, number][];
  peak: TerrainPeak;
  village: TerrainVillage;
  /** One is picked per island (big islands may get two); repeat to weight. */
  landmarks: TerrainLandmark[];
  offshore: TerrainOffshore;
  /** Masonry: quays, towers, walls. */
  stone?: string;
  /** Standing water on the island — pools, canals, creeks. */
  pool?: string;
}

// ── geometry ──────────────────────────────────────────────────────────────

export interface Harmonic {
  amp: number;
  freq: number;
  phase: number;
}

export function islandRadiusAt(is: { r: number; harm: Harmonic[] }, a: number) {
  let k = 1;
  for (let i = 0; i < is.harm.length; i++) {
    const h = is.harm[i];
    k += h.amp * Math.sin(h.freq * a + h.phase);
  }
  return is.r * k;
}

/** The coastline for a terrain shape. Amplitudes always sum well under 1. */
export function terrainHarmonics(shape: TerrainShape, rnd: () => number): Harmonic[] {
  const h = (amp: number, freq: number): Harmonic => ({ amp, freq, phase: rnd() * TAU });
  switch (shape) {
    case 'craggy':
      return [
        h(0.08 + rnd() * 0.07, 2),
        h(0.05 + rnd() * 0.05, 3),
        h(0.03 + rnd() * 0.03, 5),
        h(0.035 + rnd() * 0.02, 8),
        h(0.02 + rnd() * 0.015, 13),
        h(0.01 + rnd() * 0.008, 21),
      ];
    case 'fjord':
      return [
        h(0.07 + rnd() * 0.06, 2),
        h(0.04 + rnd() * 0.04, 3),
        h(0.06 + rnd() * 0.03, 7),
        h(0.035 + rnd() * 0.02, 12),
        h(0.018 + rnd() * 0.01, 19),
      ];
    case 'low':
      return [
        h(0.22 + rnd() * 0.08, 2),
        h(0.06 + rnd() * 0.05, 3),
        h(0.04 + rnd() * 0.02, 6),
        h(0.025 + rnd() * 0.015, 11),
      ];
    case 'long':
      return [
        h(0.28 + rnd() * 0.07, 2),
        h(0.04 + rnd() * 0.03, 4),
        h(0.025 + rnd() * 0.02, 5),
        h(0.012 + rnd() * 0.01, 9),
      ];
    case 'cone':
      return [
        h(0.04 + rnd() * 0.04, 2),
        h(0.03 + rnd() * 0.03, 3),
        h(0.02 + rnd() * 0.02, 5),
        h(0.012 + rnd() * 0.01, 9),
      ];
    default:
      return [
        h(0.09 + rnd() * 0.08, 2),
        h(0.05 + rnd() * 0.06, 3),
        h(0.03 + rnd() * 0.03, 5),
        h(0.012 + rnd() * 0.015, 9),
      ];
  }
}

// ── colour ────────────────────────────────────────────────────────────────

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Blend two `#rrggbb` colours; `t` = 0 gives `a`, 1 gives `b`. */
function mix(a: string, b: string, t: number): string {
  const x = rgbOf(a);
  const y = rgbOf(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1)}`;
}

/** Darken (t < 0) or lighten (t > 0) a colour. */
function tone(hex: string, t: number): string {
  return t < 0 ? mix(hex, '#000000', -t) : mix(hex, '#ffffff', t);
}

function alpha(hex: string, a: number): string {
  const [r, g, b] = rgbOf(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ── the painter ───────────────────────────────────────────────────────────

type Rnd = () => number;
type Ctx = CanvasRenderingContext2D;
type Poly = (mul: number, add: number, wobble?: number, ws?: number) => Path2D;

export interface TerrainPaint {
  ctx: Ctx;
  base: { r: number; harm: Harmonic[] };
  r: number;
  maxR: number;
  seed: number;
  rnd: Rnd;
  theme: IslandTheme;
  terrain: Terrain;
  poly: Poly;
  inhabited: boolean;
  /** Where the island's battery stands, if it has one — kept clear. */
  fortAngle: number | null;
  /**
   * Where a fortified island's harbour town stands, if it has one. The town
   * is painted separately (harbour.ts) and takes the village's place.
   */
  harbourAngle?: number | null;
}

interface Spot {
  x: number;
  y: number;
  r: number;
}

/** Everything the painters share for one island. */
interface Job extends TerrainPaint {
  T: Terrain;
  R: (a: number) => number;
  /** Ground a building or landmark sits on: trees keep off it. */
  spots: Spot[];
  free: (x: number, y: number, pad: number) => boolean;
  stone: string;
  pool: string;
  /** Radius of the summit, if there is one: trees keep off that too. */
  peakR: number;
}

/** Landmarks that crown the island rather than sit on its shore. */
const SUMMIT: TerrainLandmark[] = ['temple', 'beacon', 'pa', 'pyramid', 'huaca', 'church', 'standingStones'];
/** Landmarks standing in the water just off the beach. */
const OFFSHORE: TerrainLandmark[] = ['torii', 'causeway', 'screwpile'];
/** Landmarks on the waterline itself. */
const SHORE: TerrainLandmark[] = ['lighthouse', 'seaWall'];

export function paintTerrainIsland(p: TerrainPaint) {
  const T = p.terrain;
  const R = (a: number) => islandRadiusAt(p.base, a);
  const spots: Spot[] = [];
  const job: Job = {
    ...p,
    T,
    R,
    spots,
    free: (x, y, pad) => spots.every((s) => Math.hypot(s.x - x, s.y - y) > s.r + pad),
    stone: T.stone ?? '#9d9a90',
    pool: T.pool ?? '#4e8088',
    peakR: 0,
  };
  const { rnd, r } = p;

  // ── plan: where the village, the fort and the landmarks go ─────────────
  const taken: number[] = [];
  if (p.fortAngle !== null) {
    taken.push(p.fortAngle);
    const d = R(p.fortAngle) * 0.8;
    spots.push({ x: Math.cos(p.fortAngle) * d, y: Math.sin(p.fortAngle) * d, r: Math.max(14, Math.min(30, r * 0.25)) });
  }
  const pickAngle = () => {
    let best = rnd() * TAU;
    let bestGap = -1;
    for (let k = 0; k < 10; k++) {
      const a = rnd() * TAU;
      const gap = taken.reduce((g, t) => Math.min(g, Math.abs(Math.atan2(Math.sin(a - t), Math.cos(a - t)))), Math.PI);
      if (gap > bestGap) {
        best = a;
        bestGap = gap;
      }
      if (gap > 1.3) break;
    }
    taken.push(best);
    return best;
  };
  const harbourA = p.harbourAngle ?? null;
  if (harbourA !== null) {
    // the harbour town's streets: trees and landmarks keep off them
    taken.push(harbourA);
    const d = R(harbourA) * 0.72;
    spots.push({ x: Math.cos(harbourA) * d, y: Math.sin(harbourA) * d, r: Math.max(34, r * 0.42) });
  }
  const villageA = p.inhabited && harbourA === null ? pickAngle() : null;
  if (villageA !== null) {
    const d = R(villageA) * 0.78;
    spots.push({ x: Math.cos(villageA) * d, y: Math.sin(villageA) * d, r: 26 });
  }
  const marks: { kind: TerrainLandmark; a: number; x: number; y: number }[] = [];
  const wanted = T.landmarks.length && rnd() < 0.85 ? (r > 150 && rnd() < 0.5 ? 2 : 1) : 0;
  const hasPeak = T.peak !== 'none' && r >= (T.peak === 'volcano' ? 75 : 110);
  const peakR0 = hasPeak ? r * PEAK_SIZE[T.peak] : 0;
  for (let i = 0; i < wanted; i++) {
    const kind = T.landmarks[Math.floor(rnd() * T.landmarks.length)];
    if (marks.some((m) => m.kind === kind)) continue;
    const summit = SUMMIT.includes(kind);
    if (summit && r < 55) continue;
    if (summit && marks.some((m) => SUMMIT.includes(m.kind))) continue;
    const a = pickAngle();
    let d: number;
    if (summit) d = hasPeak ? r * 0.04 : R(a) * (0.05 + rnd() * 0.15);
    else if (OFFSHORE.includes(kind)) d = R(a) + (kind === 'causeway' ? 0 : 24);
    else if (SHORE.includes(kind)) d = R(a) * 0.86;
    else {
      // inland: well clear of the summit, well short of the beach
      d = Math.max(R(a) * (0.36 + rnd() * 0.2), peakR0 + landmarkSize(kind, r) + 4);
      if (d > R(a) * 0.72) d = R(a) * 0.72;
    }
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    marks.push({ kind, a, x, y });
    const size = landmarkSize(kind, r);
    if (!OFFSHORE.includes(kind)) spots.push({ x, y, r: size });
  }

  // ── paint ──────────────────────────────────────────────────────────────
  paintShallows(job);
  const inner = paintShore(job);
  p.ctx.save();
  p.ctx.clip(inner);
  paintGround(job);
  if (hasPeak) paintPeak(job);
  p.ctx.restore();
  paintTrees(job);
  for (const m of marks) if (m.kind === 'causeway') paintLandmark(job, m.kind, m.x, m.y, m.a);
  if (villageA !== null) paintVillage(job, villageA);
  for (const m of marks) if (m.kind !== 'causeway') paintLandmark(job, m.kind, m.x, m.y, m.a);
  paintOffshore(job);
}

function markScale(r: number) {
  return Math.max(7, Math.min(16, r * 0.11));
}

/** Rough footprint of a landmark, for keeping trees and each other off it. */
function landmarkSize(kind: TerrainLandmark, r: number) {
  const s = markScale(r);
  if (kind === 'oasis') return s * 2.6;
  if (kind === 'pyramid') return s * 2.4 * PYRAMID_SCALE;
  if (kind === 'pa') return s * 2.4;
  return s * 1.6;
}

const PYRAMID_SCALE = 1.3;

/** Summit radius, as a fraction of the island's. */
const PEAK_SIZE: Record<TerrainPeak, number> = {
  none: 0,
  limestone: 0.32,
  granite: 0.28,
  snowcap: 0.28,
  volcano: 0.42,
  jebel: 0.34,
};

/** An irregular closed outline, as a reusable path. */
function blob(x: number, y: number, rad: number, rnd: Rnd, n = 12, jitter = 0.3): Path2D {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const rr = rad * (1 - jitter / 2 + rnd() * jitter);
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  // smoothed: curve through the midpoints, using each point as the control
  const mid = (i: number): [number, number] => {
    const [ax, ay] = pts[i % n];
    const [bx, by] = pts[(i + 1) % n];
    return [(ax + bx) / 2, (ay + by) / 2];
  };
  const p = new Path2D();
  const [sx, sy] = mid(n - 1);
  p.moveTo(sx, sy);
  for (let i = 0; i < n; i++) {
    const [mx, my] = mid(i);
    p.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  p.closePath();
  return p;
}

function fillShifted(ctx: Ctx, path: Path2D, dx: number, dy: number, color: string) {
  ctx.save();
  ctx.translate(dx, dy);
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
}

// ── shallows and shore ────────────────────────────────────────────────────

function paintShallows(j: Job) {
  const { ctx, poly, theme, T } = j;
  if (T.offshore === 'flats' || T.shore === 'mud') {
    // tidal flats: a wide apron of wet mud, cut by runnels, under the shallows
    const mud = T.shore === 'mud' ? tone(theme.wetSand, -0.15) : tone(theme.wetSand, -0.05);
    ctx.fillStyle = alpha(mud, 0.28);
    ctx.fill(poly(1, 44, 7, 1));
    ctx.fillStyle = alpha(mud, 0.3);
    ctx.fill(poly(1, 26, 5, 2));
    ctx.strokeStyle = alpha(tone(mud, -0.35), 0.35);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) {
      const a = j.rnd() * TAU;
      const d0 = j.R(a) + 4;
      const len = 14 + j.rnd() * 30;
      let x = Math.cos(a) * d0;
      let y = Math.sin(a) * d0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        const aa = a + (j.rnd() - 0.5) * 0.9;
        x += Math.cos(aa) * (len / 4);
        y += Math.sin(aa) * (len / 4);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.fillStyle = theme.shallowFar;
  ctx.fill(poly(1, 52, 5, 1));
  ctx.fillStyle = theme.shallowMid;
  ctx.fill(poly(1, 33, 4, 2));
  ctx.fillStyle = theme.shallowNear;
  ctx.fill(poly(1, T.shore === 'chalk' || T.shore === 'rock' ? 11 : 16, 3, 3));
}

/** Paints the waterline and returns the path the ground cover fills. */
function paintShore(j: Job): Path2D {
  const { ctx, poly, theme, T, rnd, r, maxR, seed } = j;
  const land = poly(1, 0);
  const speckle = (n: number, colors: string[], min: number, max: number, near = false) => {
    ctx.save();
    ctx.clip(land);
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU;
      const d = near ? j.R(a) * (0.82 + rnd() * 0.2) : rnd() * maxR;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, min + rnd() * (max - min), min + rnd() * (max - min) * 0.7, rnd() * TAU, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  };
  const ws = seed % 7;
  switch (T.shore) {
    case 'shingle': {
      ctx.fillStyle = theme.wetSand;
      ctx.fill(poly(1, 4));
      ctx.fillStyle = theme.sand;
      ctx.fill(land);
      const g = tone(theme.wetSand, -0.2);
      speckle(Math.floor(r * 1.4), [g, tone(theme.sand, 0.25), tone(theme.wetSand, -0.35), '#8d8a84'], 0.8, 2.2, true);
      return poly(0.8, -5, 4, ws);
    }
    case 'chalk': {
      // white cliffs: a shadow at the foot, a streaked face, the downs on top
      ctx.fillStyle = 'rgba(0, 20, 30, 0.25)';
      ctx.save();
      ctx.translate(2, 3);
      ctx.fill(poly(1, 3));
      ctx.restore();
      ctx.fillStyle = theme.wetSand;
      ctx.fill(poly(1, 3, 1.5, 4));
      ctx.fillStyle = '#ece9dc';
      ctx.fill(land);
      ctx.save();
      ctx.clip(land);
      ctx.lineWidth = 1;
      for (let i = 0; i < r * 1.2; i++) {
        const a = (i / (r * 1.2)) * TAU + rnd() * 0.03;
        const d = j.R(a);
        // the sunlit north-west faces read bright, the south-east in shade
        const lit = Math.cos(a + Math.PI * 0.75);
        ctx.strokeStyle = lit > 0 ? 'rgba(255,255,250,0.5)' : `rgba(120,120,110,${0.25 - lit * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (d - 1), Math.sin(a) * (d - 1));
        ctx.lineTo(Math.cos(a) * (d - 7 - rnd() * 4), Math.sin(a) * (d - 7 - rnd() * 4));
        ctx.stroke();
      }
      ctx.restore();
      const top = poly(0.93, -6, 3, ws);
      ctx.fillStyle = 'rgba(80,80,70,0.35)';
      ctx.save();
      ctx.translate(1, 2);
      ctx.fill(top);
      ctx.restore();
      return top;
    }
    case 'mud': {
      ctx.fillStyle = tone(theme.wetSand, -0.25);
      ctx.fill(poly(1, 5, 2, 2));
      ctx.fillStyle = theme.wetSand;
      ctx.fill(land);
      speckle(Math.floor(r * 0.6), [tone(theme.wetSand, -0.2), tone(theme.sand, 0.1)], 1, 3, true);
      return poly(0.9, -3, 5, ws);
    }
    case 'reed': {
      ctx.fillStyle = tone(theme.wetSand, -0.2);
      ctx.fill(poly(1, 4, 2, 2));
      ctx.fillStyle = theme.wetSand;
      ctx.fill(land);
      // a reed fringe standing out into the water all round
      ctx.lineCap = 'round';
      const n = Math.floor(r * 1.3);
      for (let i = 0; i < n; i++) {
        const a = rnd() * TAU;
        const d = j.R(a) + (rnd() - 0.4) * 10;
        drawReeds(ctx, Math.cos(a) * d, Math.sin(a) * d, 3 + rnd() * 3, rnd, j.theme.greens, i % 5 === 0);
      }
      return poly(0.92, -4, 3, ws);
    }
    case 'rock':
    case 'guano': {
      const [dark, mid, light] = theme.peaks;
      ctx.fillStyle = 'rgba(0, 20, 30, 0.25)';
      ctx.save();
      ctx.translate(2, 3);
      ctx.fill(poly(1, 2));
      ctx.restore();
      ctx.fillStyle = tone(dark, -0.15);
      ctx.fill(poly(1, 2, 2, 5));
      ctx.fillStyle = mid;
      ctx.fill(land);
      // a sandy cove or two between the rocks
      const coves = 1 + Math.floor(rnd() * 3);
      for (let i = 0; i < coves; i++) {
        const a = rnd() * TAU;
        const d = j.R(a) * 0.88;
        ctx.fillStyle = theme.sand;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, 9 + rnd() * r * 0.1, 5 + rnd() * 4, a + Math.PI / 2, 0, TAU);
        ctx.fill();
      }
      // boulders all along the waterline
      const n = Math.floor(r * 0.9);
      for (let i = 0; i < n; i++) {
        const a = rnd() * TAU;
        const d = j.R(a) * (0.9 + rnd() * 0.1);
        drawBoulder(ctx, Math.cos(a) * d, Math.sin(a) * d, 2.5 + rnd() * 4.5, rnd, [dark, mid, light]);
      }
      if (T.shore === 'guano') {
        // seabird whitewash streaked down the seaward rocks
        ctx.save();
        ctx.clip(poly(1, 2));
        for (let i = 0; i < r * 0.8; i++) {
          const a = rnd() * TAU;
          const d = j.R(a) * (0.84 + rnd() * 0.16);
          ctx.fillStyle = `rgba(245,242,230,${0.45 + rnd() * 0.45})`;
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, 1.5 + rnd() * 4, 1 + rnd() * 2, a, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
      return poly(0.84, -5, 4, ws);
    }
    default: {
      ctx.fillStyle = theme.wetSand;
      ctx.fill(poly(1, 4));
      ctx.fillStyle = theme.sand;
      ctx.fill(land);
      speckle(80, [theme.sandDark, theme.sandLight], 1, 3.2);
      // a sand sea runs right down to the beach; elsewhere a narrow strand
      return T.ground === 'dunes' ? poly(0.96, -3, 3, ws) : poly(0.84, -5, 4, ws);
    }
  }
}

// ── ground cover ──────────────────────────────────────────────────────────

/** A random point on the island at a fraction of the shore distance. */
function inland(j: Job, lo: number, hi: number): [number, number, number] {
  const a = j.rnd() * TAU;
  const d = j.R(a) * (lo + Math.sqrt(j.rnd()) * (hi - lo));
  return [Math.cos(a) * d, Math.sin(a) * d, a];
}

function blobPath(ctx: Ctx, x: number, y: number, rad: number, rnd: Rnd, n = 8, jitter = 0.3) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const rr = rad * (1 - jitter / 2 + rnd() * jitter);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function mottle(j: Job, colors: string[], n: number, min: number, max: number, a: number) {
  const { ctx, rnd } = j;
  for (let i = 0; i < n; i++) {
    const [x, y] = inland(j, 0, 0.95);
    ctx.fillStyle = alpha(colors[i % colors.length], a);
    blobPath(ctx, x, y, min + rnd() * (max - min), rnd, 9, 0.45);
    ctx.fill();
  }
}

function paintGround(j: Job) {
  const { ctx, theme, T, rnd, r, maxR, seed } = j;
  const g = T.groundColor ?? theme.jungle;
  const greens = theme.greens;
  ctx.fillStyle = g;
  ctx.fillRect(-maxR - 60, -maxR - 60, (maxR + 60) * 2, (maxR + 60) * 2);
  const axis = (seed % 628) / 100;
  /** Is a point in the field grid's rotated frame anywhere near the island? */
  const onIsland = (px: number, py: number, pad: number) => Math.hypot(px, py) < j.R(Math.atan2(py, px) + axis) + pad;

  switch (T.ground) {
    case 'scrub': {
      // garrigue: dry ground, pale rock and dark cushions of maquis
      mottle(j, [theme.sand, tone(g, -0.15), greens[3] ?? g], Math.floor(r * 0.12), r * 0.08, r * 0.2, 0.28);
      for (let i = 0; i < r * 0.12; i++) {
        const [x, y] = inland(j, 0, 0.9);
        drawBoulder(ctx, x, y, 2 + rnd() * 3.5, rnd, theme.peaks);
      }
      for (let i = 0; i < r * 1.1; i++) {
        const [x, y] = inland(j, 0, 1);
        const s = 1.6 + rnd() * 3;
        ctx.fillStyle = 'rgba(30,30,10,0.25)';
        ctx.beginPath();
        ctx.arc(x + 1, y + 1.5, s, 0, TAU);
        ctx.fill();
        ctx.fillStyle = tone(greens[i % greens.length], -0.12);
        ctx.beginPath();
        ctx.arc(x, y, s, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'moor': {
      // heather and bracken over peat, with the bones of the rock showing
      mottle(j, ['#6e4a68', '#7d5a74', '#8a6f3c', tone(g, 0.12)], Math.floor(r * 0.25), r * 0.06, r * 0.16, 0.55);
      ctx.strokeStyle = alpha(tone(g, 0.25), 0.4);
      ctx.lineWidth = 1;
      for (let i = 0; i < r * 1.2; i++) {
        const [x, y] = inland(j, 0, 1);
        const len = 2 + rnd() * 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y - len * 0.3);
        ctx.stroke();
      }
      for (let i = 0; i < r * 0.1; i++) {
        const [x, y] = inland(j, 0.1, 0.9);
        drawBoulder(ctx, x, y, 3 + rnd() * 5, rnd, theme.peaks);
      }
      break;
    }
    case 'marsh': {
      mottle(j, [tone(g, 0.15), tone(g, -0.12), theme.wetSand], Math.floor(r * 0.16), r * 0.07, r * 0.18, 0.45);
      paintCreek(j, axis);
      for (let i = 0; i < r * 0.09; i++) {
        const [x, y] = inland(j, 0, 0.85);
        const w = 4 + rnd() * r * 0.07;
        ctx.fillStyle = alpha(theme.wetSand, 0.8);
        ctx.beginPath();
        ctx.ellipse(x, y, w + 2, w * 0.6 + 2, axis, 0, TAU);
        ctx.fill();
        ctx.fillStyle = j.pool;
        ctx.beginPath();
        ctx.ellipse(x, y, w, w * 0.6, axis, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.ellipse(x - w * 0.25, y - w * 0.15, w * 0.4, w * 0.2, axis, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'dunes': {
      // sand sea: crescent dune crests all lying to the same wind
      ctx.fillStyle = theme.sand;
      ctx.fillRect(-maxR - 60, -maxR - 60, (maxR + 60) * 2, (maxR + 60) * 2);
      mottle(j, [theme.wetSand, tone(theme.sand, 0.2)], Math.floor(r * 0.1), r * 0.1, r * 0.25, 0.3);
      ctx.lineCap = 'round';
      const wind = 0.6;
      for (let i = 0; i < r * 0.35; i++) {
        const [x, y] = inland(j, 0, 1);
        const w = 7 + rnd() * r * 0.1;
        ctx.fillStyle = alpha(tone(theme.wetSand, -0.1), 0.45);
        ctx.beginPath();
        ctx.ellipse(x + w * 0.2, y + w * 0.2, w, w * 0.45, wind, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = alpha(tone(theme.sand, 0.45), 0.8);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(x, y, w, w * 0.45, wind, Math.PI * 0.05, Math.PI * 0.95);
        ctx.stroke();
      }
      ctx.strokeStyle = alpha(tone(theme.wetSand, -0.1), 0.35);
      ctx.lineWidth = 0.8;
      for (let i = 0; i < r * 0.5; i++) {
        const [x, y] = inland(j, 0, 1);
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 2);
        ctx.quadraticCurveTo(x, y + 1, x + 4, y - 2);
        ctx.stroke();
      }
      for (let i = 0; i < r * 0.12; i++) {
        const [x, y] = inland(j, 0, 1);
        ctx.fillStyle = greens[i % greens.length];
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + rnd() * 1.8, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'bocage':
    case 'fields': {
      // a patchwork of fields — hedged in Brittany, ditched along the Nile
      const bocage = T.ground === 'bocage';
      const cell = bocage ? 22 + rnd() * 10 : 16 + rnd() * 6;
      const colors = bocage
        ? [tone(g, 0.1), tone(g, 0.22), '#b8a95e', '#8e7a52', tone(g, -0.05), '#a3a55a']
        : [tone(g, 0.12), '#c9b460', tone(g, -0.08), '#7fa040', '#d0bf78', tone(g, 0.25)];
      ctx.save();
      ctx.rotate(axis);
      const span = maxR + 20;
      const rows: number[] = [];
      for (let y = -span; y < span; y += cell * (0.7 + rnd() * 0.6)) rows.push(y);
      for (let k = 0; k < rows.length; k++) {
        const y0 = rows[k];
        const y1 = rows[k + 1] ?? span;
        let x = -span;
        while (x < span) {
          const w = cell * (0.8 + rnd() * 1.1);
          if (!onIsland(x + w / 2, (y0 + y1) / 2, cell * 1.5)) {
            x += w;
            continue;
          }
          ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
          ctx.fillRect(x, y0, w, y1 - y0);
          // furrows
          ctx.strokeStyle = 'rgba(0,0,0,0.07)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          const vertical = rnd() < 0.5;
          if (vertical) for (let fx = x + 3; fx < x + w; fx += 3) (ctx.moveTo(fx, y0), ctx.lineTo(fx, y1));
          else for (let fy = y0 + 3; fy < y1; fy += 3) (ctx.moveTo(x, fy), ctx.lineTo(x + w, fy));
          ctx.stroke();
          if (bocage) {
            ctx.strokeStyle = tone(g, -0.35);
            ctx.lineWidth = 2.4;
            ctx.strokeRect(x, y0, w, y1 - y0);
          } else {
            ctx.strokeStyle = j.pool;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x, y0);
            ctx.lineTo(x, y1);
            ctx.stroke();
          }
          x += w;
        }
        if (!bocage) {
          ctx.strokeStyle = j.pool;
          ctx.lineWidth = k % 3 === 0 ? 3 : 1.4;
          ctx.beginPath();
          ctx.moveTo(-span, y0);
          ctx.lineTo(span, y0);
          ctx.stroke();
        }
      }
      if (bocage) {
        // hedgerow bushes along the field boundaries
        for (let k = 0; k < rows.length; k++) {
          for (let x = -span; x < span; x += 5 + rnd() * 6) {
            if (!onIsland(x, rows[k], 6)) continue;
            ctx.fillStyle = greens[Math.floor(rnd() * greens.length)];
            ctx.beginPath();
            ctx.arc(x, rows[k] + (rnd() - 0.5) * 2, 1.6 + rnd() * 1.4, 0, TAU);
            ctx.fill();
          }
        }
      }
      ctx.restore();
      break;
    }
    case 'forest': {
      ctx.fillStyle = tone(g, -0.1);
      ctx.fillRect(-maxR - 60, -maxR - 60, (maxR + 60) * 2, (maxR + 60) * 2);
      for (let i = 0; i < r * 0.5; i++) {
        const [x, y] = inland(j, 0, 1);
        const br = r * (0.04 + rnd() * 0.05);
        ctx.fillStyle = theme.blobShadow;
        ctx.beginPath();
        ctx.arc(x + 1.5, y + 2, br, 0, TAU);
        ctx.fill();
        ctx.fillStyle = tone(greens[i % greens.length], -0.1);
        ctx.beginPath();
        ctx.arc(x, y, br, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'chinampas': {
      // floating gardens: long plots between canals, maize in rows, marigolds
      ctx.fillStyle = j.pool;
      ctx.fillRect(-maxR - 60, -maxR - 60, (maxR + 60) * 2, (maxR + 60) * 2);
      ctx.save();
      ctx.rotate(axis);
      const span = maxR + 20;
      const plots = [tone(g, 0.05), tone(g, 0.18), '#8a9a3a', tone(g, -0.08), '#9aa850'];
      for (let y = -span; y < span; y += 13 + rnd() * 3) {
        let x = -span;
        while (x < span) {
          const w = 34 + rnd() * 50;
          const h = 9 + rnd() * 2;
          if (!onIsland(x + w / 2, y + h / 2, w * 0.6 + 6)) {
            x += w + 4;
            continue;
          }
          ctx.fillStyle = tone(theme.wetSand, -0.1);
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = plots[Math.floor(rnd() * plots.length)];
          ctx.fillRect(x + 0.8, y + 0.8, w - 1.6, h - 1.6);
          const crop = rnd();
          if (crop < 0.55) {
            // maize rows
            ctx.strokeStyle = crop < 0.3 ? '#5f7f2a' : '#b9a24a';
            ctx.lineWidth = 1.3;
            ctx.setLineDash([1.3, 1.3]);
            ctx.beginPath();
            for (let cy = y + 3; cy < y + h - 1.5; cy += 2.6) (ctx.moveTo(x + 2, cy), ctx.lineTo(x + w - 1.5, cy));
            ctx.stroke();
            ctx.setLineDash([]);
          } else if (crop < 0.7) {
            // flowers
            for (let k = 0; k < w / 3; k++) {
              ctx.fillStyle = k % 3 ? '#e8952a' : '#f2c84a';
              ctx.beginPath();
              ctx.arc(x + 2 + rnd() * (w - 4), y + 2 + rnd() * (h - 4), 1, 0, TAU);
              ctx.fill();
            }
          }
          // ahuejote willows pinning the plot's edges
          for (let wx = x + 4; wx < x + w - 2; wx += 9 + rnd() * 5) {
            ctx.fillStyle = 'rgba(0,30,10,0.25)';
            ctx.beginPath();
            ctx.ellipse(wx + 1.5, y + 2, 1.8, 3.2, 0.5, 0, TAU);
            ctx.fill();
            ctx.fillStyle = greens[Math.floor(rnd() * greens.length)];
            ctx.beginPath();
            ctx.arc(wx, y + 0.5, 1.8, 0, TAU);
            ctx.fill();
          }
          x += w + 3 + rnd() * 2;
        }
      }
      ctx.restore();
      break;
    }
    case 'barren': {
      mottle(j, [tone(g, 0.15), tone(g, -0.15), theme.sand], Math.floor(r * 0.2), r * 0.06, r * 0.18, 0.4);
      // dry gullies
      ctx.strokeStyle = alpha(tone(g, -0.35), 0.45);
      ctx.lineWidth = 1;
      for (let i = 0; i < 6 + r * 0.04; i++) {
        const [x, y, a] = inland(j, 0.1, 0.5);
        let px = x;
        let py = y;
        ctx.beginPath();
        ctx.moveTo(px, py);
        for (let k = 0; k < 6; k++) {
          const aa = a + (rnd() - 0.5) * 1.2;
          px += Math.cos(aa) * 6;
          py += Math.sin(aa) * 6;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (let i = 0; i < r * 0.5; i++) {
        const [x, y] = inland(j, 0, 1);
        ctx.fillStyle = i % 2 ? tone(g, -0.25) : tone(g, 0.25);
        ctx.beginPath();
        ctx.arc(x, y, 0.8 + rnd() * 1.6, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'terraces': {
      // hills worked into contour terraces, each held up by a dry-stone wall
      mottle(j, [tone(g, 0.12), tone(g, -0.1)], Math.floor(r * 0.1), r * 0.08, r * 0.2, 0.35);
      const steps = r > 140 ? 5 : r > 95 ? 4 : 3;
      for (let k = 0; k < steps; k++) {
        const m = 0.78 - (k / steps) * 0.62;
        const ring = j.poly(m, -2, 3, seed + k);
        ctx.fillStyle = alpha(tone(g, k % 2 ? 0.12 : -0.06), 0.8);
        ctx.fill(ring);
        ctx.save();
        ctx.translate(1, 2);
        ctx.strokeStyle = alpha(tone(g, -0.5), 0.7);
        ctx.lineWidth = 2.4;
        ctx.stroke(ring);
        ctx.restore();
        ctx.strokeStyle = alpha(j.stone, 0.9);
        ctx.lineWidth = 1.3;
        ctx.stroke(ring);
      }
      break;
    }
    case 'grass': {
      mottle(j, [tone(g, 0.15), tone(g, -0.12), greens[3] ?? g], Math.floor(r * 0.22), r * 0.06, r * 0.16, 0.45);
      ctx.strokeStyle = alpha(tone(g, 0.3), 0.5);
      ctx.lineWidth = 0.9;
      for (let i = 0; i < r * 1.3; i++) {
        const [x, y] = inland(j, 0, 1);
        ctx.beginPath();
        ctx.moveTo(x - 1.5, y + 1.5);
        ctx.lineTo(x, y - 1.5);
        ctx.lineTo(x + 1.5, y + 1.5);
        ctx.stroke();
      }
      break;
    }
  }
}

/** A tidal creek meandering across a marsh island. */
function paintCreek(j: Job, axis: number) {
  const { ctx, rnd } = j;
  const a0 = axis + (rnd() - 0.5) * 0.6;
  const a1 = a0 + Math.PI + (rnd() - 0.5) * 0.8;
  const p0: [number, number] = [Math.cos(a0) * j.R(a0) * 1.05, Math.sin(a0) * j.R(a0) * 1.05];
  const p1: [number, number] = [Math.cos(a1) * j.R(a1) * 0.4, Math.sin(a1) * j.R(a1) * 0.4];
  const c1: [number, number] = [(rnd() - 0.5) * j.r, (rnd() - 0.5) * j.r];
  const c2: [number, number] = [(rnd() - 0.5) * j.r, (rnd() - 0.5) * j.r];
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p1[0], p1[1]);
  };
  ctx.lineCap = 'round';
  path();
  ctx.strokeStyle = j.theme.wetSand;
  ctx.lineWidth = 9;
  ctx.stroke();
  path();
  ctx.strokeStyle = j.pool;
  ctx.lineWidth = 5;
  ctx.stroke();
}

// ── summits ───────────────────────────────────────────────────────────────

function paintPeak(j: Job) {
  const { ctx, theme, T, rnd, r } = j;
  const [dark, mid, light] = theme.peaks;
  const size = r * PEAK_SIZE[T.peak];
  j.peakR = size;
  switch (T.peak) {
    case 'limestone': {
      // bleached, fissured karst stepping up to a pale crown
      const outer = blob(0, 0, size, rnd, 16, 0.35);
      fillShifted(ctx, outer, 2, 3, 'rgba(40,40,20,0.25)');
      ctx.fillStyle = dark;
      ctx.fill(outer);
      const midP = blob(-1, -1.5, size * 0.66, rnd, 13, 0.35);
      fillShifted(ctx, midP, 1.2, 2, alpha(tone(dark, -0.3), 0.4));
      ctx.fillStyle = mid;
      ctx.fill(midP);
      const top = blob(-2, -3, size * 0.32, rnd, 10, 0.35);
      fillShifted(ctx, top, 1, 1.6, alpha(tone(dark, -0.3), 0.4));
      ctx.fillStyle = light;
      ctx.fill(top);
      ctx.strokeStyle = alpha(tone(dark, -0.45), 0.45);
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 12; i++) {
        const a = rnd() * TAU;
        const d0 = size * (0.2 + rnd() * 0.3);
        const d1 = d0 + size * (0.2 + rnd() * 0.25);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * d0, Math.sin(a) * d0);
        ctx.lineTo(Math.cos(a + 0.1) * (d0 + d1) / 2, Math.sin(a + 0.1) * (d0 + d1) / 2);
        ctx.lineTo(Math.cos(a) * d1, Math.sin(a) * d1);
        ctx.stroke();
      }
      break;
    }
    case 'granite':
    case 'snowcap': {
      // a knot of rounded, cracked rock domes breaking through the cover
      const domes = 6 + Math.floor(rnd() * 4);
      const pts: [number, number, number][] = [];
      for (let i = 0; i < domes; i++) {
        const a = rnd() * TAU;
        const d = i === 0 ? 0 : Math.sqrt(rnd()) * size * 0.62;
        pts.push([Math.cos(a) * d, Math.sin(a) * d, size * (i === 0 ? 0.42 : 0.2 + rnd() * 0.18)]);
      }
      // back to front, so the nearer domes overlap the farther ones
      pts.sort((p, q) => p[1] - q[1]);
      for (const [x, y, w] of pts) {
        const outline = blob(x, y, w, rnd, 10, 0.25);
        fillShifted(ctx, outline, 2, 3, 'rgba(10,20,20,0.3)');
        ctx.fillStyle = dark;
        ctx.fill(outline);
        ctx.fillStyle = mid;
        ctx.fill(blob(x - w * 0.15, y - w * 0.2, w * 0.72, rnd, 9, 0.25));
        ctx.fillStyle = alpha(light, 0.75);
        ctx.beginPath();
        ctx.ellipse(x - w * 0.35, y - w * 0.4, w * 0.3, w * 0.2, -0.5, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = alpha(tone(dark, -0.45), 0.55);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.55, y + w * 0.15);
        ctx.lineTo(x + w * 0.05, y - w * 0.05);
        ctx.lineTo(x + w * 0.45, y + w * 0.35);
        ctx.stroke();
      }
      if (T.peak === 'snowcap') {
        // old snow lying in the hollows of the summit
        for (let i = 0; i < 7; i++) {
          const a = rnd() * TAU;
          const d = i === 0 ? 0 : rnd() * size * 0.45;
          const w = size * (i === 0 ? 0.28 : 0.08 + rnd() * 0.1);
          const flake = blob(Math.cos(a) * d - 1, Math.sin(a) * d - 1, w, rnd, 9, 0.45);
          fillShifted(ctx, flake, 0.8, 1.2, 'rgba(150,170,190,0.7)');
          ctx.fillStyle = '#f2f5f8';
          ctx.fill(flake);
        }
      }
      break;
    }
    case 'volcano': {
      // a grassed-over cone with a crater in its crown
      const g = T.groundColor ?? theme.jungle;
      const cone = blob(0, 0, size, rnd, 18, 0.12);
      fillShifted(ctx, cone, 3, 4, 'rgba(10,30,20,0.3)');
      ctx.fillStyle = tone(g, -0.22);
      ctx.fill(cone);
      ctx.fillStyle = tone(g, -0.06);
      ctx.fill(blob(-1, -1.5, size * 0.84, rnd, 16, 0.1));
      ctx.fillStyle = tone(g, 0.1);
      ctx.fill(blob(-2, -3, size * 0.6, rnd, 16, 0.1));
      ctx.strokeStyle = alpha(tone(g, -0.4), 0.35);
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU + rnd() * 0.2;
        const d0 = size * 0.3;
        const d1 = size * (0.8 + rnd() * 0.15);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * d0, Math.sin(a) * d0);
        ctx.lineTo(Math.cos(a) * d1, Math.sin(a) * d1);
        ctx.stroke();
      }
      const cr = size * 0.24;
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(0, 0, cr + 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(0.8, 1.2, cr, 0, TAU);
      ctx.fill();
      ctx.fillStyle = alpha(mid, 0.8);
      ctx.beginPath();
      ctx.arc(-cr * 0.25, -cr * 0.25, cr * 0.55, 0, TAU);
      ctx.fill();
      break;
    }
    case 'jebel': {
      // a flat-topped desert rock, sheer on the shaded side
      const top = blob(0, 0, size, rnd, 13, 0.32);
      fillShifted(ctx, top, 5, 7, 'rgba(40,20,0,0.3)');
      fillShifted(ctx, top, 2, 3.5, dark);
      ctx.fillStyle = mid;
      ctx.fill(top);
      ctx.fillStyle = alpha(light, 0.7);
      ctx.fill(blob(-1, -1, size * 0.55, rnd, 11, 0.35));
      ctx.strokeStyle = alpha(tone(dark, -0.3), 0.5);
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 8; i++) {
        const a = rnd() * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * size * 0.9, Math.sin(a) * size * 0.9);
        ctx.lineTo(Math.cos(a + 0.1) * size * 0.55, Math.sin(a + 0.1) * size * 0.55);
        ctx.stroke();
      }
      break;
    }
    case 'none':
      break;
  }
}

// ── trees ─────────────────────────────────────────────────────────────────

/** Trees that crowd the water's edge rather than the interior. */
const EDGE_TREES: TerrainTree[] = ['pohutukawa', 'reeds', 'papyrus'];

function paintTrees(j: Job) {
  const { T, rnd, r } = j;
  for (const [kind, density] of T.trees) {
    const n = Math.round(density * r * 0.22);
    const edge = EDGE_TREES.includes(kind);
    // groves: olives and cypresses stand in rows, the rest scatter
    const grove = kind === 'olive' || kind === 'cypress';
    let placed = 0;
    for (let tries = 0; placed < n && tries < n * 6; tries++) {
      const a = rnd() * TAU;
      const f = edge ? 0.74 + rnd() * 0.2 : Math.sqrt(rnd()) * 0.8;
      const d = j.R(a) * f;
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      if (!j.free(x, y, 6)) continue;
      if (j.peakR && Math.hypot(x, y) < j.peakR && kind !== 'blackPine') continue;
      if (grove) {
        const len = 2 + Math.floor(rnd() * 4);
        const dir = rnd() * TAU;
        const gap = kind === 'olive' ? 9 : 5.5;
        for (let k = 0; k < len && placed < n; k++) {
          const tx = x + Math.cos(dir) * gap * k;
          const ty = y + Math.sin(dir) * gap * k;
          const ta = Math.atan2(ty, tx);
          if (Math.hypot(tx, ty) > j.R(ta) * 0.84 || !j.free(tx, ty, 5)) break;
          drawTree(j, kind, tx, ty);
          placed++;
        }
      } else {
        drawTree(j, kind, x, y);
        placed++;
      }
    }
  }
}

function drawTree(j: Job, kind: TerrainTree, x: number, y: number) {
  const { ctx, rnd, theme } = j;
  const dark = theme.palmDark;
  const light = theme.palmLight;
  switch (kind) {
    case 'pine': {
      // a conifer from above: stacked star-shaped whorls, darkest outside
      const s = 5 + rnd() * 4;
      ctx.fillStyle = 'rgba(0,15,10,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + s * 0.5, y + s * 0.7, s, s * 0.85, 0.6, 0, TAU);
      ctx.fill();
      const rot = rnd() * TAU;
      const layers = [tone(dark, -0.2), dark, light];
      layers.forEach((col, k) => {
        const rr = s * (1 - k * 0.3);
        ctx.fillStyle = col;
        ctx.beginPath();
        const pts = 9;
        for (let i = 0; i <= pts * 2; i++) {
          const a = rot + k * 0.3 + (i / (pts * 2)) * TAU;
          const rad = i % 2 ? rr * 0.62 : rr;
          const px = x - k * 0.5 + Math.cos(a) * rad;
          const py = y - k * 0.5 + Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      });
      ctx.fillStyle = tone(light, 0.2);
      ctx.beginPath();
      ctx.arc(x - 1.2, y - 1.2, s * 0.15, 0, TAU);
      ctx.fill();
      break;
    }
    case 'cypress': {
      // a tall dark spire: small crown, long shadow
      const s = 2.6 + rnd() * 1.4;
      ctx.fillStyle = 'rgba(0,15,5,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + s * 2.2, y + s * 2.4, s * 3.1, s * 0.8, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(dark, -0.35);
      ctx.beginPath();
      ctx.ellipse(x, y, s, s * 1.15, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(dark, -0.1);
      ctx.beginPath();
      ctx.ellipse(x - s * 0.3, y - s * 0.3, s * 0.5, s * 0.6, Math.PI / 4, 0, TAU);
      ctx.fill();
      break;
    }
    case 'olive': {
      // silvery, knotted little crowns
      const s = 3 + rnd() * 2;
      ctx.fillStyle = 'rgba(30,30,10,0.28)';
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 2, s, 0, TAU);
      ctx.fill();
      const silver = mix(dark, '#b8c0a0', 0.45);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU + rnd();
        ctx.fillStyle = k % 2 ? silver : tone(silver, -0.12);
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4, s * 0.62, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = alpha('#e6ead2', 0.5);
      ctx.beginPath();
      ctx.arc(x - s * 0.35, y - s * 0.35, s * 0.3, 0, TAU);
      ctx.fill();
      break;
    }
    case 'oak': {
      const s = 5 + rnd() * 4;
      ctx.fillStyle = 'rgba(0,20,5,0.3)';
      ctx.beginPath();
      ctx.arc(x + 2, y + 3, s, 0, TAU);
      ctx.fill();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + rnd() * 0.5;
        ctx.fillStyle = k % 2 ? dark : tone(dark, -0.12);
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * s * 0.45, y + Math.sin(a) * s * 0.45, s * 0.58, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(x - s * 0.25, y - s * 0.25, s * 0.45, 0, TAU);
      ctx.fill();
      break;
    }
    case 'date':
      drawDatePalm(ctx, x, y, 7 + rnd() * 4, rnd, theme);
      break;
    case 'blackPine': {
      // Japanese black pine: flat cloud-pads of needles on a crooked trunk
      const s = 6 + rnd() * 4;
      const pads = 3 + Math.floor(rnd() * 3);
      const pts: [number, number, number][] = [];
      for (let k = 0; k < pads; k++) {
        const a = rnd() * TAU;
        const d = k === 0 ? 0 : s * (0.5 + rnd() * 0.6);
        pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d, s * (0.45 + rnd() * 0.3)]);
      }
      ctx.strokeStyle = '#4a3526';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const [px, py] of pts) {
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo((x + px) / 2 + 1.5, (y + py) / 2 - 1.5, px, py);
      }
      ctx.stroke();
      for (const [px, py, pr] of pts) {
        ctx.fillStyle = 'rgba(0,15,10,0.3)';
        ctx.beginPath();
        ctx.ellipse(px + 2, py + 3, pr * 1.2, pr * 0.8, 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = tone(dark, -0.25);
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 1.2, pr * 0.8, 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.ellipse(px - pr * 0.2, py - pr * 0.2, pr * 0.85, pr * 0.5, 0.3, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'pohutukawa': {
      // the New Zealand Christmas tree: broad dark crown freckled crimson
      const s = 6 + rnd() * 4;
      ctx.fillStyle = 'rgba(0,20,10,0.3)';
      ctx.beginPath();
      ctx.arc(x + 2, y + 3, s, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(dark, -0.2);
      blobPath(ctx, x, y, s, rnd, 9, 0.35);
      ctx.fill();
      ctx.fillStyle = dark;
      blobPath(ctx, x - s * 0.2, y - s * 0.2, s * 0.65, rnd, 8, 0.35);
      ctx.fill();
      for (let k = 0; k < 10; k++) {
        const a = rnd() * TAU;
        const d = Math.sqrt(rnd()) * s * 0.85;
        ctx.fillStyle = k % 3 ? '#c8232c' : '#e8474a';
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.9 + rnd() * 0.9, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'fern': {
      // tree fern: a lacy rosette of fronds
      const s = 5 + rnd() * 3;
      ctx.fillStyle = 'rgba(0,20,10,0.25)';
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 2.5, s * 0.9, 0, TAU);
      ctx.fill();
      ctx.lineCap = 'round';
      const n = 8;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + rnd() * 0.3;
        const ex = x + Math.cos(a) * s;
        const ey = y + Math.sin(a) * s;
        ctx.strokeStyle = k % 2 ? light : tone(light, 0.15);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        for (let t = 0.3; t < 1; t += 0.2) {
          const mx = x + Math.cos(a) * s * t;
          const my = y + Math.sin(a) * s * t;
          const l = s * 0.28 * (1 - t * 0.6);
          ctx.moveTo(mx + Math.cos(a + 1.2) * l, my + Math.sin(a + 1.2) * l);
          ctx.lineTo(mx, my);
          ctx.lineTo(mx + Math.cos(a - 1.2) * l, my + Math.sin(a - 1.2) * l);
        }
        ctx.stroke();
      }
      ctx.fillStyle = '#5a4630';
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, TAU);
      ctx.fill();
      break;
    }
    case 'cactus': {
      // a candelabra cactus: ribbed stems and a long hard shadow
      const s = 2 + rnd() * 1.5;
      const arms = 1 + Math.floor(rnd() * 3);
      ctx.fillStyle = 'rgba(40,20,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + s * 2.5, y + s * 2.5, s * 3, s * 0.7, Math.PI / 4, 0, TAU);
      ctx.fill();
      const stems: [number, number, number][] = [[x, y, s]];
      for (let k = 0; k < arms; k++) {
        const a = rnd() * TAU;
        stems.push([x + Math.cos(a) * s * 1.7, y + Math.sin(a) * s * 1.7, s * 0.7]);
      }
      for (const [sx, sy, sr] of stems) {
        ctx.fillStyle = '#4f6b3f';
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#7d9a62';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU;
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(a) * sr, sy + Math.sin(a) * sr);
        }
        ctx.stroke();
      }
      break;
    }
    case 'willow': {
      const s = 2.5 + rnd() * 1.5;
      ctx.fillStyle = 'rgba(0,25,10,0.28)';
      ctx.beginPath();
      ctx.ellipse(x + s * 1.6, y + s * 1.8, s * 2.4, s * 0.9, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, TAU);
      ctx.fill();
      break;
    }
    case 'reeds':
      drawReeds(ctx, x, y, 4 + rnd() * 3, rnd, theme.greens, rnd() < 0.4);
      break;
    case 'papyrus': {
      // papyrus: a clump of stems, each crowned with a starburst umbel
      const n = 4 + Math.floor(rnd() * 4);
      for (let k = 0; k < n; k++) {
        const a = rnd() * TAU;
        const d = rnd() * 5;
        const ux = x + Math.cos(a) * d;
        const uy = y + Math.sin(a) * d;
        const s = 2.5 + rnd() * 1.8;
        ctx.strokeStyle = k % 2 ? light : tone(light, 0.2);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let q = 0; q < 10; q++) {
          const qa = (q / 10) * TAU;
          ctx.moveTo(ux, uy);
          ctx.lineTo(ux + Math.cos(qa) * s, uy + Math.sin(qa) * s);
        }
        ctx.stroke();
        ctx.fillStyle = tone(dark, -0.2);
        ctx.beginPath();
        ctx.arc(ux, uy, 0.7, 0, TAU);
        ctx.fill();
      }
      break;
    }
  }
}

function drawReeds(ctx: Ctx, x: number, y: number, s: number, rnd: Rnd, greens: string[], heads: boolean) {
  // blades batched into two strokes — reed fringes run to hundreds of clumps
  ctx.lineCap = 'round';
  ctx.lineWidth = 0.9;
  const n = 5 + Math.floor(rnd() * 4);
  const green = new Path2D();
  const straw = new Path2D();
  const tips: [number, number, number][] = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + (rnd() - 0.5) * 2.2;
    const l = s * (0.6 + rnd() * 0.6);
    const ex = x + Math.cos(a) * l;
    const ey = y + Math.sin(a) * l;
    const p = k % 3 === 0 ? straw : green;
    p.moveTo(x, y);
    p.lineTo(ex, ey);
    if (heads && k % 3 === 1) tips.push([ex, ey, a]);
  }
  ctx.strokeStyle = greens[Math.floor(rnd() * greens.length)];
  ctx.stroke(green);
  ctx.strokeStyle = '#b5a65a';
  ctx.stroke(straw);
  ctx.fillStyle = '#6b4a2a';
  for (const [ex, ey, a] of tips) {
    ctx.beginPath();
    ctx.ellipse(ex, ey, 0.9, 1.6, a + Math.PI / 2, 0, TAU);
    ctx.fill();
  }
}

function drawDatePalm(ctx: Ctx, x: number, y: number, s: number, rnd: Rnd, theme: IslandTheme) {
  // many narrow, drooping fronds and clusters of orange dates at the crown
  ctx.fillStyle = 'rgba(40,25,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.7, y + s * 0.8, s, s * 0.7, 0.6, 0, TAU);
  ctx.fill();
  const n = 11;
  const rot = rnd() * TAU;
  const leaf = mix(theme.palmDark, '#8a9a6a', 0.35);
  for (let k = 0; k < n; k++) {
    const a = rot + (k / n) * TAU + (rnd() - 0.5) * 0.2;
    const len = s * (0.8 + rnd() * 0.3);
    ctx.fillStyle = k % 2 ? leaf : tone(leaf, 0.18);
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5, len * 0.52, s * 0.1, a, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = alpha(tone(leaf, -0.35), 0.7);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let k = 0; k < n; k++) {
    const a = rot + (k / n) * TAU;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * s * 0.9, y + Math.sin(a) * s * 0.9);
  }
  ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const a = rot + k * 2.1 + 0.4;
    ctx.fillStyle = k % 2 ? '#c8781e' : '#e0962a';
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * s * 0.22, y + Math.sin(a) * s * 0.22, s * 0.12, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = theme.palmTrunk;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.1, 0, TAU);
  ctx.fill();
}

function drawBoulder(ctx: Ctx, x: number, y: number, s: number, rnd: Rnd, colors: readonly string[]) {
  ctx.fillStyle = 'rgba(0,15,20,0.3)';
  ctx.beginPath();
  ctx.arc(x + s * 0.3, y + s * 0.45, s, 0, TAU);
  ctx.fill();
  ctx.fillStyle = colors[0];
  blobPath(ctx, x, y, s, rnd, 7, 0.35);
  ctx.fill();
  ctx.fillStyle = colors[1];
  blobPath(ctx, x - s * 0.18, y - s * 0.18, s * 0.66, rnd, 6, 0.3);
  ctx.fill();
  ctx.fillStyle = alpha(colors[2].startsWith('#') ? colors[2] : '#ffffff', 0.8);
  ctx.beginPath();
  ctx.arc(x - s * 0.35, y - s * 0.35, s * 0.28, 0, TAU);
  ctx.fill();
}

// ── villages ──────────────────────────────────────────────────────────────

const STONE_QUAYS: TerrainVillage[] = ['stone', 'terracotta', 'whitewash', 'japanese', 'stucco'];

function paintVillage(j: Job, a: number) {
  const { ctx, T, rnd } = j;
  const d = j.R(a);
  // the landing: a stone quay or a timber jetty
  ctx.save();
  ctx.translate(Math.cos(a) * (d - 4), Math.sin(a) * (d - 4));
  ctx.rotate(a);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(2, 0, 32, 8);
  if (STONE_QUAYS.includes(T.village)) {
    ctx.fillStyle = j.stone;
    ctx.fillRect(0, -4.5, 30, 9);
    ctx.fillStyle = tone(j.stone, 0.2);
    ctx.fillRect(0, -4.5, 30, 2);
    ctx.strokeStyle = tone(j.stone, -0.3);
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let k = 5; k < 30; k += 5) (ctx.moveTo(k, -4.5), ctx.lineTo(k, 4.5));
    ctx.moveTo(0, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    ctx.strokeRect(0, -4.5, 30, 9);
  } else {
    ctx.fillStyle = '#8a6338';
    ctx.fillRect(0, -3.5, 34, 7);
    ctx.strokeStyle = '#5a3d1f';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let k = 3; k < 34; k += 4) (ctx.moveTo(k, -3.5), ctx.lineTo(k, 3.5));
    ctx.stroke();
    ctx.fillStyle = '#4a3220';
    for (let k = 4; k < 34; k += 10) {
      ctx.beginPath();
      ctx.arc(k, -4, 1.2, 0, TAU);
      ctx.arc(k, 4, 1.2, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  const n = T.village === 'whitewash' || T.village === 'stucco' ? 6 : T.village === 'longhouse' ? 3 : 4;
  for (let k = 0; k < n; k++) {
    const aa = a + (k - (n - 1) / 2) * (T.village === 'whitewash' ? 0.09 : 0.15);
    const dd = j.R(aa) * (0.8 - (k % 2) * 0.09);
    drawBuilding(j, T.village, Math.cos(aa) * dd, Math.sin(aa) * dd, 9 + rnd() * 4, aa + (rnd() - 0.5) * 0.4, k);
  }

  // a boat hauled up on the beach
  const ca = a + 0.6;
  const cd = j.R(ca) * 0.95;
  ctx.save();
  ctx.translate(Math.cos(ca) * cd, Math.sin(ca) * cd);
  ctx.rotate(ca + 1.1);
  if (T.village === 'longhouse') {
    // a little longship: clinker hull, a row of shields
    ctx.fillStyle = '#5a3d22';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 3.4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#7a5632';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10.5, 2.2, 0, 0, TAU);
    ctx.fill();
    for (let k = -8; k <= 8; k += 4) {
      ctx.fillStyle = k % 8 ? '#c8a23a' : '#a8322a';
      ctx.beginPath();
      ctx.arc(k, -3, 1.3, 0, TAU);
      ctx.arc(k, 3, 1.3, 0, TAU);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = T.village === 'mudbrick' || T.village === 'whitewash' ? '#6b4a2a' : '#8a6338';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 2.8, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#5a3d20';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.5, 1.6, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** A pitched roof from above: a lit half, a shaded half and a ridge. */
function gable(ctx: Ctx, w: number, h: number, litCol: string, shadeCol: string, ridge: string) {
  ctx.fillStyle = litCol;
  ctx.fillRect(-w / 2, -h / 2, w, h / 2);
  ctx.fillStyle = shadeCol;
  ctx.fillRect(-w / 2, 0, w, h / 2);
  ctx.strokeStyle = ridge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(w / 2, 0);
  ctx.stroke();
}

function shadowRect(ctx: Ctx, w: number, h: number, k = 1) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(-w / 2 + 2 * k, -h / 2 + 3 * k, w, h);
}

function drawBuilding(j: Job, kind: TerrainVillage, x: number, y: number, s: number, rot: number, k: number) {
  const { ctx, rnd } = j;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  switch (kind) {
    case 'stone': {
      const w = s * 1.35;
      const h = s * 0.95;
      shadowRect(ctx, w, h);
      ctx.fillStyle = j.stone;
      ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      gable(ctx, w, h, '#6a7580', '#4b545e', '#2f363d');
      ctx.fillStyle = '#6b675f';
      ctx.fillRect(w / 2 - 3.5, -h / 2 + 1, 2.5, 2.5);
      break;
    }
    case 'longhouse': {
      // a long turf-roofed hall with bowed sides
      const w = s * 2.5;
      const h = s * 1.05;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(2, 3, w / 2, h / 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#6b4a2a';
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#6a7a44';
      ctx.beginPath();
      ctx.ellipse(0, -0.5, w / 2 - 1.5, h / 2 - 1, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = '#4e5d32';
      ctx.beginPath();
      ctx.ellipse(0, 0.5, w / 2 - 1.5, h / 2 - 1, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#3d4a26';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 2, 0);
      ctx.lineTo(w / 2 - 2, 0);
      ctx.stroke();
      ctx.fillStyle = '#2a2018';
      ctx.fillRect(-1.2, -1.2, 2.4, 2.4);
      ctx.fillStyle = 'rgba(200,200,200,0.35)';
      ctx.beginPath();
      ctx.arc(3, -3, 2.5, 0, TAU);
      ctx.arc(6, -5, 2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'clapboard': {
      const w = s * 1.3;
      const h = s * 0.95;
      shadowRect(ctx, w, h);
      ctx.fillStyle = '#efeee6';
      ctx.fillRect(-w / 2 - 1.2, -h / 2 - 1.2, w + 2.4, h + 2.4);
      if (k % 4 === 3) gable(ctx, w, h, '#a4483a', '#7e3328', '#4f1f18');
      else gable(ctx, w, h, '#8c8e92', '#686a70', '#45474c');
      ctx.fillStyle = '#7a3a2a';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 1, 2, 2);
      break;
    }
    case 'terracotta': {
      const w = s * 1.3;
      const h = s * 1.0;
      shadowRect(ctx, w, h);
      ctx.fillStyle = '#e2cf9c';
      ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      gable(ctx, w, h, '#d0703f', '#a8522c', '#7a3a1e');
      ctx.strokeStyle = 'rgba(90,35,15,0.35)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let t = -w / 2 + 2; t < w / 2; t += 2) (ctx.moveTo(t, -h / 2), ctx.lineTo(t, h / 2));
      ctx.stroke();
      if (k % 2 === 0) {
        // an L-shaped wing round a courtyard
        ctx.translate(-w / 2 + h * 0.35, h * 0.8);
        ctx.rotate(Math.PI / 2);
        shadowRect(ctx, h * 0.9, h * 0.7);
        gable(ctx, h * 0.9, h * 0.7, '#cc6a3a', '#9e4c28', '#7a3a1e');
      }
      break;
    }
    case 'whitewash': {
      // Cycladic cubes: flat white roofs, a blue door here and there
      const w = s * (0.8 + rnd() * 0.5);
      const h = s * (0.7 + rnd() * 0.4);
      ctx.fillStyle = 'rgba(0,10,30,0.28)';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
      ctx.fillStyle = '#f6f4ec';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#cfcabd';
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2);
      if (k % 2) {
        ctx.fillStyle = '#2f64a8';
        ctx.fillRect(w / 2 - 1, -1.5, 1.6, 3);
      }
      if (k === 2) {
        ctx.fillStyle = '#3a72b8';
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(w, h) * 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(-1, -1, Math.min(w, h) * 0.12, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'mudbrick':
    case 'adobe':
    case 'stucco': {
      // flat roofs behind a parapet
      const w = s * (0.95 + rnd() * 0.4);
      const h = s * (0.85 + rnd() * 0.3);
      const [wall, rim, trim] =
        kind === 'mudbrick' ? ['#c7a26f', '#dcbf8e', '#8a6a42'] : kind === 'adobe' ? ['#b39470', '#c8ab86', '#7a5e40'] : ['#ece6d6', '#faf6ea', '#a8322a'];
      shadowRect(ctx, w, h);
      ctx.fillStyle = rim;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = wall;
      ctx.fillRect(-w / 2 + 1.4, -h / 2 + 1.4, w - 2.8, h - 2.8);
      ctx.fillStyle = trim;
      if (kind === 'stucco') {
        ctx.strokeStyle = trim;
        ctx.lineWidth = 1;
        ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
      } else {
        ctx.fillRect(-1.2, -1.2, 2.4, 2.4);
      }
      if (kind === 'mudbrick' && k === 1) {
        // a wind-tower catching the breeze
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(w / 2 - 3, -h / 2 + 3, 5, 5);
        ctx.fillStyle = '#e0c898';
        ctx.fillRect(w / 2 - 5, -h / 2, 5, 5);
        ctx.strokeStyle = '#8a6a42';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 5, -h / 2);
        ctx.lineTo(w / 2, -h / 2 + 5);
        ctx.moveTo(w / 2, -h / 2);
        ctx.lineTo(w / 2 - 5, -h / 2 + 5);
        ctx.stroke();
      }
      break;
    }
    case 'japanese': {
      // a hipped roof of dark tile with a pale ridge cap
      const w = s * 1.4;
      const h = s * 1.0;
      shadowRect(ctx, w + 2, h + 2);
      ctx.fillStyle = '#565e68';
      ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      ctx.fillStyle = '#6a737e';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 1, -h / 2 - 1);
      ctx.lineTo(w / 2 + 1, -h / 2 - 1);
      ctx.lineTo(w / 2 - h / 2, 0);
      ctx.lineTo(-w / 2 + h / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3f454e';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 1, h / 2 + 1);
      ctx.lineTo(w / 2 + 1, h / 2 + 1);
      ctx.lineTo(w / 2 - h / 2, 0);
      ctx.lineTo(-w / 2 + h / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a8aeb4';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + h / 2, 0);
      ctx.lineTo(w / 2 - h / 2, 0);
      ctx.stroke();
      break;
    }
    case 'hanok': {
      // sweeping eaves: tiled or thatched
      const w = s * 1.4;
      const h = s * 1.0;
      const thatch = k % 2 === 1;
      const [lit, dim] = thatch ? ['#c9a860', '#a8883e'] : ['#5f666e', '#454b52'];
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
      if (thatch) {
        // choga: a thick, rounded straw roof tied down with rope
        const round = (ox: number, oy: number, ww: number, hh: number) => {
          const q = Math.min(ww, hh) * 0.45;
          ctx.beginPath();
          ctx.moveTo(ox - ww / 2 + q, oy - hh / 2);
          ctx.lineTo(ox + ww / 2 - q, oy - hh / 2);
          ctx.quadraticCurveTo(ox + ww / 2, oy - hh / 2, ox + ww / 2, oy - hh / 2 + q);
          ctx.lineTo(ox + ww / 2, oy + hh / 2 - q);
          ctx.quadraticCurveTo(ox + ww / 2, oy + hh / 2, ox + ww / 2 - q, oy + hh / 2);
          ctx.lineTo(ox - ww / 2 + q, oy + hh / 2);
          ctx.quadraticCurveTo(ox - ww / 2, oy + hh / 2, ox - ww / 2, oy + hh / 2 - q);
          ctx.lineTo(ox - ww / 2, oy - hh / 2 + q);
          ctx.quadraticCurveTo(ox - ww / 2, oy - hh / 2, ox - ww / 2 + q, oy - hh / 2);
          ctx.closePath();
        };
        ctx.fillStyle = dim;
        round(0, 0, w, h);
        ctx.fill();
        ctx.fillStyle = lit;
        round(-0.4, -0.8, w - 2, h - 2.4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(110,85,40,0.6)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let t = -w / 2 + 2.5; t < w / 2 - 1; t += 2.5) (ctx.moveTo(t, -h / 2 + 0.8), ctx.lineTo(t, h / 2 - 0.8));
        ctx.moveTo(-w / 2 + 1.5, 0);
        ctx.lineTo(w / 2 - 1.5, 0);
        ctx.stroke();
      } else {
        const curve = (sy: number, col: string) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(-w / 2 - 2, sy * (h / 2 + 2));
          ctx.quadraticCurveTo(0, sy * (h / 2 - 1.5), w / 2 + 2, sy * (h / 2 + 2));
          ctx.lineTo(w / 2 - 2, 0);
          ctx.lineTo(-w / 2 + 2, 0);
          ctx.closePath();
          ctx.fill();
        };
        curve(-1, lit);
        curve(1, dim);
        ctx.strokeStyle = '#d8dcd8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 1, 0);
        ctx.lineTo(w / 2 - 1, 0);
        ctx.stroke();
      }
      break;
    }
    case 'whare': {
      // raupō thatch with a carved red bargeboard at the porch end
      const w = s * 1.35;
      const h = s * 0.9;
      shadowRect(ctx, w, h);
      gable(ctx, w, h, '#a3895a', '#7f6840', '#5a4628');
      ctx.strokeStyle = '#9a2a1c';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(w / 2 + 1.5, -h / 2);
      ctx.lineTo(w / 2 - 1, 0);
      ctx.lineTo(w / 2 + 1.5, h / 2);
      ctx.stroke();
      ctx.fillStyle = '#f0e6d0';
      ctx.beginPath();
      ctx.arc(w / 2 - 1, 0, 0.9, 0, TAU);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// ── landmarks ─────────────────────────────────────────────────────────────

function paintLandmark(j: Job, kind: TerrainLandmark, x: number, y: number, a: number) {
  const { ctx, rnd, r } = j;
  const s = markScale(r);
  ctx.save();
  ctx.translate(x, y);
  switch (kind) {
    case 'lighthouse': {
      // a banded tower on the point, its lamp throwing a glow
      ctx.fillStyle = 'rgba(0,10,20,0.3)';
      ctx.beginPath();
      ctx.ellipse(s * 1.1, s * 1.3, s * 1.6, s * 0.5, Math.PI / 4, 0, TAU);
      ctx.fill();
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.6);
      glow.addColorStop(0, 'rgba(255,236,160,0.45)');
      glow.addColorStop(1, 'rgba(255,236,160,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, s * 2.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = j.stone;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.85, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f4f2ea';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.62, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#b3261e';
      ctx.lineWidth = s * 0.14;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.45, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffe07a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'screwpile': {
      // a Chesapeake screwpile light: a hexagonal cottage on iron legs
      ctx.rotate(a);
      ctx.fillStyle = 'rgba(0,15,20,0.3)';
      ctx.beginPath();
      ctx.arc(s * 0.4, s * 0.5, s * 1.1, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#3a3530';
      for (let k = 0; k < 6; k++) {
        const ka = (k / 6) * TAU;
        ctx.beginPath();
        ctx.arc(Math.cos(ka) * s * 1.05, Math.sin(ka) * s * 1.05, 1.1, 0, TAU);
        ctx.fill();
      }
      const hex = (rad: number) => {
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const ka = (k / 6) * TAU;
          if (k === 0) ctx.moveTo(Math.cos(ka) * rad, Math.sin(ka) * rad);
          else ctx.lineTo(Math.cos(ka) * rad, Math.sin(ka) * rad);
        }
        ctx.closePath();
      };
      ctx.fillStyle = '#f2efe6';
      hex(s * 0.9);
      ctx.fill();
      ctx.fillStyle = '#a8382c';
      hex(s * 0.72);
      ctx.fill();
      ctx.strokeStyle = '#6e2018';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const ka = (k / 6) * TAU;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ka) * s * 0.72, Math.sin(ka) * s * 0.72);
      }
      ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffe07a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.17, 0, TAU);
      ctx.fill();
      break;
    }
    case 'standingStones': {
      // a ring of standing stones in a trampled clearing
      ctx.fillStyle = alpha(tone(j.T.groundColor ?? j.theme.jungle, 0.25), 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, s * 1.4, 0, TAU);
      ctx.fill();
      const n = 9;
      for (let k = 0; k < n; k++) {
        const ka = (k / n) * TAU + rnd() * 0.15;
        const px = Math.cos(ka) * s * 1.05;
        const py = Math.sin(ka) * s * 1.05;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ka);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(-s * 0.1 + 1.5, -s * 0.16 + 3, s * 0.36, s * 0.32);
        ctx.fillStyle = '#8c8b86';
        ctx.fillRect(-s * 0.14, -s * 0.18, s * 0.32, s * 0.36);
        ctx.fillStyle = '#b4b3ad';
        ctx.fillRect(-s * 0.14, -s * 0.18, s * 0.32, s * 0.12);
        ctx.restore();
      }
      ctx.fillStyle = '#7a7974';
      ctx.fillRect(-s * 0.3, -s * 0.12, s * 0.6, s * 0.24);
      break;
    }
    case 'temple': {
      // a Doric temple: stylobate, colonnade and what is left of the roof
      ctx.rotate(a + Math.PI / 2);
      const w = s * 2.4;
      const h = s * 1.4;
      ctx.fillStyle = 'rgba(30,20,0,0.3)';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
      ctx.fillStyle = '#d8d0b8';
      ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
      ctx.fillStyle = '#ece6d2';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#d0c8ae';
      ctx.fillRect(-w * 0.32, -h * 0.26, w * 0.64, h * 0.52);
      // half the roof still on: terracotta over the east end
      ctx.fillStyle = '#b8643a';
      ctx.fillRect(0, -h / 2 + 1, w / 2 - 1, h / 2 - 1);
      ctx.fillStyle = '#95502c';
      ctx.fillRect(0, 0, w / 2 - 1, h / 2 - 1);
      const cols = 8;
      for (let k = 0; k < cols; k++) {
        const cx = -w / 2 + 1.6 + (k / (cols - 1)) * (w - 3.2);
        for (const cy of [-h / 2 + 1.6, h / 2 - 1.6]) {
          ctx.fillStyle = 'rgba(60,50,30,0.35)';
          ctx.beginPath();
          ctx.arc(cx + 0.6, cy + 0.9, 1.3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#faf7ec';
          ctx.beginPath();
          ctx.arc(cx, cy, 1.2, 0, TAU);
          ctx.fill();
        }
      }
      for (const cx of [-w / 2 + 1.6, w / 2 - 1.6]) {
        for (let k = 1; k < 3; k++) {
          const cy = -h / 2 + 1.6 + (k / 3) * (h - 3.2);
          ctx.fillStyle = '#faf7ec';
          ctx.beginPath();
          ctx.arc(cx, cy, 1.2, 0, TAU);
          ctx.fill();
        }
      }
      break;
    }
    case 'church': {
      // a cross-in-square church under a leaded central dome
      ctx.rotate(a);
      const w = s * 1.7;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-w / 2 + 3, -w / 2 + 4, w, w);
      ctx.fillStyle = '#c9b48a';
      ctx.fillRect(-w / 2 - 1, -w / 2 - 1, w + 2, w + 2);
      ctx.fillStyle = '#b5562e';
      ctx.fillRect(-w / 2, -w / 2, w, w);
      ctx.fillStyle = '#cf6c3f';
      ctx.fillRect(-w / 2, -w * 0.18, w, w * 0.36);
      ctx.fillRect(-w * 0.18, -w / 2, w * 0.36, w);
      ctx.fillStyle = '#b5562e';
      ctx.beginPath();
      ctx.arc(w / 2, 0, w * 0.2, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      const dome = (dx: number, dy: number, dr: number) => {
        const g = ctx.createRadialGradient(dx - dr * 0.35, dy - dr * 0.35, dr * 0.1, dx, dy, dr);
        g.addColorStop(0, '#b8c4c8');
        g.addColorStop(1, '#5d6a70');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(40,50,55,0.5)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const ka = (k / 8) * TAU;
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx + Math.cos(ka) * dr, dy + Math.sin(ka) * dr);
        }
        ctx.stroke();
      };
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) dome(dx * w * 0.32, dy * w * 0.32, w * 0.12);
      dome(0, 0, w * 0.3);
      ctx.fillStyle = '#e8c860';
      ctx.beginPath();
      ctx.arc(0, 0, 1.2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'windmill': {
      // a round white mill, conical cap and four lattice sails
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(s * 0.8, s * 1.0, s * 1.2, s * 0.6, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f2eee2';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.62, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#8a5a3a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.45, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#6a4228';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const ka = (k / 8) * TAU;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ka) * s * 0.45, Math.sin(ka) * s * 0.45);
      }
      ctx.stroke();
      const rot = rnd() * TAU;
      for (let k = 0; k < 4; k++) {
        const ka = rot + (k / 4) * TAU;
        ctx.save();
        ctx.rotate(ka);
        ctx.fillStyle = 'rgba(245,240,225,0.85)';
        ctx.fillRect(s * 0.3, 0, s * 1.3, s * 0.34);
        ctx.strokeStyle = '#4a3622';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 1.65, 0);
        ctx.stroke();
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        for (let t = s * 0.45; t < s * 1.6; t += s * 0.22) (ctx.moveTo(t, 0), ctx.lineTo(t, s * 0.34));
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.arc(0, 0, 1.3, 0, TAU);
      ctx.fill();
      break;
    }
    case 'obelisk': {
      // twin obelisks on a paved court, their long shadows across it
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = '#d6c69a';
      ctx.fillRect(-s * 1.3, -s * 0.9, s * 2.6, s * 1.8);
      ctx.strokeStyle = 'rgba(120,100,60,0.4)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-s * 1.3, -s * 0.9, s * 2.6, s * 1.8);
      ctx.rotate(-(a + Math.PI / 2));
      for (const ox of [-s * 0.6, s * 0.6]) {
        const px = Math.cos(a + Math.PI / 2) * ox;
        const py = Math.sin(a + Math.PI / 2) * ox;
        ctx.fillStyle = 'rgba(40,25,0,0.4)';
        ctx.beginPath();
        ctx.moveTo(px - 1.3, py + 1.3);
        ctx.lineTo(px + s * 2.3, py + s * 2.5);
        ctx.lineTo(px + 1.3, py - 1.3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#c4a878';
        ctx.fillRect(px - 2, py - 2, 4, 4);
        ctx.fillStyle = '#f0cf58';
        ctx.beginPath();
        ctx.moveTo(px - 2, py - 2);
        ctx.lineTo(px, py);
        ctx.lineTo(px + 2, py - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d8b040';
        ctx.beginPath();
        ctx.moveTo(px - 2, py + 2);
        ctx.lineTo(px, py);
        ctx.lineTo(px + 2, py + 2);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'oasis': {
      // a spring-fed pool ringed with grass and date palms
      const pr = s * 1.2;
      ctx.fillStyle = alpha(j.theme.greens[1] ?? '#6b7a3a', 0.85);
      blobPath(ctx, 0, 0, pr * 1.9, rnd, 10, 0.3);
      ctx.fill();
      ctx.fillStyle = tone(j.theme.wetSand, -0.1);
      blobPath(ctx, 0, 0, pr * 1.15, rnd, 9, 0.2);
      ctx.fill();
      ctx.fillStyle = j.pool;
      blobPath(ctx, 0, 0, pr, rnd, 9, 0.2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.ellipse(-pr * 0.3, -pr * 0.3, pr * 0.4, pr * 0.2, -0.4, 0, TAU);
      ctx.fill();
      const n = 6 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const ka = (k / n) * TAU + rnd() * 0.4;
        const d = pr * (1.45 + rnd() * 0.4);
        drawDatePalm(ctx, Math.cos(ka) * d, Math.sin(ka) * d, 7 + rnd() * 3, rnd, j.theme);
      }
      break;
    }
    case 'torii': {
      // a vermilion gate standing in the shallows, facing the shrine ashore
      ctx.rotate(a + Math.PI / 2);
      const w = Math.max(24, s * 2.8);
      // its reflection-shadow on the water
      ctx.fillStyle = 'rgba(0,20,40,0.28)';
      ctx.fillRect(-w / 2 + 4, 2, w, 6);
      for (const px of [-w * 0.32, w * 0.32]) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, 2.5, 5, Math.PI * 0.05, Math.PI * 0.95);
        ctx.stroke();
        ctx.fillStyle = '#a82a18';
        ctx.beginPath();
        ctx.arc(px, 2.5, 2.8, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#e0452a';
      ctx.fillRect(-w * 0.42, 1.2, w * 0.84, 3);
      ctx.fillStyle = '#d23a22';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 2, -4.5);
      ctx.quadraticCurveTo(0, -1.5, w / 2 + 2, -4.5);
      ctx.lineTo(w / 2, -0.2);
      ctx.quadraticCurveTo(0, 1.4, -w / 2, -0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#26211e';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 2, -4.5);
      ctx.quadraticCurveTo(0, -1.5, w / 2 + 2, -4.5);
      ctx.lineTo(w / 2 + 1, -2.6);
      ctx.quadraticCurveTo(0, 0, -w / 2 - 1, -2.6);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'beacon': {
      // a bongsudae: stone platform, five chimneys, one of them lit
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(2.5, 3.5, s * 1.3, s * 0.95, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(j.stone, -0.1);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.3, s * 0.95, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = j.stone;
      ctx.beginPath();
      ctx.ellipse(-0.5, -0.8, s * 1.15, s * 0.8, 0, 0, TAU);
      ctx.fill();
      const lit = Math.floor(rnd() * 5);
      for (let k = 0; k < 5; k++) {
        const cx = (k - 2) * s * 0.44;
        ctx.fillStyle = tone(j.stone, -0.3);
        ctx.beginPath();
        ctx.arc(cx, 0, s * 0.18, 0, TAU);
        ctx.fill();
        ctx.fillStyle = k === lit ? '#ff8a2a' : '#2a2622';
        ctx.beginPath();
        ctx.arc(cx, 0, s * 0.1, 0, TAU);
        ctx.fill();
        if (k === lit) {
          for (let q = 0; q < 5; q++) {
            ctx.fillStyle = `rgba(210,210,205,${0.45 - q * 0.08})`;
            ctx.beginPath();
            ctx.arc(cx + q * s * 0.35, -q * s * 0.3 - 2, s * (0.2 + q * 0.09), 0, TAU);
            ctx.fill();
          }
        }
      }
      break;
    }
    case 'pa': {
      // a hill pā: terraced earthworks ringed by a palisade
      const g = j.T.groundColor ?? j.theme.jungle;
      for (let k = 3; k >= 1; k--) {
        const rr = s * (0.7 + k * 0.5);
        ctx.fillStyle = alpha(tone(g, -0.35), 0.5);
        ctx.beginPath();
        ctx.arc(1, 1.8, rr, 0, TAU);
        ctx.fill();
        ctx.fillStyle = tone(g, 0.05 + (3 - k) * 0.06);
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#4a3420';
      const posts = 26;
      for (let k = 0; k < posts; k++) {
        const ka = (k / posts) * TAU;
        ctx.beginPath();
        ctx.arc(Math.cos(ka) * s * 1.15, Math.sin(ka) * s * 1.15, 0.9, 0, TAU);
        ctx.fill();
      }
      drawBuilding(j, 'whare', -s * 0.25, -s * 0.1, 8, a, 0);
      drawBuilding(j, 'whare', s * 0.45, s * 0.35, 7, a + 1.2, 1);
      break;
    }
    case 'huaca': {
      // an adobe platform mound, stepped, with its ramp
      ctx.rotate(a);
      const tiers = ['#a88a62', '#b89a70', '#c8aa80'];
      tiers.forEach((col, k) => {
        const w = s * (2.3 - k * 0.6);
        const h = s * (1.7 - k * 0.45);
        ctx.fillStyle = 'rgba(40,20,0,0.3)';
        ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
        ctx.fillStyle = col;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = 'rgba(90,60,30,0.4)';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      });
      ctx.fillStyle = '#d6bb90';
      ctx.fillRect(s * 0.3, -s * 0.2, s * 1.2, s * 0.4);
      break;
    }
    case 'pyramid': {
      // a twin-shrined temple pyramid on its whitewashed plaza
      ctx.rotate(a);
      ctx.scale(PYRAMID_SCALE, PYRAMID_SCALE);
      const P = s * 3;
      ctx.fillStyle = '#e6e0d0';
      ctx.fillRect(-P / 2, -P / 2, P, P);
      ctx.strokeStyle = 'rgba(120,100,70,0.35)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-P / 2, -P / 2, P, P);
      const tiers = 4;
      for (let k = 0; k < tiers; k++) {
        const w = s * (2.3 - k * 0.42);
        ctx.fillStyle = 'rgba(40,30,10,0.3)';
        ctx.fillRect(-w / 2 + 1.5, -w / 2 + 2.2, w, w);
        ctx.fillStyle = k % 2 ? '#d8cdb2' : '#c9b48c';
        ctx.fillRect(-w / 2, -w / 2, w, w);
      }
      // twin stairs facing the lake
      ctx.fillStyle = '#efe8d8';
      ctx.fillRect(0, -s * 0.5, s * 1.15, s * 0.36);
      ctx.fillRect(0, s * 0.14, s * 1.15, s * 0.36);
      ctx.strokeStyle = 'rgba(100,80,50,0.35)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      for (let t = 1.5; t < s * 1.15; t += 1.6) {
        ctx.moveTo(t, -s * 0.5);
        ctx.lineTo(t, -s * 0.14);
        ctx.moveTo(t, s * 0.14);
        ctx.lineTo(t, s * 0.5);
      }
      ctx.stroke();
      // the shrines of Huitzilopochtli (red) and Tlaloc (blue)
      ctx.fillStyle = '#b3321f';
      ctx.fillRect(-s * 0.5, -s * 0.5, s * 0.5, s * 0.42);
      ctx.fillStyle = '#2f6fa8';
      ctx.fillRect(-s * 0.5, s * 0.08, s * 0.5, s * 0.42);
      break;
    }
    case 'vineyard': {
      ctx.rotate(a + rnd());
      const w = s * 2.4;
      const h = s * 1.7;
      ctx.fillStyle = '#9a7a52';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      for (let yy = -h / 2 + 2; yy < h / 2 - 1; yy += 2.8) {
        for (let xx = -w / 2 + 1.5; xx < w / 2 - 1; xx += 2.2) {
          ctx.fillStyle = (xx + yy) % 3 > 1 ? '#5a7a2c' : '#6b8a34';
          ctx.beginPath();
          ctx.arc(xx, yy, 1.05, 0, TAU);
          ctx.fill();
        }
      }
      ctx.strokeStyle = j.stone;
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      break;
    }
    case 'watchtower': {
      // a round crenellated tower
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(s * 0.9, s * 1.1, s * 1.3, s * 0.55, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(j.stone, -0.12);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = j.stone;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.58, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(j.stone, 0.2);
      for (let k = 0; k < 10; k++) {
        const ka = (k / 10) * TAU;
        ctx.fillRect(Math.cos(ka) * s * 0.7 - 1, Math.sin(ka) * s * 0.7 - 1, 2, 2);
      }
      ctx.fillStyle = tone(j.stone, -0.35);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'causeway': {
      // a stone causeway striding out across the lake, a timber bridge in it
      ctx.rotate(a);
      const len = 50;
      ctx.fillStyle = 'rgba(0,20,20,0.25)';
      ctx.fillRect(-4, -3, len + 2, 9);
      ctx.fillStyle = tone(j.stone, -0.1);
      ctx.fillRect(-6, -4.5, len, 9);
      ctx.fillStyle = j.stone;
      ctx.fillRect(-6, -3.5, len, 7);
      ctx.fillStyle = '#8a6338';
      ctx.fillRect(len * 0.45, -4, 7, 8);
      ctx.strokeStyle = '#5a3d1f';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let t = len * 0.45 + 1.5; t < len * 0.45 + 7; t += 1.8) (ctx.moveTo(t, -4), ctx.lineTo(t, 4));
      ctx.stroke();
      break;
    }
    case 'seaWall': {
      // a stretch of sea wall along the shore, towers at intervals
      ctx.translate(-x, -y);
      const span = 0.9;
      const steps = 24;
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let k = 0; k <= steps; k++) {
        const ka = a - span / 2 + (k / steps) * span;
        const d = j.R(ka) * 0.9;
        if (k === 0) ctx.moveTo(Math.cos(ka) * d + 2, Math.sin(ka) * d + 3);
        else ctx.lineTo(Math.cos(ka) * d + 2, Math.sin(ka) * d + 3);
      }
      ctx.stroke();
      ctx.strokeStyle = j.stone;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let k = 0; k <= steps; k++) {
        const ka = a - span / 2 + (k / steps) * span;
        const d = j.R(ka) * 0.9;
        if (k === 0) ctx.moveTo(Math.cos(ka) * d, Math.sin(ka) * d);
        else ctx.lineTo(Math.cos(ka) * d, Math.sin(ka) * d);
      }
      ctx.stroke();
      for (let k = 0; k <= 4; k++) {
        const ka = a - span / 2 + (k / 4) * span;
        const d = j.R(ka) * 0.9;
        ctx.save();
        ctx.translate(Math.cos(ka) * d, Math.sin(ka) * d);
        ctx.rotate(ka);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-3, -3, 8, 8);
        ctx.fillStyle = tone(j.stone, 0.1);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.strokeStyle = tone(j.stone, -0.35);
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-4, -4, 8, 8);
        ctx.restore();
      }
      break;
    }
  }
  ctx.restore();
}

// ── offshore ──────────────────────────────────────────────────────────────

function paintOffshore(j: Job) {
  const { ctx, T, rnd, theme } = j;
  const out = (lo: number, hi: number): [number, number] => {
    const a = rnd() * TAU;
    const d = j.R(a) + lo + rnd() * (hi - lo);
    return [Math.cos(a) * d, Math.sin(a) * d];
  };
  const foam = (x: number, y: number, s: number) => {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(x, y, s + 2.5, 0, TAU);
    ctx.fill();
  };
  switch (T.offshore) {
    case 'rocks':
    case 'flats': {
      const n = 2 + Math.floor(rnd() * 5);
      for (let i = 0; i < n; i++) {
        const [x, y] = out(8, 34);
        const s = 3 + rnd() * 6;
        foam(x, y, s);
        drawBoulder(ctx, x, y, s, rnd, theme.peaks);
      }
      break;
    }
    case 'skerries': {
      // low, black, kelp-fringed reefs out beyond the shore
      const clusters = 3 + Math.floor(rnd() * 4);
      for (let c = 0; c < clusters; c++) {
        const [cx, cy] = out(14, 44);
        const n = 2 + Math.floor(rnd() * 4);
        for (let i = 0; i < n; i++) {
          const x = cx + (rnd() - 0.5) * 18;
          const y = cy + (rnd() - 0.5) * 18;
          const s = 2.5 + rnd() * 5;
          foam(x, y, s + 1);
          ctx.fillStyle = 'rgba(90,70,30,0.55)';
          blobPath(ctx, x, y, s * 1.4, rnd, 8, 0.6);
          ctx.fill();
          drawBoulder(ctx, x, y, s, rnd, ['#3f4449', '#555b61', '#7d848a']);
        }
      }
      break;
    }
    case 'stacks': {
      // chalk sea stacks, cut off from the cliffs by the swell
      const n = 2 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        const [x, y] = out(6, 26);
        const s = 3 + rnd() * 5;
        ctx.fillStyle = 'rgba(0,20,30,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + s * 0.9, y + s * 1.1, s * 1.3, s * 0.8, Math.PI / 4, 0, TAU);
        ctx.fill();
        foam(x, y, s);
        ctx.fillStyle = '#d8d6ca';
        blobPath(ctx, x, y, s, rnd, 7, 0.3);
        ctx.fill();
        ctx.fillStyle = '#f2f0e6';
        blobPath(ctx, x - 0.8, y - 0.8, s * 0.72, rnd, 7, 0.3);
        ctx.fill();
        ctx.fillStyle = alpha(theme.jungle, 0.9);
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, s * 0.4, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'stakes': {
      // lines of fishing and oyster stakes in the shallows
      const lines = 2 + Math.floor(rnd() * 3);
      for (let l = 0; l < lines; l++) {
        const a0 = rnd() * TAU;
        const d = j.R(a0) + 14 + rnd() * 22;
        const n = 8 + Math.floor(rnd() * 8);
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / j.R(a0)) * 5;
          const x = Math.cos(a) * (d + (i % 2) * 2);
          const y = Math.sin(a) * (d + (i % 2) * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#3a2e22';
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, TAU);
          ctx.fill();
        }
      }
      break;
    }
    case 'reeds': {
      const n = 6 + Math.floor(rnd() * 8);
      for (let i = 0; i < n; i++) {
        const [x, y] = out(4, 22);
        drawReeds(ctx, x, y, 4 + rnd() * 3, rnd, theme.greens, rnd() < 0.5);
      }
      break;
    }
    case 'sealions': {
      // guano-crusted rocks with sea lions hauled out on them
      const n = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        const [x, y] = out(12, 36);
        const s = 5 + rnd() * 6;
        foam(x, y, s);
        drawBoulder(ctx, x, y, s, rnd, theme.peaks);
        ctx.fillStyle = 'rgba(248,245,235,0.85)';
        blobPath(ctx, x - s * 0.2, y - s * 0.2, s * 0.55, rnd, 7, 0.5);
        ctx.fill();
        const pups = 1 + Math.floor(rnd() * 3);
        for (let k = 0; k < pups; k++) {
          const ka = rnd() * TAU;
          const px = x + Math.cos(ka) * s * 0.75;
          const py = y + Math.sin(ka) * s * 0.75;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(ka + Math.PI / 2);
          ctx.fillStyle = '#5a4230';
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.6, 1.6, 0, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(3.6, 0, 1.3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#7a5e44';
          ctx.beginPath();
          ctx.ellipse(-0.5, -0.5, 2, 0.7, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
      }
      break;
    }
  }
}
