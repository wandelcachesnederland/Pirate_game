// Sailing regions — the waters each era is fought in.
//
// A region re-skins the same sea (water, shallows, sand, jungle, palms, peaks)
// for a different look and feel; gameplay is identical everywhere. Tropical
// seas get palm islands; every other sea carries a `terrain` recipe (see
// terrain.ts) that shapes its islands — chalk cliffs and bocage in Biscay,
// heather and skerries in the North Sea, dunes and oases off Arabia. Which waters
// you sail is decided by the era you pick on the start screen (`ERA_REGION`),
// so every age fights in its proper sea — the Caribbean for the pirates, the
// Aegean for Salamis, Lake Texcoco for the fall of Tenochtitlan.

import type { Terrain } from './terrain';
import type { PeopleSpec, RegionId } from './types';

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
  /**
   * What the islands here are made of — coastline, shore, ground cover, trees,
   * summit, buildings and landmarks. Left out, an island is a tropical palm
   * island; every sea outside the tropics has one (see terrain.ts).
   */
  terrain?: Terrain;
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
  /**
   * Who lives in these waters: how often an island is inhabited, how friendly
   * those villages start, how eager they are to fort up, and what they are
   * called. Every sea has its own temper — the Caribbean is thick with villages
   * and grudges, the Kona Coast is quiet and hospitable.
   */
  people: PeopleSpec;
}

/** `#rrggbb` → `rgba(r, g, b, a)`, so a palette only needs its solid colours. */
function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/**
 * The handful of colours that actually give a sea its character. Everything
 * else — the shallow bands, the shading tints, the palm lines — is derived, so
 * adding a new stretch of water is a dozen lines rather than thirty.
 */
interface SeaSpec {
  /** Water base plus the "r,g,b" mottle tints (light, dark). */
  water: [base: string, light: string, dark: string];
  /** Shallow-water colour as a bare "r,g,b" triple: the bands fade over it. */
  shallows: string;
  /** Sand at the waterline, dry sand inland. */
  sand: [wet: string, dry: string];
  /** Dense vegetation, plus the greens scattered over the slopes. */
  foliage: [base: string, greens: string[]];
  /** Rock and summits, dark to bleached. */
  peaks: [string, string, string];
  /** Palm/leaf pair and trunk — the leaf pair colours whatever trees grow. */
  palm: [dark: string, light: string, trunk: string];
  /** The islands' own make-up; tropical palm islands when left out. */
  terrain?: Terrain;
}

function sea(spec: SeaSpec): { water: WaterTheme; islands: IslandTheme } {
  const [base, light, dark] = spec.water;
  const [wetSand, sand] = spec.sand;
  const [foliage, greens] = spec.foliage;
  const [palmDark, palmLight, palmTrunk] = spec.palm;
  return {
    water: { base, light: `${light},`, dark: `${dark},` },
    islands: {
      shallowFar: `rgba(${spec.shallows}, 0.13)`,
      shallowMid: `rgba(${spec.shallows}, 0.18)`,
      shallowNear: `rgba(${spec.shallows}, 0.28)`,
      wetSand,
      sand,
      sandDark: rgba(wetSand, 0.35),
      sandLight: rgba(sand, 0.5),
      jungle: foliage,
      jungleEdge: rgba(foliage, 0.55),
      blobShadow: rgba(foliage, 0.35),
      blobHi: rgba(greens[3] ?? foliage, 0.22),
      greens,
      peaks: spec.peaks,
      palmDark,
      palmLight,
      palmLine: rgba(foliage, 0.65),
      palmShade: 'rgba(0, 20, 12, 0.22)',
      palmTrunk,
      terrain: spec.terrain,
    },
  };
}

/**
 * A people's particulars: how often an island here is inhabited, the
 * friendliness a village rolls, how often one carries a fort, and the names to
 * draw on. See `settlements.ts` for what friendliness buys.
 */
function people(
  inhabited: number,
  friendliness: [number, number],
  fort: number,
  names: string[],
): PeopleSpec {
  return { inhabited, friendliness, fort, names };
}

/** Waters with no peoples of their own get a middling, nameless shore folk. */
const PLAIN_FOLK = people(0.6, [10, 80], 0.12, ['Landfall', 'Saltcove', 'Windward', 'Gull Point']);

function seaRegion(
  id: RegionId,
  name: string,
  subtitle: string,
  blurb: string,
  spec: SeaSpec,
  folk: PeopleSpec = PLAIN_FOLK,
): RegionDef {
  const { water, islands } = sea(spec);
  return { id, name, subtitle, blurb, water, islands, swatch: [water.base, spec.sand[1], spec.foliage[0]], people: folk };
}

// ── the hand-tuned originals ────────────────────────────────────────────────

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

export const MEDITERRANEAN_WATER: WaterTheme = {
  base: '#1e6d9e',
  light: '150,220,242,',
  dark: '8,42,96,',
};

export const MEDITERRANEAN_ISLANDS: IslandTheme = {
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
  terrain: {
    // olive groves and cypress over garrigue, limestone crowns, tiled roofs
    shape: 'round',
    shore: 'sand',
    ground: 'scrub',
    groundColor: '#7f874a',
    trees: [['olive', 0.7], ['cypress', 0.35]],
    peak: 'limestone',
    village: 'terracotta',
    landmarks: ['vineyard', 'watchtower', 'temple'],
    offshore: 'rocks',
    stone: '#c2b89c',
  },
};

export const ARABIAN_WATER: WaterTheme = {
  base: '#1f8a8a',
  light: '165,238,222,',
  dark: '8,58,62,',
};

export const ARABIAN_ISLANDS: IslandTheme = {
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
  terrain: {
    // dunes, a jebel of bare rock, an oasis of date palms, mud-brick towers
    shape: 'round',
    shore: 'sand',
    ground: 'dunes',
    trees: [['date', 0.25]],
    peak: 'jebel',
    village: 'mudbrick',
    landmarks: ['oasis', 'oasis', 'watchtower'],
    offshore: 'rocks',
    stone: '#c9a878',
    pool: '#2f8f86',
  },
};

export const SINGAPORE_WATER: WaterTheme = {
  base: '#146e60',
  light: '140,235,190,',
  dark: '4,52,46,',
};

export const SINGAPORE_ISLANDS: IslandTheme = {
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
};

// ── the charts ──────────────────────────────────────────────────────────────

export const REGIONS: RegionDef[] = [
  {
    id: 'caribbean',
    name: 'The Caribbean',
    subtitle: 'Spanish Main · 1710',
    blurb: 'Turquoise seas, palm islands, Spanish treasure — the classic hunt.',
    water: CARIBBEAN_WATER,
    islands: CARIBBEAN_ISLANDS,
    swatch: ['#1a7394', '#edd7a1', '#2d6a30'],
    people: people(0.72, [0, 95], 0.10, [
      'Tortuga', 'Port Royal', 'Isla de la Vaca', 'Nevis', 'Roatán', 'Petit-Goâve', 'Santa Catalina',
    ]),
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Sea',
    subtitle: 'Tyrrhenian & Levant · Rome and Macedon',
    blurb: 'Deep azure water, pale beaches, olive scrub and limestone peaks.',
    water: MEDITERRANEAN_WATER,
    islands: MEDITERRANEAN_ISLANDS,
    swatch: ['#1e6d9e', '#f0e3c0', '#5a7a3a'],
    people: people(0.8, [0, 80], 0.20, [
      'Salamis', 'Sunion', 'Melos', 'Tarentum', 'Syracuse', 'Delos', 'Cape Malea',
    ]),
  },
  {
    id: 'arabian',
    name: 'Arabian Coast',
    subtitle: 'Monsoon seas · dhows and dates',
    blurb: 'Warm turquoise gulfs, desert-sand islands and date palms.',
    water: ARABIAN_WATER,
    islands: ARABIAN_ISLANDS,
    swatch: ['#1f8a8a', '#f4dfa8', '#6b7a3a'],
    people: people(0.68, [0, 75], 0.18, [
      'Hormuz', 'Masqat', 'Socotra', 'Mirbat', 'Qays', 'Kharg', 'Dhofar',
    ]),
  },
  {
    id: 'singapore',
    name: 'Straits of Malacca',
    subtitle: 'South China Sea · Ming treasure fleets',
    blurb: 'Jade-green straits, dense emerald jungle, volcanic islets.',
    water: SINGAPORE_WATER,
    islands: SINGAPORE_ISLANDS,
    swatch: ['#146e60', '#eed9a0', '#1f5a2a'],
    people: people(0.75, [5, 85], 0.14, [
      'Palembang', 'Srivijaya', 'Tumasik', 'Langkasuka', 'Kedah', 'Bintan', 'Melaka',
    ]),
  },

  // ── Age of Sail beyond the tropics ────────────────────────────────────────
  seaRegion(
    'biscay',
    'Bay of Biscay',
    'Atlantic station · 1805',
    'Cold Atlantic swell, chalk cliffs and grey shingle — the blockade line.',
    {
      water: ['#2b5f7a', '150,205,225', '6,32,52'],
      shallows: '150,205,215',
      sand: ['#b8b39c', '#ddd8bc'],
      foliage: ['#3f6b3a', ['#4a7a42', '#5c8b4a', '#2f5c30', '#6b9a52', '#3f6b3a', '#548045']],
      peaks: ['#b9bcb4', '#d9dcd4', '#f2f4ee'],
      palm: ['#3a6b35', '#5c8b45', '#6b5238'],
      terrain: {
        // chalk cliffs over a hedged patchwork, a light on every headland
        shape: 'craggy',
        shore: 'chalk',
        ground: 'bocage',
        trees: [['oak', 0.55]],
        peak: 'none',
        village: 'stone',
        landmarks: ['lighthouse', 'lighthouse', 'watchtower'],
        offshore: 'stacks',
        stone: '#a9a79c',
      },
    },
    people(0.62, [5, 85], 0.16, ['Brest', 'A Coruña', 'Belle-Île', 'Ouessant', 'Ré', 'Oléron', 'Saint-Malo']),
  ),
  seaRegion('northSea', 'The North Sea', 'Norse waters · 900', 'Cold grey-green water, bare rock and black pine — a viking strand.', {
    water: ['#2a5a62', '140,205,205', '6,30,40'],
    shallows: '130,200,195',
    sand: ['#a8a091', '#cfc7b0'],
    foliage: ['#2b4a2f', ['#31543a', '#3d6642', '#243d28', '#48734a', '#2f5233', '#3a5f3d']],
    peaks: ['#6b7078', '#8a8f94', '#adb2b5'],
    palm: ['#2f5233', '#48734a', '#5a4630'],
    terrain: {
      // fjord-notched rock, heather moor and black pine; skerries offshore
      shape: 'fjord',
      shore: 'rock',
      ground: 'moor',
      groundColor: '#4d5a3b',
      trees: [['pine', 0.8]],
      peak: 'snowcap',
      village: 'longhouse',
      landmarks: ['standingStones'],
      offshore: 'skerries',
      stone: '#8a8f94',
    },
  },
  people(0.66, [0, 78], 0.18, ['Kaupang', 'Hedeby', 'Ribe', 'Birka', 'Jorvik', 'Orkney', 'Nidaros']),
  ),
  seaRegion(
    'chesapeake',
    'Chesapeake Bay',
    'Hampton Roads · 1862',
    'Murky tidal water, low marsh islands and reed flats — iron meets iron.',
    {
      water: ['#3f6a5c', '150,200,175', '10,36,34'],
      shallows: '150,195,160',
      sand: ['#a89a72', '#cabf94'],
      foliage: ['#4a6b32', ['#557a38', '#6b8a42', '#3d5c2b', '#7d9a4a', '#4a6b32', '#5f8040']],
      peaks: ['#7a7560', '#918c74', '#a8a289'],
      palm: ['#3f5f2c', '#5f8040', '#6b5238'],
      terrain: {
        // low mud islands, tidal creeks, reed beds and screwpile lights
        shape: 'low',
        shore: 'mud',
        ground: 'marsh',
        trees: [['reeds', 1.6], ['pine', 0.3]],
        peak: 'none',
        village: 'clapboard',
        landmarks: ['screwpile'],
        offshore: 'stakes',
        pool: '#4f7466',
      },
    },
    people(0.6, [10, 88], 0.1, ['Norfolk', 'Hampton', 'Yorktown', 'Sewell’s Point', 'Craney Island', 'Old Point', 'Willoughby']),
  ),

  // ── Classical and medieval seas ───────────────────────────────────────────
  seaRegion(
    'aegean',
    'The Aegean',
    'Cyclades · Salamis',
    'Sapphire water, bleached rock and dry gold scrub — triremes and white cliffs.',
    {
      water: ['#12629e', '150,225,245', '4,32,90'],
      shallows: '150,225,240',
      sand: ['#d8cba4', '#f2e8cd'],
      foliage: ['#7a7d4a', ['#8a8b52', '#9c9c60', '#6b6b3d', '#a8a86b', '#7a7d4a', '#8f9058']],
      peaks: ['#c9c4b4', '#e2ddd0', '#f7f4ea'],
      palm: ['#6b6b3d', '#8a8b52', '#7a5a30'],
      terrain: {
        // bare white rock, gold scrub, cube villages and a hilltop temple
        shape: 'craggy',
        shore: 'rock',
        ground: 'scrub',
        groundColor: '#b0a266',
        trees: [['olive', 0.3]],
        peak: 'limestone',
        village: 'whitewash',
        landmarks: ['temple', 'temple', 'windmill'],
        offshore: 'rocks',
        stone: '#d8d2c0',
      },
    },
    people(0.8, [0, 85], 0.18, ['Salamis', 'Delos', 'Naxos', 'Aegina', 'Paros', 'Samos', 'Sigeion']),
  ),
  seaRegion(
    'bosporus',
    'The Bosporus',
    'Constantinople · 717',
    'Dark strait water under cypress slopes — the Caliph’s fleet is coming.',
    {
      water: ['#1d5c75', '130,205,215', '4,28,48'],
      shallows: '130,200,205',
      sand: ['#c2b48e', '#e6dcbc'],
      foliage: ['#2f4f2a', ['#35592f', '#436b38', '#26401f', '#527a42', '#2f4f2a', '#3d6134']],
      peaks: ['#7d7a68', '#9c9884', '#bcb8a2'],
      palm: ['#35592f', '#527a42', '#6b5238'],
      terrain: {
        // long strait-side islands under cypress, a domed church, sea walls
        shape: 'long',
        shore: 'sand',
        ground: 'forest',
        trees: [['cypress', 1.3], ['oak', 0.35]],
        peak: 'none',
        village: 'terracotta',
        landmarks: ['church', 'seaWall'],
        offshore: 'rocks',
        stone: '#b8ab8e',
      },
    },
    people(0.82, [0, 75], 0.22, ['Chrysopolis', 'Hieria', 'Chalkedon', 'Sosthenion', 'Damalis', 'Bithynia', 'Galata']),
  ),
  seaRegion(
    'ionian',
    'The Gulf of Patras',
    'Ionian Sea · Lepanto 1571',
    'Blue Ionian water and olive hills — the last great galley battle.',
    {
      water: ['#15588f', '140,215,240', '4,28,72'],
      shallows: '140,215,235',
      sand: ['#cfc09a', '#ece0c2'],
      foliage: ['#5f7340', ['#6b8046', '#7d9252', '#51632f', '#8ba25c', '#5f7340', '#708547']],
      peaks: ['#a09a80', '#bcb69c', '#d6d1b8'],
      palm: ['#4f6334', '#708547', '#6b5238'],
      terrain: {
        // olive terraces climbing to a limestone crown, windmills on the ridge
        shape: 'round',
        shore: 'sand',
        ground: 'terraces',
        trees: [['olive', 1.0], ['cypress', 0.3]],
        peak: 'limestone',
        village: 'terracotta',
        landmarks: ['windmill', 'windmill', 'watchtower'],
        offshore: 'rocks',
        stone: '#c4b89a',
      },
    },
    people(0.74, [0, 80], 0.22, ['Naupaktos', 'Patras', 'Corfu', 'Cephalonia', 'Zante', 'Lepanto', 'Missolonghi']),
  ),
  seaRegion(
    'nileDelta',
    'Nile Delta',
    'Egypt · 1178 BC',
    'Silty green water, papyrus marsh and mud banks — the Sea Peoples raid here.',
    {
      water: ['#2f7a6e', '160,220,190', '8,44,42'],
      shallows: '150,215,175',
      sand: ['#b8a878', '#ded0a0'],
      foliage: ['#4f7a34', ['#5c8a3c', '#6f9a46', '#3f6b2b', '#82a852', '#54803a', '#628c40']],
      peaks: ['#a89a70', '#c2b48a', '#d8cca2'],
      palm: ['#3f6b2b', '#628c40', '#8a6a3a'],
      terrain: {
        // flat mud banks, irrigated fields, papyrus, date palms, obelisks
        shape: 'low',
        shore: 'mud',
        ground: 'fields',
        trees: [['date', 0.55], ['papyrus', 1.0]],
        peak: 'none',
        village: 'mudbrick',
        landmarks: ['obelisk'],
        offshore: 'reeds',
        pool: '#3f8478',
        stone: '#cdb88a',
      },
    },
    people(0.85, [0, 70], 0.18, ['Per-Amun', 'Sais', 'Buto', 'Kanopus', 'Tamiathis', 'Rosetta', 'Mendes']),
  ),

  // ── Indian Ocean and the East ─────────────────────────────────────────────
  seaRegion(
    'bengal',
    'Bay of Bengal',
    'Chola seas · 1025',
    'Warm teal water and coconut islands — the Tiger sails for Srivijaya.',
    {
      water: ['#1c7a72', '160,235,215', '6,44,44'],
      shallows: '150,230,200',
      sand: ['#cbb98a', '#f0e4bb'],
      foliage: ['#2f6b2c', ['#357a33', '#468c3c', '#265a24', '#5aa04a', '#2f6b2c', '#3d8237']],
      peaks: ['#6b7a4a', '#8a9a5f', '#aab87a'],
      palm: ['#2f6b2c', '#5aa04a', '#7a5530'],
    },
    people(0.78, [5, 85], 0.14, ['Kadaram', 'Nagapattinam', 'Srivijaya', 'Maldives', 'Palk Strait', 'Thanjavur', 'Kaveri']),
  ),
  seaRegion('tonkin', 'Gulf of Tonkin', 'Bạch Đằng · 1288', 'Jade water under limestone towers — the stakes wait at low tide.', {
    water: ['#1c6b62', '150,230,200', '4,38,40'],
    shallows: '150,230,195',
    sand: ['#c6b585', '#e8dcb0'],
    foliage: ['#2b6330', ['#316b34', '#3d7a3c', '#1f4d24', '#4a8a46', '#2b6330', '#367038']],
    peaks: ['#5c6b5a', '#7d8a74', '#a2ab96'],
    palm: ['#2b6330', '#4a8a46', '#6b5238'],
  },
  people(0.74, [0, 78], 0.16, ['Vân Đồn', 'Bạch Đằng', 'Hải Phòng', 'Cát Bà', 'Vạn Ninh', 'Đồ Sơn', 'Cửa Ông']),
  ),
  seaRegion(
    'inlandSea',
    'The Inland Sea',
    'Seto Naikai · 1575',
    'Soft grey-blue water, pine-clad stone islets — the Mōri hold the strait.',
    {
      water: ['#256b84', '150,215,225', '6,34,50'],
      shallows: '150,210,215',
      sand: ['#c0b393', '#e2d8ba'],
      foliage: ['#2b5230', ['#315c34', '#3d6b3d', '#22411f', '#487a46', '#2b5230', '#355f36']],
      peaks: ['#787c74', '#969a90', '#b4b8ae'],
      palm: ['#2b5230', '#487a46', '#6b5238'],
      terrain: {
        // steep stone islets, terraced slopes under crooked black pine, a torii in the water
        shape: 'cone',
        shore: 'sand',
        ground: 'terraces',
        trees: [['blackPine', 0.9]],
        peak: 'granite',
        village: 'japanese',
        landmarks: ['torii'],
        offshore: 'rocks',
        stone: '#a4a49c',
      },
    },
    people(0.78, [0, 75], 0.18, ['Miyajima', 'Itsukushima', 'Innosima', 'Shiwaku', 'Naoshima', 'Awaji', 'Tomogashima']),
  ),
  seaRegion(
    'koreaStrait',
    'Korea Strait',
    'Myeongnyang · 1597',
    'Turbid tidal water, rocky pine islands and racing currents.',
    {
      water: ['#3f7a7a', '165,215,205', '8,42,48'],
      shallows: '160,215,195',
      sand: ['#bdb182', '#ded4a8'],
      foliage: ['#356032', ['#3c6b38', '#4a7a40', '#2a4d28', '#578a4a', '#356032', '#41703a']],
      peaks: ['#7a7a70', '#98988c', '#b6b6a8'],
      palm: ['#356032', '#578a4a', '#6b5238'],
      terrain: {
        // ragged rock and pine over wide tidal flats, a beacon on the hill
        shape: 'craggy',
        shore: 'rock',
        ground: 'grass',
        trees: [['pine', 0.75]],
        peak: 'granite',
        village: 'hanok',
        landmarks: ['beacon'],
        offshore: 'flats',
        stone: '#9c9a8e',
      },
    },
    people(0.72, [0, 70], 0.18, ['Hansan', 'Jindo', 'Uldolmok', 'Noryang', 'Yeosu', 'Kojedo', 'Myeongnyang']),
  ),

  // ── Polynesia and the Americas ────────────────────────────────────────────
  seaRegion(
    'bayOfIslands',
    'Bay of Islands',
    'Aotearoa · 1820',
    'Deep ocean blue, green volcanic hills and white shell sand — waka taua waters.',
    {
      water: ['#1a6f8f', '140,230,230', '4,38,68'],
      shallows: '140,230,220',
      sand: ['#d8cda6', '#f4ecd2'],
      foliage: ['#2f6b3a', ['#357a40', '#468c4a', '#265a2f', '#5aa055', '#2f6b3a', '#3d8244']],
      peaks: ['#4a5a52', '#6b7a6f', '#96a49a'],
      palm: ['#2f6b3a', '#5aa055', '#7a5530'],
      terrain: {
        // green volcanic cones crowned by a pā, pōhutukawa along the beach
        shape: 'cone',
        shore: 'sand',
        ground: 'grass',
        trees: [['pohutukawa', 0.55], ['fern', 0.6]],
        peak: 'volcano',
        village: 'whare',
        landmarks: ['pa'],
        offshore: 'rocks',
      },
    },
    people(0.58, [30, 95], 0.05, ['Kororāreka', 'Waitangi', 'Kerikeri', 'Paihia', 'Moturoa', 'Urupukapuka', 'Rangihoua']),
  ),
  seaRegion(
    'konaCoast',
    'The Kona Coast',
    'Hawaiʻi · 1795',
    'Indigo Pacific, black lava shore and gold grass — Kamehameha’s fleet sails here.',
    {
      water: ['#175a94', '140,215,245', '2,26,72'],
      shallows: '140,215,240',
      sand: ['#c2ab7c', '#e8d8a8'],
      foliage: ['#7d7a3f', ['#8a8747', '#9c9852', '#6b6832', '#a8a560', '#7d7a3f', '#8f8c4a']],
      peaks: ['#4a4038', '#6b5c50', '#8a7a68'],
      palm: ['#6b6832', '#a8a560', '#6b4a28'],
    },
    people(0.6, [30, 95], 0.05, ['Kailua', 'Kealakekua', 'Honaunau', 'Kaʻūpūlehu', 'Kohala', 'Waimea', 'Miloliʻi']),
  ),
  seaRegion(
    'peruvianCoast',
    'The Peruvian Coast',
    'Gulf of Guayaquil · 1465',
    'Cold green Pacific, arid brown islands and guano-white cliffs — balsa country.',
    {
      water: ['#2f6d78', '150,205,205', '8,34,44'],
      shallows: '150,205,200',
      sand: ['#c2ae86', '#ddd0a8'],
      foliage: ['#6b6b3a', ['#7a7a44', '#8a8a50', '#5c5c30', '#9a9a5c', '#6b6b3a', '#767644']],
      peaks: ['#8a7a62', '#a89a80', '#cdbfa4'],
      palm: ['#5c5c30', '#8a8a50', '#7a5530'],
      terrain: {
        // bare desert rock, guano-white shores, sea lions and an adobe huaca
        shape: 'craggy',
        shore: 'guano',
        ground: 'barren',
        groundColor: '#a58c68',
        trees: [['cactus', 0.35]],
        peak: 'jebel',
        village: 'adobe',
        landmarks: ['huaca'],
        offshore: 'sealions',
        stone: '#b8a07a',
      },
    },
    people(0.55, [20, 92], 0.07, ['Tumbes', 'Puná', 'Santa Clara', 'Chanduy', 'Jambelí', 'Salango', 'Manta']),
  ),
  seaRegion(
    'texcoco',
    'Lake Texcoco',
    'Tenochtitlan · 1521',
    'Shallow lake water, reed beds, maize gardens and causeways — canoe warfare.',
    {
      water: ['#3f7a70', '170,220,190', '10,44,44'],
      shallows: '170,220,185',
      sand: ['#b0a074', '#d8c898'],
      foliage: ['#4a7a2c', ['#547f34', '#638f3c', '#3a6323', '#729e46', '#4a7a2c', '#5c8a36']],
      peaks: ['#8a8470', '#a89e88', '#c6bca4'],
      palm: ['#3a6323', '#729e46', '#8a6a3a'],
      terrain: {
        // chinampa gardens between canals, reed shores, the great pyramid
        shape: 'low',
        shore: 'reed',
        ground: 'chinampas',
        trees: [],
        peak: 'none',
        village: 'stucco',
        landmarks: ['pyramid', 'pyramid', 'causeway'],
        offshore: 'reeds',
        pool: '#4f8a7c',
        stone: '#c9c0aa',
      },
    },
    people(0.92, [0, 60], 0.24, ['Tenochtitlan', 'Tlatelolco', 'Xochimilco', 'Tacuba', 'Chapultepec', 'Iztapalapa', 'Coyoacan']),
  ),

  // ── the steel navies and the Barbary shore ────────────────────────────────
  seaRegion(
    'doggerBank',
    'The Dogger Bank',
    'North Sea · 1916',
    'Cold grey-green water under murk — battle cruisers and U-boats hunt here.',
    {
      water: ['#2f5560', '135,195,200', '5,26,36'],
      shallows: '130,190,185',
      sand: ['#9a948a', '#c2bbae'],
      foliage: ['#3a5238', ['#41603e', '#4d6d46', '#2f452d', '#587a50', '#3a5238', '#476641']],
      peaks: ['#70747a', '#8e9298', '#b0b4b8'],
      palm: ['#3a5238', '#587a50', '#5a4630'],
      terrain: {
        // low English coasts: shingle banks, moor and pine, a light on the headland
        shape: 'low',
        shore: 'shingle',
        ground: 'moor',
        groundColor: '#4c5a3c',
        trees: [['pine', 0.7]],
        peak: 'none',
        village: 'clapboard',
        landmarks: ['lighthouse', 'lighthouse', 'watchtower'],
        offshore: 'stacks',
        stone: '#8e9298',
      },
    },
    people(0.62, [0, 75], 0.16, ['Scarborough', 'Whitby', 'Yarmouth', 'Lowestoft', 'Harwich', 'Helgoland', 'Tynemouth']),
  ),
  seaRegion(
    'coralSea',
    'The Solomons',
    'Iron Bottom Sound · 1943',
    'Deep Pacific blue, green volcanic islands and reef shallows — the Slot.',
    {
      water: ['#10648f', '130,215,235', '2,28,70'],
      shallows: '130,215,225',
      sand: ['#d2c49c', '#eee2c0'],
      foliage: ['#2a6434', ['#31703b', '#3d8148', '#225229', '#4a9452', '#2a6434', '#367a3d']],
      peaks: ['#4a5a4c', '#6b7a6d', '#94a194'],
      palm: ['#2a6434', '#4a9452', '#7a5530'],
    },
    people(0.5, [20, 90], 0.08, ['Guadalcanal', 'Tulagi', 'Savo', 'Rendova', 'Munda', 'Lunga', 'Koli Point']),
  ),
  seaRegion(
    'hormuz',
    'Strait of Hormuz',
    'The Tanker War · 1988',
    'Hot green water, barren jebels and oil smut on the wind — tanker alley.',
    {
      water: ['#1e7a72', '155,230,205', '5,44,44'],
      shallows: '145,225,190',
      sand: ['#c8b07c', '#e8d8a6'],
      foliage: ['#6b7a3a', ['#788745', '#8a9950', '#586532', '#9aa860', '#6b7a3a', '#7f8e4a']],
      peaks: ['#a07048', '#bb8d5e', '#d5ab84'],
      palm: ['#586532', '#9aa860', '#6b4a28'],
      terrain: {
        // bare salt flats and jebels, a date-palm oasis, a mud-brick tower
        shape: 'round',
        shore: 'sand',
        ground: 'dunes',
        trees: [['date', 0.22]],
        peak: 'jebel',
        village: 'mudbrick',
        landmarks: ['oasis', 'watchtower', 'watchtower'],
        offshore: 'rocks',
        stone: '#c2a276',
        pool: '#2f8f86',
      },
    },
    people(0.68, [5, 80], 0.14, ['Bandar Abbas', 'Qeshm', 'Larak', 'Hengam', 'Khasab', 'Jask', 'Sirri']),
  ),
  seaRegion(
    'barbary',
    'The Barbary Coast',
    'Tripoli · 1801',
    'Bleached blue water, palm coves and white villages under a desert sky.',
    {
      water: ['#1a6d96', '150,220,240', '4,30,78'],
      shallows: '150,220,232',
      sand: ['#d8c498', '#f2e4c2'],
      foliage: ['#6b7d3c', ['#79894a', '#8a9a54', '#5a6a33', '#9caa60', '#6b7d3c', '#80924a']],
      peaks: ['#a89870', '#c4b48e', '#ded0ac'],
      palm: ['#5a6a33', '#9caa60', '#7a5530'],
      terrain: {
        // palm coves under a dry jebel, whitewashed cubes, a crumbling kasbah
        shape: 'round',
        shore: 'sand',
        ground: 'dunes',
        trees: [['date', 0.45]],
        peak: 'jebel',
        village: 'whitewash',
        landmarks: ['watchtower', 'oasis', 'oasis'],
        offshore: 'rocks',
        stone: '#cbb894',
        pool: '#3f8f86',
      },
    },
    people(0.7, [0, 70], 0.18, ['Tripoli', 'Derna', 'Benghazi', 'Susa', 'Misrata', 'Zuwarah', 'Jerba']),
  ),
];

export const DEFAULT_REGION: RegionId = 'caribbean';

export function regionById(id: RegionId): RegionDef {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}
