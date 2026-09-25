// Aloha ʻOe — "Farewell to Thee", written by Queen Liliʻuokalani in 1877, the
// year the islands were still their own kingdom. The tape for the Kona Coast:
// a slack-key guitar and ukulele carry it, with ipu and poi shakers keeping
// the island's own time under Kamehameha's fleet.
// Melody: Liliʻuokalani (1877), after the John Chambers transcription.
import { song } from '../arrange';

export const alohaOe = song({
  title: 'Aloha ʻOe',
  key: 'G',
  unit: 2,
  barSteps: 16,
  chart: `G C G D | G C D G | G C G D | G C D G | G`,
  tune: `B2 B A G F G E | D4 z2 B2 | A3 ^G A A c B | A4 z2 D G |
         B3 A G F G E | D4 z2 D D |
         E2 A G F B A F | G4 z4 |
         G G F z E2 z2 | G2 c E E E z2 | D2 G2 B2 G G | F F F G A ^G A c |
         B4 G2 z F | E2 G2 c3 E | D D G G B3 G | F3 G B A2 F | G4 z4`,
  lead: 'pluck', // ukulele / kī hōʻalu
  harmony: 'harp', // slack-key guitar an octave down in the chorus
  harmonyFrom: 8,
  harmonyInterval: -12,
  bass: 'drone',
  feel: 'poi',
  tempo: [0.15, 0.002, 0.11],
  hook: (d, b, t, sd) => {
    // ukulele strums on the off-beats, and the chorus answered an octave down
    if (b.mode !== 0 && (b.inBar === 4 || b.inBar === 12)) {
      d.stab(b.chord.third + 12, b.chord.fifth + 12, t, sd * 1.3, 0.032);
    }
    if (b.mode === 0 && b.inBar === 0 && b.phraseBar === 0) d.noise(t, 0.08, 0.05, 3500);
  },
});
