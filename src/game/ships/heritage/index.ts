// Heritage collection: museum pieces from five seafaring cultures.
//
// These hulls live in the shipwright's collection on the start screen but are
// NOT used in gameplay yet — no spawns, no picker selection. Each is a
// `kind: 'player'` ShipDef with a unique `styleKey`, so when a culture's seas
// open up they can sail as heroes without touching the enemy roster.

import type { ShipDef } from '../../types';
import { ROMAN_QUINQUEREME } from './roman';
import { GREEK_TRIREME } from './greek';
import { ARAB_BOOM } from './arab';
import { CHINESE_JUNK } from './chinese';
import { JAPANESE_ATAKEBUNE } from './japanese';

export interface HeritageShip {
  id: string;
  culture: string;
  waters: string;
  year: string;
  /** One-line pitch for the collection. */
  blurb: string;
  def: ShipDef;
}

export const HERITAGE_SHIPS: HeritageShip[] = [
  {
    id: 'roman',
    culture: 'Roman',
    waters: 'Mare Nostrum',
    year: '260 BC',
    blurb: 'Quinquereme: bronze ram, red sail, endless oars.',
    def: ROMAN_QUINQUEREME,
  },
  {
    id: 'greek',
    culture: 'Greek',
    waters: 'Aegean Sea',
    year: '480 BC',
    blurb: 'Trireme: the fastest ram at Salamis.',
    def: GREEK_TRIREME,
  },
  {
    id: 'arab',
    culture: 'Arab',
    waters: 'Indian Ocean',
    year: '1500',
    blurb: 'Boom: lateen sail, monsoon runner.',
    def: ARAB_BOOM,
  },
  {
    id: 'chinese',
    culture: 'Chinese',
    waters: 'South China Sea',
    year: '1400',
    blurb: 'War junk: battened sails, floating fortress.',
    def: CHINESE_JUNK,
  },
  {
    id: 'japanese',
    culture: 'Japanese',
    waters: 'Seto Inland Sea',
    year: '1600',
    blurb: 'Atakebune: black lacquer, iron castle.',
    def: JAPANESE_ATAKEBUNE,
  },
];

export { ARAB_BOOM, CHINESE_JUNK, GREEK_TRIREME, JAPANESE_ATAKEBUNE, ROMAN_QUINQUEREME };
