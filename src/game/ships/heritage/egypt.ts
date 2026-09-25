// HERITAGE: EGYPT (c. 1178 BC, against the Sea Peoples) — New Kingdom war galley.
//
// Playable heritage flagship — sails as the Egyptian era hero. Ramesses III's
// own war galley, rowing out into the Delta to fight the first naval battle in
// recorded history against the Sherden raiders from the North.

import type { ShipDef } from '../../types';

export const EGYPT_GALLEY: ShipDef = {
  kind: 'player',
  name: 'Ramesses',
  faction: 'egypt',
  length: 70,
  width: 20,
  hp: 155,
  speed: 168,
  accel: 95,
  turn: 1.35,
  cannons: 3,
  reload: 1.8,
  damage: 8,
  range: 350,
  ballSpeed: 520,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#6b4a2b',
  deck: '#c09a62',
  trim: '#274a7a',
  sail: '#e8dcc0',
  sailShade: '#b8a880',
  styleKey: 'heritage-egypt',
  hullStyle: 'trireme',
  oared: true,
  crew: 65,
};
