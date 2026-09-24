// The ship sprite itself: hull, deck detail, cannons and rigging assembled
// into the two entry points the engine calls each frame.

import { angDiff, TAU } from '../math';
import type { Ship } from '../types';
import { cannonLocalX, shipPaths } from './hull';
import { drawEmblem, drawFlag, drawSail } from './rigging';

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
