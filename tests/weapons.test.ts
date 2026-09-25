import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ERA_SHIPS } from '../src/game/ships/era';
import { SHIP_DEFS, UPGRADES } from '../src/game/data';
import { armShipForEra, ERA_WEAPONS, projectileFor, upgradeForEra, usesGunpowder } from '../src/game/weapons';

test('every selectable era has an explicit weapon technology', () => {
  assert.deepEqual(Object.keys(ERA_WEAPONS).sort(), ERA_SHIPS.map((e) => e.id).sort());
});

for (const era of ERA_SHIPS) {
  test(`${era.id}: portraits, enemy hulls, projectiles and upgrades follow the era`, () => {
    const gunpowder = usesGunpowder(era.id);
    if (!gunpowder) assert.equal(era.def.weapon, 'mechanical');
    assert.equal(projectileFor(era.id), gunpowder ? 'cannonball' : 'bolt');
    assert.equal(projectileFor(era.id, true), gunpowder ? 'cannonball' : 'arrow');
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
      if (gunpowder) assert.equal(adapted, upgrade);
      else assert.doesNotMatch(`${adapted.name} ${adapted.desc}`, /cannon|gun|powder|grape|canister/i);
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
