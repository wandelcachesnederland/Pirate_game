import { isFittingSlot } from '../src/game/hullFittings';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ERA_SHIPS } from '../src/game/ships/era';
import { SHIP_DEFS, UPGRADES } from '../src/game/data';
import {
  armamentFor,
  armShipForEra,
  blastKindFor,
  ERA_ARMAMENTS,
  ERA_WEAPONS,
  isIncendiary,
  isMechanicalShot,
  projectileFor,
  SHOT_PROFILE,
  upgradeForEra,
  usesGunpowder,
} from '../src/game/weapons';

test('every selectable era has an explicit weapon technology', () => {
  assert.deepEqual(Object.keys(ERA_WEAPONS).sort(), ERA_SHIPS.map((e) => e.id).sort());
});

test('every selectable era also has an explicit armament', () => {
  assert.deepEqual(Object.keys(ERA_ARMAMENTS).sort(), ERA_SHIPS.map((e) => e.id).sort());
});

test('no pre-gunpowder armament carries a shot that goes off on impact', () => {
  for (const era of ERA_SHIPS) {
    const arm = armamentFor(era.id);
    if (usesGunpowder(era.id)) continue;
    for (const shot of [arm.heavy, arm.light]) {
      assert.ok(isMechanicalShot(shot), `${era.id} throws ${shot}`);
      assert.notEqual(shot, 'cannonball');
      assert.notEqual(shot, 'missile');
    }
  }
});

test('one blast rule for every sea: powder blows up, everything else burns', () => {
  for (const era of ERA_SHIPS) {
    assert.equal(blastKindFor(era.id), usesGunpowder(era.id) ? 'powder' : 'fire');
  }
});

test('only incendiaries set a hull alight; arrows, bolts and stones never do', () => {
  for (const shot of ['fireArrow', 'greekFire'] as const) {
    const prof = SHOT_PROFILE[shot];
    assert.ok(isIncendiary(shot), `${shot} is an incendiary`);
    assert.ok(prof.ignite > 0, `${shot} should be able to start a fire`);
    assert.ok(prof.burn > 0 && prof.burnRate > 0, `${shot} should keep burning`);
  }
  // a burning arrow is a gamble; a siphon of Greek fire always lights her up
  assert.equal(SHOT_PROFILE.greekFire.ignite, 1);
  assert.ok(SHOT_PROFILE.fireArrow.ignite < 1);
  // plain shot of either age only ever batters a hull
  for (const shot of ['arrow', 'bolt', 'stone', 'cannonball'] as const) {
    const prof = SHOT_PROFILE[shot];
    assert.equal(prof.ignite, 0, `${shot} must not start a fire`);
    assert.equal(prof.burn, 0);
    assert.equal(prof.burnRate, 0);
    assert.ok(!isIncendiary(shot));
  }
});

for (const era of ERA_SHIPS) {
  test(`${era.id}: portraits, enemy hulls, projectiles and upgrades follow the era`, () => {
    const gunpowder = usesGunpowder(era.id);
    const arm = armamentFor(era.id);
    if (!gunpowder) assert.equal(era.def.weapon, 'mechanical');
    assert.equal(projectileFor(era.id), gunpowder ? 'cannonball' : arm.heavy);
    assert.equal(projectileFor(era.id, true), gunpowder ? 'cannonball' : arm.light);
    for (const def of Object.values(SHIP_DEFS)) {
      const armed = armShipForEra(def, era.id);
      if (!gunpowder) {
        assert.equal(armed.mortar, false);
        assert.equal(armed.weapon, 'mechanical');
        assert.equal(armShipForEra(armed, era.id), armed);
      } else assert.equal(armed, def);
      assert.equal(armed.damage, def.damage);
      assert.equal(armed.cannons, def.cannons);
    }
    for (const upgrade of UPGRADES) {
      const adapted = upgradeForEra(upgrade, era.id);
      assert.equal(adapted.id, upgrade.id);
      assert.equal(adapted.max, upgrade.max);
      // hull fittings are renamed in every era; Somali pirates rename the lot
      if (isFittingSlot(upgrade.id)) assert.notEqual(adapted.name, upgrade.name, `${era.id}: ${upgrade.id} gets an era name`);
      else if (era.id === 'somali') assert.notEqual(adapted.name, upgrade.name);
      else if (gunpowder) assert.equal(adapted, upgrade);
      else assert.doesNotMatch(`${adapted.name} ${adapted.desc}`, /cannon|gun|powder|grape|canister|shell|torpedo|missile/i);
    }
  });
}

test('early-era conversion never mutates a shared cannon/mortar definition', () => {
  const def = SHIP_DEFS.bombketch;
  const before = structuredClone(def);
  armShipForEra(def, 'roman');
  assert.deepEqual(def, before);
  assert.equal(armShipForEra(def, 'golden').mortar, true);
});
