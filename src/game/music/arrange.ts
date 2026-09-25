// The song kit.
//
// A cassette (see ./cassette.ts) is a song: notes, instruments, drums, tempo.
// Writing one by hand for every sea the game sails would mean a lot of nearly
// identical code, so the era tapes are written as *specs* here: a melody in ABC,
// a chord chart, the lead instrument, a drum feel and a tempo — and `song()`
// turns that into a Cassette the deck can play.
//
// Everything the era tapes share lives here:
//   • VOICES    — the period instruments (pipa, shakuhachi, quena, oud, …)
//   • FEELS     — drum patterns (taiko, darbuka, tabla, haka, paddle, …)
//   • BASSES    — bass/ostinato patterns (drone, rowing pulse, waltz, …)
//   • song()    — glue: melody + harmony + bass + drums, with the same
//                 calm / full / danger behaviour as the shanty cassettes
//   • dread()   — the boss-wave version of a song: slower, darker, droning
import type { Cassette, Deck, MusicMode } from './cassette';
import { abc, chords, stepTable, type Chord, type MelodyNote } from './notation';

// ── instruments ─────────────────────────────────────────────────────────────
// Each voice is one line of Web Audio dressing on top of the deck's raw pieces.

export type Voice =
  | 'fiddle' // bowed lead — the shanty voice
  | 'reed' // reedy chanter with body (shawm, piri, sorna)
  | 'flute' // breathy high flute (ney, shakuhachi, quena, fife)
  | 'pluck' // soft plucked string (oud, pipa, vihuela, ukulele)
  | 'koto' // hard bright pluck (koto, gayageum, shamisen, veena)
  | 'bell' // struck bronze — temple bells, gongs, glockenspiel
  | 'chant' // low crew voice an octave down, dark
  | 'harp'; // ringing string (lyre, harp, slack-key)

type VoiceFn = (d: Deck, midi: number, t: number, dur: number, vol: number, pan?: number) => void;

const VOICES: Record<Voice, VoiceFn> = {
  fiddle: (d, m, t, dur, v, pan = 0) => d.fiddle(m, t, dur, v, pan),
  reed: (d, m, t, dur, v, pan = 0) => d.reed(m, t, dur, v, pan, 0, 1600),
  flute: (d, m, t, dur, v, pan = 0) => d.note('triangle', m, t, dur * 0.96, v, 3400, pan),
  pluck: (d, m, t, dur, v, pan = 0) => d.note('sawtooth', m, t, Math.min(dur, 0.17), v * 0.8, 1400, pan),
  koto: (d, m, t, dur, v, pan = 0) => d.note('triangle', m, t, Math.min(dur, 0.24), v, 2800, pan),
  bell: (d, m, t, dur, v, pan = 0) => d.note('sine', m, t, Math.max(dur, 0.3) * 1.7, v * 0.62, 4200, pan),
  chant: (d, m, t, dur, v, pan = 0) => d.reed(m, t, dur * 0.94, v, pan, -12, 900),
  harp: (d, m, t, dur, v, pan = 0) => d.note('triangle', m, t, Math.min(dur, 0.4), v * 0.75, 2200, pan),
};

// ── the beat ────────────────────────────────────────────────────────────────

/** Everything a feel or hook needs to know about where the song is. */
export interface Beat {
  step: number;
  /** Step inside the bar. */
  inBar: number;
  bar: number;
  barSteps: number;
  /** Steps per beat: `barSteps / 4` unless the song says otherwise. */
  beatSteps: number;
  mode: MusicMode;
  /** Bar inside the current phrase (phrase = `phraseBars` bars, default 4). */
  phraseBar: number;
  phrase: number;
  isLastBar: boolean;
  chord: Chord;
  next: Chord;
}

export type Feel = (d: Deck, b: Beat, t: number, sd: number) => void;

/** Is the playhead on the given beat (0 = the downbeat)? */
function at(b: Beat, beat: number, offset = 0): boolean {
  return b.inBar === Math.round(beat * b.beatSteps) + offset;
}
/** Is the playhead at this fraction through the bar? (0.5 = halfway) */
function on(b: Beat, frac: number): boolean {
  return b.inBar === Math.round(b.barSteps * frac);
}

const CALM_TICK = (d: Deck, b: Beat, t: number) => {
  if (b.inBar % 2 === 1) d.noise(t, 0.03, 0.016, 8000);
};

const FEELS = {
  /** Shanty stomp: kick on 1 & 3, snare on 2 & 4, shaker between. */
  stomp: (d, b, t) => {
    if (b.mode === 0) return CALM_TICK(d, b, t);
    const stomping = b.phraseBar < 2 || b.phrase % 2 === 1;
    if (at(b, 0) && stomping) d.drum('sine', 125, 45, t, 0.13, 0.42);
    if (at(b, 2) && stomping) d.drum('sine', 125, 45, t, 0.12, 0.38);
    if (at(b, 1) || at(b, 3)) d.snare(t, 0.09);
    if (b.inBar % 2 === 1) d.noise(t, 0.03, 0.035, 8000);
    if (b.isLastBar && b.inBar >= b.beatSteps * 2 && b.inBar % 2 === 0) d.snare(t, 0.04 + 0.01 * b.inBar);
  },

  /** Taiko: one big drum on the downbeat, a struck answer on the third beat. */
  taiko: (d, b, t) => {
    if (b.mode === 0) {
      if (on(b, 0.5)) d.drum('sine', 90, 40, t, 0.18, 0.14);
      return;
    }
    if (b.inBar === 0) d.drum('sine', 105, 34, t, 0.3, 0.55);
    if (on(b, 0.75)) d.drum('sine', 130, 52, t, 0.16, 0.34);
    // rim ticks tighten up on the phrase turn
    const step = b.phraseBar >= 3 ? 2 : 4;
    if (b.inBar % step === 1) d.noise(t, 0.04, 0.05, 2400);
    if (b.isLastBar) {
      if (on(b, 0.5)) d.drum('sine', 140, 60, t, 0.12, 0.4);
      if (on(b, 0.875)) d.drum('sine', 150, 70, t, 0.1, 0.36);
    }
  },

  /** Darbuka: dum on one, tek answering — the maqsum feel of the Levant. */
  darbuka: (d, b, t) => {
    if (b.mode === 0) return CALM_TICK(d, b, t);
    if (b.inBar === 0) d.drum('sine', 95, 42, t, 0.2, 0.45);
    if (on(b, 0.5)) d.drum('sine', 88, 40, t, 0.18, 0.34);
    if (on(b, 0.25)) d.noise(t, 0.05, 0.13, 1800);
    if (on(b, 0.375)) d.noise(t, 0.04, 0.1, 2200);
    if (on(b, 0.75)) d.noise(t, 0.05, 0.13, 1700);
    if (on(b, 0.875)) d.noise(t, 0.04, 0.1, 2100);
    if (b.phraseBar >= 3 && b.inBar % (b.barSteps / 5) === 0) d.noise(t, 0.03, 0.06, 2600);
    if (b.isLastBar && b.inBar >= b.barSteps * 0.75) d.noise(t, 0.03, 0.08, 3000);
  },

  /** Tabla: pitched hand drums, with a rolling tail on the phrase turn. */
  tabla: (d, b, t) => {
    if (b.mode === 0) {
      if (b.inBar === 0) d.drum('sine', 250, 190, t, 0.05, 0.09);
      return;
    }
    if (b.inBar === 0) d.drum('sine', 190, 110, t, 0.12, 0.34);
    if (b.inBar % b.beatSteps === 0) d.drum('sine', 250, 195, t, 0.06, 0.16);
    if (b.inBar % b.beatSteps === Math.round(b.beatSteps / 2)) d.noise(t, 0.03, 0.06, 3000);
    if (b.phraseBar >= 2 && b.inBar % (b.beatSteps / 2) === 0) d.drum('sine', 300, 240, t, 0.04, 0.1);
    if (b.isLastBar && b.inBar >= b.barSteps * 0.5 && b.inBar % (b.beatSteps / 4) === 0) {
      d.drum('sine', Math.max(160, 330 - b.inBar * 3), 250, t, 0.04, 0.12);
    }
  },

  /** Frame drum and jingles — the hand drum of the Middle Sea. */
  frame: (d, b, t) => {
    if (b.mode === 0) return CALM_TICK(d, b, t);
    if (b.inBar === 0) d.drum('sine', 175, 85, t, 0.16, 0.36);
    if (on(b, 0.5)) d.drum('sine', 165, 80, t, 0.14, 0.28);
    if (on(b, 0.25)) d.noise(t, 0.06, 0.08, 4200);
    if (on(b, 0.75)) d.noise(t, 0.06, 0.07, 3800);
    if (b.phraseBar >= 3 && b.inBar % (b.barSteps / 8) === 0) d.noise(t, 0.03, 0.045, 5200);
  },

  /** War drum: two heavy beats a bar with hand slaps between — a shield wall
   *  keeping time, and the drum line of the Americas. */
  wardrum: (d, b, t) => {
    if (b.mode === 0) {
      if (b.inBar === 0) d.drum('sine', 110, 55, t, 0.12, 0.12);
      return;
    }
    if (b.inBar === 0) d.drum('sine', 100, 34, t, 0.32, 0.55);
    if (on(b, 0.5)) d.drum('sine', 108, 40, t, 0.24, 0.42);
    if (on(b, 0.25)) d.snare(t, 0.11);
    if (on(b, 0.75)) d.snare(t, 0.1);
    if (b.phraseBar >= 2 && b.inBar % (b.barSteps / 4) === Math.round(b.barSteps / 8)) {
      d.noise(t, 0.04, 0.1, 1400);
    }
    if (b.isLastBar && b.inBar >= b.barSteps * 0.75) {
      d.drum('sine', 140, 60, t, 0.12, 0.34);
      d.drum('triangle', 1200, 700, t, 0.05, 0.2);
    }
  },

  /** Oars: the stroke drum of a galley — heavy thump, wooden knock, splash. */
  oars: (d, b, t) => {
    if (b.mode === 0) {
      if (b.inBar === 0) d.drum('triangle', 900, 500, t, 0.06, 0.14);
      return;
    }
    if (b.inBar === 0) d.drum('sine', 95, 34, t, 0.3, 0.5);
    if (on(b, 0.25)) d.drum('triangle', 1300, 800, t, 0.06, 0.24);
    if (on(b, 0.5)) d.drum('sine', 105, 42, t, 0.2, 0.36);
    if (on(b, 0.75)) {
      d.drum('triangle', 1200, 750, t, 0.05, 0.2);
      d.noise(t, 0.14, 0.13, 1100);
    }
    if (b.isLastBar && on(b, 0.875)) d.drum('sine', 130, 55, t, 0.12, 0.32);
  },

  /** Haka / pate: heavy stamps with hand slaps between — war canoe tempo. */
  haka: (d, b, t) => {
    if (b.mode === 0) {
      if (b.inBar === 0) d.drum('sine', 120, 60, t, 0.12, 0.12);
      return;
    }
    if (b.inBar === 0) d.drum('sine', 115, 38, t, 0.28, 0.5);
    if (on(b, 0.5)) d.drum('sine', 120, 45, t, 0.22, 0.4);
    if (on(b, 0.25)) d.snare(t, 0.12);
    if (on(b, 0.75)) d.noise(t, 0.05, 0.16, 900);
    if (b.isLastBar && on(b, 0.875)) d.drum('sine', 150, 70, t, 0.12, 0.36);
  },

  /** Paddle: hull-slap and wooden knock — canoe crews keeping stroke. */
  paddle: (d, b, t) => {
    if (b.mode === 0) {
      if (b.inBar % b.beatSteps === 0) d.noise(t, 0.05, 0.05, 1100);
      return;
    }
    if (b.inBar === 0) d.noise(t, 0.12, 0.22, 1300);
    if (on(b, 0.5)) d.noise(t, 0.1, 0.18, 1150);
    if (on(b, 0.25) || on(b, 0.75)) d.drum('triangle', 1400, 900, t, 0.05, 0.22);
    if (b.phraseBar >= 2) {
      if (on(b, 0.375)) d.snare(t, 0.07);
      if (on(b, 0.875)) d.snare(t, 0.07);
    }
    if (b.isLastBar && b.inBar >= b.barSteps * 0.75) d.noise(t, 0.08, 0.16, 1500);
  },

  /** Temple drums and woodblock — the Ming river squadrons. */
  gong: (d, b, t) => {
    if (b.mode === 0) {
      if (b.inBar === 0) d.noise(t, 0.06, 0.07, 1200);
      return;
    }
    if (b.phraseBar === 0 && b.inBar === 0) d.crash(t, 0.12);
    if (b.inBar === 0) d.drum('sine', 90, 38, t, 0.26, 0.48);
    if (on(b, 0.5)) d.drum('sine', 100, 44, t, 0.18, 0.36);
    if (on(b, 0.25) || on(b, 0.75)) d.noise(t, 0.05, 0.14, 1500);
    if (on(b, 0.375) || on(b, 0.875)) d.noise(t, 0.04, 0.09, 2400);
    if (b.isLastBar && on(b, 0.75)) d.crash(t, 0.1);
  },

  /** Marching drum: bass on 1 & 3, snares answering, rolls into the seam. */
  march: (d, b, t) => {
    if (b.mode === 0) return CALM_TICK(d, b, t);
    if (b.inBar === 0) d.drum('sine', 110, 48, t, 0.2, 0.42);
    if (at(b, 2)) d.drum('sine', 105, 46, t, 0.17, 0.36);
    if (at(b, 1) || at(b, 3)) d.snare(t, 0.11);
    if (b.phraseBar >= 2 && b.inBar % (b.beatSteps / 2) === Math.floor(b.beatSteps / 4)) d.snare(t, 0.04);
    if (b.isLastBar && b.inBar >= b.beatSteps * 2 && b.inBar % (b.beatSteps / 4) === 0) d.snare(t, 0.05);
  },

  /** Iron and steam: boiler thump, engine clank, rattling chain. */
  steam: (d, b, t) => {
    if (b.mode === 0) {
      if (b.inBar === 0) d.drum('sine', 80, 40, t, 0.1, 0.1);
      return;
    }
    if (b.inBar === 0) d.drum('sine', 85, 34, t, 0.26, 0.46);
    if (on(b, 0.5)) d.drum('sine', 80, 32, t, 0.22, 0.4);
    if (on(b, 0.25) || on(b, 0.75)) {
      d.note('square', 88, t, 0.1, 0.09, 3000);
      d.noise(t, 0.06, 0.1, 5200);
    }
    if (b.inBar % b.beatSteps === Math.floor(b.beatSteps / 2)) d.noise(t, 0.05, 0.07, 6000);
    if (b.isLastBar && b.inBar >= b.barSteps * 0.75 && b.inBar % (b.beatSteps / 4) === 0) d.snare(t, 0.05);
  },

  /** Poi and pahu: shakers, a soft drum, body slaps on the turn. */
  poi: (d, b, t) => {
    if (b.mode === 0) {
      if (b.inBar % (b.beatSteps / 2) === 0) d.noise(t, 0.03, 0.03, 9000);
      return;
    }
    if (b.inBar % (b.beatSteps / 2) === 0) d.noise(t, 0.04, 0.06, 9000);
    if (b.inBar === 0) d.drum('sine', 135, 60, t, 0.16, 0.32);
    if (on(b, 0.5)) d.drum('sine', 128, 56, t, 0.13, 0.26);
    if (b.phraseBar >= 2 && on(b, 0.875)) d.snare(t, 0.07);
    if (b.isLastBar) d.noise(t, 0.06, 0.2, 7000);
  },

  /** Waltz: bass drum on one, snare on two, a shuffle on three (3/4 songs). */
  waltz: (d, b, t) => {
    if (b.mode === 0) return CALM_TICK(d, b, t);
    if (b.inBar === 0) d.drum('sine', 115, 48, t, 0.2, 0.4);
    if (at(b, 1)) d.snare(t, 0.09);
    if (at(b, 2)) d.noise(t, 0.04, 0.05, 7000);
    if (b.isLastBar && b.inBar >= b.beatSteps * 2) d.snare(t, 0.05);
  },
} satisfies Record<string, Feel>;

export type FeelName = keyof typeof FEELS;

// ── bass & ostinato ─────────────────────────────────────────────────────────

type BassFn = (d: Deck, b: Beat, t: number, sd: number) => void;

const BASSES = {
  /** Root, fifth, and a step into the next chord — the shanty walk. */
  walk: (d, b, t, sd) => {
    const half = Math.round(b.barSteps / 2);
    if (b.inBar === 0) d.bass(b.chord.root, t, sd * (half - 2), 0.32);
    if (b.inBar === half - 2) d.bass(b.chord.fifth, t, sd * 2, 0.24);
    if (b.inBar === half) d.bass(b.next.root, t, sd * (half - 3), 0.3);
    if (b.inBar === b.barSteps - 2) d.bass(b.next.fifth - 12, t, sd * 1.4, 0.2);
  },
  /** One held note per chord — a tanpura / ison / bagpipe drone. */
  drone: (d, b, t, sd) => {
    if (b.inBar === 0) d.bass(b.chord.root, t, sd * b.barSteps, 0.3);
    if (on(b, 0.5)) d.bass(b.chord.fifth - 12, t, sd * Math.round(b.barSteps / 2), 0.13);
  },
  /** Root on every beat: oars, paddles, marching feet. */
  pulse: (d, b, t, sd) => {
    if (b.inBar % b.beatSteps === 0) d.bass(b.chord.root, t, sd * (b.beatSteps - 1), 0.3);
  },
  /** Heavy stroke on one, lighter stroke on three, fifth on the turn. */
  row: (d, b, t, sd) => {
    if (b.inBar === 0) d.bass(b.chord.root, t, sd * (b.barSteps / 2 - 1), 0.36);
    if (on(b, 0.5)) d.bass(b.chord.fifth, t, sd * (b.barSteps / 2 - 1), 0.22);
    if (on(b, 0.875)) d.bass(b.next.root, t, sd * (b.beatSteps / 2), 0.18);
  },
  /** 6/8 sway: root on the dotted beat, fifth on beat two. */
  sixEight: (d, b, t, sd) => {
    if (b.inBar === 0) d.bass(b.chord.root, t, sd * Math.round(b.barSteps / 2), 0.32);
    if (on(b, 0.5)) d.bass(b.chord.fifth, t, sd * (Math.round(b.barSteps / 2) - 1), 0.24);
  },
  /** Three-four: root, fifth, third. */
  threeFour: (d, b, t, sd) => {
    if (b.inBar === 0) d.bass(b.chord.root, t, sd * (b.beatSteps - 1), 0.32);
    if (at(b, 1)) d.bass(b.chord.fifth - 12, t, sd * (b.beatSteps - 1), 0.22);
    if (at(b, 2)) d.bass(b.chord.third, t, sd * (b.beatSteps - 1), 0.2);
  },
} satisfies Record<string, BassFn>;

export type BassName = keyof typeof BASSES;

// ── the song ────────────────────────────────────────────────────────────────

export interface SongSpec {
  title: string;
  /** ABC melody. */
  tune: string;
  /** ABC key: 'G', 'Dm', 'Em', 'Bb', … */
  key: string;
  /** Semitones to shift the whole song. */
  transpose?: number;
  /** Steps per ABC unit (2 = an eighth note is 2 steps). */
  unit?: number;
  /** Steps per bar (default 16 = 4/4 in sixteenths). */
  barSteps?: number;
  /** Steps per beat (default barSteps / 4). */
  beatSteps?: number;
  /** Chord chart, one chord per `slotSteps`. */
  chart?: string;
  /** Steps per chord (default: the whole bar). */
  slotSteps?: number;
  /** Bars per phrase, for feels that breathe over longer arcs. */
  phraseBars?: number;
  lead: Voice;
  leadVol?: number;
  /** Length each melody note is held, relative to its full value. */
  legato?: number;
  /** A second voice — the crew, or a counter-melody. */
  harmony?: Voice;
  harmonyVol?: number;
  /** Bar at which the harmony voice joins in (default: never). */
  harmonyFrom?: number;
  /** Interval for the harmony voice in semitones (default 4 = a third up). */
  harmonyInterval?: number;
  bass?: BassName;
  feel?: FeelName;
  /** [step length at wave 1, faster per wave, floor] */
  tempo: [number, number, number];
  /** Extra colour: bells, drones, ornaments, shouts. */
  hook?: (d: Deck, b: Beat, t: number, sd: number) => void;
}

export interface BuiltSong extends Cassette {
  spec: SongSpec;
  /** The melody as [midi, steps] pairs — reused by `dread`. */
  melody: MelodyNote[];
}

/** Depth of the boss layer: heartbeat and a held drone, in danger mode. */
function dreadLayer(d: Deck, b: Beat, t: number, sd: number) {
  if (b.inBar === 0) d.drum('sine', 55, 28, t, 0.25, 0.5);
  if (on(b, 0.5)) d.drum('sine', 50, 26, t, 0.18, 0.32);
  if (b.inBar === 0) d.note('sawtooth', b.chord.root - 12, t, sd * b.barSteps, 0.04, 400);
}

/** Turn a spec into a playable cassette. */
export function song(spec: SongSpec): BuiltSong {
  const unit = spec.unit ?? 2;
  const barSteps = spec.barSteps ?? 16;
  const beatSteps = spec.beatSteps ?? Math.round(barSteps / 4);
  const slotSteps = spec.slotSteps ?? barSteps;
  const phraseBars = spec.phraseBars ?? 4;
  const melody = abc(spec.tune, { key: spec.key, stepsPerUnit: unit, transpose: spec.transpose });
  const loopSteps = melody.reduce((s, n) => s + n[1], 0);
  const melAt = stepTable(melody, loopSteps, spec.title);
  const chart = spec.chart ? chords(spec.chart, spec.transpose) : [chords('C')[0]];
  const bass = spec.bass ? BASSES[spec.bass] : undefined;
  const feel: Feel | undefined = spec.feel ? FEELS[spec.feel] : undefined;
  const lead = VOICES[spec.lead];
  const harmony = spec.harmony ? VOICES[spec.harmony] : undefined;
  const harmonyFrom = spec.harmonyFrom ?? Infinity;
  const harmonyInterval = spec.harmonyInterval ?? 4;

  return {
    title: spec.title,
    loopSteps,
    spec,
    melody,
    stepDuration(wave: number) {
      const [base, per, floor] = spec.tempo;
      return Math.max(floor, base - (wave - 1) * per);
    },
    playStep(deck: Deck, step: number, t: number, sd: number, mode: MusicMode) {
      const bar = Math.floor(step / barSteps);
      const inBar = step % barSteps;
      const slot = Math.floor(step / slotSteps);
      const chord = chart[slot % chart.length];
      const next = chart[(slot + 1) % chart.length];
      const b: Beat = {
        step,
        inBar,
        bar,
        barSteps,
        beatSteps,
        mode,
        phraseBar: bar % phraseBars,
        phrase: Math.floor(bar / phraseBars),
        isLastBar: step + barSteps >= loopSteps,
        chord,
        next,
      };

      const m = melAt[step];
      if (m) {
        lead(deck, m[0], t, m[1] * sd * (spec.legato ?? 0.9), spec.leadVol ?? 0.1);
        if (harmony && bar >= harmonyFrom) {
          harmony(deck, m[0] + harmonyInterval, t, m[1] * sd * 0.78, spec.harmonyVol ?? 0.035, 0.32);
        }
      }

      // colour that belongs to the song itself: bells, shouts, ornaments
      spec.hook?.(deck, b, t, sd);

      if (mode === 2) {
        dreadLayer(deck, b, t, sd);
        return;
      }

      bass?.(deck, b, t, sd);
      feel?.(deck, b, t, sd);
      if (mode === 1 && step === 0 && feel && feel !== FEELS.stomp) deck.crash(t, 0.08);
    },
  };
}

/**
 * The boss-wave version of a song: same melody, half the speed, played as a
 * dirge. The drums are gone except a slow heartbeat, a bell tolls the chord
 * roots and the lead drops into a dark reed. Every era gets its own boss theme
 * this way — the tapes turn on you when a warship shows up.
 */
export function dread(
  src: BuiltSong,
  title = `${src.title} — Dread`,
  opts: { bell?: number; chorus?: boolean } = {},
): Cassette {
  const spec = src.spec;
  const unit = spec.unit ?? 2;
  const barSteps = spec.barSteps ?? 16;
  const melody = abc(spec.tune, { key: spec.key, stepsPerUnit: unit, transpose: (spec.transpose ?? 0) - 12 });
  const loopSteps = melody.reduce((s, n) => s + n[1], 0);
  const melAt = stepTable(melody, loopSteps, title);
  const chart = spec.chart ? chords(spec.chart, spec.transpose) : [chords('C')[0]];
  const [base, , floor] = spec.tempo;
  const bell = opts.bell ?? 0;

  return {
    title,
    loopSteps,
    stepDuration(wave: number) {
      return Math.max(floor * 1.6, base * 1.5 - (wave - 1) * 0.002);
    },
    playStep(deck: Deck, step: number, t: number, sd: number, mode: MusicMode) {
      const bar = Math.floor(step / barSteps);
      const inBar = step % barSteps;
      const quarter = Math.round(barSteps / 4);
      const half = Math.round(barSteps / 2);
      const chord = chart[bar % chart.length];
      const m = melAt[step];
      if (m) {
        deck.reed(m[0], t, m[1] * sd * 0.94, 0.095, 0, 0, 1050);
        if (opts.chorus) deck.reed(m[0] - 12, t, m[1] * sd * 0.8, 0.03, -0.4, 0, 800);
      }
      if (inBar === 0) deck.bass(chord.root, t, sd * barSteps, 0.3);
      if (bell && inBar === 0 && bar % bell === 0) deck.note('sine', chord.root + 24, t, sd * barSteps, 0.05, 4200);
      if (mode === 2) {
        // danger: a faster heartbeat, and a tritone drone — two low saws a
        // semitone apart beating against each other
        if (inBar === 0 || inBar === quarter || inBar === half) {
          deck.drum('sine', inBar === 0 ? 55 : 50, 28, t, 0.22, inBar === 0 ? 0.45 : 0.3);
        }
        if (inBar === 0) {
          deck.note('sawtooth', chord.root - 12, t, sd * barSteps, 0.035, 350);
          deck.note('sawtooth', chord.root - 11, t, sd * barSteps, 0.03, 350, 0.25);
        }
        return;
      }
      // full band: a slow heartbeat under the dirge; calm: just the drone
      if (inBar === 0) deck.drum('sine', 60, 34, t, 0.2, mode === 1 ? 0.34 : 0.2);
      if (mode === 1 && inBar === half) deck.drum('sine', 55, 32, t, 0.14, 0.24);
    },
  };
}

export const VOICE_NAMES = Object.keys(VOICES) as Voice[];
export const FEEL_NAMES = Object.keys(FEELS) as FeelName[];
