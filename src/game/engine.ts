import type {
  CapturedFlag,
  EraId,
  Fortress,
  GameStats,
  Island,
  RegionId,
  Screen,
  Ship,
  ShipDef,
  ShipInventory,
  ShipKind,
  UpgradeId,
  UpgradeOffer,
} from './types';
import { SHIP_DEFS, UPGRADES, waveCompositionFor, waveTitleFor } from './data';
import { DEFAULT_ERA, ERA_FLAGSHIPS } from './ships/era';
import { DEFAULT_REGION, regionById } from './worlds';
import { BOARD_MIN_CREW, BOARD_RANGE, rollBoardingOutcome, SURRENDER_HP, SURRENDER_HP_DESPERATE, surrenderChance } from './boarding';
import { Input } from './input';
import { Sfx } from './audio';
import type { MusicMode } from './music';
import {
  buildIsland,
  drawChest,
  drawCoin,
  drawCrate,
  islandRadiusAt,
  makeGlow,
  makeVignette,
  makeWaterTile,
  makeWaveTile,
  rr,
  drawFortRuin,
} from './render';
import { PROVOKE, assignIslandPolitics, coolOff, flagOf, provokeNetwork, rollSettlement } from './settlements';
import { cannonLocalX, drawFlagArt, drawShip, drawShipShadow } from './sprites';
import { armShipForEra, projectileFor, upgradeForEra, usesGunpowder, type ProjectileKind } from './weapons';
import { angDiff, TAU } from './math';

// Re-exported so callers can keep importing `angDiff` from the engine.
export { angDiff };
const HALF_PI = Math.PI / 2;
/** Half-width of the chart. 4200 doubles each dimension — four times the sea. */
export const WORLD = 4200;
const MAX_PARTICLES = 1100;
const MAX_PICKUPS = 260;
const STREAK_TIME = 7;
const MAX_MULT = 8;
/**
 * Grape & Canister — the anti-boat gun. One touch of the linstock sprays the
 * whole hull with musket balls and scrap: murderous against open boats and
 * boarding parties, near useless against a real ship's timbers.
 * Index 0 is level 1.
 */
const GRAPE = [
  { range: 205, cd: 10, small: 46, big: 11, shove: 210 },
  { range: 240, cd: 8.5, small: 62, big: 15, shove: 250 },
  { range: 275, cd: 7, small: 82, big: 19, shove: 290 },
];
/**
 * Chase Guns — the bow and stern chasers. Two light guns that fire by
 * themselves at whatever is ahead or astern, which is exactly where a hunting
 * canoe (or a ship running you down) tends to be. Small calibre: they punish
 * open boats, but barely scratch a ship-of-the-line's timbers.
 * Index 0 is level 1.
 */
const CHASER = [
  { range: 360, reload: 3.4, dmg: 20 },
  { range: 420, reload: 3.0, dmg: 26 },
  { range: 480, reload: 2.5, dmg: 34 },
];
/** Damage multiplier when a chase gun lands on something bigger than a boat. */
const CHASER_BIG = 0.45;
/** Island raiders hunt for a while, then break off and go home. */
const NATIVE_HUNT = [15, 30];
/** How far a war party is willing to stray from its own beach. */
const NATIVE_LEASH = [340, 540];
/** A player this close to the beach is in their waters — they always fight. */
const NATIVE_GUARD = 320;
/** Spent raiders loiter this long off the beach before hauling out. */
const NATIVE_BEACH = [11, 19];
const FONT = '"Pirata One", Georgia, serif';
const FELL = '"IM Fell English", Georgia, serif';

const P_SMOKE = 0;
const P_FIRE = 1;
const P_SPARK = 2;
const P_SPLINTER = 3;
const P_DROP = 4;
const P_RING = 5;
const P_FOAM = 6;
const P_PLANK = 7;
const P_BUBBLE = 8;
const P_SPARKLE = 9;
const P_FLASH = 10;
const P_SAND = 11;
const P_ARROW = 12;
const ADDITIVE = [false, true, true, false, false, false, false, false, false, true, true, false, false];

const FIRE_COLORS = ['#ffe08a', '#ffb347', '#ff7b2e', '#ff5a1f'];
const SMOKE_LIGHT = ['#ece8e0', '#dcd6cc', '#cdc6ba'];
const SMOKE_DARK = ['#4a4541', '#3a3532', '#5a5550'];
const WOOD = ['#8a5a2e', '#6b4423', '#b07a45', '#5a3a1e'];
const SAND = ['#e6cf96', '#d4b87a', '#f1e0b0'];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
function pick<T>(arr: T[]): T {
  return arr[(Math.random() * arr.length) | 0];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  grow: number;
  color: string;
  type: number;
  rot: number;
  vrot: number;
  drag: number;
  alpha: number;
  layer: number;
}
interface Ball {
  projectile: ProjectileKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  team: 0 | 1;
  dmg: number;
  chain: boolean;
  small: boolean;
  /** Mortar shell: arcs overhead, then explodes on landing. */
  mortar: boolean;
  /** Chase gun: fired fore or aft; hits boats hard and real timbers lightly. */
  chaser?: boolean;
}
interface Pickup {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: 0 | 1 | 2;
  value: number;
  life: number;
  seed: number;
  magnet: boolean;
  mspeed: number;
}
interface FText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  size: number;
  life: number;
  max: number;
}
interface Volley {
  ship: Ship;
  side: number;
  lx: number;
  rel: number;
  delay: number;
  dmg: number;
}
interface Streak {
  x: number;
  y: number;
  life: number;
  max: number;
  len: number;
}
interface Banner {
  title: string;
  sub: string;
  t: number;
  dur: number;
  gold: boolean;
}
interface PlayerStats {
  cannons: number;
  reloadMul: number;
  damageMul: number;
  rangeMul: number;
  speedMul: number;
  turnMul: number;
  maxHp: number;
  magnet: number;
  regen: number;
  swivel: number;
  chain: boolean;
  /** Levels of Grape & Canister fitted (0 = no such gun on deck). */
  grapeshot: number;
  /** Levels of bow/stern chase guns fitted (0 = none shipped). */
  chase: number;
}

function defaultStats(def: ShipDef): PlayerStats {
  return {
    cannons: def.cannons,
    reloadMul: 1,
    damageMul: 1,
    rangeMul: 1,
    speedMul: 1,
    turnMul: 1,
    maxHp: def.hp,
    magnet: 95,
    regen: 0,
    swivel: 0,
    chain: false,
    grapeshot: 0,
    chase: 0,
  };
}

export interface EngineCallbacks {
  onScreen: (s: Screen) => void;
  onGameOver: (stats: GameStats) => void;
  onUpgrade: (offers: UpgradeOffer[], wave: number) => void;
}

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cb: EngineCallbacks;
  readonly input = new Input();
  readonly sfx = new Sfx();
  private musicMode: MusicMode = 1;
  screen: Screen = 'menu';

  private w = 1;
  private h = 1;
  private dpr = 1;
  private maxDpr = 2;
  private viewScale = 1;
  private ui = 1;
  private safe = { t: 0, r: 0, b: 0, l: 0 };
  private safeProbe: HTMLDivElement;
  private isTouch = false;

  private raf = 0;
  private last = 0;
  private time = 0;
  private realTime = 0;
  private timeScale = 1;
  private slowMo = 0;
  private hitStop = 0;
  private perfAcc = 0;
  private perfFrames = 0;

  private camX = 0;
  private camY = 0;
  private zoom = 1;
  private zoomPunch = 0;
  private trauma = 0;
  private kickX = 0;
  private kickY = 0;
  private vx0 = 0;
  private vy0 = 0;
  private vx1 = 0;
  private vy1 = 0;
  private curScale = 1;
  private shx = 0;
  private shy = 0;

  private islands: Island[] = [];
  private ships: Ship[] = [];
  private player!: Ship;
  private balls: Ball[] = [];
  private parts: Particle[] = [];
  private pCount = 0;
  private pickups: Pickup[] = [];
  private texts: FText[] = [];
  private volleys: Volley[] = [];
  private streaks: Streak[] = [];
  private nextId = 1;

  private windAngle = 0;
  private windTarget = 0;
  private windTimer = 20;
  private windX = 1;
  private windY = 0;

  private score = 0;
  private displayScore = 0;
  private scoreStr = '0';
  private scoreStrVal = -1;
  private mult = 1;
  private streakTimer = 0;
  private wave = 0;
  private waveQueue: ShipKind[] = [];
  private spawnTimer = 0;
  private waveClearing = false;
  private clearTimer = 0;
  private waveDamage = 0;
  private magnetAll = false;
  private stats = { shots: 0, hits: 0, sunk: 0, gold: 0, maxStreak: 1, time: 0, boarded: 0 };
  private banner: Banner = { title: '', sub: '', t: 99, dur: 0, gold: false };
  private hintTimer = 0;
  private firstHit = false;
  private playerDeadTimer = -1;
  private flashRed = 0;
  private flashWhite = 0;
  private scorePulse = 0;
  private hullShake = 0;
  private multPulse = 0;
  private goldPopup = 0;
  private goldPopupTimer = 0;
  private goldPopupPulse = 0;
  private coinChain = 0;
  private coinChainTimer = 0;
  private levels: Partial<Record<UpgradeId, number>> = {};
  /** Era flagship the player sails; swapped from the hull picker. */
  private eraId: EraId = DEFAULT_ERA;
  private playerDef: ShipDef = ERA_FLAGSHIPS[DEFAULT_ERA];
  private pstats: PlayerStats = defaultStats(ERA_FLAGSHIPS[DEFAULT_ERA]);
  private swivelTimer = 0;
  /** Cooling of the Grape & Canister gun; 0 = ready to fire. */
  private grapeCd = 0;
  /** Reload clocks of the bow chaser and the stern chaser — they fire unasked. */
  private bowTimer = 0;
  private sternTimer = 0;
  /** Throttles the "they've given up" call so a breaking pack doesn't spam it. */
  private nativeCallTimer = 0;
  private nativeTimer = rand(4, 8);
  /** Waters being sailed — picked on the menu, scenery only. */
  private regionId: RegionId = DEFAULT_REGION;
  private waterBase = '#1a7394';
  /** The ship's stores — water, food, souls in irons, colours struck. */
  private water = 100;
  private maxWater = 150;
  private food = 100;
  private maxFood = 150;
  private prisoners = 0;
  private flags: CapturedFlag[] = [];
  /** Surrendered foe lying alongside, ready to board — if any. */
  private boardCandidate: Ship | null = null;
  private supplyTimer = 0;
  private storeWarnTimer = 0;

  private waterPattern: CanvasPattern | null = null;
  private wavePatternA: CanvasPattern | null = null;
  private wavePatternB: CanvasPattern | null = null;
  private glowWarm: HTMLCanvasElement;
  private glowGold: HTMLCanvasElement;
  private vignette: HTMLCanvasElement;
  private redVignette: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D is not supported');
    this.ctx = ctx;
    this.cb = cb;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.parts.push({
        x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, grow: 0, color: '#fff',
        type: 0, rot: 0, vrot: 0, drag: 0, alpha: 1, layer: 0,
      });
    }
    for (let i = 0; i < 26; i++) this.streaks.push({ x: 0, y: 0, life: 0, max: 1, len: 40 });
    this.buildWaterPatterns();
    this.glowWarm = makeGlow('rgba(255,245,210,1)', 'rgba(255,190,90,0.55)', 'rgba(255,120,30,0)');
    this.glowGold = makeGlow('rgba(255,236,150,0.9)', 'rgba(255,200,60,0.35)', 'rgba(255,180,40,0)');
    this.vignette = makeVignette(2, 14, 30, 0.62);
    this.redVignette = makeVignette(190, 16, 8, 0.95);
    this.safeProbe = document.createElement('div');
    this.safeProbe.className = 'safe-probe';
    document.body.appendChild(this.safeProbe);
    this.isTouch =
      (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) ||
      (navigator.maxTouchPoints > 0 && 'ontouchstart' in window);
    this.input.attach();
    this.resize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('blur', this.onBlur);
    this.enterMenu();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.input.detach();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('blur', this.onBlur);
    this.safeProbe.remove();
    this.sfx.dispose();
  }

  // ================================================================ public API
  setAudio(sfx: boolean, music: boolean) {
    this.sfx.setEnabled(sfx, music);
  }

  unlockAudio() {
    this.sfx.unlock();
  }

  /** Which flagship the player currently sails. */
  getEra(): EraId {
    return this.eraId;
  }

  /** Pick the player's hull. Rebuilds the ship so the menu shows it at once. */
  setEra(id: EraId) {
    const def = ERA_FLAGSHIPS[id] ?? ERA_FLAGSHIPS[DEFAULT_ERA];
    this.eraId = id;
    this.playerDef = def;
    // the deck follows the era: every sea has its own songs and its own dirge
    this.sfx.setEra(id);
    if (this.screen === 'menu' && this.player) {
      const old = this.player;
      const fresh = this.makeShip('player', old.x, old.y, old.angle);
      const i = this.ships.indexOf(old);
      if (i >= 0) this.ships[i] = fresh;
      else this.ships.push(fresh);
      this.player = fresh;
    }
  }

  /**
   * Let the player hear the sea they are choosing. Picking an era on the menu
   * is a click — a gesture — so this is also where the audio unlocks: the
   * era's own tape starts playing before the first wave is ever launched.
   */
  previewEraMusic() {
    if (this.screen !== 'menu') return;
    this.sfx.unlock();
    this.sfx.setEra(this.eraId);
    this.sfx.insertRandomCassette(false);
    this.sfx.startMusic();
  }

  /** Which waters are being sailed. */
  getRegion(): RegionId {
    return this.regionId;
  }

  /** Pick the sailing region. Rebuilds the menu chart so it shows at once. */
  setRegion(id: RegionId) {
    if (this.regionId === id && this.screen === 'menu') return;
    this.regionId = id;
    this.buildWaterPatterns();
    if (this.screen === 'menu') this.enterMenu();
  }

  /**
   * State of the Grape & Canister gun for the HUD button, or null if the ship
   * isn't fitted with one. `targets` lets the UI glow when boats are in reach.
   */
  getGrapeshot(): { level: number; cd: number; total: number; targets: number } | null {
    const lvl = Math.min(GRAPE.length, this.pstats.grapeshot);
    if (lvl <= 0) return null;
    const g = GRAPE[lvl - 1];
    const p = this.player;
    let targets = 0;
    if (p && this.screen === 'playing' && p.sinking < 0) {
      for (const e of this.ships) {
        if (e.team !== 1 || e.sinking >= 0 || e.captured) continue;
        if (Math.hypot(e.x - p.x, e.y - p.y) <= g.range + e.def.length * 0.5) targets++;
      }
    }
    return { level: lvl, cd: this.grapeCd, total: g.cd, targets };
  }

  /** Fired from the on-screen deck-sweeper button. */
  fireGrapeshotFromUI() {
    this.input.grapeQueued = true;
  }

  /** Prize within boarding reach, if any — polled by the touch BOARD button. */
  getBoardCandidate(): { name: string; crew: number } | null {
    const s = this.boardCandidate;
    if (!s || s.sinking >= 0 || s.captured || !s.surrendered) return null;
    return { name: s.def.name, crew: Math.max(0, Math.ceil(s.crew)) };
  }

  /** UI-triggered boarding (touch button). */
  boardFromUI() {
    if (this.screen === 'playing' && this.boardCandidate) this.resolveBoarding(this.boardCandidate);
  }

  /** Snapshot of the ship's stores for UI overlays. */
  getInventory(): ShipInventory {
    const p = this.player;
    return {
      crew: Math.max(0, Math.ceil(p?.crew ?? 0)),
      maxCrew: Math.max(0, Math.ceil(p?.maxCrew ?? 0)),
      water: Math.floor(this.water),
      maxWater: this.maxWater,
      food: Math.floor(this.food),
      maxFood: this.maxFood,
      prisoners: this.prisoners,
      flags: [...this.flags],
    };
  }

  /** Re-tint the sea for the current region. */
  private buildWaterPatterns() {
    const r = regionById(this.regionId);
    this.waterBase = r.water.base;
    const ctx = this.ctx;
    this.waterPattern = ctx.createPattern(makeWaterTile({ light: r.water.light, dark: r.water.dark }), 'repeat');
    this.wavePatternA = ctx.createPattern(makeWaveTile(77, 30, 0.34), 'repeat');
    this.wavePatternB = ctx.createPattern(makeWaveTile(991, 16, 0.22), 'repeat');
  }

  startGame() {
    this.pstats = defaultStats(this.playerDef);
    this.sfx.unlock();
    this.resetWorld();
    this.score = 0;
    this.displayScore = 0;
    this.mult = 1;
    this.streakTimer = 0;
    this.wave = 0;
    this.stats = { shots: 0, hits: 0, sunk: 0, gold: 0, maxStreak: 1, time: 0, boarded: 0 };
    this.levels = {};
    this.pstats = defaultStats(this.playerDef);
    this.swivelTimer = 0;
    this.grapeCd = 0;
    this.bowTimer = 0;
    this.sternTimer = 0;
    this.nativeCallTimer = 0;
    this.goldPopup = 0;
    this.goldPopupTimer = 0;
    this.coinChain = 0;
    this.player = this.makeShip('player', 0, 0, this.windAngle + rand(-0.5, 0.5));
    this.applyPlayerStats();
    this.player.hp = this.player.maxHp;
    this.player.ghostHp = this.player.maxHp;
    // full water butts and bread room at sailing; the hold starts empty
    this.water = 100;
    this.food = 100;
    this.prisoners = 0;
    this.flags = [];
    this.boardCandidate = null;
    this.supplyTimer = 0;
    this.storeWarnTimer = 0;
    this.ships.push(this.player);
    this.camX = 0;
    this.camY = 0;
    this.zoom = 1.12;
    this.playerDeadTimer = -1;
    this.hintTimer = 0;
    this.firstHit = false;
    this.waveClearing = false;
    this.input.clear();
    this.input.enabled = true;
    this.screen = 'playing';
    this.cb.onScreen('playing');
    this.sfx.setEra(this.eraId);
    this.startWave(1);
    this.sfx.stopMusic();
    this.sfx.startMusic();
    this.sfx.duck(false);
    this.musicMode = 1;
    this.sfx.setMode(1);
  }

  pause() {
    if (this.screen !== 'playing' || this.playerDeadTimer >= 0) return;
    this.screen = 'paused';
    this.input.clear();
    this.input.enabled = false;
    this.sfx.duck(true);
    this.cb.onScreen('paused');
  }

  resume() {
    if (this.screen !== 'paused') return;
    this.sfx.unlock();
    this.screen = 'playing';
    this.input.clear();
    this.input.enabled = true;
    this.last = performance.now();
    this.sfx.duck(false);
    this.cb.onScreen('playing');
  }

  quitToMenu() {
    this.sfx.stopMusic();
    this.sfx.duck(false);
    this.enterMenu();
    // back in port: the era's tape comes back up while the charts are out
    this.previewEraMusic();
  }

  chooseUpgrade(id: UpgradeId) {
    if (this.screen !== 'upgrade') return;
    const def = UPGRADES.map((u) => upgradeForEra(u, this.eraId)).find((u) => u.id === id);
    if (!def) return;
    if ((this.levels[id] ?? 0) >= def.max) return;
    this.levels[id] = (this.levels[id] ?? 0) + 1;
    const ps = this.pstats;
    const p = this.player;
    switch (id) {
      case 'cannons':
        ps.cannons += 1;
        break;
      case 'reload':
        ps.reloadMul *= 0.85;
        break;
      case 'damage':
        ps.damageMul += 0.25;
        break;
      case 'hull':
        ps.maxHp += 30;
        break;
      case 'sails':
        ps.speedMul += 0.1;
        break;
      case 'rudder':
        ps.turnMul += 0.18;
        break;
      case 'range':
        ps.rangeMul += 0.18;
        break;
      case 'magnet':
        ps.magnet += 75;
        break;
      case 'carpenter':
        ps.regen += 1.5;
        break;
      case 'swivel':
        ps.swivel += 1;
        break;
      case 'chain':
        ps.chain = true;
        break;
      case 'grapeshot':
        ps.grapeshot += 1;
        break;
      case 'chaser':
        ps.chase += 1;
        break;
    }
    this.applyPlayerStats();
    if (id === 'hull') p.hp = p.maxHp;
    this.sfx.upgrade();
    this.screen = 'playing';
    this.input.clear();
    this.input.enabled = true;
    this.last = performance.now();
    this.sfx.duck(false);
    this.cb.onScreen('playing');
    this.addText(p.x, p.y - 44, `${def.name}!`, '#9fe7ff', 24);
    if (id === 'grapeshot') this.addText(p.x, p.y - 20, 'Press R to sweep the deck!', '#ffd84d', 17);
    this.fxSparkle(p.x, p.y, 14, '#9fe7ff');
    this.startWave(this.wave + 1);
  }

  // ================================================================ setup
  private onResize = () => this.resize();
  private onVisibility = () => {
    if (document.hidden) this.pause();
  };
  private onBlur = () => this.pause();

  private resize() {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    this.w = w;
    this.h = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.viewScale = clamp(Math.sqrt(w * h) / 880, 0.58, 1.25);
    this.ui = clamp(Math.min(w, h) / 720, 0.72, 1.15);
    const cs = getComputedStyle(this.safeProbe);
    this.safe = {
      t: parseFloat(cs.paddingTop) || 0,
      r: parseFloat(cs.paddingRight) || 0,
      b: parseFloat(cs.paddingBottom) || 0,
      l: parseFloat(cs.paddingLeft) || 0,
    };
  }

  private enterMenu() {
    this.screen = 'menu';
    this.wave = 0;
    this.resetWorld();
    this.input.enabled = false;
    this.input.clear();
    this.player = this.makeShip('player', 0, 0, rand(0, TAU));
    this.player.sail = 0.7;
    this.ships.push(this.player);
    const kinds: ShipKind[] = ['merchant', 'sloop', 'brig', 'merchant'];
    for (const k of kinds) {
      for (let tries = 0; tries < 20; tries++) {
        const a = rand(0, TAU);
        const d = rand(260, 700);
        const x = Math.cos(a) * d;
        const y = Math.sin(a) * d;
        if (this.pointInIsland(x, y, 80)) continue;
        this.ships.push(this.makeShip(k, x, y, rand(0, TAU)));
        break;
      }
    }
    this.camX = 0;
    this.camY = 0;
    this.playerDeadTimer = -1;
    this.cb.onScreen('menu');
  }

  private resetWorld() {
    this.generateWorld();
    this.ships = [];
    this.balls = [];
    this.pickups = [];
    this.texts = [];
    this.volleys = [];
    this.pCount = 0;
    this.windAngle = rand(0, TAU);
    this.windTarget = this.windAngle;
    this.windTimer = rand(18, 28);
    this.windX = Math.cos(this.windAngle);
    this.windY = Math.sin(this.windAngle);
    this.trauma = 0;
    this.kickX = 0;
    this.kickY = 0;
    this.zoomPunch = 0;
    this.flashRed = 0;
    this.flashWhite = 0;
    this.timeScale = 1;
    this.slowMo = 0;
    this.hitStop = 0;
    this.magnetAll = false;
    this.banner.t = 99;
    for (const st of this.streaks) {
      st.life = 0;
    }
  }

  private generateWorld() {
    // release old island bitmaps promptly (iOS Safari holds canvas memory otherwise)
    for (const old of this.islands) {
      old.canvas.width = 0;
      old.canvas.height = 0;
    }
    this.islands = [];
    const res = clamp(this.viewScale * this.dpr, 0.7, 1.25);
    const seedBase = (Math.random() * 1e9) | 0;
    const region = regionById(this.regionId);
    const theme = region.islands;
    let forts = 0;
    let tries = 0;
    // the chart is four times the sea it was — island count keeps the old density
    while (this.islands.length < 30 && tries++ < 2500) {
      const r = rand(80, 190);
      const x = rand(-WORLD + r + 140, WORLD - r - 140);
      const y = rand(-WORLD + r + 140, WORLD - r - 140);
      if (Math.hypot(x, y) < r * 1.35 + 480) continue;
      let ok = true;
      for (const o of this.islands) {
        if (Math.hypot(o.x - x, o.y - y) < o.maxR + r * 1.35 + 290) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      // who lives here, if anyone: friendliness, patience and the odd fortress
      const settlement = rollSettlement(region.people, forts, this.wave);
      if (settlement.fortress) forts++;
      this.islands.push(
        buildIsland(x, y, r, seedBase + tries * 7919, res, theme, { settlement, flag: flagOf(settlement), mechanical: !usesGunpowder(this.eraId) }),
      );
    }
    assignIslandPolitics(this.islands.map((is) => is.settlement));
  }

  private makeShip(kind: ShipKind, x: number, y: number, angle: number): Ship {
    const def = armShipForEra(kind === 'player' ? this.playerDef : SHIP_DEFS[kind], this.eraId);
    const w = Math.max(1, this.wave);
    const enemy = kind !== 'player';
    const hp = Math.round(def.hp * (enemy ? 1 + 0.085 * (w - 1) : 1));
    const crew = Math.round((def.crew ?? 20) * (enemy ? 1 + Math.min(0.3, 0.02 * (w - 1)) : 1));
    const v0 = def.speed * 0.45;
    return {
      id: this.nextId++,
      def,
      team: enemy ? 1 : 0,
      x,
      y,
      vx: Math.cos(angle) * v0,
      vy: Math.sin(angle) * v0,
      angle,
      angVel: 0,
      fwd: v0,
      sail: enemy ? 0.8 : 1,
      sailTarget: enemy ? 0.8 : 1,
      turnInput: 0,
      hp,
      maxHp: hp,
      ghostHp: hp,
      crew,
      maxCrew: crew,
      surrendered: false,
      surrenderRolls: 0,
      captured: false,
      reloadL: enemy ? rand(0.8, 2.2) : 0,
      reloadR: enemy ? rand(0.8, 2.2) : 0,
      reloadTime: enemy ? def.reload * Math.max(0.62, 1 - 0.035 * (w - 1)) : def.reload,
      cannons: def.cannons,
      damage: enemy ? def.damage * (1 + 0.06 * (w - 1)) : def.damage,
      range: def.range,
      ballSpeed: def.ballSpeed,
      maxSpeed: def.speed * (enemy ? 1 + Math.min(0.15, 0.012 * (w - 1)) : 1),
      turnRate: def.turn,
      flash: 0,
      recoilL: 0,
      recoilR: 0,
      sinking: -1,
      sinkSpin: Math.random() < 0.5 ? -1 : 1,
      dead: false,
      aiSide: Math.random() < 0.5 ? -1 : 1,
      aiTimer: rand(0, 1.5),
      aiWander: angle,
      aiJitter: enemy ? Math.max(0.035, 0.13 - 0.009 * (w - 1)) : 0,
      aiLead: enemy ? Math.min(1, 0.25 + 0.11 * (w - 1)) : 0,
      slowTimer: 0,
      hitTimer: 99,
      fxTimer: 0,
      wakeTimer: 0,
      bob: rand(0, TAU),
      hitByPlayer: false,
      isBoss: def.boss === true,
      biteTimer: 0,
      homeX: 0,
      homeY: 0,
      leash: 0,
      hunt: -1,
      beach: -1,
      nativeState: 'hunt',
    };
  }

  private applyPlayerStats() {
    const p = this.player;
    const ps = this.pstats;
    const d = p.def;
    p.cannons = ps.cannons;
    p.reloadTime = d.reload * ps.reloadMul;
    p.damage = d.damage * ps.damageMul;
    p.range = d.range * ps.rangeMul;
    p.ballSpeed = d.ballSpeed * (1 + (ps.rangeMul - 1) * 0.7);
    p.maxSpeed = d.speed * ps.speedMul;
    p.turnRate = d.turn * ps.turnMul;
    p.maxHp = ps.maxHp;
    p.hp = Math.min(p.hp, p.maxHp);
  }

  // ================================================================ waves
  private startWave(n: number) {
    this.wave = n;
    this.waveQueue = waveCompositionFor(this.eraId, n);
    this.spawnTimer = n === 1 ? 2.4 : 1.0;
    this.waveClearing = false;
    this.magnetAll = false;
    this.waveDamage = 0;
    this.banner = { title: `Wave ${n}`, sub: waveTitleFor(this.eraId, n), t: 0, dur: 3.2, gold: false };
    this.sfx.horn();
    this.sfx.setTempo(n);
    if (this.waveQueue.some((k) => SHIP_DEFS[k].boss)) {
      // a warship is coming: the deck falls silent to the boss theme
      this.sfx.insertBossCassette();
    } else {
      this.sfx.insertRandomCassette(n > 1);
    }
    if (n === 1) {
      const k = this.waveQueue.shift();
      if (k) this.spawnEnemy(k, 'ahead');
    } else {
      const k = this.waveQueue.shift();
      if (k) this.spawnEnemy(k, 'near');
    }
  }

  private spawnEnemy(kind: ShipKind, mode: 'ahead' | 'near' | 'ring') {
    const p = this.player;
    let x = 0;
    let y = 0;
    for (let tries = 0; tries < 40; tries++) {
      let a: number;
      let d: number;
      if (mode === 'ahead') {
        a = p.angle + rand(-0.45, 0.45);
        d = rand(400, 460);
      } else if (mode === 'near') {
        a = p.angle + rand(-1.3, 1.3);
        d = rand(560, 700);
      } else {
        a = p.angle + rand(-2, 2);
        d = rand(740, 980);
      }
      x = clamp(p.x + Math.cos(a) * d, -WORLD + 160, WORLD - 160);
      y = clamp(p.y + Math.sin(a) * d, -WORLD + 160, WORLD - 160);
      if (!this.pointInIsland(x, y, SHIP_DEFS[kind].boss ? 110 : 75) && Math.hypot(x - p.x, y - p.y) > 330) break;
    }
    const toP = Math.atan2(p.y - y, p.x - x);
    let heading = toP + rand(-0.6, 0.6);
    if (SHIP_DEFS[kind].trader) heading = toP + (Math.random() < 0.5 ? 1 : -1) * rand(1.3, 1.8);
    const s = this.makeShip(kind, x, y, heading);
    if (s.def.trader) s.sail = s.sailTarget = 0.6;
    // a war flotilla on the wave list keeps to the water it appeared in, and is
    // a touch bolder than a village war party
    if (s.def.native) this.anchorNative(s, undefined, 1.2);
    this.ships.push(s);
    if (s.isBoss) {
      this.addTrauma(0.25);
      this.sfx.horn();
    }
  }

  private countEnemies(): number {
    let n = 0;
    // civilians don't count: a village's fishing boat out working the shallows
    // must never hold up the end of a wave
    for (const s of this.ships) if (s.team === 1 && s.sinking < 0 && !s.captured && !s.peaceful) n++;
    return n;
  }

  private findBoss(): Ship | null {
    for (const s of this.ships) if (s.isBoss && s.sinking < 0 && !s.captured) return s;
    return null;
  }

  /** Let the band respond to the state of the fight. */
  private updateMusicMode() {
    if (this.screen !== 'playing' || this.playerDeadTimer >= 0) return;
    const hpFrac = this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1;
    let mode: MusicMode = this.countEnemies() > 0 ? 1 : 0;
    if (hpFrac < 0.35) mode = 2;
    if (mode !== this.musicMode) {
      this.musicMode = mode;
      this.sfx.setMode(mode);
    }
  }

  private updateWave(dt: number, rdt: number) {
    if (this.playerDeadTimer >= 0) return;
    const alive = this.countEnemies();
    if (this.waveQueue.length > 0) {
      this.spawnTimer -= dt;
      const cap = Math.min(10, 3 + Math.floor(this.wave * 0.7));
      if ((this.spawnTimer <= 0 && alive < cap) || alive === 0) {
        const kind = this.waveQueue.shift()!;
        const mode = this.wave === 1 ? (SHIP_DEFS[kind].trader ? 'near' : 'ring') : alive === 0 ? 'near' : 'ring';
        this.spawnEnemy(kind, mode);
        this.spawnTimer = this.wave === 1 ? 2.8 : rand(1.5, 2.8);
      }
    } else if (alive === 0 && !this.waveClearing) {
      this.waveClearing = true;
      this.clearTimer = 0;
      const flawless = this.waveDamage <= 0.5;
      const bonus = Math.round(250 * this.wave * (flawless ? 1.5 : 1));
      this.score += bonus;
      this.scorePulse = 1;
      this.banner = {
        title: 'Wave Cleared!',
        sub: flawless ? `Flawless victory! +${bonus.toLocaleString('en-US')}` : `Bounty collected +${bonus.toLocaleString('en-US')}`,
        t: 0,
        dur: 2.8,
        gold: true,
      };
      this.sfx.fanfare();
      this.magnetAll = true;
      for (const pk of this.pickups) pk.magnet = true;
    }
    if (this.waveClearing) {
      this.clearTimer += rdt;
      if (this.clearTimer > 2.7 && (this.pickups.length === 0 || this.clearTimer > 4.5)) this.openUpgrade();
    }
  }

  private openUpgrade() {
    this.waveClearing = false;
    const p = this.player;
    const heal = Math.round(p.maxHp * 0.25);
    p.hp = Math.min(p.maxHp, p.hp + heal);
    // Tortuga press gang: crew below boarding strength can never recover at sea
    // (only prizes bring new hands), so never leave port that shorthanded
    p.crew = Math.min(p.maxCrew, Math.max(p.crew, BOARD_MIN_CREW + 4));
    this.balls = [];
    this.volleys = [];
    this.banner.t = 99;
    this.screen = 'upgrade';
    this.input.enabled = false;
    this.input.clear();
    this.sfx.duck(true);
    const pool = UPGRADES.map((u) => upgradeForEra(u, this.eraId)).filter((u) => (this.levels[u.id] ?? 0) < u.max);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = pool[i];
      pool[i] = pool[j];
      pool[j] = t;
    }
    const offers: UpgradeOffer[] = pool.slice(0, 3).map((def) => ({ def, level: this.levels[def.id] ?? 0 }));
    if (offers.length === 0) {
      // every refit already taken — stay at sea instead of stranding the
      // player on an upgrade screen with nothing to choose
      this.screen = 'playing';
      this.input.clear();
      this.input.enabled = true;
      this.last = performance.now();
      this.sfx.duck(false);
      this.cb.onScreen('playing');
      this.addText(p.x, p.y - 44, 'Ship fully upgraded — onward!', '#9fe7ff', 22);
      this.startWave(this.wave + 1);
      return;
    }
    this.cb.onScreen('upgrade');
    this.cb.onUpgrade(offers, this.wave);
  }

  private gameOver() {
    this.screen = 'gameover';
    this.input.enabled = false;
    this.input.clear();
    const st: GameStats = {
      score: this.score,
      wave: this.wave,
      sunk: this.stats.sunk,
      gold: this.stats.gold,
      accuracy: this.stats.shots > 0 ? this.stats.hits / this.stats.shots : 0,
      maxStreak: this.stats.maxStreak,
      time: this.stats.time,
      boarded: this.stats.boarded,
      prisoners: this.prisoners,
      flagsTaken: this.flags.length,
      region: this.regionId,
      regionName: regionById(this.regionId).name,
    };
    this.cb.onScreen('gameover');
    this.cb.onGameOver(st);
  }

  // ================================================================ loop
  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    let rdt = (now - this.last) / 1000;
    this.last = now;
    if (rdt > 0.05) rdt = 0.05;
    if (rdt < 0) rdt = 0;
    this.realTime += rdt;
    this.perf(rdt);
    const sim = this.screen === 'playing' || this.screen === 'menu' || this.screen === 'gameover';
    if (sim) {
      let ts = 1;
      if (this.hitStop > 0) {
        this.hitStop -= rdt;
        ts = 0.06;
      } else if (this.slowMo > 0) {
        this.slowMo -= rdt;
        ts = 0.3;
      }
      const rate = ts < this.timeScale ? 40 : 5;
      this.timeScale += (ts - this.timeScale) * Math.min(1, rdt * rate);
      this.update(rdt * this.timeScale, rdt);
    }
    this.render();
  };

  private perf(rdt: number) {
    if (this.screen !== 'playing') {
      this.perfAcc = 0;
      this.perfFrames = 0;
      return;
    }
    this.perfAcc += rdt;
    this.perfFrames++;
    if (this.perfAcc >= 2.5) {
      const avg = this.perfAcc / this.perfFrames;
      if (avg > 0.022 && this.dpr > 1) {
        this.maxDpr = Math.max(1, this.dpr - 0.5);
        this.resize();
      }
      this.perfAcc = 0;
      this.perfFrames = 0;
    }
  }

  private update(dt: number, rdt: number) {
    this.time += dt;
    const playing = this.screen === 'playing';
    if (playing && this.playerDeadTimer < 0) this.stats.time += dt;
    this.updateWind(dt);
    if (this.grapeCd > 0) this.grapeCd = Math.max(0, this.grapeCd - dt);
    if (this.nativeCallTimer > 0) this.nativeCallTimer -= rdt;
    if (playing) this.updatePlayerInput(dt);
    this.updateShips(dt);
    if (playing) {
      this.updateNatives(dt);
      this.updateSettlements(dt);
      this.updateForts(dt);
      this.updateSwivel(dt);
      this.updateChasers(dt);
      this.updateBoarding();
      this.updateSupplies(dt);
    }
    this.updateVolleys(dt);
    this.updateBalls(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.updateTexts(dt);
    this.updateStreaks(dt);
    this.updateCamera(rdt);
    if (playing) this.updateWave(dt, rdt);
    if (playing) this.updateMusicMode();

    if (this.streakTimer > 0) {
      this.streakTimer -= dt;
      if (this.streakTimer <= 0) {
        this.streakTimer = 0;
        if (this.mult > 1 && playing && this.playerDeadTimer < 0) {
          this.addText(this.player.x, this.player.y - 50, 'Streak ended', '#d8c9a3', 16);
        }
        this.mult = 1;
      }
    }
    if (this.playerDeadTimer >= 0 && playing) {
      this.playerDeadTimer += rdt;
      if (this.playerDeadTimer > 2.4) this.gameOver();
    }
    const ds = this.score - this.displayScore;
    this.displayScore = Math.abs(ds) < 1 ? this.score : this.displayScore + ds * Math.min(1, rdt * 9);
    this.scorePulse = Math.max(0, this.scorePulse - rdt * 3);
    this.multPulse = Math.max(0, this.multPulse - rdt * 3);
    this.hullShake = Math.max(0, this.hullShake - rdt * 3);
    this.flashRed = Math.max(0, this.flashRed - rdt * 2.2);
    this.flashWhite = Math.max(0, this.flashWhite - rdt * 3);
    this.goldPopupPulse = Math.max(0, this.goldPopupPulse - rdt * 5);
    if (this.goldPopupTimer > 0) {
      this.goldPopupTimer -= rdt;
      if (this.goldPopupTimer <= 0) this.goldPopup = 0;
    }
    this.banner.t += rdt;
    this.hintTimer += dt;
    if (this.coinChainTimer > 0) {
      this.coinChainTimer -= rdt;
      if (this.coinChainTimer <= 0) this.coinChain = 0;
    }
  }

  private updateWind(dt: number) {
    this.windTimer -= dt;
    if (this.windTimer <= 0) {
      this.windTimer = rand(20, 32);
      this.windTarget = this.windAngle + rand(-1.2, 1.2);
    }
    const d = angDiff(this.windAngle, this.windTarget);
    this.windAngle += d * Math.min(1, dt * 0.25);
    this.windX = Math.cos(this.windAngle);
    this.windY = Math.sin(this.windAngle);
  }

  private windFactor(a: number, oared = false) {
    if (oared) return 1; // paddled craft make their own way
    const c = (1 + Math.cos(angDiff(a, this.windAngle))) * 0.5;
    return 0.46 + 0.54 * Math.pow(c, 0.6);
  }

  // ================================================================ player
  private updatePlayerInput(dt: number) {
    const p = this.player;
    const inp = this.input;
    if (p.sinking >= 0 || !inp.enabled) {
      inp.consume();
      return;
    }
    if (inp.joyActive) {
      const desired = Math.atan2(inp.joyY, inp.joyX);
      const d = angDiff(p.angle, desired);
      p.turnInput = clamp(d / 0.35, -1, 1);
      if (inp.joyMag > 0.25) p.sailTarget = clamp(0.35 + (inp.joyMag - 0.25) * 1.3, 0.35, 1);
    } else {
      p.turnInput = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      if (inp.up) p.sailTarget = Math.min(1, p.sailTarget + dt * 1.5);
      if (inp.downKey) p.sailTarget = Math.max(0.2, p.sailTarget - dt * 1.5);
    }
    if (inp.portQueued || inp.portHeld) this.tryFire(p, -1, false);
    if (inp.starQueued || inp.starHeld) this.tryFire(p, 1, false);
    if (inp.smartQueued) this.smartFire(true);
    else if (inp.smartHeld) this.smartFire(false);
    if (inp.boardQueued && this.boardCandidate) this.resolveBoarding(this.boardCandidate);
    if (inp.grapeQueued) this.fireGrapeshot();
    inp.consume();
  }

  private findTarget(s: Ship, side: number): Ship | null {
    const sideAng = s.angle + side * HALF_PI;
    let best: Ship | null = null;
    let bestScore = Infinity;
    for (const e of this.ships) {
      if (e.team === s.team || e.sinking >= 0 || e.captured) continue;
      // prizes are for boarding, not blasting — auto-aim leaves them alone
      // (a captain who wants her sunk can still fire on her by hand)
      if (e.surrendered) continue;
      const dx = e.x - s.x;
      const dy = e.y - s.y;
      const d = Math.hypot(dx, dy);
      if (d > s.range * 1.12 + e.def.length * 0.3) continue;
      const a = Math.abs(angDiff(sideAng, Math.atan2(dy, dx)));
      if (a > 0.85) continue;
      const sc = d * (1 + a * 1.5);
      if (sc < bestScore) {
        bestScore = sc;
        best = e;
      }
    }
    return best;
  }

  private tryFire(s: Ship, side: number, requireTarget: boolean): boolean {
    if (s.cannons <= 0) return false;
    if (side < 0 ? s.reloadL > 0 : s.reloadR > 0) return false;
    const target = this.findTarget(s, side);
    if (requireTarget && !target) return false;
    let rel = side * HALF_PI;
    if (target) {
      const t = Math.hypot(target.x - s.x, target.y - s.y) / s.ballSpeed;
      const tx = target.x + target.vx * t * 0.9;
      const ty = target.y + target.vy * t * 0.9;
      const aim = Math.atan2(ty - s.y, tx - s.x);
      rel += clamp(angDiff(s.angle + rel, aim), -0.26, 0.26);
    }
    this.fireBroadside(s, side, rel);
    return true;
  }

  private smartFire(pressed: boolean) {
    const p = this.player;
    const a = this.tryFire(p, -1, true);
    const b = this.tryFire(p, 1, true);
    if (!a && !b && pressed) {
      this.tryFire(p, -1, false);
      this.tryFire(p, 1, false);
    }
  }

  private fireBroadside(s: Ship, side: number, rel: number) {
    const n = s.cannons;
    if (side < 0) s.reloadL = s.reloadTime;
    else s.reloadR = s.reloadTime;
    for (let i = 0; i < n; i++) {
      this.volleys.push({
        ship: s,
        side,
        lx: cannonLocalX(s.def, n, i),
        rel,
        delay: (n - 1 - i) * 0.055 + rand(0, 0.015),
        dmg: s.damage,
      });
    }
    if (s.team === 0) this.stats.shots += n;
  }

  private updateVolleys(dt: number) {
    for (let i = this.volleys.length - 1; i >= 0; i--) {
      const v = this.volleys[i];
      v.delay -= dt;
      if (v.delay > 0) continue;
      this.volleys[i] = this.volleys[this.volleys.length - 1];
      this.volleys.pop();
      if (v.ship.sinking >= 0 || v.ship.dead) continue;
      this.fireWeapon(v);
    }
  }

  private fireWeapon(v: Volley) {
    const s = v.ship;
    const hw = s.def.width / 2;
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    const ly = v.side * (hw + 3);
    const x = s.x + c * v.lx - sn * ly;
    const y = s.y + sn * v.lx + c * ly;
    const dir = s.angle + v.rel + rand(-1, 1) * (s.team === 0 ? 0.03 : s.aiJitter);
    const spd = s.ballSpeed * rand(0.97, 1.03);
    const life = (s.range / spd) * rand(0.95, 1.05);
    this.balls.push({
      projectile: projectileFor(this.eraId, v.lx < 0),
      x,
      y,
      vx: Math.cos(dir) * spd + s.vx * 0.5,
      vy: Math.sin(dir) * spd + s.vy * 0.5,
      life,
      max: life,
      team: s.team,
      dmg: v.dmg,
      chain: s.team === 0 && this.pstats.chain,
      small: false,
      mortar: !!s.def.mortar,
    });
    if (!usesGunpowder(this.eraId)) {
      if (v.side < 0) s.recoilL = 1;
      else s.recoilR = 1;
      this.sfx.bow(this.volAt(x, y), this.panAt(x));
      return;
    }
    this.fxMuzzle(x, y, dir, s.team === 0);
    s.vx -= Math.cos(dir) * 5;
    s.vy -= Math.sin(dir) * 5;
    if (v.side < 0) s.recoilL = 1;
    else s.recoilR = 1;
    const vol = this.volAt(x, y);
    this.sfx.cannon(vol * (s.team === 0 ? 1 : 0.8), this.panAt(x));
    if (s.team === 0) {
      this.addTrauma(0.07);
      this.kickX -= Math.cos(dir) * 3.5;
      this.kickY -= Math.sin(dir) * 3.5;
    } else if (vol > 0.5) this.addTrauma(0.025);
  }

  private updateSwivel(dt: number) {
    const lvl = this.pstats.swivel;
    const p = this.player;
    if (lvl <= 0 || p.sinking >= 0) return;
    this.swivelTimer -= dt;
    if (this.swivelTimer > 0) return;
    const range = 240 + lvl * 25;
    let best: Ship | null = null;
    let bd = range;
    for (const e of this.ships) {
      // an unarmed fisherman is not a target: the gun crew waits for a fight
      if (e.team !== 1 || e.sinking >= 0 || e.captured || e.surrendered || e.peaceful) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    if (!best) {
      this.swivelTimer = 0.2;
      return;
    }
    this.swivelTimer = 1.5 / (1 + 0.45 * (lvl - 1));
    const spd = 640;
    const t = bd / spd;
    const tx = best.x + best.vx * t;
    const ty = best.y + best.vy * t;
    const a = Math.atan2(ty - p.y, tx - p.x) + rand(-0.04, 0.04);
    const life = (range + 50) / spd;
    const ox = p.x + Math.cos(a) * 10;
    const oy = p.y + Math.sin(a) * 10;
    this.balls.push({
      projectile: projectileFor(this.eraId, true),
      x: ox, y: oy, vx: Math.cos(a) * spd + p.vx * 0.3, vy: Math.sin(a) * spd + p.vy * 0.3,
      life, max: life, team: 0, dmg: 4 + lvl * 2, chain: false, small: true, mortar: false,
    });
    if (!usesGunpowder(this.eraId)) {
      this.sfx.bow(0.8, this.panAt(ox));
      return;
    }
    this.emit(P_FLASH, ox, oy, 0, 0, 0.07, 7, 9, '', 1, 0);
    for (let i = 0; i < 2; i++) {
      this.emit(P_SMOKE, ox, oy, Math.cos(a) * 40 + rand(-10, 10), Math.sin(a) * 40 + rand(-10, 10), rand(0.5, 0.8), 3, 8, pick(SMOKE_LIGHT), 1, 2.5, 0, 0, 0.5);
    }
    this.sfx.swivel(0.8, 0);
  }

  /**
   * Chase Guns: a bow chaser and a stern chaser, each laid and fired by its own
   * crew the moment something enemy is dead ahead or dead astern. No key to
   * press — which is the point, because the boat you want them for is behind
   * you with its crew paddling hard.
   */
  private updateChasers(dt: number) {
    const p = this.player;
    const lvl = Math.min(CHASER.length, this.pstats.chase);
    if (lvl <= 0 || p.sinking >= 0) return;
    const g = CHASER[lvl - 1];
    this.bowTimer -= dt;
    this.sternTimer -= dt;
    if (this.bowTimer <= 0 && this.fireChaser(1, g)) this.bowTimer = g.reload;
    if (this.sternTimer <= 0 && this.fireChaser(-1, g)) this.sternTimer = g.reload;
  }

  /** Nearest enemy in an end's arc — boats ahead of a big sail get first call. */
  private findChaseTarget(s: Ship, end: 1 | -1, range: number): Ship | null {
    const axis = end > 0 ? s.angle : s.angle + Math.PI;
    let best: Ship | null = null;
    let bestScore = Infinity;
    for (const e of this.ships) {
      // chase guns are for pursuers, not for unarmed fishermen
      if (e.team !== 1 || e.sinking >= 0 || e.captured || e.surrendered || e.peaceful) continue;
      const dx = e.x - s.x;
      const dy = e.y - s.y;
      const d = Math.hypot(dx, dy);
      if (d > range + e.def.length * 0.5) continue;
      if (d < 12) continue; // alongside: that is the broadsides' business
      if (Math.abs(angDiff(axis, Math.atan2(dy, dx))) > 0.6) continue;
      // open boats are what these guns are shipped for: a canoe half again
      // further off than a big hull still gets the gun crew's attention first
      const score = d * (e.def.oared === true && e.def.length <= 60 ? 0.45 : 1);
      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    }
    return best;
  }

  /** Fire one chase gun out of the bow (`end` 1) or the stern (`end` -1). */
  private fireChaser(end: 1 | -1, g: (typeof CHASER)[number]): boolean {
    const p = this.player;
    const target = this.findChaseTarget(p, end, g.range);
    if (!target) return false;
    const spd = 620;
    // the gun stands at the bow or the stern, so the shot is laid from there —
    // aiming from the mast would throw it wide of anything off the centreline
    const off = p.def.length * 0.46 * end;
    const ox = p.x + Math.cos(p.angle) * off;
    const oy = p.y + Math.sin(p.angle) * off;
    const t = Math.hypot(target.x - ox, target.y - oy) / spd;
    const tx = target.x + target.vx * t * 0.9;
    const ty = target.y + target.vy * t * 0.9;
    const a = Math.atan2(ty - oy, tx - ox) + rand(-0.03, 0.03);
    const life = (g.range + 60) / spd;
    this.balls.push({
      projectile: projectileFor(this.eraId),
      x: ox, y: oy,
      vx: Math.cos(a) * spd + p.vx * 0.35, vy: Math.sin(a) * spd + p.vy * 0.35,
      life, max: life, team: 0, dmg: g.dmg, chain: this.pstats.chain, small: true, mortar: false, chaser: true,
    });
    if (!usesGunpowder(this.eraId)) {
      this.sfx.bow(0.8, this.panAt(ox));
      return true;
    }
    // a light gun: flash, a wisp of smoke and a hard crack
    this.emit(P_FLASH, ox, oy, 0, 0, 0.08, 8, 10, '', 1, 0);
    for (let i = 0; i < 3; i++) {
      const fa = a + rand(-0.4, 0.4);
      const fs = rand(80, 200);
      this.emit(P_FIRE, ox, oy, Math.cos(fa) * fs, Math.sin(fa) * fs, rand(0.08, 0.16), rand(2.5, 4), -3, pick(FIRE_COLORS), 1, 5);
    }
    for (let i = 0; i < 3; i++) {
      const sa = a + rand(-0.5, 0.5);
      const ss = rand(20, 90);
      this.emit(P_SMOKE, ox, oy, Math.cos(sa) * ss + this.windX * 12, Math.sin(sa) * ss + this.windY * 12, rand(0.6, 1.1), rand(4, 6.5), rand(10, 16), pick(SMOKE_LIGHT), 1, 2.4, 0, 0, 0.5);
    }
    this.sfx.chaser(0.8, this.panAt(ox));
    return true;
  }

  /**
   * Grape & Canister: one touch of the linstock empties the deck guns, the
   * swivels and every ready musket in a single cloud of balls and scrap swept
   * right across the hull. It is the answer to a swarm of open boats — at
   * point-blank range it tears a canoe apart and shakes the paddlers off, at
   * long range and against real timbers it is barely worth the powder.
   */
  private fireGrapeshot() {
    const p = this.player;
    const lvl = Math.min(GRAPE.length, this.pstats.grapeshot);
    if (lvl <= 0 || this.grapeCd > 0 || this.screen !== 'playing' || p.sinking >= 0) return;
    const g = GRAPE[lvl - 1];
    this.grapeCd = g.cd;
    const gunpowder = usesGunpowder(this.eraId);
    if (gunpowder) this.sfx.grapeshot(0.9, 0);
    else this.sfx.bow(1, 0);
    this.addTrauma(0.34);
    this.hullShake = 0.75;
    this.zoomPunch = Math.max(this.zoomPunch, 0.05);

    if (gunpowder) {
      // the cloud: flashes all round the hull, spent shot hissing outwards
      const hl = p.def.length * 0.5;
      for (let i = 0; i < 24; i++) {
        const a = rand(0, TAU);
        this.emit(P_FLASH, p.x + Math.cos(a) * hl * 0.6, p.y + Math.sin(a) * hl * 0.6, 0, 0, 0.09, 8, 13, '', 1, 0);
      }
      for (let i = 0; i < 34; i++) {
        const a = rand(0, TAU);
        const sp = rand(180, 520);
        this.emit(
          P_SPARK,
          p.x + Math.cos(a) * hl * 0.5, p.y + Math.sin(a) * hl * 0.5,
          Math.cos(a) * sp + p.vx * 0.4, Math.sin(a) * sp + p.vy * 0.4,
          rand(0.16, 0.3), 1.8, 0, '#ffe0a0', 1, 3,
        );
      }
      for (let i = 0; i < 16; i++) {
        const a = rand(0, TAU);
        const sp = rand(30, 150);
        this.emit(
          P_SMOKE,
          p.x + Math.cos(a) * hl * 0.4, p.y + Math.sin(a) * hl * 0.4,
          Math.cos(a) * sp + this.windX * 25, Math.sin(a) * sp + this.windY * 25,
          rand(0.7, 1.4), rand(6, 10), rand(16, 26), pick(SMOKE_LIGHT), 1, 2.4, 0, 0, 0.5,
        );
      }
      this.emit(P_RING, p.x, p.y, 0, 0, 0.42, 10, g.range, '#ffd88a', 1, 0, 0, 0, 0.55);

    } else {
      // Visible arrows sweep the same short-range area as the instant volley.
      for (let i = 0; i < 34; i++) {
        const a = i * TAU / 34;
        this.emit(P_ARROW, p.x, p.y, Math.cos(a) * g.range * 3,
          Math.sin(a) * g.range * 3, 0.32, 9, 0, '#d8bd7f', 1, 0, a);
      }
    }
    // and then the shot: everything afloat inside the cloud eats it
    const dmgMul = 1 + (this.pstats.damageMul - 1) * 0.6;
    let hits = 0;
    let killed = 0;
    for (const e of this.ships) {
      // struck colours are left alone, exactly as the gun crews leave them
      if (e.team !== 1 || e.sinking >= 0 || e.captured || e.surrendered) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d > g.range + e.def.length * 0.5) continue;
      // an open boat with no gun deck: this is exactly what grapeshot is for
      const openBoat = e.def.oared === true && e.def.length <= 60;
      const fall = 1 - 0.5 * clamp(d / g.range, 0, 1);
      hits++;
      this.damageShip(e, (openBoat ? g.small : g.big) * fall * dmgMul, true);
      if (e.sinking >= 0) {
        killed++;
        continue;
      }
      // the blast shoves an open boat off the hull and leaves her crew reeling
      const nx = d > 1 ? dx / d : Math.cos(e.angle);
      const ny = d > 1 ? dy / d : Math.sin(e.angle);
      const shove = g.shove * fall * (openBoat ? 1 : 0.35);
      e.vx += nx * shove;
      e.vy += ny * shove;
      e.slowTimer = Math.max(e.slowTimer, openBoat ? 2.4 : 1.2);
      this.fxHit(e.x, e.y, Math.atan2(ny, nx), openBoat ? 1.1 : 0.8);
      this.sfx.hit(this.volAt(e.x, e.y) * 0.7, this.panAt(e.x));
    }
    if (killed > 0) this.addText(p.x, p.y - 56, gunpowder ? 'GRAPE!' : 'ARROW STORM!', '#ffd84d', 26);
    else if (hits > 0) this.addText(p.x, p.y - 56, gunpowder ? 'GRAPE!' : 'ARROW STORM!', '#ffd84d', 18);
    else this.addText(p.x, p.y - 56, 'Nothing within reach', '#e6d3a3', 15);
  }

  // ================================================================ ships
  private updateShips(dt: number) {
    const p = this.player;
    const playing = this.screen === 'playing';
    for (const s of this.ships) {
      if (s.dead) continue;
      s.flash = Math.max(0, s.flash - dt);
      s.recoilL = Math.max(0, s.recoilL - dt * 4);
      s.recoilR = Math.max(0, s.recoilR - dt * 4);
      s.hitTimer += dt;
      if (s.ghostHp > s.hp) s.ghostHp = Math.max(s.hp, s.ghostHp - Math.max(18, (s.ghostHp - s.hp) * 2.5) * dt);
      else s.ghostHp = s.hp;
      if (s.sinking >= 0) {
        s.sinking += dt;
        const damp = Math.exp(-1.6 * dt);
        s.vx *= damp;
        s.vy *= damp;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.fxTimer -= dt;
        if (s.fxTimer <= 0) {
          if (s.captured) {
            // a prize doesn't sink — she drops astern glittering, prize crew aboard
            s.fxTimer = 0.14;
            this.fxSparkle(s.x + rand(-22, 22), s.y + rand(-14, 14), 1, '#ffe27a');
          } else {
            s.fxTimer = 0.07;
            this.fxSinking(s);
          }
        }
        if (s.sinking > 2.6) s.dead = true;
        continue;
      }
      s.reloadL = Math.max(0, s.reloadL - dt);
      s.reloadR = Math.max(0, s.reloadR - dt);
      s.slowTimer = Math.max(0, s.slowTimer - dt);
      s.biteTimer = Math.max(0, s.biteTimer - dt);
      if (s !== p || !playing) {
        if (s.team === 1 && playing && p.sinking < 0) this.aiCombat(s, dt);
        else this.aiWander(s, dt);
      }
      this.shipPhysics(s, dt);
      this.shipTerrain(s, dt);
      this.shipFx(s, dt);
      if (s === p && playing && this.pstats.regen > 0) s.hp = Math.min(s.maxHp, s.hp + this.pstats.regen * dt);
    }
    this.shipCollisions();
    for (let i = this.ships.length - 1; i >= 0; i--) {
      if (this.ships[i].dead) {
        this.ships[i] = this.ships[this.ships.length - 1];
        this.ships.pop();
      }
    }
  }

  private shipPhysics(s: Ship, dt: number) {
    s.sail += (s.sailTarget - s.sail) * Math.min(1, dt * 2.5);
    const slow = s.slowTimer > 0 ? 0.55 : 1;
    const target = s.maxSpeed * s.sail * this.windFactor(s.angle, !!s.def.oared || s.def.hullStyle === 'ironclad') * slow;
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    let fwd = s.vx * c + s.vy * sn;
    let lat = -s.vx * sn + s.vy * c;
    const acc = s.def.accel;
    if (fwd < target) fwd = Math.min(target, fwd + acc * dt);
    else fwd = Math.max(target, fwd - acc * 1.3 * dt);
    lat *= Math.exp(-3.2 * dt);
    s.fwd = fwd;
    const ratio = clamp(fwd / (s.maxSpeed * 0.55), 0, 1);
    const turnRate = s.turnRate * (0.5 + 0.5 * ratio) * (s.slowTimer > 0 ? 0.7 : 1);
    s.angVel += (s.turnInput * turnRate - s.angVel) * Math.min(1, dt * 7);
    s.angle += s.angVel * dt;
    if (s.angle > Math.PI * 4 || s.angle < -Math.PI * 4) s.angle = ((s.angle % TAU) + TAU) % TAU;
    s.vx = c * fwd - sn * lat;
    s.vy = sn * fwd + c * lat;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
  }

  private shipTerrain(s: Ship, dt: number) {
    const hl = s.def.length / 2;
    const hw = s.def.width / 2;
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    for (const is of this.islands) {
      const dx0 = s.x - is.x;
      const dy0 = s.y - is.y;
      const lim = is.maxR + hl + 12;
      if (dx0 * dx0 + dy0 * dy0 > lim * lim) continue;
      for (let k = -1; k <= 1; k++) {
        const off = k * hl * 0.7;
        const px = s.x + c * off;
        const py = s.y + sn * off;
        const dx = px - is.x;
        const dy = py - is.y;
        const d = Math.hypot(dx, dy) || 1;
        const r = islandRadiusAt(is, Math.atan2(dy, dx)) + hw * 0.9;
        if (d < r) {
          const nx = dx / d;
          const ny = dy / d;
          const pen = r - d;
          s.x += nx * pen;
          s.y += ny * pen;
          const vn = s.vx * nx + s.vy * ny;
          if (vn < 0) {
            s.vx -= vn * nx * 1.4;
            s.vy -= vn * ny * 1.4;
            if (-vn > 45) {
              this.fxSand(px - nx * hw * 0.5, py - ny * hw * 0.5);
              if (s === this.player && this.screen === 'playing') {
                const dmg = Math.min(10, (-vn - 45) * 0.08 + 2);
                this.hurtPlayer(dmg, -nx, -ny, true);
                this.sfx.thud(0.8);
              }
            }
          }
        }
      }
    }
    const lim = WORLD - 80;
    if (s.x > lim) s.vx -= (s.x - lim) * 5 * dt;
    else if (s.x < -lim) s.vx += (-lim - s.x) * 5 * dt;
    if (s.y > lim) s.vy -= (s.y - lim) * 5 * dt;
    else if (s.y < -lim) s.vy += (-lim - s.y) * 5 * dt;
    s.x = clamp(s.x, -WORLD - 60, WORLD + 60);
    s.y = clamp(s.y, -WORLD - 60, WORLD + 60);
  }

  private shipFx(s: Ship, dt: number) {
    // skip cosmetic effects for ships well outside the view (big win on mobile)
    const m = 160;
    if (s.x < this.vx0 - m || s.x > this.vx1 + m || s.y < this.vy0 - m || s.y > this.vy1 + m) return;
    const speed = Math.hypot(s.vx, s.vy);
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    const hl = s.def.length / 2;
    const hw = s.def.width / 2;
    s.wakeTimer -= dt;
    if (s.wakeTimer <= 0 && speed > 18) {
      s.wakeTimer = 0.065;
      const sx = s.x - c * hl * 0.95;
      const sy = s.y - sn * hl * 0.95;
      const k = Math.min(1, speed / 120);
      this.emit(P_FOAM, sx + rand(-2, 2), sy + rand(-2, 2), -c * 10 + rand(-6, 6), -sn * 10 + rand(-6, 6), rand(1.0, 1.4), hw * 0.5, hw * 0.95, '#ffffff', 0, 1.2, 0, 0, 0.42 * k);
      if (speed > 70) {
        for (let side = -1; side <= 1; side += 2) {
          const bx = s.x + c * hl * 0.72 - sn * side * hw * 0.75;
          const by = s.y + sn * hl * 0.72 + c * side * hw * 0.75;
          this.emit(P_FOAM, bx, by, -sn * side * 30 - c * 10, c * side * 30 - sn * 10, rand(0.6, 0.85), 2.4, 7, '#ffffff', 0, 2, 0, 0, 0.5 * Math.min(1, speed / 150));
        }
      }
    }
    const fire = s.def.kind === 'fireship';
    const hpR = s.hp / s.maxHp;
    if (fire || hpR < 0.55) {
      s.fxTimer -= dt;
      if (s.fxTimer <= 0) {
        s.fxTimer = fire ? 0.04 : hpR < 0.3 ? 0.07 : 0.15;
        const lx = rand(-0.6, 0.6) * hl;
        const ly = rand(-0.5, 0.5) * hw;
        const x = s.x + c * lx - sn * ly;
        const y = s.y + sn * lx + c * ly;
        const dark = fire || hpR < 0.3;
        this.emit(P_SMOKE, x, y, this.windX * 26 + rand(-8, 8) + s.vx * 0.3, this.windY * 26 + rand(-8, 8) + s.vy * 0.3, rand(1, 1.8), rand(5, 8), 16, dark ? pick(SMOKE_DARK) : pick(SMOKE_LIGHT), 1, 0.8, 0, 0, dark ? 0.5 : 0.4);
        if (dark) {
          this.emit(P_FIRE, x, y, s.vx * 0.85 + rand(-12, 12), s.vy * 0.85 + rand(-12, 12), rand(0.25, 0.45), rand(4, 7.5), -7, pick(FIRE_COLORS), 1, 0.6, 0, 0, 0.9);
        }
      }
    }
  }

  private shipCollisions() {
    const ships = this.ships;
    const playing = this.screen === 'playing';
    for (let i = 0; i < ships.length; i++) {
      const a = ships[i];
      if (a.sinking >= 0 || a.dead) continue;
      for (let j = i + 1; j < ships.length; j++) {
        const b = ships[j];
        if (b.sinking >= 0 || b.dead) continue;
        if (a.sinking >= 0) break;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lim = (a.def.length + b.def.length) * 0.5;
        if (dx * dx + dy * dy > lim * lim) continue;
        // war canoes can't shoot — they close and stab
        const aCanoe = a.def.kind === 'warCanoe';
        const bCanoe = b.def.kind === 'warCanoe';
        if (playing && a.team !== b.team && (aCanoe || bCanoe)) {
          const canoe = aCanoe ? a : b;
          const victim = aCanoe ? b : a;
          const dd = Math.hypot(dx, dy) || 1;
          if (dd < lim * 0.72 && canoe.biteTimer <= 0 &&
                (!canoe.homeIsland || canoe.homeIsland.settlement.hostile)) {
            canoe.biteTimer = 0.6;
            const bite = 8 * (1 + 0.05 * (this.wave - 1));
            const nx = dx / dd;
            const ny = dy / dd;
            if (victim === this.player) this.hurtPlayer(bite, -nx, -ny, false);
            else this.damageShip(victim, bite, victim.hitByPlayer || canoe === this.player);
            canoe.vx -= nx * 18;
            canoe.vy -= ny * 18;
            victim.vx += nx * 35;
            victim.vy += ny * 35;
            this.fxHit(victim.x, victim.y, Math.atan2(ny, nx), 0.7);
            this.sfx.hit(this.volAt(victim.x, victim.y) * 0.8, this.panAt(victim.x));
            this.addTrauma(0.12);
          }
        }
        if (playing && a.team !== b.team && (a.def.kind === 'fireship' || b.def.kind === 'fireship')) {
          const fs = a.def.kind === 'fireship' ? a : b;
          if (Math.hypot(dx, dy) < lim * 0.8) {
            this.sinkShip(fs, false);
            continue;
          }
        }
        this.resolvePair(a, b, playing);
      }
    }
  }

  private resolvePair(a: Ship, b: Ship, playing: boolean) {
    const ca = Math.cos(a.angle);
    const sa = Math.sin(a.angle);
    const cb = Math.cos(b.angle);
    const sb = Math.sin(b.angle);
    const ra = a.def.width * 0.55;
    const rb = b.def.width * 0.55;
    const offA = a.def.length * 0.32;
    const offB = b.def.length * 0.32;
    const R = ra + rb;
    for (let i = -1; i <= 1; i++) {
      const ax = a.x + ca * offA * i;
      const ay = a.y + sa * offA * i;
      for (let j = -1; j <= 1; j++) {
        const bx = b.x + cb * offB * j;
        const by = b.y + sb * offB * j;
        const dx = bx - ax;
        const dy = by - ay;
        const d2 = dx * dx + dy * dy;
        if (d2 >= R * R || d2 < 0.0001) continue;
        const d = Math.sqrt(d2);
        const nx = dx / d;
        const ny = dy / d;
        const pen = R - d;
        const ma = a.def.length * a.def.width;
        const mb = b.def.length * b.def.width;
        const tot = ma + mb;
        const ka = mb / tot;
        const kb = ma / tot;
        a.x -= nx * pen * ka;
        a.y -= ny * pen * ka;
        b.x += nx * pen * kb;
        b.y += ny * pen * kb;
        const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) {
          const jimp = -1.3 * vn;
          a.vx -= nx * jimp * ka;
          a.vy -= ny * jimp * ka;
          b.vx += nx * jimp * kb;
          b.vy += ny * jimp * kb;
          if (-vn > 55 && playing) {
            const dmg = (-vn - 55) * 0.07 + 2;
            const cx = (ax + bx) / 2;
            const cy = (ay + by) / 2;
            this.fxHit(cx, cy, Math.atan2(ny, nx), 0.8);
            this.sfx.hit(this.volAt(cx, cy), this.panAt(cx));
            if (a === this.player) this.hurtPlayer(dmg * 0.5, -nx, -ny, true);
            else this.damageShip(a, dmg, b === this.player);
            if (b === this.player) this.hurtPlayer(dmg * 0.5, nx, ny, true);
            else this.damageShip(b, dmg, a === this.player);
          }
        }
        return;
      }
    }
  }

  // ================================================================ AI
  private aiCombat(s: Ship, dt: number) {
    const p = this.player;
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    const dist = Math.hypot(dx, dy);
    const toP = Math.atan2(dy, dx);
    if (s.surrendered) {
      // struck ship: bare poles, drifting down, silent guns — come board her
      s.turnInput = clamp(angDiff(s.angle, this.windAngle + Math.PI) / 0.6, -1, 1) * 0.4;
      s.sailTarget = 0.12;
      return;
    }
    let desired = s.angle;
    let sail = 1;
    s.aiTimer -= dt;
    const aiKind = s.def.trader === true ? 'merchant' : s.def.kind;
    switch (aiKind) {
      case 'merchant': {
        if (dist < 270 || s.hitByPlayer) {
          desired = toP + Math.PI + Math.sin(this.time * 0.6 + s.bob) * 0.55;
          sail = 1;
        } else {
          if (s.aiTimer <= 0) {
            s.aiTimer = rand(3, 6);
            s.aiWander = s.angle + rand(-0.6, 0.6);
          }
          desired = s.aiWander;
          sail = 0.6;
        }
        break;
      }
      case 'fireship': {
        const t = Math.min(1.5, dist / Math.max(80, s.fwd));
        desired = Math.atan2(p.y + p.vy * t * 0.8 - s.y, p.x + p.vx * t * 0.8 - s.x);
        sail = 1;
        break;
      }
      case 'warCanoe': {
        // islanders only press the attack so long, and so far from their beach
        if (s.def.native && this.nativeBreakOff(s, dt, dist)) return;
        const t = Math.min(1.5, dist / Math.max(80, s.fwd));
        desired = Math.atan2(p.y + p.vy * t * 0.8 - s.y, p.x + p.vx * t * 0.8 - s.x);
        sail = 1;
        if (s.leash > 0) {
          // the further from their own beach, the less heart they have for it:
          // they ease off the paddles as they near the edge of their waters
          const hd = Math.hypot(s.x - s.homeX, s.y - s.homeY);
          sail = clamp(1.25 - (hd / s.leash) * 0.9, 0.55, 1);
        }
        break;
      }
      case 'fishingCanoe':
      case 'rowboat': {
        if (s.def.native && this.nativeBreakOff(s, dt, dist)) return;
        // unarmed small craft: put the stern to the enemy and paddle
        desired = toP + Math.PI + Math.sin(this.time * 0.9 + s.bob) * 0.5;
        sail = 1;
        break;
      }
      default: {
        const pref = s.range * 0.6;
        if (dist > s.range * 1.2) {
          const t = dist / 420;
          desired = Math.atan2(p.y + p.vy * t * 0.5 - s.y, p.x + p.vx * t * 0.5 - s.x);
          sail = 1;
        } else {
          if (s.aiTimer <= 0) {
            s.aiTimer = rand(2.5, 4.5);
            const dS = Math.abs(angDiff(s.angle, toP - HALF_PI));
            const dP = Math.abs(angDiff(s.angle, toP + HALF_PI));
            let side = dS < dP ? 1 : -1;
            if (side === 1 && s.reloadR > 0.8 && s.reloadL < 0.2) side = -1;
            else if (side === -1 && s.reloadL > 0.8 && s.reloadR < 0.2) side = 1;
            s.aiSide = side;
          }
          const side = s.aiSide;
          const err = clamp((dist - pref) / pref, -1, 1);
          desired = toP - side * HALF_PI + side * err * 0.7;
          sail = dist < pref * 0.55 ? 0.65 : 0.9;
        }
      }
    }
    this.steer(s, desired, sail);
    if (s.cannons > 0 && dist < s.range * 0.95 && this.playerDeadTimer < 0) {
      const t = dist / s.ballSpeed;
      const tx = p.x + p.vx * t * s.aiLead;
      const ty = p.y + p.vy * t * s.aiLead;
      const aim = Math.atan2(ty - s.y, tx - s.x);
      const tol = 0.27;
      if (s.reloadR <= 0) {
        const dd = angDiff(s.angle + HALF_PI, aim);
        if (Math.abs(dd) < tol) this.fireBroadside(s, 1, HALF_PI + dd);
      }
      if (s.reloadL <= 0) {
        const dd = angDiff(s.angle - HALF_PI, aim);
        if (Math.abs(dd) < tol) this.fireBroadside(s, -1, -HALF_PI + dd);
      }
    }
  }

  /**
   * Aim a hull at `desired` heading under `sail`. Big ships keep clear of the
   * land; island canoes (`avoidLand` false) are happy to nose right up to their
   * own beach — without it their collision-avoidance fights their homing and
   * they end up orbiting the island instead of ever making their shore.
   */
  private steer(s: Ship, desired: number, sail: number, avoidLand = true) {
    const a = avoidLand ? this.avoid(s, desired) : desired;
    s.turnInput = clamp(angDiff(s.angle, a) / 0.4, -1, 1);
    s.sailTarget = sail;
  }

  /**
   * Raiders answer to the drum on their own beach. They will chase, swarm and
   * bite — but only for a while, and only so far from home. Every canoe rolls
   * its own leash and patience, so a pack breaks off raggedly rather than all at
   * once. Once a party is done with the chase it paddles home, circles its own
   * shore and will not be drawn out again except by a ship that comes back into
   * its waters; left alone long enough, the crew beaches her and melts away.
   *
   * Returns true when the canoe has taken itself out of the fight (its steering
   * has already been set for home).
   */
  private nativeBreakOff(s: Ship, dt: number, dist: number): boolean {
    if (s.peaceful) return this.peacefulBoat(s, dt, dist);
    if (s.homeIsland && !s.homeIsland.settlement.hostile) {
      s.hunt = 0;
      return this.peacefulBoat(s, dt, dist);
    }
    if (s.leash <= 0) return false; // no home waters on record: fight as she pleases
    const hx = s.homeX;
    const hy = s.homeY;
    const homeDist = Math.hypot(s.x - hx, s.y - hy);
    const playerHomeDist = Math.hypot(this.player.x - hx, this.player.y - hy);
    // a ship inside their own waters is always worth fighting — but never past
    // a line the canoe could not actually reach, or it would paddle to and fro
    const guard = Math.min(NATIVE_GUARD, s.leash * 0.9);
    const inTheirWaters = playerHomeDist < guard;
    const closeIn = dist < NATIVE_GUARD * 0.55;

    if (s.nativeState === 'hunt') {
      s.beach = -1;
      // patience burns only while there is a fight on
      if (dist < 900) s.hunt -= dt;
      // turn for home with room to spare: a canoe sweeping through a turn at
      // full paddle carries most of her length past the mark before the new
      // heading bites, so the break-off line sits inside the leash
      const turnMargin = Math.min(130, s.leash * 0.35);
      const strayed = homeDist > s.leash - turnMargin;
      const outOfReach = dist > Math.max(NATIVE_GUARD, s.leash * 1.5);
      if (!strayed && !outOfReach && (s.hunt > 0 || inTheirWaters)) return false;
      s.nativeState = 'home';
      if (this.nativeCallTimer <= 0) {
        this.nativeCallTimer = 4;
        this.addText(s.x, s.y - 30, 'The war party turns for home!', '#ffd8a8', 15);
      }
    }

    if (s.nativeState === 'home') {
      s.beach = -1;
      if (homeDist > 150) {
        // paddling for home and eyes front — nothing the player does turns them
        // round. Still carrying way out to sea? back the oars down so the turn
        // bites sooner and the party keeps to its own waters.
        const outward = (s.vx * (s.x - hx) + s.vy * (s.y - hy)) / (homeDist || 1);
        // still being carried out past the mark? back the oars right down and
        // let her swing round: a canoe that turns at full paddle sweeps a
        // hundred yards past the line before the new heading bites
        const overTheLine = homeDist > s.leash * 0.8;
        const throttle = outward > 30 ? (overTheLine ? 0.12 : 0.4) : 1;
        this.steer(s, Math.atan2(hy - s.y, hx - s.x), throttle, false);
        return true;
      }
      s.nativeState = 'lurk';
    }

    // loitering off the beach in slow circles, watching the horizon
    if (inTheirWaters || closeIn) {
      s.nativeState = 'hunt';
      return false;
    }
    // holding station off their own beach: steer for a point on a circle around
    // home and keep on it. (Steering along a bearing from home instead let a
    // party with a small `aiWander` paddle straight out to sea.)
    const toShip = Math.atan2(s.y - hy, s.x - hx);
    const holdR = Math.min(240, Math.max(110, s.leash * 0.45));
    const lap = toShip + (s.aiWander >= 0 ? 0.6 : -0.6);
    const tx = hx + Math.cos(lap) * holdR;
    const ty = hy + Math.sin(lap) * holdR;
    this.steer(s, Math.atan2(ty - s.y, tx - s.x), 0.45, false);
    // even a party that still has fight in it will not wait off the beach all
    // day: loitering burns off what patience is left, and then they go in
    s.hunt -= dt * 0.4;
    if (dist > 620 || s.hunt < -25) {
      // the player is long gone: the crew beaches her and melts into the trees
      if (s.beach < 0) s.beach = rand(NATIVE_BEACH[0], NATIVE_BEACH[1]);
      else {
        s.beach -= dt;
        if (s.beach <= 0) {
          s.dead = true;
          this.fxSplash(s.x, s.y, 0.55);
        }
      }
    } else {
      s.beach = -1;
    }
    return true;
  }

  private aiWander(s: Ship, dt: number) {
    s.aiTimer -= dt;
    if (s.aiTimer <= 0) {
      s.aiTimer = rand(3, 7);
      s.aiWander = s.angle + rand(-1.2, 1.2);
    }
    if (this.screen === 'menu' && Math.hypot(s.x, s.y) > 850) s.aiWander = Math.atan2(-s.y, -s.x);
    const desired = this.avoid(s, s.aiWander);
    s.turnInput = clamp(angDiff(s.angle, desired) / 0.5, -1, 1) * 0.6;
    s.sailTarget = 0.7;
  }

  private avoid(s: Ship, desired: number): number {
    const look = 70 + s.fwd * 0.9 + s.def.length * 0.5;
    const px = s.x + Math.cos(s.angle) * look;
    const py = s.y + Math.sin(s.angle) * look;
    for (const is of this.islands) {
      const dx = px - is.x;
      const dy = py - is.y;
      const lim = is.maxR + 55;
      const d2 = dx * dx + dy * dy;
      if (d2 > lim * lim) continue;
      const r = islandRadiusAt(is, Math.atan2(dy, dx)) + 48;
      if (d2 < r * r) {
        const toI = Math.atan2(is.y - s.y, is.x - s.x);
        const side = angDiff(s.angle, toI) > 0 ? -1 : 1;
        return s.angle + side * 1.4;
      }
    }
    const edge = WORLD - 260;
    if (Math.abs(s.x) > edge || Math.abs(s.y) > edge) {
      const toC = Math.atan2(-s.y, -s.x);
      if (Math.abs(angDiff(desired, toC)) > HALF_PI) return toC;
    }
    return desired;
  }

  private pointInIsland(x: number, y: number, margin: number): Island | null {
    for (const is of this.islands) {
      const dx = x - is.x;
      const dy = y - is.y;
      const d2 = dx * dx + dy * dy;
      const lim = is.maxR + margin;
      if (d2 > lim * lim) continue;
      const r = islandRadiusAt(is, Math.atan2(dy, dx)) + margin;
      if (d2 < r * r) return is;
    }
    return null;
  }

  /**
   * Tether a paddled raider to its home waters. A village war party anchors to
   * the beach it launched from; a flotilla that appeared out at sea keeps to the
   * stretch of water where it appeared. Either way a raider can never chase the
   * player across the whole chart — it has a home to answer to, and a limited
   * patience. `mul` scales how bold the party is (wave flotillas press harder
   * than a village's canoes).
   */
  private anchorNative(s: Ship, island?: Island, mul = 1) {
    s.homeIsland = island ?? null;
    if (island) {
      const a = Math.atan2(s.y - island.y, s.x - island.x);
      const r = islandRadiusAt(island, a) + 60;
      s.homeX = island.x + Math.cos(a) * r;
      s.homeY = island.y + Math.sin(a) * r;
    } else {
      s.homeX = s.x;
      s.homeY = s.y;
    }
    // every crew is its own kind of bold: randomised leash and patience, plus a
    // little more room the deeper into the voyage the player is
    s.leash = (rand(NATIVE_LEASH[0], NATIVE_LEASH[1]) + Math.min(190, this.wave * 10)) * mul;
    s.hunt = (rand(NATIVE_HUNT[0], NATIVE_HUNT[1]) + Math.min(12, this.wave * 0.8)) * mul;
    s.beach = -1;
    s.nativeState = 'hunt';
    // which way this crew likes to paddle when it circles its own beach
    s.aiWander = Math.random() < 0.5 ? -1 : 1;
  }

  /**
   * Islanders. A village that is up in arms sends its war canoes after a sail it
   * can see; a peaceful village sends nothing but a fishing boat out to work the
   * shallows — and that boat is what a captain with a grudge in mind shoots at.
   * Wild islands send neither: nobody lives there to care.
   */
  private updateNatives(dt: number) {
    this.nativeTimer -= dt;
    let calmIsland: Island | null = null;
    let calmD = Infinity;
    for (const is of this.islands) {
      const st = is.settlement;
      if (!st.inhabited) continue;
      st.raidTimer = Math.max(0, (st.raidTimer ?? 0) - dt);
      const d = Math.hypot(is.x - this.player.x, is.y - this.player.y);
      if (d > is.maxR + 540) continue;
      if (!st.hostile) {
        if (d < calmD) { calmD = d; calmIsland = is; }
        continue;
      }
      // Each beach must answer independently: a party from another island may
      // no longer consume this island's capacity to defend itself.
      if (st.raidTimer > 0) continue;
      const wars = this.ships.filter((ship) => ship.homeIsland === is &&
        !ship.peaceful && !ship.dead && !ship.captured && !ship.surrendered && ship.sinking < 0).length;
      if (wars >= 4) continue;
      st.raidTimer = rand(12, 19);
      const garrisoned = !!st.fortress && !st.fortress.ruined;
      const party = Math.min(4 - wars, 2 + (garrisoned ? 1 : 0));
      const toPlayer = Math.atan2(this.player.y - is.y, this.player.x - is.x);
      for (let i = 0; i < party; i++) {
        const a = toPlayer + rand(-0.55, 0.55);
        const x = is.x + Math.cos(a) * (is.maxR + 22);
        const y = is.y + Math.sin(a) * (is.maxR + 22);
        if (this.pointInIsland(x, y, 8)) continue;
        const canoe = this.makeShip('warCanoe', x, y, a);
        this.anchorNative(canoe, is, garrisoned ? 1.2 : 1);
        this.ships.push(canoe);
      }
    }
    if (this.nativeTimer > 0) return;
    this.nativeTimer = rand(12, 19);
    const boats = this.ships.filter((ship) => ship.def.native && ship.peaceful && !ship.dead && ship.sinking < 0).length;
    if (calmIsland && boats < 2 && Math.random() < 0.5) this.launchFishingBoat(calmIsland);
  }

  /** A peaceful village's boat: put her on the water off her own beach. */
  private launchFishingBoat(is: Island) {
    const a = rand(0, TAU);
    const x = is.x + Math.cos(a) * (is.maxR + 20);
    const y = is.y + Math.sin(a) * (is.maxR + 20);
    if (this.pointInIsland(x, y, 8)) return;
    const boat = this.makeShip('fishingCanoe', x, y, a);
    this.anchorNative(boat, is, 1);
    boat.peaceful = true;
    boat.leash = Math.min(boat.leash, 260); // the fishing grounds, not the horizon
    boat.hunt = rand(70, 130); // how long she fishes before heading in
    boat.nativeState = 'home';
    this.ships.push(boat);
  }

  /**
   * The fishing grounds, a strange sail, and the way home. She fights nobody,
   * runs from anything with guns, and beaches herself when the day is done.
   */
  private peacefulBoat(s: Ship, dt: number, dist: number): boolean {
    const hx = s.homeX;
    const hy = s.homeY;
    const homeDist = Math.hypot(s.x - hx, s.y - hy);
    s.hunt -= dt;
    if (dist < 210) {
      // oars out, straight away from the warship
      s.beach = -1;
      this.steer(s, Math.atan2(s.y - this.player.y, s.x - this.player.x), 1, false);
      return true;
    }
    if (s.hunt > 0 && homeDist < 240) {
      const bearing = Math.atan2(s.y - hy, s.x - hx);
      this.steer(s, bearing + HALF_PI * s.aiWander + Math.sin(this.time * 0.45 + s.bob) * 0.5, 0.35, false);
      return true;
    }
    if (homeDist > 120) {
      this.steer(s, Math.atan2(hy - s.y, hx - s.x), 0.85, false);
      return true;
    }
    // home: haul the boat up the sand and call it a day
    if (s.beach < 0) s.beach = rand(1.5, 4);
    else {
      s.beach -= dt;
      if (s.beach <= 0) {
        s.dead = true;
        this.fxSplash(s.x, s.y, 0.4);
      }
    }
    s.sailTarget = 0.05;
    return true;
  }

  /** Tempers cool, and a village that has stood down says so. */
  private updateSettlements(dt: number) {
    for (const is of this.islands) {
      const st = is.settlement;
      if (!st.inhabited) continue;
      if (coolOff(st, dt)) this.addText(is.x, is.y - is.maxR - 20, `${st.name} stands down`, '#cfe8d0', 18);
    }
  }

  // ------------------------------------------------------------ island peoples

  /**
   * A grievance against an island: a round into one of their boats, a boat sent
   * to the bottom, a shell into the village. Cross their patience and the whole
   * island is up in arms until tempers cool.
   */
  private provokeIsland(is: Island, points: number, kind: 'boats' | 'shell') {
    const roused = provokeNetwork(is.settlement, this.islands.map((island) => island.settlement), points, kind);
    if (roused.length === 0) return;
    this.onIslandRoused(is, kind);
    for (const st of roused) {
      if (st.fortress && !st.fortress.ruined) st.fortress.timer = rand(0.6, 1.6);
    }
    const st = is.settlement;
    const allies = roused.filter((member) => member !== st).length;
    if (allies > 0) this.addText(this.player.x, this.player.y - 100,
      `${st.peopleName}${st.allianceName ? ` / ${st.allianceName}` : ''}: ${allies} other islands join the fight!`,
      '#ff9a5a', 18);
  }

  private provokeBoats(is: Island, points: number) {
    this.provokeIsland(is, points, 'boats');
  }

  private onIslandRoused(is: Island, kind: 'boats' | 'shell') {
    const st = is.settlement;
    const f = st.fortress;
    this.addText(is.x, is.y - is.maxR - 26, `${st.name} is roused!`, '#ff9a5a', 24);
    this.addText(
      is.x,
      is.y - is.maxR,
      f && !f.ruined
        ? (usesGunpowder(this.eraId) ? 'The fort runs out its guns!' : 'Archers and pulley launchers man the walls!')
        : kind === 'shell'
          ? 'War canoes put out!'
          : 'They will not forget that!',
      '#ffd8a8',
      16,
    );
    this.fxSparkle(is.x, is.y, 8, '#ffb37a');
    this.sfx.horn();
    if (f && !f.ruined) f.timer = rand(0.6, 1.6);
  }

  /** A player's round landing on an island: a grievance, and a hit on the fort. */
  private shellIsland(is: Island, b: Ball) {
    const st = is.settlement;
    if (!st.inhabited) return;
    const f = st.fortress;
    if (f && !f.ruined) {
      const dmg = b.dmg * (b.mortar ? 1.5 : 1.1);
      f.hp -= dmg;
      this.fxHit(b.x, b.y, 0, 0.9);
      this.addText(b.x, b.y - 14, `${Math.round(dmg)}`, '#ffe0a8', 14);
      if (f.hp <= 0) this.razeFort(is, f);
    }
    this.provokeIsland(is, PROVOKE.shelling, 'shell');
  }

  /** The walls come down: the battery is silenced and the magazine pays out. */
  private razeFort(is: Island, f: Fortress) {
    f.ruined = true;
    f.hp = 0;
    // stamp the wreck into the island's own sprite — no repainting every frame
    const ictx = is.canvas.getContext('2d');
    if (ictx) {
      const sc = is.canvas.width / (is.half * 2) || 1;
      ictx.save();
      ictx.scale(sc, sc);
      ictx.translate(is.half, is.half);
      drawFortRuin(ictx, is, is.r, f.angle);
      ictx.restore();
    }
    const fr = islandRadiusAt(is, f.angle) * 0.8;
    const fx = is.x + Math.cos(f.angle) * fr;
    const fy = is.y + Math.sin(f.angle) * fr;
    this.fxExplosion(fx, fy, 1.1);
    this.fxSparkle(fx, fy, 14, '#ffd27a');
    this.sfx.explosion(Math.max(0.55, this.volAt(fx, fy)), this.panAt(fx));
    this.sfx.fanfare();
    this.addTrauma(0.45);
    const st = is.settlement;
    this.addText(is.x, is.y - is.maxR - 24, `${st.name}: the fort is silenced!`, '#ffd863', 24);
    for (let i = 0; i < 7; i++) {
      const a = rand(0, TAU);
      this.addPickup(
        fx + rand(-12, 12),
        fy + rand(-12, 12),
        Math.cos(a) * rand(60, 170),
        Math.sin(a) * rand(60, 170),
        0,
        20 + this.wave * 2,
      );
    }
    this.addPickup(fx, fy, rand(-30, 30), rand(-30, 30), 1, 120 + this.wave * 12);
    this.addScore(180 + this.wave * 12);
  }

  /** Fortress guns: a hostile battery fires on any sail inside its reach. */
  private updateForts(dt: number) {
    const p = this.player;
    if (p.sinking >= 0) return;
    for (const is of this.islands) {
      const st = is.settlement;
      const f = st.fortress;
      if (!f || f.ruined || !st.hostile) continue;
      if (Math.hypot(p.x - is.x, p.y - is.y) > f.range + is.maxR) continue;
      f.timer -= dt;
      if (f.timer > 0) continue;
      f.timer = f.reload * rand(0.85, 1.2);
      this.fortSalvo(is, f);
    }
  }

  private fortSalvo(is: Island, f: Fortress) {
    const p = this.player;
    const shore = islandRadiusAt(is, f.angle) + 12;
    const sx = is.x + Math.cos(f.angle) * shore;
    const sy = is.y + Math.sin(f.angle) * shore;
    const dist = Math.hypot(p.x - sx, p.y - sy);
    const lead = Math.min(0.9, dist / f.ballSpeed);
    const tx = p.x + p.vx * lead;
    const ty = p.y + p.vy * lead;
    const base = Math.atan2(ty - sy, tx - sx);
    for (let i = 0; i < f.guns; i++) {
      const a = base + (i - (f.guns - 1) / 2) * 0.05 + rand(-0.035, 0.035);
      const life = dist / f.ballSpeed + 0.35;
      this.balls.push({
        projectile: projectileFor(this.eraId, i % 2 === 0),
        x: sx,
        y: sy,
        vx: Math.cos(a) * f.ballSpeed,
        vy: Math.sin(a) * f.ballSpeed,
        life,
        max: life,
        team: 1,
        dmg: f.damage,
        chain: false,
        small: false,
        mortar: false,
      });
    }
    if (!usesGunpowder(this.eraId)) {
      this.sfx.bow(Math.max(0.35, this.volAt(sx, sy)), this.panAt(sx));
      return;
    }
    this.fxMuzzle(sx, sy, base, false);
    this.sfx.cannon(Math.max(0.35, this.volAt(sx, sy)), this.panAt(sx));
    this.addTrauma(clamp(1 - dist / 900, 0, 1) * 0.22);
  }

  /** A big hull going down puts a boat over the side — crew rowing for it. */
  private launchRowboat(s: Ship) {
    if (s.def.length < 70 || Math.random() < 0.45) return;
    const a = rand(0, TAU);
    const boat = this.makeShip('rowboat', s.x + Math.cos(a) * (s.def.length * 0.4), s.y + Math.sin(a) * (s.def.length * 0.4), a);
    boat.hp = boat.maxHp;
    this.ships.push(boat);
  }

  // ================================================================ combat
  private updateBalls(dt: number) {
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      b.life -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      let remove = false;
      // a mortar shell is only dangerous once it drops out of its arc
      const falling = !b.mortar || 1 - b.life / b.max > 0.62;
      if (b.life <= 0) {
        if (b.mortar) this.mortarBlast(b);
        else {
          this.fxSplash(b.x, b.y, b.small ? 0.55 : 1);
          this.sfx.splash(this.volAt(b.x, b.y) * (b.small ? 0.4 : 0.8), this.panAt(b.x));
        }
        remove = true;
      } else if (falling && this.pointInIsland(b.x, b.y, -4)) {
        const hit = this.pointInIsland(b.x, b.y, -4);
        if (b.mortar) {
          this.mortarBlast(b);
        } else {
          this.fxSand(b.x, b.y);
          // a round into the village itself: they will remember it
          if (b.team === 0 && hit) this.shellIsland(hit, b);
        }
        remove = true;
      } else if (falling) {
        for (const s of this.ships) {
          if (s.team === b.team || s.sinking >= 0) continue;
          if (this.ballHitsShip(b, s)) {
            if (b.mortar) this.mortarBlast(b);
            else this.onBallHit(b, s);
            remove = true;
            break;
          }
        }
      }
      if (remove) {
        this.balls[i] = this.balls[this.balls.length - 1];
        this.balls.pop();
      }
    }
  }

  private ballHitsShip(b: Ball, s: Ship): boolean {
    const dx = b.x - s.x;
    const dy = b.y - s.y;
    const hl = s.def.length / 2;
    const hw = s.def.width / 2;
    const R = hl + 6;
    if (dx * dx + dy * dy > R * R) return false;
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    const lx = dx * c + dy * sn;
    const ly = -dx * sn + dy * c;
    if (lx > hl + 3 || lx < -hl - 3) return false;
    const k = lx > 0 ? 1 - (lx / hl) * (lx / hl) * 0.75 : 1;
    return Math.abs(ly) < hw * Math.max(0.2, k) + 4;
  }

  private onBallHit(b: Ball, s: Ship) {
    const dir = Math.atan2(b.vy, b.vx);
    // a chase gun is small calibre: it guts an open boat and bounces off a hull
    const openBoat = s.def.oared === true && s.def.length <= 60;
    let dmg = b.dmg * rand(0.85, 1.15) * (b.chaser && !openBoat ? CHASER_BIG : 1);
    let crit = false;
    if (b.team === 0 && !b.small && Math.random() < 0.1) {
      dmg *= 2;
      crit = true;
    }
    this.fxHit(b.x, b.y, dir, crit ? 1.5 : b.small ? 0.6 : 1);
    // a chase gun hit knocks a canoe off its stroke and back down the wake
    const knock = b.chaser ? (openBoat ? 70 : 12) : b.small ? 4 : 10;
    s.vx += Math.cos(dir) * knock;
    s.vy += Math.sin(dir) * knock;
    s.angVel += rand(-0.15, 0.15);
    if (b.chaser && openBoat) s.slowTimer = Math.max(s.slowTimer, 1.4);
    if (b.team === 0) {
      if (!b.small) this.stats.hits++;
      this.firstHit = true;
      s.hitByPlayer = true;
      if (b.chain) {
        if (s.slowTimer <= 0) this.addText(s.x, s.y + 22, 'SLOWED', '#9fd8ff', 14);
        s.slowTimer = 3;
      }
      if (this.screen === 'playing') this.addScore(b.small ? 2 : 5);
      if (this.streakTimer > 0) this.streakTimer = Math.min(STREAK_TIME, this.streakTimer + 1.2);
      this.addTrauma(crit ? 0.2 : b.small ? 0.04 : 0.1);
      this.sfx.hit(this.volAt(b.x, b.y) * (b.small ? 0.6 : 1), this.panAt(b.x));
      this.addText(b.x + rand(-6, 6), b.y - 12, crit ? `CRIT ${Math.round(dmg)}!` : `${Math.round(dmg)}`, crit ? '#ffcf3a' : '#fff4dc', crit ? 22 : b.small ? 12 : 15);
      this.damageShip(s, dmg, true);
    } else {
      this.hurtPlayer(dmg, Math.cos(dir), Math.sin(dir), false);
    }
  }

  private hurtPlayer(dmg: number, dx: number, dy: number, light: boolean) {
    const p = this.player;
    if (p.sinking >= 0 || this.screen !== 'playing') return;
    this.waveDamage += dmg;
    this.addTrauma(light ? 0.16 : 0.34);
    this.flashRed = Math.min(0.7, this.flashRed + (light ? 0.14 : 0.36));
    this.hullShake = 1;
    if (!light) {
      this.hitStop = 0.05;
      this.sfx.playerHit();
    }
    this.kickX += dx * 7;
    this.kickY += dy * 7;
    this.damageShip(p, dmg, false);
  }

  private damageShip(s: Ship, dmg: number, byPlayer: boolean) {
    if (s.sinking >= 0 || s.captured || this.screen !== 'playing') return;
    // putting a round into one of a village's boats is a grievance in itself
    if (byPlayer && s.def.native && s.homeIsland && dmg > 0) {
      this.provokeBoats(s.homeIsland, PROVOKE.boatHit);
    }
    s.hp -= dmg;
    s.flash = 0.1;
    s.hitTimer = 0;
    if (byPlayer) s.hitByPlayer = true;
    // casualties mount with the damage — a pounded crew boards poorly
    const loss = (dmg / s.maxHp) * s.maxCrew * 0.55;
    if (s === this.player) s.crew = Math.max(1, s.crew - loss);
    else s.crew = Math.max(0, s.crew - loss);
    if (s.hp <= 0) {
      this.sinkShip(s);
      return;
    }
    if (s.team === 1 && !s.surrendered && s.hitByPlayer) this.maybeSurrender(s);
  }

  /** A mauled foe may strike her colours instead of fighting to the death. */
  private maybeSurrender(s: Ship) {
    // a fisherman has no flag to strike: he just rows harder
    if (s.peaceful) return;
    const base = surrenderChance(s.def.kind);
    if (base <= 0 || s.surrenderRolls >= 2) return;
    const ratio = s.hp / s.maxHp;
    if (s.crew >= 1) {
      const threshold = s.surrenderRolls === 0 ? SURRENDER_HP : SURRENDER_HP_DESPERATE;
      if (ratio >= threshold) return;
      s.surrenderRolls++;
      if (Math.random() >= base) return;
    }
    this.raiseWhiteFlag(s);
  }

  private raiseWhiteFlag(s: Ship) {
    s.surrendered = true;
    s.sailTarget = 0.12;
    s.reloadL = Math.max(s.reloadL, 1.5);
    s.reloadR = Math.max(s.reloadR, 1.5);
    this.addText(s.x, s.y - 32, 'SURRENDERED!', '#ffffff', 26);
    this.addText(s.x, s.y - 10, 'Close and board her (F) for the full prize!', '#ffe066', 15);
    this.fxSparkle(s.x, s.y, 10, '#ffffff');
    this.sfx.fanfare();
  }

  private sinkShip(s: Ship, reward = true) {
    if (s.sinking >= 0) return;
    s.hp = 0;
    s.sinking = 0;
    // sending one of their boats to the bottom is the grievance that counts
    if (s.def.native && s.homeIsland && s.hitByPlayer) {
      this.provokeBoats(s.homeIsland, PROVOKE.boatSunk);
      if (s.peaceful) this.addText(s.x, s.y - 34, 'their fishing boat…', '#ffd8a8', 16);
    }
    const big = s.def.length / 60;
    this.fxExplosion(s.x, s.y, big);
    this.sfx.explosion(Math.max(0.45, this.volAt(s.x, s.y)), this.panAt(s.x));
    if (s.team === 1) {
      if (reward) {
        this.stats.sunk++;
        if (this.streakTimer > 0) {
          this.mult = Math.min(MAX_MULT, this.mult + 1);
          this.stats.maxStreak = Math.max(this.stats.maxStreak, this.mult);
          this.multPulse = 1;
          this.sfx.streak(this.mult);
          this.addText(this.player.x, this.player.y - 60, `STREAK x${this.mult}!`, '#ff8a3a', 30);
        }
        this.streakTimer = STREAK_TIME;
        this.launchRowboat(s);
        const pts = this.addScore(s.def.value * (1 + 0.1 * (this.wave - 1)));
        this.addText(s.x, s.y - 30, `SUNK! +${pts.toLocaleString('en-US')}`, '#ffd84d', s.isBoss ? 36 : 26);
        if (s.surrendered) {
          // she struck and was sunk anyway — most of the prize went down with her
          this.addText(s.x, s.y - 8, 'Her treasure went down with her…', '#e6d3a3', 14);
        }
        this.dropLoot(s);
        this.slowMo = s.isBoss ? 1.0 : 0.32;
        this.zoomPunch = s.isBoss ? 0.14 : 0.06;
        this.flashWhite = s.isBoss ? 0.55 : 0.2;
      } else {
        this.addText(s.x, s.y - 30, 'KABOOM!', '#ff8a3a', 26);
      }
      this.addTrauma(s.isBoss ? 0.95 : 0.45);
      if (s.def.kind === 'fireship') this.fireBlast(s);
    } else {
      this.playerDeadTimer = 0;
      this.slowMo = 1.6;
      this.zoomPunch = 0.16;
      this.addTrauma(1);
      this.flashWhite = 0.5;
      this.flashRed = 0.9;
      this.input.enabled = false;
      this.input.clear();
      this.sfx.stopMusic();
      this.sfx.gameOver();
      this.fxExplosion(s.x + rand(-15, 15), s.y + rand(-10, 10), 1.2);
    }
  }

  /** Mortar shell landing: area damage with falloff, plus a shove outward. */
  private mortarBlast(b: Ball) {
    const R = 58;
    // a shell bursting over an island is a bombardment, not just a splash
    if (b.team === 0) {
      const hit = this.pointInIsland(b.x, b.y, 10);
      if (hit) this.shellIsland(hit, b);
    }
    this.fxExplosion(b.x, b.y, 0.8);
    this.emit(P_RING, b.x, b.y, 0, 0, 0.45, 8, R + 30, '#ffb347', 1, 0, 0, 0, 0.8);
    this.addTrauma(0.18);
    const vol = this.volAt(b.x, b.y);
    this.sfx.cannon(vol * 0.9, this.panAt(b.x));
    this.sfx.splash(vol * 0.7, this.panAt(b.x));
    for (const s of this.ships) {
      if (s.sinking >= 0 || s.team === b.team) continue;
      const d = Math.hypot(s.x - b.x, s.y - b.y);
      const reach = R + s.def.length * 0.35;
      if (d > reach) continue;
      const k = clamp(1 - d / reach, 0.4, 1);
      const nx = (s.x - b.x) / (d || 1);
      const ny = (s.y - b.y) / (d || 1);
      s.vx += nx * 55 * k;
      s.vy += ny * 55 * k;
      if (s === this.player) this.hurtPlayer(b.dmg * k, nx, ny, false);
      else this.damageShip(s, b.dmg * k, b.team === 0);
    }
  }

  private fireBlast(fs: Ship) {
    const R = 125;
    this.fxExplosion(fs.x, fs.y, 1.6);
    this.emit(P_RING, fs.x, fs.y, 0, 0, 0.55, 10, R + 40, '#ffb347', 1, 0, 0, 0, 0.9);
    this.addTrauma(0.5);
    const dmgBase = 30 * (1 + 0.05 * (this.wave - 1));
    for (const s of this.ships) {
      if (s === fs || s.sinking >= 0) continue;
      const d = Math.hypot(s.x - fs.x, s.y - fs.y);
      if (d > R + s.def.length * 0.4) continue;
      const k = clamp(1 - d / (R + s.def.length * 0.4), 0.35, 1);
      const nx = (s.x - fs.x) / (d || 1);
      const ny = (s.y - fs.y) / (d || 1);
      s.vx += nx * 90 * k;
      s.vy += ny * 90 * k;
      if (s === this.player) this.hurtPlayer(dmgBase * k, nx, ny, false);
      else this.damageShip(s, dmgBase * 1.4 * k, fs.hitByPlayer);
    }
  }

  private addScore(base: number): number {
    const pts = Math.round(base * this.mult);
    this.score += pts;
    this.scorePulse = 1;
    return pts;
  }

  // ================================================================ boarding & stores
  /** Nearest struck ship lying alongside, if any. */
  private updateBoarding() {
    this.boardCandidate = null;
    const p = this.player;
    if (p.sinking >= 0 || this.playerDeadTimer >= 0) return;
    let bd = Infinity;
    for (const s of this.ships) {
      if (s.team !== 1 || !s.surrendered || s.sinking >= 0 || s.captured) continue;
      const reach = (p.def.length + s.def.length) * 0.5 + BOARD_RANGE;
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < reach && d < bd) {
        bd = d;
        this.boardCandidate = s;
      }
    }
  }

  /** The slow drip of the water butts and the bread room. */
  private updateSupplies(dt: number) {
    if (this.playerDeadTimer >= 0) return;
    const crew = Math.max(1, Math.ceil(this.player.crew));
    // a full store lasts a patient captain most of a long cruise
    this.water = Math.max(0, this.water - dt * crew * 0.0045);
    this.food = Math.max(0, this.food - dt * crew * 0.0032);
    this.storeWarnTimer -= dt;
    if (this.water <= 0 || this.food <= 0) {
      this.supplyTimer += dt;
      if (this.supplyTimer > 12) {
        this.supplyTimer = 0;
        if (this.player.crew > 1) {
          this.player.crew -= 1;
          this.addText(
            this.player.x,
            this.player.y - 52,
            this.water <= 0 ? 'A man died of thirst!' : 'A man starved!',
            '#ff9a8a',
            16,
          );
        }
      }
      if (this.storeWarnTimer <= 0) {
        this.storeWarnTimer = 20;
        this.addText(
          this.player.x,
          this.player.y - 70,
          this.water <= 0 ? 'NO WATER — take a prize!' : 'NO FOOD — take a prize!',
          '#ffd84d',
          16,
        );
      }
    } else {
      this.supplyTimer = 0;
    }
  }

  private flagName(f: Ship['def']['faction']): string {
    switch (f) {
      case 'spain':
        return 'Spanish';
      case 'england':
        return 'English';
      case 'france':
        return 'French';
      case 'merchant':
        return 'merchant';
      case 'carthage':
        return 'Carthaginian';
      case 'persia':
        return 'Persian';
      case 'arab':
        return 'Arab';
      case 'china':
        return 'Chinese';
      case 'japan':
        return 'Japanese';
      case 'maori':
        return 'Māori';
      case 'hawaii':
        return 'Hawaiian';
      case 'macedon':
        return 'Macedonian';
      case 'rhodes':
        return 'Rhodian';
      case 'ptolemy':
        return 'Ptolemaic';
      case 'maya':
        return 'Maya';
      case 'inca':
        return 'Inca';
      case 'puna':
        return 'Pun\u00e1';
      case 'ottoman':
        return 'Ottoman';
      case 'venice':
        return 'Venetian';
      case 'korea':
        return 'Korean';
      case 'byzantium':
        return 'Byzantine';
      case 'egypt':
        return 'Egyptian';
      case 'sherden':
        return 'Sea Peoples';
      case 'chola':
        return 'Chola';
      case 'srivijaya':
        return 'Srivijayan';
      case 'daiviet':
        return 'Vietnamese';
      case 'aztec':
        return 'Aztec';
      case 'native':
        return 'native';
      case 'fire':
        return 'fire-ship';
      default:
        return 'pirate';
    }
  }

  /** Swing the boarding party across to a struck ship. */
  private resolveBoarding(s: Ship) {
    const p = this.player;
    if (s.sinking >= 0 || s.captured || !s.surrendered || p.sinking >= 0) return;
    const pCrew = Math.ceil(p.crew);
    if (pCrew < BOARD_MIN_CREW) {
      this.addText(p.x, p.y - 44, 'Not enough crew to take a prize!', '#ff9a8a', 18);
      this.sfx.thud(0.6);
      return;
    }
    const outcome = rollBoardingOutcome(pCrew, Math.ceil(s.crew));
    const V = s.def.value * (1 + 0.1 * (this.wave - 1));
    const d = Math.hypot(p.x - s.x, p.y - s.y) || 1;
    const nx = (p.x - s.x) / d;
    const ny = (p.y - s.y) / d;
    if (outcome === 'ambush') {
      // treachery! her crew falls on the boarding party and fights on
      const lost = Math.min(pCrew - 1, 2 + Math.floor(Math.random() * 4) + Math.floor(s.crew * 0.15));
      p.crew -= lost;
      s.crew = Math.max(1, s.crew * 0.6);
      s.surrendered = false;
      this.addText(s.x, s.y - 32, 'AMBUSH!', '#ff4b3a', 32);
      this.addText(s.x, s.y - 10, `Treachery! -${lost} of your crew`, '#ff9a8a', 16);
      this.hurtPlayer(8 + this.wave * 1.5, nx, ny, false);
      this.boardCandidate = null;
      return;
    }
    if (outcome === 'sabotage') {
      // she blows up alongside — the prize goes down with her
      this.addText(s.x, s.y - 32, 'SABOTAGE! She blows!', '#ff8a3a', 26);
      const lost = Math.min(pCrew - 1, 1 + Math.floor(Math.random() * 3));
      p.crew -= lost;
      this.addText(p.x, p.y - 44, `Boarding party caught! -${lost} crew`, '#ff9a8a', 15);
      this.sinkShip(s, true);
      this.hurtPlayer(12 + this.wave, nx, ny, false);
      this.boardCandidate = null;
      return;
    }
    this.capturePrize(s, V, outcome === 'plague');
  }

  /** A prize taken: her whole manifest, her stores, her men — and her colours. */
  private capturePrize(s: Ship, V: number, sick: boolean) {
    const p = this.player;
    s.captured = true;
    s.sinking = 0; // reuses the fade-out path; cleared like a sinking
    this.stats.boarded++;
    if (s.homeIsland) this.provokeBoats(s.homeIsland, PROVOKE.boatTaken);
    if (this.streakTimer > 0) {
      this.mult = Math.min(MAX_MULT, this.mult + 1);
      this.stats.maxStreak = Math.max(this.stats.maxStreak, this.mult);
      this.multPulse = 1;
      this.sfx.streak(this.mult);
      this.addText(p.x, p.y - 60, `STREAK x${this.mult}!`, '#ff8a3a', 30);
    }
    this.streakTimer = STREAK_TIME;
    // the full manifest — sinkings only wash up singed scraps (~55%)
    const coinTotal = Math.round(V);
    this.stats.gold += coinTotal;
    const pts = this.addScore(V * 1.2);
    this.goldPopup += pts;
    this.goldPopupTimer = 1.3;
    this.goldPopupPulse = 1;
    this.addText(s.x, s.y - 34, `PRIZE TAKEN! +${pts.toLocaleString('en-US')}`, '#ffd84d', 28);
    // the captain's chest always survives a boarding
    const a = rand(0, TAU);
    const chestGold = Math.round(V * 0.25) + 100;
    this.addPickup(s.x, s.y, Math.cos(a) * 60, Math.sin(a) * 60, 1, chestGold);
    // her water and bread come across too
    const w = 12 + Math.floor(Math.random() * 14);
    const f = 12 + Math.floor(Math.random() * 14);
    this.water = Math.min(this.maxWater, this.water + w);
    this.food = Math.min(this.maxFood, this.food + f);
    this.addText(p.x, p.y - 78, `+${w} water  +${f} food`, '#9fe7ff', 15);
    // her company splits: volunteers join, the stubborn go in irons
    const remaining = Math.max(0, Math.ceil(s.crew));
    const joiners = Math.round(remaining * (0.35 + Math.random() * 0.2));
    const chained = remaining - joiners;
    p.crew = Math.min(150, p.crew + joiners);
    p.maxCrew = Math.max(p.maxCrew, Math.ceil(p.crew));
    this.prisoners += chained;
    this.addText(p.x, p.y - 98, joiners > 0 ? `+${joiners} crew joined!` : 'No crew left to join', '#7dff9a', 16);
    if (chained > 0) this.addText(p.x, p.y - 116, `+${chained} prisoners in irons`, '#d8c9a3', 14);
    // strike her colours and carry them home
    this.flags.push({ faction: s.def.faction, ship: s.def.name, wave: this.wave });
    this.addText(s.x, s.y - 56, `Captured the ${this.flagName(s.def.faction)} colours!`, '#ffe066', 16);
    this.fxSparkle(s.x, s.y, 22, '#ffe27a');
    this.sfx.chest();
    if (sick) {
      // fever below decks — the prize is tainted
      const dw = Math.min(Math.floor(this.water), 20 + Math.floor(Math.random() * 15));
      const df = Math.min(Math.floor(this.food), 20 + Math.floor(Math.random() * 15));
      const dl = Math.min(Math.max(0, Math.ceil(p.crew) - 1), 1 + Math.floor(Math.random() * 2));
      this.water -= dw;
      this.food -= df;
      p.crew -= dl;
      this.addText(p.x, p.y - 44, `Fever aboard! -${dw} water -${df} food -${dl} crew`, '#c0ff70', 16);
      this.sfx.thud(0.9);
    }
    this.slowMo = 0.32;
    this.zoomPunch = 0.06;
    this.flashWhite = 0.2;
    this.addTrauma(0.25);
    this.boardCandidate = null;
  }

  private dropLoot(s: Ship) {
    const n = s.def.coins;
    const total = s.def.value * 0.55 * (1 + 0.1 * (this.wave - 1));
    const per = Math.max(1, Math.round(total / n));
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const sp = rand(50, 210) * (0.7 + s.def.length / 140);
      this.addPickup(s.x + rand(-8, 8), s.y + rand(-8, 8), Math.cos(a) * sp + s.vx * 0.3, Math.sin(a) * sp + s.vy * 0.3, 0, per);
    }
    // bosses and treasure hulls always pay out; traders and frigates sometimes do
    if (
      s.isBoss ||
      s.def.treasure === true ||
      (s.def.trader === true && Math.random() < 0.35) ||
      (s.def.kind === 'frigate' && Math.random() < 0.35)
    ) {
      const a = rand(0, TAU);
      this.addPickup(s.x, s.y, Math.cos(a) * 60, Math.sin(a) * 60, 1, per * (s.isBoss ? 20 : 12));
    }
    const hpR = this.player.hp / this.player.maxHp;
    if (s.isBoss || Math.random() < (hpR < 0.5 ? 0.42 : 0.16)) {
      const a = rand(0, TAU);
      this.addPickup(s.x, s.y, Math.cos(a) * 80, Math.sin(a) * 80, 2, 0);
    }
  }

  private addPickup(x: number, y: number, vx: number, vy: number, kind: 0 | 1 | 2, value: number) {
    if (this.pickups.length >= MAX_PICKUPS) this.pickups.shift();
    this.pickups.push({ x, y, vx, vy, kind, value, life: kind === 0 ? rand(24, 28) : 32, seed: rand(0, TAU), magnet: this.magnetAll, mspeed: 0 });
  }

  private updatePickups(dt: number) {
    const p = this.player;
    const alive = p.sinking < 0 && this.screen === 'playing';
    const magR = this.pstats.magnet;
    const pickR = p.def.width * 0.5 + 18;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      pk.life -= dt;
      let remove = pk.life <= 0;
      if (!remove && alive) {
        const dx = p.x - pk.x;
        const dy = p.y - pk.y;
        const d = Math.hypot(dx, dy) || 1;
        if (!pk.magnet && (this.magnetAll || d < magR * (pk.kind === 0 ? 1 : 0.85))) pk.magnet = true;
        if (pk.magnet) {
          pk.mspeed = Math.min(1100, pk.mspeed + 1500 * dt);
          const sp = pk.mspeed + Math.hypot(p.vx, p.vy);
          pk.vx = (dx / d) * sp;
          pk.vy = (dy / d) * sp;
          if (pk.life < 5) pk.life = 5;
        } else {
          const dr = Math.exp(-2.2 * dt);
          pk.vx *= dr;
          pk.vy *= dr;
        }
        if (d < pickR) {
          this.collect(pk);
          remove = true;
        }
      } else if (!remove) {
        const dr = Math.exp(-2.2 * dt);
        pk.vx *= dr;
        pk.vy *= dr;
      }
      if (remove) {
        this.pickups[i] = this.pickups[this.pickups.length - 1];
        this.pickups.pop();
      } else {
        pk.x += pk.vx * dt;
        pk.y += pk.vy * dt;
      }
    }
  }

  private collect(pk: Pickup) {
    const p = this.player;
    if (pk.kind === 0) {
      const pts = this.addScore(pk.value);
      this.stats.gold += pk.value;
      this.coinChain = Math.min(14, this.coinChain + 1);
      this.coinChainTimer = 0.45;
      this.sfx.coin(this.coinChain);
      this.fxSparkle(pk.x, pk.y, 4, '#ffe27a');
      this.goldPopup += pts;
      this.goldPopupTimer = 1.3;
      this.goldPopupPulse = 1;
    } else if (pk.kind === 1) {
      const pts = this.addScore(pk.value);
      this.stats.gold += pk.value;
      this.sfx.chest();
      this.addText(pk.x, pk.y - 22, `TREASURE! +${pts.toLocaleString('en-US')}`, '#ffd84d', 28);
      this.fxSparkle(pk.x, pk.y, 16, '#ffe27a');
      this.addTrauma(0.15);
      this.flashWhite = Math.max(this.flashWhite, 0.12);
    } else {
      const heal = Math.max(0, Math.min(p.maxHp - p.hp, 20 + p.maxHp * 0.08));
      p.hp += heal;
      this.sfx.repair();
      this.addText(p.x, p.y - 34, heal > 0 ? `+${Math.round(heal)} HULL` : 'HULL FULL', '#7dff9a', 20);
      this.fxSparkle(p.x, p.y, 12, '#7dff9a');
    }
  }

  // ================================================================ particles / fx
  private emit(
    type: number, x: number, y: number, vx: number, vy: number, life: number, size: number, grow: number,
    color: string, layer: number, drag = 1.5, rot = 0, vrot = 0, alpha = 1,
  ) {
    if (this.pCount >= MAX_PARTICLES) return;
    const p = this.parts[this.pCount++];
    p.type = type;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.max = life;
    p.size = size;
    p.grow = grow;
    p.color = color;
    p.layer = layer;
    p.drag = drag;
    p.rot = rot;
    p.vrot = vrot;
    p.alpha = alpha;
  }

  private updateParticles(dt: number) {
    const parts = this.parts;
    let i = 0;
    while (i < this.pCount) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        const lastIdx = this.pCount - 1;
        parts[i] = parts[lastIdx];
        parts[lastIdx] = p;
        this.pCount--;
        continue;
      }
      if (p.drag > 0) {
        const dr = Math.exp(-p.drag * dt);
        p.vx *= dr;
        p.vy *= dr;
        if (p.type === P_SPLINTER) p.vrot *= dr;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      i++;
    }
  }

  private fxMuzzle(x: number, y: number, dir: number, player: boolean) {
    const c = Math.cos(dir);
    const s = Math.sin(dir);
    this.emit(P_FLASH, x + c * 7, y + s * 7, 0, 0, 0.1, 13, 16, '', 1, 0);
    for (let i = 0; i < 5; i++) {
      const a = dir + rand(-0.35, 0.35);
      const sp = rand(90, 260);
      this.emit(P_FIRE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.1, 0.2), rand(3, 5.5), -4, pick(FIRE_COLORS), 1, 5);
    }
    for (let i = 0; i < 6; i++) {
      const a = dir + rand(-0.5, 0.5);
      const sp = rand(20, 120);
      this.emit(P_SMOKE, x + c * 4, y + s * 4, Math.cos(a) * sp + this.windX * 15, Math.sin(a) * sp + this.windY * 15, rand(0.9, 1.7), rand(5, 8), rand(14, 22), pick(SMOKE_LIGHT), 1, 2.4, 0, 0, 0.55);
    }
    if (player) {
      for (let i = 0; i < 3; i++) {
        const a = dir + rand(-0.3, 0.3);
        const sp = rand(200, 380);
        this.emit(P_SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.12, 0.25), 1.6, 0, '#ffd27a', 1, 3);
      }
    }
  }

  private fxSplash(x: number, y: number, sc: number) {
    this.emit(P_RING, x, y, 0, 0, 0.7, 3, 26 * sc, '#ffffff', 0, 0, 0, 0, 0.75);
    this.emit(P_RING, x, y, 0, 0, 0.45, 2, 14 * sc, '#ffffff', 0, 0, 0, 0, 0.6);
    const n = Math.round(8 * sc);
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const sp = rand(30, 110) * sc;
      this.emit(P_DROP, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.35, 0.6), rand(1.5, 2.8), -1, pick(['#ffffff', '#dff6ff', '#bfeaf5']), 1, 2.5);
    }
    this.emit(P_FOAM, x, y, 0, 0, 1.2, 5 * sc, 12 * sc, '#ffffff', 0, 0, 0, 0, 0.5);
  }

  private fxHit(x: number, y: number, dir: number, sc: number) {
    this.emit(P_FLASH, x, y, 0, 0, 0.12, 14 * sc, 22 * sc, '', 1, 0);
    const n = Math.round(12 * sc);
    for (let i = 0; i < n; i++) {
      const a = dir + rand(-1.1, 1.1) + (Math.random() < 0.25 ? Math.PI : 0);
      const sp = rand(60, 260);
      this.emit(P_SPLINTER, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.45, 0.9), rand(3, 6), 0, pick(WOOD), 1, 3.2, rand(0, TAU), rand(-18, 18));
    }
    for (let i = 0; i < 5; i++) {
      const a = dir + rand(-1, 1);
      const sp = rand(150, 320);
      this.emit(P_SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.15, 0.3), 1.5, 0, '#ffcf6b', 1, 3);
    }
    for (let i = 0; i < 3; i++) {
      this.emit(P_SMOKE, x, y, rand(-25, 25) + this.windX * 20, rand(-25, 25) + this.windY * 20, rand(0.7, 1.3), rand(4, 7), 14, pick(SMOKE_DARK), 1, 1.8, 0, 0, 0.5);
    }
  }

  private fxExplosion(x: number, y: number, sc: number) {
    this.emit(P_FLASH, x, y, 0, 0, 0.24, 30 * sc, 70 * sc, '', 1, 0);
    this.emit(P_RING, x, y, 0, 0, 0.5, 8, 150 * sc, '#fff3d0', 1, 0, 0, 0, 0.9);
    this.emit(P_RING, x, y, 0, 0, 1.2, 10, 90 * sc, '#ffffff', 0, 0, 0, 0, 0.6);
    const nf = Math.round(22 * sc);
    for (let i = 0; i < nf; i++) {
      const a = rand(0, TAU);
      const sp = rand(40, 280) * Math.sqrt(sc);
      this.emit(P_FIRE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.35, 0.8), rand(7, 15), -6, pick(FIRE_COLORS), 1, 3);
    }
    for (let i = 0; i < 16; i++) {
      const a = rand(0, TAU);
      const sp = rand(20, 140);
      this.emit(P_SMOKE, x, y, Math.cos(a) * sp + this.windX * 20, Math.sin(a) * sp + this.windY * 20, rand(1.4, 2.6), rand(10, 18), 26, pick(SMOKE_DARK), 1, 1.6, 0, 0, 0.65);
    }
    for (let i = 0; i < 18; i++) {
      const a = rand(0, TAU);
      const sp = rand(200, 480);
      this.emit(P_SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.25, 0.6), 2, 0, pick(['#ffe08a', '#ffb347']), 1, 2.2);
    }
    for (let i = 0; i < 22; i++) {
      const a = rand(0, TAU);
      const sp = rand(80, 320);
      this.emit(P_SPLINTER, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.6, 1.2), rand(4, 8), 0, pick(WOOD), 1, 2.6, rand(0, TAU), rand(-16, 16));
    }
    for (let i = 0; i < 7; i++) {
      const a = rand(0, TAU);
      const sp = rand(40, 140);
      this.emit(P_PLANK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(5, 7), rand(9, 15), 0, pick(WOOD), 0, 1.1, rand(0, TAU), rand(-2, 2));
    }
  }

  private fxSinking(s: Ship) {
    const r = s.def.length * 0.4;
    this.emit(P_BUBBLE, s.x + rand(-r, r), s.y + rand(-r, r), rand(-8, 8), rand(-8, 8), rand(0.5, 1), rand(1.5, 3.5), 2, '#ffffff', 0, 1, 0, 0, 0.8);
    this.emit(P_FOAM, s.x + rand(-r, r), s.y + rand(-r * 0.5, r * 0.5), rand(-10, 10), rand(-10, 10), rand(0.8, 1.4), rand(4, 8), 10, '#ffffff', 0, 1, 0, 0, 0.35);
    if (Math.random() < 0.6) {
      this.emit(P_SMOKE, s.x + rand(-r, r) * 0.5, s.y + rand(-r, r) * 0.5, this.windX * 25 + rand(-10, 10), this.windY * 25 + rand(-10, 10), rand(1.2, 2), rand(6, 10), 18, pick(SMOKE_DARK), 1, 0.8, 0, 0, 0.5);
    }
    if (s.sinking < 1.2 && Math.random() < 0.7) {
      this.emit(P_FIRE, s.x + rand(-r, r) * 0.6, s.y + rand(-r, r) * 0.4, rand(-15, 15), rand(-15, 15), rand(0.25, 0.5), rand(5, 9), -8, pick(FIRE_COLORS), 1, 1);
    }
  }

  private fxSparkle(x: number, y: number, n: number, color: string) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const sp = rand(30, 130);
      this.emit(P_SPARKLE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.35, 0.7), rand(3, 5), 0, color, 1, 3, rand(0, TAU), 20);
    }
  }

  private fxSand(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const a = rand(0, TAU);
      const sp = rand(30, 110);
      this.emit(P_SAND, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.4, 0.8), rand(2, 4), 3, pick(SAND), 1, 3);
    }
    this.emit(P_RING, x, y, 0, 0, 0.5, 3, 18, '#f1e0b0', 0, 0, 0, 0, 0.6);
  }

  private addText(x: number, y: number, text: string, color: string, size: number) {
    if (this.texts.length > 40) this.texts.shift();
    this.texts.push({ x, y, vy: -42, text, color, size, life: 1.3, max: 1.3 });
  }

  private updateTexts(dt: number) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= Math.exp(-2 * dt);
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  private updateStreaks(dt: number) {
    const hw = this.w / 2 / this.viewScale;
    const hh = this.h / 2 / this.viewScale;
    for (const st of this.streaks) {
      st.life -= dt;
      st.x += this.windX * 150 * dt;
      st.y += this.windY * 150 * dt;
      if (st.life <= 0) {
        st.x = this.camX + rand(-hw, hw);
        st.y = this.camY + rand(-hh, hh);
        st.max = st.life = rand(1.2, 2.6);
        st.len = rand(30, 75);
      }
    }
  }

  private addTrauma(v: number) {
    this.trauma = Math.min(1, this.trauma + v);
  }

  private volAt(x: number, y: number) {
    const d = Math.hypot(x - this.camX, y - this.camY);
    return clamp(1.15 - d / 950, 0, 1);
  }

  private panAt(x: number) {
    return clamp(((x - this.camX) * this.viewScale) / (this.w * 0.5), -1, 1) * 0.75;
  }

  private updateCamera(rdt: number) {
    const p = this.player;
    const menu = this.screen === 'menu';
    const tx = p.x + (menu ? 0 : p.vx * 0.45);
    const ty = p.y + (menu ? 0 : p.vy * 0.45);
    const k = 1 - Math.exp(-rdt * 3.5);
    this.camX += (tx - this.camX) * k;
    this.camY += (ty - this.camY) * k;
    const spd = Math.hypot(p.vx, p.vy);
    const zt = (menu ? 1.08 : 1 - Math.min(0.08, (spd / p.def.speed) * 0.07)) + this.zoomPunch;
    this.zoom += (zt - this.zoom) * (1 - Math.exp(-rdt * 4));
    this.zoomPunch *= Math.exp(-rdt * 3);
    this.trauma = Math.max(0, this.trauma - rdt * 1.5);
    const kd = Math.exp(-rdt * 12);
    this.kickX *= kd;
    this.kickY *= kd;
  }

  // ================================================================ render
  private render() {
    const ctx = this.ctx;
    const W = this.w;
    const H = this.h;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const scale = this.viewScale * this.zoom;
    this.curScale = scale;
    const tr = Math.pow(this.trauma, 1.6);
    const t = this.realTime;
    this.shx = (Math.sin(t * 41.3) * 0.6 + Math.sin(t * 87.1 + 1.7) * 0.4) * 26 * tr + this.kickX;
    this.shy = (Math.sin(t * 37.7 + 3.1) * 0.6 + Math.sin(t * 79.3 + 0.4) * 0.4) * 26 * tr + this.kickY;
    const shr = Math.sin(t * 23.1 + 2.2) * 0.028 * tr;

    ctx.save();
    ctx.translate(W / 2 + this.shx, H / 2 + this.shy);
    ctx.rotate(shr);
    ctx.scale(scale, scale);
    ctx.translate(-this.camX, -this.camY);
    const hw = W / 2 / scale + 90;
    const hh = H / 2 / scale + 90;
    this.vx0 = this.camX - hw;
    this.vy0 = this.camY - hh;
    this.vx1 = this.camX + hw;
    this.vy1 = this.camY + hh;

    this.drawWater(ctx);
    this.drawBounds(ctx);
    this.drawIslands(ctx);
    this.drawParticles(ctx, 0);
    this.drawPickups(ctx);

    const p = this.player;
    ctx.fillStyle = '#021a2e';
    for (const s of this.ships) if (this.shipVisible(s)) drawShipShadow(ctx, s);
    for (const s of this.ships)
      if (s !== p && this.shipVisible(s)) drawShip(ctx, s, this.time, this.windAngle, s.falseFlag ?? s.def.faction);
    if (p && !p.dead && this.shipVisible(p)) drawShip(ctx, p, this.time, this.windAngle, p.falseFlag ?? p.def.faction);
    if (this.screen !== 'menu') this.drawReloadArcs(ctx);
    this.drawBalls(ctx);
    this.drawParticles(ctx, 1);
    this.drawStreaks(ctx);
    if (this.screen !== 'menu') this.drawEnemyBars(ctx, scale);
    ctx.restore();

    // ---- screen space
    this.drawTexts(ctx);
    ctx.drawImage(this.vignette, 0, 0, W, H);
    const inGame = this.screen === 'playing' || this.screen === 'paused' || this.screen === 'upgrade';
    let redA = this.flashRed;
    if (inGame && p.sinking < 0 && p.hp / p.maxHp < 0.3) redA = Math.max(redA, 0.28 + 0.2 * Math.sin(this.realTime * 6));
    if (redA > 0.01) {
      ctx.globalAlpha = Math.min(1, redA);
      ctx.drawImage(this.redVignette, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (this.flashWhite > 0.01) {
      ctx.globalAlpha = this.flashWhite * 0.5;
      ctx.fillStyle = '#fff6dc';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (inGame) {
      this.drawPlunderMarker(ctx);
      this.drawIndicators(ctx);
      this.drawGoldPopup(ctx);
      this.drawHUD(ctx);
      this.drawHints(ctx);
      this.drawBoardPrompt(ctx);
    }
    if (this.screen !== 'menu' && this.screen !== 'gameover') this.drawBanner(ctx);
  }

  private shipVisible(s: Ship) {
    const r = s.def.length;
    return s.x + r > this.vx0 && s.x - r < this.vx1 && s.y + r > this.vy0 && s.y - r < this.vy1;
  }

  private worldToScreen(x: number, y: number): [number, number] {
    return [(x - this.camX) * this.curScale + this.w / 2 + this.shx, (y - this.camY) * this.curScale + this.h / 2 + this.shy];
  }

  private drawWater(ctx: CanvasRenderingContext2D) {
    const x = this.vx0;
    const y = this.vy0;
    const w = this.vx1 - this.vx0;
    const h = this.vy1 - this.vy0;
    ctx.fillStyle = this.waterBase;
    ctx.fillRect(x, y, w, h);
    if (this.waterPattern) {
      ctx.fillStyle = this.waterPattern;
      ctx.fillRect(x, y, w, h);
    }
    const t = this.time;
    if (this.wavePatternA) {
      const ox = (t * this.windX * 14 + Math.sin(t * 0.7) * 6) % 256;
      const oy = (t * this.windY * 14 + Math.cos(t * 0.6) * 6) % 256;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = this.wavePatternA;
      ctx.fillRect(x - ox, y - oy, w, h);
      ctx.restore();
    }
    if (this.wavePatternB) {
      const ox = (t * (this.windX * 7 + 4)) % 512;
      const oy = (t * (this.windY * 7 - 3)) % 512;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(2, 2);
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = this.wavePatternB;
      ctx.fillRect((x - ox) / 2, (y - oy) / 2, w / 2, h / 2);
      ctx.restore();
    }
  }

  private drawBounds(ctx: CanvasRenderingContext2D) {
    const B = WORLD;
    const x0 = this.vx0;
    const y0 = this.vy0;
    const x1 = this.vx1;
    const y1 = this.vy1;
    if (x0 > -B + 40 && x1 < B - 40 && y0 > -B + 40 && y1 < B - 40) return;
    ctx.fillStyle = 'rgba(3, 20, 38, 0.55)';
    if (x0 < -B) ctx.fillRect(x0, y0, -B - x0, y1 - y0);
    if (x1 > B) ctx.fillRect(B, y0, x1 - B, y1 - y0);
    const cx0 = Math.max(x0, -B);
    const cx1 = Math.min(x1, B);
    if (y0 < -B) ctx.fillRect(cx0, y0, cx1 - cx0, -B - y0);
    if (y1 > B) ctx.fillRect(cx0, B, cx1 - cx0, y1 - B);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 16]);
    ctx.strokeRect(-B, -B, B * 2, B * 2);
    ctx.setLineDash([]);
  }

  private drawIslands(ctx: CanvasRenderingContext2D) {
    const t = this.time;
    for (const is of this.islands) {
      if (is.x + is.half < this.vx0 || is.x - is.half > this.vx1 || is.y + is.half < this.vy0 || is.y - is.half > this.vy1) continue;
      ctx.drawImage(is.canvas, is.x - is.half, is.y - is.half, is.half * 2, is.half * 2);
      ctx.save();
      ctx.translate(is.x, is.y);
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.42;
      ctx.lineWidth = 2.6 + Math.sin(t * 1.6 + is.seed) * 1;
      ctx.stroke(is.shore);
      const ph = (t * 0.33 + (is.seed % 100) * 0.01) % 1;
      const sc = 1.1 - ph * 0.08;
      ctx.scale(sc, sc);
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.35;
      ctx.lineWidth = 2 / sc;
      ctx.stroke(is.shore);
      ctx.restore();

      const st = is.settlement;
      if (st.inhabited) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = `16px ${FELL}`;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#092434';
        ctx.fillStyle = st.hostile ? '#ffad8d' : '#f3ead2';
        const label = `${st.name} · ${st.hostile ? 'HOSTILE' : 'Peaceful'}`;
        const politics = `${st.peopleName ?? 'Independent'}${st.allianceName ? ` · ${st.allianceName}` : ''}`;
        ctx.strokeText(label, is.x, is.y + is.maxR + 24);
        ctx.fillText(label, is.x, is.y + is.maxR + 24);
        ctx.font = `13px ${FELL}`;
        ctx.strokeText(politics, is.x, is.y + is.maxR + 43);
        ctx.fillText(politics, is.x, is.y + is.maxR + 43);
        ctx.restore();
      }
      if (st.inhabited && st.hostile) {
        // red colours over the village: these people are up in arms
        const top = is.y - Math.max(26, is.maxR * 0.5);
        const flap = Math.sin(t * 5 + is.seed) * 2.5;
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = '#3a2a18';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(is.x, top + 8);
        ctx.lineTo(is.x, top - 20);
        ctx.stroke();
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(is.x, top - 20);
        ctx.lineTo(is.x + 22 + flap, top - 13 + flap * 0.3);
        ctx.lineTo(is.x, top - 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      const f = st.fortress;
      if (f && !f.ruined && f.hp < f.maxHp) {
        // the battery's walls, while they are still standing
        const fr = islandRadiusAt(is, f.angle) * 0.8;
        const bx = is.x + Math.cos(f.angle) * fr;
        const by = is.y + Math.sin(f.angle) * fr;
        const bw = 56;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(bx - bw / 2, by - 34, bw, 7);
        ctx.fillStyle = '#e8d9a8';
        ctx.fillRect(bx - bw / 2 + 1, by - 33, (bw - 2) * clamp(f.hp / f.maxHp, 0, 1), 5);
        ctx.restore();
      }
    }
  }

  private drawPickups(ctx: CanvasRenderingContext2D) {
    if (!this.pickups.length) return;
    const t = this.time;
    const x0 = this.vx0;
    const x1 = this.vx1;
    const y0 = this.vy0;
    const y1 = this.vy1;
    ctx.globalCompositeOperation = 'lighter';
    for (const pk of this.pickups) {
      if (pk.x < x0 || pk.x > x1 || pk.y < y0 || pk.y > y1) continue;
      const g = pk.kind === 1 ? 30 : pk.kind === 2 ? 20 : 14;
      ctx.globalAlpha = (pk.kind === 2 ? 0.35 : 0.5) * (0.8 + 0.2 * Math.sin(t * 4 + pk.seed));
      ctx.drawImage(this.glowGold, pk.x - g, pk.y - g, g * 2, g * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    for (const pk of this.pickups) {
      if (pk.x < x0 || pk.x > x1 || pk.y < y0 || pk.y > y1) continue;
      if (pk.life < 4 && !pk.magnet && Math.sin(t * 22) < -0.2) continue;
      const bob = Math.sin(t * 3 + pk.seed) * 1.5;
      if (pk.kind === 0) drawCoin(ctx, pk.x, pk.y + bob, t, pk.seed, 5.5);
      else if (pk.kind === 1) drawChest(ctx, pk.x, pk.y + bob, t, pk.seed);
      else {
        drawCrate(ctx, pk.x, pk.y + bob, t, pk.seed);
        const ph = (t * 0.8 + pk.seed) % 1;
        ctx.globalAlpha = (1 - ph) * 0.6;
        ctx.strokeStyle = '#7dff9a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, 10 + ph * 16, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  private drawReloadArcs(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    if (!p || p.sinking >= 0 || p.dead) return;
    const hl = p.def.length / 2;
    const hw = p.def.width / 2;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    const x0 = -hl * 0.62;
    const x1 = hl * 0.45;
    const len = x1 - x0;
    ctx.lineCap = 'round';
    // chase guns: a short tick off the bow and another off the stern
    const chaseLvl = Math.min(CHASER.length, this.pstats.chase);
    if (chaseLvl > 0) {
      const g = CHASER[chaseLvl - 1];
      const y = -hw * 0.34;
      for (const end of [-1, 1] as const) {
        const prog = clamp(1 - (end > 0 ? this.bowTimer : this.sternTimer) / g.reload, 0, 1);
        const xa = end < 0 ? -hl * 1.12 : hl * 0.55;
        const xb = end < 0 ? -hl * 0.55 : hl * 1.12;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.moveTo(xa, y);
        ctx.lineTo(xb, y);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = prog >= 1 ? '#ffd84d' : 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(xa, y);
        ctx.lineTo(xa + (xb - xa) * prog, y);
        ctx.stroke();
      }
    }
    for (let side = -1; side <= 1; side += 2) {
      const r = side < 0 ? p.reloadL : p.reloadR;
      const prog = clamp(1 - r / p.reloadTime, 0, 1);
      const y = side * (hw + 10);
      ctx.lineWidth = 3.4;
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      ctx.lineWidth = 2.3;
      ctx.strokeStyle = prog >= 1 ? '#ffd84d' : 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + len * prog, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawBalls(ctx: CanvasRenderingContext2D) {
    const bs = this.balls;
    if (!bs.length) return;
    ctx.fillStyle = 'rgba(0,25,45,0.32)';
    ctx.beginPath();
    for (const b of bs) {
      if (b.projectile !== 'cannonball') continue;
      const k = 1 - b.life / b.max;
      const z = b.mortar ? Math.sin(k * Math.PI) * 74 : Math.sin(k * Math.PI) * (b.small ? 6 : 16);
      const r = b.mortar ? 3 + k * 4 : b.small ? 2 : 3;
      // a shell high overhead casts its shadow straight down on the target
      const sx = b.mortar ? b.x : b.x + z * 0.5;
      const sy = b.mortar ? b.y : b.y + z * 0.75;
      ctx.moveTo(sx + r, sy);
      ctx.arc(sx, sy, r, 0, TAU);
    }
    ctx.fill();
    // landing marker so mortar fire can be dodged
    ctx.strokeStyle = 'rgba(255,170,80,0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (const b of bs) {
      if (b.projectile !== 'cannonball') continue;
      if (!b.mortar) continue;
      const k = 1 - b.life / b.max;
      const rr = 10 + (1 - k) * 26;
      ctx.moveTo(b.x + rr, b.y);
      ctx.arc(b.x, b.y, rr, 0, TAU);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(235,235,235,0.42)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const b of bs) {
      if (b.projectile !== 'cannonball') continue;
      if (b.mortar) continue;
      const sp = Math.hypot(b.vx, b.vy) || 1;
      const L = b.small ? 9 : 16;
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - (b.vx / sp) * L, b.y - (b.vy / sp) * L);
    }
    ctx.stroke();
    ctx.fillStyle = '#121212';
    ctx.beginPath();
    for (const b of bs) {
      if (b.projectile !== 'cannonball') continue;
      const k = 1 - b.life / b.max;
      const z = b.mortar ? Math.sin(k * Math.PI) * 74 : 0;
      const r = b.mortar ? 4.2 : b.small ? 2.2 : 3.6;
      const by = b.y - z;
      ctx.moveTo(b.x + r, by);
      ctx.arc(b.x, by, r, 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    for (const b of bs) {
      if (b.projectile !== 'cannonball') continue;
      if (b.small) continue;
      const k = 1 - b.life / b.max;
      const z = b.mortar ? Math.sin(k * Math.PI) * 74 : 0;
      ctx.moveTo(b.x - 0.1, b.y - z - 1.2);
      ctx.arc(b.x - 1.2, b.y - z - 1.2, 1.1, 0, TAU);
    }
    ctx.fill();
    for (const b of bs) {
      if (b.projectile === 'cannonball') continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx));
      const length = b.projectile === 'bolt' ? 19 : 13;
      ctx.strokeStyle = '#d8bd7f';
      ctx.lineWidth = b.projectile === 'bolt' ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(-length, 0); ctx.lineTo(3, 0);
      ctx.moveTo(-length, -3); ctx.lineTo(-length + 4, 0); ctx.lineTo(-length, 3);
      ctx.stroke();
      ctx.fillStyle = '#dce3df';
      ctx.beginPath();
      ctx.moveTo(6, 0); ctx.lineTo(0, -3); ctx.lineTo(0, 3);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D, layer: number) {
    const parts = this.parts;
    const n = this.pCount;
    const vx0 = this.vx0;
    const vx1 = this.vx1;
    const vy0 = this.vy0;
    const vy1 = this.vy1;
    ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      const additive = pass === 1;
      if (additive) ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const p = parts[i];
        if (p.layer !== layer || ADDITIVE[p.type] !== additive) continue;
        const k = p.life / p.max;
        const size = Math.max(0.1, p.size + p.grow * (1 - k));
        // cull against the particle's own reach — a fixed margin clips big
        // explosion glows and shockwave rings at the screen edge
        const m = 34 + size;
        if (p.x < vx0 - m || p.x > vx1 + m || p.y < vy0 - m || p.y > vy1 + m) continue;
        switch (p.type) {
          case P_SMOKE:
          case P_FOAM:
          case P_DROP:
          case P_SAND:
          case P_FIRE:
            ctx.globalAlpha = p.alpha * (p.type === P_SMOKE ? Math.min(1, k * 1.6) : k);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, TAU);
            ctx.fill();
            break;
          case P_RING:
          case P_BUBBLE:
            ctx.globalAlpha = p.alpha * k;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.type === P_RING ? 0.6 + 2.6 * k : 0.9;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, TAU);
            ctx.stroke();
            break;
          case P_ARROW: {
            ctx.save();
            ctx.globalAlpha = p.alpha * Math.min(1, k * 4);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(-size, 0); ctx.lineTo(3, 0);
            ctx.moveTo(-size, -2); ctx.lineTo(-size + 3, 0); ctx.lineTo(-size, 2);
            ctx.moveTo(0, -2); ctx.lineTo(3, 0); ctx.lineTo(0, 2);
            ctx.stroke();
            ctx.restore();
            break;
          }
          case P_SPLINTER:
          case P_PLANK: {
            ctx.globalAlpha = p.alpha * (p.type === P_PLANK ? Math.min(1, k * 4) : Math.min(1, k * 2.5));
            ctx.strokeStyle = p.color;
            ctx.lineWidth = size * (p.type === P_PLANK ? 0.38 : 0.34);
            const cx = Math.cos(p.rot) * size * 0.5;
            const cy = Math.sin(p.rot) * size * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x - cx, p.y - cy);
            ctx.lineTo(p.x + cx, p.y + cy);
            ctx.stroke();
            break;
          }
          case P_SPARK:
            ctx.globalAlpha = p.alpha * k;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
            ctx.stroke();
            break;
          case P_SPARKLE: {
            ctx.globalAlpha = p.alpha * k;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.4;
            const s2 = size * (0.6 + 0.4 * Math.sin(p.rot));
            ctx.beginPath();
            ctx.moveTo(p.x - s2, p.y);
            ctx.lineTo(p.x + s2, p.y);
            ctx.moveTo(p.x, p.y - s2);
            ctx.lineTo(p.x, p.y + s2);
            ctx.stroke();
            break;
          }
          case P_FLASH:
            ctx.globalAlpha = p.alpha * k;
            ctx.drawImage(this.glowWarm, p.x - size, p.y - size, size * 2, size * 2);
            break;
        }
      }
      if (additive) ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
  }

  private drawStreaks(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    const wx = this.windX;
    const wy = this.windY;
    for (const st of this.streaks) {
      if (st.life <= 0) continue;
      const k = st.life / st.max;
      ctx.globalAlpha = Math.sin(k * Math.PI) * 0.2;
      const mx = st.x - wx * st.len * 0.5 - wy * 4;
      const my = st.y - wy * st.len * 0.5 + wx * 4;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.quadraticCurveTo(mx, my, st.x - wx * st.len, st.y - wy * st.len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private drawEnemyBars(ctx: CanvasRenderingContext2D, scale: number) {
    const inv = 1 / scale;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const s of this.ships) {
      if (s.team !== 1 || s.sinking >= 0 || s.captured || !this.shipVisible(s)) continue;
      const showBar = s.hp < s.maxHp || s.isBoss || s.surrendered;
      const w = Math.max(34, s.def.length * 0.75);
      const h = 4.5 * inv;
      const x = s.x - w / 2;
      const y = s.y - s.def.length * 0.5 - 10 - h;
      if (showBar) {
        ctx.fillStyle = 'rgba(20,10,5,0.78)';
        ctx.fillRect(x - 1.5 * inv, y - 1.5 * inv, w + 3 * inv, h + 3 * inv);
        ctx.fillStyle = '#f7e3a1';
        ctx.fillRect(x, y, (w * s.ghostHp) / s.maxHp, h);
        ctx.fillStyle = s.hp / s.maxHp < 0.3 ? '#ff4b3a' : '#e8483a';
        ctx.fillRect(x, y, (w * s.hp) / s.maxHp, h);
      }
      // her colours and the hands still standing — every foe, always
      const tagY = showBar ? y - 6 * inv : y + 2 * inv;
      const fw = 13 * inv;
      const fh = 7.5 * inv;
      ctx.save();
      ctx.translate(x, tagY - fh);
      drawFlagArt(ctx, s.def.faction, fw, fh);
      ctx.lineWidth = 1 * inv;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeRect(0, 0, fw, fh);
      ctx.restore();
      const crewStr = `${Math.max(0, Math.ceil(s.crew))}`;
      ctx.font = `${Math.max(6, Math.round(10 * inv))}px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.lineWidth = 3 * inv;
      ctx.strokeStyle = 'rgba(22,10,3,0.9)';
      const tx = x + fw + 3 * inv;
      const ty = tagY - fh / 2;
      ctx.strokeText(crewStr, tx, ty);
      ctx.fillStyle = '#f3e2b3';
      ctx.fillText(crewStr, tx, ty);
      if (s.surrendered) {
        const pulse = 0.72 + 0.28 * Math.sin(this.realTime * 6);
        ctx.font = `${Math.max(6, Math.round(11 * inv))}px ${FONT}`;
        ctx.textAlign = 'center';
        const label = 'SURRENDERED!';
        const tw = ctx.measureText(label).width + 10 * inv;
        const bx = s.x - tw / 2;
        const by = tagY - fh - 14 * inv;
        ctx.globalAlpha = pulse;
        rr(ctx, bx, by, tw, 12 * inv, 4 * inv);
        ctx.fillStyle = 'rgba(245,245,240,0.92)';
        ctx.fill();
        ctx.lineWidth = 1 * inv;
        ctx.strokeStyle = '#8a8a8a';
        ctx.stroke();
        ctx.fillStyle = '#2a2a2a';
        ctx.fillText(label, s.x, by + 6 * inv);
        ctx.globalAlpha = 1;
      }
    }
  }

  private drawTexts(ctx: CanvasRenderingContext2D) {
    if (!this.texts.length) return;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    let lastFont = '';
    for (const f of this.texts) {
      const [sx, sy] = this.worldToScreen(f.x, f.y);
      if (sx < -100 || sx > this.w + 100 || sy < -60 || sy > this.h + 60) continue;
      const age = f.max - f.life;
      const k = f.life / f.max;
      const pop = age < 0.1 ? 0.5 + (age / 0.1) * 0.75 : age < 0.2 ? 1.25 - ((age - 0.1) / 0.1) * 0.25 : 1;
      const size = Math.max(8, Math.round(f.size * this.ui * pop));
      const font = `${size}px ${FONT}`;
      if (font !== lastFont) {
        ctx.font = font;
        lastFont = font;
      }
      ctx.globalAlpha = Math.min(1, k * 3);
      ctx.lineWidth = Math.max(3, size * 0.2);
      ctx.strokeStyle = 'rgba(28,12,4,0.92)';
      ctx.strokeText(f.text, sx, sy);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, sx, sy);
    }
    ctx.globalAlpha = 1;
  }

  private outlined(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, lw = 4) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = lw;
    ctx.strokeStyle = 'rgba(22,10,3,0.92)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  private getScoreStr() {
    const v = Math.round(this.displayScore);
    if (v !== this.scoreStrVal) {
      this.scoreStrVal = v;
      this.scoreStr = v.toLocaleString('en-US');
    }
    return this.scoreStr;
  }

  private drawGoldPopup(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    if (this.goldPopupTimer <= 0 || this.goldPopup <= 0 || p.sinking >= 0) return;
    const [sx, sy0] = this.worldToScreen(p.x, p.y);
    const u = this.ui;
    const a = Math.min(1, this.goldPopupTimer * 3);
    const pop = 1 + this.goldPopupPulse * 0.3;
    const sy = sy0 - 48 * u - (1 - a) * 12;
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(21 * u * pop)}px ${FONT}`;
    const txt = `+${this.goldPopup.toLocaleString('en-US')}`;
    this.outlined(ctx, txt, sx + 8 * u, sy, '#ffe066', 4);
    const tw = ctx.measureText(txt).width;
    drawCoin(ctx, sx + 8 * u - tw / 2 - 11 * u, sy, this.realTime, 1, 7 * u);
    ctx.globalAlpha = 1;
  }

  private drawPlunderMarker(ctx: CanvasRenderingContext2D) {
    if (this.wave !== 1 || this.firstHit || this.screen !== 'playing') return;
    const p = this.player;
    let best: Ship | null = null;
    let bd = Infinity;
    for (const s of this.ships) {
      if (s.def.trader !== true || s.sinking >= 0) continue;
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    if (!best) return;
    const [sx, sy] = this.worldToScreen(best.x, best.y);
    if (sx < 0 || sx > this.w || sy < 0 || sy > this.h) return;
    const u = this.ui;
    const bounce = Math.abs(Math.sin(this.realTime * 5)) * 8 * u;
    const y = sy - best.def.length * 0.5 * this.curScale - 22 * u - bounce;
    ctx.fillStyle = '#ffd84d';
    ctx.strokeStyle = 'rgba(28,12,4,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, y + 10 * u);
    ctx.lineTo(sx - 9 * u, y - 3 * u);
    ctx.lineTo(sx + 9 * u, y - 3 * u);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(18 * u)}px ${FONT}`;
    this.outlined(ctx, 'PLUNDER!', sx, y - 16 * u, '#ffd84d', 4);
  }

  private drawIndicators(ctx: CanvasRenderingContext2D) {
    const W = this.w;
    const H = this.h;
    const sf = this.safe;
    const u = this.ui;
    const m = 24 * u;
    const left = m + sf.l;
    const right = W - m - sf.r;
    const top = m + sf.t;
    const bottom = H - m - sf.b;
    const cx = W / 2;
    const cy = H / 2;
    const p = this.player;
    for (const e of this.ships) {
      if (e.team !== 1 || e.sinking >= 0) continue;
      const [sx, sy] = this.worldToScreen(e.x, e.y);
      if (sx > -10 && sx < W + 10 && sy > -10 && sy < H + 10) continue;
      const dx = sx - cx;
      const dy = sy - cy;
      const tX = dx > 0 ? (right - cx) / dx : dx < 0 ? (left - cx) / dx : Infinity;
      const tY = dy > 0 ? (bottom - cy) / dy : dy < 0 ? (top - cy) / dy : Infinity;
      const tt = Math.min(tX, tY);
      const ix = cx + dx * tt;
      const iy = cy + dy * tt;
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      const size = (e.isBoss ? 14 : 9.5) * u;
      ctx.save();
      ctx.translate(ix, iy);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.globalAlpha = clamp(1.25 - dist / 1700, 0.4, 1);
      ctx.fillStyle = e.surrendered
        ? '#ffffff'
        : e.def.kind === 'fireship'
          ? '#ff8a2a'
          : e.def.trader === true
            ? '#ffd84d'
            : '#ff4b3a';
      ctx.strokeStyle = 'rgba(25,10,3,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.8, -size * 0.78);
      ctx.lineTo(-size * 0.35, 0);
      ctx.lineTo(-size * 0.8, size * 0.78);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  private drawHUD(ctx: CanvasRenderingContext2D) {
    const u = this.ui;
    const W = this.w;
    const sf = this.safe;
    const p = this.player;
    const narrow = W < 640;
    const x0 = 12 + sf.l;
    const y0 = 10 + sf.t;
    ctx.textBaseline = 'middle';

    // ---- hull
    const barW = narrow ? Math.min(150 * u + 30, W * 0.4) : 210 * u;
    const barH = 18 * u;
    const shake = this.hullShake > 0 ? Math.sin(this.realTime * 70) * 5 * this.hullShake : 0;
    const bx = x0 + shake;
    const by = y0 + 14 * u;
    ctx.font = `${Math.round(14 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, 'HULL', bx + 2, y0 + 4 * u, '#f3e2b3', 3);
    rr(ctx, bx - 3, by - 3, barW + 6, barH + 6, 7 * u);
    ctx.fillStyle = 'rgba(24,12,4,0.82)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d9a441';
    ctx.stroke();
    const ratio = clamp(p.hp / p.maxHp, 0, 1);
    const ghost = clamp(p.ghostHp / p.maxHp, 0, 1);
    if (ghost > 0.005) {
      ctx.fillStyle = '#fbe9b7';
      rr(ctx, bx, by, barW * ghost, barH, 4 * u);
      ctx.fill();
    }
    if (ratio > 0.005) {
      if (ratio > 0.55) ctx.fillStyle = '#d8432f';
      else if (ratio > 0.3) ctx.fillStyle = '#e0662a';
      else ctx.fillStyle = Math.sin(this.realTime * 10) > 0 ? '#ff3b2a' : '#b8241a';
      rr(ctx, bx, by, barW * ratio, barH, 4 * u);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(bx + 2, by + 2, Math.max(0, barW * ratio - 4), barH * 0.32);
    }
    ctx.font = `${Math.round(13 * u)}px ${FONT}`;
    ctx.textAlign = 'right';
    this.outlined(ctx, `${Math.ceil(p.hp)} / ${Math.round(p.maxHp)}`, bx + barW - 5, by + barH / 2 + 1, '#fff6e0', 3);

    // ---- reload
    const ry = by + barH + 13 * u;
    const segW = (barW - 8) / 2;
    this.drawReloadBar(ctx, bx, ry, segW, 'PORT', p.reloadL, p.reloadTime);
    this.drawReloadBar(ctx, bx + segW + 8, ry, segW, 'STBD', p.reloadR, p.reloadTime);

    // ---- compass + sail gauge
    const cr = 26 * u;
    const ccx = bx + cr + 3;
    const ccy = ry + 16 * u + cr;
    this.drawCompass(ctx, ccx, ccy, cr);
    const gx = ccx + cr + 12 * u;
    const gh = cr * 2;
    const gw = 7 * u;
    const gy = ccy - cr;
    ctx.fillStyle = 'rgba(24,12,4,0.75)';
    ctx.fillRect(gx - 2, gy - 2, gw + 4, gh + 4);
    ctx.fillStyle = '#f3e2b3';
    ctx.fillRect(gx, gy + gh * (1 - p.sail), gw, gh * p.sail);
    ctx.font = `${Math.round(11 * u)}px ${FONT}`;
    ctx.textAlign = 'center';
    this.outlined(
      ctx,
      p.def.oared ? 'OARS' : p.def.hullStyle === 'ironclad' ? 'STEAM' : 'SAIL',
      gx + gw / 2,
      ccy + cr + 9 * u,
      '#f3e2b3',
      3,
    );
    const kn = Math.round(Math.hypot(p.vx, p.vy) / 14);
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(13 * u)}px ${FONT}`;
    this.outlined(ctx, `${kn} kn`, gx + gw + 8 * u, ccy, '#f3e2b3', 3);

    // ---- ship's stores — the manifest, always in sight
    this.drawStores(ctx, bx, ccy + cr + 26 * u, barW);

    // ---- score
    const rx = W - sf.r - 64;
    const pulse = 1 + this.scorePulse * 0.16;
    ctx.textAlign = 'right';
    ctx.font = `${Math.round((narrow ? 28 : 36) * u * pulse)}px ${FONT}`;
    const str = this.getScoreStr();
    const sy = y0 + 18 * u;
    this.outlined(ctx, str, rx, sy, '#ffd84d', 5);
    const tw = ctx.measureText(str).width;
    drawCoin(ctx, rx - tw - 14 * u, sy, this.realTime, 0, 9 * u);
    let my = sy + 30 * u;
    if (this.mult > 1 || this.streakTimer > 0) {
      const mp = 1 + this.multPulse * 0.4;
      ctx.font = `${Math.round(22 * u * mp)}px ${FONT}`;
      const mstr = `x${this.mult}`;
      this.outlined(ctx, mstr, rx, my, this.mult > 1 ? '#ff8a3a' : '#f3e2b3', 4);
      const mw = ctx.measureText(mstr).width;
      ctx.font = `${Math.round(12 * u)}px ${FONT}`;
      this.outlined(ctx, 'STREAK', rx - mw - 6 * u, my + 1, '#e6d3a3', 3);
      const tbw = 80 * u;
      const k = this.streakTimer / STREAK_TIME;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(rx - tbw, my + 12 * u, tbw, 4 * u);
      ctx.fillStyle = '#ff8a3a';
      ctx.fillRect(rx - tbw * k, my + 12 * u, tbw * k, 4 * u);
      my += 28 * u;
    }

    // ---- wave
    const remaining = this.countEnemies() + this.waveQueue.length;
    const waveStr = `Wave ${this.wave}`;
    const remStr = this.waveClearing ? 'Victory!' : `${remaining} ship${remaining === 1 ? '' : 's'} remain`;
    if (narrow) {
      ctx.textAlign = 'right';
      ctx.font = `${Math.round(17 * u)}px ${FONT}`;
      this.outlined(ctx, `${waveStr} · ${remStr}`, rx, my, '#f3e2b3', 3);
    } else {
      ctx.textAlign = 'center';
      ctx.font = `${Math.round(26 * u)}px ${FONT}`;
      this.outlined(ctx, waveStr, W / 2, y0 + 16 * u, '#f3e2b3', 4);
      ctx.font = `italic ${Math.round(15 * u)}px ${FELL}`;
      this.outlined(ctx, remStr, W / 2, y0 + 39 * u, '#e6d3a3', 3);
    }

    // ---- boss bar
    const boss = this.findBoss();
    if (boss) {
      const bw = Math.min(W * 0.5, 320 * u);
      const bh = 10 * u;
      const bxx = W / 2 - bw / 2;
      const byy = y0 + (narrow ? 118 : 62) * u;
      ctx.font = `${Math.round(15 * u)}px ${FONT}`;
      ctx.textAlign = 'center';
      this.outlined(ctx, `☠ ${boss.def.name} ☠`, W / 2, byy - 10 * u, '#ff9a8a', 3);
      ctx.fillStyle = 'rgba(20,10,4,0.85)';
      ctx.fillRect(bxx - 3, byy - 3, bw + 6, bh + 6);
      ctx.fillStyle = '#f7e3a1';
      ctx.fillRect(bxx, byy, (bw * boss.ghostHp) / boss.maxHp, bh);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(bxx, byy, (bw * boss.hp) / boss.maxHp, bh);
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bxx - 3, byy - 3, bw + 6, bh + 6);
    }
  }

  /** The ship's inventory: crew, water, food, prisoners in irons, colours struck. */
  private drawStores(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
    const u = this.ui;
    const p = this.player;
    const rowH = 15.5 * u;
    const pad = 7 * u;
    const flagH = 13 * u;
    const regH = 13 * u;
    const h = pad * 2 + rowH * 4 + flagH + regH;
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(14 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, "SHIP'S STORES", x + 2, y - 5 * u, '#f3e2b3', 3);
    rr(ctx, x - 3, y + 4 * u, w + 6, h, 7 * u);
    ctx.fillStyle = 'rgba(24,12,4,0.82)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d9a441';
    ctx.stroke();
    const lx = x + pad;
    const rw = w - pad * 2;
    let ry = y + 4 * u + pad + rowH / 2;
    const crew = Math.max(0, Math.ceil(p.crew));
    this.storeRow(ctx, lx, ry, rw, 'CREW', `${crew}`, '#f3e2b3');
    ry += rowH;
    const wLow = this.water < this.maxWater * 0.25;
    const fLow = this.food < this.maxFood * 0.25;
    const blink = Math.sin(this.realTime * 8) > -0.2;
    this.storeRow(ctx, lx, ry, rw, 'WATER', `${Math.floor(this.water)}`, wLow && blink ? '#ff6a5a' : '#9fd8ff');
    ry += rowH;
    this.storeRow(ctx, lx, ry, rw, 'FOOD', `${Math.floor(this.food)}`, fLow && blink ? '#ff6a5a' : '#ffd88a');
    ry += rowH;
    this.storeRow(ctx, lx, ry, rw, 'PRISONERS', `${this.prisoners}`, '#d8c9a3');
    ry += rowH;
    // colours struck — mini flags of the prizes, newest last
    const flagCy = ry + flagH / 2;
    ctx.font = `${Math.round(11 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, 'FLAGS', lx, flagCy, '#cbb88f', 3);
    const fw = 13 * u;
    const fh = 8 * u;
    const gap = 2.5 * u;
    const maxFit = Math.max(1, Math.floor((rw - 44 * u) / (fw + gap)));
    const shown = this.flags.slice(-maxFit);
    if (shown.length === 0) {
      ctx.font = `${Math.round(12 * u)}px ${FONT}`;
      ctx.textAlign = 'right';
      this.outlined(ctx, '—', lx + rw, flagCy, '#8a7a5a', 3);
    } else {
      let fx = lx + rw - shown.length * (fw + gap) + gap;
      for (const f of shown) {
        ctx.save();
        ctx.translate(fx, flagCy - fh / 2);
        drawFlagArt(ctx, f.faction, fw, fh);
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, fw, fh);
        ctx.restore();
        fx += fw + gap;
      }
      const extra = this.flags.length - shown.length;
      if (extra > 0) {
        ctx.font = `${Math.round(10 * u)}px ${FONT}`;
        ctx.textAlign = 'left';
        this.outlined(ctx, `+${extra}`, lx + 40 * u, flagCy, '#e6d3a3', 3);
      }
    }
    const regCy = ry + flagH + regH / 2;
    ctx.font = `italic ${Math.round(12 * u)}px ${FELL}`;
    ctx.textAlign = 'center';
    this.outlined(ctx, regionById(this.regionId).name, lx + rw / 2, regCy, '#e8c86a', 3);
  }

  private storeRow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    label: string,
    value: string,
    color: string,
  ) {
    const u = this.ui;
    ctx.font = `${Math.round(11 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, label, x, y, '#cbb88f', 3);
    ctx.font = `${Math.round(14 * u)}px ${FONT}`;
    ctx.textAlign = 'right';
    this.outlined(ctx, value, x + w, y, color, 3);
  }

  /** "Prize alongside!" — the boarding call to action. */
  private drawBoardPrompt(ctx: CanvasRenderingContext2D) {
    const s = this.boardCandidate;
    if (!s || this.screen !== 'playing') return;
    const u = this.ui;
    const W = this.w;
    const H = this.h;
    // marker over the prize
    const [sx, sy] = this.worldToScreen(s.x, s.y);
    if (sx > -60 && sx < W + 60 && sy > -80 && sy < H + 60) {
      const bounce = Math.abs(Math.sin(this.realTime * 5)) * 8 * u;
      const y = sy - s.def.length * 0.5 * this.curScale - 34 * u - bounce;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(20 * u)}px ${FONT}`;
      this.outlined(ctx, 'BOARD!', sx, y - 14 * u, '#7dff9a', 4);
      ctx.fillStyle = '#7dff9a';
      ctx.strokeStyle = 'rgba(28,12,4,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, y + 10 * u);
      ctx.lineTo(sx - 9 * u, y - 3 * u);
      ctx.lineTo(sx + 9 * u, y - 3 * u);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
    // the offer, bottom-center: her full manifest against the risks
    const V = s.def.value * (1 + 0.1 * (this.wave - 1));
    const prize = Math.round(V * 1.25) + 100;
    const touch = this.isTouch || this.input.usedTouch;
    const l1 = `Prize alongside: ${s.def.name} — ${Math.max(0, Math.ceil(s.crew))} men`;
    const l2 = touch
      ? `Tap BOARD for ~${prize.toLocaleString('en-US')} gold + her colours`
      : `Press F to BOARD for ~${prize.toLocaleString('en-US')} gold + her colours`;
    const l3 = 'Full cargo… if her crew plays fair. Beware treachery, scuttling & fever!';
    ctx.font = `${Math.round(17 * u)}px ${FONT}`;
    const need =
      Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width, ctx.measureText(l3).width) + 44 * u;
    // narrow screens: shrink the panel's type to fit instead of spilling past the box
    const su = need > W - 16 ? Math.max(0.5 * u, (u * (W - 16)) / need) : u;
    ctx.font = `${Math.round(17 * su)}px ${FONT}`;
    const bw = Math.min(W - 16, need * (su / u));
    const bh = 74 * su;
    const bx = W / 2;
    const by = H - this.safe.b - (touch ? 330 : 168) * u;
    rr(ctx, bx - bw / 2, by - bh / 2, bw, bh, 12 * su);
    ctx.fillStyle = 'rgba(20,10,4,0.78)';
    ctx.fill();
    ctx.strokeStyle = '#7dff9a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#7dff9a';
    ctx.fillText(l1, bx, by - 22 * su);
    ctx.fillStyle = '#ffd84d';
    ctx.fillText(l2, bx, by + 1 * su);
    ctx.font = `italic ${Math.round(13 * su)}px ${FELL}`;
    ctx.fillStyle = '#e6d3a3';
    ctx.fillText(l3, bx, by + 22 * su);
  }

  private drawReloadBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, label: string, r: number, total: number) {
    const u = this.ui;
    const h = 6 * u;
    const k = clamp(1 - r / total, 0, 1);
    ctx.font = `${Math.round(11 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, label, x, y, k >= 1 ? '#ffd84d' : '#cbb88f', 3);
    const lx = x + 32 * u;
    const lw = Math.max(10, w - 32 * u);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(lx, y - h / 2, lw, h);
    ctx.fillStyle = k >= 1 ? '#ffd84d' : '#f3e2b3';
    ctx.fillRect(lx, y - h / 2, lw * k, h);
  }

  private drawCompass(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const p = this.player;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(243,226,179,0.93)';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#5b3a1a';
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(91,58,26,0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.74, 0, TAU);
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8;
      const r0 = i % 2 ? r * 0.84 : r * 0.74;
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r * 0.96, Math.sin(a) * r * 0.96);
    }
    ctx.stroke();
    ctx.fillStyle = '#5b3a1a';
    ctx.font = `${Math.round(r * 0.36)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -r * 0.55);
    ctx.fillText('S', 0, r * 0.57);
    ctx.fillText('E', r * 0.56, 0);
    ctx.fillText('W', -r * 0.55, 0);
    const good = (this.windFactor(p.angle, !!p.def.oared || p.def.hullStyle === 'ironclad') - 0.46) / 0.54;
    ctx.save();
    ctx.rotate(p.angle);
    ctx.fillStyle = good > 0.72 ? '#2f9e44' : good > 0.4 ? '#e0a32a' : '#c0392b';
    ctx.strokeStyle = 'rgba(25,10,3,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 1.08, 0);
    ctx.lineTo(r * 0.8, -r * 0.2);
    ctx.lineTo(r * 0.8, r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.rotate(this.windAngle + Math.sin(this.realTime * 2.2) * 0.05);
    ctx.fillStyle = '#b3261e';
    ctx.strokeStyle = '#4a0d08';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 0.64, 0);
    ctx.lineTo(-r * 0.42, -r * 0.26);
    ctx.lineTo(-r * 0.22, 0);
    ctx.lineTo(-r * 0.42, r * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.font = `${Math.round(11 * this.ui)}px ${FONT}`;
    ctx.textAlign = 'center';
    this.outlined(ctx, 'WIND', cx, cy + r + 9 * this.ui, '#f3e2b3', 3);
  }

  private drawBanner(ctx: CanvasRenderingContext2D) {
    const b = this.banner;
    if (!b.title || b.t >= b.dur) return;
    const W = this.w;
    const H = this.h;
    const u = this.ui;
    const tIn = Math.min(1, b.t / 0.35);
    const tOut = Math.max(0, (b.t - (b.dur - 0.5)) / 0.5);
    const ease = 1 - Math.pow(1 - tIn, 3);
    const sc = 0.6 + 0.4 * ease + (tIn < 1 ? Math.sin(tIn * Math.PI) * 0.12 : 0);
    ctx.save();
    ctx.globalAlpha = 1 - tOut;
    ctx.translate(W / 2, H * 0.3);
    ctx.scale(sc, sc);
    const bw = Math.min(W * 0.92, 580 * u);
    const bh = 88 * u;
    ctx.fillStyle = 'rgba(20,10,4,0.74)';
    ctx.beginPath();
    ctx.moveTo(-bw / 2, -bh / 2);
    ctx.lineTo(bw / 2, -bh / 2);
    ctx.lineTo(bw / 2 - 18 * u, 0);
    ctx.lineTo(bw / 2, bh / 2);
    ctx.lineTo(-bw / 2, bh / 2);
    ctx.lineTo(-bw / 2 + 18 * u, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = b.gold ? '#ffd84d' : '#d9a441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bw / 2 + 24 * u, -bh / 2 + 6 * u);
    ctx.lineTo(bw / 2 - 24 * u, -bh / 2 + 6 * u);
    ctx.moveTo(-bw / 2 + 24 * u, bh / 2 - 6 * u);
    ctx.lineTo(bw / 2 - 24 * u, bh / 2 - 6 * u);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(46 * u)}px ${FONT}`;
    this.outlined(ctx, b.title, 0, -12 * u, b.gold ? '#ffe066' : '#ffd84d', 6);
    ctx.font = `italic ${Math.round(18 * u)}px ${FELL}`;
    this.outlined(ctx, b.sub, 0, 24 * u, '#f3e2b3', 3);
    ctx.restore();
  }

  private drawHints(ctx: CanvasRenderingContext2D) {
    if (this.screen !== 'playing' || this.wave !== 1) return;
    const t = this.hintTimer;
    if (t > 15 || this.stats.sunk >= 2) return;
    const a = Math.min(1, t * 2) * Math.min(1, (15 - t) * 1.5);
    const touch = this.isTouch || this.input.usedTouch;
    const l1 = touch ? 'Drag on the left side to steer' : 'A / D steer   ·   W / S trim sails';
    const l2 = touch
      ? (usesGunpowder(this.eraId) ? 'Tap FIRE — cannons shoot from the SIDES!' : 'Tap FIRE — bows & pulley launchers fire from the SIDES!')
      : 'Q / E fire port & starboard   ·   SPACE or CLICK smart broadside';
    const u = this.ui;
    const W = this.w;
    const H = this.h;
    const y = H - this.safe.b - (touch ? 200 : 64) * u;
    ctx.font = `${Math.round(17 * u)}px ${FONT}`;
    const need = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 40 * u;
    const su = need > W - 16 ? Math.max(0.5 * u, (u * (W - 16)) / need) : u;
    ctx.font = `${Math.round(17 * su)}px ${FONT}`;
    const bw = Math.min(W - 16, need * (su / u));
    const bh = 56 * su;
    ctx.globalAlpha = a;
    rr(ctx, W / 2 - bw / 2, y - bh / 2, bw, bh, 12 * su);
    ctx.fillStyle = 'rgba(20,10,4,0.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(217,164,65,0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f3e2b3';
    ctx.fillText(l1, W / 2, y - 12 * su);
    ctx.fillStyle = '#ffd84d';
    ctx.fillText(l2, W / 2, y + 13 * su);
    ctx.globalAlpha = 1;
  }
}
