// A "cassette" is a self-contained song: notes, instruments, drums and tempo.
// The cassette player (Sfx in ../audio.ts) calls `playStep` for every step of
// the loop and hands over a Deck — the set of sounds a cassette can use.

export interface Deck {
  /** Pitched note. `midi` is a MIDI note number (69 = A4 = 440 Hz). */
  note(type: OscillatorType, midi: number, t: number, dur: number, vol: number, cutoff: number): void;
  /** Pitch-swept tone, e.g. a kick drum (frequencies in Hz). */
  drum(type: OscillatorType, f0: number, f1: number, t: number, dur: number, vol: number): void;
  /** High-passed noise burst, e.g. a hi-hat / shaker (cutoff in Hz). */
  noise(t: number, dur: number, vol: number, freq: number): void;
}

export interface Cassette {
  title: string;
  /** Number of steps before the song loops. */
  loopSteps: number;
  /** Seconds per step for a given wave (lets the song speed up as the game gets harder). */
  stepDuration(wave: number): number;
  /** Play everything that starts at `step`, at audio time `t`. `sd` = current seconds per step. */
  playStep(deck: Deck, step: number, t: number, sd: number): void;
}
