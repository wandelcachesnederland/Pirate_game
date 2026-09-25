// لمّا بدا يتثنّى — "Lamma Bada Yatathanna".
// The great Andalusian muwashshah (attributed to Ibn al-Khatib, 1313–1374),
// a standard of every Arabic repertoire since. It is in maqam Nahawand on G —
// the harmonic-minor colour, with F sharp against the flat sixth — over the
// 10/8 samai rhythm. The tape for the monsoon seas: kamancheh lead, oud
// doubling, darbuka and riq.
// Melody: traditional, after the Tous aux Balkans transcription.
import { song } from '../arrange';

export const lammaBada = song({
  title: 'لما بدا يتثنى (Lamma Bada Yatathanna)',
  key: 'Gm',
  unit: 2, // 10/8: an eighth note is the unit, twenty steps to the bar
  barSteps: 20,
  beatSteps: 5,
  phraseBars: 4,
  chart: `Gm Gm Cm D | Cm Gm Gm Bb | F Bb Cm D | Cm`,
  tune: `G2 A/ B/ c/ B/ B/ A/ A/ G/ G/ ^F/ G2 D |
         G2 A/ B/ c/ B/ B/ A/ A/ G/ G/ ^F/ G2 A/ B/ |
         c2 d B3/2 A/ A/ G/ G/ ^F/ G2 A/ G/ |
         ^F2 G/ F/ E3/2 D/ E/ D/ E/ F/ D2 E |
         C2 D B,3/2 A,/ A,/ G,/ G,/ ^F,/ G,2 D |
         G2 A/ B/ c/ B/ B/ A/ A/ G/ G/ ^F/ G2 D |
         G2 A/ B/ c/ B/ B/ A/ A/ G/ G/ ^F/ G2 B |
         B2 B B2 B A/ c/ B2 B |
         d2 c d/ c/ B/ A/ B/ A/ G/ B/ A2 =F |
         G2 A B2 B A/ c/ B2 A/ B/ |
         c2 d B3/2 A/ A/ G/ G/ ^F/ G2 A/ G/ |
         ^F2 G/ F/ E3/2 D/ E/ D/ E/ F/ D2 E |
         C2 D B,3/2 A,/ A,/ G,/ G,/ ^F,/ G,3`,
  lead: 'fiddle', // kamancheh
  harmony: 'pluck', // oud doubling the voice in the second half
  harmonyFrom: 6,
  harmonyInterval: -12,
  bass: 'drone',
  feel: 'darbuka',
  tempo: [0.113, 0.002, 0.086],
  hook: (d, b, t) => {
    // riq jingles on the five-step groups: the cross-rhythm under the 10/8
    if (b.mode === 1 && b.inBar % 5 === 0) d.noise(t, 0.04, 0.035, 6500);
    // a hand clap on the turn, the way a chorus answers the soloist
    if (b.mode === 1 && b.phraseBar === 3 && b.isLastBar && b.inBar === 15) d.snare(t, 0.09);
  },
});
