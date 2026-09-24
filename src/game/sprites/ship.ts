// The ship sprite itself: baked hull, deck detail, cannons and rigging assembled
// into the two entry points the engine calls each frame.

import { angDiff, TAU } from '../math';
import type { Ship } from '../types';
import { cannonLocalX, shipPaths } from './hull';
import { getHullSprite } from './hullSprite';
import { drawEmblem, drawEnsign, drawSail } from './rigging';

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

  // hull (baked once per style: planking, gun ports, castles, style extras)
  const sp = getHullSprite(def);
  ctx.drawImage(sp.canvas, -sp.ox, -sp.oy, sp.w, sp.h);

  // cannons (recoil animated); mortar ships mount a mortar instead of guns
  if (!flash && s.cannons > 0 && !def.mortar) {
    ctx.fillStyle = '#17170f';
    for (let i = 0; i < s.cannons; i++) {
      const cx = cannonLocalX(def, s.cannons, i);
      ctx.fillRect(cx - 1.05, -hw - 3.1 + s.recoilL * 3, 2.1, 4.6);
      ctx.fillRect(cx - 1.05, hw - 1.5 - s.recoilR * 3, 2.1, 4.6);
    }
  }

  const rel = angDiff(s.angle, windAngle);
  const push = Math.cos(rel);
  const flutter = push < 0.1 ? Math.sin(t * 24 + s.bob) * 1.3 : 0;
  const bulge = Math.max(1.4, (2 + Math.max(0, push) * 7.5) * (0.4 + 0.6 * s.sail)) + flutter;
  const yard = Math.max(-0.45, Math.min(0.45, Math.sin(rel) * 0.45));
  const sw = def.width * 1.55 * (0.6 + 0.4 * s.sail);
  const sailCol = flash ? '#ffffff' : def.sail;
  const nm = paths.masts.length;
  const style = def.hullStyle ?? 'default';

  if (style === 'ironclad') {
    // no canvas at all — just the smoke plume drifting downwind
    for (let i = 0; i < 4; i++) {
      const k = (t * 0.8 + i * 0.25 + s.bob) % 1;
      const dwx = Math.cos(rel) * k * 34;
      const dwy = Math.sin(rel) * k * 34;
      ctx.globalAlpha = baseA * (1 - k) * 0.5;
      ctx.fillStyle = i % 2 ? '#4a4d50' : '#5c6064';
      ctx.beginPath();
      ctx.arc(-hl * 0.28 + dwx, dwy, 2.5 + k * 6, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = baseA;
  } else {
    const wideMul = style === 'longship' ? 1.7 : 1;
    for (let m = 0; m < nm; m++) {
      const w = (m === 0 && nm > 1 ? sw * 0.84 : sw) * wideMul;
      drawSail(ctx, paths.masts[m], w, bulge, sailCol, def.sailShade, yard);
      if (style === 'longship') {
        // striped sail
        ctx.save();
        ctx.translate(paths.masts[m], 0);
        ctx.rotate(yard);
        ctx.globalAlpha = baseA * 0.5;
        ctx.strokeStyle = '#7d211a';
        ctx.lineWidth = 1.4;
        const hh = w / 2;
        for (let k = -1; k <= 1; k++) {
          ctx.beginPath();
          ctx.moveTo(-3, (k * hh) / 1.6);
          ctx.lineTo(bulge * 1.6 - 3, (k * hh) / 1.6);
          ctx.stroke();
        }
        ctx.restore();
        ctx.globalAlpha = baseA;
      }
    }
    ctx.fillStyle = '#2a1a0c';
    for (let m = 0; m < nm; m++) {
      ctx.beginPath();
      ctx.arc(paths.masts[m] - 3.2, 0, 2.3, 0, TAU);
      ctx.fill();
    }
    const mainIdx = Math.min(1, nm - 1);
    if (!flash) drawEmblem(ctx, def.faction, paths.masts[mainIdx], bulge, yard);
  }

  const flagX = style === 'ironclad' ? -hl * 0.6 : paths.masts[0] - 3.2;
  drawEnsign(ctx, def.faction, flagX, rel, t + s.bob, def.length > 85 ? 1.25 : 1);

  if (flash) {
    ctx.globalAlpha = baseA * 0.85;
    ctx.fillStyle = '#ffffff';
    ctx.fill(paths.hull);
  }
  if (sinkK > 0) {
    ctx.globalAlpha = baseA * Math.min(0.75, sinkK * 1.2);
    ctx.fillStyle = '#0d4a63';
    ctx.fill(paths.hull);
  }
  ctx.restore();
}
