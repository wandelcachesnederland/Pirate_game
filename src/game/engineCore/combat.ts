import type { Island, Ship } from '../types';
import { BOARD_MIN_CREW, BOARD_RANGE, rollBoardingOutcome, SURRENDER_HP, SURRENDER_HP_DESPERATE, surrenderChance } from '../boarding';
import { PROVOKE } from '../settlements';
import { blastKindFor, isBlunt, SHOT_PROFILE, type ProjectileKind } from '../weapons';
import { TAU } from '../math';
import { MAX_PICKUPS, STREAK_TIME, MAX_MULT, CHASER_BIG, BURN_TICK, FIRE_SPREAD, SLICK_LIFE, MAX_SLICKS, P_SMOKE, P_FIRE, P_SPLINTER, P_RING, FIRE_COLORS, SMOKE_LIGHT, SMOKE_DARK, WOOD, rand, clamp, pick, type Ball, type Pickup } from './constants';
import { EngineWorldRender } from './worldRender';

/** Projectiles, damage, fire, sinking, boarding, stores and loot. */
export abstract class EngineCombat extends EngineWorldRender {
  /** Implemented by `EngineShips`. */
  protected abstract pointInIsland(x: number, y: number, margin: number): Island | null;
  protected abstract shellIsland(is: Island, b: Ball): void;
  protected abstract provokeBoats(is: Island, points: number): void;
  protected abstract launchRowboat(s: Ship): void;

  // ================================================================ combat
  protected updateBalls(dt: number) {
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      b.life -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      let remove = false;
      // a missile leaves its booster smoke hanging on the water
      if (b.projectile === 'missile' && Math.random() < 0.7) {
        this.emit(P_SMOKE, b.x, b.y, rand(-10, 10), rand(-10, 10), rand(0.5, 0.9), rand(2.5, 4.5), 10, pick(SMOKE_LIGHT), 1, 2, 0, 0, 0.4);
        this.emit(P_FIRE, b.x, b.y, rand(-8, 8), rand(-8, 8), rand(0.08, 0.16), rand(2, 3.5), 0, pick(FIRE_COLORS), 1, 3);
      }
      // shot that is alight leaves a trail of flame and smoke behind it
      if (b.projectile === 'fireArrow') {
        if (Math.random() < 0.45) {
          this.emit(P_FIRE, b.x, b.y, rand(-16, 16), rand(-16, 16), rand(0.12, 0.26), rand(1.8, 3.2), -2, pick(FIRE_COLORS), 1, 2.2, 0, 0, 0.8);
        }
      } else if (b.projectile === 'greekFire') {
        for (let k = 0; k < 2; k++) {
          this.emit(P_FIRE, b.x + rand(-2, 2), b.y + rand(-2, 2), rand(-30, 30), rand(-30, 30), rand(0.18, 0.36), rand(3, 5.5), -3, pick(FIRE_COLORS), 1, 1.6, 0, 0, 0.85);
        }
        if (Math.random() < 0.5) {
          this.emit(P_SMOKE, b.x, b.y, this.windX * 22 + rand(-10, 10), this.windY * 22 + rand(-10, 10), rand(0.7, 1.3), rand(3, 6), 10, pick(SMOKE_DARK), 1, 1.4, 0, 0, 0.45);
        }
      }
      // a mortar shell is only dangerous once it drops out of its arc
      const falling = !b.mortar || 1 - b.life / b.max > 0.62;
      if (b.life <= 0) {
        if (b.mortar) this.mortarBlast(b);
        else {
          // Greek fire carries on burning on the water; an arrow just sinks
          if (b.projectile === 'greekFire') this.spawnSlick(b);
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

  protected ballHitsShip(b: Ball, s: Ship): boolean {
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

  protected onBallHit(b: Ball, s: Ship) {
    const dir = Math.atan2(b.vy, b.vx);
    const prof = SHOT_PROFILE[b.projectile];
    // a chase gun is small calibre: it guts an open boat and bounces off a hull
    const openBoat = s.def.oared === true && s.def.length <= 60;
    let dmg = b.dmg * prof.dmg * rand(0.85, 1.15) * (b.chaser && !openBoat ? CHASER_BIG : 1);
    let crit = false;
    if (b.team === 0 && !b.small && Math.random() < 0.1) {
      dmg *= 2;
      crit = true;
    }
    if (b.projectile === 'missile') {
      // anti-ship missile: one hard hit, fireball, no luck involved
      dmg = b.dmg * rand(0.95, 1.15);
      this.fxExplosion(b.x, b.y, 0.8);
      this.sfx.explosion(Math.max(0.5, this.volAt(b.x, b.y)), this.panAt(b.x));
      s.vx += Math.cos(dir) * 30;
      s.vy += Math.sin(dir) * 30;
      if (b.team === 0) this.addTrauma(0.16);
    } else if (b.projectile === 'greekFire') {
      // a jet of burning naphtha: it bursts across the planking and stays there
      this.fxFireHit(b.x, b.y, dir, b.small ? 0.8 : 1.15);
      this.sfx.burn(Math.max(0.4, this.volAt(b.x, b.y)) * 0.8, this.panAt(b.x));
    } else if (isBlunt(b.projectile)) {
      // a stone: dust, splinters and a hard shove — never a spark
      this.fxHit(b.x, b.y, dir, crit ? 1.5 : b.small ? 0.6 : 1, false);
    } else this.fxHit(b.x, b.y, dir, crit ? 1.5 : b.small ? 0.6 : 1, prof.sparks);
    // a chase gun hit knocks a canoe off its stroke and back down the wake
    const knock = b.projectile === 'missile' ? 26 : b.chaser ? (openBoat ? 70 : 12) : b.small ? 4 : 10;
    s.vx += Math.cos(dir) * knock;
    s.vy += Math.sin(dir) * knock;
    s.angVel += rand(-0.15, 0.15);
    if (b.chaser && openBoat) s.slowTimer = Math.max(s.slowTimer, 1.4);
    // incendiaries leave the target burning; barbed shot drags at her rigging
    if (prof.slow > 0) s.slowTimer = Math.max(s.slowTimer, prof.slow * (b.small ? 0.5 : 1));
    if (prof.ignite > 0 && Math.random() < prof.ignite * (b.small ? 0.6 : 1)) {
      this.igniteShip(s, prof.burn, prof.burnRate, b.team === 0);
    }
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

  protected hurtPlayer(dmg: number, dx: number, dy: number, light: boolean) {
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

  protected damageShip(s: Ship, dmg: number, byPlayer: boolean) {
    if (s.sinking >= 0 || s.captured || this.screen !== 'playing') return;
    // putting a round into one of a village's boats is a grievance in itself
    if (byPlayer && s.homeIsland && dmg > 0) {
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

  // ================================================================ fire

  /** The report of one shot: powder, bowstring or fire siphon. */
  protected fireSound(kind: ProjectileKind, x: number, y: number) {
    const vol = Math.max(0.35, this.volAt(x, y));
    const pan = this.panAt(x);
    // a siphon roars; bows, winches and slings all speak with a bowstring snap
    if (kind === 'greekFire') this.sfx.siphon(vol, pan);
    else this.sfx.bow(vol, pan);
  }

  /**
   * Set a hull alight. Without powder, fire is what finishes a ship: it eats
   * the hull over the next few seconds and can leap to whatever is lying
   * alongside. The hit itself is what drags at the rigging (`SHOT_PROFILE.slow`).
   * The player's crew turns out with buckets and wet canvas, so fire on her own
   * deck is shorter and milder than fire in an enemy's.
   */
  protected igniteShip(s: Ship, time: number, rate: number, byPlayer: boolean) {
    if (s.sinking >= 0 || s.captured || s.dead || time <= 0) return;
    const player = s === this.player;
    const t = player ? time * 0.7 : time;
    const r = player ? rate * 0.7 : rate;
    const fresh = !(s.burn > 0);
    s.burn = Math.max(s.burn, t);
    s.burnRate = Math.max(s.burnRate, r);
    if (s.burnTick <= 0) s.burnTick = 0.12;
    if (byPlayer) s.burnFromPlayer = true;
    if (!fresh) return;
    if (player) {
      this.addText(s.x, s.y - 58, 'FIRE ABOARD!', '#ff9a3c', 24);
      this.flashRed = Math.min(0.7, this.flashRed + 0.22);
      this.addTrauma(0.2);
    } else {
      this.addText(s.x, s.y - 26, 'AFIRE!', '#ff9a3c', 15);
    }
    this.sfx.burn(Math.max(0.4, this.volAt(s.x, s.y)), this.panAt(s.x));
  }

  /** One tick of fire damage — heat and smoke, not a powder blast. */
  protected fireDamage(s: Ship, amount: number) {
    if (amount <= 0) return;
    if (s === this.player) {
      // burning hurts, but it must not rattle the camera every quarter second
      this.waveDamage += amount;
      this.flashRed = Math.min(0.7, this.flashRed + amount * 0.005);
      if (Math.random() < 0.2) this.addTrauma(0.04);
      this.damageShip(s, amount, false);
    } else {
      this.damageShip(s, amount, s.burnFromPlayer);
    }
  }

  /** Tongues of flame and smoke coming off a burning hull. */
  protected burnFx(s: Ship, dt: number) {
    const hl = s.def.length * 0.5;
    const hw = s.def.width * 0.5;
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    const n = Math.max(1, Math.round(dt * 30));
    for (let i = 0; i < n; i++) {
      const lx = rand(-0.7, 0.7) * hl;
      const ly = rand(-0.6, 0.6) * hw;
      const x = s.x + c * lx - sn * ly;
      const y = s.y + sn * lx + c * ly;
      this.emit(P_FIRE, x, y, s.vx * 0.7 + rand(-16, 16), s.vy * 0.7 + rand(-16, 16), rand(0.3, 0.6), rand(4.5, 8), -8, pick(FIRE_COLORS), 1, 0.8, 0, 0, 0.85);
      if (Math.random() < 0.5) {
        this.emit(P_SMOKE, x, y, this.windX * 30 + rand(-10, 10), this.windY * 30 + rand(-10, 10), rand(1.1, 2), rand(6, 10), 18, pick(SMOKE_DARK), 1, 1.2, 0, 0, 0.5);
      }
    }
  }

  /**
   * Keep every burning hull alight: fire eats the hull and leaps the gap to a
   * ship lying alongside. The rigging damage is felt at the moment of the hit
   * (see `SHOT_PROFILE.slow`), not as a permanent drag.
   */
  protected updateBurning(dt: number) {
    for (const s of this.ships) {
      if (s.dead || s.sinking >= 0 || !(s.burn > 0)) continue;
      s.burn = Math.max(0, s.burn - dt);
      s.burnTick -= dt;
      this.burnFx(s, dt);
      if (s.burnTick <= 0) {
        s.burnTick = BURN_TICK;
        this.fireDamage(s, s.maxHp * s.burnRate * BURN_TICK);
      }
      if (s.burn <= 0) {
        s.burnRate = 0;
        s.burnFromPlayer = false;
        continue;
      }
      for (const o of this.ships) {
        if (o === s || o.dead || o.sinking >= 0 || o.burn > 0) continue;
        const reach = (s.def.length + o.def.length) * 0.42;
        if (Math.hypot(o.x - s.x, o.y - s.y) > reach) continue;
        if (Math.random() < dt * FIRE_SPREAD) {
          this.igniteShip(o, 2.5, 0.006, s.burnFromPlayer || s === this.player);
        }
      }
    }
  }

  /** A slick of naphtha still burning on the water where a shot fell short. */
  protected spawnSlick(b: Ball) {
    const r = (b.small ? 22 : 34) * (1 + Math.random() * 0.25);
    if (this.slicks.length >= MAX_SLICKS) this.slicks.shift();
    this.slicks.push({
      x: b.x, y: b.y, r, life: SLICK_LIFE, max: SLICK_LIFE,
      team: b.team, dps: b.dmg * 0.5, seed: Math.random() * TAU,
    });
  }

  /** Whoever crosses a burning slick catches fire; the sea carries the smoke. */
  protected updateSlicks(dt: number) {
    for (let i = this.slicks.length - 1; i >= 0; i--) {
      const sl = this.slicks[i];
      sl.life -= dt;
      if (Math.random() < dt * 20) {
        const a = rand(0, TAU);
        const d = Math.sqrt(Math.random()) * sl.r;
        const x = sl.x + Math.cos(a) * d;
        const y = sl.y + Math.sin(a) * d;
        this.emit(P_FIRE, x, y, this.windX * 16 + rand(-10, 10), this.windY * 16 + rand(-10, 10), rand(0.25, 0.5), rand(3.5, 7), -6, pick(FIRE_COLORS), 1, 1, 0, 0, 0.8);
      }
      if (Math.random() < dt * 5) {
        this.emit(P_SMOKE, sl.x + rand(-sl.r, sl.r) * 0.6, sl.y + rand(-sl.r, sl.r) * 0.6, this.windX * 34, this.windY * 34, rand(1.2, 2.2), rand(7, 12), 20, pick(SMOKE_DARK), 1, 1.2, 0, 0, 0.5);
      }
      for (const s of this.ships) {
        if (s.dead || s.sinking >= 0 || s.team === sl.team) continue;
        if (Math.hypot(s.x - sl.x, s.y - sl.y) > sl.r + s.def.length * 0.35) continue;
        this.fireDamage(s, sl.dps * dt);
        // linger in the flames and they take hold of your own timbers
        if (Math.random() < Math.min(1, dt * 1.6)) this.igniteShip(s, 1.8, 0.006, sl.team === 0);
      }
      if (sl.life <= 0) {
        this.slicks[i] = this.slicks[this.slicks.length - 1];
        this.slicks.pop();
      }
    }
  }

  /** A mauled foe may strike her colours instead of fighting to the death. */
  protected maybeSurrender(s: Ship) {
    // a fisherman has no flag to strike: he just rows harder
    if (s.peaceful) return;
    const base = Math.min(1, surrenderChance(s.def.kind) * this.diff.surrender);
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

  protected raiseWhiteFlag(s: Ship) {
    s.surrendered = true;
    s.sailTarget = 0.12;
    s.reloadL = Math.max(s.reloadL, 1.5);
    s.reloadR = Math.max(s.reloadR, 1.5);
    this.addText(s.x, s.y - 32, 'SURRENDERED!', '#ffffff', 26);
    this.addText(s.x, s.y - 10, 'Close and board her (F) for the full prize!', '#ffe066', 15);
    this.fxSparkle(s.x, s.y, 10, '#ffffff');
    this.sfx.fanfare();
  }

  protected sinkShip(s: Ship, reward = true) {
    if (s.sinking >= 0) return;
    s.hp = 0;
    s.sinking = 0;
    // sending one of their boats to the bottom is the grievance that counts
    if (s.homeIsland && s.hitByPlayer) {
      this.provokeBoats(s.homeIsland, PROVOKE.boatSunk);
      if (s.peaceful) this.addText(s.x, s.y - 34, 'their fishing boat…', '#ffd8a8', 16);
    }
    const big = s.def.length / 60;
    if (blastKindFor(this.eraId) === 'powder') {
      // a magazine going up: white flash, shockwave, a blast you can hear
      this.fxExplosion(s.x, s.y, big);
      this.sfx.explosion(Math.max(0.45, this.volAt(s.x, s.y)), this.panAt(s.x));
    } else {
      // no powder on the water: she goes up by pitch, oil and hand — a sheet of
      // flame and a cloud of smoke, or she simply founders. Never a blast.
      this.fxBurnOut(s, big);
      this.sfx.fireBurst(Math.max(0.45, this.volAt(s.x, s.y)), this.panAt(s.x));
    }
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
        // no magazine below decks: the fire ship is a bonfire, not a bomb
        this.addText(s.x, s.y - 30, blastKindFor(this.eraId) === 'powder' ? 'KABOOM!' : 'ABLAZE!', '#ff8a3a', 26);
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
      if (blastKindFor(this.eraId) === 'powder') {
        this.fxExplosion(s.x + rand(-15, 15), s.y + rand(-10, 10), 1.2);
      } else {
        this.fxBurnOut(s, 1.1);
        this.sfx.fireBurst(Math.max(0.5, this.volAt(s.x, s.y)), this.panAt(s.x));
      }
    }
  }

  /** A vessel going up by hand, not by magazine: pitch, oars and flames. */
  protected fxBurnOut(s: Ship, sc = 1) {
    const x = s.x;
    const y = s.y;
    for (let i = 0; i < Math.round(16 * sc); i++) {
      const a = rand(0, TAU);
      const sp = rand(20, 110);
      this.emit(P_FIRE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.5, 1.1), rand(5, 11), -4, pick(FIRE_COLORS), 1, 2.4);
    }
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU);
      const sp = rand(15, 90);
      this.emit(P_SMOKE, x, y, Math.cos(a) * sp + this.windX * 18, Math.sin(a) * sp + this.windY * 18, rand(1.4, 2.4), rand(8, 15), 22, pick(SMOKE_DARK), 1, 1.5, 0, 0, 0.6);
    }
    for (let i = 0; i < 18; i++) {
      const a = rand(0, TAU);
      const sp = rand(60, 240);
      this.emit(P_SPLINTER, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.6, 1.2), rand(3, 7), 0, pick(WOOD), 1, 2.4, rand(0, TAU), rand(-14, 14));
    }
    this.emit(P_RING, x, y, 0, 0, 0.6, 5, 60 * sc, '#ffb98a', 1, 0, 0, 0, 0.55);
  }

  /** Mortar shell landing: area damage with falloff, plus a shove outward. */
  protected mortarBlast(b: Ball) {
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

  /**
   * A fire ship reaching its target. Where powder is carried she goes off like
   * a magazine; in the pre-gunpowder seas the pitch, oil and brushwood all
   * catch at once and a wall of flame sweeps out instead. The damage is the
   * same either way — what changes is that nothing there explodes.
   */
  protected fireBlast(fs: Ship) {
    const R = 125;
    if (blastKindFor(this.eraId) === 'powder') {
      this.fxExplosion(fs.x, fs.y, 1.6);
      this.sfx.explosion(Math.max(0.5, this.volAt(fs.x, fs.y)), this.panAt(fs.x));
    } else {
      this.fxFireBurst(fs.x, fs.y, 1.7);
      this.sfx.fireBurst(Math.max(0.5, this.volAt(fs.x, fs.y)), this.panAt(fs.x));
    }
    this.emit(P_RING, fs.x, fs.y, 0, 0, 0.55, 10, R + 40, '#ffb347', 1, 0, 0, 0, 0.9);
    this.addTrauma(0.5);
    const dmgBase = 30 * (1 + 0.05 * (this.wave - 1)) * this.diff.enemyDamage;
    for (const s of this.ships) {
      if (s === fs || s.sinking >= 0) continue;
      const d = Math.hypot(s.x - fs.x, s.y - fs.y);
      if (d > R + s.def.length * 0.4) continue;
      const k = clamp(1 - d / (R + s.def.length * 0.4), 0.35, 1);
      const nx = (s.x - fs.x) / (d || 1);
      const ny = (s.y - fs.y) / (d || 1);
      s.vx += nx * 90 * k;
      s.vy += ny * 90 * k;
      // the flames take hold of whatever she was grappled to
      this.igniteShip(s, 3 * k, 0.007, fs.hitByPlayer);
      if (s === this.player) this.hurtPlayer(dmgBase * k, nx, ny, false);
      else this.damageShip(s, dmgBase * 1.4 * k, fs.hitByPlayer);
    }
  }

  protected addScore(base: number): number {
    const pts = Math.round(base * this.mult * this.diff.plunder);
    this.score += pts;
    this.scorePulse = 1;
    return pts;
  }

  // ================================================================ boarding & stores
  /** Nearest struck ship lying alongside, if any. */
  protected updateBoarding() {
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
  protected updateSupplies(dt: number) {
    if (this.playerDeadTimer >= 0) return;
    const crew = Math.max(1, Math.ceil(this.player.crew));
    // a full store lasts a patient captain most of a long cruise
    this.water = Math.max(0, this.water - dt * crew * 0.0045 * this.diff.supplyDrain);
    this.food = Math.max(0, this.food - dt * crew * 0.0032 * this.diff.supplyDrain);
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

  protected flagName(f: Ship['def']['faction']): string {
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
  protected resolveBoarding(s: Ship) {
    const p = this.player;
    if (s.sinking >= 0 || s.captured || !s.surrendered || p.sinking >= 0) return;
    const pCrew = Math.ceil(p.crew);
    if (pCrew < BOARD_MIN_CREW) {
      this.addText(p.x, p.y - 44, 'Not enough crew to take a prize!', '#ff9a8a', 18);
      this.sfx.thud(0.6);
      return;
    }
    const outcome = rollBoardingOutcome(pCrew, Math.ceil(s.crew));
    const V = s.def.value * (1 + 0.1 * (this.wave - 1)) * this.diff.plunder;
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
      this.hurtPlayer((8 + this.wave * 1.5) * this.diff.enemyDamage, nx, ny, false);
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
      this.hurtPlayer((12 + this.wave) * this.diff.enemyDamage, nx, ny, false);
      this.boardCandidate = null;
      return;
    }
    this.capturePrize(s, V, outcome === 'plague');
  }

  /** A prize taken: her whole manifest, her stores, her men — and her colours. */
  protected capturePrize(s: Ship, V: number, sick: boolean) {
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

  protected dropLoot(s: Ship) {
    const n = s.def.coins;
    const total = s.def.value * 0.55 * (1 + 0.1 * (this.wave - 1)) * this.diff.plunder;
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

  protected addPickup(x: number, y: number, vx: number, vy: number, kind: 0 | 1 | 2, value: number) {
    if (this.pickups.length >= MAX_PICKUPS) this.pickups.shift();
    this.pickups.push({ x, y, vx, vy, kind, value, life: kind === 0 ? rand(24, 28) : 32, seed: rand(0, TAU), magnet: this.magnetAll, mspeed: 0 });
  }

  protected updatePickups(dt: number) {
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

  protected collect(pk: Pickup) {
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
}
