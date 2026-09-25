// "Kadaram" — an original Tamil sea song for the Chola expeditions, on the
// Bay of Bengal, 1025. Raga Hamsadhwani (the five notes S R G P N — bright and
// auspicious), veena carrying the tune with the venu answering an octave up,
// a mridangam laying the tala and a tanpura droning underneath. For the fleet
// that crossed to Srivijaya and came back with the port of Kadaram.
import { song } from '../arrange';

export const kadaram = song({
  title: 'Kadaram (The Tiger’s Port)',
  key: 'C', // Hamsadhwani: C D E G A — no F, no B
  unit: 2,
  barSteps: 16,
  chart: `C C G C | Am C G C | Am C G C`,
  tune: `C2 D2 E2 G2 | A2 G2 E4 | G2 E2 D2 E2 | C8 |
         A2 c2 A2 G2 | E2 G2 A4 | G2 E2 D2 E2 | C8 |
         E2 G2 A2 c2 | c2 A2 G4 | A2 G2 E2 G2 | C8`,
  lead: 'koto', // veena
  harmony: 'flute', // venu, taking the line an octave up in the second half
  harmonyFrom: 5,
  harmonyInterval: 12,
  bass: 'drone', // tanpura
  feel: 'tabla', // mridangam
  tempo: [0.135, 0.002, 0.098],
  hook: (d, b, t) => {
    // a strummed accent opening each bar: the gamaka going up to the note
    if (b.mode === 1 && b.inBar === 0) d.note('triangle', b.chord.root + 24, t, 0.09, 0.045, 2800);
    // the mridangam's answer on the seam
    if (b.mode === 1 && b.isLastBar && b.inBar >= 12) d.drum('sine', 150, 100, t, 0.07, 0.2);
  },
});
