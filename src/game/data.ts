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
    crew: 45,
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
    crew: 24,
    value: 120,
    coins: 11,
    hull: '#6b4a2b',
    deck: '#b8905c',
    trim: '#2e5e8c',
    sail: '#eadcbc',
    sailShade: '#bba57a',
  },
  // Fast trader. Outruns most warships; catch it on a broad reach.
  schooner: {
    kind: 'schooner',
    name: 'Blockade Runner',
    faction: 'merchant',
    length: 56,
    width: 18,
    hp: 44,
    speed: 182,
    accel: 96,
    turn: 1.6,
    cannons: 1,
    reload: 3,
    damage: 5,
    range: 330,
    ballSpeed: 450,
    masts: 2,
    crew: 20,
    value: 190,
    coins: 13,
    hull: '#5c4326',
    deck: '#c39a62',
    trim: '#2f8f6f',
    sail: '#f7f0dc',
    sailShade: '#cdc09c',
  },
  // Heavy, slow, 2 gun decks (`decks: 2` draws the 2nd port row). Jackpot loot.
  galleon: {
    kind: 'galleon',
    name: 'Treasure Galleon',
    faction: 'spain',
    length: 96,
    width: 34,
    hp: 260,
    speed: 104,
    accel: 44,
    turn: 0.82,
    cannons: 3,
    reload: 3.1,
    damage: 8,
    range: 390,
    ballSpeed: 480,
    masts: 3,
    crew: 90,
    value: 900,
    coins: 34,
    hull: '#5b2f16',
    deck: '#c08a46',
    trim: '#e8c14a',
    sail: '#f7ecd2',
    sailShade: '#cfbd92',
    decks: 2,
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
    crew: 26,
    value: 150,
    coins: 7,
    hull: '#5a2e1c',
    deck: '#ab7742',
    trim: '#d4a72c',
    sail: '#f4ecd6',
    sailShade: '#cdbd96',
  },
  // Fastest sailing hull in the game; fragile, quick-firing single gun.
  cutter: {
    kind: 'cutter',
    name: 'Revenue Cutter',
    faction: 'england',
    length: 46,
    width: 16,
    hp: 38,
    speed: 205,
    accel: 125,
    turn: 1.95,
    cannons: 1,
    reload: 1.7,
    damage: 5,
    range: 330,
    ballSpeed: 520,
    masts: 1,
    crew: 18,
    value: 170,
    coins: 6,
    hull: '#26303f',
    deck: '#a98a5c',
    trim: '#d8d2c4',
    sail: '#fbf7ec',
    sailShade: '#d2cab4',
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
    crew: 48,
    value: 260,
    coins: 10,
    hull: '#2c2b3b',
    deck: '#9d7d52',
    trim: '#2a57a8',
    sail: '#f6f1e4',
    sailShade: '#cfc6ad',
  },
  // Fast 3-mast raider. Longer reach than the brig, thinner skin.
  corvette: {
    kind: 'corvette',
    name: 'French Corvette',
    faction: 'france',
    length: 72,
    width: 25,
    hp: 120,
    speed: 162,
    accel: 74,
    turn: 1.28,
    cannons: 3,
    reload: 2.0,
    damage: 8,
    range: 415,
    ballSpeed: 515,
    masts: 3,
    crew: 55,
    value: 330,
    coins: 12,
    hull: '#2f3b52',
    deck: '#a8824c',
    trim: '#dfe3ea',
    sail: '#f8f4e8',
    sailShade: '#cfc9b6',
  },
  // `mortar: true` — lobs slow arcing shells instead of flat broadsides.
  // Draws a mortar pit on deck. Keep moving when one is on the field.
  bombketch: {
    kind: 'bombketch',
    name: 'Bomb Ketch',
    faction: 'france',
    length: 62,
    width: 26,
    hp: 105,
    speed: 112,
    accel: 50,
    turn: 0.95,
    cannons: 1,
    reload: 4.4,
    damage: 22,
    range: 560,
    ballSpeed: 250,
    masts: 2,
    crew: 40,
    value: 380,
    coins: 11,
    hull: '#3a3a30',
    deck: '#9c8a5e',
    trim: '#7d5a2c',
    sail: '#efe7d0',
    sailShade: '#c4bb9e',
    mortar: true,
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
    crew: 70,
    value: 420,
    coins: 14,
    hull: '#4a2418',
    deck: '#a5773f',
    trim: '#d9b233',
    sail: '#f4ead0',
    sailShade: '#cbb88f',
  },
  // Pirate-hunter. `seesThroughDisguise` — false flags never fool it.
  privateer: {
    kind: 'privateer',
    name: 'Rival Privateer',
    faction: 'pirate',
    length: 66,
    width: 23,
    hp: 130,
    speed: 188,
    accel: 100,
    turn: 1.5,
    cannons: 3,
    reload: 1.85,
    damage: 9,
    range: 420,
    ballSpeed: 540,
    masts: 2,
    crew: 50,
    value: 520,
    coins: 18,
    hull: '#33221b',
    deck: '#8d6236',
    trim: '#b03a2e',
    sail: '#4a423c',
    sailShade: '#241f1c',
    seesThroughDisguise: true,
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
    decks: 2, // two rows of gun ports — she's a ship of the line
    masts: 3,
    crew: 120,
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
    crew: 6,
    value: 90,
    coins: 3,
    hull: '#2a1a10',
    deck: '#5b3a22',
    trim: '#ff6a00',
    sail: '#51403a',
    sailShade: '#2a1e18',
    seesThroughDisguise: true,
  },
  // ── SMALL CRAFT · kind='warCanoe' · War Canoe ────────────────────────────
  // Island natives. Paddled, so wind means nothing to them, and unarmed — they
  // close and stab instead of firing. Comes out of the islands in packs.
  warCanoe: {
    kind: 'warCanoe',
    name: 'War Canoe',
    faction: 'native',
    length: 34,
    width: 11,
    hp: 26,
    speed: 172,
    accel: 150,
    turn: 2.3,
    cannons: 0,
    reload: 99,
    damage: 0,
    range: 0,
    ballSpeed: 0,
    masts: 0,
    crew: 12,
    value: 140,
    coins: 9,
    hull: '#6a4a2a',
    deck: '#8d6a3f',
    trim: '#c0392b',
    sail: '#8a6a3a',
    sailShade: '#5a3f20',
    hullStyle: 'canoe',
    oared: true,
  },
  // ── SMALL CRAFT · kind='fishingCanoe' · Fishing Canoe ────────────────────
  // Islanders working the shallows. Unarmed, bolts for cover, worth a few coins.
  fishingCanoe: {
    kind: 'fishingCanoe',
    name: 'Fishing Canoe',
    faction: 'native',
    length: 30,
    width: 12,
    hp: 18,
    speed: 118,
    accel: 110,
    turn: 2.0,
    cannons: 0,
    reload: 99,
    damage: 0,
    range: 0,
    ballSpeed: 0,
    masts: 0,
    crew: 5,
    value: 70,
    coins: 16,
    hull: '#7d5c34',
    deck: '#a37f4c',
    trim: '#3f7f6a',
    sail: '#9a7a44',
    sailShade: '#6b5230',
    hullStyle: 'canoe',
    oared: true,
  },
  // ── SMALL CRAFT · kind='rowboat' · Ship's Rowboat ────────────────────────
  // Crew escaping a sinking hull, or a tender running errands. Oared, unarmed,
  // and it usually carries something worth having.
  rowboat: {
    kind: 'rowboat',
    name: "Ship's Rowboat",
    faction: 'merchant',
    length: 26,
    width: 10,
    hp: 14,
    speed: 128,
    accel: 120,
    turn: 2.4,
    cannons: 0,
    reload: 99,
    damage: 0,
    range: 0,
    ballSpeed: 0,
    masts: 0,
    crew: 6,
    value: 90,
    coins: 12,
    hull: '#5c4326',
    deck: '#9d7a4a',
    trim: '#c9a227',
    sail: '#7a5c34',
    sailShade: '#523c20',
    oared: true,
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
      if (n % 5 === 0) return 'The Armada sails — with a treasure galleon!';
      return WAVE_LINES[n % WAVE_LINES.length];
  }
}

export function waveComposition(n: number): ShipKind[] {
  switch (n) {
    case 1:
      return ['merchant', 'merchant', 'sloop'];
    case 2:
      return ['merchant', 'sloop', 'schooner', 'merchant', 'sloop'];
    case 3:
      return ['sloop', 'fireship', 'brig', 'merchant', 'cutter', 'fireship'];
    case 4:
      return ['brig', 'sloop', 'fireship', 'brig', 'merchant', 'corvette', 'frigate'];
    case 5:
      return ['manowar', 'sloop', 'merchant', 'sloop', 'fireship', 'brig'];
  }
  const list: ShipKind[] = [];
  if (n % 5 === 0) {
    const bosses = Math.min(3, Math.floor(n / 5));
    for (let i = 0; i < bosses; i++) list.push('manowar');
    // the jackpot escort — worth the extra trouble
    list.push('galleon');
  }
  list.push('merchant');
  let budget = 6 + (n - 5) * 1.7;
  // [kind, budget cost, spawn weight]
  const pool: [ShipKind, number, number][] = [
    ['sloop', 1.2, 3],
    ['brig', 2, 3],
    ['fireship', 1.2, 2],
    ['frigate', 3.2, 2],
    ['merchant', 0.8, 1],
    ['schooner', 1.4, 2],
    ['cutter', 1.5, 2],
    ['corvette', 2.6, 2],
  ];
  if (n >= 7) pool.push(['bombketch', 2.8, 1]);
  if (n >= 6) pool.push(['privateer', 3.4, 1]);
  // small craft are cheap filler — and canoes mostly arrive from the islands
  if (n >= 4) pool.push(['fishingCanoe', 0.6, 1]);
  if (n >= 7) pool.push(['rowboat', 0.5, 1]);
  if (n >= 9) pool.push(['warCanoe', 1.1, 1]);
  // the galleon escorts boss waves already; elsewhere it stays rare and late
  if (n >= 8 && n % 5 !== 0) pool.push(['galleon', 5.5, 1]);
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
