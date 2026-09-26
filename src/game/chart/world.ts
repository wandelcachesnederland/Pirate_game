// World geography shared by every mode that sails the chart — Trade and
// Adventure both plot their voyages on this one map, so a coastline learned in
// one mode is the same coastline in the other.
//
// A single, self-contained equirectangular projection maps longitude/latitude
// onto a flat "world" coordinate space. Continents are composed from simple
// hand-drawn land blocks (in lon/lat); overlaps are fine — they read as one
// coastline. `isLand` lets ships bump off the coasts instead of sailing through
// them, so the oceans actually route the trade.

export const LON_MIN = -180;
export const LON_MAX = 180;
export const LAT_TOP = 80;
export const LAT_BOTTOM = -58;

export const WORLD_W = 2048;
/** Uniform px-per-degree on both axes (no distortion of the coastline). */
export const DEG = WORLD_W / (LON_MAX - LON_MIN);
export const WORLD_H = (LAT_TOP - LAT_BOTTOM) * DEG;

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON_MIN) * DEG, (LAT_TOP - lat) * DEG];
}

/** Each block is a closed ring of [lon, lat] points. */
type Block = [number, number][];

// Rough, recognisable silhouettes — not survey charts.
const LAND_LONLAT: Block[] = [
  // ── North America
  [
    [-168, 65], [-156, 71], [-128, 70], [-100, 72], [-82, 73], [-78, 68], [-72, 62],
    [-66, 60], [-60, 54], [-56, 51], [-66, 49], [-70, 47], [-74, 45], [-76, 43],
    [-76, 40], [-81, 37], [-76, 35], [-81, 31], [-80, 25], [-82, 28], [-84, 30],
    [-90, 29], [-94, 29], [-97, 28], [-97, 22], [-105, 20], [-106, 23], [-110, 24],
    [-113, 30], [-117, 32], [-122, 37], [-124, 42], [-124, 48], [-128, 51],
    [-135, 57], [-145, 60], [-155, 59], [-162, 58], [-168, 65],
  ],
  // Central America tail
  [
    [-92, 18], [-88, 16], [-83, 9], [-78, 8], [-77, 9], [-82, 15], [-87, 18], [-92, 18],
  ],
  // Greenland
  [
    [-45, 60], [-30, 60], [-20, 70], [-25, 78], [-40, 83], [-58, 80], [-55, 70], [-50, 62], [-45, 60],
  ],
  // Cuba / Hispaniola / Jamaica
  [
    [-84, 22], [-80, 23], [-74, 20], [-78, 21], [-84, 22],
  ],
  [
    [-72, 19], [-68, 19], [-68, 18], [-72, 18], [-72, 19],
  ],

  // ── South America
  [
    [-78, 8], [-72, 11], [-62, 10], [-50, 0], [-44, -2], [-35, -6], [-39, -13], [-48, -25],
    [-54, -34], [-58, -39], [-65, -45], [-69, -52], [-74, -50], [-73, -43], [-71, -33],
    [-70, -23], [-71, -18], [-76, -14], [-81, -6], [-80, 2], [-78, 8],
  ],

  // ── Africa
  [
    [-17, 21], [-16, 28], [-9, 33], [0, 36], [10, 37], [20, 33], [25, 32], [32, 31],
    [35, 28], [43, 12], [51, 12], [44, 2], [41, -5], [40, -11], [35, -22],
    [27, -34], [20, -35], [15, -28], [12, -17], [9, -2], [5, 4], [-4, 5], [-12, 8], [-17, 15], [-17, 21],
  ],
  // Madagascar
  [
    [43, -12], [50, -15], [47, -25], [44, -22], [43, -16], [43, -12],
  ],

  // ── Europe (several blobs)
  [
    [-10, 37], [-9, 44], [-2, 44], [-1, 49], [-5, 48], [0, 51], [4, 51], [7, 54], [8, 57],
    [11, 58], [6, 62], [12, 65], [18, 69], [24, 71], [30, 70], [40, 66], [48, 60],
    [55, 58], [50, 52], [45, 47], [40, 46], [33, 46], [28, 45], [23, 42], [19, 42],
    [16, 43], [13, 45], [12, 44], [8, 44], [3, 43], [-2, 36], [-9, 37],
  ],
  [
    [5, 58], [8, 63], [12, 68], [18, 69], [24, 71], [28, 70], [24, 65], [20, 60], [16, 58], [12, 55], [8, 54], [5, 58],
  ],
  [
    [-9, 37], [-9, 43], [-2, 43], [-1, 36], [-6, 36], [-9, 37],
  ],
  [
    [7, 44], [12, 46], [14, 42], [18, 40], [16, 38], [12, 38], [10, 44], [7, 44],
  ],
  [
    [19, 42], [23, 41], [24, 38], [27, 37], [28, 41], [24, 43], [19, 42],
  ],
  // British Isles
  [
    [-5, 50], [-3, 53], [-5, 57], [-2, 58], [1, 52], [2, 51], [-2, 50], [-5, 50],
  ],
  [
    [-10, 52], [-6, 55], [-10, 57], [-12, 54], [-10, 52],
  ],
  // Iceland
  [
    [-24, 64], [-18, 66], [-14, 65], [-20, 63], [-24, 64],
  ],

  // ── Asia (big blobs)
  [
    [40, 46], [50, 47], [55, 52], [60, 52], [68, 55], [75, 55], [80, 52], [88, 50],
    [95, 53], [105, 52], [115, 52], [125, 53], [130, 48], [135, 44], [130, 42],
    [122, 40], [122, 30], [121, 23], [110, 21], [108, 15], [105, 10], [100, 8],
    [98, 9], [100, 14], [103, 1], [104, -2], [96, 4], [92, 20], [88, 21], [80, 15],
    [77, 8], [73, 16], [70, 21], [66, 25], [60, 25], [57, 25], [52, 28], [48, 30],
    [44, 37], [40, 42], [40, 46],
  ],
  // India
  [
    [70, 21], [73, 16], [77, 8], [80, 13], [82, 17], [88, 21], [83, 25], [78, 28], [72, 24], [70, 21],
  ],
  // Arabia
  [
    [35, 28], [43, 12], [51, 12], [56, 18], [60, 22], [58, 26], [52, 30], [45, 30], [40, 30], [37, 28], [35, 28],
  ],
  // Siberia / North Asia
  [
    [60, 52], [68, 55], [75, 55], [88, 50], [95, 53], [105, 52], [115, 52], [130, 53],
    [140, 53], [160, 52], [170, 55], [180, 60], [180, 68], [160, 70], [140, 73],
    [115, 74], [100, 76], [80, 73], [68, 68], [60, 62], [60, 52],
  ],
  // SE Asia
  [
    [98, 9], [104, 1], [109, 11], [108, 16], [110, 21], [121, 23], [122, 30], [120, 35],
    [127, 38], [130, 42], [135, 44], [130, 48], [122, 40], [100, 13], [98, 9],
  ],
  // Japan
  [
    [130, 31], [135, 34], [140, 36], [142, 40], [140, 43], [136, 37], [133, 34], [130, 31],
  ],
  // Korea
  [
    [126, 38], [129, 38], [130, 35], [127, 34], [126, 38],
  ],

  // ── Australia & Pacific
  [
    [114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -18], [150, -24],
    [153, -28], [150, -37], [146, -39], [140, -38], [135, -35], [129, -32], [123, -34],
    [115, -34], [114, -28], [114, -22],
  ],
  // New Guinea
  [
    [131, -1], [141, -3], [147, -7], [150, -9], [143, -9], [138, -8], [132, -4], [131, -1],
  ],
  // New Zealand
  [
    [173, -35], [178, -38], [177, -41], [173, -44], [168, -46], [167, -44], [171, -40], [173, -35],
  ],
  // Sumatra
  [
    [95, 5], [100, 0], [106, -6], [102, -5], [97, 2], [95, 5],
  ],
  // Java
  [
    [105, -6], [114, -8], [105, -8], [100, -3], [105, -6],
  ],
  // Borneo
  [
    [109, 2], [117, 4], [118, -3], [110, -3], [109, 2],
  ],
  // Philippines
  [
    [120, 18], [124, 16], [126, 8], [122, 6], [120, 12], [120, 18],
  ],
  // Sri Lanka
  [
    [80, 9], [82, 7], [81, 6], [80, 8], [80, 9],
  ],
];

interface Projected {
  pts: [number, number][];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function projectBlock(b: Block): Projected {
  const pts = b.map(([lon, lat]) => project(lon, lat));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { pts, minX, minY, maxX, maxY };
}

export const LAND: Projected[] = LAND_LONLAT.map(projectBlock);

/** True if a world-space point lies on (or inside) any land block. */
export function isLand(x: number, y: number): boolean {
  for (const b of LAND) {
    if (x < b.minX || x > b.maxX || y < b.minY || y > b.maxY) continue;
    const p = b.pts;
    let inside = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const xi = p[i][0], yi = p[i][1];
      const xj = p[j][0], yj = p[j][1];
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

/** Nearest open-water point to (x,y), nudging outward from land. */
export function nudgeToSea(x: number, y: number, step = DEG * 1.5): [number, number] {
  if (!isLand(x, y)) return [x, y];
  for (let r = step; r < WORLD_W; r += step) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const nx = x + Math.cos(a) * r;
      const ny = y + Math.sin(a) * r;
      if (nx >= 0 && nx <= WORLD_W && ny >= 0 && ny <= WORLD_H && !isLand(nx, ny)) return [nx, ny];
    }
  }
  return [x, y];
}
