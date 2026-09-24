// ERA: VIKING AGE (c. 900) — longship.
// Double-ended hull, dragon prow, shield rail, one wide striped sail.
// Fastest and most agile hull in the game; the thinnest skin.

import type { ShipDef } from '../../types';

export const SEA_WOLF: ShipDef = {
  kind: 'player',
  name: 'Sea-Wolf',
  faction: 'pirate',
  length: 60,
  width: 16,
  hp: 84,
  speed: 224,
  accel: 132,
  turn: 2.5,
  cannons: 2,
  reload: 1.15,
  damage: 9,
  range: 360,
  ballSpeed: 560,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#4a3116',
  deck: '#8a6534',
  trim: '#b3411f',
  sail: '#b5352c',
  sailShade: '#7d211a',
  styleKey: 'era-longship',
  hullStyle: 'longship',
};
