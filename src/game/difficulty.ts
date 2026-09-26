// The voyage's peril, chosen on the start screen.
//
// Five levels, from a gentle cruise to a chart full of hunters. Buccaneer is
// the voyage as it was sailed — every modifier at 1 — and the other four scale
// off it. Enemy modifiers stack on top of the per-wave scaling in the engine,
// so a King of the Seas wave 10 is a Dread Captain's wave 10 with its teeth
// filed sharper, not a different roster. The deeper the peril, the richer the
// plunder: score and loot pay out by the same `plunder` hand.

import type { DifficultyId } from './types';

export interface DifficultyDef {
  id: DifficultyId;
  name: string;
  /** One line under the picker, in the voice of the quay. */
  tagline: string;
  /** 1..5 — the skull pips of the picker and the HUD. */
  skulls: number;

  // ---- the foes afloat
  /** Enemy hull strength (also scales war canoes and the boats they launch). */
  enemyHp: number;
  /** Everything an enemy does to your timbers: guns, rams, blasts, treachery. */
  enemyDamage: number;
  /** Enemy reload time — higher means slower broadsides. */
  enemyReload: number;
  /** Enemy hull speed. */
  enemySpeed: number;
  /** Enemy crews — more hands means harder boardings and nastier ambushes. */
  enemyCrew: number;
  /** Scatter on an enemy's aim — higher shoots wilder. */
  aimJitter: number;
  /** How well an enemy leads a running shot — lower shoots behind you. */
  aimLead: number;

  // ---- their numbers and pace
  /** Added to (or taken from) the cap of foes on the water at once. */
  spawnCap: number;
  /** Time between reinforcements — higher gives breathing room. */
  spawnPace: number;
  /** The wave's spawn budget — higher fields more and heavier sails. */
  waveBudget: number;

  // ---- the temper of the world
  /** Willingness of a mauled foe to strike her colours. */
  surrender: number;
  /** Fortress walls. */
  fortHp: number;
  /** Fortress guns. */
  fortDamage: number;
  /** The drip of the water butts and the bread room. */
  supplyDrain: number;

  // ---- the player's lot
  /** The flagship's hull at the start of the voyage. */
  playerHp: number;
  /** All score and all loot, from a coin on the water to a captured manifest. */
  plunder: number;
}

export const DIFFICULTIES: DifficultyDef[] = [
  {
    id: 'landlubber',
    name: 'Landlubber',
    tagline: 'A calm sea to learn the ropes — few foes, slow to shoot, quick to strike their colours.',
    skulls: 1,
    enemyHp: 0.7, enemyDamage: 0.6, enemyReload: 1.35, enemySpeed: 0.88, enemyCrew: 0.8,
    aimJitter: 2.2, aimLead: 0.5,
    spawnCap: -1, spawnPace: 1.6, waveBudget: 0.6,
    surrender: 1.5, fortHp: 0.7, fortDamage: 0.6, supplyDrain: 0.6,
    playerHp: 1.3, plunder: 0.75,
  },
  {
    id: 'swashbuckler',
    name: 'Swashbuckler',
    tagline: 'A fair fight, with the odds only slightly crooked.',
    skulls: 2,
    enemyHp: 0.85, enemyDamage: 0.8, enemyReload: 1.15, enemySpeed: 0.94, enemyCrew: 0.9,
    aimJitter: 1.5, aimLead: 0.75,
    spawnCap: 0, spawnPace: 1.25, waveBudget: 0.8,
    surrender: 1.25, fortHp: 0.85, fortDamage: 0.8, supplyDrain: 0.8,
    playerHp: 1.15, plunder: 0.9,
  },
  {
    id: 'buccaneer',
    name: 'Buccaneer',
    tagline: 'The voyage as it was sailed — no quarter given, none expected.',
    skulls: 3,
    enemyHp: 1, enemyDamage: 1, enemyReload: 1, enemySpeed: 1, enemyCrew: 1,
    aimJitter: 1, aimLead: 1,
    spawnCap: 0, spawnPace: 1, waveBudget: 1,
    surrender: 1, fortHp: 1, fortDamage: 1, supplyDrain: 1,
    playerHp: 1, plunder: 1,
  },
  {
    id: 'dreadCaptain',
    name: 'Dread Captain',
    tagline: 'Hardened foes, faster broadsides, and colours struck only at the last gasp.',
    skulls: 4,
    enemyHp: 1.25, enemyDamage: 1.3, enemyReload: 0.85, enemySpeed: 1.06, enemyCrew: 1.15,
    aimJitter: 0.65, aimLead: 1,
    spawnCap: 1, spawnPace: 0.8, waveBudget: 1.3,
    surrender: 0.75, fortHp: 1.25, fortDamage: 1.3, supplyDrain: 1.25,
    playerHp: 0.9, plunder: 1.25,
  },
  {
    id: 'kingOfTheSeas',
    name: 'King of the Seas',
    tagline: 'Every sail a hunter, every fort a grave — iron and gold in equal measure.',
    skulls: 5,
    enemyHp: 1.5, enemyDamage: 1.6, enemyReload: 0.72, enemySpeed: 1.12, enemyCrew: 1.3,
    aimJitter: 0.45, aimLead: 1,
    spawnCap: 2, spawnPace: 0.65, waveBudget: 1.6,
    surrender: 0.55, fortHp: 1.5, fortDamage: 1.6, supplyDrain: 1.5,
    playerHp: 0.8, plunder: 1.5,
  },
];

export const DEFAULT_DIFFICULTY: DifficultyId = 'buccaneer';

/** Resolve a difficulty, falling back to the middle of the road. */
export function difficultyById(id: DifficultyId): DifficultyDef {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES.find((d) => d.id === DEFAULT_DIFFICULTY)!;
}

/** The skull pips of a difficulty, for tables and epitaphs. */
export function skullsOf(id: DifficultyId | undefined): number {
  return id ? difficultyById(id).skulls : 0;
}
