// ERA: DUTCH GOLDEN AGE (c. 1666) — States’ ship of the line.

import type { ShipDef } from '../../types';

export const ZEVEN_PROVINCIEN: ShipDef = {
  kind: 'player',
  name: 'De Zeven Provinciën',
  faction: 'pirate',
  length: 86,
  width: 28,
  hp: 145,
  speed: 158,
  accel: 68,
  turn: 1.2,
  cannons: 4,
  reload: 1.65,
  damage: 12,
  range: 440,
  ballSpeed: 560,
  masts: 3,
  crew: 80,
  value: 0,
  coins: 0,
  hull: '#2c2418',
  deck: '#a8824c',
  trim: '#e07a28',
  sail: '#f8f4e8',
  sailShade: '#cfc9b6',
  styleKey: 'era-dutch',
};
