// A "cassette" is a self-contained song: notes, instruments, drums and tempo.
// The cassette player (Sfx in ../audio.ts) calls `playStep` for every step of
// the loop and hands over a Deck — the set of sounds a cassette can use.

/**
 * Adaptive intensity, set by the game:
 *   0 = calm  — no fighting going on: melody and bass, no band
 *   1 = full  — the whole crew is in
 *   2 = danger — the player is low on hull: a heartbeat and a dark drone join in
 */
export type MusicMode = 0 | 1 | 2;

export interface Deck {
  /**
   * Raw pitched note (one oscillator through a lowpass).
   * `midi` is a MIDI note number (69 = A4 = 440 Hz), `pan` -1..1 (default center).
   */
  note(type: OscillatorType, midi: number, t: number, dur: number, vol: number, cutoff: number, pan?: number): void;
  /** Pitch-swept tone, e.g. a kick drum (frequencies in Hz). */
  drum(type: OscillatorType, f0: number, f1: number, t: number, dur: number, vol: number): void;
  /** High-passed noise burst, e.g. a hi-hat / shaker (cutoff in Hz). */
  noise(t: number, dur: number, vol: number, freq: number): void;
  /**
   * Fiddle / concertina lead: two detuned saws panned apart through a
   * bowing filter envelope, with a slow vibrato on long notes.
   */
  fiddle(midi: number, t: number, dur: number, vol: number, pan?: number): void;
  /**
   * Reed / shanty-voice lead: a square with a triangle an octave above,
   * slightly detuned and panned apart, with vibrato on long notes.
   * `octave` transposes the whole voice (e.g. -12 for a low crew answer).
   */
  reed(midi: number, t: number, dur: number, vol: number, pan?: number, octave?: number, cutoff?: number): void;
  /** Upright bass: triangle with a sine sub an octave down. */
  bass(midi: number, t: number, dur: number, vol: number): void;
  /** Short off-beat chord "pah" (two detuned squares, panned apart). */
  stab(third: number, fifth: number, t: number, dur: number, vol: number): void;
  /** Snare / clap: bandpassed noise with a short tone body. */
  snare(t: number, vol: number): void;
  /** Cymbal crash / swell: long highpassed-noise tail. */
  crash(t: number, vol: number): void;
}

export interface Cassette {
  title: string;
  /** Number of steps before the song loops. */
  loopSteps: number;
  /** Seconds per step for a given wave (lets the song speed up as the game gets harder). */
  stepDuration(wave: number): number;
  /**
   * Play everything that starts at `step`, at audio time `t`.
   * `sd` = current seconds per step, `mode` = adaptive intensity (see MusicMode).
   */
  playStep(deck: Deck, step: number, t: number, sd: number, mode: MusicMode): void;
}
