// ERA: THE SECOND WORLD WAR AT SEA (c. 1943) — Fletcher-class destroyer.
// Five 5-inch mounts, radar, depth charges and a thousand tons of American
// steel. Quick-firing dual-purpose guns: she throws more shot per minute than
// anything else in the fleet, and burns oil, so the wind means nothing.

import type { ShipDef } from '../../types';

export const USS_KESTREL: ShipDef = {
  kind: 'player',
  name: 'USS Kestrel',
  faction: 'usa',
  length: 74,
  width: 20,
  hp: 135,
  speed: 220,
  accel: 112,
  turn: 1.9,
  cannons: 4,
  reload: 1.05,
  damage: 12,
  range: 540,
  ballSpeed: 800,
  masts: 0,
  crew: 140,
  value: 0,
  coins: 0,
  hull: '#565c60',
  deck: '#6c7276',
  trim: '#8a2a26',
  sail: '#565c60',
  sailShade: '#333739',
  styleKey: 'era-uss-destroyer',
  hullStyle: 'warship',
};
