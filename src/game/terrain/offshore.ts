// Rocks, skerries, stacks and other features just off the beach.

import { TAU } from '../math';
import { alpha, type Job, blobPath } from './shared';
import { drawReeds, drawBoulder } from './trees';

// ── offshore ──────────────────────────────────────────────────────────────

export function paintOffshore(j: Job) {
  const { ctx, T, rnd, theme } = j;
  const out = (lo: number, hi: number): [number, number] => {
    const a = rnd() * TAU;
    const d = j.R(a) + lo + rnd() * (hi - lo);
    return [Math.cos(a) * d, Math.sin(a) * d];
  };
  const foam = (x: number, y: number, s: number) => {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(x, y, s + 2.5, 0, TAU);
    ctx.fill();
  };
  switch (T.offshore) {
    case 'rocks':
    case 'flats': {
      const n = 2 + Math.floor(rnd() * 5);
      for (let i = 0; i < n; i++) {
        const [x, y] = out(8, 34);
        const s = 3 + rnd() * 6;
        foam(x, y, s);
        drawBoulder(ctx, x, y, s, rnd, theme.peaks);
      }
      break;
    }
    case 'skerries': {
      // low, black, kelp-fringed reefs out beyond the shore
      const clusters = 3 + Math.floor(rnd() * 4);
      for (let c = 0; c < clusters; c++) {
        const [cx, cy] = out(14, 44);
        const n = 2 + Math.floor(rnd() * 4);
        for (let i = 0; i < n; i++) {
          const x = cx + (rnd() - 0.5) * 18;
          const y = cy + (rnd() - 0.5) * 18;
          const s = 2.5 + rnd() * 5;
          foam(x, y, s + 1);
          ctx.fillStyle = 'rgba(90,70,30,0.55)';
          blobPath(ctx, x, y, s * 1.4, rnd, 8, 0.6);
          ctx.fill();
          drawBoulder(ctx, x, y, s, rnd, ['#3f4449', '#555b61', '#7d848a']);
        }
      }
      break;
    }
    case 'stacks': {
      // chalk sea stacks, cut off from the cliffs by the swell
      const n = 2 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        const [x, y] = out(6, 26);
        const s = 3 + rnd() * 5;
        ctx.fillStyle = 'rgba(0,20,30,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + s * 0.9, y + s * 1.1, s * 1.3, s * 0.8, Math.PI / 4, 0, TAU);
        ctx.fill();
        foam(x, y, s);
        ctx.fillStyle = '#d8d6ca';
        blobPath(ctx, x, y, s, rnd, 7, 0.3);
        ctx.fill();
        ctx.fillStyle = '#f2f0e6';
        blobPath(ctx, x - 0.8, y - 0.8, s * 0.72, rnd, 7, 0.3);
        ctx.fill();
        ctx.fillStyle = alpha(theme.jungle, 0.9);
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, s * 0.4, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'stakes': {
      // lines of fishing and oyster stakes in the shallows
      const lines = 2 + Math.floor(rnd() * 3);
      for (let l = 0; l < lines; l++) {
        const a0 = rnd() * TAU;
        const d = j.R(a0) + 14 + rnd() * 22;
        const n = 8 + Math.floor(rnd() * 8);
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / j.R(a0)) * 5;
          const x = Math.cos(a) * (d + (i % 2) * 2);
          const y = Math.sin(a) * (d + (i % 2) * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#3a2e22';
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, TAU);
          ctx.fill();
        }
      }
      break;
    }
    case 'reeds': {
      const n = 6 + Math.floor(rnd() * 8);
      for (let i = 0; i < n; i++) {
        const [x, y] = out(4, 22);
        drawReeds(ctx, x, y, 4 + rnd() * 3, rnd, theme.greens, rnd() < 0.5);
      }
      break;
    }
    case 'sealions': {
      // guano-crusted rocks with sea lions hauled out on them
      const n = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        const [x, y] = out(12, 36);
        const s = 5 + rnd() * 6;
        foam(x, y, s);
        drawBoulder(ctx, x, y, s, rnd, theme.peaks);
        ctx.fillStyle = 'rgba(248,245,235,0.85)';
        blobPath(ctx, x - s * 0.2, y - s * 0.2, s * 0.55, rnd, 7, 0.5);
        ctx.fill();
        const pups = 1 + Math.floor(rnd() * 3);
        for (let k = 0; k < pups; k++) {
          const ka = rnd() * TAU;
          const px = x + Math.cos(ka) * s * 0.75;
          const py = y + Math.sin(ka) * s * 0.75;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(ka + Math.PI / 2);
          ctx.fillStyle = '#5a4230';
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.6, 1.6, 0, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(3.6, 0, 1.3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#7a5e44';
          ctx.beginPath();
          ctx.ellipse(-0.5, -0.5, 2, 0.7, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
      }
      break;
    }
  }
}
