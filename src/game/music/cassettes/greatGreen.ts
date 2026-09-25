// "The Great Green" (Wadj-wer) — an original song for the Nile Delta.
// Long-breathed and hymn-like: the arched harp carries the tune, a reed pipe
// answers an octave above, sistrum jingles and a soft drum keep the time. For
// Ramesses III's war galleys going out against the Sea Peoples — the first sea
// battle anyone wrote down, and the last of the Bronze Age.
import { song } from '../arrange';

export const greatGreen = song({
  title: 'The Great Green (Wadj-wer)',
  key: 'Am',
  unit: 2,
  barSteps: 16,
  chart: `Am Dm Dm Am | C G Am Dm | Am C G Am`,
  tune: `A,6 C2 | D6 C2 | E4 D4 | A,8 |
         C6 E2 | G6 A2 | G4 E4 | D8 |
         E4 G4 | A4 c4 | A4 G4 | A,8`,
  lead: 'harp', // the arched harp
  harmony: 'flute', // reed pipe answering an octave above
  harmonyFrom: 7,
  harmonyInterval: 12,
  bass: 'drone',
  feel: 'poi', // sistrum jingles and a soft hand drum
  tempo: [0.155, 0.002, 0.112],
  hook: (d, b, t, sd) => {
    // the sistrum shaken at the head of a line, and the deep drum at the turn
    if (b.mode !== 0 && b.inBar === 0 && b.phraseBar % 2 === 1) d.noise(t, 0.09, 0.055, 7200);
    if (b.mode === 1 && b.isLastBar && b.inBar >= 12) d.drum('sine', 78, 34, t, sd * 2, 0.3);
  },
});
