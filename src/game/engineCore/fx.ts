import type { Ship } from '../types';
import { TAU } from '../math';
import { MAX_PARTICLES, P_SMOKE, P_FIRE, P_SPARK, P_SPLINTER, P_DROP, P_RING, P_FOAM, P_PLANK, P_BUBBLE, P_SPARKLE, P_FLASH, P_SAND, FIRE_COLORS, SMOKE_LIGHT, SMOKE_DARK, WOOD, SAND, rand, clamp, pick } from './constants';
import { EngineState } from './state';

/** Particles, floating texts, speed streaks, screen shake and camera. */
export abstract class EngineFx extends EngineState {
  // ================================================================ particles / fx
  protected emit(
    type: number, x: number, y: number, vx: number, vy: number, life: number, size: number, grow: number,
    color: string, layer: number, drag = 1.5, rot = 0, vrot = 0, alpha = 1,
  ) {
    if (this.pCount >= MAX_PARTICLES) return;
    const p = this.parts[this.pCount++];
    p.type = type;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.max = life;
    p.size = size;
    p.grow = grow;
    p.color = color;
    p.layer = layer;
    p.drag = drag;
    p.rot = rot;
    p.vrot = vrot;
    p.alpha = alpha;
  }

  protected updateParticles(dt: number) {
    const parts = this.parts;
    let i = 0;
    while (i < this.pCount) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        const lastIdx = this.pCount - 1;
        parts[i] = parts[lastIdx];
        parts[lastIdx] = p;
        this.pCount--;
        continue;
      }
      if (p.drag > 0) {
        const dr = Math.exp(-p.drag * dt);
        p.vx *= dr;
        p.vy *= dr;
        if (p.type === P_SPLINTER) p.vrot *= dr;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      i++;
    }
  }

  protected fxMuzzle(x: number, y: number, dir: number, player: boolean) {
    const c = Math.cos(dir);
    const s = Math.sin(dir);
    this.emit(P_FLASH, x + c * 7, y + s * 7, 0, 0, 0.1, 13, 16, '', 1, 0);
    for (let i = 0; i < 5; i++) {
      const a = dir + rand(-0.35, 0.35);
      const sp = rand(90, 260);
      this.emit(P_FIRE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.1, 0.2), rand(3, 5.5), -4, pick(FIRE_COLORS), 1, 5);
    }
    for (let i = 0; i < 6; i++) {
      const a = dir + rand(-0.5, 0.5);
      const sp = rand(20, 120);
      this.emit(P_SMOKE, x + c * 4, y + s * 4, Math.cos(a) * sp + this.windX * 15, Math.sin(a) * sp + this.windY * 15, rand(0.9, 1.7), rand(5, 8), rand(14, 22), pick(SMOKE_LIGHT), 1, 2.4, 0, 0, 0.55);
    }
    if (player) {
      for (let i = 0; i < 3; i++) {
        const a = dir + rand(-0.3, 0.3);
        const sp = rand(200, 380);
        this.emit(P_SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.12, 0.25), 1.6, 0, '#ffd27a', 1, 3);
      }
    }
  }

  protected fxSplash(x: number, y: number, sc: number) {
    this.emit(P_RING, x, y, 0, 0, 0.7, 3, 26 * sc, '#ffffff', 0, 0, 0, 0, 0.75);
    this.emit(P_RING, x, y, 0, 0, 0.45, 2, 14 * sc, '#ffffff', 0, 0, 0, 0, 0.6);
    const n = Math.round(8 * sc);
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const sp = rand(30, 110) * sc;
      this.emit(P_DROP, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.35, 0.6), rand(1.5, 2.8), -1, pick(['#ffffff', '#dff6ff', '#bfeaf5']), 1, 2.5);
    }
    this.emit(P_FOAM, x, y, 0, 0, 1.2, 5 * sc, 12 * sc, '#ffffff', 0, 0, 0, 0, 0.5);
  }

  /**
   * A hit on a hull: splinters, a puff of dust and smoke — and sparks only
   * where hot iron actually strikes iron. Arrows, bolts and stones land with
   * a wooden thud, so `sparks` is false for everything without powder.
   */
  protected fxHit(x: number, y: number, dir: number, sc: number, sparks = true) {
    if (sparks) this.emit(P_FLASH, x, y, 0, 0, 0.12, 14 * sc, 22 * sc, '', 1, 0);
    else this.emit(P_SAND, x, y, 0, 0, 0.18, 9 * sc, 16 * sc, pick(['#e6cf96', '#d9d2c2', '#cfc7b4']), 0, 0, 0, 0, 0.75);
    const n = Math.round(12 * sc);
    for (let i = 0; i < n; i++) {
      const a = dir + rand(-1.1, 1.1) + (Math.random() < 0.25 ? Math.PI : 0);
      const sp = rand(60, 260);
      this.emit(P_SPLINTER, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.45, 0.9), rand(3, 6), 0, pick(WOOD), 1, 3.2, rand(0, TAU), rand(-18, 18));
    }
    if (sparks) {
      for (let i = 0; i < 5; i++) {
        const a = dir + rand(-1, 1);
        const sp = rand(150, 320);
        this.emit(P_SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.15, 0.3), 1.5, 0, '#ffcf6b', 1, 3);
      }
    }
    for (let i = 0; i < 3; i++) {
      this.emit(P_SMOKE, x, y, rand(-25, 25) + this.windX * 20, rand(-25, 25) + this.windY * 20, rand(0.7, 1.3), rand(4, 7), 14, pick(SMOKE_DARK), 1, 1.8, 0, 0, 0.5);
    }
  }

  /** A jet of Greek fire bursting across a hull: flame, smoke, splinters. */
  protected fxFireHit(x: number, y: number, dir: number, sc: number) {
    const n = Math.round(20 * sc);
    for (let i = 0; i < n; i++) {
      const a = dir + rand(-0.9, 0.9) + (Math.random() < 0.3 ? Math.PI : 0);
      const sp = rand(70, 300) * (0.7 + sc * 0.3);
      this.emit(P_FIRE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.3, 0.65), rand(5, 10), -5, pick(FIRE_COLORS), 1, 2.4);
    }
    for (let i = 0; i < Math.round(9 * sc); i++) {
      const a = dir + rand(-1.2, 1.2);
      const sp = rand(80, 300);
      this.emit(P_SPLINTER, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.4, 0.85), rand(3, 5.5), 0, pick(WOOD), 1, 3, rand(0, TAU), rand(-16, 16));
    }
    for (let i = 0; i < 5; i++) {
      this.emit(P_SMOKE, x, y, rand(-35, 35) + this.windX * 30, rand(-35, 35) + this.windY * 30, rand(0.9, 1.7), rand(6, 11), 20, pick(SMOKE_DARK), 1, 1.6, 0, 0, 0.55);
    }
    this.emit(P_RING, x, y, 0, 0, 0.35, 6, 46 * sc, '#ffb347', 1, 0, 0, 0, 0.6);
  }

  /**
   * A hull going up by fire rather than by magazine: a sheet of flame, a cloud
   * of smoke and a spray of burning splinters. No white flash, no powder ring,
   * no shockwave — nothing here goes off, it simply burns all at once.
   */
  protected fxFireBurst(x: number, y: number, sc: number) {
    const nf = Math.round(26 * sc);
    for (let i = 0; i < nf; i++) {
      const a = rand(0, TAU);
      const sp = rand(30, 210) * Math.sqrt(Math.max(0.4, sc));
      this.emit(P_FIRE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.45, 0.95), rand(6, 13), -5, pick(FIRE_COLORS), 1, 2.6, 0, 0, 0.95);
    }
    for (let i = 0; i < Math.round(20 * sc); i++) {
      const a = rand(0, TAU);
      const sp = rand(20, 130);
      this.emit(P_SMOKE, x, y, Math.cos(a) * sp + this.windX * 26, Math.sin(a) * sp + this.windY * 26, rand(1.5, 2.8), rand(10, 19), 26, pick(SMOKE_DARK), 1, 1.5, 0, 0, 0.65);
    }
    for (let i = 0; i < Math.round(20 * sc); i++) {
      const a = rand(0, TAU);
      const sp = rand(60, 260);
      this.emit(P_SPLINTER, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.6, 1.2), rand(4, 8), 0, pick(WOOD), 1, 2.6, rand(0, TAU), rand(-16, 16));
    }
    // embers riding the wind, not a shower of sparks
    for (let i = 0; i < Math.round(10 * sc); i++) {
      const a = rand(0, TAU);
      const sp = rand(60, 240);
      this.emit(P_SPARK, x, y, Math.cos(a) * sp + this.windX * 30, Math.sin(a) * sp + this.windY * 30, rand(0.5, 1.1), 1.8, 0, pick(['#ffb347', '#ff7b2e']), 1, 1.6);
    }
    this.emit(P_RING, x, y, 0, 0, 0.7, 6, 96 * sc, '#ff9a3c', 1, 0, 0, 0, 0.55);
    this.emit(P_RING, x, y, 0, 0, 1.4, 8, 54 * sc, '#ffd7a0', 0, 0, 0, 0, 0.35);
  }

  /** A stone wall coming down: dust, rubble and splinters — no flame at all. */
  protected fxCollapse(x: number, y: number, sc: number) {
    for (let i = 0; i < Math.round(22 * sc); i++) {
      const a = rand(0, TAU);
      const sp = rand(20, 150);
      this.emit(P_SMOKE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(1.2, 2.4), rand(9, 17), 24, pick(SMOKE_LIGHT), 1, 1.5, 0, 0, 0.6);
    }
    for (let i = 0; i < Math.round(16 * sc); i++) {
      const a = rand(0, TAU);
      const sp = rand(40, 220);
      this.emit(P_SAND, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.5, 1), rand(3.5, 7), 0, pick(['#b9b3a6', '#8f8c82', '#d9d2c2']), 1, 2.6, rand(0, TAU), rand(-14, 14));
    }
    for (let i = 0; i < Math.round(10 * sc); i++) {
      const a = rand(0, TAU);
      const sp = rand(60, 240);
      this.emit(P_SPLINTER, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.5, 1), rand(3, 6), 0, pick(WOOD), 1, 2.6, rand(0, TAU), rand(-16, 16));
    }
    this.emit(P_RING, x, y, 0, 0, 0.9, 8, 80 * sc, '#cfc7b4', 0, 0, 0, 0, 0.4);
  }

  protected fxExplosion(x: number, y: number, sc: number) {
    this.emit(P_FLASH, x, y, 0, 0, 0.24, 30 * sc, 70 * sc, '', 1, 0);
    this.emit(P_RING, x, y, 0, 0, 0.5, 8, 150 * sc, '#fff3d0', 1, 0, 0, 0, 0.9);
    this.emit(P_RING, x, y, 0, 0, 1.2, 10, 90 * sc, '#ffffff', 0, 0, 0, 0, 0.6);
    const nf = Math.round(22 * sc);
    for (let i = 0; i < nf; i++) {
      const a = rand(0, TAU);
      const sp = rand(40, 280) * Math.sqrt(sc);
      this.emit(P_FIRE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.35, 0.8), rand(7, 15), -6, pick(FIRE_COLORS), 1, 3);
    }
    for (let i = 0; i < 16; i++) {
      const a = rand(0, TAU);
      const sp = rand(20, 140);
      this.emit(P_SMOKE, x, y, Math.cos(a) * sp + this.windX * 20, Math.sin(a) * sp + this.windY * 20, rand(1.4, 2.6), rand(10, 18), 26, pick(SMOKE_DARK), 1, 1.6, 0, 0, 0.65);
    }
    for (let i = 0; i < 18; i++) {
      const a = rand(0, TAU);
      const sp = rand(200, 480);
      this.emit(P_SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.25, 0.6), 2, 0, pick(['#ffe08a', '#ffb347']), 1, 2.2);
    }
    for (let i = 0; i < 22; i++) {
      const a = rand(0, TAU);
      const sp = rand(80, 320);
      this.emit(P_SPLINTER, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.6, 1.2), rand(4, 8), 0, pick(WOOD), 1, 2.6, rand(0, TAU), rand(-16, 16));
    }
    for (let i = 0; i < 7; i++) {
      const a = rand(0, TAU);
      const sp = rand(40, 140);
      this.emit(P_PLANK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(5, 7), rand(9, 15), 0, pick(WOOD), 0, 1.1, rand(0, TAU), rand(-2, 2));
    }
  }

  protected fxSinking(s: Ship) {
    const r = s.def.length * 0.4;
    this.emit(P_BUBBLE, s.x + rand(-r, r), s.y + rand(-r, r), rand(-8, 8), rand(-8, 8), rand(0.5, 1), rand(1.5, 3.5), 2, '#ffffff', 0, 1, 0, 0, 0.8);
    this.emit(P_FOAM, s.x + rand(-r, r), s.y + rand(-r * 0.5, r * 0.5), rand(-10, 10), rand(-10, 10), rand(0.8, 1.4), rand(4, 8), 10, '#ffffff', 0, 1, 0, 0, 0.35);
    if (Math.random() < 0.6) {
      this.emit(P_SMOKE, s.x + rand(-r, r) * 0.5, s.y + rand(-r, r) * 0.5, this.windX * 25 + rand(-10, 10), this.windY * 25 + rand(-10, 10), rand(1.2, 2), rand(6, 10), 18, pick(SMOKE_DARK), 1, 0.8, 0, 0, 0.5);
    }
    if (s.sinking < 1.2 && Math.random() < 0.7) {
      this.emit(P_FIRE, s.x + rand(-r, r) * 0.6, s.y + rand(-r, r) * 0.4, rand(-15, 15), rand(-15, 15), rand(0.25, 0.5), rand(5, 9), -8, pick(FIRE_COLORS), 1, 1);
    }
  }

  protected fxSparkle(x: number, y: number, n: number, color: string) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const sp = rand(30, 130);
      this.emit(P_SPARKLE, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.35, 0.7), rand(3, 5), 0, color, 1, 3, rand(0, TAU), 20);
    }
  }

  protected fxSand(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const a = rand(0, TAU);
      const sp = rand(30, 110);
      this.emit(P_SAND, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.4, 0.8), rand(2, 4), 3, pick(SAND), 1, 3);
    }
    this.emit(P_RING, x, y, 0, 0, 0.5, 3, 18, '#f1e0b0', 0, 0, 0, 0, 0.6);
  }

  protected addText(x: number, y: number, text: string, color: string, size: number) {
    if (this.texts.length > 40) this.texts.shift();
    this.texts.push({ x, y, vy: -42, text, color, size, life: 1.3, max: 1.3 });
  }

  protected updateTexts(dt: number) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= Math.exp(-2 * dt);
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  protected updateStreaks(dt: number) {
    const hw = this.w / 2 / this.viewScale;
    const hh = this.h / 2 / this.viewScale;
    for (const st of this.streaks) {
      st.life -= dt;
      st.x += this.windX * 150 * dt;
      st.y += this.windY * 150 * dt;
      if (st.life <= 0) {
        st.x = this.camX + rand(-hw, hw);
        st.y = this.camY + rand(-hh, hh);
        st.max = st.life = rand(1.2, 2.6);
        st.len = rand(30, 75);
      }
    }
  }

  protected addTrauma(v: number) {
    this.trauma = Math.min(1, this.trauma + v);
  }

  protected volAt(x: number, y: number) {
    const d = Math.hypot(x - this.camX, y - this.camY);
    return clamp(1.15 - d / 950, 0, 1);
  }

  protected panAt(x: number) {
    return clamp(((x - this.camX) * this.viewScale) / (this.w * 0.5), -1, 1) * 0.75;
  }

  protected updateCamera(rdt: number) {
    const p = this.player;
    const menu = this.screen === 'menu';
    const tx = p.x + (menu ? 0 : p.vx * 0.45);
    const ty = p.y + (menu ? 0 : p.vy * 0.45);
    const k = 1 - Math.exp(-rdt * 3.5);
    this.camX += (tx - this.camX) * k;
    this.camY += (ty - this.camY) * k;
    const spd = Math.hypot(p.vx, p.vy);
    const zt = (menu ? 1.08 : 1 - Math.min(0.08, (spd / p.def.speed) * 0.07)) + this.zoomPunch;
    this.zoom += (zt - this.zoom) * (1 - Math.exp(-rdt * 4));
    this.zoomPunch *= Math.exp(-rdt * 3);
    this.trauma = Math.max(0, this.trauma - rdt * 1.5);
    const kd = Math.exp(-rdt * 12);
    this.kickX *= kd;
    this.kickY *= kd;
  }

  protected worldToScreen(x: number, y: number): [number, number] {
    return [(x - this.camX) * this.curScale + this.w / 2 + this.shx, (y - this.camY) * this.curScale + this.h / 2 + this.shy];
  }
}
