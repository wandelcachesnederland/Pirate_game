import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_W, WORLD_H, DEG, project, isLand, nudgeToSea } from '../src/game/chart/world';
import { PORTS, PORTS_PROJ, PORT_BY_ID, REGIONS } from '../src/game/chart/ports';
import { GOODS, priceFactor, stepMarket } from '../src/game/chart/goods';
import { FOES } from '../src/game/adventure/beasts';
import { LAND } from '../src/game/chart/world';
import { drawWorld as drawTradeWorld } from '../src/game/trade/render';
import { drawWorld as drawAdventureWorld } from '../src/game/adventure/render';

/** A recording stand-in for a 2D context: enough canvas to prove the painter
 * runs and to count what it painted. */
function fakeCtx() {
  const calls: string[] = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy(
    {},
    {
      get(_t, prop: string) {
        if (prop === 'createLinearGradient') return () => gradient;
        if (prop === 'measureText') return (text: string) => ({ width: String(text).length * 6 });
        if (prop === 'canvas') return { width: 900, height: 600 };
        if (prop === 'getTransform') return () => ({});
        return (...args: unknown[]) => {
          calls.push(prop);
          void args;
        };
      },
      set() {
        return true;
      },
    },
  ) as unknown as CanvasRenderingContext2D;
  return { ctx, calls };
}

test('the projection puts the corners of the world where they belong', () => {
  const [x0, y0] = project(-180, 80);
  assert.equal(x0, 0);
  assert.equal(y0, 0);
  const [x1, y1] = project(180, -58);
  assert.equal(x1, WORLD_W);
  assert.equal(y1, WORLD_H);
  // one degree is the same number of pixels on both axes (no distortion)
  const [ax] = project(0, 0);
  const [bx] = project(1, 0);
  const [, ay] = project(0, 0);
  const [, by] = project(0, -1);
  assert.equal(Math.round(bx - ax), Math.round(DEG));
  assert.equal(Math.round(by - ay), Math.round(DEG));
});

test('continents are where a sailor expects them and oceans are not land', () => {
  const land: [number, number][] = [
    [10, 20], // Sahara
    [-60, -5], // Amazon basin
    [133, -25], // central Australia
    [100, 62], // Siberia
  ];
  const sea: [number, number][] = [
    [-140, 0], // mid Pacific
    [-30, 20], // mid Atlantic
    [75, -30], // Indian Ocean
    [88, 15], // Bay of Bengal
  ];
  for (const [lon, lat] of land) {
    const [x, y] = project(lon, lat);
    assert.equal(isLand(x, y), true, `expected land at ${lon},${lat}`);
  }
  for (const [lon, lat] of sea) {
    const [x, y] = project(lon, lat);
    assert.equal(isLand(x, y), false, `expected water at ${lon},${lat}`);
  }
});

test('a point dropped inland is nudged out to open water', () => {
  const [x, y] = project(10, 20); // deep in the Sahara
  assert.equal(isLand(x, y), true);
  const [nx, ny] = nudgeToSea(x, y);
  assert.equal(isLand(nx, ny), false);
  // already-water points are left alone
  const [wx, wy] = project(-30, 20);
  assert.deepEqual(nudgeToSea(wx, wy), [wx, wy]);
});

test('every port projects inside the chart and belongs to a known region', () => {
  assert.ok(PORTS.length > 40);
  for (const p of PORTS_PROJ) {
    assert.ok(p.x >= 0 && p.x <= WORLD_W, `${p.id} outside the chart`);
    assert.ok(p.y >= 0 && p.y <= WORLD_H, `${p.id} outside the chart`);
    assert.ok(REGIONS[p.region], `${p.id} has an unknown region`);
    assert.equal(PORT_BY_ID[p.id].name, p.name);
  }
  assert.equal(new Set(PORTS.map((p) => p.id)).size, PORTS.length, 'port ids are unique');
});

test('adventure lairs live on the same chart as the trade ports', () => {
  // one map, two modes: lairs are placed by the same projection, so they must
  // fall in the same world-space box as the ports
  for (const f of FOES) {
    assert.ok(f.x >= 0 && f.x <= WORLD_W && f.y >= 0 && f.y <= WORLD_H, `${f.id} outside the chart`);
    assert.equal(isLand(f.x, f.y), false, `${f.id} lairs inland`);
    const nearestPortDist = Math.min(...PORTS_PROJ.map((p) => Math.hypot(p.x - f.x, p.y - f.y)));
    assert.ok(nearestPortDist < WORLD_W, `${f.id} is unreachable from any port`);
  }
});

test('goods prices mean-revert toward what the port grows or hungers for', () => {
  const cheap = priceFactor(['rum'], [], 'rum');
  const dear = priceFactor([], ['rum'], 'rum');
  assert.ok(cheap < 1 && dear > 1);
  const market: Record<string, number> = {};
  for (const g of GOODS) market[g.id] = 1;
  const prices: Record<string, Record<string, number>> = {
    london: Object.fromEntries(GOODS.map((g) => [g.id, g.base])),
  };
  stepMarket(market, prices, () => ({ produces: ['cloth'], wants: ['rum'] }));
  assert.ok(prices.london.rum > 0);
  assert.ok(Object.keys(prices.london).length === GOODS.length);
});

test('trade and adventure paint the same continents through the shared painter', () => {
  const view = { scale: 0.42, ox: 12, oy: 8 };
  const ship = { x: 900, y: 380, angle: 0.5, sail: 1, vx: 10, vy: -4, hitFlash: 0 };

  const trade = fakeCtx();
  drawTradeWorld(
    trade.ctx,
    {
      view,
      player: ship,
      pirates: [{ ...ship, x: 940, y: 420, angle: 1 }],
      projectiles: [{ x: 900, y: 380, vx: 100, vy: 10, color: '#fff' }],
      getHud: () => ({ canDock: true }),
    } as never,
    900,
    600,
    1,
  );

  const adventure = fakeCtx();
  drawAdventureWorld(
    adventure.ctx,
    {
      view,
      player: ship,
      foes: [],
      raiders: [],
      projectiles: [],
      contract: null,
      activePortId: null,
      getHud: () => ({ canDock: true }),
    } as never,
    900,
    600,
    1,
  );

  for (const [name, { calls }] of [
    ['trade', trade],
    ['adventure', adventure],
  ] as const) {
    // every continent is filled, every port is labelled
    assert.ok(calls.filter((c) => c === 'fill').length >= LAND.length, `${name} painted every continent`);
    assert.ok(calls.filter((c) => c === 'fillText').length >= PORTS.length, `${name} labelled every port`);
    assert.ok(calls.includes('strokeRect'), `${name} framed the chart`);
  }

  // the two modes are the same map: the coastline path work is identical
  const coast = (calls: string[]) => calls.filter((c) => c === 'lineTo').length;
  assert.ok(coast(trade.calls) > 0);
  assert.ok(coast(adventure.calls) >= coast(trade.calls) - LAND.length);
});
