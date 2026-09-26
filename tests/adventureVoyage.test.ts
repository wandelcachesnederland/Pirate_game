import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdventureEngine } from '../src/game/adventure/engine';
import { FOES, FOE_BY_ID } from '../src/game/adventure/beasts';
import { PORTS_PROJ } from '../src/game/chart/ports';
import { nudgeToSea, project } from '../src/game/chart/world';

/**
 * Sail a whole Adventure voyage with the real update loop and a mocked canvas,
 * so the wiring (loop, input, rendering, saving) is exercised end to end
 * without a browser.
 */
interface Harness {
  eng: AdventureEngine;
  step: (frames: number, dtMs?: number) => void;
  store: Map<string, string>;
  phases: string[];
}

function voyage(saved?: Map<string, string>): Harness {
  const store = saved ?? new Map<string, string>();
  const fakeLocalStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  const gradient = { addColorStop() {} };
  const ctx = new Proxy(
    {},
    {
      get(_t, prop: string) {
        if (prop === 'createLinearGradient') return () => gradient;
        if (prop === 'measureText') return (text: string) => ({ width: String(text).length * 6 });
        if (prop === 'canvas') return { width: 900, height: 600 };
        return () => undefined;
      },
      set: () => true,
    },
  ) as unknown as CanvasRenderingContext2D;
  const canvas = {
    clientWidth: 900,
    clientHeight: 600,
    width: 900,
    height: 600,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;

  let pending: ((t: number) => void) | null = null;
  let now = 0;
  const g = globalThis as Record<string, unknown>;
  const previous = { window: g.window, raf: g.requestAnimationFrame, caf: g.cancelAnimationFrame };
  g.window = {
    addEventListener() {},
    removeEventListener() {},
    localStorage: fakeLocalStorage,
    devicePixelRatio: 1,
    innerWidth: 900,
    innerHeight: 600,
  };
  g.requestAnimationFrame = (cb: (t: number) => void) => {
    pending = cb;
    return 1;
  };
  g.cancelAnimationFrame = () => {
    pending = null;
  };

  const phases: string[] = [];
  const eng = new AdventureEngine(canvas, { onPhase: (p) => phases.push(p) });
  const step = (frames: number, dtMs = 50) => {
    for (let i = 0; i < frames; i++) {
      const cb = pending;
      pending = null;
      if (!cb) break;
      now += dtMs;
      cb(now);
    }
  };
  const restore = () => {
    g.window = previous.window;
    g.requestAnimationFrame = previous.raf;
    g.cancelAnimationFrame = previous.caf;
  };
  // keep the harness tidy for the next test
  queueMicrotask(restore);
  return { eng, step, store, phases, ...{ restore } } as Harness & { restore: () => void };
}

test('a voyage sails: the ship makes way, days pass, and every frame renders', () => {
  const { eng, step } = voyage();
  // the empty South Pacific, so the test measures sailing and nothing else
  const [px, py] = project(-110, -50);
  eng.player.x = px;
  eng.player.y = py;
  eng.player.angle = Math.PI; // due west, a long clear reach
  const start = { x: eng.player.x, y: eng.player.y };
  eng.input.down.add('KeyW'); // sheets home
  step(400); // twenty seconds of sailing
  const moved = Math.hypot(eng.player.x - start.x, eng.player.y - start.y);
  assert.ok(moved > 350, `the ship should make way (moved ${moved.toFixed(0)})`);
  assert.ok(eng.stats.days > 1, 'and the days tick by');
  assert.ok(eng.player.sail > 0.5, 'the sails are full');
  assert.equal(eng.phase, 'sailing');
  assert.ok(!Number.isNaN(eng.player.x) && !Number.isNaN(eng.player.y));
  eng.destroy();
});

test('sailing into a lair wakes it, and the prize is paid when it dies', () => {
  const { eng, step } = voyage();
  const lair = FOE_BY_ID['gulper'];
  eng.player.x = lair.x;
  eng.player.y = lair.y - 60; // inside its reach
  const before = eng.renown + eng.salvage;
  step(10);
  const woken = eng.foes.find((f) => f.def.id === 'gulper');
  assert.ok(woken, 'the lair is in the chart');
  assert.equal(woken!.awake, true, 'it woke when we sailed in');
  assert.ok(
    eng.messages.some((m) => m.text.includes('Brine Gulper')),
    'and named itself',
  );
  // finish it: the engine pays out on death, contract or not
  woken!.hp = 0;
  step(2);
  assert.ok(!eng.foes.some((f) => f.def.id === 'gulper'), 'the lair is empty');
  assert.ok(eng.renown + eng.salvage > before, 'renown and salvage were paid');
  eng.destroy();
});

test('a port takes a ship in, refits her and sends her out again', () => {
  const { eng, step } = voyage();
  const port = PORTS_PROJ.find((p) => p.id === 'portroyal')!;
  const [sx, sy] = nudgeToSea(port.x, port.y);
  eng.player.x = sx;
  eng.player.y = sy;
  eng.player.vx = 0;
  eng.player.vy = 0;
  eng.input.boardQueued = true;
  step(2);
  assert.equal(eng.phase, 'docked', 'the F key puts you in');
  assert.equal(eng.activePortId, 'portroyal');

  eng.salvage = 4000; // a hold full of salvage from earlier prizes
  eng.player.hp = 60;
  const damageBefore = eng.player.damage;
  eng.repair();
  assert.equal(eng.player.hp, eng.player.maxHp, 'the shipwrights work');
  assert.equal(eng.buyRefit('guns'), true, 'salvage buys heavier guns');
  assert.equal(eng.player.damage, damageBefore + 1);

  eng.takeContract();
  assert.ok(eng.contract, 'a contract is signed at the board');

  eng.undock();
  assert.equal(eng.phase, 'sailing');
  step(20);
  assert.equal(eng.phase, 'sailing', 'she sails on');
  eng.destroy();
});

test('raiders find a famous captain and pay in salvage when sunk', () => {
  const { eng, step } = voyage();
  eng.renown = 800;
  eng.spawnTimer = 0.01;
  // step long enough for raiders to appear and close
  for (let i = 0; i < 2000 && eng.raiders.length === 0; i++) step(1);
  assert.ok(eng.raiders.length > 0, 'someone came looking');
  const raider = eng.raiders[0];
  const salvageBefore = eng.salvage;
  raider.hp = 0;
  step(2);
  assert.ok(eng.salvage > salvageBefore, 'the prize is stripped');
  assert.equal(eng.stats.raiders, 1);
  eng.destroy();
});

test('clearing every lair wins the chart', () => {
  const { eng, step } = voyage();
  for (const def of FOES) {
    const f = eng.foes.find((x) => x.def.id === def.id);
    if (!f) continue;
    f.hp = 0;
    step(1);
  }
  assert.equal(eng.foes.length, 0);
  assert.equal(eng.phase, 'victory');
  assert.equal(eng.stats.felled, FOES.length);
  assert.ok(eng.messages.some((m) => m.text.includes('chart is yours')));
  eng.destroy();
});

test('losing the hull ends the voyage and clears the save', () => {
  const { eng, step, store } = voyage();
  eng.salvage = 999;
  eng.save();
  assert.ok(store.has('broadside.adventure.v1'));
  eng.player.hp = 0;
  step(2);
  assert.equal(eng.phase, 'over');
  assert.equal(store.has('broadside.adventure.v1'), false, 'the voyage is over, the slate is wiped');
  eng.destroy();
});

test('a voyage can be left in port and taken up again', () => {
  const first = voyage();
  first.eng.renown = 777;
  first.eng.salvage = 1234;
  first.eng.defeated.add('gulper');
  first.eng.phase = 'docked';
  const hullCost = first.eng.refitCost('hull')!;
  assert.equal(first.eng.buyRefit('hull'), true);
  first.eng.save();
  first.eng.destroy();

  const second = voyage(first.store);
  assert.equal(second.eng.renown, 777, 'renown carried over');
  assert.equal(second.eng.salvage, 1234 - hullCost, 'salvage carried over');
  assert.equal(second.eng.refits.hull, 1, 'the refit carried over');
  assert.equal(second.eng.foes.some((f) => f.def.id === 'gulper'), false, 'a crossed-off name stays crossed off');
  assert.equal(second.eng.foes.length, FOES.length - 1);
  assert.equal(second.eng.player.maxHp, 165, 'the reinforced hull is still there');
  second.eng.destroy();
});

test('a finished chart is not a save: you start a fresh voyage instead', () => {
  const dead = new Map<string, string>([
    [
      'broadside.adventure.v1',
      JSON.stringify({
        renown: 5000,
        salvage: 9000,
        defeated: FOES.map((f) => f.id),
        x: 100,
        y: 100,
        hp: 140,
        maxHp: 140,
      }),
    ],
  ]);
  const { eng } = voyage(dead);
  assert.equal(eng.foes.length, FOES.length, 'the chart is repopulated');
  assert.equal(eng.renown, 0);
  eng.destroy();
});

test('the starting berth is clear of every lair', () => {
  const { eng } = voyage();
  const port = PORTS_PROJ.find((p) => p.id === 'portroyal')!;
  const [sx, sy] = nudgeToSea(port.x, port.y);
  const d = Math.hypot(eng.player.x - sx, eng.player.y - sy);
  assert.ok(d < 120, `you berth at your home port (${d.toFixed(0)})`);
  for (const f of eng.foes) {
    const gap = Math.hypot(f.x - eng.player.x, f.y - eng.player.y);
    assert.ok(gap > 120, `${f.def.id} should not wake before you have sailed (${gap.toFixed(0)})`);
  }
  eng.destroy();
});

test('a lair holds its water: nothing wakes on its own across a long voyage', () => {
  const { eng, step } = voyage();
  // park in the middle of the Pacific and let the world turn
  const [x, y] = project(-140, 0);
  eng.player.x = x;
  eng.player.y = y;
  eng.input.down.add('KeyW');
  step(600);
  assert.ok(
    eng.foes.every((f) => f.awake === false),
    'lairs only wake when you sail into them',
  );
  eng.destroy();
});
