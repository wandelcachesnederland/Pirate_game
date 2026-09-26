// "Xamar Nights" (Xamar is Mogadishu's own name for itself). An original tape
// after the Mogadishu funk of the 1970s and '80s — the hotel bands and
// state orchestras, horns and organ over a walking bass and a disco kick.
// Pentatonic still, E G A B D, because Somali melody always is. The radio in
// the wheelhouse of a hijacked trawler has been playing tapes like this for
// thirty years. (An original piece in the style, not a transcription.)
import { song } from '../arrange';

export const xamarNights = song({
  title: 'Xamar Nights',
  key: 'Em',
  unit: 2,
  barSteps: 16,
  chart: `Em Em Am Em G D Am Em`,
  tune: `E2 G A B2 A G | D2 E G2 z G2 | A B d B A G E D | E4 z4 |
         B2 d e2 d B2 | A2 B d2 B A G | G A B A G E D2 | E8`,
  lead: 'reed', // the saxophone
  harmony: 'bell', // the combo organ
  harmonyFrom: 4,
  harmonyInterval: -5,
  bass: 'walk',
  feel: 'stomp',
  tempo: [0.118, 0.002, 0.09],
  hook: (d, b, t) => {
    // offbeat hi-hat, the disco lift of the hotel bands
    if (b.mode === 1 && b.inBar % 4 === 2) d.noise(t, 0.025, 0.03, 9000);
  },
});
