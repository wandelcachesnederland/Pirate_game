// Era flagships: the playable hero hulls, one module each.
//
// Every entry is a `kind: 'player'` ShipDef with a unique `styleKey`, so the
// sprite baker and the engine treat them as distinct hulls while the game logic
// still sees them as "the player". Pick one before you sail.
//
// The roster sails in two squadrons: the Age of Sail (square-rigged gun ships)
// and the Heritage Seas (one heritage flagship per era — galleys, dhows,
// junks and gun-castles from before and beyond the Age of Sail).

import type { EraId, RegionId, ShipDef } from '../../types';
import { BLACK_GULL } from './blackGull';
import { HMS_VENGEANCE } from './hmsVengeance';
import { SANTA_BRISA } from './santaBrisa';
import { SEA_WOLF } from './seaWolf';
import { USS_REVENANT } from './ussRevenant';
import {
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
  MAORI_WAKA,
  MAYA_TULUM,
  ROMAN_QUINQUEREME,
  VIETNAM_JUNK,
} from '../heritage';

export interface EraShip {
  id: EraId;
  /** Name of the period, shown on the era picker. */
  era: string;
  year: string;
  /** One-line pitch for the picker. */
  blurb: string;
  def: ShipDef;
  /** Picker squadron — 'Age of Sail' or 'Heritage Seas'. */
  group: string;
  /**
   * The waters this era is fought in. Picking the era picks the chart too —
   * the pirates hunt the Caribbean, Salamis is fought in the Aegean, the
   * fall of Tenochtitlan happens on Lake Texcoco.
   */
  region: RegionId;
  /** Flavour line for the picker (e.g. 'the Bosporus'). */
  homeWaters?: string;
}

export const ERA_SHIPS: EraShip[] = [
  {
    id: 'golden',
    region: 'caribbean',
    era: 'Golden Age of Piracy',
    year: '1710',
    blurb: 'Balanced sloop — the safe hand.',
    def: BLACK_GULL,
    group: 'Age of Sail',
  },
  {
    id: 'exploration',
    region: 'caribbean',
    era: 'Age of Exploration',
    year: '1500',
    blurb: 'Nimble caravel, light guns, quick helm.',
    def: SANTA_BRISA,
    group: 'Age of Sail',
  },
  {
    id: 'napoleonic',
    region: 'biscay',
    era: 'Napoleonic Wars',
    year: '1805',
    blurb: 'Frigate: 4 guns a side, longest reach.',
    def: HMS_VENGEANCE,
    group: 'Age of Sail',
  },
  {
    id: 'viking',
    region: 'northSea',
    era: 'Viking Age',
    year: '900',
    blurb: 'Longship: fastest hull, thinnest skin.',
    def: SEA_WOLF,
    group: 'Age of Sail',
  },
  {
    id: 'ironclad',
    region: 'chesapeake',
    era: 'Ironclad Era',
    year: '1862',
    blurb: 'Steam casemate: armoured, brutal, no sails.',
    def: USS_REVENANT,
    group: 'Age of Sail',
  },
  {
    id: 'roman',
    region: 'mediterranean',
    era: 'First Punic War',
    year: '260 BC',
    blurb: 'Quinquereme: bronze ram, red sail, endless oars.',
    def: ROMAN_QUINQUEREME,
    group: 'Heritage Seas',
    homeWaters: 'the Mediterranean',
  },
  {
    id: 'greek',
    region: 'aegean',
    era: 'Persian Wars',
    year: '480 BC',
    blurb: 'Trireme: the fastest ram at Salamis — paper-thin skin.',
    def: GREEK_TRIREME,
    group: 'Heritage Seas',
    homeWaters: 'the Mediterranean',
  },
  {
    id: 'arab',
    region: 'arabian',
    era: 'Monsoon Seas',
    year: '1200',
    blurb: 'Ocean boom: lateen sail, swift monsoon runner.',
    def: ARAB_BOOM,
    group: 'Heritage Seas',
    homeWaters: 'the Arabian Coast',
  },
  {
    id: 'chinese',
    region: 'singapore',
    era: 'Ming Treasure Voyages',
    year: '1405',
    blurb: "War junk: Zheng He's floating fortress.",
    def: CHINESE_JUNK,
    group: 'Heritage Seas',
    homeWaters: 'the Straits of Singapore',
  },
  {
    id: 'japanese',
    region: 'inlandSea',
    era: 'Sengoku Period',
    year: '1575',
    blurb: 'Atakebune: black-lacquered gun castle. Slow, brutal.',
    def: JAPANESE_ATAKEBUNE,
    group: 'Heritage Seas',
    homeWaters: 'the Straits of Singapore',
  },
  {
    id: 'maori',
    region: 'bayOfIslands',
    era: 'Māori Musket Wars',
    year: '1820',
    blurb: 'Waka taua: great war canoe — swift paddles, captured guns.',
    def: MAORI_WAKA,
    group: 'Heritage Seas',
    homeWaters: 'the Bay of Islands',
  },
  {
    id: 'hawaii',
    region: 'konaCoast',
    era: 'Hawaiian Unification',
    year: '1795',
    blurb: "Peleleu wa'a: swift war canoe of Kamehameha's fleet.",
    def: HAWAII_WAA,
    group: 'Heritage Seas',
    homeWaters: 'the Kona Coast',
  },
  {
    id: 'macedon',
    region: 'mediterranean',
    era: 'Macedon at Sea',
    year: '306 BC',
    blurb: "Demetrius's siege galley: the largest warship afloat. Slow, unstoppable.",
    def: MACEDON_SIXTEEN,
    group: 'Heritage Seas',
    homeWaters: 'off Salamis, Cyprus',
  },
  {
    id: 'maya',
    region: 'caribbean',
    era: 'Maya First Contact',
    year: '1517',
    blurb: 'Great war canoe of Tulum — drive the strangers from your shores.',
    def: MAYA_TULUM,
    group: 'Heritage Seas',
    homeWaters: 'the Bay of Honduras',
  },
  {
    id: 'inca',
    region: 'peruvianCoast',
    era: 'Inca Pacific Voyages',
    year: '1465',
    blurb: "Tupac's great balsa — the Sapa Inca's reach on the western sea.",
    def: INCA_BALSA,
    group: 'Heritage Seas',
    homeWaters: 'the Gulf of Guayaquil',
  },
  {
    id: 'lepanto',
    region: 'ionian',
    era: 'Lepanto',
    year: '1571',
    blurb: 'Ottoman war galley: bow guns, oars, boarders. The League awaits.',
    def: LEPANTO_SULTANA,
    group: 'Heritage Seas',
    homeWaters: 'the Gulf of Patras',
  },
  {
    id: 'korea',
    region: 'koreaStrait',
    era: 'Imjin War',
    year: '1597',
    blurb: 'Turtle ship: iron roof, cannon on every side. Hold the strait.',
    def: KOREA_TURTLE,
    group: 'Heritage Seas',
    homeWaters: 'the Myeongnyang Strait',
  },
  {
    id: 'byzantium',
    region: 'bosporus',
    era: 'Siege of Constantinople',
    year: '717',
    blurb: "Dromon with Greek fire: burn the Caliph's fleet off the strait.",
    def: BYZANTIUM_DROMON,
    group: 'Heritage Seas',
    homeWaters: 'the Bosporus',
  },
  {
    id: 'egypt',
    region: 'nileDelta',
    era: 'Against the Sea Peoples',
    year: '1178 BC',
    blurb: "Ramesses III's war galley: the first naval battle in history.",
    def: EGYPT_GALLEY,
    group: 'Heritage Seas',
    homeWaters: 'the Nile Delta',
  },
  {
    id: 'chola',
    region: 'bengal',
    era: 'Chola Across the Bay',
    year: '1025',
    blurb: 'Chola war ship: carry the Tiger across the Bay of Bengal.',
    def: CHOLA_TIGER,
    group: 'Heritage Seas',
    homeWaters: 'the Bay of Bengal',
  },
  {
    id: 'vietnam',
    region: 'tonkin',
    era: 'Bạch Đằng River',
    year: '1288',
    blurb: "Vietnamese war junk: lure the Khan's fleet onto the stakes.",
    def: VIETNAM_JUNK,
    group: 'Heritage Seas',
    homeWaters: 'the Bạch Đằng River',
  },
  {
    id: 'aztec',
    region: 'texcoco',
    era: 'Fall of Tenochtitlan',
    year: '1521',
    blurb: 'War canoe of Cuauhtémoc: defend the lake to the last.',
    def: AZTEC_CANOE,
    group: 'Heritage Seas',
    homeWaters: 'Lake Texcoco',
  },
];

export const ERA_FLAGSHIPS: Record<EraId, ShipDef> = {
  golden: BLACK_GULL,
  exploration: SANTA_BRISA,
  napoleonic: HMS_VENGEANCE,
  viking: SEA_WOLF,
  ironclad: USS_REVENANT,
  roman: ROMAN_QUINQUEREME,
  greek: GREEK_TRIREME,
  arab: ARAB_BOOM,
  chinese: CHINESE_JUNK,
  japanese: JAPANESE_ATAKEBUNE,
  maori: MAORI_WAKA,
  hawaii: HAWAII_WAA,
  macedon: MACEDON_SIXTEEN,
  maya: MAYA_TULUM,
  inca: INCA_BALSA,
  lepanto: LEPANTO_SULTANA,
  korea: KOREA_TURTLE,
  byzantium: BYZANTIUM_DROMON,
  egypt: EGYPT_GALLEY,
  chola: CHOLA_TIGER,
  vietnam: VIETNAM_JUNK,
  aztec: AZTEC_CANOE,
};

/** The waters locked in with each era — derived from the squadron above. */
export const ERA_REGION: Record<EraId, RegionId> = ERA_SHIPS.reduce(
  (acc, e) => {
    acc[e.id] = e.region;
    return acc;
  },
  {} as Record<EraId, RegionId>,
);

export const DEFAULT_ERA: EraId = 'golden';

export function eraShip(id: EraId): EraShip {
  return ERA_SHIPS.find((e) => e.id === id) ?? ERA_SHIPS[0];
}

/** Which sea a given era is fought in. */
export function eraRegion(id: EraId): RegionId {
  return ERA_REGION[id] ?? ERA_REGION[DEFAULT_ERA];
}

export { BLACK_GULL, HMS_VENGEANCE, SANTA_BRISA, SEA_WOLF, USS_REVENANT };
export { ARAB_BOOM, CHINESE_JUNK, GREEK_TRIREME, HAWAII_WAA, INCA_BALSA, JAPANESE_ATAKEBUNE, MACEDON_SIXTEEN, MAORI_WAKA, MAYA_TULUM, ROMAN_QUINQUEREME, AZTEC_CANOE, BYZANTIUM_DROMON, CHOLA_TIGER, EGYPT_GALLEY, KOREA_TURTLE, LEPANTO_SULTANA, VIETNAM_JUNK };
