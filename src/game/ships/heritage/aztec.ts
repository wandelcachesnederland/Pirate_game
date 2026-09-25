// HERITAGE: AZTEC (1521, Fall of Tenochtitlan) — war canoe of Cuauhtémoc.
//
// Playable heritage flagship — sails as the Aztec era hero. The last
// tlatoani's own war canoe, leading a thousand canoes across Lake Texcoco
// against Cortés's brigantines in the city's final hour.

import type { ShipDef } from '../../types';

export const AZTEC_CANOE: ShipDef = {
  kind: 'player',
  name: 'Cuauhtémoc',
  faction: 'aztec',
  length: 60,
  width: 14,
  hp: 150,
  speed: 178,
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
  hull: '#4a3a20',
  deck: '#7a5a34',
  trim: '#1f8a8a',
  sail: '#9a7a44',
  sailShade: '#6b5230',
  styleKey: 'heritage-aztec',
  hullStyle: 'canoe',
  oared: true,
  crew: 55,
};
