import type { EraId, GameStats, RegionId, Ship, ShipInventory, ShipKind, UpgradeId, UpgradeOffer, DifficultyId } from './types';
import { SHIP_DEFS, UPGRADES, waveCompositionFor, waveTitleL } from './data';
import { difficultyById } from './difficulty';
import { DEFAULT_ERA, ERA_FLAGSHIPS, eraRegion } from './ships/era';
import { regionById } from './worlds';
import { BOARD_MIN_CREW } from './boarding';
import { TITLE_CASSETTE, type MusicMode } from './music';
import { buildIsland, makeGlow, makeVignette, makeWaterTile, makeWaveTile } from './render';
import { assignIslandPolitics, flagOf, rollSettlement } from './settlements';
import { armShipForEra, upgradeForEra, upgradeNameL, usesGunpowder } from './weapons';
import { angDiff, TAU } from './math';
import { WORLD, MAX_PARTICLES, GRAPE, rand, clamp, defaultStats, type EngineCallbacks } from './engineCore/constants';
import { EngineWeapons } from './engineCore/weapons';
import { CAMPAIGN_WAVES_PER_ERA, chronologicalEraIds, eraById } from './campaign';
import i18n, { fmt } from '../i18n';

// Re-exported so callers can keep importing these from the engine.
export { angDiff };
export { WORLD, type EngineCallbacks } from './engineCore/constants';

/**
 * The game engine. Behaviour is layered across `./engineCore/*` (each layer
 * extends the previous one):
 *   state -> fx -> hud -> worldRender -> combat -> ships -> weapons -> Engine
 * This top layer owns the lifecycle, public API, world setup, waves and the
 * main loop.
 */
export class Engine extends EngineWeapons {
  // ---- campaign ----
  campaignActive = false;
  campaignEras: EraId[] = [];
  campaignIndex = 0;
  campaignWavesPerEra = CAMPAIGN_WAVES_PER_ERA;
  // how many waves have been cleared in the current campaign era
  campaignWavesClearedInEra = 0;

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
    super();
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
    // Guard the runtime boundary as well as the TypeScript type: a stale or
    // hand-edited localStorage value must never select an inherited object key.
    const safeId = Object.prototype.hasOwnProperty.call(ERA_FLAGSHIPS, id) ? id : DEFAULT_ERA;
    const def = ERA_FLAGSHIPS[safeId];
    this.eraId = safeId;
    this.playerDef = def;
    // the deck follows the era: every sea has its own songs and its own dirge
    this.sfx.setEra(safeId);
    if (this.screen === 'menu' && this.player) {
      const old = this.player;
      const fresh = this.makeShip('player', old.x, old.y, old.angle);
      const i = this.ships.indexOf(old);
      if (i >= 0) this.ships[i] = fresh;
      else this.ships.push(fresh);
      this.player = fresh;
    }
  }

  /** Which peril the voyage is being sailed under. */
  getDifficulty(): DifficultyId {
    return this.difficulty;
  }

  /**
   * Pick the voyage's peril. Takes effect on the next `startGame()` — the
   * menu ship is rebuilt so the chosen hull's worth shows at once.
   */
  setDifficulty(id: DifficultyId) {
    this.difficulty = id;
    this.diff = difficultyById(id);
    if (this.screen === 'menu' && this.player) {
      const old = this.player;
      const fresh = this.makeShip('player', old.x, old.y, old.angle);
      const i = this.ships.indexOf(old);
      if (i >= 0) this.ships[i] = fresh;
      else this.ships.push(fresh);
      this.player = fresh;
    }
  }

  // ---- campaign API ----
  setCampaign(active: boolean, eras?: EraId[]) {
    this.campaignActive = active;
    if (active) {
      this.campaignEras = eras && eras.length > 0 ? [...eras] : chronologicalEraIds();
      this.campaignIndex = 0;
      this.campaignWavesClearedInEra = 0;
      this.campaignWavesPerEra = CAMPAIGN_WAVES_PER_ERA;
    } else {
      this.campaignEras = [];
      this.campaignIndex = 0;
      this.campaignWavesClearedInEra = 0;
    }
  }

  getCampaignInfo(): { active: boolean; index: number; total: number; eraId: EraId | null; wavesPerEra: number; wavesClearedInEra: number } | null {
    if (!this.campaignActive) return null;
    const eraId = this.campaignEras[this.campaignIndex] ?? null;
    return {
      active: this.campaignActive,
      index: this.campaignIndex,
      total: this.campaignEras.length,
      eraId,
      wavesPerEra: this.campaignWavesPerEra,
      wavesClearedInEra: this.campaignWavesClearedInEra,
    };
  }

  /** Start a campaign: sets era to first in list and begins game */
  startCampaign(eras?: EraId[], wavesPerEra: number = CAMPAIGN_WAVES_PER_ERA) {
    const list = eras && eras.length > 0 ? [...eras] : chronologicalEraIds();
    this.setCampaign(true, list);
    this.campaignWavesPerEra = wavesPerEra;
    this.campaignIndex = 0;
    this.campaignWavesClearedInEra = 0;
    const first = list[0];
    if (first) {
      // set player hull to flagship of first era? keep current playerDef if already set, else use flagship
      // we keep whatever playerDef was chosen in menu, but ensure eraId/region match campaign start
      this.eraId = first;
      this.regionId = eraRegion(first);
      this.playerDef = ERA_FLAGSHIPS[first] ?? this.playerDef;
      this.sfx.setEra(first);
    }
    this.startGame();
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

  /**
   * The attract screen's tune. The studio sting hands over to it as the logo
   * fades: the same wall of sound, now with a song to walk into. It keeps the
   * port warm through sign-on and peril, and the sea's own tape crossfades over
   * it the moment an era is picked on the chart.
   */
  previewTitleMusic() {
    if (this.screen !== 'menu') return;
    this.sfx.unlock();
    // the title screen has no fight to score, so the band is always fully in
    this.musicMode = 1;
    this.sfx.setMode(1);
    this.sfx.insertCassette(TITLE_CASSETTE);
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
  protected buildWaterPatterns() {
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
    // World generation uses the current wave to set fort strength. Reset before
    // building the new chart so restarting a late voyage starts at wave one.
    this.wave = 0;
    if (!this.campaignActive) {
      this.campaignWavesClearedInEra = 0;
    }
    this.resetWorld();
    this.resetTraits();
    this.buildTraitWorld();
    // In campaign the score / upgrades persist across eras, so only reset when
    // starting a fresh game (not when advancing via campaign). startCampaign
    // itself has already set the first era. For a normal arcade start we wipe.
    if (!this.campaignActive || this.campaignIndex === 0 && this.campaignWavesClearedInEra === 0) {
      // fresh start: if not campaign, wipe; if campaign at very beginning, wipe too
      if (!this.campaignActive) {
        this.score = 0;
        this.displayScore = 0;
        this.mult = 1;
        this.streakTimer = 0;
        this.stats = { shots: 0, hits: 0, sunk: 0, gold: 0, maxStreak: 1, time: 0, boarded: 0 };
        this.levels = {};
        this.pstats = defaultStats(this.playerDef);
        this.pstats.maxHp = Math.round(this.pstats.maxHp * this.diff.playerHp);
      } else {
        // campaign fresh start — same wipe but keep campaign bookkeeping
        this.score = 0;
        this.displayScore = 0;
        this.mult = 1;
        this.streakTimer = 0;
        this.stats = { shots: 0, hits: 0, sunk: 0, gold: 0, maxStreak: 1, time: 0, boarded: 0 };
        this.levels = {};
        this.pstats = defaultStats(this.playerDef);
        this.pstats.maxHp = Math.round(this.pstats.maxHp * this.diff.playerHp);
      }
    } else {
      // This path is not used by startGame directly for campaign era transitions
      // (advanceToNextCampaignEra handles it), but keep pstats maxHp adjustment
      this.pstats.maxHp = Math.round(this.pstats.maxHp * this.diff.playerHp);
    }
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
    // leaving campaign — reset its bookkeeping so next arcade era game is clean
    this.campaignActive = false;
    this.campaignEras = [];
    this.campaignIndex = 0;
    this.campaignWavesClearedInEra = 0;
    this.enterMenu();
    // back in port on the attract screen: its own theme takes the deck again
    // (`previewTitleMusic`, asked for by the start screen as it comes up)
    this.previewTitleMusic();
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
      case 'ram':
        ps.ram += 1;
        break;
      case 'spikes':
        ps.spikes += 1;
        break;
      case 'fenders':
        ps.fenders += 1;
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
    this.addText(p.x, p.y - 44, `${upgradeNameL(id, this.eraId)}!`, '#9fe7ff', 24);
    if (id === 'grapeshot') this.addText(p.x, p.y - 20, i18n.t('hud:engine.pressR'), '#ffd84d', 17);
    this.fxSparkle(p.x, p.y, 14, '#9fe7ff');

    // campaign: after each cleared wave we track per-era progress. If the era's quota is met, advance.
    if (this.campaignActive) {
      this.campaignWavesClearedInEra++;
      if (this.campaignWavesClearedInEra >= this.campaignWavesPerEra) {
        // era complete
        if (this.campaignIndex + 1 >= this.campaignEras.length) {
          // campaign complete — victory!
          this.banner = {
            title: i18n.t('hud:banner.campaignDone'),
            sub: i18n.t('hud:banner.conqueredAll', { len: this.campaignEras.length, gold: fmt(this.score) }),
            t: 0,
            dur: 4,
            gold: true,
          };
          // small delay then game over as victory
          window.setTimeout(() => this.gameOver(), 1800);
          return;
        } else {
          this.advanceToNextCampaignEra();
          return;
        }
      }
    }

    this.startWave(this.wave + 1);
  }

  /** Advance campaign to next chronological era, keeping score/upgrades */
  protected advanceToNextCampaignEra() {
    this.campaignIndex++;
    this.campaignWavesClearedInEra = 0;
    const nextId = this.campaignEras[this.campaignIndex];
    if (!nextId) {
      this.gameOver();
      return;
    }
    const nextEraDef = eraById(nextId);
    // keep player hull as chosen, but switch the world/era for enemies, music and map
    this.eraId = nextId;
    this.regionId = eraRegion(nextId);
    this.buildWaterPatterns();
    this.sfx.setEra(nextId);
    this.sfx.insertRandomCassette(true);
    // rebuild world but preserve player stats/upgrades
    this.resetWorld();
    this.resetTraits();
    this.buildTraitWorld();
    this.wave = 0;
    this.waveQueue = [];
    this.spawnTimer = 0;
    this.waveClearing = false;
    this.waveDamage = 0;
    this.magnetAll = false;
    this.balls = [];
    this.slicks = [];
    this.pickups = [];
    this.texts = [];
    this.volleys = [];
    this.pCount = 0;
    // recreate player at origin with same pstats
    this.player = this.makeShip('player', 0, 0, this.windAngle + rand(-0.5, 0.5));
    this.applyPlayerStats();
    this.player.hp = this.player.maxHp;
    this.player.ghostHp = this.player.maxHp;
    this.ships.push(this.player);
    this.camX = 0;
    this.camY = 0;
    this.zoom = 1.12;
    this.playerDeadTimer = -1;
    this.hintTimer = 0;
    this.firstHit = false;
    this.input.clear();
    this.input.enabled = true;
    this.screen = 'playing';
    this.cb.onScreen('playing');
    this.banner = {
      title: i18n.t('eras:ui.eraCount', { n: this.campaignIndex + 1, total: this.campaignEras.length }),
      sub: nextEraDef ? `${i18n.t(`eras:${nextId}.name`, { defaultValue: nextEraDef.era })} — ${nextEraDef.year}` : nextId,
      t: 0,
      dur: 3.5,
      gold: true,
    };
    this.sfx.horn();
    this.sfx.setTempo(1);
    // small delay then first wave of new era
    window.setTimeout(() => {
      if (this.screen === 'playing') this.startWave(1);
    }, 900);
  }

  // ================================================================ setup
  protected onResize = () => this.resize();
  protected onVisibility = () => {
    if (document.hidden) this.pause();
  };
  protected onBlur = () => this.pause();

  protected resize() {
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

  protected enterMenu() {
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

  protected resetWorld() {
    this.generateWorld();
    this.ships = [];
    this.balls = [];
    this.slicks = [];
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

  protected generateWorld() {
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
      if (settlement.fortress) {
        forts++;
        const f = settlement.fortress;
        f.maxHp = Math.max(1, Math.round(f.maxHp * this.diff.fortHp));
        f.hp = f.maxHp;
        f.damage = f.damage * this.diff.fortDamage;
      }
      this.islands.push(
        buildIsland(x, y, r, seedBase + tries * 7919, res, theme, {
          settlement,
          flag: flagOf(settlement),
          mechanical: !usesGunpowder(this.eraId),
          era: this.eraId,
        }),
      );
    }
    assignIslandPolitics(this.islands.map((is) => is.settlement));
  }

  protected makeShip(kind: ShipKind, x: number, y: number, angle: number): Ship {
    const def = armShipForEra(kind === 'player' ? this.playerDef : SHIP_DEFS[kind], this.eraId);
    const w = Math.max(1, this.wave);
    const enemy = kind !== 'player';
    const df = this.diff;
    const hp = Math.round(def.hp * (enemy ? (1 + 0.085 * (w - 1)) * df.enemyHp : df.playerHp));
    const crew = Math.round((def.crew ?? 20) * (enemy ? (1 + Math.min(0.3, 0.02 * (w - 1))) * df.enemyCrew : 1));
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
      reloadTime: enemy ? def.reload * Math.max(0.62, 1 - 0.035 * (w - 1)) * df.enemyReload : def.reload,
      cannons: def.cannons,
      damage: enemy ? def.damage * (1 + 0.06 * (w - 1)) * df.enemyDamage : def.damage,
      range: def.range,
      ballSpeed: def.ballSpeed,
      maxSpeed: def.speed * (enemy ? (1 + Math.min(0.15, 0.012 * (w - 1))) * df.enemySpeed : 1),
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
      aiJitter: enemy ? Math.max(0.035, 0.13 - 0.009 * (w - 1)) * df.aimJitter : 0,
      aiLead: enemy ? Math.min(1, (0.25 + 0.11 * (w - 1)) * df.aimLead) : 0,
      slowTimer: 0,
      burn: 0,
      burnRate: 0,
      burnTick: 0,
      burnFromPlayer: false,
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

  protected applyPlayerStats() {
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
  protected startWave(n: number) {
    this.wave = n;
    this.waveQueue = waveCompositionFor(this.eraId, n, this.diff.waveBudget);
    this.spawnTimer = (n === 1 ? 2.4 : 1.0) * this.diff.spawnPace;
    this.waveClearing = false;
    this.magnetAll = false;
    this.waveDamage = 0;
    this.banner = { title: i18n.t('hud:hud.wave', { n }), sub: waveTitleL(this.eraId, n), t: 0, dur: 3.2, gold: false };
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
    this.onTraitWaveStart(n);
  }

  protected spawnEnemy(kind: ShipKind, mode: 'ahead' | 'near' | 'ring') {
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
    this.traitOnSpawn(s);
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

  protected countEnemies(): number {
    let n = 0;
    // civilians don't count: a village's fishing boat out working the shallows
    // must never hold up the end of a wave
    for (const s of this.ships) if (s.team === 1 && s.sinking < 0 && !s.captured && !s.peaceful) n++;
    return n;
  }

  protected findBoss(): Ship | null {
    for (const s of this.ships) if (s.isBoss && s.sinking < 0 && !s.captured) return s;
    return null;
  }

  /** Let the band respond to the state of the fight. */
  protected updateMusicMode() {
    if (this.screen !== 'playing' || this.playerDeadTimer >= 0) return;
    const hpFrac = this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 1;
    let mode: MusicMode = this.countEnemies() > 0 ? 1 : 0;
    if (hpFrac < 0.35) mode = 2;
    if (mode !== this.musicMode) {
      this.musicMode = mode;
      this.sfx.setMode(mode);
    }
  }

  protected updateWave(dt: number, rdt: number) {
    if (this.playerDeadTimer >= 0) return;
    const alive = this.countEnemies();
    if (this.waveQueue.length > 0) {
      this.spawnTimer -= dt;
      const cap = Math.max(1, Math.min(10, 3 + Math.floor(this.wave * 0.7)) + this.diff.spawnCap);
      if ((this.spawnTimer <= 0 && alive < cap) || alive === 0) {
        const kind = this.waveQueue.shift()!;
        const mode = this.wave === 1 ? (SHIP_DEFS[kind].trader ? 'near' : 'ring') : alive === 0 ? 'near' : 'ring';
        this.spawnEnemy(kind, mode);
        this.spawnTimer = (this.wave === 1 ? 2.8 : rand(1.5, 2.8)) * this.diff.spawnPace;
      }
    } else if (alive === 0 && !this.waveClearing) {
      this.waveClearing = true;
      this.clearTimer = 0;
      const flawless = this.waveDamage <= 0.5;
      const bonus = Math.round(250 * this.wave * (flawless ? 1.5 : 1) * this.diff.plunder * this.traitWaveBonusMult());
      this.onTraitWaveClear();
      this.score += bonus;
      this.scorePulse = 1;
      this.banner = {
        title: i18n.t('hud:banner.cleared'),
        sub: flawless ? i18n.t('hud:banner.flawless', { bonus: fmt(bonus) }) : i18n.t('hud:banner.bounty', { bonus: fmt(bonus) }),
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

  protected openUpgrade() {
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
      this.addText(p.x, p.y - 44, i18n.t('hud:engine.upgraded'), '#9fe7ff', 22);

      if (this.campaignActive) {
        this.campaignWavesClearedInEra++;
        if (this.campaignWavesClearedInEra >= this.campaignWavesPerEra) {
          if (this.campaignIndex + 1 >= this.campaignEras.length) {
            this.banner = {
              title: i18n.t('hud:banner.campaignDone'),
              sub: i18n.t('hud:banner.conqueredAll', { len: this.campaignEras.length, gold: fmt(this.score) }),
              t: 0,
              dur: 4,
              gold: true,
            };
            window.setTimeout(() => this.gameOver(), 1800);
            return;
          } else {
            this.advanceToNextCampaignEra();
            return;
          }
        }
      }

      this.startWave(this.wave + 1);
      return;
    }
    this.cb.onScreen('upgrade');
    this.cb.onUpgrade(offers, this.wave);
  }

  protected gameOver() {
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
      difficulty: this.difficulty,
    };
    this.cb.onScreen('gameover');
    this.cb.onGameOver(st);
  }

  // ================================================================ loop
  protected loop = (now: number) => {
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

  protected perf(rdt: number) {
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

  protected update(dt: number, rdt: number) {
    this.time += dt;
    const playing = this.screen === 'playing';
    if (playing && this.playerDeadTimer < 0) this.stats.time += dt;
    this.updateWind(dt);
    if (this.grapeCd > 0) this.grapeCd = Math.max(0, this.grapeCd - dt);
    if (this.nativeCallTimer > 0) this.nativeCallTimer -= rdt;
    if (playing) this.updatePlayerInput(dt);
    this.updateShips(dt);
    if (playing) this.updateBurning(dt);
    if (playing) {
      this.updateNatives(dt);
      this.updateSettlements(dt);
      this.updateForts(dt);
      this.updateSwivel(dt);
      this.updateChasers(dt);
      this.updateBoarding();
      this.updateSupplies(dt);
      this.updateTraits(dt);
    }
    this.updateVolleys(dt);
    this.updateBalls(dt);
    if (playing) this.updateSlicks(dt);
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
          this.addText(this.player.x, this.player.y - 50, i18n.t('hud:engine.streakEnded'), '#d8c9a3', 16);
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

  protected updateWind(dt: number) {
    this.windTimer -= dt;
    if (this.windTimer <= 0) {
      this.windTimer = rand(20, 32);
      this.windTarget = this.windAngle + rand(-1.2, 1.2);
    }
    // the monsoon seas hold their wind to the calendar
    const forced = this.traitWind();
    if (forced !== null) this.windTarget = forced;
    const d = angDiff(this.windAngle, this.windTarget);
    this.windAngle += d * Math.min(1, dt * 0.25);
    this.windX = Math.cos(this.windAngle);
    this.windY = Math.sin(this.windAngle);
  }
}
