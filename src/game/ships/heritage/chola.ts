// HERITAGE: CHOLA (1025) — war ship of Rajendra's Srivijaya expedition.
//
// Playable heritage flagship — sails as the Chola era hero. A sewn-plank war
// ship of the Tiger throne, carrying Rajendra Chola's marines across the Bay
// of Bengal to humble the Maharaja of Srivijaya.

import type { ShipDef } from '../../types';

export const CHOLA_TIGER: ShipDef = {
  kind: 'player',
  name: 'Gangaikonda',
  faction: 'chola',
  length: 72,
  width: 26,
  hp: 155,
  speed: 158,
  accel: 75,
  turn: 1.25,
  cannons: 3,
  reload: 1.8,
  damage: 8,
  range: 360,
  ballSpeed: 520,
  masts: 2,
  value: 0,
  coins: 0,
  hull: '#5c3a20',
  deck: '#c39a62',
  trim: '#e8b830',
  sail: '#f0e6d0',
  sailShade: '#c0b090',
  styleKey: 'heritage-chola',
  hullStyle: 'dhow',
  crew: 60,
};
