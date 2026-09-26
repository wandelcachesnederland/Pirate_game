// Trees, reeds, palms and boulders.

import { TAU } from '../math';
import type { IslandTheme } from '../worlds';
import type { TerrainTree } from './recipe';
import { mix, tone, alpha, type Rnd, type Ctx, type Job, blobPath } from './shared';

// ── trees ─────────────────────────────────────────────────────────────────

/** Trees that crowd the water's edge rather than the interior. */
export const EDGE_TREES: TerrainTree[] = ['pohutukawa', 'reeds', 'papyrus'];

export function paintTrees(j: Job) {
  const { T, rnd, r } = j;
  for (const [kind, density] of T.trees) {
    const n = Math.round(density * r * 0.22);
    const edge = EDGE_TREES.includes(kind);
    // groves: olives and cypresses stand in rows, the rest scatter
    const grove = kind === 'olive' || kind === 'cypress';
    let placed = 0;
    for (let tries = 0; placed < n && tries < n * 6; tries++) {
      const a = rnd() * TAU;
      const f = edge ? 0.74 + rnd() * 0.2 : Math.sqrt(rnd()) * 0.8;
      const d = j.R(a) * f;
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      if (!j.free(x, y, 6)) continue;
      if (j.peakR && Math.hypot(x, y) < j.peakR && kind !== 'blackPine') continue;
      if (grove) {
        const len = 2 + Math.floor(rnd() * 4);
        const dir = rnd() * TAU;
        const gap = kind === 'olive' ? 9 : 5.5;
        for (let k = 0; k < len && placed < n; k++) {
          const tx = x + Math.cos(dir) * gap * k;
          const ty = y + Math.sin(dir) * gap * k;
          const ta = Math.atan2(ty, tx);
          if (Math.hypot(tx, ty) > j.R(ta) * 0.84 || !j.free(tx, ty, 5)) break;
          drawTree(j, kind, tx, ty);
          placed++;
        }
      } else {
        drawTree(j, kind, x, y);
        placed++;
      }
    }
  }
}

export function drawTree(j: Job, kind: TerrainTree, x: number, y: number) {
  const { ctx, rnd, theme } = j;
  const dark = theme.palmDark;
  const light = theme.palmLight;
  switch (kind) {
    case 'pine': {
      // a conifer from above: stacked star-shaped whorls, darkest outside
      const s = 5 + rnd() * 4;
      ctx.fillStyle = 'rgba(0,15,10,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + s * 0.5, y + s * 0.7, s, s * 0.85, 0.6, 0, TAU);
      ctx.fill();
      const rot = rnd() * TAU;
      const layers = [tone(dark, -0.2), dark, light];
      layers.forEach((col, k) => {
        const rr = s * (1 - k * 0.3);
        ctx.fillStyle = col;
        ctx.beginPath();
        const pts = 9;
        for (let i = 0; i <= pts * 2; i++) {
          const a = rot + k * 0.3 + (i / (pts * 2)) * TAU;
          const rad = i % 2 ? rr * 0.62 : rr;
          const px = x - k * 0.5 + Math.cos(a) * rad;
          const py = y - k * 0.5 + Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      });
      ctx.fillStyle = tone(light, 0.2);
      ctx.beginPath();
      ctx.arc(x - 1.2, y - 1.2, s * 0.15, 0, TAU);
      ctx.fill();
      break;
    }
    case 'cypress': {
      // a tall dark spire: small crown, long shadow
      const s = 2.6 + rnd() * 1.4;
      ctx.fillStyle = 'rgba(0,15,5,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + s * 2.2, y + s * 2.4, s * 3.1, s * 0.8, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(dark, -0.35);
      ctx.beginPath();
      ctx.ellipse(x, y, s, s * 1.15, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(dark, -0.1);
      ctx.beginPath();
      ctx.ellipse(x - s * 0.3, y - s * 0.3, s * 0.5, s * 0.6, Math.PI / 4, 0, TAU);
      ctx.fill();
      break;
    }
    case 'olive': {
      // silvery, knotted little crowns
      const s = 3 + rnd() * 2;
      ctx.fillStyle = 'rgba(30,30,10,0.28)';
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 2, s, 0, TAU);
      ctx.fill();
      const silver = mix(dark, '#b8c0a0', 0.45);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU + rnd();
        ctx.fillStyle = k % 2 ? silver : tone(silver, -0.12);
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4, s * 0.62, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = alpha('#e6ead2', 0.5);
      ctx.beginPath();
      ctx.arc(x - s * 0.35, y - s * 0.35, s * 0.3, 0, TAU);
      ctx.fill();
      break;
    }
    case 'oak': {
      const s = 5 + rnd() * 4;
      ctx.fillStyle = 'rgba(0,20,5,0.3)';
      ctx.beginPath();
      ctx.arc(x + 2, y + 3, s, 0, TAU);
      ctx.fill();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + rnd() * 0.5;
        ctx.fillStyle = k % 2 ? dark : tone(dark, -0.12);
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * s * 0.45, y + Math.sin(a) * s * 0.45, s * 0.58, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(x - s * 0.25, y - s * 0.25, s * 0.45, 0, TAU);
      ctx.fill();
      break;
    }
    case 'date':
      drawDatePalm(ctx, x, y, 7 + rnd() * 4, rnd, theme);
      break;
    case 'blackPine': {
      // Japanese black pine: flat cloud-pads of needles on a crooked trunk
      const s = 6 + rnd() * 4;
      const pads = 3 + Math.floor(rnd() * 3);
      const pts: [number, number, number][] = [];
      for (let k = 0; k < pads; k++) {
        const a = rnd() * TAU;
        const d = k === 0 ? 0 : s * (0.5 + rnd() * 0.6);
        pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d, s * (0.45 + rnd() * 0.3)]);
      }
      ctx.strokeStyle = '#4a3526';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const [px, py] of pts) {
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo((x + px) / 2 + 1.5, (y + py) / 2 - 1.5, px, py);
      }
      ctx.stroke();
      for (const [px, py, pr] of pts) {
        ctx.fillStyle = 'rgba(0,15,10,0.3)';
        ctx.beginPath();
        ctx.ellipse(px + 2, py + 3, pr * 1.2, pr * 0.8, 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = tone(dark, -0.25);
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 1.2, pr * 0.8, 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.ellipse(px - pr * 0.2, py - pr * 0.2, pr * 0.85, pr * 0.5, 0.3, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'pohutukawa': {
      // the New Zealand Christmas tree: broad dark crown freckled crimson
      const s = 6 + rnd() * 4;
      ctx.fillStyle = 'rgba(0,20,10,0.3)';
      ctx.beginPath();
      ctx.arc(x + 2, y + 3, s, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(dark, -0.2);
      blobPath(ctx, x, y, s, rnd, 9, 0.35);
      ctx.fill();
      ctx.fillStyle = dark;
      blobPath(ctx, x - s * 0.2, y - s * 0.2, s * 0.65, rnd, 8, 0.35);
      ctx.fill();
      for (let k = 0; k < 10; k++) {
        const a = rnd() * TAU;
        const d = Math.sqrt(rnd()) * s * 0.85;
        ctx.fillStyle = k % 3 ? '#c8232c' : '#e8474a';
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.9 + rnd() * 0.9, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'fern': {
      // tree fern: a lacy rosette of fronds
      const s = 5 + rnd() * 3;
      ctx.fillStyle = 'rgba(0,20,10,0.25)';
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 2.5, s * 0.9, 0, TAU);
      ctx.fill();
      ctx.lineCap = 'round';
      const n = 8;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + rnd() * 0.3;
        const ex = x + Math.cos(a) * s;
        const ey = y + Math.sin(a) * s;
        ctx.strokeStyle = k % 2 ? light : tone(light, 0.15);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        for (let t = 0.3; t < 1; t += 0.2) {
          const mx = x + Math.cos(a) * s * t;
          const my = y + Math.sin(a) * s * t;
          const l = s * 0.28 * (1 - t * 0.6);
          ctx.moveTo(mx + Math.cos(a + 1.2) * l, my + Math.sin(a + 1.2) * l);
          ctx.lineTo(mx, my);
          ctx.lineTo(mx + Math.cos(a - 1.2) * l, my + Math.sin(a - 1.2) * l);
        }
        ctx.stroke();
      }
      ctx.fillStyle = '#5a4630';
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, TAU);
      ctx.fill();
      break;
    }
    case 'cactus': {
      // a candelabra cactus: ribbed stems and a long hard shadow
      const s = 2 + rnd() * 1.5;
      const arms = 1 + Math.floor(rnd() * 3);
      ctx.fillStyle = 'rgba(40,20,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + s * 2.5, y + s * 2.5, s * 3, s * 0.7, Math.PI / 4, 0, TAU);
      ctx.fill();
      const stems: [number, number, number][] = [[x, y, s]];
      for (let k = 0; k < arms; k++) {
        const a = rnd() * TAU;
        stems.push([x + Math.cos(a) * s * 1.7, y + Math.sin(a) * s * 1.7, s * 0.7]);
      }
      for (const [sx, sy, sr] of stems) {
        ctx.fillStyle = '#4f6b3f';
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#7d9a62';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU;
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(a) * sr, sy + Math.sin(a) * sr);
        }
        ctx.stroke();
      }
      break;
    }
    case 'dragonsBlood': {
      // from above: a flat, dense umbrella crown, bare forked branches just
      // showing through at the rim, and a long hard desert shadow
      const s = 4 + rnd() * 3;
      ctx.fillStyle = 'rgba(40,20,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(x + s * 1.3, y + s * 1.5, s * 1.2, s * 0.8, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(dark, -0.25);
      ctx.beginPath();
      ctx.arc(x, y, s, 0, TAU);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(x - s * 0.15, y - s * 0.15, s * 0.82, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#8a6a4a';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      const n = 7;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + rnd() * 0.3;
        ctx.moveTo(x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55);
        ctx.lineTo(x + Math.cos(a) * s * 0.98, y + Math.sin(a) * s * 0.98);
      }
      ctx.stroke();
      ctx.fillStyle = alpha(light, 0.45);
      ctx.beginPath();
      ctx.arc(x - s * 0.35, y - s * 0.35, s * 0.35, 0, TAU);
      ctx.fill();
      break;
    }
    case 'willow': {
      const s = 2.5 + rnd() * 1.5;
      ctx.fillStyle = 'rgba(0,25,10,0.28)';
      ctx.beginPath();
      ctx.ellipse(x + s * 1.6, y + s * 1.8, s * 2.4, s * 0.9, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, TAU);
      ctx.fill();
      break;
    }
    case 'reeds':
      drawReeds(ctx, x, y, 4 + rnd() * 3, rnd, theme.greens, rnd() < 0.4);
      break;
    case 'papyrus': {
      // papyrus: a clump of stems, each crowned with a starburst umbel
      const n = 4 + Math.floor(rnd() * 4);
      for (let k = 0; k < n; k++) {
        const a = rnd() * TAU;
        const d = rnd() * 5;
        const ux = x + Math.cos(a) * d;
        const uy = y + Math.sin(a) * d;
        const s = 2.5 + rnd() * 1.8;
        ctx.strokeStyle = k % 2 ? light : tone(light, 0.2);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let q = 0; q < 10; q++) {
          const qa = (q / 10) * TAU;
          ctx.moveTo(ux, uy);
          ctx.lineTo(ux + Math.cos(qa) * s, uy + Math.sin(qa) * s);
        }
        ctx.stroke();
        ctx.fillStyle = tone(dark, -0.2);
        ctx.beginPath();
        ctx.arc(ux, uy, 0.7, 0, TAU);
        ctx.fill();
      }
      break;
    }
  }
}

export function drawReeds(ctx: Ctx, x: number, y: number, s: number, rnd: Rnd, greens: string[], heads: boolean) {
  // blades batched into two strokes — reed fringes run to hundreds of clumps
  ctx.lineCap = 'round';
  ctx.lineWidth = 0.9;
  const n = 5 + Math.floor(rnd() * 4);
  const green = new Path2D();
  const straw = new Path2D();
  const tips: [number, number, number][] = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + (rnd() - 0.5) * 2.2;
    const l = s * (0.6 + rnd() * 0.6);
    const ex = x + Math.cos(a) * l;
    const ey = y + Math.sin(a) * l;
    const p = k % 3 === 0 ? straw : green;
    p.moveTo(x, y);
    p.lineTo(ex, ey);
    if (heads && k % 3 === 1) tips.push([ex, ey, a]);
  }
  ctx.strokeStyle = greens[Math.floor(rnd() * greens.length)];
  ctx.stroke(green);
  ctx.strokeStyle = '#b5a65a';
  ctx.stroke(straw);
  ctx.fillStyle = '#6b4a2a';
  for (const [ex, ey, a] of tips) {
    ctx.beginPath();
    ctx.ellipse(ex, ey, 0.9, 1.6, a + Math.PI / 2, 0, TAU);
    ctx.fill();
  }
}

export function drawDatePalm(ctx: Ctx, x: number, y: number, s: number, rnd: Rnd, theme: IslandTheme) {
  // many narrow, drooping fronds and clusters of orange dates at the crown
  ctx.fillStyle = 'rgba(40,25,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.7, y + s * 0.8, s, s * 0.7, 0.6, 0, TAU);
  ctx.fill();
  const n = 11;
  const rot = rnd() * TAU;
  const leaf = mix(theme.palmDark, '#8a9a6a', 0.35);
  for (let k = 0; k < n; k++) {
    const a = rot + (k / n) * TAU + (rnd() - 0.5) * 0.2;
    const len = s * (0.8 + rnd() * 0.3);
    ctx.fillStyle = k % 2 ? leaf : tone(leaf, 0.18);
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5, len * 0.52, s * 0.1, a, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = alpha(tone(leaf, -0.35), 0.7);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let k = 0; k < n; k++) {
    const a = rot + (k / n) * TAU;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * s * 0.9, y + Math.sin(a) * s * 0.9);
  }
  ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const a = rot + k * 2.1 + 0.4;
    ctx.fillStyle = k % 2 ? '#c8781e' : '#e0962a';
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * s * 0.22, y + Math.sin(a) * s * 0.22, s * 0.12, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = theme.palmTrunk;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.1, 0, TAU);
  ctx.fill();
}

export function drawBoulder(ctx: Ctx, x: number, y: number, s: number, rnd: Rnd, colors: readonly string[]) {
  ctx.fillStyle = 'rgba(0,15,20,0.3)';
  ctx.beginPath();
  ctx.arc(x + s * 0.3, y + s * 0.45, s, 0, TAU);
  ctx.fill();
  ctx.fillStyle = colors[0];
  blobPath(ctx, x, y, s, rnd, 7, 0.35);
  ctx.fill();
  ctx.fillStyle = colors[1];
  blobPath(ctx, x - s * 0.18, y - s * 0.18, s * 0.66, rnd, 6, 0.3);
  ctx.fill();
  ctx.fillStyle = alpha(colors[2].startsWith('#') ? colors[2] : '#ffffff', 0.8);
  ctx.beginPath();
  ctx.arc(x - s * 0.35, y - s * 0.35, s * 0.28, 0, TAU);
  ctx.fill();
}
