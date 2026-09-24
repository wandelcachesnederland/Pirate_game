export type Screen = 'menu' | 'playing' | 'paused' | 'upgrade' | 'gameover';

export type ShipKind =
  | 'player'
  | 'merchant'
  | 'schooner'
  | 'galleon'
  | 'sloop'
  | 'cutter'
  | 'brig'
  | 'corvette'
  | 'bombketch'
  | 'frigate'
  | 'privateer'
  | 'manowar'
  | 'fireship';

export type Faction = 'pirate' | 'spain' | 'england' | 'france' | 'merchant' | 'fire';

export type HullStyle = 'default' | 'longship' | 'ironclad' | 'caravel';

export interface ShipDef {
  kind: ShipKind;
  name: string;
  faction: Faction;
  length: number;
  width: number;
  hp: number;
  speed: number;
  accel: number;
  turn: number;
  cannons: number;
  reload: number;
  damage: number;
  range: number;
  ballSpeed: number;
  masts: number;
  value: number;
  coins: number;
  hull: string;
  deck: string;
  trim: string;
  sail: string;
  sailShade: string;
  /** Lobs arcing, exploding shells instead of flat broadsides. */
  mortar?: boolean;
  /** Reserved: ignores false flags once a disguise system exists. */
  seesThroughDisguise?: boolean;
  /** Gun decks drawn as extra rows of gun ports (default 1). */
  decks?: number;
  /** Silhouette variant drawn by the hull painter (default 'default'). */
  hullStyle?: HullStyle;
  /** Cache key override so variants of one kind get their own sprite. */
  styleKey?: string;
}

export interface Ship {
  id: number;
  def: ShipDef;
  team: 0 | 1;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angVel: number;
  fwd: number;
  sail: number;
  sailTarget: number;
  turnInput: number;
  hp: number;
  maxHp: number;
  ghostHp: number;
  reloadL: number;
  reloadR: number;
  reloadTime: number;
  cannons: number;
  damage: number;
  range: number;
  ballSpeed: number;
  maxSpeed: number;
  turnRate: number;
  flash: number;
  recoilL: number;
  recoilR: number;
  sinking: number;
  sinkSpin: number;
  dead: boolean;
  aiSide: number;
  aiTimer: number;
  aiWander: number;
  aiJitter: number;
  aiLead: number;
  slowTimer: number;
  hitTimer: number;
  fxTimer: number;
  wakeTimer: number;
  bob: number;
  hitByPlayer: boolean;
  isBoss: boolean;
}

export type UpgradeId =
  | 'cannons'
  | 'reload'
  | 'damage'
  | 'hull'
  | 'sails'
  | 'rudder'
  | 'range'
  | 'magnet'
  | 'carpenter'
  | 'swivel'
  | 'chain';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  desc: string;
  max: number;
}

export interface UpgradeOffer {
  def: UpgradeDef;
  level: number;
}

export interface GameStats {
  score: number;
  wave: number;
  sunk: number;
  gold: number;
  accuracy: number;
  maxStreak: number;
  time: number;
}

export interface Island {
  x: number;
  y: number;
  r: number;
  maxR: number;
  harm: { amp: number; freq: number; phase: number }[];
  canvas: HTMLCanvasElement;
  half: number;
  shore: Path2D;
  seed: number;
}
