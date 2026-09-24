// Ship sprites, split by part so each piece can be iterated on separately:
//
//   hull.ts     - hull outline, deck, planking, mast + cannon positions (cached per ship kind)
//   rigging.ts  - sails, mast-top emblems and faction flags
//   ship.ts     - assembles the above into `drawShip` / `drawShipShadow`
//
// Colours and dimensions per ship class live in `game/data.ts` (SHIP_DEFS).

export { cannonLocalX, shipPaths, type ShipPaths } from './hull';
export { drawEmblem, drawFlag, drawSail, FLAG } from './rigging';
export { drawShip, drawShipShadow } from './ship';
