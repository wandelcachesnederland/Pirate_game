// Theme song cassette: melody, instruments, drums and tempo in one place.
import type { Cassette } from '../cassette';

// "What Shall We Do with the Drunken Sailor" (traditional) — [midi, sixteenth-steps]
const MELODY: [number, number][] = [
  [69, 2], [69, 1], [69, 1], [69, 2], [69, 1], [69, 1], [69, 2], [62, 2], [65, 2], [69, 2],
  [67, 2], [67, 1], [67, 1], [67, 2], [67, 1], [67, 1], [67, 2], [60, 2], [64, 2], [67, 2],
  [69, 2], [69, 1], [69, 1], [69, 2], [69, 1], [69, 1], [69, 2], [71, 2], [72, 2], [74, 2],
  [72, 2], [69, 2], [67, 2], [64, 2], [62, 4], [62, 4],
  [69, 4], [69, 4], [69, 2], [62, 2], [65, 2], [69, 2],
  [67, 4], [67, 4], [67, 2], [60, 2], [64, 2], [67, 2],
  [69, 4], [69, 4], [69, 2], [71, 2], [72, 2], [74, 2],
  [72, 2], [69, 2], [67, 2], [64, 2], [62, 4], [62, 4],
];
const BASS_ROOTS = [50, 50, 48, 48, 50, 50, 48, 50, 50, 50, 48, 48, 50, 50, 48, 50];
const LOOP_STEPS = 128;
const STEPS_PER_BAR = 8;

// Melody note starting at each step of the loop (null = no new note).
const MEL_AT: ([number, number] | null)[] = (() => {
  const arr: ([number, number] | null)[] = new Array(LOOP_STEPS).fill(null);
  let s = 0;
  for (const n of MELODY) {
    if (s < LOOP_STEPS) arr[s] = n;
    s += n[1];
  }
  return arr;
})();

export const drunkenSailor: Cassette = {
  title: 'What Shall We Do with the Drunken Sailor',
  loopSteps: LOOP_STEPS,

  // Speeds up a little every wave, down to a minimum step length.
  stepDuration(wave) {
    return Math.max(0.098, 0.132 - (wave - 1) * 0.0028);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const root = BASS_ROOTS[bar % BASS_ROOTS.length];
    const phrase = Math.floor(bar / 4) % 2; // 0 = driving, 1 = crew drops the kick
    const isLastBar = step + STEPS_PER_BAR >= LOOP_STEPS;

    // melody: reed lead; on the back half the crew joins in a third above
    const m = MEL_AT[step];
    if (m) {
      deck.reed(m[0], t, m[1] * sd * 0.92, 0.11);
      if (phrase === 1) deck.reed(m[0] + 4, t, m[1] * sd * 0.8, 0.04, 0.3);
    }

    // walking bass: root, fifth below, fifth below, octave pop
    if (inBar === 0) deck.bass(root, t, sd * 3, 0.34);
    if (inBar === 2) deck.bass(root - 5, t, sd * 1.5, 0.26);
    if (inBar === 4) deck.bass(root - 5, t, sd * 1.5, 0.26);
    if (inBar === 6) deck.bass(root + 7, t, sd, 0.18);

    if (mode === 2) {
      // danger: heartbeat and a dark drone under the melody
      if (inBar === 0) deck.drum('sine', 55, 28, t, 0.25, 0.5);
      if (inBar === 4) deck.drum('sine', 50, 26, t, 0.18, 0.32);
      if (inBar === 0) deck.note('sawtooth', root - 12, t, sd * 8, 0.04, 400);
      return;
    }

    // off-beat chord "pah"
    if (mode !== 0 && (inBar === 2 || inBar === 6)) deck.stab(root + 4, root + 7, t, sd * 0.9, 0.05);

    if (mode === 1) {
      // full crew: kick on 1 & 3 (dropped in the odd phrases), snare on 2 & 4
      if (inBar === 0) deck.drum('sine', 130, 45, t, 0.12, 0.45);
      if (inBar === 4 && phrase === 0) deck.drum('sine', 130, 45, t, 0.12, 0.42);
      if (inBar === 2 || inBar === 6) deck.snare(t, inBar === 2 ? 0.08 : 0.09);
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.035, 8000);
      // last bar: 8th-note snare fill runs into the crash on the seam
      if (isLastBar && inBar >= 2) deck.snare(t, 0.04 + 0.015 * inBar);
    } else if (mode === 0) {
      // calm: just a whisper of shaker under the tune
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.02, 8000);
    }

    // crash swell so the loop seam feels like a downbeat, not a cut
    if (mode === 1 && step === 0) deck.crash(t, 0.1);
  },
};
