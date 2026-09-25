// Gallery art: the same renderer the game sails with, painting the pictures the
// port shows you — a postcard of each stretch of water and a portrait of each
// hero hull. Nothing here is bespoke artwork: it is the real island painter and
// the real ship sprite, so what the shipyard shows is exactly what you get.

import { mulberry32, TAU } from './math';
import { buildIsland } from './render';
import { drawShip } from './sprites';
import type { RegionDef } from './worlds';
import { isSteelHull, type Ship, ShipDef } from './types';

/**
 * A throwaway Ship used only to pose a hull for its portrait: the sprite
 * painter wants a Ship, and this is a Ship standing very still with its sails
 * set and its guns run in.
 */
function poseShip(def: ShipDef, angle: number, sail: number): Ship {
  const crew = def.crew ?? 20;
  return {
    id: -1,
    def,
    team: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle,
    angVel: 0,
    fwd: 0,
    sail,
    sailTarget: sail,
    turnInput: 0,
    hp: def.hp,
    maxHp: def.hp,
    ghostHp: def.hp,
    reloadL: 0,
    reloadR: 0,
    reloadTime: def.reload,
    cannons: def.cannons,
    damage: def.damage,
    range: def.range,
    ballSpeed: def.ballSpeed,
    maxSpeed: def.speed,
    turnRate: def.turn,
    flash: 0,
    recoilL: 0,
    recoilR: 0,
    sinking: -1,
    sinkSpin: 1,
    dead: false,
    aiSide: 1,
    aiTimer: 0,
    aiWander: angle,
    aiJitter: 0,
    aiLead: 0,
    slowTimer: 0,
    hitTimer: 99,
    fxTimer: 0,
    wakeTimer: 0,
    bob: 0.6,
    hitByPlayer: false,
    isBoss: false,
    biteTimer: 0,
    homeX: 0,
    homeY: 0,
    leash: 0,
    hunt: -1,
    beach: -1,
    nativeState: 'hunt',
    crew,
    maxCrew: crew,
    surrendered: false,
    surrenderRolls: 0,
    captured: false,
  };
}

/** Open water in a region's own colours, with mottling and a little swell. */
export function paintWater(
  ctx: CanvasRenderingContext2D,
  region: RegionDef,
  w: number,
  h: number,
  seed = 1,
  blobs = 24,
) {
  const rnd = mulberry32(seed);
  ctx.fillStyle = region.water.base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < blobs; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = Math.min(w, h) * (0.14 + rnd() * 0.34);
    const light = rnd() < 0.5;
    const tint = light ? region.water.light : region.water.dark;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${tint}${light ? 0.075 : 0.11})`);
    g.addColorStop(1, `rgba(${tint}0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const len = Math.min(w, h) * (0.06 + rnd() * 0.1);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y - len * 0.22, x + len, y);
    ctx.stroke();
  }
}

/**
 * A postcard of one stretch of water: three little islands painted by the
 * game's own island artist, floating on that region's sea.
 */
export function paintWatersPostcard(
  ctx: CanvasRenderingContext2D,
  region: RegionDef,
  w: number,
  h: number,
  seed = 7,
) {
  paintWater(ctx, region, w, h, seed, 26);
  const rnd = mulberry32(seed * 31 + 5);
  const scale = Math.min(w, h);
  const spots: [number, number, number][] = [
    [0.26, 0.64, scale * 0.23],
    [0.79, 0.29, scale * 0.125],
    [0.63, 0.9, scale * 0.085],
  ];
  for (let i = 0; i < spots.length; i++) {
    const [fx, fy, rr] = spots[i];
    const r = rr * (0.88 + rnd() * 0.24);
    // islands are baked at (0,0) and blitted by their centre — same as the engine
    const is = buildIsland(0, 0, r, (seed * 7919 + i * 104729) | 0, 1.4, region.islands);
    ctx.drawImage(is.canvas, fx * w - is.half, fy * h - is.half, is.half * 2, is.half * 2);
  }
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.28, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,8,18,0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

/** Pitch of a hull at her moorings in a portrait frame. */
export const PORTRAIT_ANGLE = -Math.PI / 2 + 0.42;

/**
 * How big to draw a hull so she fills a `w` x `h` frame without losing her
 * bowsprit or her sails over the edge. Measured off the hull sprite's own box
 * (the baker pads the bow by 16 and the beam by 7 a side) plus the widest a
 * sail bellies out to.
 */
export function portraitFit(def: ShipDef, w: number, h: number) {
  const c = Math.abs(Math.cos(PORTRAIT_ANGLE));
  const s = Math.abs(Math.sin(PORTRAIT_ANGLE));
  const len = def.length + 23; // sprite: bowsprit 16 fore, 7 aft
  const beam = def.width * (def.oared || isSteelHull(def.hullStyle) ? 1 : 1.5) + 14;
  const bw = len * c + beam * s;
  const bh = len * s + beam * c;
  const scale = Math.min((w * 0.94) / bw, (h * 0.9) / bh);
  return {
    scale,
    shipW: bw * scale,
    shipH: bh * scale,
    fillW: (bw * scale) / w,
    fillH: (bh * scale) / h,
  };
}

/**
 * A hero hull posed in the frame: bow up and heeled over, over open water.
 * Assumes the water is already painted — pair it with `paintWater` (cached, if
 * the caller animates) or call `drawShipPortrait` to do both.
 */
export function drawPortraitShip(
  ctx: CanvasRenderingContext2D,
  def: ShipDef,
  w: number,
  h: number,
  t = 0.6,
  sail = 0.9,
) {
  // a soft shadow on the water so the hull sits on it rather than above it
  const angle = PORTRAIT_ANGLE;
  ctx.save();
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = '#02121f';
  ctx.translate(w / 2 + 4, h / 2 + 7);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, def.length * 0.56, def.width * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // fit the rotated hull (plus her bowsprit and sails) inside the frame
  const { scale } = portraitFit(def, w, h);

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);
  drawShip(ctx, poseShip(def, angle, sail), t, angle);
  ctx.restore();
}

/** Open water + a posed hero hull, painted in one pass. */
export function drawShipPortrait(
  ctx: CanvasRenderingContext2D,
  def: ShipDef,
  region: RegionDef,
  w: number,
  h: number,
  t = 0.6,
  sail = 0.9,
) {
  paintWater(ctx, region, w, h, def.length * 13 + def.width, 16);
  drawPortraitShip(ctx, def, w, h, t, sail);
}
