// 茉莉花 (Jasmine Flower, Mo Li Hua) — the Jiangsu song from the Ming docks.
// Pentatonic, unhurried, a dizi over a guzheng — the tape for the Treasure
// Fleet: Zheng He's junks in the Straits of Malacca in 1405, banners on the
// masts and the tide running two ways under the fleet at once.
// Melody: anonymous 18th-century xiaodiao, after the setting collected on
// thesession.org as "Jasmine Flower".
import { song } from '../arrange';

export const jasmineFlower = song({
  title: '茉莉花 (Jasmine Flower)',
  key: 'D',
  unit: 2,
  barSteps: 16,
  chart: `D G D G | D D Em Em | G Am D Em | D`,
  tune: `B2 B d e g g e | d2 d e d4 |
         B2 B d e g g e | d2 d e d4 |
         d2 d2 d2 B d | e2 e2 d4 |
         B2 A B d2 B A | B A G B A3 B |
         d2 e g d4 | A2 B d A B G E |
         D8 | E2 G2 A3 B |
         G A G E D4 |`,
  lead: 'flute', // dizi, the bamboo flute
  harmony: 'koto', // pipa doubling the tune an octave down
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'drone',
  feel: 'gong', // temple drum, woodblock and the great gong
  tempo: [0.132, 0.0022, 0.1],
  hook: (d, b, t) => {
    // a gong on the head of the song, and the woodblock clacking the turn
    if (b.mode === 1 && b.inBar === 0 && b.phraseBar === 0) d.crash(t, 0.09);
    if (b.mode === 1 && b.isLastBar && b.inBar === 12) d.noise(t, 0.04, 0.09, 2000);
  },
});
