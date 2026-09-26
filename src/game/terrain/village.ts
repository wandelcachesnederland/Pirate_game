// Villages, quays and individual buildings.

import { TAU } from '../math';
import type { TerrainVillage } from './recipe';
import { tone, type Ctx, type Job } from './shared';

// ── villages ──────────────────────────────────────────────────────────────

export const STONE_QUAYS: TerrainVillage[] = ['stone', 'terracotta', 'whitewash', 'japanese', 'stucco'];

export function paintVillage(j: Job, a: number) {
  const { ctx, T, rnd } = j;
  const d = j.R(a);
  // the landing: a stone quay or a timber jetty
  ctx.save();
  ctx.translate(Math.cos(a) * (d - 4), Math.sin(a) * (d - 4));
  ctx.rotate(a);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(2, 0, 32, 8);
  if (STONE_QUAYS.includes(T.village)) {
    ctx.fillStyle = j.stone;
    ctx.fillRect(0, -4.5, 30, 9);
    ctx.fillStyle = tone(j.stone, 0.2);
    ctx.fillRect(0, -4.5, 30, 2);
    ctx.strokeStyle = tone(j.stone, -0.3);
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let k = 5; k < 30; k += 5) (ctx.moveTo(k, -4.5), ctx.lineTo(k, 4.5));
    ctx.moveTo(0, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    ctx.strokeRect(0, -4.5, 30, 9);
  } else {
    ctx.fillStyle = '#8a6338';
    ctx.fillRect(0, -3.5, 34, 7);
    ctx.strokeStyle = '#5a3d1f';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let k = 3; k < 34; k += 4) (ctx.moveTo(k, -3.5), ctx.lineTo(k, 3.5));
    ctx.stroke();
    ctx.fillStyle = '#4a3220';
    for (let k = 4; k < 34; k += 10) {
      ctx.beginPath();
      ctx.arc(k, -4, 1.2, 0, TAU);
      ctx.arc(k, 4, 1.2, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  const n = T.village === 'whitewash' || T.village === 'stucco' ? 6 : T.village === 'longhouse' ? 3 : 4;
  for (let k = 0; k < n; k++) {
    const aa = a + (k - (n - 1) / 2) * (T.village === 'whitewash' ? 0.09 : 0.15);
    const dd = j.R(aa) * (0.8 - (k % 2) * 0.09);
    drawBuilding(j, T.village, Math.cos(aa) * dd, Math.sin(aa) * dd, 9 + rnd() * 4, aa + (rnd() - 0.5) * 0.4, k);
  }

  // a boat hauled up on the beach
  const ca = a + 0.6;
  const cd = j.R(ca) * 0.95;
  ctx.save();
  ctx.translate(Math.cos(ca) * cd, Math.sin(ca) * cd);
  ctx.rotate(ca + 1.1);
  if (T.village === 'longhouse') {
    // a little longship: clinker hull, a row of shields
    ctx.fillStyle = '#5a3d22';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 3.4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#7a5632';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10.5, 2.2, 0, 0, TAU);
    ctx.fill();
    for (let k = -8; k <= 8; k += 4) {
      ctx.fillStyle = k % 8 ? '#c8a23a' : '#a8322a';
      ctx.beginPath();
      ctx.arc(k, -3, 1.3, 0, TAU);
      ctx.arc(k, 3, 1.3, 0, TAU);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = T.village === 'mudbrick' || T.village === 'whitewash' ? '#6b4a2a' : '#8a6338';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 2.8, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#5a3d20';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.5, 1.6, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** A pitched roof from above: a lit half, a shaded half and a ridge. */
export function gable(ctx: Ctx, w: number, h: number, litCol: string, shadeCol: string, ridge: string) {
  ctx.fillStyle = litCol;
  ctx.fillRect(-w / 2, -h / 2, w, h / 2);
  ctx.fillStyle = shadeCol;
  ctx.fillRect(-w / 2, 0, w, h / 2);
  ctx.strokeStyle = ridge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(w / 2, 0);
  ctx.stroke();
}

export function shadowRect(ctx: Ctx, w: number, h: number, k = 1) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(-w / 2 + 2 * k, -h / 2 + 3 * k, w, h);
}

export function drawBuilding(j: Job, kind: TerrainVillage, x: number, y: number, s: number, rot: number, k: number) {
  const { ctx, rnd } = j;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  switch (kind) {
    case 'stone': {
      const w = s * 1.35;
      const h = s * 0.95;
      shadowRect(ctx, w, h);
      ctx.fillStyle = j.stone;
      ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      gable(ctx, w, h, '#6a7580', '#4b545e', '#2f363d');
      ctx.fillStyle = '#6b675f';
      ctx.fillRect(w / 2 - 3.5, -h / 2 + 1, 2.5, 2.5);
      break;
    }
    case 'longhouse': {
      // a long turf-roofed hall with bowed sides
      const w = s * 2.5;
      const h = s * 1.05;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(2, 3, w / 2, h / 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#6b4a2a';
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#6a7a44';
      ctx.beginPath();
      ctx.ellipse(0, -0.5, w / 2 - 1.5, h / 2 - 1, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = '#4e5d32';
      ctx.beginPath();
      ctx.ellipse(0, 0.5, w / 2 - 1.5, h / 2 - 1, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#3d4a26';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 2, 0);
      ctx.lineTo(w / 2 - 2, 0);
      ctx.stroke();
      ctx.fillStyle = '#2a2018';
      ctx.fillRect(-1.2, -1.2, 2.4, 2.4);
      ctx.fillStyle = 'rgba(200,200,200,0.35)';
      ctx.beginPath();
      ctx.arc(3, -3, 2.5, 0, TAU);
      ctx.arc(6, -5, 2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'clapboard': {
      const w = s * 1.3;
      const h = s * 0.95;
      shadowRect(ctx, w, h);
      ctx.fillStyle = '#efeee6';
      ctx.fillRect(-w / 2 - 1.2, -h / 2 - 1.2, w + 2.4, h + 2.4);
      if (k % 4 === 3) gable(ctx, w, h, '#a4483a', '#7e3328', '#4f1f18');
      else gable(ctx, w, h, '#8c8e92', '#686a70', '#45474c');
      ctx.fillStyle = '#7a3a2a';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 1, 2, 2);
      break;
    }
    case 'terracotta': {
      const w = s * 1.3;
      const h = s * 1.0;
      shadowRect(ctx, w, h);
      ctx.fillStyle = '#e2cf9c';
      ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      gable(ctx, w, h, '#d0703f', '#a8522c', '#7a3a1e');
      ctx.strokeStyle = 'rgba(90,35,15,0.35)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let t = -w / 2 + 2; t < w / 2; t += 2) (ctx.moveTo(t, -h / 2), ctx.lineTo(t, h / 2));
      ctx.stroke();
      if (k % 2 === 0) {
        // an L-shaped wing round a courtyard
        ctx.translate(-w / 2 + h * 0.35, h * 0.8);
        ctx.rotate(Math.PI / 2);
        shadowRect(ctx, h * 0.9, h * 0.7);
        gable(ctx, h * 0.9, h * 0.7, '#cc6a3a', '#9e4c28', '#7a3a1e');
      }
      break;
    }
    case 'whitewash': {
      // Cycladic cubes: flat white roofs, a blue door here and there
      const w = s * (0.8 + rnd() * 0.5);
      const h = s * (0.7 + rnd() * 0.4);
      ctx.fillStyle = 'rgba(0,10,30,0.28)';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
      ctx.fillStyle = '#f6f4ec';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#cfcabd';
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2);
      if (k % 2) {
        ctx.fillStyle = '#2f64a8';
        ctx.fillRect(w / 2 - 1, -1.5, 1.6, 3);
      }
      if (k === 2) {
        ctx.fillStyle = '#3a72b8';
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(w, h) * 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(-1, -1, Math.min(w, h) * 0.12, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'mudbrick':
    case 'adobe':
    case 'stucco': {
      // flat roofs behind a parapet
      const w = s * (0.95 + rnd() * 0.4);
      const h = s * (0.85 + rnd() * 0.3);
      const [wall, rim, trim] =
        kind === 'mudbrick' ? ['#c7a26f', '#dcbf8e', '#8a6a42'] : kind === 'adobe' ? ['#b39470', '#c8ab86', '#7a5e40'] : ['#ece6d6', '#faf6ea', '#a8322a'];
      shadowRect(ctx, w, h);
      ctx.fillStyle = rim;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = wall;
      ctx.fillRect(-w / 2 + 1.4, -h / 2 + 1.4, w - 2.8, h - 2.8);
      ctx.fillStyle = trim;
      if (kind === 'stucco') {
        ctx.strokeStyle = trim;
        ctx.lineWidth = 1;
        ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
      } else {
        ctx.fillRect(-1.2, -1.2, 2.4, 2.4);
      }
      if (kind === 'mudbrick' && k === 1) {
        // a wind-tower catching the breeze
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(w / 2 - 3, -h / 2 + 3, 5, 5);
        ctx.fillStyle = '#e0c898';
        ctx.fillRect(w / 2 - 5, -h / 2, 5, 5);
        ctx.strokeStyle = '#8a6a42';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 5, -h / 2);
        ctx.lineTo(w / 2, -h / 2 + 5);
        ctx.moveTo(w / 2, -h / 2);
        ctx.lineTo(w / 2 - 5, -h / 2 + 5);
        ctx.stroke();
      }
      break;
    }
    case 'japanese': {
      // a hipped roof of dark tile with a pale ridge cap
      const w = s * 1.4;
      const h = s * 1.0;
      shadowRect(ctx, w + 2, h + 2);
      ctx.fillStyle = '#565e68';
      ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      ctx.fillStyle = '#6a737e';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 1, -h / 2 - 1);
      ctx.lineTo(w / 2 + 1, -h / 2 - 1);
      ctx.lineTo(w / 2 - h / 2, 0);
      ctx.lineTo(-w / 2 + h / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3f454e';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 1, h / 2 + 1);
      ctx.lineTo(w / 2 + 1, h / 2 + 1);
      ctx.lineTo(w / 2 - h / 2, 0);
      ctx.lineTo(-w / 2 + h / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a8aeb4';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + h / 2, 0);
      ctx.lineTo(w / 2 - h / 2, 0);
      ctx.stroke();
      break;
    }
    case 'hanok': {
      // sweeping eaves: tiled or thatched
      const w = s * 1.4;
      const h = s * 1.0;
      const thatch = k % 2 === 1;
      const [lit, dim] = thatch ? ['#c9a860', '#a8883e'] : ['#5f666e', '#454b52'];
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
      if (thatch) {
        // choga: a thick, rounded straw roof tied down with rope
        const round = (ox: number, oy: number, ww: number, hh: number) => {
          const q = Math.min(ww, hh) * 0.45;
          ctx.beginPath();
          ctx.moveTo(ox - ww / 2 + q, oy - hh / 2);
          ctx.lineTo(ox + ww / 2 - q, oy - hh / 2);
          ctx.quadraticCurveTo(ox + ww / 2, oy - hh / 2, ox + ww / 2, oy - hh / 2 + q);
          ctx.lineTo(ox + ww / 2, oy + hh / 2 - q);
          ctx.quadraticCurveTo(ox + ww / 2, oy + hh / 2, ox + ww / 2 - q, oy + hh / 2);
          ctx.lineTo(ox - ww / 2 + q, oy + hh / 2);
          ctx.quadraticCurveTo(ox - ww / 2, oy + hh / 2, ox - ww / 2, oy + hh / 2 - q);
          ctx.lineTo(ox - ww / 2, oy - hh / 2 + q);
          ctx.quadraticCurveTo(ox - ww / 2, oy - hh / 2, ox - ww / 2 + q, oy - hh / 2);
          ctx.closePath();
        };
        ctx.fillStyle = dim;
        round(0, 0, w, h);
        ctx.fill();
        ctx.fillStyle = lit;
        round(-0.4, -0.8, w - 2, h - 2.4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(110,85,40,0.6)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let t = -w / 2 + 2.5; t < w / 2 - 1; t += 2.5) (ctx.moveTo(t, -h / 2 + 0.8), ctx.lineTo(t, h / 2 - 0.8));
        ctx.moveTo(-w / 2 + 1.5, 0);
        ctx.lineTo(w / 2 - 1.5, 0);
        ctx.stroke();
      } else {
        const curve = (sy: number, col: string) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(-w / 2 - 2, sy * (h / 2 + 2));
          ctx.quadraticCurveTo(0, sy * (h / 2 - 1.5), w / 2 + 2, sy * (h / 2 + 2));
          ctx.lineTo(w / 2 - 2, 0);
          ctx.lineTo(-w / 2 + 2, 0);
          ctx.closePath();
          ctx.fill();
        };
        curve(-1, lit);
        curve(1, dim);
        ctx.strokeStyle = '#d8dcd8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 1, 0);
        ctx.lineTo(w / 2 - 1, 0);
        ctx.stroke();
      }
      break;
    }
    case 'whare': {
      // raupō thatch with a carved red bargeboard at the porch end
      const w = s * 1.35;
      const h = s * 0.9;
      shadowRect(ctx, w, h);
      gable(ctx, w, h, '#a3895a', '#7f6840', '#5a4628');
      ctx.strokeStyle = '#9a2a1c';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(w / 2 + 1.5, -h / 2);
      ctx.lineTo(w / 2 - 1, 0);
      ctx.lineTo(w / 2 + 1.5, h / 2);
      ctx.stroke();
      ctx.fillStyle = '#f0e6d0';
      ctx.beginPath();
      ctx.arc(w / 2 - 1, 0, 0.9, 0, TAU);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}
