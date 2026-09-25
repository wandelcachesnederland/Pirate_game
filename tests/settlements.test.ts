import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assignIslandPolitics, areIslandAllies, coolOff, provokeNetwork, wildIsland } from '../src/game/settlements';
import type { Settlement } from '../src/game/types';

function village(overrides: Partial<Settlement> = {}): Settlement {
  return { ...wildIsland(), inhabited: true, name: 'Harbour', friendliness: 60, patience: 3, ...overrides };
}

function chart() {
  const source = village({ peopleId: 'a', allianceId: 'pact' });
  const kin = village({ peopleId: 'a', allianceId: 'pact', patience: 4 });
  const ally = village({ peopleId: 'b', allianceId: 'pact', friendliness: 95, patience: 5 });
  const outsider = village({ peopleId: 'c' });
  const wild = wildIsland();
  return { source, kin, ally, outsider, wild, all: [source, kin, ally, outsider, wild] };
}

test('generated chart has shared peoples, a cross-people pact and independents', () => {
  const all = Array.from({ length: 20 }, (_, i) => village({ name: `Port ${i}` }));
  const wild = wildIsland();
  assignIslandPolitics([...all, wild], () => 0.4);
  assert.equal(wild.peopleId, undefined);
  const groups = new Set(all.map((st) => st.peopleId));
  assert.equal(groups.size, 6);
  for (const id of groups) assert.ok(all.filter((st) => st.peopleId === id).length >= 2);
  assert.equal(new Set(all.filter((st) => st.allianceId).map((st) => st.peopleId)).size, 2);
  assert.ok(all.some((st) => !st.allianceId));
});

test('sparse and empty charts are safe; unnamed villages are not automatically kin', () => {
  assignIslandPolitics([]);
  assignIslandPolitics([wildIsland()]);
  const all = [village(), village()];
  assert.equal(areIslandAllies(all[0], all[1]), false);
  assignIslandPolitics(all);
  assert.equal(areIslandAllies(all[0], all[1]), true);
});

test('local patience must be crossed before solidarity triggers', () => {
  const { source, all } = chart();
  assert.deepEqual(provokeNetwork(source, all, 2, 'shell'), []);
  assert.ok(all.every((st) => !st.hostile));
  assert.equal(source.anger, 2);
});

test('shelling rouses kin and another allied people, not unrelated or wild islands', () => {
  const { source, kin, ally, outsider, wild, all } = chart();
  assert.deepEqual(provokeNetwork(source, all, 3, 'shell'), [source, kin, ally]);
  for (const st of [source, kin, ally]) assert.equal(st.hostile, true);
  assert.equal(outsider.hostile, false);
  assert.equal(wild.hostile, false);
});

test('boat grievances spread too, but a forgiving source retains its patience rule', () => {
  const { source, kin, ally, all } = chart();
  assert.deepEqual(provokeNetwork(ally, all, 100, 'boats'), []);
  assert.equal(ally.anger, 0);
  provokeNetwork(source, all, 3, 'boats');
  assert.ok(kin.hostile && ally.hostile);
});

test('shared people without a pact defend each other', () => {
  const all = [village({ peopleId: 'a' }), village({ peopleId: 'a' }), village({ peopleId: 'b' })];
  provokeNetwork(all[0], all, 3, 'shell');
  assert.deepEqual(all.map((st) => st.hostile), [true, true, false]);
});

test('attacking an already hostile member alerts allies and refreshes the bloc', () => {
  const { source, kin, ally, all } = chart();
  source.hostile = true;
  assert.deepEqual(provokeNetwork(source, all, 0.1, 'boats'), [kin, ally]);
  all.forEach((st) => coolOff(st, 20));
  provokeNetwork(kin, all, 0.1, 'boats');
  for (const st of [source, kin, ally]) assert.equal(st.calm, 0);
});

test('bloc cools together despite different patience; new voyages have no old grudges', () => {
  const { source, kin, ally, all } = chart();
  provokeNetwork(source, all, 3, 'shell');
  for (let i = 0; i < 70; i++) all.forEach((st) => coolOff(st, 1));
  assert.ok([source, kin, ally].every((st) => !st.hostile));
  assert.ok(chart().all.every((st) => !st.hostile));
});

test('naturally hostile villages remain hostile after cooling', () => {
  const st = village({ hostile: true, patience: 0 });
  provokeNetwork(st, [st], 1, 'shell');
  for (let i = 0; i < 100; i++) coolOff(st, 1);
  assert.equal(st.hostile, true);
});
