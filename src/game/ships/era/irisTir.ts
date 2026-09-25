// ERA: THE TANKER WAR (1988) — Iranian Kaman-class fast attack craft.
// Combattante-II type, four Sea Killer anti-ship missiles and a 76 mm gun.
// The fastest hull in the game and the paperiest: she wins by firing first
// from over the horizon and running before the escorts answer. She burns
// diesel, so the wind means nothing.

import type { ShipDef } from '../../types';

export const IRIS_TIR: ShipDef = {
  kind: 'player',
  name: 'IRIS Tir',
  faction: 'iran',
  length: 58,
  width: 14,
  hp: 95,
  speed: 230,
  accel: 140,
  turn: 2.2,
  cannons: 2,
  reload: 2.2,
  damage: 26,
  range: 640,
  ballSpeed: 820,
  projectile: 'missile',
  masts: 0,
  crew: 32,
  value: 0,
  coins: 0,
  hull: '#545a5e',
  deck: '#6a7074',
  trim: '#239f6b',
  sail: '#545a5e',
  sailShade: '#313538',
  styleKey: 'era-missileboat',
  hullStyle: 'warship',
};
