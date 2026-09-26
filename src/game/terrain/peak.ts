// Summits: limestone, granite, snowcaps, volcanoes and jebels.

import { TAU } from '../math';
import { tone, alpha, type Job, PEAK_SIZE, blob, fillShifted } from './shared';

// ── summits ───────────────────────────────────────────────────────────────

export function paintPeak(j: Job) {
  const { ctx, theme, T, rnd, r } = j;
  const [dark, mid, light] = theme.peaks;
  const size = r * PEAK_SIZE[T.peak];
  j.peakR = size;
  switch (T.peak) {
    case 'limestone': {
      // bleached, fissured karst stepping up to a pale crown
      const outer = blob(0, 0, size, rnd, 16, 0.35);
      fillShifted(ctx, outer, 2, 3, 'rgba(40,40,20,0.25)');
      ctx.fillStyle = dark;
      ctx.fill(outer);
      const midP = blob(-1, -1.5, size * 0.66, rnd, 13, 0.35);
      fillShifted(ctx, midP, 1.2, 2, alpha(tone(dark, -0.3), 0.4));
      ctx.fillStyle = mid;
      ctx.fill(midP);
      const top = blob(-2, -3, size * 0.32, rnd, 10, 0.35);
      fillShifted(ctx, top, 1, 1.6, alpha(tone(dark, -0.3), 0.4));
      ctx.fillStyle = light;
      ctx.fill(top);
      ctx.strokeStyle = alpha(tone(dark, -0.45), 0.45);
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 12; i++) {
        const a = rnd() * TAU;
        const d0 = size * (0.2 + rnd() * 0.3);
        const d1 = d0 + size * (0.2 + rnd() * 0.25);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * d0, Math.sin(a) * d0);
        ctx.lineTo(Math.cos(a + 0.1) * (d0 + d1) / 2, Math.sin(a + 0.1) * (d0 + d1) / 2);
        ctx.lineTo(Math.cos(a) * d1, Math.sin(a) * d1);
        ctx.stroke();
      }
      break;
    }
    case 'granite':
    case 'snowcap': {
      // a knot of rounded, cracked rock domes breaking through the cover
      const domes = 6 + Math.floor(rnd() * 4);
      const pts: [number, number, number][] = [];
      for (let i = 0; i < domes; i++) {
        const a = rnd() * TAU;
        const d = i === 0 ? 0 : Math.sqrt(rnd()) * size * 0.62;
        pts.push([Math.cos(a) * d, Math.sin(a) * d, size * (i === 0 ? 0.42 : 0.2 + rnd() * 0.18)]);
      }
      // back to front, so the nearer domes overlap the farther ones
      pts.sort((p, q) => p[1] - q[1]);
      for (const [x, y, w] of pts) {
        const outline = blob(x, y, w, rnd, 10, 0.25);
        fillShifted(ctx, outline, 2, 3, 'rgba(10,20,20,0.3)');
        ctx.fillStyle = dark;
        ctx.fill(outline);
        ctx.fillStyle = mid;
        ctx.fill(blob(x - w * 0.15, y - w * 0.2, w * 0.72, rnd, 9, 0.25));
        ctx.fillStyle = alpha(light, 0.75);
        ctx.beginPath();
        ctx.ellipse(x - w * 0.35, y - w * 0.4, w * 0.3, w * 0.2, -0.5, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = alpha(tone(dark, -0.45), 0.55);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.55, y + w * 0.15);
        ctx.lineTo(x + w * 0.05, y - w * 0.05);
        ctx.lineTo(x + w * 0.45, y + w * 0.35);
        ctx.stroke();
      }
      if (T.peak === 'snowcap') {
        // old snow lying in the hollows of the summit
        for (let i = 0; i < 7; i++) {
          const a = rnd() * TAU;
          const d = i === 0 ? 0 : rnd() * size * 0.45;
          const w = size * (i === 0 ? 0.28 : 0.08 + rnd() * 0.1);
          const flake = blob(Math.cos(a) * d - 1, Math.sin(a) * d - 1, w, rnd, 9, 0.45);
          fillShifted(ctx, flake, 0.8, 1.2, 'rgba(150,170,190,0.7)');
          ctx.fillStyle = '#f2f5f8';
          ctx.fill(flake);
        }
      }
      break;
    }
    case 'volcano': {
      // a grassed-over cone with a crater in its crown
      const g = T.groundColor ?? theme.jungle;
      const cone = blob(0, 0, size, rnd, 18, 0.12);
      fillShifted(ctx, cone, 3, 4, 'rgba(10,30,20,0.3)');
      ctx.fillStyle = tone(g, -0.22);
      ctx.fill(cone);
      ctx.fillStyle = tone(g, -0.06);
      ctx.fill(blob(-1, -1.5, size * 0.84, rnd, 16, 0.1));
      ctx.fillStyle = tone(g, 0.1);
      ctx.fill(blob(-2, -3, size * 0.6, rnd, 16, 0.1));
      ctx.strokeStyle = alpha(tone(g, -0.4), 0.35);
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU + rnd() * 0.2;
        const d0 = size * 0.3;
        const d1 = size * (0.8 + rnd() * 0.15);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * d0, Math.sin(a) * d0);
        ctx.lineTo(Math.cos(a) * d1, Math.sin(a) * d1);
        ctx.stroke();
      }
      const cr = size * 0.24;
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(0, 0, cr + 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(0.8, 1.2, cr, 0, TAU);
      ctx.fill();
      ctx.fillStyle = alpha(mid, 0.8);
      ctx.beginPath();
      ctx.arc(-cr * 0.25, -cr * 0.25, cr * 0.55, 0, TAU);
      ctx.fill();
      break;
    }
    case 'jebel': {
      // a flat-topped desert rock, sheer on the shaded side
      const top = blob(0, 0, size, rnd, 13, 0.32);
      fillShifted(ctx, top, 5, 7, 'rgba(40,20,0,0.3)');
      fillShifted(ctx, top, 2, 3.5, dark);
      ctx.fillStyle = mid;
      ctx.fill(top);
      ctx.fillStyle = alpha(light, 0.7);
      ctx.fill(blob(-1, -1, size * 0.55, rnd, 11, 0.35));
      ctx.strokeStyle = alpha(tone(dark, -0.3), 0.5);
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 8; i++) {
        const a = rnd() * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * size * 0.9, Math.sin(a) * size * 0.9);
        ctx.lineTo(Math.cos(a + 0.1) * size * 0.55, Math.sin(a + 0.1) * size * 0.55);
        ctx.stroke();
      }
      break;
    }
    case 'none':
      break;
  }
}
