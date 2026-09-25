// HERITAGE: INCA (c. 1465, Pacific voyages) — great Chincha war balsa.
//
// Playable heritage flagship — sails as the Inca era hero. A great ocean-going
// balsa of logs and guara boards, sailing for the Sapa Inca against the Puná
// islanders and rival traders of the western sea.

import type { ShipDef } from '../../types';

export const INCA_BALSA: ShipDef = {
  kind: 'player',
  name: "Tupac's Balsa",
  faction: 'inca',
  length: 62,
  width: 22,
  hp: 155,
  speed: 170,
  accel: 145,
  turn: 2.2,
  cannons: 3,
  reload: 1.7,
  damage: 8,
  range: 340,
  ballSpeed: 500,
  masts: 0,
  value: 0,
  coins: 0,
  hull: '#6b5230',
  deck: '#8a6a40',
  trim: '#b5352c',
  sail: '#c0a062',
  sailShade: '#907848',
  styleKey: 'heritage-inca',
  hullStyle: 'canoe',
  oared: true,
  crew: 50,
};
