// "Shenandoah" (traditional American river song, sung by sailors).
// Arrangement: a slow 3/4 ballad — one lonely voice over a long bass,
// a soft kick like a slow heartbeat, and no percussion fill at the seam:
// the song just sighs and starts again on the held note.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

// 3/4, one ABC unit = an eighth note = 2 steps, 12 steps per bar
const MELODY = abc(
  `G,4 CC | C3 DEF | AG3 cB | A3G AG |
   EG3 zG | AAA3E | GEDC3 | zCDE3 |
   EA G4 | CDE3 D | D2 C4 | C6 |`,
  { key: 'C', stepsPerUnit: 2 },
);
const LOOP_STEPS = 144;
const STEPS_PER_BAR = 12;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'Shenandoah');

// one chord per bar (12 steps)
const CHORDS = chords(`C C F C | G C F C | G F G C`);

export const shenandoah: Cassette = {
  title: 'Shenandoah',
  loopSteps: LOOP_STEPS,

  // slow ballad tempo, barely quickening with the waves
  stepDuration(wave) {
    return Math.max(0.135, 0.165 - (wave - 1) * 0.0022);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const c = CHORDS[bar % CHORDS.length];

    // one voice singing; long notes get the vibrato from the reed
    const m = MEL_AT[step];
    if (m) deck.reed(m[0], t, m[1] * sd * 0.95, 0.12, 0, 0, 1500);

    // long bass: root swells through the bar, fifth answers on the third beat
    if (inBar === 0) deck.bass(c.root, t, sd * 10, 0.3);
    if (inBar === 8) {
      const fifthBass = c.fifth - 12 < 39 ? c.fifth : c.fifth - 12; // keep F above F2
      deck.bass(fifthBass, t, sd * 3, 0.22);
    }

    if (mode === 2) {
      // danger: the ballad becomes a dirge — heartbeat and a dark drone
      if (inBar === 0) deck.drum('sine', 55, 28, t, 0.25, 0.5);
      if (inBar === 8) deck.drum('sine', 50, 26, t, 0.18, 0.32);
      if (inBar === 0) deck.note('sawtooth', c.root - 12, t, sd * 12, 0.04, 400);
      return;
    }

    if (mode === 1) {
      // even in a fight the ballad stays gentle: soft kick, faintest pad
      if (inBar === 0) deck.drum('sine', 100, 45, t, 0.1, 0.35);
      if (inBar === 4) deck.stab(c.third + 12, c.fifth + 12, t, sd * 2, 0.02);
      if (inBar === 8) deck.noise(t, 0.04, 0.015, 6000);
    }
    // mode 0 (calm): voice and bass only — the river by itself
  },
};
