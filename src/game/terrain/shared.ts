// Shared painter plumbing: colour maths, the per-island `Job`, landmark
// sizing and small path helpers used by every terrain painter.

import { TAU } from '../math';
import type { IslandTheme } from '../worlds';
import type { TerrainPeak, TerrainLandmark, Terrain, Harmonic } from './recipe';

// ── colour ────────────────────────────────────────────────────────────────

export function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Blend two `#rrggbb` colours; `t` = 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
  const x = rgbOf(a);
  const y = rgbOf(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1)}`;
}

/** Darken (t < 0) or lighten (t > 0) a colour. */
export function tone(hex: string, t: number): string {
  return t < 0 ? mix(hex, '#000000', -t) : mix(hex, '#ffffff', t);
}

export function alpha(hex: string, a: number): string {
  const [r, g, b] = rgbOf(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ── the painter ───────────────────────────────────────────────────────────

export type Rnd = () => number;
export type Ctx = CanvasRenderingContext2D;
export type Poly = (mul: number, add: number, wobble?: number, ws?: number) => Path2D;

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

export interface Spot {
  x: number;
  y: number;
  r: number;
}

/** Everything the painters share for one island. */
export interface Job extends TerrainPaint {
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
export const SUMMIT: TerrainLandmark[] = ['temple', 'beacon', 'pa', 'pyramid', 'huaca', 'church', 'standingStones'];
/** Landmarks standing in the water just off the beach. */
export const OFFSHORE: TerrainLandmark[] = ['torii', 'causeway', 'screwpile'];
/** Landmarks on the waterline itself. */
export const SHORE: TerrainLandmark[] = ['lighthouse', 'seaWall'];


export function markScale(r: number) {
  return Math.max(7, Math.min(16, r * 0.11));
}

/** Rough footprint of a landmark, for keeping trees and each other off it. */
export function landmarkSize(kind: TerrainLandmark, r: number) {
  const s = markScale(r);
  if (kind === 'oasis') return s * 2.6;
  if (kind === 'pyramid') return s * 2.4 * PYRAMID_SCALE;
  if (kind === 'pa') return s * 2.4;
  return s * 1.6;
}

export const PYRAMID_SCALE = 1.3;

/** Summit radius, as a fraction of the island's. */
export const PEAK_SIZE: Record<TerrainPeak, number> = {
  none: 0,
  limestone: 0.32,
  granite: 0.28,
  snowcap: 0.28,
  volcano: 0.42,
  jebel: 0.34,
};

/** An irregular closed outline, as a reusable path. */
export function blob(x: number, y: number, rad: number, rnd: Rnd, n = 12, jitter = 0.3): Path2D {
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

export function fillShifted(ctx: Ctx, path: Path2D, dx: number, dy: number, color: string) {
  ctx.save();
  ctx.translate(dx, dy);
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
}


/** A random point on the island at a fraction of the shore distance. */
export function inland(j: Job, lo: number, hi: number): [number, number, number] {
  const a = j.rnd() * TAU;
  const d = j.R(a) * (lo + Math.sqrt(j.rnd()) * (hi - lo));
  return [Math.cos(a) * d, Math.sin(a) * d, a];
}

export function blobPath(ctx: Ctx, x: number, y: number, rad: number, rnd: Rnd, n = 8, jitter = 0.3) {
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

export function mottle(j: Job, colors: string[], n: number, min: number, max: number, a: number) {
  const { ctx, rnd } = j;
  for (let i = 0; i < n; i++) {
    const [x, y] = inland(j, 0, 0.95);
    ctx.fillStyle = alpha(colors[i % colors.length], a);
    blobPath(ctx, x, y, min + rnd() * (max - min), rnd, 9, 0.45);
    ctx.fill();
  }
}
