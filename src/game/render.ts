import { makeCanvas } from './canvas';
import { mulberry32, TAU } from './math';
import type { Island } from './types';

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
