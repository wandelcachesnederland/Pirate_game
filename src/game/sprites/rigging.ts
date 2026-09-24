// Everything a ship carries above the deck: sails, mast-top emblems and flags.
// Each draw call expects the context to already be translated/rotated into the
// ship's local space (origin at hull centre, bow along +x).

import { TAU } from '../math';
import type { Faction } from '../types';

export const FLAG: Record<Faction, [string, string]> = {
  pirate: ['#151313', '#f2ead8'],
  spain: ['#c0392b', '#f1c40f'],
  england: ['#c0392b', '#ffffff'],
  merchant: ['#e67e22', '#ffffff'],
  fire: ['#ff5a1f', '#ffd166'],
};

/** One square sail on the mast at local x = `mx`. */
export function drawSail(
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

/** Faction badge painted on the largest sail. */
export function drawEmblem(ctx: CanvasRenderingContext2D, f: Faction, mx: number, bulge: number, yard: number) {
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

/** Waving ensign; `rel` is the ship heading relative to the wind. */
export function drawFlag(ctx: CanvasRenderingContext2D, f: Faction, mx: number, rel: number, t: number) {
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
