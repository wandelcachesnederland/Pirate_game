// Landmarks a sailor would know the waters by.

import { TAU } from '../math';
import type { TerrainLandmark } from './recipe';
import { tone, alpha, type Job, markScale, PYRAMID_SCALE, blobPath } from './shared';
import { drawDatePalm } from './trees';
import { drawBuilding } from './village';

// ── landmarks ─────────────────────────────────────────────────────────────

export function paintLandmark(j: Job, kind: TerrainLandmark, x: number, y: number, a: number) {
  const { ctx, rnd, r } = j;
  const s = markScale(r);
  ctx.save();
  ctx.translate(x, y);
  switch (kind) {
    case 'lighthouse': {
      // a banded tower on the point, its lamp throwing a glow
      ctx.fillStyle = 'rgba(0,10,20,0.3)';
      ctx.beginPath();
      ctx.ellipse(s * 1.1, s * 1.3, s * 1.6, s * 0.5, Math.PI / 4, 0, TAU);
      ctx.fill();
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.6);
      glow.addColorStop(0, 'rgba(255,236,160,0.45)');
      glow.addColorStop(1, 'rgba(255,236,160,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, s * 2.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = j.stone;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.85, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f4f2ea';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.62, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#b3261e';
      ctx.lineWidth = s * 0.14;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.45, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffe07a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'screwpile': {
      // a Chesapeake screwpile light: a hexagonal cottage on iron legs
      ctx.rotate(a);
      ctx.fillStyle = 'rgba(0,15,20,0.3)';
      ctx.beginPath();
      ctx.arc(s * 0.4, s * 0.5, s * 1.1, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#3a3530';
      for (let k = 0; k < 6; k++) {
        const ka = (k / 6) * TAU;
        ctx.beginPath();
        ctx.arc(Math.cos(ka) * s * 1.05, Math.sin(ka) * s * 1.05, 1.1, 0, TAU);
        ctx.fill();
      }
      const hex = (rad: number) => {
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const ka = (k / 6) * TAU;
          if (k === 0) ctx.moveTo(Math.cos(ka) * rad, Math.sin(ka) * rad);
          else ctx.lineTo(Math.cos(ka) * rad, Math.sin(ka) * rad);
        }
        ctx.closePath();
      };
      ctx.fillStyle = '#f2efe6';
      hex(s * 0.9);
      ctx.fill();
      ctx.fillStyle = '#a8382c';
      hex(s * 0.72);
      ctx.fill();
      ctx.strokeStyle = '#6e2018';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const ka = (k / 6) * TAU;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ka) * s * 0.72, Math.sin(ka) * s * 0.72);
      }
      ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffe07a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.17, 0, TAU);
      ctx.fill();
      break;
    }
    case 'standingStones': {
      // a ring of standing stones in a trampled clearing
      ctx.fillStyle = alpha(tone(j.T.groundColor ?? j.theme.jungle, 0.25), 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, s * 1.4, 0, TAU);
      ctx.fill();
      const n = 9;
      for (let k = 0; k < n; k++) {
        const ka = (k / n) * TAU + rnd() * 0.15;
        const px = Math.cos(ka) * s * 1.05;
        const py = Math.sin(ka) * s * 1.05;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ka);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(-s * 0.1 + 1.5, -s * 0.16 + 3, s * 0.36, s * 0.32);
        ctx.fillStyle = '#8c8b86';
        ctx.fillRect(-s * 0.14, -s * 0.18, s * 0.32, s * 0.36);
        ctx.fillStyle = '#b4b3ad';
        ctx.fillRect(-s * 0.14, -s * 0.18, s * 0.32, s * 0.12);
        ctx.restore();
      }
      ctx.fillStyle = '#7a7974';
      ctx.fillRect(-s * 0.3, -s * 0.12, s * 0.6, s * 0.24);
      break;
    }
    case 'temple': {
      // a Doric temple: stylobate, colonnade and what is left of the roof
      ctx.rotate(a + Math.PI / 2);
      const w = s * 2.4;
      const h = s * 1.4;
      ctx.fillStyle = 'rgba(30,20,0,0.3)';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
      ctx.fillStyle = '#d8d0b8';
      ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
      ctx.fillStyle = '#ece6d2';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#d0c8ae';
      ctx.fillRect(-w * 0.32, -h * 0.26, w * 0.64, h * 0.52);
      // half the roof still on: terracotta over the east end
      ctx.fillStyle = '#b8643a';
      ctx.fillRect(0, -h / 2 + 1, w / 2 - 1, h / 2 - 1);
      ctx.fillStyle = '#95502c';
      ctx.fillRect(0, 0, w / 2 - 1, h / 2 - 1);
      const cols = 8;
      for (let k = 0; k < cols; k++) {
        const cx = -w / 2 + 1.6 + (k / (cols - 1)) * (w - 3.2);
        for (const cy of [-h / 2 + 1.6, h / 2 - 1.6]) {
          ctx.fillStyle = 'rgba(60,50,30,0.35)';
          ctx.beginPath();
          ctx.arc(cx + 0.6, cy + 0.9, 1.3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#faf7ec';
          ctx.beginPath();
          ctx.arc(cx, cy, 1.2, 0, TAU);
          ctx.fill();
        }
      }
      for (const cx of [-w / 2 + 1.6, w / 2 - 1.6]) {
        for (let k = 1; k < 3; k++) {
          const cy = -h / 2 + 1.6 + (k / 3) * (h - 3.2);
          ctx.fillStyle = '#faf7ec';
          ctx.beginPath();
          ctx.arc(cx, cy, 1.2, 0, TAU);
          ctx.fill();
        }
      }
      break;
    }
    case 'church': {
      // a cross-in-square church under a leaded central dome
      ctx.rotate(a);
      const w = s * 1.7;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-w / 2 + 3, -w / 2 + 4, w, w);
      ctx.fillStyle = '#c9b48a';
      ctx.fillRect(-w / 2 - 1, -w / 2 - 1, w + 2, w + 2);
      ctx.fillStyle = '#b5562e';
      ctx.fillRect(-w / 2, -w / 2, w, w);
      ctx.fillStyle = '#cf6c3f';
      ctx.fillRect(-w / 2, -w * 0.18, w, w * 0.36);
      ctx.fillRect(-w * 0.18, -w / 2, w * 0.36, w);
      ctx.fillStyle = '#b5562e';
      ctx.beginPath();
      ctx.arc(w / 2, 0, w * 0.2, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      const dome = (dx: number, dy: number, dr: number) => {
        const g = ctx.createRadialGradient(dx - dr * 0.35, dy - dr * 0.35, dr * 0.1, dx, dy, dr);
        g.addColorStop(0, '#b8c4c8');
        g.addColorStop(1, '#5d6a70');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(40,50,55,0.5)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const ka = (k / 8) * TAU;
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx + Math.cos(ka) * dr, dy + Math.sin(ka) * dr);
        }
        ctx.stroke();
      };
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) dome(dx * w * 0.32, dy * w * 0.32, w * 0.12);
      dome(0, 0, w * 0.3);
      ctx.fillStyle = '#e8c860';
      ctx.beginPath();
      ctx.arc(0, 0, 1.2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'windmill': {
      // a round white mill, conical cap and four lattice sails
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(s * 0.8, s * 1.0, s * 1.2, s * 0.6, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f2eee2';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.62, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#8a5a3a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.45, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#6a4228';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const ka = (k / 8) * TAU;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ka) * s * 0.45, Math.sin(ka) * s * 0.45);
      }
      ctx.stroke();
      const rot = rnd() * TAU;
      for (let k = 0; k < 4; k++) {
        const ka = rot + (k / 4) * TAU;
        ctx.save();
        ctx.rotate(ka);
        ctx.fillStyle = 'rgba(245,240,225,0.85)';
        ctx.fillRect(s * 0.3, 0, s * 1.3, s * 0.34);
        ctx.strokeStyle = '#4a3622';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 1.65, 0);
        ctx.stroke();
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        for (let t = s * 0.45; t < s * 1.6; t += s * 0.22) (ctx.moveTo(t, 0), ctx.lineTo(t, s * 0.34));
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.arc(0, 0, 1.3, 0, TAU);
      ctx.fill();
      break;
    }
    case 'obelisk': {
      // twin obelisks on a paved court, their long shadows across it
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = '#d6c69a';
      ctx.fillRect(-s * 1.3, -s * 0.9, s * 2.6, s * 1.8);
      ctx.strokeStyle = 'rgba(120,100,60,0.4)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-s * 1.3, -s * 0.9, s * 2.6, s * 1.8);
      ctx.rotate(-(a + Math.PI / 2));
      for (const ox of [-s * 0.6, s * 0.6]) {
        const px = Math.cos(a + Math.PI / 2) * ox;
        const py = Math.sin(a + Math.PI / 2) * ox;
        ctx.fillStyle = 'rgba(40,25,0,0.4)';
        ctx.beginPath();
        ctx.moveTo(px - 1.3, py + 1.3);
        ctx.lineTo(px + s * 2.3, py + s * 2.5);
        ctx.lineTo(px + 1.3, py - 1.3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#c4a878';
        ctx.fillRect(px - 2, py - 2, 4, 4);
        ctx.fillStyle = '#f0cf58';
        ctx.beginPath();
        ctx.moveTo(px - 2, py - 2);
        ctx.lineTo(px, py);
        ctx.lineTo(px + 2, py - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d8b040';
        ctx.beginPath();
        ctx.moveTo(px - 2, py + 2);
        ctx.lineTo(px, py);
        ctx.lineTo(px + 2, py + 2);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'oasis': {
      // a spring-fed pool ringed with grass and date palms
      const pr = s * 1.2;
      ctx.fillStyle = alpha(j.theme.greens[1] ?? '#6b7a3a', 0.85);
      blobPath(ctx, 0, 0, pr * 1.9, rnd, 10, 0.3);
      ctx.fill();
      ctx.fillStyle = tone(j.theme.wetSand, -0.1);
      blobPath(ctx, 0, 0, pr * 1.15, rnd, 9, 0.2);
      ctx.fill();
      ctx.fillStyle = j.pool;
      blobPath(ctx, 0, 0, pr, rnd, 9, 0.2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.ellipse(-pr * 0.3, -pr * 0.3, pr * 0.4, pr * 0.2, -0.4, 0, TAU);
      ctx.fill();
      const n = 6 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const ka = (k / n) * TAU + rnd() * 0.4;
        const d = pr * (1.45 + rnd() * 0.4);
        drawDatePalm(ctx, Math.cos(ka) * d, Math.sin(ka) * d, 7 + rnd() * 3, rnd, j.theme);
      }
      break;
    }
    case 'torii': {
      // a vermilion gate standing in the shallows, facing the shrine ashore
      ctx.rotate(a + Math.PI / 2);
      const w = Math.max(24, s * 2.8);
      // its reflection-shadow on the water
      ctx.fillStyle = 'rgba(0,20,40,0.28)';
      ctx.fillRect(-w / 2 + 4, 2, w, 6);
      for (const px of [-w * 0.32, w * 0.32]) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, 2.5, 5, Math.PI * 0.05, Math.PI * 0.95);
        ctx.stroke();
        ctx.fillStyle = '#a82a18';
        ctx.beginPath();
        ctx.arc(px, 2.5, 2.8, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#e0452a';
      ctx.fillRect(-w * 0.42, 1.2, w * 0.84, 3);
      ctx.fillStyle = '#d23a22';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 2, -4.5);
      ctx.quadraticCurveTo(0, -1.5, w / 2 + 2, -4.5);
      ctx.lineTo(w / 2, -0.2);
      ctx.quadraticCurveTo(0, 1.4, -w / 2, -0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#26211e';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 2, -4.5);
      ctx.quadraticCurveTo(0, -1.5, w / 2 + 2, -4.5);
      ctx.lineTo(w / 2 + 1, -2.6);
      ctx.quadraticCurveTo(0, 0, -w / 2 - 1, -2.6);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'beacon': {
      // a bongsudae: stone platform, five chimneys, one of them lit
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(2.5, 3.5, s * 1.3, s * 0.95, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(j.stone, -0.1);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.3, s * 0.95, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = j.stone;
      ctx.beginPath();
      ctx.ellipse(-0.5, -0.8, s * 1.15, s * 0.8, 0, 0, TAU);
      ctx.fill();
      const lit = Math.floor(rnd() * 5);
      for (let k = 0; k < 5; k++) {
        const cx = (k - 2) * s * 0.44;
        ctx.fillStyle = tone(j.stone, -0.3);
        ctx.beginPath();
        ctx.arc(cx, 0, s * 0.18, 0, TAU);
        ctx.fill();
        ctx.fillStyle = k === lit ? '#ff8a2a' : '#2a2622';
        ctx.beginPath();
        ctx.arc(cx, 0, s * 0.1, 0, TAU);
        ctx.fill();
        if (k === lit) {
          for (let q = 0; q < 5; q++) {
            ctx.fillStyle = `rgba(210,210,205,${0.45 - q * 0.08})`;
            ctx.beginPath();
            ctx.arc(cx + q * s * 0.35, -q * s * 0.3 - 2, s * (0.2 + q * 0.09), 0, TAU);
            ctx.fill();
          }
        }
      }
      break;
    }
    case 'pa': {
      // a hill pā: terraced earthworks ringed by a palisade
      const g = j.T.groundColor ?? j.theme.jungle;
      for (let k = 3; k >= 1; k--) {
        const rr = s * (0.7 + k * 0.5);
        ctx.fillStyle = alpha(tone(g, -0.35), 0.5);
        ctx.beginPath();
        ctx.arc(1, 1.8, rr, 0, TAU);
        ctx.fill();
        ctx.fillStyle = tone(g, 0.05 + (3 - k) * 0.06);
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#4a3420';
      const posts = 26;
      for (let k = 0; k < posts; k++) {
        const ka = (k / posts) * TAU;
        ctx.beginPath();
        ctx.arc(Math.cos(ka) * s * 1.15, Math.sin(ka) * s * 1.15, 0.9, 0, TAU);
        ctx.fill();
      }
      drawBuilding(j, 'whare', -s * 0.25, -s * 0.1, 8, a, 0);
      drawBuilding(j, 'whare', s * 0.45, s * 0.35, 7, a + 1.2, 1);
      break;
    }
    case 'huaca': {
      // an adobe platform mound, stepped, with its ramp
      ctx.rotate(a);
      const tiers = ['#a88a62', '#b89a70', '#c8aa80'];
      tiers.forEach((col, k) => {
        const w = s * (2.3 - k * 0.6);
        const h = s * (1.7 - k * 0.45);
        ctx.fillStyle = 'rgba(40,20,0,0.3)';
        ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
        ctx.fillStyle = col;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = 'rgba(90,60,30,0.4)';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      });
      ctx.fillStyle = '#d6bb90';
      ctx.fillRect(s * 0.3, -s * 0.2, s * 1.2, s * 0.4);
      break;
    }
    case 'pyramid': {
      // a twin-shrined temple pyramid on its whitewashed plaza
      ctx.rotate(a);
      ctx.scale(PYRAMID_SCALE, PYRAMID_SCALE);
      const P = s * 3;
      ctx.fillStyle = '#e6e0d0';
      ctx.fillRect(-P / 2, -P / 2, P, P);
      ctx.strokeStyle = 'rgba(120,100,70,0.35)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-P / 2, -P / 2, P, P);
      const tiers = 4;
      for (let k = 0; k < tiers; k++) {
        const w = s * (2.3 - k * 0.42);
        ctx.fillStyle = 'rgba(40,30,10,0.3)';
        ctx.fillRect(-w / 2 + 1.5, -w / 2 + 2.2, w, w);
        ctx.fillStyle = k % 2 ? '#d8cdb2' : '#c9b48c';
        ctx.fillRect(-w / 2, -w / 2, w, w);
      }
      // twin stairs facing the lake
      ctx.fillStyle = '#efe8d8';
      ctx.fillRect(0, -s * 0.5, s * 1.15, s * 0.36);
      ctx.fillRect(0, s * 0.14, s * 1.15, s * 0.36);
      ctx.strokeStyle = 'rgba(100,80,50,0.35)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      for (let t = 1.5; t < s * 1.15; t += 1.6) {
        ctx.moveTo(t, -s * 0.5);
        ctx.lineTo(t, -s * 0.14);
        ctx.moveTo(t, s * 0.14);
        ctx.lineTo(t, s * 0.5);
      }
      ctx.stroke();
      // the shrines of Huitzilopochtli (red) and Tlaloc (blue)
      ctx.fillStyle = '#b3321f';
      ctx.fillRect(-s * 0.5, -s * 0.5, s * 0.5, s * 0.42);
      ctx.fillStyle = '#2f6fa8';
      ctx.fillRect(-s * 0.5, s * 0.08, s * 0.5, s * 0.42);
      break;
    }
    case 'vineyard': {
      ctx.rotate(a + rnd());
      const w = s * 2.4;
      const h = s * 1.7;
      ctx.fillStyle = '#9a7a52';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      for (let yy = -h / 2 + 2; yy < h / 2 - 1; yy += 2.8) {
        for (let xx = -w / 2 + 1.5; xx < w / 2 - 1; xx += 2.2) {
          ctx.fillStyle = (xx + yy) % 3 > 1 ? '#5a7a2c' : '#6b8a34';
          ctx.beginPath();
          ctx.arc(xx, yy, 1.05, 0, TAU);
          ctx.fill();
        }
      }
      ctx.strokeStyle = j.stone;
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      break;
    }
    case 'watchtower': {
      // a round crenellated tower
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(s * 0.9, s * 1.1, s * 1.3, s * 0.55, Math.PI / 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(j.stone, -0.12);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = j.stone;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.58, 0, TAU);
      ctx.fill();
      ctx.fillStyle = tone(j.stone, 0.2);
      for (let k = 0; k < 10; k++) {
        const ka = (k / 10) * TAU;
        ctx.fillRect(Math.cos(ka) * s * 0.7 - 1, Math.sin(ka) * s * 0.7 - 1, 2, 2);
      }
      ctx.fillStyle = tone(j.stone, -0.35);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, TAU);
      ctx.fill();
      break;
    }
    case 'causeway': {
      // a stone causeway striding out across the lake, a timber bridge in it
      ctx.rotate(a);
      const len = 50;
      ctx.fillStyle = 'rgba(0,20,20,0.25)';
      ctx.fillRect(-4, -3, len + 2, 9);
      ctx.fillStyle = tone(j.stone, -0.1);
      ctx.fillRect(-6, -4.5, len, 9);
      ctx.fillStyle = j.stone;
      ctx.fillRect(-6, -3.5, len, 7);
      ctx.fillStyle = '#8a6338';
      ctx.fillRect(len * 0.45, -4, 7, 8);
      ctx.strokeStyle = '#5a3d1f';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let t = len * 0.45 + 1.5; t < len * 0.45 + 7; t += 1.8) (ctx.moveTo(t, -4), ctx.lineTo(t, 4));
      ctx.stroke();
      break;
    }
    case 'seaWall': {
      // a stretch of sea wall along the shore, towers at intervals
      ctx.translate(-x, -y);
      const span = 0.9;
      const steps = 24;
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let k = 0; k <= steps; k++) {
        const ka = a - span / 2 + (k / steps) * span;
        const d = j.R(ka) * 0.9;
        if (k === 0) ctx.moveTo(Math.cos(ka) * d + 2, Math.sin(ka) * d + 3);
        else ctx.lineTo(Math.cos(ka) * d + 2, Math.sin(ka) * d + 3);
      }
      ctx.stroke();
      ctx.strokeStyle = j.stone;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let k = 0; k <= steps; k++) {
        const ka = a - span / 2 + (k / steps) * span;
        const d = j.R(ka) * 0.9;
        if (k === 0) ctx.moveTo(Math.cos(ka) * d, Math.sin(ka) * d);
        else ctx.lineTo(Math.cos(ka) * d, Math.sin(ka) * d);
      }
      ctx.stroke();
      for (let k = 0; k <= 4; k++) {
        const ka = a - span / 2 + (k / 4) * span;
        const d = j.R(ka) * 0.9;
        ctx.save();
        ctx.translate(Math.cos(ka) * d, Math.sin(ka) * d);
        ctx.rotate(ka);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-3, -3, 8, 8);
        ctx.fillStyle = tone(j.stone, 0.1);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.strokeStyle = tone(j.stone, -0.35);
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-4, -4, 8, 8);
        ctx.restore();
      }
      break;
    }
  }
  ctx.restore();
}
