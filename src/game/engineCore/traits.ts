// Era traits: the engine behaviour behind `docs/era-identities.md`.
//
// One signature mechanic per age — tides and stake barrages, monsoon
// calendars, missile locks, ransom tickers, beach raids. This layer sits
// between `EngineShips` and `EngineWeapons`: the layers below call into it
// through small abstract hooks (declared where they are used), and
// `Engine` drives the per-frame update.
import type { EraId, Ship } from '../types';
import {
  ERA_ROSTERS, SAIL_ROSTER,
} from '../rosters';
import {
  freshTraitState, freshTraitShip, makeZone, tideIsLow, monsoonAngle,
  isNightWave, gaugeMult, rakeMult, armorMult, hailGold, deepDraft, isSubKind,
  type TraitState, type TraitShip,
} from '../eraTraits';
import { projectileFor } from '../weapons';
import { BOARD_RANGE } from '../boarding';
import { angDiff, TAU } from '../math';
import { WORLD, rand, clamp } from './constants';
import i18n, { fmt } from '../../i18n';
import type { Ball, Slick } from './constants';
import { EngineShips } from './ships';

/** Closest point on segment AB to P: distance plus the outward normal. */
function segClosest(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = clamp(t, 0, 1);
  const cx = ax + dx * t;
  const cy = ay + dy * t;
  const ddx = px - cx;
  const ddy = py - cy;
  const d = Math.hypot(ddx, ddy) || 1;
  return { d, nx: ddx / d, ny: ddy / d };
}

const WHIRLS: [number, number][] = [[700, 200], [-700, -300], [100, 800]];

export abstract class EngineTraits extends EngineShips {
  protected tr!: TraitState;
  protected tship!: WeakMap<Ship, TraitShip>;

  /** Test harnesses skip the constructor — never assume the fields exist. */
  protected ensureTraits(): TraitState {
    if (!this.tr) {
      this.tr = freshTraitState();
      this.tship = new WeakMap();
    }
    return this.tr;
  }

  protected tsOf(s: Ship): TraitShip {
    this.ensureTraits();
    let t = this.tship.get(s);
    if (!t) {
      t = freshTraitShip();
      this.tship.set(s, t);
    }
    return t;
  }

  // ================================================================ lifecycle
  protected resetTraits() {
    this.tr = freshTraitState();
    this.tship = new WeakMap();
  }

  /** Open water: inside the chart and clear of every island. */
  protected traitOpenWater(x: number, y: number, pad: number): boolean {
    if (Math.abs(x) > WORLD - 420 || Math.abs(y) > WORLD - 420) return false;
    for (const is of this.islands) {
      if (Math.hypot(x - is.x, y - is.y) < is.maxR + pad) return false;
    }
    return true;
  }

  protected traitNearIsland(x: number, y: number, pad: number): number {
    for (let i = 0; i < this.islands.length; i++) {
      const is = this.islands[i];
      if (Math.hypot(x - is.x, y - is.y) < is.maxR + pad) return i;
    }
    return -1;
  }

  /** Lay the era's waterworks: hazards, walls, currents, harvest beds. */
  protected buildTraitWorld() {
    const tr = this.ensureTraits();
    tr.zones.length = 0;
    tr.currents.length = 0;
    const era = this.eraId;
    const scatter = (n: number, pad: number): [number, number][] => {
      const pts: [number, number][] = [];
      for (let tries = 0; tries < n * 30 && pts.length < n; tries++) {
        const x = rand(-2400, 2400);
        const y = rand(-2400, 2400);
        if (Math.hypot(x, y) < 700) continue;
        if (!this.traitOpenWater(x, y, pad)) continue;
        pts.push([x, y]);
      }
      return pts;
    };
    if (era === 'ironclad') {
      for (const [x, y] of scatter(6, 220)) {
        const z = makeZone(x, y, 42, 'mine', 'all');
        z.dps = 75;
        z.drift = 14;
        tr.zones.push(z);
      }
    } else if (era === 'vietnam') {
      for (const [x, y] of scatter(5, 300)) {
        const z = makeZone(x, y, 135, 'stakes', 'foe');
        z.dps = 42;
        tr.zones.push(z);
      }
    } else if (era === 'maya') {
      for (const is of this.islands) {
        const z = makeZone(is.x, is.y, is.maxR + 130, 'reef', 'foe');
        z.dps = 7;
        z.slow = 0.75;
        tr.zones.push(z);
      }
    } else if (era === 'dutch') {
      for (const [x, y] of scatter(3, 320)) {
        const z = makeZone(x, y, 150, 'sand', 'foe');
        z.dps = 5;
        z.slow = 0.55;
        z.drift = 9;
        tr.zones.push(z);
      }
    } else if (era === 'inca') {
      for (const [x, y] of scatter(3, 300)) tr.zones.push(makeZone(x, y, 110, 'spond', 'foe'));
      const lanes: [number, number, number, number][] = [[-900, 0, 1, 0.25], [300, -700, 1, -0.2], [900, 800, 1, 0.15]];
      for (const [x, y, dx, dy] of lanes) {
        const d = Math.hypot(dx, dy) || 1;
        tr.currents.push({ x, y, r: 230, dx: dx / d, dy: dy / d, str: 120 });
      }
    } else if (era === 'byzantium') {
      const y = -900;
      tr.zones.push({ ...makeZone(-950, y, 0, 'wall', 'all'), x2: -320, y2: y, w: 42 });
      tr.zones.push({ ...makeZone(320, y, 0, 'wall', 'all'), x2: 950, y2: y, w: 42 });
    } else if (era === 'aztec') {
      tr.zones.push({ ...makeZone(-500, -1500, 0, 'wall', 'all'), x2: -500, y2: -600, w: 46 });
      tr.zones.push({ ...makeZone(-500, 100, 0, 'wall', 'all'), x2: -500, y2: 1200, w: 46 });
      tr.zones.push({ ...makeZone(500, -1100, 0, 'wall', 'all'), x2: 500, y2: 300, w: 46 });
      tr.zones.push({ ...makeZone(500, 900, 0, 'wall', 'all'), x2: 500, y2: 1600, w: 46 });
    } else if (era === 'greek') {
      tr.zones.push({ ...makeZone(-2000, -320, 0, 'wall', 'all'), x2: -260, y2: -320, w: 50 });
      tr.zones.push({ ...makeZone(260, -320, 0, 'wall', 'all'), x2: 2000, y2: -320, w: 50 });
      tr.zones.push({ ...makeZone(-2000, 320, 0, 'wall', 'all'), x2: -260, y2: 320, w: 50 });
      tr.zones.push({ ...makeZone(260, 320, 0, 'wall', 'all'), x2: 2000, y2: 320, w: 50 });
    }
  }

  protected onTraitWaveStart(n: number) {
    const tr = this.ensureTraits();
    const era: EraId = this.eraId;
    const roster = ERA_ROSTERS[era] ?? SAIL_ROSTER;
    if (n === 1) {
      this.addText(this.player.x, this.player.y - 90, i18n.t('hud:event.traitIntro', { name: i18n.t(`traits:${era}.name`), hint: i18n.t(`traits:${era}.hint`) }), '#9fe7ff', 15);
    }
    if (era === 'napoleonic') {
      tr.signalT = 20;
      this.addText(this.player.x, this.player.y - 70, i18n.t('hud:event.signal'), '#ffd84d', 16);
    }
    if (era === 'ww2') {
      this.addText(
        this.player.x, this.player.y - 70,
        this.traitNight() ? i18n.t('hud:event.nightEvent') : i18n.t('hud:event.dayEvent'),
        '#cfe6ff', 16,
      );
    }
    if (era === 'chinese' && tr.tribute > 0) {
      this.stats.gold += tr.tribute;
      const pts = this.addLootScore(tr.tribute);
      this.addText(this.player.x, this.player.y - 70, i18n.t('hud:event.tributeFleet', { pts: fmt(pts) }), '#ffd84d', 18);
    }
    if (era === 'hawaii' && tr.vassal.length > 0) {
      const g = tr.vassal.length * (60 + n * 15);
      this.stats.gold += g;
      const pts = this.addLootScore(g);
      this.water = Math.min(this.maxWater, this.water + 8 * tr.vassal.length);
      this.food = Math.min(this.maxFood, this.food + 8 * tr.vassal.length);
      this.addText(this.player.x, this.player.y - 70, i18n.t('hud:event.vassalIsles', { pts: fmt(pts) }), '#ffd84d', 18);
    }
    if (era === 'golden' && tr.bounty >= 3) {
      const hunters = roster.pool.filter((p) => p.cost >= 1.5 && n >= (p.minWave ?? 0));
      if (hunters.length > 0) {
        const k = hunters[(Math.random() * hunters.length) | 0].kind;
        this.waveQueue.push(k);
        this.addText(this.player.x, this.player.y - 70, i18n.t('hud:event.bountyHunters', { n: tr.bounty }), '#ff9a8a', 16);
      }
    }
    if (era === 'macedon' && n >= 6) {
      const lights = [...roster.pool].filter((p) => n >= (p.minWave ?? 0)).sort((a, b) => a.cost - b.cost).slice(0, 2);
      for (const p of lights) this.waveQueue.push(p.kind);
      if (lights.length > 0) this.addText(this.player.x, this.player.y - 70, i18n.t('hud:event.lightGalleys'), '#ff9a8a', 15);
    }
    if (era === 'armada' && n % 5 === 0) {
      const pool = roster.pool.filter((p) => n >= (p.minWave ?? 0));
      for (let i = 0; i < 2 && pool.length > 0; i++) {
        this.waveQueue.push(pool[(Math.random() * pool.length) | 0].kind);
      }
    }
    if (era === 'hormuz') {
      let neutrals = 0;
      for (const s of this.ships) if (s.team === 1 && s.peaceful && s.sinking < 0) neutrals++;
      if (neutrals < 2) {
        for (let tries = 0; tries < 20; tries++) {
          const a = rand(0, TAU);
          const x = clamp(this.player.x + Math.cos(a) * 1500, -WORLD + 300, WORLD - 300);
          const y = clamp(this.player.y + Math.sin(a) * 1500, -WORLD + 300, WORLD - 300);
          if (!this.traitOpenWater(x, y, 120)) continue;
          const s = this.makeShip('tanker', x, y, a + Math.PI);
          s.peaceful = true;
          this.ships.push(s);
          break;
        }
      }
    }
  }

  protected onTraitWaveClear() {
    this.ensureTraits();
    if (this.eraId === 'ww2' && this.traitNight()) {
      this.addText(this.player.x, this.player.y - 70, i18n.t('hud:event.nightBonus'), '#cfe6ff', 15);
    }
  }

  protected traitOnSpawn(s: Ship) {
    const tr = this.ensureTraits();
    if (s.team !== 1 || s.peaceful) return;
    if (this.eraId === 'ww1' && isSubKind(s.def.kind)) {
      this.tsOf(s).sub = 1; // sails out submerged; the ping will find her
    }
    if (this.eraId === 'maori') {
      const debt = tr.utu[s.def.kind] ?? 0;
      if (debt > 0 && !s.def.trader) {
        const ts = this.tsOf(s);
        ts.marked = true;
        tr.utu[s.def.kind] = debt - 1;
        s.maxHp = Math.round(s.maxHp * 1.3);
        s.hp = s.maxHp;
        s.damage *= 1.2;
      }
    }
  }

  // ================================================================ per-frame
  protected updateTraits(dt: number) {
    const tr = this.ensureTraits();
    tr.t += dt;
    const era = this.eraId;
    const p = this.player;
    tr.msgT = Math.max(0, tr.msgT - dt);
    tr.lockCool = Math.max(0, tr.lockCool - dt);
    tr.revealT = Math.max(0, tr.revealT - dt);
    tr.bracketT = Math.max(0, tr.bracketT - dt);
    tr.signalT = Math.max(0, tr.signalT - dt);
    tr.teppoCool = Math.max(0, tr.teppoCool - dt);
    tr.cargoCool = Math.max(0, tr.cargoCool - dt);
    tr.sprintCool = Math.max(0, tr.sprintCool - dt);
    tr.sprintT = Math.max(0, tr.sprintT - dt);
    tr.crushT = Math.max(0, tr.crushT - dt);
    if (tr.mana > 0) {
      tr.manaT -= dt;
      if (tr.manaT <= 0) {
        tr.mana--;
        tr.manaT = 20;
      }
    }
    // the flagship's siege range, set every frame so stances can toggle it
    p.range = p.def.range * this.pstats.rangeMul * this.traitPlayerRange();

    // drifting waterworks ride the wind
    for (const z of tr.zones) {
      if (!z.live || z.drift <= 0) continue;
      z.x = clamp(z.x + this.windX * z.drift * dt, -WORLD + 200, WORLD - 200);
      z.y = clamp(z.y + this.windY * z.drift * dt, -WORLD + 200, WORLD - 200);
    }

    if (era === 'ww1') {
      tr.pingT -= dt;
      if (tr.pingT <= 0) {
        tr.pingT = 7;
        let boats = false;
        for (const s of this.ships) {
          if (s.team === 1 && s.sinking < 0 && this.tsOf(s).sub === 1) boats = true;
        }
        if (boats) {
          tr.revealT = 2.5;
          this.addText(p.x, p.y - 70, i18n.t('hud:event.hydroEvent'), '#9fd8ff', 16);
          this.sfx.splash(0.7, 0);
        }
      }
    } else if (era === 'falklands') {
      if (tr.raidWarnT > 0) {
        tr.raidWarnT -= dt;
        if (tr.raidWarnT <= 0) {
          for (let i = 0; i < 3; i++) {
            const a = tr.raidWarnA + rand(-0.12, 0.12);
            const x = clamp(p.x + Math.cos(a) * 1700, -WORLD + 100, WORLD - 100);
            const y = clamp(p.y + Math.sin(a) * 1700, -WORLD + 100, WORLD - 100);
            const aim = Math.atan2(p.y + rand(-90, 90) - y, p.x + rand(-90, 90) - x);
            const spd = 540;
            const life = Math.hypot(p.x - x, p.y - y) / spd + 1.2;
            this.balls.push({
              projectile: 'missile', x, y,
              vx: Math.cos(aim) * spd, vy: Math.sin(aim) * spd,
              life, max: life, team: 1, dmg: (13 + this.wave * 1.3) * this.diff.enemyDamage,
              chain: false, small: false, mortar: false,
            });
          }
          this.addText(p.x, p.y - 70, i18n.t('hud:event.exocets'), '#ff9a8a', 18);
          tr.raidAtkT = rand(34, 50);
        }
      } else {
        tr.raidAtkT -= dt;
        if (tr.raidAtkT <= 0) {
          tr.raidWarnT = 3;
          tr.raidWarnA = rand(0, TAU);
          this.addText(p.x, p.y - 70, i18n.t('hud:event.airRaid'), '#ff9a8a', 20);
          this.sfx.horn();
        }
      }
    } else if (era === 'somali') {
      if (tr.ransomT > 0) {
        tr.ransomT -= dt;
        const pay = tr.ransomRate * dt;
        this.stats.gold += pay;
        tr.diveTick += dt;
        if (tr.diveTick >= 1) {
          tr.diveTick = 0;
          this.addText(p.x, p.y - 70, i18n.t('hud:event.ransomTick', { rate: Math.round(tr.ransomRate), t: Math.ceil(tr.ransomT) }), '#ffd84d', 15);
        }
        if (tr.ransomT <= 0) {
          const bonus = Math.round(tr.ransomRate * 5);
          this.stats.gold += bonus;
          const pts = this.addLootScore(bonus);
          this.addText(p.x, p.y - 70, i18n.t('hud:event.ransomPaid', { pts: fmt(pts) }), '#ffd84d', 22);
          this.sfx.chest();
        }
      }
    } else if (era === 'viking') {
      this.updateRaid(dt, tr);
    } else if (era === 'chinese') {
      const spd = Math.hypot(p.vx, p.vy);
      if (tr.anchored) {
        if (p.sailTarget > 0.05) {
          tr.anchored = false;
          tr.anchorT = 0;
          this.addText(p.x, p.y - 60, i18n.t('hud:event.weighAnchor'), '#9fe7ff', 16);
        }
      } else if (p.sailTarget <= 0.05 && spd < 25 && p.sinking < 0) {
        tr.anchorT += dt;
        if (tr.anchorT > 1.2) {
          tr.anchored = true;
          this.addText(p.x, p.y - 60, i18n.t('hud:event.anchoredFort'), '#ffd84d', 17);
          this.fxSparkle(p.x, p.y, 10, '#ffd84d');
        }
      } else {
        tr.anchorT = 0;
      }
    } else if (era === 'phoenicia') {
      const isle = this.traitFortIsle(560);
      if (isle >= 0) {
        if (tr.cargo === 0) {
          tr.cargo = 1;
          this.addText(p.x, p.y - 60, i18n.t('hud:event.purpleLoaded'), '#d8a0ff', 16);
          this.sfx.coin(3);
        } else {
          const gold = Math.round((120 + this.wave * 40) * this.diff.plunder);
          tr.cargo = 0;
          tr.cargoCool = 4;
          this.stats.gold += gold;
          const pts = this.addLootScore(gold);
          this.addText(p.x, p.y - 60, i18n.t('hud:event.purpleSold', { pts: fmt(pts) }), '#ffd84d', 20);
          this.sfx.chest();
        }
      }
    } else if (era === 'egypt') {
      tr.shoreT -= dt;
      if (tr.shoreT <= 0) {
        tr.shoreT = 2.5;
        this.egyptVolley();
      }
    } else if (era === 'inca') {
      let diving = false;
      for (const z of tr.zones) {
        if (z.kind !== 'spond' || !z.live) continue;
        if (Math.hypot(p.x - z.x, p.y - z.y) < z.r && Math.hypot(p.vx, p.vy) < 60 && p.sinking < 0) diving = true;
      }
      if (diving) {
        tr.diveTick += dt;
        if (tr.diveTick >= 1) {
          tr.diveTick = 0;
          const g = 25 + this.wave * 6;
          this.stats.gold += g;
          this.addText(p.x, p.y - 60, i18n.t('hud:event.diving', { g }), '#ffb0c8', 15);
          this.sfx.coin(2);
        }
      } else {
        tr.diveTick = 0;
      }
    } else if (era === 'greek') {
      this.updateDiekplous(tr);
    } else if (era === 'japanese') {
      if (this.playerGrappled() && tr.msgT <= 0) {
        tr.msgT = 4;
        this.addText(p.x, p.y - 60, i18n.t('hud:event.grappled'), '#ff9a8a', 15);
      }
    } else if (era === 'korea') {
      tr.curT -= dt;
      if (tr.curT <= 0) {
        tr.curT = 30;
        tr.curSign *= -1;
        this.addText(p.x, p.y - 70, i18n.t('hud:event.tideTurns', { dir: tr.curSign > 0 ? i18n.t('hud:event.tideEastGo') : i18n.t('hud:event.tideWestGo') }), '#9fd8ff', 18);
      }
    } else if (era === 'armada') {
      if (tr.galeT > 0) {
        tr.galeT -= dt;
      } else {
        tr.galeCool -= dt;
        if (tr.galeCool <= 0) {
          tr.galeT = 8;
          tr.galeCool = rand(35, 50);
          this.addText(p.x, p.y - 70, i18n.t('hud:event.galeEvent'), '#cfe6ff', 18);
        }
      }
    } else if (era === 'exploration') {
      for (let i = 0; i < this.islands.length; i++) {
        if (tr.charted.includes(i)) continue;
        const is = this.islands[i];
        if (Math.hypot(p.x - is.x, p.y - is.y) < is.maxR + 260) {
          tr.charted.push(i);
          const g = 120 + this.wave * 20;
          this.stats.gold += g;
          const pts = this.addLootScore(g);
          this.addText(p.x, p.y - 60, i18n.t('hud:event.chartedIs', { name: is.settlement.name, pts: fmt(pts) }), '#9fe7ff', 17);
          this.sfx.chest();
        }
      }
    }
    // once-a-second chores shared by the shore-bound eras
    tr.fortT -= dt;
    if (tr.fortT <= 0) {
      tr.fortT = 1;
      if (era === 'portugal') this.portugalFort();
      if (era === 'macedon') this.macedonCrush(tr);
    }
  }

  /** Nearest inhabited, un-ruined, non-hostile fort island within `reach`. */
  protected traitFortIsle(reach: number): number {
    const p = this.player;
    for (let i = 0; i < this.islands.length; i++) {
      const is = this.islands[i];
      const st = is.settlement;
      if (!st.inhabited || st.hostile || !st.fortress || st.fortress.ruined) continue;
      if (Math.hypot(p.x - is.x, p.y - is.y) < is.maxR + reach) return i;
    }
    return -1;
  }

  protected portugalFort() {
    if (this.traitFortIsle(600) < 0) return;
    const p = this.player;
    if (p.sinking >= 0) return;
    p.hp = Math.min(p.maxHp, p.hp + 3);
    this.water = Math.min(this.maxWater, this.water + 2);
    this.food = Math.min(this.maxFood, this.food + 2);
    this.fxSparkle(p.x + rand(-20, 20), p.y + rand(-14, 14), 1, '#7dff9a');
  }

  protected macedonCrush(tr: TraitState) {
    if (tr.crushId < 0) return;
    let found: Ship | null = null;
    for (const s of this.ships) if (s.id === tr.crushId) found = s;
    if (!found || found.sinking >= 0 || found.captured) {
      tr.crushId = -1;
      return;
    }
    const p = this.player;
    const lim = (p.def.length + found.def.length) * 0.5;
    if (Math.hypot(found.x - p.x, found.y - p.y) > lim * 1.1) {
      tr.crushId = -1;
      return;
    }
    this.damageShip(found, 45, true);
    this.fxHit(found.x, found.y, rand(0, TAU), 1.2);
    if (tr.msgT <= 0) {
      tr.msgT = 2;
      this.addText(found.x, found.y - 30, i18n.t('hud:event.crushed'), '#ffb347', 16);
    }
  }

  /** Pharaoh's archers loose from the nearest friendly shore. */
  protected egyptVolley() {
    const p = this.player;
    if (p.sinking >= 0) return;
    let foe: Ship | null = null;
    let bd = 700;
    for (const s of this.ships) {
      if (s.team !== 1 || s.sinking >= 0 || s.captured) continue;
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < bd) {
        bd = d;
        foe = s;
      }
    }
    if (!foe) return;
    let shore: { x: number; y: number } | null = null;
    for (const is of this.islands) {
      const st = is.settlement;
      if (!st.inhabited || st.hostile) continue;
      if (Math.hypot(p.x - is.x, p.y - is.y) > is.maxR + 850) continue;
      shore = { x: is.x, y: is.y };
      break;
    }
    if (!shore) return;
    const target = foe as Ship;
    for (let i = 0; i < 3; i++) {
      const a = Math.atan2(target.y - shore.y, target.x - shore.x) + rand(-0.09, 0.09);
      const spd = 560;
      const dist = Math.hypot(target.x - shore.x, target.y - shore.y);
      const life = dist / spd + 0.3;
      this.balls.push({
        projectile: 'arrow', x: shore.x, y: shore.y,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        life, max: life, team: 0, dmg: 8, chain: false, small: true, mortar: false,
      });
    }
    if (this.ensureTraits().msgT <= 0) {
      this.ensureTraits().msgT = 6;
      this.addText(p.x, p.y - 60, i18n.t('hud:event.pharaoh'), '#ffe066', 14);
    }
  }

  /** Strandhögg: beached raiding, and the locals rising to meet it. */
  protected updateRaid(dt: number, tr: TraitState) {
    const p = this.player;
    const spd = Math.hypot(p.vx, p.vy);
    if (!tr.raiding) {
      const ashore = this.traitNearIsland(p.x, p.y, 46) >= 0;
      if (ashore && spd < 50 && p.sailTarget < 0.35 && p.sinking < 0) {
        tr.raidT += dt;
        if (tr.raidT > 1) {
          tr.raiding = true;
          tr.raidT = 0;
          tr.raidTick = 0;
          tr.raidSpawned = false;
          this.addText(p.x, p.y - 70, i18n.t('hud:event.strandhogg'), '#ffb347', 18);
        }
      } else {
        tr.raidT = 0;
      }
      return;
    }
    if (p.sailTarget > 0.35 || p.sinking >= 0) {
      tr.raiding = false;
      tr.raidT = 0;
      if (p.sinking < 0) this.addText(p.x, p.y - 60, i18n.t('hud:event.backShip'), '#9fe7ff', 16);
      return;
    }
    tr.raidT += dt;
    tr.raidTick += dt;
    if (tr.raidTick >= 1) {
      tr.raidTick = 0;
      const g = 15 + this.wave * 5;
      this.stats.gold += g;
      this.water = Math.min(this.maxWater, this.water + 3);
      this.food = Math.min(this.maxFood, this.food + 3);
      if (Math.floor(tr.raidT) % 3 === 0) {
        this.addText(p.x, p.y - 60, i18n.t('hud:event.raidGold', { g }), '#ffb347', 14);
        this.sfx.coin(2);
      }
    }
    if (tr.raidT > 8 && !tr.raidSpawned) {
      tr.raidSpawned = true;
      this.addText(p.x, p.y - 80, i18n.t('hud:event.localsRise'), '#ff9a8a', 20);
      for (let i = 0; i < 2; i++) {
        const a = rand(0, TAU);
        const x = clamp(p.x + Math.cos(a) * 420, -WORLD + 200, WORLD - 200);
        const y = clamp(p.y + Math.sin(a) * 420, -WORLD + 200, WORLD - 200);
        const c = this.makeShip('warCanoe', x, y, Math.atan2(p.y - y, p.x - x));
        this.anchorNative(c, undefined, 1.4);
        this.ships.push(c);
      }
    }
  }

  /** Diekplous: crossing an enemy's side at speed shocks her crew. */
  protected updateDiekplous(tr: TraitState) {
    const p = this.player;
    if (p.sinking >= 0) return;
    const spd = Math.hypot(p.vx, p.vy);
    for (const e of this.ships) {
      if (e.team !== 1 || e.sinking >= 0 || e.captured || e.surrendered) continue;
      const d = Math.hypot(p.x - e.x, p.y - e.y);
      const ts = this.tsOf(e);
      if (d > 260) {
        ts.side = 0;
        continue;
      }
      if (d > 175) continue;
      const cross = Math.cos(e.angle) * (p.y - e.y) - Math.sin(e.angle) * (p.x - e.x);
      const side = cross > 12 ? 1 : cross < -12 ? -1 : 0;
      if (side === 0) continue;
      if (ts.side !== 0 && side !== ts.side && spd > 165) {
        e.reloadL = Math.max(e.reloadL, e.reloadTime);
        e.reloadR = Math.max(e.reloadR, e.reloadTime);
        this.maybeSurrender(e);
        this.addText(e.x, e.y - 30, i18n.t('hud:event.diekplous'), '#9fd8ff', 20);
        this.fxSparkle(e.x, e.y, 8, '#9fd8ff');
        ts.side = side;
        if (tr.msgT <= 0) {
          tr.msgT = 3;
          this.sfx.splash(0.8, 0);
        }
      } else if (ts.side === 0) {
        ts.side = side;
      }
    }
  }

  protected playerGrappled(): boolean {
    if (this.eraId !== 'japanese') return false;
    const p = this.player;
    for (const s of this.ships) {
      if (s.team !== 1 || s.sinking >= 0 || s.captured || s.surrendered) continue;
      if (Math.hypot(s.x - p.x, s.y - p.y) < 150) return true;
    }
    return false;
  }

  // ================================================================ wind & sea
  /** A forced wind heading for the monsoon seas, else null (free wind). */
  protected traitWind(): number | null {
    if (this.eraId === 'arab') return monsoonAngle(this.wave, 2.3, -0.8);
    if (this.eraId === 'portugal') return monsoonAngle(this.wave, 1.1, -2.0);
    return null;
  }

  protected override windFactor(a: number, oared = false): number {
    const base = super.windFactor(a, oared);
    // lateen rigs run gloriously before the monsoon
    if (this.eraId === 'arab' && !oared) {
      const c = (1 + Math.cos(angDiff(a, this.windAngle))) * 0.5;
      if (c > 0.8) return Math.min(1.2, base * 1.18);
    }
    return base;
  }

  protected traitPlayerRange(): number {
    if (this.eraId === 'macedon') return 1.6;
    if (this.eraId === 'chinese' && this.ensureTraits().anchored) return 1.2;
    return 1;
  }

  protected traitSpeedMult(s: Ship): number {
    const tr = this.ensureTraits();
    let m = 1;
    if (s === this.player) {
      if (this.eraId === 'viking' && tr.raiding) return 0;
      if (this.eraId === 'chinese' && tr.anchored) return 0;
      if (this.eraId === 'ottoman') {
        if (tr.sprintT > 0) return 2;
        if (tr.sprintCool > 24) m *= 0.85; // blown oars
      }
      if (this.playerGrappled()) m *= 0.65;
    }
    if (s.team === 1 && deepDraft(s.def)) {
      for (const z of tr.zones) {
        if (!z.live || (z.kind !== 'sand' && z.kind !== 'reef')) continue;
        if (Math.hypot(s.x - z.x, s.y - z.y) < z.r) m *= z.slow;
      }
    }
    return m;
  }

  /** Currents, walls and water hazards on one hull. Called from ship physics. */
  protected traitWater(s: Ship, dt: number) {
    const tr = this.ensureTraits();
    if (s.sinking >= 0 || s.dead) return;
    const era = this.eraId;
    // walls: the chain, causeways, narrows — solid to every keel
    for (const z of tr.zones) {
      if (z.kind !== 'wall' || !z.live || z.x2 === undefined || z.y2 === undefined) continue;
      const hw = (z.w ?? 40) + s.def.length * 0.28;
      const c = segClosest(s.x, s.y, z.x, z.y, z.x2, z.y2);
      if (c.d < hw) {
        const pen = hw - c.d;
        s.x += c.nx * pen;
        s.y += c.ny * pen;
        const vn = s.vx * c.nx + s.vy * c.ny;
        if (vn < 0) {
          s.vx -= vn * c.nx * 1.5;
          s.vy -= vn * c.ny * 1.5;
          if (-vn > 120 && s === this.player && this.screen === 'playing' && tr.msgT <= 0) {
            tr.msgT = 2;
            this.hurtPlayer(4, -c.nx, -c.ny, true);
            this.addText(s.x, s.y - 44, era === 'byzantium' ? i18n.t('hud:event.chain') : i18n.t('hud:event.shoal'), '#ff9a8a', 16);
          }
        }
      }
    }
    // currents: lanes, the Myeongnyang tide, gales
    let px = 0;
    let py = 0;
    for (const cu of tr.currents) {
      const d = Math.hypot(s.x - cu.x, s.y - cu.y);
      if (d > cu.r) continue;
      const f = 1 - d / cu.r;
      px += cu.dx * cu.str * f;
      py += cu.dy * cu.str * f;
    }
    if (era === 'korea') {
      const mass = s === this.player ? 0.25 : 1; // the turtle ship holds her water
      px += tr.curSign * 130 * mass;
    }
    if (tr.galeT > 0) {
      px += this.windX * 170;
      py += this.windY * 170;
    } else if (era === 'chola' && this.wave >= 2 && this.wave % 2 === 0) {
      px += this.windX * 60;
      py += this.windY * 60;
    }
    s.x += px * dt;
    s.y += py * dt;
    // circle hazards
    for (const z of tr.zones) {
      if (!z.live || z.kind === 'wall' || z.kind === 'spond') continue;
      if (z.side === 'foe' && s.team !== 1) continue;
      if (z.kind === 'stakes' && !tideIsLow(tr.t)) continue; // drowned at high water
      const reach = z.r + s.def.length * 0.3;
      if (Math.hypot(s.x - z.x, s.y - z.y) > reach) continue;
      if (z.kind === 'mine') {
        z.live = false;
        this.fxExplosion(z.x, z.y, 0.9);
        this.sfx.explosion(Math.max(0.5, this.volAt(z.x, z.y)), this.panAt(z.x));
        if (s === this.player) {
          const d = Math.hypot(s.x - z.x, s.y - z.y) || 1;
          this.hurtPlayer(52, (s.x - z.x) / d, (s.y - z.y) / d, false);
          this.addText(s.x, s.y - 44, i18n.t('hud:combat.mine'), '#ff9a8a', 22);
        } else {
          this.damageShip(s, 78, true);
          this.addText(s.x, s.y - 30, i18n.t('hud:combat.mined'), '#ffb347', 18);
        }
        continue;
      }
      // stakes, sand and reef only trouble deep keels — boats skim over
      if (!deepDraft(s.def)) continue;
      if (z.dps > 0) {
        this.damageShip(s, z.dps * dt, s.team === 1);
        if (z.kind === 'stakes' && tr.msgT <= 0 && Math.random() < dt * 2) {
          tr.msgT = 2.5;
          this.addText(s.x, s.y - 30, i18n.t('hud:event.impaled'), '#ffb347', 18);
        }
      }
    }
  }

  /** Hull-to-hull era business: the corvus, the Sixteen's crush. */
  protected traitContact(a: Ship, b: Ship) {
    this.ensureTraits();
    if (a.team === b.team) return;
    const p = this.player;
    if (a !== p && b !== p) return;
    const foe = a === p ? b : a;
    if (foe.sinking >= 0 || foe.captured || foe.peaceful) return;
    if (this.eraId === 'roman') {
      foe.slowTimer = Math.max(foe.slowTimer, 2);
      if (foe.surrendered) {
        this.resolveBoarding(foe); // the bridge is down — walk across
      } else if (this.tr.msgT <= 0) {
        this.tr.msgT = 3;
        this.addText(foe.x, foe.y - 30, i18n.t('hud:event.corvus'), '#ffe066', 15);
      }
    } else if (this.eraId === 'macedon') {
      if (!foe.surrendered && foe.def.length < 50) this.tr.crushId = foe.id;
    }
  }

  // ================================================================ sight & fire
  protected traitNight(): boolean {
    return this.eraId === 'ww2' && isNightWave(this.wave);
  }

  protected traitShipHidden(s: Ship): boolean {
    this.ensureTraits();
    if (this.eraId === 'ww1' && this.tsOf(s).sub === 1 && this.tr.revealT <= 0) return true;
    if (this.eraId === 'egypt' && s.team === 1 && s.sinking < 0 && !s.captured) {
      const small = s.def.oared && (s.def.native || s.def.length <= 60);
      if (small && Math.hypot(s.x - this.player.x, s.y - this.player.y) > 450) {
        if (this.traitNearIsland(s.x, s.y, 420) >= 0) return true; // reeds
      }
    }
    return false;
  }

  protected traitSeesPlayer(s: Ship): boolean {
    const d = Math.hypot(s.x - this.player.x, s.y - this.player.y);
    if (this.eraId === 'golden' && !this.ensureTraits().firstShot && d > 520) return false;
    if (this.traitNight() && d > s.range * 0.6 + 120) return false;
    return true;
  }

  protected traitSightRange(s: Ship): number {
    if (this.traitNight()) return s.range * 0.55;
    return s.range * 0.95;
  }

  /** Submerged boats run for the player and never shoot. True = handled. */
  protected traitSubAI(s: Ship, _dt: number, dist: number, toP: number): boolean {
    if (this.eraId !== 'ww1') return false;
    const ts = this.tsOf(s);
    if (ts.sub !== 1) return false;
    this.steer(s, toP, 0.55);
    if (dist < 420) {
      ts.sub = 2;
      s.sailTarget = 1;
      this.addText(s.x, s.y - 34, i18n.t('hud:event.subSurfaced'), '#9fd8ff', 20);
      this.fxSplash(s.x, s.y, 1.4);
      this.sfx.splash(0.9, this.panAt(s.x));
    }
    return true;
  }

  protected traitBallHits(b: Ball, s: Ship): boolean {
    void b;
    // a submerged boat is under the shot — ram her or depth-charge her
    if (this.eraId === 'ww1' && this.tsOf(s).sub === 1) return false;
    return true;
  }

  /** All era shot modifiers in one place. Ball position stands for the firer. */
  protected traitShotDamage(b: Ball, tgt: Ship, dmg: number): number {
    const tr = this.ensureTraits();
    const era = this.eraId;
    let m = 1;
    if (era === 'napoleonic') {
      m *= gaugeMult(b.x, b.y, tgt.x, tgt.y, this.windAngle);
      if (b.team === 0 && tr.signalT > 0) m *= 1.25;
    } else if (era === 'predread' && b.team === 0) {
      m *= rakeMult(b.x, b.y, tgt.x, tgt.y, tgt.angle);
      const was = tr.bracketId === tgt.id && tr.bracketT > 0;
      tr.bracketId = tgt.id;
      tr.bracketT = 6;
      if (was) m *= 1.2;
    } else if (era === 'ironclad') {
      m *= armorMult(tgt.angle, b.x, b.y, tgt.x, tgt.y);
    }
    if (era === 'maori' && b.team === 0 && tr.mana > 0) m *= 1 + tr.mana * 0.08;
    if (era === 'chinese' && b.team === 0 && tr.anchored) m *= 1.5;
    if (era === 'ww2' && b.team === 1 && this.traitNight()) m *= 0.8;
    return dmg * m;
  }

  /** Hormuz missiles home unless the victim turns hard across them. */
  protected traitMissile(b: Ball, dt: number) {
    if (this.eraId !== 'hormuz' || b.team !== 1 || b.projectile !== 'missile') return;
    const p = this.player;
    if (p.sinking >= 0) return;
    const tr = this.ensureTraits();
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const d = Math.hypot(dx, dy);
    if (d > 640) return;
    if (Math.abs(p.angVel) > 1.05 && d < 430 && tr.lockCool <= 0) {
      // break the lock: she flies on straight and dumb
      const sp = Math.hypot(b.vx, b.vy) || 1;
      const veer = Math.atan2(b.vy, b.vx) + (p.angVel > 0 ? 0.5 : -0.5);
      b.vx = Math.cos(veer) * sp;
      b.vy = Math.sin(veer) * sp;
      tr.lockCool = 2.5;
      this.addText(p.x, p.y - 60, i18n.t('hud:event.lockBroken'), '#7dff9a', 20);
      this.sfx.coin(5);
      return;
    }
    const cur = Math.atan2(b.vy, b.vx);
    const want = Math.atan2(dy, dx);
    const turn = clamp(angDiff(cur, want), -1, 1) * Math.min(1, dt * 2.6);
    const sp = Math.hypot(b.vx, b.vy) || 1;
    const na = cur + turn;
    b.vx = Math.cos(na) * sp;
    b.vy = Math.sin(na) * sp;
    if (tr.msgT <= 0 && d < 520) {
      tr.msgT = 1.5;
      this.addText(p.x, p.y - 60, i18n.t('hud:event.missileLock'), '#ff9a8a', 18);
      this.flashRed = Math.min(0.7, this.flashRed + 0.15);
    }
  }

  protected traitOnFired(s: Ship) {
    if (this.eraId === 'golden' && s.team === 0) this.ensureTraits().firstShot = true;
  }

  protected traitBoardRange(): number {
    return this.eraId === 'lepanto' ? BOARD_RANGE * 1.7 : BOARD_RANGE;
  }

  protected traitSlick(sl: Slick, dt: number) {
    // the burning sea drifts downwind off the Horn
    if (this.eraId !== 'byzantium') return;
    sl.x += this.windX * 46 * dt;
    sl.y += this.windY * 46 * dt;
  }

  protected traitSlickLife(): number {
    return this.eraId === 'byzantium' ? 1.7 : 1;
  }

  // ================================================================ fortunes
  protected traitOnSunk(s: Ship, byPlayer: boolean) {
    const tr = this.ensureTraits();
    if (s.team !== 1) return;
    tr.kills++;
    const era = this.eraId;
    if (era === 'golden') {
      if (byPlayer && !s.def.trader && !s.peaceful && !s.def.treasure) {
        tr.bounty = Math.min(10, tr.bounty + 1);
        this.addText(this.player.x, this.player.y - 70, i18n.t('hud:status.bountyEvent', { n: tr.bounty }), '#ffd84d', 17);
      }
    } else if (era === 'maori') {
      if (byPlayer) {
        const k = s.def.kind;
        tr.utu[k] = (tr.utu[k] ?? 0) + 1;
        if (this.tsOf(s).marked) {
          tr.mana = Math.min(5, tr.mana + 1);
          tr.manaT = 20;
          this.addText(this.player.x, this.player.y - 70, i18n.t('hud:event.utuAvenged', { n: tr.mana }), '#7dff9a', 18);
        }
      }
    } else if (era === 'hawaii') {
      if (byPlayer && s.homeIsland) {
        const idx = this.islands.indexOf(s.homeIsland);
        if (idx >= 0 && !tr.vassal.includes(idx)) {
          tr.vassalKills[idx] = (tr.vassalKills[idx] ?? 0) + 1;
          if (tr.vassalKills[idx] >= 3) {
            tr.vassal.push(idx);
            s.homeIsland.settlement.hostile = false;
            s.homeIsland.settlement.anger = 0;
            s.homeIsland.settlement.calm = 0;
            this.addText(s.homeIsland.x, s.homeIsland.y - 60, i18n.t('hud:event.yields', { name: s.homeIsland.settlement.name }), '#ffd84d', 20);
            this.sfx.fanfare();
          }
        }
      }
    } else if (era === 'hormuz') {
      if (byPlayer && s.peaceful) {
        const fine = Math.round(400 * this.wave * this.diff.plunder);
        this.score = Math.max(0, this.score - fine);
        this.waveQueue.push('usPatrol');
        this.addText(this.player.x, this.player.y - 70, i18n.t('hud:event.neutralTanker', { fine: fmt(fine) }), '#ff9a8a', 18);
      }
    }
  }

  protected traitOnCapture(s: Ship) {
    const tr = this.ensureTraits();
    const era = this.eraId;
    if (era === 'somali' && (s.def.trader || s.def.treasure)) {
      tr.ransomT = 25;
      tr.ransomRate = (18 + this.wave * 7) * this.diff.plunder;
      tr.diveTick = 0;
      this.addText(s.x, s.y - 56, i18n.t('hud:combat.hostage'), '#ffd84d', 20);
    }
    if (era === 'ottoman' || era === 'lepanto') {
      const p = this.player;
      p.crew = Math.min(150, p.crew + 6);
      p.maxCrew = Math.max(p.maxCrew, Math.ceil(p.crew));
      this.addText(p.x, p.y - 130, i18n.t('hud:combat.freedOarsmen', { n: 6 }), '#7dff9a', 15);
    }
  }

  protected traitLootMult(s: Ship): number {
    const tr = this.ensureTraits();
    const era = this.eraId;
    let m = 1;
    if (era === 'golden' && (s.def.trader || s.def.treasure)) m *= 1 + tr.bounty * 0.08;
    if (era === 'chola') {
      if (s.def.trader || s.def.treasure || s.isBoss) m *= 2;
      if (this.wave >= 2 && this.wave % 2 === 0) m *= 1.15; // storm pay
    }
    if (era === 'ww2' && this.traitNight()) m *= 1.25;
    if (era === 'maori' && this.tsOf(s).marked) m *= 1.5;
    return m;
  }

  protected traitWaveBonusMult(): number {
    return this.eraId === 'ww2' && this.traitNight() ? 1.25 : 1;
  }

  protected traitSupplyMult(): number {
    return this.eraId === 'chola' ? 2 : 1;
  }

  /** Scurvy rots the company when the fruit runs out. */
  protected traitSupplies(dt: number) {
    if (this.eraId !== 'exploration') return;
    if (this.food > 0) return;
    const p = this.player;
    if (p.maxCrew > 10) {
      p.maxCrew = Math.max(10, p.maxCrew - dt * 0.12);
      p.crew = Math.min(p.crew, p.maxCrew);
      const tr = this.ensureTraits();
      if (tr.msgT <= 0) {
        tr.msgT = 12;
        this.addText(p.x, p.y - 70, i18n.t('hud:event.scurvy'), '#ff9a8a', 16);
      }
    }
  }

  // ================================================================ hail & action
  /** Nearest trade hull worth hailing. */
  protected traitHailTarget(): Ship | null {
    const p = this.player;
    let best: Ship | null = null;
    let bd = 340;
    for (const s of this.ships) {
      if (s.team !== 1 || s.sinking >= 0 || s.captured || s.surrendered || s.peaceful) continue;
      if (!s.def.trader && !s.def.treasure) continue;
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best;
  }

  /** F with no prize alongside: hail a trader. */
  protected traitHail() {
    const tr = this.ensureTraits();
    const era = this.eraId;
    if (era !== 'barbary' && era !== 'hanse' && era !== 'chinese' && era !== 'maya') return;
    if (tr.msgT > 0) return;
    const s = this.traitHailTarget();
    if (!s) return;
    const p = this.player;
    tr.msgT = 0.8;
    if (era === 'chinese') {
      const t = 45 + this.wave * 12;
      tr.tribute += t;
      s.peaceful = true;
      s.hitByPlayer = true;
      this.addText(s.x, s.y - 30, i18n.t('hud:event.tributePact', { t }), '#ffd84d', 17);
      this.sfx.chest();
      return;
    }
    if (era === 'maya' && !tr.giftTaken) {
      tr.giftTaken = true;
      s.peaceful = true;
      s.hitByPlayer = true;
      this.water = Math.min(this.maxWater, this.water + 40);
      this.food = Math.min(this.maxFood, this.food + 40);
      this.stats.gold += 150;
      const pts = this.addLootScore(150);
      this.addText(s.x, s.y - 30, i18n.t('hud:event.firstContact', { pts: fmt(pts) }), '#ffd84d', 18);
      this.sfx.chest();
      return;
    }
    const refuse = era === 'hanse' ? 0.25 : 0.12;
    if (Math.random() < refuse) {
      s.hitByPlayer = true; // she runs for it
      if (era === 'hanse') {
        const roster = ERA_ROSTERS[era] ?? SAIL_ROSTER;
        const pool = roster.pool.filter((e) => this.wave >= (e.minWave ?? 0));
        for (let i = 0; i < 2 && pool.length > 0; i++) {
          this.waveQueue.push(pool[(Math.random() * pool.length) | 0].kind);
        }
        this.addText(s.x, s.y - 30, i18n.t('hud:event.convoyRefuses'), '#ff9a8a', 17);
      } else {
        this.addText(s.x, s.y - 30, i18n.t('hud:event.refusesTribute'), '#ff9a8a', 17);
      }
      return;
    }
    const pay = era === 'hanse'
      ? Math.round(hailGold(this.wave, s.def.value, tr.rep) * 1.5)
      : hailGold(this.wave, s.def.value, tr.rep);
    s.peaceful = true;
    s.hitByPlayer = true;
    const per = Math.max(1, Math.round(pay / 4));
    for (let i = 0; i < 4; i++) {
      const a = rand(0, TAU);
      this.addPickup(s.x, s.y, Math.cos(a) * 120, Math.sin(a) * 120, 0, per);
    }
    this.addText(s.x, s.y - 30, era === 'hanse' ? i18n.t('hud:event.tollPaid', { pay: fmt(pay) }) : i18n.t('hud:event.tributePaid', { pay: fmt(pay) }), '#ffd84d', 17);
    this.sfx.coin(4);
    void p;
  }

  /** T: the era's hand on the tiller — sprint, anchor, teppo. */
  protected traitAction() {
    const tr = this.ensureTraits();
    const p = this.player;
    if (p.sinking >= 0 || this.screen !== 'playing') return;
    if (this.eraId === 'ottoman') {
      if (tr.sprintCool > 0 || tr.sprintT > 0) return;
      tr.sprintT = 4;
      tr.sprintCool = 30;
      this.addText(p.x, p.y - 60, i18n.t('hud:event.oarSprintGo'), '#9fd8ff', 22);
      this.fxSplash(p.x - Math.cos(p.angle) * p.def.length * 0.5, p.y - Math.sin(p.angle) * p.def.length * 0.5, 1.2);
    } else if (this.eraId === 'chinese') {
      tr.anchored = !tr.anchored;
      tr.anchorT = 0;
      if (tr.anchored) p.sailTarget = 0;
      this.addText(p.x, p.y - 60, tr.anchored ? i18n.t('hud:event.anchoredFort') : i18n.t('hud:event.weighAnchor'), '#ffd84d', 16);
    } else if (this.eraId === 'japanese') {
      if (tr.teppoCool > 0) return;
      tr.teppoCool = 8;
      const kind = projectileFor(this.eraId);
      const dmg = 30 * (1 + 0.08 * (this.wave - 1));
      for (let i = -1; i <= 1; i++) {
        const a = p.angle + i * 0.06;
        const spd = 700;
        const life = 430 / spd;
        const ox = p.x + Math.cos(p.angle) * p.def.length * 0.5;
        const oy = p.y + Math.sin(p.angle) * p.def.length * 0.5;
        this.balls.push({
          projectile: kind, x: ox, y: oy,
          vx: Math.cos(a) * spd + p.vx * 0.3, vy: Math.sin(a) * spd + p.vy * 0.3,
          life, max: life, team: 0, dmg, chain: false, small: false, mortar: false,
        });
      }
      this.stats.shots += 3;
      this.fxMuzzle(p.x + Math.cos(p.angle) * p.def.length * 0.5, p.y + Math.sin(p.angle) * p.def.length * 0.5, p.angle, true);
      this.sfx.cannon(this.volAt(p.x, p.y), this.panAt(p.x));
      this.addText(p.x, p.y - 60, i18n.t('hud:event.teppoGo'), '#ffe066', 18);
    }
  }

  // ================================================================ sky, HUD, water
  protected traitSkyDark(): number {
    if (this.traitNight()) return 0.52;
    if (this.eraId === 'exploration') return 0.34;
    return 0;
  }

  protected traitSkyLight(): number {
    if (this.traitNight()) return 430;
    if (this.eraId === 'exploration') return 950;
    return 0;
  }

  protected traitHudLine(): string | null {
    const tr = this.ensureTraits();
    const era = this.eraId;
    switch (era) {
      case 'golden':
        return tr.bounty > 0 ? i18n.t('hud:status.bounty', { n: tr.bounty }) : i18n.t('hud:status.falseColours');
      case 'exploration':
        return i18n.t('hud:status.charted', { a: tr.charted.length, b: this.islands.length });
      case 'napoleonic':
        return tr.signalT > 0 ? i18n.t('hud:status.signalFlying') : i18n.t('hud:status.weatherGauge');
      case 'barbary':
      case 'hanse':
        return i18n.t('hud:status.hailTraders');
      case 'viking':
        return tr.raiding ? i18n.t('hud:status.raiding') : null;
      case 'ww1':
        return tr.revealT > 0 ? i18n.t('hud:status.hydroContact') : i18n.t('hud:status.ping', { n: Math.ceil(tr.pingT) });
      case 'ww2':
        return this.traitNight() ? i18n.t('hud:status.nightAction') : i18n.t('hud:status.dayAction');
      case 'hormuz': {
        for (const b of this.balls) {
          if (b.team === 1 && b.projectile === 'missile' && Math.hypot(b.x - this.player.x, b.y - this.player.y) < 700) {
            return i18n.t('hud:status.missileWarn');
          }
        }
        return null;
      }
      case 'vietnam':
        return tideIsLow(tr.t) ? i18n.t('hud:status.tideLow') : i18n.t('hud:status.tideHigh');
      case 'korea':
        return tr.curSign > 0 ? i18n.t('hud:status.tideEast', { n: Math.ceil(tr.curT) }) : i18n.t('hud:status.tideWest', { n: Math.ceil(tr.curT) });
      case 'arab':
      case 'portugal': {
        const idx = Math.floor((Math.max(1, this.wave) - 1) / 3);
        const next = (idx + 1) * 3 + 1;
        return i18n.t('hud:status.monsoon', { dir: idx % 2 === 0 ? i18n.t('hud:status.monsoonOut') : i18n.t('hud:status.monsoonHome'), n: next });
      }
      case 'somali':
        return tr.ransomT > 0 ? i18n.t('hud:status.ransomHold', { rate: Math.round(tr.ransomRate) }) : null;
      case 'maori':
        return tr.mana > 0 ? i18n.t('hud:status.mana', { n: tr.mana }) : i18n.t('hud:status.utu');
      case 'hawaii': {
        const n = this.islands.filter((i) => i.settlement.inhabited).length;
        return i18n.t('hud:status.isles', { a: tr.vassal.length, b: n });
      }
      case 'phoenicia':
        return tr.cargo > 0 ? i18n.t('hud:status.holdFull') : i18n.t('hud:status.holdEmpty');
      case 'chinese':
        if (tr.anchored) return i18n.t('hud:status.anchored');
        return tr.tribute > 0 ? i18n.t('hud:status.tributeWave', { n: tr.tribute }) : i18n.t('hud:status.anchorHail');
      case 'ottoman':
        if (tr.sprintT > 0) return i18n.t('hud:status.sprint');
        return tr.sprintCool > 24 ? i18n.t('hud:status.oarsSpent') : i18n.t('hud:status.oarSprint');
      case 'japanese':
        return tr.teppoCool > 0 ? i18n.t('hud:status.teppo', { n: Math.ceil(tr.teppoCool) }) : i18n.t('hud:status.teppoVolley');
      case 'predread':
        return tr.bracketT > 0 ? i18n.t('hud:status.bracketed') : null;
      case 'falklands':
        return tr.raidWarnT > 0 ? i18n.t('hud:status.raidInbound') : null;
      case 'armada':
        return tr.galeT > 0 ? i18n.t('hud:status.gale') : null;
      case 'chola':
        return this.wave >= 2 && this.wave % 2 === 0 ? i18n.t('hud:status.monsoonStorm') : null;
      case 'lepanto':
      case 'roman':
      case 'greek':
      case 'macedon':
      case 'maya':
      case 'inca':
      case 'byzantium':
      case 'egypt':
      case 'aztec':
      case 'dutch':
      case 'ironclad':
      default:
        return null;
    }
  }

  /** Era waterworks, drawn in the world pass after the slicks. */
  protected renderTraitZones(ctx: CanvasRenderingContext2D) {
    const tr = this.ensureTraits();
    const era = this.eraId;
    const t = this.time;
    const inView = (x: number, y: number, r: number) =>
      x + r > this.vx0 && x - r < this.vx1 && y + r > this.vy0 && y - r < this.vy1;
    // currents: drifting chevrons
    ctx.save();
    ctx.lineWidth = 3;
    for (const cu of tr.currents) {
      if (!inView(cu.x, cu.y, cu.r)) continue;
      ctx.strokeStyle = 'rgba(220,240,255,0.4)';
      const n = 3;
      for (let i = 0; i < n; i++) {
        const f = ((t * 0.25 + i / n) % 1) - 0.5;
        const cx = cu.x + cu.dx * f * cu.r * 1.4 - cu.dy * (i - 1) * 46;
        const cy = cu.y + cu.dy * f * cu.r * 1.4 + cu.dx * (i - 1) * 46;
        const a = Math.atan2(cu.dy, cu.dx);
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(a - 0.5) * 16, cy - Math.sin(a - 0.5) * 16);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx - Math.cos(a + 0.5) * 16, cy - Math.sin(a + 0.5) * 16);
        ctx.stroke();
      }
    }
    // Myeongnyang whirlpools
    if (era === 'korea') {
      for (const [wx, wy] of WHIRLS) {
        if (!inView(wx, wy, 130)) continue;
        ctx.strokeStyle = 'rgba(220,240,255,0.5)';
        for (let k = 0; k < 2; k++) {
          const r = 34 + k * 30;
          const a0 = t * (tr.curSign * 1.6) + k * 2.1;
          ctx.beginPath();
          ctx.arc(wx, wy, r, a0, a0 + 4.2);
          ctx.stroke();
        }
        const a = tr.curSign > 0 ? 0 : Math.PI;
        ctx.beginPath();
        ctx.moveTo(wx - Math.cos(a - 0.4) * 20, wy - Math.sin(a - 0.4) * 20);
        ctx.lineTo(wx, wy);
        ctx.lineTo(wx - Math.cos(a + 0.4) * 20, wy - Math.sin(a + 0.4) * 20);
        ctx.stroke();
      }
    }
    ctx.restore();
    // zones
    for (const z of tr.zones) {
      if (!z.live) continue;
      if (z.kind === 'wall') {
        if (z.x2 === undefined || z.y2 === undefined) continue;
        const mx = (z.x + z.x2) / 2;
        const my = (z.y + z.y2) / 2;
        const len = Math.hypot(z.x2 - z.x, z.y2 - z.y);
        if (!inView(mx, my, len / 2 + 60)) continue;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = era === 'byzantium' ? '#3a3f45' : era === 'aztec' ? '#8a8578' : '#5a6a72';
        ctx.lineWidth = (z.w ?? 40) * 0.8;
        ctx.beginPath();
        ctx.moveTo(z.x, z.y);
        ctx.lineTo(z.x2, z.y2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 3;
        ctx.setLineDash([14, 18]);
        ctx.lineDashOffset = -t * 10;
        ctx.beginPath();
        ctx.moveTo(z.x, z.y);
        ctx.lineTo(z.x2, z.y2);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      if (!inView(z.x, z.y, z.r + 40)) continue;
      if (z.kind === 'stakes') {
        const bare = tideIsLow(tr.t);
        ctx.save();
        ctx.globalAlpha = bare ? 0.95 : 0.3;
        ctx.strokeStyle = bare ? '#4a2f16' : '#7a6a55';
        ctx.lineWidth = 4;
        for (let i = 0; i < 12; i++) {
          const a = z.seed + (i / 12) * TAU;
          const rr = z.r * (0.35 + 0.6 * ((i * 37) % 10) / 10);
          const sx = z.x + Math.cos(a) * rr;
          const sy = z.y + Math.sin(a) * rr;
          ctx.beginPath();
          ctx.moveTo(sx - 7, sy + 9);
          ctx.lineTo(sx + 3, sy - 11);
          ctx.stroke();
        }
        ctx.globalAlpha = bare ? 0.5 : 0.15;
        ctx.strokeStyle = '#ff5a1f';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 10]);
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, TAU);
        ctx.stroke();
        ctx.restore();
      } else if (z.kind === 'mine') {
        ctx.save();
        ctx.fillStyle = '#1c2126';
        ctx.beginPath();
        ctx.arc(z.x, z.y, 12, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#0c0e10';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          const a = z.seed + (i / 6) * TAU;
          ctx.beginPath();
          ctx.moveTo(z.x + Math.cos(a) * 10, z.y + Math.sin(a) * 10);
          ctx.lineTo(z.x + Math.cos(a) * 17, z.y + Math.sin(a) * 17);
          ctx.stroke();
        }
        ctx.fillStyle = Math.sin(t * 5 + z.seed) > 0 ? '#ff3b2a' : '#5a1410';
        ctx.beginPath();
        ctx.arc(z.x, z.y, 4, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (z.kind === 'sand') {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#d8c088';
        ctx.beginPath();
        ctx.ellipse(z.x, z.y, z.r, z.r * 0.72, z.seed, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#b89a64';
        ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.ellipse(z.x, z.y, z.r * (0.4 + k * 0.2), z.r * 0.72 * (0.4 + k * 0.2), z.seed, 0.3, 2.8);
          ctx.stroke();
        }
        ctx.restore();
      } else if (z.kind === 'reef') {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = '#c86a8a';
        ctx.lineWidth = 5;
        ctx.setLineDash([16, 12]);
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, TAU);
        ctx.stroke();
        ctx.restore();
      } else if (z.kind === 'spond') {
        ctx.save();
        for (let i = 0; i < 8; i++) {
          const a = z.seed + (i / 8) * TAU;
          const rr = z.r * (0.3 + 0.55 * ((i * 53) % 10) / 10);
          ctx.fillStyle = i % 2 ? '#ff9ec8' : '#ffb0c8';
          ctx.beginPath();
          ctx.arc(z.x + Math.cos(a) * rr, z.y + Math.sin(a) * rr, 6, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#ff9ec8';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }
    // revealed boats get a dashed ring; raid arrows point at death
    if (era === 'ww1' && tr.revealT > 0) {
      ctx.save();
      ctx.strokeStyle = '#9fd8ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      for (const s of this.ships) {
        if (s.team !== 1 || s.sinking >= 0 || this.tsOf(s).sub !== 1) continue;
        if (!inView(s.x, s.y, 80)) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 46, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (era === 'falklands' && tr.raidWarnT > 0) {
      const p = this.player;
      const a = tr.raidWarnA;
      const x0 = p.x + Math.cos(a) * 420;
      const y0 = p.y + Math.sin(a) * 420;
      ctx.save();
      ctx.strokeStyle = '#ff3b2a';
      ctx.fillStyle = '#ff3b2a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(p.x + Math.cos(a) * 200, p.y + Math.sin(a) * 200);
      ctx.stroke();
      const hx = p.x + Math.cos(a) * 200;
      const hy = p.y + Math.sin(a) * 200;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - Math.cos(a - 0.4) * 26, hy - Math.sin(a - 0.4) * 26);
      ctx.lineTo(hx - Math.cos(a + 0.4) * 26, hy - Math.sin(a + 0.4) * 26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}
