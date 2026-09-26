// "The Broadside March" — the attract screen's own theme.
//
// The Bit Squirrel sting (see `game/splash/fanfare.ts`) is a wall of sound:
// stacked detuned saws, glockenspiel, eighth-note stabs, tambourine and a huge
// generated room. The title screen is that same room a moment later, so this
// tape keeps the sting's chords — D, Bm, G, A — and puts an actual tune over
// them: a four-bar arch that lifts and falls, a dominant bar that climbs into
// the leading tone, and a snare roll that throws you back to the top of the
// loop. Same wall, now with a song.
//
// It is not part of any sea's rotation: it is what plays *before* you choose,
// from the moment the logo fades until the chart's own tape crossfades in.
import type { Cassette } from '../cassette';
import { abc, chords, stepTable } from '../notation';

// 4/4, one ABC unit = an eighth note = 2 sequencer steps
const STEPS_PER_BAR = 16;
const BARS = 8;
const LOOP_STEPS = BARS * STEPS_PER_BAR;

/**
 * The tune, in D. Bars 1-4 are the arch (lift, answer, fall, dominate); bars
 * 5-8 repeat it and land it — a held tonic under the last crash, long enough
 * to breathe before the roll brings the top back.
 */
const MELODY = abc(
  `d3 A f2 a2 | b3 f a2 f2 | g3 d b2 a2 | c2 e2 a2 g2 |
   d3 A f2 a2 | b3 f a2 f2 | b2 a2 g2 f2 | a2 f2 d4 |`,
  { key: 'D', stepsPerUnit: 2 },
);
const MEL_AT = stepTable(MELODY, LOOP_STEPS, 'The Broadside March');

/** One chord per bar — the sting's progression, twice. */
const CHART = chords('D Bm G A D Bm G D');

export const broadsideMarch: Cassette = {
  title: 'The Broadside March',
  loopSteps: LOOP_STEPS,

  /** A march's brisk walk: a 16th note at ~0.128s, tightening a touch per wave. */
  stepDuration(wave) {
    return Math.max(0.098, 0.128 - (wave - 1) * 0.002);
  },

  playStep(deck, step, t, sd, mode) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const inBar = step % STEPS_PER_BAR;
    const eighth = Math.floor(inBar / 2); // which eighth of the bar (0..7)
    const c = CHART[bar % CHART.length];
    const next = CHART[(bar + 1) % CHART.length];

    // ---- the tune: a fiddle lead, with a reed an octave below to thicken it
    //      over the last two bars, where the melody comes home
    const m = MEL_AT[step];
    if (m) {
      deck.fiddle(m[0], t, m[1] * sd * 0.92, 0.115, -0.12);
      if (bar >= 6) deck.reed(m[0] - 12, t, m[1] * sd * 0.8, 0.05, 0.3, 0, 1500);
      // the long notes of the arch get a chime an octave above — the sting's
      // trick for making a tune sound bigger than four players could play
      if (m[1] >= 6) deck.note('sine', m[0] + 12, t, m[1] * sd * 0.7, 0.035, 5200, 0.15);
    }

    // ---- the wall: every chord tone twice, a hair flat and a hair sharp,
    //      panned hard so the band sits around the listener, held for the bar
    if (inBar === 0) {
      for (const tone of [c.root + 12, c.third + 12, c.fifth + 12]) {
        deck.note('sawtooth', tone - 0.06, t, sd * (STEPS_PER_BAR - 1), 0.017, 2400, -0.6);
        deck.note('sawtooth', tone + 0.06, t, sd * (STEPS_PER_BAR - 1), 0.017, 2400, 0.6);
      }
      deck.note('triangle', c.root, t, sd * (STEPS_PER_BAR - 1), 0.05, 900);
    }

    // ---- bass: root, root, fifth, and a lift into the next bar's chord
    if (inBar === 0) deck.bass(c.root, t, sd * 6, 0.32);
    if (inBar === 6) deck.bass(c.root, t, sd * 2, 0.22);
    if (inBar === 8) deck.bass(c.fifth, t, sd * 4, 0.24);
    if (inBar === 14) deck.bass(next.root, t, sd * 2, 0.18);

    // mode 0 — the port at rest: tune, wall and bass only, with a shaker
    if (mode === 0) {
      if (inBar % 2 === 1) deck.noise(t, 0.03, 0.02, 8000);
      return;
    }

    // ---- stabs: the off-beat "pah" of the sting's pianos and guitars
    if (inBar % 2 === 1) {
      deck.stab(c.third + 12, c.fifth + 12, t, sd * 1.6, 0.05);
      deck.note('square', c.root + 24, t, sd * 1.6, 0.022, 1500, -0.35);
    }

    // ---- glockenspiel on the eighths, two octaves over everything
    if (inBar % 2 === 0) {
      const bell = [c.fifth, c.third, c.root + 12, c.third][eighth % 4] + 24;
      deck.note('sine', bell, t, sd * 3.4, 0.045, 4800, 0.3);
    }

    // ---- drums: "boom, boom-boom" with tambourine on the smaller divisions
    if (inBar === 0 || inBar === 6 || inBar === 8) {
      deck.drum('sine', 130, 45, t, 0.16, inBar === 0 ? 0.46 : 0.36);
    }
    if (inBar === 4 || inBar === 12) deck.snare(t, 0.1);
    deck.noise(t, inBar % 2 ? 0.06 : 0.04, inBar % 2 ? 0.05 : 0.028, 7600);

    // ---- crashes: the top of the loop and the cadence bar's last chord
    if (step === 0) deck.crash(t, 0.1);
    if (bar === 3 && inBar === 12) deck.crash(t, 0.08);

    // ---- the last bar: a sixteenth roll and a floor tom, back to the top
    if (bar === BARS - 1 && inBar >= 8) {
      deck.snare(t, 0.035 + (inBar - 8) * 0.011);
      if (inBar === 8) deck.drum('sine', 92, 40, t, 0.3, 0.4);
    }
  },
};
