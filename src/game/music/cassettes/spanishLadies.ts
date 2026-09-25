// "Spanish Ladies" (traditional Royal Navy song).
// Scoring: the 6/8 sway it was traditionally sung in — bass on the dotted
// first beat, snare on the second, military roll at the tail of the bar.
// Four-bar phrases trade off the bass drum; the back half gets a crew harmony.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

// 6/8 feel, one ABC unit = an eighth note = 2 steps, 12 steps per bar
const MELODY = abc(
  `G2 G2 ^F2 | G4 GA | B2 A2 G2 | ^F2 D3 D |
   G2 G2 ^F2 | G4 GA | B2 A2 G2 | A4 AA |
   B2 A2 G2 | c2 B2 A2 | d2 G2 GA | ^F=E D2 dc |
   B2 A2 G2 | ^F2 D2 D2 | D2 G2 ^F2 | G4 D2 |`,
  { key: 'Gm', stepsPerUnit: 2 },
);
const LOOP_STEPS = 192;
const STEPS_PER_BAR = 12;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'Spanish Ladies');

// one chord per bar (12 steps)
const CHORDS = chords(`Gm Gm Gm D | Gm Gm Gm D | Gm F Gm D | Gm D D Gm`);

export const spanishLadies: Cassette = {
  title: 'Spanish Ladies',
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.095, 0.128 - (wave - 1) * 0.0028);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const c = CHORDS[bar % CHORDS.length];
    const next = CHORDS[(bar + 1) % CHORDS.length];
    const isBackHalf = bar >= 8;
    const isLastBar = step + STEPS_PER_BAR >= LOOP_STEPS;

    // lead: mellow reed; in the back half the crew hums a third above
    const m = MEL_AT[step];
    if (m) {
      deck.reed(m[0], t, m[1] * sd * 0.92, 0.1, 0, 0, 1400);
      if (isBackHalf) deck.reed(m[0] + 4, t, m[1] * sd * 0.8, 0.035, -0.3);
    }

    // 6/8 bass: root swells on the dotted beat 1, fifth punches on beat 2,
    // a pickup steps into the next bar's root
    if (inBar === 0) deck.bass(c.root, t, sd * 9, 0.32);
    if (inBar === 6) deck.bass(c.fifth - 12, t, sd * 4, 0.26);
    if (inBar === 10 && next.root !== c.root) deck.bass(next.root, t, sd * 1.5, 0.2);

    if (mode === 2) {
      // danger: heartbeat and a dark drone under the march
      if (inBar === 0) deck.drum('sine', 55, 28, t, 0.25, 0.5);
      if (inBar === 8) deck.drum('sine', 50, 26, t, 0.18, 0.32);
      if (inBar === 0) deck.note('sawtooth', c.root - 12, t, sd * 12, 0.04, 400);
      return;
    }

    // held chord pad on beat 2
    if (mode !== 0 && inBar === 4) deck.stab(c.third + 12, c.fifth + 12, t, sd * 3, 0.03);

    if (mode === 1) {
      // bass drum on beat 1 (dropped in the second phrase of each half), snare on beat 2
      const drumming = bar % 4 < 2;
      if (inBar === 0 && drumming) deck.drum('sine', 100, 42, t, 0.16, 0.45);
      if (inBar === 6) deck.snare(t, 0.09);
      // military roll at the tail of the bar
      if (inBar === 10 || inBar === 11) deck.noise(t, 0.04, 0.045, 3500);
      // last bar: roll swells into the crash on the seam
      if (isLastBar && inBar >= 4 && inBar % 2 === 0) deck.snare(t, 0.04 + 0.01 * inBar);
    } else if (mode === 0) {
      // calm: only the roll whispers
      if (inBar === 10 || inBar === 11) deck.noise(t, 0.04, 0.02, 3500);
    }

    if (mode === 1 && step === 0) deck.crash(t, 0.09);
  },
};
