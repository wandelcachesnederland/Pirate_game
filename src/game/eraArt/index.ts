// Era cards: the picture and the logo the era picker shows for each age.
//
//   scenes.ts   - what each era's card is: cast, coast, weather, colours, mark
//   coast.ts    - sky, and the shore silhouettes standing on the horizon
//   emblems.ts  - the seal marks, one per era
//   fx.ts       - wakes, fire, shot, spray and weather, as functions of the clock
//   paint.ts    - assembles all of it into `paintEraScene`

export { drawEmblem } from './emblems';
export { drawBurning, drawFx, drawProp, drawSinking, drawSwell, drawWake, drawWeather, type Placed, type View } from './fx';
export { clearEraSceneCache, paintEraScene } from './paint';
export { ERA_SCENES, sceneFor, type CastSpec, type EmblemId, type EraSceneSpec, type FxSpec } from './scenes';
