// Surrender & boarding rules (pure tables — the engine orchestrates).
//
// A mauled enemy may strike her colours instead of fighting to the death.
// Boarding a prize pays her FULL cargo manifest, while a sinking only washes
// up singed scraps — but prize crews don't always come home smiling.

import type { ShipKind } from './types';

/** First surrender roll once the hull drops below this fraction. */
export const SURRENDER_HP = 0.3;
/** One last desperate roll below this fraction, for ships that refused. */
export const SURRENDER_HP_DESPERATE = 0.15;
/** Extra reach (beyond the hulls touching) to lay a ship aboard. */
export const BOARD_RANGE = 120;
/** Hands needed to spare a prize crew. */
export const BOARD_MIN_CREW = 4;

/**
 * Chance (0..1) a hull strikes her colours when badly mauled.
 * Fire ships are floating bombs and war canoes fight to the last man —
 * neither ever surrenders. Merchants value their skins; men-o'-war don't.
 */
export function surrenderChance(kind: ShipKind): number {
  switch (kind) {
    case 'fishingCanoe':
      return 0.85;
    case 'rowboat':
      return 0.8;
    case 'merchant':
      return 0.75;
    case 'schooner':
      return 0.55;
    case 'sloop':
      return 0.45;
    case 'galleon':
      return 0.4;
    case 'cutter':
      return 0.4;
    case 'brig':
      return 0.35;
    case 'corvette':
      return 0.3;
    case 'bombketch':
      return 0.3;
    case 'frigate':
      return 0.28;
    case 'privateer':
      return 0.2;
    case 'manowar':
      return 0.15;
    case 'xebec':
      return 0.35;
    case 'lugger':
      return 0.5;
    case 'gunboat':
      return 0.45;
    case 'carthGalley':
      return 0.35;
    case 'carthTrader':
      return 0.75;
    case 'carthSeven':
      return 0.15;
    case 'cilician':
      return 0.4;
    case 'phoenTrireme':
      return 0.35;
    case 'persTransport':
      return 0.75;
    case 'ionianGalley':
      return 0.45;
    case 'sidonianRoyal':
      return 0.15;
    case 'warDhow':
      return 0.35;
    case 'ghurab':
      return 0.4;
    case 'baghlah':
      return 0.7;
    case 'sultanFlagship':
      return 0.15;
    case 'warlordJunk':
      return 0.3;
    case 'wokouJunk':
      return 0.35;
    case 'grainJunk':
      return 0.75;
    case 'pirateKing':
      return 0.15;
    case 'sekiBune':
      return 0.3;
    case 'kobaya':
      return 0.45;
    case 'riceBune':
      return 0.75;
    case 'moriFlagship':
      return 0.15;
    case 'rivalWaka':
      return 0.35;
    case 'arikiWaka':
      return 0.15;
    case 'flaxTrader':
      return 0.75;
    case 'rivalWaa':
      return 0.35;
    case 'kauaiFlagship':
      return 0.15;
    case 'sandTrader':
      return 0.75;
    case 'rhodesTrieres':
      return 0.35;
    case 'ptolemGalley':
      return 0.3;
    case 'alexGrain':
      return 0.75;
    case 'ptolemFlagship':
      return 0.15;
    case 'mayaRival':
      return 0.35;
    case 'cacaoTrader':
      return 0.75;
    case 'conqCaravel':
      return 0.3;
    case 'conqCapitana':
      return 0.15;
    case 'rivalBalsa':
      return 0.3;
    case 'punaBalsa':
      return 0.35;
    case 'spondylusTrader':
      return 0.75;
    case 'punaArmada':
      return 0.15;
    case 'venetianGalley':
      return 0.35;
    case 'spanishGalley':
      return 0.3;
    case 'venetianTrader':
      return 0.7;
    case 'laReal':
      return 0.15;
    case 'japanFlagship':
      return 0.15;
    case 'umayyadGalley':
      return 0.3;
    case 'shalandi':
      return 0.4;
    case 'umayyadSupply':
      return 0.75;
    case 'maslamaFlagship':
      return 0.15;
    case 'sherdenGalley':
      return 0.3;
    case 'sherdenRaider':
      return 0.35;
    case 'clanShip':
      return 0.7;
    case 'sherdenArmada':
      return 0.15;
    case 'srivJong':
      return 0.3;
    case 'srivScout':
      return 0.4;
    case 'spiceTrader':
      return 0.7;
    case 'royalJong':
      return 0.15;
    case 'yuanScout':
      return 0.35;
    case 'yuanFlagship':
      return 0.15;
    case 'spanBrigantine':
      return 0.35;
    case 'tlaxCanoe':
      return 0.35;
    case 'supplyBrig':
      return 0.7;
    case 'cortesCapitana':
      return 0.15;
    default:
      return 0; // player, fireship, warCanoe
  }
}

/** What the boarding party finds when it swings across. */
export type BoardingOutcome =
  | 'prize' // clean capture — full manifest, crew splits, colours struck
  | 'ambush' // treachery! her crew falls on the boarders and fights on
  | 'sabotage' // she blows up alongside — prize lost, splinters everywhere
  | 'plague'; // prize taken, but fever below and the stores are spoiled

/**
 * Roll the boarding outcome. Boarding with fewer hands than the prize still
 * carries invites treachery — bring a strong crew or pound her crew down first.
 */
export function rollBoardingOutcome(playerCrew: number, enemyCrew: number): BoardingOutcome {
  const outnumbered = playerCrew < enemyCrew;
  const ambush = outnumbered ? 0.32 : 0.18;
  const sabotage = 0.1;
  const plague = 0.1;
  const r = Math.random();
  if (r < ambush) return 'ambush';
  if (r < ambush + sabotage) return 'sabotage';
  if (r < ambush + sabotage + plague) return 'plague';
  return 'prize';
}
