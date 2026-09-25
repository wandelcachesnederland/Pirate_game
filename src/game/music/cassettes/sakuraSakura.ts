// さくら さくら (Sakura Sakura) — the old Edo melody of the cherry blossom, and
// the tape for the Seto Inland Sea. It stays inside the "in" scale (A B C E F),
// the pentatonic that carries no semitones, played on a shakuhachi with a koto
// doubling an octave below and a taiko under it. For the daimyō fleets — and
// for the ninja's boats — working the strait in the 1570s.
// Melody: traditional, after the transcription in the John Chambers archive.
import { song } from '../arrange';

export const sakuraSakura = song({
  title: 'さくら さくら (Sakura Sakura)',
  key: 'Am', // the in scale: A B C E F, no semitones anywhere
  unit: 2,
  barSteps: 16,
  chart: `Am Am Am Dm | Am Em Am Dm | Am Em Am Am | Dm Am`,
  tune: `A2 A2 B4 | A2 A2 B4 | A2 B2 c2 B2 | A2 B A F4 |
         E2 C2 E2 F2 | E2 E C B,4 | A2 B2 c2 B2 | A2 B A F4 |
         E2 C2 E2 F2 | E2 E C B,4 | A2 A2 B4 | A2 A2 B4 |
         D2 E2 F4 | B A F2 E4`,
  lead: 'flute', // shakuhachi
  harmony: 'koto',
  harmonyFrom: 7,
  harmonyInterval: -12,
  bass: 'drone',
  feel: 'taiko',
  tempo: [0.15, 0.002, 0.108],
  hook: (d, b, t) => {
    // hyōshigi, the wooden clappers, and a koto pluck opening each line
    if (b.mode === 1 && b.inBar === 0 && b.phraseBar % 2 === 1) {
      d.note('triangle', b.chord.root + 24, t, 0.07, 0.055, 3200);
    }
    if (b.mode === 1 && b.isLastBar && b.inBar === 14) d.noise(t, 0.03, 0.08, 2600);
  },
});
