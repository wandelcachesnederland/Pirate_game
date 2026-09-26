import { type Ship, isSteelHull } from '../types';
import { regionById } from '../worlds';
import { drawCoin, rr } from '../render';
import { drawFlagArt } from '../sprites';
import { TAU } from '../math';
import { traitDef } from '../eraTraits';
import { STREAK_TIME, FONT, FELL, clamp } from './constants';
import { EngineFx } from './fx';

/** Screen-space HUD: score, stores, compass, prompts, banners and hints. */
export abstract class EngineHud extends EngineFx {
  /** Implemented by the wave logic in `Engine`. */
  protected abstract countEnemies(): number;
  protected abstract findBoss(): Ship | null;
  /** Era trait status — implemented by `EngineTraits`, above this layer. */
  protected abstract traitHudLine(): string | null;

  protected outlined(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, lw = 4) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = lw;
    ctx.strokeStyle = 'rgba(22,10,3,0.92)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  protected getScoreStr() {
    const v = Math.round(this.displayScore);
    if (v !== this.scoreStrVal) {
      this.scoreStrVal = v;
      this.scoreStr = v.toLocaleString('en-US');
    }
    return this.scoreStr;
  }

  protected drawGoldPopup(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    if (this.goldPopupTimer <= 0 || this.goldPopup <= 0 || p.sinking >= 0) return;
    const [sx, sy0] = this.worldToScreen(p.x, p.y);
    const u = this.ui;
    const a = Math.min(1, this.goldPopupTimer * 3);
    const pop = 1 + this.goldPopupPulse * 0.3;
    const sy = sy0 - 48 * u - (1 - a) * 12;
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(21 * u * pop)}px ${FONT}`;
    const txt = `+${this.goldPopup.toLocaleString('en-US')}`;
    this.outlined(ctx, txt, sx + 8 * u, sy, '#ffe066', 4);
    const tw = ctx.measureText(txt).width;
    drawCoin(ctx, sx + 8 * u - tw / 2 - 11 * u, sy, this.realTime, 1, 7 * u);
    ctx.globalAlpha = 1;
  }

  protected drawPlunderMarker(ctx: CanvasRenderingContext2D) {
    if (this.wave !== 1 || this.firstHit || this.screen !== 'playing') return;
    const p = this.player;
    let best: Ship | null = null;
    let bd = Infinity;
    for (const s of this.ships) {
      if (s.def.trader !== true || s.sinking >= 0) continue;
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    if (!best) return;
    const [sx, sy] = this.worldToScreen(best.x, best.y);
    if (sx < 0 || sx > this.w || sy < 0 || sy > this.h) return;
    const u = this.ui;
    const bounce = Math.abs(Math.sin(this.realTime * 5)) * 8 * u;
    const y = sy - best.def.length * 0.5 * this.curScale - 22 * u - bounce;
    ctx.fillStyle = '#ffd84d';
    ctx.strokeStyle = 'rgba(28,12,4,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, y + 10 * u);
    ctx.lineTo(sx - 9 * u, y - 3 * u);
    ctx.lineTo(sx + 9 * u, y - 3 * u);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(18 * u)}px ${FONT}`;
    this.outlined(ctx, 'PLUNDER!', sx, y - 16 * u, '#ffd84d', 4);
  }

  protected drawIndicators(ctx: CanvasRenderingContext2D) {
    const W = this.w;
    const H = this.h;
    const sf = this.safe;
    const u = this.ui;
    const m = 24 * u;
    const left = m + sf.l;
    const right = W - m - sf.r;
    const top = m + sf.t;
    const bottom = H - m - sf.b;
    const cx = W / 2;
    const cy = H / 2;
    const p = this.player;
    for (const e of this.ships) {
      if (e.team !== 1 || e.sinking >= 0) continue;
      const [sx, sy] = this.worldToScreen(e.x, e.y);
      if (sx > -10 && sx < W + 10 && sy > -10 && sy < H + 10) continue;
      const dx = sx - cx;
      const dy = sy - cy;
      const tX = dx > 0 ? (right - cx) / dx : dx < 0 ? (left - cx) / dx : Infinity;
      const tY = dy > 0 ? (bottom - cy) / dy : dy < 0 ? (top - cy) / dy : Infinity;
      const tt = Math.min(tX, tY);
      const ix = cx + dx * tt;
      const iy = cy + dy * tt;
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      const size = (e.isBoss ? 14 : 9.5) * u;
      ctx.save();
      ctx.translate(ix, iy);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.globalAlpha = clamp(1.25 - dist / 1700, 0.4, 1);
      ctx.fillStyle = e.surrendered
        ? '#ffffff'
        : e.def.kind === 'fireship'
          ? '#ff8a2a'
          : e.def.trader === true
            ? '#ffd84d'
            : '#ff4b3a';
      ctx.strokeStyle = 'rgba(25,10,3,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.8, -size * 0.78);
      ctx.lineTo(-size * 0.35, 0);
      ctx.lineTo(-size * 0.8, size * 0.78);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  protected drawHUD(ctx: CanvasRenderingContext2D) {
    const u = this.ui;
    const W = this.w;
    const sf = this.safe;
    const p = this.player;
    const narrow = W < 640;
    const x0 = 12 + sf.l;
    const y0 = 10 + sf.t;
    ctx.textBaseline = 'middle';

    // ---- hull
    const barW = narrow ? Math.min(150 * u + 30, W * 0.4) : 210 * u;
    const barH = 18 * u;
    const shake = this.hullShake > 0 ? Math.sin(this.realTime * 70) * 5 * this.hullShake : 0;
    const bx = x0 + shake;
    const by = y0 + 14 * u;
    ctx.font = `${Math.round(14 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, 'HULL', bx + 2, y0 + 4 * u, '#f3e2b3', 3);
    rr(ctx, bx - 3, by - 3, barW + 6, barH + 6, 7 * u);
    ctx.fillStyle = 'rgba(24,12,4,0.82)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d9a441';
    ctx.stroke();
    const ratio = clamp(p.hp / p.maxHp, 0, 1);
    const ghost = clamp(p.ghostHp / p.maxHp, 0, 1);
    if (ghost > 0.005) {
      ctx.fillStyle = '#fbe9b7';
      rr(ctx, bx, by, barW * ghost, barH, 4 * u);
      ctx.fill();
    }
    if (ratio > 0.005) {
      if (ratio > 0.55) ctx.fillStyle = '#d8432f';
      else if (ratio > 0.3) ctx.fillStyle = '#e0662a';
      else ctx.fillStyle = Math.sin(this.realTime * 10) > 0 ? '#ff3b2a' : '#b8241a';
      rr(ctx, bx, by, barW * ratio, barH, 4 * u);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(bx + 2, by + 2, Math.max(0, barW * ratio - 4), barH * 0.32);
    }
    ctx.font = `${Math.round(13 * u)}px ${FONT}`;
    ctx.textAlign = 'right';
    this.outlined(ctx, `${Math.ceil(p.hp)} / ${Math.round(p.maxHp)}`, bx + barW - 5, by + barH / 2 + 1, '#fff6e0', 3);

    // ---- reload
    const ry = by + barH + 13 * u;
    const segW = (barW - 8) / 2;
    this.drawReloadBar(ctx, bx, ry, segW, 'PORT', p.reloadL, p.reloadTime);
    this.drawReloadBar(ctx, bx + segW + 8, ry, segW, 'STBD', p.reloadR, p.reloadTime);

    // ---- compass + sail gauge
    const cr = 26 * u;
    const ccx = bx + cr + 3;
    const ccy = ry + 16 * u + cr;
    this.drawCompass(ctx, ccx, ccy, cr);
    const gx = ccx + cr + 12 * u;
    const gh = cr * 2;
    const gw = 7 * u;
    const gy = ccy - cr;
    ctx.fillStyle = 'rgba(24,12,4,0.75)';
    ctx.fillRect(gx - 2, gy - 2, gw + 4, gh + 4);
    ctx.fillStyle = '#f3e2b3';
    ctx.fillRect(gx, gy + gh * (1 - p.sail), gw, gh * p.sail);
    ctx.font = `${Math.round(11 * u)}px ${FONT}`;
    ctx.textAlign = 'center';
    this.outlined(
      ctx,
      p.def.oared ? 'OARS' : isSteelHull(p.def.hullStyle) ? 'STEAM' : 'SAIL',
      gx + gw / 2,
      ccy + cr + 9 * u,
      '#f3e2b3',
      3,
    );
    const kn = Math.round(Math.hypot(p.vx, p.vy) / 14);
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(13 * u)}px ${FONT}`;
    this.outlined(ctx, `${kn} kn`, gx + gw + 8 * u, ccy, '#f3e2b3', 3);

    // ---- ship's stores — the manifest, always in sight
    this.drawStores(ctx, bx, ccy + cr + 26 * u, barW);

    // ---- score
    const rx = W - sf.r - 64;
    const pulse = 1 + this.scorePulse * 0.16;
    ctx.textAlign = 'right';
    ctx.font = `${Math.round((narrow ? 28 : 36) * u * pulse)}px ${FONT}`;
    const str = this.getScoreStr();
    const sy = y0 + 18 * u;
    this.outlined(ctx, str, rx, sy, '#ffd84d', 5);
    const tw = ctx.measureText(str).width;
    drawCoin(ctx, rx - tw - 14 * u, sy, this.realTime, 0, 9 * u);
    let my = sy + 30 * u;
    if (this.mult > 1 || this.streakTimer > 0) {
      const mp = 1 + this.multPulse * 0.4;
      ctx.font = `${Math.round(22 * u * mp)}px ${FONT}`;
      const mstr = `x${this.mult}`;
      this.outlined(ctx, mstr, rx, my, this.mult > 1 ? '#ff8a3a' : '#f3e2b3', 4);
      const mw = ctx.measureText(mstr).width;
      ctx.font = `${Math.round(12 * u)}px ${FONT}`;
      this.outlined(ctx, 'STREAK', rx - mw - 6 * u, my + 1, '#e6d3a3', 3);
      const tbw = 80 * u;
      const k = this.streakTimer / STREAK_TIME;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(rx - tbw, my + 12 * u, tbw, 4 * u);
      ctx.fillStyle = '#ff8a3a';
      ctx.fillRect(rx - tbw * k, my + 12 * u, tbw * k, 4 * u);
      my += 28 * u;
    }

    // ---- wave
    const remaining = this.countEnemies() + this.waveQueue.length;
    const waveStr = `Wave ${this.wave}`;
    const remStr = this.waveClearing ? 'Victory!' : `${remaining} ship${remaining === 1 ? '' : 's'} remain`;
    const boss = this.findBoss();
    // the voyage's peril, piped under the wave: skull pips and the rank
    const pipStr = `${'☠'.repeat(this.diff.skulls)} ${this.diff.name}`;
    // campaign line
    const campaignLine = this.campaignActive
      ? `Campaign ${this.campaignIndex + 1}/${this.campaignEras.length} · ${this.campaignWavesClearedInEra}/${this.campaignWavesPerEra} waves`
      : null;
    if (narrow) {
      ctx.textAlign = 'right';
      ctx.font = `${Math.round(17 * u)}px ${FONT}`;
      this.outlined(ctx, `${waveStr} · ${remStr}`, rx, my, '#f3e2b3', 3);
      if (campaignLine) {
        ctx.font = `${Math.round(12 * u)}px ${FONT}`;
        this.outlined(ctx, campaignLine, rx, my + 18 * u, '#7de8c3', 3);
        my += 16 * u;
      }
      if (!boss) {
        ctx.font = `${Math.round(13 * u)}px ${FONT}`;
        this.outlined(ctx, pipStr, rx, my + 19 * u, '#c9a86a', 3);
      }
    } else {
      ctx.textAlign = 'center';
      ctx.font = `${Math.round(26 * u)}px ${FONT}`;
      this.outlined(ctx, waveStr, W / 2, y0 + 16 * u, '#f3e2b3', 4);
      ctx.font = `italic ${Math.round(15 * u)}px ${FELL}`;
      this.outlined(ctx, remStr, W / 2, y0 + 39 * u, '#e6d3a3', 3);
      if (campaignLine) {
        ctx.font = `${Math.round(12 * u)}px ${FONT}`;
        this.outlined(ctx, campaignLine, W / 2, y0 + 56 * u, '#7de8c3', 3);
        if (!boss) {
          ctx.font = `${Math.round(13 * u)}px ${FONT}`;
          this.outlined(ctx, pipStr, W / 2, y0 + 72 * u, '#c9a86a', 3);
        }
      } else if (!boss) {
        ctx.font = `${Math.round(13 * u)}px ${FONT}`;
        this.outlined(ctx, pipStr, W / 2, y0 + 57 * u, '#c9a86a', 3);
      }
    }

    // ---- boss bar
    if (boss) {
      const bw = Math.min(W * 0.5, 320 * u);
      const bh = 10 * u;
      const bxx = W / 2 - bw / 2;
      const byy = y0 + (narrow ? 118 : 62) * u;
      ctx.font = `${Math.round(15 * u)}px ${FONT}`;
      ctx.textAlign = 'center';
      this.outlined(ctx, `☠ ${boss.def.name} ☠`, W / 2, byy - 10 * u, '#ff9a8a', 3);
      ctx.fillStyle = 'rgba(20,10,4,0.85)';
      ctx.fillRect(bxx - 3, byy - 3, bw + 6, bh + 6);
      ctx.fillStyle = '#f7e3a1';
      ctx.fillRect(bxx, byy, (bw * boss.ghostHp) / boss.maxHp, bh);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(bxx, byy, (bw * boss.hp) / boss.maxHp, bh);
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bxx - 3, byy - 3, bw + 6, bh + 6);
    }

    // ---- era trait — the age's signature, always in sight
    const tline = this.traitHudLine();
    if (tline) {
      ctx.textAlign = 'center';
      ctx.font = `${Math.round(13 * u)}px ${FONT}`;
      const ty = narrow ? my + 40 * u : y0 + (boss ? 100 : 76) * u;
      this.outlined(ctx, `${traitDef(this.eraId).name} — ${tline}`, W / 2, ty, '#9fd8ff', 3);
    }
  }

  /** The ship's inventory: crew, water, food, prisoners in irons, colours struck. */
  protected drawStores(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
    const u = this.ui;
    const p = this.player;
    const rowH = 15.5 * u;
    const pad = 7 * u;
    const flagH = 13 * u;
    const regH = 13 * u;
    const h = pad * 2 + rowH * 4 + flagH + regH;
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(14 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, "SHIP'S STORES", x + 2, y - 5 * u, '#f3e2b3', 3);
    rr(ctx, x - 3, y + 4 * u, w + 6, h, 7 * u);
    ctx.fillStyle = 'rgba(24,12,4,0.82)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d9a441';
    ctx.stroke();
    const lx = x + pad;
    const rw = w - pad * 2;
    let ry = y + 4 * u + pad + rowH / 2;
    const crew = Math.max(0, Math.ceil(p.crew));
    this.storeRow(ctx, lx, ry, rw, 'CREW', `${crew}`, '#f3e2b3');
    ry += rowH;
    const wLow = this.water < this.maxWater * 0.25;
    const fLow = this.food < this.maxFood * 0.25;
    const blink = Math.sin(this.realTime * 8) > -0.2;
    this.storeRow(ctx, lx, ry, rw, 'WATER', `${Math.floor(this.water)}`, wLow && blink ? '#ff6a5a' : '#9fd8ff');
    ry += rowH;
    this.storeRow(ctx, lx, ry, rw, 'FOOD', `${Math.floor(this.food)}`, fLow && blink ? '#ff6a5a' : '#ffd88a');
    ry += rowH;
    this.storeRow(ctx, lx, ry, rw, 'PRISONERS', `${this.prisoners}`, '#d8c9a3');
    ry += rowH;
    // colours struck — mini flags of the prizes, newest last
    const flagCy = ry + flagH / 2;
    ctx.font = `${Math.round(11 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, 'FLAGS', lx, flagCy, '#cbb88f', 3);
    const fw = 13 * u;
    const fh = 8 * u;
    const gap = 2.5 * u;
    const maxFit = Math.max(1, Math.floor((rw - 44 * u) / (fw + gap)));
    const shown = this.flags.slice(-maxFit);
    if (shown.length === 0) {
      ctx.font = `${Math.round(12 * u)}px ${FONT}`;
      ctx.textAlign = 'right';
      this.outlined(ctx, '—', lx + rw, flagCy, '#8a7a5a', 3);
    } else {
      let fx = lx + rw - shown.length * (fw + gap) + gap;
      for (const f of shown) {
        ctx.save();
        ctx.translate(fx, flagCy - fh / 2);
        drawFlagArt(ctx, f.faction, fw, fh);
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, fw, fh);
        ctx.restore();
        fx += fw + gap;
      }
      const extra = this.flags.length - shown.length;
      if (extra > 0) {
        ctx.font = `${Math.round(10 * u)}px ${FONT}`;
        ctx.textAlign = 'left';
        this.outlined(ctx, `+${extra}`, lx + 40 * u, flagCy, '#e6d3a3', 3);
      }
    }
    const regCy = ry + flagH + regH / 2;
    ctx.font = `italic ${Math.round(12 * u)}px ${FELL}`;
    ctx.textAlign = 'center';
    this.outlined(ctx, regionById(this.regionId).name, lx + rw / 2, regCy, '#e8c86a', 3);
  }

  protected storeRow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    label: string,
    value: string,
    color: string,
  ) {
    const u = this.ui;
    ctx.font = `${Math.round(11 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, label, x, y, '#cbb88f', 3);
    ctx.font = `${Math.round(14 * u)}px ${FONT}`;
    ctx.textAlign = 'right';
    this.outlined(ctx, value, x + w, y, color, 3);
  }

  /** "Prize alongside!" — the boarding call to action. */
  protected drawBoardPrompt(ctx: CanvasRenderingContext2D) {
    const s = this.boardCandidate;
    if (!s || this.screen !== 'playing') return;
    const u = this.ui;
    const W = this.w;
    const H = this.h;
    // marker over the prize
    const [sx, sy] = this.worldToScreen(s.x, s.y);
    if (sx > -60 && sx < W + 60 && sy > -80 && sy < H + 60) {
      const bounce = Math.abs(Math.sin(this.realTime * 5)) * 8 * u;
      const y = sy - s.def.length * 0.5 * this.curScale - 34 * u - bounce;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(20 * u)}px ${FONT}`;
      this.outlined(ctx, 'BOARD!', sx, y - 14 * u, '#7dff9a', 4);
      ctx.fillStyle = '#7dff9a';
      ctx.strokeStyle = 'rgba(28,12,4,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, y + 10 * u);
      ctx.lineTo(sx - 9 * u, y - 3 * u);
      ctx.lineTo(sx + 9 * u, y - 3 * u);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
    // the offer, bottom-center: her full manifest against the risks
    const V = s.def.value * (1 + 0.1 * (this.wave - 1)) * this.diff.plunder;
    const prize = Math.round(V * 1.25) + 100;
    const touch = this.isTouch || this.input.usedTouch;
    const l1 = `Prize alongside: ${s.def.name} — ${Math.max(0, Math.ceil(s.crew))} men`;
    const l2 = touch
      ? `Tap BOARD for ~${prize.toLocaleString('en-US')} gold + her colours`
      : `Press F to BOARD for ~${prize.toLocaleString('en-US')} gold + her colours`;
    const l3 = 'Full cargo… if her crew plays fair. Beware treachery, scuttling & fever!';
    ctx.font = `${Math.round(17 * u)}px ${FONT}`;
    const need =
      Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width, ctx.measureText(l3).width) + 44 * u;
    // narrow screens: shrink the panel's type to fit instead of spilling past the box
    const su = need > W - 16 ? Math.max(0.5 * u, (u * (W - 16)) / need) : u;
    ctx.font = `${Math.round(17 * su)}px ${FONT}`;
    const bw = Math.min(W - 16, need * (su / u));
    const bh = 74 * su;
    const bx = W / 2;
    const by = H - this.safe.b - (touch ? 330 : 168) * u;
    rr(ctx, bx - bw / 2, by - bh / 2, bw, bh, 12 * su);
    ctx.fillStyle = 'rgba(20,10,4,0.78)';
    ctx.fill();
    ctx.strokeStyle = '#7dff9a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#7dff9a';
    ctx.fillText(l1, bx, by - 22 * su);
    ctx.fillStyle = '#ffd84d';
    ctx.fillText(l2, bx, by + 1 * su);
    ctx.font = `italic ${Math.round(13 * su)}px ${FELL}`;
    ctx.fillStyle = '#e6d3a3';
    ctx.fillText(l3, bx, by + 22 * su);
  }

  protected drawReloadBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, label: string, r: number, total: number) {
    const u = this.ui;
    const h = 6 * u;
    const k = clamp(1 - r / total, 0, 1);
    ctx.font = `${Math.round(11 * u)}px ${FONT}`;
    ctx.textAlign = 'left';
    this.outlined(ctx, label, x, y, k >= 1 ? '#ffd84d' : '#cbb88f', 3);
    const lx = x + 32 * u;
    const lw = Math.max(10, w - 32 * u);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(lx, y - h / 2, lw, h);
    ctx.fillStyle = k >= 1 ? '#ffd84d' : '#f3e2b3';
    ctx.fillRect(lx, y - h / 2, lw * k, h);
  }

  protected drawCompass(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const p = this.player;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(243,226,179,0.93)';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#5b3a1a';
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(91,58,26,0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.74, 0, TAU);
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8;
      const r0 = i % 2 ? r * 0.84 : r * 0.74;
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r * 0.96, Math.sin(a) * r * 0.96);
    }
    ctx.stroke();
    ctx.fillStyle = '#5b3a1a';
    ctx.font = `${Math.round(r * 0.36)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -r * 0.55);
    ctx.fillText('S', 0, r * 0.57);
    ctx.fillText('E', r * 0.56, 0);
    ctx.fillText('W', -r * 0.55, 0);
    const good = (this.windFactor(p.angle, !!p.def.oared || isSteelHull(p.def.hullStyle)) - 0.46) / 0.54;
    ctx.save();
    ctx.rotate(p.angle);
    ctx.fillStyle = good > 0.72 ? '#2f9e44' : good > 0.4 ? '#e0a32a' : '#c0392b';
    ctx.strokeStyle = 'rgba(25,10,3,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 1.08, 0);
    ctx.lineTo(r * 0.8, -r * 0.2);
    ctx.lineTo(r * 0.8, r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.rotate(this.windAngle + Math.sin(this.realTime * 2.2) * 0.05);
    ctx.fillStyle = '#b3261e';
    ctx.strokeStyle = '#4a0d08';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 0.64, 0);
    ctx.lineTo(-r * 0.42, -r * 0.26);
    ctx.lineTo(-r * 0.22, 0);
    ctx.lineTo(-r * 0.42, r * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.font = `${Math.round(11 * this.ui)}px ${FONT}`;
    ctx.textAlign = 'center';
    this.outlined(ctx, 'WIND', cx, cy + r + 9 * this.ui, '#f3e2b3', 3);
  }

  protected drawBanner(ctx: CanvasRenderingContext2D) {
    const b = this.banner;
    if (!b.title || b.t >= b.dur) return;
    const W = this.w;
    const H = this.h;
    const u = this.ui;
    const tIn = Math.min(1, b.t / 0.35);
    const tOut = Math.max(0, (b.t - (b.dur - 0.5)) / 0.5);
    const ease = 1 - Math.pow(1 - tIn, 3);
    const sc = 0.6 + 0.4 * ease + (tIn < 1 ? Math.sin(tIn * Math.PI) * 0.12 : 0);
    ctx.save();
    ctx.globalAlpha = 1 - tOut;
    ctx.translate(W / 2, H * 0.3);
    ctx.scale(sc, sc);
    const bw = Math.min(W * 0.92, 580 * u);
    const bh = 88 * u;
    ctx.fillStyle = 'rgba(20,10,4,0.74)';
    ctx.beginPath();
    ctx.moveTo(-bw / 2, -bh / 2);
    ctx.lineTo(bw / 2, -bh / 2);
    ctx.lineTo(bw / 2 - 18 * u, 0);
    ctx.lineTo(bw / 2, bh / 2);
    ctx.lineTo(-bw / 2, bh / 2);
    ctx.lineTo(-bw / 2 + 18 * u, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = b.gold ? '#ffd84d' : '#d9a441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bw / 2 + 24 * u, -bh / 2 + 6 * u);
    ctx.lineTo(bw / 2 - 24 * u, -bh / 2 + 6 * u);
    ctx.moveTo(-bw / 2 + 24 * u, bh / 2 - 6 * u);
    ctx.lineTo(bw / 2 - 24 * u, bh / 2 - 6 * u);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(46 * u)}px ${FONT}`;
    this.outlined(ctx, b.title, 0, -12 * u, b.gold ? '#ffe066' : '#ffd84d', 6);
    ctx.font = `italic ${Math.round(18 * u)}px ${FELL}`;
    this.outlined(ctx, b.sub, 0, 24 * u, '#f3e2b3', 3);
    ctx.restore();
  }

  protected drawHints(ctx: CanvasRenderingContext2D) {
    if (this.screen !== 'playing' || this.wave !== 1) return;
    const t = this.hintTimer;
    if (t > 15 || this.stats.sunk >= 2) return;
    const a = Math.min(1, t * 2) * Math.min(1, (15 - t) * 1.5);
    const touch = this.isTouch || this.input.usedTouch;
    const l1 = touch ? 'Drag on the left side to steer' : 'A / D steer   ·   W / S trim sails';
    const l2 = touch
      ? `Tap FIRE — ${this.arm.weaponWord} fire from the SIDES!`
      : 'Q / E fire port & starboard   ·   SPACE or CLICK smart broadside';
    const u = this.ui;
    const W = this.w;
    const H = this.h;
    const y = H - this.safe.b - (touch ? 200 : 64) * u;
    ctx.font = `${Math.round(17 * u)}px ${FONT}`;
    const need = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 40 * u;
    const su = need > W - 16 ? Math.max(0.5 * u, (u * (W - 16)) / need) : u;
    ctx.font = `${Math.round(17 * su)}px ${FONT}`;
    const bw = Math.min(W - 16, need * (su / u));
    const bh = 56 * su;
    ctx.globalAlpha = a;
    rr(ctx, W / 2 - bw / 2, y - bh / 2, bw, bh, 12 * su);
    ctx.fillStyle = 'rgba(20,10,4,0.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(217,164,65,0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f3e2b3';
    ctx.fillText(l1, W / 2, y - 12 * su);
    ctx.fillStyle = '#ffd84d';
    ctx.fillText(l2, W / 2, y + 13 * su);
    ctx.globalAlpha = 1;
  }
}
