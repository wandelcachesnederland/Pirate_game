// HERITAGE: LEPANTO (1571) — Ottoman war galley.
//
// Playable heritage flagship — sails as the Lepanto era hero. Ali Pasha's
// Sultana: bow guns, endless oars and janissary boarders, rowing out to meet
// the galleys of the Holy League in the biggest oar-powered battle ever.

import type { ShipDef } from '../../types';

export const LEPANTO_SULTANA: ShipDef = {
  kind: 'player',
  name: 'Sultana',
  faction: 'ottoman',
  length: 76,
  width: 22,
  hp: 160,
  speed: 165,
  accel: 90,
  turn: 1.3,
  cannons: 4,
  reload: 1.9,
  damage: 8,
  range: 360,
  ballSpeed: 520,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#4a1a1a',
  deck: '#a5773f',
  trim: '#e8b830',
  sail: '#efe3c4',
  sailShade: '#c3b48c',
  styleKey: 'heritage-lepanto',
  hullStyle: 'trireme',
  oared: true,
  crew: 85,
};
