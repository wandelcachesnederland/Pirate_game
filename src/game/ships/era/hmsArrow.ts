// ERA: FALKLANDS (1982) — Type 21 frigate.

import type { ShipDef } from '../../types';

export const HMS_ARROW: ShipDef = {
  kind: 'player',
  name: 'HMS Arrow',
  faction: 'england',
  length: 72,
  width: 18,
  hp: 125,
  speed: 215,
  accel: 118,
  turn: 1.95,
  cannons: 3,
  reload: 1.15,
  damage: 14,
  range: 560,
  ballSpeed: 820,
  projectile: 'missile',
  masts: 0,
  crew: 170,
  value: 0,
  coins: 0,
  hull: '#4a5458',
  deck: '#626c70',
  trim: '#c0392b',
  sail: '#4a5458',
  sailShade: '#2a3234',
  styleKey: 'era-arrow',
  hullStyle: 'warship',
};
