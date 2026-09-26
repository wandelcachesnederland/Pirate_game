// "Hees Badmaax" (The Sailor's Song). An original work song after the hees —
// the Somali labour songs sung to keep time at the oars, the well or the
// sail. One voice calls, the crew answers; the pentatonic A C D E G never
// changes, the stroke drum never stops. (An original tape in the idiom.)
import { song } from '../arrange';

export const heesBadmaax = song({
  title: 'Hees Badmaax (The Sailor’s Song)',
  key: 'Am',
  unit: 2,
  barSteps: 16,
  chart: `Am Am Dm Am C G G Am`,
  tune: `A2 A2 c2 d2 | e4 d2 c2 | d2 c2 A2 G2 | A8 |
         e2 e2 g2 e2 | d4 c2 d2 | e2 d2 c2 G2 | A8`,
  lead: 'chant', // the caller, low and dark
  harmony: 'reed', // the crew's answer
  harmonyFrom: 4,
  harmonyInterval: 12,
  bass: 'drone',
  feel: 'oars',
  tempo: [0.145, 0.002, 0.105],
  hook: (d, b, t) => {
    // the crew grunts the stroke on the last beat of every answer
    if (b.mode === 1 && b.isLastBar && b.inBar === 12) d.snare(t, 0.08);
  },
});
