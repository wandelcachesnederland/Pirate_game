/**
 * Engine tuning constants, internal record types and small helpers shared by
 * every engine layer.
 */
import type { GameStats, Screen, Ship, ShipDef, UpgradeOffer } from '../types';
import type { ProjectileKind } from '../weapons';

export const HALF_PI = Math.PI / 2;
/** Half-width of the chart. 4200 doubles each dimension — four times the sea. */
export const WORLD = 4200;
export const MAX_PARTICLES = 1100;
export const MAX_PICKUPS = 260;
export const STREAK_TIME = 7;
export const MAX_MULT = 8;
/**
 * Grape & Canister — the anti-boat gun. One touch of the linstock sprays the
 * whole hull with musket balls and scrap: murderous against open boats and
 * boarding parties, near useless against a real ship's timbers.
 * Index 0 is level 1.
 */
export const GRAPE = [
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
export const CHASER = [
  { range: 360, reload: 3.4, dmg: 20 },
  { range: 420, reload: 3.0, dmg: 26 },
  { range: 480, reload: 2.5, dmg: 34 },
];
/** Damage multiplier when a chase gun lands on something bigger than a boat. */
export const CHASER_BIG = 0.45;
/** Island raiders hunt for a while, then break off and go home. */
export const NATIVE_HUNT = [15, 30];
/** How far a war party is willing to stray from its own beach. */
export const NATIVE_LEASH = [340, 540];
/** A player this close to the beach is in their waters — they always fight. */
export const NATIVE_GUARD = 320;
/** Spent raiders loiter this long off the beach before hauling out. */
export const NATIVE_BEACH = [11, 19];
/** How often a burning hull takes its fire damage — bites you can read. */
export const BURN_TICK = 0.28;
/** Chance per second that fire jumps between two hulls lying alongside. */
export const FIRE_SPREAD = 0.4;
/** Greek fire floats and keeps burning: seconds a slick lives on the water. */
export const SLICK_LIFE = 3.6;
/** Canvases of flaming naphtha afloat at once (older ones burn out first). */
export const MAX_SLICKS = 44;
export const FONT = '"Pirata One", Georgia, serif';
export const FELL = '"IM Fell English", Georgia, serif';

export const P_SMOKE = 0;
export const P_FIRE = 1;
export const P_SPARK = 2;
export const P_SPLINTER = 3;
export const P_DROP = 4;
export const P_RING = 5;
export const P_FOAM = 6;
export const P_PLANK = 7;
export const P_BUBBLE = 8;
export const P_SPARKLE = 9;
export const P_FLASH = 10;
export const P_SAND = 11;
export const P_ARROW = 12;
export const ADDITIVE = [false, true, true, false, false, false, false, false, false, true, true, false, false];

export const FIRE_COLORS = ['#ffe08a', '#ffb347', '#ff7b2e', '#ff5a1f'];
export const SMOKE_LIGHT = ['#ece8e0', '#dcd6cc', '#cdc6ba'];
export const SMOKE_DARK = ['#4a4541', '#3a3532', '#5a5550'];
export const WOOD = ['#8a5a2e', '#6b4423', '#b07a45', '#5a3a1e'];
export const SAND = ['#e6cf96', '#d4b87a', '#f1e0b0'];

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export function pick<T>(arr: T[]): T {
  return arr[(Math.random() * arr.length) | 0];
}

export interface Particle {
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
export interface Ball {
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
export interface Slick {
  x: number;
  y: number;
  r: number;
  life: number;
  max: number;
  /** Only hulls of the other side are hurt by it (fire does not read flags). */
  team: 0 | 1;
  /** Damage per second to a hull lying in the flames. */
  dps: number;
  seed: number;
}
export interface Pickup {
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
export interface FText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  size: number;
  life: number;
  max: number;
}
export interface Volley {
  ship: Ship;
  side: number;
  lx: number;
  rel: number;
  delay: number;
  dmg: number;
}
export interface Streak {
  x: number;
  y: number;
  life: number;
  max: number;
  len: number;
}
export interface Banner {
  title: string;
  sub: string;
  t: number;
  dur: number;
  gold: boolean;
}
export interface PlayerStats {
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

export function defaultStats(def: ShipDef): PlayerStats {
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
