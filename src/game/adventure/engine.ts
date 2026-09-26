// The Adventure mode engine: a self-contained voyage of hunts and duels on the
// shared chart (see ../chart/world.ts — the very same map Trade sails).
//
// Where Trade counts gold, Adventure counts renown. The chart is studded with
// fixed lairs: sea beasts and named rivals who sleep until you sail too close,
// then hunt you across their home water. Salvage from prizes pays for refits in
// port, the harbourmaster's bounty board points you at the next name, and the
// voyage ends when the last of them is on the floor of the sea — or you are.
//
// Like the Trade engine it owns its own requestAnimationFrame loop, canvas and
// input, so the arcade combat engine is untouched.

import { Input } from '../input';
import { angDiff, TAU, clamp } from '../math';
import { WORLD_W, WORLD_H, DEG, isLand, nudgeToSea } from '../chart/world';
import { PORTS_PROJ, PORT_BY_ID, REGIONS, type RegionId } from '../chart/ports';
import { VoyageAudio } from '../chart/audio';
import { drawWorld } from './render';
import {
  FOES,
  FOE_BY_ID,
  LEASH_RANGE,
  WAKE_RANGE,
  contractOffer,
  liveFoes,
  nearestFoe,
  rankFor,
  refitCost,
  repairCost,
  type Contract,
  type FoeDef,
  type RefitId,
} from './beasts';

export type AdventurePhase = 'sailing' | 'docked' | 'paused' | 'over' | 'victory';

interface ShipState {
  x: number;
  y: number;
  angle: number;
  sail: number; // 0..1
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  cannons: number;
  damage: number;
  range: number;
  reload: number; // base sec
  reloadL: number;
  reloadR: number;
  speed: number; // max speed units/s
  turn: number; // rad/s
  hitFlash: number;
}

interface FoeState extends ShipState {
  def: FoeDef;
  lairX: number;
  lairY: number;
  awake: boolean;
  /** Beast bite / rival ram cooldown. */
  bite: number;
  goingHome: boolean;
  wander: number;
}

interface Raider extends ShipState {
  wander: number;
  hunting: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface LogMsg {
  text: string;
  t: number;
  kind: 'info' | 'fight' | 'good' | 'port';
}

export interface TargetInfo {
  id: string;
  name: string;
  title: string;
  kind: 'beast' | 'rival';
  hp: number;
  maxHp: number;
  distance: number;
  tier: number;
  awake: boolean;
}

export interface AdventureHud {
  renown: number;
  rank: string;
  salvage: number;
  day: number;
  hp: number;
  maxHp: number;
  sail: number;
  speed: number;
  phase: AdventurePhase;
  activePort: string | null;
  nearestPort: { id: string; name: string; region: RegionId } | null;
  canDock: boolean;
  threats: number;
  target: TargetInfo | null;
  contract: { foeId: string; name: string; renown: number; salvage: number } | null;
  felled: number;
  total: number;
  refits: Record<RefitId, number>;
  messages: LogMsg[];
  stats: { days: number; felled: number; raiders: number; ports: number; renown: number };
}

export interface AdventureCallbacks {
  onPhase?: (phase: AdventurePhase) => void;
  onMessage?: (m: LogMsg) => void;
}

const DOCK_RADIUS = 32;
const HUNT_RANGE = 320;
const FIRE_RANGE = 88;
const GIVE_UP = 640;
const FIRE_ARC = 0.72;
const MAX_RAIDERS = 4;
const DAY_DIST = 200;
const MELEE_RANGE = 34;
const START_PORT = 'portroyal';

const SAVE_KEY = 'broadside.adventure.v1';

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export class AdventureEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input = new Input();
  audio = new VoyageAudio();
  cb: AdventureCallbacks;

  player!: ShipState;
  foes: FoeState[] = [];
  raiders: Raider[] = [];
  projectiles: Projectile[] = [];
  messages: LogMsg[] = [];

  phase: AdventurePhase = 'sailing';
  activePortId: string | null = null;
  renown = 0;
  salvage = 300;
  refits: Record<RefitId, number> = { guns: 0, hull: 0, gunners: 0, copper: 0 };
  contract: Contract | null = null;
  defeated = new Set<string>();

  private dayAccum = 0;
  private spawnTimer = 24;
  private stats = { days: 1, felled: 0, raiders: 0, ports: new Set<string>() };
  private last = 0;
  private raf = 0;
  private dpr = 1;
  private over = false;
  view = { scale: 1, ox: 0, oy: 0 };

  constructor(canvas: HTMLCanvasElement, cb: AdventureCallbacks = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unsupported');
    this.ctx = ctx;
    this.cb = cb;
    if (!this.load()) this.freshVoyage();
    this.input.enabled = true;
    this.input.attach();
    this.resize();
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('resize', this.resize);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  // ----------------------------------------------------------------- lifecycle
  freshVoyage() {
    this.foes = FOES.map((def) => this.makeFoe(def));
    const start = PORT_BY_ID[START_PORT];
    const [x, y] = nudgeToSea(start.x, start.y + DEG * 2);
    this.player = {
      x, y, angle: -Math.PI / 2, sail: 0, vx: 0, vy: 0,
      hp: 140, maxHp: 140, cannons: 3, damage: 6, range: 86, reload: 1.0,
      reloadL: 0, reloadR: 0, speed: 48, turn: 2.6, hitFlash: 0,
    };
    this.renown = 0;
    this.salvage = 300;
    this.refits = { guns: 0, hull: 0, gunners: 0, copper: 0 };
    this.defeated = new Set();
    this.contract = null;
    this.raiders = [];
    this.projectiles = [];
    this.dayAccum = 0;
    this.spawnTimer = 26;
    this.stats = { days: 1, felled: 0, raiders: 0, ports: new Set() };
    this.activePortId = null;
    this.phase = 'sailing';
    this.over = false;
    this.pushMessage('You weigh anchor at Port Royal with a hold full of shot and no reputation at all.', 'good');
    this.pushMessage('Ten names are on the chart. Ten lairs. Sail close and they will wake.', 'info');
  }

  private makeFoe(def: FoeDef): FoeState {
    return {
      x: def.x, y: def.y, angle: rand(0, TAU), sail: 1, vx: 0, vy: 0,
      hp: def.hp, maxHp: def.hp,
      cannons: def.kind === 'rival' ? 2 + def.tier : 1,
      damage: def.damage, range: def.range, reload: def.reload,
      reloadL: 0, reloadR: 0, speed: def.speed, turn: def.turn, hitFlash: 0,
      def, lairX: def.x, lairY: def.y,
      awake: false, bite: 0, goingHome: false, wander: 0,
    };
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.input.detach();
    this.input.enabled = false;
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('resize', this.resize);
    this.audio.setEnabled(false);
  }

  setAudio(sfx: boolean) {
    this.audio.setEnabled(sfx);
  }
  unlockAudio() {
    this.audio.unlock();
  }

  // ----------------------------------------------------------------- input
  private onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.code === 'KeyP' || e.code === 'Escape') {
      e.preventDefault();
      this.togglePause();
    }
  };

  togglePause() {
    if (this.phase === 'over' || this.phase === 'victory') return;
    if (this.phase === 'paused') {
      this.phase = this.activePortId ? 'docked' : 'sailing';
    } else {
      this.phase = 'paused';
    }
    this.cb.onPhase?.(this.phase);
  }

  // ----------------------------------------------------------------- loop
  private loop = (now: number) => {
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    if (this.phase === 'sailing' || this.phase === 'docked') this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const t = performance.now();
    this.messages = this.messages.filter((m) => t - m.t < 6500);
    this.player.reloadL = Math.max(0, this.player.reloadL - dt);
    this.player.reloadR = Math.max(0, this.player.reloadR - dt);
    this.player.hitFlash = Math.max(0, this.player.hitFlash - dt * 3);
    for (const s of [...this.foes, ...this.raiders]) {
      s.reloadL = Math.max(0, s.reloadL - dt);
      s.reloadR = Math.max(0, s.reloadR - dt);
      s.hitFlash = Math.max(0, s.hitFlash - dt * 3);
    }
    for (const pr of this.projectiles) {
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;
    }
    this.projectiles = this.projectiles.filter((p) => p.life > 0);

    if (this.phase === 'docked') {
      // the chart keeps breathing while you are ashore — but nothing hunts you
      this.driftFoes(dt);
      this.advanceTime(dt);
      return;
    }

    if (this.input.boardQueued) {
      this.input.boardQueued = false;
      if (this.tryDockIfNear()) {
        this.driftFoes(dt);
        this.advanceTime(dt);
        return;
      }
    }
    this.updatePlayer(dt);
    this.updateFoes(dt);
    this.updateRaiders(dt);
    this.advanceTime(dt);
    this.checkEnd();
  }

  private advanceTime(dt: number) {
    const sp = Math.hypot(this.player.vx, this.player.vy);
    this.dayAccum += sp * dt;
    if (this.dayAccum >= DAY_DIST) {
      this.dayAccum -= DAY_DIST;
      this.stats.days += 1;
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    if (this.input.left) p.angle -= p.turn * dt;
    if (this.input.right) p.angle += p.turn * dt;
    if (this.input.up) p.sail = Math.min(1, p.sail + dt * 0.9);
    if (this.input.downKey) p.sail = Math.max(0, p.sail - dt * 1.1);
    const targetVx = Math.cos(p.angle) * p.speed * p.sail;
    const targetVy = Math.sin(p.angle) * p.speed * p.sail;
    p.vx += (targetVx - p.vx) * Math.min(1, dt * 3);
    p.vy += (targetVy - p.vy) * Math.min(1, dt * 3);
    const nx = p.x + p.vx * dt;
    const ny = p.y + p.vy * dt;
    this.moveWithLand(p, nx, ny);
    p.x = clamp(p.x, 4, WORLD_W - 4);
    p.y = clamp(p.y, 4, WORLD_H - 4);

    if (this.input.portQueued) this.firePlayer('port');
    if (this.input.starQueued) this.firePlayer('star');
    if (this.input.smartQueued) {
      this.firePlayer('port');
      this.firePlayer('star');
    }
    this.input.consume();
  }

  /** Slide along a coastline rather than sailing through it. */
  private moveWithLand(s: ShipState, nx: number, ny: number) {
    if (!isLand(nx, ny)) {
      s.x = nx;
      s.y = ny;
      return;
    }
    if (!isLand(s.x, ny)) {
      s.y = ny;
      return;
    }
    if (!isLand(nx, s.y)) {
      s.x = nx;
      return;
    }
    s.vx = 0;
    s.vy = 0;
  }

  // ----------------------------------------------------------------- the lairs
  private updateFoes(dt: number) {
    const p = this.player;
    for (const f of this.foes) {
      const dx = p.x - f.x;
      const dy = p.y - f.y;
      const dist = Math.hypot(dx, dy);
      const lairDist = Math.hypot(f.lairX - f.x, f.lairY - f.y);

      // waking and sleeping
      if (!f.awake && dist < WAKE_RANGE) {
        f.awake = true;
        f.goingHome = false;
        if (f.def.kind === 'beast') this.audio.roar();
        else this.audio.stinger();
        this.pushMessage(`${f.def.name} — ${f.def.title}. ${f.def.tale}`, 'fight');
      }
      if (f.awake && !f.goingHome && (dist > GIVE_UP || lairDist > LEASH_RANGE)) {
        f.goingHome = true;
      }
      if (f.goingHome && lairDist < 26) {
        f.goingHome = false;
        f.awake = false;
        f.vx = 0;
        f.vy = 0;
      }

      if (!f.awake) {
        // sleeping or home: heal slowly and idle near the lair (a finished
        // foe is never healed back to life — the prize sweep takes it first)
        if (f.hp > 0) f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.05 * dt);
        f.bite = Math.max(0, f.bite - dt);
        continue;
      }

      let desired: number;
      if (f.goingHome) {
        desired = Math.atan2(f.lairY - f.y, f.lairX - f.x);
      } else if (dist > 6) {
        const lead = 0.3;
        desired = Math.atan2(p.y + p.vy * lead - f.y, p.x + p.vx * lead - f.x);
      } else {
        desired = f.angle;
      }
      f.angle += clamp(angDiff(f.angle, desired), -f.turn * dt, f.turn * dt);
      const chase = !f.goingHome && dist < HUNT_RANGE;
      const sp = f.speed * (chase ? 1 : 0.55);
      f.vx += (Math.cos(f.angle) * sp - f.vx) * Math.min(1, dt * 2.5);
      f.vy += (Math.sin(f.angle) * sp - f.vy) * Math.min(1, dt * 2.5);
      const nx = f.x + f.vx * dt;
      const ny = f.y + f.vy * dt;
      this.moveWithLand(f, nx, ny);
      f.x = clamp(f.x, 6, WORLD_W - 6);
      f.y = clamp(f.y, 6, WORLD_H - 6);

      f.bite = Math.max(0, f.bite - dt);
      if (!f.goingHome) {
        // beasts bite at knife range; rivals stand off and throw shot
        if (dist < f.def.range && (f.reloadL <= 0 || f.reloadR <= 0)) {
          this.fireAt(f, p, f.reloadL <= 0 ? 'port' : 'star');
        }
        if (f.def.kind === 'beast' && dist < MELEE_RANGE && f.bite <= 0) {
          f.bite = 2.2;
          p.hp -= f.def.damage * 0.8;
          p.hitFlash = 1;
          this.audio.crunch();
          this.pushMessage(`${f.def.name} takes the hull in its teeth!`, 'fight');
        }
      }
    }

    // prizes taken
    for (let i = this.foes.length - 1; i >= 0; i--) {
      const f = this.foes[i];
      if (f.hp > 0) continue;
      this.foes.splice(i, 1);
      this.defeated.add(f.def.id);
      this.stats.felled += 1;
      let bonus = '';
      if (this.contract?.foeId === f.def.id) {
        this.renown += this.contract.renown;
        this.salvage += this.contract.salvage;
        bonus = ` The bounty is paid: +${this.contract.renown} renown, +${this.contract.salvage} salvage.`;
        this.contract = null;
      }
      this.renown += f.def.renown;
      this.salvage += f.def.salvage;
      this.audio.renown();
      this.pushMessage(`${f.def.name} is finished! +${f.def.renown} renown, +${f.def.salvage} salvage.${bonus}`, 'good');
      this.save();
    }
  }

  /** Foes idle (and heal) while the player is ashore. */
  private driftFoes(dt: number) {
    for (const f of this.foes) {
      if (f.awake) {
        const lairDist = Math.hypot(f.lairX - f.x, f.lairY - f.y);
        if (lairDist > 26) {
          const desired = Math.atan2(f.lairY - f.y, f.lairX - f.x);
          f.angle += clamp(angDiff(f.angle, desired), -f.turn * dt, f.turn * dt);
          const sp = f.speed * 0.5;
          f.vx += (Math.cos(f.angle) * sp - f.vx) * Math.min(1, dt * 2.5);
          f.vy += (Math.sin(f.angle) * sp - f.vy) * Math.min(1, dt * 2.5);
          const nx = f.x + f.vx * dt;
          const ny = f.y + f.vy * dt;
          this.moveWithLand(f, nx, ny);
        } else {
          f.awake = false;
          f.goingHome = false;
        }
      }
      if (!f.awake && f.hp > 0) f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.08 * dt);
    }
  }

  // ----------------------------------------------------------------- raiders
  private spawnRaider() {
    const p = this.player;
    let x = 0, y = 0, ok = false;
    for (let i = 0; i < 40 && !ok; i++) {
      const a = rand(0, TAU);
      const d = rand(300, 580);
      x = clamp(p.x + Math.cos(a) * d, 6, WORLD_W - 6);
      y = clamp(p.y + Math.sin(a) * d, 6, WORLD_H - 6);
      ok = !isLand(x, y);
    }
    if (!ok) return;
    // the more famous you are, the better the company you keep
    const hard = Math.min(1, this.renown / 900);
    this.raiders.push({
      x, y, angle: rand(0, TAU), sail: 1, vx: 0, vy: 0,
      hp: Math.round(70 + hard * 60), maxHp: Math.round(70 + hard * 60),
      cannons: 2, damage: 5 + hard * 3, range: 70, reload: 1.7 - hard * 0.4,
      reloadL: 0, reloadR: 0, speed: 42 + hard * 6, turn: 2.0,
      hitFlash: 0, wander: 0, hunting: true,
    });
  }

  private updateRaiders(dt: number) {
    const p = this.player;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.raiders.length < MAX_RAIDERS) {
      this.spawnRaider();
      this.spawnTimer = rand(20, 38);
    }
    for (const e of this.raiders) {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist < HUNT_RANGE && dist > 6) {
        e.hunting = true;
      } else {
        e.hunting = false;
        e.wander -= dt;
        if (e.wander <= 0) {
          e.wander = rand(2, 5);
          e.angle += rand(-1, 1);
        }
      }
      if (e.hunting) {
        const desired = Math.atan2(p.y - e.y, p.x - e.x);
        e.angle += clamp(angDiff(e.angle, desired), -e.turn * dt, e.turn * dt);
      }
      const sp = e.speed * (e.hunting ? 1 : 0.5);
      e.vx += (Math.cos(e.angle) * sp - e.vx) * Math.min(1, dt * 2.5);
      e.vy += (Math.sin(e.angle) * sp - e.vy) * Math.min(1, dt * 2.5);
      const nx = e.x + e.vx * dt;
      const ny = e.y + e.vy * dt;
      this.moveWithLand(e, nx, ny);
      e.x = clamp(e.x, 6, WORLD_W - 6);
      e.y = clamp(e.y, 6, WORLD_H - 6);
      if (e.hunting && dist < FIRE_RANGE && (e.reloadL <= 0 || e.reloadR <= 0)) {
        this.fireAt(e, p, e.reloadL <= 0 ? 'port' : 'star');
      }
    }
    for (let i = this.raiders.length - 1; i >= 0; i--) {
      if (this.raiders[i].hp > 0) continue;
      this.raiders.splice(i, 1);
      this.stats.raiders += 1;
      const loot = Math.round(rand(45, 110));
      const fame = 8;
      this.salvage += loot;
      this.renown += fame;
      this.audio.coin();
      this.pushMessage(`A raider strikes her colours — ${loot} salvage, +${fame} renown.`, 'good');
    }
  }

  // ----------------------------------------------------------------- firing
  private fireAt(src: ShipState, tgt: ShipState, side: 'port' | 'star'): boolean {
    const bearing = src.angle + (side === 'port' ? -Math.PI / 2 : Math.PI / 2);
    const toT = Math.atan2(tgt.y - src.y, tgt.x - src.x);
    const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);
    if (dist > src.range) return false;
    if (Math.abs(angDiff(bearing, toT)) > FIRE_ARC) return false;
    const dmg = src.cannons * src.damage * (1 - dist / src.range) * rand(0.85, 1.15);
    tgt.hp -= dmg;
    tgt.hitFlash = 1;
    const mx = src.x + Math.cos(bearing) * 8;
    const my = src.y + Math.sin(bearing) * 8;
    const sp = 320;
    this.projectiles.push({
      x: mx, y: my,
      vx: Math.cos(toT) * sp, vy: Math.sin(toT) * sp,
      life: 0.45, color: src === this.player ? '#9ff5d2' : '#ff8a6a',
    });
    if (src === this.player) this.audio.cannon();
    else this.audio.hit();
    if (side === 'port') src.reloadL = src.reload;
    else src.reloadR = src.reload;
    return true;
  }

  private firePlayer(side: 'port' | 'star') {
    const p = this.player;
    if (side === 'port' && p.reloadL > 0) return;
    if (side === 'star' && p.reloadR > 0) return;
    let fired = false;
    for (const f of this.foes) if (f.awake && this.fireAt(p, f, side)) fired = true;
    for (const r of this.raiders) if (this.fireAt(p, r, side)) fired = true;
    if (!fired) {
      // nothing in the arc: powder and smoke, and the battery still has to load
      const bearing = p.angle + (side === 'port' ? -Math.PI / 2 : Math.PI / 2);
      this.projectiles.push({
        x: p.x + Math.cos(bearing) * 8, y: p.y + Math.sin(bearing) * 8,
        vx: Math.cos(bearing) * 280, vy: Math.sin(bearing) * 280, life: 0.3, color: '#9ff5d2',
      });
      this.audio.cannon();
    }
    // whether it told or not, the guns are busy for a moment
    if (side === 'port') p.reloadL = p.reload;
    else p.reloadR = p.reload;
  }

  // ----------------------------------------------------------------- docking
  private nearestPortDist(): { port: (typeof PORTS_PROJ)[number]; d: number } | null {
    let best: (typeof PORTS_PROJ)[number] | null = null;
    let bestD = Infinity;
    for (const port of PORTS_PROJ) {
      const d = Math.hypot(port.x - this.player.x, port.y - this.player.y);
      if (d < bestD) {
        bestD = d;
        best = port;
      }
    }
    return best ? { port: best, d: bestD } : null;
  }

  private tryDockIfNear(): boolean {
    const near = this.nearestPortDist();
    const sp = Math.hypot(this.player.vx, this.player.vy);
    if (near && near.d < DOCK_RADIUS && sp < 12) {
      this.dock(near.port.id);
      return true;
    }
    return false;
  }

  dock(portId: string) {
    const port = PORT_BY_ID[portId];
    if (!port) return;
    this.activePortId = portId;
    this.phase = 'docked';
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.sail = 0;
    this.stats.ports.add(portId);
    this.pushMessage(`Anchor down at ${port.name}. The tavern has a bounty board.`, 'port');
    this.audio.dock();
    this.cb.onPhase?.(this.phase);
    this.save();
  }

  undock() {
    this.activePortId = null;
    this.phase = 'sailing';
    const [x, y] = nudgeToSea(this.player.x, this.player.y - DEG * 3);
    this.player.x = x;
    this.player.y = y;
    this.cb.onPhase?.(this.phase);
    this.save();
  }

  // ----------------------------------------------------------------- the port
  repairCost(): number {
    return repairCost(this.player.maxHp - this.player.hp);
  }

  repair() {
    if (this.phase !== 'docked') return;
    const cost = this.repairCost();
    if (cost <= 0 || this.salvage < cost) return;
    this.salvage -= cost;
    this.player.hp = this.player.maxHp;
    this.audio.coin();
    this.pushMessage(`Shipwrights caulk the hull for ${cost} salvage.`, 'good');
    this.save();
  }

  refitCost(id: RefitId): number | null {
    return refitCost(id, this.refits[id] ?? 0);
  }

  buyRefit(id: RefitId): boolean {
    if (this.phase !== 'docked') return false;
    const cost = this.refitCost(id);
    if (cost == null || this.salvage < cost) return false;
    this.salvage -= cost;
    this.refits[id] = (this.refits[id] ?? 0) + 1;
    const p = this.player;
    if (id === 'guns') p.damage += 1;
    else if (id === 'hull') {
      p.maxHp += 25;
      p.hp += 25;
    } else if (id === 'gunners') p.reload = Math.max(0.45, p.reload - 0.12);
    else if (id === 'copper') p.speed += 4;
    this.audio.coin();
    this.pushMessage(`Refit taken at the yard.`, 'good');
    this.save();
    return true;
  }

  /** What the bounty board is offering here and now — nothing, if you already
   * sail under a contract. */
  offerContract(): Contract | null {
    if (this.contract) return null;
    return contractOffer(this.activePortId, this.defeated, { x: this.player.x, y: this.player.y });
  }

  takeContract() {
    if (this.phase !== 'docked') return;
    const offer = this.offerContract();
    if (!offer) return;
    this.contract = offer;
    const foe = FOE_BY_ID[offer.foeId];
    if (foe) this.pushMessage(`Contract signed: ${foe.name}. ${offer.renown} renown on delivery.`, 'port');
    this.audio.dock();
    this.save();
  }

  abandonContract() {
    if (!this.contract) return;
    this.pushMessage('You tear up the contract. No bounty for that one.', 'info');
    this.contract = null;
    this.save();
  }

  // ----------------------------------------------------------------- end state
  private checkEnd() {
    if (this.player.hp <= 0 && !this.over) {
      this.over = true;
      this.phase = 'over';
      this.pushMessage('The sea takes your ship, and the chart keeps its secrets.', 'fight');
      this.cb.onPhase?.(this.phase);
      this.clearSave();
      return;
    }
    if (this.foes.length === 0 && !this.over) {
      this.over = true;
      this.phase = 'victory';
      this.pushMessage('Every name on the chart has been crossed out. The chart is yours.', 'good');
      this.audio.fanfare();
      this.cb.onPhase?.(this.phase);
      this.clearSave();
    }
  }

  pushMessage(text: string, kind: LogMsg['kind'] = 'info') {
    const m: LogMsg = { text, t: performance.now(), kind };
    this.messages.push(m);
    if (this.messages.length > 20) this.messages.shift();
    this.cb.onMessage?.(m);
  }

  // ----------------------------------------------------------------- snapshot
  private currentTarget(): TargetInfo | null {
    let best: FoeState | null = null;
    let bestD = Infinity;
    for (const f of this.foes) {
      if (!f.awake) continue;
      const d = Math.hypot(f.x - this.player.x, f.y - this.player.y);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }
    if (!best) return null;
    return {
      id: best.def.id,
      name: best.def.name,
      title: best.def.title,
      kind: best.def.kind,
      hp: Math.max(0, Math.round(best.hp)),
      maxHp: best.maxHp,
      distance: Math.round(bestD),
      tier: best.def.tier,
      awake: true,
    };
  }

  getHud(): AdventureHud {
    const near = this.nearestPortDist();
    const sp = Math.hypot(this.player.vx, this.player.vy);
    let threats = 0;
    for (const f of this.foes) {
      if (f.awake && Math.hypot(f.x - this.player.x, f.y - this.player.y) < HUNT_RANGE) threats++;
    }
    for (const r of this.raiders) {
      if (Math.hypot(r.x - this.player.x, r.y - this.player.y) < HUNT_RANGE) threats++;
    }
    const contract = this.contract
      ? (() => {
          const foe = FOE_BY_ID[this.contract!.foeId];
          return foe
            ? {
                foeId: foe.id,
                name: foe.name,
                renown: this.contract!.renown,
                salvage: this.contract!.salvage,
              }
            : null;
        })()
      : null;
    return {
      renown: Math.round(this.renown),
      rank: rankFor(this.renown),
      salvage: Math.round(this.salvage),
      day: this.stats.days,
      hp: Math.max(0, Math.round(this.player.hp)),
      maxHp: this.player.maxHp,
      sail: this.player.sail,
      speed: sp,
      phase: this.phase,
      activePort: this.activePortId,
      nearestPort: near ? { id: near.port.id, name: near.port.name, region: near.port.region } : null,
      canDock: !!near && near.d < DOCK_RADIUS && sp < 12,
      threats,
      target: this.currentTarget(),
      contract,
      felled: this.stats.felled,
      total: FOES.length,
      refits: { ...this.refits },
      messages: this.messages.slice(-5),
      stats: {
        days: this.stats.days,
        felled: this.stats.felled,
        raiders: this.stats.raiders,
        ports: this.stats.ports.size,
        renown: Math.round(this.renown),
      },
    };
  }

  /** Everything the port panel needs, computed for the UI. */
  getPort() {
    const portId = this.activePortId;
    const port = portId ? PORT_BY_ID[portId] : null;
    if (!port) return null;
    const offer = this.offerContract();
    const offerFoe = offer ? FOE_BY_ID[offer.foeId] : undefined;
    return {
      port,
      region: REGIONS[port.region],
      repair: this.repairCost(),
      refits: (['guns', 'hull', 'gunners', 'copper'] as RefitId[]).map((id) => ({
        id,
        level: this.refits[id] ?? 0,
        cost: this.refitCost(id),
      })),
      offer: offer && offerFoe ? { ...offer, name: offerFoe.name, title: offerFoe.title, tier: offerFoe.tier } : null,
      activeContract: this.contract ? FOE_BY_ID[this.contract.foeId] ?? null : null,
      remaining: liveFoes(this.defeated).length,
    };
  }

  /** Nearest living lair to a point — used by the chart to draw the hunt. */
  nearestLair(x: number, y: number) {
    return nearestFoe(x, y, liveFoes(this.defeated));
  }

  // ----------------------------------------------------------------- persist
  save() {
    try {
      const data = {
        renown: this.renown,
        salvage: this.salvage,
        refits: this.refits,
        contract: this.contract,
        defeated: [...this.defeated],
        day: this.stats.days,
        felled: this.stats.felled,
        raiders: this.stats.raiders,
        ports: [...this.stats.ports],
        x: this.player.x,
        y: this.player.y,
        angle: this.player.angle,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        damage: this.player.damage,
        reload: this.player.reload,
        speed: this.player.speed,
      };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }

  private load(): boolean {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (typeof d.renown !== 'number') return false;
      this.renown = d.renown;
      this.salvage = d.salvage ?? 300;
      this.refits = { guns: 0, hull: 0, gunners: 0, copper: 0, ...(d.refits ?? {}) };
      this.defeated = new Set<string>(d.defeated ?? []);
      this.contract = (d.contract ?? null) as Contract | null;
      this.stats = {
        days: d.day ?? 1,
        felled: d.felled ?? 0,
        raiders: d.raiders ?? 0,
        ports: new Set<string>(d.ports ?? []),
      };
      this.player = {
        x: d.x ?? WORLD_W / 2, y: d.y ?? WORLD_H / 2, angle: d.angle ?? -Math.PI / 2,
        sail: 0, vx: 0, vy: 0,
        hp: d.hp ?? 140, maxHp: d.maxHp ?? 140, cannons: 3,
        damage: d.damage ?? 6, range: 86, reload: d.reload ?? 1.0,
        reloadL: 0, reloadR: 0, speed: d.speed ?? 48, turn: 2.6, hitFlash: 0,
      };
      this.foes = FOES.filter((f) => !this.defeated.has(f.id)).map((def) => this.makeFoe(def));
      if (this.foes.length === 0) return false; // a finished chart is not a save
      this.pushMessage('The chart remembers you, Captain. Your hunt continues.', 'info');
      return true;
    } catch {
      return false;
    }
  }

  private clearSave() {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }

  resetVoyage() {
    this.clearSave();
    this.freshVoyage();
    this.cb.onPhase?.(this.phase);
  }

  // ----------------------------------------------------------------- render
  private resize = () => {
    const c = this.canvas;
    const w = c.clientWidth || window.innerWidth;
    const h = c.clientHeight || window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(w * this.dpr);
    c.height = Math.round(h * this.dpr);
    const scale = Math.min(w / WORLD_W, h / WORLD_H);
    this.view.scale = scale;
    this.view.ox = (w - WORLD_W * scale) / 2;
    this.view.oy = (h - WORLD_H * scale) / 2;
  };

  render() {
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    drawWorld(this.ctx, this, w, h, this.dpr);
  }

  get worldW() {
    return WORLD_W;
  }
  get worldH() {
    return WORLD_H;
  }
}
