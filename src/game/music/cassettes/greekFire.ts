// "Greek Fire" (Ὑγρὸν Πῦρ) — an original chant for the Siege of Constantinople.
// Byzantine chant keeps an ison: one voice holds the drone while the cantors
// move above it, and the second choir answers an octave up. Here the low cantor
// carries the line over a slow frame drum, and under it the semantron — the
// struck wooden beam that called the crews to stations — beats the time. For
// the Caliph's fleet in the Bosporus, 717.
import { song } from '../arrange';

export const greekFire = song({
  title: 'Greek Fire (Ὑγρὸν Πῦρ)',
  key: 'Am',
  unit: 2,
  barSteps: 16,
  chart: `Am Am Am F | C F G Am | Am F G Am`,
  tune: `A6 B2 | c4 B4 | A6 G2 | F8 |
         E4 F4 | G4 A4 | B6 c2 | B8 |
         A6 c2 | B4 G4 | A4 G4 | A8`,
  lead: 'chant', // the low cantor
  harmony: 'reed', // the second choir, one octave up over the ison
  harmonyFrom: 5,
  harmonyInterval: 12,
  bass: 'drone', // the ison
  feel: 'frame',
  tempo: [0.17, 0.002, 0.12],
  hook: (d, b, t, sd) => {
    // the semantron struck to call the crews, and the siphon letting go
    if (b.inBar === 0 && b.phraseBar === 0) d.drum('triangle', 180, 90, t, sd * 3, 0.2);
    if (b.mode === 1 && b.phraseBar === 3 && b.isLastBar && b.inBar >= 8) d.noise(t, 0.5, 0.06, 2600);
  },
});
