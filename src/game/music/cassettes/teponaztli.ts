// "Teponaztli" — an original song for the defence of Tenochtitlan, 1521.
// Pre-Hispanic music kept its own five-tone scale and its two drums: the
// huehuetl, a tall skin drum, and the teponaztli, a hardwood slit drum with a
// tongue cut in each of its two notes. Here the clay flute carries the line,
// the slit drum doubles it an octave down, and the huehuetl drives it, with a
// conch opening every phrase. For Cuauhtémoc's war canoes on Lake Texcoco.
import { song } from '../arrange';

export const teponaztli = song({
  title: 'Teponaztli (Lake Texcoco)',
  key: 'Am', // the five-tone scale: A C D E G
  unit: 2,
  barSteps: 16,
  chart: `Am Dm Dm Am | Am Dm C Dm | Am C Dm Am`,
  tune: `A,2 A,2 C2 A,2 | G,2 A,2 C2 D2 | E2 D2 C2 A,2 | A,8 |
         A,2 C2 D2 E2 | D2 C2 A,4 | E2 G2 A2 G2 | E2 D2 C4 |
         A,2 A,2 C2 D2 | E2 G2 A4 | G2 E2 D2 C2 | A,8`,
  lead: 'flute', // clay flute
  harmony: 'koto', // the teponaztli, playing the tune on the slit drum
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'pulse',
  feel: 'wardrum',
  tempo: [0.13, 0.002, 0.094],
  hook: (d, b, t, sd) => {
    // the conch (tecciztli) across the water, and the huehuetl at the seam
    if (b.inBar === 0 && b.phraseBar === 0) d.drum('triangle', 280, 170, t, sd * 5, 0.14);
    if (b.mode === 1 && b.isLastBar && b.inBar >= 12) {
      d.drum('sine', 145, 62, t, 0.14, 0.34);
      if (b.inBar >= 14) d.drum('sine', 150, 66, t, 0.12, 0.26);
    }
  },
});
