import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ERA_SHIPS } from '../src/game/ships/era';
import {
  ERA_TRAITS, traitDef, freshTraitState, freshTraitShip, makeZone,
  tidePhase, tideIsLow, TIDE_PERIOD, monsoonAngle, isNightWave,
  gaugeMult, rakeMult, armorMult, hailGold, deepDraft, isSubKind,
} from '../src/game/eraTraits';
import type { ShipDef } from '../src/game/types';

test('every sailed era has a trait with a name, pitch and hint', () => {
  assert.ok(ERA_SHIPS.length >= 35, `expected 35+ eras, saw ${ERA_SHIPS.length}`);
  for (const e of ERA_SHIPS) {
    const t = ERA_TRAITS[e.id];
    assert.ok(t, `era ${e.id} has no trait`);
    assert.ok(t.name.length > 0, `${e.id} trait name`);
    assert.ok(t.pitch.length > 0, `${e.id} trait pitch`);
    assert.ok(t.hint.length > 0, `${e.id} trait hint`);
  }
  assert.equal(traitDef('vietnam').name, 'Stakes of Bạch Đằng');
});

test('fresh trait state starts quiet', () => {
  const tr = freshTraitState();
  assert.equal(tr.bounty, 0);
  assert.equal(tr.firstShot, false);
  assert.deepEqual(tr.zones, []);
  assert.deepEqual(tr.currents, []);
  assert.equal(tr.crushId, -1);
  const ts = freshTraitShip();
  assert.equal(ts.sub, 0);
  assert.equal(ts.marked, false);
});

test('zones carry sane defaults', () => {
  const z = makeZone(10, 20, 100, 'stakes', 'foe');
  assert.equal(z.x, 10);
  assert.equal(z.live, true);
  assert.equal(z.drift, 0);
});

test('Bạch Đằng tide cycles high then low', () => {
  assert.equal(tidePhase(0), 0);
  assert.equal(tideIsLow(0), false); // high water: stakes drowned
  assert.equal(tideIsLow(TIDE_PERIOD / 2), true); // low water: stakes bare
  assert.equal(tideIsLow(TIDE_PERIOD), tideIsLow(0));
});

test('monsoon calendar reverses every three waves', () => {
  assert.equal(monsoonAngle(1, 0, 1), 0);
  assert.equal(monsoonAngle(3, 0, 1), 0);
  assert.equal(monsoonAngle(4, 0, 1), 1);
  assert.equal(monsoonAngle(6, 0, 1), 1);
  assert.equal(monsoonAngle(7, 0, 1), 0);
});

test('ww2 night falls on even waves', () => {
  assert.equal(isNightWave(1), false);
  assert.equal(isNightWave(2), true);
  assert.equal(isNightWave(3), false);
  assert.equal(isNightWave(10), true);
});

test('weather gauge favours the upwind ship', () => {
  // wind blowing east; attacker west of target = upwind
  assert.equal(gaugeMult(0, 0, 100, 0, 0), 1.25);
  // attacker east of target = downwind
  assert.equal(gaugeMult(100, 0, 0, 0, 0), 0.92);
  // abeam: no gauge either way
  assert.equal(gaugeMult(0, 0, 0, 100, 0), 1);
});

test('raking fire rewards bow and stern shots', () => {
  // target facing east; shooter dead ahead and dead astern rake her
  assert.equal(rakeMult(100, 0, 0, 0, 0), 1.5);
  assert.equal(rakeMult(-100, 0, 0, 0, 0), 1.5);
  // abeam is a fair broadside
  assert.equal(rakeMult(0, 100, 0, 0, 0), 1);
});

test('ironclad armour halves shot from ahead', () => {
  // target facing east; shot from ahead
  assert.equal(armorMult(0, 100, 0, 0, 0), 0.5);
  // shot abeam lands full
  assert.equal(armorMult(0, 0, 100, 0, 0), 1);
});

test('hail gold scales with wave, value and standing', () => {
  const base = hailGold(1, 100, 1);
  assert.ok(base > 0);
  assert.ok(hailGold(5, 100, 1) > base);
  assert.ok(hailGold(1, 500, 1) > base);
  assert.ok(hailGold(1, 100, 0.5) < base);
});

test('deep draft marks stakes/reef/sand victims', () => {
  assert.equal(deepDraft({ length: 70 } as ShipDef), true);
  assert.equal(deepDraft({ length: 40 } as ShipDef), false);
  assert.equal(deepDraft({ length: 100, oared: true } as ShipDef), false);
});

test('only U-boats dive', () => {
  assert.equal(isSubKind('germUboat'), true);
  assert.equal(isSubKind('germTB'), false);
  assert.equal(isSubKind('sloop'), false);
});

test('engine trait hooks: loot, supply and boarding range', async () => {
  const { Engine } = await import('../src/game/engine');
  const mk = (era: string, wave = 3) => {
    const e = Object.create(Engine.prototype) as any;
    Object.assign(e, { eraId: era, wave, windAngle: 0, flashRed: 0 });
    return e;
  };
  const ship = (def: object) => ({ def, isBoss: false });

  // golden bounty fattens traders only
  const g = mk('golden');
  g.ensureTraits().bounty = 5;
  assert.equal(g.traitLootMult(ship({ trader: true })), 1.4);
  assert.equal(g.traitLootMult(ship({})), 1);

  // chola doubles temple gold, storm waves pay extra
  const c = mk('chola', 4);
  assert.equal(c.traitLootMult(ship({ treasure: true })), 2.3);
  assert.equal(c.traitSupplyMult(), 2);
  assert.equal(mk('golden').traitSupplyMult(), 1);

  // ww2 night loot and sight
  const w = mk('ww2', 2);
  assert.equal(w.traitLootMult(ship({})), 1.25);
  assert.equal(mk('ww2', 3).traitLootMult(ship({})), 1);

  // lepanto boards from further off
  const { BOARD_RANGE } = await import('../src/game/boarding');
  assert.equal(mk('lepanto').traitBoardRange(), BOARD_RANGE * 1.7);
  assert.equal(mk('roman').traitBoardRange(), BOARD_RANGE);

  // monsoon seas pin the wind; others roam free
  assert.equal(typeof mk('arab', 1).traitWind(), 'number');
  assert.equal(typeof mk('portugal', 5).traitWind(), 'number');
  assert.equal(mk('golden').traitWind(), null);
});

test('engine trait hooks: shot modifiers and stealth', async () => {
  const { Engine } = await import('../src/game/engine');
  const mk = (era: string, wave = 3) => {
    const e = Object.create(Engine.prototype) as any;
    Object.assign(e, {
      eraId: era, wave, windAngle: 0, flashRed: 0,
      player: { x: 0, y: 0, angVel: 0, sinking: -1 },
    });
    return e;
  };
  const ball = (x: number, y: number, team: 0 | 1) => ({ x, y, team, projectile: 'cannonball' });
  const tgt = (x: number, y: number, angle: number, id = 7) => ({ x, y, angle, id });

  // napoleonic: upwind ball hits harder; signal stacks
  const n = mk('napoleonic');
  assert.equal(n.traitShotDamage(ball(-100, 0, 0), tgt(0, 0, 0), 10), 12.5);
  n.ensureTraits().signalT = 10;
  assert.equal(n.traitShotDamage(ball(-100, 0, 0), tgt(0, 0, 0), 10), 15.625);

  // predread: rakes and brackets stack
  const p = mk('predread');
  assert.equal(p.traitShotDamage(ball(100, 0, 0), tgt(0, 0, 0), 10), 15); // first rake
  assert.equal(p.traitShotDamage(ball(100, 0, 0), tgt(0, 0, 0), 10), 18); // bracketed rake

  // ironclad armour, maori mana, night blind fire
  assert.equal(mk('ironclad').traitShotDamage(ball(100, 0, 0), tgt(0, 0, 0), 10), 5);
  const m = mk('maori');
  m.ensureTraits().mana = 2;
  assert.ok(Math.abs(m.traitShotDamage(ball(0, 100, 0), tgt(0, 0, 0), 10) - 11.6) < 1e-9);
  assert.equal(mk('ww2', 2).traitShotDamage(ball(0, 100, 1), tgt(0, 0, 0), 10), 8);
  assert.equal(mk('ww2', 3).traitShotDamage(ball(0, 100, 1), tgt(0, 0, 0), 10), 10);

  // golden false colours: unseen until the first shot or close aboard
  const g = mk('golden');
  g.ensureTraits().firstShot = false;
  assert.equal(g.traitSeesPlayer({ x: 600, y: 0, range: 400 }), false);
  assert.equal(g.traitSeesPlayer({ x: 400, y: 0, range: 400 }), true);
  g.ensureTraits().firstShot = true;
  assert.equal(g.traitSeesPlayer({ x: 600, y: 0, range: 400 }), true);

  // submerged boats are hidden and immune until the ping reveals them
  const u = mk('ww1');
  const sub = { x: 0, y: 0 };
  u.tsOf(sub).sub = 1;
  assert.equal(u.traitShipHidden(sub), true);
  assert.equal(u.traitBallHits(ball(0, 0, 0), sub), false);
  u.ensureTraits().revealT = 2;
  assert.equal(u.traitShipHidden(sub), false);
});
