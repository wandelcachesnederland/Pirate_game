// Hero-hull scouting report: what each flagship is good at and bad at, worked
// out from her stats against the rest of the fleet. The shipyard shows these
// under every portrait so a captain can tell a gun platform from a sprinter at
// a glance.

import type { ShipDef } from '../types';
import { ERA_SHIPS } from './era';

export interface ShipTraits {
  strengths: string[];
  weaknesses: string[];
}

export interface ShipScores {
  hull: number;
  speed: number;
  guns: number;
  helm: number;
}

const FLEET: ShipDef[] = ERA_SHIPS.map((e) => e.def);

function maxOf(pick: (d: ShipDef) => number): number {
  return Math.max(...FLEET.map(pick), 1);
}

const MAX = {
  hp: maxOf((d) => d.hp),
  speed: maxOf((d) => d.speed),
  cannons: maxOf((d) => d.cannons),
  turn: maxOf((d) => d.turn),
  length: maxOf((d) => d.length),
};

/** Bars for the gallery, normalised against the best hull afloat (0..1). */
export function shipScores(def: ShipDef): ShipScores {
  return {
    hull: def.hp / MAX.hp,
    speed: def.speed / MAX.speed,
    guns: def.cannons / MAX.cannons,
    helm: def.turn / MAX.turn,
  };
}

/** Strengths and weaknesses, strongest line first. 1-3 of each, never empty. */
export function shipTraits(def: ShipDef): ShipTraits {
  const strengths: [number, string][] = [];
  const weaknesses: [number, string][] = [];
  const hpR = def.hp / MAX.hp;
  const spdR = def.speed / MAX.speed;
  const gunR = def.cannons / MAX.cannons;
  const turnR = def.turn / MAX.turn;
  const big = def.length > MAX.length * 0.75;

  if (hpR >= 0.6) strengths.push([hpR, `Tough hull (${def.hp})`]);
  if (spdR >= 0.8) strengths.push([spdR, `Fast — ${def.speed} knots`]);
  if (gunR >= 0.8) strengths.push([gunR, `Heavy broadside — ${def.cannons} a side`]);
  if (turnR >= 0.85) strengths.push([turnR, 'Nimble helm']);
  if (def.reload <= 2.6) strengths.push([0.7, `Quick reload (${def.reload.toFixed(1)}s)`]);
  if (def.oared || def.hullStyle === 'ironclad') strengths.push([0.75, def.hullStyle === 'ironclad' ? 'Burns coal — wind means nothing' : 'Paddles — wind means nothing']);
  if (def.mortar) strengths.push([0.72, 'Lobs exploding shells']);
  if ((def.crew ?? 0) >= 120) strengths.push([0.68, `Big boarding crew (${def.crew})`]);
  if (big && def.cannons >= 3) strengths.push([0.66, 'Carries a whole fort’s worth of guns']);

  if (hpR <= 0.4) weaknesses.push([1 - hpR, `Thin hull (${def.hp})`]);
  if (spdR <= 0.65) weaknesses.push([1 - spdR, `Slow — ${def.speed} knots`]);
  if (def.cannons <= 2) weaknesses.push([0.6, `Light broadside (${def.cannons} a side)`]);
  if (turnR <= 0.7) weaknesses.push([1 - turnR, 'Sluggish helm']);
  if (def.reload >= 4) weaknesses.push([0.55, `Slow reload (${def.reload.toFixed(1)}s)`]);
  if ((def.crew ?? 99) <= 26) weaknesses.push([0.5, `Few hands for boarding (${def.crew})`]);
  if (big) weaknesses.push([0.5, 'A big target — broadsides find her']);

  // a hull can be good at everything (or bad at nothing): fall back to her very
  // best and very worst traits so every card still reads as a scouting report
  if (strengths.length === 0) {
    const best = [
      [hpR, `Tough hull (${def.hp})`],
      [spdR, `Fast — ${def.speed} knots`],
      [gunR, `Heavy broadside — ${def.cannons} a side`],
      [turnR, 'Nimble helm'],
    ].sort((a, b) => (b[0] as number) - (a[0] as number))[0] as [number, string];
    strengths.push(best);
  }
  if (weaknesses.length === 0) {
    const worst = [
      [hpR, `Thin hull (${def.hp})`],
      [spdR, `Slow — ${def.speed} knots`],
      [gunR, `Light broadside (${def.cannons} a side)`],
      [turnR, 'Sluggish helm'],
    ].sort((a, b) => (a[0] as number) - (b[0] as number))[0] as [number, string];
    weaknesses.push(worst);
  }

  return {
    strengths: strengths.sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, s]) => s),
    weaknesses: weaknesses.sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, s]) => s),
  };
}
