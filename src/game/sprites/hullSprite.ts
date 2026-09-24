// Baked hull sprites.
//
// Planking, gun ports, castles, deck furniture, the mortar pit and the style
// extras (longship prow/shields, ironclad casemate, caravel castle, canoe
// dugout) never change for a given hull, so each is painted once into an
// offscreen canvas and blitted every frame. Bake lazily: a hull style that never
// spawns is never built.

import { makeCanvas } from '../canvas';
import { mulberry32, shade, TAU } from '../math';
import type { ShipDef } from '../types';
import { clearPathCache, shipPaths, styleId } from './hull';

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
  const oared = !!def.oared;

  // ---- bowsprit (drawn under the hull) + its stays
  if (!oared) {
    ctx.strokeStyle = '#33200f';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hl - 4, 0);
    ctx.lineTo(hl + 13, 0);
    ctx.stroke();
    ctx.strokeStyle = '#5b3a1e';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(40,28,14,0.55)';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(hl + 12, 0);
    ctx.lineTo(hl * 0.2, -hw * 0.5);
    ctx.moveTo(hl + 12, 0);
    ctx.lineTo(hl * 0.2, hw * 0.5);
    ctx.stroke();
  }

  // ---- hull body, lit from the port side
  const g = ctx.createLinearGradient(0, -hw, 0, hw);
  g.addColorStop(0, shade(def.hull, 1.35));
  g.addColorStop(0.45, def.hull);
  g.addColorStop(1, shade(def.hull, 0.62));
  ctx.fillStyle = g;
  ctx.fill(paths.hull);

  ctx.save();
  ctx.clip(paths.hull);
  // wale / rubbing strake following the sheer
  ctx.strokeStyle = shade(def.hull, 0.5);
  ctx.lineWidth = 2.2;
  ctx.stroke(paths.hull);
  ctx.strokeStyle = def.trim;
  ctx.lineWidth = 1.1;
  ctx.save();
  ctx.scale(0.985, 0.8);
  ctx.stroke(paths.hull);
  ctx.restore();

  // ---- gun ports (def.decks rows per side) — not on paddled craft
  if (!oared) {
    const decks = def.decks ?? 1;
    const ports = Math.max(2, Math.round(def.length / 13));
    for (let d = 0; d < decks; d++) {
      const yOff = hw * (d === 0 ? 0.97 : 0.62);
      for (let i = 0; i < ports; i++) {
        const px = -hl * 0.66 + (i / (ports - 1)) * hl * 1.24;
        if (px > hl * 0.72) continue;
        for (const sgn of [-1, 1]) {
          const py = sgn * yOff;
          ctx.fillStyle = shade(def.trim, 0.85); // lid
          ctx.fillRect(px - 1.75, py - 1.55, 3.5, 3.1);
          ctx.fillStyle = '#100a05'; // opening
          ctx.fillRect(px - 1.35, py - 1.15, 2.7, 2.3);
          if (d === 0 && i % 2 === 0) {
            ctx.fillStyle = '#2e2e2e'; // muzzle glint
            ctx.fillRect(px - 0.7, py - 0.6, 1.4, 1.2);
          }
        }
      }
    }
  }
  ctx.restore();

  // ---- open deck + planking + caulking butts
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
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = shade(def.trim, 1.1);
  ctx.stroke(paths.deck);

  if (oared) {
    // ---- paddled craft: thwarts and a couple of racked paddles, no furniture
    ctx.strokeStyle = 'rgba(45,28,12,0.55)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    const seats = def.length > 30 ? 4 : 3;
    for (let i = 1; i <= seats; i++) {
      const tx = -hl * 0.8 + (i / (seats + 1)) * hl * 1.6;
      ctx.moveTo(tx, -hw * 0.72);
      ctx.lineTo(tx, hw * 0.72);
    }
    ctx.stroke();
    ctx.strokeStyle = '#4a3018';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const sgn of [-1, 1]) {
      ctx.moveTo(-hl * 0.1, sgn * hw * 0.5);
      ctx.lineTo(hl * 0.45, sgn * hw * 0.34);
    }
    ctx.stroke();
  } else {
    // ---- forecastle (raised bow deck)
    ctx.fillStyle = shade(def.deck, 1.12);
    ctx.beginPath();
    ctx.moveTo(hl * 0.42, -hw * 0.62);
    ctx.lineTo(hl * 0.78, -hw * 0.34);
    ctx.lineTo(hl * 0.78, hw * 0.34);
    ctx.lineTo(hl * 0.42, hw * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,22,6,0.5)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // ---- quarterdeck / stern castle (2 tiers on hulls longer than 80)
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
      ctx.strokeStyle = 'rgba(40,22,6,0.55)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // lit stern gallery windows
    ctx.fillStyle = '#ffdc8a';
    const winN = def.length > 80 ? 4 : 3;
    for (let i = 0; i < winN; i++) {
      const yy = -hw * 0.36 + (i / (winN - 1)) * hw * 0.72;
      ctx.fillRect(-hl * 0.99, yy - 0.7, 1.9, 1.5);
    }
    ctx.strokeStyle = def.trim;
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-hl * 1.0, -hw * 0.46, 2.4, hw * 0.92);

    // ---- deck furniture: hatch grating
    ctx.fillStyle = 'rgba(30,18,6,0.65)';
    ctx.fillRect(-hl * 0.1, -hw * 0.26, hl * 0.22, hw * 0.52);
    ctx.strokeStyle = 'rgba(200,170,120,0.35)';
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      const gx = -hl * 0.1 + (i / 4) * hl * 0.22;
      ctx.moveTo(gx, -hw * 0.26);
      ctx.lineTo(gx, hw * 0.26);
    }
    for (let i = 1; i < 3; i++) {
      const gy = -hw * 0.26 + (i / 3) * hw * 0.52;
      ctx.moveTo(-hl * 0.1, gy);
      ctx.lineTo(hl * 0.12, gy);
    }
    ctx.stroke();

    // capstan
    ctx.fillStyle = '#6b4423';
    ctx.beginPath();
    ctx.arc(-hl * 0.3, 0, hw * 0.13, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // stowed ship's boat (bigger hulls only)
    if (def.length > 64) {
      ctx.fillStyle = shade(def.deck, 0.7);
      ctx.beginPath();
      ctx.ellipse(hl * 0.16, 0, hl * 0.1, hw * 0.2, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#3a2412';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hl * 0.07, 0);
      ctx.lineTo(hl * 0.25, 0);
      ctx.stroke();
    }

    // water casks
    ctx.fillStyle = '#7a5530';
    for (let i = 0; i < 3; i++) {
      const bx = -hl * 0.44 - i * hw * 0.24;
      const by = (i % 2 ? 1 : -1) * hw * 0.3;
      ctx.beginPath();
      ctx.arc(bx, by, hw * 0.1, 0, TAU);
      ctx.fill();
    }

    // bow anchor
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(hl * 0.62, -hw * 0.72);
    ctx.lineTo(hl * 0.72, -hw * 0.5);
    ctx.moveTo(hl * 0.6, -hw * 0.58);
    ctx.lineTo(hl * 0.74, -hw * 0.64);
    ctx.stroke();

    // ---- rails with stanchions
    ctx.strokeStyle = shade(def.trim, 0.9);
    ctx.lineWidth = 0.9;
    ctx.stroke(paths.deck);
    ctx.fillStyle = shade(def.hull, 0.8);
    for (let i = 0; i < 9; i++) {
      const px = -hl * 0.8 + (i / 8) * hl * 1.5;
      const k = 1 - (px / hl) * (px / hl) * 0.7;
      for (const sgn of [-1, 1]) {
        ctx.fillRect(px - 0.35, sgn * hw * 0.72 * k - 0.35, 0.7, 0.7);
      }
    }

    // ---- figurehead
    ctx.fillStyle = def.faction === 'pirate' ? '#d8cdb4' : shade(def.trim, 1.15);
    ctx.beginPath();
    ctx.ellipse(hl * 0.94, 0, 2.1, 1.5, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,18,6,0.6)';
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // ---- stern lantern + glow
    ctx.fillStyle = '#ffd36b';
    ctx.beginPath();
    ctx.arc(-hl * 1.0, 0, 1.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,211,107,0.3)';
    ctx.beginPath();
    ctx.arc(-hl * 1.0, 0, 3.2, 0, TAU);
    ctx.fill();
  }

  // ---- outline last so everything sits inside it
  ctx.strokeStyle = '#140a04';
  ctx.lineWidth = 1.5;
  ctx.stroke(paths.hull);

  /* ---- PER-SHIP EXTRA: BOMB KETCH mortar pit --------------------------- */
  if (def.mortar) {
    ctx.fillStyle = '#20201c';
    ctx.beginPath();
    ctx.arc(hl * 0.3, 0, hw * 0.33, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#6a6a5c';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.fillStyle = '#45453c';
    ctx.beginPath();
    ctx.arc(hl * 0.3, 0, hw * 0.19, 0, TAU);
    ctx.fill();
  }
  /* ---- PER-SHIP EXTRA: LONGSHIP dragon prow + shield rail -------------- */
  if (def.hullStyle === 'longship') {
    ctx.strokeStyle = '#c8a44e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hl * 0.98, 0);
    ctx.quadraticCurveTo(hl * 1.22, -hw * 0.9, hl * 1.05, -hw * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#caa64f'; // dragon head
    ctx.beginPath();
    ctx.moveTo(hl * 1.05, -hw * 1.5);
    ctx.lineTo(hl * 1.2, -hw * 1.3);
    ctx.lineTo(hl * 1.14, -hw * 1.05);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c8a44e'; // stern curl
    ctx.beginPath();
    ctx.arc(-hl * 0.95, -hw * 0.6, hw * 0.5, Math.PI * 0.2, Math.PI * 1.4);
    ctx.stroke();
    // round shields along the gunwale
    const cols = ['#b5352c', '#d8b04a', '#2f5e8c', '#e6ddc4'];
    for (let i = 0; i < 7; i++) {
      const sx = -hl * 0.6 + (i / 6) * hl * 1.25;
      for (const sgn of [-1, 1]) {
        ctx.fillStyle = cols[(i + (sgn > 0 ? 0 : 2)) % cols.length];
        ctx.beginPath();
        ctx.arc(sx, sgn * hw * 0.9, hw * 0.28, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#3a2412';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx, sgn * hw * 0.9, hw * 0.09, 0, TAU);
        ctx.fillStyle = '#2a1a0c';
        ctx.fill();
      }
    }
  } else if (def.hullStyle === 'ironclad') {
    /* ---- PER-SHIP EXTRA: IRONCLAD casemate, turret, stack -------------- */
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
    ctx.strokeStyle = '#2b2f33';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#6b7176'; // rivets
    for (let i = 0; i < 8; i++) {
      const rx = -hl * 0.6 + (i / 7) * hl * 1.1;
      ctx.fillRect(rx, -hw * 0.55, 0.7, 0.7);
      ctx.fillRect(rx, hw * 0.5, 0.7, 0.7);
    }
    ctx.fillStyle = '#33383c'; // gun turret
    ctx.beginPath();
    ctx.arc(hl * 0.02, 0, hw * 0.34, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#1f2225';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#17181a'; // barrel
    ctx.fillRect(hl * 0.02, -1.1, hw * 0.7, 2.2);
    ctx.fillStyle = '#23262a'; // smokestack
    ctx.beginPath();
    ctx.arc(-hl * 0.28, 0, hw * 0.16, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#3a3f44';
    ctx.beginPath();
    ctx.arc(-hl * 0.28, 0, hw * 0.1, 0, TAU);
    ctx.fill();
  } else if (def.hullStyle === 'caravel') {
    /* ---- PER-SHIP EXTRA: CARAVEL tall stern castle --------------------- */
    ctx.fillStyle = shade(def.deck, 1.24);
    ctx.beginPath();
    ctx.moveTo(-hl * 0.62, -hw * 0.6);
    ctx.lineTo(-hl * 0.42, -hw * 0.72);
    ctx.lineTo(-hl * 0.42, hw * 0.72);
    ctx.lineTo(-hl * 0.62, hw * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,22,6,0.55)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  } else if (def.hullStyle === 'canoe') {
    /* ---- PER-SHIP EXTRA: CANOE painted bands + prow eye ---------------- */
    ctx.strokeStyle = def.trim;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const sgn of [-1, 1]) {
      ctx.moveTo(hl * 0.75, sgn * hw * 0.55);
      ctx.lineTo(-hl * 0.7, sgn * hw * 0.62);
    }
    ctx.stroke();
    ctx.fillStyle = '#f4f1e6';
    ctx.beginPath();
    ctx.arc(hl * 0.82, -hw * 0.45, 0.9, 0, TAU);
    ctx.arc(hl * 0.82, hw * 0.45, 0.9, 0, TAU);
    ctx.fill();
  }

  const sprite: HullSprite = { canvas: cv, ox, oy, w, h };
  hullSprites.set(styleId(def), sprite);
  return sprite;
}

export function getHullSprite(def: ShipDef): HullSprite {
  return hullSprites.get(styleId(def)) ?? buildHullSprite(def);
}

/** Drop both caches — needed if palettes are hot-swapped at runtime. */
export function clearShipCaches() {
  for (const s of hullSprites.values()) {
    s.canvas.width = 0;
    s.canvas.height = 0;
  }
  hullSprites.clear();
  clearPathCache();
}
