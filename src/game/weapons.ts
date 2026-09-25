import type { EraId, ShipDef, UpgradeDef, UpgradeId } from './types';

export type WeaponTechnology = 'mechanical' | 'gunpowder';
export type ProjectileKind = 'arrow' | 'bolt' | 'cannonball';

/** Naval cannon availability, not the date gunpowder was first discovered.
 * Inca Pacific waters also predate local access to cannon. */
export const ERA_WEAPONS: Record<EraId, WeaponTechnology> = {
  golden: 'gunpowder', exploration: 'gunpowder', napoleonic: 'gunpowder',
  ironclad: 'gunpowder', chinese: 'gunpowder', japanese: 'gunpowder',
  maori: 'gunpowder', hawaii: 'gunpowder', maya: 'gunpowder',
  lepanto: 'gunpowder', korea: 'gunpowder', aztec: 'gunpowder',
  viking: 'mechanical', roman: 'mechanical', greek: 'mechanical',
  arab: 'mechanical', macedon: 'mechanical', byzantium: 'mechanical',
  egypt: 'mechanical', chola: 'mechanical', vietnam: 'mechanical', inca: 'mechanical',
};

export function usesGunpowder(era: EraId): boolean {
  return ERA_WEAPONS[era] === 'gunpowder';
}

/** Apply to every hull in the era, including enemy reinforcements. Never mutate
 * shared definitions: the next voyage may use the same hull in a later era. */
export function armShipForEra(def: ShipDef, era: EraId): ShipDef {
  if (usesGunpowder(era) || def.weapon === 'mechanical') return def;
  return { ...def, weapon: 'mechanical', mortar: false, styleKey: `${def.styleKey ?? def.kind}-mechanical` };
}

export function projectileFor(era: EraId, light = false): ProjectileKind {
  return usesGunpowder(era) ? 'cannonball' : light ? 'arrow' : 'bolt';
}

const MECHANICAL_UPGRADES: Partial<Record<UpgradeId, [string, string]>> = {
  cannons: ['Extra Bow Stations', '+1 archery / pulley-launcher station on each side'],
  reload: ['Veteran Bow Crew', 'Draw bows and reset pulleys 15% faster'],
  damage: ['Heavy Bolts', '+25% arrow & bolt damage'],
  range: ['Stronger Bows & Pulleys', '+18% weapon range & velocity'],
  swivel: ['Deck Archers', 'Archers automatically shoot at close foes'],
  chain: ['Rigging Bolts', 'Barbed bolts damage rigging and slow enemy ships'],
  grapeshot: ['Arrow Storm', 'R: an all-round arrow volley — strong against open boats'],
  chaser: ['Chase Ballistas', 'Bow & stern pulley-drawn launchers fire automatically'],
};

export function upgradeForEra(def: UpgradeDef, era: EraId): UpgradeDef {
  const copy = !usesGunpowder(era) && MECHANICAL_UPGRADES[def.id];
  return copy ? { ...def, name: copy[0], desc: copy[1] } : def;
}
