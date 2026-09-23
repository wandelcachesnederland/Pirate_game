// "Spanish Ladies" (traditional Royal Navy song).
// Arrangement: stately minor-key march with snare rolls.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

// 3/4, one ABC unit = an eighth note = 2 steps, 12 steps per bar
const MELODY = abc(
  `G2 G2 ^F2 | G4 GA | B2 A2 G2 | ^F2 D3 D |
   G2 G2 ^F2 | G4 GA | B2 A2 G2 | A4 AA |
   B2 A2 G2 | c2 B2 A2 | d2 G2 GA | ^F=E D2 dc |
   B2 A2 G2 | ^F2 D2 D2 | D2 G2 ^F2 | G4 D2 |`,
  { key: 'Gm', stepsPerUnit: 2 },
);
const LOOP_STEPS = 192;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'Spanish Ladies');

// one chord per bar (12 steps)
const CHORDS = chords(`Gm Gm Gm D | Gm Gm Gm D | Gm F Gm D | Gm D D Gm`);

export const spanishLadies: Cassette = {
  title: 'Spanish Ladies',
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.095, 0.128 - (wave - 1) * 0.0028);
  },

  playStep(deck, step, t, sd) {
    // lead: mellow square with a sine an octave up
    const m = MEL_AT[step];
    if (m) {
      deck.note('square', m[0], t, m[1] * sd * 0.92, 0.1, 1100);
      deck.note('sine', m[0] + 12, t, m[1] * sd * 0.85, 0.06, 4000);
    }
    const inBar = step % 12;
    const c = CHORDS[Math.floor(step / 12) % CHORDS.length];
    // bass: root, then fifth below on beat 3
    if (inBar === 0) deck.note('triangle', c.root, t, sd * 7, 0.32, 700);
    if (inBar === 8) deck.note('triangle', c.fifth - 12, t, sd * 3.5, 0.26, 700);
    // held chord pad on beat 2
    if (inBar === 4) {
      deck.note('sawtooth', c.third + 12, t, sd * 7, 0.022, 900);
      deck.note('sawtooth', c.fifth + 12, t, sd * 7, 0.02, 900);
    }
    // bass drum and military snare
    if (inBar === 0) deck.drum('sine', 100, 42, t, 0.16, 0.45);
    if (inBar === 4 || inBar === 8) deck.noise(t, 0.06, 0.08, 3000);
    if (inBar === 10 || inBar === 11) deck.noise(t, 0.04, 0.045, 3500);
  },
};
