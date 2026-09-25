// 아리랑 (Arirang) — the Korean folk song, sung on every road and every water
// in the peninsula. The tape for the Korea Strait: a daegeum flute carries the
// tune, the gayageum plucks along an octave below, and the janggu keeps the
// three-four. Admiral Yi's rowers pulled to songs like this one.
// Melody: traditional, after the John Chambers transcription.
import { song } from '../arrange';

export const arirang = song({
  title: '아리랑 (Arirang)',
  key: 'G',
  unit: 2, // 3/4 in eighths: twelve steps to the bar
  barSteps: 12,
  beatSteps: 4,
  chart: `G G Em D | G Em C G | Bm D G D | G Em C G`,
  tune: `D3 E D E | G3 A G A | B2 A B G E | D3 E D E |
         G3 A G A | B A G E D E | G3 A G2 | G6 |
         d4 d2 | d2 B2 A2 | B2 A B G E | D3 E D E |
         G3 A G A | B A G E D E | G3 A G2 | G6`,
  lead: 'flute', // daegeum
  harmony: 'koto', // gayageum
  harmonyFrom: 9,
  harmonyInterval: -12,
  bass: 'threeFour',
  feel: 'tabla',
  tempo: [0.142, 0.002, 0.104],
  hook: (d, b, t) => {
    // the buk's heavy beat opening each line, and a breath of the flute's
    // air across the turn of the phrase
    if (b.inBar === 0 && b.phraseBar === 0) d.drum('sine', 100, 46, t, 0.22, 0.34);
    if (b.mode !== 0 && b.isLastBar && b.inBar >= 9) d.noise(t, 0.04, 0.05, 4200);
  },
});
