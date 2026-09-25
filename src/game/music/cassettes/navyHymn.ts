// "Eternal Father, Strong to Save" — the Navy Hymn (tune: MELITA).
// William Whiting, 1860; John Bacchus Dykes, 1861. Sung in the wardroom of
// every navy in the English-speaking world, and through the Second World War
// at every ship lost at sea — FDR asked for it at Hyde Park in 1945. Public
// domain. Slow, bowed, with the crew's voices underneath and the ship's bell
// on the phrases.
import { song } from '../arrange';

export const navyHymn = song({
  title: 'Eternal Father, Strong to Save',
  key: 'C',
  unit: 2,
  barSteps: 16,
  chart: `C F C G F C`,
  tune: `E4 D2 C2 D2 E2 G4 |
         A4 G2 E2 G2 F2 E4 |
         D4 E2 F2 G2 A2 B4 |
         c4 B2 A2 G2 F2 E4 |
         D2 E2 F2 G2 A2 B2 c4 z2 |
         B2 A2 G2 F2 E2 D2 C4`,
  lead: 'fiddle', // the bowed line
  harmony: 'chant', // the crew, an octave down, from the third line
  harmonyFrom: 3,
  harmonyInterval: -12,
  harmonyVol: 0.05,
  bass: 'walk',
  legato: 0.95,
  tempo: [0.165, 0.001, 0.115],
  hook: (d, b, t, sd) => {
    // the ship's bell: once at the head of each phrase
    if (b.inBar === 0 && b.phraseBar === 0) d.note('sine', b.chord.root + 24, t, sd * 6, 0.05, 4200);
  },
});
