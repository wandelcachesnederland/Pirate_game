// HERITAGE: BYZANTIUM (717, Siege of Constantinople) — Greek-fire dromon.
//
// Playable heritage flagship — sails as the Byzantine era hero. A chelandion
// fitted with bronze siphons spraying Greek fire: the secret weapon that is
// about to burn the Caliph's fleet off the Bosporus.

import type { ShipDef } from '../../types';

export const BYZANTIUM_DROMON: ShipDef = {
  kind: 'player',
  name: 'Chelandion',
  faction: 'byzantium',
  length: 70,
  width: 20,
  hp: 150,
  speed: 172,
  accel: 100,
  turn: 1.4,
  cannons: 3,
  reload: 1.8,
  damage: 9,
  range: 340,
  ballSpeed: 520,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#4a1a2a',
  deck: '#a5773f',
  trim: '#e8b830',
  sail: '#7a2d5a',
  sailShade: '#4a1a36',
  styleKey: 'heritage-byzantium',
  hullStyle: 'trireme',
  oared: true,
  crew: 60,
};
