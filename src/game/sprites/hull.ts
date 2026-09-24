// Ship hull geometry: outlines and mast positions.
// Shapes are built once per style and cached, since they never change at
// runtime (only the colours and the animated bits do).

import type { HullStyle, ShipDef } from '../types';

export interface ShipPaths {
  hull: Path2D;
  deck: Path2D;
  masts: number[];
}

const pathCache = new Map<string, ShipPaths>();

/** Sprite cache key — variants of one kind (e.g. era hulls) get their own entry. */
export function styleId(def: ShipDef): string {
  return def.styleKey ?? def.kind;
}

/** Boat-shaped outline centred on the origin, bow pointing along +x. */
export function hullShape(p: Path2D, hl: number, hw: number, style: HullStyle = 'default') {
  if (style === 'longship') {
    // double-ended: symmetric bow and stern, both rising to a point
    p.moveTo(hl * 1.02, 0);
    p.bezierCurveTo(hl * 0.55, -hw, hl * 0.1, -hw, -hl * 0.2, -hw);
    p.bezierCurveTo(-hl * 0.7, -hw, -hl * 0.85, -hw * 0.5, -hl * 1.02, 0);
    p.bezierCurveTo(-hl * 0.85, hw * 0.5, -hl * 0.7, hw, -hl * 0.2, hw);
    p.bezierCurveTo(hl * 0.1, hw, hl * 0.55, hw, hl * 1.02, 0);
    p.closePath();
    return;
  }
  if (style === 'ironclad') {
    // slab-sided casemate: near-rectangular with a soft ram bow
    p.moveTo(hl * 0.98, 0);
    p.quadraticCurveTo(hl * 0.9, -hw * 0.85, hl * 0.6, -hw);
    p.lineTo(-hl * 0.8, -hw);
    p.quadraticCurveTo(-hl * 0.98, -hw * 0.7, -hl * 0.98, 0);
    p.quadraticCurveTo(-hl * 0.98, hw * 0.7, -hl * 0.8, hw);
    p.lineTo(hl * 0.6, hw);
    p.quadraticCurveTo(hl * 0.9, hw * 0.85, hl * 0.98, 0);
    p.closePath();
    return;
  }
  p.moveTo(hl, 0);
  p.bezierCurveTo(hl * 0.62, -hw * 0.98, hl * 0.05, -hw, -hl * 0.35, -hw);
  p.lineTo(-hl * 0.9, -hw * 0.82);
  p.quadraticCurveTo(-hl * 1.04, 0, -hl * 0.9, hw * 0.82);
  p.lineTo(-hl * 0.35, hw);
  p.bezierCurveTo(hl * 0.05, hw, hl * 0.62, hw * 0.98, hl, 0);
  p.closePath();
}

export function shipPaths(def: ShipDef): ShipPaths {
  const key = styleId(def);
  const cached = pathCache.get(key);
  if (cached) return cached;
  const hl = def.length / 2;
  const hw = def.width / 2;
  const style = def.hullStyle ?? 'default';
  const hull = new Path2D();
  hullShape(hull, hl, hw, style);
  const deck = new Path2D();
  hullShape(deck, hl * 0.84, hw * 0.7, style);
  let masts: number[];
  if (def.masts <= 1) masts = [hl * 0.1];
  else if (def.masts === 2) masts = [hl * 0.32, -hl * 0.2];
  else masts = [hl * 0.44, hl * 0.03, -hl * 0.4];
  const out = { hull, deck, masts };
  pathCache.set(key, out);
  return out;
}

/** Local x offset of cannon `i` of `n`, used for both drawing and firing. */
export function cannonLocalX(def: ShipDef, n: number, i: number) {
  const hl = def.length / 2;
  const t = n <= 1 ? 0.5 : i / (n - 1);
  return -hl * 0.52 + t * hl * 0.88;
}
