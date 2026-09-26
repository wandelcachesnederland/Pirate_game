// The Trade mode engine: a self-contained sailing-trade simulation on the
// shared chart (see ../chart/world.ts — Adventure sails the same map). The
// player steers a ship around the whole globe, buys low and sells high
// at real ports, and fights pirates that roam the sea lanes. It owns its own
// requestAnimationFrame loop, canvas rendering hook, and input — it is entirely
// independent of the arcade combat engine so the rest of the game is untouched.

import { Input } from '../input';
import { angDiff, TAU, clamp } from '../math';
import {
  WORLD_W,
  WORLD_H,
  DEG,
  isLand,
  nudgeToSea,
} from '../chart/world';
import {
  GOODS,
  GOOD_BY_ID,
  type GoodId,
  stepMarket,
  buyPrice,
  sellPrice,
  priceFactor,
} from '../chart/goods';
import { PORTS_PROJ, PORT_BY_ID, REGIONS, type RegionId } from '../chart/ports';
import { VoyageAudio } from '../chart/audio';
import { drawWorld } from './render';

export type TradePhase = 'sailing' | 'docked' | 'paused' | 'over' | 'victory';

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
  aiState: 'hunt' | 'wander';
  wander: number; // timer
  hitFlash: number;
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
  kind: 'info' | 'trade' | 'fight' | 'good';
}

export interface TradeHud {
  gold: number;
  day: number;
  holdUsed: number;
  holdCap: number;
  hp: number;
  maxHp: number;
  sail: number;
  speed: number;
  phase: TradePhase;
  activePort: string | null;
  nearestPort: { id: string; name: string; region: RegionId } | null;
  canDock: boolean;
  piratesNear: number;
  goal: number;
  progress: number;
  messages: LogMsg[];
  stats: { days: number; sunk: number; ports: number; gold: number };
}

export interface TradeCallbacks {
  onPhase?: (phase: TradePhase) => void;
  onMessage?: (m: LogMsg) => void;
}

const GOAL_GOLD = 15000;
const DAY_DIST = 200;
const MAX_PIRATES = 6;
const DOCK_RADIUS = 32;
const HUNT_RANGE = 250;
const FIRE_RANGE = 82;
const GIVE_UP = 540;
const FIRE_ARC = 0.72;

const SAVE_KEY = 'broadside.trade.v1';

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export class TradeEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input = new Input();
  audio = new VoyageAudio();
  cb: TradeCallbacks;

  player!: ShipState;
  pirates: ShipState[] = [];
  projectiles: Projectile[] = [];
  messages: LogMsg[] = [];

  phase: TradePhase = 'sailing';
  activePortId: string | null = null;
  gold = 1000;
  day = 1;
  cargo: Record<GoodId, number> = {} as Record<GoodId, number>;
  holdCap = 120;
  prices: Record<string, Record<GoodId, number>> = {};
  market: Record<GoodId, number> = {} as Record<GoodId, number>;

  private dayAccum = 0;
  private spawnTimer = 18;
  private stats = { sunk: 0, ports: new Set<string>() };
  private last = 0;
  private raf = 0;
  private dpr = 1;
  view = { scale: 1, ox: 0, oy: 0 };
  private over = false;

  constructor(canvas: HTMLCanvasElement, cb: TradeCallbacks = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unsupported');
    this.ctx = ctx;
    this.cb = cb;
    for (const g of GOODS) this.cargo[g.id] = 0;
    for (const g of GOODS) this.market[g.id] = rand(0.9, 1.1);
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
    for (const p of PORTS_PROJ) {
      this.prices[p.id] = {} as Record<GoodId, number>;
      for (const g of GOODS) {
        const f = priceFactor(p.produces, p.wants, g.id);
        this.prices[p.id][g.id] = GOOD_BY_ID[g.id].base * f * this.market[g.id];
      }
    }
    const start = PORT_BY_ID['portroyal'];
    const [x, y] = nudgeToSea(start.x, start.y + DEG * 2);
    this.player = {
      x, y, angle: -Math.PI / 2, sail: 0, vx: 0, vy: 0,
      hp: 100, maxHp: 100, cannons: 3, damage: 7, range: 80, reload: 1.0,
      reloadL: 0, reloadR: 0, speed: 46, turn: 2.6,
      aiState: 'wander', wander: 0, hitFlash: 0,
    };
    this.gold = 1000;
    this.day = 1;
    this.holdCap = 120;
    this.pirates = [];
    this.projectiles = [];
    this.dayAccum = 0;
    this.spawnTimer = 20;
    this.stats = { sunk: 0, ports: new Set() };
    this.activePortId = null;
    this.phase = 'sailing';
    this.over = false;
    this.pushMessage('A fresh venture begins at Port Royal. Fair winds, Captain.', 'good');
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
    // age messages
    const t = performance.now();
    this.messages = this.messages.filter((m) => t - m.t < 6000);
    // reloads & flash
    this.player.reloadL = Math.max(0, this.player.reloadL - dt);
    this.player.reloadR = Math.max(0, this.player.reloadR - dt);
    this.player.hitFlash = Math.max(0, this.player.hitFlash - dt * 3);
    for (const p of this.pirates) {
      p.reloadL = Math.max(0, p.reloadL - dt);
      p.reloadR = Math.max(0, p.reloadR - dt);
      p.hitFlash = Math.max(0, p.hitFlash - dt * 3);
    }
    for (const pr of this.projectiles) {
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;
    }
    this.projectiles = this.projectiles.filter((p) => p.life > 0);

    if (this.phase === 'docked') {
      // world keeps breathing: pirates wander, time pass, markets move
      this.updatePirates(dt, true);
      this.advanceTime(dt);
      return;
    }

    // sailing — service the dock key before input is consumed
    if (this.input.boardQueued) {
      this.input.boardQueued = false;
      const justDocked = this.tryDockIfNear();
      if (justDocked) {
        this.updatePirates(dt, true);
        this.advanceTime(dt);
        return;
      }
    }
    this.updatePlayer(dt);
    this.updatePirates(dt, false);
    this.advanceTime(dt);
    this.checkEnd();
  }

  private advanceTime(dt: number) {
    const sp = Math.hypot(this.player.vx, this.player.vy);
    this.dayAccum += sp * dt;
    if (this.dayAccum >= DAY_DIST) {
      this.dayAccum -= DAY_DIST;
      this.day += 1;
      stepMarket(this.market, this.prices, (id) => {
        const p = PORT_BY_ID[id];
        return p ? { produces: p.produces, wants: p.wants } : { produces: [], wants: [] };
      });
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    // steering
    if (this.input.left) p.angle -= p.turn * dt;
    if (this.input.right) p.angle += p.turn * dt;
    // sail trim
    if (this.input.up) p.sail = Math.min(1, p.sail + dt * 0.9);
    if (this.input.downKey) p.sail = Math.max(0, p.sail - dt * 1.1);
    const targetVx = Math.cos(p.angle) * p.speed * p.sail;
    const targetVy = Math.sin(p.angle) * p.speed * p.sail;
    // smooth accel a touch
    p.vx += (targetVx - p.vx) * Math.min(1, dt * 3);
    p.vy += (targetVy - p.vy) * Math.min(1, dt * 3);
    const nx = p.x + p.vx * dt;
    const ny = p.y + p.vy * dt;
    this.moveWithLand(p, nx, ny);
    p.x = clamp(p.x, 4, WORLD_W - 4);
    p.y = clamp(p.y, 4, WORLD_H - 4);

    // firing
    if (this.input.portQueued) this.firePlayer('port');
    if (this.input.starQueued) this.firePlayer('star');
    if (this.input.smartQueued) {
      this.firePlayer('port');
      this.firePlayer('star');
    }
    this.input.consume();
  }

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
    // blocked: kill velocity component into land
    s.vx = 0;
    s.vy = 0;
  }

  // ----------------------------------------------------------------- pirates
  private spawnPirate() {
    const p = this.player;
    let x = 0, y = 0, ok = false;
    for (let i = 0; i < 40 && !ok; i++) {
      const a = rand(0, TAU);
      const d = rand(280, 560);
      x = clamp(p.x + Math.cos(a) * d, 6, WORLD_W - 6);
      y = clamp(p.y + Math.sin(a) * d, 6, WORLD_H - 6);
      ok = !isLand(x, y);
    }
    if (!ok) return;
    this.pirates.push({
      x, y, angle: rand(0, TAU), sail: 1, vx: 0, vy: 0,
      hp: 64, maxHp: 64, cannons: 2, damage: 5, range: 66, reload: 1.6,
      reloadL: 0, reloadR: 0, speed: 41, turn: 2.0,
      aiState: 'hunt', wander: 0, hitFlash: 0,
    });
  }

  private updatePirates(dt: number, passive: boolean) {
    const p = this.player;
    if (!passive) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.pirates.length < MAX_PIRATES) {
        this.spawnPirate();
        this.spawnTimer = rand(22, 40);
      }
    }
    for (const e of this.pirates) {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);
      let desired = e.angle;
      if (!passive && dist < HUNT_RANGE && dist > 6) {
        e.aiState = 'hunt';
        // aim a little ahead of the player
        const lead = 0.3;
        const tx = p.x + p.vx * lead;
        const ty = p.y + p.vy * lead;
        desired = Math.atan2(ty - e.y, tx - e.x);
      } else {
        e.aiState = 'wander';
        e.wander -= dt;
        if (e.wander <= 0) {
          e.wander = rand(2, 5);
          e.angle += rand(-1, 1);
        }
        desired = e.angle;
      }
      // turn toward desired
      const d = angDiff(e.angle, desired);
      e.angle += clamp(d, -e.turn * dt, e.turn * dt);
      const sp = e.aiState === 'hunt' && !passive ? e.speed : e.speed * 0.5;
      const tvx = Math.cos(e.angle) * sp;
      const tvy = Math.sin(e.angle) * sp;
      e.vx += (tvx - e.vx) * Math.min(1, dt * 2.5);
      e.vy += (tvy - e.vy) * Math.min(1, dt * 2.5);
      const nx = e.x + e.vx * dt;
      const ny = e.y + e.vy * dt;
      this.moveWithLand(e, nx, ny);
      e.x = clamp(e.x, 6, WORLD_W - 6);
      e.y = clamp(e.y, 6, WORLD_H - 6);

      // fire at the player
      if (!passive && dist < FIRE_RANGE && (e.reloadL <= 0 || e.reloadR <= 0)) {
        this.fireAt(e, p, e.reloadL <= 0 ? 'port' : 'star');
      }
      if (!passive && dist > GIVE_UP) {
        // give up the chase and wander off
        e.aiState = 'wander';
      }
    }
    // remove dead pirates
    for (let i = this.pirates.length - 1; i >= 0; i--) {
      if (this.pirates[i].hp <= 0) {
        this.pirates.splice(i, 1);
        const loot = Math.round(rand(140, 380));
        this.gold += loot;
        this.stats.sunk += 1;
        this.pushMessage(`Prize taken! The pirate goes down — ${loot} gold in plunder.`, 'good');
        this.audio.coin();
      }
    }
  }

  // ----------------------------------------------------------------- firing
  private fireAt(src: ShipState, tgt: ShipState, side: 'port' | 'star') {
    const bearing = src.angle + (side === 'port' ? -Math.PI / 2 : Math.PI / 2);
    const toT = Math.atan2(tgt.y - src.y, tgt.x - src.x);
    const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);
    if (dist > src.range) return false;
    if (Math.abs(angDiff(bearing, toT)) > FIRE_ARC) return false;
    const dmg = src.cannons * src.damage * (1 - dist / src.range) * rand(0.85, 1.15);
    tgt.hp -= dmg;
    tgt.hitFlash = 1;
    // visual shot
    const mx = src.x + Math.cos(bearing) * 8;
    const my = src.y + Math.sin(bearing) * 8;
    const sp = 320;
    this.projectiles.push({
      x: mx, y: my,
      vx: Math.cos(toT) * sp, vy: Math.sin(toT) * sp,
      life: 0.45, color: src === this.player ? '#ffe08a' : '#ff7a5a',
    });
    if (src === this.player) {
      this.audio.cannon();
    } else {
      this.audio.hit();
    }
    if (side === 'port') src.reloadL = src.reload;
    else src.reloadR = src.reload;
    return true;
  }

  private firePlayer(side: 'port' | 'star') {
    const p = this.player;
    if (side === 'port' && p.reloadL > 0) return;
    if (side === 'star' && p.reloadR > 0) return;
    let fired = false;
    for (const e of this.pirates) {
      if (this.fireAt(p, e, side)) fired = true;
    }
    if (!fired) {
      // dry-fire smoke
      const bearing = p.angle + (side === 'port' ? -Math.PI / 2 : Math.PI / 2);
      this.projectiles.push({
        x: p.x + Math.cos(bearing) * 8, y: p.y + Math.sin(bearing) * 8,
        vx: Math.cos(bearing) * 280, vy: Math.sin(bearing) * 280, life: 0.3, color: '#ffe08a',
      });
      this.audio.cannon();
    }
  }

  // ----------------------------------------------------------------- docking
  private nearestPortDist(): { port: typeof PORTS_PROJ[number]; d: number } | null {
    let best: typeof PORTS_PROJ[number] | null = null;
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
    this.pushMessage(`Dropped anchor at ${port.name}.`, 'info');
    this.audio.dock();
    this.cb.onPhase?.(this.phase);
    this.save();
  }

  undock() {
    this.activePortId = null;
    this.phase = 'sailing';
    // nudge out to sea so we don't start inside the harbour wall
    const [x, y] = nudgeToSea(this.player.x, this.player.y - DEG * 3);
    this.player.x = x;
    this.player.y = y;
    this.cb.onPhase?.(this.phase);
    this.save();
  }

  // ----------------------------------------------------------------- trading
  get holdUsed(): number {
    let n = 0;
    for (const g of GOODS) n += this.cargo[g.id];
    return n;
  }

  buy(good: GoodId, qty: number): boolean {
    if (this.phase !== 'docked' || !this.activePortId) return false;
    const price = buyPrice(this.prices[this.activePortId][good]);
    const space = this.holdCap - this.holdUsed;
    const affordable = Math.floor(this.gold / price);
    const take = Math.max(0, Math.min(qty, space, affordable));
    if (take <= 0) return false;
    const cost = take * price;
    this.gold -= cost;
    this.cargo[good] += take;
    this.audio.coin();
    this.pushMessage(`Bought ${take} ${GOOD_BY_ID[good].name} for ${cost} gold.`, 'trade');
    this.save();
    return true;
  }

  sell(good: GoodId, qty: number): boolean {
    if (this.phase !== 'docked' || !this.activePortId) return false;
    const price = sellPrice(this.prices[this.activePortId][good]);
    const have = this.cargo[good];
    const give = Math.max(0, Math.min(qty, have));
    if (give <= 0) return false;
    const gain = give * price;
    this.gold += gain;
    this.cargo[good] -= give;
    this.audio.coin();
    this.pushMessage(`Sold ${give} ${GOOD_BY_ID[good].name} for ${gain} gold.`, 'trade');
    this.save();
    return true;
  }

  repairCost(): number {
    return Math.ceil((this.player.maxHp - this.player.hp) * 3);
  }
  repair() {
    if (this.phase !== 'docked') return;
    const cost = this.repairCost();
    if (cost <= 0 || this.gold < cost) return;
    this.gold -= cost;
    this.player.hp = this.player.maxHp;
    this.audio.coin();
    this.pushMessage(`Hull caulked and repaired for ${cost} gold.`, 'good');
    this.save();
  }
  holdUpgradeCost(): number {
    return 600 + (this.holdCap - 120) * 3;
  }
  upgradeHold() {
    if (this.phase !== 'docked') return;
    const cost = this.holdUpgradeCost();
    if (this.gold < cost) return;
    this.gold -= cost;
    this.holdCap += 40;
    this.audio.coin();
    this.pushMessage(`Hold expanded to ${this.holdCap} — costs ${cost} gold.`, 'good');
    this.save();
  }
  hullUpgradeCost(): number {
    return 1200 + (this.player.maxHp - 100) * 6;
  }
  upgradeHull() {
    if (this.phase !== 'docked') return;
    const cost = this.hullUpgradeCost();
    if (this.gold < cost) return;
    this.gold -= cost;
    this.player.maxHp += 30;
    this.player.hp += 30;
    this.audio.coin();
    this.pushMessage(`Hull reinforced (+30) for ${cost} gold.`, 'good');
    this.save();
  }

  // ----------------------------------------------------------------- end state
  private checkEnd() {
    if (this.player.hp <= 0 && !this.over) {
      this.over = true;
      this.phase = 'over';
      this.pushMessage('Your ship is sunk. The venture ends here.', 'fight');
      this.cb.onPhase?.(this.phase);
      this.clearSave();
      return;
    }
    if (this.gold >= GOAL_GOLD && !this.over) {
      this.over = true;
      this.phase = 'victory';
      this.pushMessage('A trading empire! You have cornered the markets of the world.', 'good');
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
  getHud(): TradeHud {
    const near = this.nearestPortDist();
    const sp = Math.hypot(this.player.vx, this.player.vy);
    let piratesNear = 0;
    for (const e of this.pirates) {
      if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < HUNT_RANGE) piratesNear++;
    }
    return {
      gold: Math.round(this.gold),
      day: this.day,
      holdUsed: this.holdUsed,
      holdCap: this.holdCap,
      hp: Math.max(0, Math.round(this.player.hp)),
      maxHp: this.player.maxHp,
      sail: this.player.sail,
      speed: sp,
      phase: this.phase,
      activePort: this.activePortId,
      nearestPort: near
        ? { id: near.port.id, name: near.port.name, region: near.port.region }
        : null,
      canDock: !!near && near.d < DOCK_RADIUS && sp < 12,
      piratesNear,
      goal: GOAL_GOLD,
      progress: Math.min(1, this.gold / GOAL_GOLD),
      messages: this.messages.slice(-5),
      stats: {
        days: this.day,
        sunk: this.stats.sunk,
        ports: this.stats.ports.size,
        gold: Math.round(this.gold),
      },
    };
  }

  getMarket(portId: string) {
    const port = PORT_BY_ID[portId];
    if (!port) return null;
    return {
      port,
      region: REGIONS[port.region],
      rows: GOODS.map((g) => {
        const live = this.prices[portId][g.id];
        return {
          good: g,
          buy: buyPrice(live),
          sell: sellPrice(live),
          have: this.cargo[g.id],
          factor: priceFactor(port.produces, port.wants, g.id),
        };
      }),
      repairCost: this.repairCost(),
      holdCost: this.holdUpgradeCost(),
      hullCost: this.hullUpgradeCost(),
    };
  }

  // ----------------------------------------------------------------- persist
  private save() {
    try {
      const data = {
        gold: this.gold,
        day: this.day,
        holdCap: this.holdCap,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        x: this.player.x,
        y: this.player.y,
        angle: this.player.angle,
        cargo: this.cargo,
        market: this.market,
        prices: this.prices,
        ports: [...this.stats.ports],
        sunk: this.stats.sunk,
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
      if (typeof d.gold !== 'number') return false;
      this.gold = d.gold;
      this.day = d.day ?? 1;
      this.holdCap = d.holdCap ?? 120;
      this.market = (d.market ?? {}) as Record<GoodId, number>;
      for (const g of GOODS) if (typeof this.market[g.id] !== 'number') this.market[g.id] = rand(0.9, 1.1);
      this.prices = d.prices ?? {};
      // rebuild any missing port tables
      for (const p of PORTS_PROJ) {
        if (!this.prices[p.id]) {
          this.prices[p.id] = {} as Record<GoodId, number>;
          for (const g of GOODS) {
            const f = priceFactor(p.produces, p.wants, g.id);
            this.prices[p.id][g.id] = GOOD_BY_ID[g.id].base * f * this.market[g.id];
          }
        }
      }
      this.cargo = (d.cargo ?? {}) as Record<GoodId, number>;
      for (const g of GOODS) if (typeof this.cargo[g.id] !== 'number') this.cargo[g.id] = 0;
      this.stats = { sunk: d.sunk ?? 0, ports: new Set(d.ports ?? []) };
      this.player = {
        x: d.x ?? WORLD_W / 2, y: d.y ?? WORLD_H / 2, angle: d.angle ?? -Math.PI / 2,
        sail: 0, vx: 0, vy: 0,
        hp: d.hp ?? 100, maxHp: d.maxHp ?? 100, cannons: 3, damage: 7, range: 80, reload: 1.0,
        reloadL: 0, reloadR: 0, speed: 46, turn: 2.6, aiState: 'wander', wander: 0, hitFlash: 0,
      };
      this.pushMessage('Welcome back, Captain — your voyage continues.', 'info');
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

  // expose for render.ts
  get worldW() {
    return WORLD_W;
  }
  get worldH() {
    return WORLD_H;
  }
}
