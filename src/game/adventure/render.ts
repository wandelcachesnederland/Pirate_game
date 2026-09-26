// Canvas rendering for the Adventure mode: the shared chart — the same
// continents, graticule and ports the Trade mode sails — painted in the
// lamp-lit palette of a hunter's map, with the lairs, beasts, rivals and raiders
// of the adventure on top.

import type { AdventureEngine } from './engine';
import {
  ADVENTURE_PALETTE,
  drawBackdrop,
  drawSea,
  drawGraticule,
  drawLand,
  drawPorts,
  drawPortLabels,
  drawProjectiles,
  drawShip,
  drawRing,
  drawTag,
  drawHealthBar,
  drawCompass,
  drawFrame,
  nearestPort,
} from '../chart/paint';
import { WAKE_RANGE } from './beasts';

const PLAYER_COLOR = '#f6e7b4';
const RAIDER_COLOR = '#c9552f';
const SLEEP_COLOR = 'rgba(120,255,205,0.35)';

/** A sea beast: a long body with arms that writhe. */
function drawBeast(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  flash: number,
  t: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // arms
  ctx.strokeStyle = 'rgba(30,90,70,0.95)';
  ctx.lineWidth = size * 0.24;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const base = (i / 5) * Math.PI * 2;
    const sway = Math.sin(t * 2 + i) * 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(base) * size * 0.3, Math.sin(base) * size * 0.3);
    ctx.quadraticCurveTo(
      Math.cos(base + sway) * size * 1.0,
      Math.sin(base + sway) * size * 1.0,
      Math.cos(base + sway * 2) * size * 1.7,
      Math.sin(base + sway * 2) * size * 1.7,
    );
    ctx.stroke();
  }

  // body
  ctx.fillStyle = flash > 0 ? '#d8f5c8' : '#3f8f6c';
  ctx.strokeStyle = 'rgba(12,40,32,0.85)';
  ctx.lineWidth = size * 0.14;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.05, size * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // eyes
  ctx.fillStyle = '#ffe27a';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(size * 0.55, s * size * 0.22, size * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A sleeping lair: a dark swirl on the water with tier pips around it. */
function drawLair(ctx: CanvasRenderingContext2D, x: number, y: number, tier: number, scale: number, t: number, contract: boolean) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + x * 0.01);
  drawRing(ctx, x, y, 14 + 3 * pulse, scale, contract ? 'rgba(255,214,110,0.9)' : SLEEP_COLOR, 2);
  ctx.fillStyle = contract ? 'rgba(255,214,110,0.9)' : SLEEP_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, 5 + pulse, 0, Math.PI * 2);
  ctx.fill();
  // tier pips
  for (let i = 0; i < tier; i++) {
    const a = (i / tier) * Math.PI * 2 + t * 0.4;
    const r = 20;
    ctx.fillStyle = contract ? '#ffd66e' : 'rgba(150,255,215,0.65)';
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWake(ctx: CanvasRenderingContext2D, eng: AdventureEngine, scale: number) {
  const p = eng.player;
  const sp = Math.hypot(p.vx, p.vy);
  if (sp < 4) return;
  ctx.strokeStyle = 'rgba(240,250,255,0.16)';
  ctx.lineWidth = 2 / scale;
  ctx.beginPath();
  ctx.moveTo(p.x - Math.cos(p.angle) * 8, p.y - Math.sin(p.angle) * 8);
  ctx.lineTo(p.x - Math.cos(p.angle) * (10 + sp * 0.55), p.y - Math.sin(p.angle) * (10 + sp * 0.55));
  ctx.stroke();
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  eng: AdventureEngine,
  viewW: number,
  viewH: number,
  dpr: number,
) {
  const palette = ADVENTURE_PALETTE;
  const { scale, ox, oy } = eng.view;
  const cam = { scale, ox, oy };
  const t = performance.now() / 1000;
  const p = eng.player;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawBackdrop(ctx, viewW, viewH, palette);

  // ---- world space
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  drawSea(ctx, palette);
  drawGraticule(ctx, scale, palette);
  drawLand(ctx, scale, palette);

  const near = nearestPort(p.x, p.y);
  const hud = eng.getHud();
  const contractId = eng.contract?.foeId ?? null;
  drawPorts(ctx, {
    scale,
    t,
    nearId: near?.port.id ?? null,
    dockable: hud.canDock,
    badge: (port) => (port.id === eng.activePortId && contractId ? '#ffd66e' : null),
  });

  // lairs of the living
  for (const f of eng.foes) {
    if (f.awake) continue;
    drawLair(ctx, f.x, f.y, f.def.tier, scale, t, contractId === f.def.id);
    const d = Math.hypot(f.x - p.x, f.y - p.y);
    if (d < WAKE_RANGE * 1.6 || contractId === f.def.id) {
      drawTag(ctx, f.x, f.y, f.def.name, scale, contractId === f.def.id ? '#ffd66e' : 'rgba(160,255,214,0.8)');
    }
  }

  // danger ring while something is awake and close
  const hunted = eng.foes.some((f) => f.awake && Math.hypot(f.x - p.x, f.y - p.y) < 320);
  if (hunted) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);
    drawRing(ctx, p.x, p.y, 320, scale, `rgba(255,80,60,${0.14 + 0.12 * pulse})`);
  }

  // raiders
  for (const r of eng.raiders) drawShip(ctx, r.x, r.y, r.angle, RAIDER_COLOR, 7, r.hitFlash);

  // the woken
  for (const f of eng.foes) {
    if (!f.awake) continue;
    if (f.def.kind === 'beast') drawBeast(ctx, f.x, f.y, f.angle, f.def.size, f.hitFlash, t);
    else drawShip(ctx, f.x, f.y, f.angle, f.def.color, f.def.size, f.hitFlash);
    drawHealthBar(ctx, f.x, f.y - f.def.size - 6, f.hp / f.maxHp, scale, f.def.kind === 'beast' ? '#5fd39a' : '#ff7a5a');
    drawTag(ctx, f.x, f.y, `${f.def.name}`, scale, '#ffd9a0', -(f.def.size + 10));
  }

  drawProjectiles(ctx, eng.projectiles, scale);
  drawWake(ctx, eng, scale);
  drawShip(ctx, p.x, p.y, p.angle, PLAYER_COLOR, 9, p.hitFlash);

  ctx.restore();

  // ---- screen space
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawPortLabels(ctx, cam, viewW, viewH, palette, near?.port.id ?? null);
  drawCompass(ctx, ox, oy, palette);
  drawFrame(ctx, cam, palette);
}
