// ERA: THE BARBARY WAR (1801–1805) — USS Enterprise, schooner.
// Twelve guns, a schooner rig and a reputation out of all proportion to her
// size: she took three corsairs in her first year on the Tripoli station.
// Swiftest American hull of the squadron — light-built, weatherly, thin-skinned.

import type { ShipDef } from '../../types';

export const USS_ENTERPRISE: ShipDef = {
  kind: 'player',
  name: 'USS Enterprise',
  faction: 'usa',
  length: 52,
  width: 15,
  hp: 92,
  speed: 225,
  accel: 125,
  turn: 2.3,
  cannons: 2,
  reload: 1.35,
  damage: 10,
  range: 430,
  ballSpeed: 620,
  masts: 2,
  crew: 70,
  value: 0,
  coins: 0,
  hull: '#33241a',
  deck: '#a0703f',
  trim: '#2a3a6b',
  sail: '#f7f2e4',
  sailShade: '#cfc6ab',
  styleKey: 'era-schooner',
  hullStyle: 'default',
};
