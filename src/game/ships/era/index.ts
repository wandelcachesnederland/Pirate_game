// Era flagships: the playable hero hulls, one module each.
//
// Every entry is a `kind: 'player'` ShipDef with a unique `styleKey`, so the
// sprite baker and the engine treat them as distinct hulls while the game logic
// still sees them as "the player". Pick one before you sail.

import type { EraId, ShipDef } from '../../types';
import { BLACK_GULL } from './blackGull';
import { HMS_VENGEANCE } from './hmsVengeance';
import { SANTA_BRISA } from './santaBrisa';
import { SEA_WOLF } from './seaWolf';
import { USS_REVENANT } from './ussRevenant';

export interface EraShip {
  id: EraId;
  /** Name of the period, shown on the hull picker. */
  era: string;
  year: string;
  /** One-line pitch for the picker. */
  blurb: string;
  def: ShipDef;
}

export const ERA_SHIPS: EraShip[] = [
  {
    id: 'golden',
    era: 'Golden Age of Piracy',
    year: '1710',
    blurb: 'Balanced sloop — the safe hand.',
    def: BLACK_GULL,
  },
  {
    id: 'exploration',
    era: 'Age of Exploration',
    year: '1500',
    blurb: 'Nimble caravel, light guns, quick helm.',
    def: SANTA_BRISA,
  },
  {
    id: 'napoleonic',
    era: 'Napoleonic Wars',
    year: '1805',
    blurb: 'Frigate: 4 guns a side, longest reach.',
    def: HMS_VENGEANCE,
  },
  {
    id: 'viking',
    era: 'Viking Age',
    year: '900',
    blurb: 'Longship: fastest hull, thinnest skin.',
    def: SEA_WOLF,
  },
  {
    id: 'ironclad',
    era: 'Ironclad Era',
    year: '1862',
    blurb: 'Steam casemate: armoured, brutal, no sails.',
    def: USS_REVENANT,
  },
];

export const ERA_FLAGSHIPS: Record<EraId, ShipDef> = {
  golden: BLACK_GULL,
  exploration: SANTA_BRISA,
  napoleonic: HMS_VENGEANCE,
  viking: SEA_WOLF,
  ironclad: USS_REVENANT,
};

export const DEFAULT_ERA: EraId = 'golden';

export function eraShip(id: EraId): EraShip {
  return ERA_SHIPS.find((e) => e.id === id) ?? ERA_SHIPS[0];
}

export { BLACK_GULL, HMS_VENGEANCE, SANTA_BRISA, SEA_WOLF, USS_REVENANT };
