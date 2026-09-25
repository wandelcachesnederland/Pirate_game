// "Hail, Columbia" — Philip Phile, c. 1789; Joseph Hopkinson, 1798. The
// unofficial anthem of the young United States, played at every departure of
// the Navy during the Quasi-War and the Barbary campaigns of 1801–1805, and
// still the Vice President's march. Public domain. Fife lead, fiddle answer,
// a martial drum under it all.
import { song } from '../arrange';

export const hailColumbia = song({
  title: 'Hail, Columbia',
  key: 'F',
  unit: 2,
  barSteps: 16,
  chart: `F F F C Bb F Bb F`,
  tune: `C2 F2 F2 G2 A2 F2 G2 A2 |
         _B2 _B2 A2 G2 F4 z4 |
         A2 _B2 c2 A2 _B2 A2 G2 F2 |
         E2 F2 G2 A2 G4 z4 |
         _B2 _B2 A2 G2 F2 G2 A2 _B2 |
         A2 G2 F2 G2 A4 z4 |
         _B2 A2 G2 A2 _B2 c2 A2 F2 |
         G2 A2 F2 C2 F4 z4`,
  lead: 'flute', // the fife
  harmony: 'fiddle', // the band, an octave down on the chorus
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'pulse',
  feel: 'march',
  tempo: [0.112, 0.002, 0.084],
  hook: (d, b, t, sd) => {
    // a crash of cymbals on the downbeat of each phrase, and the bass drum
    // rolling into the turn
    if (b.mode === 1 && b.inBar === 0 && b.phraseBar === 0) d.crash(t, 0.06);
    if (b.isLastBar && b.inBar >= 12 && b.inBar % 2 === 0) d.drum('sine', 120, 50, t, sd, 0.16);
  },
});
