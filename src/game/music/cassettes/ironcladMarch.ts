// "Iron and Steam" — an original march for the ironclad era.
// A fife tune in the minor over boiler-room percussion: a bass drum like a
// piston, an engine clank on the off-beats, chain rattling on the sixteenths.
// For the casemate ram working up the Chesapeake in 1862, with the gratings
// battened and the guns run out.
import { song } from '../arrange';

export const ironcladMarch = song({
  title: 'Iron and Steam',
  key: 'Gm',
  unit: 2,
  barSteps: 16,
  chart: `Gm Cm Gm D | Gm Cm D Gm | Bb Cm Gm Eb | Bb Cm F Gm`,
  tune: `G2 B2 d2 B2 | c2 c2 d4 | B2 G2 A2 B2 | A8 |
         G2 B2 d2 g2 | f2 E2 d4 | c2 B2 A2 B2 | G8 |
         d2 d2 c2 B2 | c2 c2 d4 | B2 A2 G2 A2 | B8 |
         g2 f2 E2 d2 | c2 B2 A4 | G2 B2 A2 c2 | B2 A2 G4`,
  lead: 'flute', // fife
  harmony: 'harp', // the band, an octave down on the B strain
  harmonyFrom: 8,
  harmonyInterval: -12,
  bass: 'pulse', // marching feet — or pistons
  feel: 'steam',
  tempo: [0.12, 0.002, 0.09],
  hook: (d, b, t) => {
    // the boatswain's pipe at the head of each strain, and a head of steam let
    // off into the stack as the phrase turns
    if (b.mode === 1 && b.inBar === 0 && b.phraseBar === 0) d.note('sine', b.chord.root + 31, t, 0.22, 0.05, 3600);
    if (b.mode === 1 && b.isLastBar && b.inBar >= 12) d.noise(t, 0.07, 0.06, 5200);
  },
});
