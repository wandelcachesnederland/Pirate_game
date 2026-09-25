import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Engine } from '../src/game/engine';
import { ERA_FLAGSHIPS, ERA_SHIPS } from '../src/game/ships/era';
import { usesGunpowder } from '../src/game/weapons';
import { wildIsland } from '../src/game/settlements';
import type { EraId } from '../src/game/types';

/** Exercise real combat methods without starting a DOM/canvas animation loop.
 * Private members are deliberately accessible in this test-only harness. */
function harness(era: EraId = 'roman') {
  const e = Object.create(Engine.prototype) as any;
  const sounds: string[] = [];
  const particles: number[] = [];
  const messages: string[] = [];
  Object.assign(e, {
    eraId: era, playerDef: ERA_FLAGSHIPS[era], wave: 1, nextId: 1,
    balls: [], volleys: [], ships: [], islands: [], flags: [],
    pstats: { chain: false, swivel: 1, chase: 1, grapeshot: 1, damageMul: 1 },
    stats: { shots: 0, hits: 0, boarded: 0, gold: 0 },
    prisoners: 0, water: 100, food: 100, maxWater: 150, maxFood: 150,
    goldPopup: 0, streakTimer: 0, grapeCd: 0, swivelTimer: 0, nativeTimer: 0,
    screen: 'playing', zoomPunch: 0,
    volAt: () => 1, panAt: () => 0,
    addTrauma: () => {}, fxMuzzle: () => sounds.push('muzzle'),
    fxHit: () => {}, fxSparkle: () => {}, addPickup: () => {},
    addScore: (n: number) => n,
    addText: (_x: number, _y: number, text: string) => messages.push(text),
    emit: (type: number) => particles.push(type),
    sfx: new Proxy({}, { get: (_obj, key) => () => sounds.push(String(key)) }),
  });
  e.player = e.makeShip('player', 0, 0, 0);
  e.ships.push(e.player);
  return { e, sounds, particles, messages };
}

function island(x = 300, y = 0) {
  return {
    x, y, r: 80, maxR: 100, harm: [],
    settlement: { ...wildIsland(), inhabited: true, patience: 3, hostile: true, raidTimer: 0 },
  };
}

for (const era of ERA_SHIPS.filter((era) => !usesGunpowder(era.id))) {
  test(`${era.id}: real player and enemy broadsides use bows and bolts, not muzzle blasts`, () => {
    const { e, sounds } = harness(era.id);
    const enemy = e.makeShip('bombketch', 0, 100, 0);
    for (const ship of [e.player, enemy]) e.fireBroadside(ship, 1, Math.PI / 2);
    e.updateVolleys(1);
    assert.ok(e.balls.some((b: any) => b.projectile === 'arrow'));
    assert.ok(e.balls.some((b: any) => b.projectile === 'bolt'));
    assert.ok(e.balls.every((b: any) => b.projectile !== 'cannonball' && !b.mortar));
    assert.ok(sounds.length > 0 && sounds.every((s) => s === 'bow'));
  });
}

test('early-era auto-fire, chase launchers, forts and arrow storm have no gunpowder effects', () => {
  const { e, sounds, particles } = harness();
  e.ships.push(e.makeShip('merchant', 180, 0, Math.PI));
  e.updateSwivel(0.1);
  assert.equal(e.balls.at(-1).projectile, 'arrow');
  assert.equal(e.fireChaser(1, { range: 360, reload: 3.4, dmg: 20 }), true);
  assert.equal(e.balls.at(-1).projectile, 'bolt');
  e.fortSalvo(island(), { angle: Math.PI, ballSpeed: 300, guns: 3, damage: 15 });
  assert.ok(e.balls.every((b: any) => b.projectile !== 'cannonball' && !b.mortar));
  e.ships = [e.player];
  e.fireGrapeshot();
  assert.equal(e.grapeCd, 10);
  assert.ok(particles.length > 0);
  assert.ok(!particles.includes(0) && !particles.includes(1) && !particles.includes(10)); // smoke/fire/flash
  assert.ok(sounds.every((s) => s === 'bow'));
});

test('gunpowder-era cannon and mortar firing remain intact', () => {
  const { e, sounds } = harness('golden');
  e.fireBroadside(e.player, 1, Math.PI / 2);
  e.fireBroadside(e.makeShip('bombketch', 0, 100, 0), 1, Math.PI / 2);
  e.updateVolleys(1);
  assert.ok(e.balls.every((b: any) => b.projectile === 'cannonball'));
  assert.ok(e.balls.some((b: any) => b.mortar));
  assert.ok(sounds.includes('cannon') && sounds.includes('muzzle'));
});

test('arrows retain ship collision, damage and rigging-slow upgrades', () => {
  const { e } = harness();
  const enemy = e.makeShip('merchant', 0, 100, 0);
  e.pstats.chain = true;
  e.fireWeapon({ ship: e.player, side: 1, lx: -10, rel: Math.PI / 2, dmg: 12 });
  const arrow = e.balls[0];
  arrow.x = enemy.x; arrow.y = enemy.y;
  let damage = 0;
  e.damageShip = (_ship: any, amount: number) => { damage = amount; };
  assert.equal(e.ballHitsShip(arrow, enemy), true);
  e.onBallHit(arrow, enemy);
  assert.ok(damage > 0);
  assert.equal(enemy.slowTimer, 3);
  assert.equal(e.stats.hits, 1);
});

test('all nearby hostile islands launch defenders independently; remote and peaceful ones do not', () => {
  const { e } = harness();
  const a = island(350, 0), b = island(-350, 0), far = island(3000, 0), calm = island(0, 350);
  calm.settlement.hostile = false;
  e.islands = [a, b, far, calm];
  e.nativeTimer = 100;
  e.updateNatives(0.1);
  const defenders = (home: any) => e.ships.filter((ship: any) => ship.homeIsland === home);
  assert.equal(defenders(a).length, 2);
  assert.equal(defenders(b).length, 2);
  assert.equal(defenders(far).length, 0);
  assert.equal(defenders(calm).length, 0);
  e.updateNatives(0.1);
  assert.equal(defenders(a).length, 2); // local launch cooldown
  e.player.x = 2700;
  e.updateNatives(0.1);
  assert.equal(defenders(far).length, 2); // a later approach still triggers defence
});

test('hostility spread activates allied forts, not just the original island', () => {
  const { e } = harness();
  const a = island(300), b = island(-300);
  for (const is of [a, b]) Object.assign(is.settlement, {
    hostile: false, peopleId: 'shared', friendliness: 50,
    fortress: { ruined: false, range: 440, timer: 0, reload: 3.8 },
  });
  e.islands = [a, b];
  e.provokeIsland(a, 3, 'shell');
  const fired: any[] = [];
  e.fortSalvo = (is: any) => fired.push(is);
  e.updateForts(2);
  assert.deepEqual(fired, [a, b]);
});

test('boarding records prisoners in the inventory and end-of-game stats', () => {
  const { e, messages } = harness();
  const prize = e.makeShip('merchant', 10, 0, 0);
  prize.crew = 20;
  e.capturePrize(prize, 100, false);
  const inventory = e.getInventory();
  assert.ok(inventory.prisoners >= 9 && inventory.prisoners <= 13);
  assert.ok(messages.some((text) => text.includes('prisoners in irons')));
  let stats: any;
  e.input = { clear() {} };
  e.cb = { onScreen() {}, onGameOver(value: any) { stats = value; } };
  e.regionId = 'mediterranean';
  e.gameOver();
  assert.equal(stats.prisoners, inventory.prisoners);
});
