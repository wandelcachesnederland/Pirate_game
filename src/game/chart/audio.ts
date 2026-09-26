// Tiny self-contained sound effects for the modes that sail the chart (Trade
// and Adventure), built on the WebAudio API so they need no assets and no
// shared engine. All calls are no-ops until the context is unlocked by a user
// gesture, and respect the sfx setting.

export class VoyageAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Call from a user gesture so the browser permits audio. */
  unlock() {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain = 1, slideTo?: number) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, gain = 1) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = gain;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 900;
    src.connect(filt);
    filt.connect(g);
    g.connect(this.master);
    src.start(t);
  }

  cannon() {
    this.noise(0.18, 0.9);
    this.tone(120, 0.18, 'square', 0.5, 60);
  }
  hit() {
    this.tone(220, 0.12, 'sawtooth', 0.4, 120);
  }
  coin() {
    this.tone(880, 0.08, 'triangle', 0.5);
    this.tone(1320, 0.1, 'triangle', 0.4);
  }
  dock() {
    this.tone(440, 0.12, 'sine', 0.5);
    this.tone(660, 0.16, 'sine', 0.4);
  }
  alarm() {
    this.tone(330, 0.2, 'square', 0.4, 240);
  }
  fanfare() {
    this.tone(523, 0.12, 'triangle', 0.5);
    this.tone(659, 0.12, 'triangle', 0.5);
    this.tone(784, 0.22, 'triangle', 0.5);
  }

  /** Something huge turning over below the keel: sea beasts. */
  roar() {
    this.noise(0.55, 0.85);
    this.tone(90, 0.5, 'sawtooth', 0.45, 42);
  }

  /** A rival's colours break out — the sting before a named fight. */
  stinger() {
    this.tone(196, 0.18, 'square', 0.35);
    this.tone(147, 0.3, 'square', 0.35, 110);
  }

  /** Hull timbers taking a heavy blow. */
  crunch() {
    this.noise(0.22, 0.7);
    this.tone(150, 0.16, 'triangle', 0.35, 70);
  }

  /** Renown won: a bright two-note salute. */
  renown() {
    this.tone(659, 0.1, 'triangle', 0.45);
    this.tone(988, 0.16, 'triangle', 0.4);
  }
}
