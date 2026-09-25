// HERITAGE: ROME (c. 260 BC) — quinquereme.
//
// Playable heritage flagship — sails as the Roman era hero. Oar-driven war galley with a
// bronze ram and a blood-red sail bearing the golden eagle.

import type { ShipDef } from '../../types';

export const ROMAN_QUINQUEREME: ShipDef = {
  kind: 'player',
  name: 'Aquila Maris',
  faction: 'pirate',
  length: 72,
  width: 20,
  hp: 120,
  speed: 172,
  accel: 118,
  turn: 1.9,
  cannons: 2,
  reload: 2.2,
  damage: 10,
  range: 340,
  ballSpeed: 520,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#5a2e1c',
  deck: '#b08a52',
  trim: '#c9a227',
  sail: '#c9403b',
  sailShade: '#8a2a26',
  styleKey: 'heritage-roman',
  hullStyle: 'trireme',
  oared: true,
  crew: 90,
};
