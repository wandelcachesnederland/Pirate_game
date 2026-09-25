// "Tangeh-ye Hormoz" (تنگه هرمز — The Strait of Hormuz). An original piece for
// the Tanker War sea, written in the manner of Dastgāh-e Shur on G — the flat
// second (A flat) leaning on the tonic the way Persian classical music leans,
// with the forud falling to the lower octave. Kamancheh lead, oud doubling,
// tombak and riq under it: the fast 6/8 lilt of the Gulf's Bandari dance.
// (An original tape in the period idiom — the war itself had no band aboard.)
import { song } from '../arrange';

export const tangehHormoz = song({
  title: 'Tangeh-ye Hormoz (The Strait of Hormuz)',
  key: 'Gm', // Shur on G: the A flat is written in as an accidental
  unit: 2,
  barSteps: 16,
  chart: `Gm Cm Gm D Gm Cm Gm Gm`,
  tune: `G2 _A2 B2 C2 D2 C2 B2 _A2 |
         G4 F2 G2 _A2 G2 F2 D2 |
         D2 Eb2 F2 G2 F2 Eb2 D2 C2 |
         Bb2 C2 D2 Eb2 D2 C2 Bb2 _A2 |
         g2 _a2 g2 f2 eb2 f2 g4 z4 |
         g2 f2 eb2 d2 C4 z4 |
         D2 Eb2 F2 G2 Bb2 A2 G2 F2 |
         G2 _A2 G2 F2 G8`,
  lead: 'fiddle', // kamancheh
  harmony: 'pluck', // oud doubling the lower octave
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'drone',
  feel: 'darbuka',
  tempo: [0.118, 0.002, 0.088],
  hook: (d, b, t) => {
    // riq jingles chasing the tombak, and a hand clap on the phrase turn
    if (b.mode === 1 && b.inBar % 4 === 2) d.noise(t, 0.04, 0.03, 6500);
    if (b.mode === 1 && b.isLastBar && b.inBar === 12) d.snare(t, 0.08);
  },
});
