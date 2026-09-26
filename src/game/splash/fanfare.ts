// The Bit Squirrel studio sting: a few seconds of "wall of sound" — stacked,
// detuned chip voices doubled across octaves, eighth-note pulse stabs,
// glockenspiel, tambourine and a booming drum beat, all drowned in a big
// generated reverb. Synthesised on the spot with the Web Audio API; it owns
// its own AudioContext so it can be torn down cleanly once the logo is gone.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** One eighth note, in seconds (150 bpm). */
const E8 = 0.2;
/** Each chord lasts four eighths; the progression is I – vi – IV – V, then a big I. */
const CHORD = 4 * E8;
/** Chord tones as MIDI notes (root position triads around octave 4). */
const PROGRESSION: { root: number; triad: [number, number, number]; bells: number[] }[] = [
  { root: 50, triad: [62, 66, 69], bells: [78, 81, 86, 81] }, // D
  { root: 47, triad: [59, 62, 66], bells: [78, 83, 86, 83] }, // Bm
  { root: 43, triad: [55, 59, 62], bells: [79, 83, 86, 91] }, // G
  { root: 45, triad: [57, 61, 64], bells: [81, 85, 88, 93] }, // A
];
const FINAL = { root: 50, triad: [62, 66, 69] as [number, number, number] };
/** When the big final chord lands, relative to the start. */
export const FANFARE_HIT = PROGRESSION.length * CHORD;

export class SplashFanfare {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private wall!: GainNode; // sustained & pulsed harmony -> reverb heavy
  private kit!: GainNode; // drums & percussion
  private noiseBuf!: AudioBuffer;
  private started = false;

  constructor() {
    const AC = typeof window !== 'undefined' ? window.AudioContext || (window as WebkitWindow).webkitAudioContext : undefined;
    if (!AC) return;
    try {
      this.ctx = new AC();
    } catch {
      this.ctx = null;
      return;
    }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 6;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    // the room: a long, dense generated plate plus a slap-back echo
    const verb = ctx.createConvolver();
    verb.buffer = this.impulse(3.4, 2.4);
    const verbIn = ctx.createGain();
    verbIn.gain.value = 0.9;
    const verbOut = ctx.createGain();
    verbOut.gain.value = 0.7;
    verbIn.connect(verb);
    verb.connect(verbOut);
    verbOut.connect(this.master);

    const slap = ctx.createDelay(1);
    slap.delayTime.value = 0.11;
    const slapFb = ctx.createGain();
    slapFb.gain.value = 0.28;
    const slapOut = ctx.createGain();
    slapOut.gain.value = 0.35;
    slap.connect(slapFb);
    slapFb.connect(slap);
    slap.connect(slapOut);
    slapOut.connect(this.master);
    slapOut.connect(verbIn);

    this.wall = ctx.createGain();
    this.wall.gain.value = 0.55;
    this.wall.connect(this.master);
    this.wall.connect(verbIn);
    this.wall.connect(slap);

    this.kit = ctx.createGain();
    this.kit.gain.value = 0.8;
    this.kit.connect(this.master);
    const kitSend = ctx.createGain();
    kitSend.gain.value = 0.55;
    this.kit.connect(kitSend);
    kitSend.connect(verbIn);

    const len = Math.floor(ctx.sampleRate * 1.5);
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  /** True when the browser lets sound play right now (no gesture needed). */
  get running(): boolean {
    return this.ctx?.state === 'running';
  }

  get available(): boolean {
    return this.ctx !== null;
  }

  /**
   * Try to wake the context. Resolves true if audio is allowed. Call it
   * again from inside a key/tap handler when autoplay was blocked.
   */
  async resume(): Promise<boolean> {
    const ctx = this.ctx;
    if (!ctx) return false;
    if (ctx.state === 'running') return true;
    try {
      await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 250))]);
    } catch {
      /* blocked */
    }
    return (ctx.state as AudioContextState) === 'running';
  }

  /** Schedule the whole sting. Safe to call once. */
  play() {
    const ctx = this.ctx;
    if (!ctx || this.started) return;
    this.started = true;
    const t0 = ctx.currentTime + 0.06;

    // ---- the progression: pads + eighth-note chip stabs + bass + glockenspiel
    PROGRESSION.forEach((ch, i) => {
      const t = t0 + i * CHORD;
      this.pad(ch.triad, t, CHORD + 0.12, 0.05);
      for (let k = 0; k < 4; k++) {
        const tt = t + k * E8;
        const accent = k === 0 ? 1.25 : 1;
        this.stab(ch.triad, tt, accent);
        this.bass(ch.root + (k === 2 ? 7 : 0), tt, E8 * 0.95);
        this.bell(ch.bells[k], tt, 0.9);
      }
    });

    // ---- the big final chord: everything at once, left to ring
    const tf = t0 + FANFARE_HIT;
    this.pad(FINAL.triad, tf, 2.8, 0.02, true);
    this.stab(FINAL.triad, tf, 1.6, 1.4);
    this.bass(FINAL.root, tf, 2.4, 1.3);
    this.bass(FINAL.root - 12, tf, 2.4, 0.9);
    [86, 90, 93, 98].forEach((m, k) => this.bell(m, tf + k * 0.07, 1.1, 1.6));
    this.crash(tf, 2.6, 0.55);
    this.kick(tf, 1.3);
    this.tom(tf, 55, 1.0);

    // ---- drums: "boom, boom-boom, CRACK" for two bars, a snare roll into the hit
    const bar = 8 * E8;
    for (let b = 0; b < 2; b++) {
      const tb = t0 + b * bar;
      [0, 3, 4].forEach((e) => this.kick(tb + e * E8, e === 0 ? 1.1 : 0.9));
      if (b === 0) [2, 6].forEach((e) => this.snare(tb + e * E8, 1));
      else this.snare(tb + 2 * E8, 1);
      for (let e = 0; e < 8; e++) this.tambourine(tb + e * E8, e % 2 === 0 ? 0.5 : 0.8);
      for (let e = 0; e < 8; e += 2) this.tambourine(tb + e * E8 + E8 / 2, 0.3);
    }
    // sixteenth-note roll with timpani under the last half bar
    const roll0 = t0 + bar + 4 * E8;
    for (let s = 0; s < 8; s++) this.snare(roll0 + (s * E8) / 2, 0.45 + s * 0.08);
    [0, 2, 4, 6].forEach((s, k) => this.tom(roll0 + (s * E8) / 2, 43 + k * 2, 0.6));
    this.crash(t0, 1.6, 0.3);
  }

  /** Fade everything to silence over `seconds`, then release the context. */
  fadeOut(seconds: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const g = this.master.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0.0001, t + seconds);
    window.setTimeout(() => this.dispose(), seconds * 1000 + 200);
  }

  dispose() {
    const ctx = this.ctx;
    this.ctx = null;
    if (ctx && ctx.state !== 'closed') ctx.close().catch(() => undefined);
  }

  // ------------------------------------------------------------ instruments

  /** Strings-and-organ wall: every chord tone in three octaves, each a detuned pair of saws. */
  private pad(triad: number[], t: number, dur: number, attack: number, ring = false) {
    const ctx = this.ctx!;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(ring ? 5200 : 3000, t);
    if (ring) filt.frequency.exponentialRampToValueAtTime(1400, t + dur);
    filt.Q.value = 0.5;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(1, t + attack);
    if (ring) env.gain.setTargetAtTime(0.0001, t + 0.4, dur / 3);
    else env.gain.setTargetAtTime(0.0001, t + dur - 0.08, 0.05);
    filt.connect(env);
    env.connect(this.wall);
    for (const oct of [-12, 0, 12]) {
      for (const m of triad) {
        for (const cents of [-9, 7]) {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = mtof(m + oct);
          o.detune.value = cents;
          const g = ctx.createGain();
          g.gain.value = oct === 12 ? 0.018 : 0.028;
          o.connect(g);
          g.connect(filt);
          o.start(t);
          o.stop(t + dur + (ring ? 2 : 0.4));
        }
      }
    }
  }

  /** The 8-bit "pianos and guitars": square-wave chord hits, doubled an octave up. */
  private stab(triad: number[], t: number, vol: number, decay = 0.17) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.05 * vol, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    env.connect(this.wall);
    for (const m of triad) {
      for (const [oct, det] of [[0, -6], [12, 5]] as const) {
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.value = mtof(m + oct);
        o.detune.value = det;
        o.connect(env);
        o.start(t);
        o.stop(t + decay + 0.05);
      }
    }
  }

  private bass(m: number, t: number, dur: number, vol = 1) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.22 * vol, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    env.connect(this.master);
    for (const [type, mul, g] of [['triangle', 1, 1], ['square', 1, 0.18]] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = mtof(m) * mul;
      const gg = ctx.createGain();
      gg.gain.value = g;
      o.connect(gg);
      gg.connect(env);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  /** Glockenspiel: a sine plus its inharmonic 2.76x partial, quick to fade. */
  private bell(m: number, t: number, vol: number, decay = 0.6) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.09 * vol, t + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    env.connect(this.wall);
    for (const [mul, g] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = mtof(m) * mul;
      const gg = ctx.createGain();
      gg.gain.value = g;
      o.connect(gg);
      gg.connect(env);
      o.start(t);
      o.stop(t + decay + 0.05);
    }
  }

  private kick(t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9 * vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g);
    g.connect(this.kit);
    o.start(t);
    o.stop(t + 0.45);
  }

  private tom(t: number, m: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(mtof(m) * 1.5, t);
    o.frequency.exponentialRampToValueAtTime(mtof(m), t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5 * vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(g);
    g.connect(this.kit);
    o.start(t);
    o.stop(t + 0.75);
  }

  private noise(t: number, dur: number, vol: number, type: BiquadFilterType, freq: number, q = 0.8) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.kit);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  private snare(t: number, vol: number) {
    this.noise(t, 0.22, 0.5 * vol, 'bandpass', 2400, 0.7);
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(260, t);
    o.frequency.exponentialRampToValueAtTime(160, t + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3 * vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(g);
    g.connect(this.kit);
    o.start(t);
    o.stop(t + 0.12);
  }

  private tambourine(t: number, vol: number) {
    this.noise(t, 0.07, 0.16 * vol, 'highpass', 7500, 1.2);
  }

  private crash(t: number, dur: number, vol: number) {
    this.noise(t, dur, vol, 'highpass', 4800, 0.5);
  }

  /** Stereo decaying-noise impulse response: a cheap, huge room. */
  private impulse(seconds: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
}
