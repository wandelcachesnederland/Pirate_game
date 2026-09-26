// ERA: TSUSHIMA (1905) — pre-dreadnought battleship.

import type { ShipDef } from '../../types';

export const MIKASA: ShipDef = {
  kind: 'player',
  name: 'Mikasa',
  faction: 'japan',
  length: 96,
  width: 26,
  hp: 180,
  speed: 155,
  accel: 62,
  turn: 1.05,
  cannons: 4,
  reload: 2.0,
  damage: 14,
  range: 500,
  ballSpeed: 720,
  masts: 0,
  crew: 160,
  value: 0,
  coins: 0,
  hull: '#3a4044',
  deck: '#565c60',
  trim: '#c9a227',
  sail: '#3a4044',
  sailShade: '#222628',
  styleKey: 'era-mikasa',
  hullStyle: 'warship',
};
