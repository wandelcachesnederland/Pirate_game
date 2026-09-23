import type { Faction, Island, Ship, ShipDef } from './types';

const TAU = Math.PI * 2;

/** Small, fast seeded PRNG so islands are reproducible from a seed. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

function angDiff(a: number, b: number) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  else if (d < -Math.PI) d += TAU;
  return d;
}

export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

// ---------------------------------------------------------------- textures
export function makeWaterTile(): HTMLCanvasElement {
  const S = 512;
  const [c, ctx] = makeCanvas(S, S);
  const rnd = mulberry32(1337);
  for (let i = 0; i < 48; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const r = 40 + rnd() * 120;
    const light = rnd() < 0.5;
    const base = light ? '120,225,235,' : '4,38,78,';
    const a = light ? 0.045 + rnd() * 0.05 : 0.06 + rnd() * 0.07;
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const cx = x + ox * S;
        const cy = y + oy * S;
        if (cx + r < 0 || cx - r > S || cy + r < 0 || cy - r > S) continue;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(${base}${a})`);
        g.addColorStop(1, `rgba(${base}0)`);
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
    }
  }
  return c;
}

export function makeWaveTile(seed: number, count: number, alpha: number): HTMLCanvasElement {
  const S = 256;
  const [c, ctx] = makeCanvas(S, S);
  const rnd = mulberry32(seed);
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const r = 5 + rnd() * 11;
    const a = alpha * (0.45 + rnd() * 0.55);
    ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.lineWidth = 1.1 + rnd() * 1.4;
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const cx = x + ox * S;
        const cy = y + oy * S;
        if (cx + r < -2 || cx - r > S + 2 || cy + r < -2 || cy - r > S + 2) continue;
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 1.18, Math.PI * 1.82);
        ctx.stroke();
      }
    }
  }
  return c;
}

export function makeGlow(inner: string, mid: string, outer: string): HTMLCanvasElement {
  const S = 64;
  const [c, ctx] = makeCanvas(S, S);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, mid);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return c;
}

export function makeVignette(r: number, g: number, b: number, strength: number): HTMLCanvasElement {
  const S = 256;
  const [c, ctx] = makeCanvas(S, S);
  const gr = ctx.createRadialGradient(128, 128, 50, 128, 128, 182);
  gr.addColorStop(0, `rgba(${r},${g},${b},0)`);
  gr.addColorStop(0.55, `rgba(${r},${g},${b},${strength * 0.18})`);
  gr.addColorStop(1, `rgba(${r},${g},${b},${strength})`);
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, S, S);
  return c;
}

// ---------------------------------------------------------------- islands
export function islandRadiusAt(is: { r: number; harm: { amp: number; freq: number; phase: number }[] }, a: number) {
  let k = 1;
  for (let i = 0; i < is.harm.length; i++) {
    const h = is.harm[i];
    k += h.amp * Math.sin(h.freq * a + h.phase);
  }
  return is.r * k;
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, rnd: () => number) {
  ctx.fillStyle = 'rgba(0,30,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.5, y + s * 0.6, s * 0.95, s * 0.8, 0, 0, TAU);
  ctx.fill();
  const n = 7;
  const angles: number[] = [];
  for (let k = 0; k < n; k++) {
    const a = rot + (k / n) * TAU + (rnd() - 0.5) * 0.35;
    angles.push(a);
    const len = s * (0.85 + rnd() * 0.3);
    ctx.fillStyle = k % 2 ? '#3f8f3a' : '#58ab48';
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5, len * 0.56, s * 0.2, a, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(28,70,24,0.65)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (const a of angles) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * s * 0.95, y + Math.sin(a) * s * 0.95);
  }
  ctx.stroke();
  ctx.fillStyle = '#7a5530';
  ctx.beginPath();
  ctx.arc(x, y, s * 0.16, 0, TAU);
  ctx.fill();
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rnd: () => number) {
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(x, y, s + 2.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#6c675f';
  ctx.beginPath();
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const r = s * (0.78 + rnd() * 0.32);
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#a19b8f';
  ctx.beginPath();
  ctx.arc(x - s * 0.25, y - s * 0.25, s * 0.45, 0, TAU);
  ctx.fill();
}

function drawHut(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(-s / 2 + 2, -s / 2 + 3, s, s);
  ctx.fillStyle = '#b8914f';
  ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.strokeStyle = '#7a5a2c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-s / 2, -s / 2);
  ctx.lineTo(-s * 0.2, 0);
  ctx.lineTo(-s / 2, s / 2);
  ctx.moveTo(s / 2, -s / 2);
  ctx.lineTo(s * 0.2, 0);
  ctx.lineTo(s / 2, s / 2);
  ctx.moveTo(-s * 0.2, 0);
  ctx.lineTo(s * 0.2, 0);
  ctx.stroke();
  ctx.strokeRect(-s / 2, -s / 2, s, s);
  ctx.restore();
}

export function buildIsland(x: number, y: number, r: number, seed: number, res: number): Island {
  const rnd = mulberry32(seed);
  const harm = [
    { amp: 0.09 + rnd() * 0.08, freq: 2, phase: rnd() * TAU },
    { amp: 0.05 + rnd() * 0.06, freq: 3, phase: rnd() * TAU },
    { amp: 0.03 + rnd() * 0.03, freq: 5, phase: rnd() * TAU },
    { amp: 0.012 + rnd() * 0.015, freq: 9, phase: rnd() * TAU },
  ];
  const ampSum = harm.reduce((s, h) => s + h.amp, 0);
  const maxR = r * (1 + ampSum);
  const halo = 58;
  const half = maxR + halo;
  const [c, ctx] = makeCanvas(half * 2 * res, half * 2 * res);
  ctx.scale(res, res);
  ctx.translate(half, half);
  const base = { r, harm };
  const N = 84;
  const poly = (mul: number, add: number, wobble = 0, ws = 0): Path2D => {
    const p = new Path2D();
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * TAU;
      let rr2 = islandRadiusAt(base, a) * mul + add;
      if (wobble) rr2 += Math.sin(a * 7 + ws) * wobble + Math.sin(a * 13 + ws * 2) * wobble * 0.5;
      const px = Math.cos(a) * rr2;
      const py = Math.sin(a) * rr2;
      if (i === 0) p.moveTo(px, py);
      else p.lineTo(px, py);
    }
    p.closePath();
    return p;
  };

  // shallows
  ctx.fillStyle = 'rgba(110, 215, 210, 0.13)';
  ctx.fill(poly(1, 52, 5, 1));
  ctx.fillStyle = 'rgba(125, 226, 214, 0.18)';
  ctx.fill(poly(1, 33, 4, 2));
  ctx.fillStyle = 'rgba(155, 238, 222, 0.28)';
  ctx.fill(poly(1, 16, 3, 3));
  // wet sand + sand
  ctx.fillStyle = '#c9ad74';
  ctx.fill(poly(1, 4));
  const sand = poly(1, 0);
  ctx.fillStyle = '#edd7a1';
  ctx.fill(sand);
  ctx.save();
  ctx.clip(sand);
  for (let i = 0; i < 80; i++) {
    const a = rnd() * TAU;
    const d = rnd() * maxR;
    ctx.fillStyle = rnd() < 0.5 ? 'rgba(190,160,100,0.35)' : 'rgba(255,248,220,0.5)';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 1 + rnd() * 2.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // jungle
  const jungle = poly(0.7, -8, 5, seed % 7);
  ctx.fillStyle = '#2d6a30';
  ctx.fill(jungle);
  ctx.save();
  ctx.clip(jungle);
  const greens = ['#3c8a3b', '#4e9d45', '#2b5f2c', '#5aae4e', '#347a36', '#468f3f'];
  const blobs = Math.floor(r * 0.5);
  for (let i = 0; i < blobs; i++) {
    const a = rnd() * TAU;
    const d = Math.sqrt(rnd()) * r * 0.75;
    const br = r * (0.055 + rnd() * 0.085);
    const bx = Math.cos(a) * d;
    const by = Math.sin(a) * d;
    ctx.fillStyle = 'rgba(10,40,12,0.35)';
    ctx.beginPath();
    ctx.arc(bx + 2, by + 3, br, 0, TAU);
    ctx.fill();
    ctx.fillStyle = greens[i % greens.length];
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,220,110,0.22)';
    ctx.beginPath();
    ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.45, 0, TAU);
    ctx.fill();
  }
  if (r > 135) {
    ctx.fillStyle = '#6a7d43';
    ctx.fill(poly(0.3, -8, 4, seed));
    ctx.fillStyle = '#8b8764';
    ctx.fill(poly(0.17, -5, 3, seed + 3));
    ctx.fillStyle = '#b8b192';
    ctx.fill(poly(0.07, -2, 1.5, seed + 5));
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,60,25,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke(jungle);

  // palms along the beach ring
  const palms = 5 + Math.floor(r / 20);
  for (let i = 0; i < palms; i++) {
    const a = rnd() * TAU;
    const d = islandRadiusAt(base, a) * (0.7 + rnd() * 0.17);
    drawPalm(ctx, Math.cos(a) * d, Math.sin(a) * d, 8 + rnd() * 6, rnd() * TAU, rnd);
  }
  // rocks in the shallows
  const rocks = 2 + Math.floor(rnd() * 5);
  for (let i = 0; i < rocks; i++) {
    const a = rnd() * TAU;
    const d = islandRadiusAt(base, a) + 8 + rnd() * 26;
    drawRock(ctx, Math.cos(a) * d, Math.sin(a) * d, 3 + rnd() * 6, rnd);
  }
  // a little fishing village with a dock
  if (rnd() < 0.5) {
    const a = rnd() * TAU;
    const d = islandRadiusAt(base, a);
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    ctx.save();
    ctx.translate(dx * (d - 4), dy * (d - 4));
    ctx.rotate(a);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(2, -3 + 3, 34, 7);
    ctx.fillStyle = '#8a6338';
    ctx.fillRect(0, -3.5, 34, 7);
    ctx.strokeStyle = '#5a3d1f';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let k = 3; k < 34; k += 4) {
      ctx.moveTo(k, -3.5);
      ctx.lineTo(k, 3.5);
    }
    ctx.stroke();
    ctx.restore();
    for (let k = 0; k < 3; k++) {
      const aa = a + (k - 1) * 0.16;
      const dd = islandRadiusAt(base, aa) * (0.8 - (k % 2) * 0.08);
      drawHut(ctx, Math.cos(aa) * dd, Math.sin(aa) * dd, 10 + rnd() * 4, aa + rnd() * 0.4);
    }
  }
  const shore = poly(1, 1.5);
  return { x, y, r, maxR, harm, canvas: c, half, shore, seed };
}

// ---------------------------------------------------------------- ships
interface ShipPaths {
  hull: Path2D;
  deck: Path2D;
  planks: Path2D;
  masts: number[];
}
const pathCache = new Map<string, ShipPaths>();

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

export function cannonLocalX(def: ShipDef, n: number, i: number) {
  const hl = def.length / 2;
  const t = n <= 1 ? 0.5 : i / (n - 1);
  return -hl * 0.52 + t * hl * 0.88;
}

const FLAG: Record<Faction, [string, string]> = {
  pirate: ['#151313', '#f2ead8'],
  spain: ['#c0392b', '#f1c40f'],
  england: ['#c0392b', '#ffffff'],
  merchant: ['#e67e22', '#ffffff'],
  fire: ['#ff5a1f', '#ffd166'],
};

function drawSail(
  ctx: CanvasRenderingContext2D,
  mx: number,
  sw: number,
  bulge: number,
  col: string,
  shade: string,
  yard: number,
) {
  ctx.save();
  ctx.translate(mx, 0);
  ctx.rotate(yard);
  const h = sw / 2;
  ctx.beginPath();
  ctx.moveTo(-2, -h);
  ctx.quadraticCurveTo(bulge * 2.4 - 2, 0, -2, h);
  ctx.lineTo(-4.5, h - 1.5);
  ctx.quadraticCurveTo(bulge * 1.2 - 4.5, 0, -4.5, -h + 1.5);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = shade;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#3b2412';
  ctx.beginPath();
  ctx.moveTo(-3.2, -h - 2);
  ctx.lineTo(-3.2, h + 2);
  ctx.stroke();
  ctx.restore();
}

function drawEmblem(ctx: CanvasRenderingContext2D, f: Faction, mx: number, bulge: number, yard: number) {
  if (f === 'fire') return;
  ctx.save();
  ctx.translate(mx, 0);
  ctx.rotate(yard);
  const cx = bulge * 0.9 - 2.8;
  switch (f) {
    case 'pirate':
      ctx.strokeStyle = '#efe6d2';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(cx - 2.2, -5);
      ctx.lineTo(cx + 2.2, 5);
      ctx.moveTo(cx + 2.2, -5);
      ctx.lineTo(cx - 2.2, 5);
      ctx.stroke();
      ctx.fillStyle = '#f2ead8';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1a1614';
      ctx.fillRect(cx - 0.3, -1.4, 1.1, 1.1);
      ctx.fillRect(cx - 0.3, 0.4, 1.1, 1.1);
      break;
    case 'spain':
      ctx.strokeStyle = '#b3261e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 2.2, -5.5);
      ctx.lineTo(cx + 2.2, 5.5);
      ctx.moveTo(cx + 2.2, -5.5);
      ctx.lineTo(cx - 2.2, 5.5);
      ctx.stroke();
      break;
    case 'england':
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(cx, -6.5);
      ctx.lineTo(cx, 6.5);
      ctx.moveTo(cx - 2.4, 0);
      ctx.lineTo(cx + 2.4, 0);
      ctx.stroke();
      break;
    case 'merchant':
      ctx.fillStyle = 'rgba(150,120,70,0.55)';
      ctx.fillRect(cx - 1.8, 2.5, 3.2, 4.5);
      ctx.fillRect(cx - 1.4, -7, 2.8, 3.2);
      break;
  }
  ctx.restore();
}

function drawFlag(ctx: CanvasRenderingContext2D, f: Faction, mx: number, rel: number, t: number) {
  ctx.save();
  ctx.translate(mx, 0);
  ctx.rotate(rel);
  const L = 12;
  const H = 6;
  const w1 = Math.sin(t * 9) * 1.1;
  const w2 = Math.sin(t * 9 + 1.8) * 1.4;
  const [c1, c2] = FLAG[f];
  ctx.beginPath();
  ctx.moveTo(0, -H / 2);
  ctx.quadraticCurveTo(L * 0.5, -H / 2 + w1, L, -H / 2 + w2);
  ctx.lineTo(L, H / 2 + w2);
  ctx.quadraticCurveTo(L * 0.5, H / 2 + w1, 0, H / 2);
  ctx.closePath();
  ctx.fillStyle = c1;
  ctx.fill();
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.stroke();
  ctx.fillStyle = c2;
  if (f === 'pirate') {
    ctx.beginPath();
    ctx.arc(L * 0.55, w1 * 0.6, 1.6, 0, TAU);
    ctx.fill();
  } else if (f === 'england') {
    ctx.fillRect(0.5, -H / 2 + 0.5, 4, 2.6);
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -H * 0.16);
    ctx.quadraticCurveTo(L * 0.5, -H * 0.16 + w1, L, -H * 0.16 + w2);
    ctx.lineTo(L, H * 0.16 + w2);
    ctx.quadraticCurveTo(L * 0.5, H * 0.16 + w1, 0, H * 0.16);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawShipShadow(ctx: CanvasRenderingContext2D, s: Ship) {
  const sinkK = s.sinking >= 0 ? Math.min(1, s.sinking / 2.4) : 0;
  if (sinkK >= 1) return;
  const paths = shipPaths(s.def);
  ctx.save();
  ctx.translate(s.x + 5, s.y + 7);
  ctx.rotate(s.angle);
  const sc = 1 - sinkK * 0.35;
  ctx.scale(sc * 1.04, sc * 1.1);
  ctx.globalAlpha = 0.3 * (1 - sinkK);
  ctx.fill(paths.hull);
  ctx.restore();
}

export function drawShip(ctx: CanvasRenderingContext2D, s: Ship, t: number, windAngle: number) {
  const def = s.def;
  const paths = shipPaths(def);
  const hl = def.length / 2;
  const hw = def.width / 2;
  const sinkK = s.sinking >= 0 ? Math.min(1, s.sinking / 2.4) : 0;
  if (sinkK >= 1) return;
  const flash = s.flash > 0;
  const baseA = sinkK > 0 ? Math.max(0, 1 - sinkK * sinkK) : 1;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle + sinkK * sinkK * 0.9 * s.sinkSpin);
  const bob = 1 + Math.sin(t * 2.3 + s.bob) * 0.012;
  const sc = (1 - sinkK * 0.35) * bob;
  const heel = 1 - Math.min(0.12, Math.abs(s.angVel) * 0.05);
  ctx.scale(sc, sc * heel);
  ctx.globalAlpha = baseA;

  // hull
  ctx.fillStyle = flash ? '#ffffff' : def.hull;
  ctx.fill(paths.hull);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#140a04';
  ctx.stroke(paths.hull);

  if (!flash) {
    ctx.fillStyle = def.deck;
    ctx.fill(paths.deck);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = def.trim;
    ctx.stroke(paths.deck);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = 'rgba(70,40,15,0.45)';
    ctx.stroke(paths.planks);
    // quarterdeck
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(-hl * 0.86, -hw * 0.56, hl * 0.36, hw * 1.12);
    ctx.strokeStyle = 'rgba(40,20,5,0.6)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-hl * 0.86, -hw * 0.56, hl * 0.36, hw * 1.12);
    // stern lantern
    ctx.fillStyle = '#ffd36b';
    ctx.beginPath();
    ctx.arc(-hl * 0.96, 0, 1.7, 0, TAU);
    ctx.fill();
    // cannons (recoil animated)
    const n = s.cannons;
    if (n > 0) {
      ctx.fillStyle = '#151515';
      for (let i = 0; i < n; i++) {
        const cx = cannonLocalX(def, n, i);
        ctx.fillRect(cx - 1.8, -hw - 2.8 + s.recoilL * 2.6, 3.6, 4.4);
        ctx.fillRect(cx - 1.8, hw - 1.6 - s.recoilR * 2.6, 3.6, 4.4);
      }
    }
    // bowsprit
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hl - 3, 0);
    ctx.lineTo(hl + 11, 0);
    ctx.stroke();
  }

  // sails
  const rel = angDiff(s.angle, windAngle);
  const push = Math.cos(rel);
  const flutter = push < 0.1 ? Math.sin(t * 24 + s.bob) * 1.3 : 0;
  const bulge = Math.max(1.4, (2 + Math.max(0, push) * 7.5) * (0.4 + 0.6 * s.sail)) + flutter;
  const yard = Math.max(-0.45, Math.min(0.45, Math.sin(rel) * 0.45));
  const sw = def.width * 1.55 * (0.6 + 0.4 * s.sail);
  const sailCol = flash ? '#ffffff' : def.sail;
  const nm = paths.masts.length;
  for (let m = 0; m < nm; m++) {
    const w = m === 0 && nm > 1 ? sw * 0.84 : sw;
    drawSail(ctx, paths.masts[m], w, bulge, sailCol, def.sailShade, yard);
  }
  const mainIdx = Math.min(1, nm - 1);
  if (!flash) drawEmblem(ctx, def.faction, paths.masts[mainIdx], bulge, yard);
  ctx.fillStyle = '#2a1a0c';
  for (let m = 0; m < nm; m++) {
    ctx.beginPath();
    ctx.arc(paths.masts[m] - 3.2, 0, 2.3, 0, TAU);
    ctx.fill();
  }
  drawFlag(ctx, def.faction, paths.masts[0] - 3.2, rel, t + s.bob);

  if (sinkK > 0) {
    ctx.globalAlpha = baseA * Math.min(0.75, sinkK * 1.2);
    ctx.fillStyle = '#0d4a63';
    ctx.fill(paths.hull);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- pickups
export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, seed: number, s: number) {
  const spin = Math.cos(t * 5 + seed);
  const w = Math.max(0.9, Math.abs(spin) * s);
  ctx.fillStyle = '#8a5a12';
  ctx.beginPath();
  ctx.ellipse(x, y + 1.3, w, s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = spin > 0 ? '#ffd84d' : '#f0b429';
  ctx.beginPath();
  ctx.ellipse(x, y, w, s, 0, 0, TAU);
  ctx.fill();
  if (w > 2) {
    ctx.fillStyle = 'rgba(255,255,230,0.85)';
    ctx.beginPath();
    ctx.ellipse(x - w * 0.3, y - s * 0.35, w * 0.28, s * 0.24, 0, 0, TAU);
    ctx.fill();
  }
}

export function drawChest(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, seed: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 2 + seed) * 0.15);
  ctx.fillStyle = 'rgba(0,20,40,0.3)';
  ctx.fillRect(-8, -4, 19, 13);
  ctx.fillStyle = '#6b3f1d';
  ctx.fillRect(-10, -7, 20, 14);
  ctx.fillStyle = '#8f572b';
  ctx.fillRect(-10, -7, 20, 5.5);
  ctx.fillStyle = '#e8b93a';
  ctx.fillRect(-10, -1.8, 20, 2);
  ctx.fillRect(-7, -7, 2.2, 14);
  ctx.fillRect(4.8, -7, 2.2, 14);
  ctx.fillStyle = '#fff0a0';
  ctx.fillRect(-1.6, -2.8, 3.2, 4);
  ctx.strokeStyle = '#2a160a';
  ctx.lineWidth = 1;
  ctx.strokeRect(-10, -7, 20, 14);
  ctx.restore();
}

export function drawCrate(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, seed: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 1.7 + seed) * 0.2 + seed);
  ctx.fillStyle = 'rgba(0,20,40,0.3)';
  ctx.fillRect(-5, -4, 15, 15);
  ctx.fillStyle = '#c99b5c';
  ctx.fillRect(-7.5, -7.5, 15, 15);
  ctx.strokeStyle = '#7a5530';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-7.5, -7.5, 15, 15);
  ctx.fillStyle = '#e8453c';
  ctx.fillRect(-1.7, -5, 3.4, 10);
  ctx.fillRect(-5, -1.7, 10, 3.4);
  ctx.restore();
}
