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
/** A single gold fleur-de-lis, drawn about (cx, cy) at scale `s`. */
function fleurDeLis(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.quadraticCurveTo(cx + s * 0.62, cy - s * 0.1, cx + s * 0.22, cy + s * 0.42);
  ctx.quadraticCurveTo(cx + s * 0.72, cy + s * 0.5, cx + s * 1.05, cy + s * 0.95);
  ctx.quadraticCurveTo(cx + s * 0.5, cy + s * 0.62, cx, cy + s * 1.0);
  ctx.quadraticCurveTo(cx - s * 0.5, cy + s * 0.62, cx - s * 1.05, cy + s * 0.95);
  ctx.quadraticCurveTo(cx - s * 0.72, cy + s * 0.5, cx - s * 0.22, cy + s * 0.42);
  ctx.quadraticCurveTo(cx - s * 0.62, cy - s * 0.1, cx, cy - s);
  ctx.fill();
  ctx.fillRect(cx - s * 0.62, cy + s * 0.34, s * 1.24, s * 0.24);
}

/** A 5-pointed star path about (cx, cy) with outer radius `r` (caller fills). */
function star5(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.42;
    const a = (i / 10) * TAU - Math.PI / 2;
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

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
      ctx.fillStyle = '#d4af37'; // fleur-de-lis
      fleurDeLis(ctx, cx, 0, 5.4);
      break;
    case 'native':
      ctx.fillStyle = 'rgba(60,38,16,0.75)';
      ctx.beginPath();
      ctx.moveTo(cx - 2.4, -5.5);
      ctx.lineTo(cx, -2);
      ctx.lineTo(cx + 2.4, -5.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 2.4, 5.5);
      ctx.lineTo(cx, 2);
      ctx.lineTo(cx + 2.4, 5.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f4f1e6';
      ctx.beginPath();
      ctx.arc(cx, 0, 1.9, 0, TAU);
      ctx.fill();
      break;
    case 'merchant':
      ctx.fillStyle = 'rgba(150,120,70,0.55)';
      ctx.fillRect(cx - 1.8, 2.5, 3.2, 4.5);
      ctx.fillRect(cx - 1.4, -7, 2.8, 3.2);
      break;
    case 'carthage':
      ctx.fillStyle = '#c9a227';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.4, 0, TAU);
      ctx.fill();
      break;
    case 'persia':
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, 0, 2.7, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#c9a227';
      ctx.beginPath();
      ctx.arc(cx, 0, 0.9, 0, TAU);
      ctx.fill();
      break;
    case 'arab':
      ctx.fillStyle = '#0f6f6a';
      ctx.beginPath();
      ctx.moveTo(cx, -3.2);
      ctx.lineTo(cx + 2.2, 0);
      ctx.lineTo(cx, 3.2);
      ctx.lineTo(cx - 2.2, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case 'china':
      ctx.fillStyle = '#c9403b';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(cx, 0, 1.0, 0, TAU);
      ctx.fill();
      break;
    case 'japan':
      ctx.fillStyle = '#b3261e';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.8, 0, TAU);
      ctx.fill();
      break;
    case 'maori':
      ctx.strokeStyle = '#b5352c';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(cx - 2.2, -1);
      ctx.lineTo(cx, 1);
      ctx.lineTo(cx + 2.2, -1);
      ctx.moveTo(cx - 2.2, 2.4);
      ctx.lineTo(cx, 4.4);
      ctx.lineTo(cx + 2.2, 2.4);
      ctx.stroke();
      break;
    case 'hawaii':
      ctx.fillStyle = '#2e5e8c';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(cx - 2.5, -0.6, 5, 1.2);
      break;
    case 'macedon':
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(cx, 0, 1.6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#e8b830';
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 2.2, Math.sin(a) * 2.2);
        ctx.lineTo(cx + Math.cos(a) * 3.4, Math.sin(a) * 3.4);
        ctx.stroke();
      }
      break;
    case 'rhodes':
      ctx.fillStyle = '#f4f1e6';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 1.7, Math.sin(a) * 1.7, 1.1, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#c94a6a';
      ctx.beginPath();
      ctx.arc(cx, 0, 1.0, 0, TAU);
      ctx.fill();
      break;
    case 'ptolemy':
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.2, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#f4f1e6';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(cx, 0, 3.0, 0, TAU);
      ctx.stroke();
      break;
    case 'maya':
      ctx.fillStyle = '#2e8a6a';
      ctx.fillRect(cx - 2.4, 1.6, 4.8, 1.4);
      ctx.fillRect(cx - 1.6, 0.2, 3.2, 1.4);
      ctx.fillRect(cx - 0.8, -1.2, 1.6, 1.4);
      ctx.fillStyle = '#b5352c';
      ctx.beginPath();
      ctx.arc(cx, -2.4, 1.0, 0, TAU);
      ctx.fill();
      break;
    case 'inca':
      ctx.fillStyle = '#c9403b';
      ctx.fillRect(cx - 2.2, -2.6, 4.4, 1.2);
      ctx.fillStyle = '#e8b830';
      ctx.fillRect(cx - 2.2, -1.4, 4.4, 1.2);
      ctx.fillStyle = '#3f7f4a';
      ctx.fillRect(cx - 2.2, -0.2, 4.4, 1.2);
      ctx.fillStyle = '#2e5e8c';
      ctx.fillRect(cx - 2.2, 1.0, 4.4, 1.2);
      break;
    case 'puna':
      ctx.strokeStyle = '#f4f1e6';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 2.4, -0.6);
      ctx.lineTo(cx, -2.4);
      ctx.lineTo(cx + 2.4, -0.6);
      ctx.moveTo(cx - 2.4, 2.2);
      ctx.lineTo(cx, 0.4);
      ctx.lineTo(cx + 2.4, 2.2);
      ctx.stroke();
      break;
    case 'ottoman':
      ctx.strokeStyle = '#b3261e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, 0, 2.2, Math.PI * 0.35, Math.PI * 1.65);
      ctx.stroke();
      ctx.fillStyle = '#b3261e';
      ctx.beginPath();
      ctx.arc(cx + 1.2, 0, 0.7, 0, TAU);
      ctx.fill();
      break;
    case 'venice':
      ctx.fillStyle = '#b3261e';
      ctx.beginPath();
      ctx.arc(cx, 0, 1.5, 0, TAU);
      ctx.fill();
      ctx.fillRect(cx - 3.0, -0.7, 1.8, 1.4);
      ctx.fillRect(cx + 1.2, -0.7, 1.8, 1.4);
      break;
    case 'korea':
      ctx.fillStyle = '#2e5e8c';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#c9403b';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.4, Math.PI, TAU);
      ctx.fill();
      break;
    case 'byzantium':
      ctx.fillStyle = '#e8b830';
      ctx.fillRect(cx - 0.7, -3.2, 1.4, 6.4);
      ctx.fillRect(cx - 2.2, -1.2, 4.4, 1.4);
      break;
    case 'egypt':
      ctx.fillStyle = '#274a7a';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(cx, 0, 1.0, 0, TAU);
      ctx.fill();
      break;
    case 'sherden':
      ctx.strokeStyle = '#2e2e34';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(cx - 1.1, 0, 1.9, Math.PI * 0.4, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 1.1, 0, 1.9, Math.PI * 1.4, Math.PI * 0.6);
      ctx.stroke();
      break;
    case 'chola':
      ctx.fillStyle = '#e8b830';
      ctx.fillRect(cx - 2.4, -2.6, 4.8, 5.2);
      ctx.fillStyle = '#2a1a10';
      ctx.fillRect(cx - 1.5, -2.6, 0.9, 5.2);
      ctx.fillRect(cx - 0.45, -2.6, 0.9, 5.2);
      ctx.fillRect(cx + 0.6, -2.6, 0.9, 5.2);
      break;
    case 'srivijaya':
      ctx.fillStyle = '#1f5a3a';
      ctx.beginPath();
      ctx.moveTo(cx, 2.6);
      ctx.lineTo(cx - 2.4, -1.6);
      ctx.lineTo(cx - 0.8, -1.6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, 2.6);
      ctx.lineTo(cx + 2.4, -1.6);
      ctx.lineTo(cx + 0.8, -1.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(cx - 0.7, -2.6, 1.4, 5.2);
      break;
    case 'daiviet':
      ctx.fillStyle = '#b3261e';
      star5(ctx, cx, 0, 2.6);
      ctx.fill();
      break;
    case 'aztec':
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.2, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#b3261e';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, 0, 2.2, 0, TAU);
      ctx.stroke();
      break;
    case 'usa':
      // a white star for the nascent navy
      ctx.fillStyle = '#f2f0e8';
      star5(ctx, cx, 0, 3.0);
      ctx.fill();
      break;
    case 'germany':
      // the Iron Cross, flared arms and all
      ctx.fillStyle = '#1c1c1c';
      ctx.beginPath();
      ctx.moveTo(cx - 1.2, -3.2);
      ctx.lineTo(cx + 1.2, -3.2);
      ctx.lineTo(cx + 1.0, -1.0);
      ctx.lineTo(cx + 3.2, -1.2);
      ctx.lineTo(cx + 3.2, 1.2);
      ctx.lineTo(cx + 1.0, 1.0);
      ctx.lineTo(cx + 1.2, 3.2);
      ctx.lineTo(cx - 1.2, 3.2);
      ctx.lineTo(cx - 1.0, 1.0);
      ctx.lineTo(cx - 3.2, 1.2);
      ctx.lineTo(cx - 3.2, -1.2);
      ctx.lineTo(cx - 1.0, -1.0);
      ctx.closePath();
      ctx.fill();
      break;
    case 'ijn':
      // the rising sun: disc and rays
      ctx.strokeStyle = '#c9403b';
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 2.6, Math.sin(a) * 2.6);
        ctx.lineTo(cx + Math.cos(a) * 4.4, Math.sin(a) * 4.4);
        ctx.stroke();
      }
      ctx.fillStyle = '#c9403b';
      ctx.beginPath();
      ctx.arc(cx, 0, 2.2, 0, TAU);
      ctx.fill();
      break;
    case 'iran':
      // the allah emblem simplified: a curl with a sword stroke
      ctx.strokeStyle = '#c9403b';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(cx - 2.2, -1.8);
      ctx.quadraticCurveTo(cx + 2.4, -3.2, cx + 1.8, 1.2);
      ctx.quadraticCurveTo(cx + 1.2, 3.4, cx - 0.6, 2.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3.0, -2.4);
      ctx.lineTo(cx + 1.6, 2.6);
      ctx.stroke();
      break;
    case 'tripoli':
      // crescent and star, the corsair mark
      ctx.fillStyle = '#f2f0e8';
      ctx.beginPath();
      ctx.arc(cx - 0.4, 0, 2.6, 0, TAU);
      ctx.arc(cx + 0.5, 0, 2.1, 0, TAU, true);
      ctx.fill();
      star5(ctx, cx + 2.6, 0, 1.5);
      ctx.fill();
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
      ctx.fillStyle = '#c8102e'; // castle badge
      ctx.fillRect(w * 0.36, h * 0.4, w * 0.1, h * 0.2);
      ctx.fillRect(w * 0.34, h * 0.36, w * 0.03, h * 0.08);
      ctx.fillRect(w * 0.45, h * 0.36, w * 0.03, h * 0.08);
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
      ctx.fillStyle = '#2c4a9a'; // tricolour: blue | white | red
      ctx.fillRect(0, 0, w / 3, h);
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(w / 3, 0, w / 3, h);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect((w * 2) / 3, 0, w / 3, h);
      ctx.fillStyle = '#d4af37'; // fleur-de-lis on the pale
      fleurDeLis(ctx, w * 0.5, h * 0.45, Math.min(w, h) * 0.26);
      break;
    }
    case 'native': {
      ctx.fillStyle = '#c98a3c';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#7a3f1e'; // chevrons
      for (let i = 0; i < 3; i++) {
        const yy = h * (0.2 + i * 0.26);
        ctx.beginPath();
        ctx.moveTo(w * 0.08, yy + h * 0.12);
        ctx.lineTo(w * 0.5, yy);
        ctx.lineTo(w * 0.92, yy + h * 0.12);
        ctx.lineTo(w * 0.92, yy + h * 0.2);
        ctx.lineTo(w * 0.5, yy + h * 0.08);
        ctx.lineTo(w * 0.08, yy + h * 0.2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#f4f1e6'; // sun disc
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.5, Math.min(w, h) * 0.16, 0, TAU);
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
    case 'carthage': {
      ctx.fillStyle = '#7a1f2b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(0, 0, w * 0.12, h);
      ctx.beginPath();
      ctx.arc(w * 0.56, h * 0.5, Math.min(w, h) * 0.28, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#7a1f2b';
      ctx.beginPath();
      ctx.arc(w * 0.56, h * 0.5, Math.min(w, h) * 0.12, 0, TAU);
      ctx.fill();
      break;
    }
    case 'persia': {
      ctx.fillStyle = '#1f3a5f';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(w * 0.14, h * 0.42, w * 0.72, h * 0.16);
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.26, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1f3a5f';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.11, 0, TAU);
      ctx.fill();
      break;
    }
    case 'arab': {
      ctx.fillStyle = '#0f6f6a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(0, h * 0.32, w, h * 0.36);
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(0, h * 0.38, w, h * 0.24);
      break;
    }
    case 'china': {
      ctx.fillStyle = '#e8b830';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c9403b';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.3, 0, TAU);
      ctx.fill();
      break;
    }
    case 'japan': {
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#b3261e';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.3, 0, TAU);
      ctx.fill();
      break;
    }
    case 'maori': {
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, w, h * 0.44);
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(0, h * 0.44, w, h * 0.12);
      ctx.fillStyle = '#b5352c';
      ctx.fillRect(0, h * 0.56, w, h * 0.44);
      break;
    }
    case 'hawaii': {
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c9403b';
      ctx.fillRect(0, 0, w, h * 0.2);
      ctx.fillRect(0, h * 0.4, w, h * 0.2);
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      ctx.fillStyle = '#1f3a5f';
      ctx.fillRect(0, 0, w * 0.42, h * 0.6);
      ctx.strokeStyle = '#f4f1e6';
      ctx.lineWidth = Math.max(0.5, h * 0.07);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.42, h * 0.6);
      ctx.moveTo(w * 0.42, 0);
      ctx.lineTo(0, h * 0.6);
      ctx.stroke();
      break;
    }
    case 'macedon': {
      ctx.fillStyle = '#1f3a7a';
      ctx.fillRect(0, 0, w, h);
      const mx = w * 0.5;
      const my = h * 0.5;
      const mr = Math.min(w, h) * 0.14;
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#e8b830';
      ctx.lineWidth = Math.max(0.5, h * 0.05);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(a) * mr * 1.5, my + Math.sin(a) * mr * 1.5);
        ctx.lineTo(mx + Math.cos(a) * mr * 2.9, my + Math.sin(a) * mr * 2.9);
        ctx.stroke();
      }
      break;
    }
    case 'rhodes': {
      ctx.fillStyle = '#4a6a9a';
      ctx.fillRect(0, 0, w, h);
      const rx = w * 0.5;
      const ry = h * 0.5;
      const rr = Math.min(w, h) * 0.26;
      ctx.fillStyle = '#f4f1e6';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.beginPath();
        ctx.arc(rx + Math.cos(a) * rr * 0.62, ry + Math.sin(a) * rr * 0.62, rr * 0.42, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#c94a6a';
      ctx.beginPath();
      ctx.arc(rx, ry, rr * 0.34, 0, TAU);
      ctx.fill();
      break;
    }
    case 'ptolemy': {
      ctx.fillStyle = '#3a1a5a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f4f1e6';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.21, 0, TAU);
      ctx.fill();
      break;
    }
    case 'maya': {
      ctx.fillStyle = '#2e8a6a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e8e0cc';
      ctx.fillRect(w * 0.14, h * 0.62, w * 0.72, h * 0.16);
      ctx.fillRect(w * 0.24, h * 0.46, w * 0.52, h * 0.16);
      ctx.fillRect(w * 0.34, h * 0.3, w * 0.32, h * 0.16);
      ctx.fillStyle = '#b5352c';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.2, Math.min(w, h) * 0.09, 0, TAU);
      ctx.fill();
      break;
    }
    case 'inca': {
      const cols = ['#c9403b', '#e67e22', '#e8b830', '#3f7f4a', '#2e5e8c'];
      for (let i = 0; i < cols.length; i++) {
        ctx.fillStyle = cols[i];
        ctx.fillRect(0, (h * i) / cols.length, w, h / cols.length + 0.5);
      }
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#7a2d5a';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.09, 0, TAU);
      ctx.fill();
      break;
    }
    case 'puna': {
      ctx.fillStyle = '#1f4a7a';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#f4f1e6';
      ctx.lineWidth = Math.max(0.5, h * 0.08);
      for (let i = 0; i < 2; i++) {
        const yy = h * (0.32 + i * 0.28);
        ctx.beginPath();
        ctx.moveTo(w * 0.1, yy);
        ctx.lineTo(w * 0.5, yy - h * 0.12);
        ctx.lineTo(w * 0.9, yy);
        ctx.stroke();
      }
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.78, Math.min(w, h) * 0.09, 0, TAU);
      ctx.fill();
      break;
    }
    case 'ottoman': {
      ctx.fillStyle = '#b3261e';
      ctx.fillRect(0, 0, w, h);
      const ox = w * 0.44;
      const oy = h * 0.5;
      const orr = Math.min(w, h) * 0.3;
      ctx.fillStyle = '#f4f1e6';
      ctx.beginPath();
      ctx.arc(ox, oy, orr, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#b3261e';
      ctx.beginPath();
      ctx.arc(ox + orr * 0.45, oy, orr * 0.82, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f4f1e6';
      star5(ctx, ox + orr * 1.05, oy, Math.min(w, h) * 0.11);
      ctx.fill();
      break;
    }
    case 'venice': {
      ctx.fillStyle = '#d4a72c';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#a02323';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.18, 0, TAU);
      ctx.fill();
      ctx.fillRect(w * 0.12, h * 0.42, w * 0.24, h * 0.16);
      ctx.fillRect(w * 0.64, h * 0.42, w * 0.24, h * 0.16);
      break;
    }
    case 'korea': {
      ctx.fillStyle = '#f4f1e6';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2e5e8c';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.26, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#c9403b';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.26, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      const bw = w * 0.07;
      const bh = h * 0.09;
      const bars: Array<[number, number]> = [
        [0.08, 0.12],
        [0.85, 0.12],
        [0.08, 0.79],
        [0.85, 0.79],
      ];
      for (const [bx, by] of bars) {
        for (let i = 0; i < 3; i++) ctx.fillRect(w * bx, h * by + i * bh * 1.4, bw, bh);
      }
      break;
    }
    case 'byzantium': {
      ctx.fillStyle = '#a52a2a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e8b830';
      ctx.fillRect(w * 0.44, h * 0.12, w * 0.12, h * 0.76);
      ctx.fillRect(w * 0.24, h * 0.32, w * 0.52, h * 0.14);
      break;
    }
    case 'egypt': {
      ctx.fillStyle = '#e8c14a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f4f1e6';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#274a7a';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.22, 0, TAU);
      ctx.fill();
      break;
    }
    case 'sherden': {
      ctx.fillStyle = '#2e2e34';
      ctx.fillRect(0, 0, w, h);
      const sr = Math.min(w, h) * 0.26;
      for (const sxx of [w * 0.32, w * 0.68]) {
        ctx.fillStyle = '#f4f1e6';
        ctx.beginPath();
        ctx.arc(sxx, h * 0.5, sr, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#2e2e34';
        ctx.beginPath();
        ctx.arc(sxx + (sxx < w * 0.5 ? sr * 0.5 : -sr * 0.5), h * 0.5, sr * 0.85, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#c9403b';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.08, 0, TAU);
      ctx.fill();
      break;
    }
    case 'chola': {
      ctx.fillStyle = '#e8b830';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2a1a10';
      for (let i = 0; i < 3; i++) ctx.fillRect(w * (0.2 + i * 0.22), 0, w * 0.11, h);
      break;
    }
    case 'srivijaya': {
      ctx.fillStyle = '#1f5a3a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f4f1e6';
      const lx = w * 0.5;
      const ly = h * 0.72;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + i * w * 0.09 - w * 0.045, h * 0.24);
        ctx.lineTo(lx + i * w * 0.09 + w * 0.045, h * 0.24);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(lx, ly - h * 0.06, Math.min(w, h) * 0.09, 0, TAU);
      ctx.fill();
      break;
    }
    case 'daiviet': {
      ctx.fillStyle = '#7a1a1a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e8b830';
      star5(ctx, w * 0.5, h * 0.5, Math.min(w, h) * 0.3);
      ctx.fill();
      break;
    }
    case 'aztec': {
      ctx.fillStyle = '#1f8a8a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e8b830';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.28, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#b3261e';
      ctx.lineWidth = Math.max(0.5, h * 0.07);
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.28, 0, TAU);
      ctx.stroke();
      break;
    }
    case 'usa': {
      // the Stars and Stripes of the early republic: stripes and a canton of
      // white stars on blue
      const stripes = 13;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 ? '#f2f0e8' : '#b3261e';
        ctx.fillRect(0, (h * i) / stripes, w, h / stripes + 0.5);
      }
      ctx.fillStyle = '#2a3a6b';
      ctx.fillRect(0, 0, w * 0.42, h * 0.54);
      ctx.fillStyle = '#f2f0e8';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          const dx = w * 0.07 + c * w * 0.095 + (r % 2) * w * 0.045;
          const dy = h * 0.11 + r * h * 0.16;
          ctx.beginPath();
          ctx.arc(dx, dy, Math.max(0.8, h * 0.045), 0, TAU);
          ctx.fill();
        }
      }
      break;
    }
    case 'germany': {
      // the Kaiser's colours: black over white over red
      const third = h / 3;
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, 0, w, third + 0.5);
      ctx.fillStyle = '#f2f0e8';
      ctx.fillRect(0, third, w, third + 0.5);
      ctx.fillStyle = '#b3261e';
      ctx.fillRect(0, third * 2, w, third + 0.5);
      break;
    }
    case 'ijn': {
      // the rising sun: a red disc with rays on white
      ctx.fillStyle = '#f2f0e8';
      ctx.fillRect(0, 0, w, h);
      {
        const cx = w * 0.5;
        const cy = h * 0.5;
        const r = Math.min(w, h) * 0.24;
        ctx.strokeStyle = '#c9403b';
        ctx.lineWidth = Math.max(0.6, h * 0.055);
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * TAU;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * 1.15);
          ctx.lineTo(cx + Math.cos(a) * Math.min(w, h) * 0.52, cy + Math.sin(a) * Math.min(w, h) * 0.52);
          ctx.stroke();
        }
        ctx.fillStyle = '#c9403b';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'iran': {
      // the tricolor: green over white over red, with the mark of 1980
      const third2 = h / 3;
      ctx.fillStyle = '#239f6b';
      ctx.fillRect(0, 0, w, third2 + 0.5);
      ctx.fillStyle = '#f2f0e8';
      ctx.fillRect(0, third2, w, third2 + 0.5);
      ctx.fillStyle = '#c9403b';
      ctx.fillRect(0, third2 * 2, w, third2 + 0.5);
      ctx.strokeStyle = '#c9403b';
      ctx.lineWidth = Math.max(0.7, h * 0.07);
      ctx.beginPath();
      ctx.moveTo(w * 0.47, h * 0.32);
      ctx.quadraticCurveTo(w * 0.56, h * 0.5, w * 0.5, h * 0.68);
      ctx.quadraticCurveTo(w * 0.44, h * 0.52, w * 0.5, h * 0.34);
      ctx.stroke();
      break;
    }
    case 'tripoli': {
      // the corsair green: a white crescent and star on green
      ctx.fillStyle = '#1f6b3a';
      ctx.fillRect(0, 0, w, h);
      const ox = w * 0.42;
      const oy = h * 0.5;
      const orr = Math.min(w, h) * 0.3;
      ctx.fillStyle = '#f2f0e8';
      ctx.beginPath();
      ctx.arc(ox, oy, orr, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1f6b3a';
      ctx.beginPath();
      ctx.arc(ox + orr * 0.45, oy, orr * 0.82, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f2f0e8';
      star5(ctx, ox + orr * 1.05, oy, Math.min(w, h) * 0.11);
      ctx.fill();
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
  ctx.strokeStyle = 'rgba(30,20,10,0.7)'; // halyard
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -H * 0.5);
  ctx.lineTo(0, H * 0.5);
  ctx.stroke();
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
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 0.4;
  ctx.strokeRect(0, -H / 2, L, H);
  ctx.restore();
}

let whiteTile: HTMLCanvasElement | null = null;

function surrenderTile(): HTMLCanvasElement {
  if (!whiteTile) {
    const [cv, cx] = makeCanvas(48, 24);
    cx.fillStyle = '#f2f0e8';
    cx.fillRect(0, 0, 48, 24);
    // soft folds so the white reads as cloth, not a hole in the world
    const g = cx.createLinearGradient(0, 0, 0, 24);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(120,120,120,0.35)');
    cx.fillStyle = g;
    cx.fillRect(0, 0, 48, 24);
    cx.strokeStyle = 'rgba(90,90,90,0.6)';
    cx.lineWidth = 1;
    cx.strokeRect(0.5, 0.5, 47, 23);
    whiteTile = cv;
  }
  return whiteTile;
}

/**
 * The white flag: flown at the masthead instead of the ensign once a ship
 * strikes her colours. Same ripple as the ensigns, so it reads instantly.
 */
export function drawSurrenderFlag(
  ctx: CanvasRenderingContext2D,
  mx: number,
  rel: number,
  t: number,
  scale = 1,
) {
  const L = 15 * scale;
  const H = 8 * scale;
  ctx.save();
  ctx.translate(mx, 0);
  ctx.rotate(rel);
  ctx.strokeStyle = 'rgba(30,20,10,0.7)'; // halyard
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -H * 0.5);
  ctx.lineTo(0, H * 0.5);
  ctx.stroke();
  const tile = surrenderTile();
  const STRIPS = 8;
  const sw = tile.width / STRIPS;
  for (let i = 0; i < STRIPS; i++) {
    const t0 = i / STRIPS;
    const t1 = (i + 1) / STRIPS;
    const off = Math.sin(t * 9 - t0 * 3.4) * 1.5 * scale * (0.25 + t0);
    const h0 = H * (1 - t0 * 0.12);
    ctx.drawImage(tile, i * sw, 0, sw + 0.6, tile.height, L * t0, -h0 / 2 + off, L * (t1 - t0) + 0.4, h0);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 0.4;
  ctx.strokeRect(0, -H / 2, L, H);
  ctx.restore();
}

/**
 * Lateen sail for the dhow: a great triangular sheet slung fore-and-aft.
 * Seen top-down it reads as a long curved triangle off the mast.
 */
export function drawLateenSail(
  ctx: CanvasRenderingContext2D,
  mx: number,
  hl: number,
  hw: number,
  bulge: number,
  col: string,
  shade: string,
  rel: number,
) {
  const side = Math.sin(rel) >= 0 ? 1 : -1;
  ctx.save();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(mx - hl * 0.62, 0);
  ctx.quadraticCurveTo(mx + hl * 0.1, side * (hw * 0.9 + bulge * 0.5), mx + hl * 0.68, side * hw * 0.18);
  ctx.lineTo(mx - hl * 0.62, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = shade;
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // the long sloping yard
  ctx.strokeStyle = '#3b2412';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(mx - hl * 0.66, 0);
  ctx.lineTo(mx + hl * 0.72, side * hw * 0.2);
  ctx.stroke();
  ctx.restore();
}

/** Bamboo battens across a junk's lug sail — drawn right after `drawSail`. */
export function drawJunkBattens(
  ctx: CanvasRenderingContext2D,
  mx: number,
  w: number,
  bulge: number,
  yard: number,
) {
  ctx.save();
  ctx.translate(mx, 0);
  ctx.rotate(yard);
  const h = w / 2;
  ctx.strokeStyle = 'rgba(74,48,24,0.85)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = -2; k <= 2; k++) {
    const yy = (k * h) / 2.4;
    ctx.moveTo(-4.5, yy);
    ctx.quadraticCurveTo(bulge * 1.4 - 3, yy, bulge * 2.2 - 2, yy * 0.94);
  }
  ctx.stroke();
  ctx.restore();
}

/** Ratlines rigged between the masts and the rails, plus the forestay. */
export function drawRigging(ctx: CanvasRenderingContext2D, masts: number[], hw: number, hl: number) {
  if (!masts.length) return;
  ctx.strokeStyle = 'rgba(40,28,14,0.45)';
  ctx.lineWidth = 0.35;
  ctx.beginPath();
  for (const mx of masts) {
    for (const sgn of [-1, 1]) {
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx - hw * 0.5, sgn * hw * 0.78);
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx + hw * 0.5, sgn * hw * 0.78);
    }
  }
  for (let i = 0; i < masts.length - 1; i++) {
    ctx.moveTo(masts[i], 0);
    ctx.lineTo(masts[i + 1], 0);
  }
  ctx.moveTo(masts[0], 0);
  ctx.lineTo(hl + 12, 0);
  ctx.stroke();
}

/** Oars/paddles along both sides, stroking in time. `drive` 0..1 = effort. */
export function drawOars(
  ctx: CanvasRenderingContext2D,
  hl: number,
  hw: number,
  t: number,
  bob: number,
  drive: number,
) {
  const rows = hl > 16 ? 4 : 3;
  const rate = 5.5 + drive * 3.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < rows; i++) {
    const px = -hl * 0.7 + (i / (rows - 1)) * hl * 1.35;
    // alternating banks, so the stroke looks sculled rather than synchronised
    const phase = t * rate + bob + (i % 2) * 0.5;
    const swing = Math.sin(phase) * (0.28 + drive * 0.22);
    for (const sgn of [-1, 1]) {
      const baseY = sgn * hw * 0.85;
      const ang = -0.55 + swing;
      const len = hl * 0.62;
      const ex = px + Math.cos(ang) * len * 0.55;
      const ey = baseY + Math.sin(ang) * len * 0.55 * sgn;
      ctx.strokeStyle = '#4a3018';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, baseY * 0.6);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      // blade
      ctx.fillStyle = '#5c3d1e';
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang + (sgn > 0 ? 0.5 : -0.5));
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.1, 1.3, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
}
