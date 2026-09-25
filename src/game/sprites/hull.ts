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

/** Drop cached silhouettes — needed if hull dimensions change at runtime. */
export function clearPathCache() {
  pathCache.clear();
}

/** Sprite cache key — variants of one kind (e.g. era hulls) get their own entry. */
export function styleId(def: ShipDef): string {
  return def.styleKey ?? def.kind;
}

/** Boat-shaped outline centred on the origin, bow pointing along +x. */
export function hullShape(p: Path2D, hl: number, hw: number, style: HullStyle = 'default') {
  if (style === 'canoe') {
    // dugout: narrow, pointed at both ends, widest just aft of amidships
    p.moveTo(hl * 1.06, 0);
    p.bezierCurveTo(hl * 0.5, -hw * 0.92, -hl * 0.5, -hw * 0.98, -hl * 1.04, 0);
    p.bezierCurveTo(-hl * 0.5, hw * 0.98, hl * 0.5, hw * 0.92, hl * 1.06, 0);
    p.closePath();
    return;
  }
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
  if (style === 'trireme') {
    // oared war galley: long, lean, with a bronze ram reaching past the bow
    p.moveTo(hl * 1.16, 0);
    p.lineTo(hl * 0.94, -hw * 0.34);
    p.bezierCurveTo(hl * 0.5, -hw * 0.95, -hl * 0.4, -hw, -hl * 0.9, -hw * 0.68);
    p.quadraticCurveTo(-hl * 1.02, 0, -hl * 0.9, hw * 0.68);
    p.bezierCurveTo(-hl * 0.4, hw, hl * 0.5, hw * 0.95, hl * 0.94, hw * 0.34);
    p.closePath();
    return;
  }
  if (style === 'dhow') {
    // sewn boat: sharp double-ended bow, flat transom stern
    p.moveTo(hl * 1.06, 0);
    p.bezierCurveTo(hl * 0.5, -hw * 0.9, -hl * 0.2, -hw * 0.95, -hl * 0.85, -hw * 0.72);
    p.lineTo(-hl * 0.85, hw * 0.72);
    p.bezierCurveTo(-hl * 0.2, hw * 0.95, hl * 0.5, hw * 0.9, hl * 1.06, 0);
    p.closePath();
    return;
  }
  if (style === 'junk') {
    // flat-bottomed junk: blunt spoon bow, high square stern
    p.moveTo(hl * 0.88, 0);
    p.quadraticCurveTo(hl * 0.86, -hw * 0.9, hl * 0.5, -hw);
    p.lineTo(-hl * 0.72, -hw);
    p.quadraticCurveTo(-hl * 0.95, -hw * 0.6, -hl * 0.95, 0);
    p.quadraticCurveTo(-hl * 0.95, hw * 0.6, -hl * 0.72, hw);
    p.lineTo(hl * 0.5, hw);
    p.quadraticCurveTo(hl * 0.86, hw * 0.9, hl * 0.88, 0);
    p.closePath();
    return;
  }
  if (style === 'atakebune') {
    // floating castle: slab-sided barge with a bluff bow
    p.moveTo(hl * 0.86, 0);
    p.lineTo(hl * 0.62, -hw * 0.95);
    p.lineTo(-hl * 0.84, -hw * 0.95);
    p.quadraticCurveTo(-hl * 0.96, -hw * 0.5, -hl * 0.96, 0);
    p.quadraticCurveTo(-hl * 0.96, hw * 0.5, -hl * 0.84, hw * 0.95);
    p.lineTo(hl * 0.62, hw * 0.95);
    p.closePath();
    return;
  }
  if (style === 'warship') {
    // steel warship: fine raked bow, long parallel body, transom stern
    p.moveTo(hl * 1.02, 0);
    p.quadraticCurveTo(hl * 0.82, -hw * 0.72, hl * 0.52, -hw);
    p.lineTo(-hl * 0.82, -hw);
    p.quadraticCurveTo(-hl * 0.96, -hw * 0.82, -hl * 0.96, 0);
    p.quadraticCurveTo(-hl * 0.96, hw * 0.82, -hl * 0.82, hw);
    p.lineTo(hl * 0.52, hw);
    p.quadraticCurveTo(hl * 0.82, hw * 0.72, hl * 1.02, 0);
    p.closePath();
    return;
  }
  if (style === 'submarine') {
    // surfaced submarine: a cigar with a rounded bow and a tapering stern
    p.moveTo(hl * 1.04, 0);
    p.bezierCurveTo(hl * 0.78, -hw * 0.9, hl * 0.4, -hw, -hl * 0.5, -hw * 0.92);
    p.bezierCurveTo(-hl * 0.92, -hw * 0.7, -hl * 0.96, -hw * 0.3, -hl * 0.96, 0);
    p.bezierCurveTo(-hl * 0.96, hw * 0.3, -hl * 0.92, hw * 0.7, -hl * 0.5, hw * 0.92);
    p.bezierCurveTo(hl * 0.4, hw, hl * 0.78, hw * 0.9, hl * 1.04, 0);
    p.closePath();
    return;
  }
  if (style === 'freighter' || style === 'tanker') {
    // merchant steel: bluff bow, endless parallel midbody, flat stern
    p.moveTo(hl * 1.0, 0);
    p.quadraticCurveTo(hl * 0.9, -hw * 0.86, hl * 0.58, -hw);
    p.lineTo(-hl * 0.86, -hw);
    p.lineTo(-hl * 0.94, -hw * 0.86);
    p.lineTo(-hl * 0.94, hw * 0.86);
    p.lineTo(-hl * 0.86, hw);
    p.lineTo(hl * 0.58, hw);
    p.quadraticCurveTo(hl * 0.9, hw * 0.86, hl * 1.0, 0);
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
  if (def.masts <= 0) masts = []; // oared craft carry no rig
  else if (def.masts === 1) masts = [hl * 0.1];
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
