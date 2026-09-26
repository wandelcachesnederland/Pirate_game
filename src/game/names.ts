import i18n from '../i18n';
import type { ShipKind } from './types';

/**
 * Localized display name for an arcade foe ship-kind.
 * Falls back to the def's authored name (hero hulls keep originals).
 */
export function shipKindNameL(kind: ShipKind, fallback: string): string {
  return i18n.t(`ships:${kind}`, { defaultValue: fallback });
}
