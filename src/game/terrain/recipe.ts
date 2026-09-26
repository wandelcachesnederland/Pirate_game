// Terrain recipe types and the coastline harmonics — the only part of the
// terrain that touches gameplay (collisions read `islandRadiusAt`).

import { TAU } from '../math';

// ── recipe ────────────────────────────────────────────────────────────────

/** Coastline character. */
export type TerrainShape =
  /** Rounded, like the tropical islands. */
  | 'round'
  /** Ragged headlands and coves. */
  | 'craggy'
  /** Deeply notched: narrow inlets between rocky arms. */
  | 'fjord'
  /** Long, low and wriggly — marsh and mud islands. */
  | 'low'
  /** Drawn out along one axis, like the banks of a strait. */
  | 'long'
  /** Near-circular: a volcanic cone or a steep stone islet. */
  | 'cone';

/** What the waterline is made of. */
export type TerrainShore = 'sand' | 'shingle' | 'chalk' | 'mud' | 'rock' | 'reed' | 'guano';

/** What covers the island inside the shore. */
export type TerrainGround =
  | 'scrub'
  | 'moor'
  | 'marsh'
  | 'dunes'
  | 'bocage'
  | 'forest'
  | 'fields'
  | 'chinampas'
  | 'barren'
  | 'terraces'
  | 'grass';

export type TerrainTree =
  | 'pine'
  | 'cypress'
  | 'olive'
  | 'date'
  | 'oak'
  | 'blackPine'
  | 'pohutukawa'
  | 'fern'
  | 'cactus'
  | 'willow'
  | 'reeds'
  | 'papyrus'
  /** Socotra's dragon's blood tree: a dense umbrella on bare branches. */
  | 'dragonsBlood';

export type TerrainPeak = 'none' | 'limestone' | 'granite' | 'snowcap' | 'volcano' | 'jebel';

/** How the locals build. */
export type TerrainVillage =
  | 'stone'
  | 'longhouse'
  | 'clapboard'
  | 'terracotta'
  | 'whitewash'
  | 'mudbrick'
  | 'japanese'
  | 'hanok'
  | 'whare'
  | 'adobe'
  | 'stucco';

/** The thing a sailor knows these waters by. */
export type TerrainLandmark =
  | 'lighthouse'
  | 'screwpile'
  | 'standingStones'
  | 'temple'
  | 'church'
  | 'windmill'
  | 'obelisk'
  | 'oasis'
  | 'torii'
  | 'beacon'
  | 'pa'
  | 'huaca'
  | 'pyramid'
  | 'vineyard'
  | 'watchtower'
  | 'causeway'
  | 'seaWall';

/** What litters the shallows. */
export type TerrainOffshore = 'rocks' | 'skerries' | 'stacks' | 'stakes' | 'reeds' | 'sealions' | 'flats';

export interface Terrain {
  shape: TerrainShape;
  shore: TerrainShore;
  ground: TerrainGround;
  /** Base colour of the ground; defaults to the theme's foliage colour. */
  groundColor?: string;
  /** Trees and how thickly they grow (1 ≈ a well-wooded island). */
  trees: [TerrainTree, number][];
  peak: TerrainPeak;
  village: TerrainVillage;
  /** One is picked per island (big islands may get two); repeat to weight. */
  landmarks: TerrainLandmark[];
  offshore: TerrainOffshore;
  /** Masonry: quays, towers, walls. */
  stone?: string;
  /** Standing water on the island — pools, canals, creeks. */
  pool?: string;
}

// ── geometry ──────────────────────────────────────────────────────────────

export interface Harmonic {
  amp: number;
  freq: number;
  phase: number;
}

export function islandRadiusAt(is: { r: number; harm: Harmonic[] }, a: number) {
  let k = 1;
  for (let i = 0; i < is.harm.length; i++) {
    const h = is.harm[i];
    k += h.amp * Math.sin(h.freq * a + h.phase);
  }
  return is.r * k;
}

/** The coastline for a terrain shape. Amplitudes always sum well under 1. */
export function terrainHarmonics(shape: TerrainShape, rnd: () => number): Harmonic[] {
  const h = (amp: number, freq: number): Harmonic => ({ amp, freq, phase: rnd() * TAU });
  switch (shape) {
    case 'craggy':
      return [
        h(0.08 + rnd() * 0.07, 2),
        h(0.05 + rnd() * 0.05, 3),
        h(0.03 + rnd() * 0.03, 5),
        h(0.035 + rnd() * 0.02, 8),
        h(0.02 + rnd() * 0.015, 13),
        h(0.01 + rnd() * 0.008, 21),
      ];
    case 'fjord':
      return [
        h(0.07 + rnd() * 0.06, 2),
        h(0.04 + rnd() * 0.04, 3),
        h(0.06 + rnd() * 0.03, 7),
        h(0.035 + rnd() * 0.02, 12),
        h(0.018 + rnd() * 0.01, 19),
      ];
    case 'low':
      return [
        h(0.22 + rnd() * 0.08, 2),
        h(0.06 + rnd() * 0.05, 3),
        h(0.04 + rnd() * 0.02, 6),
        h(0.025 + rnd() * 0.015, 11),
      ];
    case 'long':
      return [
        h(0.28 + rnd() * 0.07, 2),
        h(0.04 + rnd() * 0.03, 4),
        h(0.025 + rnd() * 0.02, 5),
        h(0.012 + rnd() * 0.01, 9),
      ];
    case 'cone':
      return [
        h(0.04 + rnd() * 0.04, 2),
        h(0.03 + rnd() * 0.03, 3),
        h(0.02 + rnd() * 0.02, 5),
        h(0.012 + rnd() * 0.01, 9),
      ];
    default:
      return [
        h(0.09 + rnd() * 0.08, 2),
        h(0.05 + rnd() * 0.06, 3),
        h(0.03 + rnd() * 0.03, 5),
        h(0.012 + rnd() * 0.015, 9),
      ];
  }
}
