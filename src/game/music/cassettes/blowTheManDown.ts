// "Blow the Man Down" (traditional halyard shanty).
// Arrangement: oom-pah-pah waltz with a concertina-like lead.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

// 3/4, one ABC unit = a quarter note = 4 steps, 12 steps per bar
const MELODY = abc(
  `G3/2 A/ G | E C E | G3/2 A/ G | E2 E/F/ |
   G3 | A3 | F3/2 E/ F | D2 E |
   F3/2 E/ F | D B, D | F3/2 E/ D | A2 c |
   G G G | G2 F | E3/2 D/ E | C2 C/E/ |`,
  { key: 'C', stepsPerUnit: 4 },
);
const LOOP_STEPS = 192;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'Blow the Man Down');

// one chord per bar (12 steps)
const CHORDS = chords(`C C C C | C A Dm G | Dm G Dm Dm | G G C C`);

export const blowTheManDown: Cassette = {
  title: 'Blow the Man Down',
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.075, 0.098 - (wave - 1) * 0.002);
  },

  playStep(deck, step, t, sd) {
    // lead: triangle doubled by a quiet square
    const m = MEL_AT[step];
    if (m) {
      deck.note('triangle', m[0], t, m[1] * sd * 0.9, 0.13, 2500);
      deck.note('square', m[0], t, m[1] * sd * 0.85, 0.05, 1200);
    }
    const inBar = step % 12;
    const c = CHORDS[Math.floor(step / 12) % CHORDS.length];
    // oom ...
    if (inBar === 0) deck.note('triangle', c.root, t, sd * 4, 0.34, 900);
    // ... pah pah
    if (inBar === 4 || inBar === 8) {
      deck.note('square', c.third + 12, t, sd * 1.8, 0.035, 1400);
      deck.note('square', c.fifth + 12, t, sd * 1.8, 0.03, 1400);
    }
    // kick + tambourine
    if (inBar === 0) deck.drum('sine', 120, 45, t, 0.12, 0.45);
    if (inBar === 4 || inBar === 8) deck.noise(t, 0.05, 0.07, 6000);
    if (inBar === 2 || inBar === 6 || inBar === 10) deck.noise(t, 0.03, 0.03, 8000);
  },
};
