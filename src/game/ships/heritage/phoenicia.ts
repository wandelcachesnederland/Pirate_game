// HERITAGE: PHOENICIA (c. 800 BC) — Tyrian bireme.

import type { ShipDef } from '../../types';

export const PHOENICIA_BIREME: ShipDef = {
  kind: 'player',
  name: 'Melqart’s Wing',
  faction: 'pirate',
  length: 62,
  width: 16,
  hp: 105,
  speed: 188,
  accel: 125,
  turn: 2.0,
  cannons: 2,
  reload: 2.0,
  damage: 9,
  range: 330,
  ballSpeed: 510,
  masts: 1,
  crew: 70,
  value: 0,
  coins: 0,
  hull: '#5a2e1c',
  deck: '#b08a52',
  trim: '#c9a227',
  sail: '#c9403b',
  sailShade: '#8a2a26',
  styleKey: 'heritage-phoenicia',
  hullStyle: 'trireme',
  oared: true,
};
