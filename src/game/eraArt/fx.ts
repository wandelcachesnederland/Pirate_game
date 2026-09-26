// What happens between the hulls: wakes, fire, shot, spray and weather.
//
// All of it is a pure function of the clock — no particle state, no engine. A
// salvo is a phase in a cycle, so the card can be paused, resized or repainted
// and the fight still reads the same. Everything is seen from the deck: smoke
// drifts downwind, splashes throw rings on the water, an aircraft is a shadow
// with a silhouette above it.

import { mulberry32, TAU } from '../math';
import type { ShipDef } from '../types';
import { hexA } from './coast';
import type { FxId, PropId, WeatherId } from './scenes';

/** A cast member once it has a hull, a place and a size on the water. */
export interface Placed {
  def: ShipDef;
  x: number;
  y: number;
  /** heading, radians: bow along +x rotated by this */
  a: number;
  /** px per ship unit */
  scale: number;
  hp: number;
  burn: number;
  sink: number;
  sail: number;
}

/** Local hull coords → world, for gun ports, bows and sterns. */
function local(m: Placed, lx: number, ly: number): [number, number] {
  const c = Math.cos(m.a);
  const s = Math.sin(m.a);
  return [m.x + (lx * c - ly * s) * m.scale, m.y + (lx * s + ly * c) * m.scale];
}

function puff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, c = '#cfd6d8') {
  if (a <= 0.004 || r <= 0.2) return;
  ctx.save();
  if (r < 2.6) {
    ctx.globalAlpha = Math.min(1, a);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  } else {
    // soft-edged: smoke and fire are volumes, not discs
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(c, Math.min(1, a)));
    g.addColorStop(0.55, hexA(c, Math.min(1, a) * 0.6));
    g.addColorStop(1, hexA(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** A ring of thrown-up water where shot landed short or true. */
function splashRing(ctx: CanvasRenderingContext2D, x: number, y: number, k: number, r: number) {
  if (k <= 0 || k >= 1) return;
  ctx.save();
  ctx.globalAlpha = (1 - k) * 0.5;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(0.7, r * 0.1 * (1 - k));
  ctx.beginPath();
  ctx.ellipse(x, y, r * (0.25 + k * 0.8), r * (0.12 + k * 0.4), 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = (1 - k) * 0.4;
  ctx.fillStyle = '#eaf6ff';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + k * 2;
    puff(ctx, x + Math.cos(a) * r * k * 0.8, y + Math.sin(a) * r * k * 0.45, r * 0.12 * (1 - k * 0.5), 0.5);
  }
  ctx.restore();
}

/** A column of water: what a heavy shell throws up. */
function splashColumn(ctx: CanvasRenderingContext2D, x: number, y: number, k: number, h: number) {
  if (k <= 0 || k >= 1) return;
  const rise = Math.sin(Math.min(1, k * 2.2) * Math.PI * 0.5);
  ctx.save();
  ctx.globalAlpha = (1 - k * 0.7) * 0.7;
  ctx.fillStyle = '#f2fbff';
  ctx.beginPath();
  ctx.moveTo(x - h * 0.16, y);
  ctx.quadraticCurveTo(x - h * 0.1 * rise, y - h * rise, x, y - h * rise * 1.08);
  ctx.quadraticCurveTo(x + h * 0.1 * rise, y - h * rise, x + h * 0.16, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  splashRing(ctx, x, y, k, h * 0.5);
}

/** Which side of `m` faces `t` (-1 port, 1 starboard) and how far off the bow. */
function sideOf(m: Placed, t: Placed): number {
  const d = Math.atan2(t.y - m.y, t.x - m.x) - m.a;
  return Math.sin(d) >= 0 ? 1 : -1;
}

/**
 * The foam a hull drags along behind her: two curling lines off the bow and a
 * widening wash down the stern.
 */
export function drawWake(ctx: CanvasRenderingContext2D, m: Placed, t: number, energy: number) {
  if (energy <= 0.02) return;
  const L = m.def.length * m.scale;
  const W = m.def.width * m.scale;
  const c = Math.cos(m.a);
  const s = Math.sin(m.a);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = Math.max(0.8, W * 0.1);
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const k = i / 12;
      const lx = L * 0.46 - k * L * (1.25 + energy * 0.35);
      const ly = side * (W * 0.42 + k * (L * 0.34 + W * 0.5) * energy);
      const wob = Math.sin(t * 3 + k * 7 + m.def.length) * W * 0.09 * k;
      const px = m.x + (lx * c - (ly + wob) * s);
      const py = m.y + (lx * s + (ly + wob) * c);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.globalAlpha = 0.32;
    ctx.stroke();
  }
  // the churned water under the stern
  for (let i = 0; i < 7; i++) {
    const k = i / 7;
    const lx = -m.def.length * (0.5 + k * 0.9);
    const ly = (i % 2 ? 1 : -1) * m.def.width * 0.2;
    const [px, py] = local(m, lx, ly);
    puff(ctx, px, py, W * (0.16 + k * 0.34), 0.16 * (1 - k), '#eaf6ff');
  }
  ctx.restore();
}

/** Flames, glow and a smoke column over a hull that has caught. */
export function drawBurning(ctx: CanvasRenderingContext2D, m: Placed, t: number, seed: number) {
  if (m.burn <= 0.01) return;
  const rnd = mulberry32(seed);
  const L = m.def.length * m.scale;
  const W = m.def.width * m.scale;
  const n = Math.max(3, Math.round(m.burn * 9));

  // heat on the water around her
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, L * 0.95);
  g.addColorStop(0, `rgba(255,140,40,${0.28 * m.burn})`);
  g.addColorStop(1, 'rgba(255,90,20,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(m.x, m.y, L * 0.95, L * 0.6, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  for (let i = 0; i < n; i++) {
    const lx = (rnd() - 0.5) * m.def.length * 0.9;
    const ly = (rnd() - 0.5) * m.def.width * 0.8;
    const [fx0, fy0] = local(m, lx, ly);
    const flick = 0.65 + 0.35 * Math.sin(t * (5 + i) + i * 2.1);
    const r = W * (0.2 + rnd() * 0.26) * flick * (0.6 + m.burn * 0.6);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    puff(ctx, fx0, fy0 - r * 0.4, r, 0.2 * m.burn, '#d84408');
    puff(ctx, fx0, fy0 - r * 0.8, r * 0.62, 0.28 * m.burn, '#ff8a20');
    puff(ctx, fx0, fy0 - r * 1.05, r * 0.3, 0.34 * m.burn, '#ffce58');
    ctx.restore();
    // smoke rolling up and off to leeward
    for (let k = 0; k < 5; k++) {
      const age = ((t * 0.5 + i * 0.19 + k * 0.2) % 1);
      puff(
        ctx,
        fx0 + age * L * 0.4 + Math.sin(age * 5 + i) * W * 0.2,
        fy0 - age * L * 0.5,
        W * (0.18 + age * 0.55),
        (1 - age) * 0.18 * m.burn,
        '#3a322a',
      );
    }
  }
}

/** A hull going down: she lists, foams and the sea closes over her. */
export function drawSinking(ctx: CanvasRenderingContext2D, m: Placed, t: number) {
  if (m.sink <= 0.01) return;
  const L = m.def.length * m.scale;
  ctx.save();
  ctx.globalAlpha = 0.5 * (1 - m.sink * 0.5);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, L * 0.02);
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.35 + i * 0.33) % 1) * m.sink;
    ctx.globalAlpha = 0.4 * (1 - k) * m.sink;
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, L * (0.4 + k * 0.9), L * (0.2 + k * 0.45), 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ the guns

interface SalvoOpts {
  /** heavy guns: taller splashes, more smoke, a slower cycle */
  heavy?: boolean;
  seed: number;
}

/**
 * One broadside, start to finish: flash at the ports, smoke rolling downwind,
 * shot in the air, water thrown up at the target.
 */
function drawSalvo(
  ctx: CanvasRenderingContext2D,
  from: Placed,
  to: Placed,
  t: number,
  cycle: number,
  opts: SalvoOpts,
  view: View = { w: 0, h: 0 },
) {
  const p = ((t / cycle) % 1 + 1) % 1;
  const rnd = mulberry32(opts.seed);
  const side = sideOf(from, to);
  const L = from.def.length;
  const W = from.def.width;
  const guns = Math.max(2, Math.min(6, from.def.cannons));
  const heavy = !!opts.heavy;
  const puffScale = (heavy ? 1.5 : 1) * from.scale;

  // where the shot is going to land: scattered around the target's hull
  const hits: [number, number][] = [];
  for (let i = 0; i < guns; i++) {
    hits.push([
      to.x + (rnd() - 0.5) * to.def.length * to.scale * 0.8,
      to.y + (rnd() - 0.5) * to.def.width * to.scale * 1.6,
    ]);
  }

  // 1. the flash along the firing side
  if (p < 0.09) {
    const k = 1 - p / 0.09;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < guns; i++) {
      const lx = -L * 0.34 + (L * 0.68 * i) / Math.max(1, guns - 1);
      const [gx, gy] = local(from, lx, side * (W * 0.55 + 1));
      const r = (heavy ? 13 : 9) * puffScale * k;
      puff(ctx, gx, gy, r, 0.85 * k, '#fff0b0');
      puff(ctx, gx, gy, r * 0.5, 0.95 * k, '#ffffff');
    }
    ctx.restore();
  }

  // 2. smoke: a rolling cloud off the ports, drifting with the card's wind
  const wind = view.wind ?? from.a + (Math.PI / 2) * side;
  for (let i = 0; i < guns; i++) {
    const lx = -L * 0.34 + (L * 0.68 * i) / Math.max(1, guns - 1);
    const [gx, gy] = local(from, lx, side * (W * 0.5 + 1));
    for (let k = 0; k < 4; k++) {
      const age = p * cycle - k * 0.16 - i * 0.02;
      if (age < 0) continue;
      const kk = Math.min(1, age / (heavy ? 2.4 : 1.7));
      const drift = age * (heavy ? 15 : 10) * puffScale;
      puff(
        ctx,
        gx + Math.cos(wind) * drift + Math.sin(age * 2 + i) * 2.5 * puffScale,
        gy + Math.sin(wind) * drift * 0.45 - age * 0.9 * puffScale,
        (heavy ? 6 : 4.4) * puffScale * (0.5 + kk * 1.6),
        (1 - kk) * (heavy ? 0.42 : 0.34),
        kk < 0.2 ? '#ddd6c6' : '#a9b1b6',
      );
    }
  }

  // 3. shot in the air, then the sea opening up where it lands
  const flight = heavy ? 0.2 : 0.14;
  for (let i = 0; i < guns; i++) {
    const lx = -L * 0.34 + (L * 0.68 * i) / Math.max(1, guns - 1);
    const [gx, gy] = local(from, lx, side * (W * 0.55 + 1));
    const start = i * 0.012;
    const k = (p - start) / flight;
    if (k >= 0 && k < 1) {
      const x = gx + (hits[i][0] - gx) * k;
      const y = gy + (hits[i][1] - gy) * k;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = heavy ? '#2b2b2b' : '#1d1d1d';
      ctx.beginPath();
      ctx.arc(x, y, (heavy ? 2.6 : 1.9) * puffScale, 0, TAU);
      ctx.fill();
      // the shot's own trace of smoke
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#dfe4e6';
      ctx.lineWidth = (heavy ? 3 : 2) * puffScale;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - (hits[i][0] - gx) * 0.06, y - (hits[i][1] - gy) * 0.06);
      ctx.stroke();
      ctx.restore();
    }
    const hit = (p - start - flight) / (heavy ? 0.5 : 0.4);
    if (heavy) splashColumn(ctx, hits[i][0], hits[i][1], hit, 18 * to.scale);
    else splashRing(ctx, hits[i][0], hits[i][1], hit, 10 * to.scale);
  }

  // 4. what the target makes of it: a wisp of smoke and splinters
  const after = (p - flight - 0.05) / 0.6;
  if (after > 0 && after < 1) {
    for (let i = 0; i < 3; i++) {
      puff(
        ctx,
        to.x + (rnd() - 0.5) * to.def.length * to.scale * 0.5,
        to.y + (rnd() - 0.5) * to.def.width * to.scale,
        6 * to.scale * (0.4 + after),
        (1 - after) * 0.3,
        '#8d8378',
      );
    }
  }
}

// --------------------------------------------------------------- the bows

interface VolleyOpts {
  seed: number;
  n?: number;
  /** 'arrow' | 'bolt' | 'stone' | 'fire' */
  shot: 'arrow' | 'bolt' | 'stone' | 'fire';
}

/**
 * A flight of small shot: shafts leave the deck in a fan, land together and
 * throw up dust (or, alight, a spot of fire on the deck).
 */
function drawVolley(
  ctx: CanvasRenderingContext2D,
  from: Placed,
  to: Placed,
  t: number,
  cycle: number,
  opts: VolleyOpts,
) {
  const p = ((t / cycle) % 1 + 1) % 1;
  const rnd = mulberry32(opts.seed);
  const n = opts.n ?? 9;
  const sc = (from.scale + to.scale) / 2;
  const flight = 0.3;

  for (let i = 0; i < n; i++) {
    const [lx, ly] = [
      (rnd() - 0.5) * from.def.length * 0.7,
      (rnd() - 0.5) * from.def.width * 0.8,
    ];
    const [sx, sy] = local(from, lx, ly);
    const tx = to.x + (rnd() - 0.5) * to.def.length * to.scale * 0.9;
    const ty = to.y + (rnd() - 0.5) * to.def.width * to.scale * 1.6;
    const start = (i / n) * 0.12;
    const k = (p - start) / flight;
    if (k < 0 || k >= 1) {
      // impact: a puff of dust, or a lick of fire for a fire arrow
      const after = (p - start - flight) / 0.34;
      if (after > 0 && after < 1) {
        if (opts.shot === 'fire') {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          puff(ctx, tx, ty, 5 * sc * (1 - after), (1 - after) * 0.6, '#ff9a30');
          ctx.restore();
        } else {
          puff(ctx, tx, ty, 4 * sc * (0.4 + after), (1 - after) * 0.3, '#cfc6b4');
        }
      }
      continue;
    }
    // a shallow arc: shot rises off the deck and falls onto it
    const lift = Math.sin(k * Math.PI) * (opts.shot === 'stone' ? 22 : 13) * sc;
    const x = sx + (tx - sx) * k;
    const y = sy + (ty - sy) * k - lift;
    const ang = Math.atan2(ty - sy, tx - sx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    if (opts.shot === 'fire') {
      ctx.strokeStyle = '#c8500e';
      ctx.lineWidth = 1.2 * sc;
      ctx.beginPath();
      ctx.moveTo(-6 * sc, 0);
      ctx.lineTo(1.5 * sc, 0);
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      puff(ctx, 1.2 * sc, 0, 1.6 * sc, 0.75, '#ff9030');
    } else if (opts.shot === 'stone') {
      ctx.fillStyle = '#b9b2a4';
      ctx.beginPath();
      ctx.arc(0, 0, 2.3 * sc, 0, TAU);
      ctx.fill();
    } else {
      ctx.strokeStyle = opts.shot === 'bolt' ? '#e8dcc0' : '#2c2419';
      ctx.lineWidth = (opts.shot === 'bolt' ? 1.6 : 1) * sc;
      ctx.beginPath();
      ctx.moveTo(-4.5 * sc, 0);
      ctx.lineTo(3 * sc, 0);
      ctx.stroke();
      ctx.fillStyle = opts.shot === 'bolt' ? '#c8b48a' : '#5b4a33';
      ctx.beginPath();
      ctx.moveTo(4.4 * sc, 0);
      ctx.lineTo(2.2 * sc, -1.2 * sc);
      ctx.lineTo(2.2 * sc, 1.2 * sc);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // its shadow on the water sells the height
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#04121e';
    ctx.beginPath();
    ctx.ellipse(x, y + lift, 2.4 * sc, 1.1 * sc, ang, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

/** Greek fire: a jet of burning naphtha and a slick that will not go out. */
function drawGreekFire(
  ctx: CanvasRenderingContext2D,
  from: Placed,
  to: Placed,
  t: number,
  cycle: number,
  seed: number,
) {
  const p = ((t / cycle) % 1 + 1) % 1;
  const rnd = mulberry32(seed);
  const sc = (from.scale + to.scale) / 2;
  const [bx, by] = local(from, from.def.length * 0.5, 0);
  const tx = to.x;
  const ty = to.y;
  // the siphon works in bursts, and the sea keeps burning afterwards
  const jet = p < 0.45 ? Math.min(1, p / 0.08) * (1 - Math.max(0, (p - 0.36) / 0.09)) : 0;

  if (jet > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const steps = 30;
    for (let i = 0; i < steps; i++) {
      const k = i / steps;
      if (k > jet) break;
      const wob = Math.sin(t * 12 + k * 9) * 4.5 * sc * k;
      const x = bx + (tx - bx) * k;
      const y = by + (ty - by) * k + wob;
      puff(ctx, x, y, (4.2 + k * 6) * sc, 0.34 * (1 - k * 0.35), '#e0480e');
      puff(ctx, x, y, (2.6 + k * 3.4) * sc, 0.4, '#ff8a20');
      puff(ctx, x, y, (1.2 + k * 1.4) * sc, 0.5, '#ffd873');
    }
    ctx.restore();
    // smoke off the jet
    for (let i = 0; i < 6; i++) {
      const k = i / 6;
      const age = (t * 0.8 + k) % 1;
      puff(
        ctx,
        bx + (tx - bx) * k + age * 14 * sc,
        by + (ty - by) * k - age * 20 * sc,
        (4 + age * 12) * sc,
        (1 - age) * 0.2 * jet,
        '#33291f',
      );
    }
  }

  // burning naphtha spread on the water by the shot that fell short
  const slick = p > 0.3 ? Math.min(1, (p - 0.3) / 0.25) : 0;
  if (slick > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      const a = rnd() * TAU;
      const rr = (0.4 + rnd() * 1.5) * to.def.length * to.scale * 0.4 * slick;
      const x = tx + Math.cos(a) * rr;
      const y = ty + Math.sin(a) * rr * 0.6;
      const flick = 0.6 + 0.4 * Math.sin(t * (4 + i) + i);
      puff(ctx, x, y, (3 + rnd() * 5) * sc * flick, 0.3 * slick * (1 - p * 0.4), '#ff8a24');
    }
    ctx.restore();
  }
}

/** A guided missile: booster flare, a long smoke trail, then the hit. */
function drawMissile(
  ctx: CanvasRenderingContext2D,
  from: Placed,
  to: Placed,
  t: number,
  cycle: number,
  seed: number,
) {
  const p = ((t / cycle) % 1 + 1) % 1;
  const rnd = mulberry32(seed);
  const sc = (from.scale + to.scale) / 2;
  const [lx, ly] = local(from, from.def.length * 0.05, (rnd() - 0.5) * from.def.width * 0.4);
  const tx = to.x + (rnd() - 0.5) * to.def.length * to.scale * 0.4;
  const ty = to.y;
  const flight = 0.4;
  const k = p / flight;

  // the trail hangs on the air long after the missile has gone
  ctx.save();
  for (let i = 0; i < 22; i++) {
    const kk = i / 22;
    const age = p - kk * flight;
    if (age < 0 || kk > Math.min(1, k)) continue;
    const fade = Math.max(0, 1 - age / 1.6);
    const x = lx + (tx - lx) * kk;
    const y = ly + (ty - ly) * kk - Math.sin(kk * Math.PI) * 8 * sc;
    puff(ctx, x, y, (2.4 + age * 9) * sc, fade * 0.5, '#f0eee6');
  }
  ctx.restore();

  if (k < 1) {
    const x = lx + (tx - lx) * k;
    const y = ly + (ty - ly) * k - Math.sin(k * Math.PI) * 8 * sc;
    const ang = Math.atan2(ty - ly, tx - lx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = '#eef1f3';
    ctx.fillRect(-6 * sc, -1.3 * sc, 12 * sc, 2.6 * sc);
    ctx.beginPath();
    ctx.moveTo(6 * sc, -1.3 * sc);
    ctx.lineTo(9 * sc, 0);
    ctx.lineTo(6 * sc, 1.3 * sc);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    puff(ctx, -7 * sc, 0, 4 * sc, 0.9, '#ffd27a');
    puff(ctx, -10 * sc, 0, 2.6 * sc, 0.7, '#ff9030');
    ctx.restore();
  } else {
    const hit = (p - flight) / 0.4;
    if (hit < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      puff(ctx, tx, ty, (10 + hit * 26) * sc, (1 - hit) * 0.85, '#ff9c2a');
      puff(ctx, tx, ty, (5 + hit * 14) * sc, (1 - hit) * 0.9, '#fff0b8');
      ctx.restore();
      for (let i = 0; i < 5; i++) {
        puff(
          ctx,
          tx + (rnd() - 0.5) * 30 * sc * hit,
          ty - hit * 26 * sc + (rnd() - 0.5) * 14 * sc,
          (4 + hit * 14) * sc,
          (1 - hit) * 0.4,
          '#2f2a26',
        );
      }
    }
  }
}

/** A torpedo run: a straight white wake with a boil of water at the end. */
function drawTorpedo(
  ctx: CanvasRenderingContext2D,
  from: Placed,
  to: Placed,
  t: number,
  cycle: number,
  seed: number,
) {
  const p = ((t / cycle) % 1 + 1) % 1;
  const rnd = mulberry32(seed);
  const sc = (from.scale + to.scale) / 2;
  const side = sideOf(from, to);
  const [lx, ly] = local(from, from.def.length * 0.1, side * from.def.width * 0.6);
  const tx = to.x + (rnd() - 0.5) * to.def.length * to.scale * 0.5;
  const ty = to.y + (rnd() - 0.5) * to.def.width * to.scale;
  const flight = 0.62;
  const k = Math.min(1, p / flight);

  ctx.save();
  ctx.strokeStyle = 'rgba(240,252,255,0.42)';
  ctx.lineWidth = Math.max(1, 1.5 * sc);
  ctx.setLineDash([3 * sc, 4 * sc]);
  ctx.lineDashOffset = -t * 26 * sc;
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(lx + (tx - lx) * k, ly + (ty - ly) * k);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  if (k < 1) {
    const x = lx + (tx - lx) * k;
    const y = ly + (ty - ly) * k;
    puff(ctx, x, y, 2.6 * sc, 0.8, '#ffffff');
  } else {
    splashColumn(ctx, tx, ty, (p - flight) / 0.3, 34 * sc);
  }
}

/** Two hulls coming together: foam, spray and a shudder along both. */
function drawRam(ctx: CanvasRenderingContext2D, from: Placed, to: Placed, t: number) {
  const sc = (from.scale + to.scale) / 2;
  const [bx, by] = local(from, from.def.length * 0.52, 0);
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU + t * 1.2;
    const r = (3 + ((t * 20 + i * 5) % 14)) * sc;
    puff(ctx, bx + Math.cos(a) * r, by + Math.sin(a) * r * 0.6, (1.6 + (i % 3)) * sc, 0.4, '#ffffff');
  }
  // spray sheets thrown up either side of the stem
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2 * sc;
  ctx.lineCap = 'round';
  for (const sgn of [-1, 1]) {
    const [sx, sy] = local(from, from.def.length * 0.5, sgn * from.def.width * 0.3);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + Math.cos(from.a + sgn * 1.2) * 10 * sc,
      sy + Math.sin(from.a + sgn * 1.2) * 10 * sc,
      sx + Math.cos(from.a + sgn * 1.9) * 16 * sc,
      sy + Math.sin(from.a + sgn * 1.9) * 16 * sc,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Aircraft over the fleet: a planform high up, its shadow on the water, and
 * the tracers climbing after it.
 */
/** The box the card is painted in, in CSS px, and the wind blowing across it. */
export interface View {
  w: number;
  h: number;
  wind?: number;
}

function drawAirRaid(
  ctx: CanvasRenderingContext2D,
  from: Placed,
  to: Placed,
  t: number,
  cycle: number,
  seed: number,
  view: View,
) {
  const rnd = mulberry32(seed);
  const sc = from.scale;
  for (let i = 0; i < 2; i++) {
    const p = ((t / cycle + i * 0.42) % 1 + 1) % 1;
    const y0 = 0.16 + i * 0.2;
    const x = -0.12 + p * 1.24;
    const y = y0 + Math.sin(p * Math.PI) * 0.06;
    const alt = 16 + rnd() * 10;
    const size = (7 + i * 1.6) * sc;
    const cx = x * view.w;
    const cy = y * view.h * 0.62;
    // the shadow first — that is what a lookout actually sees
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#04121e';
    ctx.translate(cx + alt * 0.5, cy + alt);
    ctx.scale(1, 0.55);
    planeShape(ctx, size);
    ctx.restore();
    // then the machine itself, silver against the sea
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = i % 2 ? '#4a5a4e' : '#6b7b86';
    planeShape(ctx, size);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(-size * 0.2, -size * 0.06, size * 0.4, size * 0.12);
    ctx.restore();

    // tracers from the deck guns, flickering up after her
    if (p > 0.2 && p < 0.8) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let g = 0; g < 3; g++) {
        const flick = (Math.sin(t * 40 + g * 3 + i) + 1) / 2;
        if (flick < 0.45) continue;
        const [gx, gy] = local(from, (g - 1) * from.def.length * 0.28, 0);
        const tx2 = cx + (rnd() - 0.5) * 8;
        const ty2 = cy + 4;
        ctx.strokeStyle = 'rgba(255,226,140,0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 7]);
        ctx.lineDashOffset = -t * 160;
        ctx.beginPath();
        ctx.moveTo(gx + (tx2 - gx) * 0.45, gy + (ty2 - gy) * 0.45);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
        ctx.setLineDash([]);
        // the gun's own blink on the deck
        puff(ctx, gx, gy, 2.2, flick * 0.7, '#ffe9a0');
      }
      ctx.restore();
    }
  }
  // and the target's own guns, still working
  void to;
}

/** A crude planform: fuselage, wings, tail. */
function planeShape(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(s * 0.9, 0);
  ctx.lineTo(s * 0.1, -s * 0.12);
  ctx.lineTo(-s * 0.35, -s * 0.9);
  ctx.lineTo(-s * 0.55, -s * 0.9);
  ctx.lineTo(-s * 0.3, -s * 0.12);
  ctx.lineTo(-s * 0.8, -s * 0.06);
  ctx.lineTo(-s * 0.95, -s * 0.4);
  ctx.lineTo(-s * 1.05, -s * 0.4);
  ctx.lineTo(-s * 0.95, 0);
  ctx.lineTo(-s * 1.05, s * 0.4);
  ctx.lineTo(-s * 0.95, s * 0.4);
  ctx.lineTo(-s * 0.8, s * 0.06);
  ctx.lineTo(-s * 0.3, s * 0.12);
  ctx.lineTo(-s * 0.55, s * 0.9);
  ctx.lineTo(-s * 0.35, s * 0.9);
  ctx.lineTo(s * 0.1, s * 0.12);
  ctx.closePath();
  ctx.fill();
}

/** One effect, one cycle. */
export function drawFx(
  ctx: CanvasRenderingContext2D,
  kind: FxId,
  from: Placed,
  to: Placed,
  t: number,
  cycle: number,
  seed: number,
  view: View = { w: 0, h: 0 },
) {
  switch (kind) {
    case 'broadside':
      drawSalvo(ctx, from, to, t, cycle, { seed }, view);
      break;
    case 'shells':
      drawSalvo(ctx, from, to, t, cycle, { seed, heavy: true }, view);
      break;
    case 'arrows':
      drawVolley(ctx, from, to, t, cycle, { seed, shot: 'arrow' });
      break;
    case 'fireArrows':
      drawVolley(ctx, from, to, t, cycle, { seed, shot: 'fire', n: 7 });
      break;
    case 'bolts':
      drawVolley(ctx, from, to, t, cycle, { seed, shot: 'bolt', n: 5 });
      break;
    case 'stones':
      drawVolley(ctx, from, to, t, cycle, { seed, shot: 'stone', n: 4 });
      break;
    case 'greekFire':
      drawGreekFire(ctx, from, to, t, cycle, seed);
      break;
    case 'missiles':
      drawMissile(ctx, from, to, t, cycle, seed);
      break;
    case 'torpedo':
      drawTorpedo(ctx, from, to, t, cycle, seed);
      break;
    case 'ram':
      drawRam(ctx, from, to, t);
      break;
    case 'airRaid':
      drawAirRaid(ctx, from, to, t, cycle, seed, view);
      break;
  }
}

// ------------------------------------------------------------------- weather

/** Swells moving under the hulls, plus the sun's road across the water. */
export function drawSwell(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  bottom: number,
  t: number,
  swell: number,
  glitter: number,
  glowX: number,
  seed: number,
) {
  const rnd = mulberry32(seed);
  const rows = Math.max(10, Math.round((bottom - top) / 14));
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < rows; i++) {
    const k = i / rows;
    // perspective: the far swells are tight and faint, the near ones long
    const y = top + (bottom - top) * (k * k * 0.55 + k * 0.45);
    const len = 8 + k * 46;
    const n = Math.max(3, Math.round(w / (len * 2.6)));
    const drift = ((t * (6 + k * 26)) % (w + len * 4)) - len * 2;
    ctx.strokeStyle = `rgba(255,255,255,${0.05 + k * 0.1 * (0.4 + swell)})`;
    ctx.lineWidth = 0.8 + k * 1.5;
    for (let j = 0; j < n; j++) {
      const x = ((j / n) * (w + len * 2) + drift + rnd() * 6) % (w + len * 2) - len;
      const amp = (1.5 + swell * 4) * (0.4 + k);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + len * 0.5, y - amp, x + len, y);
      ctx.stroke();
    }
  }
  // the sun's glitter path
  if (glitter > 0.02) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) {
      const k = rnd();
      const y = top + (bottom - top) * k;
      const spread = w * (0.06 + k * 0.22);
      const x = glowX * w + (rnd() - 0.5) * spread * 2;
      const flick = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.4 + i * 1.7));
      puff(ctx, x, y, (0.6 + k * 1.7) * flick, glitter * 0.26 * flick * (0.3 + k), '#fff3c8');
    }
  }
  ctx.restore();
}

/** Rain, fog, night and firelight: the wash that goes over the whole card. */
export function drawWeather(
  ctx: CanvasRenderingContext2D,
  weather: WeatherId,
  w: number,
  h: number,
  t: number,
  seed: number,
) {
  const rnd = mulberry32(seed);
  ctx.save();
  switch (weather) {
    case 'rain':
    case 'storm': {
      const n = weather === 'storm' ? 90 : 55;
      ctx.strokeStyle = weather === 'storm' ? 'rgba(214,232,240,0.4)' : 'rgba(206,226,236,0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        const x = ((rnd() * w + t * 260) % (w + 60)) - 30;
        const y = ((rnd() * h + t * 620) % (h + 40)) - 20;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 13);
        ctx.stroke();
      }
      // ripples where the rain hits the sea
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      for (let i = 0; i < 26; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const k = (t * 1.6 + i * 0.37) % 1;
        ctx.globalAlpha = (1 - k) * 0.3;
        ctx.beginPath();
        ctx.ellipse(x, y, 2 + k * 7, 1 + k * 3, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(14,26,38,0.26)';
      ctx.fillRect(0, 0, w, h);
      // lightning, now and then
      const flash = Math.max(0, Math.sin(t * 0.63) - 0.992) * 120;
      if (flash > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(226,240,255,${Math.min(0.5, flash)})`;
        ctx.fillRect(0, 0, w, h * 0.5);
      }
      break;
    }
    case 'fog': {
      ctx.fillStyle = 'rgba(196,206,206,0.15)';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 5; i++) {
        const y = h * (0.1 + i * 0.2) + Math.sin(t * 0.24 + i) * 6;
        const g = ctx.createLinearGradient(0, y - h * 0.1, 0, y + h * 0.1);
        g.addColorStop(0, 'rgba(222,230,228,0)');
        g.addColorStop(0.5, `rgba(224,232,230,${0.16 - i * 0.02})`);
        g.addColorStop(1, 'rgba(222,230,228,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, y - h * 0.1, w, h * 0.2);
      }
      break;
    }
    case 'haze': {
      ctx.fillStyle = 'rgba(236,222,186,0.14)';
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'dusk': {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(70,40,90,0.24)');
      g.addColorStop(0.6, 'rgba(120,60,60,0.12)');
      g.addColorStop(1, 'rgba(20,10,30,0.3)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'night': {
      ctx.fillStyle = 'rgba(6,12,28,0.4)';
      ctx.fillRect(0, 0, w, h);
      // embers rolling off the burning hulls
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 30; i++) {
        const k = (t * 0.22 + rnd()) % 1;
        const x = rnd() * w;
        const y = h - k * h * 0.9;
        puff(ctx, x + Math.sin(t + i) * 8, y, 1.2 + rnd() * 1.6, (1 - k) * 0.5, '#ff9a3a');
      }
      break;
    }
    case 'monsoon': {
      ctx.strokeStyle = 'rgba(238,248,250,0.3)';
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 46; i++) {
        const x = ((rnd() * w + t * 460) % (w + 90)) - 45;
        const y = ((rnd() * h + t * 190) % (h + 40)) - 20;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 22, y + 5);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(150,190,196,0.1)';
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case 'clear':
    default:
      break;
  }
  ctx.restore();
}

// --------------------------------------------------------------------- props

/**
 * What the water is made of here: oil from a gutted tanker, the stakes of the
 * Bạch Đằng, a reef breaking, a whirlpool in the strait, a wreck going over,
 * or a shore on fire.
 */
export function drawProp(
  ctx: CanvasRenderingContext2D,
  prop: PropId,
  w: number,
  skyH: number,
  stageH: number,
  t: number,
  seed: number,
) {
  const rnd = mulberry32(seed);
  switch (prop) {
    case 'oilSlick': {
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const x = (0.15 + rnd() * 0.7) * w;
        const y = skyH + (0.35 + rnd() * 0.55) * stageH;
        const rx = (0.06 + rnd() * 0.1) * w;
        const ry = rx * (0.25 + rnd() * 0.2);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
        g.addColorStop(0, 'rgba(12,10,14,0.62)');
        g.addColorStop(0.7, 'rgba(26,22,30,0.4)');
        g.addColorStop(1, 'rgba(30,26,34,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, rnd() * TAU, 0, TAU);
        ctx.fill();
        // the rainbow edge
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(${120 + i * 12},${90 + i * 20},${160 - i * 10},0.16)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, rx * 0.86, ry * 0.86, 0, 0, TAU);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();
      break;
    }
    case 'stakes': {
      ctx.save();
      for (let i = 0; i < 26; i++) {
        const x = (0.06 + rnd() * 0.9) * w;
        const y = skyH + (0.5 + rnd() * 0.48) * stageH;
        const h = 5 + rnd() * 9;
        ctx.strokeStyle = 'rgba(52,40,26,0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (rnd() - 0.5) * 3, y - h);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(220,235,240,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, y + 1, 3.4, 1.4, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case 'reef': {
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const x = (0.1 + rnd() * 0.8) * w;
        const y = skyH + (0.55 + rnd() * 0.4) * stageH;
        const rx = (0.04 + rnd() * 0.06) * w;
        ctx.fillStyle = 'rgba(120,220,205,0.16)';
        ctx.beginPath();
        ctx.ellipse(x, y, rx, rx * 0.42, rnd(), 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.4;
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * TAU + Math.sin(t * 1.6 + k) * 0.1;
          const rr = rx * (0.9 + Math.sin(t * 2 + k * 2) * 0.08);
          ctx.beginPath();
          ctx.arc(x, y, rr, a, a + 0.3);
          ctx.stroke();
        }
      }
      ctx.restore();
      break;
    }
    case 'whirl': {
      ctx.save();
      const x = w * 0.52;
      const y = skyH + stageH * 0.86;
      ctx.strokeStyle = 'rgba(255,255,255,0.34)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const rr = (10 + i * 9) * (1 + Math.sin(t * 1.4 + i) * 0.05);
        ctx.ellipse(x, y, rr, rr * 0.4, t * (0.5 + i * 0.16), 0.4, TAU);
        ctx.globalAlpha = 0.4 - i * 0.08;
        ctx.stroke();
      }
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#06283c';
      ctx.beginPath();
      ctx.ellipse(x, y, 7, 3, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'wreck': {
      ctx.save();
      const x = w * (0.1 + rnd() * 0.12);
      const y = skyH + stageH * (0.3 + rnd() * 0.1);
      ctx.fillStyle = 'rgba(30,20,14,0.8)';
      ctx.beginPath();
      ctx.ellipse(x, y, 13, 4.5, 0.4, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(46,32,20,0.9)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 2, y - 13);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const k = (t * 0.4 + i * 0.25) % 1;
        puff(ctx, x + 2 + k * 12, y - 13 - k * 18, 3 + k * 7, (1 - k) * 0.24, '#2a2118');
      }
      ctx.restore();
      break;
    }
    case 'shoreFire': {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const x = w * 0.4;
      const y = skyH;
      for (let i = 0; i < 9; i++) {
        const k = (t * 0.5 + i * 0.11) % 1;
        puff(ctx, x + (rnd() - 0.5) * 16 + k * 10, y - k * 26, 4 + k * 12, (1 - k) * 0.3, i % 2 ? '#ff8a24' : '#ffd070');
      }
      const g = ctx.createRadialGradient(x, y, 0, x, y, 60);
      g.addColorStop(0, 'rgba(255,140,40,0.3)');
      g.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 60, y - 60, 120, 70);
      ctx.restore();
      break;
    }
  }
}

/** `rgba(...)` with an alpha multiplied in — used by the mood washes. */
export function withAlpha(colour: string, a: number): string {
  if (colour.startsWith('#')) return hexA(colour, a);
  return colour.replace(/rgba?\(([^)]+)\)/, (_m, inner: string) => {
    const parts = inner.split(',').map((p: string) => p.trim());
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
  });
}
