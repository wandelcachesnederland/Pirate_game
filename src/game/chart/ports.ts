// The ports of the chart: real trading cities spread across the whole world and
// every age the game sails. Both Trade and Adventure call at these ports —
// Trade prices cargo in the market halls, Adventure takes contracts in the
// harbour taverns. Each is placed by longitude/latitude and assigned a maritime
// region (for colour and flavour) and the goods it grows or hungers for.

import type { GoodId } from './goods';
import { project } from './world';

export type RegionId =
  | 'caribbean'
  | 'americas'
  | 'europe'
  | 'mediterranean'
  | 'africa'
  | 'arabia'
  | 'india'
  | 'seasia'
  | 'china'
  | 'japan';

export interface RegionDef {
  id: RegionId;
  name: string;
  color: string;
}

export const REGIONS: Record<RegionId, RegionDef> = {
  caribbean: { id: 'caribbean', name: 'The Caribbean', color: '#e8b04b' },
  americas: { id: 'americas', name: 'The Americas', color: '#7fbf6a' },
  europe: { id: 'europe', name: 'Europe', color: '#7fb0e0' },
  mediterranean: { id: 'mediterranean', name: 'The Mediterranean', color: '#e0a96d' },
  africa: { id: 'africa', name: 'Africa & the Guinea Coast', color: '#caa46a' },
  arabia: { id: 'arabia', name: 'Arabia & the Red Sea', color: '#d98b5a' },
  india: { id: 'india', name: 'India', color: '#c98f6b' },
  seasia: { id: 'seasia', name: 'The Spice Islands', color: '#8fcf9f' },
  china: { id: 'china', name: 'China & the East', color: '#e08f8f' },
  japan: { id: 'japan', name: 'Japan', color: '#ef9bb0' },
};

export interface PortDef {
  id: string;
  name: string;
  region: RegionId;
  lon: number;
  lat: number;
  produces: GoodId[];
  wants: GoodId[];
  /** Does this port offer a shipyard (repairs & upgrades)? */
  shipyard?: boolean;
}

export const PORTS: PortDef[] = [
  // ── Caribbean & the Spanish Main
  { id: 'portroyal', name: 'Port Royal', region: 'caribbean', lon: -77.1, lat: 17.97, produces: ['rum', 'sugar'], wants: ['cloth', 'iron', 'porcelain'], shipyard: true },
  { id: 'havana', name: 'Havana', region: 'caribbean', lon: -82.4, lat: 23.1, produces: ['sugar', 'tobacco'], wants: ['cloth', 'iron'] },
  { id: 'cartagena', name: 'Cartagena', region: 'caribbean', lon: -75.5, lat: 10.4, produces: ['sugar', 'tobacco'], wants: ['iron', 'cloth'] },
  { id: 'tortuga', name: 'Tortuga', region: 'caribbean', lon: -72.8, lat: 20.0, produces: ['rum'], wants: ['cloth', 'iron'] },
  { id: 'nassau', name: 'Nassau', region: 'caribbean', lon: -77.35, lat: 25.08, produces: ['rum', 'salt'], wants: ['cloth', 'iron'] },

  // ── The Americas
  { id: 'boston', name: 'Boston', region: 'americas', lon: -71.0, lat: 42.36, produces: ['timber', 'indigo'], wants: ['sugar', 'rum', 'tea'] },
  { id: 'newyork', name: 'New York', region: 'americas', lon: -74.0, lat: 40.71, produces: ['timber'], wants: ['sugar', 'rum', 'tea', 'coffee'] },
  { id: 'charleston', name: 'Charleston', region: 'americas', lon: -79.93, lat: 32.78, produces: ['indigo', 'timber'], wants: ['rum', 'cloth'] },
  { id: 'veracruz', name: 'Veracruz', region: 'americas', lon: -96.13, lat: 19.17, produces: ['cocoa', 'indigo'], wants: ['silk', 'porcelain'] },
  { id: 'acapulco', name: 'Acapulco', region: 'americas', lon: -99.9, lat: 16.85, produces: ['cocoa'], wants: ['silk', 'porcelain'], shipyard: true },
  { id: 'panama', name: 'Panamá', region: 'americas', lon: -79.5, lat: 8.97, produces: ['cocoa'], wants: ['porcelain', 'iron'] },
  { id: 'salvador', name: 'Bahia', region: 'americas', lon: -38.5, lat: -12.97, produces: ['sugar', 'tobacco'], wants: ['iron', 'cloth'] },
  { id: 'rio', name: 'Rio de Janeiro', region: 'americas', lon: -43.2, lat: -22.9, produces: ['coffee', 'sugar'], wants: ['iron', 'cloth'] },
  { id: 'buenosaires', name: 'Buenos Aires', region: 'americas', lon: -58.4, lat: -34.6, produces: ['timber', 'salt'], wants: ['sugar', 'rum', 'coffee'] },
  { id: 'callao', name: 'Callao', region: 'americas', lon: -77.15, lat: -12.05, produces: ['cocoa', 'sugar'], wants: ['cloth', 'iron'] },
  { id: 'sanfrancisco', name: 'San Francisco', region: 'americas', lon: -122.4, lat: 37.8, produces: ['timber'], wants: ['sugar', 'tea'] },

  // ── Europe
  { id: 'london', name: 'London', region: 'europe', lon: -0.1, lat: 51.5, produces: ['cloth', 'iron'], wants: ['sugar', 'tea', 'tobacco', 'coffee'], shipyard: true },
  { id: 'bristol', name: 'Bristol', region: 'europe', lon: -2.6, lat: 51.45, produces: ['cloth'], wants: ['sugar', 'tobacco', 'rum'] },
  { id: 'amsterdam', name: 'Amsterdam', region: 'europe', lon: 4.9, lat: 52.37, produces: ['cloth', 'iron'], wants: ['spices', 'tea', 'sugar', 'coffee'] },
  { id: 'lisbon', name: 'Lisbon', region: 'europe', lon: -9.1, lat: 38.7, produces: ['salt', 'timber'], wants: ['spices', 'sugar', 'cocoa'] },
  { id: 'cadiz', name: 'Cádiz', region: 'europe', lon: -6.3, lat: 36.5, produces: ['iron', 'cloth'], wants: ['spices', 'sugar', 'tobacco'] },
  { id: 'bordeaux', name: 'Bordeaux', region: 'europe', lon: -0.58, lat: 44.84, produces: ['cloth'], wants: ['sugar', 'coffee', 'rum'] },
  { id: 'marseille', name: 'Marseille', region: 'europe', lon: 5.37, lat: 43.3, produces: ['cloth'], wants: ['spices', 'coffee', 'sugar'] },

  // ── Mediterranean
  { id: 'venice', name: 'Venice', region: 'mediterranean', lon: 12.33, lat: 45.44, produces: ['cloth', 'silk'], wants: ['spices', 'sugar', 'coffee'], shipyard: true },
  { id: 'genoa', name: 'Genoa', region: 'mediterranean', lon: 8.9, lat: 44.4, produces: ['cloth'], wants: ['spices', 'sugar'] },
  { id: 'naples', name: 'Naples', region: 'mediterranean', lon: 14.25, lat: 40.85, produces: ['silk'], wants: ['salt', 'sugar'] },
  { id: 'constantine', name: 'Constantinople', region: 'mediterranean', lon: 29.0, lat: 41.0, produces: ['silk', 'cloth'], wants: ['spices', 'coffee', 'tea'], shipyard: true },
  { id: 'alexandria', name: 'Alexandria', region: 'mediterranean', lon: 29.9, lat: 31.2, produces: ['salt'], wants: ['cloth', 'iron', 'coffee'] },
  { id: 'tunis', name: 'Tunis', region: 'mediterranean', lon: 10.2, lat: 36.8, produces: ['salt'], wants: ['cloth', 'iron', 'sugar'] },
  { id: 'algiers', name: 'Algiers', region: 'mediterranean', lon: 3.0, lat: 36.8, produces: ['salt'], wants: ['cloth', 'iron', 'rum'] },
  { id: 'smyrna', name: 'Smyrna', region: 'mediterranean', lon: 27.1, lat: 38.42, produces: ['silk'], wants: ['spices', 'tea'] },

  // ── Africa & the Indian Ocean
  { id: 'mogadishu', name: 'Mogadishu', region: 'africa', lon: 45.3, lat: 2.0, produces: ['salt'], wants: ['cloth', 'iron', 'porcelain'] },
  { id: 'mombasa', name: 'Mombasa', region: 'africa', lon: 39.7, lat: -4.05, produces: ['salt'], wants: ['cloth', 'iron', 'porcelain'] },
  { id: 'zanzibar', name: 'Zanzibar', region: 'africa', lon: 39.2, lat: -6.16, produces: ['spices', 'coffee'], wants: ['cloth', 'iron'] },
  { id: 'cape', name: 'Cape of Good Hope', region: 'africa', lon: 18.42, lat: -33.92, produces: ['timber', 'salt'], wants: ['spices', 'sugar', 'cloth'], shipyard: true },

  // ── Arabia & the Red Sea
  { id: 'aden', name: 'Aden', region: 'arabia', lon: 45.0, lat: 12.8, produces: ['coffee', 'salt'], wants: ['cloth', 'iron', 'spices'] },
  { id: 'jeddah', name: 'Jeddah', region: 'arabia', lon: 39.2, lat: 21.5, produces: ['coffee'], wants: ['cloth', 'iron', 'spices'] },
  { id: 'muscat', name: 'Muscat', region: 'arabia', lon: 58.4, lat: 23.6, produces: ['salt'], wants: ['cloth', 'iron', 'spices', 'timber'] },
  { id: 'hormuz', name: 'Hormuz', region: 'arabia', lon: 56.4, lat: 27.1, produces: ['salt'], wants: ['spices', 'cloth', 'timber'] },
  { id: 'basra', name: 'Basra', region: 'arabia', lon: 47.9, lat: 30.5, produces: ['salt'], wants: ['cloth', 'iron', 'spices'] },

  // ── India
  { id: 'surat', name: 'Surat', region: 'india', lon: 72.8, lat: 21.2, produces: ['cloth', 'indigo'], wants: ['spices', 'coffee'], shipyard: true },
  { id: 'goa', name: 'Goa', region: 'india', lon: 74.0, lat: 15.5, produces: ['spices'], wants: ['cloth', 'iron'] },
  { id: 'calicut', name: 'Calicut', region: 'india', lon: 75.8, lat: 11.25, produces: ['spices', 'coffee'], wants: ['cloth', 'iron'] },
  { id: 'cochin', name: 'Cochin', region: 'india', lon: 76.2, lat: 9.96, produces: ['spices'], wants: ['cloth', 'iron'] },

  // ── The Spice Islands & East Indies
  { id: 'ceylon', name: 'Colombo', region: 'india', lon: 79.85, lat: 6.95, produces: ['spices', 'coffee'], wants: ['cloth', 'iron'] },
  { id: 'malacca', name: 'Malacca', region: 'seasia', lon: 102.25, lat: 2.2, produces: ['spices'], wants: ['silk', 'porcelain', 'cloth'], shipyard: true },
  { id: 'aceh', name: 'Aceh', region: 'seasia', lon: 95.3, lat: 5.55, produces: ['spices'], wants: ['cloth', 'iron'] },
  { id: 'batavia', name: 'Batavia', region: 'seasia', lon: 106.8, lat: -6.2, produces: ['spices', 'coffee'], wants: ['silk', 'porcelain', 'cloth'] },
  { id: 'bantam', name: 'Bantam', region: 'seasia', lon: 106.0, lat: -6.0, produces: ['spices'], wants: ['cloth', 'iron'] },

  // ── China & the East
  { id: 'manila', name: 'Manila', region: 'china', lon: 121.0, lat: 14.6, produces: ['silk', 'porcelain'], wants: ['sugar', 'rum', 'timber'], shipyard: true },
  { id: 'canton', name: 'Canton', region: 'china', lon: 113.25, lat: 23.13, produces: ['silk', 'porcelain', 'tea'], wants: ['timber', 'iron'] },
  { id: 'macao', name: 'Macao', region: 'china', lon: 113.55, lat: 22.2, produces: ['tea', 'porcelain'], wants: ['sugar', 'rum'] },
  { id: 'hoian', name: 'Hội An', region: 'china', lon: 108.3, lat: 15.9, produces: ['silk', 'porcelain'], wants: ['cloth', 'iron'] },
  { id: 'ayutthaya', name: 'Ayutthaya', region: 'china', lon: 100.6, lat: 14.35, produces: ['silk', 'spices'], wants: ['iron', 'cloth'] },
  { id: 'nagasaki', name: 'Nagasaki', region: 'japan', lon: 129.87, lat: 32.75, produces: ['porcelain', 'silk'], wants: ['sugar', 'rum', 'timber'], shipyard: true },
];

export interface ProjectedPort extends PortDef {
  x: number;
  y: number;
}

export const PORTS_PROJ: ProjectedPort[] = PORTS.map((p) => {
  const [x, y] = project(p.lon, p.lat);
  return { ...p, x, y };
});

export const PORT_BY_ID: Record<string, ProjectedPort> = Object.fromEntries(
  PORTS_PROJ.map((p) => [p.id, p]),
);

export function producesFor(portId: string): { produces: GoodId[]; wants: GoodId[] } {
  const p = PORT_BY_ID[portId];
  return p ? { produces: p.produces, wants: p.wants } : { produces: [], wants: [] };
}
