// Island terrain — what an island in a given sea is actually made of.
//
// The tropical seas share one painter (see `buildIsland` in render.ts): a sand
// ring, a jungle heart and palms on the beach. Every other stretch of water
// carries a `Terrain` recipe instead, and this module paints from it: the
// coastline's character, what the shore is made of, what covers the ground,
// which trees grow, what the summit looks like, how the locals build, and the
// landmark a sailor would know the waters by — chalk cliffs and a lighthouse in
// Biscay, heather, skerries and a stone ring in the North Sea, a whitewashed
// village under a hilltop temple in the Aegean, chinampas and a twin-shrined
// pyramid on Lake Texcoco.
//
// Everything here is decoration baked once into the island's sprite. The only
// thing that touches gameplay is the coastline (`terrainHarmonics`), which the
// engine reads back through `islandRadiusAt` for collisions, so the shoreline a
// ship bumps into is always the one that was painted.

//
// Layout of this folder:
//   recipe.ts    – `Terrain` recipe types + coastline harmonics (gameplay)
//   painter.ts   – `paintTerrainIsland`, the entry point that sequences:
//   shore.ts, ground.ts, peak.ts, trees.ts, village.ts, landmarks.ts, offshore.ts
//   shared.ts    – colour maths, the per-island `Job`, sizing helpers

export * from './recipe';
export type { TerrainPaint } from './shared';
export { paintTerrainIsland } from './painter';
