// The Bit Squirrel start-up card, frame by frame.
//
// The mascot scampers in along the plate on the sting's eighth notes, skids,
// flicks its great tail and blinks; then the studio name stamps down one
// letter per beat and lands on the final chord. From there it is the still logo
// the card has always ended on — with the squirrel still breathing, blinking
// and flicking its tail, so the plate never looks like a dead bitmap.
//
// Everything here is pure maths on the pixel grid (no DOM, no timers), so the
// timeline can be reasoned about — and tested — on its own. `SplashScreen` only
// feeds it a clock and paints what comes back.

import { FONT, SQUIRREL, SQUIRREL_PALETTE, textWidth } from './pixels';

/** The studio name. */
export const TITLE = 'BIT SQUIRREL';

/** Sprite pixels are drawn `K`x`K` canvas pixels; the lettering stays 1x1. */
export const K = 2;
/** Margin around the plate, and the air between the name and the mascot. */
const PAD = 3;
const GAP = 6;

/** One eighth note of the sting (150 bpm). The whole card dances to this. */
export const BEAT = 200;
/** Hops the squirrel takes to reach its plate — one per eighth note. */
export const HOPS = 4;
/** The squirrel is on its plate here: skid, blink, tail flick. */
export const T_ARRIVE = BEAT * HOPS;
/** The name starts falling: one letter per beat... */
export const T_STAMP = T_ARRIVE + BEAT;
/** ...so the last letter lands on the sting's big final chord. */
export const T_LOGO = T_STAMP + (TITLE.length - 1) * BEAT;
/** A letter takes this long to fall the last few rows onto the plate. */
export const LETTER_DROP = 120;
/** The proud hop the mascot does once the name is down. */
export const T_POUSE = T_LOGO + 200;
/** The card is at rest from here on: the still logo, gently alive. */
export const T_SETTLED = T_POUSE + 340;

export interface LogoLayout {
  /** Intrinsic size of the plate canvas, in canvas pixels. */
  w: number;
  h: number;
  /** Where the name and the mascot sit when nothing moves. */
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  /** Sprite size in canvas pixels. */
  sw: number;
  sh: number;
}

/** The plate's one honest size: name, mascot and padding, nothing else. */
export function logoLayout(): LogoLayout {
  const tw = textWidth(TITLE);
  const sw = SQUIRREL[0].length * K;
  const sh = SQUIRREL.length * K;
  const w = Math.max(tw, sw) + PAD * 2 + 1;
  const h = PAD + 7 + GAP + sh + PAD;
  return {
    w,
    h,
    tx: Math.floor((w - tw) / 2),
    ty: PAD,
    sx: Math.floor((w - sw) / 2),
    sy: PAD + 7 + GAP,
    sw,
    sh,
  };
}

// --------------------------------------------------------------- sprite edits

/**
 * The tail plume, row by row: the last sprite column that still belongs to the
 * tail and not to the head or the back. Above row 12 the plume is
 * free-standing and can lean whole; below it the fur is fused into the body, so
 * the window narrows and the lean fades out.
 */
const TAIL_ROWS: [first: number, last: number, maxCol: number][] = [
  [0, 11, 18],
  [12, 15, 16],
  [16, 16, 15],
];

function tailMaxCol(y: number): number {
  for (const [a, b, max] of TAIL_ROWS) if (y >= a && y <= b) return max;
  return -1;
}

/** How much of the lean reaches a row: the tip swings, the root barely moves. */
function tailLean(y: number, t: number): number {
  if (y <= 6) return t;
  if (y <= 11) return Math.round(t * 0.7);
  if (y <= 16) return Math.round(t * 0.35);
  return 0;
}

/** A blink is the lid in the outline colour, the white of the eye gone. */
const LID: Record<string, string> = { E: 'K', W: 'R' };

const gridCache = new Map<string, string[]>();

/**
 * The mascot with its plume leaning by `tail` sprite pixels and its eyes shut
 * when `blink`. With `tail = 0, blink = false` the sprite comes back untouched.
 */
export function squirrelGrid(tail = 0, blink = false): string[] {
  if (!tail && !blink) return SQUIRREL;
  const key = `${tail}:${blink ? 1 : 0}`;
  const cached = gridCache.get(key);
  if (cached) return cached;
  const rows = SQUIRREL.map((row, y) => {
    const lean = tailLean(y, tail);
    const max = tailMaxCol(y);
    let out = row;
    if (lean && max >= 0) {
      const cells = [...row];
      for (let x = 0; x <= max; x++) {
        const from = x - lean;
        cells[x] = from >= 0 && from < row.length ? row[from] : '.';
      }
      out = cells.join('');
    }
    if (blink && (y === 11 || y === 12)) {
      const cells = [...out];
      for (let x = 27; x <= 28; x++) if (LID[cells[x]]) cells[x] = LID[cells[x]];
      out = cells.join('');
    }
    return out;
  });
  gridCache.set(key, rows);
  return rows;
}

// ------------------------------------------------------------------- the clock

export interface Spark {
  x: number;
  y: number;
  c: string;
  /** Size in canvas pixels — one sprite pixel by default. */
  s?: number;
}

export interface SplashFrame {
  /** Where the mascot is, as an offset from its resting slot. */
  dx: number;
  dy: number;
  /** -2..2: how far the tail plume is leaning. */
  tail: number;
  blink: boolean;
  /** Drop progress of each letter of the name: 0 = not yet, 1 = landed. */
  letters: number[];
  /** Loose pixels: dust under the feet, glints and sparks on the hit. */
  fx: Spark[];
  /** True when the name is fully down: the still logo. */
  done: boolean;
}

const mod = (v: number, m: number) => ((v % m) + m) % m;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
/** Sprite-quantised: motion always lands on the pixel grid, never between it. */
const snap = (v: number) => Math.round(v / K) * K;

const DUST = ['#c9a168', '#8d6a3c', '#e6cfa0'];
/**
 * Three twinkling sets, in plate pixels, thrown in the empty air around the
 * name on the final chord — they never land on the art itself.
 */
const SPARK_SETS: [number, number][][] = [
  [
    [12, 12],
    [60, 13],
    [36, 11],
    [4, 30],
  ],
  [
    [4, 11],
    [68, 12],
    [46, 13],
    [71, 34],
  ],
  [
    [24, 13],
    [54, 11],
    [2, 48],
    [72, 50],
  ],
];

/** A chip-art twinkle: a 3x3 heart with one-pixel arms. */
function star(frame: SplashFrame, x: number, y: number, c: string): void {
  frame.fx.push(
    { x, y: y + 1, c, s: 1 },
    { x: x + 1, y, c, s: 1 },
    { x: x + 1, y: y + 1, c, s: 3 },
    { x: x + 1, y: y + 2, c, s: 1 },
    { x: x + 2, y: y + 1, c, s: 1 },
  );
}

/** How far a letter is above the plate at drop progress `p` (1 = landed). */
export function letterOffset(p: number): number {
  if (p <= 0) return -999;
  if (p >= 1) return 0;
  if (p > 0.66) return -3;
  if (p > 0.33) return -6;
  return -9;
}

/** The squirrel's own little loop: breath, blink, tail. Never quite still. */
function idle(ms: number): { dy: number; tail: number; blink: boolean } {
  const flick = mod(ms, 2300);
  const tail = flick < 110 ? 2 : flick < 230 ? -2 : flick < 340 ? 1 : 0;
  const blink = ms > 260 && mod(ms - 260, 1250) < 130;
  const dy = mod(ms, 3400) < 360 ? -K : 0; // a slow hitch of the whole sprite, one pixel row
  return { dy, tail, blink };
}

/**
 * Dust kicked up at a landing: a few pixels behind the heels, thrown on both
 * sides when the mascot is skidding to a halt on its plate.
 */
function puff(
  frame: SplashFrame,
  L: LogoLayout,
  t: number,
  dx: number,
  from: number,
  to: number,
  bothSides = false,
): void {
  for (let h = from; h <= to; h++) {
    const age = t - ((h + 1) * BEAT - 90);
    if (age < 0 || age > 200) continue;
    const rise = age < 100 ? 0 : 1;
    const side = bothSides ? [0, 1] : [0];
    for (const s of side) {
      for (let d = 0; d < 3; d++) {
        const back = s ? L.sx + dx + L.sw + K * d : L.sx + dx - K * (d + 1);
        frame.fx.push({
          x: Math.max(0, Math.min(L.w - K, back)),
          y: L.sy + L.sh - K * 2 - rise * (K + d * K),
          c: DUST[(h + d) % DUST.length],
        });
      }
    }
  }
}

/**
 * The frame `t` milliseconds after the sting starts.
 *
 * With `withTitle` off the name is never drawn: that is the "press any key"
 * card, where the mascot sits on an empty plate and stays alive.
 */
export function splashFrame(t: number, withTitle = true): SplashFrame {
  const L = logoLayout();
  const frame: SplashFrame = {
    dx: 0,
    dy: 0,
    tail: 0,
    blink: false,
    letters: TITLE.split('').map(() => 0),
    fx: [],
    done: false,
  };

  // ---- waiting for a press: the mascot sits on its empty plate and stays alive
  if (!withTitle) {
    const rest = idle(t);
    frame.dy = rest.dy;
    frame.tail = rest.tail;
    frame.blink = rest.blink;
    return frame;
  }

  // ---- the entrance: four hops, one per eighth note, dust at every landing
  if (t < T_ARRIVE) {
    const g = clamp01(t / T_ARRIVE);
    frame.dx = snap(-L.sw * 1.15 * (1 - easeOut(g)));
    frame.dy = -snap(8 * Math.abs(Math.sin((Math.PI * t) / BEAT)));
    const hop = Math.floor(t / BEAT);
    frame.tail = hop % 2 === 0 ? 2 : -1;
    puff(frame, L, t, frame.dx, hop, hop);
    return frame;
  }

  // ---- the settle: a squat on landing, then a look about
  if (t < T_STAMP) {
    const s = t - T_ARRIVE;
    frame.dy = s < 90 ? K : 0;
    frame.blink = s > 150 && s < 300;
    frame.tail = s < 150 ? 2 : s > 320 ? -2 : 0;
    puff(frame, L, t, 0, HOPS - 1, HOPS - 1, true); // the skid throws it both ways
  } else {
    const rest = idle(t - T_STAMP);
    frame.dy = rest.dy;
    frame.tail = rest.tail;
    frame.blink = rest.blink;
  }

  // ---- the name: one letter per beat, falling onto the plate in three steps
  for (let i = 0; i < TITLE.length; i++) {
    frame.letters[i] = clamp01((t - (T_STAMP + i * BEAT)) / LETTER_DROP);
  }
  frame.done = t >= T_LOGO + LETTER_DROP;

  // ---- the last chord: the mascot hops with pride and the plate throws sparks
  const since = t - T_POUSE;
  if (since >= 0 && since < 340) {
    const p = since / 340;
    frame.dy = -snap(7 * Math.sin(Math.PI * p));
    frame.tail = p < 0.5 ? -2 : 2;
    frame.blink = false;
    for (const [sx, sy] of SPARK_SETS[Math.floor(since / 110) % SPARK_SETS.length]) star(frame, sx, sy, '#fff3c8');
    // and a shine rolls across the acorn it is clutching
    const glint = since < 120 ? 21 : since < 230 ? 23 : 25;
    frame.fx.push({ x: L.sx + frame.dx + glint * K, y: L.sy + frame.dy + 18 * K, c: '#fff6d8' });
    frame.fx.push({ x: L.sx + frame.dx + (glint + 1) * K, y: L.sy + frame.dy + 20 * K, c: '#ffffff' });
  }
  return frame;
}

/** The still the card ends on: the logo, with nothing moving. */
export function restFrame(): SplashFrame {
  return {
    dx: 0,
    dy: 0,
    tail: 0,
    blink: false,
    letters: TITLE.split('').map(() => 1),
    fx: [],
    done: true,
  };
}

// ---------------------------------------------------------------------- paint

/** Banded 8-bit title colours, top row to bottom row of the 7-pixel glyphs. */
const TITLE_BANDS = ['#fff6d0', '#ffe39a', '#ffc85a', '#ffa23a', '#f5782c', '#dc5220', '#b0341a'];
const TITLE_SHADOW = '#5a1408';

/** Draw the name with the tiny bitmap font, each letter at its own height. */
function paintTitle(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  letters: number[],
  color: (row: number) => string,
) {
  let x = x0;
  let i = 0;
  for (const ch of TITLE) {
    const g = FONT[ch] ?? FONT[' '];
    const dy = letterOffset(letters[i++] ?? 0);
    if (dy > -900) {
      g.forEach((row, ry) => {
        for (let rx = 0; rx < row.length; rx++) {
          if (row[rx] !== 'X') continue;
          ctx.fillStyle = color(ry);
          ctx.fillRect(x + rx, y0 + dy + ry, 1, 1);
        }
      });
    }
    x += g[0].length + 1;
  }
}

/**
 * Paint a frame into the plate canvas. The canvas is the plate's own size, so
 * CSS does the upscaling with `image-rendering: pixelated`.
 */
export function paintSplashFrame(cv: HTMLCanvasElement, f: SplashFrame): void {
  const L = logoLayout();
  if (cv.width !== L.w || cv.height !== L.h) {
    cv.width = L.w;
    cv.height = L.h;
  }
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, L.w, L.h);

  // the name: drop shadow first, then the colour bands
  paintTitle(ctx, L.tx + 1, L.ty + 1, f.letters, () => TITLE_SHADOW);
  paintTitle(ctx, L.tx, L.ty, f.letters, (ry) => TITLE_BANDS[ry]);

  // the mascot
  const grid = squirrelGrid(f.tail, f.blink);
  const ox = L.sx + f.dx;
  const oy = L.sy + f.dy;
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const c = SQUIRREL_PALETTE[row[x]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(ox + x * K, oy + y * K, K, K);
    }
  }

  // dust, sparks, glints
  for (const s of f.fx) {
    ctx.fillStyle = s.c;
    ctx.fillRect(s.x, s.y, s.s ?? K, s.s ?? K);
  }
}
