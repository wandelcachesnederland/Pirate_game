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
  | 'fireship'
  // small craft — paddled, unarmed, they live around the islands
  | 'warCanoe'
  | 'fishingCanoe'
  | 'rowboat'
  // Age of Sail additions — corsairs and coastal craft
  | 'xebec'
  | 'lugger'
  | 'gunboat'
  // Punic Wars — Carthage and the Cilician pirates
  | 'carthGalley'
  | 'carthTrader'
  | 'carthSeven'
  | 'cilician'
  // Persian Wars — the Great King's Phoenician fleet
  | 'phoenTrireme'
  | 'persTransport'
  | 'ionianGalley'
  | 'sidonianRoyal'
  // Monsoon Seas — dhows and baghlahs of the Indian Ocean
  | 'warDhow'
  | 'ghurab'
  | 'baghlah'
  | 'sultanFlagship'
  // Ming waters — warlords and wokou pirates
  | 'warlordJunk'
  | 'wokouJunk'
  | 'grainJunk'
  | 'pirateKing'
  // Sengoku Japan — the M\u014dri and their scouts
  | 'sekiBune'
  | 'kobaya'
  | 'riceBune'
  | 'moriFlagship'
  // Aotearoa — rival iwi and flax traders
  | 'rivalWaka'
  | 'arikiWaka'
  | 'flaxTrader'
  // Hawai\u02bbi — rival ali\u02bbi and sandalwood traders
  | 'rivalWaa'
  | 'kauaiFlagship'
  | 'sandTrader'
  // Successor Wars — Rhodians and Ptolemies
  | 'rhodesTrieres'
  | 'ptolemGalley'
  | 'alexGrain'
  | 'ptolemFlagship'
  // First Contact — rival Maya and the strangers
  | 'mayaRival'
  | 'cacaoTrader'
  | 'conqCaravel'
  | 'conqCapitana'
  // Pacific balsas — Puná islanders and rival traders
  | 'rivalBalsa'
  | 'punaBalsa'
  | 'spondylusTrader'
  | 'punaArmada'
  // Lepanto — galleys of the Holy League
  | 'venetianGalley'
  | 'spanishGalley'
  | 'venetianTrader'
  | 'laReal'
  // Imjin War — Hideyoshi's flagship
  | 'japanFlagship'
  // Constantinople — the Caliph's galleys
  | 'umayyadGalley'
  | 'shalandi'
  | 'umayyadSupply'
  | 'maslamaFlagship'
  // Sea Peoples — Sherden raiders
  | 'sherdenGalley'
  | 'sherdenRaider'
  | 'clanShip'
  | 'sherdenArmada'
  // Bay of Bengal — Srivijayan jongs
  | 'srivJong'
  | 'srivScout'
  | 'spiceTrader'
  | 'royalJong'
  // Bach Dang — the Khan's fleet
  | 'yuanScout'
  | 'yuanFlagship'
  // Lake Texcoco — brigantines and allies
  | 'spanBrigantine'
  | 'tlaxCanoe'
  | 'supplyBrig'
  | 'cortesCapitana';

export type Faction =
  | 'pirate'
  | 'spain'
  | 'england'
  | 'france'
  | 'merchant'
  | 'fire'
  | 'native'
  // heritage waters
  | 'carthage'
  | 'persia'
  | 'arab'
  | 'china'
  | 'japan'
  | 'maori'
  | 'hawaii'
  | 'macedon'
  | 'rhodes'
  | 'ptolemy'
  | 'maya'
  | 'inca'
  | 'puna'
  | 'ottoman'
  | 'venice'
  | 'korea'
  | 'byzantium'
  | 'egypt'
  | 'sherden'
  | 'chola'
  | 'srivijaya'
  | 'daiviet'
  | 'aztec';

export type HullStyle =
  | 'default'
  | 'longship'
  | 'ironclad'
  | 'caravel'
  | 'canoe'
  // heritage silhouettes (museum pieces — not sailed in gameplay yet)
  | 'trireme'
  | 'dhow'
  | 'junk'
  | 'atakebune';

/** Playable hero hulls — each is a `player`-kind ShipDef with its own styleKey. */
export type EraId =
  // Age of Sail
  | 'golden'
  | 'exploration'
  | 'napoleonic'
  | 'viking'
  | 'ironclad'
  // Heritage Seas — the museum fleets, now playable
  | 'roman'
  | 'greek'
  | 'arab'
  | 'chinese'
  | 'japanese'
  // Polynesia — waka and wa\u02bba waters
  | 'maori'
  | 'hawaii'
  // Successors and the Americas
  | 'macedon'
  | 'maya'
  | 'inca'
  // Galleys, turtles and lakes
  | 'lepanto'
  | 'korea'
  | 'byzantium'
  | 'egypt'
  | 'chola'
  | 'vietnam'
  | 'aztec';

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
  /** Paddled/oared craft: no sails, immune to the wind, draws moving oars. */
  oared?: boolean;
  /**
   * Islander craft: paddles out from an island beach, fights only so far and so
   * long from it, then gives up and paddles home (see `Ship.leash`/`Ship.hunt`).
   */
  native?: boolean;
  /** Ship's company at full strength. Casualties mount as the hull takes damage. */
  crew?: number;
  /** Wave boss: gets the boss bar, fanfare treatment and a captain's chest. */
  boss?: boolean;
  /** Fat prize ship: always carries a captain's chest (galleons, tribute fleets). */
  treasure?: boolean;
  /** Trader: sometimes carries a captain's chest, pointed out as a prize. */
  trader?: boolean;
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
  /** Cooldown for the war canoe's melee bite. */
  biteTimer: number;
  /**
   * Home beach of a paddled raider — the island they came from. 0/0 with
   * `leash` 0 means an open-sea craft with no beach to run back to.
   */
  homeX: number;
  homeY: number;
  /**
   * How far from home a raider will stray (world units). Past it they break off
   * whatever they were chasing and paddle back to their own beach.
   */
  leash: number;
  /**
   * Seconds of aggression left in this war party. Each canoe rolls its own,
   * so a pack breaks off raggedly instead of all at once. <= 0 = spent: they
   * only fight inside their own lagoon after that.
   */
  hunt: number;
  /** Countdown to beaching once a spent party is loitering off home (-1 idle). */
  beach: number;
  /**
   * What the war party is about: 'hunt' — pressing the attack; 'home' — paddling
   * for the beach and ignoring everything else; 'lurk' — circling its own shore.
   */
  nativeState: 'hunt' | 'home' | 'lurk';
  /**
   * Faction flown at the masthead instead of the ship's own — false colours.
   * Nothing sets this yet; `seesThroughDisguise` hulls would ignore it.
   */
  falseFlag?: Faction;
  /** Hands still standing (fractional internally — casualties accrue with damage). */
  crew: number;
  maxCrew: number;
  /** Struck her colours: drifting under a white flag, silent guns, ready to board. */
  surrendered: boolean;
  /** Surrender rolls spent — a ship only gets so many chances to strike. */
  surrenderRolls: number;
  /** Taken as a prize: prize crew aboard, counts as cleared like a sinking. */
  captured: boolean;
}

/**
 * Where in the world the game is played — each has its own waters and islands.
 * Every era sails its own sea (see `ERA_REGION`): an era's waters are picked up
 * with the era, not chosen separately.
 */
export type RegionId =
  // Age of Sail
  | 'caribbean'
  | 'biscay'
  | 'northSea'
  | 'chesapeake'
  // Classical and medieval seas
  | 'mediterranean'
  | 'aegean'
  | 'bosporus'
  | 'ionian'
  | 'nileDelta'
  // Indian Ocean and the East
  | 'arabian'
  | 'bengal'
  | 'singapore'
  | 'tonkin'
  | 'inlandSea'
  | 'koreaStrait'
  // Polynesia and the Americas
  | 'bayOfIslands'
  | 'konaCoast'
  | 'peruvianCoast'
  | 'texcoco';

/** An enemy's colours, struck and carried home after a boarding. */
export interface CapturedFlag {
  faction: Faction;
  ship: string;
  wave: number;
}

/** Everything the player's ship carries — always visible in the HUD. */
export interface ShipInventory {
  crew: number;
  maxCrew: number;
  water: number;
  maxWater: number;
  food: number;
  maxFood: number;
  slaves: number;
  flags: CapturedFlag[];
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
  | 'chain'
  | 'grapeshot'
  | 'chaser';

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
  /** Prizes taken by boarding (never counted as sunk). */
  boarded?: number;
  /** Souls in irons below decks. */
  slaves?: number;
  /** Enemy colours struck and carried home. */
  flagsTaken?: number;
  /** Waters sailed, for the epitaph. */
  region?: RegionId;
  regionName?: string;
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
