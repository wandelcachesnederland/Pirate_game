// Heritage collection: playable flagships from seven seafaring cultures.
//
// Each hull sails as the hero of its own era (see `era/index.ts`) — one
// heritage ship per era. Every entry is a `kind: 'player'` ShipDef with a
// unique `styleKey`, so they sail as heroes without touching the enemy roster.

import type { ShipDef } from '../../types';
import { ROMAN_QUINQUEREME } from './roman';
import { GREEK_TRIREME } from './greek';
import { ARAB_BOOM } from './arab';
import { CHINESE_JUNK } from './chinese';
import { JAPANESE_ATAKEBUNE } from './japanese';
import { MAORI_WAKA } from './maori';
import { HAWAII_WAA } from './hawaii';

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
    blurb: 'First Punic War quinquereme: bronze ram, red sail, endless oars.',
    def: ROMAN_QUINQUEREME,
  },
  {
    id: 'greek',
    culture: 'Greek',
    waters: 'Aegean Sea',
    year: '480 BC',
    blurb: 'Persian Wars trireme: the fastest ram at Salamis.',
    def: GREEK_TRIREME,
  },
  {
    id: 'arab',
    culture: 'Arab',
    waters: 'Western Indian Ocean',
    year: '1200',
    blurb: 'Monsoon Seas boom: lateen sail, swift monsoon runner.',
    def: ARAB_BOOM,
  },
  {
    id: 'chinese',
    culture: 'Chinese',
    waters: 'South China Sea',
    year: '1405',
    blurb: 'Ming treasure fleet war junk: battened sails, floating fortress.',
    def: CHINESE_JUNK,
  },
  {
    id: 'japanese',
    culture: 'Japanese',
    waters: 'Seto Inland Sea',
    year: '1575',
    blurb: 'Sengoku atakebune: black lacquer, iron gun castle.',
    def: JAPANESE_ATAKEBUNE,
  },
  {
    id: 'maori',
    culture: 'Māori',
    waters: 'Bay of Islands',
    year: '1820',
    blurb: 'Musket Wars waka taua: great carved war canoe, swift paddles.',
    def: MAORI_WAKA,
  },
  {
    id: 'hawaii',
    culture: 'Hawaiian',
    waters: 'Kona Coast',
    year: '1795',
    blurb: 'Unification Wars peleleu: swift double-hulled war canoe.',
    def: HAWAII_WAA,
  },
];

export {
  ARAB_BOOM,
  CHINESE_JUNK,
  GREEK_TRIREME,
  HAWAII_WAA,
  JAPANESE_ATAKEBUNE,
  MAORI_WAKA,
  ROMAN_QUINQUEREME,
};
