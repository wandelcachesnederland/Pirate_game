// Canvas painting shared by every mode that sails the chart.
//
// The map itself — sea, graticule, continents, ports, compass, the ships upon
// the water — is drawn here once. A mode hands in a palette and its own
// overlay callback, so Trade's ledger-green chart and Adventure's lamp-lit
// parchment are the *same map* dressed differently, not two maps that drift
// apart.

import { WORLD_W, WORLD_H, LAND } from './world';
import { PORTS_PROJ, REGIONS, type ProjectedPort } from './ports';

export interface ChartPalette {
  /** Vertical backdrop gradient behind the map bounds (top, bottom). */
  backdrop: [string, string];
  /** Vertical sea gradient inside the map bounds (top, bottom). */
  sea: [string, string];
  land: string;
  landHi: string;
  coast: string;
  grid: string;
  label: string;
  labelNear: string;
  compass: string;
  frame: string;
}

/** The Trade chart: clean hydrographic blues and sunlit parchment land. */
export const TRADE_PALETTE: ChartPalette = {
  backdrop: ['#0a2c46', '#06192c'],
  sea: ['#155a85', '#0e4567'],
  land: '#d8c79a',
  landHi: '#e7dab4',
  coast: '#7a5a32',
  grid: 'rgba(255,255,255,0.06)',
  label: 'rgba(243,226,179,0.85)',
  labelNear: '#ffe9a0',
  compass: 'rgba(243,226,179,0.6)',
  frame: 'rgba(122,90,50,0.8)',
};

/** The Adventure chart: a sea the colour of deep water at dusk. */
export const ADVENTURE_PALETTE: ChartPalette = {
  backdrop: ['#04141c', '#020a10'],
  sea: ['#0b3a44', '#072430'],
  land: '#b9a271',
  landHi: '#cfbc8c',
  coast: '#4e3a1e',
  grid: 'rgba(160,255,220,0.07)',
  label: 'rgba(214,236,226,0.8)',
  labelNear: '#9ff5d2',
  compass: 'rgba(180,240,214,0.6)',
  frame: 'rgba(90,200,168,0.55)',
};

export interface ChartCam {
  scale: number;
  ox: number;
  oy: number;
}

// ----------------------------------------------------------------- base layers

export function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  palette: ChartPalette,
) {
  const bg = ctx.createLinearGradient(0, 0, 0, viewH);
  bg.addColorStop(0, palette.backdrop[0]);
  bg.addColorStop(1, palette.backdrop[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, viewW, viewH);
}

export function drawSea(ctx: CanvasRenderingContext2D, palette: ChartPalette) {
  const sea = ctx.createLinearGradient(0, 0, 0, WORLD_H);
  sea.addColorStop(0, palette.sea[0]);
  sea.addColorStop(1, palette.sea[1]);
  ctx.fillStyle = sea;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
}

export function drawGraticule(ctx: CanvasRenderingContext2D, scale: number, palette: ChartPalette) {
  ctx.strokeStyle = palette.grid;
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
}

export function drawLand(ctx: CanvasRenderingContext2D, scale: number, palette: ChartPalette) {
  for (const b of LAND) {
    ctx.beginPath();
    ctx.moveTo(b.pts[0][0], b.pts[0][1]);
    for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i][0], b.pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = palette.land;
    ctx.fill();
    ctx.strokeStyle = palette.coast;
    ctx.lineWidth = 1.4 / scale;
    ctx.stroke();
  }
  // a faint inland highlight band along the coasts
  ctx.fillStyle = palette.landHi;
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
}

// ----------------------------------------------------------------- ports

export interface PortMarkOpts {
  scale: number;
  /** Seconds — drives the pulsing ring on the port you can drop anchor at. */
  t: number;
  nearId?: string | null;
  /** Highlight the near port as dockable. */
  dockable?: boolean;
  /** Draw only these ports (Adventure hides nothing, Trade shows all). */
  filter?: (p: ProjectedPort) => boolean;
  /** Extra mark drawn under a port dot (e.g. a live contract). */
  badge?: (p: ProjectedPort) => string | null;
}

export function drawPorts(ctx: CanvasRenderingContext2D, o: PortMarkOpts) {
  for (const p of PORTS_PROJ) {
    if (o.filter && !o.filter(p)) continue;
    const isNear = o.nearId === p.id;
    const pulse = 0.5 + 0.5 * Math.sin(o.t * 6);
    if (isNear && o.dockable) {
      ctx.strokeStyle = `rgba(255,220,120,${0.5 + 0.4 * pulse})`;
      ctx.lineWidth = 2.5 / o.scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22 + 4 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    const badge = o.badge?.(p);
    if (badge) {
      ctx.strokeStyle = badge;
      ctx.lineWidth = 2 / o.scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11 + 2 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = REGIONS[p.region].color;
    ctx.strokeStyle = '#1a1207';
    ctx.lineWidth = 1.4 / o.scale;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (p.shipyard) {
      ctx.fillStyle = '#fff3c4';
      ctx.fillRect(p.x - 1.2, p.y - 7, 2.4, 3.4);
    }
  }
}

export function drawPortLabels(
  ctx: CanvasRenderingContext2D,
  cam: ChartCam,
  viewW: number,
  viewH: number,
  palette: ChartPalette,
  nearId?: string | null,
  filter?: (p: ProjectedPort) => boolean,
) {
  const { scale, ox, oy } = cam;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  for (const p of PORTS_PROJ) {
    if (filter && !filter(p)) continue;
    const sx = ox + p.x * scale;
    const sy = oy + p.y * scale;
    if (sx < -20 || sx > viewW + 20 || sy < -20 || sy > viewH + 20) continue;
    const isNear = nearId === p.id;
    ctx.font = `${isNear ? 13 : 10.5}px "IM Fell English", Georgia, serif`;
    const tw = ctx.measureText(p.name).width;
    ctx.fillStyle = 'rgba(8,20,34,0.55)';
    ctx.fillRect(sx + 6, sy - 7, tw + 6, 14);
    ctx.fillStyle = isNear ? palette.labelNear : palette.label;
    ctx.fillText(p.name, sx + 9, sy);
  }
}

/** World-space label above a marker (lairs, foes). */
export function drawTag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  scale: number,
  color: string,
  dy = -14,
) {
  // labels are drawn in world space, so their size is divided by the zoom to
  // keep the same legible height on screen at any scale
  const s = Math.max(scale, 0.35);
  ctx.save();
  ctx.font = `${11 / s}px "IM Fell English", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  const w = ctx.measureText(text).width;
  const h = 14 / s;
  ctx.fillStyle = 'rgba(4,14,20,0.6)';
  ctx.fillRect(x - w / 2 - 3 / s, y + dy - h, w + 6 / s, h);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y + dy);
  ctx.restore();
}

// ----------------------------------------------------------------- ships & shot

export function drawShip(
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

export function drawProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: { x: number; y: number; vx: number; vy: number; color: string }[],
  scale: number,
) {
  for (const pr of projectiles) {
    const len = 6;
    const a = Math.atan2(pr.vy, pr.vx);
    ctx.strokeStyle = pr.color;
    ctx.lineWidth = 2 / scale;
    ctx.beginPath();
    ctx.moveTo(pr.x, pr.y);
    ctx.lineTo(pr.x - Math.cos(a) * len, pr.y - Math.sin(a) * len);
    ctx.stroke();
  }
}

/** A pulsing ring in world space — danger, lairs, target brackets. */
export function drawRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  scale: number,
  color: string,
  width = 2,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width / scale;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

/** Health pip above a ship or beast, in world space. */
export function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frac: number,
  scale: number,
  color: string,
  w = 26,
) {
  const h = Math.max(2.5, 4 / scale);
  const ww = w / scale;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x - ww / 2, y, ww, h);
  ctx.fillStyle = color;
  ctx.fillRect(x - ww / 2, y, ww * Math.max(0, Math.min(1, frac)), h);
}

// ----------------------------------------------------------------- furniture

export function drawCompass(ctx: CanvasRenderingContext2D, ox: number, oy: number, palette: ChartPalette) {
  const cx = Math.max(42, ox + 38);
  const cy = Math.max(42, oy + 38);
  const R = 22;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(8,20,34,0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, R + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = palette.compass;
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
  ctx.fillStyle = palette.compass;
  ctx.font = '11px "IM Fell English", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', 0, -R - 1);
  ctx.restore();
}

export function drawFrame(ctx: CanvasRenderingContext2D, cam: ChartCam, palette: ChartPalette) {
  ctx.strokeStyle = palette.frame;
  ctx.lineWidth = 4;
  ctx.strokeRect(cam.ox, cam.oy, WORLD_W * cam.scale, WORLD_H * cam.scale);
}

// ----------------------------------------------------------------- helpers

export function nearestPort(x: number, y: number): { port: ProjectedPort; d: number } | null {
  let best: ProjectedPort | null = null;
  let bestD = Infinity;
  for (const p of PORTS_PROJ) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best ? { port: best, d: bestD } : null;
}
