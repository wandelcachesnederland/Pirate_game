// Ship hull geometry: outlines, deck, planking, mast and cannon positions.
// All shapes are built once per ship kind and cached, since they never change
// at runtime (only the colours and the animated bits do).

import type { ShipDef } from '../types';

export interface ShipPaths {
  hull: Path2D;
  deck: Path2D;
  planks: Path2D;
  masts: number[];
}

const pathCache = new Map<string, ShipPaths>();

/** Boat-shaped outline centred on the origin, bow pointing along +x. */
function hullShape(p: Path2D, hl: number, hw: number) {
  p.moveTo(hl, 0);
  p.bezierCurveTo(hl * 0.62, -hw * 0.98, hl * 0.05, -hw, -hl * 0.35, -hw);
  p.lineTo(-hl * 0.9, -hw * 0.82);
  p.quadraticCurveTo(-hl * 1.04, 0, -hl * 0.9, hw * 0.82);
  p.lineTo(-hl * 0.35, hw);
  p.bezierCurveTo(hl * 0.05, hw, hl * 0.62, hw * 0.98, hl, 0);
  p.closePath();
}

export function shipPaths(def: ShipDef): ShipPaths {
  const cached = pathCache.get(def.kind);
  if (cached) return cached;
  const hl = def.length / 2;
  const hw = def.width / 2;
  const hull = new Path2D();
  hullShape(hull, hl, hw);
  const deck = new Path2D();
  hullShape(deck, hl * 0.84, hw * 0.7);
  const planks = new Path2D();
  for (let k = -2; k <= 2; k++) {
    if (k === 0) continue;
    const yy = k * hw * 0.22;
    planks.moveTo(-hl * 0.74, yy);
    planks.lineTo(hl * 0.5 - Math.abs(k) * hl * 0.12, yy);
  }
  let masts: number[];
  if (def.masts <= 1) masts = [hl * 0.1];
  else if (def.masts === 2) masts = [hl * 0.32, -hl * 0.2];
  else masts = [hl * 0.44, hl * 0.03, -hl * 0.4];
  const p = { hull, deck, planks, masts };
  pathCache.set(def.kind, p);
  return p;
}

/** Local x offset of cannon `i` of `n`, used for both drawing and firing. */
export function cannonLocalX(def: ShipDef, n: number, i: number) {
  const hl = def.length / 2;
  const t = n <= 1 ? 0.5 : i / (n - 1);
  return -hl * 0.52 + t * hl * 0.88;
}
