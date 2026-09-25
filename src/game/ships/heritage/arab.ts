// HERITAGE: ARABIA (c. 1500) — ocean-going boom.
//
// Playable heritage flagship — sails as the Arab era hero. Sewn-plank dhow with a great
// lateen sail, built to run the monsoon routes of the Indian Ocean.

import type { ShipDef } from '../../types';

export const ARAB_BOOM: ShipDef = {
  kind: 'player',
  name: 'Al-Saqr',
  faction: 'pirate',
  length: 60,
  width: 20,
  hp: 80,
  speed: 202,
  accel: 112,
  turn: 2.1,
  cannons: 2,
  reload: 1.7,
  damage: 9,
  range: 370,
  ballSpeed: 540,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#6b4a2b',
  deck: '#c09a62',
  trim: '#2e8a8a',
  sail: '#f0e6d0',
  sailShade: '#c0b090',
  styleKey: 'heritage-arab',
  hullStyle: 'dhow',
  crew: 36,
};
