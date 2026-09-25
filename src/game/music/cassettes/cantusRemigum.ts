// "Cantus Remigum" — the rowers' song. An original chant for the Roman era,
// built on the tibia (the twin-pipe reed) over a heavy stroke drum and the
// crew's answering voices. Rome's first war fleets were rowed by landsmen who
// needed the time beaten for them, and this is the sort of thing the hortator
// would have kept them to.
import { song } from '../arrange';

export const cantusRemigum = song({
  title: 'Cantus Remigum (Rowers’ Song)',
  key: 'Dm',
  unit: 2,
  barSteps: 16,
  chart: `Dm Dm Bb Dm | F Gm Dm Dm | Dm F Gm Dm`,
  tune: `D2 D2 F2 E2 | D2 A,2 D4 | F2 F2 G2 A2 | F2 E2 D4 |
         A2 A2 c2 A2 | B2 A2 G4 | F2 E2 D2 E2 | F2 E2 D4 |
         D2 F2 A2 c2 | c2 A2 G2 F2 | E2 F2 G2 E2 | D8`,
  lead: 'reed', // tibia
  harmony: 'chant', // the crew, an octave down
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'row',
  feel: 'frame',
  tempo: [0.135, 0.002, 0.098],
  hook: (d, b, t, sd) => {
    // the hortator's drum, and the shout that comes with the catch
    if (b.inBar === 0 && b.phraseBar === 0) d.drum('sine', 70, 30, t, sd * 3, 0.3);
    if (b.mode === 1 && b.isLastBar && b.inBar === 14) d.snare(t, 0.07);
  },
});
