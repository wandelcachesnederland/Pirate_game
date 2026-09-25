// HERITAGE: JAPAN (c. 1600) — atakebune.
//
// Museum piece — not sailed in gameplay yet. Black-lacquered floating
// castle with iron plating and a bristling gun deck — the shogun's hammer.

import type { ShipDef } from '../../types';

export const JAPANESE_ATAKEBUNE: ShipDef = {
  kind: 'player',
  name: 'O-Atakebune',
  faction: 'pirate',
  length: 74,
  width: 30,
  hp: 160,
  speed: 132,
  accel: 70,
  turn: 1.35,
  cannons: 4,
  reload: 1.8,
  damage: 8,
  range: 360,
  ballSpeed: 520,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#2c2c34',
  deck: '#8a7a5a',
  trim: '#c9a227',
  sail: '#e8e0cc',
  sailShade: '#b0a488',
  styleKey: 'heritage-japanese',
  hullStyle: 'atakebune',
  crew: 80,
};
