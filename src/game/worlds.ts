// Sailing regions — the waters the game can be played in.
//
// The Caribbean is the original chart; every other region re-skins the same
// seas (water, shallows, sand, jungle, palms, peaks) for a different look and
// feel. Gameplay is identical everywhere — only the scenery changes.

import type { RegionId } from './types';

/** Water tints. `light`/`dark` are "r,g,b," prefixes for the mottling tile. */
export interface WaterTheme {
  base: string;
  light: string;
  dark: string;
}

/** Island palette, painted by `buildIsland`. */
export interface IslandTheme {
  shallowFar: string;
  shallowMid: string;
  shallowNear: string;
  wetSand: string;
  sand: string;
  sandDark: string;
  sandLight: string;
  jungle: string;
  jungleEdge: string;
  blobShadow: string;
  blobHi: string;
  greens: string[];
  peaks: [string, string, string];
  palmDark: string;
  palmLight: string;
  palmLine: string;
  palmShade: string;
  palmTrunk: string;
}

export interface RegionDef {
  id: RegionId;
  name: string;
  subtitle: string;
  blurb: string;
  water: WaterTheme;
  islands: IslandTheme;
  /** Sea / sand / jungle swatches for the picker. */
  swatch: [string, string, string];
}

export const CARIBBEAN_WATER: WaterTheme = {
  base: '#1a7394',
  light: '120,225,235,',
  dark: '4,38,78,',
};

export const CARIBBEAN_ISLANDS: IslandTheme = {
  shallowFar: 'rgba(110, 215, 210, 0.13)',
  shallowMid: 'rgba(125, 226, 214, 0.18)',
  shallowNear: 'rgba(155, 238, 222, 0.28)',
  wetSand: '#c9ad74',
  sand: '#edd7a1',
  sandDark: 'rgba(190,160,100,0.35)',
  sandLight: 'rgba(255,248,220,0.5)',
  jungle: '#2d6a30',
  jungleEdge: 'rgba(20,60,25,0.55)',
  blobShadow: 'rgba(10,40,12,0.35)',
  blobHi: 'rgba(160,220,110,0.22)',
  greens: ['#3c8a3b', '#4e9d45', '#2b5f2c', '#5aae4e', '#347a36', '#468f3f'],
  peaks: ['#6a7d43', '#8b8764', '#b8b192'],
  palmDark: '#3f8f3a',
  palmLight: '#58ab48',
  palmLine: 'rgba(28,70,24,0.65)',
  palmShade: 'rgba(0,30,0,0.22)',
  palmTrunk: '#7a5530',
};

export const REGIONS: RegionDef[] = [
  {
    id: 'caribbean',
    name: 'The Caribbean',
    subtitle: 'Spanish Main · 1710',
    blurb: 'Turquoise seas, palm islands, Spanish treasure — the classic hunt.',
    water: CARIBBEAN_WATER,
    islands: CARIBBEAN_ISLANDS,
    swatch: ['#1a7394', '#edd7a1', '#2d6a30'],
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Sea',
    subtitle: 'Middellandse Zee · azure & olive',
    blurb: 'Deep azure water, pale beaches, olive scrub and limestone peaks.',
    water: {
      base: '#1e6d9e',
      light: '150,220,242,',
      dark: '8,42,96,',
    },
    islands: {
      shallowFar: 'rgba(140, 205, 235, 0.13)',
      shallowMid: 'rgba(160, 220, 240, 0.18)',
      shallowNear: 'rgba(190, 235, 245, 0.28)',
      wetSand: '#cbb489',
      sand: '#f0e3c0',
      sandDark: 'rgba(180,155,110,0.35)',
      sandLight: 'rgba(255,252,235,0.5)',
      jungle: '#5a7a3a',
      jungleEdge: 'rgba(60,70,30,0.55)',
      blobShadow: 'rgba(45,50,20,0.35)',
      blobHi: 'rgba(210,225,140,0.22)',
      greens: ['#6b8f3f', '#7fa04c', '#556f33', '#8aa653', '#617f36', '#749245'],
      peaks: ['#8a8a6a', '#a8a488', '#c8c4a0'],
      palmDark: '#4a7a3f',
      palmLight: '#6f9a52',
      palmLine: 'rgba(50,70,30,0.65)',
      palmShade: 'rgba(30,30,5,0.22)',
      palmTrunk: '#7a5a30',
    },
    swatch: ['#1e6d9e', '#f0e3c0', '#5a7a3a'],
  },
  {
    id: 'arabian',
    name: 'Arabian Coast',
    subtitle: 'Middle East · desert shores',
    blurb: 'Warm turquoise gulfs, desert-sand islands and date palms.',
    water: {
      base: '#1f8a8a',
      light: '165,238,222,',
      dark: '8,58,62,',
    },
    islands: {
      shallowFar: 'rgba(130, 225, 205, 0.13)',
      shallowMid: 'rgba(150, 235, 215, 0.18)',
      shallowNear: 'rgba(175, 245, 225, 0.28)',
      wetSand: '#d4b87e',
      sand: '#f4dfa8',
      sandDark: 'rgba(200,165,100,0.35)',
      sandLight: 'rgba(255,250,225,0.5)',
      jungle: '#6b7a3a',
      jungleEdge: 'rgba(70,65,25,0.55)',
      blobShadow: 'rgba(60,50,15,0.35)',
      blobHi: 'rgba(225,225,150,0.22)',
      greens: ['#7d8f43', '#8f9d52', '#5d6b32', '#a3ad60', '#6f7f3a', '#86944b'],
      peaks: ['#a87d4a', '#c09a5e', '#dcc090'],
      palmDark: '#3f7a30',
      palmLight: '#55a040',
      palmLine: 'rgba(30,65,20,0.65)',
      palmShade: 'rgba(35,25,0,0.22)',
      palmTrunk: '#6b4a28',
    },
    swatch: ['#1f8a8a', '#f4dfa8', '#6b7a3a'],
  },
  {
    id: 'singapore',
    name: 'Straits of Singapore',
    subtitle: 'South China Sea · emerald jungle',
    blurb: 'Jade-green straits, dense emerald jungle, volcanic islets.',
    water: {
      base: '#146e60',
      light: '140,235,190,',
      dark: '4,52,46,',
    },
    islands: {
      shallowFar: 'rgba(110, 215, 175, 0.13)',
      shallowMid: 'rgba(130, 228, 190, 0.18)',
      shallowNear: 'rgba(160, 240, 205, 0.28)',
      wetSand: '#c4ab72',
      sand: '#eed9a0',
      sandDark: 'rgba(185,155,95,0.35)',
      sandLight: 'rgba(255,248,220,0.5)',
      jungle: '#1f5a2a',
      jungleEdge: 'rgba(12,50,22,0.55)',
      blobShadow: 'rgba(6,35,10,0.35)',
      blobHi: 'rgba(150,220,130,0.22)',
      greens: ['#2a7a33', '#3f9440', '#1d4f24', '#55a84c', '#2f6f31', '#3d8540'],
      peaks: ['#4a6b3a', '#6b6b52', '#9a9a7a'],
      palmDark: '#2f7a2e',
      palmLight: '#4fae45',
      palmLine: 'rgba(20,60,20,0.65)',
      palmShade: 'rgba(0,25,5,0.22)',
      palmTrunk: '#6b4a28',
    },
    swatch: ['#146e60', '#eed9a0', '#1f5a2a'],
  },
];

export const DEFAULT_REGION: RegionId = 'caribbean';

export function regionById(id: RegionId): RegionDef {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}
