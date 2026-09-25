// "Blow the Man Down" (traditional halyard shanty).
// Arrangement: oom-pah-pah waltz with a reedy lead. The bass walks
// root - fifth - root with an octave pop on the "and" of three; the odd
// phrases drop the kick, and the last four bars get a crew harmony.
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
const STEPS_PER_BAR = 12;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'Blow the Man Down');

// one chord per bar (12 steps)
const CHORDS = chords(`C C C C | C A Dm G | Dm G Dm Dm | G G C C`);

export const blowTheManDown: Cassette = {
  title: 'Blow the Man Down',
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.075, 0.098 - (wave - 1) * 0.002);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const c = CHORDS[bar % CHORDS.length];
    const phrase = Math.floor(bar / 4) % 2; // 0 = full, 1 = kick drops out
    const isLastBar = step + STEPS_PER_BAR >= LOOP_STEPS;

    // lead: reed with a whisper of a crew harmony in the last four bars
    const m = MEL_AT[step];
    if (m) {
      deck.reed(m[0], t, m[1] * sd * 0.9, 0.12, 0, 0, 2200);
      if (bar >= 12) deck.reed(m[0] + 4, t, m[1] * sd * 0.8, 0.04, 0.3);
    }

    // oom ... pah ... pah, with a fifth on beat 3 and an octave pop
    if (inBar === 0) deck.bass(c.root, t, sd * 6, 0.34);
    if (inBar === 8) deck.bass(c.fifth - 12, t, sd * 3, 0.24);
    if (inBar === 10) deck.bass(c.root + 12, t, sd, 0.16);

    if (mode === 2) {
      // danger: heartbeat and a dark drone under the waltz
      if (inBar === 0) deck.drum('sine', 55, 28, t, 0.25, 0.5);
      if (inBar === 8) deck.drum('sine', 50, 26, t, 0.18, 0.32);
      if (inBar === 0) deck.note('sawtooth', c.root - 12, t, sd * 12, 0.04, 400);
      return;
    }

    if (mode !== 0) {
      if (inBar === 4) deck.stab(c.third + 12, c.fifth + 12, t, sd * 1.6, 0.04);
      if (inBar === 8) deck.stab(c.third + 12, c.fifth + 12, t, sd * 1.6, 0.035);
    }

    if (mode === 1) {
      // kick on 1 (dropped in the odd phrases), soft military snare on 2 & 3
      if (inBar === 0 && phrase === 0) deck.drum('sine', 120, 45, t, 0.12, 0.45);
      if (inBar === 4 || inBar === 8) deck.snare(t, 0.06);
      if (inBar === 2 || inBar === 6 || inBar === 10) deck.noise(t, 0.03, 0.03, 8000);
      // last bar: snare fill runs into the crash on the seam
      if (isLastBar && inBar >= 4 && inBar % 2 === 0) deck.snare(t, 0.04 + 0.012 * inBar);
    } else if (mode === 0) {
      // calm: a faint tambourine marks the waltz
      if (inBar === 2 || inBar === 6 || inBar === 10) deck.noise(t, 0.03, 0.02, 8000);
    }

    if (mode === 1 && step === 0) deck.crash(t, 0.09);
  },
};
