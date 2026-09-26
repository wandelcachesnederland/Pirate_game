// "Dhaanto Badweyn" (The Ocean Dhaanto). An original piece for the Gulf of
// Aden, written in the manner of the dhaanto — the bouncing Somali dance song
// of the north, sung and clapped in a lilting triple time. Somali music is
// pentatonic, so the tune never leaves D E F# A B. Kaban (the Somali oud)
// lead, the shareero lyre answering an octave down, durbaan drum and hand
// claps under it. (An original tape in the idiom, not a transcription.)
import { song } from '../arrange';

export const dhaantoBadweyn = song({
  title: 'Dhaanto Badweyn (The Ocean Dhaanto)',
  key: 'D',
  unit: 2,
  barSteps: 12, // a lilting 6/8: six eighth notes to the bar
  beatSteps: 6,
  chart: `D D G D Bm A A D`,
  tune: `D2 F A2 B | A2 F E2 D | F2 A B2 d | B2 A F3 |
         d2 B A2 F | E2 F A2 B | A2 F E2 F | D6`,
  lead: 'pluck', // kaban
  harmony: 'harp', // shareero lyre
  harmonyFrom: 4,
  harmonyInterval: -12,
  bass: 'pulse',
  feel: 'darbuka', // durbaan
  tempo: [0.13, 0.002, 0.095],
  hook: (d, b, t) => {
    // the dancers' claps land on the back of each half-bar
    if (b.mode === 1 && (b.inBar === 4 || b.inBar === 10)) d.snare(t, 0.07);
    if (b.mode === 1 && b.inBar % 3 === 1) d.noise(t, 0.03, 0.025, 7000);
  },
});
