// Canvas rendering for the Trade mode: a stylised whole-world chart with hand-
// drawn continents, a graticule, the ports of trade, and the ships upon the sea.
// Everything that lives in world coordinates is drawn under a single scale
// transform; labels and the compass are drawn in screen space on top.

import type { TradeEngine } from './engine';
import { WORLD_W, WORLD_H, LAND } from './world';
import { PORTS_PROJ, REGIONS } from './ports';

const SEA_BG = '#0a2c46';
const OCEAN = '#155a85';
const OCEAN_DEEP = '#0e4567';
const LAND_FILL = '#d8c79a';
const LAND_HI = '#e7dab4';
const COAST = '#7a5a32';

function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  size: number,
  flash: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(20,10,0,0.55)';
  ctx.lineWidth = size * 0.14;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.72, size * 0.6);
  ctx.lineTo(-size * 0.5, 0);
  ctx.lineTo(-size * 0.72, -size * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // tiny sail
  ctx.fillStyle = 'rgba(245,235,205,0.92)';
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.lineTo(-size * 0.05, -size * 0.42);
  ctx.lineTo(-size * 0.45, 0);
  ctx.closePath();
  ctx.fill();
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,70,40,${0.5 * flash})`;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  eng: TradeEngine,
  viewW: number,
  viewH: number,
  dpr: number,
) {
  const { scale, ox, oy } = eng.view;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, viewH);
  bg.addColorStop(0, SEA_BG);
  bg.addColorStop(1, '#06192c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, viewW, viewH);

  // ---- world space
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  // sea inside the map bounds, with a subtle deep-water gradient
  const sea = ctx.createLinearGradient(0, 0, 0, WORLD_H);
  sea.addColorStop(0, OCEAN);
  sea.addColorStop(1, OCEAN_DEEP);
  ctx.fillStyle = sea;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  // graticule every 30 degrees
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1 / scale;
  ctx.beginPath();
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = (lon + 180) * (WORLD_W / 360);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_H);
  }
  for (let lat = -60; lat <= 80; lat += 30) {
    const y = (80 - lat) * (WORLD_H / 138);
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_W, y);
  }
  ctx.stroke();

  // land
  for (const b of LAND) {
    ctx.beginPath();
    ctx.moveTo(b.pts[0][0], b.pts[0][1]);
    for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i][0], b.pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = LAND_FILL;
    ctx.fill();
    ctx.strokeStyle = COAST;
    ctx.lineWidth = 1.4 / scale;
    ctx.stroke();
  }
  // a faint inland highlight band along the coasts
  ctx.fillStyle = LAND_HI;
  for (const b of LAND) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(b.pts[0][0], b.pts[0][1]);
    for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i][0], b.pts[i][1]);
    ctx.closePath();
    ctx.clip();
    ctx.globalAlpha = 0.25;
    ctx.fillRect(b.minX, b.minY, b.maxX - b.minX, (b.maxY - b.minY) * 0.28);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // danger ring while pirates are close
  if (eng.pirates.length > 0) {
    const near = eng.pirates.some(
      (e) => Math.hypot(e.x - eng.player.x, e.y - eng.player.y) < 250,
    );
    if (near) {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 240);
      ctx.strokeStyle = `rgba(255,70,40,${0.18 + 0.12 * pulse})`;
      ctx.lineWidth = 2 / scale;
      ctx.beginPath();
      ctx.arc(eng.player.x, eng.player.y, 250, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ports
  const near = nearestPort(eng);
  const t = performance.now() / 1000;
  const canDock = eng.getHud().canDock;
  for (const p of PORTS_PROJ) {
    const col = REGIONS[p.region].color;
    const isNear = near && near.port.id === p.id;
    if (isNear && canDock) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 6);
      ctx.strokeStyle = `rgba(255,220,120,${0.5 + 0.4 * pulse})`;
      ctx.lineWidth = 2.5 / scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22 + 4 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    // marker
    ctx.fillStyle = col;
    ctx.strokeStyle = '#1a1207';
    ctx.lineWidth = 1.4 / scale;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (p.shipyard) {
      ctx.fillStyle = '#fff3c4';
      ctx.fillRect(p.x - 1.2, p.y - 7, 2.4, 3.4);
    }
  }

  // projectiles
  for (const pr of eng.projectiles) {
    const len = 6;
    const a = Math.atan2(pr.vy, pr.vx);
    ctx.strokeStyle = pr.color;
    ctx.lineWidth = 2 / scale;
    ctx.beginPath();
    ctx.moveTo(pr.x, pr.y);
    ctx.lineTo(pr.x - Math.cos(a) * len, pr.y - Math.sin(a) * len);
    ctx.stroke();
  }

  // pirate ships
  for (const e of eng.pirates) {
    drawShip(ctx, e.x, e.y, e.angle, '#c23b2e', 7, e.hitFlash);
  }
  // player
  drawShip(ctx, eng.player.x, eng.player.y, eng.player.angle, '#ffd34d', 9, eng.player.hitFlash);

  ctx.restore();

  // ---- screen space: labels + compass
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textBaseline = 'middle';
  for (const p of PORTS_PROJ) {
    const sx = ox + p.x * scale;
    const sy = oy + p.y * scale;
    if (sx < -20 || sx > viewW + 20 || sy < -20 || sy > viewH + 20) continue;
    const isNear = near && near.port.id === p.id;
    ctx.font = `${isNear ? 13 : 10.5}px "IM Fell English", Georgia, serif`;
    const tw = ctx.measureText(p.name).width;
    ctx.fillStyle = 'rgba(8,20,34,0.55)';
    ctx.fillRect(sx + 6, sy - 7, tw + 6, 14);
    ctx.fillStyle = isNear ? '#ffe9a0' : 'rgba(243,226,179,0.85)';
    ctx.fillText(p.name, sx + 9, sy);
  }

  // compass rose
  const cx = Math.max(42, ox + 38);
  const cy = Math.max(42, oy + 38);
  const R = 22;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(8,20,34,0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, R + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(243,226,179,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();
  // N arrow
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath();
  ctx.moveTo(0, -R + 2);
  ctx.lineTo(-5, 4);
  ctx.lineTo(0, 0);
  ctx.lineTo(5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(243,226,179,0.9)';
  ctx.font = '11px "IM Fell English", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', 0, -R - 1);
  ctx.restore();

  // frame
  ctx.strokeStyle = 'rgba(122,90,50,0.8)';
  ctx.lineWidth = 4;
  ctx.strokeRect(ox, oy, WORLD_W * scale, WORLD_H * scale);
}

function nearestPort(eng: TradeEngine) {
  let best: (typeof PORTS_PROJ)[number] | null = null;
  let bestD = Infinity;
  for (const p of PORTS_PROJ) {
    const d = Math.hypot(p.x - eng.player.x, p.y - eng.player.y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best ? { port: best as (typeof PORTS_PROJ)[number], d: bestD } : null;
}
