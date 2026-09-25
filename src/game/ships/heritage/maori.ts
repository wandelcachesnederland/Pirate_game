// HERITAGE: MĀORI (c. 1820, Musket Wars) — waka taua.
//
// Playable heritage flagship — sails as the Māori era hero. A great carved war
// canoe swift under paddles, now answering muskets with captured guns.

import type { ShipDef } from '../../types';

export const MAORI_WAKA: ShipDef = {
  kind: 'player',
  name: 'Te Taua',
  faction: 'maori',
  length: 62,
  width: 14,
  hp: 150,
  speed: 175,
  accel: 150,
  turn: 2.3,
  cannons: 3,
  reload: 1.7,
  damage: 8,
  range: 340,
  ballSpeed: 500,
  masts: 0,
  value: 0,
  coins: 0,
  hull: '#3a2412',
  deck: '#7a5a34',
  trim: '#b5352c',
  sail: '#9a7a44',
  sailShade: '#6b5230',
  styleKey: 'heritage-maori',
  hullStyle: 'canoe',
  oared: true,
  crew: 60,
};
