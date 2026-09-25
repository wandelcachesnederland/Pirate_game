// ERA: GOLDEN AGE OF PIRACY (c. 1710) — the default hero hull.
// Fast, well-armed sloop. The baseline every other hull is measured against.

import type { ShipDef } from '../../types';

export const BLACK_GULL: ShipDef = {
  kind: 'player',
  name: 'The Black Gull',
  faction: 'pirate',
  length: 62,
  width: 22,
  hp: 100,
  speed: 195,
  accel: 105,
  turn: 2.05,
  cannons: 3,
  reload: 1.4,
  damage: 12,
  range: 430,
  ballSpeed: 580,
  masts: 2,
  crew: 45,
  value: 0,
  coins: 0,
  hull: '#3b2314',
  deck: '#a0703f',
  trim: '#9e1f1f',
  sail: '#2b2623',
  sailShade: '#120f0d',
  styleKey: 'era-golden',
  hullStyle: 'default',
};
