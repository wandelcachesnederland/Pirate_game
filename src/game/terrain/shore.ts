// Shallows and the waterline.

import { TAU } from '../math';
import { tone, alpha, type Job } from './shared';
import { drawReeds, drawBoulder } from './trees';

// ── shallows and shore ────────────────────────────────────────────────────

export function paintShallows(j: Job) {
  const { ctx, poly, theme, T } = j;
  if (T.offshore === 'flats' || T.shore === 'mud') {
    // tidal flats: a wide apron of wet mud, cut by runnels, under the shallows
    const mud = T.shore === 'mud' ? tone(theme.wetSand, -0.15) : tone(theme.wetSand, -0.05);
    ctx.fillStyle = alpha(mud, 0.28);
    ctx.fill(poly(1, 44, 7, 1));
    ctx.fillStyle = alpha(mud, 0.3);
    ctx.fill(poly(1, 26, 5, 2));
    ctx.strokeStyle = alpha(tone(mud, -0.35), 0.35);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) {
      const a = j.rnd() * TAU;
      const d0 = j.R(a) + 4;
      const len = 14 + j.rnd() * 30;
      let x = Math.cos(a) * d0;
      let y = Math.sin(a) * d0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        const aa = a + (j.rnd() - 0.5) * 0.9;
        x += Math.cos(aa) * (len / 4);
        y += Math.sin(aa) * (len / 4);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.fillStyle = theme.shallowFar;
  ctx.fill(poly(1, 52, 5, 1));
  ctx.fillStyle = theme.shallowMid;
  ctx.fill(poly(1, 33, 4, 2));
  ctx.fillStyle = theme.shallowNear;
  ctx.fill(poly(1, T.shore === 'chalk' || T.shore === 'rock' ? 11 : 16, 3, 3));
}

/** Paints the waterline and returns the path the ground cover fills. */
export function paintShore(j: Job): Path2D {
  const { ctx, poly, theme, T, rnd, r, maxR, seed } = j;
  const land = poly(1, 0);
  const speckle = (n: number, colors: string[], min: number, max: number, near = false) => {
    ctx.save();
    ctx.clip(land);
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU;
      const d = near ? j.R(a) * (0.82 + rnd() * 0.2) : rnd() * maxR;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, min + rnd() * (max - min), min + rnd() * (max - min) * 0.7, rnd() * TAU, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  };
  const ws = seed % 7;
  switch (T.shore) {
    case 'shingle': {
      ctx.fillStyle = theme.wetSand;
      ctx.fill(poly(1, 4));
      ctx.fillStyle = theme.sand;
      ctx.fill(land);
      const g = tone(theme.wetSand, -0.2);
      speckle(Math.floor(r * 1.4), [g, tone(theme.sand, 0.25), tone(theme.wetSand, -0.35), '#8d8a84'], 0.8, 2.2, true);
      return poly(0.8, -5, 4, ws);
    }
    case 'chalk': {
      // white cliffs: a shadow at the foot, a streaked face, the downs on top
      ctx.fillStyle = 'rgba(0, 20, 30, 0.25)';
      ctx.save();
      ctx.translate(2, 3);
      ctx.fill(poly(1, 3));
      ctx.restore();
      ctx.fillStyle = theme.wetSand;
      ctx.fill(poly(1, 3, 1.5, 4));
      ctx.fillStyle = '#ece9dc';
      ctx.fill(land);
      ctx.save();
      ctx.clip(land);
      ctx.lineWidth = 1;
      for (let i = 0; i < r * 1.2; i++) {
        const a = (i / (r * 1.2)) * TAU + rnd() * 0.03;
        const d = j.R(a);
        // the sunlit north-west faces read bright, the south-east in shade
        const lit = Math.cos(a + Math.PI * 0.75);
        ctx.strokeStyle = lit > 0 ? 'rgba(255,255,250,0.5)' : `rgba(120,120,110,${0.25 - lit * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (d - 1), Math.sin(a) * (d - 1));
        ctx.lineTo(Math.cos(a) * (d - 7 - rnd() * 4), Math.sin(a) * (d - 7 - rnd() * 4));
        ctx.stroke();
      }
      ctx.restore();
      const top = poly(0.93, -6, 3, ws);
      ctx.fillStyle = 'rgba(80,80,70,0.35)';
      ctx.save();
      ctx.translate(1, 2);
      ctx.fill(top);
      ctx.restore();
      return top;
    }
    case 'mud': {
      ctx.fillStyle = tone(theme.wetSand, -0.25);
      ctx.fill(poly(1, 5, 2, 2));
      ctx.fillStyle = theme.wetSand;
      ctx.fill(land);
      speckle(Math.floor(r * 0.6), [tone(theme.wetSand, -0.2), tone(theme.sand, 0.1)], 1, 3, true);
      return poly(0.9, -3, 5, ws);
    }
    case 'reed': {
      ctx.fillStyle = tone(theme.wetSand, -0.2);
      ctx.fill(poly(1, 4, 2, 2));
      ctx.fillStyle = theme.wetSand;
      ctx.fill(land);
      // a reed fringe standing out into the water all round
      ctx.lineCap = 'round';
      const n = Math.floor(r * 1.3);
      for (let i = 0; i < n; i++) {
        const a = rnd() * TAU;
        const d = j.R(a) + (rnd() - 0.4) * 10;
        drawReeds(ctx, Math.cos(a) * d, Math.sin(a) * d, 3 + rnd() * 3, rnd, j.theme.greens, i % 5 === 0);
      }
      return poly(0.92, -4, 3, ws);
    }
    case 'rock':
    case 'guano': {
      const [dark, mid, light] = theme.peaks;
      ctx.fillStyle = 'rgba(0, 20, 30, 0.25)';
      ctx.save();
      ctx.translate(2, 3);
      ctx.fill(poly(1, 2));
      ctx.restore();
      ctx.fillStyle = tone(dark, -0.15);
      ctx.fill(poly(1, 2, 2, 5));
      ctx.fillStyle = mid;
      ctx.fill(land);
      // a sandy cove or two between the rocks
      const coves = 1 + Math.floor(rnd() * 3);
      for (let i = 0; i < coves; i++) {
        const a = rnd() * TAU;
        const d = j.R(a) * 0.88;
        ctx.fillStyle = theme.sand;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, 9 + rnd() * r * 0.1, 5 + rnd() * 4, a + Math.PI / 2, 0, TAU);
        ctx.fill();
      }
      // boulders all along the waterline
      const n = Math.floor(r * 0.9);
      for (let i = 0; i < n; i++) {
        const a = rnd() * TAU;
        const d = j.R(a) * (0.9 + rnd() * 0.1);
        drawBoulder(ctx, Math.cos(a) * d, Math.sin(a) * d, 2.5 + rnd() * 4.5, rnd, [dark, mid, light]);
      }
      if (T.shore === 'guano') {
        // seabird whitewash streaked down the seaward rocks
        ctx.save();
        ctx.clip(poly(1, 2));
        for (let i = 0; i < r * 0.8; i++) {
          const a = rnd() * TAU;
          const d = j.R(a) * (0.84 + rnd() * 0.16);
          ctx.fillStyle = `rgba(245,242,230,${0.45 + rnd() * 0.45})`;
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, 1.5 + rnd() * 4, 1 + rnd() * 2, a, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
      return poly(0.84, -5, 4, ws);
    }
    default: {
      ctx.fillStyle = theme.wetSand;
      ctx.fill(poly(1, 4));
      ctx.fillStyle = theme.sand;
      ctx.fill(land);
      speckle(80, [theme.sandDark, theme.sandLight], 1, 3.2);
      // a sand sea runs right down to the beach; elsewhere a narrow strand
      return T.ground === 'dunes' ? poly(0.96, -3, 3, ws) : poly(0.84, -5, 4, ws);
    }
  }
}
