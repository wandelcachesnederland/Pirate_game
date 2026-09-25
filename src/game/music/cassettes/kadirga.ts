// "Kadırga" — the galley. An original piece for the Lepanto sea, written in
// maqam Hicaz on G: the flat second and the augmented step that give Ottoman
// music its colour. Zurna over an oud, davul and the kös kettledrum, and the
// oars coming down together — the Sultan's fleet rowing out of the Gulf of
// Patras in 1571.
import { song } from '../arrange';

export const kadirga = song({
  title: 'Kadırga (The Galley)',
  key: 'G', // Hicaz: A flat and E flat written as accidentals in each bar
  unit: 2,
  barSteps: 16,
  chart: `Gm Cm Gm Gm | Bb Eb Cm Gm | Gm Bb Cm Gm`,
  tune: `G2 _A2 B2 G2 | _A2 G2 F4 | B2 c2 B2 _A2 | G8 |
         d2 c2 B2 _A2 | B2 _A2 G4 | _E2 F2 G2 _A2 | G8 |
         G2 B2 d2 B2 | c2 B2 _A4 | G2 _A2 B2 c2 | B2 _A2 G4`,
  lead: 'reed', // zurna
  harmony: 'pluck', // oud
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'row',
  feel: 'march', // davul and the clatter of the mehter
  tempo: [0.125, 0.002, 0.092],
  hook: (d, b, t, sd) => {
    // zil cymbals over the mehter, and the kös at the head of the line
    if (b.mode === 1 && b.inBar === 0 && b.phraseBar % 2 === 0) d.crash(t, 0.06);
    if (b.inBar === 0 && b.phraseBar === 0) d.drum('sine', 64, 28, t, sd * 3, 0.26);
  },
});
