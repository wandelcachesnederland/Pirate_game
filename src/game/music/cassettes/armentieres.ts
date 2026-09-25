// "Mademoiselle from Armentières" — the soldiers' song of both world wars,
// sung from 1914 on the march and in the estaminets behind the line. The tune
// is older than the words (a British Army comic song), public domain. Set here
// for the Dover patrol: cornet lead, fiddle answer, a quick-step under it all.
import { song } from '../arrange';

export const armentieres = song({
  title: 'Mademoiselle from Armentières',
  key: 'C',
  unit: 2,
  barSteps: 16,
  chart: `C G C G C F C G`,
  tune: `C2 E2 E2 E2 D2 E2 z4 |
         G2 G2 E2 C2 z8 |
         c2 c2 c2 B2 c2 z6 |
         B2 A2 G2 E2 D2 C2 z4 |
         C2 E2 E2 E2 D2 E2 z4 |
         G2 G2 E2 C2 z8 |
         E2 E2 D2 C2 D2 E2 F2 z2 |
         G2 F2 E2 D2 C4 z4`,
  lead: 'reed', // cornet
  harmony: 'fiddle', // the crew answering
  harmonyFrom: 4,
  harmonyInterval: -12,
  bass: 'pulse',
  feel: 'march',
  tempo: [0.112, 0.002, 0.084],
  hook: (d, b, t) => {
    // a cheeky little "hinky dinky" tap on the off-beats of the last bar
    if (b.mode === 1 && b.isLastBar && b.inBar % 2 === 1) d.noise(t, 0.03, 0.04, 8000);
  },
});
