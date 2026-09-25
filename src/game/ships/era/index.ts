// Era flagships: the playable hero hulls, one module each.
//
// Every entry is a `kind: 'player'` ShipDef with a unique `styleKey`, so the
// sprite baker and the engine treat them as distinct hulls while the game logic
// still sees them as "the player". Pick one before you sail.
//
// The roster sails in two squadrons: the Age of Sail (square-rigged gun ships)
// and the Heritage Seas (one heritage flagship per era — galleys, dhows,
// junks and gun-castles from before and beyond the Age of Sail).

import type { EraId, ShipDef } from '../../types';
import { BLACK_GULL } from './blackGull';
import { HMS_VENGEANCE } from './hmsVengeance';
import { SANTA_BRISA } from './santaBrisa';
import { SEA_WOLF } from './seaWolf';
import { USS_REVENANT } from './ussRevenant';
import {
  ARAB_BOOM,
  CHINESE_JUNK,
  GREEK_TRIREME,
  JAPANESE_ATAKEBUNE,
  ROMAN_QUINQUEREME,
} from '../heritage';

export interface EraShip {
  id: EraId;
  /** Name of the period, shown on the hull picker. */
  era: string;
  year: string;
  /** One-line pitch for the picker. */
  blurb: string;
  def: ShipDef;
  /** Picker squadron — 'Age of Sail' or 'Heritage Seas'. */
  group: string;
  /** Suggested sailing region, flavour only (e.g. 'the Mediterranean'). */
  homeWaters?: string;
}

export const ERA_SHIPS: EraShip[] = [
  {
    id: 'golden',
    era: 'Golden Age of Piracy',
    year: '1710',
    blurb: 'Balanced sloop — the safe hand.',
    def: BLACK_GULL,
    group: 'Age of Sail',
  },
  {
    id: 'exploration',
    era: 'Age of Exploration',
    year: '1500',
    blurb: 'Nimble caravel, light guns, quick helm.',
    def: SANTA_BRISA,
    group: 'Age of Sail',
  },
  {
    id: 'napoleonic',
    era: 'Napoleonic Wars',
    year: '1805',
    blurb: 'Frigate: 4 guns a side, longest reach.',
    def: HMS_VENGEANCE,
    group: 'Age of Sail',
  },
  {
    id: 'viking',
    era: 'Viking Age',
    year: '900',
    blurb: 'Longship: fastest hull, thinnest skin.',
    def: SEA_WOLF,
    group: 'Age of Sail',
  },
  {
    id: 'ironclad',
    era: 'Ironclad Era',
    year: '1862',
    blurb: 'Steam casemate: armoured, brutal, no sails.',
    def: USS_REVENANT,
    group: 'Age of Sail',
  },
  {
    id: 'roman',
    era: 'First Punic War',
    year: '260 BC',
    blurb: 'Quinquereme: bronze ram, red sail, endless oars.',
    def: ROMAN_QUINQUEREME,
    group: 'Heritage Seas',
    homeWaters: 'the Mediterranean',
  },
  {
    id: 'greek',
    era: 'Persian Wars',
    year: '480 BC',
    blurb: 'Trireme: the fastest ram at Salamis — paper-thin skin.',
    def: GREEK_TRIREME,
    group: 'Heritage Seas',
    homeWaters: 'the Mediterranean',
  },
  {
    id: 'arab',
    era: 'Monsoon Seas',
    year: '1200',
    blurb: 'Ocean boom: lateen sail, swift monsoon runner.',
    def: ARAB_BOOM,
    group: 'Heritage Seas',
    homeWaters: 'the Arabian Coast',
  },
  {
    id: 'chinese',
    era: 'Ming Treasure Voyages',
    year: '1405',
    blurb: "War junk: Zheng He's floating fortress.",
    def: CHINESE_JUNK,
    group: 'Heritage Seas',
    homeWaters: 'the Straits of Singapore',
  },
  {
    id: 'japanese',
    era: 'Sengoku Period',
    year: '1575',
    blurb: 'Atakebune: black-lacquered gun castle. Slow, brutal.',
    def: JAPANESE_ATAKEBUNE,
    group: 'Heritage Seas',
    homeWaters: 'the Straits of Singapore',
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
};

export const DEFAULT_ERA: EraId = 'golden';

export function eraShip(id: EraId): EraShip {
  return ERA_SHIPS.find((e) => e.id === id) ?? ERA_SHIPS[0];
}

export { BLACK_GULL, HMS_VENGEANCE, SANTA_BRISA, SEA_WOLF, USS_REVENANT };
export { ARAB_BOOM, CHINESE_JUNK, GREEK_TRIREME, JAPANESE_ATAKEBUNE, ROMAN_QUINQUEREME };
