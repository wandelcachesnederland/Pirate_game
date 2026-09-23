// "Haul Away Joe" (traditional sheet shanty).
// Arrangement: gruff crew lead with a big "haul" drum on every "Joe!".
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

  playStep(deck, step, t, sd) {
    // lead: sawtooth with a square an octave down (a crew singing together)
    const m = MEL_AT[step];
    if (m) {
      deck.note('sawtooth', m[0], t, m[1] * sd * 0.9, 0.075, 1300);
      deck.note('square', m[0] - 12, t, m[1] * sd * 0.85, 0.04, 900);
    }
    const bar = Math.floor(step / 16);
    const inBar = step % 16;
    const c = CHORDS[Math.floor(step / 8) % CHORDS.length];
    // bass on every half-bar chord change
    if (inBar === 0 || inBar === 8) deck.note('triangle', c.root, t, sd * 6, 0.32, 800);
    // soft sustained chord
    if (inBar === 0 || inBar === 8) {
      deck.note('triangle', c.third + 12, t, sd * 7, 0.045, 1500);
      deck.note('triangle', c.fifth + 12, t, sd * 7, 0.04, 1500);
    }
    // drums
    if (inBar === 0) deck.drum('sine', 95, 35, t, 0.22, 0.55);
    if (inBar === 8) deck.drum('sine', 110, 40, t, 0.14, 0.35);
    if (inBar === 4 || inBar === 12) deck.noise(t, 0.07, 0.11, 1600);
    if (inBar % 2 === 1) deck.noise(t, 0.03, 0.03, 8000);
    // HAUL! — extra-heavy hit on "Joe" at the end of every phrase
    if (bar % 4 === 3 && inBar === 8) {
      deck.drum('sine', 80, 30, t, 0.35, 0.6);
      deck.noise(t, 0.3, 0.1, 700);
    }
  },
};
