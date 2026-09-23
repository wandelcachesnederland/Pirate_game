// All sound is synthesized at runtime with the Web Audio API — no asset downloads.
import { INSERTED_CASSETTE, randomCassette, type Cassette, type Deck } from './music';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class Sfx {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private ambBus!: GainNode;
  private noiseBuf!: AudioBuffer;
  sfxOn = true;
  musicOn = true;
  private gates: Record<string, number> = {};
  private musicTimer = 0;
  private step = 0;
  private nextTime = 0;
  private cassette: Cassette = INSERTED_CASSETTE;
  private wave = 1;
  private stepDur = this.cassette.stepDuration(1);
  private ducked = false;
  private ambStarted = false;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
      } catch {
        this.ctx = null;
        return;
      }
      const ctx = this.ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.75;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 10;
      comp.ratio.value = 5;
      comp.attack.value = 0.003;
      comp.release.value = 0.2;
      this.master.connect(comp);
      comp.connect(ctx.destination);
      this.sfxBus = ctx.createGain();
      this.musicBus = ctx.createGain();
      this.ambBus = ctx.createGain();
      this.sfxBus.connect(this.master);
      this.musicBus.connect(this.master);
      this.ambBus.connect(this.master);
      const len = Math.floor(ctx.sampleRate * 2);
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => undefined);
    if (!this.ambStarted) {
      this.ambStarted = true;
      this.startAmbience();
    }
  }

  setEnabled(sfx: boolean, music: boolean) {
    this.sfxOn = sfx;
    this.musicOn = music;
    this.applyVolumes();
  }

  private applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.sfxBus.gain.setTargetAtTime(this.sfxOn ? 0.9 : 0, t, 0.03);
    this.ambBus.gain.setTargetAtTime(this.sfxOn ? 1 : 0, t, 0.1);
    const mv = this.musicOn ? (this.ducked ? 0.1 : 0.32) : 0;
    this.musicBus.gain.setTargetAtTime(mv, t, 0.08);
  }

  duck(on: boolean) {
    this.ducked = on;
    this.applyVolumes();
  }

  private ok(): boolean {
    return this.sfxOn && !!this.ctx && this.ctx.state === 'running';
  }

  private gate(key: string, gap: number): boolean {
    const now = this.ctx!.currentTime;
    const last = this.gates[key] ?? -1;
    if (now - last < gap) return false;
    this.gates[key] = now;
    return true;
  }

  private dest(pan: number): AudioNode {
    const ctx = this.ctx!;
    if (Math.abs(pan) > 0.05 && typeof ctx.createStereoPanner === 'function') {
      const p = ctx.createStereoPanner();
      p.pan.value = clamp(pan, -1, 1);
      p.connect(this.sfxBus);
      return p;
    }
    return this.sfxBus;
  }

  private env(g: GainNode, t: number, vol: number, attack: number, dur: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack + 0.01, dur));
  }

  private noise(
    dest: AudioNode,
    t: number,
    dur: number,
    vol: number,
    type: BiquadFilterType,
    f0: number,
    f1: number,
    q = 0.8,
    attack = 0.004,
    rate = 1,
  ) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = rate;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    this.env(g, t, vol, attack, dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    const maxOff = Math.max(0, this.noiseBuf.duration - dur * rate - 0.05);
    src.start(t, Math.random() * maxOff);
    src.stop(t + dur + 0.05);
  }

  private tone(
    dest: AudioNode,
    t: number,
    type: OscillatorType,
    f0: number,
    f1: number,
    dur: number,
    vol: number,
    attack = 0.004,
  ) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    this.env(g, t, vol, attack, dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // ---------------- SFX ----------------
  cannon(vol = 1, pan = 0) {
    if (!this.ok() || vol < 0.03 || !this.gate('cannon', 0.028)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    const v = vol * (0.85 + Math.random() * 0.3);
    this.noise(d, t, 0.95, 0.85 * v, 'lowpass', 2600, 130, 0.7, 0.003, 0.75 + Math.random() * 0.3);
    this.tone(d, t, 'sine', 115 + Math.random() * 25, 32, 0.45, 1.0 * v, 0.003);
    this.noise(d, t, 0.07, 0.3 * v, 'highpass', 2600, 2000, 0.7, 0.001);
  }

  swivel(vol = 1, pan = 0) {
    if (!this.ok() || !this.gate('swivel', 0.05)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    this.noise(d, t, 0.18, 0.35 * vol, 'bandpass', 2400, 700, 1, 0.002);
    this.tone(d, t, 'triangle', 380, 120, 0.1, 0.25 * vol);
  }

  splash(vol = 1, pan = 0) {
    if (!this.ok() || vol < 0.04 || !this.gate('splash', 0.035)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    this.noise(d, t, 0.5, 0.3 * vol, 'bandpass', 1700, 420, 0.9, 0.012);
    this.tone(d, t, 'sine', 540, 170, 0.14, 0.09 * vol);
  }

  hit(vol = 1, pan = 0) {
    if (!this.ok() || vol < 0.04 || !this.gate('hit', 0.03)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    this.noise(d, t, 0.3, 0.8 * vol, 'bandpass', 1150, 260, 1.4, 0.002);
    this.tone(d, t, 'square', 200, 55, 0.13, 0.16 * vol);
    this.noise(d, t, 0.05, 0.4 * vol, 'highpass', 3300, 2500, 0.7, 0.001);
  }

  playerHit() {
    if (!this.ok() || !this.gate('phit', 0.05)) return;
    const t = this.ctx!.currentTime;
    const d = this.sfxBus;
    this.noise(d, t, 0.45, 0.9, 'bandpass', 800, 160, 1.2, 0.002);
    this.tone(d, t, 'sine', 140, 40, 0.3, 0.9);
    this.noise(d, t, 0.06, 0.5, 'highpass', 2800, 2000, 0.7, 0.001);
  }

  explosion(vol = 1, pan = 0) {
    if (!this.ok() || !this.gate('explosion', 0.06)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    this.noise(d, t, 1.7, 1.0 * vol, 'lowpass', 1900, 55, 0.6, 0.004, 0.6);
    this.tone(d, t, 'sine', 95, 24, 1.1, 1.1 * vol, 0.004);
    for (let i = 0; i < 4; i++) {
      this.noise(d, t + 0.08 + Math.random() * 0.6, 0.12, 0.22 * vol, 'bandpass', 2000 + Math.random() * 1500, 700, 1.2, 0.002);
    }
  }

  thud(vol = 1) {
    if (!this.ok() || !this.gate('thud', 0.15)) return;
    const t = this.ctx!.currentTime;
    this.tone(this.sfxBus, t, 'sine', 95, 40, 0.3, 0.7 * vol);
    this.noise(this.sfxBus, t, 0.3, 0.45 * vol, 'lowpass', 700, 90, 0.7, 0.003);
  }

  coin(step: number) {
    if (!this.ok() || !this.gate('coin', 0.018)) return;
    const t = this.ctx!.currentTime;
    const f = 880 * Math.pow(2, Math.min(step, 14) / 12);
    this.tone(this.sfxBus, t, 'triangle', f, f, 0.06, 0.22);
    this.tone(this.sfxBus, t, 'square', f, f, 0.04, 0.03);
    this.tone(this.sfxBus, t + 0.055, 'triangle', f * 1.5, f * 1.5, 0.18, 0.2);
  }

  chest() {
    if (!this.ok()) return;
    const t = this.ctx!.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      this.tone(this.sfxBus, t + i * 0.065, 'triangle', f, f, i === 4 ? 0.5 : 0.14, 0.2);
    });
  }

  repair() {
    if (!this.ok()) return;
    const t = this.ctx!.currentTime;
    this.noise(this.sfxBus, t, 0.08, 0.4, 'bandpass', 900, 600, 2, 0.001);
    this.noise(this.sfxBus, t + 0.12, 0.08, 0.4, 'bandpass', 1000, 650, 2, 0.001);
    this.tone(this.sfxBus, t + 0.05, 'triangle', 392, 392, 0.14, 0.18);
    this.tone(this.sfxBus, t + 0.18, 'triangle', 587.3, 587.3, 0.28, 0.18);
  }

  streak(level: number) {
    if (!this.ok()) return;
    const t = this.ctx!.currentTime;
    const f = 523.25 * Math.pow(2, Math.min(level, 10) / 12);
    this.tone(this.sfxBus, t, 'square', f, f, 0.08, 0.06);
    this.tone(this.sfxBus, t + 0.07, 'square', f * 1.335, f * 1.335, 0.08, 0.06);
    this.tone(this.sfxBus, t + 0.14, 'triangle', f * 2, f * 2, 0.25, 0.18);
  }

  horn() {
    if (!this.ok()) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const make = (freq: number, vol: number) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq * 0.94, t);
      o.frequency.exponentialRampToValueAtTime(freq, t + 0.18);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(400, t);
      f.frequency.linearRampToValueAtTime(900, t + 0.3);
      f.frequency.linearRampToValueAtTime(500, t + 1.3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.16);
      g.gain.setValueAtTime(vol, t + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(f);
      f.connect(g);
      g.connect(this.sfxBus);
      o.start(t);
      o.stop(t + 1.5);
    };
    make(110, 0.22);
    make(165, 0.12);
  }

  fanfare() {
    if (!this.ok()) return;
    const t = this.ctx!.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.5];
    const times = [0, 0.1, 0.2, 0.3, 0.48, 0.58, 0.68];
    notes.forEach((f, i) => {
      const dur = i === notes.length - 1 ? 0.7 : 0.12;
      this.tone(this.sfxBus, t + times[i], 'triangle', f, f, dur, 0.2);
      this.tone(this.sfxBus, t + times[i], 'square', f, f, dur * 0.8, 0.035);
    });
  }

  upgrade() {
    if (!this.ok()) return;
    const t = this.ctx!.currentTime;
    [659.25, 830.6, 987.8, 1318.5].forEach((f, i) => {
      this.tone(this.sfxBus, t + i * 0.05, 'triangle', f, f, 0.22, 0.18);
    });
    this.noise(this.sfxBus, t, 0.5, 0.08, 'highpass', 5000, 8000, 0.7, 0.01);
  }

  gameOver() {
    if (!this.ok()) return;
    const t = this.ctx!.currentTime;
    [440, 349.2, 293.7, 220].forEach((f, i) => {
      const dur = i === 3 ? 1.4 : 0.34;
      this.tone(this.sfxBus, t + i * 0.32, 'triangle', f, f * (i === 3 ? 0.97 : 1), dur, 0.22, 0.02);
      this.tone(this.sfxBus, t + i * 0.32, 'sawtooth', f / 2, f / 2, dur, 0.03, 0.02);
    });
  }

  click() {
    if (!this.ok()) return;
    const t = this.ctx!.currentTime;
    this.tone(this.sfxBus, t, 'triangle', 700, 520, 0.06, 0.16);
  }

  // ---------------- Ambience & music ----------------
  private startAmbience() {
    const ctx = this.ctx;
    if (!ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 460;
    const g = ctx.createGain();
    g.gain.value = 0.055;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.035;
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    src.connect(f);
    f.connect(g);
    g.connect(this.ambBus);
    src.start();
    lfo.start();
  }

  setTempo(wave: number) {
    this.wave = wave;
    this.stepDur = this.cassette.stepDuration(wave);
  }

  /** Swap the cassette; the new song starts from the beginning. */
  insertCassette(cassette: Cassette) {
    this.cassette = cassette;
    this.stepDur = cassette.stepDuration(this.wave);
    this.step = 0;
    console.info(`[music] Now playing: ${cassette.title}`);
  }

  /** Swap in a random cassette. With `avoidRepeat`, never the song that is already playing. */
  insertRandomCassette(avoidRepeat = true) {
    this.insertCassette(randomCassette(avoidRepeat ? this.cassette : undefined));
  }

  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.musicTimer = window.setInterval(this.scheduleMusic, 30);
  }

  stopMusic() {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = 0;
    }
  }

  private scheduleMusic = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    if (this.nextTime < ctx.currentTime - 0.3) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.16) {
      if (this.musicOn && ctx.state === 'running') this.playStep(this.step, this.nextTime);
      this.nextTime += this.stepDur;
      this.step = (this.step + 1) % this.cassette.loopSteps;
    }
  };

  private musicNote(type: OscillatorType, freq: number, t: number, dur: number, vol: number, cutoff: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    const g = ctx.createGain();
    const decayEnd = Math.max(0.03, Math.min(dur * 0.5, 0.1));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(vol * 0.55, t + decayEnd);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(decayEnd + 0.02, dur));
    o.connect(f);
    f.connect(g);
    g.connect(this.musicBus);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  // What the cassette can use to make sound; everything goes to the music bus.
  private deck: Deck = {
    note: (type, midi, t, dur, vol, cutoff) => this.musicNote(type, mtof(midi), t, dur, vol, cutoff),
    drum: (type, f0, f1, t, dur, vol) => this.toneTo(this.musicBus, t, type, f0, f1, dur, vol),
    noise: (t, dur, vol, freq) => this.noiseTo(this.musicBus, t, dur, vol, freq),
  };

  private playStep(step: number, t: number) {
    this.cassette.playStep(this.deck, step, t, this.stepDur);
  }

  private toneTo(dest: AudioNode, t: number, type: OscillatorType, f0: number, f1: number, dur: number, vol: number) {
    this.tone(dest, t, type, f0, f1, dur, vol, 0.003);
  }

  private noiseTo(dest: AudioNode, t: number, dur: number, vol: number, freq: number) {
    this.noise(dest, t, dur, vol, 'highpass', freq, freq, 0.7, 0.002);
  }

  dispose() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close().catch(() => undefined);
      this.ctx = null;
    }
  }
}
