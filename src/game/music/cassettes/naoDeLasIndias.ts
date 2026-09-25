// "Nao de las Indias" — an original 16th-century Spanish sea song for the Age
// of Exploration. A pipe over a vihuela, in the minor with the phrygian
// cadences every Spanish sailor knew, with a tambourine keeping the 6/8. For
// the caravels beating back from the Main to Sevilla with the plate fleet.
import { song } from '../arrange';

export const naoDeLasIndias = song({
  title: 'Nao de las Indias',
  key: 'Dm',
  unit: 2, // 6/8: an eighth note is the unit, twelve steps to the bar
  barSteps: 12,
  beatSteps: 4,
  chart: `Dm Bb C Dm | Dm Bb C Dm | Am Dm Bb Dm`,
  tune: `D2 F2 A2 | A2 G2 F2 | E2 D2 C2 | D6 |
         F2 A2 c2 | c2 B2 A2 | G2 F2 E2 | D6 |
         A2 A2 d2 | d2 c2 A2 | B2 A2 G2 | F2 E2 D2`,
  lead: 'flute', // chirimía
  harmony: 'pluck', // vihuela
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'sixEight',
  feel: 'frame', // tambourine
  tempo: [0.13, 0.002, 0.098],
  hook: (d, b, t) => {
    // castanets rattling the off-beats, and a shout on the heave
    if (b.mode === 1 && b.inBar === 5) d.noise(t, 0.03, 0.05, 6000);
    if (b.mode === 1 && b.isLastBar && b.inBar === 10) d.snare(t, 0.06);
  },
});
