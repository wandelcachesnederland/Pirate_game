// "The Wellerman" (traditional New Zealand whaling song).
// Arrangement: stomp-and-clap crew with a fiddle lead. The 8-bar verse drops
// the stomp on its second half; the 8-bar chorus gets a crew harmony a third up.
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
const STEPS_PER_BAR = 16;
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'Wellerman');

// one chord per half bar (8 steps)
const CHORDS = chords(
  `Em Em | Em Em | Am Em | Em Em | Em Em | Em Em | Am B | Em Em |
   C C | G G | Am Em | Em Em | C C | G G | Am B | Em Em`,
);

export const wellerman: Cassette = {
  title: 'The Wellerman',
  loopSteps: LOOP_STEPS,

  stepDuration(wave) {
    return Math.max(0.1, 0.14 - (wave - 1) * 0.003);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const half = Math.floor(step / 8);
    const c = CHORDS[half % CHORDS.length];
    const next = CHORDS[(half + 1) % CHORDS.length];
    const isChorus = bar >= 8;
    const isLastBar = step + STEPS_PER_BAR >= LOOP_STEPS;

    // lead: fiddle; in the chorus the crew sings along a third above
    const m = MEL_AT[step];
    if (m) {
      deck.fiddle(m[0], t, m[1] * sd * 0.9, 0.1);
      if (isChorus) deck.reed(m[0] + 4, t, m[1] * sd * 0.8, 0.04, 0.35);
    }

    // walking bass: root, fifth, pickup into the next half bar's root
    if (inBar === 0) deck.bass(c.root, t, sd * 7, 0.34);
    if (inBar === 4) deck.bass(c.fifth, t, sd * 3, 0.26);
    if (inBar === 6) deck.bass(next.root, t, sd * 1.2, 0.2);
    if (inBar === 8) deck.bass(next.root, t, sd * 7, 0.3);
    if (inBar === 12) deck.bass(next.fifth, t, sd * 3, 0.24);
    if (inBar === 14) deck.bass(CHORDS[(half + 2) % CHORDS.length].root, t, sd * 1.2, 0.2);

    if (mode === 2) {
      // danger: heartbeat and a dark drone under the tune
      if (inBar === 0) deck.drum('sine', 55, 28, t, 0.25, 0.5);
      if (inBar === 8) deck.drum('sine', 50, 26, t, 0.18, 0.32);
      if (inBar === 0) deck.note('sawtooth', c.root - 12, t, sd * 16, 0.04, 400);
      return;
    }

    // off-beat squeezebox chord
    if (mode !== 0 && (inBar === 4 || inBar === 12)) deck.stab(c.third + 12, c.fifth + 12, t, sd * 1.4, 0.045);

    if (mode === 1) {
      // stomp on 1 & 3 (dropped in the verse's second half), clap on 2 & 4
      const stomping = isChorus || bar < 4;
      if (inBar === 0 && stomping) deck.drum('sine', 110, 40, t, 0.14, 0.5);
      if (inBar === 8 && stomping) deck.drum('sine', 110, 40, t, 0.13, 0.45);
      if (inBar === 4 || inBar === 12) deck.snare(t, 0.1);
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.035, 8000);
      // last bar: snare fill runs into the crash on the seam
      if (isLastBar && inBar >= 8) deck.snare(t, 0.04 + 0.008 * inBar);
    } else if (mode === 0) {
      // calm: a faint shaker keeps time under the tune
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.02, 8000);
    }

    if (mode === 1 && step === 0) deck.crash(t, 0.1);
  },
};
