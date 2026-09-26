// The art direction of the era cards.
//
// Every era gets its own title card: a stretch of that era's own sea, a fight
// actually worth watching (the hero hull against the worst thing her roster
// sends), the weather those waters are famous for, and a logo plate with the
// era's name, its year and its emblem. Nothing here is a map — the picker used
// to show a chart of islands, and islands look the same in every century. What
// separates 480 BC from 1943 is the hulls, the weapons and the light, so that
// is what gets painted.
//
// The data is deliberately terse (tuples, fractions, radians): the painter in
// `paint.ts` turns it into a picture at whatever size the cabinet gives it.

import type { EraId, Faction, ShipKind } from '../types';

/** A crew mark for the logo seal — one bold shape per era. */
export type EmblemId =
  | 'skull'
  | 'compass'
  | 'crown'
  | 'star'
  | 'axe'
  | 'anchor'
  | 'swords'
  | 'wings'
  | 'missile'
  | 'laurel'
  | 'trident'
  | 'crescent'
  | 'pagoda'
  | 'chrysanthemum'
  | 'koru'
  | 'hook'
  | 'vergina'
  | 'pyramid'
  | 'cross'
  | 'taegeuk'
  | 'flame'
  | 'ankh'
  | 'fish'
  | 'bamboo'
  | 'obsidian'
  | 'inti';

/** The air over the water: it decides rain, fog, night and firelight. */
export type WeatherId =
  | 'clear'
  | 'haze'
  | 'dusk'
  | 'storm'
  | 'rain'
  | 'fog'
  | 'night'
  | 'monsoon';

/** Distant shore silhouettes, drawn along the horizon band. */
export type CoastId =
  | 'hills'
  | 'cliffs'
  | 'dunes'
  | 'mountains'
  | 'volcano'
  | 'palms'
  | 'forest'
  | 'temple'
  | 'pyramids'
  | 'ziggurat'
  | 'fort'
  | 'castle'
  | 'pagoda'
  | 'mosque'
  | 'village'
  | 'city'
  | 'oilrig'
  | 'karst'
  | 'fleet'
  | 'sails';

/** What floats on (or just under) the water between the hulls. */
export type PropId = 'oilSlick' | 'stakes' | 'wreck' | 'reef' | 'whirl' | 'shoreFire';

/** What is being done to whom this frame. */
export type FxId =
  | 'broadside'
  | 'shells'
  | 'arrows'
  | 'fireArrows'
  | 'bolts'
  | 'stones'
  | 'greekFire'
  | 'missiles'
  | 'torpedo'
  | 'ram'
  | 'airRaid';

/** 'hero' is the era's flagship, anything else is a hull from `SHIP_DEFS`. */
export type CastWho = 'hero' | ShipKind;

export interface CastOpts {
  /** Canvas set: 0 furled, 1 all abroad. */
  sail?: number;
  /** Fraction of her hp left — scorch and splinter marks. */
  hp?: number;
  /** 0..1: how thoroughly she is alight. */
  burn?: number;
  /** 0..1: how far gone she is. */
  sink?: number;
  /** Fly somebody else's colours. */
  flag?: Faction;
}

/** `[who, x, y, size, heading, state]` — x/y are fractions of the water. */
export type CastSpec = [who: CastWho, x: number, y: number, s: number, a: number, opts?: CastOpts];

/** `[kind, x, scale]` along the horizon. */
export type CoastSpec = [kind: CoastId, x: number, s: number];

/** `[kind, from-cast, to-cast, seconds-per-salvo]`. */
export type FxSpec = [kind: FxId, from: number, to: number, cycle?: number];

export interface EraSceneSpec {
  /** Small caps line above the era name: the battle or the water itself. */
  ribbon: string;
  /** Zenith → mid → horizon. */
  sky: [string, string, string];
  /** The light behind the horizon: `[x, y, radius, colour, alpha]`. */
  glow: [x: number, y: number, r: number, c: string, a: number];
  coast: CoastSpec[];
  weather: WeatherId;
  /** 0 flat water, 1 a gale. */
  swell: number;
  /** Sun glitter on the swells, 0..1. */
  glitter?: number;
  /** A wash over the water: firelight, dusk, river silt. */
  tint?: string;
  emblem: EmblemId;
  /** Logo plate: `[plate, glow]`. */
  accent: [string, string];
  cast: CastSpec[];
  fx: FxSpec[];
  props?: PropId[];
  /** Wind direction in radians; defaults to the hero's own heading. */
  wind?: number;
}

export const ERA_SCENES: Record<EraId, EraSceneSpec> = {
  // ------------------------------------------------------------ Age of Sail
  golden: {
    ribbon: 'The Spanish Main',
    sky: ['#1668ad', '#5dabdb', '#dff0ef'],
    glow: [0.8, 0.02, 0.5, '#fff3c4', 0.5],
    coast: [['hills', 0.12, 1.1], ['palms', 0.3, 0.9], ['fort', 0.58, 0.9], ['palms', 0.86, 0.75]],
    weather: 'clear',
    swell: 0.45,
    glitter: 0.55,
    emblem: 'skull',
    accent: ['#8e1c14', '#f5c542'],
    cast: [
      ['hero', 0.28, 0.72, 0.4, -0.16],
      ['galleon', 0.7, 0.52, 0.44, 0.1, { hp: 0.6 }],
      ['sloop', 0.9, 0.28, 0.17, -0.3],
    ],
    fx: [['broadside', 0, 1, 2.6], ['arrows', 1, 0, 2.1]],
  },
  exploration: {
    ribbon: 'The Ocean Sea',
    sky: ['#1f74b6', '#79bade', '#f4ecd4'],
    glow: [0.72, 0.03, 0.55, '#fff6d8', 0.5],
    coast: [['hills', 0.18, 1.2], ['palms', 0.44, 0.85], ['village', 0.7, 0.8], ['hills', 0.9, 0.9]],
    weather: 'clear',
    swell: 0.4,
    glitter: 0.5,
    emblem: 'compass',
    accent: ['#1f5f8f', '#f0c860'],
    cast: [
      ['hero', 0.3, 0.72, 0.4, -0.2],
      ['galleon', 0.72, 0.5, 0.46, 0.14],
      ['merchant', 0.9, 0.28, 0.16, -0.25],
    ],
    fx: [['broadside', 0, 1, 3.2], ['broadside', 1, 0, 4.1]],
  },
  napoleonic: {
    ribbon: 'Trafalgar',
    sky: ['#2b3a4c', '#5c6d7c', '#b6bcb6'],
    glow: [0.22, 0.05, 0.6, '#e2dcc0', 0.22],
    coast: [['cliffs', 0.16, 1.1], ['fleet', 0.46, 1], ['sails', 0.72, 0.9], ['fleet', 0.92, 0.8]],
    weather: 'storm',
    swell: 0.85,
    glitter: 0.08,
    emblem: 'crown',
    accent: ['#1f3b63', '#e2c46a'],
    cast: [
      ['hero', 0.26, 0.74, 0.38, -0.1],
      ['manowar', 0.68, 0.56, 0.46, 0.16, { hp: 0.55 }],
      ['frigate', 0.9, 0.32, 0.2, -0.2],
    ],
    fx: [['broadside', 0, 1, 2.2], ['broadside', 1, 0, 2.9]],
  },
  barbary: {
    ribbon: 'Shores of Tripoli',
    sky: ['#5f87a0', '#b7c9c9', '#f2dfba'],
    glow: [0.62, 0.06, 0.7, '#ffe6b0', 0.45],
    coast: [['dunes', 0.18, 1.1], ['fort', 0.44, 0.95], ['mosque', 0.68, 0.85], ['dunes', 0.9, 0.9]],
    weather: 'haze',
    swell: 0.4,
    glitter: 0.4,
    emblem: 'star',
    accent: ['#1d5c78', '#e8c766'],
    cast: [
      ['hero', 0.3, 0.72, 0.38, -0.14],
      ['corsairXebec', 0.7, 0.52, 0.42, 0.12, { hp: 0.65 }],
      ['tripoliGunboat', 0.9, 0.32, 0.2, -0.1],
    ],
    fx: [['broadside', 0, 1, 2.4], ['broadside', 2, 0, 3.3]],
  },
  viking: {
    ribbon: 'Lindisfarne',
    sky: ['#39494f', '#6d8388', '#b3b8ac'],
    glow: [0.34, 0.05, 0.6, '#d8e2d8', 0.2],
    coast: [['cliffs', 0.14, 1.3], ['village', 0.4, 0.95], ['forest', 0.68, 1.1], ['cliffs', 0.92, 0.9]],
    weather: 'rain',
    swell: 0.8,
    glitter: 0.05,
    emblem: 'axe',
    accent: ['#3f5d54', '#d8c07a'],
    props: ['shoreFire'],
    cast: [
      ['hero', 0.32, 0.74, 0.4, -0.34],
      ['merchant', 0.7, 0.52, 0.44, 0.22, { hp: 0.4, burn: 0.55 }],
      ['rowboat', 0.9, 0.32, 0.16, -0.2],
    ],
    fx: [['ram', 0, 1], ['arrows', 0, 1, 2.0]],
  },
  ironclad: {
    ribbon: 'Hampton Roads',
    sky: ['#4b585c', '#8b9592', '#cdc6ae'],
    glow: [0.5, 0.05, 0.6, '#ece2c6', 0.3],
    coast: [['hills', 0.16, 1], ['fort', 0.44, 0.85], ['city', 0.7, 0.75], ['hills', 0.92, 0.9]],
    weather: 'fog',
    swell: 0.35,
    glitter: 0.14,
    emblem: 'anchor',
    accent: ['#43484b', '#e0b85c'],
    props: ['wreck'],
    cast: [
      ['hero', 0.3, 0.72, 0.42, -0.1],
      ['frigate', 0.72, 0.52, 0.44, 0.16, { hp: 0.35, burn: 0.6 }],
      ['gunboat', 0.9, 0.32, 0.18, -0.1],
    ],
    fx: [['broadside', 0, 1, 2.6], ['shells', 1, 0, 3.6]],
  },

  // ---------------------------------------------------------- Steel navies
  ww1: {
    ribbon: 'Dogger Bank',
    sky: ['#2c3e52', '#5d7488', '#a7b4ba'],
    glow: [0.24, 0.05, 0.7, '#e4eaec', 0.22],
    coast: [['fleet', 0.16, 1], ['fleet', 0.44, 0.85], ['fleet', 0.74, 1.1], ['hills', 0.94, 0.8]],
    weather: 'storm',
    swell: 0.9,
    glitter: 0.1,
    emblem: 'swords',
    accent: ['#2b4a63', '#dfe0c8'],
    cast: [
      ['hero', 0.24, 0.76, 0.34, -0.12],
      ['kaiserBattleship', 0.7, 0.54, 0.46, 0.1, { hp: 0.7 }],
      ['germTB', 0.9, 0.34, 0.2, -0.16],
    ],
    fx: [['shells', 0, 1, 2.6], ['shells', 1, 0, 3.2], ['torpedo', 2, 0, 5.0]],
    wind: 2.6,
  },
  ww2: {
    ribbon: 'Ironbottom Sound',
    sky: ['#1b70b4', '#62b1dc', '#e2f1f4'],
    glow: [0.82, 0.02, 0.5, '#fff8dc', 0.5],
    coast: [['volcano', 0.2, 1.3], ['palms', 0.46, 0.8], ['fleet', 0.72, 0.9], ['hills', 0.92, 0.85]],
    weather: 'clear',
    swell: 0.55,
    glitter: 0.5,
    emblem: 'wings',
    accent: ['#1b5f8a', '#f0d070'],
    props: ['wreck'],
    cast: [
      ['hero', 0.26, 0.74, 0.36, -0.2],
      ['ijnBattleship', 0.72, 0.52, 0.46, 0.12, { hp: 0.6 }],
      ['ijnDestroyer', 0.9, 0.32, 0.22, -0.24],
    ],
    fx: [['shells', 0, 1, 2.2], ['airRaid', 0, 1, 7.5], ['torpedo', 2, 0, 4.6]],
  },
  hormuz: {
    ribbon: 'The Tanker War',
    sky: ['#78878f', '#b5b8ab', '#ecdcb2'],
    glow: [0.68, 0.04, 0.6, '#ffe2a8', 0.42],
    coast: [['oilrig', 0.18, 1.1], ['city', 0.5, 0.8], ['oilrig', 0.78, 0.85], ['dunes', 0.94, 0.8]],
    weather: 'haze',
    swell: 0.3,
    glitter: 0.3,
    tint: 'rgba(146,142,110,0.12)',
    emblem: 'missile',
    accent: ['#4a5a4e', '#e8b84c'],
    props: ['oilSlick'],
    cast: [
      ['hero', 0.26, 0.74, 0.36, -0.26],
      ['tanker', 0.72, 0.52, 0.42, 0.04, { hp: 0.7, burn: 0.35 }],
      ['usFrigate', 0.9, 0.32, 0.24, -0.1],
    ],
    fx: [['missiles', 0, 1, 4.2], ['shells', 2, 0, 3.4]],
  },

  // --------------------------------------------------------- Heritage seas
  roman: {
    ribbon: 'Mylae',
    sky: ['#2379b4', '#7cc0dd', '#eaf1e2'],
    glow: [0.76, 0.03, 0.5, '#fff4cc', 0.45],
    coast: [['hills', 0.16, 1.1], ['temple', 0.42, 0.9], ['hills', 0.68, 1], ['sails', 0.9, 0.8]],
    weather: 'clear',
    swell: 0.4,
    glitter: 0.45,
    emblem: 'laurel',
    accent: ['#8c1f18', '#e8c65c'],
    cast: [
      ['hero', 0.3, 0.74, 0.4, -0.46],
      ['carthGalley', 0.68, 0.52, 0.4, 0.5, { hp: 0.5 }],
      ['carthTrader', 0.9, 0.3, 0.19, -0.2],
    ],
    fx: [['ram', 0, 1], ['stones', 0, 1, 2.6], ['arrows', 1, 0, 2.2]],
  },
  greek: {
    ribbon: 'Salamis',
    sky: ['#1a82bd', '#6fc4e0', '#edf8f3'],
    glow: [0.7, 0.02, 0.5, '#fffadc', 0.5],
    coast: [['hills', 0.14, 1.2], ['temple', 0.38, 0.95], ['fleet', 0.64, 0.9], ['hills', 0.9, 0.85]],
    weather: 'clear',
    swell: 0.5,
    glitter: 0.5,
    emblem: 'trident',
    accent: ['#1c6a8f', '#e6c860'],
    cast: [
      ['hero', 0.3, 0.74, 0.4, -0.5],
      ['phoenTrireme', 0.68, 0.52, 0.4, 0.56, { hp: 0.45 }],
      ['sidonianRoyal', 0.9, 0.3, 0.22, -0.16],
    ],
    fx: [['ram', 0, 1], ['arrows', 0, 1, 2.0], ['bolts', 1, 0, 2.8]],
  },
  arab: {
    ribbon: 'The Monsoon Run',
    sky: ['#2b8ba6', '#8ed0d4', '#f4e8c6'],
    glow: [0.8, 0.03, 0.6, '#fff0c0', 0.45],
    coast: [['dunes', 0.16, 1.2], ['mosque', 0.46, 0.9], ['palms', 0.72, 0.75], ['dunes', 0.92, 0.9]],
    weather: 'monsoon',
    swell: 0.95,
    glitter: 0.35,
    emblem: 'crescent',
    accent: ['#1f6f6a', '#e8c464'],
    cast: [
      ['hero', 0.3, 0.72, 0.42, -0.36],
      ['warDhow', 0.7, 0.52, 0.42, 0.3, { hp: 0.6 }],
      ['baghlah', 0.9, 0.3, 0.2, -0.2],
    ],
    fx: [['arrows', 0, 1, 2.2], ['greekFire', 1, 0, 3.6]],
    wind: -1.2,
  },
  chinese: {
    ribbon: 'The Treasure Fleet',
    sky: ['#3c8ca6', '#a2d8d0', '#f2ecd0'],
    glow: [0.75, 0.03, 0.55, '#fff2c8', 0.4],
    coast: [['hills', 0.12, 1.3], ['pagoda', 0.38, 0.95], ['hills', 0.62, 1.1], ['city', 0.88, 0.75]],
    weather: 'haze',
    swell: 0.4,
    glitter: 0.35,
    emblem: 'pagoda',
    accent: ['#8c2f1c', '#e8c25a'],
    cast: [
      ['hero', 0.3, 0.74, 0.44, -0.16],
      ['wokouJunk', 0.7, 0.54, 0.44, 0.2, { hp: 0.55, burn: 0.25 }],
      ['grainJunk', 0.9, 0.32, 0.2, -0.1],
    ],
    fx: [['broadside', 0, 1, 2.4], ['arrows', 1, 0, 2.0]],
  },
  japanese: {
    ribbon: 'The Seto Inland Sea',
    sky: ['#4a4a74', '#96839c', '#eec7a4'],
    glow: [0.28, 0.05, 0.6, '#ffcf9a', 0.5],
    coast: [['hills', 0.14, 1.2], ['castle', 0.42, 0.95], ['hills', 0.68, 1.1], ['forest', 0.92, 0.8]],
    weather: 'dusk',
    swell: 0.35,
    glitter: 0.4,
    tint: 'rgba(96,62,116,0.12)',
    emblem: 'chrysanthemum',
    accent: ['#3a2a44', '#e0b45c'],
    cast: [
      ['hero', 0.3, 0.72, 0.42, -0.1],
      ['sekiBune', 0.7, 0.54, 0.42, 0.18, { hp: 0.5 }],
      ['kobaya', 0.9, 0.32, 0.2, -0.2],
    ],
    fx: [['broadside', 0, 1, 2.6], ['arrows', 0, 1, 1.8]],
  },
  maori: {
    ribbon: 'The Musket Wars',
    sky: ['#2b7ba6', '#8ecadc', '#eaf4ea'],
    glow: [0.7, 0.03, 0.5, '#fff4d0', 0.4],
    coast: [['hills', 0.18, 1.3], ['forest', 0.46, 1.1], ['hills', 0.74, 1], ['village', 0.92, 0.7]],
    weather: 'clear',
    swell: 0.6,
    glitter: 0.35,
    emblem: 'koru',
    accent: ['#2f5d3a', '#e2c46a'],
    props: ['reef'],
    cast: [
      ['hero', 0.3, 0.74, 0.4, -0.3],
      ['rivalWaka', 0.7, 0.54, 0.4, 0.36, { hp: 0.55 }],
      ['flaxTrader', 0.9, 0.32, 0.2, -0.16],
    ],
    fx: [['arrows', 0, 1, 1.8], ['broadside', 0, 1, 3.4]],
  },
  hawaii: {
    ribbon: 'The Kona Coast',
    sky: ['#3582b4', '#a8d8dc', '#f8e6c6'],
    glow: [0.2, 0.04, 0.55, '#ffd8a0', 0.5],
    coast: [['volcano', 0.2, 1.4], ['palms', 0.5, 0.9], ['hills', 0.76, 1], ['village', 0.94, 0.7]],
    weather: 'clear',
    swell: 0.65,
    glitter: 0.45,
    emblem: 'hook',
    accent: ['#7a2f1c', '#e8c05c'],
    props: ['reef'],
    cast: [
      ['hero', 0.3, 0.74, 0.4, -0.26],
      ['rivalWaa', 0.7, 0.54, 0.4, 0.32, { hp: 0.6 }],
      ['sandTrader', 0.9, 0.32, 0.2, -0.16],
    ],
    fx: [['arrows', 0, 1, 1.9], ['ram', 0, 1]],
  },
  macedon: {
    ribbon: 'Salamis, Cyprus',
    sky: ['#4a5a86', '#9f93ab', '#f0d2ac'],
    glow: [0.76, 0.04, 0.6, '#ffd8a0', 0.45],
    coast: [['hills', 0.14, 1.2], ['city', 0.42, 0.95], ['temple', 0.66, 0.85], ['hills', 0.9, 1]],
    weather: 'dusk',
    swell: 0.45,
    glitter: 0.4,
    tint: 'rgba(120,80,140,0.10)',
    emblem: 'vergina',
    accent: ['#5a3a7a', '#e8c25a'],
    cast: [
      ['hero', 0.28, 0.74, 0.46, -0.2],
      ['rhodesTrieres', 0.7, 0.54, 0.4, 0.3, { hp: 0.45, burn: 0.3 }],
      ['alexGrain', 0.9, 0.32, 0.2, -0.1],
    ],
    fx: [['stones', 0, 1, 2.4], ['bolts', 0, 1, 1.8], ['ram', 0, 1]],
  },
  maya: {
    ribbon: 'First Contact',
    sky: ['#2389bc', '#8ed8e4', '#f6efd6'],
    glow: [0.78, 0.02, 0.5, '#fff6d8', 0.5],
    coast: [['hills', 0.12, 1], ['ziggurat', 0.34, 1.1], ['palms', 0.58, 0.8], ['hills', 0.86, 0.95]],
    weather: 'clear',
    swell: 0.5,
    glitter: 0.5,
    emblem: 'pyramid',
    accent: ['#2f7a4a', '#e8c85c'],
    props: ['reef'],
    cast: [
      ['hero', 0.32, 0.74, 0.4, -0.3],
      ['conqCaravel', 0.7, 0.52, 0.44, 0.26, { hp: 0.7 }],
      ['cacaoTrader', 0.9, 0.32, 0.18, -0.16],
    ],
    fx: [['arrows', 0, 1, 1.7], ['broadside', 1, 0, 3.2]],
  },
  inca: {
    ribbon: "Túpac's Voyage",
    sky: ['#4a6a80', '#96a9b2', '#e2d3c2'],
    glow: [0.3, 0.05, 0.6, '#f4e2ca', 0.35],
    coast: [['mountains', 0.18, 1.3], ['hills', 0.52, 1], ['dunes', 0.82, 0.9]],
    weather: 'fog',
    swell: 0.7,
    glitter: 0.2,
    tint: 'rgba(120,140,150,0.10)',
    emblem: 'inti',
    accent: ['#5a4a7a', '#e0c060'],
    cast: [
      ['hero', 0.3, 0.74, 0.4, -0.2],
      ['rivalBalsa', 0.7, 0.54, 0.4, 0.26, { hp: 0.6 }],
      ['spondylusTrader', 0.9, 0.32, 0.18, -0.16],
    ],
    fx: [['arrows', 0, 1, 2.0], ['stones', 1, 0, 2.8]],
  },
  lepanto: {
    ribbon: 'The Gulf of Patras',
    sky: ['#2b82b4', '#8ecde0', '#f4ecd2'],
    glow: [0.72, 0.03, 0.55, '#fff4cc', 0.45],
    coast: [['hills', 0.12, 1.2], ['fort', 0.38, 0.9], ['fleet', 0.64, 1], ['hills', 0.9, 1]],
    weather: 'clear',
    swell: 0.5,
    glitter: 0.4,
    emblem: 'cross',
    accent: ['#1f5f8f', '#e8c85c'],
    cast: [
      ['hero', 0.3, 0.74, 0.42, -0.36],
      ['venetianGalley', 0.68, 0.54, 0.42, 0.42, { hp: 0.5 }],
      ['laReal', 0.9, 0.32, 0.26, -0.1],
    ],
    fx: [['broadside', 0, 1, 2.6], ['arrows', 1, 0, 1.9], ['ram', 0, 1]],
  },
  korea: {
    ribbon: 'Myeongnyang Strait',
    sky: ['#3d688a', '#8fb0c0', '#e4dfca'],
    glow: [0.28, 0.04, 0.55, '#f2e2c2', 0.32],
    coast: [['cliffs', 0.16, 1.3], ['castle', 0.44, 0.9], ['cliffs', 0.72, 1.1], ['forest', 0.94, 0.8]],
    weather: 'storm',
    swell: 0.9,
    glitter: 0.15,
    emblem: 'taegeuk',
    accent: ['#2f4f6a', '#dcc06a'],
    props: ['whirl'],
    cast: [
      ['hero', 0.32, 0.72, 0.42, -0.2],
      ['japanFlagship', 0.7, 0.52, 0.46, 0.16, { hp: 0.45, burn: 0.3 }],
      ['sekiBune', 0.9, 0.32, 0.2, -0.16],
    ],
    fx: [['broadside', 0, 1, 2.0], ['broadside', 0, 2, 2.7]],
  },
  byzantium: {
    ribbon: 'The Bosporus',
    sky: ['#1d1220', '#4d2620', '#b45c2a'],
    glow: [0.44, 0.06, 0.85, '#ff9a3a', 0.6],
    coast: [['city', 0.18, 1.2], ['fort', 0.48, 0.95], ['city', 0.78, 0.85]],
    weather: 'night',
    swell: 0.4,
    glitter: 0.15,
    tint: 'rgba(255,116,36,0.15)',
    emblem: 'flame',
    accent: ['#7a1f12', '#f0a83c'],
    props: ['shoreFire', 'wreck'],
    cast: [
      ['hero', 0.28, 0.74, 0.4, -0.3],
      ['umayyadGalley', 0.66, 0.54, 0.42, 0.36, { hp: 0.3, burn: 0.95 }],
      ['shalandi', 0.9, 0.32, 0.2, -0.12, { burn: 0.45 }],
    ],
    fx: [['greekFire', 0, 1, 3.0], ['fireArrows', 0, 2, 2.2]],
  },
  egypt: {
    ribbon: 'The Sea Peoples',
    sky: ['#3c8cae', '#a8d8d8', '#f6ecd0'],
    glow: [0.76, 0.03, 0.55, '#fff4cc', 0.45],
    coast: [['dunes', 0.14, 1.1], ['pyramids', 0.38, 1.05], ['temple', 0.64, 0.9], ['palms', 0.88, 0.75]],
    weather: 'clear',
    swell: 0.35,
    glitter: 0.4,
    emblem: 'ankh',
    accent: ['#8a6a1f', '#e8c85c'],
    cast: [
      ['hero', 0.3, 0.74, 0.4, -0.42],
      ['sherdenGalley', 0.68, 0.54, 0.4, 0.46, { hp: 0.5 }],
      ['sherdenRaider', 0.9, 0.32, 0.2, -0.2],
    ],
    fx: [['arrows', 0, 1, 1.8], ['bolts', 0, 1, 2.6], ['ram', 0, 1]],
  },
  chola: {
    ribbon: 'Across the Bay',
    sky: ['#2b8b9e', '#92d0c8', '#f2ecd0'],
    glow: [0.72, 0.03, 0.55, '#fff2cc', 0.45],
    coast: [['hills', 0.14, 1.2], ['pagoda', 0.4, 0.95], ['palms', 0.66, 0.8], ['hills', 0.9, 1]],
    weather: 'monsoon',
    swell: 0.7,
    glitter: 0.4,
    emblem: 'fish',
    accent: ['#8a3a1f', '#e8c45c'],
    cast: [
      ['hero', 0.3, 0.74, 0.42, -0.26],
      ['srivJong', 0.7, 0.54, 0.44, 0.26, { hp: 0.55 }],
      ['spiceTrader', 0.9, 0.32, 0.18, -0.16],
    ],
    fx: [['bolts', 0, 1, 2.4], ['arrows', 0, 1, 1.8]],
  },
  vietnam: {
    ribbon: 'Bạch Đằng River',
    sky: ['#4d6a72', '#9cab9e', '#e0d3b6'],
    glow: [0.34, 0.05, 0.6, '#f2e2c2', 0.3],
    coast: [['karst', 0.14, 1.4], ['karst', 0.42, 1], ['karst', 0.68, 1.25], ['forest', 0.92, 0.85]],
    weather: 'fog',
    swell: 0.25,
    glitter: 0.2,
    tint: 'rgba(88,110,78,0.12)',
    emblem: 'bamboo',
    accent: ['#3f5a3a', '#dcc06a'],
    props: ['stakes'],
    cast: [
      ['hero', 0.3, 0.74, 0.42, -0.2],
      ['yuanScout', 0.68, 0.54, 0.4, 0.3, { hp: 0.4, burn: 0.5 }],
      ['yuanFlagship', 0.9, 0.32, 0.24, -0.1],
    ],
    fx: [['fireArrows', 0, 1, 2.2], ['arrows', 1, 0, 1.9]],
  },
  aztec: {
    ribbon: 'Lake Texcoco',
    sky: ['#2b8bbc', '#98d8e0', '#f4ecd0'],
    glow: [0.75, 0.03, 0.55, '#fff6d0', 0.45],
    coast: [['ziggurat', 0.2, 1.4], ['city', 0.48, 1.05], ['hills', 0.78, 1.1]],
    weather: 'clear',
    swell: 0.25,
    glitter: 0.4,
    emblem: 'obsidian',
    accent: ['#2f6a4a', '#e8c85c'],
    props: ['stakes'],
    cast: [
      ['hero', 0.32, 0.74, 0.4, -0.3],
      ['spanBrigantine', 0.7, 0.54, 0.42, 0.26, { hp: 0.6, burn: 0.2 }],
      ['tlaxCanoe', 0.9, 0.34, 0.2, -0.2],
    ],
    fx: [['arrows', 0, 1, 1.6], ['broadside', 1, 0, 3.0]],
  },
};

/** An era's own scene — unknown ids fall back to the Caribbean. */
export function sceneFor(id: EraId): EraSceneSpec {
  return ERA_SCENES[id] ?? ERA_SCENES.golden;
}
