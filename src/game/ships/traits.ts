// Hero-hull scouting report: what each flagship is good at and bad at, worked
// out from her stats against the rest of the fleet. The shipyard shows these
// under every portrait so a captain can tell a gun platform from a sprinter at
// a glance.

import { isSteelHull, type EraId, type ShipDef } from '../types';
import { ERA_SHIPS } from './era';
import { usesGunpowder } from '../weapons';

/**
 * One line of the report, as a dictionary key: `hero:scout.<key>` with
 * `params`, except `armHeavy`, which the picker renders as the era's real
 * armament name. Keys keep game logic free of language.
 */
export interface TraitChip {
  key: string;
  params?: Record<string, string | number>;
}

export interface ShipTraits {
  strengths: TraitChip[];
  weaknesses: TraitChip[];
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

type Chip = [number, TraitChip];

/** Strengths and weaknesses, strongest line first. 1-3 of each, never empty.
 * Pass the era to name the armament a pre-gunpowder hull really carries. */
export function shipTraits(def: ShipDef, era?: EraId): ShipTraits {
  const strengths: Chip[] = [];
  const weaknesses: Chip[] = [];
  const hpR = def.hp / MAX.hp;
  const spdR = def.speed / MAX.speed;
  const gunR = def.cannons / MAX.cannons;
  const turnR = def.turn / MAX.turn;
  const big = def.length > MAX.length * 0.75;

  if (hpR >= 0.6) strengths.push([hpR, { key: 'toughHull', params: { hp: def.hp } }]);
  if (spdR >= 0.8) strengths.push([spdR, { key: 'fast', params: { speed: def.speed } }]);
  if (gunR >= 0.8) strengths.push([gunR, { key: 'heavyBroadside', params: { guns: def.cannons } }]);
  if (turnR >= 0.85) strengths.push([turnR, { key: 'nimble' }]);
  if (def.reload <= 2.6) strengths.push([0.7, { key: 'quickReload', params: { s: def.reload.toFixed(1) } }]);
  if (def.oared || isSteelHull(def.hullStyle))
    strengths.push([0.75, { key: isSteelHull(def.hullStyle) ? 'burnsFuel' : 'paddles' }]);
  if (def.mortar) strengths.push([0.72, { key: 'lobsShells' }]);
  if ((def.crew ?? 0) >= 120) strengths.push([0.68, { key: 'bigCrew', params: { crew: def.crew ?? 0 } }]);
  if (big && def.cannons >= 3) {
    const key =
      def.weapon === 'mechanical'
        ? era && !usesGunpowder(era)
          ? 'armHeavy'
          : 'archersFallback'
        : 'fortGuns';
    strengths.push([0.66, { key }]);
  }

  if (hpR <= 0.4) weaknesses.push([1 - hpR, { key: 'thinHull', params: { hp: def.hp } }]);
  if (spdR <= 0.65) weaknesses.push([1 - spdR, { key: 'slow', params: { speed: def.speed } }]);
  if (def.cannons <= 2) weaknesses.push([0.6, { key: 'lightBroadside', params: { guns: def.cannons } }]);
  if (turnR <= 0.7) weaknesses.push([1 - turnR, { key: 'sluggish' }]);
  if (def.reload >= 4) weaknesses.push([0.55, { key: 'slowReload', params: { s: def.reload.toFixed(1) } }]);
  if ((def.crew ?? 99) <= 26) weaknesses.push([0.5, { key: 'fewHands', params: { crew: def.crew ?? 0 } }]);
  if (big) weaknesses.push([0.5, { key: 'bigTarget' }]);

  // a hull can be good at everything (or bad at nothing): fall back to her very
  // best and very worst traits so every card still reads as a scouting report
  if (strengths.length === 0) {
    const best = [
      [hpR, { key: 'toughHull', params: { hp: def.hp } }],
      [spdR, { key: 'fast', params: { speed: def.speed } }],
      [gunR, { key: 'heavyBroadside', params: { guns: def.cannons } }],
      [turnR, { key: 'nimble' }],
    ].sort((a, b) => (b[0] as number) - (a[0] as number))[0] as Chip;
    strengths.push(best);
  }
  if (weaknesses.length === 0) {
    const worst = [
      [hpR, { key: 'thinHull', params: { hp: def.hp } }],
      [spdR, { key: 'slow', params: { speed: def.speed } }],
      [gunR, { key: 'lightBroadside', params: { guns: def.cannons } }],
      [turnR, { key: 'sluggish' }],
    ].sort((a, b) => (a[0] as number) - (b[0] as number))[0] as Chip;
    weaknesses.push(worst);
  }

  return {
    strengths: strengths
      .sort((a, b) => b[0] - a[0])
      .slice(0, 3)
      .map(([, s]) => s),
    weaknesses: weaknesses
      .sort((a, b) => b[0] - a[0])
      .slice(0, 2)
      .map(([, s]) => s),
  };
}
