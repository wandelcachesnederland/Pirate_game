// Ground cover and tidal creeks.

import { TAU } from '../math';
import { tone, alpha, type Job, inland, mottle } from './shared';
import { drawBoulder } from './trees';

// ── ground cover ──────────────────────────────────────────────────────────


export function paintGround(j: Job) {
  const { ctx, theme, T, rnd, r, maxR, seed } = j;
  const g = T.groundColor ?? theme.jungle;
  const greens = theme.greens;
  ctx.fillStyle = g;
  ctx.fillRect(-maxR - 60, -maxR - 60, (maxR + 60) * 2, (maxR + 60) * 2);
  const axis = (seed % 628) / 100;
  /** Is a point in the field grid's rotated frame anywhere near the island? */
  const onIsland = (px: number, py: number, pad: number) => Math.hypot(px, py) < j.R(Math.atan2(py, px) + axis) + pad;

  switch (T.ground) {
    case 'scrub': {
      // garrigue: dry ground, pale rock and dark cushions of maquis
      mottle(j, [theme.sand, tone(g, -0.15), greens[3] ?? g], Math.floor(r * 0.12), r * 0.08, r * 0.2, 0.28);
      for (let i = 0; i < r * 0.12; i++) {
        const [x, y] = inland(j, 0, 0.9);
        drawBoulder(ctx, x, y, 2 + rnd() * 3.5, rnd, theme.peaks);
      }
      for (let i = 0; i < r * 1.1; i++) {
        const [x, y] = inland(j, 0, 1);
        const s = 1.6 + rnd() * 3;
        ctx.fillStyle = 'rgba(30,30,10,0.25)';
        ctx.beginPath();
        ctx.arc(x + 1, y + 1.5, s, 0, TAU);
        ctx.fill();
        ctx.fillStyle = tone(greens[i % greens.length], -0.12);
        ctx.beginPath();
        ctx.arc(x, y, s, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'moor': {
      // heather and bracken over peat, with the bones of the rock showing
      mottle(j, ['#6e4a68', '#7d5a74', '#8a6f3c', tone(g, 0.12)], Math.floor(r * 0.25), r * 0.06, r * 0.16, 0.55);
      ctx.strokeStyle = alpha(tone(g, 0.25), 0.4);
      ctx.lineWidth = 1;
      for (let i = 0; i < r * 1.2; i++) {
        const [x, y] = inland(j, 0, 1);
        const len = 2 + rnd() * 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y - len * 0.3);
        ctx.stroke();
      }
      for (let i = 0; i < r * 0.1; i++) {
        const [x, y] = inland(j, 0.1, 0.9);
        drawBoulder(ctx, x, y, 3 + rnd() * 5, rnd, theme.peaks);
      }
      break;
    }
    case 'marsh': {
      mottle(j, [tone(g, 0.15), tone(g, -0.12), theme.wetSand], Math.floor(r * 0.16), r * 0.07, r * 0.18, 0.45);
      paintCreek(j, axis);
      for (let i = 0; i < r * 0.09; i++) {
        const [x, y] = inland(j, 0, 0.85);
        const w = 4 + rnd() * r * 0.07;
        ctx.fillStyle = alpha(theme.wetSand, 0.8);
        ctx.beginPath();
        ctx.ellipse(x, y, w + 2, w * 0.6 + 2, axis, 0, TAU);
        ctx.fill();
        ctx.fillStyle = j.pool;
        ctx.beginPath();
        ctx.ellipse(x, y, w, w * 0.6, axis, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.ellipse(x - w * 0.25, y - w * 0.15, w * 0.4, w * 0.2, axis, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'dunes': {
      // sand sea: crescent dune crests all lying to the same wind
      ctx.fillStyle = theme.sand;
      ctx.fillRect(-maxR - 60, -maxR - 60, (maxR + 60) * 2, (maxR + 60) * 2);
      mottle(j, [theme.wetSand, tone(theme.sand, 0.2)], Math.floor(r * 0.1), r * 0.1, r * 0.25, 0.3);
      ctx.lineCap = 'round';
      const wind = 0.6;
      for (let i = 0; i < r * 0.35; i++) {
        const [x, y] = inland(j, 0, 1);
        const w = 7 + rnd() * r * 0.1;
        ctx.fillStyle = alpha(tone(theme.wetSand, -0.1), 0.45);
        ctx.beginPath();
        ctx.ellipse(x + w * 0.2, y + w * 0.2, w, w * 0.45, wind, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = alpha(tone(theme.sand, 0.45), 0.8);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(x, y, w, w * 0.45, wind, Math.PI * 0.05, Math.PI * 0.95);
        ctx.stroke();
      }
      ctx.strokeStyle = alpha(tone(theme.wetSand, -0.1), 0.35);
      ctx.lineWidth = 0.8;
      for (let i = 0; i < r * 0.5; i++) {
        const [x, y] = inland(j, 0, 1);
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 2);
        ctx.quadraticCurveTo(x, y + 1, x + 4, y - 2);
        ctx.stroke();
      }
      for (let i = 0; i < r * 0.12; i++) {
        const [x, y] = inland(j, 0, 1);
        ctx.fillStyle = greens[i % greens.length];
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + rnd() * 1.8, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'bocage':
    case 'fields': {
      // a patchwork of fields — hedged in Brittany, ditched along the Nile
      const bocage = T.ground === 'bocage';
      const cell = bocage ? 22 + rnd() * 10 : 16 + rnd() * 6;
      const colors = bocage
        ? [tone(g, 0.1), tone(g, 0.22), '#b8a95e', '#8e7a52', tone(g, -0.05), '#a3a55a']
        : [tone(g, 0.12), '#c9b460', tone(g, -0.08), '#7fa040', '#d0bf78', tone(g, 0.25)];
      ctx.save();
      ctx.rotate(axis);
      const span = maxR + 20;
      const rows: number[] = [];
      for (let y = -span; y < span; y += cell * (0.7 + rnd() * 0.6)) rows.push(y);
      for (let k = 0; k < rows.length; k++) {
        const y0 = rows[k];
        const y1 = rows[k + 1] ?? span;
        let x = -span;
        while (x < span) {
          const w = cell * (0.8 + rnd() * 1.1);
          if (!onIsland(x + w / 2, (y0 + y1) / 2, cell * 1.5)) {
            x += w;
            continue;
          }
          ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
          ctx.fillRect(x, y0, w, y1 - y0);
          // furrows
          ctx.strokeStyle = 'rgba(0,0,0,0.07)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          const vertical = rnd() < 0.5;
          if (vertical) for (let fx = x + 3; fx < x + w; fx += 3) (ctx.moveTo(fx, y0), ctx.lineTo(fx, y1));
          else for (let fy = y0 + 3; fy < y1; fy += 3) (ctx.moveTo(x, fy), ctx.lineTo(x + w, fy));
          ctx.stroke();
          if (bocage) {
            ctx.strokeStyle = tone(g, -0.35);
            ctx.lineWidth = 2.4;
            ctx.strokeRect(x, y0, w, y1 - y0);
          } else {
            ctx.strokeStyle = j.pool;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x, y0);
            ctx.lineTo(x, y1);
            ctx.stroke();
          }
          x += w;
        }
        if (!bocage) {
          ctx.strokeStyle = j.pool;
          ctx.lineWidth = k % 3 === 0 ? 3 : 1.4;
          ctx.beginPath();
          ctx.moveTo(-span, y0);
          ctx.lineTo(span, y0);
          ctx.stroke();
        }
      }
      if (bocage) {
        // hedgerow bushes along the field boundaries
        for (let k = 0; k < rows.length; k++) {
          for (let x = -span; x < span; x += 5 + rnd() * 6) {
            if (!onIsland(x, rows[k], 6)) continue;
            ctx.fillStyle = greens[Math.floor(rnd() * greens.length)];
            ctx.beginPath();
            ctx.arc(x, rows[k] + (rnd() - 0.5) * 2, 1.6 + rnd() * 1.4, 0, TAU);
            ctx.fill();
          }
        }
      }
      ctx.restore();
      break;
    }
    case 'forest': {
      ctx.fillStyle = tone(g, -0.1);
      ctx.fillRect(-maxR - 60, -maxR - 60, (maxR + 60) * 2, (maxR + 60) * 2);
      for (let i = 0; i < r * 0.5; i++) {
        const [x, y] = inland(j, 0, 1);
        const br = r * (0.04 + rnd() * 0.05);
        ctx.fillStyle = theme.blobShadow;
        ctx.beginPath();
        ctx.arc(x + 1.5, y + 2, br, 0, TAU);
        ctx.fill();
        ctx.fillStyle = tone(greens[i % greens.length], -0.1);
        ctx.beginPath();
        ctx.arc(x, y, br, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'chinampas': {
      // floating gardens: long plots between canals, maize in rows, marigolds
      ctx.fillStyle = j.pool;
      ctx.fillRect(-maxR - 60, -maxR - 60, (maxR + 60) * 2, (maxR + 60) * 2);
      ctx.save();
      ctx.rotate(axis);
      const span = maxR + 20;
      const plots = [tone(g, 0.05), tone(g, 0.18), '#8a9a3a', tone(g, -0.08), '#9aa850'];
      for (let y = -span; y < span; y += 13 + rnd() * 3) {
        let x = -span;
        while (x < span) {
          const w = 34 + rnd() * 50;
          const h = 9 + rnd() * 2;
          if (!onIsland(x + w / 2, y + h / 2, w * 0.6 + 6)) {
            x += w + 4;
            continue;
          }
          ctx.fillStyle = tone(theme.wetSand, -0.1);
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = plots[Math.floor(rnd() * plots.length)];
          ctx.fillRect(x + 0.8, y + 0.8, w - 1.6, h - 1.6);
          const crop = rnd();
          if (crop < 0.55) {
            // maize rows
            ctx.strokeStyle = crop < 0.3 ? '#5f7f2a' : '#b9a24a';
            ctx.lineWidth = 1.3;
            ctx.setLineDash([1.3, 1.3]);
            ctx.beginPath();
            for (let cy = y + 3; cy < y + h - 1.5; cy += 2.6) (ctx.moveTo(x + 2, cy), ctx.lineTo(x + w - 1.5, cy));
            ctx.stroke();
            ctx.setLineDash([]);
          } else if (crop < 0.7) {
            // flowers
            for (let k = 0; k < w / 3; k++) {
              ctx.fillStyle = k % 3 ? '#e8952a' : '#f2c84a';
              ctx.beginPath();
              ctx.arc(x + 2 + rnd() * (w - 4), y + 2 + rnd() * (h - 4), 1, 0, TAU);
              ctx.fill();
            }
          }
          // ahuejote willows pinning the plot's edges
          for (let wx = x + 4; wx < x + w - 2; wx += 9 + rnd() * 5) {
            ctx.fillStyle = 'rgba(0,30,10,0.25)';
            ctx.beginPath();
            ctx.ellipse(wx + 1.5, y + 2, 1.8, 3.2, 0.5, 0, TAU);
            ctx.fill();
            ctx.fillStyle = greens[Math.floor(rnd() * greens.length)];
            ctx.beginPath();
            ctx.arc(wx, y + 0.5, 1.8, 0, TAU);
            ctx.fill();
          }
          x += w + 3 + rnd() * 2;
        }
      }
      ctx.restore();
      break;
    }
    case 'barren': {
      mottle(j, [tone(g, 0.15), tone(g, -0.15), theme.sand], Math.floor(r * 0.2), r * 0.06, r * 0.18, 0.4);
      // dry gullies
      ctx.strokeStyle = alpha(tone(g, -0.35), 0.45);
      ctx.lineWidth = 1;
      for (let i = 0; i < 6 + r * 0.04; i++) {
        const [x, y, a] = inland(j, 0.1, 0.5);
        let px = x;
        let py = y;
        ctx.beginPath();
        ctx.moveTo(px, py);
        for (let k = 0; k < 6; k++) {
          const aa = a + (rnd() - 0.5) * 1.2;
          px += Math.cos(aa) * 6;
          py += Math.sin(aa) * 6;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (let i = 0; i < r * 0.5; i++) {
        const [x, y] = inland(j, 0, 1);
        ctx.fillStyle = i % 2 ? tone(g, -0.25) : tone(g, 0.25);
        ctx.beginPath();
        ctx.arc(x, y, 0.8 + rnd() * 1.6, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'terraces': {
      // hills worked into contour terraces, each held up by a dry-stone wall
      mottle(j, [tone(g, 0.12), tone(g, -0.1)], Math.floor(r * 0.1), r * 0.08, r * 0.2, 0.35);
      const steps = r > 140 ? 5 : r > 95 ? 4 : 3;
      for (let k = 0; k < steps; k++) {
        const m = 0.78 - (k / steps) * 0.62;
        const ring = j.poly(m, -2, 3, seed + k);
        ctx.fillStyle = alpha(tone(g, k % 2 ? 0.12 : -0.06), 0.8);
        ctx.fill(ring);
        ctx.save();
        ctx.translate(1, 2);
        ctx.strokeStyle = alpha(tone(g, -0.5), 0.7);
        ctx.lineWidth = 2.4;
        ctx.stroke(ring);
        ctx.restore();
        ctx.strokeStyle = alpha(j.stone, 0.9);
        ctx.lineWidth = 1.3;
        ctx.stroke(ring);
      }
      break;
    }
    case 'grass': {
      mottle(j, [tone(g, 0.15), tone(g, -0.12), greens[3] ?? g], Math.floor(r * 0.22), r * 0.06, r * 0.16, 0.45);
      ctx.strokeStyle = alpha(tone(g, 0.3), 0.5);
      ctx.lineWidth = 0.9;
      for (let i = 0; i < r * 1.3; i++) {
        const [x, y] = inland(j, 0, 1);
        ctx.beginPath();
        ctx.moveTo(x - 1.5, y + 1.5);
        ctx.lineTo(x, y - 1.5);
        ctx.lineTo(x + 1.5, y + 1.5);
        ctx.stroke();
      }
      break;
    }
  }
}

/** A tidal creek meandering across a marsh island. */
export function paintCreek(j: Job, axis: number) {
  const { ctx, rnd } = j;
  const a0 = axis + (rnd() - 0.5) * 0.6;
  const a1 = a0 + Math.PI + (rnd() - 0.5) * 0.8;
  const p0: [number, number] = [Math.cos(a0) * j.R(a0) * 1.05, Math.sin(a0) * j.R(a0) * 1.05];
  const p1: [number, number] = [Math.cos(a1) * j.R(a1) * 0.4, Math.sin(a1) * j.R(a1) * 0.4];
  const c1: [number, number] = [(rnd() - 0.5) * j.r, (rnd() - 0.5) * j.r];
  const c2: [number, number] = [(rnd() - 0.5) * j.r, (rnd() - 0.5) * j.r];
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p1[0], p1[1]);
  };
  ctx.lineCap = 'round';
  path();
  ctx.strokeStyle = j.theme.wetSand;
  ctx.lineWidth = 9;
  ctx.stroke();
  path();
  ctx.strokeStyle = j.pool;
  ctx.lineWidth = 5;
  ctx.stroke();
}
