import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TITLE_CASSETTE, allCassettes, cassettesForEra } from '../src/game/music';
import { broadsideMarch } from '../src/game/music/cassettes/broadsideMarch';
import type { Deck, MusicMode } from '../src/game/music/cassette';
import type { EraId } from '../src/game/types';
import { ERA_SHIPS } from '../src/game/ships/era';

/** A deck that only counts what a tape asks for; pass a sink to collect notes. */
function countingDeck(sink?: (midi: number) => void): { deck: Deck; count: () => number } {
  let events = 0;
  const hit = () => {
    events++;
  };
  const deck = {
    note: hit,
    drum: hit,
    noise: hit,
    fiddle: sink ? (midi: number) => { events++; sink(midi); } : hit,
    reed: hit,
    bass: hit,
    stab: hit,
    snare: hit,
    crash: hit,
  } as unknown as Deck;
  return { deck, count: () => events };
}

function run(deck: Deck, mode: MusicMode) {
  const sd = broadsideMarch.stepDuration(1);
  for (let step = 0; step < broadsideMarch.loopSteps; step++) {
    broadsideMarch.playStep(deck, step, step * sd, sd, mode);
  }
}

test('the attract theme is a whole number of bars, and its tune fills the loop', () => {
  assert.equal(broadsideMarch, TITLE_CASSETTE);
  assert.equal(broadsideMarch.loopSteps % 16, 0);
  assert.equal(broadsideMarch.loopSteps / 16, 8, 'eight bars: an arch, a repeat and a cadence');
  // the ABC melody must land exactly on the loop, or the tune drifts a bar
  // further out on every turn — so count the lead's notes and their spacing
  const lead: number[] = [];
  run(countingDeck((m) => lead.push(m)).deck, 0);
  assert.equal(lead.length, 31, 'every tune note sounds exactly once per loop');
  assert.deepEqual(lead.slice(0, 8), lead.slice(16, 24), 'bars 5-6 are the repeat of bars 1-2');
  assert.ok(lead.every((m) => m >= 69 && m <= 83), 'the tune sits in one singable octave (A4..B5)');
});

test('the attract theme thins out when the port is quiet and never plays nothing', () => {
  const calm = countingDeck();
  run(calm.deck, 0);
  const full = countingDeck();
  run(full.deck, 1);
  const danger = countingDeck();
  run(danger.deck, 2);
  assert.ok(full.count() > calm.count() * 2, 'the band joins in when the full mode is on');
  assert.equal(full.count(), danger.count(), 'the attract screen has no fight to score: danger plays full');
  assert.ok(calm.count() > 0, 'even at rest the tune and the wall still play');
});

test('the attract theme keeps its march tempo, and belongs to no sea', () => {
  const sd = broadsideMarch.stepDuration(1);
  assert.ok(sd > 0.11 && sd < 0.15, `a march's walk, not a hornpipe sprint (${sd})`);
  assert.ok(broadsideMarch.stepDuration(99) >= 0.098, 'the tempo has a floor');
  assert.ok(broadsideMarch.stepDuration(99) <= sd, 'and only ever tightens with the wave');
  for (const era of ERA_SHIPS.map((e) => e.id) as EraId[]) {
    assert.ok(!cassettesForEra(era).includes(broadsideMarch), `${era}: the attract theme is not a sea's tape`);
  }
  assert.ok(allCassettes().includes(broadsideMarch), 'the attract theme is a tape the game knows');
});
