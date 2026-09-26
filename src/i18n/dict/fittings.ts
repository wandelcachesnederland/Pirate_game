/** Hull fittings: per-era ram/spikes/fenders names+descs, refit-card leads and effect tags. */
import type { Dict } from './meta';

const en = {
  lead: { ram: 'Bow', spikes: 'Sides', fenders: 'Guard' },
  tag: { breach: ' · holes her', tangle: ' · slows her', fire: ' · sets her alight', shock: ' · stuns her crews' },
  eras: {
    golden: {
      ram: { name: 'Iron-Shod Cutwater', desc: 'Drive the iron-sheathed stem into a hull at speed' },
      spikes: { name: 'Grapnels on the Rails', desc: 'Anything that scrapes alongside is hooked, raked and slowed' },
      fenders: { name: 'Junk Fenders & Fend-Off Spars', desc: 'Rope-junk fenders and long spars keep rams and fire ships off' },
    },
    exploration: {
      ram: { name: 'Reinforced Beakhead', desc: 'A braced beakhead that smashes into a hull at speed' },
      spikes: { name: 'Sheer-Hooks on the Yardarms', desc: 'Sickle blades on the yards cut the rigging of anyone alongside' },
      fenders: { name: 'Ox-Hide Bolsters', desc: 'Hides stuffed with wool hung over the side soak up blows' },
    },
    napoleonic: {
      ram: { name: 'Coppered Stem & Iron Knee', desc: 'A doubled stem that stoves in planking at speed' },
      spikes: { name: 'Boarding Netting & Pikes', desc: 'Netting and a hedge of pikes along the rail wound boarders' },
      fenders: { name: 'Rope Fenders & Booms', desc: 'Fenders and fending booms keep other hulls off' },
    },
    barbary: {
      ram: { name: 'Copper-Sheathed Cutwater', desc: 'The schooner’s sharp stem, braced for ramming a gunboat' },
      spikes: { name: 'Boarding Netting & Pikes', desc: 'A hedge of pikes along the rail for the corsairs' },
      fenders: { name: 'Hammock Nettings', desc: 'Rolled hammocks stowed in the rail nettings stop shot and splinters' },
    },
    viking: {
      ram: { name: 'Iron-Bound Stem', desc: 'An iron band on the tall stem — ride up and crack her strakes' },
      spikes: { name: 'Spear Hedge on the Shield Rail', desc: 'Spears levelled between the shields gore anyone alongside' },
      fenders: { name: 'Oak Rubbing Strakes', desc: 'Thick oak wales take the blow instead of the planking' },
    },
    ironclad: {
      ram: { name: 'Cast-Iron Ram Bow', desc: 'The Virginia’s trick: hole her below the waterline' },
      spikes: { name: 'Boiler Scald Hoses', desc: 'Live steam piped to the rails scalds boarders — her crews scatter' },
      fenders: { name: 'Railroad-Iron Skirts', desc: 'Sloped iron over the waterline turns rams and shot aside' },
    },
    hanse: {
      ram: { name: 'Iron-Shod Cog Stem', desc: 'The cog’s heavy stem, shod for ramming' },
      spikes: { name: 'Sickle-Blade Yards', desc: 'Blades on the yardarms shear the rigging of anyone alongside' },
      fenders: { name: 'Wool-Sack Fenders', desc: 'Sacks of English wool hung over the side — the League’s own cargo' },
    },
    portugal: {
      ram: { name: 'Carrack Beakhead', desc: 'A massive beak braced to smash into dhows' },
      spikes: { name: 'Sheer-Hooks', desc: 'Hooked blades rip the rigging of anyone alongside' },
      fenders: { name: 'Cotton-Bale Bulwarks', desc: 'Bales of Indian cotton lashed along the waist' },
    },
    armada: {
      ram: { name: 'Galleass Iron Beak', desc: 'The galleass’s iron spur holes planking below the wale' },
      spikes: { name: 'Boarding Nets with Pikes', desc: 'Nets and pikes along the waist wound boarders' },
      fenders: { name: 'Fire-Ship Grapnel Booms', desc: 'Booms to fend off the fire ships of Gravelines' },
    },
    dutch: {
      ram: { name: 'Oak Stem Knee', desc: 'A doubled oak stem for running down a prize' },
      spikes: { name: 'Boarding-Pike Rails', desc: 'Pikes racked along the rail gore boarders' },
      fenders: { name: 'Hemp Fender Mats', desc: 'Thick woven hemp mats hung over the side' },
    },
    predread: {
      ram: { name: 'Ram Bow', desc: 'Every battleship of 1905 still carried a ram — use it' },
      spikes: { name: 'Torpedo-Net Booms', desc: 'Swung-out booms and steel netting foul anyone alongside' },
      fenders: { name: 'Harvey Steel Belt', desc: 'Face-hardened armour along the waterline' },
    },
    ww1: {
      ram: { name: 'Strengthened Ramming Bow', desc: 'Destroyers rammed U-boats — a bow built to do it' },
      spikes: { name: 'Explosive Paravanes', desc: 'Towed charges off the bow go off against a hull — crews reel' },
      fenders: { name: 'Anti-Torpedo Bulges', desc: 'Bulged outer hull soaks up blows and blasts' },
    },
    ww2: {
      ram: { name: 'Reinforced Ramming Stem', desc: 'Like USS Borie against U-405: ride up and crush her' },
      spikes: { name: 'Depth-Charge Rails', desc: 'Charges rolled at point blank — the shock scatters her crews' },
      fenders: { name: 'Splinter Mattresses', desc: 'Splinter matting over bridge and mounts' },
    },
    hormuz: {
      ram: { name: 'Reinforced Bow Plating', desc: 'A plated bow for running down speedboats' },
      spikes: { name: 'Contact-Mine Racks', desc: 'Mines racked on the rails go off against a hull' },
      fenders: { name: 'Kevlar Armour Panels', desc: 'Composite panels over the bridge and waterline' },
    },
    falklands: {
      ram: { name: 'Ice-Strengthened Bow', desc: 'A South Atlantic bow, strong enough to ram' },
      spikes: { name: 'Corvus Chaff Launchers', desc: 'Chaff and flares at point blank blind her crews' },
      fenders: { name: 'Kevlar Splinter Panels', desc: 'Added after Sheffield: splinter armour over the vitals' },
    },
    somali: {
      ram: { name: 'Welded Steel Bow Plate', desc: 'Scrap plate welded to the mothership’s bow — bump and board' },
      spikes: { name: 'Hooked Boarding Ladders', desc: 'Aluminium ladders hooked over her rail foul and slow her' },
      fenders: { name: 'Truck-Tyre Fenders', desc: 'Old tyres chained along the sides take the knocks' },
    },
    roman: {
      ram: { name: 'Bronze Rostrum', desc: 'A three-finned bronze ram — hole her below the waterline' },
      spikes: { name: 'Corvus Boarding Bridge', desc: 'The spiked bridge drops onto her deck and pins her' },
      fenders: { name: 'Oak Wales', desc: 'Heavy wales along the waterline take the ramming' },
    },
    greek: {
      ram: { name: 'Bronze Embolon', desc: 'The Salamis ram: at full stroke she stoves in a hull' },
      spikes: { name: 'Epotides Cathead Beams', desc: 'Beams off the bow sheer away the oars of anyone alongside' },
      fenders: { name: 'Hypozomata Girding Cables', desc: 'Hull-girding cables hold her together when struck' },
    },
    macedon: {
      ram: { name: 'Great Ram & Proembolion', desc: 'A main ram with a second above it for the heavy polyremes' },
      spikes: { name: 'Iron-Hand Grapnels', desc: 'Iron hands on chains seize anyone alongside' },
      fenders: { name: 'Doubled Wales & Hide Screens', desc: 'Doubled wales and hides over the oar box' },
    },
    phoenicia: {
      ram: { name: 'Bronze Boar-Snout Ram', desc: 'The pointed ram of the cedar galleys of Tyre' },
      spikes: { name: 'Shield-Hung Rail', desc: 'Shields and spear points hung along the rail' },
      fenders: { name: 'Cedar Wales', desc: 'Lebanon cedar wales along the waterline' },
    },
    egypt: {
      ram: { name: 'Lion-Head Prow Beam', desc: 'The lion-headed prow of Medinet Habu, braced for impact' },
      spikes: { name: 'Pole Grappling Hooks', desc: 'Hooks on poles drag raiders alongside and hold them' },
      fenders: { name: 'Papyrus-Bundle Bulwarks', desc: 'Bundled papyrus screens along the rail' },
    },
    byzantium: {
      ram: { name: 'Spur Beak', desc: 'The dromon’s spur rides over and snaps her oars' },
      spikes: { name: 'Hand-Siphon Fire Rails', desc: 'Hand siphons along the rail spray fire on anyone alongside' },
      fenders: { name: 'Vinegar-Soaked Felt', desc: 'Felt soaked in vinegar — the old defence against Greek fire' },
    },
    lepanto: {
      ram: { name: 'Galley Spur (Sperone)', desc: 'The iron spur rides over her bow and smashes her oars' },
      spikes: { name: 'Pavesade & Boarding Pikes', desc: 'Pikes behind the pavises gore boarders' },
      fenders: { name: 'Netting & Mattresses', desc: 'Boarding nets and mattresses over the rambades' },
    },
    ottoman: {
      ram: { name: 'Kadırga Spur', desc: 'The Ottoman spur snaps the oars of Christian galleys' },
      spikes: { name: 'Grapnel Chains', desc: 'Grapnels on chains lock anyone alongside' },
      fenders: { name: 'Wool-Bale Pavisade', desc: 'Wool bales lashed behind the rail' },
    },
    arab: {
      ram: { name: 'Teak Stem Cap', desc: 'A capped teak stem for running down pirates' },
      spikes: { name: 'Naphtha-Pot Racks', desc: 'Clay fire pots racked along the rail burst against a hull' },
      fenders: { name: 'Coir-Rope Fenders', desc: 'Coconut-fibre fenders, like the rope that sews the hull' },
    },
    chola: {
      ram: { name: 'Iron-Capped Stem', desc: 'An iron cap on the big Coromandel stem' },
      spikes: { name: 'Iron Spike Rail', desc: 'Iron spikes along the rail for the prahus' },
      fenders: { name: 'Coir Fenders', desc: 'Coconut-fibre fenders along the sides' },
    },
    chinese: {
      ram: { name: 'Mengchong Ram Prow', desc: 'The rawhide-covered rammer’s prow of the river fleets' },
      spikes: { name: 'Fire-Lance Racks', desc: 'Fire lances racked on the rails spew flame at point blank' },
      fenders: { name: 'Rawhide Hull Screens', desc: 'Wet rawhide over the upperworks' },
    },
    vietnam: {
      ram: { name: 'Iron-Tipped Stake Prow', desc: 'The Bạch Đằng stakes, fixed to your own bow' },
      spikes: { name: 'Bamboo Stake Skirts', desc: 'Sharpened bamboo along the waterline' },
      fenders: { name: 'Bamboo-Bundle Fenders', desc: 'Lashed bundles of green bamboo' },
    },
    japanese: {
      ram: { name: 'Iron-Plated Bow', desc: 'Nobunaga’s iron ships: an armoured bow for ramming' },
      spikes: { name: 'Kumade Rake Hooks', desc: 'Bear-claw rakes drag at anyone alongside' },
      fenders: { name: 'Takeba Bamboo Bundles', desc: 'Bamboo bundles that stop arrows and blows' },
    },
    korea: {
      ram: { name: 'Dragon-Head Ram', desc: 'The dragon head — ram, and choke her crew with sulphur smoke' },
      spikes: { name: 'Iron-Spiked Turtle Roof', desc: 'Iron spikes over the roof tear anyone who comes alongside' },
      fenders: { name: 'Hexagon Plate Armour', desc: 'Iron plates over the hull and roof' },
    },
    maori: {
      ram: { name: 'Tauihu Carved Prow', desc: 'The carved figurehead, braced for driving into a waka' },
      spikes: { name: 'Taiaha Spear Rail', desc: 'Spears levelled along the rail' },
      fenders: { name: 'Flax-Rope Lashings', desc: 'Harakeke flax lashings take the knocks' },
    },
    hawaii: {
      ram: { name: 'Koa Prow', desc: 'A koa-wood prow for driving between the hulls' },
      spikes: { name: 'Shark-Tooth Rail', desc: 'Leiomano shark-tooth blades along the rails' },
      fenders: { name: 'Hala-Mat Fenders', desc: 'Woven pandanus mats over the sides' },
    },
    maya: {
      ram: { name: 'Hardwood Prow', desc: 'A chicozapote prow for ramming canoes' },
      spikes: { name: 'Obsidian-Edged Rails', desc: 'Obsidian blades set along the rail' },
      fenders: { name: 'Quilted Cotton Screens', desc: 'Quilted cotton armour hung over the sides' },
    },
    aztec: {
      ram: { name: 'Cypress Prow', desc: 'An ahuehuete-wood prow braced for ramming' },
      spikes: { name: 'Obsidian Blade Rail', desc: 'Macuahuitl blades set along the rail' },
      fenders: { name: 'Ichcahuipilli Mantles', desc: 'Quilted cotton armour draped over the sides' },
    },
    inca: {
      ram: { name: 'Hardwood Prow Log', desc: 'A heavy hardwood log lashed across the bow' },
      spikes: { name: 'Bone-Tipped Pole Hedge', desc: 'Poles tipped with bone along the raft edge' },
      fenders: { name: 'Totora Reed Bundles', desc: 'Bundles of totora reed lashed around the raft' },
    },
  },
};

export type FittingsDict = typeof en;

const es: FittingsDict = {
  lead: { ram: 'Proa', spikes: 'Costados', fenders: 'Guardia' },
  tag: { breach: ' · la abre en canal', tangle: ' · la frena', fire: ' · la incendia', shock: ' · aturde su dotación' },
  eras: {
    golden: {
      ram: { name: 'Tajamar herrado', desc: 'Embiste con la roda forrada de hierro un casco a velocidad' },
      spikes: { name: 'Rezones en las bordas', desc: 'Lo que roce el costado queda enganchado, rastrillado y frenado' },
      fenders: { name: 'Defensas de estopa y botalones', desc: 'Defensas de cabo viejo y largos botalones mantienen a raya espolones y brulotes' },
    },
    exploration: {
      ram: { name: 'Beque reforzado', desc: 'Un beque apuntalado que destroza un casco a velocidad' },
      spikes: { name: 'Garabatos en las vergas', desc: 'Cuchillas de hoz en las vergas cortan la jarcia de quien se aproxime' },
      fenders: { name: 'Defensas de cuero de buey', desc: 'Cueros rellenos de lana colgados al costado absorben golpes' },
    },
    napoleonic: {
      ram: { name: 'Roda cobreada y curva de hierro', desc: 'Una roda redoblada que abre tablazón a velocidad' },
      spikes: { name: 'Redes de abordaje y picas', desc: 'Red y seto de picas a lo largo de la borda hieren a abordadores' },
      fenders: { name: 'Defensas de cabo y botalones', desc: 'Defensas y botalones mantienen a raya otros cascos' },
    },
    barbary: {
      ram: { name: 'Tajamar forrado de cobre', desc: 'La afilada roda de la goleta, apuntalada para embestir cañoneras' },
      spikes: { name: 'Redes de abordaje y picas', desc: 'Un seto de picas a lo largo de la borda para los corsarios' },
      fenders: { name: 'Empalletados de coyes', desc: 'Coyes enrollados en las batayolas paran bala y astillas' },
    },
    viking: {
      ram: { name: 'Roda zunchada de hierro', desc: 'Un zuncho de hierro en la alta roda — móntate y quiebra sus tracas' },
      spikes: { name: 'Seto de lanzas en la borda de escudos', desc: 'Lanzas caladas entre escudos cornean a quien se aproxime' },
      fenders: { name: 'Cintas de roble', desc: 'Gruesas cintas de roble reciben el golpe en vez del forro' },
    },
    ironclad: {
      ram: { name: 'Proa de ariete de fundición', desc: 'El truco del Virginia: ábrele vía bajo la flotación' },
      spikes: { name: 'Mangueras de vapor vivo', desc: 'Vapor vivo a las bordas escalda abordadores — sus dotaciones se dispersan' },
      fenders: { name: 'Faldones de hierro de ferrocarril', desc: 'Hierro inclinado sobre la flotación desvía espolones y bala' },
    },
    hanse: {
      ram: { name: 'Roda de coca herrada', desc: 'La pesada roda de la coca, herrada para embestir' },
      spikes: { name: 'Vergas de hoz', desc: 'Cuchillas en los penoles siegan la jarcia de quien se aproxime' },
      fenders: { name: 'Defensas de sacas de lana', desc: 'Sacas de lana inglesa al costado — carga de la propia Liga' },
    },
    portugal: {
      ram: { name: 'Beque de carraca', desc: 'Un beque macizo apuntalado para destrozar dhows' },
      spikes: { name: 'Garabatos', desc: 'Cuchillas ganchudas rasgan la jarcia de quien se aproxime' },
      fenders: { name: 'Amurada de balas de algodón', desc: 'Balas de algodón indio trincadas en la cintura' },
    },
    armada: {
      ram: { name: 'Espolón de hierro de galeaza', desc: 'El espolón de hierro de la galeaza abre tablazón bajo la cinta' },
      spikes: { name: 'Redes de abordaje con picas', desc: 'Redes y picas en la cintura hieren abordadores' },
      fenders: { name: 'Botalones contra brulotes', desc: 'Botalones para mantener a raya los brulotes de Gravelinas' },
    },
    dutch: {
      ram: { name: 'Curva de roble', desc: 'Una roda de roble redoblada para atropellar una presa' },
      spikes: { name: 'Bordas de picas de abordaje', desc: 'Picas en astilleros a lo largo de la borda cornean abordadores' },
      fenders: { name: 'Palletes de cáñamo', desc: 'Gruesos palletes de cáñamo tejido colgados al costado' },
    },
    predread: {
      ram: { name: 'Proa de espolón', desc: 'Todo acorazado de 1905 aún llevaba espolón — úsalo' },
      spikes: { name: 'Botalones de redes antitorpedo', desc: 'Botalones abiertos y red de acero traban a quien se aproxime' },
      fenders: { name: 'Cintura de acero Harvey', desc: 'Blindaje endurecido a lo largo de la flotación' },
    },
    ww1: {
      ram: { name: 'Proa de embestida reforzada', desc: 'Los destructores embestían submarinos — una proa hecha para eso' },
      spikes: { name: 'Paravanes explosivos', desc: 'Cargas remolcadas desde la proa estallan contra un casco — las dotaciones se tambalean' },
      fenders: { name: 'Bulges antitorpedo', desc: 'Casco exterior abultado absorbe golpes y explosiones' },
    },
    ww2: {
      ram: { name: 'Roda de embestida reforzada', desc: 'Como el USS Borie contra el U-405: móntate y aplástala' },
      spikes: { name: 'Guías de cargas de profundidad', desc: 'Cargas rodadas a quemarropa — la conmoción dispersa sus dotaciones' },
      fenders: { name: 'Colchonetas antiesquirlas', desc: 'Esteras antiesquirlas sobre puente y montajes' },
    },
    hormuz: {
      ram: { name: 'Blindaje de proa reforzado', desc: 'Una proa blindada para atropellar lanchas rápidas' },
      spikes: { name: 'Bastidores de minas de contacto', desc: 'Minas en bastidores sobre la borda estallan contra un casco' },
      fenders: { name: 'Paneles blindados de kevlar', desc: 'Paneles compuestos sobre puente y flotación' },
    },
    falklands: {
      ram: { name: 'Proa reforzada para hielos', desc: 'Una proa del Atlántico Sur, bastante fuerte para embestir' },
      spikes: { name: 'Lanzadores de chaff Corvus', desc: 'Chaff y bengalas a quemarropa ciegan sus dotaciones' },
      fenders: { name: 'Paneles antiesquirlas de kevlar', desc: 'Añadidos tras el Sheffield: blindaje antiesquirlas sobre puntos vitales' },
    },
    somali: {
      ram: { name: 'Chapa de proa soldada', desc: 'Chapa de chatarra soldada a la proa nodriza — golpea y aborda' },
      spikes: { name: 'Escalas de abordaje con ganchos', desc: 'Escalas de aluminio enganchadas a su borda la traban y frenan' },
      fenders: { name: 'Defensas de neumáticos', desc: 'Viejos neumáticos encadenados al costado reciben los golpes' },
    },
    roman: {
      ram: { name: 'Rostrum de bronce', desc: 'Un espolón de bronce de tres aletas — ábrele vía bajo la flotación' },
      spikes: { name: 'Puente de abordaje corvus', desc: 'El puente con pincho cae sobre su cubierta y la clava' },
      fenders: { name: 'Cintas de roble', desc: 'Pesadas cintas en la flotación reciben la embestida' },
    },
    greek: {
      ram: { name: 'Embolon de bronce', desc: 'El espolón de Salamina: a boga plena abre un casco' },
      spikes: { name: 'Botalones epotides', desc: 'Botalones de proa siegan los remos de quien se aproxime' },
      fenders: { name: 'Cables ceñidores hypozomata', desc: 'Cables que ciñen el casco lo mantienen unido al recibir golpes' },
    },
    macedon: {
      ram: { name: 'Gran espolón y proembolion', desc: 'Un espolón principal con otro segundo encima para las pesadas polirremes' },
      spikes: { name: 'Rezones de mano de hierro', desc: 'Manos de hierro en cadenas agarran a quien se aproxime' },
      fenders: { name: 'Cintas dobles y pantallas de cuero', desc: 'Cintas dobles y cueros sobre la caja de remos' },
    },
    phoenicia: {
      ram: { name: 'Espolón de hocico de jabalí', desc: 'El espolón aguzado de las galeras de cedro de Tiro' },
      spikes: { name: 'Borda colgada de escudos', desc: 'Escudos y puntas de lanza colgados de la borda' },
      fenders: { name: 'Cintas de cedro', desc: 'Cintas de cedro del Líbano en la flotación' },
    },
    egypt: {
      ram: { name: 'Botalón de proa leonina', desc: 'La proa leonina de Medinet Habu, apuntalada para el choque' },
      spikes: { name: 'Garabatos de pértiga', desc: 'Garfios en pértigas arrastran saqueadores al costado y los sujetan' },
      fenders: { name: 'Amurada de haces de papiro', desc: 'Pantallas de haces de papiro a lo largo de la borda' },
    },
    byzantium: {
      ram: { name: 'Espolón saliente', desc: 'El espolón del dromón monta encima y quiebra sus remos' },
      spikes: { name: 'Bordas de sifones manuales', desc: 'Sifones manuales a lo largo de la borda rocían fuego a quien se aproxime' },
      fenders: { name: 'Fieltro empapado en vinagre', desc: 'Fieltro empapado en vinagre — la vieja defensa contra el fuego griego' },
    },
    lepanto: {
      ram: { name: 'Espolón de galera (sperone)', desc: 'El espolón de hierro monta sobre su proa y destroza sus remos' },
      spikes: { name: 'Empavesada y picas de abordaje', desc: 'Picas tras los paveses cornean abordadores' },
      fenders: { name: 'Redes y colchonetas', desc: 'Redes de abordaje y colchonetas sobre las arrumbadas' },
    },
    ottoman: {
      ram: { name: 'Espolón de kadirga', desc: 'El espolón otomano quiebra los remos de las galeras cristianas' },
      spikes: { name: 'Cadenas con rezones', desc: 'Rezones en cadenas traban a quien se aproxime' },
      fenders: { name: 'Empavesada de balas de lana', desc: 'Balas de lana trincadas tras la borda' },
    },
    arab: {
      ram: { name: 'Caperuza de teca', desc: 'Una roda de teca caperuzada para atropellar piratas' },
      spikes: { name: 'Bastidores de ollas de nafta', desc: 'Ollas ígneas de barro en bastidores revientan contra un casco' },
      fenders: { name: 'Defensas de cabo de coco', desc: 'Defensas de fibra de coco, como el cabo que cose el casco' },
    },
    chola: {
      ram: { name: 'Roda con caperuza de hierro', desc: 'Una caperuza de hierro en la gran roda de Coromandel' },
      spikes: { name: 'Borda de púas de hierro', desc: 'Púas de hierro a lo largo de la borda para los praos' },
      fenders: { name: 'Defensas de coco', desc: 'Defensas de fibra de coco a los costados' },
    },
    chinese: {
      ram: { name: 'Proa de ariete mengchong', desc: 'La proa del ariete forrada de cuero crudo de las flotas fluviales' },
      spikes: { name: 'Bastidores de lanzas de fuego', desc: 'Lanzas de fuego en bastidores vomitan llama a quemarropa' },
      fenders: { name: 'Pantallas de cuero crudo', desc: 'Cuero crudo mojado sobre la obra muerta' },
    },
    vietnam: {
      ram: { name: 'Proa de estacas con punta de hierro', desc: 'Las estacas de Bạch Đằng, fijadas a tu propia proa' },
      spikes: { name: 'Faldones de estacas de bambú', desc: 'Bambú afilado a lo largo de la flotación' },
      fenders: { name: 'Defensas de haces de bambú', desc: 'Haces trincados de bambú verde' },
    },
    japanese: {
      ram: { name: 'Proa blindada de hierro', desc: 'Los barcos de hierro de Nobunaga: una proa blindada para embestir' },
      spikes: { name: 'Garabatos rastrillo kumade', desc: 'Rastrillos de garra de oso desgarran a quien se aproxime' },
      fenders: { name: 'Haces de bambú takeba', desc: 'Haces de bambú que paran flechas y golpes' },
    },
    korea: {
      ram: { name: 'Espolón de cabeza de dragón', desc: 'La cabeza de dragón — embiste y ahoga su dotación en humo de azufre' },
      spikes: { name: 'Techo de tortuga con púas', desc: 'Púas de hierro sobre el techo desgarran a quien se aproxime' },
      fenders: { name: 'Blindaje de placas hexagonales', desc: 'Placas de hierro sobre casco y techo' },
    },
    maori: {
      ram: { name: 'Proa tallada tauihu', desc: 'El mascarón tallado, apuntalado para clavarse en una waka' },
      spikes: { name: 'Borda de lanzas taiaha', desc: 'Lanzas caladas a lo largo de la borda' },
      fenders: { name: 'Trincas de cuerda de lino', desc: 'Trincas de lino harakeke reciben los golpes' },
    },
    hawaii: {
      ram: { name: 'Proa de koa', desc: 'Una proa de madera de koa para meterse entre los cascos' },
      spikes: { name: 'Borda de dientes de tiburón', desc: 'Cuchillas de dientes de tiburón leiomano en las bordas' },
      fenders: { name: 'Defensas de esteras hala', desc: 'Esteras tejidas de pandano sobre los costados' },
    },
    maya: {
      ram: { name: 'Proa de madera dura', desc: 'Una proa de chicozapote para embestir canoas' },
      spikes: { name: 'Bordas de filo de obsidiana', desc: 'Cuchillas de obsidiana engastadas en la borda' },
      fenders: { name: 'Pantallas de algodón acolchado', desc: 'Armadura de algodón acolchado colgada de los costados' },
    },
    aztec: {
      ram: { name: 'Proa de ciprés', desc: 'Una proa de ahuehuete apuntalada para embestir' },
      spikes: { name: 'Borda de cuchillas de obsidiana', desc: 'Cuchillas de macuahuitl engastadas en la borda' },
      fenders: { name: 'Mantos ichcahuipilli', desc: 'Armadura de algodón acolchado tendida sobre los costados' },
    },
    inca: {
      ram: { name: 'Tronco de proa de madera dura', desc: 'Un pesado tronco de madera dura trincado a través de la proa' },
      spikes: { name: 'Seto de pértigas con punta de hueso', desc: 'Pértigas con punta de hueso en el borde de la balsa' },
      fenders: { name: 'Haces de junco totora', desc: 'Haces de junco totora trincados alrededor de la balsa' },
    },
  },
};

const fr: FittingsDict = {
  lead: { ram: 'Proue', spikes: 'Flancs', fenders: 'Garde' },
  tag: { breach: ' · la troue', tangle: ' · la ralentit', fire: ' · l’embrase', shock: ' · sidère son équipage' },
  eras: {
    golden: {
      ram: { name: 'Guibre ferrée', desc: 'Enfoncez l’étrave doublée de fer dans une coque à toute vitesse' },
      spikes: { name: 'Grappins sur les lisses', desc: 'Tout ce qui frotte le bord est accroché, raclé et ralenti' },
      fenders: { name: 'Défenses de vieux cordages et espars', desc: 'Défenses de cordage et longs espars tiennent à distance éperons et brûlots' },
    },
    exploration: {
      ram: { name: 'Poulaine renforcée', desc: 'Une poulaine étançonnée qui fracasse une coque lancée' },
      spikes: { name: 'Crocs d’ensouple sur les vergues', desc: 'Des lames de faux sur les vergues coupent le gréement des voisins' },
      fenders: { name: 'Bourrelets de cuir de bœuf', desc: 'Des cuirs bourrés de laine pendus au bord absorbent les coups' },
    },
    napoleonic: {
      ram: { name: 'Étrave doublée cuivre et courbe de fer', desc: 'Une étrave doublée qui défonce le bordé lancée' },
      spikes: { name: 'Filets d’abordage et piques', desc: 'Filet et haie de piques le long du bastingage blessent les assaillants' },
      fenders: { name: 'Défenses de cordage et bômes', desc: 'Défenses et bômes tiennent les autres coques à distance' },
    },
    barbary: {
      ram: { name: 'Guibre doublée cuivre', desc: 'L’étrave fine de la goélette, étançonnée pour éperonner une chaloupe-canonnière' },
      spikes: { name: 'Filets d’abordage et piques', desc: 'Une haie de piques le long du bastingage pour les corsaires' },
      fenders: { name: 'Bastingages de hamacs', desc: 'Hamacs roulés dans les filets de bastingage arrêtent boulets et éclats' },
    },
    viking: {
      ram: { name: 'Étrave cerclée de fer', desc: 'Un cercle de fer sur la haute étrave — montez et brisez ses bordages' },
      spikes: { name: 'Haie de lances sur le pavois', desc: 'Lances couchées entre les boucliers encornent les voisins' },
      fenders: { name: 'Préceintes de chêne', desc: 'De lourdes préceintes de chêne prennent le coup au lieu du bordé' },
    },
    ironclad: {
      ram: { name: 'Proue-éperon en fonte', desc: 'Le truc du Virginia : trouez-la sous la flottaison' },
      spikes: { name: 'Manches à vapeur vive', desc: 'La vapeur vive aux bastingages ébouillante les assaillants — leurs équipages se dispersent' },
      fenders: { name: 'Jupes de fer de rail', desc: 'Du fer incliné sur la flottaison détourne éperons et boulets' },
    },
    hanse: {
      ram: { name: 'Étrave de cogue ferrée', desc: 'La lourde étrave de la cogue, ferrée pour éperonner' },
      spikes: { name: 'Vergues à lames de faux', desc: 'Des lames aux bouts de vergue cisaillent le gréement des voisins' },
      fenders: { name: 'Défenses de balles de laine', desc: 'Des balles de laine anglaise au bord — la cargaison même de la Ligue' },
    },
    portugal: {
      ram: { name: 'Poulaine de caraque', desc: 'Un bec massif étançonné pour fracasser les boutres' },
      spikes: { name: 'Crocs d’ensouple', desc: 'Des lames crochues déchirent le gréement des voisins' },
      fenders: { name: 'Pavois de balles de coton', desc: 'Des balles de coton indien saisies le long du passavant' },
    },
    armada: {
      ram: { name: 'Bec de fer de galéasse', desc: 'L’éperon de fer de la galéasse troue le bordé sous la préceinte' },
      spikes: { name: 'Filets d’abordage à piques', desc: 'Filets et piques le long du passavant blessent les assaillants' },
      fenders: { name: 'Bômes anti-brûlots', desc: 'Des bômes pour écarter les brûlots de Gravelines' },
    },
    dutch: {
      ram: { name: 'Courbe d’étrave en chêne', desc: 'Une étrave de chêne doublée pour couler une prise' },
      spikes: { name: 'Râteliers de piques d’abordage', desc: 'Des piques au râtelier le long du bastingage encornent les assaillants' },
      fenders: { name: 'Paillets de chanvre', desc: 'D’épais paillets de chanvre tissé pendus au bord' },
    },
    predread: {
      ram: { name: 'Proue à éperon', desc: 'Tout cuirassé de 1905 portait encore un éperon — servez-vous-en' },
      spikes: { name: 'Bômes de filets pare-torpilles', desc: 'Bômes déployées et filet d’acier entravent les voisins' },
      fenders: { name: 'Ceinture d’acier Harvey', desc: 'Blindage cémenté le long de la flottaison' },
    },
    ww1: {
      ram: { name: 'Proue d’éperonnage renforcée', desc: 'Les destroyers éperonnaient les U-Boots — une proue faite pour cela' },
      spikes: { name: 'Paravanes explosifs', desc: 'Des charges remorquées depuis la proue explosent contre une coque — les équipages chancellent' },
      fenders: { name: 'Renflements pare-torpilles', desc: 'La coque extérieure renflée absorbe coups et explosions' },
    },
    ww2: {
      ram: { name: 'Étrave d’éperonnage renforcée', desc: 'Comme l’USS Borie contre l’U-405 : montez et écrasez-la' },
      spikes: { name: 'Rampes de grenades ASM', desc: 'Des grenades roulées à bout portant — le choc disperse ses équipages' },
      fenders: { name: 'Matelas pare-éclats', desc: 'Des nattes pare-éclats sur passerelle et affûts' },
    },
    hormuz: {
      ram: { name: 'Blindage de proue renforcé', desc: 'Une proue blindée pour couler les vedettes rapides' },
      spikes: { name: 'Râteliers de mines de contact', desc: 'Des mines au râtelier sur le bastingage explosent contre une coque' },
      fenders: { name: 'Panneaux blindés en kevlar', desc: 'Panneaux composites sur passerelle et flottaison' },
    },
    falklands: {
      ram: { name: 'Proue renforcée glaces', desc: 'Une proue de l’Atlantique Sud, assez forte pour éperonner' },
      spikes: { name: 'Lance-leurres Corvus', desc: 'Paillettes et leurres à bout portant aveuglent ses équipages' },
      fenders: { name: 'Panneaux pare-éclats en kevlar', desc: 'Ajoutés après le Sheffield : pare-éclats sur les œuvres vives' },
    },
    somali: {
      ram: { name: 'Tôle d’étrave soudée', desc: 'De la tôle de récup soudée à la proue du navire-mère — cognez et abordez' },
      spikes: { name: 'Échelles d’abordage à crocs', desc: 'Des échelles alu accrochées à son bastingage l’entravent et la ralentissent' },
      fenders: { name: 'Défenses de pneus de camion', desc: 'De vieux pneus enchaînés au bord prennent les coups' },
    },
    roman: {
      ram: { name: 'Rostre de bronze', desc: 'Un éperon de bronze à trois ailettes — trouez-la sous la flottaison' },
      spikes: { name: 'Pont d’abordage corvus', desc: 'Le pont à épieu s’abat sur son pont et la cloue' },
      fenders: { name: 'Préceintes de chêne', desc: 'De lourdes préceintes à la flottaison prennent l’éperonnage' },
    },
    greek: {
      ram: { name: 'Émbolon de bronze', desc: 'L’éperon de Salamine : à pleine nage il défonce une coque' },
      spikes: { name: 'Poutres d’épotides', desc: 'Des poutres de proue fauchent les avirons des voisins' },
      fenders: { name: 'Câbles de ceinture hypozomata', desc: 'Des câbles ceinturant la coque la tiennent quand elle est frappée' },
    },
    macedon: {
      ram: { name: 'Grand éperon et proembolion', desc: 'Un éperon principal doublé d’un second pour les lourdes polyrèmes' },
      spikes: { name: 'Grappins à main de fer', desc: 'Des mains de fer sur chaînes saisissent les voisins' },
      fenders: { name: 'Préceintes doublées et écrans de cuir', desc: 'Préceintes doublées et cuirs sur le caisson des rames' },
    },
    phoenicia: {
      ram: { name: 'Éperon groin-de-sanglier', desc: 'L’éperon pointu des galères de cèdre de Tyr' },
      spikes: { name: 'Bastingage pavoisé de boucliers', desc: 'Boucliers et pointes de lance pendus le long du bastingage' },
      fenders: { name: 'Préceintes de cèdre', desc: 'Préceintes de cèdre du Liban à la flottaison' },
    },
    egypt: {
      ram: { name: 'Poutre de proue à tête de lion', desc: 'La proue léonine de Médinet Habou, étançonnée pour le choc' },
      spikes: { name: 'Crocs d’abordage à hampe', desc: 'Des crocs à hampe attirent les pillards au bord et les tiennent' },
      fenders: { name: 'Pavois de bottes de papyrus', desc: 'Des écrans de bottes de papyrus le long du bastingage' },
    },
    byzantium: {
      ram: { name: 'Bec-éperon', desc: 'L’éperon du dromon monte dessus et brise ses avirons' },
      spikes: { name: 'Bastingages à siphons manuels', desc: 'Des siphons manuels le long du bastingage aspergent de feu les voisins' },
      fenders: { name: 'Feutre imbibé de vinaigre', desc: 'Du feutre imbibé de vinaigre — la vieille défense contre le feu grégeois' },
    },
    lepanto: {
      ram: { name: 'Éperon de galère (sperone)', desc: 'L’éperon de fer monte sur sa proue et fracasse ses avirons' },
      spikes: { name: 'Pavois et piques d’abordage', desc: 'Des piques derrière les pavois encornent les assaillants' },
      fenders: { name: 'Filets et matelas', desc: 'Filets d’abordage et matelas sur les rambades' },
    },
    ottoman: {
      ram: { name: 'Éperon de kadirga', desc: 'L’éperon ottoman brise les avirons des galères chrétiennes' },
      spikes: { name: 'Chaînes à grappins', desc: 'Des grappins sur chaînes verrouillent les voisins' },
      fenders: { name: 'Pavois de balles de laine', desc: 'Des balles de laine saisies derrière le bastingage' },
    },
    arab: {
      ram: { name: 'Capuchon d’étrave en teck', desc: 'Une étrave de teck coiffée pour couler les pirates' },
      spikes: { name: 'Râteliers de pots à naphte', desc: 'Des pots à feu de terre au râtelier éclatent contre une coque' },
      fenders: { name: 'Défenses de cordage de coco', desc: 'Défenses de fibre de coco, comme le cordage qui coud la coque' },
    },
    chola: {
      ram: { name: 'Étrave coiffée de fer', desc: 'Un capuchon de fer sur la grande étrave de Coromandel' },
      spikes: { name: 'Bastingage à pointes de fer', desc: 'Des pointes de fer le long du bastingage pour les praos' },
      fenders: { name: 'Défenses de coco', desc: 'Défenses de fibre de coco le long des bords' },
    },
    chinese: {
      ram: { name: 'Proue-bélier mengchong', desc: 'La proue cuirassée de cuir cru des flottes fluviales' },
      spikes: { name: 'Râteliers de lances à feu', desc: 'Des lances à feu au râtelier crachent la flamme à bout portant' },
      fenders: { name: 'Écrans de cuir cru', desc: 'Du cuir cru mouillé sur les œuvres mortes' },
    },
    vietnam: {
      ram: { name: 'Proue à pieux ferrés', desc: 'Les pieux de Bạch Đằng, fixés à votre propre proue' },
      spikes: { name: 'Jupes de pieux de bambou', desc: 'Du bambou affûté le long de la flottaison' },
      fenders: { name: 'Défenses de bottes de bambou', desc: 'Des bottes de bambou vert saisies' },
    },
    japanese: {
      ram: { name: 'Proue blindée de fer', desc: 'Les navires de fer de Nobunaga : une proue blindée pour éperonner' },
      spikes: { name: 'Crocs-râteaux kumade', desc: 'Des râteaux-griffes d’ours accrochent les voisins' },
      fenders: { name: 'Bottes de bambou takeba', desc: 'Des bottes de bambou qui arrêtent flèches et coups' },
    },
    korea: {
      ram: { name: 'Éperon à tête de dragon', desc: 'La tête de dragon — éperonnez, et étouffez son équipage de fumée de soufre' },
      spikes: { name: 'Toit de tortue à pointes', desc: 'Des pointes de fer sur le toit déchirent les voisins' },
      fenders: { name: 'Blindage de plaques hexagonales', desc: 'Des plaques de fer sur coque et toit' },
    },
    maori: {
      ram: { name: 'Proue sculptée tauihu', desc: 'La figure de proue sculptée, étançonnée pour s’enfoncer dans un waka' },
      spikes: { name: 'Bastingage de lances taiaha', desc: 'Des lances couchées le long du bastingage' },
      fenders: { name: 'Saisines de lin', desc: 'Des saisines de lin harakeke prennent les coups' },
    },
    hawaii: {
      ram: { name: 'Proue en koa', desc: 'Une proue en bois de koa pour passer entre les coques' },
      spikes: { name: 'Bastingage à dents de requin', desc: 'Des lames à dents de requin leiomano le long des bastingages' },
      fenders: { name: 'Défenses de nattes hala', desc: 'Des nattes de pandanus tissées sur les bords' },
    },
    maya: {
      ram: { name: 'Proue en bois dur', desc: 'Une proue en sapotillier pour éperonner les pirogues' },
      spikes: { name: 'Bastingages à tranchant d’obsidienne', desc: 'Des lames d’obsidienne serties le long du bastingage' },
      fenders: { name: 'Écrans de coton matelassé', desc: 'Une armure de coton matelassé pendue sur les bords' },
    },
    aztec: {
      ram: { name: 'Proue en cyprès', desc: 'Une proue en ahuehuete étançonnée pour éperonner' },
      spikes: { name: 'Bastingage à lames d’obsidienne', desc: 'Des lames de macuahuitl serties le long du bastingage' },
      fenders: { name: 'Manteaux ichcahuipilli', desc: 'Une armure de coton matelassé drapée sur les bords' },
    },
    inca: {
      ram: { name: 'Bille de proue en bois dur', desc: 'Une lourde bille de bois dur saisie en travers de la proue' },
      spikes: { name: 'Haie de perches à pointe d’os', desc: 'Des perches à pointe d’os le long du bord du radeau' },
      fenders: { name: 'Bottes de roseau totora', desc: 'Des bottes de roseau totora saisies autour du radeau' },
    },
  },
};

const de: FittingsDict = {
  lead: { ram: 'Bug', spikes: 'Seiten', fenders: 'Schutz' },
  tag: { breach: ' · schlägt sie leck', tangle: ' · verlangsamt sie', fire: ' · steckt sie in Brand', shock: ' · betäubt ihre Mannschaften' },
  eras: {
    golden: {
      ram: { name: 'Eisenbeschlagener Vorsteven', desc: 'Rennt den eisenbeschlagenen Steven in Fahrt in einen Rumpf' },
      spikes: { name: 'Enterhaken an den Relingen', desc: 'Was längsseits schrammt, wird gehakt, aufgerissen und verlangsamt' },
      fenders: { name: 'Wuhling-Fender & Abhaltspiere', desc: 'Wuhling-Fender und lange Spieren halten Rammen und Brander ab' },
    },
    exploration: {
      ram: { name: 'Verstärkter Galion', desc: 'Ein abgestützter Galion, der in Fahrt in Rümpfe kracht' },
      spikes: { name: 'Sichelhaken an den Rahen', desc: 'Sichelklingen an den Rahen schneiden die Takelage Längsseitiger' },
      fenders: { name: 'Ochsenhaut-Wulste', desc: 'Mit Wolle gestopfte Häute über der Seite fangen Schläge ab' },
    },
    napoleonic: {
      ram: { name: 'Gekupferter Steven & Eisenknie', desc: 'Ein gedoppelter Steven, der in Fahrt Planken einstößt' },
      spikes: { name: 'Enternetz & Piken', desc: 'Netz und Pikenhecke längs der Reling verwunden Enterer' },
      fenders: { name: 'Tau-Fender & Spieren', desc: 'Fender und Abhaltspieren halten andere Rümpfe ab' },
    },
    barbary: {
      ram: { name: 'Kupferbeschlagener Vorsteven', desc: 'Der scharfe Steven des Schoners, zum Rammen von Kanonenbooten abgestützt' },
      spikes: { name: 'Enternetz & Piken', desc: 'Eine Pikenhecke längs der Reling für die Korsaren' },
      fenders: { name: 'Hängematten-Netze', desc: 'Gerollte Hängematten in den Relingsnetzen stoppen Kugeln und Splitter' },
    },
    viking: {
      ram: { name: 'Eisenbeschlagener Steven', desc: 'Ein Eisenband am hohen Steven — fahrt auf und brecht ihre Plankengänge' },
      spikes: { name: 'Speerhecke am Schildbord', desc: 'Zwischen den Schilden eingelegte Speere spießen Längsseitige auf' },
      fenders: { name: 'Eichene Scheuerleisten', desc: 'Dicke Eichenwulste fangen den Stoß statt der Beplankung' },
    },
    ironclad: {
      ram: { name: 'Gusseiserner Rammbug', desc: 'Der Trick der Virginia: schlagt sie unter der Wasserlinie leck' },
      spikes: { name: 'Kessel-Brühschläuche', desc: 'Frischdampf an den Relingen verbrüht Enterer — ihre Mannschaften stieben' },
      fenders: { name: 'Eisenbahnschienen-Schürzen', desc: 'Geneigtes Eisen über der Wasserlinie lenkt Rammen und Kugeln ab' },
    },
    hanse: {
      ram: { name: 'Eisenbeschlagener Koggensteven', desc: 'Der schwere Steven der Kogge, zum Rammen beschlagen' },
      spikes: { name: 'Sichelklingen-Rahen', desc: 'Klingen an den Rahnocken scheren die Takelage Längsseitiger' },
      fenders: { name: 'Wollsack-Fender', desc: 'Säcke englischer Wolle über der Seite — der Hanse eigene Ladung' },
    },
    portugal: {
      ram: { name: 'Kraweel-Galion', desc: 'Ein massiger, abgestützter Schnabel zum Zerschmettern von Dhaus' },
      spikes: { name: 'Scherhaken', desc: 'Hakenklingen zerreißen die Takelage Längsseitiger' },
      fenders: { name: 'Baumwollballen-Schanz', desc: 'Ballens indischer Baumwolle längs der Kuhl gelascht' },
    },
    armada: {
      ram: { name: 'Eisenschnabel der Galeasse', desc: 'Der Eisensporn der Galeasse locht Planken unter dem Bergholz' },
      spikes: { name: 'Enternetze mit Piken', desc: 'Netze und Piken längs der Kuhl verwunden Enterer' },
      fenders: { name: 'Brander-Abhaltspieren', desc: 'Spieren, um die Brander von Gravelines abzuwehren' },
    },
    dutch: {
      ram: { name: 'Eichen-Stevenknie', desc: 'Ein gedoppelter Eichensteven zum Überrennen einer Prise' },
      spikes: { name: 'Enterpiken-Relings', desc: 'Längs der Reling gerackte Piken spießen Enterer auf' },
      fenders: { name: 'Hanf-Fendermatten', desc: 'Dicke gewebte Hanfmatten über der Seite' },
    },
    predread: {
      ram: { name: 'Rammbug', desc: 'Jedes Schlachtschiff von 1905 trug noch einen Rammsporn — benutzt ihn' },
      spikes: { name: 'Torpedonetz-Spieren', desc: 'Ausgeschwenkte Spieren und Stahlnetze verheddern Längsseitige' },
      fenders: { name: 'Harveystahl-Gürtel', desc: 'Einsatzgehärteter Panzer längs der Wasserlinie' },
    },
    ww1: {
      ram: { name: 'Verstärkter Rammbug', desc: 'Zerstörer rammten U-Boote — ein Bug, dafür gebaut' },
      spikes: { name: 'Spreng-Ottergeräte', desc: 'Geschleppte Ladungen vorm Bug detonieren am Rumpf — Mannschaften taumeln' },
      fenders: { name: 'Torpedoschutz-Ausbuchtungen', desc: 'Ausgebuchtete Außenhaut fängt Schläge und Detonationen' },
    },
    ww2: {
      ram: { name: 'Verstärkter Rammsteven', desc: 'Wie USS Borie gegen U-405: fahrt auf und zermalmt sie' },
      spikes: { name: 'Wasserbomben-Ablaufschienen', desc: 'Aus nächster Nähe gerollte Bomben — der Schock zerstreut ihre Mannschaften' },
      fenders: { name: 'Splittermattierungen', desc: 'Splittermattierung über Brücke und Lafetten' },
    },
    hormuz: {
      ram: { name: 'Verstärkte Bugpanzerung', desc: 'Ein gepanzerter Bug zum Überrennen von Schnellbooten' },
      spikes: { name: 'Kontaktminen-Gestelle', desc: 'An den Relingen gerackte Minen detonieren am Rumpf' },
      fenders: { name: 'Kevlar-Panzerplatten', desc: 'Verbundplatten über Brücke und Wasserlinie' },
    },
    falklands: {
      ram: { name: 'Eisverstärkter Bug', desc: 'Ein Südatlantik-Bug, stark genug zum Rammen' },
      spikes: { name: 'Corvus-Düppelwerfer', desc: 'Düppel und Täuschkörper aus Nähe blenden ihre Mannschaften' },
      fenders: { name: 'Kevlar-Splitterplatten', desc: 'Nach Sheffield: Splitterpanzer über den lebenswichtigen Teilen' },
    },
    somali: {
      ram: { name: 'Geschweißte Bug-Stahlplatte', desc: 'Schrottblech an den Bug des Mutterschiffs geschweißt — anrempeln und entern' },
      spikes: { name: 'Enterleitern mit Haken', desc: 'Über ihre Reling gehakte Aluleitern verheddern und verlangsamen sie' },
      fenders: { name: 'Lkw-Reifenfender', desc: 'Alte Reifen, längs der Seiten gekettet, fangen die Stöße' },
    },
    roman: {
      ram: { name: 'Bronzener Rammsporn', desc: 'Ein dreiflossiger Bronzerammsporn — schlagt sie unter der Wasserlinie leck' },
      spikes: { name: 'Corvus-Enterbrücke', desc: 'Die Stachelbrücke fällt auf ihr Deck und nagelt sie fest' },
      fenders: { name: 'Eichen-Berghölzer', desc: 'Schwere Berghölzer an der Wasserlinie fangen das Rammen' },
    },
    greek: {
      ram: { name: 'Bronzener Embolon', desc: 'Der Salamis-Rammsporn: bei vollem Ruderschlag stößt er einen Rumpf ein' },
      spikes: { name: 'Epotiden-Bugbalken', desc: 'Balken vom Bug scheren die Riemen Längsseitiger ab' },
      fenders: { name: 'Hypozomata-Gurtseile', desc: 'Rumpfgurtende Seile halten sie zusammen, wenn sie getroffen wird' },
    },
    macedon: {
      ram: { name: 'Großer Rammsporn & Proembolion', desc: 'Ein Hauptschnabel mit zweitem darüber für die schweren Polyremen' },
      spikes: { name: 'Eisenhand-Enterhaken', desc: 'Eisenhände an Ketten packen Längsseitige' },
      fenders: { name: 'Gedoppelte Berghölzer & Hautschirme', desc: 'Gedoppelte Berghölzer und Häute über dem Riemenkasten' },
    },
    phoenicia: {
      ram: { name: 'Bronzener Eberschnauzen-Rammsporn', desc: 'Der spitze Rammsporn der Zederngaleeren von Tyros' },
      spikes: { name: 'Schildbehängte Reling', desc: 'Schilde und Speerspitzen längs der Reling gehängt' },
      fenders: { name: 'Zedern-Berghölzer', desc: 'Libanon-Zedern-Berghölzer an der Wasserlinie' },
    },
    egypt: {
      ram: { name: 'Löwenkopf-Bugbalken', desc: 'Der löwenköpfige Bug von Medinet Habu, stoßfest abgestützt' },
      spikes: { name: 'Stangen-Enterhaken', desc: 'Haken an Stangen ziehen Räuber längsseits und halten sie' },
      fenders: { name: 'Papyrusbündel-Schanz', desc: 'Gebündelte Papyrusschirme längs der Reling' },
    },
    byzantium: {
      ram: { name: 'Spornschnabel', desc: 'Der Sporn der Dromone fährt auf und bricht ihre Riemen' },
      spikes: { name: 'Hand-Siphon-Feuerrelings', desc: 'Handsiphone längs der Reling sprühen Feuer auf Längsseitige' },
      fenders: { name: 'Essiggetränkter Filz', desc: 'Essiggetränkter Filz — die alte Abwehr gegen griechisches Feuer' },
    },
    lepanto: {
      ram: { name: 'Galeeren-Sporn (Sperone)', desc: 'Der Eisensporn fährt über ihren Bug und zerschmettert ihre Riemen' },
      spikes: { name: 'Pavesen & Enterpiken', desc: 'Piken hinter den Pavesen spießen Enterer auf' },
      fenders: { name: 'Netze & Matten', desc: 'Enternetze und Matten über den Rambaden' },
    },
    ottoman: {
      ram: { name: 'Kadırga-Sporn', desc: 'Der osmanische Sporn bricht die Riemen christlicher Galeeren' },
      spikes: { name: 'Enterhaken-Ketten', desc: 'Enterhaken an Ketten verrammeln Längsseitige' },
      fenders: { name: 'Wollballen-Pavesade', desc: 'Wollballen hinter der Reling gelascht' },
    },
    arab: {
      ram: { name: 'Teak-Stevenkappe', desc: 'Ein gekappter Teaksteven zum Überrennen von Piraten' },
      spikes: { name: 'Naphthatopf-Gestelle', desc: 'Tongefäße mit Feuer an der Reling bersten am Rumpf' },
      fenders: { name: 'Kokos-Fender', desc: 'Kokosfaser-Fender, wie das Seil, das den Rumpf näht' },
    },
    chola: {
      ram: { name: 'Eisenbekappter Steven', desc: 'Eine Eisenkappe auf dem großen Koromandel-Steven' },
      spikes: { name: 'Eisenspitz-Reling', desc: 'Eisenspitzen längs der Reling für die Prahus' },
      fenders: { name: 'Kokos-Fender', desc: 'Kokosfaser-Fender längs der Seiten' },
    },
    chinese: {
      ram: { name: 'Mengchong-Rammbug', desc: 'Der rohhäutige Rammbug der Flussflotten' },
      spikes: { name: 'Feuerlanzen-Gestelle', desc: 'Feuerlanzen an den Relingen speien aus Nähe Flammen' },
      fenders: { name: 'Rohhaut-Rumpfschirme', desc: 'Nasse Rohhaut über den Aufbauten' },
    },
    vietnam: {
      ram: { name: 'Eisenbeschlagener Pfahlbug', desc: 'Die Pfähle von Bạch Đằng, am eigenen Bug befestigt' },
      spikes: { name: 'Bambuspfahl-Schürzen', desc: 'Geschärfter Bambus längs der Wasserlinie' },
      fenders: { name: 'Bambusbündel-Fender', desc: 'Gelaschte Bündel grünen Bambus' },
    },
    japanese: {
      ram: { name: 'Gepanzerter Eisenbug', desc: 'Nobunagas Eisenschiffe: ein gepanzerter Bug zum Rammen' },
      spikes: { name: 'Kumade-Rechenhaken', desc: 'Bärenklauen-Rechen zerren an Längsseitigen' },
      fenders: { name: 'Takeba-Bambusbündel', desc: 'Bambusbündel, die Pfeile und Schläge stoppen' },
    },
    korea: {
      ram: { name: 'Drachenkopf-Rammsporn', desc: 'Der Drachenkopf — rammt und erstickt ihre Mannschaft in Schwefelrauch' },
      spikes: { name: 'Eisenbestacheltes Schildkrötendach', desc: 'Eisenstacheln auf dem Dach zerreißen jeden, der längsseits kommt' },
      fenders: { name: 'Sechseck-Plattenpanzer', desc: 'Eisenplatten über Rumpf und Dach' },
    },
    maori: {
      ram: { name: 'Geschnitzter Tauihu-Bug', desc: 'Die geschnitzte Gallionsfigur, zum Einfahren in ein Waka abgestützt' },
      spikes: { name: 'Taiaha-Speerreling', desc: 'Längs der Reling eingelegte Speere' },
      fenders: { name: 'Flachsseil-Laschings', desc: 'Harakeke-Flachslaschings fangen die Stöße' },
    },
    hawaii: {
      ram: { name: 'Koa-Bug', desc: 'Ein Koaholz-Bug zum Hineinfahren zwischen die Rümpfe' },
      spikes: { name: 'Haizahn-Reling', desc: 'Leiomano-Haizahnklingen längs der Relings' },
      fenders: { name: 'Hala-Mattenfender', desc: 'Gewebte Pandanusmatten über den Seiten' },
    },
    maya: {
      ram: { name: 'Hartholz-Bug', desc: 'Ein Chicozapote-Bug zum Rammen von Kanus' },
      spikes: { name: 'Obsidianklingen-Relings', desc: 'Obsidianklingen längs der Reling eingelassen' },
      fenders: { name: 'Gepolsterte Baumwollschirme', desc: 'Gepolsterte Baumwollrüstung über den Seiten' },
    },
    aztec: {
      ram: { name: 'Zypressen-Bug', desc: 'Ein Ahuehuete-Holzbug, zum Rammen abgestützt' },
      spikes: { name: 'Obsidianklingen-Reling', desc: 'Macuahuitl-Klingen längs der Reling eingelassen' },
      fenders: { name: 'Ichcahuipilli-Mäntel', desc: 'Gepolsterte Baumwollrüstung über den Seiten' },
    },
    inca: {
      ram: { name: 'Hartholz-Bugbalken', desc: 'Ein schwerer Hartholzbalken quer über den Bug gelascht' },
      spikes: { name: 'Knochenspitzen-Stangenhecke', desc: 'Knochenbespitzte Stangen längs der Floßkante' },
      fenders: { name: 'Totora-Schilfbündel', desc: 'Totora-Schilfbündel ums Floß gelascht' },
    },
  },
};

const nl: FittingsDict = {
  lead: { ram: 'Boeg', spikes: 'Zijden', fenders: 'Wacht' },
  tag: { breach: ' · slaat haar lek', tangle: ' · vertraagt haar', fire: ' · steekt haar in brand', shock: ' · bedwelmt haar bemanning' },
  eras: {
    golden: {
      ram: { name: 'Beslagen voorsteven', desc: 'Drijf de ijzerbeslagen steven in vaart in een romp' },
      spikes: { name: 'Dreggen op de reling', desc: 'Alles wat langszij schaaft wordt gehaakt, geharkt en vertraagd' },
      fenders: { name: 'Trosstoters & afhoudsparren', desc: 'Trosstoters en lange sparren houden rammen en branders af' },
    },
    exploration: {
      ram: { name: 'Versterkte galjoen', desc: 'Een geschoorde galjoen die in vaart in een romp beukt' },
      spikes: { name: 'Sikkelhaken aan de raas', desc: 'Sikkelbladen aan de raas snijden het tuig van langszijliggers' },
      fenders: { name: 'Ossenhuid-kussens', desc: 'Met wol gevulde huiden over de zij vangen klappen op' },
    },
    napoleonic: {
      ram: { name: 'Verkoperde steven & ijzeren knie', desc: 'Een verdubbelde steven die in vaart huidplanken instoot' },
      spikes: { name: 'Enternet & pieken', desc: 'Net en piekenhaag langs de reling verwonden enterders' },
      fenders: { name: 'Touwstoters & bomen', desc: 'Stoters en afhoudbomen houden andere rompen af' },
    },
    barbary: {
      ram: { name: 'Verkoperde voorsteven', desc: 'De scherpe steven van de schoener, geschoord om kanonneerboten te rammen' },
      spikes: { name: 'Enternet & pieken', desc: 'Een piekenhaag langs de reling voor de kapers' },
      fenders: { name: 'Hangmatnetten', desc: 'Opgerolde hangmatten in de relingnetten stoppen kogels en splinters' },
    },
    viking: {
      ram: { name: 'IJzerbeslagen steven', desc: 'Een ijzeren band om de hoge steven — rijd op en kraak haar gangen' },
      spikes: { name: 'Sperenhaag op de schildboord', desc: 'Tussen de schilden gevelde speren rijgen langszijliggers' },
      fenders: { name: 'Eiken berghouten', desc: 'Dikke eiken berghouten vangen de klap in plaats van de huid' },
    },
    ironclad: {
      ram: { name: 'Gietijzeren ramboeg', desc: 'De truc van de Virginia: sla haar lek onder de waterlijn' },
      spikes: { name: 'Stoom-broeislangen', desc: 'Levende stoom naar de reling broeit enterders — haar bemanning verstuift' },
      fenders: { name: 'Spoorijzer-schorten', desc: 'Hellend ijzer boven de waterlijn keert rammen en kogels af' },
    },
    hanse: {
      ram: { name: 'Beslagen koggensteven', desc: 'De zware steven van de kogge, beslagen om te rammen' },
      spikes: { name: 'Sikkelraas', desc: 'Bladen aan de ranokken scheren het tuig van langszijliggers' },
      fenders: { name: 'Wolzak-stoters', desc: 'Zakken Engelse wol over de zij — lading van het Verbond zelf' },
    },
    portugal: {
      ram: { name: 'Kraak-galjoen', desc: 'Een massieve, geschoorde bek om dhows te verbrijzelen' },
      spikes: { name: 'Scheerhaken', desc: 'Gehaakte bladen scheuren het tuig van langszijliggers' },
      fenders: { name: 'Katoenbalen-verschansing', desc: 'Balens Indiase katoen langs de kuil gesjord' },
    },
    armada: {
      ram: { name: 'IJzeren bek van de galeas', desc: 'De ijzeren spoor van de galeas slaat gaten onder het berghout' },
      spikes: { name: 'Enternetten met pieken', desc: 'Netten en pieken langs de kuil verwonden enterders' },
      fenders: { name: 'Branders-afhoudbomen', desc: 'Bomen om de branders van Grevelingen af te houden' },
    },
    dutch: {
      ram: { name: 'Eiken stevenknie', desc: 'Een verdubbelde eiken steven om een prijs te overzeilen' },
      spikes: { name: 'Enterpieken-rekken', desc: 'Langs de reling gerekte pieken rijgen enterders' },
      fenders: { name: 'Hennep-stootmatten', desc: 'Dikke geweven hennepmatten over de zij' },
    },
    predread: {
      ram: { name: 'Ramboeg', desc: 'Elk slagschip van 1905 droeg nog een ram — gebruik hem' },
      spikes: { name: 'Torpedonet-bomen', desc: 'Uitgezwaaide bomen en staalnet verwarren langszijliggers' },
      fenders: { name: 'Harvey-staalband', desc: 'Geplateerd pantser langs de waterlijn' },
    },
    ww1: {
      ram: { name: 'Versterkte ramboeg', desc: 'Jagers ramden U-boten — een boeg daarvoor gebouwd' },
      spikes: { name: 'Explosieve paravanen', desc: 'Gesleepte ladingen vóór de boeg ontploffen tegen een romp — bemanningen wankelen' },
      fenders: { name: 'Torpedo-uitstulpingen', desc: 'Uitgestulpte buitenhuid vangt klappen en explosies op' },
    },
    ww2: {
      ram: { name: 'Versterkte ramsteven', desc: 'Als USS Borie tegen U-405: rijd op en verpletter haar' },
      spikes: { name: 'Dieptebommen-rekken', desc: 'Van dichtbij gerolde bommen — de schok verstrooit haar bemanning' },
      fenders: { name: 'Splintermatten', desc: 'Splintermatten over brug en opstellingen' },
    },
    hormuz: {
      ram: { name: 'Versterkte boegbepantsering', desc: 'Een bepantserde boeg om speedboten te overvaren' },
      spikes: { name: 'Contactmijn-rekken', desc: 'Op de reling gerekte mijnen ontploffen tegen een romp' },
      fenders: { name: 'Kevlar-pantserplaten', desc: 'Composietplaten over brug en waterlijn' },
    },
    falklands: {
      ram: { name: 'IJsversterkte boeg', desc: 'Een Zuid-Atlantische boeg, sterk genoeg om te rammen' },
      spikes: { name: 'Corvus-kafwerpers', desc: 'Kaf en fakkels van dichtbij verblinden haar bemanning' },
      fenders: { name: 'Kevlar-splinterplaten', desc: 'Na Sheffield toegevoegd: splinterpantser over vitale delen' },
    },
    somali: {
      ram: { name: 'Gelaschte stalen boegplaat', desc: 'Schrootplaat aan de boeg van het moederschip gelast — beuk en enter' },
      spikes: { name: 'Enterladders met haken', desc: 'Over haar reling gehaakte aluminium ladders verwarren en vertragen haar' },
      fenders: { name: 'Vrachtwagenband-stoters', desc: 'Oude banden langs de zijden geketend vangen de klappen op' },
    },
    roman: {
      ram: { name: 'Bronzen rostrum', desc: 'Een drievinning bronzen ram — sla haar lek onder de waterlijn' },
      spikes: { name: 'Corvus-enterbrug', desc: 'De gepunte brug valt op haar dek en nagelt haar vast' },
      fenders: { name: 'Eiken berghouten', desc: 'Zware berghouten langs de waterlijn vangen het rammen op' },
    },
    greek: {
      ram: { name: 'Bronzen embolon', desc: 'De Salamis-ram: op volle slag stoot hij een romp in' },
      spikes: { name: 'Epotides-boegbalken', desc: 'Balken van de boeg scheren de riemen van langszijliggers af' },
      fenders: { name: 'Hypozomata-gordelkabels', desc: 'Rompgordende kabels houden haar bijeen als ze getroffen wordt' },
    },
    macedon: {
      ram: { name: 'Grote ram & proembolion', desc: 'Een hoofdsnavel met een tweede erboven voor de zware polyremen' },
      spikes: { name: 'IJzerhand-dreggen', desc: 'IJzeren handen aan kettingen grijpen langszijliggers' },
      fenders: { name: 'Verdubbelde berghouten & huidschermen', desc: 'Verdubbelde berghouten en huiden over de riemenkast' },
    },
    phoenicia: {
      ram: { name: 'Bronzen ever-snavelram', desc: 'De puntige ram van de cederen galeien van Tyrus' },
      spikes: { name: 'Met schilden behangen reling', desc: 'Schilden en speerpunten langs de reling gehangen' },
      fenders: { name: 'Cederen berghouten', desc: 'Libanon-cederen berghouten langs de waterlijn' },
    },
    egypt: {
      ram: { name: 'Leeuwenkop-boegbalk', desc: 'De leeuwenkoppige boeg van Medinet Habu, geschoord voor de klap' },
      spikes: { name: 'Pols-enterhaken', desc: 'Haken aan polsen slepen plunderaars langszij en houden ze vast' },
      fenders: { name: 'Papyrusbunden-verschansing', desc: 'Gebundelde papyrusschermen langs de reling' },
    },
    byzantium: {
      ram: { name: 'Spoorbek', desc: 'De spoor van de dromon rijdt op en breekt haar riemen' },
      spikes: { name: 'Handsifon-vuurrelings', desc: 'Handsifons langs de reling spuiten vuur op langszijliggers' },
      fenders: { name: 'Azijndrenkt vilt', desc: 'Azijndrenkt vilt — de oude verdediging tegen Grieks vuur' },
    },
    lepanto: {
      ram: { name: 'Galeispoor (sperone)', desc: 'De ijzeren spoor rijdt over haar boeg en verbrijzelt haar riemen' },
      spikes: { name: 'Pavezen & enterpieken', desc: 'Pieken achter de pavezen rijgen enterders' },
      fenders: { name: 'Netten & matrassen', desc: 'Enternetten en matrassen over de rambaden' },
    },
    ottoman: {
      ram: { name: 'Kadırga-spoor', desc: 'De Ottomaanse spoor breekt de riemen van christengaleien' },
      spikes: { name: 'Dreggenkettingen', desc: 'Dreggen aan kettingen vergrendelen langszijliggers' },
      fenders: { name: 'Wolbalen-paveze', desc: 'Wolbalen achter de reling gesjord' },
    },
    arab: {
      ram: { name: 'Teakhouten stevenkap', desc: 'Een gekapte teakhouten steven om piraten te overvaren' },
      spikes: { name: 'Nafta-pottenrekken', desc: 'Aarden vuurpotten op de reling barsten tegen een romp' },
      fenders: { name: 'Kokostouw-stoters', desc: 'Kokosvezel-stoters, als het touw dat de romp naait' },
    },
    chola: {
      ram: { name: 'IJzerbekapte steven', desc: 'Een ijzeren kap op de grote Coromandel-steven' },
      spikes: { name: 'IJzerpunten-reling', desc: 'IJzeren punten langs de reling voor de prauwen' },
      fenders: { name: 'Kokosstoters', desc: 'Kokosvezel-stoters langs de zijden' },
    },
    chinese: {
      ram: { name: 'Mengchong-ramboeg', desc: 'De met ongelooide huid beklede ramboeg van de riviervloten' },
      spikes: { name: 'Vuurlans-rekken', desc: 'Vuurlansen op de reling spuwen van dichtbij vlammen' },
      fenders: { name: 'Rauwhuid-rompschermen', desc: 'Natte ongelooide huid over de bovenbouw' },
    },
    vietnam: {
      ram: { name: 'IJzergepunte paalboeg', desc: 'De palen van Bạch Đằng, aan je eigen boeg bevestigd' },
      spikes: { name: 'Bamboepalen-schorten', desc: 'Gescherpt bamboe langs de waterlijn' },
      fenders: { name: 'Bamboebundel-stoters', desc: 'Gesjorde bundels groen bamboe' },
    },
    japanese: {
      ram: { name: 'Gepantserde ijzeren boeg', desc: 'Nobunaga’s ijzeren schepen: een gepantserde boeg om te rammen' },
      spikes: { name: 'Kumade-harkhaken', desc: 'Berenklauw-harken sleuren aan langszijliggers' },
      fenders: { name: 'Takeba-bamboebundels', desc: 'Bamboebundels die pijlen en klappen stoppen' },
    },
    korea: {
      ram: { name: 'Drakenkop-ram', desc: 'De drakenkop — ram en verstik haar bemanning in zwavelrook' },
      spikes: { name: 'IJzerbepunt schildpaddak', desc: 'IJzeren punten op het dak scheuren langszijkomers open' },
      fenders: { name: 'Zeshoek-platenpantser', desc: 'IJzeren platen over romp en dak' },
    },
    maori: {
      ram: { name: 'Gesneden tauihu-boeg', desc: 'Het gesneden boegbeeld, geschoord om een waka binnen te varen' },
      spikes: { name: 'Taiaha-sperenreling', desc: 'Langs de reling gevelde speren' },
      fenders: { name: 'Vlas-touwsjorring', desc: 'Harakeke-vlassjorring vangt de klappen op' },
    },
    hawaii: {
      ram: { name: 'Koa-boeg', desc: 'Een koahouten boeg om tussen de rompen te varen' },
      spikes: { name: 'Haaientand-reling', desc: 'Leiomano-haaientandbladen langs de relings' },
      fenders: { name: 'Hala-matstoters', desc: 'Geweven pandanusmatten over de zijden' },
    },
    maya: {
      ram: { name: 'Hardhouten boeg', desc: 'Een chicozapote-boeg om kano’s te rammen' },
      spikes: { name: 'Obsidiaan-relings', desc: 'Obsidiaanbladen langs de reling gezet' },
      fenders: { name: 'Gewatteerde katoenschermen', desc: 'Gewatteerd katoenen pantser over de zijden' },
    },
    aztec: {
      ram: { name: 'Cipressen-boeg', desc: 'Een ahuehuete-houten boeg, geschoord om te rammen' },
      spikes: { name: 'Obsidiaanbladen-reling', desc: 'Macuahuitl-bladen langs de reling gezet' },
      fenders: { name: 'Ichcahuipilli-mantels', desc: 'Gewatteerd katoenen pantser over de zijden gedrapeerd' },
    },
    inca: {
      ram: { name: 'Hardhouten boegbalk', desc: 'Een zware hardhouten balk dwars over de boeg gesjord' },
      spikes: { name: 'Benpunten-pollenhaag', desc: 'Met been gepunte pollen langs de vlotrand' },
      fenders: { name: 'Totora-rietbundels', desc: 'Totora-rietbundels rond het vlot gesjord' },
    },
  },
};

const pt: FittingsDict = {
  lead: { ram: 'Proa', spikes: 'Costados', fenders: 'Guarda' },
  tag: { breach: ' · abre-lhe rombo', tangle: ' · abranda-a', fire: ' · incendeia-a', shock: ' · atordoa a guarnição' },
  eras: {
    golden: {
      ram: { name: 'Talha-mar ferrado', desc: 'Crava a roda forrada a ferro num casco em velocidade' },
      spikes: { name: 'Fateixas na borda', desc: 'Tudo o que roce o costado fica enganchado, rasgado e abrandado' },
      fenders: { name: 'Defensas de cabos velhos e espeques', desc: 'Defensas de cabo velho e longos espeques mantêm à distância esporões e brulotes' },
    },
    exploration: {
      ram: { name: 'Beque reforçado', desc: 'Um beque escorado que esmaga um casco em velocidade' },
      spikes: { name: 'Ganchos de foice nas vergas', desc: 'Lâminas de foice nas vergas cortam a enxárcia de quem se aproxime' },
      fenders: { name: 'Coxins de couro de boi', desc: 'Couros cheios de lã pendurados no costado absorvem golpes' },
    },
    napoleonic: {
      ram: { name: 'Roda acobreada e joelho de ferro', desc: 'Uma roda dobrada que arromba o tabuado em velocidade' },
      spikes: { name: 'Redes de abordagem e piques', desc: 'Rede e sebe de piques ao longo da borda ferem abordantes' },
      fenders: { name: 'Defensas de cabo e mastaréus', desc: 'Defensas e espeques mantêm outros cascos à distância' },
    },
    barbary: {
      ram: { name: 'Talha-mar forrado a cobre', desc: 'A roda afiada da escuna, escorada para abalroar canhoneiras' },
      spikes: { name: 'Redes de abordagem e piques', desc: 'Uma sebe de piques ao longo da borda para os corsários' },
      fenders: { name: 'Redes de maca', desc: 'Macas enroladas nas redes da borda sustêm bala e estilhaços' },
    },
    viking: {
      ram: { name: 'Roda cingida a ferro', desc: 'Uma cinta de ferro na alta roda — monta e parte-lhe as tábuas' },
      spikes: { name: 'Sebe de lanças na borda de escudos', desc: 'Lanças apontadas entre escudos espetam quem se aproxime' },
      fenders: { name: 'Cintas de carvalho', desc: 'Grossas cintas de carvalho levam o golpe em vez do forro' },
    },
    ironclad: {
      ram: { name: 'Proa de aríete em ferro fundido', desc: 'O truque do Virginia: abre-lhe rombo abaixo da linha de água' },
      spikes: { name: 'Mangueiras de vapor vivo', desc: 'Vapor vivo nas bordas escalda abordantes — as guarnições dispersam' },
      fenders: { name: 'Saias de ferro de caminho-de-ferro', desc: 'Ferro inclinado sobre a linha de água desvia esporões e bala' },
    },
    hanse: {
      ram: { name: 'Roda de coca ferrada', desc: 'A pesada roda da coca, ferrada para abalroar' },
      spikes: { name: 'Vergas de lâmina de foice', desc: 'Lâminas nos laises ceifam a enxárcia de quem se aproxime' },
      fenders: { name: 'Defensas de sacas de lã', desc: 'Sacas de lã inglesa no costado — carga da própria Liga' },
    },
    portugal: {
      ram: { name: 'Beque de carraca', desc: 'Um bico maciço escorado para esmagar dhows' },
      spikes: { name: 'Ganchos de foice', desc: 'Lâminas ganchosas rasgam a enxárcia de quem se aproxime' },
      fenders: { name: 'Amurada de fardos de algodão', desc: 'Fardos de algodão indiano peados ao longo da coxia' },
    },
    armada: {
      ram: { name: 'Bico de ferro de galeaça', desc: 'O esporão de ferro da galeaça fura o tabuado sob a cinta' },
      spikes: { name: 'Redes de abordagem com piques', desc: 'Redes e piques ao longo da coxia ferem abordantes' },
      fenders: { name: 'Espeques contra brulotes', desc: 'Espeques para afastar os brulotes de Gravelinas' },
    },
    dutch: {
      ram: { name: 'Joelho de carvalho', desc: 'Uma roda de carvalho dobrada para abalroar uma presa' },
      spikes: { name: 'Cabides de piques de abordagem', desc: 'Piques em cabides ao longo da borda espetam abordantes' },
      fenders: { name: 'Esteiras de cânhamo', desc: 'Grossas esteiras de cânhamo tecido penduradas no costado' },
    },
    predread: {
      ram: { name: 'Proa de esporão', desc: 'Todo o couraçado de 1905 ainda trazia esporão — usa-o' },
      spikes: { name: 'Mastaréus de redes anti-torpedo', desc: 'Mastaréus abertos e rede de aço prendem quem se aproxime' },
      fenders: { name: 'Cinta de aço Harvey', desc: 'Blindagem endurecida ao longo da linha de água' },
    },
    ww1: {
      ram: { name: 'Proa de abalroamento reforçada', desc: 'Contratorpedeiros abalroavam U-Boots — uma proa feita para isso' },
      spikes: { name: 'Paravanas explosivas', desc: 'Cargas rebocadas da proa explodem contra um casco — as guarnições cambaleiam' },
      fenders: { name: 'Abaulamentos anti-torpedo', desc: 'Casco exterior abaulado absorve golpes e explosões' },
    },
    ww2: {
      ram: { name: 'Roda de abalroamento reforçada', desc: 'Como o USS Borie contra o U-405: monta e esmaga-o' },
      spikes: { name: 'Calhas de cargas de profundidade', desc: 'Cargas roladas à queima-roupa — o choque dispersa as guarnições' },
      fenders: { name: 'Colchões antiestilhaços', desc: 'Esteiras antiestilhaços sobre a ponte e as peças' },
    },
    hormuz: {
      ram: { name: 'Blindagem de proa reforçada', desc: 'Uma proa blindada para abalroar lanchas rápidas' },
      spikes: { name: 'Suportes de minas de contacto', desc: 'Minas nos suportes da borda explodem contra um casco' },
      fenders: { name: 'Painéis blindados de kevlar', desc: 'Painéis compostos sobre a ponte e a linha de água' },
    },
    falklands: {
      ram: { name: 'Proa reforçada para o gelo', desc: 'Uma proa do Atlântico Sul, forte o bastante para abalroar' },
      spikes: { name: 'Lançadores de chaff Corvus', desc: 'Chaff e flares à queima-roupa cegam as guarnições' },
      fenders: { name: 'Painéis antiestilhaços de kevlar', desc: 'Acrescentados depois do Sheffield: antiestilhaços sobre os vitais' },
    },
    somali: {
      ram: { name: 'Chapa de proa soldada', desc: 'Chapa de sucata soldada à proa da nave-mãe — encosta e aborda' },
      spikes: { name: 'Escadas de abordagem com ganchos', desc: 'Escadas de alumínio enganchadas à borda prendem-na e abrandam-na' },
      fenders: { name: 'Defensas de pneus de camião', desc: 'Pneus velhos acorrentados aos costados levam as pancadas' },
    },
    roman: {
      ram: { name: 'Rostro de bronze', desc: 'Um esporão de bronze de três barbatanas — abre-lhe rombo abaixo da linha de água' },
      spikes: { name: 'Ponte de abordagem corvus', desc: 'A ponte com espigão cai sobre o convés e crava-a' },
      fenders: { name: 'Cintas de carvalho', desc: 'Pesadas cintas na linha de água levam o abalroamento' },
    },
    greek: {
      ram: { name: 'Êmbolo de bronze', desc: 'O esporão de Salamina: a plena vogada arromba um casco' },
      spikes: { name: 'Vigas de epótides', desc: 'Vigas da proa ceifam os remos de quem se aproxime' },
      fenders: { name: 'Cabos de cinta hypozomata', desc: 'Cabos que cingem o casco mantêm-no unido ao ser atingido' },
    },
    macedon: {
      ram: { name: 'Grande esporão e proembolion', desc: 'Um esporão principal com um segundo por cima para as pesadas polirremes' },
      spikes: { name: 'Fateixas de mão de ferro', desc: 'Mãos de ferro em correntes agarram quem se aproxime' },
      fenders: { name: 'Cintas dobradas e anteparos de couro', desc: 'Cintas dobradas e couros sobre a caixa dos remos' },
    },
    phoenicia: {
      ram: { name: 'Esporão de focinho de javali', desc: 'O esporão aguçado das galés de cedro de Tiro' },
      spikes: { name: 'Borda pendurada de escudos', desc: 'Escudos e pontas de lança pendurados ao longo da borda' },
      fenders: { name: 'Cintas de cedro', desc: 'Cintas de cedro do Líbano na linha de água' },
    },
    egypt: {
      ram: { name: 'Viga de proa de cabeça de leão', desc: 'A proa leonina de Medinet Habu, escorada para o choque' },
      spikes: { name: 'Ganchos de abordagem de vara', desc: 'Ganchos em varas arrastam saqueadores para o costado e seguram-nos' },
      fenders: { name: 'Amurada de feixes de papiro', desc: 'Anteparos de feixes de papiro ao longo da borda' },
    },
    byzantium: {
      ram: { name: 'Bico de esporão', desc: 'O esporão do drómon monta por cima e parte-lhe os remos' },
      spikes: { name: 'Bordas de sifões manuais', desc: 'Sifões manuais ao longo da borda aspergem fogo em quem se aproxime' },
      fenders: { name: 'Feltro embebido em vinagre', desc: 'Feltro embebido em vinagre — a velha defesa contra o fogo grego' },
    },
    lepanto: {
      ram: { name: 'Esporão de galé (sperone)', desc: 'O esporão de ferro monta sobre a proa e esmaga-lhe os remos' },
      spikes: { name: 'Paveses e piques de abordagem', desc: 'Piques detrás dos paveses espetam abordantes' },
      fenders: { name: 'Redes e colchões', desc: 'Redes de abordagem e colchões sobre as rambadas' },
    },
    ottoman: {
      ram: { name: 'Esporão de kadirga', desc: 'O esporão otomano parte os remos das galés cristãs' },
      spikes: { name: 'Correntes com fateixas', desc: 'Fateixas em correntes travam quem se aproxime' },
      fenders: { name: 'Pavesada de fardos de lã', desc: 'Fardos de lã peados detrás da borda' },
    },
    arab: {
      ram: { name: 'Capa de roda em teca', desc: 'Uma roda de teca capeada para abalroar piratas' },
      spikes: { name: 'Suportes de potes de nafta', desc: 'Potes de fogo de barro nos suportes rebentam contra um casco' },
      fenders: { name: 'Defensas de cabo de cairo', desc: 'Defensas de fibra de coco, como o cabo que cose o casco' },
    },
    chola: {
      ram: { name: 'Roda capeada a ferro', desc: 'Uma capa de ferro na grande roda de Coromandel' },
      spikes: { name: 'Borda de espigões de ferro', desc: 'Espigões de ferro ao longo da borda para os praus' },
      fenders: { name: 'Defensas de cairo', desc: 'Defensas de fibra de coco ao longo dos costados' },
    },
    chinese: {
      ram: { name: 'Proa de aríete mengchong', desc: 'A proa do aríete forrada a couro cru das frotas fluviais' },
      spikes: { name: 'Suportes de lanças de fogo', desc: 'Lanças de fogo nos suportes cospem chama à queima-roupa' },
      fenders: { name: 'Anteparos de couro cru', desc: 'Couro cru molhado sobre as obras mortas' },
    },
    vietnam: {
      ram: { name: 'Proa de estacas de ponta de ferro', desc: 'As estacas de Bạch Đằng, fixadas à tua própria proa' },
      spikes: { name: 'Saias de estacas de bambu', desc: 'Bambu afiado ao longo da linha de água' },
      fenders: { name: 'Defensas de feixes de bambu', desc: 'Feixes peados de bambu verde' },
    },
    japanese: {
      ram: { name: 'Proa blindada a ferro', desc: 'Os navios de ferro de Nobunaga: uma proa blindada para abalroar' },
      spikes: { name: 'Ganchos-ancinho kumade', desc: 'Ancinhos de garra de urso agarram quem se aproxime' },
      fenders: { name: 'Feixes de bambu takeba', desc: 'Feixes de bambu que sustêm flechas e golpes' },
    },
    korea: {
      ram: { name: 'Esporão de cabeça de dragão', desc: 'A cabeça de dragão — abalroa e sufoca a guarnição em fumo de enxofre' },
      spikes: { name: 'Telhado de tartaruga com espigões', desc: 'Espigões de ferro sobre o telhado rasgam quem se aproxime' },
      fenders: { name: 'Blindagem de placas hexagonais', desc: 'Placas de ferro sobre o casco e o telhado' },
    },
    maori: {
      ram: { name: 'Proa esculpida tauihu', desc: 'A figura de proa esculpida, escorada para cravar numa waka' },
      spikes: { name: 'Borda de lanças taiaha', desc: 'Lanças apontadas ao longo da borda' },
      fenders: { name: 'Peias de corda de linho', desc: 'Peias de linho harakeke levam as pancadas' },
    },
    hawaii: {
      ram: { name: 'Proa de koa', desc: 'Uma proa de madeira de koa para meter entre os cascos' },
      spikes: { name: 'Borda de dentes de tubarão', desc: 'Lâminas de dentes de tubarão leiomano nas bordas' },
      fenders: { name: 'Defensas de esteiras hala', desc: 'Esteiras tecidas de pandano sobre os costados' },
    },
    maya: {
      ram: { name: 'Proa de madeira dura', desc: 'Uma proa de sapoti para abalroar canoas' },
      spikes: { name: 'Bordas de fio de obsidiana', desc: 'Lâminas de obsidiana engastadas na borda' },
      fenders: { name: 'Anteparos de algodão acolchoado', desc: 'Armadura de algodão acolchoado pendurada nos costados' },
    },
    aztec: {
      ram: { name: 'Proa de cipreste', desc: 'Uma proa de madeira de aueuete escorada para abalroar' },
      spikes: { name: 'Borda de lâminas de obsidiana', desc: 'Lâminas de macuahuitl engastadas na borda' },
      fenders: { name: 'Mantos ichcahuipilli', desc: 'Armadura de algodão acolchoado lançada sobre os costados' },
    },
    inca: {
      ram: { name: 'Tronco de proa de madeira dura', desc: 'Um pesado tronco de madeira dura peado através da proa' },
      spikes: { name: 'Sebe de varas de ponta de osso', desc: 'Varas de ponta de osso na borda da jangada' },
      fenders: { name: 'Feixes de junco totora', desc: 'Feixes de junco totora peados em redor da jangada' },
    },
  },
};

const ja: FittingsDict = {
  lead: { ram: '艦首', spikes: '舷側', fenders: '防御' },
  tag: { breach: ' · 穴を開ける', tangle: ' · 減速させる', fire: ' · 火を付ける', shock: ' · 乗員を怯ませる' },
  eras: {
    golden: {
      ram: { name: '鉄覆いカットウォーター', desc: '鉄覆いの船首を速力に乗せて敵船体へ突き立てよ' },
      spikes: { name: '舷縁のグラップネル', desc: '舷側を擦るものは鉤に掛けられ、掻き削られ、減速する' },
      fenders: { name: '古索フェンダーと突っ張り棒', desc: '古索の防舷材と長い突っ張り棒が衝角と火船を寄せ付けぬ' },
    },
    exploration: {
      ram: { name: '強化ビークヘッド', desc: '速力に乗せて敵船体へ叩き込む補強船首楼' },
      spikes: { name: 'ヤードの鎌鉤', desc: 'ヤードの鎌刃が舷側の敵の索具を切り裂く' },
      fenders: { name: '牛革の緩衝材', desc: '羊毛詰めの革を舷側に吊り衝撃を吸収' },
    },
    napoleonic: {
      ram: { name: '銅張り船首と鉄の膝', desc: '速力で外板を打ち破る二重船首' },
      spikes: { name: '接舷網と槍', desc: '舷縁の網と槍の藪が接舷者を傷つける' },
      fenders: { name: '索具フェンダーと棒', desc: 'フェンダーと突っ張り棒が他船を寄せ付けぬ' },
    },
    barbary: {
      ram: { name: '銅被覆カットウォーター', desc: '砲艇への体当たりに備えたスクーナーの鋭い船首' },
      spikes: { name: '接舷網と槍', desc: '海賊のための舷縁の槍の藪' },
      fenders: { name: 'ハンモック網', desc: '舷縁網の巻きハンモックが弾と破片を止める' },
    },
    viking: {
      ram: { name: '鉄縛りの船首', desc: '高船首の鉄帯 — 駆け上がり外板をへし折れ' },
      spikes: { name: '盾舷の槍の藪', desc: '盾の間に構えた槍が舷側の敵を突き刺す' },
      fenders: { name: '樫の摺り外板', desc: '厚い樫の舷側帯が外板の代わりに衝撃を受ける' },
    },
    ironclad: {
      ram: { name: '鋳鉄の衝角艦首', desc: 'バージニアの手口:喫水線下に穴を開けよ' },
      spikes: { name: 'ボイラー蒸気ホース', desc: '舷縁への生蒸気が接舷者を焼く — 敵乗員は散る' },
      fenders: { name: '鉄道鉄のスカート', desc: '喫水線上の傾斜鉄板が衝角と砲弾を逸らす' },
    },
    hanse: {
      ram: { name: '鉄覆いコグ船首', desc: '体当たり用に鉄覆いしたコグの重い船首' },
      spikes: { name: '鎌刃ヤード', desc: 'ヤード端の刃が舷側の敵の索具を切り払う' },
      fenders: { name: '羊毛袋フェンダー', desc: '舷側の英国羊毛袋 — 同盟自慢の積荷' },
    },
    portugal: {
      ram: { name: 'キャラックの嘴', desc: 'ダウ船へ叩き込む補強の巨嘴' },
      spikes: { name: '鎌鉤', desc: '鉤刃が舷側の敵の索具を引き裂く' },
      fenders: { name: '綿俵の舷牆', desc: '舷側中央部に縛ったインド綿俵' },
    },
    armada: {
      ram: { name: 'ガレアスの鉄嘴', desc: 'ガレアスの鉄距が舷側帯下の外板に穴を開ける' },
      spikes: { name: '槍付き接舷網', desc: '舷側中央部の網と槍が接舷者を傷つける' },
      fenders: { name: '火船よけの棒', desc: 'グラヴリーヌの火船を寄せ付けぬ突っ張り棒' },
    },
    dutch: {
      ram: { name: '樫の船首材', desc: '獲物へ突っ込む二重樫船首' },
      spikes: { name: '接舷槍の舷縁', desc: '舷縁に立てた槍が接舷者を突き刺す' },
      fenders: { name: '麻の防舷マット', desc: '舷側に吊った厚織りの麻マット' },
    },
    predread: {
      ram: { name: '衝角艦首', desc: '1905年の戦艦は皆衝角を備えた — 使え' },
      spikes: { name: '魚雷防御網の棒', desc: '張り出した棒と鋼網が舷側の敵を絡め取る' },
      fenders: { name: 'ハーベイ鋼の装甲帯', desc: '喫水線沿いの表面硬化装甲' },
    },
    ww1: {
      ram: { name: '強化体当たり艦首', desc: '駆逐艦はUボートに体当たりした — そのための艦首' },
      spikes: { name: '爆発式パラベーン', desc: '艦首曳航の爆薬が船体に触れて爆発 — 乗員はよろめく' },
      fenders: { name: '魚雷防御バルジ', desc: '膨らんだ外殻が衝撃と爆発を吸収' },
    },
    ww2: {
      ram: { name: '強化体当たり船首', desc: 'U-405に対するUSSボーリーの如く:駆け上がり押し潰せ' },
      spikes: { name: '爆雷投下軌条', desc: '至近で転がす爆雷 — 衝撃が敵乗員を散らす' },
      fenders: { name: '破片防御マット', desc: '艦橋と砲座を覆う破片防御マット' },
    },
    hormuz: {
      ram: { name: '強化艦首装甲', desc: '高速艇へ突っ込む装甲艦首' },
      spikes: { name: '触発機雷ラック', desc: '舷縁の機雷が船体に触れて爆発' },
      fenders: { name: 'ケブラー装甲板', desc: '艦橋と喫水線を覆う複合装甲板' },
    },
    falklands: {
      ram: { name: '耐氷強化艦首', desc: '体当たりに耐える南大西洋の艦首' },
      spikes: { name: 'コーバス・チャフ発射機', desc: '至近のチャフとフレアが敵乗員の目を潰す' },
      fenders: { name: 'ケブラー破片防御板', desc: 'シェフィールド後に追加:要所を覆う破片防御' },
    },
    somali: {
      ram: { name: '溶接鋼板艦首', desc: '母船艦首に溶接したスクラップ板 — 当てて接舷せよ' },
      spikes: { name: '鉤付き接舷梯子', desc: '敵舷に掛けたアルミ梯子が絡め取り減速させる' },
      fenders: { name: 'トラックタイヤ防舷材', desc: '舷側に鎖で吊った古タイヤが衝撃を受ける' },
    },
    roman: {
      ram: { name: '青銅のロストルム', desc: '三鰭の青銅衝角 — 喫水線下に穴を開けよ' },
      spikes: { name: 'コルウス接舷橋', desc: '棘橋が敵甲板に落ちて釘付けにする' },
      fenders: { name: '樫の舷側帯', desc: '喫水線沿いの重い舷側帯が体当たりを受ける' },
    },
    greek: {
      ram: { name: '青銅のエンボロン', desc: 'サラミスの衝角:全力漕ぎで船体を打ち破る' },
      spikes: { name: 'エポティデスの張出梁', desc: '艦首の梁が舷側の敵の櫂を薙ぎ払う' },
      fenders: { name: 'ヒュポゾマタの緊縛索', desc: '船体緊縛索が被弾時の船体を保つ' },
    },
    macedon: {
      ram: { name: '大衝角と上嘴', desc: '重ポリュレメー用の二段衝角' },
      spikes: { name: '鉄の手の鉤', desc: '鎖の鉄の手が舷側の敵を掴む' },
      fenders: { name: '二重舷側帯と革覆い', desc: '櫂室を覆う二重帯と革' },
    },
    phoenicia: {
      ram: { name: '青銅の猪鼻衝角', desc: 'ティルスの杉ガレー船の尖った衝角' },
      spikes: { name: '盾を掛けた舷縁', desc: '舷縁に掛けた盾と槍の穂先' },
      fenders: { name: '杉の舷側帯', desc: '喫水線沿いのレバノン杉帯' },
    },
    egypt: {
      ram: { name: '獅子頭の船首梁', desc: '衝撃に備えたメディネト・ハブの獅子頭船首' },
      spikes: { name: '棹鉤', desc: '棹の鉤が略奪者を引き寄せ押さえる' },
      fenders: { name: 'パピルス束の舷牆', desc: '舷縁沿いのパピルス束の覆い' },
    },
    byzantium: {
      ram: { name: '距嘴', desc: 'ドロモンの距が乗り上げ敵の櫂をへし折る' },
      spikes: { name: '手動サイフォンの火舷', desc: '舷縁の手動サイフォンが舷側の敵へ火を噴く' },
      fenders: { name: '酢浸しフェルト', desc: '酢浸しフェルト — ギリシア火への古来の備え' },
    },
    lepanto: {
      ram: { name: 'ガレーの距(スペローネ)', desc: '鉄の距が敵艦首に乗り上げ櫂を打ち砕く' },
      spikes: { name: '大楯と接舷槍', desc: '大楯の陰の槍が接舷者を突き刺す' },
      fenders: { name: '網とマット', desc: '舷牆上の接舷網とマット' },
    },
    ottoman: {
      ram: { name: 'カドゥルガの距', desc: 'オスマンの距がキリスト教ガレーの櫂をへし折る' },
      spikes: { name: '鉤付き鎖', desc: '鎖の鉤が舷側の敵を絡め取る' },
      fenders: { name: '羊毛俵の楯列', desc: '舷縁裏に縛った羊毛俵' },
    },
    arab: {
      ram: { name: 'チーク船首冠', desc: '海賊へ突っ込む冠付きチーク船首' },
      spikes: { name: 'ナフサ壺ラック', desc: '舷縁の土製火壺が船体に当たって弾ける' },
      fenders: { name: 'コイア索フェンダー', desc: '船体を縫う索と同じヤシ繊維の防舷材' },
    },
    chola: {
      ram: { name: '鉄冠船首', desc: 'コロマンデルの大船首の鉄冠' },
      spikes: { name: '鉄棘の舷縁', desc: 'プラウ船用の舷縁の鉄棘' },
      fenders: { name: 'コイア防舷材', desc: '舷側沿いのヤシ繊維防舷材' },
    },
    chinese: {
      ram: { name: '蒙衝の衝角船首', desc: '河川艦隊の生皮覆い衝角船の船首' },
      spikes: { name: '火槍ラック', desc: '舷縁の火槍が至近で火炎を噴く' },
      fenders: { name: '生皮の船体覆い', desc: '上部構造を覆う濡れ生皮' },
    },
    vietnam: {
      ram: { name: '鉄先杭の船首', desc: '自艦首に据えたバクダンの杭' },
      spikes: { name: '竹杭のスカート', desc: '喫水線沿いの研いだ竹' },
      fenders: { name: '青竹束フェンダー', desc: '縛った青竹の束' },
    },
    japanese: {
      ram: { name: '鉄張り艦首', desc: '信長の鉄船:体当たり用の装甲艦首' },
      spikes: { name: '熊手', desc: '熊手が舷側の敵を引き掻く' },
      fenders: { name: '竹束', desc: '矢と打撃を止める竹束' },
    },
    korea: {
      ram: { name: '龍頭の衝角', desc: '龍頭 — 当てて硫黄煙で敵乗員を苛め' },
      spikes: { name: '鉄棘の亀甲覆い', desc: '覆いの鉄棘が寄る敵を引き裂く' },
      fenders: { name: '六角鉄板装甲', desc: '船体と覆いを覆う鉄板' },
    },
    maori: {
      ram: { name: '彫刻タウイヒュ船首', desc: 'ワカ船へ突っ込む補強の彫刻船首' },
      spikes: { name: 'タイアハ槍の舷縁', desc: '舷縁に構えた槍' },
      fenders: { name: '亜麻索の緊縛', desc: 'ハラケケ亜麻の緊縛が衝撃を受ける' },
    },
    hawaii: {
      ram: { name: 'コア材の船首', desc: '船体の間へ割り込むコア材船首' },
      spikes: { name: '鮫歯の舷縁', desc: '舷縁沿いのレイオマノ鮫歯刃' },
      fenders: { name: 'ハラ茣蓙フェンダー', desc: '舷側を覆う編みパンダヌス茣蓙' },
    },
    maya: {
      ram: { name: '堅木の船首', desc: 'カヌーへ体当たりするチクサポテ船首' },
      spikes: { name: '黒曜石刃の舷縁', desc: '舷縁に据えた黒曜石の刃' },
      fenders: { name: '綿入れ木綿の覆い', desc: '舷側に吊った綿入れ木綿の鎧' },
    },
    aztec: {
      ram: { name: '糸杉の船首', desc: '体当たり用に補強したアウェウェテ材船首' },
      spikes: { name: '黒曜石刃の舷縁', desc: '舷縁に据えたマクアウィトル刃' },
      fenders: { name: 'イチカウィピリの覆い', desc: '舷側に掛けた綿入れ木綿の鎧' },
    },
    inca: {
      ram: { name: '堅木の船首丸太', desc: '船首に渡して縛った重い堅木丸太' },
      spikes: { name: '骨先棹の藪', desc: '筏縁の骨先棹' },
      fenders: { name: 'トトラ葦の束', desc: '筏の周りに縛ったトトラ葦束' },
    },
  },
};

const zh: FittingsDict = {
  lead: { ram: '艏', spikes: '舷', fenders: '卫' },
  tag: { breach: ' · 击穿她', tangle: ' · 缠住她', fire: ' · 点燃她', shock: ' · 震慑其船员' },
  eras: {
    golden: {
      ram: { name: '铁包艏柱', desc: '高速把铁包艏柱撞进敌船体' },
      spikes: { name: '舷墙钩镰', desc: '凡擦舷而过者，钩住、耙伤、减速' },
      fenders: { name: '旧缆碰垫与撑杆', desc: '旧缆碰垫和长撑杆挡开撞角与火船' },
    },
    exploration: {
      ram: { name: '加固艏楼', desc: '以加固艏楼高速撞击船体' },
      spikes: { name: '桁端镰钩', desc: '桁上镰刀割断擦舷者的帆缆' },
      fenders: { name: '牛皮垫', desc: '填羊毛的牛皮垫挂舷吸冲击' },
    },
    napoleonic: {
      ram: { name: '包铜艏柱与铁曲材', desc: '双层艏柱高速撞碎船板' },
      spikes: { name: '防接舷网与长矛', desc: '舷墙网与矛林刺伤接舷者' },
      fenders: { name: '缆绳碰垫与撑杆', desc: '碰垫与撑杆挡开他船' },
    },
    barbary: {
      ram: { name: '包铜艏', desc: '纵帆船利艏，加固以撞炮艇' },
      spikes: { name: '防接舷网与长矛', desc: '舷墙矛林对付海盗' },
      fenders: { name: '吊床网', desc: '卷起吊床塞舷网，挡弹片' },
    },
    viking: {
      ram: { name: '铁箍艏柱', desc: '高艏铁箍——骑上敌船压裂船板' },
      spikes: { name: '盾墙矛林', desc: '盾间平端长矛，戳穿擦舷者' },
      fenders: { name: '橡木护舷', desc: '厚橡木护舷替船板挨撞' },
    },
    ironclad: {
      ram: { name: '铸铁撞角', desc: '弗吉尼亚号的招：水线下击穿' },
      spikes: { name: '锅炉蒸汽管', desc: '通往舷墙的蒸汽烫接舷者——船员四散' },
      fenders: { name: '铁轨裙甲', desc: '水线倾斜铁甲弹开撞角炮弹' },
    },
    hanse: {
      ram: { name: '铁包柯克艏', desc: '柯克船重艏，包铁以撞' },
      spikes: { name: '桁端镰刀', desc: '桁上刀片削断擦舷者帆缆' },
      fenders: { name: '羊毛袋碰垫', desc: '英国羊毛袋挂舷——同盟自家货' },
    },
    portugal: {
      ram: { name: '大克拉克艏', desc: '巨艏加固以撞独桅船' },
      spikes: { name: '镰钩', desc: '钩刃撕裂擦舷者帆缆' },
      fenders: { name: '棉包舷墙', desc: '印度棉包绑舷腰' },
    },
    armada: {
      ram: { name: '大桨帆船铁喙', desc: '铁喙在护舷下击穿船板' },
      spikes: { name: '带矛防接舷网', desc: '舷腰网矛刺伤接舷者' },
      fenders: { name: '火船钩撑杆', desc: '撑杆挡开格拉沃利纳的火船' },
    },
    dutch: {
      ram: { name: '橡木艏肘', desc: '双层橡木艏以撞俘获船' },
      spikes: { name: '舷墙矛架', desc: '舷墙矛架戳接舷者' },
      fenders: { name: '麻垫', desc: '厚编麻垫挂舷' },
    },
    predread: {
      ram: { name: '撞角艏', desc: '1905 年每艘战列舰都有撞角——用它' },
      spikes: { name: '防雷网撑杆', desc: '张开撑杆钢网缠住擦舷者' },
      fenders: { name: '哈维钢装甲带', desc: '水线表面硬化装甲' },
    },
    ww1: {
      ram: { name: '加强撞角艏', desc: '驱逐舰撞过 U 艇——艏为此而造' },
      spikes: { name: '爆炸防雷具', desc: '艏拖曳炸弹触船爆炸——船员踉跄' },
      fenders: { name: '防雷凸出部', desc: '外凸船体吸冲击爆炸' },
    },
    ww2: {
      ram: { name: '加强撞击艏', desc: '学鲍里号战 U-405：骑上去压碎她' },
      spikes: { name: '深弹导轨', desc: '抵近滚深弹——冲击震散其船员' },
      fenders: { name: '破片垫', desc: '舰桥炮位覆破片垫' },
    },
    hormuz: {
      ram: { name: '加强艏板', desc: '包板艏以撞快艇' },
      spikes: { name: '触发水雷架', desc: '舷墙雷架触船爆炸' },
      fenders: { name: '凯夫拉装甲板', desc: '舰桥水线覆复合板' },
    },
    falklands: {
      ram: { name: '破冰加强艏', desc: '南大西洋艏，够硬能撞' },
      spikes: { name: '干扰箔发射器', desc: '抵近箔条曳光晃瞎其船员' },
      fenders: { name: '凯夫拉破片板', desc: '谢菲尔德号之后加装：要害覆破片甲' },
    },
    somali: {
      ram: { name: '焊接钢艏板', desc: '母船艏焊废钢板——蹭上去接舷' },
      spikes: { name: '钩梯', desc: '铝梯钩住其舷墙，缠住减速' },
      fenders: { name: '卡车胎碰垫', desc: '旧胎链挂两舷挨蹭' },
    },
    roman: {
      ram: { name: '青铜撞角', desc: '三鳍青铜撞角——水线下击穿' },
      spikes: { name: '乌鸦吊桥', desc: '钉桥落其甲板钉住她' },
      fenders: { name: '橡木护舷', desc: '水线重护舷挨撞' },
    },
    greek: {
      ram: { name: '青铜撞角', desc: '萨拉米斯撞角：全桨速撞碎船体' },
      spikes: { name: '艏斜撑梁', desc: '艏梁削断擦舷者船桨' },
      fenders: { name: '环船束缆', desc: '束缆中弹时箍住船体' },
    },
    macedon: {
      ram: { name: '大撞角与副喙', desc: '主撞角上再加一喙，对付重型多列桨船' },
      spikes: { name: '铁手钩', desc: '链上铁手抓住擦舷者' },
      fenders: { name: '双护舷与皮帘', desc: '双护舷，桨室覆皮' },
    },
    phoenicia: {
      ram: { name: '青铜猪鼻撞角', desc: '推罗雪松战船的尖撞角' },
      spikes: { name: '挂盾舷墙', desc: '盾与矛尖挂舷墙' },
      fenders: { name: '雪松护舷', desc: '水线黎巴嫩雪松护舷' },
    },
    egypt: {
      ram: { name: '狮头艏梁', desc: '麦迪内特哈布狮头艏，加固迎撞' },
      spikes: { name: '长杆钩', desc: '长杆钩把袭击者拖住' },
      fenders: { name: '纸莎草束舷墙', desc: '舷墙纸莎草束帘' },
    },
    byzantium: {
      ram: { name: '撞角喙', desc: '战船撞角骑上敌船折断其桨' },
      spikes: { name: '手喷火舷墙', desc: '舷墙手喷管向擦舷者喷火' },
      fenders: { name: '醋泡毡', desc: '醋泡毡——防希腊火的老法' },
    },
    lepanto: {
      ram: { name: '战船撞角', desc: '铁撞角骑其艏砸断船桨' },
      spikes: { name: '盾墙长矛', desc: '大盾后长矛戳接舷者' },
      fenders: { name: '网与垫', desc: '舷台覆防接舷网垫' },
    },
    ottoman: {
      ram: { name: '卡迪尔加撞角', desc: '奥斯曼撞角折断基督徒桨船船桨' },
      spikes: { name: '钩链', desc: '链钩锁住擦舷者' },
      fenders: { name: '羊毛包盾墙', desc: '羊毛包绑舷墙后' },
    },
    arab: {
      ram: { name: '柚木艏帽', desc: '柚木艏帽以撞海盗' },
      spikes: { name: '火油罐架', desc: '舷墙陶火罐触船爆裂' },
      fenders: { name: '椰绳碰垫', desc: '椰纤碰垫，如缝船之绳' },
    },
    chola: {
      ram: { name: '铁包艏', desc: '科罗曼德大艏铁包' },
      spikes: { name: '铁刺舷墙', desc: '舷墙铁刺对付小船' },
      fenders: { name: '椰纤碰垫', desc: '两舷椰纤碰垫' },
    },
    chinese: {
      ram: { name: '蒙冲撞角艏', desc: '水师蒙冲生皮覆艏' },
      spikes: { name: '火枪架', desc: '舷墙火枪抵近喷火' },
      fenders: { name: '生皮船帘', desc: '上层覆湿生皮' },
    },
    vietnam: {
      ram: { name: '铁头桩艏', desc: '白藤桩装自家艏上' },
      spikes: { name: '竹桩裙', desc: '水线削尖竹' },
      fenders: { name: '竹束碰垫', desc: '捆扎青竹束' },
    },
    japanese: {
      ram: { name: '铁甲艏', desc: '信长铁甲船：装甲艏以撞' },
      spikes: { name: '熊手耙钩', desc: '熊爪耙拖擦舷者' },
      fenders: { name: '竹束', desc: '竹束挡箭挡撞' },
    },
    korea: {
      ram: { name: '龙头撞角', desc: '龙头——撞，并以硫磺烟呛其船员' },
      spikes: { name: '龟甲铁刺', desc: '甲上铁刺撕擦舷者' },
      fenders: { name: '六角铁甲', desc: '船体甲上覆铁板' },
    },
    maori: {
      ram: { name: '雕刻船艏', desc: '雕像艏加固以撞战舟' },
      spikes: { name: '泰阿哈矛墙', desc: '舷墙平端长矛' },
      fenders: { name: '亚麻缆', desc: '哈拉凯克亚麻缆挨蹭' },
    },
    hawaii: {
      ram: { name: '寇阿木艏', desc: '寇阿木艏楔入双体间' },
      spikes: { name: '鲨牙舷墙', desc: '舷墙鲨牙刃' },
      fenders: { name: '露兜垫', desc: '两舷覆编露兜垫' },
    },
    maya: {
      ram: { name: '硬木艏', desc: '人心果木艏以撞独木舟' },
      spikes: { name: '黑曜石刃舷', desc: '舷墙嵌黑曜石刃' },
      fenders: { name: '绗缝棉帘', desc: '两舷挂绗缝棉甲' },
    },
    aztec: {
      ram: { name: '柏木艏', desc: '落羽杉木艏加固以撞' },
      spikes: { name: '黑曜石刃墙', desc: '舷墙嵌马夸维特刃' },
      fenders: { name: '棉甲披帘', desc: '两舷披绗缝棉甲' },
    },
    inca: {
      ram: { name: '硬木艏横木', desc: '重硬木横绑艏上' },
      spikes: { name: '骨尖杆墙', desc: '筏缘立骨尖长杆' },
      fenders: { name: '托托拉芦苇束', desc: '筏周绑托托拉芦苇束' },
    },
  },
};

const id: FittingsDict = {
  lead: { ram: 'Haluan', spikes: 'Sisi', fenders: 'Jaga' },
  tag: { breach: ' · melubanginya', tangle: ' · memperlambatnya', fire: ' · membakarnya', shock: ' · mengejutkan awaknya' },
  eras: {
    golden: {
      ram: { name: 'Linggi Berlapis Besi', desc: 'Tancapkan linggi berlapis besi ke lambung dengan kecepatan' },
      spikes: { name: 'Ganco di Rel', desc: 'Apa pun yang menyerempet sisi dikait, disayat, dan diperlambat' },
      fenders: { name: 'Fender Junk & Galah Penahan', desc: 'Fender tali junk dan galah panjang menahan ram dan kapal api' },
    },
    exploration: {
      ram: { name: 'Anjungan Depan Diperkuat', desc: 'Anjungan depan diperkuat yang menghantam lambung dengan kecepatan' },
      spikes: { name: 'Kait Sabit di Layar', desc: 'Bilah sabit di layar memotong tali-temali siapa pun di samping' },
      fenders: { name: 'Bantal Kulit Sapi', desc: 'Kulit berisi wol digantung di sisi menyerap pukulan' },
    },
    napoleonic: {
      ram: { name: 'Linggi Tembaga & Lutut Besi', desc: 'Linggi ganda yang membobol papan dengan kecepatan' },
      spikes: { name: 'Jaring Serbu & Tombak', desc: 'Jaring dan pagar tombak di rel melukai penyerbu' },
      fenders: { name: 'Fender Tali & Boom', desc: 'Fender dan boom penahan menjauhkan lambung lain' },
    },
    barbary: {
      ram: { name: 'Linggi Berlapis Tembaga', desc: 'Linggi tajam sekunar, diperkuat untuk mendobrak kapal meriam' },
      spikes: { name: 'Jaring Serbu & Tombak', desc: 'Pagar tombak di rel untuk para korsair' },
      fenders: { name: 'Jaring Hammock', desc: 'Hammock digulung di jaring rel menahan peluru dan serpihan' },
    },
    viking: {
      ram: { name: 'Linggi Berikat Besi', desc: 'Sabuk besi di linggi tinggi — naik dan retakkan papan mereka' },
      spikes: { name: 'Pagar Tombak di Rel Perisai', desc: 'Tombak diratakan di antara perisai menanduk siapa pun di samping' },
      fenders: { name: 'Papan Gosok Oak', desc: 'Papan oak tebal menahan pukulan ganti papan lambung' },
    },
    ironclad: {
      ram: { name: 'Haluan Ram Besi Cor', desc: 'Trik Virginia: lubangi dia di bawah garis air' },
      spikes: { name: 'Selang Uap Ketel', desc: 'Uap hidup disalurkan ke rel menyiram penyerbu — awaknya berhamburan' },
      fenders: { name: 'Rok Besi Rel', desc: 'Besi miring di atas garis air membelokkan ram dan peluru' },
    },
    hanse: {
      ram: { name: 'Linggi Kog Berlapis Besi', desc: 'Linggi berat kog, dilapis untuk mendobrak' },
      spikes: { name: 'Pedang Sabit Layar', desc: 'Bilah di layar memangkas tali-temali siapa pun di samping' },
      fenders: { name: 'Fender Karung Wol', desc: 'Karung wol Inggris digantung di sisi — kargo Liga sendiri' },
    },
    portugal: {
      ram: { name: 'Anjungan Karak', desc: 'Paruh besar diperkuat untuk menghantam dhow' },
      spikes: { name: 'Kait Sabit', desc: 'Bilah berkait merobek tali-temali siapa pun di samping' },
      fenders: { name: 'Benteng Bal Wol', desc: 'Bal kapas India diikat di sepanjang lambung' },
    },
    armada: {
      ram: { name: 'Paruh Besi Galeas', desc: 'Taji besi galeas melubangi papan di bawah papan gosok' },
      spikes: { name: 'Jaring Serbu Bertombak', desc: 'Jaring dan tombak di sepanjang lambung melukai penyerbu' },
      fenders: { name: 'Boom Ganco Kapal Api', desc: 'Boom untuk menahan kapal api Gravelines' },
    },
    dutch: {
      ram: { name: 'Lutut Linggi Oak', desc: 'Linggi oak ganda untuk menenggelamkan rampasan' },
      spikes: { name: 'Rel Tombak Serbu', desc: 'Tombak dirak di sepanjang rel menanduk penyerbu' },
      fenders: { name: 'Keset Fender Hemp', desc: 'Keset hemp tebal anyaman digantung di sisi' },
    },
    predread: {
      ram: { name: 'Haluan Ram', desc: 'Tiap kapal tempur 1905 masih membawa ram — gunakan' },
      spikes: { name: 'Boom Jaring Torpedo', desc: 'Boom terayun dan jaring baja menjerat siapa pun di samping' },
      fenders: { name: 'Sabuk Baja Harvey', desc: 'Baja keras muka di sepanjang garis air' },
    },
    ww1: {
      ram: { name: 'Haluan Ram Diperkuat', desc: 'Destroyer mendobrak U-boat — haluan dibangun untuk itu' },
      spikes: { name: 'Paravane Peledak', desc: 'Muatan derek dari haluan meledak pada lambung — awak terhuyung' },
      fenders: { name: 'Tonjolan Anti-Torpedo', desc: 'Lambung luar menonjol menyerap pukulan dan ledakan' },
    },
    ww2: {
      ram: { name: 'Linggi Ram Diperkuat', desc: 'Seperti USS Borie lawan U-405: naik dan remukkan dia' },
      spikes: { name: 'Rel Depth-Charge', desc: 'Muatan digulirkan jarak rapat — kejutannya mencerai-beraikan awaknya' },
      fenders: { name: 'Kasur Serpihan', desc: 'Anyaman serpihan di atas anjungan dan dudukan' },
    },
    hormuz: {
      ram: { name: 'Pelat Haluan Diperkuat', desc: 'Haluan berpelat untuk menenggelamkan perahu cepat' },
      spikes: { name: 'Rak Ranjau Kontak', desc: 'Ranjau dirak di rel meledak pada lambung' },
      fenders: { name: 'Panel Baja Kevlar', desc: 'Panel komposit di atas anjungan dan garis air' },
    },
    falklands: {
      ram: { name: 'Haluan Diperkuat Es', desc: 'Haluan Atlantik Selatan, cukup kuat untuk mendobrak' },
      spikes: { name: 'Peluncur Chaff Corvus', desc: 'Chaff dan suar jarak rapat membutakan awaknya' },
      fenders: { name: 'Panel Serpihan Kevlar', desc: 'Ditambah setelah Sheffield: baja serpihan di atas bagian vital' },
    },
    somali: {
      ram: { name: 'Pelat Haluan Baja Las', desc: 'Pelat bekas dilas ke haluan kapal induk — senggol dan serbu' },
      spikes: { name: 'Tangga Kait', desc: 'Tangga aluminium dikaitkan ke relnya menjerat dan memperlambatnya' },
      fenders: { name: 'Fender Ban Truk', desc: 'Ban bekas dirantai di sepanjang sisi menahan benturan' },
    },
    roman: {
      ram: { name: 'Rostrum Perunggu', desc: 'Ram perunggu tiga sirip — lubangi dia di bawah garis air' },
      spikes: { name: 'Jembatan Serbu Corvus', desc: 'Jembatan berduri jatuh ke deknya dan menjepitnya' },
      fenders: { name: 'Papan Oak', desc: 'Papan berat di garis air menahan dobrakan' },
    },
    greek: {
      ram: { name: 'Embolon Perunggu', desc: 'Ram Salamis: dengan dayungan penuh ia membobol lambung' },
      spikes: { name: 'Balok Epotides', desc: 'Balok dari haluan menyabit dayung siapa pun di samping' },
      fenders: { name: 'Kabel Hypozomata', desc: 'Kabel pengikat lambung menahannya saat kena' },
    },
    macedon: {
      ram: { name: 'Ram Besar & Proembolion', desc: 'Ram utama dengan satu lagi di atasnya untuk polyreme berat' },
      spikes: { name: 'Ganco Tangan Besi', desc: 'Tangan besi pada rantai mencengkeram siapa pun di samping' },
      fenders: { name: 'Papan Ganda & Layar Kulit', desc: 'Papan ganda dan kulit di atas kotak dayung' },
    },
    phoenicia: {
      ram: { name: 'Ram Moncong Babi Perunggu', desc: 'Ram runcing galai cedar Tirus' },
      spikes: { name: 'Rel Gantungan Perisai', desc: 'Perisai dan mata tombak digantung di rel' },
      fenders: { name: 'Papan Cedar', desc: 'Papan cedar Lebanon di garis air' },
    },
    egypt: {
      ram: { name: 'Balok Haluan Kepala Singa', desc: 'Haluan berkepala singa Medinet Habu, diperkuat untuk benturan' },
      spikes: { name: 'Kait Galah', desc: 'Kait pada galah menyeret perampok ke samping dan menahannya' },
      fenders: { name: 'Benteng Bundel Papirus', desc: 'Layar papirus terbundel di sepanjang rel' },
    },
    byzantium: {
      ram: { name: 'Paruh Taji', desc: 'Taji dromon menunggang dan mematahkan dayungnya' },
      spikes: { name: 'Rel Api Sifon Tangan', desc: 'Sifon tangan di rel menyemprotkan api ke siapa pun di samping' },
      fenders: { name: 'Felt Rendaman Cuka', desc: 'Felt direndam cuka — pertahanan lama melawan api Yunani' },
    },
    lepanto: {
      ram: { name: 'Taji Galai (Sperone)', desc: 'Taji besi menunggangi haluannya dan menghancurkan dayungnya' },
      spikes: { name: 'Pavesade & Tombak Serbu', desc: 'Tombak di balik pavise menanduk penyerbu' },
      fenders: { name: 'Jaring & Kasur', desc: 'Jaring serbu dan kasur di atas rambade' },
    },
    ottoman: {
      ram: { name: 'Taji Kadırga', desc: 'Taji Ottoman mematahkan dayung galai Kristen' },
      spikes: { name: 'Rantai Ganco', desc: 'Ganco pada rantai mengunci siapa pun di samping' },
      fenders: { name: 'Pavisade Bal Wol', desc: 'Bal wol diikat di balik rel' },
    },
    arab: {
      ram: { name: 'Tudung Linggi Jati', desc: 'Linggi jati bertudung untuk menenggelamkan bajak laut' },
      spikes: { name: 'Rak Panci Nafta', desc: 'Panci api tanah liat dirak di rel pecah pada lambung' },
      fenders: { name: 'Fender Tali Sabut', desc: 'Fender sabut kelapa, seperti tali yang menjahit lambung' },
    },
    chola: {
      ram: { name: 'Linggi Bertudung Besi', desc: 'Tudung besi pada linggi besar Coromandel' },
      spikes: { name: 'Rel Duri Besi', desc: 'Duri besi di sepanjang rel untuk prahu' },
      fenders: { name: 'Fender Sabut', desc: 'Fender sabut kelapa di sepanjang sisi' },
    },
    chinese: {
      ram: { name: 'Haluan Ram Mengchong', desc: 'Haluan kapal pendobrak berlapis kulit mentah armada sungai' },
      spikes: { name: 'Rak Tombak Api', desc: 'Tombak api dirak di rel menyemburkan api jarak rapat' },
      fenders: { name: 'Layar Kulit Mentah', desc: 'Kulit mentah basah di atas bangunan atas' },
    },
    vietnam: {
      ram: { name: 'Haluan Pancang Berujung Besi', desc: 'Pancang Bạch Đằng, dipasang ke haluanmu sendiri' },
      spikes: { name: 'Rok Pancang Bambu', desc: 'Bambu runcing di sepanjang garis air' },
      fenders: { name: 'Fender Bundel Bambu', desc: 'Bundelan bambu hijau yang diikat' },
    },
    japanese: {
      ram: { name: 'Haluan Berlapis Besi', desc: 'Kapal besi Nobunaga: haluan berzirah untuk mendobrak' },
      spikes: { name: 'Kait Garu Kumade', desc: 'Garu cakar beruang menyeret siapa pun di samping' },
      fenders: { name: 'Bundel Bambu Takeba', desc: 'Bundel bambu yang menahan panah dan pukulan' },
    },
    korea: {
      ram: { name: 'Ram Kepala Naga', desc: 'Kepala naga — dobrak, dan cekik awaknya dengan asap belerang' },
      spikes: { name: 'Atap Duri Besi Kura-kura', desc: 'Duri besi di atas atap merobek siapa pun yang datang' },
      fenders: { name: 'Baja Lapis Segi Enam', desc: 'Pelat besi di atas lambung dan atap' },
    },
    maori: {
      ram: { name: 'Haluan Ukir Tauihu', desc: 'Patung haluan ukiran, diperkuat untuk menghantam waka' },
      spikes: { name: 'Rel Tombak Taiaha', desc: 'Tombak diratakan di sepanjang rel' },
      fenders: { name: 'Ikatan Tali Rami', desc: 'Ikatan rami harakeke menahan benturan' },
    },
    hawaii: {
      ram: { name: 'Haluan Koa', desc: 'Haluan kayu koa untuk menghantam antara lambung' },
      spikes: { name: 'Rel Gigi Hiu', desc: 'Bilah gigi hiu leiomano di sepanjang rel' },
      fenders: { name: 'Fender Keset Hala', desc: 'Keset pandan anyaman di atas sisi' },
    },
    maya: {
      ram: { name: 'Haluan Kayu Keras', desc: 'Haluan chicozapote untuk mendobrak kano' },
      spikes: { name: 'Rel Tepi Obsidian', desc: 'Bilah obsidian dipasang di rel' },
      fenders: { name: 'Layar Kapas Quilt', desc: 'Baja kapas quilt digantung di sisi' },
    },
    aztec: {
      ram: { name: 'Haluan Cemara', desc: 'Haluan kayu ahuehuete diperkuat untuk mendobrak' },
      spikes: { name: 'Rel Bilah Obsidian', desc: 'Bilah macuahuitl dipasang di rel' },
      fenders: { name: 'Mantel Ichcahuipilli', desc: 'Baja kapas quilt disampirkan di sisi' },
    },
    inca: {
      ram: { name: 'Gelondong Haluan Kayu Keras', desc: 'Gelondong kayu keras berat diikat melintang di haluan' },
      spikes: { name: 'Pagar Galah Ujung Tulang', desc: 'Galah berujung tulang di sepanjang tepi rakit' },
      fenders: { name: 'Bundel Gelagah Totora', desc: 'Bundelan gelagah totora diikat mengelilingi rakit' },
    },
  },
};

const th: FittingsDict = {
  lead: { ram: 'หัว', spikes: 'ข้าง', fenders: 'กัน' },
  tag: { breach: ' · เจาะเธอ', tangle: ' · ทำให้เธอช้า', fire: ' · จุดไฟเธอ', shock: ' · ช็อกลูกเรือเธอ' },
  eras: {
    golden: {
      ram: { name: 'หัวเรือหุ้มเหล็ก', desc: 'ขับหัวหุ้มเหล็กเข้าตัวเรือด้วยความเร็ว' },
      spikes: { name: 'ตะขอที่ราว', desc: 'อะไรขูดข้างโดนเกี่ยว คราด และช้า' },
      fenders: { name: 'ยางเชือกเก่า & ไม้ถ่อ', desc: 'ยางเชือกเก่าและไม้ถ่อยาวกันหัวชนและเรือไฟ' },
    },
    exploration: {
      ram: { name: 'หัวเรือเสริม', desc: 'หัวเรือเสริมพุ่งชนตัวเรือด้วยความเร็ว' },
      spikes: { name: 'เคียวที่คันใบ', desc: 'ใบเคียวบนคันตัดใบเรือคนข้างๆ' },
      fenders: { name: 'หมอนหนังวัว', desc: 'หนังยัดขนแกะแขวนข้างซับแรง' },
    },
    napoleonic: {
      ram: { name: 'หัวเรือทองแดง & เข่าเหล็ก', desc: 'หัวเรือสองชั้นพุ่งทะลุแผ่นด้วยความเร็ว' },
      spikes: { name: 'ตาข่ายกันยึด & หอก', desc: 'ตาข่ายและแนหอกที่ราวทำร้ายผู้ยึด' },
      fenders: { name: 'ยางเชือก & บูม', desc: 'ยางและบูมกันตัวเรืออื่น' },
    },
    barbary: {
      ram: { name: 'หัวเรือหุ้มทองแดง', desc: 'หัวแหลมสกูนเนอร์ เสริมเพื่อชนเรือปืน' },
      spikes: { name: 'ตาข่ายกันยึด & หอก', desc: 'แนวหอกที่ราวสำหรับโจร' },
      fenders: { name: 'ตาข่ายเปล', desc: 'เปลม้วนในตาข่ายราวกันกระสุนและสะเก็ด' },
    },
    viking: {
      ram: { name: 'หัวเรือรัดเหล็ก', desc: 'แถบเหล็กบนหัวสูง — ขี่ขึ้นแล้วร้าวแผ่นเขา' },
      spikes: { name: 'แนวหอกที่ราวโล่', desc: 'หอกระดับระหว่างโล่แทงคนข้างๆ' },
      fenders: { name: 'แผ่นกันโอ๊ค', desc: 'แผ่นโอ๊คหนารับแรงแทนแผ่นเรือ' },
    },
    ironclad: {
      ram: { name: 'หัวชนเหล็กหล่อ', desc: 'ทีเด็ดเวอร์จิเนีย: เจาะเธอใต้แนวน้ำ' },
      spikes: { name: 'ท่อไอน้ำหม้อต้ม', desc: 'ไอน้ำสดท่อสู่ราวลวกผู้ยึด — ลูกเรือแตกกระเจิง' },
      fenders: { name: 'กระโปรงเหล็กราง', desc: 'เหล็กเอียงเหนือแนวน้ำเบี่ยงหัวชนและกระสุน' },
    },
    hanse: {
      ram: { name: 'หัวค็อกก์หุ้มเหล็ก', desc: 'หัวหนักค็อกก์ หุ้มเพื่อชน' },
      spikes: { name: 'ใบเคียวคันใบ', desc: 'ใบมีดบนคันเฉือนใบเรือคนข้างๆ' },
      fenders: { name: 'ยางกระสอบขนแกะ', desc: 'กระสอบขนแกะอังกฤษแขวนข้าง — สินค้าลีกเอง' },
    },
    portugal: {
      ram: { name: 'หัวคาร์แร็ก', desc: 'จงอยใหญ่เสริมเพื่อชนโดว์' },
      spikes: { name: 'ตะขอเคียว', desc: 'ใบเกี่ยวฉีกใบเรือคนข้างๆ' },
      fenders: { name: 'กำแพงก้อนฝ้าย', desc: 'ก้อนฝ้ายอินเดียมัดเอวเรือ' },
    },
    armada: {
      ram: { name: 'จงอยเหล็กแกลลีอัส', desc: 'เดือยเหล็กแกลลีอัสเจาะแผ่นใต้แผ่นกัน' },
      spikes: { name: 'ตาข่ายยึดติดหอก', desc: 'ตาข่ายและหอกเอวเรือทำร้ายผู้ยึด' },
      fenders: { name: 'บูมตะขอเรือไฟ', desc: 'บูมกันเรือไฟกราฟลีน' },
    },
    dutch: {
      ram: { name: 'เข่าหัวโอ๊ค', desc: 'หัวโอ๊คสองชั้นเพื่อชนรางวัล' },
      spikes: { name: 'ราวหอกยึด', desc: 'หอกวางราวแทงผู้ยึด' },
      fenders: { name: 'เสื่อยางป่าน', desc: 'เสื่อป่านหนาทอแขวนข้าง' },
    },
    predread: {
      ram: { name: 'หัวชน', desc: 'เรือประจัญบาน 1905 ทุกลำยังมีหัวชน — ใช้มัน' },
      spikes: { name: 'บูมตาข่ายตอร์ปิโด', desc: 'บูมกางและตาข่ายเหล็กพันคนข้างๆ' },
      fenders: { name: 'แถบเหล็กฮาร์วีย์', desc: 'เหล็กแข็งผิวแนวน้ำ' },
    },
    ww1: {
      ram: { name: 'หัวชนเสริม', desc: 'เรือพิฆาตชนอูโบ๊ต — หัวสร้างมาเพื่อสิ่งนี้' },
      spikes: { name: 'พาราเวนระเบิด', desc: 'ระเบิดลากจากหัวระเบิดใส่ตัวเรือ — ลูกเรือเซ' },
      fenders: { name: 'ตุ่มกันตอร์ปิโด', desc: 'ตัวเรือนอกป่องซับแรงและระเบิด' },
    },
    ww2: {
      ram: { name: 'หัวชนเสริม', desc: 'อย่าง USS Borie กับ U-405: ขี่ขึ้นแล้วบดเธอ' },
      spikes: { name: 'รางระเบิดลึก', desc: 'ระเบิดกลิ้งระยะประชิด — แรงช็อกกระจายลูกเรือเธอ' },
      fenders: { name: 'ที่นอนสะเก็ด', desc: 'เสื่อสะเก็ดคลุมสะพานและป้อม' },
    },
    hormuz: {
      ram: { name: 'แผ่นหัวเสริม', desc: 'หัวหุ้มแผ่นเพื่อชนเรือเร็ว' },
      spikes: { name: 'ชั้นทุ่นสัมผัส', desc: 'ทุ่นวางราวระเบิดใส่ตัวเรือ' },
      fenders: { name: 'แผ่นเกราะเคฟลาร์', desc: 'แผ่นคอมโพสิตคลุมสะพานและแนวน้ำ' },
    },
    falklands: {
      ram: { name: 'หัวเสริมน้ำแข็ง', desc: 'หัวแอตแลนติกใต้ แข็งพอชน' },
      spikes: { name: 'เครื่องยิงแกลบคอร์วัส', desc: 'แกลบและพลุประชิดบังตาลูกเรือเธอ' },
      fenders: { name: 'แผ่นสะเก็ดเคฟลาร์', desc: 'เพิ่มหลังเชฟฟิลด์: เกราะสะเก็ดคลุมจุดสำคัญ' },
    },
    somali: {
      ram: { name: 'แผ่นหัวเหล็กเชื่อม', desc: 'แผ่นเศษเชื่อมที่หัวเรือแม่ — เบียดแล้วยึด' },
      spikes: { name: 'บันไดตะขอ', desc: 'บันไดอลูมิเนียมเกี่ยวราวเธอพันและช้า' },
      fenders: { name: 'ยางยางรถบรรทุก', desc: 'ยางเก่าโซ่ข้างรับแรง' },
    },
    roman: {
      ram: { name: 'หัวชนทองสัมฤทธิ์', desc: 'หัวชนทองสัมฤทธิ์สามครีบ — เจาะเธอใต้แนวน้ำ' },
      spikes: { name: 'สะพานยึดคอร์วุส', desc: 'สะพานหนามหล่นดาดฟ้าเธอและตรึง' },
      fenders: { name: 'แผ่นโอ๊ค', desc: 'แผ่นหนักแนวน้ำรับการชน' },
    },
    greek: {
      ram: { name: 'หัวชนทองสัมฤทธิ์', desc: 'หัวชนซาลามิส: เต็มฝีพายทะลุตัวเรือ' },
      spikes: { name: 'คานเอโพไทดีส', desc: 'คานจากหัวเกี่ยวพายคนข้างๆ' },
      fenders: { name: 'เคเบิลไฮโพโซมาตา', desc: 'เคเบิลรัดตัวเรือยึดเธอเมื่อโดน' },
    },
    macedon: {
      ram: { name: 'หัวชนใหญ่ & โปรเอมโบเลียน', desc: 'หัวชนหลักกับอีกอันบนสำหรับโพลีรีมหนัก' },
      spikes: { name: 'ตะขอมือเหล็ก', desc: 'มือเหล็กบนโซ่คว้าคนข้างๆ' },
      fenders: { name: 'แผ่นคู่ & ม่านหนัง', desc: 'แผ่นคู่และหนังคลุมห้องพาย' },
    },
    phoenicia: {
      ram: { name: 'หัวชนจมูกหมูทองสัมฤทธิ์', desc: 'หัวชนแหลมแกลลีย์ซีดาร์ไทร์' },
      spikes: { name: 'ราวแขวนโล่', desc: 'โล่และปลายหอกแขวนที่ราว' },
      fenders: { name: 'แผ่นซีดาร์', desc: 'แผ่นซีดาร์เลบานอนแนวน้ำ' },
    },
    egypt: {
      ram: { name: 'คานหัวสิงห์', desc: 'หัวสิงห์เมดิเนตฮาบู เสริมรับแรง' },
      spikes: { name: 'ตะขอเสา', desc: 'ตะขอบนเสาลากโจรเข้าข้างและยึด' },
      fenders: { name: 'กำแพงมัดปาปิรุส', desc: 'ม่านปาปิรุสมัดที่ราว' },
    },
    byzantium: {
      ram: { name: 'จงอยเดือย', desc: 'เดือยโดรโมนขี่ขึ้นหักพายเธอ' },
      spikes: { name: 'ราวไฟไซฟอนมือ', desc: 'ไซฟอนมือที่ราวพ่นไฟใส่คนข้างๆ' },
      fenders: { name: 'สักหลาดแช่น้ำส้ม', desc: 'สักหลาดแช่น้ำส้ม — กันกรีกไฟแบบเก่า' },
    },
    lepanto: {
      ram: { name: 'เดือยแกลลีย์ (สเปโรเน)', desc: 'เดือยเหล็กขี่หัวเธอทุบพาย' },
      spikes: { name: 'ปาเวซาด & หอกยึด', desc: 'หอกหลังโล่แทงผู้ยึด' },
      fenders: { name: 'ตาข่าย & ที่นอน', desc: 'ตาข่ายยึดและที่นอนคลุมแรมเบด' },
    },
    ottoman: {
      ram: { name: 'เดือยกาดีร์กา', desc: 'เดือยออตโตมันหักพายแกลลีย์คริสเตียน' },
      spikes: { name: 'โซ่ตะขอ', desc: 'ตะขอบนโซ่ล็อกคนข้างๆ' },
      fenders: { name: 'กำแพงก้อนขนแกะ', desc: 'ก้อนขนแกะมัดหลังราว' },
    },
    arab: {
      ram: { name: 'ฝาหัวไม้สัก', desc: 'หัวไม้สักมีฝาเพื่อชนโจร' },
      spikes: { name: 'ชั้นหม้อแนฟทา', desc: 'หม้อไฟดินวางราวแตกใส่ตัวเรือ' },
      fenders: { name: 'ยางเชือกมะพร้าว', desc: 'ยางใยมะพร้าว เหมือนเชือกเย็บเรือ' },
    },
    chola: {
      ram: { name: 'หัวหุ้มเหล็ก', desc: 'ฝาเหล็กบนหัวใหญ่โคโรมันเดล' },
      spikes: { name: 'ราวหนามเหล็ก', desc: 'หนามเหล็กที่ราวสำหรับปราว' },
      fenders: { name: 'ยางใยมะพร้าว', desc: 'ยางใยมะพร้าวข้างเรือ' },
    },
    chinese: {
      ram: { name: 'หัวชนเหมิงชง', desc: 'หัวเรือชนหุ้มหนังดิบของกองเรือแม่น้ำ' },
      spikes: { name: 'ชั้นหอกไฟ', desc: 'หอกไฟวางราวพ่นไฟประชิด' },
      fenders: { name: 'ม่านหนังดิบ', desc: 'หนังดิบเปียกคลุมส่วนบน' },
    },
    vietnam: {
      ram: { name: 'หัวหลักปลายเหล็ก', desc: 'หลักบักดั่ง ติดที่หัวตัวเอง' },
      spikes: { name: 'กระโปรงหลักไม้ไผ่', desc: 'ไม้ไผ่เหลาแนวน้ำ' },
      fenders: { name: 'ยางมัดไม้ไผ่', desc: 'มัดไม้ไผ่เขียวมัด' },
    },
    japanese: {
      ram: { name: 'หัวหุ้มเหล็ก', desc: 'เรือเหล็กโนบุนากะ: หัวเกราะเพื่อชน' },
      spikes: { name: 'ตะขอคราดคุมาเดะ', desc: 'คราดกรงเล็บหมีลากคนข้างๆ' },
      fenders: { name: 'มัดไม้ไผ่ทาเกบะ', desc: 'มัดไม้ไผ่กันธนูและแรง' },
    },
    korea: {
      ram: { name: 'หัวชนหัวมังกร', desc: 'หัวมังกร — ชน และสำลักลูกเรือเธอด้วยควันกำมะถัน' },
      spikes: { name: 'หลังคาหนามเหล็กเต่า', desc: 'หนามเหล็กบนหลังคาฉีกคนเข้าใกล้' },
      fenders: { name: 'เกราะแผ่นหกเหลี่ยม', desc: 'แผ่นเหล็กคลุมตัวเรือและหลังคา' },
    },
    maori: {
      ram: { name: 'หัวแกะเตาอิฮู', desc: 'หัวแกะสลัก เสริมเพื่อชนวากา' },
      spikes: { name: 'ราวหอกไทอาฮา', desc: 'หอกระดับที่ราว' },
      fenders: { name: 'เชือกป่าน', desc: 'เชือกป่านฮาราเกเกรับแรง' },
    },
    hawaii: {
      ram: { name: 'หัวโคอา', desc: 'หัวไม้โคอาเพื่อชนระหว่างตัวเรือ' },
      spikes: { name: 'ราวฟันฉลาม', desc: 'ใบฟันฉลามเลโอมาโนที่ราว' },
      fenders: { name: 'ยางเสื่อฮาลา', desc: 'เสื่อเตยถักคลุมข้าง' },
    },
    maya: {
      ram: { name: 'หัวไม้เนื้อแข็ง', desc: 'หัวชิโกซาโพเตเพื่อชนแคนู' },
      spikes: { name: 'ราวคมออบซิเดียน', desc: 'ใบออบซิเดียนติดที่ราว' },
      fenders: { name: 'ม่านฝ้ายควิลต์', desc: 'เกราะฝ้ายควิลต์แขวนข้าง' },
    },
    aztec: {
      ram: { name: 'หัวไซเปรส', desc: 'หัวไม้อาฮูอาฮูเอเตเสริมเพื่อชน' },
      spikes: { name: 'ราวใบออบซิเดียน', desc: 'ใบมากัวฮูอิตล์ติดที่ราว' },
      fenders: { name: 'ผ้าคลุมอิชกาวีปิลลี', desc: 'เกราะฝ้ายควิลต์พาดข้าง' },
    },
    inca: {
      ram: { name: 'ท่อนหัวไม้เนื้อแข็ง', desc: 'ท่อนไม้เนื้อแข็งหนักมัดขวางที่หัว' },
      spikes: { name: 'รั้วเสาปลายกระดูก', desc: 'เสาปลายกระดูกขอบแพ' },
      fenders: { name: 'มัดกกโตโตรา', desc: 'มัดกกโตโตรามัดรอบแพ' },
    },
  },
};

const vi: FittingsDict = {
  lead: { ram: 'Mũi', spikes: 'Mạn', fenders: 'Chắn' },
  tag: { breach: ' · chọc thủng nàng', tangle: ' · làm chậm nàng', fire: ' · đốt cháy nàng', shock: ' · choáng thủy thủ nàng' },
  eras: {
    golden: {
      ram: { name: 'Trụ Mũi Bọc Sắt', desc: 'Lao trụ mũi bọc sắt vào thân địch tốc độ cao' },
      spikes: { name: 'Móc Neo Ở Lan Can', desc: 'Thứ gì cạ mạn đều bị móc, cào, chậm lại' },
      fenders: { name: 'Đệm Thừng Cũ & Sào Chống', desc: 'Đệm thừng cũ và sào dài chặn mũi đâm và tàu lửa' },
    },
    exploration: {
      ram: { name: 'Mỏ Tàu Gia Cố', desc: 'Mỏ tàu gia cố đâm thân tàu tốc độ cao' },
      spikes: { name: 'Lưỡi Hái Ở Sào Buồm', desc: 'Lưỡi hái trên sào cắt dây buồm kẻ cặp mạn' },
      fenders: { name: 'Đệm Da Bò', desc: 'Da nhồi len treo mạn hút xung kích' },
    },
    napoleonic: {
      ram: { name: 'Trụ Mũi Đồng & Gối Sắt', desc: 'Trụ mũi kép đâm vỡ ván tốc độ cao' },
      spikes: { name: 'Lưới Chống Xung Kích & Giáo', desc: 'Lưới và hàng giáo ở lan can đả thương quân xung kích' },
      fenders: { name: 'Đệm Thừng & Sào', desc: 'Đệm và sào chống đẩy thân khác ra' },
    },
    barbary: {
      ram: { name: 'Mũi Bọc Đồng', desc: 'Mũi nhọn schooner, gia cố để đâm tàu pháo' },
      spikes: { name: 'Lưới Chống Xung Kích & Giáo', desc: 'Hàng giáo ở lan can dành cho cướp biển' },
      fenders: { name: 'Lưới Võng', desc: 'Võng cuộn trong lưới lan can chặn đạn và mảnh' },
    },
    viking: {
      ram: { name: 'Trụ Mũi Đai Sắt', desc: 'Đai sắt trên trụ cao — cưỡi lên nứt ván địch' },
      spikes: { name: 'Hàng Giáo Ở Lan Can Khiên', desc: 'Giáo ngang giữa các khiên đâm kẻ cặp mạn' },
      fenders: { name: 'Nẹp Gỗ Sồi', desc: 'Nẹp sồi dày chịu đòn thay ván thân' },
    },
    ironclad: {
      ram: { name: 'Mũi Đâm Gang Đúc', desc: 'Chiêu của Virginia: chọc thủng dưới mớn nước' },
      spikes: { name: 'Ống Hơi Nồi Hơi', desc: 'Hơi sống dẫn ra lan can luộc quân xung kích — thủy thủ tán loạn' },
      fenders: { name: 'Váy Sắt Ray', desc: 'Sắt nghiêng trên mớn nước đỡ mũi đâm và đạn' },
    },
    hanse: {
      ram: { name: 'Mũi Cog Bọc Sắt', desc: 'Mũi nặng của cog, bọc để đâm' },
      spikes: { name: 'Lưỡi Hái Sào Buồm', desc: 'Lưỡi trên sào phạt dây buồm kẻ cặp mạn' },
      fenders: { name: 'Đệm Bao Len', desc: 'Bao len Anh treo mạn — hàng của Liên minh' },
    },
    portugal: {
      ram: { name: 'Mỏ Carrack', desc: 'Mỏ lớn gia cố để đâm dhow' },
      spikes: { name: 'Móc Hái', desc: 'Lưỡi móc xé dây buồm kẻ cặp mạn' },
      fenders: { name: 'Tường Kiện Bông', desc: 'Kiện bông Ấn Độ buộc dọc mạn' },
    },
    armada: {
      ram: { name: 'Mỏ Sắt Galeas', desc: 'Cựa sắt galeas chọc ván dưới nẹp' },
      spikes: { name: 'Lưới Xung Kích Gắn Giáo', desc: 'Lưới và giáo dọc mạn đả thương quân xung kích' },
      fenders: { name: 'Sào Móc Chống Tàu Lửa', desc: 'Sào chống tàu lửa Gravelines' },
    },
    dutch: {
      ram: { name: 'Gối Mũi Sồi', desc: 'Trụ sồi kép để đâm tàu mồi' },
      spikes: { name: 'Giá Giáo Lan Can', desc: 'Giáo xếp dọc lan can đâm quân xung kích' },
      fenders: { name: 'Chiếu Đệm Gai', desc: 'Chiếu gai dày đan treo mạn' },
    },
    predread: {
      ram: { name: 'Mũi Đâm', desc: 'Mọi thiết giáp hạm 1905 đều còn mũi đâm — dùng đi' },
      spikes: { name: 'Sào Lưới Chống Ngư Lôi', desc: 'Sào giương và lưới thép vướng kẻ cặp mạn' },
      fenders: { name: 'Đai Thép Harvey', desc: 'Thép cứng mặt dọc mớn nước' },
    },
    ww1: {
      ram: { name: 'Mũi Đâm Gia Cố', desc: 'Khu trục hạm từng đâm U-boat — mũi đóng để làm việc ấy' },
      spikes: { name: 'Phao Phá Lôi Nổ', desc: 'Thuốc nổ kéo từ mũi nổ vào thân — thủy thủ choáng váng' },
      fenders: { name: 'Bướu Chống Ngư Lôi', desc: 'Thân ngoài phồng hút xung kích và nổ' },
    },
    ww2: {
      ram: { name: 'Trụ Đâm Gia Cố', desc: 'Như USS Borie đấu U-405: cưỡi lên nghiền nát nàng' },
      spikes: { name: 'Ray Bom Chìm', desc: 'Bom lăn cự ly gần — chấn động tán thủy thủ nàng' },
      fenders: { name: 'Đệm Chống Mảnh', desc: 'Chiếu chống mảnh phủ buồng lái và bệ pháo' },
    },
    hormuz: {
      ram: { name: 'Tôn Mũi Gia Cố', desc: 'Mũi bọc tôn để đâm xuồng nhanh' },
      spikes: { name: 'Giá Lôi Chạm Nổ', desc: 'Lôi xếp lan can nổ vào thân' },
      fenders: { name: 'Tấm Giáp Kevlar', desc: 'Tấm composite phủ buồng lái và mớn nước' },
    },
    falklands: {
      ram: { name: 'Mũi Gia Cố Băng', desc: 'Mũi Nam Đại Tây Dương, đủ cứng để đâm' },
      spikes: { name: 'Máy Phóng Chaff Corvus', desc: 'Chaff và pháo sáng cự ly gần làm mù thủy thủ nàng' },
      fenders: { name: 'Tấm Chống Mảnh Kevlar', desc: 'Thêm sau Sheffield: giáp chống mảnh phủ chỗ hiểm' },
    },
    somali: {
      ram: { name: 'Tôn Mũi Thép Hàn', desc: 'Tôn phế hàn vào mũi tàu mẹ — cạ rồi xung kích' },
      spikes: { name: 'Thang Móc', desc: 'Thang nhôm móc lan can nàng vướng và chậm' },
      fenders: { name: 'Đệm Lốp Xe Tải', desc: 'Lốp cũ xích dọc mạn chịu va' },
    },
    roman: {
      ram: { name: 'Mũi Đâm Đồng', desc: 'Mũi đồng ba vây — chọc thủng dưới mớn nước' },
      spikes: { name: 'Cầu Xung Kích Corvus', desc: 'Cầu đinh sập boong nàng ghim chặt' },
      fenders: { name: 'Nẹp Sồi', desc: 'Nẹp nặng mớn nước chịu đâm' },
    },
    greek: {
      ram: { name: 'Mũi Đâm Đồng', desc: 'Mũi Salamis: hết tay chèo đâm vỡ thân' },
      spikes: { name: 'Dầm Epotides', desc: 'Dầm từ mũi phạt chèo kẻ cặp mạn' },
      fenders: { name: 'Cáp Đai Hypozomata', desc: 'Cáp đai thân giữ nàng khi trúng đạn' },
    },
    macedon: {
      ram: { name: 'Mũi Đâm Lớn & Proembolion', desc: 'Mũi chính thêm một trên cho tàu nhiều tầng nặng' },
      spikes: { name: 'Móc Tay Sắt', desc: 'Tay sắt trên xích chộp kẻ cặp mạn' },
      fenders: { name: 'Nẹp Kép & Màn Da', desc: 'Nẹp kép và da phủ buồng chèo' },
    },
    phoenicia: {
      ram: { name: 'Mũi Đâm Mõm Lợn Đồng', desc: 'Mũi nhọn của thuyền tuyết tùng Tyre' },
      spikes: { name: 'Lan Can Treo Khiên', desc: 'Khiên và mũi giáo treo lan can' },
      fenders: { name: 'Nẹp Tuyết Tùng', desc: 'Nẹp tuyết tùng Lebanon mớn nước' },
    },
    egypt: {
      ram: { name: 'Dầm Mũi Đầu Sư Tử', desc: 'Mũi đầu sư tử Medinet Habu, gia cố chịu va' },
      spikes: { name: 'Móc Sào', desc: 'Móc trên sào lôi kẻ cướp cặp mạn giữ chặt' },
      fenders: { name: 'Tường Bó Cói Giấy', desc: 'Màn cói giấy bó dọc lan can' },
    },
    byzantium: {
      ram: { name: 'Mỏ Cựa', desc: 'Cựa dromon cưỡi lên bẻ chèo nàng' },
      spikes: { name: 'Lan Can Phun Tay', desc: 'Ống phun tay ở lan can phun lửa kẻ cặp mạn' },
      fenders: { name: 'Nỉ Ngâm Giấm', desc: 'Nỉ ngâm giấm — cách cổ chống lửa Hy Lạp' },
    },
    lepanto: {
      ram: { name: 'Cựa Thuyền Chèo (Sperone)', desc: 'Cựa sắt cưỡi mũi nàng đập gãy chèo' },
      spikes: { name: 'Khiên Pavesade & Giáo Xung Kích', desc: 'Giáo sau khiên đâm quân xung kích' },
      fenders: { name: 'Lưới & Đệm', desc: 'Lưới xung kích và đệm phủ rambade' },
    },
    ottoman: {
      ram: { name: 'Cựa Kadırga', desc: 'Cựa Ottoman bẻ chèo thuyền chèo Thiên Chúa' },
      spikes: { name: 'Xích Móc', desc: 'Móc trên xích khóa kẻ cặp mạn' },
      fenders: { name: 'Tường Kiện Len', desc: 'Kiện len buộc sau lan can' },
    },
    arab: {
      ram: { name: 'Mũ Mũi Gỗ Tếch', desc: 'Mũi tếch đội mũ để đâm cướp biển' },
      spikes: { name: 'Giá Bình Naphtha', desc: 'Bình lửa đất nung xếp lan can vỡ vào thân' },
      fenders: { name: 'Đệm Thừng Xơ Dừa', desc: 'Đệm xơ dừa, như thừng khâu thân' },
    },
    chola: {
      ram: { name: 'Mũi Đội Sắt', desc: 'Mũ sắt trên mũi lớn Coromandel' },
      spikes: { name: 'Lan Can Gai Sắt', desc: 'Gai sắt dọc lan can trị prahu' },
      fenders: { name: 'Đệm Xơ Dừa', desc: 'Đệm xơ dừa dọc mạn' },
    },
    chinese: {
      ram: { name: 'Mũi Đâm Mông Xung', desc: 'Mũi tàu đâm bọc da sống của thủy quân sông' },
      spikes: { name: 'Giá Hỏa Thương', desc: 'Hỏa thương xếp lan can phun lửa cự ly gần' },
      fenders: { name: 'Màn Da Sống', desc: 'Da sống ướt phủ thượng tầng' },
    },
    vietnam: {
      ram: { name: 'Mũi Cọc Đầu Sắt', desc: 'Cọc Bạch Đằng, gắn vào mũi nhà' },
      spikes: { name: 'Váy Cọc Tre', desc: 'Tre vót dọc mớn nước' },
      fenders: { name: 'Đệm Bó Tre', desc: 'Bó tre xanh buộc chặt' },
    },
    japanese: {
      ram: { name: 'Mũi Bọc Sắt', desc: 'Tàu sắt của Nobunaga: mũi giáp để đâm' },
      spikes: { name: 'Móc Cào Kumade', desc: 'Cào vuốt gấu lôi kẻ cặp mạn' },
      fenders: { name: 'Bó Tre Takeba', desc: 'Bó tre đỡ tên và đòn' },
    },
    korea: {
      ram: { name: 'Mũi Đâm Đầu Rồng', desc: 'Đầu rồng — đâm, và sặc thủy thủ nàng bằng khói lưu huỳnh' },
      spikes: { name: 'Mái Gai Sắt Rùa', desc: 'Gai sắt trên mái xé kẻ áp sát' },
      fenders: { name: 'Giáp Tấm Lục Giác', desc: 'Tấm sắt phủ thân và mái' },
    },
    maori: {
      ram: { name: 'Mũi Chạm Tauihu', desc: 'Tượng mũi chạm, gia cố để đâm waka' },
      spikes: { name: 'Lan Can Giáo Taiaha', desc: 'Giáo ngang dọc lan can' },
      fenders: { name: 'Dây Buộc Lanh', desc: 'Dây lanh harakeke chịu va' },
    },
    hawaii: {
      ram: { name: 'Mũi Gỗ Koa', desc: 'Mũi gỗ koa để đâm giữa các thân' },
      spikes: { name: 'Lan Can Răng Cá Mập', desc: 'Lưỡi răng cá mập leiomano dọc lan can' },
      fenders: { name: 'Đệm Chiếu Hala', desc: 'Chiếu dứa dệt phủ mạn' },
    },
    maya: {
      ram: { name: 'Mũi Gỗ Cứng', desc: 'Mũi gỗ chicozapote để đâm xuồng' },
      spikes: { name: 'Lan Can Lưỡi Obsidian', desc: 'Lưỡi obsidian gắn lan can' },
      fenders: { name: 'Màn Bông Chần', desc: 'Giáp bông chần treo mạn' },
    },
    aztec: {
      ram: { name: 'Mũi Bách', desc: 'Mũi gỗ ahuehuete gia cố để đâm' },
      spikes: { name: 'Lan Can Lưỡi Obsidian', desc: 'Lưỡi macuahuitl gắn lan can' },
      fenders: { name: 'Áo Ichcahuipilli', desc: 'Giáp bông chần choàng mạn' },
    },
    inca: {
      ram: { name: 'Cây Ngang Mũi Gỗ Cứng', desc: 'Khúc gỗ cứng nặng buộc ngang mũi' },
      spikes: { name: 'Hàng Sào Đầu Xương', desc: 'Sào đầu xương quanh mép bè' },
      fenders: { name: 'Bó Sậy Totora', desc: 'Bó sậy totora buộc quanh bè' },
    },
  },
};

export const fittings: Dict<FittingsDict> = { en, es, fr, de, nl, pt, ja, zh, id, th, vi };
