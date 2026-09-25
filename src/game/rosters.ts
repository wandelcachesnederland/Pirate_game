// Enemy fleet rosters per era: which ships each age sends against you.
// The five sail / steam eras share the classic roster; each Heritage sea
// fields its own period-flavoured enemies (galleys, dhows, junks, war canoes).
import type { EraId, ShipKind } from './types';

export interface RosterEntry {
  kind: ShipKind;
  /** wave-budget cost: bigger ships eat more of the wave's spawn budget */
  cost: number;
  /** relative spawn weight within the pool */
  weight: number;
  /** waves below this never field this ship */
  minWave?: number;
  /** kept off boss waves (the jackpot ship already sails there) */
  noBossWave?: boolean;
}

export interface EraRoster {
  /** scripted opening waves 1-5 */
  early: [ShipKind[], ShipKind[], ShipKind[], ShipKind[], ShipKind[]];
  /** boss ship on every 5th wave (1 at wave 5, up to 3 by wave 15+) */
  boss: ShipKind;
  /** jackpot treasure ship escorted on boss waves */
  jackpot: ShipKind;
  /** guaranteed fat-but-weak plunder ship in every wave 6+ */
  trader: ShipKind;
  /** budget-spent random pool for waves 6+ */
  pool: RosterEntry[];
  /** banner titles for waves 1-5 */
  titles: [string, string, string, string, string];
  /** banner title for boss waves */
  bossTitle: string;
  /** flavour lines rotating on ordinary waves 6+ */
  lines: string[];
}

export const SAIL_ROSTER: EraRoster = {
  early: [
    ['sloop', 'sloop', 'merchant'],
    ['sloop', 'sloop', 'brig'],
    ['sloop', 'fireship', 'fireship'],
    ['brig', 'frigate', 'schooner'],
    ['manowar'],
  ],
  boss: 'manowar',
  jackpot: 'galleon',
  trader: 'merchant',
  pool: [
    { kind: 'sloop', cost: 1.2, weight: 3 },
    { kind: 'brig', cost: 2, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2 },
    { kind: 'frigate', cost: 3.2, weight: 2 },
    { kind: 'merchant', cost: 0.8, weight: 1 },
    { kind: 'schooner', cost: 1.4, weight: 2 },
    { kind: 'cutter', cost: 1.5, weight: 2 },
    { kind: 'corvette', cost: 2.6, weight: 2 },
    { kind: 'lugger', cost: 1.0, weight: 2, minWave: 5 },
    { kind: 'gunboat', cost: 0.9, weight: 1, minWave: 4 },
    { kind: 'xebec', cost: 1.6, weight: 2, minWave: 6 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 4 },
    { kind: 'privateer', cost: 3.4, weight: 1, minWave: 6 },
    { kind: 'bombketch', cost: 2.8, weight: 1, minWave: 7 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
    { kind: 'galleon', cost: 5.5, weight: 1, minWave: 8, noBossWave: true },
    { kind: 'warCanoe', cost: 1.1, weight: 1, minWave: 9 },
  ],
  titles: [
    'A merchant convoy — plunder it!',
    'The Guarda Costa gives chase!',
    'Beware the fire ships!',
    'The Royal Navy has arrived!',
    "A Man-o'-War approaches!",
  ],
  bossTitle: 'The Armada sails — with a treasure galleon!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Captain!',
    'No quarter given!',
    'Blood in the water...',
    'The Crown has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const ROMAN_ROSTER: EraRoster = {
  early: [
    ['carthTrader', 'carthTrader', 'carthGalley'],
    ['carthGalley', 'carthGalley', 'cilician'],
    ['fireship', 'fireship', 'carthGalley'],
    ['carthGalley', 'carthGalley', 'carthTrader', 'cilician'],
    ['carthSeven'],
  ],
  boss: 'carthSeven',
  jackpot: 'carthTrader',
  trader: 'carthTrader',
  pool: [
    { kind: 'carthGalley', cost: 2.2, weight: 3 },
    { kind: 'cilician', cost: 1.3, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'carthTrader', cost: 0.8, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A Carthaginian convoy — ram it!',
    'Punic galleys give chase!',
    'Beware the fire rafts!',
    'Carthage sends its wolves!',
    "A Carthaginian 'Seven' approaches!",
  ],
  bossTitle: "Carthage sails — with a treasure-laden round ship!",
  lines: [
    'More oars on the horizon!',
    'They want your head, Centurion!',
    'Carthago delenda est!',
    'Blood in the water...',
    'The Senate has doubled your bounty!',
    'Punic hunters close in from all sides!',
  ],
};

export const GREEK_ROSTER: EraRoster = {
  early: [
    ['persTransport', 'persTransport', 'phoenTrireme'],
    ['phoenTrireme', 'phoenTrireme', 'ionianGalley'],
    ['fireship', 'fireship', 'phoenTrireme'],
    ['phoenTrireme', 'ionianGalley', 'persTransport', 'ionianGalley'],
    ['sidonianRoyal'],
  ],
  boss: 'sidonianRoyal',
  jackpot: 'persTransport',
  trader: 'persTransport',
  pool: [
    { kind: 'phoenTrireme', cost: 2.2, weight: 3 },
    { kind: 'ionianGalley', cost: 1.3, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'persTransport', cost: 0.8, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Persian transports — sink them all!',
    'Phoenician triremes give chase!',
    'Beware the fire rafts!',
    'The Great King sends his wolves!',
    'A Sidonian royal galley approaches!',
  ],
  bossTitle: 'The Great King sails — with a treasure fleet!',
  lines: [
    'More oars on the horizon!',
    'They want your head, Strategos!',
    'Remember Salamis!',
    'Blood in the water...',
    'Xerxes has doubled your bounty!',
    'Persian hunters close in from all sides!',
  ],
};

export const ARAB_ROSTER: EraRoster = {
  early: [
    ['baghlah', 'baghlah', 'ghurab'],
    ['warDhow', 'ghurab', 'ghurab'],
    ['fireship', 'fireship', 'warDhow'],
    ['warDhow', 'warDhow', 'ghurab', 'baghlah'],
    ['sultanFlagship'],
  ],
  boss: 'sultanFlagship',
  jackpot: 'baghlah',
  trader: 'baghlah',
  pool: [
    { kind: 'warDhow', cost: 2.2, weight: 3 },
    { kind: 'ghurab', cost: 1.3, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'baghlah', cost: 1.2, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A treasure convoy — plunder it!',
    'Corsair dhows give chase!',
    'Beware the fire ships!',
    'The Sultan sends his wolves!',
    "The Sultan's flagship approaches!",
  ],
  bossTitle: "The Sultan sails — with a treasure-laden baghlah!",
  lines: [
    'More sails on the horizon!',
    'They want your head, Captain!',
    'No quarter given!',
    'Blood in the water...',
    'The Sultan has doubled your bounty!',
    'Corsairs close in from all sides!',
  ],
};

export const CHINESE_ROSTER: EraRoster = {
  early: [
    ['grainJunk', 'grainJunk', 'wokouJunk'],
    ['warlordJunk', 'wokouJunk', 'wokouJunk'],
    ['fireship', 'fireship', 'warlordJunk'],
    ['warlordJunk', 'wokouJunk', 'grainJunk', 'wokouJunk'],
    ['pirateKing'],
  ],
  boss: 'pirateKing',
  jackpot: 'grainJunk',
  trader: 'grainJunk',
  pool: [
    { kind: 'warlordJunk', cost: 2.6, weight: 3 },
    { kind: 'wokouJunk', cost: 1.6, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'grainJunk', cost: 1.2, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A tribute convoy — seize it!',
    'Wokou raiders give chase!',
    'Beware the fire ships!',
    'The warlord sends his wolves!',
    'The Red Flag pirate king approaches!',
  ],
  bossTitle: 'The pirate king sails — with a tribute fleet!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Captain!',
    'No quarter given!',
    'Blood in the water...',
    'The Emperor has doubled your bounty!',
    'Raiders close in from all sides!',
  ],
};

export const JAPANESE_ROSTER: EraRoster = {
  early: [
    ['riceBune', 'riceBune', 'kobaya'],
    ['sekiBune', 'kobaya', 'kobaya'],
    ['fireship', 'fireship', 'sekiBune'],
    ['sekiBune', 'sekiBune', 'kobaya', 'riceBune'],
    ['moriFlagship'],
  ],
  boss: 'moriFlagship',
  jackpot: 'riceBune',
  trader: 'riceBune',
  pool: [
    { kind: 'sekiBune', cost: 2.2, weight: 3 },
    { kind: 'kobaya', cost: 1.1, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'riceBune', cost: 1.0, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A rice convoy — seize it!',
    'Enemy bune give chase!',
    'Beware the fire ships!',
    'The daimyo sends his wolves!',
    'A Mōri flagship approaches!',
  ],
  bossTitle: 'The Mōri sail — with a rice fleet!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Captain!',
    'No quarter given!',
    'Blood in the water...',
    'The Shogun has doubled your bounty!',
    'Enemy bune close in from all sides!',
  ],
};

export const MAORI_ROSTER: EraRoster = {
  early: [
    ['flaxTrader', 'rivalWaka', 'flaxTrader'],
    ['rivalWaka', 'rivalWaka', 'flaxTrader'],
    ['fireship', 'rivalWaka', 'rivalWaka'],
    ['rivalWaka', 'rivalWaka', 'flaxTrader', 'rivalWaka'],
    ['arikiWaka'],
  ],
  boss: 'arikiWaka',
  jackpot: 'flaxTrader',
  trader: 'flaxTrader',
  pool: [
    { kind: 'rivalWaka', cost: 1.8, weight: 3 },
    { kind: 'warCanoe', cost: 1.1, weight: 2 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'flaxTrader', cost: 0.8, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Musket traders — seize their cargo!',
    'Rival waka give chase!',
    'Beware the fire rafts!',
    'The iwi sends its warriors!',
    'An ariki great waka approaches!',
  ],
  bossTitle: 'The ariki sails — with a musket-laden trader!',
  lines: [
    'More paddles on the horizon!',
    'They want your head, Toa!',
    'No quarter given!',
    'Blood in the water...',
    'The ariki has doubled your bounty!',
    'Warriors close in from all sides!',
  ],
};

export const HAWAII_ROSTER: EraRoster = {
  early: [
    ['sandTrader', 'rivalWaa', 'sandTrader'],
    ['rivalWaa', 'rivalWaa', 'sandTrader'],
    ['fireship', 'rivalWaa', 'rivalWaa'],
    ['rivalWaa', 'rivalWaa', 'sandTrader', 'rivalWaa'],
    ['kauaiFlagship'],
  ],
  boss: 'kauaiFlagship',
  jackpot: 'sandTrader',
  trader: 'sandTrader',
  pool: [
    { kind: 'rivalWaa', cost: 1.8, weight: 3 },
    { kind: 'warCanoe', cost: 1.1, weight: 2 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'sandTrader', cost: 0.8, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Sandalwood traders — seize them!',
    "Rival wa'a give chase!",
    'Beware the fire rafts!',
    'The moku sends its warriors!',
    "A Kaua'i royal canoe approaches!",
  ],
  bossTitle: "The royals sail — with a sandalwood-laden trader!",
  lines: [
    'More paddles on the horizon!',
    'They want your head, Koa!',
    'No quarter given!',
    'Blood in the water...',
    'The aliʻi has doubled your bounty!',
    'Warriors close in from all sides!',
  ],
};

export const MACEDON_ROSTER: EraRoster = {
  early: [
    ['alexGrain', 'alexGrain', 'ptolemGalley'],
    ['ptolemGalley', 'ptolemGalley', 'rhodesTrieres'],
    ['fireship', 'fireship', 'ptolemGalley'],
    ['ptolemGalley', 'rhodesTrieres', 'alexGrain', 'cilician'],
    ['ptolemFlagship'],
  ],
  boss: 'ptolemFlagship',
  jackpot: 'alexGrain',
  trader: 'alexGrain',
  pool: [
    { kind: 'ptolemGalley', cost: 2.2, weight: 3 },
    { kind: 'rhodesTrieres', cost: 1.4, weight: 3 },
    { kind: 'cilician', cost: 1.3, weight: 2, minWave: 4 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'alexGrain', cost: 0.8, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Alexandrian grain ships — seize them!',
    'Ptolemaic galleys give chase!',
    'Beware the fire ships!',
    'Rhodes sends its wolves!',
    "Ptolemy's flagship approaches!",
  ],
  bossTitle: "Ptolemy sails — with Alexandria's grain!",
  lines: [
    'More oars on the horizon!',
    'They want your head, Basileus!',
    'For Alexander!',
    'Blood in the water...',
    'Ptolemy has doubled your bounty!',
    'Enemy galleys close in from all sides!',
  ],
};

export const MAYA_ROSTER: EraRoster = {
  early: [
    ['cacaoTrader', 'mayaRival', 'cacaoTrader'],
    ['mayaRival', 'mayaRival', 'cacaoTrader'],
    ['fireship', 'mayaRival', 'mayaRival'],
    ['mayaRival', 'mayaRival', 'cacaoTrader', 'mayaRival'],
    ['conqCapitana'],
  ],
  boss: 'conqCapitana',
  jackpot: 'cacaoTrader',
  trader: 'cacaoTrader',
  pool: [
    { kind: 'mayaRival', cost: 1.8, weight: 3 },
    { kind: 'conqCaravel', cost: 2.6, weight: 2, minWave: 6 },
    { kind: 'warCanoe', cost: 1.1, weight: 2 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'cacaoTrader', cost: 0.8, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A rival trading fleet — seize the cacao!',
    'Rival ahauob give chase!',
    'Beware the fire rafts!',
    'The kuchkabal sends its warriors!',
    'A white-winged canoe from the east!',
  ],
  bossTitle: 'The strangers return — drive them off!',
  lines: [
    'More paddles on the horizon!',
    'They want your head, Ahau!',
    'No quarter given!',
    'Blood in the water...',
    'The strangers have doubled your bounty!',
    'Warriors close in from all sides!',
  ],
};

export const INCA_ROSTER: EraRoster = {
  early: [
    ['spondylusTrader', 'punaBalsa', 'spondylusTrader'],
    ['punaBalsa', 'punaBalsa', 'rivalBalsa'],
    ['fireship', 'punaBalsa', 'punaBalsa'],
    ['punaBalsa', 'rivalBalsa', 'spondylusTrader', 'punaBalsa'],
    ['punaArmada'],
  ],
  boss: 'punaArmada',
  jackpot: 'spondylusTrader',
  trader: 'spondylusTrader',
  pool: [
    { kind: 'punaBalsa', cost: 1.8, weight: 3 },
    { kind: 'rivalBalsa', cost: 2.2, weight: 2 },
    { kind: 'warCanoe', cost: 1.1, weight: 2 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'spondylusTrader', cost: 0.8, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Spondylus traders — seize the red gold!',
    'Puná war balsas give chase!',
    'Beware the fire rafts!',
    'The islanders send their wolves!',
    'The Puná island armada approaches!',
  ],
  bossTitle: 'The Puná sail — with a spondylus fleet!',
  lines: [
    'More paddles on the horizon!',
    'They want your head, Apu!',
    'For the Sapa Inca!',
    'Blood in the water...',
    'The islanders have doubled your bounty!',
    'War balsas close in from all sides!',
  ],
};

export const ERA_ROSTERS: Record<EraId, EraRoster> = {
  golden: SAIL_ROSTER,
  exploration: SAIL_ROSTER,
  napoleonic: SAIL_ROSTER,
  viking: SAIL_ROSTER,
  ironclad: SAIL_ROSTER,
  roman: ROMAN_ROSTER,
  greek: GREEK_ROSTER,
  arab: ARAB_ROSTER,
  chinese: CHINESE_ROSTER,
  japanese: JAPANESE_ROSTER,
  maori: MAORI_ROSTER,
  hawaii: HAWAII_ROSTER,
  macedon: MACEDON_ROSTER,
  maya: MAYA_ROSTER,
  inca: INCA_ROSTER,
};
