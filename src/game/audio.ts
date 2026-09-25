// All sound is synthesized at runtime with the Web Audio API — no asset downloads.
import {
  BOSS_CASSETTE,
  INSERTED_CASSETTE,
  bossCassette,
  randomCassette,
  randomCassetteForEra,
  type Cassette,
  type Deck,
  type MusicMode,
} from './music';
import type { EraId } from './types';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class Sfx {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBusA!: GainNode;
  private musicBusB!: GainNode;
  private musicFront = 0; // which of A/B receives newly scheduled notes
  private ambBus!: GainNode;
  private noiseBuf!: AudioBuffer;
  sfxOn = true;
  musicOn = true;
  private gates: Record<string, number> = {};
  private musicTimer = 0;
  private step = 0;
  private nextTime = 0;
  private cassette: Cassette = INSERTED_CASSETTE;
  /** The sea being sailed: picks which era's tapes the deck loads. */
  private era: EraId | null = null;
  private wave = 1;
  private stepDur = this.cassette.stepDuration(1);
  private ducked = false;
  private ambStarted = false;
  private mode: MusicMode = 1;

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
      this.ambBus = ctx.createGain();
      this.sfxBus.connect(this.master);
      this.ambBus.connect(this.master);
      // music: two buses so a new cassette can crossfade in while the old
      // song's already-scheduled notes fade out, plus a reverb send that
      // gives the band the space of a wooden deck
      this.musicBusA = ctx.createGain();
      this.musicBusB = ctx.createGain();
      this.musicBusB.gain.value = 0;
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = 0.4;
      const conv = ctx.createConvolver();
      conv.buffer = this.makeImpulse(1.8, 2.8);
      const reverbReturn = ctx.createGain();
      reverbReturn.gain.value = 0.55;
      conv.connect(reverbReturn);
      reverbReturn.connect(this.master);
      reverbSend.connect(conv);
      this.musicBusA.connect(this.master);
      this.musicBusA.connect(reverbSend);
      this.musicBusB.connect(this.master);
      this.musicBusB.connect(reverbSend);
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

  /** Exponentially-decaying noise stereo impulse — a cheap generated reverb. */
  private makeImpulse(seconds: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
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
    const mv = this.musicOn ? (this.ducked ? 0.1 : 0.3) : 0;
    this.musicBusA.gain.setTargetAtTime(this.musicFront === 0 ? mv : 0, t, 0.08);
    this.musicBusB.gain.setTargetAtTime(this.musicFront === 1 ? mv : 0, t, 0.08);
  }

  private frontMusicLevel(): number {
    return this.musicOn ? (this.ducked ? 0.1 : 0.3) : 0;
  }

  duck(on: boolean) {
    this.ducked = on;
    this.applyVolumes();
  }

  /** Adaptive intensity: 0 calm sailing, 1 full band, 2 low-hull danger. */
  setMode(mode: MusicMode) {
    this.mode = mode;
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
  /** Bowstring snap / wooden pulley release, without a powder report. */
  bow(vol = 1, pan = 0) {
    if (!this.ok() || vol < 0.03 || !this.gate('bow', 0.028)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    this.tone(d, t, 'triangle', 410, 130, 0.12, 0.22 * vol);
    this.noise(d, t, 0.13, 0.12 * vol, 'bandpass', 1800, 850, 1, 0.003);
  }

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

  /** A chase gun: one sharp crack over the bow or the stern, lighter than a broadside. */
  chaser(vol = 1, pan = 0) {
    if (!this.ok() || !this.gate('chaser', 0.05)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    const v = vol * (0.85 + Math.random() * 0.3);
    this.noise(d, t, 0.42, 0.45 * v, 'lowpass', 2200, 240, 0.8, 0.002);
    this.tone(d, t, 'triangle', 520, 140, 0.16, 0.3 * v, 0.002);
    this.noise(d, t, 0.06, 0.22 * v, 'highpass', 2800, 1800, 0.7, 0.001);
  }

  /** Grapeshot: one heavy thump, then a long metal-and-shot hiss sweeping out. */
  grapeshot(vol = 1, pan = 0) {
    if (!this.ok() || !this.gate('grape', 0.08)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    this.tone(d, t, 'sine', 92, 26, 0.55, 1.05 * vol, 0.003);
    this.noise(d, t, 1.05, 0.55 * vol, 'bandpass', 1500, 320, 0.6, 0.006);
    this.noise(d, t, 0.35, 0.4 * vol, 'highpass', 3400, 1800, 0.7, 0.002);
    // spent shot tinkling off the deck and into the water
    for (let i = 0; i < 5; i++) {
      const tt = t + 0.05 + Math.random() * 0.3;
      this.tone(d, tt, 'triangle', 900 + Math.random() * 900, 320, 0.07, 0.09 * vol, 0.001);
    }
  }

  /** A ship on fire: hungry crackle, rushing flame, no powder in it. */
  burn(vol = 1, pan = 0) {
    if (!this.ok() || vol < 0.05 || !this.gate('burn', 0.3)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    for (let i = 0; i < 7; i++) {
      this.noise(d, t + i * 0.045, 0.07 + Math.random() * 0.09, 0.16 * vol, 'bandpass', 2600 + Math.random() * 1600, 900, 0.9, 0.004, 0.8 + Math.random() * 0.5);
    }
    this.noise(d, t, 1.15, 0.16 * vol, 'lowpass', 620, 200, 0.7, 0.09);
  }

  /** A fire siphon: bronze nozzle, a rasping hiss of naphtha spraying out. */
  siphon(vol = 1, pan = 0) {
    if (!this.ok() || vol < 0.04 || !this.gate('siphon', 0.07)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    // the hiss of the jet, swept outwards as the nozzle plays over the target
    this.noise(d, t, 0.55, 0.42 * vol, 'bandpass', 1300, 3400, 1.1, 0.02, 0.7);
    this.tone(d, t, 'sawtooth', 190, 95, 0.38, 0.13 * vol, 0.012);
    // and the low roar of a thing that is already burning at the nozzle
    this.noise(d, t, 0.75, 0.22 * vol, 'lowpass', 900, 260, 0.8, 0.05);
  }

  /** Something going up by fire, not powder: a whoosh of flame and a crackle. */
  fireBurst(vol = 1, pan = 0) {
    if (!this.ok() || vol < 0.05 || !this.gate('fireburst', 0.12)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    const v = vol * (0.85 + Math.random() * 0.3);
    this.noise(d, t, 0.95, 0.5 * v, 'bandpass', 460, 1500, 0.8, 0.06, 1.15);
    this.tone(d, t, 'sine', 125, 46, 0.6, 0.45 * v, 0.02);
    for (let i = 0; i < 9; i++) {
      this.noise(d, t + 0.04 + Math.random() * 0.7, 0.06 + Math.random() * 0.09, 0.15 * v, 'bandpass', 2300 + Math.random() * 1800, 1000, 0.9, 0.004, 0.85 + Math.random() * 0.6);
    }
  }

  /** A guided missile: hard booster roar, then a thin scream fading out. */
  missile(vol = 1, pan = 0) {
    if (!this.ok() || !this.gate('missile', 0.07)) return;
    const t = this.ctx!.currentTime;
    const d = this.dest(pan);
    this.noise(d, t, 0.9, 0.5 * vol, 'lowpass', 1500, 260, 0.8, 0.02, 1.6);
    this.tone(d, t, 'sawtooth', 130, 310, 0.9, 0.12 * vol, 0.03);
    this.tone(d, t + 0.1, 'square', 1900, 620, 0.85, 0.05 * vol, 0.25);
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

  /** Swap the cassette; the new song fades in over the old one. */
  insertCassette(cassette: Cassette) {
    this.cassette = cassette;
    this.stepDur = cassette.stepDuration(this.wave);
    this.step = 0;
    if (this.ctx && this.ctx.state === 'running') {
      // crossfade: new cassette is scheduled onto the quiet bus while the old
      // song's in-flight notes fade out on the other one
      const t = this.ctx.currentTime;
      const old = this.musicFront;
      this.musicFront = 1 - old;
      const fade = 1.2;
      const buses = [this.musicBusA, this.musicBusB];
      buses[old].gain.cancelScheduledValues(t);
      buses[old].gain.setValueAtTime(buses[old].gain.value, t);
      buses[old].gain.linearRampToValueAtTime(0, t + fade);
      buses[1 - old].gain.cancelScheduledValues(t);
      buses[1 - old].gain.setValueAtTime(buses[1 - old].gain.value, t);
      buses[1 - old].gain.linearRampToValueAtTime(this.frontMusicLevel(), t + fade);
    }
    console.info(`[music] Now playing: ${cassette.title}`);
  }

  /** The era whose waters are being sailed — its songs are what the deck plays. */
  setEra(era: EraId) {
    this.era = era;
  }

  /** Title of the cassette on the deck right now — shown when the game pauses. */
  get nowPlaying(): string {
    return this.cassette.title;
  }

  /** Swap in a random cassette from the current era's waters. */
  insertRandomCassette(avoidRepeat = true) {
    const current = avoidRepeat ? this.cassette : undefined;
    this.insertCassette(
      this.era ? randomCassetteForEra(this.era, current) : randomCassette(current),
    );
  }

  /** Swap in the era's boss theme — the dirge that plays when a warship comes. */
  insertBossCassette() {
    this.insertCassette(this.era ? bossCassette(this.era) : BOSS_CASSETTE);
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
      if (this.musicOn && ctx.state === 'running') {
        // humanize: nudge the whole step a few ms early/late so the grid
        // doesn't feel metronomic (jitter is capped by tempo)
        const jit = (Math.random() * 2 - 1) * Math.min(0.005, this.stepDur * 0.06);
        this.playStep(this.step, this.nextTime + jit);
      }
      this.nextTime += this.stepDur;
      this.step = (this.step + 1) % this.cassette.loopSteps;
    }
  };

  // ---------------- music voices ----------------
  private musicBusNow(): AudioNode {
    return this.musicFront === 0 ? this.musicBusA : this.musicBusB;
  }

  /** Panned output node for a music voice (center-panned notes skip the panner). */
  private musicDest(pan: number): AudioNode {
    const ctx = this.ctx!;
    if (Math.abs(pan) > 0.03 && typeof ctx.createStereoPanner === 'function') {
      const p = ctx.createStereoPanner();
      p.pan.value = clamp(pan, -1, 1);
      p.connect(this.musicBusNow());
      return p;
    }
    return this.musicBusNow();
  }

  /** ±8% velocity jitter so notes don't hit with machine-gun evenness. */
  private hum(v: number): number {
    return v * (0.92 + Math.random() * 0.16);
  }

  /** Attack → short decay → held tail → release, all exponential. */
  private voiceEnv(g: GainNode, t: number, vol: number, attack: number, sustain: number, dur: number) {
    const atk = Math.max(0.004, attack);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + atk);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * sustain), t + Math.max(atk + 0.01, Math.min(dur * 0.6, 0.35)));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, atk + 0.02));
  }

  /** Slow pitch wobble for notes long enough to "sing" (fiddle / reed leads). */
  private vibrato(t: number, dur: number, rate: number, depthCents: number, targets: AudioParam[]) {
    if (dur < 0.22 || targets.length === 0) return;
    const ctx = this.ctx!;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = rate;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(depthCents, t + Math.min(0.2, dur * 0.3));
    lfo.connect(g);
    for (const d of targets) g.connect(d);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }

  /** Raw single-oscillator note (legacy Deck.note), with optional panning. */
  private legacyNote(type: OscillatorType, freq: number, t: number, dur: number, vol: number, cutoff: number, pan: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    const g = ctx.createGain();
    const v = this.hum(vol);
    const decayEnd = Math.max(0.03, Math.min(dur * 0.5, 0.1));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + 0.012);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v * 0.55), t + decayEnd);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(decayEnd + 0.02, dur));
    o.connect(f);
    f.connect(g);
    g.connect(this.musicDest(pan));
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  /** Fiddle / concertina: two detuned saws panned apart, bowed filter, vibrato. */
  private fiddleNote(midi: number, t: number, dur: number, vol: number, pan = 0) {
    const ctx = this.ctx!;
    const f = mtof(midi);
    const out = this.musicDest(pan);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(950, t + Math.max(0.08, dur * 0.5));
    const g = ctx.createGain();
    this.voiceEnv(g, t, this.hum(vol), 0.018, 0.72, dur);
    filter.connect(g);
    g.connect(out);
    const detunes: AudioParam[] = [];
    for (const side of [-1, 1]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = side * 7;
      const og = ctx.createGain();
      og.gain.value = 0.55;
      o.connect(og);
      og.connect(filter);
      detunes.push(o.detune);
      o.start(t);
      o.stop(t + dur + 0.06);
    }
    this.vibrato(t, dur, 5.2, 6, detunes);
  }

  /** Reed / shanty voice: square + triangle an octave up, detuned apart, vibrato. */
  private reedNote(midi: number, t: number, dur: number, vol: number, pan = 0, octave = 0, cutoff = 1900) {
    const ctx = this.ctx!;
    const f = mtof(midi + octave);
    const out = this.musicDest(pan);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const g = ctx.createGain();
    this.voiceEnv(g, t, this.hum(vol), 0.008, 0.85, dur);
    filter.connect(g);
    g.connect(out);
    const detunes: AudioParam[] = [];
    const o1 = ctx.createOscillator();
    o1.type = 'square';
    o1.frequency.value = f;
    o1.detune.value = -5;
    const g1 = ctx.createGain();
    g1.gain.value = 0.6;
    o1.connect(g1);
    g1.connect(filter);
    detunes.push(o1.detune);
    o1.start(t);
    o1.stop(t + dur + 0.06);
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = f * 2;
    o2.detune.value = 5;
    const g2 = ctx.createGain();
    g2.gain.value = 0.35;
    o2.connect(g2);
    g2.connect(filter);
    detunes.push(o2.detune);
    o2.start(t);
    o2.stop(t + dur + 0.06);
    this.vibrato(t, dur, 5.6, 5, detunes);
  }

  /** Upright bass: triangle with a sine sub an octave down. */
  private bassNote(midi: number, t: number, dur: number, vol: number) {
    const ctx = this.ctx!;
    const f = mtof(midi);
    const out = this.musicBusNow();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 750;
    const g = ctx.createGain();
    this.voiceEnv(g, t, this.hum(vol * 0.8), 0.006, 0.65, dur);
    filter.connect(g);
    g.connect(out);
    const o1 = ctx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.value = f;
    o1.connect(filter);
    o1.start(t);
    o1.stop(t + dur + 0.06);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = f / 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.7;
    o2.connect(g2);
    g2.connect(filter);
    o2.start(t);
    o2.stop(t + dur + 0.06);
  }

  /** Off-beat chord "pah": two detuned squares panned apart. */
  private stabNote(third: number, fifth: number, t: number, dur: number, vol: number) {
    const ctx = this.ctx!;
    const v = this.hum(vol);
    for (const [midi, pan] of [[third, -0.45], [fifth, 0.45]] as [number, number][]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = mtof(midi);
      o.detune.value = (Math.random() - 0.5) * 10;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 1500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + 0.006);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v * 0.4), t + Math.max(0.03, dur * 0.5));
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.04, dur));
      o.connect(f);
      f.connect(g);
      g.connect(this.musicDest(pan));
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  /** Snare / clap: bandpassed noise with a short tone body, slightly off-center. */
  private snareHit(t: number, vol: number) {
    const v = this.hum(vol);
    const out = this.musicDest(0.15);
    this.noise(out, t, 0.11, 0.75 * v, 'bandpass', 2100, 900, 1.1, 0.002, 1.4);
    this.tone(out, t, 'triangle', 220, 150, 0.07, 0.3 * v, 0.002);
  }

  /** Cymbal crash: long highpassed-noise tail, swells over the loop seam. */
  private crashHit(t: number, vol: number) {
    const v = this.hum(vol);
    this.noise(this.musicBusNow(), t, 1.3, 0.5 * v, 'highpass', 5200, 4200, 0.7, 0.004, 1.2);
  }

  // What the cassette can use to make sound; everything goes to the music bus.
  private deck: Deck = {
    note: (type, midi, t, dur, vol, cutoff, pan = 0) => this.legacyNote(type, mtof(midi), t, dur, vol, cutoff, pan),
    drum: (type, f0, f1, t, dur, vol) => this.toneTo(this.musicBusNow(), t, type, f0, f1, dur, vol),
    noise: (t, dur, vol, freq) => this.noiseTo(this.musicBusNow(), t, dur, vol, freq),
    fiddle: (midi, t, dur, vol, pan = 0) => this.fiddleNote(midi, t, dur, vol, pan),
    reed: (midi, t, dur, vol, pan = 0, octave = 0, cutoff = 1900) => this.reedNote(midi, t, dur, vol, pan, octave, cutoff),
    bass: (midi, t, dur, vol) => this.bassNote(midi, t, dur, vol),
    stab: (third, fifth, t, dur, vol) => this.stabNote(third, fifth, t, dur, vol),
    snare: (t, vol) => this.snareHit(t, vol),
    crash: (t, vol) => this.crashHit(t, vol),
  };

  private playStep(step: number, t: number) {
    this.cassette.playStep(this.deck, step, t, this.stepDur, this.mode);
  }

  private toneTo(dest: AudioNode, t: number, type: OscillatorType, f0: number, f1: number, dur: number, vol: number) {
    this.tone(dest, t, type, f0, f1, dur, this.hum(vol), 0.003);
  }

  private noiseTo(dest: AudioNode, t: number, dur: number, vol: number, freq: number) {
    this.noise(dest, t, dur, this.hum(vol), 'highpass', freq, freq, 0.7, 0.002);
  }

  dispose() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close().catch(() => undefined);
      this.ctx = null;
    }
  }
}
