// ERA: IRONCLAD ERA (c. 1862) — steam casemate.
// Slab-sided armour, rivets, a gun turret and a smokestack. No canvas at all:
// she burns coal, so the wind neither helps nor hinders her.

import type { ShipDef } from '../../types';

export const USS_REVENANT: ShipDef = {
  kind: 'player',
  name: 'USS Revenant',
  faction: 'pirate',
  length: 80,
  width: 30,
  hp: 190,
  speed: 150,
  accel: 78,
  turn: 1.3,
  cannons: 3,
  reload: 1.5,
  damage: 18,
  range: 500,
  ballSpeed: 700,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#3a3f44',
  deck: '#55575a',
  trim: '#8a6a28',
  sail: '#6a6d70',
  sailShade: '#3c3e41',
  styleKey: 'era-ironclad',
  hullStyle: 'ironclad',
};
