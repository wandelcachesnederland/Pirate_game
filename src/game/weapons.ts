import type { EraId, ProjectileKind, ShipDef, UpgradeDef, UpgradeId } from './types';

export type { ProjectileKind };

export type WeaponTechnology = 'mechanical' | 'gunpowder';

/** Naval cannon availability, not the date gunpowder was first discovered.
 * Inca Pacific waters also predate local access to cannon. The steel navies
 * (Dreadnought to the guided-missile era) are 'gunpowder' in the broad sense:
 * their shells, torpedoes and rockets all go off on impact, which is exactly
 * what the pre-gunpowder seas must never do. */
export const ERA_WEAPONS: Record<EraId, WeaponTechnology> = {
  golden: 'gunpowder', exploration: 'gunpowder', napoleonic: 'gunpowder',
  ironclad: 'gunpowder', chinese: 'gunpowder', japanese: 'gunpowder',
  maori: 'gunpowder', hawaii: 'gunpowder', maya: 'gunpowder',
  lepanto: 'gunpowder', korea: 'gunpowder', aztec: 'gunpowder',
  viking: 'mechanical', roman: 'mechanical', greek: 'mechanical',
  arab: 'mechanical', macedon: 'mechanical', byzantium: 'mechanical',
  egypt: 'mechanical', chola: 'mechanical', vietnam: 'mechanical', inca: 'mechanical',
  barbary: 'gunpowder', ww1: 'gunpowder', ww2: 'gunpowder', hormuz: 'gunpowder',
};

export function usesGunpowder(era: EraId): boolean {
  return ERA_WEAPONS[era] === 'gunpowder';
}

/** Every shot a ship can throw without a grain of powder aboard. */
export type MechanicalShot = 'arrow' | 'bolt' | 'fireArrow' | 'greekFire' | 'stone';

/**
 * What one sea's ships are armed with. A broadside is built around the heavy
 * engines (`heavy`); the lighter deck stations throw `light`. Before cannon,
 * both of those are muscle-powered or chemical — bowstrings, winches, torsion,
 * slings, siphons — and none of them explodes on impact.
 */
export interface Armament {
  /** Shot from the broadside's main engines. */
  heavy: ProjectileKind;
  /** Shot from the light deck stations, bow chasers and stern chasers. */
  light: ProjectileKind;
  /** What this sea calls its main engines (eras, HUD, notices). */
  heavyName: string;
  /** What it calls the light batteries. */
  lightName: string;
  /** One line for the era picker and the ship's orders. */
  summary: string;
  /** Name of the all-round close-range volley (the grape-shot button). */
  volleyName: string;
  /** Short form for hints and the HUD ('cannons', 'bows & winch-launchers'). */
  weaponWord: string;
}

/** The shot of the powder navies, and later their shells and missiles. */
const CANNON: Armament = {
  heavy: 'cannonball',
  light: 'cannonball',
  heavyName: 'Gunpowder broadsides',
  lightName: 'Deck guns',
  summary: 'Gunpowder broadsides, exploding shell and shot',
  volleyName: 'GRAPE!',
  weaponWord: 'guns',
};

/** Bow, winch and stone armament of the seas that never had cannon. */
function archery(
  heavy: MechanicalShot,
  light: MechanicalShot,
  heavyName: string,
  lightName: string,
  summary: string,
  weaponWord = 'bows & winch-launchers',
): Armament {
  return { heavy, light, heavyName, lightName, summary, volleyName: 'ARROW STORM!', weaponWord };
}

/**
 * The armament of every era. Mechanical entries are the historical mix of that
 * sea: winch-drawn bolts in the Mediterranean and the North, sling and torsion
 * stones where the big engines threw weight rather than shafts, fire arrows in
 * the Vietnam of the stake barrages, and Greek fire — the real thing, thrown
 * from bronze siphons — in the Byzantine and Arab seas.
 *
 * `armShipForEra` strips cannon and mortars from every hull in a mechanical
 * era; this table then decides what those silent gun ports throw instead.
 */
export const ERA_ARMAMENTS: Record<EraId, Armament> = {
  // ---- gunpowder seas: the same shot as before
  golden: CANNON, exploration: CANNON, napoleonic: CANNON, ironclad: CANNON,
  chinese: CANNON, japanese: CANNON, maori: CANNON, hawaii: CANNON,
  maya: CANNON, lepanto: CANNON, korea: CANNON, aztec: CANNON,
  barbary: CANNON, ww1: CANNON, ww2: CANNON, hormuz: CANNON,

  // ---- pre-gunpowder seas
  viking: archery('bolt', 'arrow', 'Winch-drawn bolt launchers', 'Bow crews',
    'Archery, hand-thrown spears and winch-drawn bolt launchers'),
  roman: archery('stone', 'arrow', 'Stone-throwing ballistae', 'Archer ranks',
    'Ballista stones, torsion engines and archery', 'ballistae & archery'),
  greek: archery('bolt', 'arrow', 'Oxybeles bolt launchers', 'Archer ranks',
    'Archery and oxybeles bolt launchers — ram first, board after'),
  macedon: archery('stone', 'bolt', 'Torsion stone-throwers', 'Bolt launchers',
    'Stone-throwing catapults and bolt engines off the great decks', 'catapults & bolt engines'),
  egypt: archery('bolt', 'arrow', 'Winch-drawn bolt launchers', 'Archer ranks',
    'Archery and winch-drawn bolts along the Nile mouths'),
  arab: archery('greekFire', 'arrow', 'Naphtha fire siphons', 'Archer ranks',
    'Naphtha fire siphons, fire pots and archery', 'fire siphons & bows'),
  byzantium: archery('greekFire', 'fireArrow', 'Bronze fire siphons', 'Fire-arrow crews',
    'Greek fire from the bow siphons, with fire arrows along the decks', 'Greek fire siphons'),
  chola: archery('bolt', 'arrow', 'Winch-drawn bolt launchers', 'Archer ranks',
    'Archery and winch-drawn bolts from the big Coromandel hulls'),
  vietnam: archery('bolt', 'fireArrow', 'Winch-drawn bolt launchers', 'Fire-arrow crews',
    'Winch-drawn bolts and fire arrows over the stake barrages', 'bolts & fire arrows'),
  inca: archery('stone', 'arrow', 'Sling-thrown stones', 'Atlatl darts',
    'Sling stones and atlatl darts from the balsa rafts', 'sling stones & darts'),
};

/** What this sea's ships are armed with. */
export function armamentFor(era: EraId): Armament {
  return ERA_ARMAMENTS[era] ?? CANNON;
}

/** The armament of a pre-gunpowder sea, or null where cannon are carried. */
export function mechanicalArmament(era: EraId): Armament | null {
  return usesGunpowder(era) ? null : armamentFor(era);
}

/** Apply to every hull in the era, including enemy reinforcements. Never mutate
 * shared definitions: the next voyage may use the same hull in a later era. */
export function armShipForEra(def: ShipDef, era: EraId): ShipDef {
  if (usesGunpowder(era) || def.weapon === 'mechanical') return def;
  return { ...def, weapon: 'mechanical', mortar: false, styleKey: `${def.styleKey ?? def.kind}-mechanical` };
}

/** The shot a hull (or a fort) throws. `light` picks the deck stations. */
export function projectileFor(era: EraId, light = false): ProjectileKind {
  const a = armamentFor(era);
  return light ? a.light : a.heavy;
}

/** Did somebody throw this without powder? */
export function isMechanicalShot(kind: ProjectileKind): boolean {
  return kind === 'arrow' || kind === 'bolt' || kind === 'fireArrow'
    || kind === 'greekFire' || kind === 'stone';
}

/** Does this shot set a hull alight rather than merely break it? */
export function isIncendiary(kind: ProjectileKind): boolean {
  return kind === 'fireArrow' || kind === 'greekFire';
}

/** Blunt shot: a stone cracks planking, it does not kindle it. */
export function isBlunt(kind: ProjectileKind): boolean {
  return kind === 'stone';
}

/**
 * How a wreck ends. Powder navies lose a magazine and come apart in a white
 * blast; every other sea burns. Nothing pre-gunpowder ever goes off.
 */
export type BlastKind = 'powder' | 'fire';

export function blastKindFor(era: EraId): BlastKind {
  return usesGunpowder(era) ? 'powder' : 'fire';
}

/** What one shot does when it reaches a hull. */
export interface ShotProfile {
  /** Damage multiplier on top of the hull's own figure. */
  dmg: number;
  /** Chance (0..1) a hit sets the target alight. */
  ignite: number;
  /** Seconds of fire applied when it does. */
  burn: number;
  /** Fire damage per second as a fraction of the victim's maximum hull. */
  burnRate: number;
  /** Seconds of rigging damage (slow) the hit causes, 0 for none. */
  slow: number;
  /** Hot metal strikes iron: sparks. Wood, rope and stone do not spark. */
  sparks: boolean;
  /** Name for the log and the HUD. */
  name: string;
}

/**
 * Fire is what kills in the pre-gunpowder seas, so incendiaries trade a little
 * direct damage for burning that eats the hull long after the shot has landed.
 * Arrows, bolts and stones only ever batter.
 */
export const SHOT_PROFILE: Record<ProjectileKind, ShotProfile> = {
  arrow: { dmg: 1, ignite: 0, burn: 0, burnRate: 0, slow: 0, sparks: false, name: 'Arrow' },
  bolt: { dmg: 1, ignite: 0, burn: 0, burnRate: 0, slow: 0, sparks: false, name: 'Winch bolt' },
  fireArrow: { dmg: 0.85, ignite: 0.5, burn: 3.5, burnRate: 0.010, slow: 1.4, sparks: false, name: 'Fire arrow' },
  greekFire: { dmg: 0.8, ignite: 1, burn: 5, burnRate: 0.016, slow: 1.2, sparks: false, name: 'Greek fire' },
  stone: { dmg: 1.15, ignite: 0, burn: 0, burnRate: 0, slow: 0, sparks: false, name: 'Stone' },
  cannonball: { dmg: 1, ignite: 0, burn: 0, burnRate: 0, slow: 0, sparks: true, name: 'Shot' },
  missile: { dmg: 1, ignite: 0.25, burn: 3, burnRate: 0.006, slow: 0, sparks: true, name: 'Missile' },
};

/** A line naming the armament for the ship's orders and notices. */
export function armamentSummary(era: EraId): string {
  const a = armamentFor(era);
  return usesGunpowder(era)
    ? a.summary
    : `${a.summary} — no powder: hulls burn, they do not explode`;
}

/** Names for the light stations of an era: 'bows' rather than 'guns'. */
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

/** The same upgrades aboard a ship whose main engine throws fire. */
const INCENDIARY_UPGRADES: Partial<Record<UpgradeId, [string, string]>> = {
  cannons: ['Extra Siphon Ports', '+1 fire station on each side'],
  reload: ['Veteran Fire Crew', 'Pump and swab the siphons 15% faster'],
  damage: ['Thicker Naphtha', '+25% fire & shot damage — the flames bite deeper'],
  range: ['Longer Siphons', '+18% weapon range & velocity'],
  swivel: ['Deck Fire Pots', 'Fire crews throw burning pots at close foes'],
  chain: ['Burning Rigging', 'Burning naphtha clings to rigging and slows enemy ships'],
  grapeshot: ['Fire Pot Volley', 'R: a sheet of burning naphtha all round — death to open boats'],
  chaser: ['Bow Siphons', 'Bow & stern siphons fire automatically at pursuers'],
};

export function upgradeForEra(def: UpgradeDef, era: EraId): UpgradeDef {
  if (usesGunpowder(era)) return def;
  const arm = armamentFor(era);
  const table = isIncendiary(arm.heavy) ? INCENDIARY_UPGRADES : MECHANICAL_UPGRADES;
  const copy = table[def.id];
  return copy ? { ...def, name: copy[0], desc: copy[1] } : def;
}
