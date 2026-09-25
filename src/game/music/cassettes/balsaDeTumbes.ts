// "Balsa de Tumbes" — an original song for the Inca Pacific voyages, 1465.
// Quena flute over a charango and a bombo, in the five-tone scale the Andean
// world has always used. Tupac Yupanqui's balsa rafts traded up the coast from
// Guayaquil; this is what a crew sang on the long leg south, with the current
// under the logs and no land to windward.
import { song } from '../arrange';

export const balsaDeTumbes = song({
  title: 'Balsa de Tumbes',
  key: 'Am', // Andean pentatonic: A C D E G
  unit: 2,
  barSteps: 16,
  chart: `Am C G Am | C Dm Am Am | F C G Am`,
  tune: `A,2 C2 D4 | E2 D2 C4 | D2 E2 G2 A2 | G4 E4 |
         A2 C2 D2 E2 | D2 C2 A,4 | E2 G2 A2 C2 | A,8 |
         C2 D2 E2 G2 | E2 D2 C4 | D2 C2 A,2 C2 | A,8`,
  lead: 'flute', // quena
  harmony: 'pluck', // charango
  harmonyFrom: 7,
  harmonyInterval: -12,
  bass: 'pulse', // the bombo
  feel: 'frame',
  tempo: [0.145, 0.002, 0.105],
  hook: (d, b, t, sd) => {
    // the bombo under the phrase, and panpipes answering on the off-beat
    if (b.inBar === 0 && b.phraseBar === 0) d.drum('sine', 88, 40, t, sd * 3, 0.28);
    if (b.mode === 1 && (b.inBar === 6 || b.inBar === 14)) {
      d.stab(b.chord.third + 12, b.chord.fifth + 12, t, sd * 1.6, 0.028);
    }
  },
});
