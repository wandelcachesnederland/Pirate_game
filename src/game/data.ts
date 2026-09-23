import type { ShipDef, ShipKind, UpgradeDef } from './types';

export const SHIP_DEFS: Record<ShipKind, ShipDef> = {
  player: {
    kind: 'player',
    name: 'The Black Gull',
    faction: 'pirate',
    length: 62,
    width: 22,
    hp: 100,
    speed: 195,
    accel: 105,
    turn: 2.05,
    cannons: 3,
    reload: 1.4,
    damage: 12,
    range: 430,
    ballSpeed: 580,
    masts: 2,
    value: 0,
    coins: 0,
    hull: '#3b2314',
    deck: '#a0703f',
    trim: '#9e1f1f',
    sail: '#2b2623',
    sailShade: '#120f0d',
  },
  merchant: {
    kind: 'merchant',
    name: 'Merchant Fluyt',
    faction: 'merchant',
    length: 58,
    width: 24,
    hp: 40,
    speed: 112,
    accel: 55,
    turn: 1.1,
    cannons: 1,
    reload: 3.2,
    damage: 5,
    range: 320,
    ballSpeed: 430,
    masts: 2,
    value: 120,
    coins: 11,
    hull: '#6b4a2b',
    deck: '#b8905c',
    trim: '#2e5e8c',
    sail: '#eadcbc',
    sailShade: '#bba57a',
  },
  sloop: {
    kind: 'sloop',
    name: 'Guarda Costa Sloop',
    faction: 'spain',
    length: 54,
    width: 19,
    hp: 46,
    speed: 168,
    accel: 85,
    turn: 1.55,
    cannons: 2,
    reload: 2.5,
    damage: 7,
    range: 380,
    ballSpeed: 480,
    masts: 1,
    value: 150,
    coins: 7,
    hull: '#5a2e1c',
    deck: '#ab7742',
    trim: '#d4a72c',
    sail: '#f4ecd6',
    sailShade: '#cdbd96',
  },
  brig: {
    kind: 'brig',
    name: 'Royal Navy Brig',
    faction: 'england',
    length: 70,
    width: 24,
    hp: 95,
    speed: 150,
    accel: 68,
    turn: 1.2,
    cannons: 3,
    reload: 2.3,
    damage: 8,
    range: 400,
    ballSpeed: 500,
    masts: 2,
    value: 260,
    coins: 10,
    hull: '#2c2b3b',
    deck: '#9d7d52',
    trim: '#2a57a8',
    sail: '#f6f1e4',
    sailShade: '#cfc6ad',
  },
  frigate: {
    kind: 'frigate',
    name: 'Spanish Frigate',
    faction: 'spain',
    length: 84,
    width: 28,
    hp: 170,
    speed: 140,
    accel: 58,
    turn: 1.0,
    cannons: 4,
    reload: 2.4,
    damage: 9,
    range: 430,
    ballSpeed: 520,
    masts: 3,
    value: 420,
    coins: 14,
    hull: '#4a2418',
    deck: '#a5773f',
    trim: '#d9b233',
    sail: '#f4ead0',
    sailShade: '#cbb88f',
  },
  manowar: {
    kind: 'manowar',
    name: "Man-o'-War",
    faction: 'england',
    length: 112,
    width: 36,
    hp: 460,
    speed: 110,
    accel: 42,
    turn: 0.74,
    cannons: 5,
    reload: 3.0,
    damage: 7,
    range: 460,
    ballSpeed: 520,
    masts: 3,
    value: 1200,
    coins: 26,
    hull: '#1f2233',
    deck: '#8f7048',
    trim: '#c9a227',
    sail: '#fbf7ec',
    sailShade: '#d7cfb6',
  },
  fireship: {
    kind: 'fireship',
    name: 'Fire Ship',
    faction: 'fire',
    length: 50,
    width: 18,
    hp: 28,
    speed: 185,
    accel: 115,
    turn: 1.5,
    cannons: 0,
    reload: 99,
    damage: 0,
    range: 0,
    ballSpeed: 0,
    masts: 1,
    value: 90,
    coins: 3,
    hull: '#2a1a10',
    deck: '#5b3a22',
    trim: '#ff6a00',
    sail: '#51403a',
    sailShade: '#2a1e18',
  },
};

export const UPGRADES: UpgradeDef[] = [
  { id: 'cannons', name: 'Extra Cannons', desc: '+1 gun on each broadside', max: 4 },
  { id: 'reload', name: 'Veteran Gun Crew', desc: 'Reload 15% faster', max: 5 },
  { id: 'damage', name: 'Heavy Shot', desc: '+25% cannonball damage', max: 5 },
  { id: 'hull', name: 'Oak Planking', desc: '+30 max hull & full repair', max: 5 },
  { id: 'sails', name: 'Silk Sails', desc: '+10% top speed', max: 4 },
  { id: 'rudder', name: 'Balanced Rudder', desc: '+18% turning speed', max: 3 },
  { id: 'range', name: 'Long Nines', desc: '+18% cannon range & velocity', max: 3 },
  { id: 'magnet', name: 'Greedy Parrot', desc: 'Grab loot from much further away', max: 3 },
  { id: 'carpenter', name: "Ship's Carpenter", desc: 'Repair 1.5 hull every second', max: 3 },
  { id: 'swivel', name: 'Swivel Guns', desc: 'Deck guns auto-fire at close foes', max: 3 },
  { id: 'chain', name: 'Chain Shot', desc: 'Your hits slow enemy ships', max: 1 },
];

const WAVE_LINES = [
  'More sails on the horizon!',
  'They want your head, Captain!',
  'No quarter given!',
  'Blood in the water...',
  'The Crown has doubled your bounty!',
  'Hunters close in from all sides!',
];

export function waveTitle(n: number): string {
  switch (n) {
    case 1:
      return 'A merchant convoy — plunder it!';
    case 2:
      return 'The Guarda Costa gives chase!';
    case 3:
      return 'Beware the fire ships!';
    case 4:
      return 'The Royal Navy has arrived!';
    case 5:
      return "A Man-o'-War approaches!";
    default:
      if (n % 5 === 0) return 'The Armada sails against you!';
      return WAVE_LINES[n % WAVE_LINES.length];
  }
}

export function waveComposition(n: number): ShipKind[] {
  switch (n) {
    case 1:
      return ['merchant', 'merchant', 'sloop'];
    case 2:
      return ['merchant', 'sloop', 'sloop', 'merchant', 'sloop'];
    case 3:
      return ['sloop', 'fireship', 'brig', 'merchant', 'sloop', 'fireship'];
    case 4:
      return ['brig', 'sloop', 'fireship', 'brig', 'merchant', 'sloop', 'frigate'];
    case 5:
      return ['manowar', 'sloop', 'merchant', 'sloop', 'fireship', 'brig'];
  }
  const list: ShipKind[] = [];
  if (n % 5 === 0) {
    const bosses = Math.min(3, Math.floor(n / 5));
    for (let i = 0; i < bosses; i++) list.push('manowar');
  }
  list.push('merchant');
  let budget = 6 + (n - 5) * 1.7;
  const pool: [ShipKind, number, number][] = [
    ['sloop', 1.2, 3],
    ['brig', 2, 3],
    ['fireship', 1.2, 2],
    ['frigate', 3.2, 2],
    ['merchant', 0.8, 1],
  ];
  const totalW = pool.reduce((a, p) => a + p[2], 0);
  let guard = 0;
  while (budget > 0 && guard++ < 60) {
    let r = Math.random() * totalW;
    let pick = pool[0];
    for (const p of pool) {
      r -= p[2];
      if (r <= 0) {
        pick = p;
        break;
      }
    }
    list.push(pick[0]);
    budget -= pick[1];
  }
  return list;
}
