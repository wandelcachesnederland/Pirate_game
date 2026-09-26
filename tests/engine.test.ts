import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Engine } from '../src/game/engine';
import { DIFFICULTIES, DEFAULT_DIFFICULTY, difficultyById } from '../src/game/difficulty';
import { waveCompositionFor } from '../src/game/data';
import { ERA_FLAGSHIPS, ERA_SHIPS } from '../src/game/ships/era';
import { armamentFor, blastKindFor, isIncendiary, projectileFor, usesGunpowder } from '../src/game/weapons';
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
    difficulty: DEFAULT_DIFFICULTY, diff: difficultyById(DEFAULT_DIFFICULTY),
    balls: [], volleys: [], ships: [], islands: [], flags: [], slicks: [],
    pstats: { chain: false, swivel: 1, chase: 1, grapeshot: 1, damageMul: 1 },
    stats: { shots: 0, hits: 0, boarded: 0, gold: 0 },
    prisoners: 0, water: 100, food: 100, maxWater: 150, maxFood: 150,
    goldPopup: 0, streakTimer: 0, grapeCd: 0, swivelTimer: 0, nativeTimer: 0,
    screen: 'playing', zoomPunch: 0, time: 0, waveDamage: 0, flashRed: 0, hullShake: 0,
    windX: 1, windY: 0, trauma: 0, camera: 0, playerDeadTimer: -1,
    input: { enabled: true, clear() {} },
    volAt: () => 1, panAt: () => 0,
    addTrauma: () => {}, fxMuzzle: () => sounds.push('muzzle'),
    fxExplosion: () => sounds.push('powderBlast'), fxFireBurst: () => sounds.push('fireBurst'),
    fxCollapse: () => {}, fxBurnOut: () => sounds.push('burnOut'), fxSparkle: () => {},
    fxHit: () => {}, fxFireHit: () => {}, addPickup: () => {},
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
    x, y, r: 80, maxR: 100, harm: [], angle: 0,
    // a stand-in for the baked island sprite: no 2d context in a headless run
    canvas: { width: 200, getContext: () => null },
    settlement: { ...wildIsland(), inhabited: true, patience: 3, hostile: true, raidTimer: 0 },
  };
}

/** A stone battery on the shore, in whatever state the test needs it. */
function fort(over: Record<string, unknown> = {}) {
  return { hp: 40, maxHp: 60, guns: 3, range: 440, reload: 3.8, timer: 0, damage: 15, ballSpeed: 300, angle: Math.PI, ruined: false, ...over };
}

for (const era of ERA_SHIPS.filter((era) => !usesGunpowder(era.id))) {
  test(`${era.id}: real player and enemy broadsides throw this sea's armament, not muzzle blasts`, () => {
    const { e, sounds } = harness(era.id);
    const arm = armamentFor(era.id);
    const enemy = e.makeShip('bombketch', 0, 100, 0);
    for (const ship of [e.player, enemy]) e.fireBroadside(ship, 1, Math.PI / 2);
    e.updateVolleys(1);
    assert.ok(e.balls.length >= 2);
    // the after stations throw the light shot, the forward ones the heavy engines
    assert.ok(e.balls.every((b: any) => b.projectile === arm.heavy || b.projectile === arm.light));
    assert.ok(e.balls.some((b: any) => b.projectile === arm.heavy));
    assert.ok(e.balls.every((b: any) => b.projectile !== 'cannonball' && !b.mortar));
    // a bolt or an arrow thwips, a jet of Greek fire roars from the siphon
    assert.ok(sounds.length > 0 && sounds.every((s) => s === 'bow' || s === 'siphon'));
    if (isIncendiary(arm.heavy)) assert.ok(sounds.includes('siphon'));
  });
}

test('early-era auto-fire, chase launchers, forts and arrow storm have no gunpowder effects', () => {
  // Roman guns: the light stations are bows, the heavy engines throw stones.
  const { e, sounds, particles } = harness();
  const arm = armamentFor('roman');
  e.ships.push(e.makeShip('merchant', 180, 0, Math.PI));
  e.updateSwivel(0.1);
  assert.equal(e.balls.at(-1).projectile, arm.light);
  assert.equal(e.fireChaser(1, { range: 360, reload: 3.4, dmg: 20 }), true);
  assert.equal(e.balls.at(-1).projectile, arm.heavy);
  e.fortSalvo(island(), { angle: Math.PI, ballSpeed: 300, guns: 3, damage: 15 });
  assert.ok(e.balls.every((b: any) => b.projectile !== 'cannonball' && !b.mortar));
  e.ships = [e.player];
  e.fireGrapeshot();
  assert.equal(e.grapeCd, 10);
  assert.ok(particles.length > 0);
  assert.ok(!particles.includes(0) && !particles.includes(1) && !particles.includes(10)); // smoke/fire/flash
  assert.ok(sounds.every((s) => s === 'bow'));
});

test('Greek-fire seas throw fire and everything they hit keeps burning', () => {
  const arm = armamentFor('byzantium');
  assert.equal(arm.heavy, 'greekFire');
  assert.equal(arm.light, 'fireArrow');
  const { e, sounds, messages } = harness('byzantium');
  const enemy = e.makeShip('merchant', 0, 100, 0);
  e.ships.push(enemy);
  e.fireWeapon({ ship: e.player, side: 1, lx: 0, rel: Math.PI / 2, dmg: 12 });
  assert.equal(e.balls.at(-1).projectile, 'greekFire');
  assert.ok(sounds.includes('siphon'));
  const shot = e.balls.at(-1);
  shot.x = enemy.x;
  shot.y = enemy.y;
  let damage = 0;
  e.damageShip = (_ship: any, amount: number) => { damage = amount; };
  e.onBallHit(shot, enemy);
  assert.ok(damage > 0);
  // a siphon of Greek fire never just glances off: she is alight
  assert.ok(enemy.burn > 0 && enemy.burnRate > 0);
  assert.ok(messages.includes('AFIRE!'));
  // and the fire goes on eating the hull after the shot has landed
  let burned = 0;
  e.damageShip = (_ship: any, amount: number) => { burned += amount; };
  for (let i = 0; i < 40; i++) e.updateBurning(0.1);
  assert.ok(burned > 0, 'a burning hull takes damage over time');
  assert.ok(enemy.slowTimer > 0, 'fire in the rigging drags at her speed');
});

test('Greek fire that misses keeps burning on the water and burns what crosses it', () => {
  const { e } = harness('byzantium');
  const enemy = e.makeShip('merchant', 400, 0, 0);
  e.ships.push(enemy);
  e.balls.push({
    projectile: 'greekFire', x: 400, y: 0, vx: 0, vy: 0, life: 0.001, max: 0.001,
    team: 0, dmg: 12, chain: false, small: false, mortar: false,
  });
  e.updateBalls(0.05);
  assert.equal(e.slicks.length, 1);
  let damage = 0;
  e.damageShip = (_ship: any, amount: number) => { damage += amount; };
  for (let i = 0; i < 8; i++) e.updateSlicks(0.4);
  assert.ok(damage > 0, 'a hull sitting in the flames is burned');
  assert.ok(enemy.burn > 0, 'and the flames take hold if she lingers');
  // and it burns out in its own time
  for (let i = 0; i < 60; i++) e.updateSlicks(0.2);
  assert.equal(e.slicks.length, 0);
});

test('a fire arrow is a gamble, a bolt never lights anything', () => {
  const { e } = harness('vietnam');
  const enemy = e.makeShip('merchant', 0, 100, 0);
  e.ships.push(enemy);
  // no hull damage here: this test is only about whether a shot lights her
  e.damageShip = () => {};
  const shot = {
    projectile: 'fireArrow' as const, x: enemy.x, y: enemy.y, vx: 1, vy: 0, life: 1, max: 1,
    team: 0, dmg: 10, chain: false, small: false, mortar: false,
  };
  let lit = 0;
  for (let i = 0; i < 80; i++) {
    enemy.burn = 0;
    e.onBallHit({ ...shot }, enemy);
    if (enemy.burn > 0) lit++;
  }
  // a coin toss per hit: never certain, never hopeless
  assert.ok(lit > 10 && lit < 70, `fire arrows should sometimes light a hull (${lit}/80)`);
  enemy.burn = 0;
  const bolt = { ...shot, projectile: 'bolt' as const };
  for (let i = 0; i < 40; i++) e.onBallHit({ ...bolt }, enemy);
  assert.equal(enemy.burn, 0);
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

for (const era of ERA_SHIPS.filter((era) => !usesGunpowder(era.id))) {
  test(`${era.id}: nothing explodes — wrecks, fire ships and forts burn or fall instead`, () => {
    const { e, sounds } = harness(era.id);
    const enemy = e.makeShip('frigate', 0, 300, 0);
    const fireship = e.makeShip('fireship', 200, 300, 0);
    e.ships.push(enemy, fireship);
    e.sinkShip(enemy);
    assert.ok(sounds.includes('fireBurst'), 'a sunk hull goes up in flame');
    e.sinkShip(fireship, false);
    // a fire ship in a sea without powder is a bonfire, not a bomb
    assert.ok(!sounds.includes('powderBlast') && !sounds.includes('explosion'));
    // a fort's walls come down in dust: there is no magazine behind them
    sounds.length = 0;
    const is = island();
    e.razeFort(is, fort());
    assert.ok(!sounds.includes('powderBlast') && !sounds.includes('explosion'));
    assert.ok(sounds.includes('thud'));
    // and the player's own last moments are fire, not a blast
    sounds.length = 0;
    e.sinkShip(e.player);
    assert.ok(!sounds.includes('powderBlast') && !sounds.includes('explosion'));
    assert.equal(blastKindFor(era.id), 'fire');
  });
}

test('gunpowder seas still lose their magazines in a proper explosion', () => {
  const { e, sounds } = harness('golden');
  const enemy = e.makeShip('frigate', 0, 300, 0);
  e.ships.push(enemy);
  e.sinkShip(enemy);
  assert.ok(sounds.includes('powderBlast') && sounds.includes('explosion'));
  const is = island();
  sounds.length = 0;
  e.razeFort(is, fort());
  assert.ok(sounds.includes('powderBlast') && sounds.includes('explosion'));
  assert.equal(blastKindFor('golden'), 'powder');
});

test('the era armament decides every shot a fort, a chaser and a deck station throws', () => {
  for (const era of ERA_SHIPS.filter((era) => !usesGunpowder(era.id))) {
    assert.equal(projectileFor(era.id), armamentFor(era.id).heavy);
    assert.equal(projectileFor(era.id, true), armamentFor(era.id).light);
  }
});

// ------------------------------------------------------------------ difficulty
test('the five perils are laid down in order, and Buccaneer sails the true line', () => {
  assert.equal(DIFFICULTIES.length, 5);
  assert.deepEqual(
    DIFFICULTIES.map((d) => d.id),
    ['landlubber', 'swashbuckler', 'buccaneer', 'dreadCaptain', 'kingOfTheSeas'],
  );
  assert.deepEqual(DIFFICULTIES.map((d) => d.skulls), [1, 2, 3, 4, 5]);
  // the middle of the road is untouched: every modifier at exactly one
  const base = difficultyById('buccaneer');
  for (const k of [
    'enemyHp', 'enemyDamage', 'enemyReload', 'enemySpeed', 'enemyCrew',
    'aimJitter', 'aimLead', 'spawnPace', 'waveBudget', 'surrender',
    'fortHp', 'fortDamage', 'supplyDrain', 'playerHp', 'plunder',
  ] as const) {
    assert.equal(base[k], 1, `buccaneer.${k} must be 1`);
  }
  assert.equal(base.spawnCap, 0);
});

test('a heavier peril raises tougher foes and a frailer flagship', () => {
  const { e } = harness();
  const base = difficultyById('buccaneer');
  e.difficulty = 'buccaneer'; e.diff = base;
  const plain = e.makeShip('frigate', 0, 200, 0);

  e.difficulty = 'kingOfTheSeas'; e.diff = difficultyById('kingOfTheSeas');
  const hard = e.makeShip('frigate', 0, 200, 0);
  assert.ok(hard.hp > plain.hp, 'King of the Seas foes carry thicker hulls');
  assert.ok(hard.damage > plain.damage, 'and heavier shot');
  assert.ok(hard.reloadTime < plain.reloadTime, 'and run their guns faster');

  // the flagship follows the same hand: braced on an easy sea, thin on a hard one
  e.difficulty = 'landlubber'; e.diff = difficultyById('landlubber');
  const softPlayer = e.makeShip('player', 0, 0, 0);
  e.difficulty = 'kingOfTheSeas'; e.diff = difficultyById('kingOfTheSeas');
  const hardPlayer = e.makeShip('player', 0, 0, 0);
  assert.ok(softPlayer.hp > hardPlayer.hp, 'a Landlubber flagship is stouter');
});

test('the wave roster thickens or thins with the voyage budget', () => {
  // the roster is drawn at random, so compare averages over many deals
  const avg = (mul: number) => {
    let total = 0;
    for (let i = 0; i < 40; i++) total += waveCompositionFor('golden', 8, mul).length;
    return total / 40;
  };
  const sparse = avg(0.6);
  const full = avg(1);
  const thick = avg(1.6);
  assert.ok(sparse < full, `a lean budget fields fewer sails (${sparse} vs ${full})`);
  assert.ok(thick > full, `a rich budget fields more sails (${thick} vs ${full})`);
  // early waves are scripted and ignore the budget entirely
  assert.deepEqual(waveCompositionFor('golden', 2, 0.6), waveCompositionFor('golden', 2, 1.6));
});
