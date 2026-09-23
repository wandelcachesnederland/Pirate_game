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

  playStep(deck, step, t, sd) {
    // melody: square lead doubled an octave up by a triangle
    const m = MEL_AT[step];
    if (m) {
      deck.note('square', m[0], t, m[1] * sd * 0.92, 0.11, 1500);
      deck.note('triangle', m[0] + 12, t, m[1] * sd * 0.8, 0.05, 3000);
    }
    // bass: root on beat 1, fifth below on beat 3
    const bar = Math.floor(step / 8);
    const inBar = step % 8;
    const root = BASS_ROOTS[bar % BASS_ROOTS.length];
    if (inBar === 0) deck.note('triangle', root, t, sd * 3, 0.32, 900);
    if (inBar === 4) deck.note('triangle', root - 5, t, sd * 3, 0.28, 900);
    if (inBar === 2 || inBar === 6) {
      // off-beat chord "pah"
      const third = root === 50 ? 65 : 64;
      deck.note('square', root + 12, t, sd * 0.9, 0.035, 1200);
      deck.note('square', third, t, sd * 0.9, 0.03, 1200);
    }
    // percussion
    if (inBar === 0 || inBar === 4) {
      deck.drum('sine', 130, 45, t, 0.12, 0.45);
    }
    if (inBar % 2 === 1 || inBar === 2 || inBar === 6) {
      deck.noise(t, 0.04, inBar % 2 === 1 ? 0.05 : 0.09, 7000);
    }
  },
};
