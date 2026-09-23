// Small helpers for writing cassettes: a tiny ABC-notation reader and chord names.
//
// Supported ABC subset (enough to paste most simple folk tunes):
//   notes      C D E F G A B (octave from middle C), c d e f g a b (octave up)
//   octaves    ,  (down)   '  (up)          e.g. B,  c'
//   accidentals ^ (sharp)  _ (flat)  = (natural) — last until the next bar line
//   lengths    2  3  /  /2  3/2  (multiples of the unit length)
//   rests      z  (with a length, e.g. z2)
//   bar lines  |  :  are allowed and only reset accidentals
// Not supported: chords [..], grace notes {..}, broken rhythm > <, triplets (3.

/** [midi note, length in steps]. A midi value of -1 is a rest. */
export type MelodyNote = [number, number];

const LETTER_PITCH: Record<string, number> = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 };
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
const MAJOR_KEYS: Record<string, number> = {
  C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7,
  F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7,
};
const MINOR_KEYS: Record<string, number> = {
  Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6,
  Dm: -1, Gm: -2, Cm: -3, Fm: -4, Bbm: -5, Ebm: -6,
};

function keySignature(key: string): Record<string, number> {
  const fifths = key in MAJOR_KEYS ? MAJOR_KEYS[key] : MINOR_KEYS[key];
  if (fifths === undefined) throw new Error(`Unknown key "${key}"`);
  const sig: Record<string, number> = {};
  if (fifths > 0) SHARP_ORDER.slice(0, fifths).forEach((l) => (sig[l] = 1));
  if (fifths < 0) FLAT_ORDER.slice(0, -fifths).forEach((l) => (sig[l] = -1));
  return sig;
}

export interface AbcOptions {
  /** Key signature, e.g. 'G', 'Em', 'Bb', 'Gm'. */
  key: string;
  /** How many sequencer steps one ABC unit length lasts (e.g. L:1/8 with 16th-note steps = 2). */
  stepsPerUnit: number;
  /** Semitones to shift the whole tune. */
  transpose?: number;
}

/** Turn an ABC melody line into a list of [midi, steps] notes. */
export function abc(tune: string, opts: AbcOptions): MelodyNote[] {
  const sig = keySignature(opts.key);
  const transpose = opts.transpose ?? 0;
  const out: MelodyNote[] = [];
  let barAccidentals: Record<string, number> = {};
  let i = 0;
  const peek = () => tune[i];

  while (i < tune.length) {
    const ch = peek();
    if (/\s/.test(ch) || ch === ':') {
      i++;
      continue;
    }
    if (ch === '|' || ch === ']') {
      barAccidentals = {};
      i++;
      continue;
    }

    // accidental
    let accidental: number | null = null;
    while (peek() === '^' || peek() === '_' || peek() === '=') {
      const a = tune[i++];
      accidental = (accidental ?? 0) + (a === '^' ? 1 : a === '_' ? -1 : 0);
      if (a === '=') accidental = 0;
    }

    const letter = tune[i++];
    const isRest = letter === 'z';
    if (!isRest && !/[A-Ga-g]/.test(letter ?? '')) {
      throw new Error(`Unsupported ABC character "${letter}" at position ${i - 1}`);
    }

    let midi = -1;
    if (!isRest) {
      const upper = letter.toUpperCase();
      midi = LETTER_PITCH[upper] + (letter === upper ? 0 : 12);
      while (peek() === ',' || peek() === "'") midi += tune[i++] === ',' ? -12 : 12;
      const accKey = `${upper}${midi}`;
      if (accidental !== null) barAccidentals[accKey] = accidental;
      midi += accKey in barAccidentals ? barAccidentals[accKey] : (sig[upper] ?? 0);
      midi += transpose;
    }

    // length
    let num = '';
    while (/[0-9]/.test(peek() ?? '')) num += tune[i++];
    let len = num ? parseInt(num, 10) : 1;
    while (peek() === '/') {
      i++;
      let den = '';
      while (/[0-9]/.test(peek() ?? '')) den += tune[i++];
      len /= den ? parseInt(den, 10) : 2;
    }
    const steps = len * opts.stepsPerUnit;
    if (!Number.isInteger(steps)) throw new Error(`Note length ${len} does not fit whole steps`);
    out.push([midi, steps]);
  }
  return out;
}

/**
 * Lookup table: the melody note that starts at each step of the loop (null = nothing new).
 * Rests are left out. Warns if the melody length doesn't match the loop length.
 */
export function stepTable(melody: MelodyNote[], loopSteps: number, title = 'cassette'): (MelodyNote | null)[] {
  const arr: (MelodyNote | null)[] = new Array(loopSteps).fill(null);
  let s = 0;
  for (const n of melody) {
    if (s < loopSteps && n[0] >= 0) arr[s] = n;
    s += n[1];
  }
  if (s !== loopSteps) console.warn(`[${title}] melody is ${s} steps but the loop is ${loopSteps}`);
  return arr;
}

export interface Chord {
  /** Bass root, between A2 (45) and G#3 (56). */
  root: number;
  third: number;
  fifth: number;
}

/** Chord from a name like 'C', 'Em', 'F#', 'Bbm'. */
export function chord(name: string, transpose = 0): Chord {
  const m = /^([A-G])([#b]?)(m?)$/.exec(name);
  if (!m) throw new Error(`Unknown chord "${name}"`);
  let pc = LETTER_PITCH[m[1]] - 60 + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + transpose;
  pc = ((pc % 12) + 12) % 12;
  const root = pc < 9 ? 48 + pc : 36 + pc; // keep the bass between A2 and G#3
  return { root, third: root + (m[3] ? 3 : 4), fifth: root + 7 };
}

/** Parse a chord chart like 'Em Em | Am B' into a list (bar lines are only for readability). */
export function chords(chart: string, transpose = 0): Chord[] {
  return chart
    .split(/[\s|]+/)
    .filter(Boolean)
    .map((name) => chord(name, transpose));
}
