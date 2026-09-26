// The far edge of the world: sky, and whatever shore that era is famous for.
//
// The era cards are seen from the deck — sea below, a low horizon band above —
// so the shore is only ever a silhouette: dunes off Tripoli, karst pillars on
// the Bạch Đằng, an oil derrick with a gas flare in the Gulf, the temple roof
// of Tenochtitlan. Everything here is drawn flat and dark, then washed with the
// horizon's own colour so distance does the shading.

import { mulberry32, TAU } from '../math';
import type { CoastId, EraSceneSpec } from './scenes';

/** A rounded path helper: the silhouettes are all soft-edged. */
function blob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  flat = 0,
) {
  ctx.beginPath();
  ctx.ellipse(x, y + flat * ry, rx, ry * (1 - flat), 0, 0, TAU);
  ctx.fill();
}

/** A triangle with a slight bend in it — cliffs, cones, roofs. */
function spike(ctx: CanvasRenderingContext2D, x: number, base: number, w: number, h: number, lean = 0) {
  ctx.beginPath();
  ctx.moveTo(x - w / 2, base);
  ctx.lineTo(x + lean, base - h);
  ctx.lineTo(x + w / 2, base);
  ctx.closePath();
  ctx.fill();
}

/** Rolling humps of a given count across a width, sitting on the waterline. */
function humps(ctx: CanvasRenderingContext2D, x: number, base: number, w: number, h: number, n: number, rnd: () => number) {
  for (let i = 0; i < n; i++) {
    const px = x - w / 2 + (w / n) * (i + 0.5) + (rnd() - 0.5) * w * 0.06;
    const rx = (w / n) * (0.7 + rnd() * 0.6);
    const ry = h * (0.55 + rnd() * 0.6);
    ctx.beginPath();
    ctx.ellipse(px, base, rx, ry, 0, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
  }
}

/** Palm: a bent trunk and six fronds. Small, but it says 'tropics' at once. */
function palm(ctx: CanvasRenderingContext2D, x: number, base: number, h: number, lean: number) {
  ctx.save();
  ctx.lineWidth = Math.max(1, h * 0.09);
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.quadraticCurveTo(x + lean * h * 0.4, base - h * 0.6, x + lean * h * 0.55, base - h);
  ctx.stroke();
  const tx = x + lean * h * 0.55;
  const ty = base - h;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.55;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(a) * h * 0.42,
      ty + Math.sin(a) * h * 0.36,
      tx + Math.cos(a) * h * 0.62,
      ty + Math.sin(a) * h * 0.5 + h * 0.14,
    );
    ctx.lineWidth = Math.max(0.9, h * 0.07);
    ctx.stroke();
  }
  ctx.restore();
}

/** Conifer line — the cold-sea shore. */
function conifers(ctx: CanvasRenderingContext2D, x: number, base: number, w: number, h: number, rnd: () => number) {
  const n = Math.max(4, Math.round(w / (h * 0.42)));
  for (let i = 0; i < n; i++) {
    const px = x - w / 2 + (w / n) * (i + 0.5) + (rnd() - 0.5) * 3;
    const hh = h * (0.6 + rnd() * 0.6);
    spike(ctx, px, base, hh * 0.52, hh);
  }
}

/** Columns, architrave and pediment: a temple on the headland. */
function temple(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  const w = h * 1.7;
  ctx.fillRect(x - w / 2, base - h * 0.16, w, h * 0.16);
  const cols = 6;
  for (let i = 0; i < cols; i++) {
    const cx = x - w / 2 + (w / cols) * (i + 0.5);
    ctx.fillRect(cx - h * 0.055, base - h * 0.74, h * 0.11, h * 0.6);
  }
  ctx.fillRect(x - w / 2 - h * 0.06, base - h * 0.84, w + h * 0.12, h * 0.12);
  spike(ctx, x, base - h * 0.84, w + h * 0.16, h * 0.3);
}

/** Smooth-sided pyramids, the way the Nile mouths see them. */
function pyramids(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  spike(ctx, x - h * 0.55, base, h * 1.5, h);
  spike(ctx, x + h * 0.6, base, h * 1.05, h * 0.7);
  spike(ctx, x + h * 1.25, base, h * 0.7, h * 0.45);
}

/** Stepped temple: Mesoamerica, seen off the water. */
function ziggurat(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const w = h * (2.1 - i * 0.44);
    const y = base - (h / tiers) * (i + 1);
    ctx.fillRect(x - w / 2, y, w, h / tiers + 0.6);
  }
  ctx.fillRect(x - h * 0.16, base - h - h * 0.22, h * 0.32, h * 0.24);
}

/** Curtain wall, round towers and a flag — a coast that shoots back. */
function fort(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  const w = h * 2.6;
  ctx.fillRect(x - w / 2, base - h * 0.5, w, h * 0.5);
  for (const s of [-1, 1]) {
    ctx.fillRect(x + (s * w) / 2 - h * 0.16, base - h, h * 0.32, h);
    spike(ctx, x + (s * w) / 2, base - h, h * 0.46, h * 0.28);
  }
  ctx.fillRect(x - h * 0.1, base - h * 0.86, h * 0.2, h * 0.86);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + h * 0.1, base - h * 0.86);
  ctx.lineTo(x + h * 0.6, base - h * 0.76);
  ctx.lineTo(x + h * 0.1, base - h * 0.66);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Tiered roofs on a stone plinth — a Japanese shore castle. */
function castle(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  ctx.fillRect(x - h * 0.8, base - h * 0.3, h * 1.6, h * 0.3);
  const tiers = 3;
  for (let i = 0; i < tiers; i++) {
    const w = h * (1.25 - i * 0.32);
    const y = base - h * 0.3 - (h * 0.72 / tiers) * (i + 1);
    ctx.fillRect(x - w * 0.32, y + h * 0.1, w * 0.64, h * 0.16);
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h * 0.12);
    ctx.quadraticCurveTo(x, y - h * 0.06, x + w / 2, y + h * 0.12);
    ctx.lineTo(x + w * 0.3, y + h * 0.14);
    ctx.quadraticCurveTo(x, y + h * 0.02, x - w * 0.3, y + h * 0.14);
    ctx.closePath();
    ctx.fill();
  }
  spike(ctx, x, base - h * 1.02, h * 0.2, h * 0.18);
}

/** Chinese pagoda: five eaves and a finial. */
function pagoda(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  const tiers = 5;
  for (let i = 0; i < tiers; i++) {
    const w = h * (1.15 - i * 0.17);
    const y = base - (h / tiers) * (i + 1);
    ctx.fillRect(x - w * 0.24, y, w * 0.48, h / tiers * 0.72);
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h * 0.04);
    ctx.quadraticCurveTo(x, y - h * 0.08, x + w / 2, y + h * 0.04);
    ctx.lineTo(x + w * 0.3, y + h * 0.06);
    ctx.lineTo(x - w * 0.3, y + h * 0.06);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillRect(x - h * 0.03, base - h - h * 0.2, h * 0.06, h * 0.2);
}

/** Dome and two minarets — an Arabian or Ottoman shore. */
function mosque(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  ctx.fillRect(x - h * 0.7, base - h * 0.42, h * 1.4, h * 0.42);
  ctx.beginPath();
  ctx.arc(x, base - h * 0.42, h * 0.42, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x - h * 0.03, base - h * 1.06, h * 0.06, h * 0.24);
  for (const s of [-1, 1]) {
    ctx.fillRect(x + s * h * 1.05 - h * 0.07, base - h * 0.95, h * 0.14, h * 0.95);
    spike(ctx, x + s * h * 1.05, base - h * 0.95, h * 0.2, h * 0.2);
  }
}

/** Huts and a longhouse: a settlement worth raiding. */
function village(ctx: CanvasRenderingContext2D, x: number, base: number, h: number, rnd: () => number) {
  const n = 4;
  for (let i = 0; i < n; i++) {
    const px = x - h * 1.6 + (h * 3.2 / n) * (i + 0.5);
    const hh = h * (0.42 + rnd() * 0.4);
    ctx.fillRect(px - hh * 0.42, base - hh * 0.55, hh * 0.84, hh * 0.55);
    spike(ctx, px, base - hh * 0.55, hh * 1.1, hh * 0.5);
  }
}

/** A blocky waterfront town. */
function city(ctx: CanvasRenderingContext2D, x: number, base: number, h: number, rnd: () => number) {
  let px = x - h * 2.2;
  while (px < x + h * 2.2) {
    const bw = h * (0.24 + rnd() * 0.3);
    const bh = h * (0.3 + rnd() * 0.85);
    ctx.fillRect(px, base - bh, bw, bh);
    if (rnd() < 0.3) spike(ctx, px + bw / 2, base - bh, bw * 1.1, bh * 0.35);
    px += bw + h * 0.05;
  }
}

/** Oil derrick with a gas flare — the Gulf in 1988. */
function oilrig(ctx: CanvasRenderingContext2D, x: number, base: number, h: number) {
  ctx.fillRect(x - h * 0.9, base - h * 0.18, h * 1.8, h * 0.18);
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineWidth = Math.max(1, h * 0.07);
  ctx.beginPath();
  ctx.moveTo(x - h * 0.42, base - h * 0.18);
  ctx.lineTo(x - h * 0.14, base - h);
  ctx.lineTo(x + h * 0.14, base - h);
  ctx.lineTo(x + h * 0.42, base - h * 0.18);
  for (let i = 0; i < 4; i++) {
    const y = base - h * 0.18 - (h * 0.82 / 4) * i;
    const wq = h * 0.42 - (h * 0.28 / 4) * i;
    ctx.moveTo(x - wq, y);
    ctx.lineTo(x + wq, y - h * 0.2);
    ctx.moveTo(x + wq, y);
    ctx.lineTo(x - wq, y - h * 0.2);
  }
  ctx.stroke();
  ctx.restore();
  ctx.fillRect(x + h * 1.0, base - h * 0.62, h * 0.07, h * 0.62);
}

/** Limestone pillars standing out of flat water — Hạ Long's neighbourhood. */
function karst(ctx: CanvasRenderingContext2D, x: number, base: number, h: number, rnd: () => number) {
  const n = 3;
  for (let i = 0; i < n; i++) {
    const px = x - h * 0.9 + (h * 1.8 / n) * (i + 0.5) + (rnd() - 0.5) * h * 0.1;
    const hh = h * (0.85 + rnd() * 0.75);
    const wq = hh * (0.2 + rnd() * 0.1);
    ctx.beginPath();
    ctx.moveTo(px - wq, base);
    ctx.quadraticCurveTo(px - wq * 1.2, base - hh * 0.6, px - wq * 0.4, base - hh);
    ctx.quadraticCurveTo(px + wq * 0.2, base - hh * 1.06, px + wq * 0.5, base - hh * 0.7);
    ctx.quadraticCurveTo(px + wq * 1.1, base - hh * 0.4, px + wq, base);
    ctx.closePath();
    ctx.fill();
  }
}

/** Distant warships on the horizon: hull, bridge, funnel, two masts. */
function fleet(ctx: CanvasRenderingContext2D, x: number, base: number, h: number, rnd: () => number) {
  const n = 3;
  for (let i = 0; i < n; i++) {
    const px = x - h * 2.6 + (h * 5.2 / n) * (i + 0.5) + (rnd() - 0.5) * h * 0.4;
    const len = h * (1.7 + rnd() * 1.1);
    ctx.beginPath();
    ctx.moveTo(px - len / 2, base);
    ctx.lineTo(px - len * 0.42, base - h * 0.16);
    ctx.lineTo(px + len * 0.42, base - h * 0.16);
    ctx.lineTo(px + len / 2, base);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(px - len * 0.16, base - h * 0.4, len * 0.3, h * 0.26);
    ctx.fillRect(px + len * 0.04, base - h * 0.54, h * 0.13, h * 0.4);
    ctx.fillRect(px - len * 0.36, base - h * 0.66, h * 0.045, h * 0.5);
    ctx.fillRect(px + len * 0.3, base - h * 0.52, h * 0.045, h * 0.36);
  }
}

/** Distant sail — three triangles and a hull say 'fleet' at eight pixels. */
function sails(ctx: CanvasRenderingContext2D, x: number, base: number, h: number, rnd: () => number) {
  const n = 3;
  for (let i = 0; i < n; i++) {
    const px = x - h * 2.6 + (h * 5.2 / n) * (i + 0.5) + (rnd() - 0.5) * h * 0.4;
    const hh = h * (0.6 + rnd() * 0.7);
    ctx.fillRect(px - hh * 0.5, base - hh * 0.12, hh, hh * 0.12);
    spike(ctx, px - hh * 0.16, base - hh * 0.12, hh * 0.4, hh * 0.85);
    spike(ctx, px + hh * 0.22, base - hh * 0.12, hh * 0.34, hh * 0.6);
  }
}

const PAINTERS: Record<CoastId, (ctx: CanvasRenderingContext2D, x: number, base: number, h: number, rnd: () => number) => void> = {
  hills: (c, x, b, h, r) => humps(c, x, b, h * 4.6, h * 0.62, 4, r),
  cliffs: (c, x, b, h, r) => {
    humps(c, x, b, h * 3.4, h * 0.7, 3, r);
    c.fillRect(x - h * 1.4, b - h * 0.85, h * 2.8, h * 0.85);
  },
  dunes: (c, x, b, h, r) => humps(c, x, b, h * 5, h * 0.55, 5, r),
  mountains: (c, x, b, h) => {
    spike(c, x - h * 1.1, b, h * 2.2, h * 1.1, -h * 0.1);
    spike(c, x + h * 0.7, b, h * 2.6, h * 1.5, h * 0.2);
    spike(c, x + h * 2.2, b, h * 1.8, h * 0.9);
  },
  volcano: (c, x, b, h) => {
    c.beginPath();
    c.moveTo(x - h * 2.1, b);
    c.lineTo(x - h * 0.34, b - h * 1.5);
    c.lineTo(x + h * 0.34, b - h * 1.5);
    c.lineTo(x + h * 2.1, b);
    c.closePath();
    c.fill();
  },
  palms: (c, x, b, h, r) => {
    humps(c, x, b, h * 3.4, h * 0.3, 3, r);
    palm(c, x - h * 0.7, b, h * 1.05, -0.35);
    palm(c, x + h * 0.5, b, h * 0.85, 0.4);
  },
  forest: (c, x, b, h, r) => {
    humps(c, x, b, h * 4.4, h * 0.4, 4, r);
    conifers(c, x, b - h * 0.1, h * 4, h * 0.9, r);
  },
  temple: (c, x, b, h) => {
    humps(c, x, b, h * 4.6, h * 0.34, 3, mulberry32(7));
    temple(c, x, b - h * 0.06, h);
  },
  pyramids: (c, x, b, h) => pyramids(c, x, b, h),
  ziggurat: (c, x, b, h, r) => {
    humps(c, x, b, h * 4.2, h * 0.3, 3, r);
    ziggurat(c, x, b - h * 0.04, h);
  },
  fort: (c, x, b, h) => fort(c, x, b, h),
  castle: (c, x, b, h, r) => {
    humps(c, x, b, h * 4.2, h * 0.4, 3, r);
    castle(c, x, b - h * 0.1, h);
  },
  pagoda: (c, x, b, h, r) => {
    humps(c, x, b, h * 4.4, h * 0.42, 3, r);
    pagoda(c, x, b - h * 0.08, h * 1.05);
  },
  mosque: (c, x, b, h, r) => {
    humps(c, x, b, h * 4.4, h * 0.3, 3, r);
    mosque(c, x, b - h * 0.04, h);
  },
  village: (c, x, b, h, r) => {
    humps(c, x, b, h * 4.2, h * 0.32, 3, r);
    village(c, x, b, h, r);
  },
  city: (c, x, b, h, r) => city(c, x, b, h, r),
  oilrig: (c, x, b, h) => oilrig(c, x, b, h),
  karst: (c, x, b, h, r) => karst(c, x, b, h, r),
  fleet: (c, x, b, h, r) => fleet(c, x, b, h * 0.9, r),
  sails: (c, x, b, h, r) => sails(c, x, b, h * 0.8, r),
};

/**
 * The sky strip above the horizon: the era's own light, its sun or its fires,
 * and cloud (or stars) when the weather calls for it.
 */
export function paintSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  skyH: number,
  spec: EraSceneSpec,
  rnd: () => number,
) {
  const g = ctx.createLinearGradient(0, 0, 0, skyH * 1.6);
  g.addColorStop(0, spec.sky[0]);
  g.addColorStop(0.55, spec.sky[1]);
  g.addColorStop(1, spec.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, skyH + 1);

  // the light behind the land: sun low over the water, or a burning city
  const [gx, gy, gr, gc, ga] = spec.glow;
  const rg = ctx.createRadialGradient(gx * w, gy * skyH, 0, gx * w, gy * skyH, Math.max(gr * w, skyH * 2));
  rg.addColorStop(0, gc);
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = ga;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, skyH * 1.7);
  ctx.restore();

  // cloud banks: long flat wisps, thin and high
  const night = spec.weather === 'night';
  ctx.save();
  if (night) {
    for (let i = 0; i < 40; i++) {
      const x = rnd() * w;
      const y = rnd() * skyH * 0.9;
      const r = 0.5 + rnd() * 1.1;
      ctx.globalAlpha = 0.35 + rnd() * 0.55;
      ctx.fillStyle = '#fff8e0';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
  } else {
    const dark = spec.weather === 'storm' || spec.weather === 'rain' || spec.weather === 'fog';
    for (let i = 0; i < 9; i++) {
      const x = rnd() * w;
      const y = skyH * (0.1 + rnd() * 0.7);
      const rx = w * (0.06 + rnd() * 0.16);
      const ry = skyH * (0.1 + rnd() * 0.22);
      ctx.globalAlpha = dark ? 0.3 : 0.22;
      ctx.fillStyle = dark ? '#1d2733' : '#ffffff';
      blob(ctx, x, y, rx, ry, 0.35);
      blob(ctx, x + rx * 0.5, y + ry * 0.2, rx * 0.6, ry * 0.7, 0.35);
    }
  }
  ctx.restore();
}

/**
 * The shore itself, drawn as one dark wash and then hazed back with the
 * horizon colour. `skyH` is the waterline the silhouettes stand on.
 */
export function paintCoastline(
  ctx: CanvasRenderingContext2D,
  w: number,
  skyH: number,
  spec: EraSceneSpec,
  seed: number,
) {
  const rnd = mulberry32(seed);
  const base = skyH + 1.5;
  const hMax = Math.max(9, skyH * 0.92);
  // nothing pokes through the top of the card: the sky band is the ceiling
  const cap = skyH * 0.96;
  ctx.save();
  ctx.fillStyle = 'rgba(9,18,30,0.92)';
  for (const [kind, x, s] of spec.coast) {
    const h = Math.min(hMax * Math.max(0.35, Math.min(1.6, s)), cap);
    PAINTERS[kind](ctx, x * w, base, h, rnd);
  }
  ctx.restore();

  // smoke off a volcano, a burning shore or a gas flare
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [kind, x, s] of spec.coast) {
    if (kind !== 'volcano' && kind !== 'oilrig') continue;
    const h = hMax * s;
    const sx = kind === 'oilrig' ? x * w + h * 0.9 : x * w;
    const sy = base - (kind === 'oilrig' ? h * 0.62 : h * 1.5);
    for (let i = 0; i < 5; i++) {
      const k = i / 5;
      ctx.globalAlpha = (1 - k) * 0.22;
      ctx.fillStyle = kind === 'oilrig' ? '#ff9a3a' : '#e8dcc8';
      blob(ctx, sx + k * h * 0.5, sy - k * h * 0.5, h * (0.1 + k * 0.34), h * (0.09 + k * 0.26));
    }
  }
  ctx.restore();

  // atmospheric perspective: the horizon's own colour over everything standing
  const hazeA = spec.weather === 'night' ? 0.22 : 0.5;
  const haze = ctx.createLinearGradient(0, base - hMax * 1.5, 0, base + 2);
  haze.addColorStop(0, hexA(spec.sky[2], hazeA));
  haze.addColorStop(1, hexA(spec.sky[2], 0.1));
  ctx.fillStyle = haze;
  ctx.fillRect(0, Math.max(0, base - hMax * 1.6), w, hMax * 1.6 + 3);

  // surf at the waterline
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < w; x += 7) {
    const y = base + Math.sin(x * 0.09) * 0.8;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

/** `#rrggbb` → `rgba(r,g,b,a)`. */
export function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
