// "Cọc Ngầm" — the hidden stakes. An original song for Bạch Đằng, 1288, on the
// northern (bắc) pentatonic: C D F G A, bright and open. A sáo bamboo flute
// over a đàn tranh zither, paddle-strokes under it, and at the end of every
// phrase the tide coming over the ironwood stakes driven into the river bed.
import { song } from '../arrange';

export const cocNgam = song({
  title: 'Cọc Ngầm (The Hidden Stakes)',
  key: 'C', // bắc scale: C D F G A — no E, no B
  unit: 2,
  barSteps: 16,
  chart: `C F G C | F F G F | Am Dm G C`,
  tune: `C2 D2 F2 G2 | A2 G2 F4 | G2 F2 D2 F2 | C8 |
         F2 G2 A2 c2 | c2 A2 G4 | F2 G2 A2 G2 | F8 |
         A2 c2 A2 G2 | F2 D2 F4 | G2 F2 D2 C2 | C8`,
  lead: 'flute', // sáo
  harmony: 'koto', // đàn tranh
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'drone',
  feel: 'paddle',
  tempo: [0.14, 0.002, 0.1],
  hook: (d, b, t) => {
    // a bronze bell at the head of each line, and the tide breaking in
    if (b.inBar === 0 && b.phraseBar === 0) d.note('sine', b.chord.root + 24, t, 0.5, 0.045, 3400);
    if (b.mode === 1 && b.isLastBar && b.inBar >= 12) d.noise(t, 0.3, 0.08, 800);
  },
});
