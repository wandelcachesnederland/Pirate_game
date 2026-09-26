import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FITTING_SLOTS, HULL_FITTINGS, fenderFireGuard, fenderGuard, fittingsFor, ramDamage, ramSelfGuard, spikeDamage,
} from '../src/game/hullFittings';
import { ERA_SHIPS } from '../src/game/ships/era';
import { UPGRADES } from '../src/game/data';
import { upgradeForEra } from '../src/game/weapons';

test('every era bolts its own ram, side fitting and fenders to the hull', () => {
  for (const era of ERA_SHIPS) {
    const kit = HULL_FITTINGS[era.id];
    assert.ok(kit, `${era.id} has hull fittings`);
    for (const slot of FITTING_SLOTS) {
      assert.ok(kit[slot].name.length > 3, `${era.id}.${slot} has a name`);
      assert.ok(kit[slot].desc.length > 10, `${era.id}.${slot} says what it does`);
    }
    assert.match(kit.metal, /^#[0-9a-f]{6}$/i);
    assert.match(kit.pad, /^#[0-9a-f]{6}$/i);
  }
});

test('fittings are offered as refits, renamed for the era', () => {
  for (const slot of FITTING_SLOTS) {
    const def = UPGRADES.find((u) => u.id === slot);
    assert.ok(def, `${slot} is in the refit pool`);
    assert.equal(def!.max, 3);
    assert.equal(upgradeForEra(def!, 'roman').name, fittingsFor('roman')[slot].name);
    assert.equal(upgradeForEra(def!, 'korea').name, fittingsFor('korea')[slot].name);
  }
  assert.equal(fittingsFor('korea').spikes.name, 'Iron-Spiked Turtle Roof');
  assert.equal(fittingsFor('somali').fenders.name, 'Truck-Tyre Fenders');
});

test('pre-powder seas never fit anything that goes bang', () => {
  for (const id of ['roman', 'greek', 'viking', 'egypt', 'phoenicia', 'macedon', 'byzantium', 'arab', 'chola', 'vietnam', 'inca', 'hanse'] as const) {
    for (const slot of FITTING_SLOTS) {
      const s = fittingsFor(id)[slot];
      assert.doesNotMatch(`${s.name} ${s.desc}`, /cannon|gun|powder|mine|charge|explos|chaff/i, `${id}.${slot}`);
    }
  }
});

test('the ram scales with level and speed, and spares your own bow', () => {
  assert.equal(ramDamage(0, 100, 1, 'none'), 0);
  assert.ok(ramDamage(2, 100, 1, 'none') > ramDamage(1, 100, 1, 'none'));
  assert.ok(ramDamage(1, 100, 1, 'none') > ramDamage(1, 100, 0.4, 'none'));
  assert.ok(ramDamage(1, 100, 1, 'breach') > ramDamage(1, 100, 1, 'none'));
  // crawling into a hull still does something, but never below the floor
  assert.equal(ramDamage(1, 100, 0, 'none'), ramDamage(1, 100, 0.35, 'none'));
  assert.equal(ramSelfGuard(0), 1);
  assert.ok(ramSelfGuard(3) < ramSelfGuard(1));
  assert.ok(spikeDamage(3, 100) > spikeDamage(1, 100));
  assert.equal(fenderGuard(0), 1);
  assert.ok(fenderGuard(3) >= 0.39 && fenderGuard(3) <= 0.41);
  assert.ok(fenderFireGuard(3) < 1 && fenderFireGuard(3) > 0.5);
});
