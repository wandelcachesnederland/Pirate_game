// "It's a Long Way to Tipperary" — the song they marched to France singing.
// Jack Judge & Harry Williams, 1912; the chorus carried every British and
// Irish unit to the Western Front and across the North Sea with the Grand
// Fleet. Public domain. Melody after the 1912 Chappell sheet music, set here
// in G for a cornet-and-fiddle band under a quick-step drum.
import { song } from '../arrange';

export const tipperary = song({
  title: "It's a Long Way to Tipperary",
  key: 'G',
  unit: 2,
  barSteps: 16,
  chart: `G G C D G C G D G`,
  tune: `D2 D2 G2 G2 A2 B2 z2 |
         B2 A2 G2 z2 D2 D2 |
         G2 G2 A2 B2 D4 z4 |
         B2 B2 C2 D2 D2 C2 A2 |
         G2 G2 A2 B2 A2 G2 E2 |
         C2 C2 E2 D2 C2 B2 z4 |
         D2 D2 G2 A2 B2 C2 D2 z2 |
         B2 A2 G2 C2 E2 D2 z4 |
         A2 G6 z8`,
  lead: 'reed', // the cornet up front
  harmony: 'fiddle', // the band, an octave down on the back half
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'walk',
  feel: 'march',
  tempo: [0.115, 0.002, 0.085],
  hook: (d, b, t) => {
    // a snare roll into every phrase turn, the way the bands played it
    if (b.mode === 1 && b.isLastBar && b.inBar >= 12 && b.inBar % 2 === 0) d.snare(t, 0.04);
  },
});
