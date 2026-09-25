// HERITAGE: MACEDON (306 BC, Wars of the Successors) — Antigonid siege galley.
//
// Playable heritage flagship — sails as the Macedonian era hero. Demetrius the
// Besieger's giant polyreme: the largest warship afloat, slow and unstoppable,
// fresh from smashing Ptolemy's fleet off Salamis-in-Cyprus.

import type { ShipDef } from '../../types';

export const MACEDON_SIXTEEN: ShipDef = {
  kind: 'player',
  name: 'Poliorcetes',
  faction: 'macedon',
  length: 80,
  width: 26,
  hp: 170,
  speed: 115,
  accel: 55,
  turn: 1.1,
  cannons: 4,
  reload: 1.9,
  damage: 9,
  range: 370,
  ballSpeed: 520,
  masts: 1,
  value: 0,
  coins: 0,
  hull: '#3a2a4a',
  deck: '#8f7048',
  trim: '#e8b830',
  sail: '#efe3c4',
  sailShade: '#c3b48c',
  styleKey: 'heritage-macedon',
  hullStyle: 'trireme',
  oared: true,
  crew: 90,
};
