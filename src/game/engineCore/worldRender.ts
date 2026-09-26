import type { Ship } from '../types';
import { drawChest, drawCoin, drawCrate, islandRadiusAt, rr } from '../render';
import { drawFlagArt, drawShip, drawShipShadow } from '../sprites';
import { TAU } from '../math';
import { WORLD, CHASER, FONT, FELL, P_SMOKE, P_FIRE, P_SPARK, P_SPLINTER, P_DROP, P_RING, P_FOAM, P_PLANK, P_BUBBLE, P_SPARKLE, P_FLASH, P_SAND, P_ARROW, ADDITIVE, clamp } from './constants';
import { EngineHud } from './hud';
import { fittingsFor } from '../hullFittings';

/** Frame rendering: water, islands, ships, projectiles, particles, then the HUD on top. */
export abstract class EngineWorldRender extends EngineHud {
  /** Era traits — implemented by `EngineTraits`, above this layer. */
  protected abstract traitShipHidden(s: Ship): boolean;
  protected abstract renderTraitZones(ctx: CanvasRenderingContext2D): void;
  protected abstract traitSkyDark(): number;
  protected abstract traitSkyLight(): number;
  // ================================================================ render
  protected render() {
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
    this.drawSlicks(ctx);
    this.renderTraitZones(ctx);
    this.drawParticles(ctx, 0);
    this.drawPickups(ctx);

    const p = this.player;
    ctx.fillStyle = '#021a2e';
    for (const s of this.ships) if (this.shipVisible(s) && !this.traitShipHidden(s)) drawShipShadow(ctx, s);
    for (const s of this.ships)
      if (s !== p && this.shipVisible(s) && !this.traitShipHidden(s)) drawShip(ctx, s, this.time, this.windAngle, s.falseFlag ?? s.def.faction);
    if (p && !p.dead && this.shipVisible(p)) {
      drawShip(ctx, p, this.time, this.windAngle, p.falseFlag ?? p.def.faction);
      this.drawHullFittings(ctx);
    }
    this.drawBurning(ctx);
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
    // night actions and uncharted fog: darkness with a hole of lamplight
    const skyDark = this.traitSkyDark();
    if (skyDark > 0.01 && inGame && p && !p.dead) {
      const [psx, psy] = this.worldToScreen(p.x, p.y);
      const lr = this.traitSkyLight();
      ctx.fillStyle = `rgba(2,8,20,${(skyDark * 0.55).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
      if (lr > 0) {
        const g = ctx.createRadialGradient(psx, psy, lr * 0.35, psx, psy, Math.max(W, H) * 0.75);
        g.addColorStop(0, 'rgba(2,8,20,0)');
        g.addColorStop(1, `rgba(2,8,20,${skyDark.toFixed(3)})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
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

  protected shipVisible(s: Ship) {
    const r = s.def.length;
    return s.x + r > this.vx0 && s.x - r < this.vx1 && s.y + r > this.vy0 && s.y - r < this.vy1;
  }

  protected drawWater(ctx: CanvasRenderingContext2D) {
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

  protected drawBounds(ctx: CanvasRenderingContext2D) {
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

  protected drawIslands(ctx: CanvasRenderingContext2D) {
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
        const label = `${st.fortress ? '⚓ ' : ''}${st.name} · ${st.hostile ? 'HOSTILE' : 'Peaceful'}`;
        const politics = `${st.fortress ? 'Harbour town · ' : ''}${st.peopleName ?? 'Independent'}${st.allianceName ? ` · ${st.allianceName}` : ''}`;
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

  /**
   * Greek fire on the water: a patch of flame that keeps burning wherever a
   * shot fell short. Drawn under the hulls, so a ship crossing it sails into
   * the fire rather than over it.
   */
  protected drawSlicks(ctx: CanvasRenderingContext2D) {
    const sl = this.slicks;
    if (!sl.length) return;
    const t = this.time;
    const x0 = this.vx0;
    const x1 = this.vx1;
    const y0 = this.vy0;
    const y1 = this.vy1;
    ctx.globalCompositeOperation = 'lighter';
    for (const s of sl) {
      if (s.x < x0 - 80 || s.x > x1 + 80 || s.y < y0 - 80 || s.y > y1 + 80) continue;
      // the flames gutter and lean downwind as the naphtha burns away
      const fade = clamp(s.life / s.max, 0, 1);
      const flick = 0.82 + 0.18 * Math.sin(t * 9 + s.seed);
      const rx = s.r * flick;
      const ry = s.r * (0.62 + 0.12 * Math.sin(t * 7.3 + s.seed * 2));
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rx);
      g.addColorStop(0, `rgba(255,196,96,${0.55 * fade})`);
      g.addColorStop(0.45, `rgba(255,120,40,${0.4 * fade})`);
      g.addColorStop(1, 'rgba(180,40,10,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, rx, ry, Math.atan2(this.windY, this.windX), 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#2b1a12';
    for (const s of sl) {
      if (s.x < x0 - 80 || s.x > x1 + 80 || s.y < y0 - 80 || s.y > y1 + 80) continue;
      const fade = clamp(s.life / s.max, 0, 1);
      ctx.globalAlpha = 0.35 * fade;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.r * 0.85, s.r * 0.5, Math.atan2(this.windY, this.windX), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** A hull on fire glows: a warm light under her decks and up her rigging. */
  protected drawBurning(ctx: CanvasRenderingContext2D) {
    if (!this.ships.length) return;
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.ships) {
      if (!(s.burn > 0) || s.dead || !this.shipVisible(s)) continue;
      const hl = s.def.length * 0.5;
      const flick = 0.75 + 0.25 * Math.sin(this.time * 11 + s.bob);
      for (let i = 0; i < 3; i++) {
        const off = (i - 1) * hl * 0.55;
        const g = hl * 1.25 * flick;
        const x = s.x + Math.cos(s.angle) * off;
        const y = s.y + Math.sin(s.angle) * off;
        ctx.globalAlpha = 0.3 + 0.12 * Math.sin(this.time * 13 + i * 2 + s.bob);
        ctx.drawImage(this.glowWarm, x - g, y - g, g * 2, g * 2);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  protected drawPickups(ctx: CanvasRenderingContext2D) {
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

  /** The player's ram, side spikes and fenders, painted over her hull. */
  protected drawHullFittings(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const { ram, spikes, fenders } = this.pstats;
    if (!p || p.sinking >= 0 || ram + spikes + fenders <= 0) return;
    const kit = fittingsFor(this.eraId);
    const hl = p.def.length / 2;
    const hw = p.def.width / 2;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.lineJoin = 'round';
    if (fenders > 0) {
      // fenders hang along both sides: rope, hide, tyres, bundles
      const n = 2 + fenders;
      ctx.fillStyle = kit.pad;
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < n; i++) {
        const x = -hl * 0.55 + (hl * 1.05 * i) / Math.max(1, n - 1);
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(x, side * (hw + 1.2), 2.6, 1.7, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
    if (spikes > 0) {
      // spikes, blades, hooks or pots: a row of teeth along each rail
      const n = 3 + spikes * 2;
      ctx.fillStyle = kit.metal;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 0.6;
      const len = 3 + spikes;
      for (let i = 0; i < n; i++) {
        const x = -hl * 0.6 + (hl * 1.15 * i) / Math.max(1, n - 1);
        for (const side of [-1, 1]) {
          const y0 = side * (hw - 0.5);
          ctx.beginPath();
          ctx.moveTo(x - 1.6, y0);
          ctx.lineTo(x + 1.2, y0 + side * len);
          ctx.lineTo(x + 1.6, y0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }
    if (ram > 0) {
      // the ram: a wedge past the stem, longer and broader with each refit
      const reach = 6 + ram * 3;
      const base = hw * (0.45 + ram * 0.08);
      const x0 = hl - 4;
      ctx.fillStyle = kit.metal;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, -base);
      ctx.lineTo(x0 + reach, 0);
      ctx.lineTo(x0, base);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.moveTo(x0 + 1, -base * 0.5);
      ctx.lineTo(x0 + reach - 1.5, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  protected drawReloadArcs(ctx: CanvasRenderingContext2D) {
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

  protected drawBalls(ctx: CanvasRenderingContext2D) {
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
      if (b.projectile === 'missile') {
        // a sea-skimmer: white body, burning booster, drawn along its flight line
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.atan2(b.vy, b.vx));
        ctx.strokeStyle = 'rgba(255,160,70,0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(-6, 0);
        ctx.stroke();
        ctx.fillStyle = '#e8ecef';
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(-6, -2.6);
        ctx.lineTo(-6, 2.6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#c9403b';
        ctx.fillRect(-6, -2.6, 3.5, 5.2);
        ctx.restore();
        continue;
      }
      ctx.save();
      ctx.translate(b.x, b.y);
      if (b.projectile === 'stone') {
        // a rough rock, tumbling as it flies
        ctx.rotate(Math.atan2(b.vy, b.vx) + this.time * 3.5);
        ctx.fillStyle = '#9a938a';
        ctx.beginPath();
        ctx.moveTo(-4.5, -2.4); ctx.lineTo(1.4, -4.2); ctx.lineTo(5, -0.8);
        ctx.lineTo(3, 3.4); ctx.lineTo(-2.4, 3.8); ctx.lineTo(-5.2, 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(60,55,48,0.85)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.moveTo(-1.6, -2.6); ctx.lineTo(1.4, -3.4); ctx.lineTo(1.8, -1.6); ctx.closePath();
        ctx.fill();
        ctx.restore();
        continue;
      }
      if (b.projectile === 'greekFire') {
        // a jet of burning naphtha: a blob of flame with a tail of it behind
        ctx.rotate(Math.atan2(b.vy, b.vx));
        const flick = 0.85 + Math.sin(this.time * 40 + b.x * 0.1) * 0.15;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,120,40,0.85)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9 * flick, 4.6 * flick, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffd98a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 * flick, 2.6 * flick, 0, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(255,150,60,0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-20 - flick * 4, 0);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      ctx.rotate(Math.atan2(b.vy, b.vx));
      const fireArrow = b.projectile === 'fireArrow';
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
      if (fireArrow) {
        // a wad of burning tow behind the head
        ctx.globalCompositeOperation = 'lighter';
        const flick = 0.8 + Math.sin(this.time * 34 + b.y * 0.1) * 0.2;
        ctx.fillStyle = 'rgba(255,150,50,0.9)';
        ctx.beginPath();
        ctx.ellipse(3, 0, 4.6 * flick, 3 * flick, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffe6a8';
        ctx.beginPath();
        ctx.ellipse(3, 0, 2 * flick, 1.5 * flick, 0, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();
    }
  }

  protected drawParticles(ctx: CanvasRenderingContext2D, layer: number) {
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

  protected drawStreaks(ctx: CanvasRenderingContext2D) {
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

  protected drawEnemyBars(ctx: CanvasRenderingContext2D, scale: number) {
    const inv = 1 / scale;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const s of this.ships) {
      if (s.team !== 1 || s.sinking >= 0 || s.captured || !this.shipVisible(s) || this.traitShipHidden(s)) continue;
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

  protected drawTexts(ctx: CanvasRenderingContext2D) {
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
}
