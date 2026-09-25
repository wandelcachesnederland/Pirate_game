// HERITAGE: GREECE (c. 480 BC) — trireme.
//
// Museum piece — not sailed in gameplay yet. The Athenian greyhound: three
// banks of oars, an all-seeing eye on the bow, built to ram at Salamis.

import type { ShipDef } from '../../types';

export const GREEK_TRIREME: ShipDef = {
  kind: 'player',
  name: 'Triton',
  faction: 'pirate',
  length: 66,
  width: 17,
  hp: 70,
  speed: 212,
  accel: 140,
  turn: 2.4,
  cannons: 2,
  reload: 1.6,
  damage: 8,
  range: 330,
  ballSpeed: 540,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#3a4a6b',
  deck: '#a88a5a',
  trim: '#d9d2c0',
  sail: '#e8e0cc',
  sailShade: '#b8ac88',
  styleKey: 'heritage-greek',
  hullStyle: 'trireme',
  oared: true,
  crew: 60,
};
