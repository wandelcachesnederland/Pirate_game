// HERITAGE: KOREA (1597, Imjin War) — geobukseon turtle ship.
//
// Playable heritage flagship — sails as the Korean era hero. Admiral Yi's
// turtle ship: a spiked iron roof over cannon on every side, built to hold a
// strait against a samurai invasion fleet a dozen times her size.

import type { ShipDef } from '../../types';

export const KOREA_TURTLE: ShipDef = {
  kind: 'player',
  name: 'Geobukseon',
  faction: 'korea',
  length: 72,
  width: 28,
  hp: 165,
  speed: 130,
  accel: 65,
  turn: 1.25,
  cannons: 4,
  reload: 1.9,
  damage: 8,
  range: 350,
  ballSpeed: 520,
  masts: 2,
  value: 0,
  coins: 0,
  hull: '#3a3434',
  deck: '#8a7a5a',
  trim: '#2e5e8c',
  sail: '#e8e0cc',
  sailShade: '#b0a488',
  styleKey: 'heritage-korea',
  hullStyle: 'atakebune',
  oared: true,
  crew: 70,
};
