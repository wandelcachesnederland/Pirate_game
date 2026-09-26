// ERA: SPANISH ARMADA (1588) — race-built English galleon.

import type { ShipDef } from '../../types';

export const REVENGE: ShipDef = {
  kind: 'player',
  name: 'Revenge',
  faction: 'pirate',
  length: 70,
  width: 22,
  hp: 120,
  speed: 185,
  accel: 95,
  turn: 1.7,
  cannons: 4,
  reload: 1.5,
  damage: 11,
  range: 420,
  ballSpeed: 560,
  masts: 3,
  crew: 70,
  value: 0,
  coins: 0,
  hull: '#26303f',
  deck: '#a98a5c',
  trim: '#c0392b',
  sail: '#fbf7ec',
  sailShade: '#d2cab4',
  styleKey: 'era-armada',
};
