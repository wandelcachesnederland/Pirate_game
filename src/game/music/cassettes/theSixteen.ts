// "The Sixteen" — an original paean for Macedon at sea.
// Demetrius Poliorcetes' sixteen-banked galley was the largest warship afloat;
// this is the rhythm her oarsmen pulled to. A shawm (sorna) over a lyre, with
// the great oar-drum and the crew answering underneath.
import { song } from '../arrange';

export const theSixteen = song({
  title: 'The Sixteen (ἡ ἑξήρης)',
  key: 'Am',
  unit: 2,
  barSteps: 16,
  chart: `Am Am F E | Am C Dm E | C Am F Am | Dm Am E Am`,
  tune: `A,2 E2 A2 c2 | c2 B2 A4 | G2 F2 E2 F2 | E8 |
         A2 c2 e2 c2 | B2 A2 B4 | G2 F2 E2 D2 | E8 |
         C2 E2 G2 E2 | D2 C2 B,4 | A,2 C2 E2 A2 | A8 |
         E2 F2 G2 F2 | E2 D2 C2 B,2 | A,2 B,2 C2 D2 | E8`,
  lead: 'reed', // sorna
  harmony: 'harp', // phorminx / lyre
  harmonyFrom: 8,
  harmonyInterval: -12,
  bass: 'row',
  feel: 'oars',
  tempo: [0.128, 0.002, 0.094],
  hook: (d, b, t, sd) => {
    // the salpinx sounds the stroke: a horn over the drum, low and long
    if (b.inBar === 0 && b.phraseBar === 0) d.note('sawtooth', b.chord.root + 12, t, sd * 9, 0.05, 1200);
    if (b.mode === 1 && b.isLastBar && b.inBar === 8) d.drum('sine', 150, 60, t, 0.16, 0.3);
  },
});
