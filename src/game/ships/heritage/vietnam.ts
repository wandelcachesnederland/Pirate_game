// HERITAGE: VIETNAM (1288, Bạch Đằng River) — war junk of Trần Hưng Đạo.
//
// Playable heritage flagship — sails as the Vietnamese era hero. A war junk of
// Đại Việt, luring Kublai Khan's invasion fleet upriver onto the hidden
// iron-tipped stakes waiting at low tide.

import type { ShipDef } from '../../types';

export const VIETNAM_JUNK: ShipDef = {
  kind: 'player',
  name: 'Bạch Đằng',
  faction: 'daiviet',
  length: 70,
  width: 26,
  hp: 150,
  speed: 160,
  accel: 75,
  turn: 1.3,
  cannons: 3,
  reload: 1.8,
  damage: 8,
  range: 350,
  ballSpeed: 520,
  masts: 2,
  value: 0,
  coins: 0,
  hull: '#4a2c1a',
  deck: '#9a7a4a',
  trim: '#b3261e',
  sail: '#c9a86a',
  sailShade: '#9a7c4c',
  styleKey: 'heritage-vietnam',
  hullStyle: 'junk',
  crew: 55,
};
