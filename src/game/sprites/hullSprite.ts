// Baked hull sprites.
//
// Planking, gun ports, stern castles, the mortar pit and the style extras
// (longship prow/shields, ironclad casemate, caravel castle) never change for a
// given hull, so each is painted once into an offscreen canvas and blitted every
// frame. Bake lazily: a hull style that never spawns is never built.

import { makeCanvas } from '../canvas';
import { mulberry32, shade } from '../math';
import type { ShipDef } from '../types';
import { shipPaths, styleId } from './hull';

interface HullSprite {
  canvas: HTMLCanvasElement;
  /** offset from sprite top-left to hull centre, in CSS px */
  ox: number;
  oy: number;
  w: number;
  h: number;
}

const hullSprites = new Map<string, HullSprite>();

/** Supersample factor for the baked sprites (crisp edges on rotated blits). */
const SPRITE_SS = 3;

export function buildHullSprite(def: ShipDef): HullSprite {
  const hl = def.length / 2;
  const hw = def.width / 2;
  const padF = 16; // room for the bowsprit
  const padS = 7;
  const w = def.length + padF + padS;
  const h = def.width + padS * 2;
  const ox = hl + padF;
  const oy = h / 2;
  const [cv, ctx] = makeCanvas(w * SPRITE_SS, h * SPRITE_SS);
  ctx.scale(SPRITE_SS, SPRITE_SS);
  ctx.translate(ox, oy);
  ctx.lineJoin = 'round';
  const paths = shipPaths(def);
  const rnd = mulberry32(def.length * 7919 + def.width * 131 + def.masts);

  // bowsprit
  ctx.strokeStyle = '#33200f';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hl - 4, 0);
  ctx.lineTo(hl + 13, 0);
  ctx.stroke();

  // hull with a top-down light gradient
  const g = ctx.createLinearGradient(0, -hw, 0, hw);
  g.addColorStop(0, shade(def.hull, 1.35));
  g.addColorStop(0.45, def.hull);
  g.addColorStop(1, shade(def.hull, 0.62));
  ctx.fillStyle = g;
  ctx.fill(paths.hull);

  // gun ports, clipped to the hull
  ctx.save();
  ctx.clip(paths.hull);
  ctx.strokeStyle = shade(def.hull, 0.5);
  ctx.lineWidth = 2.2;
  ctx.stroke(paths.hull);
  const decks = def.decks ?? 1;
  const ports = Math.max(2, Math.round(def.length / 13));
  for (let d = 0; d < decks; d++) {
    const yOff = hw * (d === 0 ? 0.97 : 0.62);
    for (let i = 0; i < ports; i++) {
      const px = -hl * 0.66 + (i / (ports - 1)) * hl * 1.24;
      if (px > hl * 0.72) continue;
      for (const sgn of [-1, 1]) {
        const py = sgn * yOff;
        ctx.fillStyle = shade(def.trim, 0.85);
        ctx.fillRect(px - 1.75, py - 1.55, 3.5, 3.1);
        ctx.fillStyle = '#100a05';
        ctx.fillRect(px - 1.35, py - 1.15, 2.7, 2.3);
      }
    }
  }
  ctx.restore();

  // deck + planking
  ctx.fillStyle = def.deck;
  ctx.fill(paths.deck);
  ctx.save();
  ctx.clip(paths.deck);
  ctx.strokeStyle = 'rgba(70,42,16,0.38)';
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  for (let k = -5; k <= 5; k++) {
    const yy = k * hw * 0.13;
    ctx.moveTo(-hl, yy);
    ctx.lineTo(hl, yy);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,36,12,0.3)';
  for (let i = 0; i < 14; i++) {
    const px = -hl * 0.8 + rnd() * hl * 1.6;
    const py = (rnd() - 0.5) * hw * 1.3;
    ctx.beginPath();
    ctx.moveTo(px, py - hw * 0.06);
    ctx.lineTo(px, py + hw * 0.06);
    ctx.stroke();
  }
  ctx.restore();

  // forecastle
  ctx.fillStyle = shade(def.deck, 1.12);
  ctx.beginPath();
  ctx.moveTo(hl * 0.42, -hw * 0.62);
  ctx.lineTo(hl * 0.78, -hw * 0.34);
  ctx.lineTo(hl * 0.78, hw * 0.34);
  ctx.lineTo(hl * 0.42, hw * 0.62);
  ctx.closePath();
  ctx.fill();

  // stern castle tiers
  const tiers = def.length > 80 ? 2 : 1;
  for (let c = 0; c < tiers; c++) {
    const x0 = -hl * (0.92 - c * 0.1);
    const x1 = -hl * (0.5 - c * 0.14);
    const yw = hw * (0.78 - c * 0.16);
    ctx.fillStyle = shade(def.deck, 1.18 + c * 0.12);
    ctx.beginPath();
    ctx.moveTo(x0, -yw * 0.82);
    ctx.lineTo(x1, -yw);
    ctx.lineTo(x1, yw);
    ctx.lineTo(x0, yw * 0.82);
    ctx.closePath();
    ctx.fill();
  }

  // stern lanterns
  ctx.fillStyle = '#ffdc8a';
  const winN = def.length > 80 ? 4 : 3;
  for (let i = 0; i < winN; i++) {
    const yy = -hw * 0.36 + (i / (winN - 1)) * hw * 0.72;
    ctx.fillRect(-hl * 0.99, yy - 0.7, 1.9, 1.5);
  }

  // mortar pit (Bomb Ketch)
  if (def.mortar) {
    ctx.fillStyle = '#20201c';
    ctx.beginPath();
    ctx.arc(hl * 0.3, 0, hw * 0.33, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6a6a5c';
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  // hull style extras
  if (def.hullStyle === 'longship') {
    // dragon prow + curled tail
    ctx.strokeStyle = '#c8a44e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hl * 0.98, 0);
    ctx.quadraticCurveTo(hl * 1.22, -hw * 0.9, hl * 1.05, -hw * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#caa64f';
    ctx.beginPath();
    ctx.moveTo(hl * 1.05, -hw * 1.5);
    ctx.lineTo(hl * 1.2, -hw * 1.3);
    ctx.lineTo(hl * 1.14, -hw * 1.05);
    ctx.closePath();
    ctx.fill();
    // shield rail
    const cols = ['#b5352c', '#d8b04a', '#2f5e8c', '#e6ddc4'];
    for (let i = 0; i < 7; i++) {
      const sx = -hl * 0.6 + (i / 6) * hl * 1.25;
      for (const sgn of [-1, 1]) {
        ctx.fillStyle = cols[(i + (sgn > 0 ? 0 : 2)) % cols.length];
        ctx.beginPath();
        ctx.arc(sx, sgn * hw * 0.9, hw * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (def.hullStyle === 'ironclad') {
    // casemate box, gun turret, smokestack
    ctx.fillStyle = '#4b5157';
    ctx.beginPath();
    ctx.moveTo(hl * 0.45, -hw * 0.6);
    ctx.lineTo(hl * 0.55, -hw * 0.42);
    ctx.lineTo(hl * 0.55, hw * 0.42);
    ctx.lineTo(hl * 0.45, hw * 0.6);
    ctx.lineTo(-hl * 0.62, hw * 0.6);
    ctx.lineTo(-hl * 0.7, hw * 0.42);
    ctx.lineTo(-hl * 0.7, -hw * 0.42);
    ctx.lineTo(-hl * 0.62, -hw * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#33383c';
    ctx.beginPath();
    ctx.arc(hl * 0.02, 0, hw * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#17181a';
    ctx.fillRect(hl * 0.02, -1.1, hw * 0.7, 2.2);
    ctx.fillStyle = '#23262a';
    ctx.beginPath();
    ctx.arc(-hl * 0.28, 0, hw * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (def.hullStyle === 'caravel') {
    // tall stern castle
    ctx.fillStyle = shade(def.deck, 1.24);
    ctx.beginPath();
    ctx.moveTo(-hl * 0.62, -hw * 0.6);
    ctx.lineTo(-hl * 0.42, -hw * 0.72);
    ctx.lineTo(-hl * 0.42, hw * 0.72);
    ctx.lineTo(-hl * 0.62, hw * 0.6);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = '#140a04';
  ctx.lineWidth = 1.5;
  ctx.stroke(paths.hull);

  const sprite: HullSprite = { canvas: cv, ox, oy, w, h };
  hullSprites.set(styleId(def), sprite);
  return sprite;
}

export function getHullSprite(def: ShipDef): HullSprite {
  return hullSprites.get(styleId(def)) ?? buildHullSprite(def);
}
