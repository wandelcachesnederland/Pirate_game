import { ERA_SHIPS, type EraShip } from './ships/era';
import type { EraId } from './types';

function parseYear(s: string): number {
  const bc = s.match(/(\d+)\s*BC/i);
  if (bc) return -parseInt(bc[1], 10);
  const num = parseInt(s, 10);
  return isNaN(num) ? 0 : num;
}

/** All eras sorted from oldest (most BC) to newest */
export function chronologicalEras(): EraShip[] {
  return [...ERA_SHIPS].sort((a, b) => parseYear(a.year) - parseYear(b.year));
}

export function chronologicalEraIds(): EraId[] {
  return chronologicalEras().map((e) => e.id);
}

export const CAMPAIGN_WAVES_PER_ERA = 5;

export function oldestEra(): EraShip {
  return chronologicalEras()[0];
}

export function eraById(id: EraId): EraShip | undefined {
  return ERA_SHIPS.find((e) => e.id === id);
}

export function nextEraInCampaign(currentId: EraId, ordered: EraId[]): EraId | null {
  const idx = ordered.indexOf(currentId);
  if (idx < 0 || idx + 1 >= ordered.length) return null;
  return ordered[idx + 1];
}
