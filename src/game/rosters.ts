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

export const EXPLORATION_ROSTER: EraRoster = {
  early: [
    ['pinnace', 'pinnace', 'nao'],
    ['caravel', 'caravel', 'pinnace'],
    ['fireship', 'fireship', 'caravel'],
    ['carrack', 'caravel', 'nao', 'pinnace'],
    ['carrack'],
  ],
  boss: 'carrack',
  jackpot: 'nao',
  trader: 'nao',
  pool: [
    { kind: 'caravel', cost: 1.4, weight: 3 },
    { kind: 'pinnace', cost: 1.0, weight: 3 },
    { kind: 'carrack', cost: 3.6, weight: 2, minWave: 5 },
    { kind: 'nao', cost: 1.6, weight: 1 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 3 },
    { kind: 'lugger', cost: 1.0, weight: 1, minWave: 5 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A nao convoy — the spices of the Indies!',
    'Caravels give chase!',
    'Beware the fire ships!',
    'The Casa de Contratación sends its wolves!',
    'A great carrack approaches!',
  ],
  bossTitle: 'The Indies fleet sails — with a treasure nao!',
  lines: [
    'More lateens on the horizon!',
    'They want your charts, Captain!',
    'No quarter given!',
    'Blood in the water...',
    'The Crown has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const NAPOLEONIC_ROSTER: EraRoster = {
  early: [
    ['gunbrig', 'merchant', 'cutter'],
    ['brig', 'gunbrig', 'cutter'],
    ['fireship', 'fireship', 'brig'],
    ['frigate', 'corvette', 'gunbrig'],
    ['seventyFour'],
  ],
  boss: 'firstRate',
  jackpot: 'indiaman',
  trader: 'indiaman',
  pool: [
    { kind: 'cutter', cost: 1.4, weight: 2 },
    { kind: 'gunbrig', cost: 1.6, weight: 3 },
    { kind: 'brig', cost: 2.0, weight: 3 },
    { kind: 'corvette', cost: 2.6, weight: 2 },
    { kind: 'frigate', cost: 3.2, weight: 2 },
    { kind: 'seventyFour', cost: 4.4, weight: 1, minWave: 7 },
    { kind: 'bombketch', cost: 2.8, weight: 1, minWave: 6 },
    { kind: 'fireship', cost: 1.2, weight: 2 },
    { kind: 'indiaman', cost: 2.2, weight: 1, noBossWave: true },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A Company convoy — take the Indiaman!',
    'Gun-brigs give chase!',
    'Beware the fire ships!',
    'A frigate squadron has arrived!',
    'A seventy-four approaches!',
  ],
  bossTitle: 'A first-rate flagship sails — with an East Indiaman!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Captain!',
    'England expects!',
    'Blood in the water...',
    'The Admiralty has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const VIKING_ROSTER: EraRoster = {
  early: [
    ['knarr', 'knarr', 'snekkja'],
    ['snekkja', 'snekkja', 'norseLongship'],
    ['fireship', 'fireship', 'snekkja'],
    ['norseLongship', 'snekkja', 'knarr', 'norseLongship'],
    ['dreki'],
  ],
  boss: 'dreki',
  jackpot: 'knarr',
  trader: 'knarr',
  pool: [
    { kind: 'snekkja', cost: 1.1, weight: 3 },
    { kind: 'norseLongship', cost: 2.0, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'knarr', cost: 0.9, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A knarr convoy — take the walrus ivory!',
    'Snekkjur give chase!',
    'Beware the fire ships!',
    'The jarl sends his wolves!',
    'A dreki dragon-ship approaches!',
  ],
  bossTitle: 'The dragon-ships sail — with a laden knarr!',
  lines: [
    'More oars on the horizon!',
    'They want your head, Hersir!',
    'Odin owns you all!',
    'Blood in the water...',
    'The thing has doubled your bounty!',
    'Raiders close in from all sides!',
  ],
};

export const IRONCLAD_ROSTER: EraRoster = {
  early: [
    ['supplySteamer', 'supplySteamer', 'monitor'],
    ['monitor', 'ramShip', 'supplySteamer'],
    ['ramShip', 'ramShip', 'monitor'],
    ['steamFrigate', 'monitor', 'supplySteamer', 'ramShip'],
    ['casemateIronclad'],
  ],
  boss: 'casemateIronclad',
  jackpot: 'supplySteamer',
  trader: 'supplySteamer',
  pool: [
    { kind: 'monitor', cost: 2.2, weight: 3 },
    { kind: 'ramShip', cost: 1.8, weight: 3 },
    { kind: 'steamFrigate', cost: 3.0, weight: 2, minWave: 4 },
    { kind: 'supplySteamer', cost: 1.2, weight: 1 },
    { kind: 'gunboat', cost: 1.0, weight: 2 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A supply steamer — cut the coal!',
    'Monitors give chase!',
    'Beware the rams!',
    'A steam frigate has arrived!',
    'A casemate ironclad approaches!',
  ],
  bossTitle: 'The iron fleet sails — with a laden steamer!',
  lines: [
    'More smoke on the horizon!',
    'They want your hull, Captain!',
    'Damn the torpedoes!',
    'Blood in the water...',
    'The Navy Department has doubled your bounty!',
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
    { kind: 'liburna', cost: 1.0, weight: 2 },
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
    { kind: 'bireme', cost: 1.1, weight: 2 },
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
    { kind: 'sambuk', cost: 1.2, weight: 2 },
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
    { kind: 'fuchuan', cost: 2.0, weight: 2 },
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

export const LEPANTO_ROSTER: EraRoster = {
  early: [
    ['venetianTrader', 'venetianTrader', 'venetianGalley'],
    ['venetianGalley', 'venetianGalley', 'spanishGalley'],
    ['fireship', 'fireship', 'spanishGalley'],
    ['venetianGalley', 'spanishGalley', 'venetianTrader', 'spanishGalley'],
    ['laReal'],
  ],
  boss: 'laReal',
  jackpot: 'venetianTrader',
  trader: 'venetianTrader',
  pool: [
    { kind: 'venetianGalley', cost: 2.2, weight: 3 },
    { kind: 'spanishGalley', cost: 2.4, weight: 2 },
    { kind: 'venetianTrader', cost: 1.0, weight: 1 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A Venetian convoy — take it!',
    'Galleys of the League give chase!',
    'Beware the fire ships!',
    'Don Juan sends his wolves!',
    "Don Juan's La Real approaches!",
  ],
  bossTitle: 'The Holy League sails — with a treasure convoy!',
  lines: [
    'More oars on the horizon!',
    'They want your head, Pasha!',
    'For the Sultan!',
    'Blood in the water...',
    'Venice has doubled your bounty!',
    'The League closes in from all sides!',
  ],
};

export const KOREA_ROSTER: EraRoster = {
  early: [
    ['riceBune', 'riceBune', 'kobaya'],
    ['sekiBune', 'kobaya', 'kobaya'],
    ['fireship', 'fireship', 'sekiBune'],
    ['sekiBune', 'sekiBune', 'kobaya', 'riceBune'],
    ['japanFlagship'],
  ],
  boss: 'japanFlagship',
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
    'Japanese supply ships — burn them!',
    'Samurai bune give chase!',
    'Beware the fire ships!',
    'Hideyoshi sends his wolves!',
    'The samurai flagship approaches!',
  ],
  bossTitle: 'Hideyoshi sails — with a supply fleet!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Admiral!',
    'Hold the strait!',
    'Blood in the water...',
    'Hideyoshi has doubled your bounty!',
    'Enemy bune close in from all sides!',
  ],
};

export const BYZANTIUM_ROSTER: EraRoster = {
  early: [
    ['umayyadSupply', 'umayyadSupply', 'umayyadGalley'],
    ['umayyadGalley', 'umayyadGalley', 'shalandi'],
    ['fireship', 'fireship', 'umayyadGalley'],
    ['umayyadGalley', 'shalandi', 'umayyadSupply', 'shalandi'],
    ['maslamaFlagship'],
  ],
  boss: 'maslamaFlagship',
  jackpot: 'umayyadSupply',
  trader: 'umayyadSupply',
  pool: [
    { kind: 'umayyadGalley', cost: 2.2, weight: 3 },
    { kind: 'shalandi', cost: 1.3, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'umayyadSupply', cost: 0.8, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Arab supply ships — burn them!',
    'Umayyad galleys give chase!',
    'Beware the fire ships!',
    'The Caliph sends his wolves!',
    "Maslama's flagship approaches!",
  ],
  bossTitle: 'Maslama sails — with a supply fleet!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Drungarios!',
    'For Constantinople!',
    'Blood in the water...',
    'The Caliph has doubled your bounty!',
    'Arab galleys close in from all sides!',
  ],
};

export const EGYPT_ROSTER: EraRoster = {
  early: [
    ['clanShip', 'clanShip', 'sherdenRaider'],
    ['sherdenGalley', 'sherdenRaider', 'sherdenRaider'],
    ['fireship', 'sherdenGalley', 'sherdenRaider'],
    ['sherdenGalley', 'sherdenGalley', 'clanShip', 'sherdenRaider'],
    ['sherdenArmada'],
  ],
  boss: 'sherdenArmada',
  jackpot: 'clanShip',
  trader: 'clanShip',
  pool: [
    { kind: 'sherdenGalley', cost: 2.2, weight: 3 },
    { kind: 'sherdenRaider', cost: 1.3, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'clanShip', cost: 0.8, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Clan ships of the Sea Peoples — sink them!',
    'Sherden raiders give chase!',
    'Beware the fire rafts!',
    'The North sends its wolves!',
    'The great Sherden armada approaches!',
  ],
  bossTitle: 'The Sea Peoples sail — with their clan ships!',
  lines: [
    'More oars on the horizon!',
    'They want your head, Commander!',
    'For Pharaoh!',
    'Blood in the water...',
    'The Sherden have doubled your bounty!',
    'Raiders close in from all sides!',
  ],
};

export const CHOLA_ROSTER: EraRoster = {
  early: [
    ['spiceTrader', 'spiceTrader', 'srivScout'],
    ['srivJong', 'srivScout', 'srivScout'],
    ['fireship', 'fireship', 'srivJong'],
    ['srivJong', 'srivScout', 'spiceTrader', 'srivScout'],
    ['royalJong'],
  ],
  boss: 'royalJong',
  jackpot: 'spiceTrader',
  trader: 'spiceTrader',
  pool: [
    { kind: 'srivJong', cost: 2.6, weight: 3 },
    { kind: 'srivScout', cost: 1.2, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'spiceTrader', cost: 1.2, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Spice traders — seize the cargo!',
    'War jongs give chase!',
    'Beware the fire ships!',
    'The Maharaja sends his wolves!',
    'The Srivijayan royal jong approaches!',
  ],
  bossTitle: 'The Maharaja sails — with a spice fleet!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Captain!',
    'For the Tiger!',
    'Blood in the water...',
    'The Maharaja has doubled your bounty!',
    'Jongs close in from all sides!',
  ],
};

export const VIETNAM_ROSTER: EraRoster = {
  early: [
    ['grainJunk', 'grainJunk', 'yuanScout'],
    ['warlordJunk', 'yuanScout', 'yuanScout'],
    ['fireship', 'fireship', 'warlordJunk'],
    ['warlordJunk', 'yuanScout', 'grainJunk', 'yuanScout'],
    ['yuanFlagship'],
  ],
  boss: 'yuanFlagship',
  jackpot: 'grainJunk',
  trader: 'grainJunk',
  pool: [
    { kind: 'warlordJunk', cost: 2.6, weight: 3 },
    { kind: 'yuanScout', cost: 1.5, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'grainJunk', cost: 1.2, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Mongol supply junks — burn them!',
    'Yuan war junks give chase!',
    'Beware the fire rafts!',
    'The Khan sends his wolves!',
    'The Mongol flagship approaches!',
  ],
  bossTitle: 'The Khan sails — with a supply fleet!',
  lines: [
    'More sails on the horizon!',
    'They want your head, General!',
    'For Đại Việt!',
    'Blood in the water...',
    'The Khan has doubled your bounty!',
    'Yuan junks close in from all sides!',
  ],
};

export const AZTEC_ROSTER: EraRoster = {
  early: [
    ['supplyBrig', 'tlaxCanoe', 'supplyBrig'],
    ['tlaxCanoe', 'tlaxCanoe', 'spanBrigantine'],
    ['fireship', 'tlaxCanoe', 'spanBrigantine'],
    ['spanBrigantine', 'tlaxCanoe', 'supplyBrig', 'tlaxCanoe'],
    ['cortesCapitana'],
  ],
  boss: 'cortesCapitana',
  jackpot: 'supplyBrig',
  trader: 'supplyBrig',
  pool: [
    { kind: 'spanBrigantine', cost: 2.0, weight: 3 },
    { kind: 'tlaxCanoe', cost: 1.6, weight: 3 },
    { kind: 'warCanoe', cost: 1.1, weight: 2 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'supplyBrig', cost: 0.8, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Spanish supply brigs — seize them!',
    'Brigantines give chase!',
    'Beware the fire rafts!',
    'Cortés sends his wolves!',
    "Cortés's lake capitana approaches!",
  ],
  bossTitle: 'Cortés sails — with a supply fleet!',
  lines: [
    'More sails on the lake!',
    'They want your head, Tlatoani!',
    'For Tenochtitlan!',
    'Blood in the water...',
    'Cortés has doubled your bounty!',
    'Brigantines close in from all sides!',
  ],
};


// ── 1916 · the Kaiser's navy against the Dover patrol ──────────────────────
export const WW1_ROSTER: EraRoster = {
  early: [
    ['supplyShip', 'supplyShip', 'germDrifter'],
    ['germTB', 'germTB', 'supplyShip'],
    ['germUboat', 'germUboat', 'germTB'],
    ['auxCruiser', 'germTB', 'supplyShip', 'germDrifter'],
    ['kaiserBattleship'],
  ],
  boss: 'kaiserBattleship',
  jackpot: 'munitionsShip',
  trader: 'supplyShip',
  pool: [
    { kind: 'germTB', cost: 2.0, weight: 3 },
    { kind: 'germUboat', cost: 1.9, weight: 2, minWave: 3 },
    { kind: 'germDrifter', cost: 1.2, weight: 2 },
    { kind: 'supplyShip', cost: 0.9, weight: 1 },
    { kind: 'auxCruiser', cost: 2.8, weight: 2, minWave: 5 },
    { kind: 'germCruiser', cost: 3.4, weight: 1, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A supply convoy — cut it off!',
    'Torpedo boats give chase!',
    'Periscope sights — steel wolves!',
    'The raider lines are out!',
    "A Kaiser's dreadnought approaches!",
  ],
  bossTitle: 'The High Seas Fleet sails — with a munitions ship!',
  lines: [
    'More smoke on the horizon!',
    'They want your head, Captain!',
    'Mind the mines!',
    'Blood in the water...',
    'The Admiralty has doubled your bounty!',
    'Hun hunters close in from all sides!',
  ],
};

// ── 1943 · the Solomons, the Tokyo Express ─────────────────────────────────
export const WW2_ROSTER: EraRoster = {
  early: [
    ['maru', 'maru', 'ijnEscort'],
    ['ijnDestroyer', 'ijnEscort', 'maru'],
    ['ijnSub', 'ijnSub', 'ijnDestroyer'],
    ['ijnDestroyer', 'ijnDestroyer', 'maru', 'ijnEscort'],
    ['ijnBattleship'],
  ],
  boss: 'ijnBattleship',
  jackpot: 'troopTransport',
  trader: 'maru',
  pool: [
    { kind: 'ijnDestroyer', cost: 2.6, weight: 3 },
    { kind: 'ijnEscort', cost: 1.6, weight: 2 },
    { kind: 'ijnCruiser', cost: 3.6, weight: 1, minWave: 6 },
    { kind: 'ijnSub', cost: 1.9, weight: 2, minWave: 3 },
    { kind: 'maru', cost: 1.1, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Tokyo Express barges — intercept!',
    'Enemy destroyers give chase!',
    'Depth charge watch — submarines!',
    'The perimeter is tested!',
    'A super battleship approaches!',
  ],
  bossTitle: 'The Combined Fleet sails — with a troop convoy!',
  lines: [
    'More wakes on the horizon!',
    'They want your head, Captain!',
    'Hold the line!',
    'Blood in the water...',
    'CINCPAC has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

// ── 1988 · the Tanker War, the Strait of Hormuz ────────────────────────────
export const HORMUZ_ROSTER: EraRoster = {
  early: [
    ['tanker', 'tanker', 'usPatrol'],
    ['usPatrol', 'usPatrol', 'tanker'],
    ['usDestroyer', 'usPatrol', 'usPatrol'],
    ['usDestroyer', 'usDestroyer', 'tanker', 'usPatrol'],
    ['usFrigate'],
  ],
  boss: 'usFrigate',
  jackpot: 'supertanker',
  trader: 'tanker',
  pool: [
    { kind: 'usPatrol', cost: 1.3, weight: 3 },
    { kind: 'usDestroyer', cost: 2.9, weight: 2, minWave: 3 },
    { kind: 'tanker', cost: 1.8, weight: 1 },
    { kind: 'fishingCanoe', cost: 0.6, weight: 1, minWave: 4 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A tanker convoy — hit the crude!',
    'Patrol boats give chase!',
    'Beware the mines — and the escorts!',
    'The Fifth Fleet has arrived!',
    'A guided-missile frigate approaches!',
  ],
  bossTitle: 'The US Navy sails — with a laden supertanker!',
  lines: [
    'More wakes on the horizon!',
    'They want your boat, Captain!',
    'No quarter given!',
    'Oil on the water...',
    'Washington has doubled the bounty!',
    'Hunters close in from all sides!',
  ],
};

// ── 1801 · To the Shores of Tripoli ────────────────────────────────────────
export const BARBARY_ROSTER: EraRoster = {
  early: [
    ['corsairPrize', 'corsairPrize', 'tripoliGunboat'],
    ['corsairXebec', 'corsairXebec', 'corsairPrize'],
    ['tripoliGunboat', 'tripoliGunboat', 'corsairXebec'],
    ['corsairXebec', 'corsairPolacca', 'corsairPrize', 'tripoliGunboat'],
    ['meshuda'],
  ],
  boss: 'meshuda',
  jackpot: 'tributePolacca',
  trader: 'corsairPrize',
  pool: [
    { kind: 'corsairXebec', cost: 2.0, weight: 3 },
    { kind: 'tripoliGunboat', cost: 1.4, weight: 2 },
    { kind: 'corsairPolacca', cost: 2.6, weight: 2, minWave: 4 },
    { kind: 'corsairPrize', cost: 0.9, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'Prize ships of the corsairs — retake them!',
    'Tripolitan xebecs give chase!',
    'Beware the gunboats of the shallows!',
    'The Bashaw sends his wolves!',
    "The Bashaw's Meshuda approaches!",
  ],
  bossTitle: 'Tripoli sails — with a tribute fleet!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Captain!',
    'Millions for defence, not a cent for tribute!',
    'Blood in the water...',
    'Jefferson has doubled your bounty!',
    'Corsairs close in from all sides!',
  ],
};

export const PHOENICIA_ROSTER: EraRoster = {
  early: [
    ['hippos', 'hippos', 'pentekonter'],
    ['pentekonter', 'bireme', 'hippos'],
    ['fireship', 'fireship', 'pentekonter'],
    ['bireme', 'pentekonter', 'hippos', 'bireme'],
    ['tyrianKing'],
  ],
  boss: 'tyrianKing',
  jackpot: 'hippos',
  trader: 'hippos',
  pool: [
    { kind: 'pentekonter', cost: 1.2, weight: 3 },
    { kind: 'bireme', cost: 1.6, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'hippos', cost: 0.9, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A hippos convoy — Tyrian purple aboard!',
    'Pentekonters give chase!',
    'Beware the fire rafts!',
    'Sidon sends its wolves!',
    "The King of Tyre's galley approaches!",
  ],
  bossTitle: 'Tyre sails — with a treasure hippos!',
  lines: [
    'More oars on the horizon!',
    'They want your cedar, Captain!',
    'For the temples of Melqart!',
    'Blood in the water...',
    'The king has doubled your bounty!',
    'Raiders close in from all sides!',
  ],
};

export const HANSE_ROSTER: EraRoster = {
  early: [
    ['holk', 'holk', 'cog'],
    ['cog', 'nef', 'holk'],
    ['fireship', 'fireship', 'cog'],
    ['nef', 'cog', 'holk', 'cog'],
    ['hansakogge'],
  ],
  boss: 'hansakogge',
  jackpot: 'holk',
  trader: 'holk',
  pool: [
    { kind: 'cog', cost: 1.8, weight: 3 },
    { kind: 'nef', cost: 2.2, weight: 2 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 4 },
    { kind: 'holk', cost: 1.1, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A Baltic convoy — take the stockfish!',
    'Cogs give chase!',
    'Beware the fire ships!',
    'Lübeck sends its wolves!',
    "The admiral's kogge approaches!",
  ],
  bossTitle: 'The Hansa sails — with a laden holk!',
  lines: [
    'More cogs on the horizon!',
    'They want your head, Skipper!',
    'From the Sound to Novgorod!',
    'Blood in the water...',
    'The Kontor has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const PORTUGAL_ROSTER: EraRoster = {
  early: [
    ['nao', 'nao', 'fusta'],
    ['caravelaLatina', 'fusta', 'nao'],
    ['fireship', 'fireship', 'caravelaLatina'],
    ['carrack', 'fusta', 'nao', 'caravelaLatina'],
    ['nauCapitana'],
  ],
  boss: 'nauCapitana',
  jackpot: 'nao',
  trader: 'nao',
  pool: [
    { kind: 'fusta', cost: 1.1, weight: 3 },
    { kind: 'caravelaLatina', cost: 1.5, weight: 3 },
    { kind: 'carrack', cost: 3.4, weight: 2, minWave: 5 },
    { kind: 'nao', cost: 1.6, weight: 1 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 3 },
    { kind: 'warDhow', cost: 2.0, weight: 2, minWave: 6 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A spice convoy — pepper from Calicut!',
    'Fustas give chase!',
    'Beware the fire ships!',
    'The Estado da Índia has arrived!',
    'A nau capitana approaches!',
  ],
  bossTitle: 'The India fleet sails — with a treasure nao!',
  lines: [
    'More lateens on the horizon!',
    'They want your charts, Capitão!',
    'For the King of Portugal!',
    'Blood in the water...',
    'Manuel has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const ARMADA_ROSTER: EraRoster = {
  early: [
    ['urca', 'urca', 'flyboat'],
    ['galleass', 'flyboat', 'urca'],
    ['fireship', 'fireship', 'galleass'],
    ['galleass', 'carrack', 'urca', 'flyboat'],
    ['armadaCapitana'],
  ],
  boss: 'armadaCapitana',
  jackpot: 'urca',
  trader: 'urca',
  pool: [
    { kind: 'flyboat', cost: 1.2, weight: 3 },
    { kind: 'galleass', cost: 3.0, weight: 2 },
    { kind: 'carrack', cost: 3.4, weight: 2, minWave: 5 },
    { kind: 'urca', cost: 1.4, weight: 1 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 3 },
    { kind: 'galleon', cost: 5.0, weight: 1, minWave: 8, noBossWave: true },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A supply urca — cut the Armada’s bread!',
    'Flyboats give chase!',
    'Beware the fire ships of Gravelines!',
    'Galleasses of Naples have arrived!',
    'The capitana approaches!',
  ],
  bossTitle: 'The Great Armada sails — with a treasure urca!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Captain!',
    'God blew, and they were scattered!',
    'Blood in the water...',
    'The Queen has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const DUTCH_ROSTER: EraRoster = {
  early: [
    ['merchant', 'merchant', 'jacht'],
    ['jacht', 'pinas', 'merchant'],
    ['fireship', 'fireship', 'pinas'],
    ['pinas', 'jacht', 'merchant', 'pinas'],
    ['spiegelretour'],
  ],
  boss: 'spiegelretour',
  jackpot: 'merchant',
  trader: 'merchant',
  pool: [
    { kind: 'jacht', cost: 1.2, weight: 3 },
    { kind: 'pinas', cost: 2.4, weight: 3 },
    { kind: 'fireship', cost: 1.2, weight: 2, minWave: 3 },
    { kind: 'merchant', cost: 0.8, weight: 1 },
    { kind: 'frigate', cost: 3.2, weight: 1, minWave: 7 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A fluyt convoy — the riches of Batavia!',
    'Yachts give chase!',
    'Beware the fire ships!',
    'A pinas squadron has arrived!',
    'A spiegelretourschip approaches!',
  ],
  bossTitle: 'The VOC sails — with a treasure fluyt!',
  lines: [
    'More sails on the horizon!',
    'They want your head, Kapitein!',
    'Remember the Medway!',
    'Blood in the water...',
    'The States have doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const PREDREAD_ROSTER: EraRoster = {
  early: [
    ['collier', 'collier', 'tb1890'],
    ['tb1890', 'tb1890', 'collier'],
    ['protectedCruiser', 'tb1890', 'collier'],
    ['protectedCruiser', 'protectedCruiser', 'collier', 'tb1890'],
    ['borodino'],
  ],
  boss: 'borodino',
  jackpot: 'collier',
  trader: 'collier',
  pool: [
    { kind: 'tb1890', cost: 1.4, weight: 3 },
    { kind: 'protectedCruiser', cost: 2.8, weight: 2 },
    { kind: 'collier', cost: 1.2, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A collier convoy — cut the coal!',
    'Torpedo boats give chase!',
    'Cruisers on the beam!',
    'The Combined Fleet is out!',
    'A Borodino-class approaches!',
  ],
  bossTitle: 'The Baltic Fleet sails — with a collier train!',
  lines: [
    'More smoke on the horizon!',
    'They want your hull, Captain!',
    'Tōgō has crossed the T!',
    'Blood in the water...',
    'The Tsar has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const FALKLANDS_ROSTER: EraRoster = {
  early: [
    ['tanker', 'tanker', 'argCorvette'],
    ['argCorvette', 'argCorvette', 'tanker'],
    ['argSub', 'argSub', 'argCorvette'],
    ['argDestroyer', 'argCorvette', 'tanker', 'argSub'],
    ['belgrano'],
  ],
  boss: 'belgrano',
  jackpot: 'supertanker',
  trader: 'tanker',
  pool: [
    { kind: 'argCorvette', cost: 1.6, weight: 3 },
    { kind: 'argDestroyer', cost: 2.8, weight: 2, minWave: 4 },
    { kind: 'argSub', cost: 2.0, weight: 2, minWave: 3 },
    { kind: 'tanker', cost: 1.8, weight: 1 },
    { kind: 'rowboat', cost: 0.5, weight: 1, minWave: 7 },
  ],
  titles: [
    'A tanker run — hit the logistics!',
    'Corvettes give chase!',
    'Submarine warning — torpedoes!',
    'A Type 42 is in the screen!',
    'The cruiser Belgrano approaches!',
  ],
  bossTitle: 'The Task Force sails — with a laden tanker!',
  lines: [
    'More wakes on the horizon!',
    'They want your ship, Captain!',
    'Gotcha!',
    'Blood in the water...',
    'Whitehall has doubled your bounty!',
    'Hunters close in from all sides!',
  ],
};

export const ERA_ROSTERS: Record<EraId, EraRoster> = {
  golden: SAIL_ROSTER,
  exploration: EXPLORATION_ROSTER,
  napoleonic: NAPOLEONIC_ROSTER,
  viking: VIKING_ROSTER,
  ironclad: IRONCLAD_ROSTER,
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
  lepanto: LEPANTO_ROSTER,
  korea: KOREA_ROSTER,
  byzantium: BYZANTIUM_ROSTER,
  egypt: EGYPT_ROSTER,
  chola: CHOLA_ROSTER,
  vietnam: VIETNAM_ROSTER,
  aztec: AZTEC_ROSTER,
  ww1: WW1_ROSTER,
  ww2: WW2_ROSTER,
  hormuz: HORMUZ_ROSTER,
  barbary: BARBARY_ROSTER,
  phoenicia: PHOENICIA_ROSTER,
  hanse: HANSE_ROSTER,
  portugal: PORTUGAL_ROSTER,
  armada: ARMADA_ROSTER,
  dutch: DUTCH_ROSTER,
  ottoman: LEPANTO_ROSTER,
  predread: PREDREAD_ROSTER,
  falklands: FALKLANDS_ROSTER,
};
