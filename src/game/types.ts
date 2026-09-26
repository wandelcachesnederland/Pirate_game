export type Screen = 'menu' | 'playing' | 'paused' | 'upgrade' | 'gameover';

/**
 * What actually flies when a ship fires.
 *
 * `arrow`, `bolt`, `fireArrow`, `greekFire` and `stone` are the shots of the
 * pre-gunpowder seas (see `weapons.ts`): bowstrings, winch-drawn engines,
 * incendiaries and sling/torsion stones. Nothing among them goes off on impact
 * — what kills a hull without powder is fire and weight, not a blast.
 */
export type ProjectileKind =
  | 'arrow'
  | 'bolt'
  | 'fireArrow'
  | 'greekFire'
  | 'stone'
  | 'cannonball'
  | 'missile';

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
  // Age of Exploration — Iberian hulls of the 15th–16th centuries
  | 'caravel'
  | 'carrack'
  | 'nao'
  | 'pinnace'
  // Napoleonic — rated ships of the line and Company traders
  | 'seventyFour'
  | 'firstRate'
  | 'indiaman'
  | 'gunbrig'
  // Viking Age — clinker longships and traders
  | 'snekkja'
  | 'knarr'
  | 'dreki'
  | 'norseLongship'
  // Ironclad Era — steam, ram and armour
  | 'monitor'
  | 'casemateIronclad'
  | 'steamFrigate'
  | 'ramShip'
  | 'supplySteamer'
  // Heritage extras — period craft missing from thin rosters
  | 'liburna'
  | 'bireme'
  | 'sambuk'
  | 'fuchuan'
  | 'germCruiser'
  | 'ijnCruiser'
  // Phoenicia
  | 'hippos'
  | 'pentekonter'
  | 'tyrianKing'
  // Hanseatic
  | 'cog'
  | 'holk'
  | 'nef'
  | 'hansakogge'
  // Portuguese India
  | 'fusta'
  | 'caravelaLatina'
  | 'nauCapitana'
  // Spanish Armada
  | 'galleass'
  | 'flyboat'
  | 'urca'
  | 'armadaCapitana'
  // Dutch Golden Age
  | 'jacht'
  | 'pinas'
  | 'spiegelretour'
  // Pre-dreadnought
  | 'tb1890'
  | 'protectedCruiser'
  | 'collier'
  | 'borodino'
  // Falklands
  | 'argCorvette'
  | 'argDestroyer'
  | 'argSub'
  | 'belgrano'
  // Somali piracy — the Gulf of Aden and the Somali Basin
  | 'bulkCarrier'
  | 'containerShip'
  | 'rivalSkiff'
  | 'navRhib'
  | 'navFrigate'
  | 'pmpfBoat'
  | 'bainbridge'
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
  | 'cortesCapitana'
  // Great War at Sea — the Kaiser's navy
  | 'germTB'
  | 'germUboat'
  | 'germDrifter'
  | 'auxCruiser'
  | 'supplyShip'
  | 'munitionsShip'
  | 'kaiserBattleship'
  // Second World War at Sea — the Imperial Japanese Navy
  | 'ijnDestroyer'
  | 'ijnSub'
  | 'ijnEscort'
  | 'maru'
  | 'troopTransport'
  | 'ijnBattleship'
  // Tanker War — the Strait of Hormuz, 1988
  | 'usPatrol'
  | 'usDestroyer'
  | 'usFrigate'
  | 'tanker'
  | 'supertanker'
  // Barbary War — the corsairs of Tripoli
  | 'corsairXebec'
  | 'corsairPolacca'
  | 'tripoliGunboat'
  | 'corsairPrize'
  | 'tributePolacca'
  | 'meshuda';

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
  | 'aztec'
  // the new navies
  | 'usa'
  | 'germany'
  | 'ijn'
  | 'iran'
  | 'tripoli'
  | 'somalia';

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
  | 'atakebune'
  // steel: steam, oil and missile hulls (no canvas, wind means nothing)
  | 'warship'
  | 'submarine'
  | 'freighter'
  | 'tanker';

/** Every style that sails without canvas and ignores the wind outright. */
const STEEL_HULLS: readonly HullStyle[] = ['ironclad', 'warship', 'submarine', 'freighter', 'tanker'];

/** True for any powered, steel hull: sails are never drawn, the wind is ignored. */
export function isSteelHull(style: HullStyle | undefined): boolean {
  return style !== undefined && STEEL_HULLS.includes(style);
}

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
  | 'aztec'
  // the steel navies and the shore of Tripoli
  | 'ww1'
  | 'ww2'
  | 'hormuz'
  | 'barbary'
  // flagged missing periods, now playable
  | 'phoenicia'
  | 'hanse'
  | 'portugal'
  | 'armada'
  | 'dutch'
  | 'ottoman'
  | 'predread'
  | 'falklands'
  | 'somali';

/**
 * The voyage's peril, chosen on the start screen. Buccaneer is the voyage as
 * it was sailed; the seas below and above it scale every foe, fort and fortune
 * (see `game/difficulty.ts`).
 */
export type DifficultyId =
  | 'landlubber'
  | 'swashbuckler'
  | 'buccaneer'
  | 'dreadCaptain'
  | 'kingOfTheSeas';

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
  /** Weapon stations per side (bows / pulley launchers in early eras). */
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
  weapon?: 'mechanical' | 'gunpowder';
  /**
   * What this hull's broadsides actually are — arrows, bolts, shot or a
   * guided missile. Left out, the era's default projectile is used
   * (see `projectileFor`).
   */
  projectile?: ProjectileKind;
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
  /**
   * Seconds of fire left burning in this hull (0 = not alight). Without powder
   * a ship is killed by fire, so a hit from a fire arrow or a Greek-fire siphon
   * leaves her burning: see `igniteShip` / `updateBurning` in the engine.
   */
  burn: number;
  /** Fire damage per second, as a fraction of this hull's own maximum. */
  burnRate: number;
  /** Countdown to the next burn tick (keeps the damage in readable bites). */
  burnTick: number;
  /** The fire was started by the player's shot — sinking her counts against them. */
  burnFromPlayer: boolean;
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
  /** Village this boat belongs to; wave flotillas have none. */
  homeIsland?: Island | null;
  /**
   * A village fishing boat: no fight in her. She works the shallows off her own
   * beach, runs from a warship, and sinking her is what turns a mild village
   * into an enemy.
   */
  peaceful?: boolean;
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
  | 'texcoco'
  // the steel navies and the Barbary shore
  | 'doggerBank'
  | 'coralSea'
  | 'hormuz'
  | 'barbary'
  | 'gulfOfAden';

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
  prisoners: number;
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
  | 'chaser'
  // hull fittings — fixed to the hull, era-named (see hullFittings.ts)
  | 'ram'
  | 'spikes'
  | 'fenders';

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
  prisoners?: number;
  /** Enemy colours struck and carried home. */
  flagsTaken?: number;
  /** Waters sailed, for the epitaph. */
  region?: RegionId;
  regionName?: string;
  /** The peril chosen on the start screen. */
  difficulty?: DifficultyId;
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
  /**
   * Who lives here, how glad they are to see a strange sail, and how much they
   * will take before they fight. Every island gets one; uninhabited islands just
   * have `inhabited: false` and no opinions.
   */
  settlement: Settlement;
}

/** A stone battery on an inhabited island: it answers a hostile sail with shot. */
export interface Fortress {
  hp: number;
  maxHp: number;
  /** Guns in one salvo. */
  guns: number;
  /** How far out from the island the guns will reach. */
  range: number;
  /** Seconds between salvoes. */
  reload: number;
  /** Countdown to the next salvo. */
  timer: number;
  damage: number;
  ballSpeed: number;
  /** Bearing of the battery on the island's shore (world radians). */
  angle: number;
  /** Walls down and guns spiked — silent for the rest of the run. */
  ruined: boolean;
  /**
   * Bearing of the harbour the fort guards (world radians). A fortified
   * island is a harbour town: its squadron puts out from this mouth.
   */
  harbour?: number;
}

/**
 * An island's people. They start with a `friendliness` (0 = every sail is an
 * enemy, 100 = saints) which sets their `patience`: the number of grievances
 * they will swallow. `anger` counts the grievances the player has given them —
 * a round into a fishing canoe, a sunk boat, a shell into their village. Cross
 * the patience line and they are `hostile` until tempers cool.
 */
export interface Settlement {
  inhabited: boolean;
  friendliness: number;
  anger: number;
  patience: number;
  /** Village name, for the log. */
  name: string;
  /** Shared political identity, independent of this village's name. */
  peopleId?: string;
  peopleName?: string;
  /** A mutual-defence bloc shared by different peoples. */
  allianceId?: string;
  allianceName?: string;
  /** Local war-party launch cooldown. */
  raidTimer?: number;
  fortress?: Fortress;
  hostile: boolean;
  /** Seconds since the last grievance — how long they have been angry. */
  calm: number;
}

/** Who lives in a stretch of water: how often, how friendly, how fortified. */
export interface PeopleSpec {
  /** Chance an island here is inhabited at all. */
  inhabited: number;
  /** Friendliness rolled for a village, low..high. */
  friendliness: [number, number];
  /** Chance an inhabited island also carries a fort (the chart caps the total). */
  fort: number;
  /** Village names drawn on for this sea. */
  names: string[];
}
