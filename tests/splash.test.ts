// The start-up card: the squirrel's little animation must end on the still
// logo the card has always shown, and it must keep time with the sting.

import assert from 'node:assert/strict';
import test from 'node:test';
import { FONT, SQUIRREL, SQUIRREL_PALETTE, textWidth } from '../src/game/splash/pixels.ts';
import { FANFARE_HIT } from '../src/game/splash/fanfare.ts';
import {
  BEAT,
  LETTER_DROP,
  TITLE,
  logoLayout,
  paintSplashFrame,
  restFrame,
  squirrelGrid,
  splashFrame,
  T_ARRIVE,
  T_LOGO,
  T_STAMP,
  T_SETTLED,
} from '../src/game/splash/anim.ts';

/** A canvas that only records fillRect, so the painter can run headless. */
function fakeCanvas() {
  const px = new Map<string, string>();
  const L = logoLayout();
  const ctx: any = {
    imageSmoothingEnabled: true,
    fillStyle: '#000',
    clearRect: () => undefined,
    fillRect(x: number, y: number, w: number, h: number) {
      for (let a = Math.floor(y); a < Math.ceil(y + h); a++) {
        for (let b = Math.floor(x); b < Math.ceil(x + w); b++) {
          if (b < 0 || a < 0 || b >= L.w || a >= L.h) continue;
          px.set(`${b},${a}`, ctx.fillStyle);
        }
      }
    },
  };
  const cv: any = { width: L.w, height: L.h, getContext: () => ctx };
  return { cv, px };
}

/** The card as it always ended: banded name over the untouched sprite. */
function paintStillLogo(px: Map<string, string>) {
  const L = logoLayout();
  const BANDS = ['#fff6d0', '#ffe39a', '#ffc85a', '#ffa23a', '#f5782c', '#dc5220', '#b0341a'];
  const put = (x: number, y: number, c: string) => {
    if (x < 0 || y < 0 || x >= L.w || y >= L.h) return;
    px.set(`${x},${y}`, c);
  };
  let x = L.tx + 1;
  for (const ch of TITLE) {
    const g = (FONT as any)[ch] ?? (FONT as any)[' '];
    g.forEach((row: string, ry: number) => {
      for (let rx = 0; rx < row.length; rx++) if (row[rx] === 'X') put(x + rx, L.ty + 1 + ry, '#5a1408');
    });
    x += g[0].length + 1;
  }
  x = L.tx;
  for (const ch of TITLE) {
    const g = (FONT as any)[ch] ?? (FONT as any)[' '];
    g.forEach((row: string, ry: number) => {
      for (let rx = 0; rx < row.length; rx++) if (row[rx] === 'X') put(x + rx, L.ty + ry, BANDS[ry]);
    });
    x += g[0].length + 1;
  }
  SQUIRREL.forEach((row, y) => {
    for (let i = 0; i < row.length; i++) {
      const c = SQUIRREL_PALETTE[row[i]];
      if (!c) continue;
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) put(L.sx + i * 2 + a, L.sy + y * 2 + b, c);
    }
  });
  return px;
}

const dump = (m: Map<string, string>) =>
  [...m.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');

test('the resting plate is the still logo, pixel for pixel', () => {
  const { cv, px } = fakeCanvas();
  paintSplashFrame(cv, restFrame());
  assert.equal(dump(px), dump(paintStillLogo(new Map())), 'the settled card is the logo it has always ended on');
  const L = logoLayout();
  assert.equal(cv.width, L.w);
  assert.equal(cv.height, L.h);
  assert.equal(L.w, Math.max(textWidth(TITLE), SQUIRREL[0].length * 2) + 7);
});

test('the squirrel sprite is untouched when it is not moving', () => {
  assert.equal(squirrelGrid(0, false), SQUIRREL);
  const lean = squirrelGrid(2, false);
  assert.notEqual(lean.join('\n'), SQUIRREL.join('\n'), 'a lean must move the plume');
  // the head and the acorn are never dragged along with the tail
  SQUIRREL.forEach((row, y) => {
    for (let x = 19; x < row.length; x++) assert.equal(lean[y][x], row[x], `head pixel ${x},${y} must not move`);
  });
  const blink = squirrelGrid(0, true);
  assert.equal(blink[11][27], 'K', 'the lid closes over the eye');
  assert.equal(blink[11][28], 'R', 'the glint is gone');
  assert.equal(blink[20], SQUIRREL[20], 'the rest of the squirrel is as it was');
});

test('the name stamps in one letter per beat, and only after the arrival', () => {
  const down = (t: number) => splashFrame(t).letters.filter((p) => p > 0).length;
  assert.equal(down(T_ARRIVE), 0, 'nothing of the name while the squirrel still hops');
  assert.equal(down(T_STAMP - 1), 0, 'the name has not begun before the stamp');
  assert.equal(down(T_STAMP + LETTER_DROP), 1, 'the first beat of the stamp drops one letter');
  assert.equal(down(T_STAMP + 3 * BEAT + LETTER_DROP), 4);
  for (let t = 0; t <= T_LOGO + LETTER_DROP; t += 20) {
    const f = splashFrame(t);
    for (let i = 1; i < f.letters.length; i++) {
      assert.ok(f.letters[i] <= f.letters[i - 1], `letter ${i} may not land before letter ${i - 1}`);
    }
  }
  assert.equal(splashFrame(T_LOGO - BEAT).done, false, 'the logo is not the logo yet');
  assert.equal(splashFrame(T_LOGO + LETTER_DROP).done, true, 'the last letter has landed');
});

test('the last letter lands on the sting’s final chord', () => {
  assert.equal(T_LOGO, FANFARE_HIT * 1000, 'the name completes exactly on the big chord');
});

test('the waiting card is the mascot alone, alive on an empty plate', () => {
  for (const t of [0, 400, 1200, 2600, 9000]) {
    const f = splashFrame(t, false);
    assert.deepEqual(f.letters, TITLE.split('').map(() => 0), 'no name while it waits for a press');
    assert.equal(f.done, false);
    assert.equal(f.fx.length, 0, 'no dust, no sparks');
  }
  const alive = [0, 1200, 2300, 3000, 5000, 7000].map((t) => splashFrame(t, false));
  assert.ok(alive.some((f) => f.blink || f.tail !== 0 || f.dy !== 0), 'the mascot fidgets: not a dead bitmap');
});

test('the settled card breathes, but keeps returning to the still', () => {
  let fidgeted = 0;
  let rested = 0;
  for (let t = T_SETTLED; t < T_SETTLED + 4000; t += 30) {
    const f = splashFrame(t);
    assert.equal(f.done, true, 'the name stays down');
    assert.equal(f.fx.length, 0, 'the sparks are spent: the plate is clean');
    assert.ok(Math.abs(f.dx) <= 1 && Math.abs(f.dy) <= 2, 'the squirrel stays on its plate');
    assert.ok(Math.abs(f.tail) <= 2);
    if (f.dx === 0 && f.dy === 0 && f.tail === 0 && !f.blink) rested++;
    else fidgeted++;
  }
  assert.ok(fidgeted > 8, 'the squirrel keeps moving after the stamp');
  assert.ok(rested > fidgeted, 'and it rests more than it fidgets');
});
