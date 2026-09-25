// HERITAGE: HAWAIʻI (c. 1795, Unification Wars) — waʻa (peleleu war canoe).
//
// Playable heritage flagship — sails as the Hawaiʻi era hero. Kamehameha's
// peleleu fleet in miniature: a swift double-hulled war canoe carrying the
// unification of the islands on her decks.

import type { ShipDef } from '../../types';

export const HAWAII_WAA: ShipDef = {
  kind: 'player',
  name: 'Peleleu',
  faction: 'hawaii',
  length: 60,
  width: 14,
  hp: 150,
  speed: 180,
  accel: 155,
  turn: 2.4,
  cannons: 3,
  reload: 1.7,
  damage: 8,
  range: 340,
  ballSpeed: 500,
  masts: 0,
  value: 0,
  coins: 0,
  hull: '#4a2e16',
  deck: '#7a5a34',
  trim: '#c9a227',
  sail: '#a08050',
  sailShade: '#6f5836',
  styleKey: 'heritage-hawaii',
  hullStyle: 'canoe',
  oared: true,
  crew: 58,
};
