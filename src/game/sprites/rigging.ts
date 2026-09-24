// Everything a ship carries above the deck: sails, mast-top emblems and flags.
// Each draw call expects the context to already be translated/rotated into the
// ship's local space (origin at hull centre, bow along +x).

import { makeCanvas } from '../canvas';
import { TAU } from '../math';
import type { Faction } from '../types';

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
    case 'france':
      ctx.fillStyle = '#2c4a9a';
      ctx.fillRect(cx - 2.4, -5, 1.6, 10);
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(cx - 0.8, -5, 1.6, 10);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(cx + 0.8, -5, 1.6, 10);
      break;
    case 'merchant':
      ctx.fillStyle = 'rgba(150,120,70,0.55)';
      ctx.fillRect(cx - 1.8, 2.5, 3.2, 4.5);
      ctx.fillRect(cx - 1.4, -7, 2.8, 3.2);
      break;
  }
  ctx.restore();
}

// ------------------------------------------------------------------ ensigns
/** Flat faction flag art, painted into a `w`x`h` box from its top-left corner. */
export function drawFlagArt(ctx: CanvasRenderingContext2D, f: Faction, w: number, h: number) {
  switch (f) {
    case 'pirate': {
      ctx.fillStyle = '#151313';
      ctx.fillRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.5;
      const s = Math.min(w, h) * 0.3;
      ctx.strokeStyle = '#f2ead8';
      ctx.lineWidth = Math.max(0.5, s * 0.22);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - s, cy + s);
      ctx.lineTo(cx + s, cy - s * 0.2);
      ctx.moveTo(cx + s, cy + s);
      ctx.lineTo(cx - s, cy - s * 0.2);
      ctx.stroke();
      ctx.fillStyle = '#f2ead8';
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.25, s * 0.72, 0, TAU);
      ctx.fill();
      ctx.fillRect(cx - s * 0.5, cy - s * 0.1, s, s * 0.55);
      ctx.fillStyle = '#151313';
      ctx.beginPath();
      ctx.arc(cx - s * 0.3, cy - s * 0.3, s * 0.2, 0, TAU);
      ctx.arc(cx + s * 0.3, cy - s * 0.3, s * 0.2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'spain': {
      ctx.fillStyle = '#c8102e';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(0, h * 0.28, w, h * 0.44);
      break;
    }
    case 'england': {
      ctx.fillStyle = '#f6f2e8';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(0, h * 0.4, w, h * 0.2);
      ctx.fillRect(w * 0.42, 0, w * 0.16, h);
      break;
    }
    case 'france': {
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2c4a9a';
      ctx.fillRect(0, 0, w * 0.2, h);
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(w * 0.58, h * 0.5, Math.min(w, h) * 0.2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'merchant': {
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(0, h / 3, w, h / 3);
      ctx.fillStyle = '#2e5e8c';
      ctx.fillRect(0, (h * 2) / 3, w, h / 3);
      break;
    }
    case 'fire': {
      ctx.fillStyle = '#51403a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ff5a1f';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.5, h * 0.2);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
}

const flagTiles = new Map<Faction, HTMLCanvasElement>();

function flagTile(f: Faction): HTMLCanvasElement {
  let c = flagTiles.get(f);
  if (!c) {
    const [cv, cx] = makeCanvas(48, 24);
    drawFlagArt(cx, f, 48, 24);
    c = cv;
    flagTiles.set(f, c);
  }
  return c;
}

/**
 * Ensign on the mast at local x = `mx`, waving with the relative wind.
 * The flat flag art is blitted in vertical strips so it ripples.
 */
export function drawEnsign(
  ctx: CanvasRenderingContext2D,
  f: Faction,
  mx: number,
  rel: number,
  t: number,
  scale = 1,
) {
  const L = 13 * scale;
  const H = 7 * scale;
  ctx.save();
  ctx.translate(mx, 0);
  ctx.rotate(rel);
  const tile = flagTile(f);
  const STRIPS = 8;
  const sw = tile.width / STRIPS;
  for (let i = 0; i < STRIPS; i++) {
    const t0 = i / STRIPS;
    const t1 = (i + 1) / STRIPS;
    const off = Math.sin(t * 9 - t0 * 3.4) * 1.5 * scale * (0.25 + t0);
    const h0 = H * (1 - t0 * 0.12);
    ctx.drawImage(tile, i * sw, 0, sw + 0.6, tile.height, L * t0, -h0 / 2 + off, L * (t1 - t0) + 0.4, h0);
  }
  ctx.restore();
}
