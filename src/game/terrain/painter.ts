// The terrain painter entry point: sequences shore, ground, peak, trees,
// villages, landmarks and offshore features for one island.

import { TAU } from '../math';
import { type TerrainLandmark, islandRadiusAt } from './recipe';
import { type TerrainPaint, type Spot, type Job, SUMMIT, OFFSHORE, SHORE, landmarkSize, PEAK_SIZE } from './shared';
import { paintShallows, paintShore } from './shore';
import { paintGround } from './ground';
import { paintPeak } from './peak';
import { paintTrees } from './trees';
import { paintVillage } from './village';
import { paintLandmark } from './landmarks';
import { paintOffshore } from './offshore';

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
