// "The Sailor's Hornpipe" / "College Hornpipe" (traditional, 18th century).
// Arrangement: fast jig-along with a walking bass. Written in Bb, played in G.
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

  playStep(deck, step, t, sd) {
    // lead: bright square with a triangle an octave up
    const m = MEL_AT[step];
    if (m) {
      deck.note('square', m[0], t, m[1] * sd * 0.85, 0.1, 2200);
      deck.note('triangle', m[0] + 12, t, m[1] * sd * 0.75, 0.04, 3500);
    }
    const inBar = step % 16;
    const c = CHORDS[Math.floor(step / 16) % CHORDS.length];
    // walking bass: root - fifth - octave - fifth
    if (inBar === 0) deck.note('triangle', c.root, t, sd * 3, 0.32, 900);
    if (inBar === 4) deck.note('triangle', c.fifth, t, sd * 3, 0.26, 900);
    if (inBar === 8) deck.note('triangle', c.root + 12, t, sd * 3, 0.26, 900);
    if (inBar === 12) deck.note('triangle', c.fifth, t, sd * 3, 0.26, 900);
    // off-beat chord chops
    if (inBar % 4 === 2) {
      deck.note('square', c.third + 12, t, sd * 0.9, 0.03, 1200);
      deck.note('square', c.fifth + 12, t, sd * 0.9, 0.028, 1200);
    }
    // kick, snare, hi-hat
    if (inBar === 0 || inBar === 8) deck.drum('sine', 130, 45, t, 0.11, 0.45);
    if (inBar === 4 || inBar === 12) deck.noise(t, 0.06, 0.1, 2500);
    if (inBar % 2 === 1) deck.noise(t, 0.03, 0.04, 7500);
  },
};
