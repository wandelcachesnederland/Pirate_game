// "The Sailor's Hornpipe" / "College Hornpipe" (traditional, 18th century).
// Arrangement: fast jig with a walking fiddle and a bass that never stops
// moving (root-fifth-passing-octave). Form A A B B: the second A breathes
// (kick drops out), the second B gets a crew harmony a third above.
// Written in Bb, played in G.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

const TRANSPOSE = -3; // Bb -> G

// 4/4, one ABC unit = an eighth note = 2 steps, 16 steps per bar. Form: A A B B.
const A = `B2B,2 B,2FE | DFBA BdcB | c2C2 C2cB | Acf2 f2ga | bagf gfed | edcB BAGF | GBAc Bdce |`;
const B = `DFBF DFBF | G2E2 E2GF | =EGcG EGcG | A2F2 F2cd | edef gfed | edcB BAGF | GBAc Bdce |`;
const MELODY = abc(
  `${A} d2B2 B2BA |
   ${A} d2B2 B2FE |
   ${B} d2B2 B2FE |
   ${B} d2B2 B2BA |`,
  { key: 'Bb', stepsPerUnit: 2, transpose: TRANSPOSE },
);
const LOOP_STEPS = 512;
const STEPS_PER_BAR = 16;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, "Sailor's Hornpipe");

// one chord per bar (16 steps)
const A_CHORDS = `Bb Bb F F Bb Eb F Bb`;
const B_CHORDS = `Bb Eb C F Eb Bb F Bb`;
const CHORDS = chords(`${A_CHORDS} | ${A_CHORDS} | ${B_CHORDS} | ${B_CHORDS}`, TRANSPOSE);

export const sailorsHornpipe: Cassette = {
  title: "The Sailor's Hornpipe",
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.085, 0.108 - (wave - 1) * 0.002);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const c = CHORDS[bar % CHORDS.length];
    const isLastBar = step + STEPS_PER_BAR >= LOOP_STEPS;
    const phrase = Math.floor(bar / 8); // 0..3 over A A B B

    // lead: fast fiddle; the second B section gets a crew harmony a third up
    const m = MEL_AT[step];
    if (m) {
      deck.fiddle(m[0], t, m[1] * sd * 0.85, 0.1);
      if (phrase === 3) deck.reed(m[0] + 4, t, m[1] * sd * 0.75, 0.035, 0.35);
    }

    // walking bass: root - fifth - passing - octave - fifth
    if (inBar === 0) deck.bass(c.root, t, sd * 3, 0.32);
    if (inBar === 4) deck.bass(c.fifth, t, sd * 3, 0.26);
    if (inBar === 6) deck.bass(c.fifth + 2, t, sd, 0.18);
    if (inBar === 8) deck.bass(c.root + 12, t, sd * 3, 0.26);
    if (inBar === 12) deck.bass(c.fifth, t, sd * 3, 0.26);

    // off-beat chord chops
    if (mode !== 0 && inBar % 4 === 2) deck.stab(c.third + 12, c.fifth + 12, t, sd * 0.9, 0.035);

    if (mode === 2) {
      // danger: heartbeat and a dark drone under the jig
      if (inBar === 0) deck.drum('sine', 55, 28, t, 0.25, 0.5);
      if (inBar === 8) deck.drum('sine', 50, 26, t, 0.18, 0.32);
      if (inBar === 0) deck.note('sawtooth', c.root - 12, t, sd * 16, 0.04, 400);
      return;
    }

    if (mode === 1) {
      // kick on 1 & 3 (the second A phrase breathes), snare on 2 & 4
      const stomping = phrase !== 1;
      if (inBar === 0 && stomping) deck.drum('sine', 130, 45, t, 0.11, 0.45);
      if (inBar === 8 && stomping) deck.drum('sine', 130, 45, t, 0.11, 0.42);
      if (inBar === 4 || inBar === 12) deck.snare(t, 0.1);
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.04, 7500);
      // last bar: snare fill runs into the crash on the seam
      if (isLastBar && inBar >= 8) deck.snare(t, 0.04 + 0.008 * inBar);
    } else if (mode === 0) {
      // calm: a faint hi-hat keeps the jig time
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.02, 7500);
    }

    if (mode === 1 && step === 0) deck.crash(t, 0.1);
  },
};
