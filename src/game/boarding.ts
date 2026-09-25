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
