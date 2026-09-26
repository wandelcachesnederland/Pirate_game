// ERA: SOMALI PIRACY (2009) — a hijacked trawler turned pirate mothership.
// The mothership let the skiffs work hundreds of miles out into the Somali
// Basin: fuel, water, khat and ladders aboard, RPG-7s and PKMs on deck. She
// burns diesel, so the wind means nothing — and she is no warship: thin steel,
// a small crew, and everything depends on getting alongside.

import type { ShipDef } from '../../types';

export const SAHAN_STAR: ShipDef = {
  kind: 'player',
  name: 'Mothership Sahan',
  faction: 'somalia',
  length: 56,
  width: 15,
  hp: 115,
  speed: 195,
  accel: 120,
  turn: 1.95,
  cannons: 3,
  reload: 1.55,
  damage: 13,
  range: 470,
  ballSpeed: 700,
  projectile: 'missile', // RPG-7 rockets
  masts: 0,
  crew: 45,
  value: 0,
  coins: 0,
  hull: '#3b6f8c',
  deck: '#8a7856',
  trim: '#c46a2e',
  sail: '#3b6f8c',
  sailShade: '#244456',
  styleKey: 'era-somali-mothership',
  hullStyle: 'freighter',
};
