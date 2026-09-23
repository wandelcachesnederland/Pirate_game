// "The Wellerman" (traditional New Zealand whaling song).
// Arrangement: stomp-and-clap crew with a reedy sawtooth lead.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

// 4/4, one ABC unit = an eighth note = 2 steps, 16 steps per bar
const MELODY = abc(
  `E2 EE E2 GG | B2 B2 B2 BB | c2 AA A2 cc | ee B2 B2 B2 |
   E2 FF G2 AA | B2 B2 B2 BB | c2 A2 GG F2 | E6 z2 |
   e4 e3 c | dd G2 G3 G | c2 A2 AB c2 | B2 G2 E4 |
   e4 e2 dc | dd G2 G2 G2 | B2 A2 G2 F2 | E6 B2 |`,
  { key: 'Em', stepsPerUnit: 2 },
);
const LOOP_STEPS = 256;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'Wellerman');

// one chord per half bar (8 steps)
const CHORDS = chords(
  `Em Em | Em Em | Am Am | Em Em | Em Em | Em Em | Am B | Em Em |
   C C | G G | Am Am | Em Em | C C | G G | Am B | Em Em`,
);

export const wellerman: Cassette = {
  title: 'The Wellerman',
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.1, 0.14 - (wave - 1) * 0.003);
  },

  playStep(deck, step, t, sd) {
    // lead: sawtooth with a soft triangle an octave up
    const m = MEL_AT[step];
    if (m) {
      deck.note('sawtooth', m[0], t, m[1] * sd * 0.9, 0.075, 1600);
      deck.note('triangle', m[0] + 12, t, m[1] * sd * 0.8, 0.04, 3000);
    }
    const inBar = step % 16;
    const c = CHORDS[Math.floor(step / 8) % CHORDS.length];
    // bass on beats 1 and 3, pickup fifth before each
    if (inBar === 0 || inBar === 8) deck.note('triangle', c.root, t, sd * 5, 0.32, 900);
    if (inBar === 6 || inBar === 14) deck.note('triangle', c.fifth - 12, t, sd * 1.5, 0.2, 900);
    // off-beat squeezebox chord
    if (inBar === 4 || inBar === 12) {
      deck.note('square', c.third + 12, t, sd * 1.6, 0.03, 1300);
      deck.note('square', c.fifth + 12, t, sd * 1.6, 0.028, 1300);
    }
    // stomp, clap and shaker
    if (inBar === 0 || inBar === 8) deck.drum('sine', 110, 40, t, 0.14, 0.5);
    if (inBar === 4 || inBar === 12) deck.noise(t, 0.07, 0.12, 1500);
    if (inBar % 2 === 1) deck.noise(t, 0.03, 0.035, 8000);
  },
};
