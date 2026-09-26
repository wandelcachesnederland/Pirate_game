// Trade goods and the price model for the Trade mode.
//
// Every port has a `produces` list (cheap — you buy there) and a `wants` list
// (dear — you sell there). On top of that, a slow global "market" walks each
// good up and down so the whole world feels like it is booming and busting
// together. Prices mean-revert toward their port target every in-game day.

export type GoodId =
  | 'sugar'
  | 'rum'
  | 'spices'
  | 'tea'
  | 'silk'
  | 'tobacco'
  | 'coffee'
  | 'timber'
  | 'iron'
  | 'cloth'
  | 'porcelain'
  | 'salt'
  | 'indigo'
  | 'cocoa';

export interface GoodDef {
  id: GoodId;
  name: string;
  /** Base price a unit would fetch at a neutral port, no market movement. */
  base: number;
  /** Cargo bulk per unit (all 1 here; kept for readability). */
  bulk: number;
}

export const GOODS: GoodDef[] = [
  { id: 'sugar', name: 'Sugar', base: 38, bulk: 1 },
  { id: 'rum', name: 'Rum', base: 72, bulk: 1 },
  { id: 'spices', name: 'Spices', base: 130, bulk: 1 },
  { id: 'tea', name: 'Tea', base: 95, bulk: 1 },
  { id: 'silk', name: 'Silk', base: 155, bulk: 1 },
  { id: 'tobacco', name: 'Tobacco', base: 60, bulk: 1 },
  { id: 'coffee', name: 'Coffee', base: 82, bulk: 1 },
  { id: 'timber', name: 'Timber', base: 24, bulk: 1 },
  { id: 'iron', name: 'Iron', base: 34, bulk: 1 },
  { id: 'cloth', name: 'Cloth', base: 56, bulk: 1 },
  { id: 'porcelain', name: 'Porcelain', base: 120, bulk: 1 },
  { id: 'salt', name: 'Salt', base: 14, bulk: 1 },
  { id: 'indigo', name: 'Indigo', base: 70, bulk: 1 },
  { id: 'cocoa', name: 'Cocoa', base: 64, bulk: 1 },
];

export const GOOD_BY_ID: Record<GoodId, GoodDef> = Object.fromEntries(
  GOODS.map((g) => [g.id, g]),
) as Record<GoodId, GoodDef>;

/** Factor applied to a good's base price at a given port. */
export function priceFactor(produces: GoodId[], wants: GoodId[], good: GoodId): number {
  if (produces.includes(good)) return 0.58;
  if (wants.includes(good)) return 1.72;
  return 1.0;
}

/** Clamp a live price into a sane band around its base. */
export function clampPrice(base: number, p: number): number {
  return Math.max(base * 0.3, Math.min(base * 3.2, p));
}

/**
 * One day's worth of market movement for every port. `market` is the shared
 * global walk; `prices[portId][good]` is the live price at that port.
 */
export function stepMarket(
  market: Record<GoodId, number>,
  prices: Record<string, Record<GoodId, number>>,
  producesFor: (portId: string) => { produces: GoodId[]; wants: GoodId[] },
): void {
  // global walk
  (Object.keys(market) as GoodId[]).forEach((g) => {
    const drift = (Math.random() - 0.5) * 0.06;
    market[g] = Math.max(0.7, Math.min(1.45, market[g] + drift));
  });
  // per-port mean reversion toward its target
  for (const portId of Object.keys(prices)) {
    const { produces, wants } = producesFor(portId);
    const table = prices[portId];
    for (const g of GOODS) {
      const def = GOOD_BY_ID[g.id];
      const target = def.base * priceFactor(produces, wants, g.id) * market[g.id];
      const noise = 1 + (Math.random() - 0.5) * 0.08;
      const next = table[g.id] * 0.55 + target * 0.45;
      table[g.id] = clampPrice(def.base, next * noise);
    }
  }
}

/** Buy price paid by the player at a port. */
export function buyPrice(live: number): number {
  return Math.max(1, Math.ceil(live));
}

/** Sell price the player receives at a port (a spread under the live price). */
export function sellPrice(live: number): number {
  return Math.max(1, Math.floor(live * 0.9));
}
