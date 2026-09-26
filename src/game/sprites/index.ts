// Ship sprites, split by part so each piece can be iterated on separately:
//
//   hull.ts       - hull outline, deck and mast positions (cached per style)
//   hullSprite.ts - paints a hull once into an offscreen canvas (planking,
//                   gun ports, castles, deck furniture, style extras)
//   rigging.ts    - sails, oars, ratlines, mast-top emblems and faction ensigns
//   ship.ts       - assembles the above into `drawShip` / `drawShipShadow`
//
// Colours and dimensions per ship class live in `game/shipDefs/*` (merged into SHIP_DEFS in `game/data.ts`);
// the playable era hulls live in `game/ships/era/`.

export { cannonLocalX, clearPathCache, hullShape, shipPaths, styleId, type ShipPaths } from './hull';
export { buildHullSprite, clearShipCaches, getHullSprite } from './hullSprite';
export {
  drawEmblem,
  drawEnsign,
  drawFlagArt,
  drawJunkBattens,
  drawLateenSail,
  drawOars,
  drawRigging,
  drawSail,
  drawSurrenderFlag,
} from './rigging';
export { drawShip, drawShipShadow } from './ship';
