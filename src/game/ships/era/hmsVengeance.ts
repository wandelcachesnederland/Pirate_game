// ERA: NAPOLEONIC WARS (c. 1805) — frigate.
// Four guns a side, long range, fast for her size. The duellist's flagship.

import type { ShipDef } from '../../types';

export const HMS_VENGEANCE: ShipDef = {
  kind: 'player',
  name: 'HMS Vengeance',
  faction: 'pirate',
  length: 76,
  width: 25,
  hp: 130,
  speed: 200,
  accel: 100,
  turn: 1.75,
  cannons: 4,
  reload: 1.25,
  damage: 12,
  range: 470,
  ballSpeed: 620,
  masts: 3,
  crew: 60,
  value: 0,
  coins: 0,
  hull: '#2a2b38',
  deck: '#9d7d52',
  trim: '#c9a227',
  sail: '#f4efe0',
  sailShade: '#cbc3aa',
  styleKey: 'era-frigate',
  hullStyle: 'default',
};
