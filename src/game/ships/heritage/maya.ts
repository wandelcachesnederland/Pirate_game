// HERITAGE: MAYA (1517, First Contact) — great war canoe of Tulum.
//
// Playable heritage flagship — sails as the Maya era hero. A great war canoe
// of the walled port, crewed by warriors who have just watched strange
// white-winged canoes probe their shores — and mean to drive them off.

import type { ShipDef } from '../../types';

export const MAYA_TULUM: ShipDef = {
  kind: 'player',
  name: 'Tulum',
  faction: 'maya',
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
  trim: '#2e8a6a',
  sail: '#9a7a44',
  sailShade: '#6b5230',
  styleKey: 'heritage-maya',
  hullStyle: 'canoe',
  oared: true,
  crew: 55,
};
