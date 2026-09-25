// HERITAGE: CHINA (c. 1400) — war junk.
//
// Museum piece — not sailed in gameplay yet. Flat-bottomed, bulkheaded,
// with battened lug sails — a floating fortress of the treasure fleets.

import type { ShipDef } from '../../types';

export const CHINESE_JUNK: ShipDef = {
  kind: 'player',
  name: 'Hai Long',
  faction: 'pirate',
  length: 78,
  width: 30,
  hp: 140,
  speed: 152,
  accel: 80,
  turn: 1.5,
  cannons: 3,
  reload: 1.6,
  damage: 11,
  range: 400,
  ballSpeed: 540,
  masts: 3,
  value: 0,
  coins: 0,
  hull: '#4a2c1a',
  deck: '#9a7a4a',
  trim: '#c9403b',
  sail: '#b89a5e',
  sailShade: '#8a6f3f',
  styleKey: 'heritage-chinese',
  hullStyle: 'junk',
  crew: 70,
};
