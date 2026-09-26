// The era card itself: one picture per era, painted live.
//
// A card is three things stacked: the fight (the era's hero hull against the
// worst her roster sends, with the weapons she actually carries), the water and
// weather those hulls fought in, and the logo plate across the bottom — emblem,
// the name of the age, its year and the sea it belongs to.
//
// Everything that never moves (sky, shore, the body of the sea) is baked once
// per era and size into an offscreen canvas; the swells, the hulls, the shot,
// the weather and the lettering are painted each frame, so the card is alive
// and the webfont can land late without the title going missing.

import { makeCanvas } from '../canvas';
import { mulberry32, TAU } from '../math';
import { poseShip } from '../portrait';
import { SHIP_DEFS } from '../data';
import { armShipForEra } from '../weapons';
import type { EraId, ShipDef } from '../types';
import type { EraShip } from '../ships/era';
import type { RegionDef } from '../worlds';
import { drawShip } from '../sprites';
import { hexA, paintCoastline, paintSky } from './coast';
import {
  drawBurning,
  drawFx,
  drawProp,
  drawSinking,
  drawSwell,
  drawWake,
  drawWeather,
  type Placed,
} from './fx';
import { drawEmblem } from './emblems';
import { sceneFor, type EraSceneSpec } from './scenes';

const PIRATA = '"Pirata One", Georgia, serif';
const FELL = '"IM Fell English", Georgia, serif';

/** How the card is divided up at this size. */
interface Layout {
  w: number;
  h: number;
  /** the logo plate across the bottom */
  banner: number;
  /** the waterline: sky above, sea below */
  skyH: number;
  /** everything above the plate */
  stage: number;
  pad: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function layoutOf(w: number, h: number): Layout {
  const banner = clamp(h * 0.26, 44, 116);
  const stage = h - banner;
  const skyH = clamp(stage * 0.19, 13, 58);
  return { w, h, banner, skyH, stage, pad: clamp(banner * 0.13, 6, 15) };
}

// ------------------------------------------------------------------- the sea

/**
 * The body of water, in the colours of the sea this era is fought in: base,
 * mottle, a shallow band at the horizon and a vignette to seat the plate.
 */
function paintSea(
  ctx: CanvasRenderingContext2D,
  region: RegionDef,
  L: Layout,
  spec: EraSceneSpec,
  seed: number,
) {
  const { w, skyH, stage } = L;
  const top = skyH;
  const bot = stage;
  ctx.fillStyle = region.water.base;
  ctx.fillRect(0, top, w, bot - top);

  const rnd = mulberry32(seed);
  // shallows along the far shore
  const sh = ctx.createLinearGradient(0, top, 0, top + (bot - top) * 0.2);
  sh.addColorStop(0, `rgba(${region.water.light}0.3)`);
  sh.addColorStop(1, `rgba(${region.water.light}0)`);
  ctx.fillStyle = sh;
  ctx.fillRect(0, top, w, (bot - top) * 0.2);

  // mottling: light and dark water, longer and looser toward the viewer
  for (let i = 0; i < 30; i++) {
    const k = rnd();
    const x = rnd() * w;
    const y = top + (bot - top) * (k * k * 0.6 + k * 0.4);
    const r = (bot - top) * (0.05 + k * 0.2) * (0.6 + rnd());
    const light = rnd() < 0.5;
    const tint = light ? region.water.light : region.water.dark;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${tint}${light ? 0.07 : 0.1})`);
    g.addColorStop(1, `rgba(${tint}0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 2.6, r * 0.45, 0, 0, TAU);
    ctx.fill();
  }

  // the era's own wash over the water: firelight, dusk, river silt
  if (spec.tint) {
    ctx.fillStyle = spec.tint;
    ctx.fillRect(0, top, w, bot - top);
  }

  // depth at the bottom, so the plate sits on the sea rather than over it
  const dg = ctx.createLinearGradient(0, bot - (bot - top) * 0.34, 0, bot);
  dg.addColorStop(0, 'rgba(2,10,20,0)');
  dg.addColorStop(1, 'rgba(2,10,20,0.42)');
  ctx.fillStyle = dg;
  ctx.fillRect(0, bot - (bot - top) * 0.34, w, (bot - top) * 0.34);

  // vignette
  const vg = ctx.createRadialGradient(
    w / 2,
    stage * 0.52,
    Math.min(w, stage) * 0.3,
    w / 2,
    stage * 0.52,
    Math.max(w, stage) * 0.78,
  );
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(2,8,18,0.5)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, stage);
}

/** Sky, shore and sea in one go — this is what gets baked. */
function paintBackdrop(
  ctx: CanvasRenderingContext2D,
  region: RegionDef,
  L: Layout,
  spec: EraSceneSpec,
  seed: number,
) {
  paintSky(ctx, L.w, L.skyH, spec, mulberry32(seed * 7 + 3));
  paintSea(ctx, region, L, spec, seed * 31 + 11);
  paintCoastline(ctx, L.w, L.skyH, spec, seed * 13 + 5);
  // oil, stakes and reefs lie on the water, under the hulls
  for (const prop of spec.props ?? []) {
    if (prop === 'shoreFire' || prop === 'whirl' || prop === 'wreck') continue;
    drawProp(ctx, prop, L.w, L.skyH, L.stage - L.skyH, 0, seed * 17 + 91);
  }
}

// ------------------------------------------------------------------ the cast

/** Who is in the picture: the hero hull, or a ship from the game's own roster. */
function defFor(who: string, era: EraId, hero: ShipDef): ShipDef {
  if (who === 'hero') return hero;
  const kind = who as keyof typeof SHIP_DEFS;
  return armShipForEra(SHIP_DEFS[kind] ?? SHIP_DEFS.merchant, era);
}

/**
 * Turn the cast list into hulls with a place and a size on the water, in the
 * order the spec names them (so the effects can point at "the second one").
 * `s` is the fraction of the card's width a hull should span, trimmed if that
 * would put her mastheads through the horizon or her stern through the plate.
 */
function placeCast(spec: EraSceneSpec, era: EraId, hero: ShipDef, L: Layout, seed: number): Placed[] {
  const stageTop = L.skyH;
  const stageH = L.stage - L.skyH;
  const rnd = mulberry32(seed);
  const placed: Placed[] = spec.cast.map(([who, fx, fy, s, a, o]) => {
    const def = defFor(who, era, hero);
    const x = clamp(fx, 0.04, 0.96) * L.w + (rnd() - 0.5) * 3;
    const y = stageTop + clamp(fy, 0.06, 0.94) * stageH + (rnd() - 0.5) * 2;
    // how much room a hull of this heading needs, per ship unit
    const sailPad = def.oared ? 0.5 : 1.4;
    const boxH = Math.abs(def.length * Math.sin(a)) + def.width * sailPad * Math.abs(Math.cos(a));
    const byWidth = (s * L.w) / def.length;
    const byHeight = (stageH * 0.6) / Math.max(1, boxH);
    return {
      def,
      x,
      y,
      a,
      // a touch smaller than the frame would allow: the sprites are drawn for
      // game scale, and they hold together better not quite filling the card
      scale: clamp(Math.min(byWidth, byHeight) * 0.9, 0.08, 12),
      hp: o?.hp ?? 1,
      burn: o?.burn ?? 0,
      sink: o?.sink ?? 0,
      sail: o?.sail ?? 0.92,
    };
  });
  return placed;
}

/** One hull on the water: her shadow, her wake, and whatever is on fire. */
function drawCastMember(
  ctx: CanvasRenderingContext2D,
  m: Placed,
  t: number,
  wind: number,
  seed: number,
  swell: number,
) {
  const W = m.def.width * m.scale;
  const L = m.def.length * m.scale;

  // she sits in the water, not on it
  ctx.save();
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = '#02121f';
  ctx.translate(m.x + W * 0.14, m.y + W * 0.24);
  ctx.rotate(m.a);
  ctx.beginPath();
  ctx.ellipse(0, 0, L * 0.54, W * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  drawWake(ctx, m, t, 0.35 + swell * 0.6);

  // the game's own sprite, posed and scaled to the card
  const ship = poseShip(m.def, m.a, m.sail);
  if (m.def.weapon === 'mechanical') ship.cannons = 0;
  ship.hp = m.def.hp * clamp(m.hp, 0.05, 1);
  ship.sinking = m.sink > 0 ? m.sink * 2.3 : -1;
  ship.vx = Math.cos(m.a) * m.def.speed * 0.7;
  ship.vy = Math.sin(m.a) * m.def.speed * 0.7;
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.scale(m.scale, m.scale);
  drawShip(ctx, ship, t, wind);
  ctx.restore();

  drawSinking(ctx, m, t);
  drawBurning(ctx, m, t, seed + Math.round(m.def.length));
}

// -------------------------------------------------------------- the logo plate

/** Draw small caps with real letter-spacing (canvas tracking is patchy). */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: 'left' | 'right' = 'left',
) {
  const chars = [...text];
  let total = 0;
  for (const c of chars) total += ctx.measureText(c).width + tracking;
  total -= tracking;
  let cx = align === 'right' ? x - total : x;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + tracking;
  }
  ctx.textAlign = prev;
}

/**
 * The biggest the era's name can be and still fit the plate: one line if it
 * can, two if it must.
 */
function fitTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  family: string,
): { lines: string[]; px: number } {
  const words = text.split(' ');
  const wrapAt = (px: number) => {
    ctx.font = `${px}px ${family}`;
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxW) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };
  const lh = 0.92;
  for (const maxLines of [1, 2]) {
    for (let px = Math.floor(maxH / (lh * maxLines)); px >= 9; px -= 1) {
      const lines = wrapAt(px);
      if (lines.length > maxLines) continue;
      if (lines.every((l) => ctx.measureText(l).width <= maxW)) return { lines, px };
    }
  }
  return { lines: [text], px: 9 };
}

/**
 * The plate across the bottom of the card: the era's name in gold, the emblem
 * of the age on a seal, and the year and the waters it is fought in.
 */
function paintBanner(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  spec: EraSceneSpec,
  e: EraShip,
  region: RegionDef,
) {
  const { w, h, banner, pad } = L;
  const y0 = h - banner;
  ctx.save();

  // the plate, with the era's own accent bleeding up from the left
  const g = ctx.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0, 'rgba(16,26,42,0.93)');
  g.addColorStop(0.5, 'rgba(8,15,26,0.96)');
  g.addColorStop(1, 'rgba(3,7,14,0.98)');
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, w, banner);
  const ag = ctx.createLinearGradient(0, y0, w * 0.75, h);
  ag.addColorStop(0, hexA(spec.accent[0], 0.5));
  ag.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ag;
  ctx.fillRect(0, y0, w, banner);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gg = ctx.createRadialGradient(pad * 3.4, y0 + banner * 0.5, 0, pad * 3.4, y0 + banner * 0.5, banner * 1.6);
  gg.addColorStop(0, hexA(spec.accent[1], 0.2));
  gg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gg;
  ctx.fillRect(0, y0, w, banner);
  ctx.restore();

  // rules and rivets along the top of the plate
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(0, y0, w, Math.max(2, banner * 0.028));
  ctx.fillStyle = 'rgba(245,197,66,0.4)';
  ctx.fillRect(0, y0 + Math.max(4, banner * 0.06), w, 1);
  ctx.fillStyle = 'rgba(255,225,150,0.45)';
  for (let x = pad; x < w - pad; x += Math.max(15, banner * 0.24)) {
    ctx.beginPath();
    ctx.arc(x, y0 + Math.max(1, banner * 0.014), Math.max(0.9, banner * 0.014), 0, TAU);
    ctx.fill();
  }

  // ---- the seal
  const r = banner * 0.29;
  const cx = pad + r;
  const cy = y0 + banner * 0.57;
  const sg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.2, cx, cy, r);
  sg.addColorStop(0, '#22344e');
  sg.addColorStop(1, '#080f1c');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = spec.accent[1];
  ctx.lineWidth = Math.max(1.4, banner * 0.024);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(245,197,66,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, TAU);
  ctx.stroke();
  drawEmblem(ctx, spec.emblem, cx, cy, r * 0.66, spec.accent[1], '#0b1424');

  // ---- the lettering
  const wide = w >= 520;
  const rightW = wide ? clamp(banner * 1.45, 118, w * 0.3) : 0;
  const tx = cx + r + pad * 1.1;
  const tw = Math.max(50, w - tx - pad - rightW - (wide ? 10 : 0));

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  const ribbon = wide ? spec.ribbon : `${spec.ribbon} · ${e.year}`;
  const ribbonPx = clamp(banner * 0.125, 7, 15);
  ctx.font = `italic ${ribbonPx}px ${FELL}`;
  ctx.fillStyle = 'rgba(255,226,154,0.9)';
  const ry = y0 + banner * 0.28;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 3;
  drawTracked(ctx, ribbon.toUpperCase(), tx, ry, ribbonPx * 0.2);
  ctx.restore();

  const title = fitTitle(ctx, e.era, tw, banner * 0.52, PIRATA);
  const lineH = title.px * 0.92;
  const titleTop = ry + Math.max(3, banner * 0.04);
  ctx.font = `${title.px}px ${PIRATA}`;
  ctx.lineJoin = 'round';
  title.lines.forEach((line, i) => {
    const y = titleTop + lineH * (i + 0.8);
    const lg = ctx.createLinearGradient(0, y - lineH, 0, y + lineH * 0.12);
    lg.addColorStop(0, '#fff6c4');
    lg.addColorStop(0.42, '#f5c542');
    lg.addColorStop(0.74, '#c8812a');
    lg.addColorStop(1, '#ffe9a4');
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = title.px * 0.14;
    ctx.shadowOffsetY = title.px * 0.05;
    ctx.strokeStyle = '#2a1408';
    ctx.lineWidth = Math.max(1.2, title.px * 0.085);
    ctx.strokeText(line, tx, y);
    ctx.fillStyle = lg;
    ctx.fillText(line, tx, y);
    ctx.restore();
  });

  // ---- the year and the waters, right-hand column
  if (wide) {
    const rx = w - pad;
    ctx.textAlign = 'right';
    const yearPx = clamp(banner * 0.3, 13, 34);
    ctx.font = `${yearPx}px ${PIRATA}`;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffd863';
    ctx.fillText(e.year, rx, y0 + banner * 0.46);
    ctx.restore();
    const seaPx = clamp(banner * 0.1, 6.5, 12);
    ctx.font = `${seaPx}px ${FELL}`;
    ctx.fillStyle = 'rgba(238,222,180,0.8)';
    drawTracked(ctx, region.name.toUpperCase(), rx, y0 + banner * 0.68, seaPx * 0.16, 'right');
    ctx.fillStyle = 'rgba(238,222,180,0.5)';
    drawTracked(ctx, e.group.toUpperCase(), rx, y0 + banner * 0.87, seaPx * 0.16, 'right');
    ctx.textAlign = 'left';
  }
  ctx.restore();
}

// ------------------------------------------------------------------ the card

/** Baked backdrops, by era and size — a handful at most, oldest first out. */
const statics = new Map<string, HTMLCanvasElement>();

/** Drop the baked backdrops (used when the artwork itself is changed). */
export function clearEraSceneCache() {
  statics.clear();
}

/**
 * Paint one era's card into `ctx`, sized in CSS px. `t` is seconds: the sea
 * moves, the guns keep firing, and the plate's lettering is repainted every
 * frame so a webfont that lands late still gets used.
 */
export function paintEraScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  e: EraShip,
  region: RegionDef,
  t: number,
  seed: number,
  dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1),
) {
  const spec = sceneFor(e.id);
  const L = layoutOf(w, h);
  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // ---- baked backdrop: sky, shore, the body of the sea
  const key = `${e.id}|${Math.round(w)}x${Math.round(h)}|${dpr}`;
  let layer = statics.get(key);
  if (!layer) {
    const [cv, c] = makeCanvas(w * dpr, h * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBackdrop(c, region, L, spec, seed);
    layer = cv;
    while (statics.size >= 3) {
      const oldest = statics.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      statics.delete(oldest);
    }
    statics.set(key, cv);
  }
  ctx.drawImage(layer, 0, 0, w, h);

  // ---- living water
  drawSwell(ctx, w, L.skyH, L.stage, t, spec.swell, spec.glitter ?? 0.3, spec.glow[0], seed * 5 + 2);

  // ---- the cast, far hulls first
  const cast = placeCast(spec, e.id, e.def, L, seed);
  const wind = spec.wind ?? (cast[0]?.a ?? -0.3) + 0.15;
  for (const m of [...cast].sort((p, q) => p.y - q.y)) {
    drawCastMember(ctx, m, t, wind, seed, spec.swell);
  }

  // ---- and what they are doing to each other
  spec.fx.forEach(([kind, from, to, cycle], i) => {
    const a = cast[from];
    const b = cast[to];
    if (!a || !b) return;
    drawFx(ctx, kind, a, b, t, cycle ?? 2.6, (seed * 131 + i * 7919) | 0, { w, h, wind });
  });

  // ---- weather over the water, then the things that move on it
  drawWeather(ctx, spec.weather, w, L.stage, t, seed * 29 + 7);
  for (const prop of spec.props ?? []) {
    if (prop !== 'shoreFire' && prop !== 'whirl' && prop !== 'wreck') continue;
    drawProp(ctx, prop, w, L.skyH, L.stage - L.skyH, t, seed * 17 + 91);
  }

  // ---- the logo plate
  paintBanner(ctx, L, spec, e, region);
  ctx.restore();
}
