// "Hoea te Waka" — an original waiata hoe (paddling song) for Aotearoa.
// Minor pentatonic, the scale of the kōauau and the pūtātara. The leader calls
// on the bone flute, the crew answers an octave down, and pate drums and the
// stamps of a haka keep the stroke. For the war canoes of the Bay of Islands
// and the great migrations south.
import { song } from '../arrange';

export const hoeaWaka = song({
  title: 'Hoea te Waka (Paddle the Canoe)',
  key: 'Am', // minor pentatonic: A C D E G
  unit: 2,
  barSteps: 16,
  chart: `Am Dm Am Am | C Dm Am Am | Am Dm C Am`,
  tune: `A,2 C2 D2 C2 | A,2 G,2 A,4 | C2 D2 E2 D2 | C2 A,2 A,4 |
         E2 E2 D2 C2 | D2 C2 A,4 | A,2 C2 D2 E2 | A,8 |
         A,2 A,2 C2 D2 | C2 C2 A,4 | D2 E2 G2 E2 | A,8`,
  lead: 'flute', // kōauau
  harmony: 'chant', // the crew answering the leader
  harmonyFrom: 5,
  harmonyInterval: -12,
  bass: 'row', // the paddles
  feel: 'haka',
  tempo: [0.135, 0.002, 0.098],
  hook: (d, b, t, sd) => {
    // the pūtātara (conch) opening each line and the "hī!" on the catch
    if (b.inBar === 0 && b.phraseBar === 0) d.drum('triangle', 300, 185, t, sd * 6, 0.14);
    if (b.mode === 1 && b.isLastBar && b.inBar >= 14) d.snare(t, 0.1);
  },
});
