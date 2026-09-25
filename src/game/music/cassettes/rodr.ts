// "Róðr" — an original oar-song for the Viking Age.
// A crew chant in a low mode: the leader calls, the oarsmen answer, and the
// only instrument on board is a bone flute with a plucked lyre under it, over
// a big drum and the slap of oars catching water. For the longships that came
// out of the fjords to the North Sea.
import { song } from '../arrange';

export const rodr = song({
  title: 'Róðr (Oar-Song of the North)',
  key: 'Dm',
  unit: 2,
  barSteps: 16,
  chart: `Dm Dm Dm Dm | Am Bb F Dm | Dm F Bb F | C Dm Am Dm`,
  tune: `A,2 D2 F2 E2 | D4 A,4 | A,2 D2 F2 G2 | A8 |
         A2 A2 G2 F2 | E2 E2 D4 | F2 E2 D2 C2 | D8 |
         D2 F2 A2 A2 | A4 G4 | F2 E2 D2 E2 | F8 |
         A2 A2 A2 G2 | F2 E2 D4 | C2 D2 E2 F2 | D8`,
  lead: 'flute', // bone flute
  harmony: 'pluck', // plucked lyre, doubling under the call
  harmonyFrom: 8,
  harmonyInterval: -12,
  bass: 'row',
  feel: 'wardrum',
  tempo: [0.14, 0.002, 0.1],
  hook: (d, b, t) => {
    // a struck shield on the line, and the oars' haul on the turn
    if (b.mode === 1 && b.inBar === 0 && b.phraseBar === 0) d.drum('sine', 160, 70, t, 0.14, 0.3);
    if (b.mode === 1 && b.isLastBar && b.inBar === 14) d.noise(t, 0.16, 0.09, 900);
  },
});
