// "Haul Away Joe" (traditional sheet shanty).
// Arrangement: fiddle lead with a low crew answer an octave down, a walking
// bass, and a big "haul" drum on every "Joe!". The middle four bars lighten
// the pull; the last four bars get a crew harmony, then a fill into the seam.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

// 4/4, one ABC unit = an eighth note = 2 steps, 16 steps per bar
const VERSE_A = `BB BF AA AF | EE DE FA A2 | B2 B3/2F/ A3 F |`;
const MELODY = abc(
  `${VERSE_A} E3/2E/ F2 B,3 F |
   ${VERSE_A} E3/2E/ F2 B,4 |
   B2 B3/2F/ A3 F | EE DE FA A2 | B2 B3/2F/ A3 F | E3/2E/ F2 B,4 |`,
  { key: 'Bm', stepsPerUnit: 2 },
);
const LOOP_STEPS = 192;
const STEPS_PER_BAR = 16;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'Haul Away Joe');

// one chord per half bar (8 steps)
const PHRASE = `Bm A | Em A | Bm A | F# Bm`;
const CHORDS = chords(`${PHRASE} | ${PHRASE} | ${PHRASE}`);

export const haulAwayJoe: Cassette = {
  title: 'Haul Away Joe',
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.095, 0.128 - (wave - 1) * 0.0028);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const half = Math.floor(step / 8);
    const c = CHORDS[half % CHORDS.length];
    const isLastBar = step + STEPS_PER_BAR >= LOOP_STEPS;

    // lead: fiddle, with a gruff crew answer an octave below
    const m = MEL_AT[step];
    if (m) {
      deck.fiddle(m[0], t, m[1] * sd * 0.9, 0.09);
      deck.reed(m[0], t, m[1] * sd * 0.85, 0.05, -0.2, -12, 900);
      // last four bars: the crew sings along a third above
      if (bar >= 8) deck.reed(m[0] + 4, t, m[1] * sd * 0.8, 0.035, 0.3);
    }

    // walking bass on every half-bar change
    if (inBar === 0) deck.bass(c.root, t, sd * 6, 0.32);
    if (inBar === 4) deck.bass(c.fifth, t, sd * 3, 0.24);
    if (inBar === 8) deck.bass(c.root, t, sd * 6, 0.3);
    if (inBar === 12) deck.bass(c.fifth, t, sd * 3, 0.24);
    // soft sustained chord under the pull
    if (inBar === 0 || inBar === 8) {
      deck.note('triangle', c.third + 12, t, sd * 6, 0.03, 1500, -0.2);
      deck.note('triangle', c.fifth + 12, t, sd * 6, 0.028, 1500, 0.2);
    }

    if (mode === 2) {
      // danger: heartbeat and a dark drone under the pull
      if (inBar === 0) deck.drum('sine', 55, 28, t, 0.25, 0.5);
      if (inBar === 8) deck.drum('sine', 50, 26, t, 0.18, 0.32);
      if (inBar === 0) deck.note('sawtooth', c.root - 12, t, sd * 16, 0.04, 400);
      return;
    }

    if (mode === 1) {
      // the big haul on 1 (the middle phrase pulls lighter), clap on 2 & 4
      if (inBar === 0) deck.drum('sine', 95, 35, t, 0.22, 0.55);
      if (inBar === 8 && bar < 8) deck.drum('sine', 110, 40, t, 0.14, 0.35);
      if (inBar === 4 || inBar === 12) deck.snare(t, 0.1);
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.03, 8000);
      // HAUL! — extra-heavy hit on "Joe" at the end of every phrase
      if (bar % 4 === 3 && inBar === 8) {
        deck.drum('sine', 80, 30, t, 0.35, 0.6);
        deck.noise(t, 0.3, 0.1, 700);
      }
      // last bar: snare fill runs into the crash on the seam
      if (isLastBar && inBar >= 8) deck.snare(t, 0.04 + 0.008 * inBar);
    } else if (mode === 0) {
      // calm: just the shaker marking the pull
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.02, 8000);
    }

    if (mode === 1 && step === 0) deck.crash(t, 0.09);
  },
};
