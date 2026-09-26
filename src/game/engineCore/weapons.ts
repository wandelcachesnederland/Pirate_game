import type { Ship } from '../types';
import { cannonLocalX } from '../sprites';
import { armVolleyNameL, isIncendiary, projectileFor, usesGunpowder } from '../weapons';
import { angDiff, TAU } from '../math';
import { HALF_PI, GRAPE, CHASER, P_SMOKE, P_FIRE, P_SPARK, P_RING, P_FLASH, P_ARROW, FIRE_COLORS, SMOKE_LIGHT, SMOKE_DARK, rand, clamp, pick, type Volley } from './constants';
import { EngineTraits } from './traits';
import i18n from '../../i18n';

/** Player input and the player's weapons: broadsides, swivel, chasers, grapeshot. */
export abstract class EngineWeapons extends EngineTraits {
  // ================================================================ player
  protected updatePlayerInput(dt: number) {
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
    else if (inp.boardQueued) this.traitHail();
    if (inp.grapeQueued) this.fireGrapeshot();
    if (inp.traitQueued) this.traitAction();
    inp.consume();
  }

  protected findTarget(s: Ship, side: number): Ship | null {
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

  protected tryFire(s: Ship, side: number, requireTarget: boolean): boolean {
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

  protected smartFire(pressed: boolean) {
    const p = this.player;
    const a = this.tryFire(p, -1, true);
    const b = this.tryFire(p, 1, true);
    if (!a && !b && pressed) {
      this.tryFire(p, -1, false);
      this.tryFire(p, 1, false);
    }
  }

  protected fireBroadside(s: Ship, side: number, rel: number) {
    this.traitOnFired(s);
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

  protected updateVolleys(dt: number) {
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

  protected fireWeapon(v: Volley) {
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
    const kind = s.def.projectile ?? projectileFor(this.eraId, v.lx < 0);
    this.balls.push({
      projectile: kind,
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
      this.fireSound(kind, x, y);
      return;
    }
    if (s.def.projectile === 'missile') {
      s.vx -= Math.cos(dir) * 3;
      this.fxMuzzle(x, y, dir, s.team === 0);
      this.sfx.missile(this.volAt(x, y), this.panAt(x));
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

  protected updateSwivel(dt: number) {
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
      if (this.traitShipHidden(e)) continue;
      if (this.traitShipHidden(e)) continue;
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
    const kind = projectileFor(this.eraId, true);
    this.balls.push({
      projectile: kind,
      x: ox, y: oy, vx: Math.cos(a) * spd + p.vx * 0.3, vy: Math.sin(a) * spd + p.vy * 0.3,
      life, max: life, team: 0, dmg: 4 + lvl * 2, chain: false, small: true, mortar: false,
    });
    if (!usesGunpowder(this.eraId)) {
      this.fireSound(kind, ox, oy);
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
  protected updateChasers(dt: number) {
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
  protected findChaseTarget(s: Ship, end: 1 | -1, range: number): Ship | null {
    const axis = end > 0 ? s.angle : s.angle + Math.PI;
    let best: Ship | null = null;
    let bestScore = Infinity;
    for (const e of this.ships) {
      // chase guns are for pursuers, not for unarmed fishermen
      if (e.team !== 1 || e.sinking >= 0 || e.captured || e.surrendered || e.peaceful) continue;
      if (this.traitShipHidden(e)) continue;
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
  protected fireChaser(end: 1 | -1, g: (typeof CHASER)[number]): boolean {
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
    const kind = projectileFor(this.eraId);
    this.balls.push({
      projectile: kind,
      x: ox, y: oy,
      vx: Math.cos(a) * spd + p.vx * 0.35, vy: Math.sin(a) * spd + p.vy * 0.35,
      life, max: life, team: 0, dmg: g.dmg, chain: this.pstats.chain, small: true, mortar: false, chaser: true,
    });
    if (!usesGunpowder(this.eraId)) {
      this.fireSound(kind, ox, oy);
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
  protected fireGrapeshot() {
    const p = this.player;
    const lvl = Math.min(GRAPE.length, this.pstats.grapeshot);
    if (lvl <= 0 || this.grapeCd > 0 || this.screen !== 'playing' || p.sinking >= 0) return;
    const g = GRAPE[lvl - 1];
    this.grapeCd = g.cd;
    const gunpowder = usesGunpowder(this.eraId);
    const arm = this.arm;
    const fireVolley = !gunpowder && isIncendiary(arm.heavy);
    if (gunpowder) this.sfx.grapeshot(0.9, 0);
    else if (fireVolley) this.sfx.siphon(1, 0);
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

    } else if (fireVolley) {
      // A sheet of burning naphtha sluiced all round the hull. Nothing goes
      // off — it simply sets everything afloat alight.
      for (let i = 0; i < 40; i++) {
        const a = i * TAU / 40 + rand(-0.06, 0.06);
        const sp = rand(140, 320);
        this.emit(P_FIRE, p.x + Math.cos(a) * p.def.length * 0.3, p.y + Math.sin(a) * p.def.length * 0.3,
          Math.cos(a) * sp, Math.sin(a) * sp, rand(0.28, 0.55), rand(4, 8), -4, pick(FIRE_COLORS), 1, 2.2);
      }
      for (let i = 0; i < 16; i++) {
        const a = rand(0, TAU);
        this.emit(P_SMOKE, p.x, p.y, Math.cos(a) * g.range * 0.6, Math.sin(a) * g.range * 0.6,
          rand(0.9, 1.6), rand(6, 10), 20, pick(SMOKE_DARK), 1, 1.8, 0, 0, 0.5);
      }
      this.emit(P_RING, p.x, p.y, 0, 0, 0.5, 8, g.range * 0.8, '#ff9a3c', 1, 0, 0, 0, 0.5);
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
      const dir = Math.atan2(ny, nx);
      // burning naphtha thrown over a hull: it lands alight and stays alight
      if (fireVolley) this.fxFireHit(e.x, e.y, dir, openBoat ? 0.8 : 1);
      else this.fxHit(e.x, e.y, dir, openBoat ? 1.1 : 0.8, gunpowder);
      if (fireVolley) this.igniteShip(e, 4, 0.008, true);
      this.sfx.hit(this.volAt(e.x, e.y) * 0.7, this.panAt(e.x));
    }
    const volley = armVolleyNameL(this.eraId);
    if (killed > 0) this.addText(p.x, p.y - 56, volley, '#ffd84d', 26);
    else if (hits > 0) this.addText(p.x, p.y - 56, volley, '#ffd84d', 18);
    else this.addText(p.x, p.y - 56, i18n.t('hud:event.nothingReach'), '#e6d3a3', 15);
  }
}
