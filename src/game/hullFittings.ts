// Hull fittings: things bolted, spiked, lashed or welded to the hull itself.
//
// Unlike the guns, a fitting never fires. It works when hulls touch: a ram on
// the stem that stoves in whatever you drive it into, something along the
// sides that punishes anyone who scrapes alongside, and fenders that soak up
// the blow and shove the other hull away. Every age fits its own: a bronze
// rostrum and a corvus bridge off Sicily, iron spikes on the turtle ship's
// roof, vinegar-soaked felt against Greek fire, truck tyres on a Somali
// mothership.
//
// Three refit slots, each renamed per era:
//   ram     — bow contact at speed does heavy damage; your own bow takes less.
//   spikes  — any enemy touching your hull takes damage (+ the era's effect).
//   fenders — less damage from collisions, bites, fire-ship blasts and fire;
//             enemies that touch you are shoved off harder.

import type { EraId, UpgradeDef, UpgradeId } from './types';

export type FittingSlot = 'ram' | 'spikes' | 'fenders';

/**
 * What a fitting does besides raw damage.
 *  - breach: holes her below the waterline — extra damage, and she wallows (slowed)
 *  - tangle: hooks, grapnels, beams and blades foul her oars or rigging (slowed)
 *  - fire:   she is set alight
 *  - shock:  scald, blast or glare scatters her crews — her reload is set back
 */
export type FittingEffect = 'none' | 'breach' | 'tangle' | 'fire' | 'shock';

export interface FittingSpec {
  name: string;
  desc: string;
  effect: FittingEffect;
}

export interface EraFittings {
  ram: FittingSpec;
  spikes: FittingSpec;
  fenders: FittingSpec;
  /** Colour of the ram and spikes as drawn on the hull. */
  metal: string;
  /** Colour of the fenders as drawn along the sides. */
  pad: string;
}

export const FITTING_SLOTS: readonly FittingSlot[] = ['ram', 'spikes', 'fenders'];
export const FITTING_MAX = 3;

export function isFittingSlot(id: UpgradeId): id is FittingSlot {
  return id === 'ram' || id === 'spikes' || id === 'fenders';
}

// ── tuning ────────────────────────────────────────────────────────────────

/** Seconds before one fitting can bite the same hull again. */
export const RAM_COOLDOWN = 0.9;
export const SPIKE_COOLDOWN = 0.55;
/** Cosine of the widest angle off the bow that still counts as a ram. */
export const RAM_ARC = 0.72;

/** Ram damage against a hull of `victimMaxHp`, at `speedFrac` (0..1) of top speed. */
export function ramDamage(level: number, victimMaxHp: number, speedFrac: number, effect: FittingEffect): number {
  if (level <= 0) return 0;
  const k = Math.max(0.35, Math.min(1, speedFrac));
  const base = (8 + 14 * level + victimMaxHp * (0.06 + 0.06 * level)) * k;
  return effect === 'breach' ? base * 1.35 : base;
}

/** How much of a head-on collision's damage your own bow still takes. */
export function ramSelfGuard(level: number): number {
  return level <= 0 ? 1 : [0.5, 0.35, 0.2][Math.min(level, 3) - 1];
}

export function spikeDamage(level: number, victimMaxHp: number): number {
  return level <= 0 ? 0 : 3 + 4 * level + victimMaxHp * 0.025 * level;
}

/** Fraction of contact / bite / blast damage that still reaches you. */
export function fenderGuard(level: number): number {
  return 1 - 0.2 * Math.max(0, Math.min(level, 3));
}

/** Fraction of fire time that still takes hold of your hull. */
export function fenderFireGuard(level: number): number {
  return 1 - 0.15 * Math.max(0, Math.min(level, 3));
}

/** Extra shove handed to an enemy hull that touches yours. */
export function fenderRepel(level: number): number {
  return 40 * Math.max(0, Math.min(level, 3));
}

// ── the fittings of every age ─────────────────────────────────────────────

const f = (name: string, desc: string, effect: FittingEffect = 'none'): FittingSpec => ({ name, desc, effect });

const BRONZE = '#c8a44e';
const IRON = '#5e6266';
const STEEL = '#9aa4a8';
const WOOD = '#8a5f34';
const OBSIDIAN = '#2a2530';
const BONE = '#e8dcc0';
const ROPE = '#b89a64';
const HIDE = '#8a6a44';
const RUBBER = '#1c1c1e';
const FELT = '#6f6a5c';

export const HULL_FITTINGS: Record<EraId, EraFittings> = {
  // ── Age of Sail ──────────────────────────────────────────────────────────
  golden: {
    ram: f('Iron-Shod Cutwater', 'Drive the iron-sheathed stem into a hull at speed'),
    spikes: f('Grapnels on the Rails', 'Anything that scrapes alongside is hooked, raked and slowed', 'tangle'),
    fenders: f('Junk Fenders & Fend-Off Spars', 'Rope-junk fenders and long spars keep rams and fire ships off'),
    metal: IRON, pad: ROPE,
  },
  exploration: {
    ram: f('Reinforced Beakhead', 'A braced beakhead that smashes into a hull at speed'),
    spikes: f('Sheer-Hooks on the Yardarms', 'Sickle blades on the yards cut the rigging of anyone alongside', 'tangle'),
    fenders: f('Ox-Hide Bolsters', 'Hides stuffed with wool hung over the side soak up blows'),
    metal: IRON, pad: HIDE,
  },
  napoleonic: {
    ram: f('Coppered Stem & Iron Knee', 'A doubled stem that stoves in planking at speed'),
    spikes: f('Boarding Netting & Pikes', 'Netting and a hedge of pikes along the rail wound boarders'),
    fenders: f('Rope Fenders & Booms', 'Fenders and fending booms keep other hulls off'),
    metal: IRON, pad: ROPE,
  },
  barbary: {
    ram: f('Copper-Sheathed Cutwater', 'The schooner’s sharp stem, braced for ramming a gunboat'),
    spikes: f('Boarding Netting & Pikes', 'A hedge of pikes along the rail for the corsairs'),
    fenders: f('Hammock Nettings', 'Rolled hammocks stowed in the rail nettings stop shot and splinters'),
    metal: IRON, pad: ROPE,
  },
  viking: {
    ram: f('Iron-Bound Stem', 'An iron band on the tall stem — ride up and crack her strakes'),
    spikes: f('Spear Hedge on the Shield Rail', 'Spears levelled between the shields gore anyone alongside'),
    fenders: f('Oak Rubbing Strakes', 'Thick oak wales take the blow instead of the planking'),
    metal: IRON, pad: WOOD,
  },
  ironclad: {
    ram: f('Cast-Iron Ram Bow', 'The Virginia’s trick: hole her below the waterline', 'breach'),
    spikes: f('Boiler Scald Hoses', 'Live steam piped to the rails scalds boarders — her crews scatter', 'shock'),
    fenders: f('Railroad-Iron Skirts', 'Sloped iron over the waterline turns rams and shot aside'),
    metal: IRON, pad: IRON,
  },
  hanse: {
    ram: f('Iron-Shod Cog Stem', 'The cog’s heavy stem, shod for ramming'),
    spikes: f('Sickle-Blade Yards', 'Blades on the yardarms shear the rigging of anyone alongside', 'tangle'),
    fenders: f('Wool-Sack Fenders', 'Sacks of English wool hung over the side — the League’s own cargo'),
    metal: IRON, pad: '#d8ceb0',
  },
  portugal: {
    ram: f('Carrack Beakhead', 'A massive beak braced to smash into dhows'),
    spikes: f('Sheer-Hooks', 'Hooked blades rip the rigging of anyone alongside', 'tangle'),
    fenders: f('Cotton-Bale Bulwarks', 'Bales of Indian cotton lashed along the waist'),
    metal: IRON, pad: '#efe6d0',
  },
  armada: {
    ram: f('Galleass Iron Beak', 'The galleass’s iron spur holes planking below the wale', 'breach'),
    spikes: f('Boarding Nets with Pikes', 'Nets and pikes along the waist wound boarders'),
    fenders: f('Fire-Ship Grapnel Booms', 'Booms to fend off the fire ships of Gravelines'),
    metal: IRON, pad: WOOD,
  },
  dutch: {
    ram: f('Oak Stem Knee', 'A doubled oak stem for running down a prize'),
    spikes: f('Boarding-Pike Rails', 'Pikes racked along the rail gore boarders'),
    fenders: f('Hemp Fender Mats', 'Thick woven hemp mats hung over the side'),
    metal: IRON, pad: ROPE,
  },
  // ── Steel navies ─────────────────────────────────────────────────────────
  predread: {
    ram: f('Ram Bow', 'Every battleship of 1905 still carried a ram — use it', 'breach'),
    spikes: f('Torpedo-Net Booms', 'Swung-out booms and steel netting foul anyone alongside', 'tangle'),
    fenders: f('Harvey Steel Belt', 'Face-hardened armour along the waterline'),
    metal: STEEL, pad: IRON,
  },
  ww1: {
    ram: f('Strengthened Ramming Bow', 'Destroyers rammed U-boats — a bow built to do it', 'breach'),
    spikes: f('Explosive Paravanes', 'Towed charges off the bow go off against a hull — crews reel', 'shock'),
    fenders: f('Anti-Torpedo Bulges', 'Bulged outer hull soaks up blows and blasts'),
    metal: STEEL, pad: IRON,
  },
  ww2: {
    ram: f('Reinforced Ramming Stem', 'Like USS Borie against U-405: ride up and crush her', 'breach'),
    spikes: f('Depth-Charge Rails', 'Charges rolled at point blank — the shock scatters her crews', 'shock'),
    fenders: f('Splinter Mattresses', 'Splinter matting over bridge and mounts'),
    metal: STEEL, pad: '#6a6e58',
  },
  hormuz: {
    ram: f('Reinforced Bow Plating', 'A plated bow for running down speedboats'),
    spikes: f('Contact-Mine Racks', 'Mines racked on the rails go off against a hull', 'fire'),
    fenders: f('Kevlar Armour Panels', 'Composite panels over the bridge and waterline'),
    metal: STEEL, pad: '#4a5040',
  },
  falklands: {
    ram: f('Ice-Strengthened Bow', 'A South Atlantic bow, strong enough to ram'),
    spikes: f('Corvus Chaff Launchers', 'Chaff and flares at point blank blind her crews', 'shock'),
    fenders: f('Kevlar Splinter Panels', 'Added after Sheffield: splinter armour over the vitals'),
    metal: STEEL, pad: '#4a5040',
  },
  somali: {
    ram: f('Welded Steel Bow Plate', 'Scrap plate welded to the mothership’s bow — bump and board'),
    spikes: f('Hooked Boarding Ladders', 'Aluminium ladders hooked over her rail foul and slow her', 'tangle'),
    fenders: f('Truck-Tyre Fenders', 'Old tyres chained along the sides take the knocks'),
    metal: STEEL, pad: RUBBER,
  },
  // ── Heritage seas ────────────────────────────────────────────────────────
  roman: {
    ram: f('Bronze Rostrum', 'A three-finned bronze ram — hole her below the waterline', 'breach'),
    spikes: f('Corvus Boarding Bridge', 'The spiked bridge drops onto her deck and pins her', 'tangle'),
    fenders: f('Oak Wales', 'Heavy wales along the waterline take the ramming'),
    metal: BRONZE, pad: WOOD,
  },
  greek: {
    ram: f('Bronze Embolon', 'The Salamis ram: at full stroke she stoves in a hull', 'breach'),
    spikes: f('Epotides Cathead Beams', 'Beams off the bow sheer away the oars of anyone alongside', 'tangle'),
    fenders: f('Hypozomata Girding Cables', 'Hull-girding cables hold her together when struck'),
    metal: BRONZE, pad: ROPE,
  },
  macedon: {
    ram: f('Great Ram & Proembolion', 'A main ram with a second above it for the heavy polyremes', 'breach'),
    spikes: f('Iron-Hand Grapnels', 'Iron hands on chains seize anyone alongside', 'tangle'),
    fenders: f('Doubled Wales & Hide Screens', 'Doubled wales and hides over the oar box'),
    metal: BRONZE, pad: HIDE,
  },
  phoenicia: {
    ram: f('Bronze Boar-Snout Ram', 'The pointed ram of the cedar galleys of Tyre', 'breach'),
    spikes: f('Shield-Hung Rail', 'Shields and spear points hung along the rail'),
    fenders: f('Cedar Wales', 'Lebanon cedar wales along the waterline'),
    metal: BRONZE, pad: WOOD,
  },
  egypt: {
    ram: f('Lion-Head Prow Beam', 'The lion-headed prow of Medinet Habu, braced for impact'),
    spikes: f('Pole Grappling Hooks', 'Hooks on poles drag raiders alongside and hold them', 'tangle'),
    fenders: f('Papyrus-Bundle Bulwarks', 'Bundled papyrus screens along the rail'),
    metal: BRONZE, pad: '#b8a860',
  },
  byzantium: {
    ram: f('Spur Beak', 'The dromon’s spur rides over and snaps her oars', 'tangle'),
    spikes: f('Hand-Siphon Fire Rails', 'Hand siphons along the rail spray fire on anyone alongside', 'fire'),
    fenders: f('Vinegar-Soaked Felt', 'Felt soaked in vinegar — the old defence against Greek fire'),
    metal: BRONZE, pad: FELT,
  },
  lepanto: {
    ram: f('Galley Spur (Sperone)', 'The iron spur rides over her bow and smashes her oars', 'tangle'),
    spikes: f('Pavesade & Boarding Pikes', 'Pikes behind the pavises gore boarders'),
    fenders: f('Netting & Mattresses', 'Boarding nets and mattresses over the rambades'),
    metal: IRON, pad: HIDE,
  },
  ottoman: {
    ram: f('Kadırga Spur', 'The Ottoman spur snaps the oars of Christian galleys', 'tangle'),
    spikes: f('Grapnel Chains', 'Grapnels on chains lock anyone alongside', 'tangle'),
    fenders: f('Wool-Bale Pavisade', 'Wool bales lashed behind the rail'),
    metal: IRON, pad: '#d8ceb0',
  },
  arab: {
    ram: f('Teak Stem Cap', 'A capped teak stem for running down pirates'),
    spikes: f('Naphtha-Pot Racks', 'Clay fire pots racked along the rail burst against a hull', 'fire'),
    fenders: f('Coir-Rope Fenders', 'Coconut-fibre fenders, like the rope that sews the hull'),
    metal: WOOD, pad: ROPE,
  },
  chola: {
    ram: f('Iron-Capped Stem', 'An iron cap on the big Coromandel stem'),
    spikes: f('Iron Spike Rail', 'Iron spikes along the rail for the prahus'),
    fenders: f('Coir Fenders', 'Coconut-fibre fenders along the sides'),
    metal: IRON, pad: ROPE,
  },
  chinese: {
    ram: f('Mengchong Ram Prow', 'The rawhide-covered rammer’s prow of the river fleets'),
    spikes: f('Fire-Lance Racks', 'Fire lances racked on the rails spew flame at point blank', 'fire'),
    fenders: f('Rawhide Hull Screens', 'Wet rawhide over the upperworks'),
    metal: IRON, pad: HIDE,
  },
  vietnam: {
    ram: f('Iron-Tipped Stake Prow', 'The Bạch Đằng stakes, fixed to your own bow', 'breach'),
    spikes: f('Bamboo Stake Skirts', 'Sharpened bamboo along the waterline'),
    fenders: f('Bamboo-Bundle Fenders', 'Lashed bundles of green bamboo'),
    metal: IRON, pad: '#8aa050',
  },
  japanese: {
    ram: f('Iron-Plated Bow', 'Nobunaga’s iron ships: an armoured bow for ramming'),
    spikes: f('Kumade Rake Hooks', 'Bear-claw rakes drag at anyone alongside', 'tangle'),
    fenders: f('Takeba Bamboo Bundles', 'Bamboo bundles that stop arrows and blows'),
    metal: IRON, pad: '#8aa050',
  },
  korea: {
    ram: f('Dragon-Head Ram', 'The dragon head — ram, and choke her crew with sulphur smoke', 'shock'),
    spikes: f('Iron-Spiked Turtle Roof', 'Iron spikes over the roof tear anyone who comes alongside'),
    fenders: f('Hexagon Plate Armour', 'Iron plates over the hull and roof'),
    metal: IRON, pad: IRON,
  },
  maori: {
    ram: f('Tauihu Carved Prow', 'The carved figurehead, braced for driving into a waka'),
    spikes: f('Taiaha Spear Rail', 'Spears levelled along the rail'),
    fenders: f('Flax-Rope Lashings', 'Harakeke flax lashings take the knocks'),
    metal: WOOD, pad: '#b89a54',
  },
  hawaii: {
    ram: f('Koa Prow', 'A koa-wood prow for driving between the hulls'),
    spikes: f('Shark-Tooth Rail', 'Leiomano shark-tooth blades along the rails'),
    fenders: f('Hala-Mat Fenders', 'Woven pandanus mats over the sides'),
    metal: BONE, pad: '#c8b27a',
  },
  maya: {
    ram: f('Hardwood Prow', 'A chicozapote prow for ramming canoes'),
    spikes: f('Obsidian-Edged Rails', 'Obsidian blades set along the rail'),
    fenders: f('Quilted Cotton Screens', 'Quilted cotton armour hung over the sides'),
    metal: OBSIDIAN, pad: '#efe6d0',
  },
  aztec: {
    ram: f('Cypress Prow', 'An ahuehuete-wood prow braced for ramming'),
    spikes: f('Obsidian Blade Rail', 'Macuahuitl blades set along the rail'),
    fenders: f('Ichcahuipilli Mantles', 'Quilted cotton armour draped over the sides'),
    metal: OBSIDIAN, pad: '#efe6d0',
  },
  inca: {
    ram: f('Hardwood Prow Log', 'A heavy hardwood log lashed across the bow'),
    spikes: f('Bone-Tipped Pole Hedge', 'Poles tipped with bone along the raft edge'),
    fenders: f('Totora Reed Bundles', 'Bundles of totora reed lashed around the raft'),
    metal: BONE, pad: '#b8a860',
  },
};

export function fittingsFor(era: EraId): EraFittings {
  return HULL_FITTINGS[era] ?? HULL_FITTINGS.golden;
}

/** The fitting slots' refit cards, renamed for the era. */
export function fittingUpgradeForEra(def: UpgradeDef, era: EraId): UpgradeDef {
  if (!isFittingSlot(def.id)) return def;
  const spec = fittingsFor(era)[def.id];
  const tag: Record<FittingEffect, string> = {
    none: '',
    breach: ' · holes her',
    tangle: ' · slows her',
    fire: ' · sets her alight',
    shock: ' · stuns her crews',
  };
  const lead = def.id === 'ram' ? 'Bow' : def.id === 'spikes' ? 'Sides' : 'Guard';
  return { ...def, name: spec.name, desc: `${lead}: ${spec.desc}${tag[spec.effect]}` };
}
