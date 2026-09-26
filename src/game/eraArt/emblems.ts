// The seal on each era's logo: one bold mark, drawn as vectors so it stays
// crisp from a phone plate to a 4K cabinet.
//
// Every mark is painted inside a circle of radius `r` centred on the origin —
// the caller translates, picks the colours and draws the ring around it. `ink`
// is the mark, `ground` is what the seal behind it is made of (used to punch
// eyes, gaps and negative space back out).

import { TAU } from '../math';
import type { EmblemId } from './scenes';

/** An n-point star between two radii, rotated by `rot`. */
function star(ctx: CanvasRenderingContext2D, n: number, r1: number, r2: number, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n;
    const rr = i % 2 ? r2 : r1;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/** A thick arc, the way a wreath or a crescent is built. */
function arcStroke(
  ctx: CanvasRenderingContext2D,
  r: number,
  a0: number,
  a1: number,
  w: number,
  ink: string,
) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, r, a0, a1);
  ctx.stroke();
  ctx.restore();
}

/** A teardrop: flames, hooks, spear points. */
function drop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.quadraticCurveTo(w, -h * 0.25, w * 0.62, h * 0.32);
  ctx.quadraticCurveTo(0, h, -w * 0.62, h * 0.32);
  ctx.quadraticCurveTo(-w, -h * 0.25, 0, -h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A simple leaf, used by wreaths and bamboo. */
function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, wid: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.5, wid, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

type Mark = (ctx: CanvasRenderingContext2D, r: number, ink: string, ground: string) => void;

const MARKS: Record<EmblemId, Mark> = {
  skull: (ctx, r, ink, ground) => {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.52, Math.PI * 0.98, Math.PI * 0.02);
    ctx.lineTo(r * 0.34, r * 0.42);
    ctx.quadraticCurveTo(0, r * 0.62, -r * 0.34, r * 0.42);
    ctx.closePath();
    ctx.fill();
    // crossed bones behind the cranium
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineWidth = r * 0.13;
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.62, r * 0.34);
      ctx.lineTo(-s * r * 0.62, r * 0.78);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.ellipse(-r * 0.21, -r * 0.14, r * 0.15, r * 0.18, 0.2, 0, TAU);
    ctx.ellipse(r * 0.21, -r * 0.14, r * 0.15, r * 0.18, -0.2, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, r * 0.06);
    ctx.lineTo(r * 0.08, r * 0.24);
    ctx.lineTo(-r * 0.08, r * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-r * 0.26, r * 0.36, r * 0.52, r * 0.05);
  },

  compass: (ctx, r, ink, ground) => {
    arcStroke(ctx, r * 0.72, 0, TAU, r * 0.08, ink);
    ctx.fillStyle = ink;
    star(ctx, 4, r * 0.66, r * 0.13);
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.12, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ink;
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8 + Math.PI / 8;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86, r * 0.035, 0, TAU);
      ctx.fill();
    }
  },

  crown: (ctx, r, ink, ground) => {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(-r * 0.62, r * 0.4);
    ctx.lineTo(-r * 0.68, -r * 0.34);
    ctx.lineTo(-r * 0.3, -r * 0.02);
    ctx.lineTo(0, -r * 0.56);
    ctx.lineTo(r * 0.3, -r * 0.02);
    ctx.lineTo(r * 0.68, -r * 0.34);
    ctx.lineTo(r * 0.62, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-r * 0.62, r * 0.46, r * 1.24, r * 0.16);
    for (const x of [-r * 0.68, 0, r * 0.68]) {
      ctx.beginPath();
      ctx.arc(x, x === 0 ? -r * 0.66 : -r * 0.44, r * 0.09, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.arc(0, r * 0.16, r * 0.09, 0, TAU);
    ctx.fill();
  },

  star: (ctx, r, ink) => {
    ctx.fillStyle = ink;
    star(ctx, 5, r * 0.86, r * 0.36);
  },

  axe: (ctx, r, ink) => {
    ctx.save();
    ctx.fillStyle = ink;
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.rotate(s * 0.72);
      ctx.fillRect(-r * 0.055, -r * 0.7, r * 0.11, r * 1.4);
      ctx.beginPath();
      ctx.moveTo(r * 0.05, -r * 0.72);
      ctx.quadraticCurveTo(r * 0.66, -r * 0.6, r * 0.5, -r * 0.06);
      ctx.quadraticCurveTo(r * 0.34, -r * 0.2, r * 0.05, -r * 0.26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  },

  anchor: (ctx, r, ink, ground) => {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = r * 0.12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.19, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, r * 0.18);
    ctx.lineTo(0, r * 0.78);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, r * 0.34);
    ctx.lineTo(r * 0.4, r * 0.34);
    ctx.stroke();
    ctx.lineWidth = r * 0.13;
    ctx.beginPath();
    ctx.arc(0, r * 0.42, r * 0.5, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.48, r * 0.5);
      ctx.lineTo(s * r * 0.66, r * 0.28);
      ctx.lineTo(s * r * 0.34, r * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.08, 0, TAU);
    ctx.fill();
  },

  swords: (ctx, r, ink) => {
    ctx.save();
    ctx.fillStyle = ink;
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.rotate(s * 0.6);
      // blade
      ctx.beginPath();
      ctx.moveTo(-r * 0.07, r * 0.2);
      ctx.lineTo(-r * 0.05, -r * 0.72);
      ctx.lineTo(0, -r * 0.86);
      ctx.lineTo(r * 0.05, -r * 0.72);
      ctx.lineTo(r * 0.07, r * 0.2);
      ctx.closePath();
      ctx.fill();
      // guard and grip
      ctx.fillRect(-r * 0.26, r * 0.2, r * 0.52, r * 0.09);
      ctx.fillRect(-r * 0.05, r * 0.28, r * 0.1, r * 0.34);
      ctx.beginPath();
      ctx.arc(0, r * 0.66, r * 0.08, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  },

  wings: (ctx, r, ink, ground) => {
    ctx.save();
    ctx.fillStyle = ink;
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.scale(s, 1);
      ctx.beginPath();
      ctx.moveTo(r * 0.1, -r * 0.06);
      ctx.quadraticCurveTo(r * 0.5, -r * 0.5, r * 0.92, -r * 0.3);
      ctx.quadraticCurveTo(r * 0.66, -r * 0.1, r * 0.78, r * 0.12);
      ctx.quadraticCurveTo(r * 0.48, r * 0.02, r * 0.56, r * 0.32);
      ctx.quadraticCurveTo(r * 0.26, r * 0.16, r * 0.1, r * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ground;
    star(ctx, 5, r * 0.13, r * 0.055);
  },

  missile: (ctx, r, ink, ground) => {
    ctx.save();
    ctx.rotate(-0.5);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.86);
    ctx.quadraticCurveTo(r * 0.2, -r * 0.5, r * 0.2, r * 0.34);
    ctx.lineTo(-r * 0.2, r * 0.34);
    ctx.quadraticCurveTo(-r * 0.2, -r * 0.5, 0, -r * 0.86);
    ctx.closePath();
    ctx.fill();
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.18, r * 0.02);
      ctx.lineTo(s * r * 0.56, r * 0.52);
      ctx.lineTo(s * r * 0.18, r * 0.44);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.arc(0, -r * 0.34, r * 0.07, 0, TAU);
    ctx.fill();
    ctx.restore();
  },

  laurel: (ctx, r, ink) => {
    ctx.fillStyle = ink;
    for (const s of [-1, 1]) {
      arcStroke(ctx, r * 0.62, Math.PI * (s > 0 ? 0.42 : 0.58), Math.PI * (s > 0 ? 1.02 : 1.58), r * 0.07, ink);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI * (0.5 + s * (0.2 + i * 0.2));
        const x = Math.cos(a) * r * 0.62;
        const y = Math.sin(a) * r * 0.62;
        leaf(ctx, x, y, r * 0.42, r * 0.17, a + s * 1.25);
      }
    }
    ctx.beginPath();
    ctx.arc(0, r * 0.66, r * 0.09, 0, TAU);
    ctx.fill();
  },

  trident: (ctx, r, ink) => {
    ctx.fillStyle = ink;
    ctx.fillRect(-r * 0.07, -r * 0.3, r * 0.14, r * 1.06);
    ctx.fillRect(-r * 0.52, -r * 0.34, r * 1.04, r * 0.11);
    for (const x of [-r * 0.5, 0, r * 0.5]) {
      const h = x === 0 ? r * 0.86 : r * 0.62;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.09, -r * 0.3);
      ctx.lineTo(x, -r * 0.3 - h);
      ctx.lineTo(x + r * 0.09, -r * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(-r * 0.2, r * 0.62, r * 0.4, r * 0.12);
  },

  crescent: (ctx, r, ink, ground) => {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.1, r * 0.66, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.save();
    ctx.translate(-r * 0.1, r * 0.06);
    star(ctx, 5, r * 0.26, r * 0.11);
    ctx.restore();
  },

  pagoda: (ctx, r, ink) => {
    ctx.fillStyle = ink;
    for (let i = 0; i < 3; i++) {
      const w = r * (1.24 - i * 0.34);
      const y = r * 0.66 - i * r * 0.44;
      ctx.fillRect(-w * 0.16, y - r * 0.24, w * 0.32, r * 0.26);
      ctx.beginPath();
      ctx.moveTo(-w / 2, y - r * 0.2);
      ctx.quadraticCurveTo(0, y - r * 0.5, w / 2, y - r * 0.2);
      ctx.lineTo(w * 0.26, y - r * 0.16);
      ctx.lineTo(-w * 0.26, y - r * 0.16);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(-r * 0.04, -r * 0.86, r * 0.08, r * 0.24);
  },

  chrysanthemum: (ctx, r, ink) => {
    ctx.fillStyle = ink;
    for (let i = 0; i < 16; i++) {
      const a = (i * TAU) / 16;
      leaf(ctx, 0, 0, r * 0.84, r * 0.17, a);
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, TAU);
    ctx.fill();
  },

  koru: (ctx, r, ink) => {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineCap = 'round';
    ctx.lineWidth = r * 0.17;
    ctx.beginPath();
    for (let i = 0; i <= 46; i++) {
      const k = i / 46;
      const a = -Math.PI * 0.35 + k * Math.PI * 2.35;
      const rr = r * 0.78 * (1 - k * 0.86);
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr + r * 0.12 * k;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(r * 0.06, r * 0.1, r * 0.13, 0, TAU);
    ctx.fill();
  },

  hook: (ctx, r, ink) => {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineCap = 'round';
    ctx.lineWidth = r * 0.19;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.78);
    ctx.lineTo(-r * 0.16, r * 0.1);
    ctx.arc(r * 0.16, r * 0.1, r * 0.32, Math.PI, Math.PI * 0.05, true);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(r * 0.44, -r * 0.16);
    ctx.lineTo(r * 0.68, r * 0.16);
    ctx.lineTo(r * 0.3, r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-r * 0.46, -r * 0.84, r * 0.34, r * 0.14);
  },

  vergina: (ctx, r, ink, ground) => {
    ctx.fillStyle = ink;
    for (let i = 0; i < 16; i++) {
      const a = (i * TAU) / 16;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(-r * 0.1, -r * 0.2);
      ctx.lineTo(0, -r * 0.86);
      ctx.lineTo(r * 0.1, -r * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.26, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ground;
    star(ctx, 8, r * 0.17, r * 0.07);
  },

  pyramid: (ctx, r, ink, ground) => {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(-r * 0.84, r * 0.56);
    ctx.lineTo(0, -r * 0.7);
    ctx.lineTo(r * 0.84, r * 0.56);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ground;
    ctx.fillRect(-r * 0.1, r * 0.16, r * 0.2, r * 0.4);
  },

  cross: (ctx, r, ink) => {
    ctx.fillStyle = ink;
    const w = r * 0.19;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-w, s * w);
      ctx.lineTo(s * r * 0.72, s * w * 1.5);
      ctx.lineTo(s * r * 0.86, 0);
      ctx.lineTo(s * r * 0.72, -s * w * 1.5);
      ctx.lineTo(-w, -s * w);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, w * 1.05, 0, TAU);
    ctx.fill();
  },

  taegeuk: (ctx, r, ink, ground) => {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(0, -r * 0.39, r * 0.39, Math.PI * 1.5, Math.PI * 0.5, true);
    ctx.arc(0, r * 0.39, r * 0.39, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -r * 0.39, r * 0.15, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(0, r * 0.39, r * 0.15, 0, TAU);
    ctx.fill();
  },

  flame: (ctx, r, ink, ground) => {
    ctx.fillStyle = ink;
    drop(ctx, 0, r * 0.06, r * 0.56, r * 0.76);
    ctx.fillStyle = ground;
    drop(ctx, 0, r * 0.3, r * 0.28, r * 0.4);
    ctx.fillStyle = ink;
    drop(ctx, -r * 0.44, r * 0.4, r * 0.16, r * 0.3, -0.5);
    drop(ctx, r * 0.44, r * 0.4, r * 0.16, r * 0.3, 0.5);
  },

  ankh: (ctx, r, ink, ground) => {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.3, r * 0.38, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.15, r * 0.22, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.fillRect(-r * 0.08, -r * 0.06, r * 0.16, r * 0.9);
    ctx.fillRect(-r * 0.52, -r * 0.04, r * 1.04, r * 0.15);
  },

  fish: (ctx, r, ink) => {
    ctx.fillStyle = ink;
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(0, s * r * 0.3);
      ctx.rotate(s * -0.16);
      ctx.beginPath();
      ctx.moveTo(-r * 0.72, 0);
      ctx.quadraticCurveTo(-r * 0.1, -r * 0.3, r * 0.52, 0);
      ctx.quadraticCurveTo(-r * 0.1, r * 0.3, -r * 0.72, 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.46, 0);
      ctx.lineTo(r * 0.82, -r * 0.2);
      ctx.lineTo(r * 0.82, r * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },

  bamboo: (ctx, r, ink) => {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineCap = 'round';
    ctx.lineWidth = r * 0.15;
    ctx.beginPath();
    ctx.moveTo(-r * 0.06, r * 0.86);
    ctx.quadraticCurveTo(-r * 0.02, 0, r * 0.06, -r * 0.8);
    ctx.stroke();
    for (const y of [-r * 0.44, -r * 0.02, r * 0.4]) {
      ctx.fillRect(-r * 0.2, y, r * 0.4, r * 0.07);
    }
    leaf(ctx, r * 0.04, -r * 0.44, r * 0.62, r * 0.15, -0.5);
    leaf(ctx, -r * 0.04, -r * 0.06, r * 0.58, r * 0.14, Math.PI + 0.42);
    leaf(ctx, r * 0.05, r * 0.36, r * 0.5, r * 0.13, -0.34);
    ctx.restore();
  },

  obsidian: (ctx, r, ink, ground) => {
    ctx.save();
    ctx.rotate(-0.42);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 0.9);
    ctx.lineTo(-r * 0.24, -r * 0.6);
    ctx.quadraticCurveTo(0, -r * 0.94, r * 0.24, -r * 0.6);
    ctx.lineTo(r * 0.2, r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ground;
    for (let i = 0; i < 5; i++) {
      const y = -r * 0.5 + i * r * 0.28;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.2, y);
        ctx.lineTo(s * r * 0.34, y - r * 0.1);
        ctx.lineTo(s * r * 0.2, y + r * 0.08);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  },

  inti: (ctx, r, ink, ground) => {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineWidth = r * 0.1;
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i * TAU) / 12;
      const wavy = i % 2 === 0;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.44, Math.sin(a) * r * 0.44);
      if (wavy) {
        ctx.quadraticCurveTo(
          Math.cos(a + 0.3) * r * 0.66,
          Math.sin(a + 0.3) * r * 0.66,
          Math.cos(a) * r * 0.88,
          Math.sin(a) * r * 0.88,
        );
      } else {
        ctx.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.44, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.08, r * 0.06, 0, TAU);
    ctx.arc(r * 0.15, -r * 0.08, r * 0.06, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.16, 0.2, Math.PI - 0.2);
    ctx.stroke();
  },
};

/** The seal: a coin of the era's own colours with its mark stamped on it. */
export function drawEmblem(
  ctx: CanvasRenderingContext2D,
  id: EmblemId,
  cx: number,
  cy: number,
  r: number,
  ink: string,
  ground: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  MARKS[id](ctx, r, ink, ground);
  ctx.restore();
}
