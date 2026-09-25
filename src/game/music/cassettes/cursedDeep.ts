// "The Cursed Deep" — boss theme.
// An original A-minor dirge: a moaning reed over a held drone, a slow
// heartbeat, and in danger mode a tritone drone that makes the deck feel
// like it's listing. The second phrase climbs an octave — the threat rising.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

// 4/4, one ABC unit = an eighth note = 2 steps, 16 steps per bar
const MELODY = abc(
  `A,3 A, e,4 | A,3 A, B,4 | c,3 A, g,4 | B,4 z2 A,2 |
   A3 A e4 | A3 A B4 | c3 A g4 | B4 z2 A2 |`,
  { key: 'Am', stepsPerUnit: 2 },
);
const LOOP_STEPS = 128;
const STEPS_PER_BAR = 16;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'The Cursed Deep');

// one chord per bar (16 steps)
const CHORDS = chords(`Am Am Dm E | Am Am Dm E`);

export const cursedDeep: Cassette = {
  title: 'The Cursed Deep',
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.11, 0.14 - (wave - 1) * 0.002);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const c = CHORDS[bar % CHORDS.length];

    // the moan: dark reed, low cutoff so it sounds like a voice through fog
    const m = MEL_AT[step];
    if (m) deck.reed(m[0], t, m[1] * sd * 0.9, 0.1, 0, 0, 1100);

    // drone: the root is held almost the whole bar
    if (inBar === 0) deck.bass(c.root, t, sd * 15, 0.32);

    if (mode === 2) {
      // danger: a fast heartbeat, and a tritone drone — two low saws a
      // semitone apart beating against each other
      if (inBar === 0 || inBar === 4 || inBar === 8 || inBar === 12) {
        deck.drum('sine', inBar % 8 === 0 ? 55 : 50, 28, t, 0.22, inBar % 8 === 0 ? 0.45 : 0.3);
      }
      if (inBar === 0) {
        deck.note('sawtooth', c.root - 12, t, sd * 16, 0.035, 350);
        deck.note('sawtooth', c.root - 11, t, sd * 16, 0.03, 350, 0.25);
      }
      return;
    }

    if (mode === 1) {
      // the heartbeat: low tom on the downbeat, a softer one halfway
      if (inBar === 0) deck.drum('sine', 60, 35, t, 0.2, 0.35);
      if (inBar === 8) deck.drum('sine', 55, 32, t, 0.14, 0.25);
    }
    // mode 0 (calm) — a boss is on deck, so there is no calm: just drone and moan
  },
};
