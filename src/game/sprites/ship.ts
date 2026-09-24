// The ship sprite itself: baked hull, deck detail, cannons and rigging assembled
// into the two entry points the engine calls each frame.

import { angDiff, TAU } from '../math';
import type { Faction, Ship } from '../types';
import { cannonLocalX, shipPaths } from './hull';
import { getHullSprite } from './hullSprite';
import { drawEmblem, drawEnsign, drawOars, drawRigging, drawSail } from './rigging';

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
  ctx.fillStyle = '#021a2e';
  ctx.fill(paths.hull);
  ctx.restore();
}

/**
 * Draw a ship, sails and all.
 * @param flag colours flown at the masthead — pass a faction other than the
 *   ship's own to fly FALSE COLOURS.
 */
export function drawShip(
  ctx: CanvasRenderingContext2D,
  s: Ship,
  t: number,
  windAngle: number,
  flag: Faction = s.def.faction,
) {
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

  // ---- 1. baked hull
  const sp = getHullSprite(def);
  ctx.drawImage(sp.canvas, -sp.ox, -sp.oy, sp.w, sp.h);

  // ---- 2. battle damage: scorch marks accumulate as hp drops
  const dmg = 1 - s.hp / s.maxHp;
  if (dmg > 0.3 && !flash) {
    ctx.save();
    ctx.clip(paths.hull);
    ctx.globalAlpha = baseA * Math.min(0.6, (dmg - 0.3) * 1.3);
    ctx.fillStyle = '#1a120c';
    const n = Math.floor(dmg * 5);
    for (let i = 0; i < n; i++) {
      const px = Math.sin(i * 12.9898 + def.length) * hl * 0.8;
      const py = Math.cos(i * 78.233 + def.width) * hw * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + ((i * 7) % 3), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = baseA;
  }

  // ---- 3. paddles on oared craft (they carry no rig at all)
  const oared = !!def.oared;
  if (oared) {
    const drive = Math.min(1, Math.hypot(s.vx ?? 0, s.vy ?? 0) / Math.max(1, def.speed));
    drawOars(ctx, hl, hw, t, s.bob, drive);
  }

  // ---- 4. cannons running out through the ports (animated recoil)
  const n = s.cannons;
  if (n > 0 && !def.mortar && !flash) {
    for (let i = 0; i < n; i++) {
      const cx = cannonLocalX(def, n, i);
      ctx.fillStyle = '#17170f';
      ctx.fillRect(cx - 1.05, -hw - 3.1 + s.recoilL * 3, 2.1, 4.6);
      ctx.fillRect(cx - 1.05, hw - 1.5 - s.recoilR * 3, 2.1, 4.6);
      ctx.fillStyle = '#3c3c34';
      ctx.fillRect(cx - 1.05, -hw - 3.1 + s.recoilL * 3, 2.1, 1);
      ctx.fillRect(cx - 1.05, hw + 3.1 - 1 - s.recoilR * 3, 2.1, 1);
    }
  }

  // ---- 5. sail geometry from the wind
  const rel = angDiff(s.angle, windAngle);
  const push = Math.cos(rel);
  const flutter = push < 0.1 ? Math.sin(t * 24 + s.bob) * 1.3 : 0; // luffing
  const bulge = Math.max(1.4, (2 + Math.max(0, push) * 7.5) * (0.4 + 0.6 * s.sail)) + flutter;
  const yard = Math.max(-0.45, Math.min(0.45, Math.sin(rel) * 0.45));
  const sw = def.width * 1.55 * (0.6 + 0.4 * s.sail);
  const sailCol = flash ? '#ffffff' : def.sail;
  const nm = paths.masts.length;
  const style = def.hullStyle ?? 'default';

  if (style === 'ironclad') {
    // ---- IRONCLAD: no canvas — a stub mast and a live smoke plume
    ctx.fillStyle = '#2a1a0c';
    ctx.beginPath();
    ctx.arc(-hl * 0.28, 0, 2, 0, TAU);
    ctx.fill();
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
  } else if (!oared) {
    drawRigging(ctx, paths.masts, hw, hl);
    // jib on the bowsprit (not on the double-ended longship)
    if (s.sail > 0.15 && style !== 'longship') {
      ctx.save();
      ctx.rotate(yard * 0.5);
      ctx.fillStyle = sailCol;
      ctx.globalAlpha = baseA * 0.95;
      ctx.beginPath();
      ctx.moveTo(hl + 12, 0);
      ctx.quadraticCurveTo(hl * 0.75 + bulge, -hw * 0.5 - bulge * 0.4, hl * 0.5, -hw * 0.12);
      ctx.lineTo(hl * 0.55, hw * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = def.sailShade;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = baseA;
    }
    // square sails — the longship gets one much wider striped sail
    const wideMul = style === 'longship' ? 1.7 : 1;
    for (let m = 0; m < nm; m++) {
      const w = (m === 0 && nm > 1 ? sw * 0.84 : sw) * wideMul;
      drawSail(ctx, paths.masts[m], w, bulge, sailCol, def.sailShade, yard);
      if (style === 'longship') {
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
    // ---- 6. spanker (fore-and-aft sail off the mizzen) on 3-masters
    if (nm >= 3 && s.sail > 0.2) {
      const mz = paths.masts[nm - 1];
      ctx.save();
      ctx.fillStyle = sailCol;
      ctx.globalAlpha = baseA * 0.92;
      const side = Math.sin(rel) >= 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(mz, 0);
      ctx.quadraticCurveTo(mz - hl * 0.16, side * hw * 0.6, mz - hl * 0.3, side * hw * 0.5);
      ctx.lineTo(mz - hl * 0.26, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = def.sailShade;
      ctx.lineWidth = 0.55;
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = baseA;
    }
  }

  // ---- 7. emblem + mast tops
  const mainIdx = Math.min(1, nm - 1);
  if (!flash && style !== 'ironclad' && style !== 'longship' && mainIdx >= 0) {
    drawEmblem(ctx, def.faction, paths.masts[mainIdx], bulge, yard);
  }
  if (style !== 'ironclad' && !oared) {
    ctx.fillStyle = '#2a1a0c';
    for (let m = 0; m < nm; m++) {
      ctx.beginPath();
      ctx.arc(paths.masts[m] - 3.2, 0, 2.3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#4a3218';
      ctx.beginPath();
      ctx.arc(paths.masts[m] - 3.2, 0, 1.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2a1a0c';
    }
  }

  // ---- 8. ensign (masthead, or a short jackstaff on oared/ironclad hulls)
  const flagX = style === 'ironclad' || oared ? -hl * 0.6 : paths.masts[0] - 3.2;
  drawEnsign(ctx, flag, flagX, rel, t + s.bob, def.length > 85 ? 1.25 : 1);

  // ---- 9. hit flash / sinking tint
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
