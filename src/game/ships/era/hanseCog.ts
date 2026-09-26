// ERA: HANSEATIC LEAGUE (c. 1360) — high-sided Baltic cog.

import type { ShipDef } from '../../types';

export const HANSE_COG: ShipDef = {
  kind: 'player',
  name: 'Die Kogge',
  faction: 'pirate',
  length: 64,
  width: 24,
  hp: 115,
  speed: 155,
  accel: 70,
  turn: 1.35,
  cannons: 2,
  reload: 2.1,
  damage: 10,
  range: 360,
  ballSpeed: 500,
  masts: 1,
  crew: 40,
  value: 0,
  coins: 0,
  hull: '#3b2314',
  deck: '#a0703f',
  trim: '#c9a227',
  sail: '#eadcbc',
  sailShade: '#bba57a',
  styleKey: 'era-hanse',
};
