// "Colonel Bogey March" — Kenneth J. Alford (F. J. Ricketts), 1914. The
// whistled strain every naval band played through the Second World War and
// down the River Kwai. Public domain (composer d. 1945). Piccolo lead, the
// band answering on the repeat, snare and bass drum at the quick march.
import { song } from '../arrange';

export const colonelBogey = song({
  title: 'Colonel Bogey March',
  key: 'G',
  unit: 2,
  barSteps: 16,
  chart: `G G D G G G D G C D G G`,
  tune: `G3/ G/ B3/ B/ d4 |
         B3/ B/ G3/ G/ E4 |
         F3/ F/ A3/ A/ G4 z4 |
         D3/ D/ G3/ G/ B4 |
         G3/ G/ B3/ B/ d4 |
         B3/ B/ G3/ G/ E4 |
         F3/ F/ A3/ A/ B3/ B/ d4 |
         d8 z8 |
         G2 F2 G2 A2 B2 d2 z4 |
         c3/ B/ A3/ G/ F4 |
         G2 G2 A2 B2 G4 z4 |
         B3/ G/ d3/ B/ G4 z4`,
  lead: 'flute', // the piccolo whistle
  harmony: 'reed', // the band answers on the second time through
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'pulse',
  feel: 'march',
  tempo: [0.108, 0.002, 0.082],
  hook: (d, b, t) => {
    // the two-note "bogey" golf whistle over the first bar of the loop
    if (b.step === 14) d.note('sine', 71, t, 0.16, 0.07, 3600);
    if (b.step === 15) d.note('sine', 64, t, 0.22, 0.07, 3600);
  },
});
