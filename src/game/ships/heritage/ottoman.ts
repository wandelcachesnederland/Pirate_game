// HERITAGE: OTTOMAN NAVY (c. 1538, Preveza) — imperial kadirga.

import type { ShipDef } from '../../types';

export const OTTOMAN_KADIRGA: ShipDef = {
  kind: 'player',
  name: 'Barbarossa’s Kadirga',
  faction: 'ottoman',
  length: 74,
  width: 20,
  hp: 150,
  speed: 172,
  accel: 95,
  turn: 1.45,
  cannons: 3,
  reload: 1.85,
  damage: 9,
  range: 370,
  ballSpeed: 530,
  masts: 1,
  crew: 80,
  value: 0,
  coins: 0,
  hull: '#3a1a1a',
  deck: '#a5773f',
  trim: '#e8b830',
  sail: '#efe3c4',
  sailShade: '#c3b48c',
  styleKey: 'heritage-ottoman',
  hullStyle: 'trireme',
  oared: true,
};
