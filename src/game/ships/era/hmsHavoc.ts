// ERA: THE GREAT WAR AT SEA (c. 1916) — Royal Navy destroyer.
// Steam turbines, quick-firing 4-inch guns and a patch of empty grey water.
// The fastest fighting hull afloat in her day — and paper-thin, like every
// destroyer ever built. She burns coal, so the wind means nothing.

import type { ShipDef } from '../../types';

export const HMS_HAVOC: ShipDef = {
  kind: 'player',
  name: 'HMS Havoc',
  faction: 'england',
  length: 68,
  width: 18,
  hp: 120,
  speed: 215,
  accel: 108,
  turn: 1.85,
  cannons: 3,
  reload: 1.1,
  damage: 12,
  range: 520,
  ballSpeed: 760,
  masts: 0,
  crew: 80,
  value: 0,
  coins: 0,
  hull: '#4e545a',
  deck: '#666c71',
  trim: '#8a2a26',
  sail: '#4e545a',
  sailShade: '#2e3236',
  styleKey: 'era-destroyer',
  hullStyle: 'warship',
};
