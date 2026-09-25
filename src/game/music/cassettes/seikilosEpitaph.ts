// Σεικίλου στήλη — the Song of Seikilos. The oldest complete piece of music
// that survives anywhere, cut into a tombstone at Tralles in the first century
// AD: "while you live, shine". It is in the Iastian tonos, played here on the
// aulos (the double pipe) with a kithara under it and a frame drum beating the
// 6/8. For the Aegean of the trireme captains, Salamis and after.
// Melody: after the standard transcription (LilyPond, 6/8, D major).
import { song } from '../arrange';

export const seikilosEpitaph = song({
  title: 'Seikilos Epitaph (Σεικίλου)',
  key: 'D', // Iastian: F and C sharp — the Lydian/Dorian colour of the piece
  unit: 2, // 6/8: an eighth note is the unit, twelve steps to the bar
  barSteps: 12,
  beatSteps: 4,
  chart: `A A Em G | Em G Em A`,
  tune: `A E2 E3 | c d e d3 | c2 d e d c | A2 B G2 A |
         c e d c d c | A2 B G2 A | c B, d e c A | A A2 A F E`,
  lead: 'flute', // aulos
  harmony: 'harp', // kithara plucking under the pipe
  harmonyFrom: 4,
  harmonyInterval: -12,
  bass: 'drone', // the lyre's open string, the ison of the ancient world
  feel: 'frame', // tympanon
  tempo: [0.150, 0.002, 0.115],
  hook: (d, b, t) => {
    // a struck string at the head of each line, a hand-drum answered at the turn
    if (b.mode === 1 && b.inBar === 0 && b.phraseBar === 0) d.note('triangle', b.chord.root + 24, t, 0.3, 0.06, 2600);
    if (b.mode === 1 && b.phraseBar === 3 && b.isLastBar && b.inBar >= 6) d.snare(t, 0.05);
  },
});
