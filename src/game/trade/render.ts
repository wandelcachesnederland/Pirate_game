// Canvas rendering for the Trade mode: the shared chart (sea, continents, the
// ports of trade) painted in Trade's own palette, with the ships of the sea
// lanes on top. The map itself comes from ../chart/paint — Adventure draws the
// very same coastline, so the two modes can never drift apart.

import type { TradeEngine } from './engine';
import {
  TRADE_PALETTE,
  drawBackdrop,
  drawSea,
  drawGraticule,
  drawLand,
  drawPorts,
  drawPortLabels,
  drawProjectiles,
  drawShip,
  drawCompass,
  drawFrame,
  drawRing,
  nearestPort,
} from '../chart/paint';

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  eng: TradeEngine,
  viewW: number,
  viewH: number,
  dpr: number,
) {
  const palette = TRADE_PALETTE;
  const { scale, ox, oy } = eng.view;
  const cam = { scale, ox, oy };
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawBackdrop(ctx, viewW, viewH, palette);

  // ---- world space
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  drawSea(ctx, palette);
  drawGraticule(ctx, scale, palette);
  drawLand(ctx, scale, palette);

  // danger ring while pirates are close
  if (eng.pirates.length > 0) {
    const near = eng.pirates.some((e) => Math.hypot(e.x - eng.player.x, e.y - eng.player.y) < 250);
    if (near) {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 240);
      drawRing(ctx, eng.player.x, eng.player.y, 250, scale, `rgba(255,70,40,${0.18 + 0.12 * pulse})`);
    }
  }

  const near = nearestPort(eng.player.x, eng.player.y);
  const t = performance.now() / 1000;
  const canDock = eng.getHud().canDock;
  drawPorts(ctx, { scale, t, nearId: near?.port.id ?? null, dockable: canDock });
  drawProjectiles(ctx, eng.projectiles, scale);

  for (const e of eng.pirates) drawShip(ctx, e.x, e.y, e.angle, '#c23b2e', 7, e.hitFlash);
  drawShip(ctx, eng.player.x, eng.player.y, eng.player.angle, '#ffd34d', 9, eng.player.hitFlash);

  ctx.restore();

  // ---- screen space: labels + compass
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawPortLabels(ctx, cam, viewW, viewH, palette, near?.port.id ?? null);
  drawCompass(ctx, ox, oy, palette);
  drawFrame(ctx, cam, palette);
}
