// ERA: AGE OF EXPLORATION (c. 1500) — caravel.
// Nimble three-master with a tall stern castle. Light guns, quick helm.

import type { ShipDef } from '../../types';

export const SANTA_BRISA: ShipDef = {
  kind: 'player',
  name: 'Santa Brisa',
  faction: 'pirate',
  length: 58,
  width: 24,
  hp: 90,
  speed: 176,
  accel: 96,
  turn: 1.95,
  cannons: 2,
  reload: 1.7,
  damage: 11,
  range: 400,
  ballSpeed: 540,
  masts: 3,
  crew: 34,
  value: 0,
  coins: 0,
  hull: '#6b4a26',
  deck: '#caa367',
  trim: '#7a2d1e',
  sail: '#efe3c4',
  sailShade: '#c3b48c',
  styleKey: 'era-caravel',
  hullStyle: 'caravel',
};
