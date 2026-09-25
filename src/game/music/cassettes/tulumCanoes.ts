// "Canoes of Tulum" — an original song for the Maya coast, 1517.
// A clay ocarina over the five-tone scale of the Maya flutes, with the wooden
// teponaztli playing the tune an octave below, paddle-strokes and rattles
// keeping time. For the great trading canoes working the Bay of Honduras —
// the crews that met the first Spanish ships off Yucatán.
import { song } from '../arrange';

export const tulumCanoes = song({
  title: 'Canoes of Tulum',
  key: 'C', // five-tone: C D E G A
  unit: 2,
  barSteps: 16,
  chart: `C F G C | F C G C | Am F G C`,
  tune: `C2 D2 E2 G2 | E2 D2 C4 | G2 A2 G2 E2 | D4 E4 |
         C2 E2 G2 A2 | G2 E2 D4 | C2 D2 E2 D2 | C8 |
         A2 A2 G2 E2 | G2 E2 D4 | C2 D2 E2 G2 | A8`,
  lead: 'flute', // clay ocarina
  harmony: 'koto', // teponaztli, the wooden slit drum, doubling the tune
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'pulse',
  feel: 'paddle',
  tempo: [0.14, 0.002, 0.1],
  hook: (d, b, t, sd) => {
    // a shell trumpet across the water, and turtle shell scraped on the turn
    if (b.inBar === 0 && b.phraseBar === 0) d.drum('triangle', 300, 180, t, sd * 6, 0.13);
    if (b.mode === 1 && b.isLastBar && b.inBar >= 12) d.noise(t, 0.08, 0.1, 3000);
  },
});
