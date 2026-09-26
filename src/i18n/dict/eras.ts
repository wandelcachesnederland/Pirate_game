/** Era names, blurbs, home waters, squadrons + era/ship step UI. */
import type { Dict } from './meta';

const en = {
  ui: {
    stepTag: 'Step 5 of 7 · Era & Waters',
    heading: 'Choose Your Era',
    hint: 'Drag the card, tap a plate or use ← → — the age sets the waters you fight in, the foes you meet and the tapes that play. Her hero hull waits on the next screen.',
    prevEra: 'Previous era',
    nextEra: 'Next era',
    eraCount: 'Era {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}.',
    warship: 'warship',
    ariaTab: 'Era',
  },
  shipStep: {
    stepTag: 'Step 6 of 7 · Hero Ship',
    stepTagCampaign: 'Step 6 of 7 · Campaign Ship',
    heading: 'Choose Your Hero Ship',
    headingCampaign: 'Choose Your Campaign Ship',
    hint: 'Drag the portrait, tap a hull or use ← → — every number is measured against the whole fleet of heroes, and each hull sails only her own age. Set Sail when she suits.',
    hintCampaign:
      'This hull will carry you through all 26 eras — every age, same ship, upgrades kept. Set Sail when she suits.',
  },
  groupSail: 'Age of Sail',
  groupSteel: 'Steel Navies',
  groupHeritage: 'Heritage Seas',
  golden: { name: 'Golden Age of Piracy', blurb: 'Balanced sloop — the safe hand.' },
  exploration: { name: 'Age of Exploration', blurb: 'Nimble caravel, light guns, quick helm.' },
  napoleonic: { name: 'Napoleonic Wars', blurb: 'Frigate: 4 guns a side, longest reach.' },
  barbary: {
    name: 'Barbary War',
    blurb: 'Schooner: 12 guns, weatherly and quick — to the shores of Tripoli.',
    waters: 'the Barbary Coast',
  },
  viking: { name: 'Viking Age', blurb: 'Longship: fastest hull, thinnest skin.' },
  ironclad: { name: 'Ironclad Era', blurb: 'Steam casemate: armoured, brutal, no sails.' },
  ww1: {
    name: 'Great War at Sea',
    blurb: 'Destroyer: quick-firing guns, turbines, thinnest of steel skins.',
    waters: 'the Dogger Bank',
  },
  ww2: {
    name: 'Second World War at Sea',
    blurb: 'Fletcher-class: five mounts, radar, the fastest guns afloat.',
    waters: 'the Solomons',
  },
  hormuz: {
    name: 'Tanker War',
    blurb: 'Kaman-class missile boat: fire first, run fast, dodge the escorts.',
    waters: 'the Strait of Hormuz',
  },
  roman: {
    name: 'First Punic War',
    blurb: 'Quinquereme: bronze ram, red sail, endless oars.',
    waters: 'the Mediterranean',
  },
  greek: {
    name: 'Persian Wars',
    blurb: 'Trireme: the fastest ram at Salamis — paper-thin skin.',
    waters: 'the Mediterranean',
  },
  arab: {
    name: 'Monsoon Seas',
    blurb: 'Ocean boom: lateen sail, swift monsoon runner.',
    waters: 'the Arabian Coast',
  },
  chinese: {
    name: 'Ming Treasure Voyages',
    blurb: 'War junk: Zheng He’s floating fortress.',
    waters: 'the Straits of Singapore',
  },
  japanese: {
    name: 'Sengoku Period',
    blurb: 'Atakebune: black-lacquered gun castle. Slow, brutal.',
    waters: 'the Seto Inland Sea',
  },
  maori: {
    name: 'Māori Musket Wars',
    blurb: 'Waka taua: great war canoe — swift paddles, captured guns.',
    waters: 'the Bay of Islands',
  },
  hawaii: {
    name: 'Hawaiian Unification',
    blurb: 'Peleleu wa’a: swift war canoe of Kamehameha’s fleet.',
    waters: 'the Kona Coast',
  },
  macedon: {
    name: 'Macedon at Sea',
    blurb: 'Demetrius’s siege galley: the largest warship afloat. Slow, unstoppable.',
    waters: 'off Salamis, Cyprus',
  },
  maya: {
    name: 'Maya First Contact',
    blurb: 'Great war canoe of Tulum — drive the strangers from your shores.',
    waters: 'the Bay of Honduras',
  },
  inca: {
    name: 'Inca Pacific Voyages',
    blurb: 'Tupac’s great balsa — the Sapa Inca’s reach on the western sea.',
    waters: 'the Gulf of Guayaquil',
  },
  lepanto: {
    name: 'Lepanto',
    blurb: 'Ottoman war galley: bow guns, oars, boarders. The League awaits.',
    waters: 'the Gulf of Patras',
  },
  korea: {
    name: 'Imjin War',
    blurb: 'Turtle ship: iron roof, cannon on every side. Hold the strait.',
    waters: 'the Myeongnyang Strait',
  },
  byzantium: {
    name: 'Siege of Constantinople',
    blurb: 'Dromon with Greek fire: burn the Caliph’s fleet off the strait.',
    waters: 'the Bosporus',
  },
  egypt: {
    name: 'Against the Sea Peoples',
    blurb: 'Ramesses III’s war galley: the first naval battle in history.',
    waters: 'the Nile Delta',
  },
  chola: {
    name: 'Chola Across the Bay',
    blurb: 'Chola war ship: carry the Tiger across the Bay of Bengal.',
    waters: 'the Bay of Bengal',
  },
  vietnam: {
    name: 'Bạch Đằng River',
    blurb: 'Vietnamese war junk: lure the Khan’s fleet onto the stakes.',
    waters: 'the Bạch Đằng River',
  },
  aztec: {
    name: 'Fall of Tenochtitlan',
    blurb: 'War canoe of Cuauhtémoc: defend the lake to the last.',
    waters: 'Lake Texcoco',
  },
  phoenicia: {
    name: 'Phoenician Seas',
    blurb: 'Tyrian bireme: cedar hull, purple sail, first of the long traders.',
    waters: 'the Levantine coast',
  },
  hanse: {
    name: 'Hanseatic League',
    blurb: 'Baltic cog: high sides, one square sail, the Kontor’s wolf.',
    waters: 'the Baltic approaches',
  },
  portugal: {
    name: 'Estado da Índia',
    blurb: 'Portuguese nau: lateen scouts, heavy guns, the pepper run.',
    waters: 'the Malabar Coast',
  },
  armada: {
    name: 'Spanish Armada',
    blurb: 'Race-built galleon: weatherly, quick guns — God blew.',
    waters: 'the Channel',
  },
  dutch: {
    name: 'Dutch Golden Age',
    blurb: 'Zeven Provinciën: orange trim, a forest of guns off the Texel.',
    waters: 'the Texel',
  },
  ottoman: {
    name: 'Kapudan Pasha',
    blurb: 'Barbarossa’s kadirga: Preveza, the League in your teeth.',
    waters: 'the Ionian Sea',
  },
  predread: {
    name: 'Tsushima',
    blurb: 'Pre-dreadnought Mikasa: cross the T, coal smoke, 12-inch guns.',
    waters: 'the Tsushima Strait',
  },
  falklands: {
    name: 'Falklands War',
    blurb: 'Type 21 frigate: Exocets, Type 42s, the South Atlantic winter.',
    waters: 'the Falkland Sound',
  },
  somali: {
    name: 'Somali Pirates',
    blurb: 'Hijacked-trawler mothership: RPGs, skiffs and ladders — take the Suez traffic.',
    waters: 'the Gulf of Aden',
  },
};

export type ErasDict = typeof en;

const es: ErasDict = {
  ui: {
    stepTag: 'Paso 5 de 7 · Era y aguas',
    heading: 'Elige tu era',
    hint: 'Arrastra la carta, toca una placa o usa ← → — la época fija las aguas, los enemigos y las cintas. Su buque espera en la pantalla siguiente.',
    prevEra: 'Era anterior',
    nextEra: 'Era siguiente',
    eraCount: 'Era {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}.',
    warship: 'buque de guerra',
    ariaTab: 'Era',
  },
  shipStep: {
    stepTag: 'Paso 6 de 7 · Buque insignia',
    stepTagCampaign: 'Paso 6 de 7 · Buque de campaña',
    heading: 'Elige tu buque insignia',
    headingCampaign: 'Elige tu buque de campaña',
    hint: 'Arrastra el retrato, toca un casco o usa ← → — cada número se mide contra toda la flota de héroes, y cada casco navega solo su época. Zarpa cuando convenza.',
    hintCampaign:
      'Este casco te llevará por las 26 eras — cada época, mismo barco, mejoras conservadas. Zarpa cuando convenza.',
  },
  groupSail: 'Era de la vela',
  groupSteel: 'Armadas de acero',
  groupHeritage: 'Mares legendarios',
  golden: { name: 'Edad de oro de la piratería', blurb: 'Balandra equilibrada — la mano segura.' },
  exploration: { name: 'Era de los descubrimientos', blurb: 'Carabela ágil, cañones ligeros, timón rápido.' },
  napoleonic: { name: 'Guerras napoleónicas', blurb: 'Fragata: 4 cañones por banda, máximo alcance.' },
  barbary: {
    name: 'Guerra de Berbería',
    blurb: 'Goleta: 12 cañones, marinera y veloz — a las costas de Trípoli.',
    waters: 'la costa berberisca',
  },
  viking: { name: 'Era vikinga', blurb: 'Drakkar: casco rapidísimo, piel finísima.' },
  ironclad: { name: 'Era de los acorazados', blurb: 'Casamata de vapor: acorazada, brutal, sin velas.' },
  ww1: {
    name: 'Gran Guerra en el mar',
    blurb: 'Destructor: tiro rápido, turbinas, piel de acero finísima.',
    waters: 'el banco Dogger',
  },
  ww2: {
    name: 'Segunda Guerra Mundial en el mar',
    blurb: 'Clase Fletcher: cinco montajes, radar, los cañones más rápidos.',
    waters: 'las Salomón',
  },
  hormuz: {
    name: 'Guerra de los petroleros',
    blurb: 'Lancha misilera Kaman: dispara primero, corre, esquiva escoltas.',
    waters: 'el estrecho de Ormuz',
  },
  roman: {
    name: 'Primera guerra púnica',
    blurb: 'Quinquerreme: espolón de bronce, vela roja, remos sin fin.',
    waters: 'el Mediterráneo',
  },
  greek: {
    name: 'Guerras médicas',
    blurb: 'Trirreme: el espolón más veloz de Salamina — piel de papel.',
    waters: 'el Mediterráneo',
  },
  arab: {
    name: 'Mares del monzón',
    blurb: 'Bum oceánico: vela latina, veloz corredor monzónico.',
    waters: 'la costa arábiga',
  },
  chinese: {
    name: 'Viajes del tesoro Ming',
    blurb: 'Junco de guerra: la fortaleza flotante de Zheng He.',
    waters: 'los estrechos de Singapur',
  },
  japanese: {
    name: 'Período Sengoku',
    blurb: 'Atakebune: castillo artillado en laca negra. Lento, brutal.',
    waters: 'el mar interior de Seto',
  },
  maori: {
    name: 'Guerras de los mosquetes maoríes',
    blurb: 'Waka taua: gran canoa de guerra — remos veloces, cañones capturados.',
    waters: 'la bahía de las Islas',
  },
  hawaii: {
    name: 'Unificación hawaiana',
    blurb: 'Wa’a peleleu: veloz canoa de guerra de la flota de Kamehameha.',
    waters: 'la costa de Kona',
  },
  macedon: {
    name: 'Macedonia en el mar',
    blurb: 'Galera de asedio de Demetrio: el mayor buque de guerra. Lenta, imparable.',
    waters: 'frente a Salamina de Chipre',
  },
  maya: {
    name: 'Primer contacto maya',
    blurb: 'Gran canoa de guerra de Tulum — expulsa a los extraños de tus costas.',
    waters: 'la bahía de Honduras',
  },
  inca: {
    name: 'Viajes incaicos del Pacífico',
    blurb: 'Gran balsa de Túpac — el alcance del Sapa Inca en el mar occidental.',
    waters: 'el golfo de Guayaquil',
  },
  lepanto: {
    name: 'Lepanto',
    blurb: 'Galera de guerra otomana: cañones de proa, remos, abordadores. La Liga aguarda.',
    waters: 'el golfo de Patras',
  },
  korea: {
    name: 'Guerra Imjin',
    blurb: 'Barco tortuga: techo de hierro, cañones por doquier. Guarda el estrecho.',
    waters: 'el estrecho de Myeongnyang',
  },
  byzantium: {
    name: 'Asedio de Constantinopla',
    blurb: 'Dromón de fuego griego: quema la flota del califa en el estrecho.',
    waters: 'el Bósforo',
  },
  egypt: {
    name: 'Contra los Pueblos del Mar',
    blurb: 'Galera de guerra de Ramsés III: la primera batalla naval de la historia.',
    waters: 'el delta del Nilo',
  },
  chola: {
    name: 'Los Chola al otro lado de la bahía',
    blurb: 'Buque de guerra chola: lleva al Tigre por la bahía de Bengala.',
    waters: 'la bahía de Bengala',
  },
  vietnam: {
    name: 'Río Bạch Đằng',
    blurb: 'Junco de guerra vietnamita: atrae la flota del Kan a las estacas.',
    waters: 'el río Bạch Đằng',
  },
  aztec: {
    name: 'Caída de Tenochtitlan',
    blurb: 'Canoa de guerra de Cuauhtémoc: defiende el lago hasta el final.',
    waters: 'el lago Texcoco',
  },
  phoenicia: {
    name: 'Mares fenicios',
    blurb: 'Birreme tiria: casco de cedro, vela púrpura, primera de los grandes mercantes.',
    waters: 'la costa levantina',
  },
  hanse: {
    name: 'Liga Hanseática',
    blurb: 'Coca báltica: bordas altas, una vela cuadra, el lobo del Kontor.',
    waters: 'los accesos bálticos',
  },
  portugal: {
    name: 'Estado da Índia',
    blurb: 'Nao portuguesa: exploradores latinos, artillería pesada, la ruta de la pimienta.',
    waters: 'la costa de Malabar',
  },
  armada: {
    name: 'Armada Invencible',
    blurb: 'Galeón de regatas: marinero, cañones rápidos — Dios sopló.',
    waters: 'el Canal',
  },
  dutch: {
    name: 'Edad de Oro neerlandesa',
    blurb: 'Zeven Provinciën: detalles naranjas, un bosque de cañones frente al Texel.',
    waters: 'el Texel',
  },
  ottoman: {
    name: 'Kapudan Pasha',
    blurb: 'Kadirga de Barbarroja: Preveza, la Liga entre dientes.',
    waters: 'el mar Jónico',
  },
  predread: {
    name: 'Tsushima',
    blurb: 'Predreadnought Mikasa: cruza la T, humo de carbón, cañones de 12 pulgadas.',
    waters: 'el estrecho de Tsushima',
  },
  falklands: {
    name: 'Guerra de las Malvinas',
    blurb: 'Fragata Tipo 21: Exocets, Tipo 42, el invierno austral.',
    waters: 'el estrecho de San Carlos',
  },
  somali: {
    name: 'Piratas somalíes',
    blurb: 'Nodriza-pesquero secuestrada: RPG, esquifes y escalas — a por el tráfico de Suez.',
    waters: 'el golfo de Adén',
  },
};

const fr: ErasDict = {
  ui: {
    stepTag: 'Étape 5 sur 7 · Époque et eaux',
    heading: 'Choisissez votre époque',
    hint: 'Faites glisser la carte, touchez une plaque ou utilisez ← → — l’âge fixe les eaux, les ennemis et les cassettes. Sa coque héros attend à l’écran suivant.',
    prevEra: 'Époque précédente',
    nextEra: 'Époque suivante',
    eraCount: 'Époque {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}.',
    warship: 'navire de guerre',
    ariaTab: 'Époque',
  },
  shipStep: {
    stepTag: 'Étape 6 sur 7 · Navire héros',
    stepTagCampaign: 'Étape 6 sur 7 · Navire de campagne',
    heading: 'Choisissez votre navire héros',
    headingCampaign: 'Choisissez votre navire de campagne',
    hint: 'Faites glisser le portrait, touchez une coque ou utilisez ← → — chaque nombre se mesure à toute la flotte des héros, et chaque coque ne navigue qu’en son âge. En mer quand elle convient.',
    hintCampaign:
      'Cette coque vous portera à travers les 26 époques — chaque âge, même navire, améliorations gardées. En mer quand elle convient.',
  },
  groupSail: 'Âge de la voile',
  groupSteel: 'Marines d’acier',
  groupHeritage: 'Mers légendaires',
  golden: { name: 'Âge d’or de la piraterie', blurb: 'Sloop équilibré — la main sûre.' },
  exploration: { name: 'Grandes découvertes', blurb: 'Caravelle agile, canons légers, barre vive.' },
  napoleonic: { name: 'Guerres napoléoniennes', blurb: 'Frégate : 4 canons par bord, plus longue portée.' },
  barbary: {
    name: 'Guerre barbaresque',
    blurb: 'Goélette : 12 canons, marine et vive — vers les rivages de Tripoli.',
    waters: 'la côte barbaresque',
  },
  viking: { name: 'Âge viking', blurb: 'Drakkar : coque la plus rapide, peau la plus fine.' },
  ironclad: { name: 'Ère des cuirassés', blurb: 'Casemate à vapeur : blindée, brutale, sans voiles.' },
  ww1: {
    name: 'Grande Guerre sur mer',
    blurb: 'Destroyer : canons à tir rapide, turbines, peau d’acier très fine.',
    waters: 'le Dogger Bank',
  },
  ww2: {
    name: 'Seconde Guerre mondiale sur mer',
    blurb: 'Classe Fletcher : cinq affûts, radar, les canons les plus rapides.',
    waters: 'les Salomon',
  },
  hormuz: {
    name: 'Guerre des pétroliers',
    blurb: 'Patrouilleur lance-missiles Kaman : tirez premier, fuyez vite, esquivez les escortes.',
    waters: 'le détroit d’Ormuz',
  },
  roman: {
    name: 'Première guerre punique',
    blurb: 'Quinquireme : éperon de bronze, voile rouge, rames infinies.',
    waters: 'la Méditerranée',
  },
  greek: {
    name: 'Guerres médiques',
    blurb: 'Trirème : l’éperon le plus rapide de Salamine — peau de papier.',
    waters: 'la Méditerranée',
  },
  arab: {
    name: 'Mers de mousson',
    blurb: 'Boutre océanique : voile latine, vif coureur de mousson.',
    waters: 'la côte arabique',
  },
  chinese: {
    name: 'Voyages du trésor des Ming',
    blurb: 'Jonque de guerre : la forteresse flottante de Zheng He.',
    waters: 'les détroits de Singapour',
  },
  japanese: {
    name: 'Époque Sengoku',
    blurb: 'Atakebune : château d’artillerie laqué noir. Lent, brutal.',
    waters: 'la mer intérieure de Seto',
  },
  maori: {
    name: 'Guerres des mousquets maories',
    blurb: 'Waka taua : grande pirogue de guerre — pagaies vives, canons pris.',
    waters: 'la baie des Îles',
  },
  hawaii: {
    name: 'Unification hawaïenne',
    blurb: 'Wa’a peleleu : vive pirogue de guerre de la flotte de Kamehameha.',
    waters: 'la côte de Kona',
  },
  macedon: {
    name: 'La Macédoine sur mer',
    blurb: 'Galère de siège de Démétrios : le plus grand navire de guerre. Lent, irrésistible.',
    waters: 'au large de Salamine de Chypre',
  },
  maya: {
    name: 'Premier contact maya',
    blurb: 'Grande pirogue de guerre de Tulum — chassez les étrangers de vos rivages.',
    waters: 'la baie du Honduras',
  },
  inca: {
    name: 'Voyages incas du Pacifique',
    blurb: 'Grand radeau de Tupac — l’allonge du Sapa Inca sur la mer occidentale.',
    waters: 'le golfe de Guayaquil',
  },
  lepanto: {
    name: 'Lépante',
    blurb: 'Galère de guerre ottomane : canons de proue, rames, abordeurs. La Ligue attend.',
    waters: 'le golfe de Patras',
  },
  korea: {
    name: 'Guerre Imjin',
    blurb: 'Bateau-tortue : toit de fer, canons partout. Tenez le détroit.',
    waters: 'le détroit de Myeongnyang',
  },
  byzantium: {
    name: 'Siège de Constantinople',
    blurb: 'Dromon à feu grégeois : brûlez la flotte du calife hors du détroit.',
    waters: 'le Bosphore',
  },
  egypt: {
    name: 'Contre les Peuples de la mer',
    blurb: 'Galère de guerre de Ramsès III : la première bataille navale de l’histoire.',
    waters: 'le delta du Nil',
  },
  chola: {
    name: 'Les Chola outre-golfe',
    blurb: 'Navire de guerre chola : portez le Tigre sur le golfe du Bengale.',
    waters: 'le golfe du Bengale',
  },
  vietnam: {
    name: 'Rivière Bạch Đằng',
    blurb: 'Jonque de guerre vietnamienne : attirez la flotte du Khan sur les pieux.',
    waters: 'la rivière Bạch Đằng',
  },
  aztec: {
    name: 'Chute de Tenochtitlan',
    blurb: 'Pirogue de guerre de Cuauhtémoc : défendez le lac jusqu’au bout.',
    waters: 'le lac Texcoco',
  },
  phoenicia: {
    name: 'Mers phéniciennes',
    blurb: 'Birème tyrienne : coque de cèdre, voile pourpre, première des longues marchandes.',
    waters: 'la côte levantine',
  },
  hanse: {
    name: 'Ligue hanséatique',
    blurb: 'Cogue baltique : hauts bords, une voile carrée, le loup du Kontor.',
    waters: 'les approches baltiques',
  },
  portugal: {
    name: 'Estado da Índia',
    blurb: 'Nau portugaise : éclaireurs latins, grosse artillerie, la route du poivre.',
    waters: 'la côte de Malabar',
  },
  armada: {
    name: 'Invincible Armada',
    blurb: 'Galion de course : marin, canons vifs — Dieu souffla.',
    waters: 'la Manche',
  },
  dutch: {
    name: 'Âge d’or néerlandais',
    blurb: 'Zeven Provinciën : parements orange, une forêt de canons au large du Texel.',
    waters: 'le Texel',
  },
  ottoman: {
    name: 'Kapudan Pacha',
    blurb: 'Kadirga de Barberousse : Prévéza, la Ligue entre les dents.',
    waters: 'la mer Ionienne',
  },
  predread: {
    name: 'Tsushima',
    blurb: 'Pré-dreadnought Mikasa : barrez le T, fumée de charbon, canons de 12 pouces.',
    waters: 'le détroit de Tsushima',
  },
  falklands: {
    name: 'Guerre des Malouines',
    blurb: 'Frégate Type 21 : Exocets, Type 42, l’hiver austral.',
    waters: 'le détroit de San Carlos',
  },
  somali: {
    name: 'Pirates somaliens',
    blurb: 'Chalutier-base détourné : RPG, esquifs et échelles — prenez le trafic de Suez.',
    waters: 'le golfe d’Aden',
  },
};

const de: ErasDict = {
  ui: {
    stepTag: 'Schritt 5 von 7 · Ära & Gewässer',
    heading: 'Wählt Eure Ära',
    hint: 'Karte ziehen, Platte tippen oder ← → — das Zeitalter setzt Gewässer, Feinde und Kassetten. Ihr Heldenrumpf wartet am nächsten Bildschirm.',
    prevEra: 'Vorige Ära',
    nextEra: 'Nächste Ära',
    eraCount: 'Ära {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}.',
    warship: 'Kriegsschiff',
    ariaTab: 'Ära',
  },
  shipStep: {
    stepTag: 'Schritt 6 von 7 · Heldenschiff',
    stepTagCampaign: 'Schritt 6 von 7 · Kampagnenschiff',
    heading: 'Wählt Euer Heldenschiff',
    headingCampaign: 'Wählt Euer Kampagnenschiff',
    hint: 'Porträt ziehen, Rumpf tippen oder ← → — jede Zahl misst sich an der ganzen Heldenflotte, und jeder Rumpf segelt nur sein eigenes Zeitalter. Segel setzen, wenn sie passt.',
    hintCampaign:
      'Dieser Rumpf trägt Euch durch alle 26 Ären — jedes Zeitalter, dasselbe Schiff, Aufrüstung bleibt. Segel setzen, wenn sie passt.',
  },
  groupSail: 'Zeitalter des Segels',
  groupSteel: 'Stahlmarinen',
  groupHeritage: 'Meere der Legenden',
  golden: { name: 'Goldenes Zeitalter der Piraterie', blurb: 'Ausgewogene Sloop — die sichere Hand.' },
  exploration: { name: 'Zeitalter der Entdeckungen', blurb: 'Flinke Karavelle, leichte Kanonen, schnelles Ruder.' },
  napoleonic: { name: 'Napoleonische Kriege', blurb: 'Fregatte: 4 Kanonen je Seite, größte Reichweite.' },
  barbary: {
    name: 'Barbareskenkrieg',
    blurb: 'Schoner: 12 Kanonen, seetüchtig und schnell — zu den Küsten von Tripolis.',
    waters: 'die Berberküste',
  },
  viking: { name: 'Wikingerzeit', blurb: 'Langschiff: schnellster Rumpf, dünnste Haut.' },
  ironclad: { name: 'Panzerschiff-Ära', blurb: 'Dampfkasematte: gepanzert, brutal, keine Segel.' },
  ww1: {
    name: 'Der Große Krieg zur See',
    blurb: 'Zerstörer: Schnellfeuergeschütze, Turbinen, dünnste Stahlhaut.',
    waters: 'die Doggerbank',
  },
  ww2: {
    name: 'Zweiter Weltkrieg zur See',
    blurb: 'Fletcher-Klasse: fünf Türme, Radar, die schnellsten Kanonen.',
    waters: 'die Salomonen',
  },
  hormuz: {
    name: 'Tankerkrieg',
    blurb: 'Kaman-Raketenboot: zuerst feuern, schnell fliehen, Geleite meiden.',
    waters: 'die Straße von Hormus',
  },
  roman: {
    name: 'Erster Punischer Krieg',
    blurb: 'Quinquereme: Bronzeramm, rotes Segel, endlose Ruder.',
    waters: 'das Mittelmeer',
  },
  greek: {
    name: 'Perserkriege',
    blurb: 'Triere: der schnellste Ramm von Salamis — papierdünne Haut.',
    waters: 'das Mittelmeer',
  },
  arab: {
    name: 'Monsunmeere',
    blurb: 'Hochseeboom: Lateinsegel, schneller Monsunläufer.',
    waters: 'die arabische Küste',
  },
  chinese: {
    name: 'Ming-Schatzflotten',
    blurb: 'Kriegsdschunke: Zheng Hes schwimmende Festung.',
    waters: 'die Straßen von Singapur',
  },
  japanese: {
    name: 'Sengoku-Zeit',
    blurb: 'Atakebune: schwarzlackierte Geschützburg. Langsam, brutal.',
    waters: 'die Seto-Inlandsee',
  },
  maori: {
    name: 'Māori-Musketenkriege',
    blurb: 'Waka taua: großes Kriegskanu — schnelle Paddel, erbeutete Kanonen.',
    waters: 'die Bay of Islands',
  },
  hawaii: {
    name: 'Hawaiische Einigung',
    blurb: 'Peleleu-Waʻa: schnelles Kriegskanu aus Kamehamehas Flotte.',
    waters: 'die Kona-Küste',
  },
  macedon: {
    name: 'Makedonien zur See',
    blurb: 'Demetrios’ Belagerungsgaleere: das größte Kriegsschiff. Langsam, unaufhaltsam.',
    waters: 'vor Salamis auf Zypern',
  },
  maya: {
    name: 'Maya-Erstkontakt',
    blurb: 'Großes Kriegskanu von Tulum — vertreibt die Fremden von Euren Küsten.',
    waters: 'die Bucht von Honduras',
  },
  inca: {
    name: 'Inka-Pazifikfahrten',
    blurb: 'Tupacs großes Floß — die Reichweite des Sapa Inca auf der Westsee.',
    waters: 'der Golf von Guayaquil',
  },
  lepanto: {
    name: 'Lepanto',
    blurb: 'Osmanische Kriegsgaleere: Bugkanonen, Ruder, Enterer. Die Liga wartet.',
    waters: 'der Golf von Patras',
  },
  korea: {
    name: 'Imjin-Krieg',
    blurb: 'Schildkrötenschiff: Eisendach, Kanonen überall. Haltet die Meerenge.',
    waters: 'die Myongnyang-Meerenge',
  },
  byzantium: {
    name: 'Belagerung Konstantinopels',
    blurb: 'Dromone mit Griechischem Feuer: brennt die Kalifenflotte aus der Meerenge.',
    waters: 'den Bosporus',
  },
  egypt: {
    name: 'Gegen die Seevölker',
    blurb: 'Ramses’ III. Kriegsgaleere: die erste Seeschlacht der Geschichte.',
    waters: 'das Nildelta',
  },
  chola: {
    name: 'Chola jenseits der Bucht',
    blurb: 'Chola-Kriegsschiff: tragt den Tiger über den Golf von Bengalen.',
    waters: 'der Golf von Bengalen',
  },
  vietnam: {
    name: 'Bạch-Đằng-Fluss',
    blurb: 'Vietnamesische Kriegsdschunke: lockt die Khanflotte auf die Pfähle.',
    waters: 'der Bạch-Đằng-Fluss',
  },
  aztec: {
    name: 'Fall Tenochtitlans',
    blurb: 'Kriegskanu Cuauhtémocs: verteidigt den See bis zuletzt.',
    waters: 'der Texcoco-See',
  },
  phoenicia: {
    name: 'Phönizische Meere',
    blurb: 'Tyrische Bireme: Zedernrumpf, Purpursegel, erste der Fernfahrer.',
    waters: 'die levantinische Küste',
  },
  hanse: {
    name: 'Hanse',
    blurb: 'Ostseekogge: hohe Bordwände, ein Rahsegel, der Wolf des Kontors.',
    waters: 'die Ostseezufahrten',
  },
  portugal: {
    name: 'Estado da Índia',
    blurb: 'Portugiesische Nau: Lateinaufklärer, schwere Kanonen, die Pfefferfahrt.',
    waters: 'die Malabarküste',
  },
  armada: {
    name: 'Spanische Armada',
    blurb: 'Renn-Galeone: seetüchtig, schnelle Kanonen — Gott blies.',
    waters: 'der Kanal',
  },
  dutch: {
    name: 'Niederländisches Goldenes Zeitalter',
    blurb: 'Zeven Provinciën: orange Zier, ein Wald von Kanonen vor Texel.',
    waters: 'Texel',
  },
  ottoman: {
    name: 'Kapudan Pascha',
    blurb: 'Barbarossas Kadirga: Preveza, die Liga zwischen den Zähnen.',
    waters: 'das Ionische Meer',
  },
  predread: {
    name: 'Tsushima',
    blurb: 'Linienschiff Mikasa: kreuzt das T, Kohlenrauch, 12-Zoll-Kanonen.',
    waters: 'die Tsushima-Straße',
  },
  falklands: {
    name: 'Falklandkrieg',
    blurb: 'Fregatte Typ 21: Exocets, Typ 42, der südatlantische Winter.',
    waters: 'der Falklandsund',
  },
  somali: {
    name: 'Somalia-Piraten',
    blurb: 'Gekaperter Trawler als Mutterschiff: RPGs, Skiffs und Leitern — holt den Suez-Verkehr.',
    waters: 'der Golf von Aden',
  },
};

const nl: ErasDict = {
  ui: {
    stepTag: 'Stap 5 van 7 · Tijdperk & wateren',
    heading: 'Kies je tijdperk',
    hint: 'Sleep de kaart, tik een plaat of gebruik ← → — het tijdperk bepaalt wateren, vijanden en bandjes. Haar heldenromp wacht op het volgende scherm.',
    prevEra: 'Vorig tijdperk',
    nextEra: 'Volgend tijdperk',
    eraCount: 'Tijdperk {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}.',
    warship: 'oorlogsschip',
    ariaTab: 'Tijdperk',
  },
  shipStep: {
    stepTag: 'Stap 6 van 7 · Heldenschip',
    stepTagCampaign: 'Stap 6 van 7 · Campagneschip',
    heading: 'Kies je heldenschip',
    headingCampaign: 'Kies je campagneschip',
    hint: 'Sleep het portret, tik een romp of gebruik ← → — elk getal wordt gemeten aan de hele heldenvloot, en elke romp vaart alleen haar eigen eeuw. Vaar uit als ze bevalt.',
    hintCampaign:
      'Deze romp draagt je door alle 26 tijdperken — elke eeuw, zelfde schip, verbeteringen behouden. Vaar uit als ze bevalt.',
  },
  groupSail: 'Zeiltijdperk',
  groupSteel: 'Stalen marines',
  groupHeritage: 'Legendarische zeeën',
  golden: { name: 'Gouden Eeuw van de piraterij', blurb: 'Evenwichtige sloep — de veilige hand.' },
  exploration: { name: 'Tijd van de ontdekkingen', blurb: 'Wendbaar karveel, licht geschut, snel roer.' },
  napoleonic: { name: 'Napoleontische oorlogen', blurb: 'Fregat: 4 stukken per zijde, grootste bereik.' },
  barbary: {
    name: 'Barbarijse Oorlog',
    blurb: 'Schoener: 12 stukken, zeewaardig en snel — naar de kusten van Tripoli.',
    waters: 'de Barbarijse kust',
  },
  viking: { name: 'Vikingtijd', blurb: 'Langschip: snelste romp, dunste huid.' },
  ironclad: { name: 'Tijd van de pantserschepen', blurb: 'Stoomkazemat: gepantserd, bruut, geen zeilen.' },
  ww1: {
    name: 'Grote Oorlog op zee',
    blurb: 'Jager: snelvuur, turbines, dunste stalen huid.',
    waters: 'de Doggersbank',
  },
  ww2: {
    name: 'Tweede Wereldoorlog op zee',
    blurb: 'Fletcher-klasse: vijf opstellingen, radar, snelste geschut.',
    waters: 'de Salomonseilanden',
  },
  hormuz: {
    name: 'Tankeroorlog',
    blurb: 'Kaman-raketboot: vuur eerst, ren hard, ontwijk escortes.',
    waters: 'de Straat van Hormuz',
  },
  roman: {
    name: 'Eerste Punische Oorlog',
    blurb: 'Quinquereme: bronzen ram, rood zeil, eindeloze riemen.',
    waters: 'de Middellandse Zee',
  },
  greek: {
    name: 'Perzische oorlogen',
    blurb: 'Trireem: de snelste ram bij Salamis — flinterdunne huid.',
    waters: 'de Middellandse Zee',
  },
  arab: {
    name: 'Moessonzeeën',
    blurb: 'Oceaanboom: latijnzeil, snelle moessonrenner.',
    waters: 'de Arabische kust',
  },
  chinese: {
    name: 'Ming-schatreizen',
    blurb: 'Oorlogsjonk: het drijvende fort van Zheng He.',
    waters: 'de Straten van Singapore',
  },
  japanese: {
    name: 'Sengoku-periode',
    blurb: 'Atakebune: zwartgelakt geschutkasteel. Traag, bruut.',
    waters: 'de Japanse Binnenzee',
  },
  maori: {
    name: 'Māori-musketoorlogen',
    blurb: 'Waka taua: grote oorlogskano — snelle peddels, buitgemaakt geschut.',
    waters: 'de Bay of Islands',
  },
  hawaii: {
    name: 'Hawaiiaanse eenwording',
    blurb: 'Peleleu wa’a: snelle oorlogskano uit Kamehameha’s vloot.',
    waters: 'de kust van Kona',
  },
  macedon: {
    name: 'Macedonië op zee',
    blurb: 'Belegeringsgalei van Demetrius: grootste oorlogsschip. Traag, onstuitbaar.',
    waters: 'voor Salamis op Cyprus',
  },
  maya: {
    name: 'Eerste Maya-contact',
    blurb: 'Grote oorlogskano van Tulum — verdrijf de vreemden van je kusten.',
    waters: 'de Baai van Honduras',
  },
  inca: {
    name: 'Inca-reizen over de Grote Oceaan',
    blurb: 'Grote balsa van Tupac — de reikwijdte van de Sapa Inca op de westelijke zee.',
    waters: 'de Golf van Guayaquil',
  },
  lepanto: {
    name: 'Lepanto',
    blurb: 'Ottomaanse oorlogsgalei: boeggeschut, riemen, enterders. De Liga wacht.',
    waters: 'de Golf van Patras',
  },
  korea: {
    name: 'Imjin-oorlog',
    blurb: 'Schildpadschip: ijzeren dak, geschut rondom. Houd de zeestraat.',
    waters: 'de Straat Myeongnyang',
  },
  byzantium: {
    name: 'Beleg van Constantinopel',
    blurb: 'Dromon met Grieks vuur: brand de vloot van de kalief uit de zeestraat.',
    waters: 'de Bosporus',
  },
  egypt: {
    name: 'Tegen de Zeevolken',
    blurb: 'Oorlogsgalei van Ramses III: de eerste zeeslag uit de geschiedenis.',
    waters: 'de Nijldelta',
  },
  chola: {
    name: 'Chola over de baai',
    blurb: 'Chola-oorlogsschip: draag de Tijger over de Golf van Bengalen.',
    waters: 'de Golf van Bengalen',
  },
  vietnam: {
    name: 'Bạch Đằng-rivier',
    blurb: 'Vietnamese oorlogsjonk: lok de vloot van de Khan op de staken.',
    waters: 'de Bạch Đằng-rivier',
  },
  aztec: {
    name: 'Val van Tenochtitlan',
    blurb: 'Oorlogskano van Cuauhtémoc: verdedig het meer tot het laatst.',
    waters: 'het Texcocomeer',
  },
  phoenicia: {
    name: 'Fenicische zeeën',
    blurb: 'Tyrische bireem: cederromp, purperzeil, eerste van de langevaarders.',
    waters: 'de Levantijnse kust',
  },
  hanse: {
    name: 'Hanze',
    blurb: 'Oostzeekogge: hoge boorden, één razeil, de wolf van het Kontor.',
    waters: 'de Oostzee-aanlopen',
  },
  portugal: {
    name: 'Estado da Índia',
    blurb: 'Portugese nau: latijnverkenners, zwaar geschut, de pepervaart.',
    waters: 'de kust van Malabar',
  },
  armada: {
    name: 'Spaanse Armada',
    blurb: 'Snel galjoen: zeewaardig, snel geschut — God blies.',
    waters: 'het Kanaal',
  },
  dutch: {
    name: 'Gouden Eeuw',
    blurb: 'Zeven Provinciën: oranje details, een woud van geschut voor Texel.',
    waters: 'Texel',
  },
  ottoman: {
    name: 'Kapudan Pasha',
    blurb: 'Kadirga van Barbarossa: Preveza, de Liga tussen de tanden.',
    waters: 'de Ionische Zee',
  },
  predread: {
    name: 'Tsushima',
    blurb: 'Pre-dreadnought Mikasa: kruis de T, kolenrook, 12-inch geschut.',
    waters: 'de Straat Tsushima',
  },
  falklands: {
    name: 'Falklandoorlog',
    blurb: 'Fregat Type 21: Exocets, Type 42, de zuidatlantische winter.',
    waters: 'de Falklandsund',
  },
  somali: {
    name: 'Somalische piraten',
    blurb: 'Gekaapte trawler als moederschip: RPG’s, skiffs en ladders — pak het Suez-verkeer.',
    waters: 'de Golf van Aden',
  },
};

const pt: ErasDict = {
  ui: {
    stepTag: 'Passo 5 de 7 · Era e águas',
    heading: 'Escolhe a tua era',
    hint: 'Arrasta a carta, toca uma placa ou usa ← → — a época fixa as águas, os inimigos e as cassetes. O seu casco herói espera no ecrã seguinte.',
    prevEra: 'Era anterior',
    nextEra: 'Era seguinte',
    eraCount: 'Era {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}.',
    warship: 'navio de guerra',
    ariaTab: 'Era',
  },
  shipStep: {
    stepTag: 'Passo 6 de 7 · Navio herói',
    stepTagCampaign: 'Passo 6 de 7 · Navio de campanha',
    heading: 'Escolhe o teu navio herói',
    headingCampaign: 'Escolhe o teu navio de campanha',
    hint: 'Arrasta o retrato, toca um casco ou usa ← → — cada número mede-se contra toda a frota de heróis, e cada casco só navega a sua época. Zarpa quando convier.',
    hintCampaign:
      'Este casco levar-te-á pelas 26 eras — cada época, mesmo navio, melhorias guardadas. Zarpa quando convier.',
  },
  groupSail: 'Era da vela',
  groupSteel: 'Marinhas de aço',
  groupHeritage: 'Mares lendários',
  golden: { name: 'Idade de Ouro da Pirataria', blurb: 'Saveiro equilibrado — a mão segura.' },
  exploration: { name: 'Era dos Descobrimentos', blurb: 'Caravela ágil, canhões leves, leme rápido.' },
  napoleonic: { name: 'Guerras Napoleónicas', blurb: 'Fragata: 4 canhões por bordo, maior alcance.' },
  barbary: {
    name: 'Guerra da Berbéria',
    blurb: 'Escuna: 12 canhões, marinheira e veloz — às costas de Trípoli.',
    waters: 'a costa berberesca',
  },
  viking: { name: 'Era Víquingue', blurb: 'Drakkar: casco mais veloz, pele mais fina.' },
  ironclad: { name: 'Era dos couraçados', blurb: 'Casamata a vapor: couraçada, brutal, sem velas.' },
  ww1: {
    name: 'Grande Guerra no mar',
    blurb: 'Contratorpedeiro: tiro rápido, turbinas, pele de aço finíssima.',
    waters: 'o banco Dogger',
  },
  ww2: {
    name: 'Segunda Guerra Mundial no mar',
    blurb: 'Classe Fletcher: cinco reparos, radar, os canhões mais rápidos.',
    waters: 'as Salomão',
  },
  hormuz: {
    name: 'Guerra dos Petroleiros',
    blurb: 'Lancha lança-mísseis Kaman: dispara primeiro, foge, evita escoltas.',
    waters: 'o estreito de Ormuz',
  },
  roman: {
    name: 'Primeira Guerra Púnica',
    blurb: 'Quinquerreme: esporão de bronze, vela vermelha, remos sem fim.',
    waters: 'o Mediterrâneo',
  },
  greek: {
    name: 'Guerras Médicas',
    blurb: 'Trirreme: o esporão mais veloz de Salamina — pele de papel.',
    waters: 'o Mediterrâneo',
  },
  arab: {
    name: 'Mares de Monção',
    blurb: 'Boom oceânico: vela latina, veloz corredor de monção.',
    waters: 'a costa arábica',
  },
  chinese: {
    name: 'Viagens do tesouro Ming',
    blurb: 'Junco de guerra: a fortaleza flutuante de Zheng He.',
    waters: 'os estreitos de Singapura',
  },
  japanese: {
    name: 'Período Sengoku',
    blurb: 'Atakebune: castelo de artilharia lacado de negro. Lento, brutal.',
    waters: 'o mar interior de Seto',
  },
  maori: {
    name: 'Guerras dos Mosquetes Māori',
    blurb: 'Waka taua: grande canoa de guerra — remos velozes, canhões capturados.',
    waters: 'a baía das Ilhas',
  },
  hawaii: {
    name: 'Unificação havaiana',
    blurb: 'Wa’a peleleu: veloz canoa de guerra da frota de Kamehameha.',
    waters: 'a costa de Kona',
  },
  macedon: {
    name: 'Macedónia no mar',
    blurb: 'Galé de cerco de Demétrio: o maior navio de guerra. Lenta, imparável.',
    waters: 'ao largo de Salamina de Chipre',
  },
  maya: {
    name: 'Primeiro contacto maia',
    blurb: 'Grande canoa de guerra de Tulum — expulsa os estranhos das tuas costas.',
    waters: 'a baía das Honduras',
  },
  inca: {
    name: 'Viagens incas do Pacífico',
    blurb: 'Grande balsa de Tupac — o alcance do Sapa Inca no mar ocidental.',
    waters: 'o golfo de Guayaquil',
  },
  lepanto: {
    name: 'Lepanto',
    blurb: 'Galé de guerra otomana: canhões de proa, remos, abordadores. A Liga aguarda.',
    waters: 'o golfo de Patras',
  },
  korea: {
    name: 'Guerra Imjin',
    blurb: 'Navio-tartaruga: teto de ferro, canhões por todo o lado. Guarda o estreito.',
    waters: 'o estreito de Myeongnyang',
  },
  byzantium: {
    name: 'Cerco de Constantinopla',
    blurb: 'Drómon de fogo grego: queima a frota do califa fora do estreito.',
    waters: 'o Bósforo',
  },
  egypt: {
    name: 'Contra os Povos do Mar',
    blurb: 'Galé de guerra de Ramsés III: a primeira batalha naval da história.',
    waters: 'o delta do Nilo',
  },
  chola: {
    name: 'Chola do outro lado da baía',
    blurb: 'Navio de guerra chola: leva o Tigre pela baía de Bengala.',
    waters: 'a baía de Bengala',
  },
  vietnam: {
    name: 'Rio Bạch Đằng',
    blurb: 'Junco de guerra vietnamita: atrai a frota do Cã às estacas.',
    waters: 'o rio Bạch Đằng',
  },
  aztec: {
    name: 'Queda de Tenochtitlan',
    blurb: 'Canoa de guerra de Cuauhtémoc: defende o lago até ao fim.',
    waters: 'o lago Texcoco',
  },
  phoenicia: {
    name: 'Mares fenícios',
    blurb: 'Birreme tíria: casco de cedro, vela púrpura, primeira dos longos mercantes.',
    waters: 'a costa levantina',
  },
  hanse: {
    name: 'Liga Hanseática',
    blurb: 'Coca báltica: bordas altas, uma vela redonda, o lobo do Kontor.',
    waters: 'os acessos bálticos',
  },
  portugal: {
    name: 'Estado da Índia',
    blurb: 'Nau portuguesa: escotas latinas, artilharia pesada, a rota da pimenta.',
    waters: 'a costa do Malabar',
  },
  armada: {
    name: 'Armada Invencível',
    blurb: 'Galeão de regata: marinheiro, canhões rápidos — Deus soprou.',
    waters: 'o Canal',
  },
  dutch: {
    name: 'Idade de Ouro Holandesa',
    blurb: 'Zeven Provinciën: detalhes laranja, um bosque de canhões ao largo do Texel.',
    waters: 'o Texel',
  },
  ottoman: {
    name: 'Kapudan Pasha',
    blurb: 'Kadirga de Barbarossa: Preveza, a Liga entre dentes.',
    waters: 'o mar Jónico',
  },
  predread: {
    name: 'Tsushima',
    blurb: 'Pré-dreadnought Mikasa: cruza o T, fumo de carvão, canhões de 12 polegadas.',
    waters: 'o estreito de Tsushima',
  },
  falklands: {
    name: 'Guerra das Malvinas',
    blurb: 'Fragata Tipo 21: Exocets, Tipo 42, o inverno austral.',
    waters: 'o estreito de São Carlos',
  },
  somali: {
    name: 'Piratas somalis',
    blurb: 'Traineira-mãe sequestrada: RPGs, esquifes e escadas — ao tráfego de Suez.',
    waters: 'o golfo de Áden',
  },
};

const ja: ErasDict = {
  ui: {
    stepTag: 'ステップ5/7・時代と海域',
    heading: '時代を選べ',
    hint: 'カードをドラッグ、銘板をタップ、← → — 時代が海域・敵・テープを決める。旗艦は次の画面に。',
    prevEra: '前の時代',
    nextEra: '次の時代',
    eraCount: '時代 {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}。',
    warship: '軍艦',
    ariaTab: '時代',
  },
  shipStep: {
    stepTag: 'ステップ6/7・旗艦',
    stepTagCampaign: 'ステップ6/7・遠征旗艦',
    heading: '旗艦を選べ',
    headingCampaign: '遠征旗艦を選べ',
    hint: '肖像をドラッグ、船体をタップ、← → — 数値は英雄艦隊全体との比較。各船体は自時代のみ航海。出航はいつでも。',
    hintCampaign:
      'この船体で全26時代を征く — 全時代、同船、強化継承。出航はいつでも。',
  },
  groupSail: '帆船時代',
  groupSteel: '鋼鉄海軍',
  groupHeritage: '伝説の海',
  golden: { name: '海賊の黄金時代', blurb: '万能スループ — 堅実な選択。' },
  exploration: { name: '大航海時代', blurb: '俊敏なキャラベル、軽砲、速い舵。' },
  napoleonic: { name: 'ナポレオン戦争', blurb: 'フリゲート:片舷4門、最長射程。' },
  barbary: {
    name: 'バーバリ戦争',
    blurb: 'スクーナー:12門、耐候性と快速 — トリポリの岸へ。',
    waters: 'バーバリ海岸',
  },
  viking: { name: 'ヴァイキング時代', blurb: 'ロングシップ:最速船体、最薄装甲。' },
  ironclad: { name: '装甲艦時代', blurb: '蒸気装甲艦:重装甲、苛烈、帆なし。' },
  ww1: {
    name: '海の大戦',
    blurb: '駆逐艦:速射砲、タービン、最薄の鋼鉄。',
    waters: 'ドッガーバンク',
  },
  ww2: {
    name: '海の第二次大戦',
    blurb: 'フレッチャー級:五基、レーダー、最速の砲。',
    waters: 'ソロモン諸島',
  },
  hormuz: {
    name: 'タンカー戦争',
    blurb: 'カマン級ミサイル艇:先制し、速く逃げ、護衛をかわせ。',
    waters: 'ホルムズ海峡',
  },
  roman: {
    name: '第一次ポエニ戦争',
    blurb: 'クィンクェレメ:青銅衝角、赤帆、無尽のオール。',
    waters: '地中海',
  },
  greek: {
    name: 'ペルシア戦争',
    blurb: '三段櫂船:サラミス最速の衝角 — 紙の装甲。',
    waters: '地中海',
  },
  arab: {
    name: 'モンスーンの海',
    blurb: '外洋ブーム:ラテン帆、俊足のモンスーン走者。',
    waters: 'アラビア海岸',
  },
  chinese: {
    name: '明の宝船航海',
    blurb: '軍ジャンク:鄭和の浮かぶ要塞。',
    waters: 'シンガポール海峡',
  },
  japanese: {
    name: '戦国時代',
    blurb: '安宅船:黒漆の砲郭。鈍足、苛烈。',
    waters: '瀬戸内海',
  },
  maori: {
    name: 'マオリのマスケット戦争',
    blurb: 'ワカ・タウア:大型戦闘カヌー — 速い櫂、鹵獲砲。',
    waters: 'ベイ・オブ・アイランズ',
  },
  hawaii: {
    name: 'ハワイ統一',
    blurb: 'ペレレウ・ヴァア:カメハメハ艦隊の快速戦闘カヌー。',
    waters: 'コナ海岸',
  },
  macedon: {
    name: '海のマケドニア',
    blurb: 'デメトリオスの攻城ガレー:最大の軍船。鈍足、無敵。',
    waters: 'キプロスのサラミス沖',
  },
  maya: {
    name: 'マヤのファーストコンタクト',
    blurb: 'トゥルムの大型戦闘カヌー — 異邦人を岸から追え。',
    waters: 'ホンジュラス湾',
  },
  inca: {
    name: 'インカ太平洋航海',
    blurb: 'トゥパクの大バルサ — 西の海へのサパ・インカの手。',
    waters: 'グアヤキル湾',
  },
  lepanto: {
    name: 'レパント',
    blurb: 'オスマン軍ガレー:艦首砲、オール、接舷兵。同盟が待つ。',
    waters: 'パトラス湾',
  },
  korea: {
    name: '文禄の役',
    blurb: '亀甲船:鉄屋根、全周の砲。海峡を守れ。',
    waters: '鳴梁海峡',
  },
  byzantium: {
    name: 'コンスタンティノープル包囲戦',
    blurb: 'ギリシャ火のドロモン:カリフ艦隊を海峡から焼き払え。',
    waters: 'ボスポラス海峡',
  },
  egypt: {
    name: '海の民との戦い',
    blurb: 'ラムセス3世の軍ガレー:史上初の海戦。',
    waters: 'ナイルデルタ',
  },
  chola: {
    name: '湾を越えたチョーラ',
    blurb: 'チョーラ軍船:虎をベンガル湾の向こうへ運べ。',
    waters: 'ベンガル湾',
  },
  vietnam: {
    name: 'バックダン川',
    blurb: 'ベトナム軍ジャンク:ハーン艦隊を杭へ誘え。',
    waters: 'バックダン川',
  },
  aztec: {
    name: 'テノチティトラン陥落',
    blurb: 'クアウテモックの戦闘カヌー:湖を最後まで守れ。',
    waters: 'テスココ湖',
  },
  phoenicia: {
    name: 'フェニキアの海',
    blurb: 'ティルス二段櫂船:杉船体、紫帆、遠洋商人の先駆け。',
    waters: 'レバント海岸',
  },
  hanse: {
    name: 'ハンザ同盟',
    blurb: 'バルトのコグ:高い舷側、一枚横帆、商館の狼。',
    waters: 'バルト海接近路',
  },
  portugal: {
    name: 'エスタード・ダ・インディア',
    blurb: 'ポルトガル・ナウ:ラテン哨戒、重砲、胡椒航路。',
    waters: 'マラバール海岸',
  },
  armada: {
    name: 'スペイン無敵艦隊',
    blurb: '快速ガレオン:耐候性、速射砲 — 神は吹いた。',
    waters: 'ドーバー海峡',
  },
  dutch: {
    name: 'オランダ黄金時代',
    blurb: 'ゼーフェン・プロヴィンシェン:橙の粧い、テセル沖の砲林。',
    waters: 'テセル島沖',
  },
  ottoman: {
    name: 'カプダン・パシャ',
    blurb: 'バルバロスのカドゥルガ:プレヴェザ、同盟を歯に。',
    waters: 'イオニア海',
  },
  predread: {
    name: '対馬',
    blurb: '前弩級三笠:T字を切り、石炭煙、12インチ砲。',
    waters: '対馬海峡',
  },
  falklands: {
    name: 'フォークランド戦争',
    blurb: '21型フリゲート:エグゾセ、42型、南大西洋の冬。',
    waters: 'フォークランド海峡',
  },
  somali: {
    name: 'ソマリアの海賊',
    blurb: '拿捕トロール母船:RPG、スキッフ、梯子 — スエズ航路を狩れ。',
    waters: 'アデン湾',
  },
};

const zh: ErasDict = {
  ui: {
    stepTag: '第 5 步，共 7 步 · 时代与水域',
    heading: '选择时代',
    hint: '拖卡片、点铭牌或用 ← →——时代决定你作战的水域、遭遇的敌人和播放的磁带。她的英雄船体在下页等你。',
    prevEra: '上一年代',
    nextEra: '下一年代',
    eraCount: '时代 {{n}} / {{total}}',
    watersSuffix: '——{{waters}}。',
    warship: '战船',
    ariaTab: '时代',
  },
  shipStep: {
    stepTag: '第 6 步，共 7 步 · 英雄船',
    stepTagCampaign: '第 6 步，共 7 步 · 战役船',
    heading: '选择英雄船',
    headingCampaign: '选择战役船',
    hint: '拖肖像、点船体或用 ← →——每个数字都与英雄船队整体对比，每船只航行于自己的时代。选中就起航。',
    hintCampaign:
      '这艘船将载你穿越全部 26 个时代——每个年代，同一艘船，升级保留。选中就起航。',
  },
  groupSail: '风帆时代',
  groupSteel: '钢铁海军',
  groupHeritage: '传承之海',
  golden: { name: '海盗黄金时代', blurb: '均衡单桅船——稳妥之选。' },
  exploration: { name: '大航海时代', blurb: '轻快卡拉维拉，炮轻舵快。' },
  napoleonic: { name: '拿破仑战争', blurb: '巡防舰：每舷 4 炮，射程最远。' },
  barbary: {
    name: '巴巴里战争',
    blurb: '纵帆船：12 炮，迎风快——直抵的黎波里海岸。',
    waters: '巴巴里海岸',
  },
  viking: { name: '维京时代', blurb: '长船：最快的船体，最薄的皮。' },
  ironclad: { name: '铁甲舰时代', blurb: '蒸汽炮廓舰：装甲，残暴，无帆。' },
  ww1: {
    name: '海上大战',
    blurb: '驱逐舰：速射炮，汽轮机，最薄的钢铁皮。',
    waters: '多格滩',
  },
  ww2: {
    name: '海上二战',
    blurb: '弗莱彻级：五座炮塔，雷达，最快的水面炮。',
    waters: '所罗门群岛',
  },
  hormuz: {
    name: '油轮战争',
    blurb: '卡曼级导弹艇：先开火，快跑，躲护航舰。',
    waters: '霍尔木兹海峡',
  },
  roman: {
    name: '第一次布匿战争',
    blurb: '五列桨船：青铜撞角，红帆，无尽桨。',
    waters: '地中海',
  },
  greek: {
    name: '希波战争',
    blurb: '三列桨船：萨拉米斯最快的撞角——纸一样薄的皮。',
    waters: '地中海',
  },
  arab: {
    name: '季风海',
    blurb: '远洋单桅船：三角帆，季风快船。',
    waters: '阿拉伯海岸',
  },
  chinese: {
    name: '明朝宝船远航',
    blurb: '战船：郑和的水上堡垒。',
    waters: '新加坡海峡',
  },
  japanese: {
    name: '战国时代',
    blurb: '安宅船：黑漆炮楼。慢，残暴。',
    waters: '濑户内海',
  },
  maori: {
    name: '毛利火枪战争',
    blurb: '瓦卡战舟：大战舟——桨快，缴获炮。',
    waters: '岛屿湾',
  },
  hawaii: {
    name: '夏威夷统一',
    blurb: '佩莱莱乌战舟：卡美哈梅哈舰队的快战舟。',
    waters: '科纳海岸',
  },
  macedon: {
    name: '马其顿海战',
    blurb: '德米特里的攻城桨帆船：水上最大战船。慢，不可阻挡。',
    waters: '塞浦路斯萨拉米斯外海',
  },
  maya: {
    name: '玛雅初遇',
    blurb: '图卢姆大战舟——把陌生人赶出海岸。',
    waters: '洪都拉斯湾',
  },
  inca: {
    name: '印加太平洋远航',
    blurb: '图帕克大轻木筏——萨帕·印卡在西海的臂展。',
    waters: '瓜亚基尔湾',
  },
  lepanto: {
    name: '勒班陀',
    blurb: '奥斯曼战船：艏炮，桨，接舷兵。神圣同盟在等。',
    waters: '帕特雷湾',
  },
  korea: {
    name: '壬辰卫国战',
    blurb: '龟船：铁顶，四面炮。守住海峡。',
    waters: '鸣梁海峡',
  },
  byzantium: {
    name: '君士坦丁堡之围',
    blurb: '希腊火战船：把哈里发舰队烧出海峡。',
    waters: '博斯普鲁斯海峡',
  },
  egypt: {
    name: '迎战海上民族',
    blurb: '拉美西斯三世的战船：史上第一场海战。',
    waters: '尼罗河三角洲',
  },
  chola: {
    name: '朱罗横渡海湾',
    blurb: '朱罗战船：载猛虎横渡孟加拉湾。',
    waters: '孟加拉湾',
  },
  vietnam: {
    name: '白藤江',
    blurb: '越南战船：把可汗舰队引进桩阵。',
    waters: '白藤江',
  },
  aztec: {
    name: '特诺奇蒂特兰陷落',
    blurb: '夸乌特莫克战舟：血战大湖到底。',
    waters: '特斯科科湖',
  },
  phoenicia: {
    name: '腓尼基海域',
    blurb: '推罗双列桨船：雪松船体，紫帆，远洋商船之祖。',
    waters: '黎凡特海岸',
  },
  hanse: {
    name: '汉萨同盟',
    blurb: '波罗的海柯克船：高舷，单横帆，商站之狼。',
    waters: '波罗的海入口',
  },
  portugal: {
    name: '印度之邦',
    blurb: '葡萄牙大克拉克船：三角帆侦察船，重炮，胡椒航线。',
    waters: '马拉巴尔海岸',
  },
  armada: {
    name: '西班牙无敌舰队',
    blurb: '竞速大帆船：迎风，炮快——上帝吹了口气。',
    waters: '海峡',
  },
  dutch: {
    name: '荷兰黄金时代',
    blurb: '七省号：橙饰，特塞尔外炮林。',
    waters: '特塞尔',
  },
  ottoman: {
    name: '海军统帅',
    blurb: '巴巴罗萨的卡迪尔加船：普雷韦扎，同盟在你齿间。',
    waters: '爱奥尼亚海',
  },
  predread: {
    name: '对马',
    blurb: '前无畏舰三笠：抢T横头，煤烟，12英寸炮。',
    waters: '对马海峡',
  },
  falklands: {
    name: '马岛战争',
    blurb: '21型护卫舰：飞鱼，42型，南大西洋寒冬。',
    waters: '福克兰海峡',
  },
  somali: {
    name: '索马里海盗',
    blurb: '劫持拖网母船：RPG、小艇和梯子——劫苏伊士航线。',
    waters: '亚丁湾',
  },
};

const id: ErasDict = {
  ui: {
    stepTag: 'Langkah 5 dari 7 · Zaman & Perairan',
    heading: 'Pilih Zamanmu',
    hint: 'Seret kartu, ketuk pelat, atau gunakan ← → — zaman menentukan perairan tempatmu bertempur, musuh yang kautemui, dan kaset yang diputar. Lambung pahlawannya menanti di layar berikut.',
    prevEra: 'Zaman sebelumnya',
    nextEra: 'Zaman berikut',
    eraCount: 'Zaman {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}.',
    warship: 'kapal perang',
    ariaTab: 'Zaman',
  },
  shipStep: {
    stepTag: 'Langkah 6 dari 7 · Kapal Pahlawan',
    stepTagCampaign: 'Langkah 6 dari 7 · Kapal Kampanye',
    heading: 'Pilih Kapal Pahlawanmu',
    headingCampaign: 'Pilih Kapal Kampanyemu',
    hint: 'Seret potret, ketuk lambung, atau gunakan ← → — tiap angka diukur terhadap seluruh armada pahlawan, dan tiap lambung hanya berlayar di zamannya sendiri. Berlayarlah saat ia cocok.',
    hintCampaign:
      'Lambung ini akan membawamu melewati semua 26 zaman — tiap masa, kapal yang sama, peningkatan disimpan. Berlayarlah saat ia cocok.',
  },
  groupSail: 'Zaman Layar',
  groupSteel: 'AL Baja',
  groupHeritage: 'Lautan Warisan',
  golden: { name: 'Zaman Keemasan Bajak Laut', blurb: 'Sloop seimbang — tangan aman.' },
  exploration: { name: 'Zaman Penjelajahan', blurb: 'Karavel lincah, meriam ringan, kemudi cepat.' },
  napoleonic: { name: 'Perang Napoleon', blurb: 'Fregat: 4 meriam per sisi, jangkauan terjauh.' },
  barbary: {
    name: 'Perang Barbary',
    blurb: 'Sekunar: 12 meriam, lincah dan cepat — ke pantai Tripoli.',
    waters: 'Pesisir Barbary',
  },
  viking: { name: 'Zaman Viking', blurb: 'Longship: lambung tercepat, kulit tertipis.' },
  ironclad: { name: 'Zaman Ironclad', blurb: 'Kasemat uap: berzirah, brutal, tanpa layar.' },
  ww1: {
    name: 'Perang Besar di Laut',
    blurb: 'Destroyer: meriam cepat, turbin, kulit baja tertipis.',
    waters: 'Gosong Dogger',
  },
  ww2: {
    name: 'Perang Dunia Kedua di Laut',
    blurb: 'Kelas Fletcher: lima dudukan, radar, meriam tercepat.',
    waters: 'Kepulauan Solomon',
  },
  hormuz: {
    name: 'Perang Tanker',
    blurb: 'Kapal rudal kelas Kaman: tembak dulu, lari cepat, hindari pengawal.',
    waters: 'Selat Hormuz',
  },
  roman: {
    name: 'Perang Punisia Pertama',
    blurb: 'Quinquereme: ram perunggu, layar merah, dayung tanpa akhir.',
    waters: 'Laut Tengah',
  },
  greek: {
    name: 'Perang Persia',
    blurb: 'Trireme: ram tercepat di Salamis — kulit setipis kertas.',
    waters: 'Laut Tengah',
  },
  arab: {
    name: 'Lautan Muson',
    blurb: 'Boom samudra: layar lateen, pelari muson tangkas.',
    waters: 'Pesisir Arab',
  },
  chinese: {
    name: 'Pelayaran Harta Ming',
    blurb: 'Jung perang: benteng terapung Zheng He.',
    waters: 'Selat Singapura',
  },
  japanese: {
    name: 'Zaman Sengoku',
    blurb: 'Atakebune: puri meriam pernis hitam. Lambat, brutal.',
    waters: 'Laut Pedalaman Seto',
  },
  maori: {
    name: 'Perang Senapan Māori',
    blurb: 'Waka taua: kano perang besar — dayung tangkas, meriam rampasan.',
    waters: 'Teluk Islands',
  },
  hawaii: {
    name: 'Penyatuan Hawaii',
    blurb: 'Waʻa Peleleu: kano perang tangkas armada Kamehameha.',
    waters: 'Pesisir Kona',
  },
  macedon: {
    name: 'Makedonia di Laut',
    blurb: 'Galai pengepungan Demetrius: kapal perang terbesar. Lambat, tak terbendung.',
    waters: 'lepas Salamis, Siprus',
  },
  maya: {
    name: 'Kontak Pertama Maya',
    blurb: 'Kano perang besar Tulum — usir orang asing dari pantaimu.',
    waters: 'Teluk Honduras',
  },
  inca: {
    name: 'Pelayaran Pasifik Inca',
    blurb: 'Balsa besar Tupac — jangkauan Sapa Inca di laut barat.',
    waters: 'Teluk Guayaquil',
  },
  lepanto: {
    name: 'Lepanto',
    blurb: 'Galai perang Ottoman: meriam haluan, dayung, penyerbu. Liga menanti.',
    waters: 'Teluk Patras',
  },
  korea: {
    name: 'Perang Imjin',
    blurb: 'Kapal kura-kura: atap besi, meriam di tiap sisi. Tahan selat.',
    waters: 'Selat Myeongnyang',
  },
  byzantium: {
    name: 'Pengepungan Konstantinopel',
    blurb: 'Dromon dengan api Yunani: bakar armada Khalifah keluar dari selat.',
    waters: 'Bosporus',
  },
  egypt: {
    name: 'Melawan Bangsa Laut',
    blurb: 'Galai perang Ramses III: pertempuran laut pertama dalam sejarah.',
    waters: 'Delta Nil',
  },
  chola: {
    name: 'Chola Seberang Teluk',
    blurb: 'Kapal perang Chola: bawa Harimau menyeberangi Teluk Benggala.',
    waters: 'Teluk Benggala',
  },
  vietnam: {
    name: 'Sungai Bạch Đằng',
    blurb: 'Jung perang Vietnam: pancing armada Khan ke pancang.',
    waters: 'Sungai Bạch Đằng',
  },
  aztec: {
    name: 'Jatuhnya Tenochtitlan',
    blurb: 'Kano perang Cuauhtémoc: bela danau sampai akhir.',
    waters: 'Danau Texcoco',
  },
  phoenicia: {
    name: 'Lautan Fenisia',
    blurb: 'Bireme Tirus: lambung cedar, layar ungu, yang pertama dari pedagang jauh.',
    waters: 'Pesisir Levantine',
  },
  hanse: {
    name: 'Liga Hansa',
    blurb: 'Kog Baltik: sisi tinggi, satu layar persegi, serigala Kontor.',
    waters: 'Pintu Baltik',
  },
  portugal: {
    name: 'Estado da Índia',
    blurb: 'Nau Portugis: pengintai lateen, meriam berat, pelayaran lada.',
    waters: 'Pesisir Malabar',
  },
  armada: {
    name: 'Armada Spanyol',
    blurb: 'Galeon balap: lincah, meriam cepat — Tuhan meniup.',
    waters: 'Selat',
  },
  dutch: {
    name: 'Zaman Keemasan Belanda',
    blurb: 'Zeven Provinciën: lis oranye, hutan meriam di lepas Texel.',
    waters: 'Texel',
  },
  ottoman: {
    name: 'Kapudan Pasha',
    blurb: 'Kadirga Barbarossa: Preveza, Liga di gigimu.',
    waters: 'Laut Ionia',
  },
  predread: {
    name: 'Tsushima',
    blurb: 'Pra-dreadnought Mikasa: potong T, asap batu bara, meriam 12 inci.',
    waters: 'Selat Tsushima',
  },
  falklands: {
    name: 'Perang Falklands',
    blurb: 'Fregat Tipe 21: Exocet, Tipe 42, musim dingin Atlantik Selatan.',
    waters: 'Selat Falkland',
  },
  somali: {
    name: 'Bajak Laut Somali',
    blurb: 'Kapal induk pukat yang dibajak: RPG, skiff, dan tangga — ambil lalu lintas Suez.',
    waters: 'Teluk Aden',
  },
};

const th: ErasDict = {
  ui: {
    stepTag: 'ขั้นตอนที่ 5 จาก 7 · ยุค & น่านน้ำ',
    heading: 'เลือกยุค',
    hint: 'ลากการ์ด แตะป้าย หรือใช้ ← → — ยุคกำหนดน่านน้ำที่ท่านรบ ศัตรูที่เจอ และเทปที่เล่น ตัวเรือวีรชนของเธอรอหน้าถัดไป',
    prevEra: 'ยุคก่อน',
    nextEra: 'ยุคถัดไป',
    eraCount: 'ยุค {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}',
    warship: 'เรือรบ',
    ariaTab: 'ยุค',
  },
  shipStep: {
    stepTag: 'ขั้นตอนที่ 6 จาก 7 · เรือวีรชน',
    stepTagCampaign: 'ขั้นตอนที่ 6 จาก 7 · เรือแคมเปญ',
    heading: 'เลือกเรือวีรชน',
    headingCampaign: 'เลือกเรือแคมเปญ',
    hint: 'ลากภาพ แตะตัวเรือ หรือใช้ ← → — ทุกตัวเลขเทียบกับกองเรือวีรชนทั้งกอง แต่ละตัวเรือแล่นเฉพาะยุคตัวเอง ถูกใจแล้วออกเรือ',
    hintCampaign:
      'ตัวเรือนี้จะพาท่านผ่าน 26 ยุค — ทุกยุค ลำเดียว อัปเกรดอยู่ครบ ถูกใจแล้วออกเรือ',
  },
  groupSail: 'ยุคเรือใบ',
  groupSteel: 'ทัพเรือเหล็ก',
  groupHeritage: 'ทะเลมรดก',
  golden: { name: 'ยุคทองโจรสลัด', blurb: 'สลูปสมดุล — มือชัวร์' },
  exploration: { name: 'ยุคสำรวจ', blurb: 'คาราเวลคล่อง ปืนเบา หางเสือไว' },
  napoleonic: { name: 'สงครามนโปเลียน', blurb: 'ฟริเกต: 4 ปืนต่อข้าง ไกลสุด' },
  barbary: {
    name: 'สงครามบาร์บารี',
    blurb: 'สกูนเนอร์: 12 ปืน คล่องไว — สู่ฝั่งตริโปลี',
    waters: 'ชายฝั่งบาร์บารี',
  },
  viking: { name: 'ยุคไวกิ้ง', blurb: 'ลองชิป: ตัวเรือเร็วสุด เปลือกบางสุด' },
  ironclad: { name: 'ยุคไอรอนแคลด', blurb: 'ป้อมกลไฟ: เกราะ โหด ไร้ใบ' },
  ww1: {
    name: 'มหาสงครามทางทะเล',
    blurb: 'เรือพิฆาต: ปืนยิงเร็ว กังหัน เปลือกเหล็กบางสุด',
    waters: 'ด็อกเกอร์แบงก์',
  },
  ww2: {
    name: 'สงครามโลกครั้งที่สองทางทะเล',
    blurb: 'ชั้นเฟลตเชอร์: ห้าป้อม เรดาร์ ปืนเร็วสุด',
    waters: 'หมู่เกาะโซโลมอน',
  },
  hormuz: {
    name: 'สงครามเรือบรรทุกน้ำมัน',
    blurb: 'เรือขีปนาวุธชั้นกามาน: ยิงก่อน หนีเร็ว หลบเรือคุ้มกัน',
    waters: 'ช่องแคบฮอร์มุซ',
  },
  roman: {
    name: 'สงครามพิวนิกครั้งที่หนึ่ง',
    blurb: 'ควินเควเรม: หัวชนทองสัมฤทธิ์ ใบแดง พายไม่รู้จบ',
    waters: 'ทะเลเมดิเตอร์เรเนียน',
  },
  greek: {
    name: 'สงครามเปอร์เซีย',
    blurb: 'ไทรรีม: หัวชนเร็วสุดที่ซาลามิส — เปลือกบางอย่างกระดาษ',
    waters: 'ทะเลเมดิเตอร์เรเนียน',
  },
  arab: {
    name: 'ทะเลมรสุม',
    blurb: 'บูมมหาสมุทร: ใบเลทีน นักวิ่งมรสุมไว',
    waters: 'ชายฝั่งอาหรับ',
  },
  chinese: {
    name: 'เดินเรือมหาสมบัติหมิง',
    blurb: 'สำเภารบ: ป้อมลอยน้ำเจิ้งเหอ',
    waters: 'ช่องแคบสิงคโปร์',
  },
  japanese: {
    name: 'ยุคเซ็นโกกุ',
    blurb: 'อาตาเกะบุเนะ: ปราสาทปืนลงรักดำ ช้า โหด',
    waters: 'ทะเลในเซโตะ',
  },
  maori: {
    name: 'สงครามปืนเมารี',
    blurb: 'วากาเตาวา: เรือแคนูรบใหญ่ — พายไว ปืนยึดมา',
    waters: 'อ่าวเบย์ออฟไอแลนด์ส',
  },
  hawaii: {
    name: 'รวมฮาวาย',
    blurb: 'วาอาเปเลเลอู: เรือแคนูรบไวของกองเรือคาเมฮาเมฮา',
    waters: 'ชายฝั่งโคนา',
  },
  macedon: {
    name: 'มาซิโดเนียทางทะเล',
    blurb: 'แกลลีย์ประชิดเดเมทริอุส: เรือรบใหญ่สุด ช้า หยุดไม่อยู่',
    waters: 'นอกซาลามิส ไซปรัส',
  },
  maya: {
    name: 'พบครั้งแรกมายา',
    blurb: 'เรือแคนูรบใหญ่ทูลุม — ไล่คนแปลกหน้าจากฝั่งท่าน',
    waters: 'อ่าวฮอนดูรัส',
  },
  inca: {
    name: 'เดินเรือแปซิฟิกอินคา',
    blurb: 'แพบัลซาใหญ่ทูพัค — แขนซาปาอินคาในทะเลตะวันตก',
    waters: 'อ่าวกัวยากิล',
  },
  lepanto: {
    name: 'เลปันโต',
    blurb: 'แกลลีย์รบออตโตมัน: ปืนหัว พาย ทหารยึด สันนิบาตรออยู่',
    waters: 'อ่าวปาทรัส',
  },
  korea: {
    name: 'สงครามอิมจิน',
    blurb: 'เรือเต่า: หลังคาเหล็ก ปืนทุกด้าน ยึดช่องแคบ',
    waters: 'ช่องแคบเมียงนยัง',
  },
  byzantium: {
    name: 'ล้อมคอนสแตนติโนเปิล',
    blurb: 'โดรโมนกรีกไฟ: เผากองเรือกาหลิบออกจากช่องแคบ',
    waters: 'บอสพอรัส',
  },
  egypt: {
    name: 'สู้ชนเผ่าทะเล',
    blurb: 'แกลลีย์รบแรมเสสที่ 3: ยุทธนาวีครั้งแรกในประวัติศาสตร์',
    waters: 'ดินดอนไนล์',
  },
  chola: {
    name: 'โจฬะข้ามอ่าว',
    blurb: 'เรือรบโจฬะ: พาเสือข้ามอ่าวเบงกอล',
    waters: 'อ่าวเบงกอล',
  },
  vietnam: {
    name: 'แม่น้ำบักดั่ง',
    blurb: 'สำเภารบเวียดนาม: ล่อกองเรือข่านเข้าหลักไม้',
    waters: 'แม่น้ำบักดั่ง',
  },
  aztec: {
    name: 'เสียเตนอชตีตลัน',
    blurb: 'เรือแคนูรบเกาว์เตม็อก: ป้องทะเลสาบถึงที่สุด',
    waters: 'ทะเลสาบเตซโกโก',
  },
  phoenicia: {
    name: 'ทะเลฟินีเซีย',
    blurb: 'ไบรีมไทร์: ตัวเรือซีดาร์ ใบม่วง นักค้าไกลคนแรก',
    waters: 'ชายฝั่งเลแวนไทน์',
  },
  hanse: {
    name: 'สันนิบาตฮันซา',
    blurb: 'ค็อกก์บอลติก: ข้างสูง ใบสี่เหลี่ยมใบเดียว หมาป่าแห่งคอนทอร์',
    waters: 'ทางเข้าบอลติก',
  },
  portugal: {
    name: 'เอสตาดู ดา อินเดีย',
    blurb: 'นาวโปรตุเกส: สอดแนมเลทีน ปืนหนัก เส้นทางพริกไทย',
    waters: 'ชายฝั่งมาลาบาร์',
  },
  armada: {
    name: 'อาร์มาดาสเปน',
    blurb: 'แกลเลียนแข่ง: คล่อง ปืนไว — พระเจ้าเป่า',
    waters: 'ช่องแคบ',
  },
  dutch: {
    name: 'ยุคทองดัตช์',
    blurb: 'เซเวน โพรวิินเชียน: แถบส้ม ป่าปืนนอกเท็กเซล',
    waters: 'เท็กเซล',
  },
  ottoman: {
    name: 'คาปูดันปาชา',
    blurb: 'กาดีร์กาบาร์บารอสซา: พรีเวซา สันนิบาตในฟันท่าน',
    waters: 'ทะเลไอโอเนียน',
  },
  predread: {
    name: 'สึชิมะ',
    blurb: 'พรีเดรดนอตมิกาสะ: ตัดตัว T ควันถ่าน ปืน 12 นิ้ว',
    waters: 'ช่องแคบสึชิมะ',
  },
  falklands: {
    name: 'สงครามฟอล์กแลนด์',
    blurb: 'ฟริเกต Type 21: เอ็กโซเซต์ Type 42 หนาวแอตแลนติกใต้',
    waters: 'ช่องแคบฟอล์กแลนด์',
  },
  somali: {
    name: 'โจรสลัดโซมาลี',
    blurb: 'เรือแม่เรือลากอวนที่จี้: RPG สกิฟฟ์และบันได — เอาเส้นทางสุเอซ',
    waters: 'อ่าวเอเดน',
  },
};

const vi: ErasDict = {
  ui: {
    stepTag: 'Bước 5 / 7 · Thời Đại & Vùng Nước',
    heading: 'Chọn Thời Đại',
    hint: 'Kéo thẻ, chạm bảng hoặc dùng ← → — thời quyết định vùng nước bạn đánh, địch bạn gặp và băng nhạc phát. Thân anh hùng của nàng chờ ở màn sau.',
    prevEra: 'Thời trước',
    nextEra: 'Thời sau',
    eraCount: 'Thời {{n}} / {{total}}',
    watersSuffix: ' — {{waters}}.',
    warship: 'chiến hạm',
    ariaTab: 'Thời đại',
  },
  shipStep: {
    stepTag: 'Bước 6 / 7 · Tàu Anh Hùng',
    stepTagCampaign: 'Bước 6 / 7 · Tàu Chiến Dịch',
    heading: 'Chọn Tàu Anh Hùng',
    headingCampaign: 'Chọn Tàu Chiến Dịch',
    hint: 'Kéo chân dung, chạm thân tàu hoặc dùng ← → — mọi con số đều đo với cả hạm đội anh hùng, mỗi thân chỉ dong thời của mình. Ưng thì ra khơi.',
    hintCampaign:
      'Thân này sẽ đưa bạn qua cả 26 thời — mọi thời, một tàu, giữ nâng cấp. Ưng thì ra khơi.',
  },
  groupSail: 'Thời Buồm',
  groupSteel: 'Hải Quân Thép',
  groupHeritage: 'Biển Di Sản',
  golden: { name: 'Thời Hoàng Kim Cướp Biển', blurb: 'Sloop cân bằng — lựa chọn an toàn.' },
  exploration: { name: 'Thời Đại Khám Phá', blurb: 'Caravel nhanh nhẹn, pháo nhẹ, lái lẹ.' },
  napoleonic: { name: 'Chiến Tranh Napoleon', blurb: 'Frigate: 4 pháo mỗi mạn, tầm xa nhất.' },
  barbary: {
    name: 'Chiến Tranh Barbary',
    blurb: 'Schooner: 12 pháo, lanh lẹ — tới bờ Tripoli.',
    waters: 'Bờ Biển Barbary',
  },
  viking: { name: 'Thời Viking', blurb: 'Thuyền dài: thân nhanh nhất, vỏ mỏng nhất.' },
  ironclad: { name: 'Thời Tàu Bọc Sắt', blurb: 'Hầm pháo hơi nước: giáp trụ, tàn bạo, không buồm.' },
  ww1: {
    name: 'Đại Chiến Trên Biển',
    blurb: 'Tàu khu trục: pháo bắn nhanh, turbine, vỏ thép mỏng nhất.',
    waters: 'Bãi Dogger',
  },
  ww2: {
    name: 'Thế Chiến II Trên Biển',
    blurb: 'Lớp Fletcher: năm bệ pháo, radar, pháo nhanh nhất mặt nước.',
    waters: 'Quần Đảo Solomon',
  },
  hormuz: {
    name: 'Chiến Tranh Tàu Dầu',
    blurb: 'Tàu tên lửa lớp Kaman: bắn trước, chạy nhanh, né hộ tống.',
    waters: 'Eo Biển Hormuz',
  },
  roman: {
    name: 'Chiến Tranh Punic Lần Một',
    blurb: 'Quinquereme: mũi đâm đồng, buồm đỏ, chèo vô tận.',
    waters: 'Biển Địa Trung Hải',
  },
  greek: {
    name: 'Chiến Tranh Ba Tư-Hy Lạp',
    blurb: 'Trireme: mũi đâm nhanh nhất ở Salamis — vỏ mỏng như giấy.',
    waters: 'Biển Địa Trung Hải',
  },
  arab: {
    name: 'Biển Gió Mùa',
    blurb: 'Boom đại dương: buồm latin, tàu chạy gió mùa nhanh.',
    waters: 'Bờ Biển Ả Rập',
  },
  chinese: {
    name: 'Hải Trình Kho Báu Minh',
    blurb: 'Thuyền chiến: pháo đài nổi của Trịnh Hòa.',
    waters: 'Eo Biển Singapore',
  },
  japanese: {
    name: 'Thời Sengoku',
    blurb: 'Atakebune: pháo đài sơn đen. Chậm, tàn bạo.',
    waters: 'Nội Hải Seto',
  },
  maori: {
    name: 'Chiến Tranh Súng Māori',
    blurb: 'Waka taua: xuồng chiến lớn — chèo nhanh, pháo chiếm được.',
    waters: 'Vịnh Đảo',
  },
  hawaii: {
    name: 'Thống Nhất Hawaii',
    blurb: 'Waʻa Peleleu: xuồng chiến nhanh của hạm đội Kamehameha.',
    waters: 'Bờ Biển Kona',
  },
  macedon: {
    name: 'Macedonia Trên Biển',
    blurb: 'Thuyền chèo công thành của Demetrius: chiến hạm lớn nhất. Chậm, không gì cản nổi.',
    waters: 'ngoài Salamis, Síp',
  },
  maya: {
    name: 'Maya Chạm Trán Đầu Tiên',
    blurb: 'Xuồng chiến lớn Tulum — đuổi người lạ khỏi bờ bạn.',
    waters: 'Vịnh Honduras',
  },
  inca: {
    name: 'Hải Trình Thái Bình Dương Inca',
    blurb: 'Bè lớn Tupac — tầm với của Sapa Inca trên biển tây.',
    waters: 'Vịnh Guayaquil',
  },
  lepanto: {
    name: 'Lepanto',
    blurb: 'Thuyền chiến Ottoman: pháo mũi, chèo, quân xung kích. Liên minh đang chờ.',
    waters: 'Vịnh Patras',
  },
  korea: {
    name: 'Chiến Tranh Imjin',
    blurb: 'Thuyền rùa: mái sắt, pháo bốn phía. Giữ eo biển.',
    waters: 'Eo Biển Myeongnyang',
  },
  byzantium: {
    name: 'Vây Hãm Constantinopolis',
    blurb: 'Dromon lửa Hy Lạp: đốt hạm đội Caliph khỏi eo biển.',
    waters: 'Bosporus',
  },
  egypt: {
    name: 'Chống Hải Nhân',
    blurb: 'Thuyền chiến của Ramesses III: trận thủy chiến đầu tiên trong sử.',
    waters: 'Đồng Bằng Sông Nile',
  },
  chola: {
    name: 'Chola Vượt Vịnh',
    blurb: 'Chiến thuyền Chola: đưa Hổ vượt Vịnh Bengal.',
    waters: 'Vịnh Bengal',
  },
  vietnam: {
    name: 'Sông Bạch Đằng',
    blurb: 'Thuyền chiến Việt: dụ hạm đội Hãn lên bãi cọc.',
    waters: 'Sông Bạch Đằng',
  },
  aztec: {
    name: 'Sụp Đổ Tenochtitlan',
    blurb: 'Xuồng chiến của Cuauhtémoc: giữ hồ tới cùng.',
    waters: 'Hồ Texcoco',
  },
  phoenicia: {
    name: 'Biển Phoenicia',
    blurb: 'Bireme Tyre: thân tuyết tùng, buồm tím, nhà buôn xa đầu tiên.',
    waters: 'Bờ Levantine',
  },
  hanse: {
    name: 'Liên Minh Hansa',
    blurb: 'Cog Baltic: mạn cao, một buồm vuông, sói của Kontor.',
    waters: 'Cửa Baltic',
  },
  portugal: {
    name: 'Estado da Índia',
    blurb: 'Nau Bồ Đào Nha: trinh sát latin, pháo nặng, tuyến hồ tiêu.',
    waters: 'Bờ Malabar',
  },
  armada: {
    name: 'Armada Tây Ban Nha',
    blurb: 'Galeon đua: lanh lẹ, pháo nhanh — Chúa đã thổi.',
    waters: 'Eo biển',
  },
  dutch: {
    name: 'Thời Hoàng Kim Hà Lan',
    blurb: 'Zeven Provinciën: viền cam, rừng pháo ngoài Texel.',
    waters: 'Texel',
  },
  ottoman: {
    name: 'Kapudan Pasha',
    blurb: 'Kadirga của Barbarossa: Preveza, Liên minh trong răng bạn.',
    waters: 'Biển Ionia',
  },
  predread: {
    name: 'Tsushima',
    blurb: 'Tiền-dreadnought Mikasa: cắt chữ T, khói than, pháo 12 inch.',
    waters: 'Eo Biển Tsushima',
  },
  falklands: {
    name: 'Chiến Tranh Falklands',
    blurb: 'Tàu hộ vệ Type 21: Exocet, Type 42, mùa đông Nam Đại Tây Dương.',
    waters: 'Eo Falkland',
  },
  somali: {
    name: 'Cướp Biển Somali',
    blurb: 'Tàu mẹ giã cào bị cướp: RPG, xuồng và thang — chặn tuyến Suez.',
    waters: 'Vịnh Aden',
  },
};

export const eras: Dict<ErasDict> = { en, es, fr, de, nl, pt, ja, zh, id, th, vi };
