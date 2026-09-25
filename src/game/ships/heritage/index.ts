// Heritage collection: playable flagships from seventeen seafaring cultures.
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
import { MACEDON_SIXTEEN } from './macedon';
import { MAYA_TULUM } from './maya';
import { INCA_BALSA } from './inca';
import { LEPANTO_SULTANA } from './lepanto';
import { KOREA_TURTLE } from './korea';
import { BYZANTIUM_DROMON } from './byzantium';
import { EGYPT_GALLEY } from './egypt';
import { CHOLA_TIGER } from './chola';
import { VIETNAM_JUNK } from './vietnam';
import { AZTEC_CANOE } from './aztec';

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
  {
    id: 'macedon',
    culture: 'Macedonian',
    waters: 'Eastern Mediterranean',
    year: '306 BC',
    blurb: 'Successor Wars siege galley: the largest warship afloat.',
    def: MACEDON_SIXTEEN,
  },
  {
    id: 'maya',
    culture: 'Maya',
    waters: 'Bay of Honduras',
    year: '1517',
    blurb: 'First Contact war canoe of Tulum: drive the strangers off.',
    def: MAYA_TULUM,
  },
  {
    id: 'inca',
    culture: 'Inca',
    waters: 'Pacific Coast',
    year: '1465',
    blurb: 'Pacific war balsa: log raft of the Sapa Inca.',
    def: INCA_BALSA,
  },
  {
    id: 'lepanto',
    culture: 'Ottoman',
    waters: 'Gulf of Patras',
    year: '1571',
    blurb: 'Lepanto war galley: bow guns, oars, janissary boarders.',
    def: LEPANTO_SULTANA,
  },
  {
    id: 'korea',
    culture: 'Korean',
    waters: 'Myeongnyang Strait',
    year: '1597',
    blurb: 'Imjin War turtle ship: iron roof, cannon on every side.',
    def: KOREA_TURTLE,
  },
  {
    id: 'byzantium',
    culture: 'Byzantine',
    waters: 'Bosporus',
    year: '717',
    blurb: 'Greek-fire dromon: bronze siphons, burning seas.',
    def: BYZANTIUM_DROMON,
  },
  {
    id: 'egypt',
    culture: 'Egyptian',
    waters: 'Nile Delta',
    year: '1178 BC',
    blurb: 'New Kingdom war galley: the first naval battle in history.',
    def: EGYPT_GALLEY,
  },
  {
    id: 'chola',
    culture: 'Chola',
    waters: 'Bay of Bengal',
    year: '1025',
    blurb: 'Tiger-throne war ship: sewn planks, far horizons.',
    def: CHOLA_TIGER,
  },
  {
    id: 'vietnam',
    culture: 'Vietnamese',
    waters: 'Bach Dang River',
    year: '1288',
    blurb: 'War junk of Dai Viet: lure the Khan onto the stakes.',
    def: VIETNAM_JUNK,
  },
  {
    id: 'aztec',
    culture: 'Aztec',
    waters: 'Lake Texcoco',
    year: '1521',
    blurb: 'War canoe of the last tlatoani: defend the lake.',
    def: AZTEC_CANOE,
  },
];

export {
  ARAB_BOOM,
  AZTEC_CANOE,
  BYZANTIUM_DROMON,
  CHINESE_JUNK,
  CHOLA_TIGER,
  EGYPT_GALLEY,
  GREEK_TRIREME,
  HAWAII_WAA,
  INCA_BALSA,
  JAPANESE_ATAKEBUNE,
  KOREA_TURTLE,
  LEPANTO_SULTANA,
  MACEDON_SIXTEEN,
  MAYA_TULUM,
  MAORI_WAKA,
  ROMAN_QUINQUEREME,
  VIETNAM_JUNK,
};
