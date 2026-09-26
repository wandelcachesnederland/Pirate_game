import { type Fortress, type Island, type Ship, type ShipKind, isSteelHull } from '../types';
import { islandRadiusAt, drawFortRuin } from '../render';
import { HARBOUR_FLEETS, HARBOUR_SQUADRON_CAP, harbourMouth, harbourSortie } from '../harbour';
import { PROVOKE, coolOff, provokeNetwork } from '../settlements';
import { blastKindFor, projectileFor, usesGunpowder } from '../weapons';
import { angDiff, TAU } from '../math';
import {
  RAM_ARC, RAM_COOLDOWN, SPIKE_COOLDOWN, fenderGuard, fenderRepel, fittingsFor, ramDamage, ramSelfGuard, spikeDamage,
  type FittingEffect,
} from '../hullFittings';
import { HALF_PI, WORLD, NATIVE_HUNT, NATIVE_LEASH, NATIVE_GUARD, NATIVE_BEACH, P_SMOKE, P_FIRE, P_FOAM, FIRE_COLORS, SMOKE_LIGHT, SMOKE_DARK, rand, clamp, pick, type Ball } from './constants';
import { EngineCombat } from './combat';

/** Ship physics, collisions, enemy AI, island natives, settlements and forts. */
export abstract class EngineShips extends EngineCombat {
  /** Implemented by `EngineWeapons` / `Engine`. */
  protected abstract fireBroadside(s: Ship, side: number, rel: number): void;
  protected abstract makeShip(kind: ShipKind, x: number, y: number, angle: number): Ship;

  /** When each hull last felt the player's ram / spikes (engine time). */
  private fittingHits = new WeakMap<Ship, { ram: number; spike: number }>();
  /** Set while resolving a pair the player's ram just struck: her bow is spared. */
  private ramGuard = 1;

  // ================================================================ ships
  protected updateShips(dt: number) {
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

  protected shipPhysics(s: Ship, dt: number) {
    s.sail += (s.sailTarget - s.sail) * Math.min(1, dt * 2.5);
    const slow = s.slowTimer > 0 ? 0.55 : 1;
    const target = s.maxSpeed * s.sail * this.windFactor(s.angle, !!s.def.oared || isSteelHull(s.def.hullStyle)) * slow;
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

  protected shipTerrain(s: Ship, dt: number) {
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

  protected shipFx(s: Ship, dt: number) {
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

  protected shipCollisions() {
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
            const bite = 8 * (1 + 0.05 * (this.wave - 1)) * this.diff.enemyDamage;
            const nx = dx / dd;
            const ny = dy / dd;
            if (victim === this.player) this.hurtPlayer(bite * fenderGuard(this.pstats.fenders), -nx, -ny, false);
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
        this.ramGuard = 1;
        if (playing && a.team !== b.team && (a === this.player || b === this.player)) {
          this.hullFittingContact(a === this.player ? b : a, Math.hypot(dx, dy), lim);
        }
        this.resolvePair(a, b, playing);
        this.ramGuard = 1;
      }
    }
  }

  /**
   * The player's hull fittings at work: a ram on the stem, spikes (hooks,
   * blades, fire pots…) along the sides, and fenders that shove a hull off.
   * Runs whenever an enemy hull is touching the player's.
   */
  protected hullFittingContact(foe: Ship, dist: number, lim: number) {
    const p = this.player;
    const ps = this.pstats;
    if (ps.ram + ps.spikes + ps.fenders <= 0) return;
    if (foe.surrendered || foe.captured || foe.peaceful || foe.sinking >= 0) return;
    if (dist > lim * 0.95) return;
    const kit = fittingsFor(this.eraId);
    const d = dist || 1;
    const nx = (foe.x - p.x) / d;
    const ny = (foe.y - p.y) / d;
    const hits = this.fittingHits.get(foe) ?? { ram: -99, spike: -99 };
    this.fittingHits.set(foe, hits);

    // ---- the ram: bow on, moving ahead with way on
    const ahead = Math.cos(p.angle) * nx + Math.sin(p.angle) * ny;
    const speedFrac = p.fwd / Math.max(1, p.maxSpeed);
    let rammed = false;
    if (ps.ram > 0 && ahead > RAM_ARC && speedFrac > 0.25) {
      rammed = true;
      this.ramGuard = ramSelfGuard(ps.ram);
      if (this.time - hits.ram >= RAM_COOLDOWN) {
        hits.ram = this.time;
        hits.spike = this.time; // one blow at a time
        const dmg = ramDamage(ps.ram, foe.maxHp, speedFrac, kit.ram.effect);
        const cx = p.x + nx * d * 0.5;
        const cy = p.y + ny * d * 0.5;
        this.fxHit(cx, cy, Math.atan2(ny, nx), 1.3);
        this.sfx.hit(this.volAt(cx, cy), this.panAt(cx));
        this.addTrauma(0.22);
        this.hitStop = Math.max(this.hitStop, 0.05);
        foe.vx += nx * 90;
        foe.vy += ny * 90;
        this.addText(cx, cy - 18, kit.ram.effect === 'breach' ? 'HOLED!' : 'RAMMED!', '#ffd84d', 20);
        this.fittingEffect(foe, kit.ram.effect, ps.ram);
        this.damageShip(foe, dmg, true);
      }
    }

    // ---- the sides: spikes, hooks, blades, fire pots
    if (!rammed && ps.spikes > 0 && this.time - hits.spike >= SPIKE_COOLDOWN && foe.sinking < 0) {
      hits.spike = this.time;
      const dmg = spikeDamage(ps.spikes, foe.maxHp);
      this.fxHit(foe.x - nx * foe.def.width * 0.4, foe.y - ny * foe.def.width * 0.4, Math.atan2(ny, nx), 0.6);
      this.fittingEffect(foe, kit.spikes.effect, ps.spikes);
      this.damageShip(foe, dmg, true);
    }

    // ---- fenders: shove her off
    if (ps.fenders > 0 && foe.sinking < 0) {
      const push = fenderRepel(ps.fenders) * 0.2;
      foe.vx += nx * push;
      foe.vy += ny * push;
    }
  }

  /** What a fitting does besides damage. */
  private fittingEffect(foe: Ship, effect: FittingEffect, level: number) {
    switch (effect) {
      case 'breach':
        foe.slowTimer = Math.max(foe.slowTimer, 1.2 + 0.4 * level);
        break;
      case 'tangle':
        foe.slowTimer = Math.max(foe.slowTimer, 1.5 + level);
        break;
      case 'fire':
        this.igniteShip(foe, 2.5 + level, 0.008, true);
        break;
      case 'shock':
        foe.reloadL += 1.2 + 0.4 * level;
        foe.reloadR += 1.2 + 0.4 * level;
        foe.vx += Math.cos(foe.angle + HALF_PI) * 30;
        foe.vy += Math.sin(foe.angle + HALF_PI) * 30;
        break;
      case 'none':
        break;
    }
  }

  protected resolvePair(a: Ship, b: Ship, playing: boolean) {
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
            const guard = this.ramGuard * fenderGuard(this.pstats.fenders);
            if (a === this.player) this.hurtPlayer(dmg * 0.5 * guard, -nx, -ny, true);
            else this.damageShip(a, dmg, b === this.player);
            if (b === this.player) this.hurtPlayer(dmg * 0.5 * guard, nx, ny, true);
            else this.damageShip(b, dmg, a === this.player);
          }
        }
        return;
      }
    }
  }

  // ================================================================ AI
  protected aiCombat(s: Ship, dt: number) {
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
        // a harbour's squadron only chases so far before it puts back
        if (s.homeIsland && this.nativeBreakOff(s, dt, dist)) return;
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
  protected steer(s: Ship, desired: number, sail: number, avoidLand = true) {
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
  protected nativeBreakOff(s: Ship, dt: number, dist: number): boolean {
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
        this.addText(s.x, s.y - 30, s.def.native ? 'The war party turns for home!' : 'The harbour squadron puts back!', '#ffd8a8', 15);
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

  protected aiWander(s: Ship, dt: number) {
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

  protected avoid(s: Ship, desired: number): number {
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

  protected pointInIsland(x: number, y: number, margin: number): Island | null {
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
  protected anchorNative(s: Ship, island?: Island, mul = 1) {
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
  protected updateNatives(dt: number) {
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
      // a harbour town sends its squadron, not canoes
      if (st.fortress && st.fortress.harbour !== undefined) {
        if (wars < HARBOUR_SQUADRON_CAP) this.launchHarbourSquadron(is, st.fortress, wars);
        continue;
      }
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

  /**
   * A roused harbour town puts its squadron out through the harbour mouth:
   * the era's guard boats and, later in the voyage, a proper warship. They
   * answer to the harbour like canoes answer to their beach — they chase, then
   * put back — but they carry guns. With the fort razed, the town can still
   * man a guard boat or two.
   */
  protected launchHarbourSquadron(is: Island, f: Fortress, afloat: number) {
    const st = is.settlement;
    const hA = f.harbour ?? Math.atan2(this.player.y - is.y, this.player.x - is.x);
    const kinds = harbourSortie(this.eraId, this.wave, !f.ruined).slice(0, HARBOUR_SQUADRON_CAP - afloat);
    st.raidTimer = rand(18, 26);
    const mouth = harbourMouth(is, hA);
    let launched = 0;
    kinds.forEach((kind, i) => {
      // line astern out of the mouth, the first boat furthest out
      const off = (kinds.length - 1 - i) * 30;
      const lat = (i % 2 ? 1 : -1) * (i ? 12 : 0);
      let x = is.x + mouth.x + Math.cos(hA) * off - Math.sin(hA) * lat;
      let y = is.y + mouth.y + Math.sin(hA) * off + Math.cos(hA) * lat;
      if (this.pointInIsland(x, y, 10)) {
        // a crooked coast: fall back to open water on the player's side
        const a = Math.atan2(this.player.y - is.y, this.player.x - is.x) + (i - 0.5) * 0.4;
        x = is.x + Math.cos(a) * (is.maxR + 40);
        y = is.y + Math.sin(a) * (is.maxR + 40);
        if (this.pointInIsland(x, y, 10)) return;
      }
      const ship = this.makeShip(kind, x, y, hA);
      // a garrison's boats are bolder than a village's canoes, and range further
      this.anchorNative(ship, is, f.ruined ? 1.1 : 1.4);
      this.ships.push(ship);
      launched++;
    });
    if (launched > 0) {
      const fleet = HARBOUR_FLEETS[this.eraId] ?? HARBOUR_FLEETS.golden;
      this.addText(is.x + mouth.x, is.y + mouth.y - 30, f.ruined ? 'Guard boats put out from the harbour!' : fleet.sortie, '#ffd8a8', 16);
      this.sfx.horn();
    }
  }

  /** A peaceful village's boat: put her on the water off her own beach. */
  protected launchFishingBoat(is: Island) {
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
  protected peacefulBoat(s: Ship, dt: number, dist: number): boolean {
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
  protected updateSettlements(dt: number) {
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
  protected provokeIsland(is: Island, points: number, kind: 'boats' | 'shell') {
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

  protected provokeBoats(is: Island, points: number) {
    this.provokeIsland(is, points, 'boats');
  }

  protected onIslandRoused(is: Island, kind: 'boats' | 'shell') {
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
  protected shellIsland(is: Island, b: Ball) {
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

  /**
   * The walls come down: the battery is silenced and the stores pay out. Where
   * the fort keeps powder, its magazine goes up with the wall. In the
   * pre-gunpowder seas there is no magazine to go up — the curtain wall simply
   * collapses in dust and rubble, and the loot is stores, not powder.
   */
  protected razeFort(is: Island, f: Fortress) {
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
    if (blastKindFor(this.eraId) === 'powder') {
      this.fxExplosion(fx, fy, 1.1);
      this.sfx.explosion(Math.max(0.55, this.volAt(fx, fy)), this.panAt(fx));
    } else {
      // a stone wall coming down: dust, rubble and a rumble, nothing more
      this.fxCollapse(fx, fy, 1.2);
      this.sfx.thud(1);
      this.sfx.splash(this.volAt(fx, fy) * 0.5, this.panAt(fx));
    }
    this.fxSparkle(fx, fy, 14, '#ffd27a');
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
        Math.round((20 + this.wave * 2) * this.diff.plunder),
      );
    }
    this.addPickup(fx, fy, rand(-30, 30), rand(-30, 30), 1, Math.round((120 + this.wave * 12) * this.diff.plunder));
    this.addScore(180 + this.wave * 12);
  }

  /** Fortress guns: a hostile battery fires on any sail inside its reach. */
  protected updateForts(dt: number) {
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

  protected fortSalvo(is: Island, f: Fortress) {
    const p = this.player;
    const shore = islandRadiusAt(is, f.angle) + 12;
    const sx = is.x + Math.cos(f.angle) * shore;
    const sy = is.y + Math.sin(f.angle) * shore;
    const dist = Math.hypot(p.x - sx, p.y - sy);
    const lead = Math.min(0.9, dist / f.ballSpeed);
    const tx = p.x + p.vx * lead;
    const ty = p.y + p.vy * lead;
    const base = Math.atan2(ty - sy, tx - sx);
    const kind = projectileFor(this.eraId, f.guns % 2 === 0);
    for (let i = 0; i < f.guns; i++) {
      const a = base + (i - (f.guns - 1) / 2) * 0.05 + rand(-0.035, 0.035);
      const life = dist / f.ballSpeed + 0.35;
      this.balls.push({
        projectile: kind,
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
  protected launchRowboat(s: Ship) {
    if (s.def.length < 70 || Math.random() < 0.45) return;
    const a = rand(0, TAU);
    const boat = this.makeShip('rowboat', s.x + Math.cos(a) * (s.def.length * 0.4), s.y + Math.sin(a) * (s.def.length * 0.4), a);
    boat.hp = boat.maxHp;
    this.ships.push(boat);
  }
}
