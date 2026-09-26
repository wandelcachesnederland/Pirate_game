import type { CapturedFlag, EraId, Island, RegionId, Screen, Ship, ShipDef, ShipKind, UpgradeId, DifficultyId } from '../types';
import { DEFAULT_DIFFICULTY, difficultyById, type DifficultyDef } from '../difficulty';
import { DEFAULT_ERA, ERA_FLAGSHIPS } from '../ships/era';
import { DEFAULT_REGION } from '../worlds';
import { Input } from '../input';
import { Sfx } from '../audio';
import type { MusicMode } from '../music';
import { armamentFor, type Armament } from '../weapons';
import { angDiff } from '../math';
import { rand, type Particle, type Ball, type Slick, type Pickup, type FText, type Volley, type Streak, type Banner, type PlayerStats, defaultStats, type EngineCallbacks } from './constants';

/** All mutable engine state (plus pure state-derived helpers). Every behaviour layer extends this. */
export abstract class EngineState {
  protected canvas!: HTMLCanvasElement;
  protected ctx!: CanvasRenderingContext2D;
  protected cb!: EngineCallbacks;
  readonly input = new Input();
  readonly sfx = new Sfx();
  protected musicMode: MusicMode = 1;
  screen: Screen = 'menu';

  protected w = 1;
  protected h = 1;
  protected dpr = 1;
  protected maxDpr = 2;
  protected viewScale = 1;
  protected ui = 1;
  protected safe = { t: 0, r: 0, b: 0, l: 0 };
  protected safeProbe!: HTMLDivElement;
  protected isTouch = false;

  protected raf = 0;
  protected last = 0;
  protected time = 0;
  protected realTime = 0;
  protected timeScale = 1;
  protected slowMo = 0;
  protected hitStop = 0;
  protected perfAcc = 0;
  protected perfFrames = 0;

  protected camX = 0;
  protected camY = 0;
  protected zoom = 1;
  protected zoomPunch = 0;
  protected trauma = 0;
  protected kickX = 0;
  protected kickY = 0;
  protected vx0 = 0;
  protected vy0 = 0;
  protected vx1 = 0;
  protected vy1 = 0;
  protected curScale = 1;
  protected shx = 0;
  protected shy = 0;

  protected islands: Island[] = [];
  protected ships: Ship[] = [];
  protected player!: Ship;
  protected balls: Ball[] = [];
  protected parts: Particle[] = [];
  protected pCount = 0;
  protected pickups: Pickup[] = [];
  /** Greek fire that missed: naphtha still burning on the water. */
  protected slicks: Slick[] = [];
  protected texts: FText[] = [];
  protected volleys: Volley[] = [];
  protected streaks: Streak[] = [];
  protected nextId = 1;

  protected windAngle = 0;
  protected windTarget = 0;
  protected windTimer = 20;
  protected windX = 1;
  protected windY = 0;

  protected score = 0;
  protected displayScore = 0;
  protected scoreStr = '0';
  protected scoreStrVal = -1;
  protected mult = 1;
  protected streakTimer = 0;
  protected wave = 0;
  protected waveQueue: ShipKind[] = [];
  protected spawnTimer = 0;
  protected waveClearing = false;
  protected clearTimer = 0;
  protected waveDamage = 0;
  protected magnetAll = false;
  protected stats = { shots: 0, hits: 0, sunk: 0, gold: 0, maxStreak: 1, time: 0, boarded: 0 };
  protected banner: Banner = { title: '', sub: '', t: 99, dur: 0, gold: false };
  protected hintTimer = 0;
  protected firstHit = false;
  protected playerDeadTimer = -1;
  protected flashRed = 0;
  protected flashWhite = 0;
  protected scorePulse = 0;
  protected hullShake = 0;
  protected multPulse = 0;
  protected goldPopup = 0;
  protected goldPopupTimer = 0;
  protected goldPopupPulse = 0;
  protected coinChain = 0;
  protected coinChainTimer = 0;
  protected levels: Partial<Record<UpgradeId, number>> = {};
  /** The peril the voyage is sailed under — every foe and fortune reads it. */
  protected difficulty: DifficultyId = DEFAULT_DIFFICULTY;
  protected diff: DifficultyDef = difficultyById(DEFAULT_DIFFICULTY);
  /** Era flagship the player sails; swapped from the hull picker. */
  protected eraId: EraId = DEFAULT_ERA;
  protected playerDef: ShipDef = ERA_FLAGSHIPS[DEFAULT_ERA];
  protected pstats: PlayerStats = defaultStats(ERA_FLAGSHIPS[DEFAULT_ERA]);
  protected swivelTimer = 0;
  /** Cooling of the Grape & Canister gun; 0 = ready to fire. */
  protected grapeCd = 0;
  /** Reload clocks of the bow chaser and the stern chaser — they fire unasked. */
  protected bowTimer = 0;
  protected sternTimer = 0;
  /** Throttles the "they've given up" call so a breaking pack doesn't spam it. */
  protected nativeCallTimer = 0;
  protected nativeTimer = rand(4, 8);
  /** Waters being sailed — picked on the menu, scenery only. */
  protected regionId: RegionId = DEFAULT_REGION;
  protected waterBase = '#1a7394';
  /** The ship's stores — water, food, souls in irons, colours struck. */
  protected water = 100;
  protected maxWater = 150;
  protected food = 100;
  protected maxFood = 150;
  protected prisoners = 0;
  protected flags: CapturedFlag[] = [];
  /** Surrendered foe lying alongside, ready to board — if any. */
  protected boardCandidate: Ship | null = null;
  protected supplyTimer = 0;
  protected storeWarnTimer = 0;

  protected waterPattern: CanvasPattern | null = null;
  protected wavePatternA: CanvasPattern | null = null;
  protected wavePatternB: CanvasPattern | null = null;
  protected glowWarm!: HTMLCanvasElement;
  protected glowGold!: HTMLCanvasElement;
  protected vignette!: HTMLCanvasElement;
  protected redVignette!: HTMLCanvasElement;

  /** The armament of the sea being sailed: cannon, bows, bolts or siphons. */
  protected get arm(): Armament {
    return armamentFor(this.eraId);
  }

  protected windFactor(a: number, oared = false) {
    if (oared) return 1; // paddled craft make their own way
    const c = (1 + Math.cos(angDiff(a, this.windAngle))) * 0.5;
    return 0.46 + 0.54 * Math.pow(c, 0.6);
  }
}
