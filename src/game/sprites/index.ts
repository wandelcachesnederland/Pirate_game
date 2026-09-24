// Ship sprites, split by part so each piece can be iterated on separately:
//
//   hull.ts       - hull outline, deck and mast positions (cached per style)
//   hullSprite.ts - paints a hull once into an offscreen canvas (planking,
//                   gun ports, castles, mortar pit, style extras)
//   rigging.ts    - sails, mast-top emblems and faction ensigns
//   ship.ts       - assembles the above into `drawShip` / `drawShipShadow`
//
// Colours and dimensions per ship class live in `game/data.ts` (SHIP_DEFS).

export { cannonLocalX, hullShape, shipPaths, styleId, type ShipPaths } from './hull';
export { buildHullSprite, getHullSprite } from './hullSprite';
export { drawEmblem, drawEnsign, drawFlagArt, drawSail } from './rigging';
export { drawShip, drawShipShadow } from './ship';
