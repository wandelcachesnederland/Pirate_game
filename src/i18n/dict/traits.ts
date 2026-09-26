/** Era traits: each age's signature mechanic (name, pitch, hint). */
import type { Dict } from './meta';

const en = {
  golden: {
    name: 'False Colours & Bounty',
    pitch: 'Fly false colours until the first shot — your bounty fattens every prize.',
    hint: 'Hold fire to stay unseen; sink navy hulls to raise your bounty.',
  },
  exploration: {
    name: 'Uncharted Waters',
    pitch: 'Fog hides the chart — sail to each island to chart it for gold.',
    hint: 'Chart islands for gold, and keep fruit in the holds against scurvy.',
  },
  napoleonic: {
    name: 'The Weather Gauge',
    pitch: 'The upwind ship shoots harder — tack for the gauge, then signal.',
    hint: 'Fight from upwind for +25% shot; a signal buffs every wave.',
  },
  barbary: {
    name: 'Tribute or War',
    pitch: 'Hail traders (F) to demand tribute — gold with no fight.',
    hint: 'Press F near a trader to demand tribute. Payers you spare pay again.',
  },
  viking: {
    name: 'Strandhögg',
    pitch: 'Beach on a wild shore to raid it — shove off before the war party.',
    hint: 'Drift slow onto a shore to raid; press sail (W) to shove off.',
  },
  ironclad: {
    name: 'Iron Angles',
    pitch: 'Sloped armour shrugs off shot from ahead; mines drift the channels.',
    hint: 'Charge bow-on: half damage from ahead. Mind the drifting mines.',
  },
  ww1: {
    name: 'U-Boats & Hydrophones',
    pitch: 'U-boats run submerged — the hydrophone ping finds them; ram them.',
    hint: 'Watch for the ping: revealed boats surface to attack. Ram them.',
  },
  ww2: {
    name: 'Night Actions',
    pitch: 'Every even wave is fought at night by star shell — for danger pay.',
    hint: 'At night the enemy shoots half as far. Close in and earn the bonus.',
  },
  hormuz: {
    name: 'Missile Lock',
    pitch: 'Incoming missiles shriek a lock tone — turn hard to break the lock.',
    hint: 'LOCK tone? Turn hard across the missile. Spare the neutral tankers.',
  },
  roman: {
    name: 'The Corvus',
    pitch: 'Touch an enemy and the spiked bridge drops — board her at once.',
    hint: 'Ram alongside: grappled foes slow, and prizes board themselves.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Row clean through the enemy line to shock her crew senseless.',
    hint: 'Pass fast along an enemy hull side-to-side to shock her reload.',
  },
  arab: {
    name: 'Ride the Monsoon',
    pitch: 'The monsoon reverses on a calendar — lateen hulls fly downwind.',
    hint: 'Sail with the monsoon (+speed); ambush the downwind trade lanes.',
  },
  chinese: {
    name: 'Floating Fortress',
    pitch: 'Anchor (T or bare poles) into a fortress — or hail tribute ships.',
    hint: 'T: anchor for +damage. F near a trader: tribute pact over loot.',
  },
  japanese: {
    name: 'Grapples & Teppo',
    pitch: 'Foes grapple and drag you — answer with the teppo bow volley (T).',
    hint: 'T: teppo volley ahead. Kill grapplers fast or be dragged down.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Every sinking names avengers — kill the marked to stack Mana.',
    hint: 'Marked kin hunt you; killing them stacks Mana (damage) — keep feeding it.',
  },
  hawaii: {
    name: 'Unify the Islands',
    pitch: 'Beat each island’s canoes to vassalize it for per-wave tribute.',
    hint: 'Sink 3 boats of one island to vassalize it. Unify them all.',
  },
  macedon: {
    name: 'Siege Tower Afloat',
    pitch: 'Siege catapults outrange everything — but the mosquitoes swarm.',
    hint: 'Your range is vast; small fry die on your hull. Keep turning.',
  },
  maya: {
    name: 'Reef Guerrilla',
    pitch: 'Spanish keels bleed on the reef; your canoes pass free.',
    hint: 'Fight inside the reef ring. Hail the first stranger for a gift.',
  },
  inca: {
    name: 'Humboldt & Spondylus',
    pitch: 'Ride the current lanes; dive the shell beds for gold.',
    hint: 'Currents push all hulls. Linger slow over pink beds to dive.',
  },
  lepanto: {
    name: 'The Grand Melee',
    pitch: 'No end to boarding in the melee — chain prize to prize.',
    hint: 'Boarding reach is long; every prize rows freed men to your crew.',
  },
  korea: {
    name: 'The Myeongnyang Tide',
    pitch: 'The strait current reverses — your turtle ship barely feels it.',
    hint: 'Lure light foes into the tide; it sweeps them onto rocks and guns.',
  },
  byzantium: {
    name: 'Chain & Burning Sea',
    pitch: 'The chain funnels the foe to one gap; Greek fire drifts and spreads.',
    hint: 'Hold the chain gap; your slicks drift with the wind and linger.',
  },
  egypt: {
    name: 'Pharaoh’s Shore Archers',
    pitch: 'Friendly shores loose volleys for you; reeds hide ambushers.',
    hint: 'Fight near friendly shores for archer support. Sweep the reeds.',
  },
  chola: {
    name: 'Across the Bay',
    pitch: 'Far from home: double supply drain, double temple gold, monsoon storms.',
    hint: 'Stores burn twice as fast — but jackpots pay twice as much.',
  },
  vietnam: {
    name: 'Stakes of Bạch Đằng',
    pitch: 'At low tide the stake barrages bare their teeth for deep keels.',
    hint: 'Watch the tide clock: bait deep hulls over the stakes at LOW tide.',
  },
  aztec: {
    name: 'Causeways of Texcoco',
    pitch: 'A maze of causeways — canoes slip the gaps brigantines cannot.',
    hint: 'Fight from the gaps; deep Spanish hulls ground and crawl.',
  },
  phoenicia: {
    name: 'The Purple Run',
    pitch: 'Carry cargo between friendly harbours for wave-scaling profit.',
    hint: 'Touch a friendly fort to load, another to sell. Spare your partners.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Hail convoy traders (F) for the League toll — or fight them all.',
    hint: 'F near a trader: demand the toll. Refusers call the whole convoy.',
  },
  portugal: {
    name: 'Monsoon & Feitoria',
    pitch: 'The wind reverses every 3 waves; feitoria forts mend and feed you.',
    hint: 'Mind the monsoon calendar; linger by friendly forts to recover.',
  },
  armada: {
    name: 'Gales & Fire Ships',
    pitch: 'Gales scatter every formation; the crescent guards its treasure.',
    hint: 'Gales push all hulls downwind. Crack the crescent for the jackpot.',
  },
  dutch: {
    name: 'Shifting Sands',
    pitch: 'Sandbanks drift across the Texel and ground deep English keels.',
    hint: 'Your shallow hull skims the banks — lure deep hunters onto them.',
  },
  ottoman: {
    name: 'Oar-Sprint',
    pitch: 'Sprint (T) into the ram — boarded galleys row freed men to you.',
    hint: 'T: sprint burst, then exhausted oars. Board for hands, not gold.',
  },
  predread: {
    name: 'Cross the T',
    pitch: 'Rake bows and sterns; hold one target to bracket the range.',
    hint: 'Fire into bow/stern for +50%. Stay on one victim to aim truer.',
  },
  falklands: {
    name: 'Air Raid Warning',
    pitch: 'Exocets streak in from off-screen — comb the wake or be hit.',
    hint: 'Raid arrow? Turn into it and keep moving. Chaff fittings help.',
  },
  somali: {
    name: 'Hijack & Ransom',
    pitch: 'Boarded merchants become hostages — the ransom ticks up while you hold.',
    hint: 'Board traders, then survive: the ransom grows every second.',
  },
};

export type TraitsDict = typeof en;

const es: TraitsDict = {
  golden: {
    name: 'Falsa bandera y recompensa',
    pitch: 'Navega con falsa bandera hasta el primer disparo — tu recompensa engorda cada presa.',
    hint: 'No dispares para pasar desapercibido; hunde cascos de la armada para subir tu recompensa.',
  },
  exploration: {
    name: 'Aguas ignotas',
    pitch: 'La niebla oculta la carta — navega a cada isla para cartografiarla por oro.',
    hint: 'Cartografía islas por oro y guarda fruta contra el escorbuto.',
  },
  napoleonic: {
    name: 'El barlovento',
    pitch: 'El barco de barlovento dispara más fuerte — ciñe el barlovento y señaliza.',
    hint: 'Lucha desde barlovento: +25% disparo; una señal potencia cada oleada.',
  },
  barbary: {
    name: 'Tributo o guerra',
    pitch: 'Saluda mercantes (F) para exigir tributo — oro sin lucha.',
    hint: 'Pulsa F junto a un mercante para exigir tributo. Quien paga y vive, repite.',
  },
  viking: {
    name: 'Strandhögg',
    pitch: 'Vara en costa salvaje para saquearla — despega antes de la partida de guerra.',
    hint: 'Deriva lento a la orilla para saquear; pulsa vela (W) para despegar.',
  },
  ironclad: {
    name: 'Ángulos de hierro',
    pitch: 'La coraza inclinada rechaza disparos de proa; minas derivan por los canales.',
    hint: 'Carga de proa: mitad de daño frontal. Ojo con las minas a la deriva.',
  },
  ww1: {
    name: 'Submarinos e hidrófonos',
    pitch: 'Los U-Boot navegan sumergidos — el ping los delata; embístelos.',
    hint: 'Atento al ping: los delatados emergen a atacar. Embístelos.',
  },
  ww2: {
    name: 'Acciones nocturnas',
    pitch: 'Cada oleada par se lucha de noche a la luz de bengalas — con paga de peligro.',
    hint: 'De noche el enemigo dispara a mitad de alcance. Acércate y cobra el extra.',
  },
  hormuz: {
    name: 'Fijación de misil',
    pitch: 'Los misiles chillan tono de fijación — vira fuerte para romperla.',
    hint: '¿Tono de FIJACIÓN? Vira fuerte cruzando el misil. Perdona petroleros neutrales.',
  },
  roman: {
    name: 'El corvus',
    pitch: 'Toca un enemigo y cae el puente de púas — abórdalo al instante.',
    hint: 'Embiste al costado: los agarrados frenan y las presas se abordan solas.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Cruza remando la línea enemiga para atolondrar su tripulación.',
    hint: 'Pasa rápido de costado junto a un casco para atolondrar su recarga.',
  },
  arab: {
    name: 'Cabalga el monzón',
    pitch: 'El monzón invierte por calendario — los latinos vuelan en popa.',
    hint: 'Navega con el monzón (+velocidad); embosca las rutas de sotavento.',
  },
  chinese: {
    name: 'Fortaleza flotante',
    pitch: 'Fondea (T o palos desnudos) hecho fortaleza — o saluda barcos de tributo.',
    hint: 'T: fondea para +daño. F junto a mercante: pacto de tributo mejor que botín.',
  },
  japanese: {
    name: 'Garfas y teppo',
    pitch: 'Los enemigos te agarran y arrastran — responde con descarga teppo (T).',
    hint: 'T: descarga teppo a proa. Mata agarradores rápido o te hundirán.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Cada hundimiento nombra vengadores — mata marcados para apilar Maná.',
    hint: 'Los marcados te cazan; matarlos apila Maná (daño) — sigue alimentándolo.',
  },
  hawaii: {
    name: 'Unifica las islas',
    pitch: 'Bate las canoas de cada isla para vasallizarla por tributo por oleada.',
    hint: 'Hunde 3 botes de una isla para vasallizarla. Unifícalas todas.',
  },
  macedon: {
    name: 'Torre de asedio flotante',
    pitch: 'Las catapultas superan todo alcance — pero los mosquitos pululan.',
    hint: 'Tu alcance es vasto; la morralla muere en tu casco. Sigue virando.',
  },
  maya: {
    name: 'Guerrilla del arrecife',
    pitch: 'Las quillas españolas sangran en el arrecife; tus canoas pasan libres.',
    hint: 'Lucha dentro del anillo. Saluda al primer extraño por un regalo.',
  },
  inca: {
    name: 'Humboldt y spondylus',
    pitch: 'Cabalga las vías de corriente; bucea los bancos de concha por oro.',
    hint: 'Las corrientes empujan todos los cascos. Merodea lento sobre bancos rosas.',
  },
  lepanto: {
    name: 'La gran refriega',
    pitch: 'Sin fin de abordajes en la refriega — encadena presa tras presa.',
    hint: 'El alcance de abordaje es largo; cada presa rema libertos a tu tripulación.',
  },
  korea: {
    name: 'La marea de Myeongnyang',
    pitch: 'La corriente del estrecho invierte — tu barco tortuga apenas la nota.',
    hint: 'Atrae enemigos ligeros a la marea; los barre a rocas y cañones.',
  },
  byzantium: {
    name: 'Cadena y mar ardiente',
    pitch: 'La cadena embuda al enemigo a un paso; el fuego griego deriva y se extiende.',
    hint: 'Guarda el paso; tus manchas derivan con el viento y perduran.',
  },
  egypt: {
    name: 'Arqueros costeros del faraón',
    pitch: 'Costas amigas descargan por ti; los juncos ocultan emboscados.',
    hint: 'Lucha junto a costas amigas por apoyo arquero. Barre los juncos.',
  },
  chola: {
    name: 'Al otro lado de la bahía',
    pitch: 'Lejos de casa: doble gasto de víveres, doble oro de templo, tormentas monzónicas.',
    hint: 'Las reservas arden al doble — pero los premios pagan el doble.',
  },
  vietnam: {
    name: 'Estacas de Bạch Đằng',
    pitch: 'En bajamar las estacadas enseñan dientes a las quillas profundas.',
    hint: 'Mira el reloj de marea: atrae cascos profundos a las estacas en BAJA.',
  },
  aztec: {
    name: 'Calzadas de Texcoco',
    pitch: 'Laberinto de calzadas — las canoas pasan huecos que los bergantines no.',
    hint: 'Lucha desde los huecos; los cascos españoles profundos embarrancan.',
  },
  phoenicia: {
    name: 'La ruta púrpura',
    pitch: 'Lleva carga entre puertos amigos por beneficio que crece por oleada.',
    hint: 'Toca un fuerte amigo para cargar, otro para vender. Perdona socios.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Saluda mercantes de convoy (F) por el peaje de la Liga — o lucha con todos.',
    hint: 'F junto a mercante: exige el peaje. Quien se niega llama al convoy.',
  },
  portugal: {
    name: 'Monzón y feitoria',
    pitch: 'El viento invierte cada 3 oleadas; las feitorias te reparan y alimentan.',
    hint: 'Atento al calendario monzónico; merodea junto a fuertes amigos.',
  },
  armada: {
    name: 'Galernas y brulotes',
    pitch: 'Las galernas dispersan toda formación; la medialuna guarda su tesoro.',
    hint: 'Las galernas empujan a sotavento. Rompe la medialuna por el premio.',
  },
  dutch: {
    name: 'Arenas movedizas',
    pitch: 'Bancos de arena derivan por el Texel y varan quillas inglesas profundas.',
    hint: 'Tu casco somero roza los bancos — atrae cazadores profundos a ellos.',
  },
  ottoman: {
    name: 'Sprint de remos',
    pitch: 'Sprint (T) hacia el espolón — las galeras abordadas te reman libertos.',
    hint: 'T: arranque veloz, luego remos agotados. Aborda por manos, no oro.',
  },
  predread: {
    name: 'Cruzar la T',
    pitch: 'Barre proas y popas; mantén un blanco para acotar distancia.',
    hint: 'Dispara a proa/popa: +50%. Quédate en una víctima para afinar.',
  },
  falklands: {
    name: 'Alerta aérea',
    pitch: 'Exocets entran fuera de pantalla — peina la estela o encaja.',
    hint: '¿Flecha de incursión? Gira hacia ella y sigue moviéndote. Ayudan señuelos.',
  },
  somali: {
    name: 'Secuestro y rescate',
    pitch: 'Los mercantes abordados son rehenes — el rescate sube mientras aguantas.',
    hint: 'Aborda mercantes y sobrevive: el rescate crece cada segundo.',
  },
};

const fr: TraitsDict = {
  golden: {
    name: 'Faux pavillons et prime',
    pitch: 'Naviguez sous faux pavillon jusqu’au premier coup — votre prime engraisse chaque prise.',
    hint: 'Retenez le feu pour rester invisible ; coulez des coques pour hausser la prime.',
  },
  exploration: {
    name: 'Eaux inconnues',
    pitch: 'Le brouillard cache la carte — naviguez à chaque île pour la lever contre or.',
    hint: 'Levez des îles contre or, et gardez des fruits contre le scorbut.',
  },
  napoleonic: {
    name: 'L’avantage du vent',
    pitch: 'Le navire au vent tire plus fort — prenez l’avantage, puis signalez.',
    hint: 'Combattez au vent : +25% au tir ; un signal fortifie chaque vague.',
  },
  barbary: {
    name: 'Tribut ou guerre',
    pitch: 'Hélez des marchands (F) pour exiger tribut — de l’or sans combat.',
    hint: 'F près d’un marchand : exigez tribut. Les payeurs épargnés paient encore.',
  },
  viking: {
    name: 'Strandhögg',
    pitch: 'Échouez sur une côte sauvage pour la razzier — repartez avant la troupe.',
    hint: 'Dérivez lentement à la côte pour razzier ; voile (W) pour repartir.',
  },
  ironclad: {
    name: 'Angles de fer',
    pitch: 'Le blindage incliné repousse les tirs de face ; des mines dérivent.',
    hint: 'Chargez proue en avant : moitié dégâts de face. Gare aux mines.',
  },
  ww1: {
    name: 'U-Boote et hydrophones',
    pitch: 'Les U-Boote naviguent en plongée — le ping les trahit ; éperonnez-les.',
    hint: 'Guettez le ping : révélés, ils font surface pour attaquer. Éperonnez.',
  },
  ww2: {
    name: 'Actions de nuit',
    pitch: 'Chaque vague paire se livre de nuit aux fusées — avec prime de danger.',
    hint: 'De nuit l’ennemi tire moitié moins loin. Approchez et gagnez le bonus.',
  },
  hormuz: {
    name: 'Verrouillage missile',
    pitch: 'Les missiles hurlent un ton de verrouillage — virez sec pour le rompre.',
    hint: 'Ton de VERROUILLAGE ? Virez sec à travers le missile. Épargnez les neutres.',
  },
  roman: {
    name: 'Le Corvus',
    pitch: 'Touchez un ennemi et le pont à pointes tombe — abordez aussitôt.',
    hint: 'Éperonnez bord à bord : les agrippés ralentissent, les prises s’abordent seules.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Traversez à la rame la ligne ennemie pour assommer son équipage.',
    hint: 'Passez vite le long d’une coque pour choquer sa recharge.',
  },
  arab: {
    name: 'Chevauchez la mousson',
    pitch: 'La mousson inverse au calendrier — les latines volent vent arrière.',
    hint: 'Naviguez avec la mousson (+vitesse) ; embusquez les routes sous le vent.',
  },
  chinese: {
    name: 'Forteresse flottante',
    pitch: 'Mouillez (T ou voiles carguées) en forteresse — ou hélez les tributaires.',
    hint: 'T : mouillez pour +dégâts. F près d’un marchand : pacte plutôt que butin.',
  },
  japanese: {
    name: 'Grappins et teppo',
    pitch: 'Les ennemis vous grappinent et traînent — répondez par la volée teppo (T).',
    hint: 'T : volée teppo vers l’avant. Tuez les grappreneurs vite ou coulez.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Chaque naufrage nomme des vengeurs — tuez les marqués pour empiler du Mana.',
    hint: 'Les marqués vous chassent ; les tuer empile du Mana (dégâts) — nourrissez-le.',
  },
  hawaii: {
    name: 'Unifiez les îles',
    pitch: 'Battez les pirogues de chaque île pour la vassaliser contre tribut par vague.',
    hint: 'Coulez 3 bateaux d’une île pour la vassaliser. Unifiez-les toutes.',
  },
  macedon: {
    name: 'Tour de siège flottante',
    pitch: 'Les catapultes portent plus loin que tout — mais les moustiques pullulent.',
    hint: 'Votre portée est immense ; le menu fretin meurt sur votre coque. Virez.',
  },
  maya: {
    name: 'Guérilla du récif',
    pitch: 'Les quilles espagnoles saignent sur le récif ; vos pirogues passent libres.',
    hint: 'Combattez dans l’anneau. Hélez le premier étranger pour un don.',
  },
  inca: {
    name: 'Humboldt et spondyle',
    pitch: 'Chevauchez les couloirs de courant ; plongez les bancs de coquilles pour l’or.',
    hint: 'Les courants poussent toutes les coques. Ralentissez sur les bancs roses.',
  },
  lepanto: {
    name: 'La grande mêlée',
    pitch: 'Point de fin aux abordages dans la mêlée — enchaînez prise sur prise.',
    hint: 'La portée d’abordage est longue ; chaque prise rame des affranchis.',
  },
  korea: {
    name: 'La marée de Myeongnyang',
    pitch: 'Le courant du détroit inverse — votre bateau-tortue le sent à peine.',
    hint: 'Attirez les légers dans le courant ; il les jette aux rochers et canons.',
  },
  byzantium: {
    name: 'Chaîne et mer brûlante',
    pitch: 'La chaîne canalise l’ennemi vers un passage ; le feu grégeois dérive.',
    hint: 'Tenez le passage ; vos nappes dérivent au vent et persistent.',
  },
  egypt: {
    name: 'Archers côtiers de Pharaon',
    pitch: 'Les côtes amies tirent pour vous ; les roseaux cachent des embusqués.',
    hint: 'Combattez près des côtes amies pour l’appui. Balayez les roseaux.',
  },
  chola: {
    name: 'De l’autre côté du golfe',
    pitch: 'Loin de chez soi : double consommation, double or des temples, tempêtes.',
    hint: 'Les vivres brûlent deux fois plus vite — mais les gros lots paient double.',
  },
  vietnam: {
    name: 'Pieux de Bạch Đằng',
    pitch: 'À marée basse les barrages de pieux montrent les dents aux quilles profondes.',
    hint: 'Surveillez l’horloge : appâtez les profondes sur les pieux à BASSE mer.',
  },
  aztec: {
    name: 'Chaussées de Texcoco',
    pitch: 'Labyrinthe de chaussées — les pirogues passent où les brigantins ne peuvent.',
    hint: 'Combattez depuis les passages ; les profondes espagnoles s’échouent.',
  },
  phoenicia: {
    name: 'La route pourpre',
    pitch: 'Convoyez entre ports amis pour un profit croissant par vague.',
    hint: 'Touchez un fort ami pour charger, un autre pour vendre. Épargnez les associés.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Hélez les marchands (F) pour le péage de la Ligue — ou combattez-les tous.',
    hint: 'F près d’un marchand : exigez le péage. Les refusants appellent le convoi.',
  },
  portugal: {
    name: 'Mousson et feitoria',
    pitch: 'Le vent inverse toutes les 3 vagues ; les feitorias vous soignent et nourrissent.',
    hint: 'Surveillez le calendrier ; attardez-vous près des forts amis.',
  },
  armada: {
    name: 'Coups de vent et brûlots',
    pitch: 'Les coups de vent dispersent tout ; le croissant garde son trésor.',
    hint: 'Les vents poussent sous le vent. Brisez le croissant pour le gros lot.',
  },
  dutch: {
    name: 'Sables mouvants',
    pitch: 'Les bancs dérivent sur le Texel et échouent les profondes anglaises.',
    hint: 'Votre faible tirant survole les bancs — attirez-y les chasseurs profonds.',
  },
  ottoman: {
    name: 'Sprint à la rame',
    pitch: 'Sprintez (T) vers l’éperon — les galères abordées vous rament des affranchis.',
    hint: 'T : pointe de vitesse, puis rames épuisées. Abordez pour des bras, pas de l’or.',
  },
  predread: {
    name: 'Barrez le T',
    pitch: 'Ratissez proues et poupes ; tenez une cible pour encadrer la distance.',
    hint: 'Tirez en proue/poupe : +50%. Restez sur une victime pour mieux viser.',
  },
  falklands: {
    name: 'Alerte aérienne',
    pitch: 'Les Exocets arrivent hors écran — peignez le sillage ou encaissez.',
    hint: 'Flèche de raid ? Virez dedans et bougez. Les leurres aident.',
  },
  somali: {
    name: 'Détournement et rançon',
    pitch: 'Les marchands abordés deviennent otages — la rançon monte tant que vous tenez.',
    hint: 'Abordez des marchands, puis survivez : la rançon croît chaque seconde.',
  },
};

const de: TraitsDict = {
  golden: {
    name: 'Falsche Flagge & Kopfgeld',
    pitch: 'Segelt unter falscher Flagge bis zum ersten Schuss — Euer Kopfgeld mästet jede Prise.',
    hint: 'Feuer zurückhalten zum Unsichtbarbleiben; versenkt Marineschiffe für Kopfgeld.',
  },
  exploration: {
    name: 'Unbekannte Gewässer',
    pitch: 'Nebel verbirgt die Karte — segelt zu jeder Insel, sie zu kartieren für Gold.',
    hint: 'Kartiert Inseln für Gold, und haltet Obst gegen Skorbut.',
  },
  napoleonic: {
    name: 'Die Luvstellung',
    pitch: 'Das Luvschiff schießt härter — kreuzt in Luv, dann signalisiert.',
    hint: 'Kämpft aus Luv für +25% Schuss; ein Signal stärkt jede Welle.',
  },
  barbary: {
    name: 'Tribut oder Krieg',
    pitch: 'Ruft Händler an (F) für Tribut — Gold ohne Kampf.',
    hint: 'F nah am Händler: Tribut fordern. Verschonte Zahler zahlen wieder.',
  },
  viking: {
    name: 'Strandhögg',
    pitch: 'Strandet an wilder Küste zum Rauben — legt ab vor der Kriegspartei.',
    hint: 'Langsam an den Strand treiben zum Rauben; Segel (W) zum Ablegen.',
  },
  ironclad: {
    name: 'Eiserne Winkel',
    pitch: 'Geneigte Panzerung weist Schuss von vorn ab; Minen treiben in den Rinnen.',
    hint: 'Bug voraus angreifen: halber Schaden von vorn. Achtet auf Treibminen.',
  },
  ww1: {
    name: 'U-Boote & Hydrophone',
    pitch: 'U-Boote laufen getaucht — das Ping verrät sie; rammt sie.',
    hint: 'Achtet aufs Ping: entdeckte Boote tauchen zum Angriff auf. Rammt sie.',
  },
  ww2: {
    name: 'Nachtgefechte',
    pitch: 'Jede gerade Welle wird nachts bei Leuchtgranaten gefochten — mit Gefahrenzulage.',
    hint: 'Nachts schießt der Feind halb so weit. Ran und Bonus verdienen.',
  },
  hormuz: {
    name: 'Raketenalarm',
    pitch: 'Anfliegende Raketen kreischen Erfassungston — hart drehen zum Brechen.',
    hint: 'ERFASSUNGSTON? Hart quer zur Rakete drehen. Neutrale Tanker schonen.',
  },
  roman: {
    name: 'Der Corvus',
    pitch: 'Berührt einen Feind und die Stachelbrücke fällt — entert sofort.',
    hint: 'Längsseits rammen: Gehaltene verlangsamen, Prisen entern sich selbst.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Rudert glatt durch die Feindlinie, ihre Mannschaft zu betäuben.',
    hint: 'Schnell längs am Feindrumpf vorbei für betäubtes Nachladen.',
  },
  arab: {
    name: 'Reitet den Monsun',
    pitch: 'Der Monsun kehrt nach Kalender — Lateinsegler fliegen vor dem Wind.',
    hint: 'Segelt mit dem Monsun (+Fahrt); legt Hinterhalte auf Leerouten.',
  },
  chinese: {
    name: 'Schwimmende Festung',
    pitch: 'Ankert (T oder kahle Masten) zur Festung — oder ruft Tributschiffe an.',
    hint: 'T: ankern für +Schaden. F nah am Händler: Tributpakt statt Beute.',
  },
  japanese: {
    name: 'Enterhaken & Teppo',
    pitch: 'Feinde haken und schleppen Euch — antwortet mit Teppo-Salve (T).',
    hint: 'T: Teppo-Salve voraus. Tötet Haker schnell oder werdet hinabgezogen.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Jede Versenkung benennt Rächer — tötet Markierte für Mana-Stapel.',
    hint: 'Markierte Sippen jagen Euch; sie zu töten stapelt Mana (Schaden) — füttert es.',
  },
  hawaii: {
    name: 'Einigt die Inseln',
    pitch: 'Schlagt jeder Insel Kanus zu Vasallen für Tribut je Welle.',
    hint: 'Versenkt 3 Boote einer Insel zum Vasallieren. Einigt alle.',
  },
  macedon: {
    name: 'Belagerungsturm auf See',
    pitch: 'Belagerungskatapulte überragen alles — doch die Mücken schwärmen.',
    hint: 'Eure Reichweite ist riesig; Kleinvieh stirbt am Rumpf. Weiter drehen.',
  },
  maya: {
    name: 'Riff-Guerilla',
    pitch: 'Spanische Kiele bluten am Riff; Eure Kanus passieren frei.',
    hint: 'Kämpft im Riffring. Ruft den ersten Fremden an für ein Geschenk.',
  },
  inca: {
    name: 'Humboldt & Spondylus',
    pitch: 'Reitet die Strombahnen; taucht Muschelbänke für Gold.',
    hint: 'Strömungen schieben alle Rümpfe. Langsam über rosa Bänke zum Tauchen.',
  },
  lepanto: {
    name: 'Das große Handgemenge',
    pitch: 'Kein Ende des Enterns im Gemenge — kettet Prise an Prise.',
    hint: 'Enterreichweite ist lang; jede Prise rudert Befreite zu Eurer Mannschaft.',
  },
  korea: {
    name: 'Die Myongnyang-Gezeit',
    pitch: 'Der Meeresstrom kehrt — Euer Schildkrötenschiff spürt ihn kaum.',
    hint: 'Lockt leichte Feinde in die Gezeit; sie fegt sie auf Felsen und Kanonen.',
  },
  byzantium: {
    name: 'Kette & Brennendes Meer',
    pitch: 'Die Kette trichtert den Feind zu einer Lücke; Griechisches Feuer treibt.',
    hint: 'Haltet die Kettenlücke; Eure Teppiche treiben mit Wind und bleiben.',
  },
  egypt: {
    name: 'Des Pharao Küstenbogner',
    pitch: 'Freundliche Küsten schießen Salven für Euch; Schilf verbirgt Hinterhalte.',
    hint: 'Kämpft nah an Freundküsten für Bognerhilfe. Fegt das Schilf.',
  },
  chola: {
    name: 'Über die Bucht',
    pitch: 'Fern der Heimat: doppelter Vorratsverbrauch, doppeltes Tempelgold, Monsunstürme.',
    hint: 'Vorräte brennen doppelt so schnell — doch Hauptgewinne zahlen doppelt.',
  },
  vietnam: {
    name: 'Pfähle von Bạch Đằng',
    pitch: 'Bei Ebbe zeigen die Pfahlsperren tiefen Kielen die Zähne.',
    hint: 'Achtet auf die Gezeitenuhr: lockt tiefe Rümpfe bei NIEDRIGWASSER auf Pfähle.',
  },
  aztec: {
    name: 'Dämme von Texcoco',
    pitch: 'Labyrinth von Dämmen — Kanus schlüpfen durch Lücken, Brigantinen nicht.',
    hint: 'Kämpft aus den Lücken; tiefe spanische Rümpfe stranden und kriechen.',
  },
  phoenicia: {
    name: 'Die Purpurfahrt',
    pitch: 'Fahrt Fracht zwischen Freundhäfen für wellenskalierenden Gewinn.',
    hint: 'Freundfort berühren zum Laden, ein anderes zum Verkaufen. Schont Partner.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Ruft Konvoihändler an (F) für den Hansenzoll — oder bekämpft alle.',
    hint: 'F nah am Händler: Zoll fordern. Verweigerer rufen den ganzen Konvoi.',
  },
  portugal: {
    name: 'Monsun & Feitoria',
    pitch: 'Der Wind kehrt alle 3 Wellen; Feitoria-Forts flicken und füttern Euch.',
    hint: 'Achtet auf den Monsunkalender; verweilt bei Freundforts zur Erholung.',
  },
  armada: {
    name: 'Stürme & Brander',
    pitch: 'Stürme zerstreuen jede Formation; der Halbmond bewacht seinen Schatz.',
    hint: 'Stürme schieben alle Rümpfe nach Lee. Knackt den Halbmond für den Hauptgewinn.',
  },
  dutch: {
    name: 'Wandernde Sande',
    pitch: 'Sandbänke treiben über Texel und stranden tiefe englische Kiele.',
    hint: 'Euer flacher Rumpf streift die Bänke — lockt tiefe Jäger darauf.',
  },
  ottoman: {
    name: 'Rudersprint',
    pitch: 'Sprintet (T) in den Ramm — geenterte Galeeren rudern Befreite zu Euch.',
    hint: 'T: Sprintstoß, dann erschöpfte Ruder. Entert für Hände, nicht Gold.',
  },
  predread: {
    name: 'Das T kreuzen',
    pitch: 'Recht Bug und Heck ein; haltet ein Ziel zum Eingabeln.',
    hint: 'In Bug/Heck feuern für +50%. Bleibt an einem Opfer für genaueres Zielen.',
  },
  falklands: {
    name: 'Luftalarm',
    pitch: 'Exocets kommen von außerhalb — kämmt das Kielwasser oder werdet getroffen.',
    hint: 'Angriffspfeil? Dreht hinein und bleibt in Fahrt. Düppel helfen.',
  },
  somali: {
    name: 'Kapern & Lösegeld',
    pitch: 'Geenterte Händler werden Geiseln — das Lösegeld tickt, solange Ihr haltet.',
    hint: 'Entert Händler, dann überlebt: das Lösegeld wächst jede Sekunde.',
  },
};

const nl: TraitsDict = {
  golden: {
    name: 'Valse vlag & premie',
    pitch: 'Vaar onder valse vlag tot het eerste schot — je premie mest elke prijs.',
    hint: 'Houd vuur in om ongezien te blijven; laat marineschepen zinken voor premie.',
  },
  exploration: {
    name: 'Onbekende wateren',
    pitch: 'Mist verbergt de kaart — vaar naar elk eiland om het te karteren voor goud.',
    hint: 'Karteer eilanden voor goud en houd fruit tegen scheurbuik.',
  },
  napoleonic: {
    name: 'Het loefvoordeel',
    pitch: 'Het loefschip schiet harder — kruis naar loef en sein dan.',
    hint: 'Vecht vanaf loef voor +25% schot; een sein versterkt elke golf.',
  },
  barbary: {
    name: 'Tribuut of oorlog',
    pitch: 'Roep koopvaarders aan (F) voor tribuut — goud zonder gevecht.',
    hint: 'F bij een koopvaarder: eis tribuut. Gespaarde betalers betalen weer.',
  },
  viking: {
    name: 'Strandhögg',
    pitch: 'Strand op wilde kust om te plunderen — vaar af vóór de krijgsbende.',
    hint: 'Drijf langzaam naar de kust om te plunderen; zeil (W) om af te varen.',
  },
  ironclad: {
    name: 'IJzeren hoeken',
    pitch: 'Hellend pantser weert schot van voren; mijnen drijven in de geulen.',
    hint: 'Val aan boeg-voor: half schade van voren. Pas op voor drijfmijnen.',
  },
  ww1: {
    name: 'U-boten & hydrofoons',
    pitch: 'U-boten varen onder water — de ping verraadt ze; ram ze.',
    hint: 'Let op de ping: verraden boten komen boven om aan te vallen. Ram ze.',
  },
  ww2: {
    name: 'Nachtacties',
    pitch: 'Elke even golf wordt ’s nachts bij lichtgranaat bevochten — met gevarentoeslag.',
    hint: '’s Nachts schiet de vijand half zo ver. Ga eropaf en verdien de bonus.',
  },
  hormuz: {
    name: 'Raketslot',
    pitch: 'Naderende raketten gillen een slotsignaal — draai hard om te breken.',
    hint: 'SLOTsignaal? Draai hard dwars op de raket. Spaar neutrale tankers.',
  },
  roman: {
    name: 'De corvus',
    pitch: 'Raak een vijand en de spijkerbrug valt — enter meteen.',
    hint: 'Ram langszij: gegrepen vijanden vertragen, prijzen enteren zichzelf.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Roei dwars door de vijandelijke linie om haar bemanning te verbijsteren.',
    hint: 'Passeer snel langs een vijandelijke romp om haar herlading te schokken.',
  },
  arab: {
    name: 'Berijd de moesson',
    pitch: 'De moesson keert per kalender — latijnzeilers vliegen voor de wind.',
    hint: 'Vaar met de moesson mee (+snelheid); hinderlaag de lijroutes.',
  },
  chinese: {
    name: 'Drijvend fort',
    pitch: 'Anker (T of kale masten) als fort — of roep tribuutschepen aan.',
    hint: 'T: anker voor +schade. F bij koopvaarder: tribuutpact boven buit.',
  },
  japanese: {
    name: 'Grijpers & teppo',
    pitch: 'Vijanden grijpen en slepen je — antwoord met teppo-salvo (T).',
    hint: 'T: teppo-salvo vooruit. Dood grijpers snel of word meegetrokken.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Elke zinking noemt vergelders — dood gemarkeerden voor Mana-stapeling.',
    hint: 'Gemarkeerde verwanten jagen je; ze doden stapelt Mana (schade) — blijf voeden.',
  },
  hawaii: {
    name: 'Verenig de eilanden',
    pitch: 'Versla de kano’s van elk eiland om het te onderwerpen voor tribuut per golf.',
    hint: 'Laat 3 boten van één eiland zinken om het te onderwerpen. Verenig ze alle.',
  },
  macedon: {
    name: 'Belegeringstoren drijvend',
    pitch: 'Belegeringskatapulten reiken verder dan alles — maar de muggen zwermen.',
    hint: 'Je bereik is enorm; klein grut sterft op je romp. Blijf draaien.',
  },
  maya: {
    name: 'Rifguerrilla',
    pitch: 'Spaanse kielen bloeden op het rif; je kano’s passeren vrij.',
    hint: 'Vecht binnen de rifring. Roep de eerste vreemde aan voor een gift.',
  },
  inca: {
    name: 'Humboldt & spondylus',
    pitch: 'Berijd de stroombanen; duik de schelpbanken voor goud.',
    hint: 'Stromen duwen alle rompen. Blijf langzaam hangen boven roze banken.',
  },
  lepanto: {
    name: 'Het grote handgemeen',
    pitch: 'Geen eind aan enteren in het handgemeen — keten prijs aan prijs.',
    hint: 'Enterbereik is lang; elke prijs roeit bevrijden naar je bemanning.',
  },
  korea: {
    name: 'Het tij van Myeongnyang',
    pitch: 'De zeestraatstroom keert — je schildpadschip voelt hem amper.',
    hint: 'Lok lichte vijanden in het tij; het veegt ze op rotsen en geschut.',
  },
  byzantium: {
    name: 'Ketting & brandende zee',
    pitch: 'De ketting trechtert de vijand naar één gat; Grieks vuur drijft en spreidt.',
    hint: 'Houd het kettinggat; je vlekken drijven met de wind en blijven.',
  },
  egypt: {
    name: 'Kustboogschutters van de farao',
    pitch: 'Bevriende kusten lossen salvo’s voor je; riet verbergt hinderlagen.',
    hint: 'Vecht bij bevriende kusten voor boogsteun. Veeg het riet.',
  },
  chola: {
    name: 'Over de baai',
    pitch: 'Ver van huis: dubbel voorraadverbruik, dubbel tempelgoud, moessonstormen.',
    hint: 'Voorraden branden dubbel zo snel — maar jackpots betalen dubbel.',
  },
  vietnam: {
    name: 'Staken van Bạch Đằng',
    pitch: 'Bij eb tonen de staakversperringen hun tanden aan diepe kielen.',
    hint: 'Let op de getijdenklok: lok diepe rompen bij LAAG tij op de staken.',
  },
  aztec: {
    name: 'Dijk wegen van Texcoco',
    pitch: 'Doolhof van dijkwegen — kano’s glippen door gaten waar brigantijnen niet kunnen.',
    hint: 'Vecht vanuit de gaten; diepe Spaanse rompen lopen vast en kruipen.',
  },
  phoenicia: {
    name: 'De purperroute',
    pitch: 'Vervoer lading tussen bevriende havens voor golfschalende winst.',
    hint: 'Raak een bevriend fort om te laden, een ander om te verkopen. Spaar partners.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Roep konvooivaarders aan (F) voor de Hanze-tol — of bevecht ze alle.',
    hint: 'F bij koopvaarder: eis de tol. Weigeraars roepen het hele konvooi.',
  },
  portugal: {
    name: 'Moesson & feitoria',
    pitch: 'De wind keert elke 3 golven; feitoria-forten lappen en voeden je.',
    hint: 'Let op de moessonkalender; blijf hangen bij bevriende forten.',
  },
  armada: {
    name: 'Stormen & branders',
    pitch: 'Stormen verstrooien elke formatie; de halve maan bewaakt haar schat.',
    hint: 'Stormen duwen alle rompen te lij. Kraak de halve maan voor de jackpot.',
  },
  dutch: {
    name: 'Drijvende zanden',
    pitch: 'Zandbanken drijven over de Texel en laten diepe Engelse kielen stranden.',
    hint: 'Je ondiepe romp scheert de banken — lok diepe jagers erop.',
  },
  ottoman: {
    name: 'Roeisprint',
    pitch: 'Sprint (T) de ram in — geënterde galeien roeien bevrijden naar je.',
    hint: 'T: sprintstoot, dan uitgeputte roeiers. Enter voor handen, niet goud.',
  },
  predread: {
    name: 'Kruis de T',
    pitch: 'Hark boegen en hekken; houd één doel om afstand in te schieten.',
    hint: 'Vuur in boeg/hek voor +50%. Blijf op één slachtoffer om zuiverder te richten.',
  },
  falklands: {
    name: 'Luchtalarm',
    pitch: 'Exocets komen van buiten beeld — kam het kielzog of word geraakt.',
    hint: 'Aanvalspijl? Draai erin en blijf bewegen. Lokmiddelen helpen.',
  },
  somali: {
    name: 'Kapen & losgeld',
    pitch: 'Geënterde koopvaarders worden gijzelaars — het losgeld tikt zolang je volhoudt.',
    hint: 'Enter koopvaarders en overleef: het losgeld groeit elke seconde.',
  },
};

const pt: TraitsDict = {
  golden: {
    name: 'Falsa bandeira e recompensa',
    pitch: 'Navega sob falsa bandeira até ao primeiro tiro — a tua recompensa engorda cada presa.',
    hint: 'Segura o fogo para passar despercebido; afunda cascos para subir a recompensa.',
  },
  exploration: {
    name: 'Águas desconhecidas',
    pitch: 'O nevoeiro esconde a carta — navega a cada ilha para a cartografar por ouro.',
    hint: 'Cartografa ilhas por ouro e guarda fruta contra o escorbuto.',
  },
  napoleonic: {
    name: 'O barlavento',
    pitch: 'O navio de barlavento dispara mais forte — orça ao barlavento e sinaliza.',
    hint: 'Luta de barlavento: +25% tiro; um sinal reforça cada vaga.',
  },
  barbary: {
    name: 'Tributo ou guerra',
    pitch: 'Saúda mercantes (F) para exigir tributo — ouro sem luta.',
    hint: 'F junto a um mercante: exige tributo. Pagadores poupados pagam de novo.',
  },
  viking: {
    name: 'Strandhögg',
    pitch: 'Encalha em costa bravia para a saquear — descolai antes do partido de guerra.',
    hint: 'Deriva lento à costa para saquear; vela (W) para descolar.',
  },
  ironclad: {
    name: 'Ângulos de ferro',
    pitch: 'A blindagem inclinada repele tiros de proa; minas derivam nos canais.',
    hint: 'Investe de proa: metade do dano frontal. Cuidado com as minas à deriva.',
  },
  ww1: {
    name: 'U-Boots e hidrofones',
    pitch: 'Os U-Boots andam submersos — o ping denuncia-os; abalroa-os.',
    hint: 'Vigia o ping: denunciados, emergem para atacar. Abalroa-os.',
  },
  ww2: {
    name: 'Ações noturnas',
    pitch: 'Cada vaga par trava-se à noite à luz de granadas — com paga de perigo.',
    hint: 'À noite o inimigo dispara a metade do alcance. Aproxima-te e ganha o bónus.',
  },
  hormuz: {
    name: 'Fixação de míssil',
    pitch: 'Os mísseis guincham tom de fixação — guina forte para a quebrar.',
    hint: 'Tom de FIXAÇÃO? Guina forte através do míssil. Poupa petroleiros neutros.',
  },
  roman: {
    name: 'O corvus',
    pitch: 'Toca um inimigo e a ponte de espigões cai — aborda de imediato.',
    hint: 'Abalroa de través: agarrados abrandam, presas abordam-se sós.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Rema limpo pela linha inimiga para atordoar a sua tripulação.',
    hint: 'Passa rápido ao longo de um casco para chocar a sua recarga.',
  },
  arab: {
    name: 'Cavalga a monção',
    pitch: 'A monção inverte por calendário — latinos voam de popa.',
    hint: 'Navega com a monção (+velocidade); embosca as rotas de sotavento.',
  },
  chinese: {
    name: 'Fortaleza flutuante',
    pitch: 'Fundeia (T ou mastros nus) como fortaleza — ou saúda navios de tributo.',
    hint: 'T: fundeia para +dano. F junto a mercante: pacto de tributo em vez de pilhagem.',
  },
  japanese: {
    name: 'Arpéus e teppo',
    pitch: 'Os inimigos agarram-te e arrastam — responde com a salva teppo (T).',
    hint: 'T: salva teppo à proa. Mata agarradores depressa ou és arrastado.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Cada afundamento nomeia vingadores — mata marcados para empilhar Mana.',
    hint: 'Os marcados caçam-te; matá-los empilha Mana (dano) — continua a alimentá-lo.',
  },
  hawaii: {
    name: 'Unifica as ilhas',
    pitch: 'Bate as canoas de cada ilha para a vassalizar por tributo por vaga.',
    hint: 'Afunda 3 barcos de uma ilha para a vassalizar. Unifica-as todas.',
  },
  macedon: {
    name: 'Torre de cerco flutuante',
    pitch: 'As catapultas superam todo o alcance — mas os mosquitos pululam.',
    hint: 'O teu alcance é vasto; a piolhada morre no teu casco. Continua a guinar.',
  },
  maya: {
    name: 'Guerrilha do recife',
    pitch: 'As quilhas espanholas sangram no recife; as tuas canoas passam livres.',
    hint: 'Luta dentro do anel. Saúda o primeiro estranho por um presente.',
  },
  inca: {
    name: 'Humboldt e spondylus',
    pitch: 'Cavalga as faixas de corrente; mergulha os bancos de concha por ouro.',
    hint: 'As correntes empurram todos os cascos. Demora-te lento sobre bancos rosas.',
  },
  lepanto: {
    name: 'A grande refrega',
    pitch: 'Sem fim de abordagens na refrega — encadeia presa a presa.',
    hint: 'O alcance de abordagem é longo; cada presa rema libertos à tua tripulação.',
  },
  korea: {
    name: 'A maré de Myeongnyang',
    pitch: 'A corrente do estreito inverte — o teu navio-tartaruga mal a sente.',
    hint: 'Atrai inimigos leves à maré; ela varre-os a rochas e canhões.',
  },
  byzantium: {
    name: 'Cadeia e mar ardente',
    pitch: 'A cadeia afunila o inimigo a uma passagem; o fogo grego deriva e alastra.',
    hint: 'Guarda a passagem; as tuas manchas derivam com o vento e persistem.',
  },
  egypt: {
    name: 'Archeiros costeiros do faraó',
    pitch: 'Costas amigas disparam salvas por ti; os canaviais escondem emboscados.',
    hint: 'Luta junto a costas amigas por apoio. Varre os canaviais.',
  },
  chola: {
    name: 'Do outro lado da baía',
    pitch: 'Longe de casa: dobro do gasto, dobro do ouro dos templos, tempestades de monção.',
    hint: 'As reservas ardem ao dobro — mas os prémios pagam ao dobro.',
  },
  vietnam: {
    name: 'Estacas de Bạch Đằng',
    pitch: 'Na baixa-mar as barreiras mostram os dentes às quilhas fundas.',
    hint: 'Vigia o relógio da maré: atrai cascos fundos às estacas na BAIXA-mar.',
  },
  aztec: {
    name: 'Calçadas de Texcoco',
    pitch: 'Labirinto de calçadas — canoas passam vãos que bergantins não passam.',
    hint: 'Luta a partir dos vãos; cascos espanhóis fundos encalham e rastejam.',
  },
  phoenicia: {
    name: 'A rota púrpura',
    pitch: 'Leva carga entre portos amigos por lucro que cresce por vaga.',
    hint: 'Toca um forte amigo para carregar, outro para vender. Poupa parceiros.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Saúda mercantes de comboio (F) pelo pedágio da Liga — ou luta com todos.',
    hint: 'F junto a mercante: exige o pedágio. Recusadores chamam o comboio.',
  },
  portugal: {
    name: 'Monção e feitoria',
    pitch: 'O vento inverte a cada 3 vagas; feitorias consertam-te e alimentam-te.',
    hint: 'Vigia o calendário da monção; demora-te junto a fortes amigos.',
  },
  armada: {
    name: 'Galernas e brulotes',
    pitch: 'As galernas dispersam toda a formação; o crescente guarda o seu tesouro.',
    hint: 'As galernas empurram a sotavento. Parte o crescente pelo prémio.',
  },
  dutch: {
    name: 'Areias movediças',
    pitch: 'Bancos de areia derivam pelo Texel e encalham quilhas inglesas fundas.',
    hint: 'O teu casco raso roça os bancos — atrai caçadores fundos a eles.',
  },
  ottoman: {
    name: 'Sprint de remos',
    pitch: 'Sprinta (T) ao esporão — galés abordadas remam-te libertos.',
    hint: 'T: arranque veloz, depois remos exaustos. Aborda por braços, não ouro.',
  },
  predread: {
    name: 'Cruza o T',
    pitch: 'Varre proas e popas; segura um alvo para enquadrar a distância.',
    hint: 'Dispara à proa/popa: +50%. Fica numa vítima para apontar melhor.',
  },
  falklands: {
    name: 'Alerta aéreo',
    pitch: 'Exocets entram de fora do ecrã — penteia a esteira ou és atingido.',
    hint: 'Seta de incursão? Guina para ela e continua a mover-te. Engodos ajudam.',
  },
  somali: {
    name: 'Sequestro e resgate',
    pitch: 'Mercantes abordados viram reféns — o resgate sobe enquanto aguentares.',
    hint: 'Aborda mercantes e sobrevive: o resgate cresce a cada segundo.',
  },
};

const ja: TraitsDict = {
  golden: {
    name: '偽装旗と賞金',
    pitch: '初弾まで偽装旗で航行 — 賞金が拿捕船を太らせる。',
    hint: '見つからぬよう発砲を控えろ;海軍船を沈めて賞金を上げろ。',
  },
  exploration: {
    name: '未知の海',
    pitch: '霧が海図を隠す — 各島へ帆走し測量して金に。',
    hint: '島を測量して金に。壊血病に備え果物を積め。',
  },
  napoleonic: {
    name: '風上占位',
    pitch: '風上の船は射撃が強い — 風上を取り、信号を送れ。',
    hint: '風上から戦い射撃+25%;信号は毎ウェーブを強化。',
  },
  barbary: {
    name: '貢納か戦争か',
    pitch: '商船に呼びかけ(F)貢納を要求 — 戦わず金を。',
    hint: '商船の近くでF:貢納を要求。見逃した納付者はまた払う。',
  },
  viking: {
    name: 'ストランドホッグ',
    pitch: '荒野の岸に乗り上げ略奪 — 戦の一団の前に離岸せよ。',
    hint: 'ゆっくり岸に寄せて略奪;帆(W)で離岸。',
  },
  ironclad: {
    name: '鉄の角度',
    pitch: '傾斜装甲は正面の弾を弾く;機雷が水路に漂う。',
    hint: '艦首から突撃:正面被害半減。漂流機雷に注意。',
  },
  ww1: {
    name: 'Uボートと聴音機',
    pitch: 'Uボートは潜航する — ピンが暴く;体当たりせよ。',
    hint: 'ピンに注目:暴かれた艇は浮上攻撃する。体当たりせよ。',
  },
  ww2: {
    name: '夜戦',
    pitch: '偶数ウェーブは照明弾下の夜戦 — 危険手当付き。',
    hint: '夜は敵の射程半減。接近して割増を稼げ。',
  },
  hormuz: {
    name: 'ミサイルロック',
    pitch: '飛来ミサイルはロック音を響かせる — 急旋回で振り切れ。',
    hint: 'ロック音?ミサイルを横切るよう急旋回。中立タンカーは見逃せ。',
  },
  roman: {
    name: 'コルウス',
    pitch: '敵に触れれば棘橋が落ちる — 即拿捕せよ。',
    hint: '舷側に体当たり:捕らえた敵は減速、拿捕船は自ら拿捕される。',
  },
  greek: {
    name: 'ディエクプルス',
    pitch: '敵列を漕ぎ抜け乗組員を気絶させよ。',
    hint: '敵船体に沿って高速通過し装填を混乱させろ。',
  },
  arab: {
    name: 'モンスーンに乗れ',
    pitch: 'モンスーンは暦で反転 — ラテン船は追い風で飛ぶ。',
    hint: 'モンスーンに乗れ(+速力);風下の交易路で待ち伏せ。',
  },
  chinese: {
    name: '浮かぶ要塞',
    pitch: '投錨し(Tまたは裸マスト)要塞化 — または朝貢船に呼びかけ。',
    hint: 'T:投錨で威力+。商船近くでF:略奪より朝貢協定。',
  },
  japanese: {
    name: '鉤縄と鉄砲',
    pitch: '敵は鉤で捕らえ引きずる — 鉄砲斉射(T)で応えろ。',
    hint: 'T:前方へ鉄砲斉射。鉤掛けを速く殺すか引きずられるか。',
  },
  maori: {
    name: 'ウトゥ',
    pitch: '沈没ごとに仇敵が名指し — 標的を殺してマナを重ねろ。',
    hint: '標的の一族が追う;殺せばマナ(威力)が重なる — 与え続けろ。',
  },
  hawaii: {
    name: '島々を統一せよ',
    pitch: '各島のカヌーを破り属国化、毎ウェーブ貢納を得よ。',
    hint: '一島の舟3隻を沈めて属国化。全島を統一せよ。',
  },
  macedon: {
    name: '浮かぶ攻城塔',
    pitch: '攻城カタパルトの射程は無双 — だが蚊が群がる。',
    hint: '射程は広大;小物は船体で死ぬ。回り続けろ。',
  },
  maya: {
    name: '珊瑚礁ゲリラ',
    pitch: 'スペインの竜骨は礁で血を流す;君のカヌーは自由に通る。',
    hint: '礁環内で戦え。最初の異邦人に呼びかけ贈り物を得よ。',
  },
  inca: {
    name: 'フンボルトとスポンディルス',
    pitch: '海流帯に乗れ;貝床に潜り金を。',
    hint: '海流は全船を押す。桃色の床の上でゆっくり潜れ。',
  },
  lepanto: {
    name: '大乱戦',
    pitch: '乱戦の拿捕に終わりなし — 拿捕から拿捕へ。',
    hint: '拿捕距離は長い;拿捕ごとに解放奴隷が漕ぎ寄る。',
  },
  korea: {
    name: '鳴梁の潮',
    pitch: '海峡の潮流は反転する — 亀甲船はほぼ感じない。',
    hint: '軽い敵を潮に誘え;岩と砲へ流される。',
  },
  byzantium: {
    name: '鎖と燃える海',
    pitch: '鎖は敵を一つの隙間へ誘導;ギリシャ火は漂い広がる。',
    hint: '鎖の隙間を守れ;油膜は風に漂い残る。',
  },
  egypt: {
    name: 'ファラオの岸弓兵',
    pitch: '味方の岸は援護斉射;葦は伏兵を隠す。',
    hint: '援護には味方岸の近くで戦え。葦を掃討せよ。',
  },
  chola: {
    name: '湾の向こう',
    pitch: '故郷遠く:糧食消費倍、寺院の金倍、モンスーン嵐。',
    hint: '備蓄は倍速で燃える — だが大当たりも倍払い。',
  },
  vietnam: {
    name: 'バックダンの杭',
    pitch: '干潮には杭柵が深い竜骨に牙をむく。',
    hint: '潮時計を見ろ:干潮時に深い船体を杭へ誘え。',
  },
  aztec: {
    name: 'テスココの土手道',
    pitch: '土手道の迷宮 — カヌーはブリガンティンが通れぬ隙間を行く。',
    hint: '隙間から戦え;深いスペイン船は座礁し這う。',
  },
  phoenicia: {
    name: '紫の航路',
    pitch: '味方港間で貨物を運びウェーブ比例の利を得よ。',
    hint: '味方砦に触れて積み、別の砦で売れ。仲間は見逃せ。',
  },
  hanse: {
    name: 'プフントゲルト',
    pitch: '護送商船に呼びかけ(F)同盟税を取れ — さもなくば全員と戦え。',
    hint: '商船近くでF:通行税を要求。拒否者は護送隊を呼ぶ。',
  },
  portugal: {
    name: 'モンスーンと商館',
    pitch: '風は3ウェーブごとに反転;商館砦は修理し糧食をくれる。',
    hint: 'モンスーン暦に注意;味方砦のそばで回復せよ。',
  },
  armada: {
    name: '強風と火船',
    pitch: '強風は全隊形を散らす;三日月陣は宝を守る。',
    hint: '強風は全船を風下へ押す。三日月を割って大当たりを。',
  },
  dutch: {
    name: '流れる砂州',
    pitch: '砂州がテセルを漂い深い英竜骨を座礁させる。',
    hint: '浅い船体は州をかすめる — 深い狩人を誘い込め。',
  },
  ottoman: {
    name: 'オール疾走',
    pitch: '疾走(T)して体当たり — 拿捕ガレーは解放奴隷を漕がせる。',
    hint: 'T:疾走の後オールは疲労。金でなく人手のため拿捕せよ。',
  },
  predread: {
    name: 'T字を切れ',
    pitch: '艦首尾を縦射;一目標を保ち距離を挟叉せよ。',
    hint: '首尾への射撃+50%。一犠牲者に留まり精密に狙え。',
  },
  falklands: {
    name: '空襲警報',
    pitch: 'エグゾセが画面外から飛来 — 航跡を梳くか被弾か。',
    hint: '襲撃矢印?向きを合わせ動き続けろ。チャフが効く。',
  },
  somali: {
    name: '拿捕と身代金',
    pitch: '拿捕商船は人質に — 保持中身代金は上がり続ける。',
    hint: '商船を拿捕し生き延びろ:身代金は毎秒増える。',
  },
};

const zh: TraitsDict = {
  golden: {
    name: '假旗与悬赏',
    pitch: '首发炮弹前挂假旗——你的悬赏让每单俘获更肥。',
    hint: '按住不开火以隐身；击沉海军船只提高悬赏。',
  },
  exploration: {
    name: '未测之水',
    pitch: '雾掩海图——驶近每座岛测绘换金。',
    hint: '测绘岛屿赚钱，舱里备水果防坏血病。',
  },
  napoleonic: {
    name: '上风之利',
    pitch: '上风船炮更狠——抢风，然后发信号。',
    hint: '从上风打，炮击 +25%；信号增益每波。',
  },
  barbary: {
    name: '纳贡或开战',
    pitch: '鸣号（F）逼商船纳贡——不战得金。',
    hint: '近商船按 F 索贡。你放过的纳贡者会再纳。',
  },
  viking: {
    name: '斯特兰德霍格',
    pitch: '抢滩野岸劫掠——战队赶来前撑船离岸。',
    hint: '慢漂上岸劫掠；按帆（W）撑离。',
  },
  ironclad: {
    name: '铁甲角度',
    pitch: '倾斜装甲弹开正面炮弹；水雷漂在航道上。',
    hint: '艏对敌冲锋：正面伤害减半。当心漂雷。',
  },
  ww1: {
    name: 'U艇与水听器',
    pitch: 'U艇潜航——水听器滴答定位；撞它们。',
    hint: '听滴答声：暴露的潜艇上浮攻击。撞它们。',
  },
  ww2: {
    name: '夜战',
    pitch: '逢偶波次，照明弹下夜战——拿危险津贴。',
    hint: '夜里敌人射程减半。贴近拿奖金。',
  },
  hormuz: {
    name: '导弹锁定',
    pitch: '来袭导弹尖啸锁定音——急转脱锁。',
    hint: '听到锁定音？横切导弹急转。放过中立油轮。',
  },
  roman: {
    name: '乌鸦吊桥',
    pitch: '触敌，钉桥落下——立刻接舷。',
    hint: '靠帮撞：被钩敌减速，俘获自动接舷。',
  },
  greek: {
    name: '截横战术',
    pitch: '从敌阵中穿插而过，震懵其船员。',
    hint: '高速掠过敌船舷侧，震乱其装填。',
  },
  arab: {
    name: '乘季风',
    pitch: '季风按历反转——三角帆船顺风疾驰。',
    hint: '顺季风（+航速）；伏击下风商路。',
  },
  chinese: {
    name: '水上堡垒',
    pitch: '抛锚（T 或空帆）成堡垒——或逼朝贡船纳贡。',
    hint: 'T：抛锚 +伤害。近商船按 F：立纳贡约，不劫。',
  },
  japanese: {
    name: '钩镰与铁炮',
    pitch: '敌钩住你拖行——以艏铁炮齐射（T）还击。',
    hint: 'T：向前铁炮齐射。速杀钩船，否则被拖沉。',
  },
  maori: {
    name: '乌图复仇',
    pitch: '每次击沉都会点名复仇者——杀被标记者叠法力。',
    hint: '被标记的亲族猎杀你；杀之叠法力（伤害）——别断供。',
  },
  hawaii: {
    name: '一统群岛',
    pitch: '打服每岛战舟，使其每波纳贡。',
    hint: '击沉某岛 3 艘船使其臣服。一统所有岛。',
  },
  macedon: {
    name: '水上攻城塔',
    pitch: '攻城弩炮射程无敌——但蚊蚋成群。',
    hint: '你射程极远；小鱼小虾撞船自灭。不停转向。',
  },
  maya: {
    name: '礁盘游击',
    pitch: '西班牙龙骨在礁上见血；你的独木舟畅行无阻。',
    hint: '在礁环内打。向第一个陌生人鸣号讨礼。',
  },
  inca: {
    name: '洪堡洋流与棘贝',
    pitch: '乘洋流航道；潜采贝床取金。',
    hint: '洋流推所有船。在粉色贝床上慢漂潜采。',
  },
  lepanto: {
    name: '大混战',
    pitch: '混战中接舷无尽——连环夺船。',
    hint: '接舷距离远；每单俘获都划来自由水手入伙。',
  },
  korea: {
    name: '鸣梁潮汐',
    pitch: '海峡潮流反转——你的龟船几乎无感。',
    hint: '把轻敌引进潮里；潮流把它们卷上礁石和炮口。',
  },
  byzantium: {
    name: '铁链与火海',
    pitch: '铁链把敌人引进唯一缺口；希腊火漂流蔓延。',
    hint: '守住缺口；你的火油随风漂，久久不散。',
  },
  egypt: {
    name: '法老的岸弓手',
    pitch: '友岸为你齐射；芦苇藏伏兵。',
    hint: '近友岸作战得弓手支援。扫荡芦苇丛。',
  },
  chola: {
    name: '横渡海湾',
    pitch: '远离本土：给养双倍消耗，神庙黄金双倍，季风暴。',
    hint: '给养烧得飞快——但大奖赔双倍。',
  },
  vietnam: {
    name: '白藤江暗桩',
    pitch: '退潮时，暗桩阵对深龙骨露出獠牙。',
    hint: '看潮汐钟：退潮时把深船引进桩阵。',
  },
  aztec: {
    name: '特斯科科堤道',
    pitch: '堤道迷宫——独木舟穿缝而过，双桅船不行。',
    hint: '从缝隙打；西班牙深船搁浅爬行。',
  },
  phoenicia: {
    name: '紫色航线',
    pitch: '在友好港间运货，利润随波次涨。',
    hint: '触友好堡装货，到另一堡卖掉。善待伙伴。',
  },
  hanse: {
    name: '磅金税',
    pitch: '鸣号（F）向护航商船收同盟税——或跟他们全干。',
    hint: '近商船按 F：收税。拒者招来整支护航队。',
  },
  portugal: {
    name: '季风与商站',
    pitch: '风每 3 波反转；商站堡为你疗伤补给。',
    hint: '看季风历；在友好堡旁停留恢复。',
  },
  armada: {
    name: '大风与火船',
    pitch: '大风吹散一切阵型；新月阵护着宝藏。',
    hint: '大风把所有船往下风推。撕开新月阵拿大奖。',
  },
  dutch: {
    name: '流沙',
    pitch: '沙洲漂过特塞尔，搁住英国深龙骨。',
    hint: '你的浅船掠过沙洲——把深水猎手引进沙洲。',
  },
  ottoman: {
    name: '桨冲刺',
    pitch: '冲刺（T）撞——被接舷的桨船划来自由水手。',
    hint: 'T：冲刺爆发，然后桨手力竭。接舷要人，不要金。',
  },
  predread: {
    name: '抢T横头',
    pitch: '纵射艏艉；咬住一靶夹叉测距。',
    hint: '打艏艉 +50%。咬住一敌越打越准。',
  },
  falklands: {
    name: '空袭警报',
    pitch: '飞鱼导弹从屏外掠来——顺浪规避或中弹。',
    hint: '看到空袭箭头？迎着转，保持机动。干扰箔配件有用。',
  },
  somali: {
    name: '劫持与赎金',
    pitch: '被接舷的商船成人质——扣着，赎金滴答涨。',
    hint: '接舷商船，然后活下去：赎金每秒涨。',
  },
};

const id: TraitsDict = {
  golden: {
    name: 'Panji Palsu & Hadiah',
    pitch: 'Kibarkan panji palsu hingga tembakan pertama — hadiahmu menggemukkan tiap rampasan.',
    hint: 'Tahan tembakan agar tak terlihat; tenggelamkan lambung AL untuk menaikkan hadiah.',
  },
  exploration: {
    name: 'Perairan Tak Terpetakan',
    pitch: 'Kabut menyembunyikan peta — layari tiap pulau untuk memetakannya demi emas.',
    hint: 'Petakan pulau demi emas, dan simpan buah di palka melawan skorbut.',
  },
  napoleonic: {
    name: 'Posisi Angin',
    pitch: 'Kapal di atas angin menembak lebih keras — rebut posisi angin, lalu beri isyarat.',
    hint: 'Bertarunglah dari atas angin untuk +25% tembakan; isyarat memperkuat tiap gelombang.',
  },
  barbary: {
    name: 'Upeti atau Perang',
    pitch: 'Seru pedagang (F) untuk menuntut upeti — emas tanpa tempur.',
    hint: 'Tekan F dekat pedagang untuk menuntut upeti. Pembayar yang kausimpan membayar lagi.',
  },
  viking: {
    name: 'Strandhögg',
    pitch: 'Mendaratlah di pantai liar untuk merampok — dorong lepas sebelum pasukan perang.',
    hint: 'Hanyut pelan ke pantai untuk merampok; tekan layar (W) untuk lepas.',
  },
  ironclad: {
    name: 'Sudut Besi',
    pitch: 'Baja miring memantulkan tembakan dari depan; ranjau hanyut di alur.',
    hint: 'Menyerbu haluan duluan: separuh kerusakan dari depan. Awasi ranjau hanyut.',
  },
  ww1: {
    name: 'U-boat & Hidrofon',
    pitch: 'U-boat berjalan menyelam — ping hidrofon menemukan mereka; dobrak mereka.',
    hint: 'Awasi ping: perahu yang ketahuan muncul untuk menyerang. Dobrak mereka.',
  },
  ww2: {
    name: 'Aksi Malam',
    pitch: 'Tiap gelombang genap bertempur malam dengan peluru suar — demi bayaran bahaya.',
    hint: 'Di malam hari musuh menembak separuh jarak. Dekati dan raih bonus.',
  },
  hormuz: {
    name: 'Kunci Rudal',
    pitch: 'Rudal datang menjeritkan nada kunci — belok tajam untuk lepas.',
    hint: 'Nada KUNCI? Belok tajam memotong rudal. Ampuni tanker netral.',
  },
  roman: {
    name: 'Corvus',
    pitch: 'Sentuh musuh dan jembatan berduri jatuh — serbu sekaligus.',
    hint: 'Rapat ke samping: musuh terpaut melambat, dan rampasan menyerbu sendiri.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Dayung bersih menembus garis musuh untuk mengejutkan awaknya.',
    hint: 'Lewat cepat di sisi lambung musuh untuk mengejutkan isi ulangnya.',
  },
  arab: {
    name: 'Tunggangi Muson',
    pitch: 'Muson berbalik menurut kalender — lambung lateen melesat searah angin.',
    hint: 'Berlayarlah searah muson (+laju); hadang jalur dagang bawah angin.',
  },
  chinese: {
    name: 'Benteng Terapung',
    pitch: 'Berlabuh (T atau layar kosong) jadi benteng — atau tuntut upeti kapal.',
    hint: 'T: berlabuh untuk +kerusakan. F dekat pedagang: pakta upeti ganti jarahan.',
  },
  japanese: {
    name: 'Kait & Teppo',
    pitch: 'Musuh mengait dan menyeretmu — balas dengan rentetan teppo haluan (T).',
    hint: 'T: rentetan teppo ke depan. Bunuh pengait cepat atau terseret tenggelam.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Tiap penenggelaman menamai pembalas — bunuh yang bertanda untuk menumpuk Mana.',
    hint: 'Kerabat bertanda memburumu; membunuh mereka menumpuk Mana (kerusakan) — terus beri makan.',
  },
  hawaii: {
    name: 'Satukan Kepulauan',
    pitch: 'Kalahkan kano tiap pulau untuk menjadikannya vasal demi upeti per gelombang.',
    hint: 'Tenggelamkan 3 perahu satu pulau untuk memvasalkannya. Satukan semuanya.',
  },
  macedon: {
    name: 'Menara Pengepungan Terapung',
    pitch: 'Katapel pengepungan mengungguli semua jarak — tapi nyamuk berkerumun.',
    hint: 'Jarakmu luas; ikan kecil mati di lambungmu. Terus berbelok.',
  },
  maya: {
    name: 'Gerilya Karang',
    pitch: 'Lunas Spanyol berdarah di karang; kanomu lewat bebas.',
    hint: 'Bertarunglah di dalam lingkaran karang. Sapa orang asing pertama untuk hadiah.',
  },
  inca: {
    name: 'Humboldt & Spondylus',
    pitch: 'Tunggangi jalur arus; selami ladang kerang demi emas.',
    hint: 'Arus mendorong semua lambung. Berlambat pelan di atas ladang merah muda untuk menyelam.',
  },
  lepanto: {
    name: 'Keroyokan Akbar',
    pitch: 'Tiada akhir menyerbu dalam keroyokan — rantai rampasan demi rampasan.',
    hint: 'Jangkauan serbu jauh; tiap rampasan mendayung orang bebas ke awakmu.',
  },
  korea: {
    name: 'Pasang Myeongnyang',
    pitch: 'Arus selat berbalik — kapal kura-kuramu nyaris tak merasa.',
    hint: 'Pancing musuh ringan ke pasang; ia menyapu mereka ke karang dan meriam.',
  },
  byzantium: {
    name: 'Rantai & Laut Terbakar',
    pitch: 'Rantai menggiring musuh ke satu celah; api Yunani hanyut dan menyebar.',
    hint: 'Jaga celah rantai; licin minyakmu hanyut mengikuti angin dan bertahan.',
  },
  egypt: {
    name: 'Pemanah Pantai Firaun',
    pitch: 'Pantai sahabat menghujani tembakan untukmu; gelagah menyembunyikan penyergap.',
    hint: 'Bertarunglah dekat pantai sahabat demi dukungan pemanah. Sapu gelagah.',
  },
  chola: {
    name: 'Seberang Teluk',
    pitch: 'Jauh dari rumah: tiris perbekalan ganda, emas kuil ganda, badai muson.',
    hint: 'Perbekalan terbakar dua kali cepat — tapi jackpot membayar dua kali lipat.',
  },
  vietnam: {
    name: 'Pancang Bạch Đằng',
    pitch: 'Saat surut rintangan pancang menyeringai untuk lunas dalam.',
    hint: 'Awasi jam pasang: pancing lambung dalam ke pancang saat SURUT.',
  },
  aztec: {
    name: 'Jalan Lintas Texcoco',
    pitch: 'Labirin jalan lintas — kano menyelinap lewat celah yang tak bisa dilewati brigantin.',
    hint: 'Bertarunglah dari celah; lambung Spanyol yang dalam kandas dan merangkak.',
  },
  phoenicia: {
    name: 'Pelayaran Ungu',
    pitch: 'Bawa kargo antar pelabuhan sahabat demi untung berskala gelombang.',
    hint: 'Sentuh benteng sahabat untuk muat, satu lagi untuk jual. Ampuni mitramu.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Seru pedagang konvoi (F) untuk tol Liga — atau lawan mereka semua.',
    hint: 'F dekat pedagang: tuntut tol. Penolak memanggil seluruh konvoi.',
  },
  portugal: {
    name: 'Muson & Feitoria',
    pitch: 'Angin berbalik tiap 3 gelombang; benteng feitoria memperbaiki dan memberimu makan.',
    hint: 'Perhatikan kalender muson; berdiamlah di dekat benteng sahabat untuk pulih.',
  },
  armada: {
    name: 'Topan & Kapal Api',
    pitch: 'Topan mencerai-beraikan tiap formasi; sabit menjaga hartanya.',
    hint: 'Topan mendorong semua lambung ke bawah angin. Retak sabit demi jackpot.',
  },
  dutch: {
    name: 'Pasir Berpindah',
    pitch: 'Beting pasir hanyut melintasi Texel dan mengandaskan lunas Inggris yang dalam.',
    hint: 'Lambung dangkalmu melintasi beting — pancing pemburu dalam ke atasnya.',
  },
  ottoman: {
    name: 'Sprint Dayung',
    pitch: 'Sprint (T) ke dobrakan — galai yang diserbu mendayung orang bebas kepadamu.',
    hint: 'T: ledakan sprint, lalu dayung kelelahan. Serbu demi tangan, bukan emas.',
  },
  predread: {
    name: 'Potong T',
    pitch: 'Sapu haluan dan buritan; kunci satu sasaran untuk mengepung jarak.',
    hint: 'Tembak ke haluan/buritan untuk +50%. Tetap pada satu korban agar makin tepat.',
  },
  falklands: {
    name: 'Peringatan Serangan Udara',
    pitch: 'Exocet melesat dari luar layar — belok mengikuti atau kena.',
    hint: 'Panah serbuan? Belok menghadapinya dan terus bergerak. Fitting sekam membantu.',
  },
  somali: {
    name: 'Bajak & Tebusan',
    pitch: 'Pedagang yang diserbu jadi sandera — tebusan berdetak naik selagi kautahan.',
    hint: 'Serbu pedagang, lalu selamat: tebusan tumbuh tiap detik.',
  },
};

const th: TraitsDict = {
  golden: {
    name: 'ธงปลอม & ค่าหัว',
    pitch: 'ชักธงปลอมจนกว่านัดแรก — ค่าหัวท่านทำให้ทุกรางวัลอ้วนขึ้น',
    hint: 'กลั้นยิงเพื่อซ่อนตัว; จมเรือทัพเรือเพื่อขึ้นค่าหัว',
  },
  exploration: {
    name: 'น่านน้ำไม่สำรวจ',
    pitch: 'หมอกบังแผนที่ — แล่นทุกเกาะเพื่อสำรวจแลกทอง',
    hint: 'สำรวจเกาะแลกทอง เก็บผลไม้ในระวางกันลักปิดลักเปิด',
  },
  napoleonic: {
    name: 'เหนือลม',
    pitch: 'เรือเหนือลมยิงแรงกว่า — ชิงเหนือลม แล้วส่งสัญญาณ',
    hint: 'สู้จากเหนือลม +25% นัด; สัญญาณบัฟทุกคลื่น',
  },
  barbary: {
    name: 'บรรณาการหรือสงคราม',
    pitch: 'เรียกพ่อค้า (F) รีดบรรณาการ — ได้ทองไม่ต้องรบ',
    hint: 'กด F ใกล้พ่อค้าเพื่อรีดบรรณาการ ผู้จ่ายที่ท่านไว้ชีวิตจะจ่ายอีก',
  },
  viking: {
    name: 'สตรานด์เฮิกก์',
    pitch: 'เกยหาดป่าเพื่อปล้น — ถ่ออกก่อนกองรบมา',
    hint: 'ลอยช้าเข้าหาดเพื่อปล้น; กดใบ (W) เพื่อถ่ออก',
  },
  ironclad: {
    name: 'มุมเหล็ก',
    pitch: 'เกราะเอียงสะท้อนนัดจากหน้า; ทุ่นระเบิดลอยในร่องน้ำ',
    hint: 'ชนหัวเข้า: ดาเมจหน้าครึ่งเดียว ระวังทุ่นลอย',
  },
  ww1: {
    name: 'อูโบ๊ต & ไฮโดรโฟน',
    pitch: 'อูโบ๊ตดำน้ำ — เสียงปิงไฮโดรโฟนหาเจอ; ชนมัน',
    hint: 'ฟังเสียงปิง: เรือที่โผล่ขึ้นมาโจมตี ชนมัน',
  },
  ww2: {
    name: 'รบกลางคืน',
    pitch: 'ทุกคลื่นคู่รบกลางคืนด้วยพลุส่องสว่าง — แลกค่าอันตราย',
    hint: 'กลางคืนศัตรูยิงครึ่งระยะ เข้าใกล้แล้วรับโบนัส',
  },
  hormuz: {
    name: 'ล็อคขีปนาวุธ',
    pitch: 'ขีปนาวุธมาร้องเสียงล็อค — หักเลี้ยวแรงเพื่อหลุด',
    hint: 'เสียงล็อค? หักขวางขีปนาวุธ ไว้ชีวิตเรือน้ำมันกลาง',
  },
  roman: {
    name: 'คอร์วุส',
    pitch: 'แตะศัตรู สะพานหนามหล่น — ยึดทันที',
    hint: 'เบียดข้าง: ศัตรูถูกเกี่ยวช้าลง รางวัลยึดตัวเอง',
  },
  greek: {
    name: 'ดีเอ็กพลูส',
    pitch: 'พายทะลุแนวศัตรูให้ลูกเรือมึน',
    hint: 'แล่นเร็วข้างตัวเรือศัตรูเพื่อช็อกการบรรจุ',
  },
  arab: {
    name: 'ขี่มรสุม',
    pitch: 'มรสุมกลับตามปฏิทิน — ตัวเรือเลทีนบินตามลม',
    hint: 'แล่นตามมรสุม (+ความเร็ว); ซุ่มเส้นทางค้าลมใต้',
  },
  chinese: {
    name: 'ป้อมลอยน้ำ',
    pitch: 'ทอดสมอ (T หรือใบเปล่า) เป็นป้อม — หรือรีดเรือบรรณาการ',
    hint: 'T: ทอดสมอ +ดาเมจ F ใกล้พ่อค้า: สัญญาบรรณาการแทนปล้น',
  },
  japanese: {
    name: 'ตะขอ & เท็ปโป',
    pitch: 'ศัตรูเกี่ยวลากท่าน — ตอบด้วยระดมเท็ปโปหัวเรือ (T)',
    hint: 'T: ระดมเท็ปโปข้างหน้า ฆ่าตัวเกี่ยวเร็วไม่งั้นโดนลากจม',
  },
  maori: {
    name: 'อูตู',
    pitch: 'ทุกการจมตั้งชื่อผู้แก้แค้น — ฆ่าตัวหมายเพื่อสะสมมานา',
    hint: 'ญาติหมายหัวล่าท่าน; ฆ่าพวกมันสะสมมานา (ดาเมจ) — ป้อนต่ออย่าหยุด',
  },
  hawaii: {
    name: 'รวมหมู่เกาะ',
    pitch: 'ปราบแคนูทุกเกาะให้เป็นเมืองขึ้นส่งบรรณาการทุกคลื่น',
    hint: 'จมเรือเกาะเดียว 3 ลำให้สวามิภักดิ์ รวมให้หมด',
  },
  macedon: {
    name: 'หอรบประชิดลอยน้ำ',
    pitch: 'เครื่องยิงประชิดไกลสุด — แต่ยุงรุม',
    hint: 'ระยะท่านกว้าง; ปลาเล็กตายที่ตัวเรือ หมุนตลอด',
  },
  maya: {
    name: 'กองโจรแนวปะการัง',
    pitch: 'กระดูกงูสเปนเลือดออกบนปะการัง; แคนูท่านผ่านฟรี',
    hint: 'สู้ในวงปะการัง ทักคนแปลกหน้าคนแรกเพื่อของขวัญ',
  },
  inca: {
    name: 'ฮุมโบลดต์ & สปอนดิลัส',
    pitch: 'ขี่ร่องกระแส; ดำแปลงหอยเอาทอง',
    hint: 'กระแสผลักทุกตัวเรือ ลอยช้าเหนือแปลงชมพูเพื่อดำ',
  },
  lepanto: {
    name: 'ตะลุมบอนใหญ่',
    pitch: 'ยึดเรือไม่รู้จบในตะลุมบอน — โซ่รางวัลต่อรางวัล',
    hint: 'ระยะยึดไกล; ทุกรางวัลพายคนอิสระเข้าลูกเรือท่าน',
  },
  korea: {
    name: 'น้ำเมียงนยัง',
    pitch: 'กระแสช่องแคบกลับ — เรือเต่าท่านแทบไม่รู้สึก',
    hint: 'ล่อศัตรูเบาเข้ากระแส; มันกวาดพวกมันชนหินและปืน',
  },
  byzantium: {
    name: 'โซ่ & ทะเลเพลิง',
    pitch: 'โซ่ต้อนศัตรูเข้าช่องเดียว; กรีกไฟลอยกระจาย',
    hint: 'เฝ้าช่องโซ่; คราบน้ำมันท่านลอยตามลมและอยู่นาน',
  },
  egypt: {
    name: 'พลธนูชายฝั่งฟาโรห์',
    pitch: 'ฝั่งมิตรระดมยิงให้ท่าน; กกซ่อนตัวซุ่ม',
    hint: 'สู้ใกล้ฝั่งมิตรเพื่อพลธนูช่วย กวาดดงกก',
  },
  chola: {
    name: 'ข้ามอ่าว',
    pitch: 'ไกลบ้าน: เสบียงหมดสองเท่า ทองวัดสองเท่า พายุมรสุม',
    hint: 'เสบียงเผาเร็วสองเท่า — แต่แจ็กพอตจ่ายสองเท่า',
  },
  vietnam: {
    name: 'หลักไม้บักดั่ง',
    pitch: 'น้ำลงแนวกั้นหลักแยกเขี้ยวใส่กระดูกงูลึก',
    hint: 'ดูนาฬิกาน้ำ: ล่อตัวเรือลึกเข้าหลักตอนน้ำลง',
  },
  aztec: {
    name: 'ทางยกระดับเตซโกโก',
    pitch: 'เขาวงกตทางยกระดับ — แคนูรอดช่องที่บริกันทีนไม่ได้',
    hint: 'สู้จากช่อง; ตัวเรือสเปนลึกเกยตื้นคลาน',
  },
  phoenicia: {
    name: 'เส้นทางม่วง',
    pitch: 'ขนสินค้าระหว่างท่ามิตรเพื่อกำไรตามคลื่น',
    hint: 'แตะป้อมมิตรเพื่อบรรทุก อีกป้อมเพื่อขาย ไว้ชีวิตหุ้นส่วน',
  },
  hanse: {
    name: 'ฟุนด์เกิลด์',
    pitch: 'เรียกพ่อค้าขบวน (F) เก็บค่าผ่านลีก — หรือสู้ทั้งหมด',
    hint: 'F ใกล้พ่อค้า: รีดค่าผ่าน ผู้ปฏิเสธเรียกทั้งขบวน',
  },
  portugal: {
    name: 'มรสุม & เฟโตเรีย',
    pitch: 'ลมกลับทุก 3 คลื่น; ป้อมเฟโตเรียซ่อมและเลี้ยงท่าน',
    hint: 'ดูปฏิทินมรสุม; วนใกล้ป้อมมิตรเพื่อฟื้น',
  },
  armada: {
    name: 'พายุ & เรือไฟ',
    pitch: 'พายุสลายทุกขบวน; เสี้ยวจันทร์คุ้มสมบัติ',
    hint: 'พายุดันทุกตัวเรือลงลม ฉีกเสี้ยวจันทร์เอาแจ็กพอต',
  },
  dutch: {
    name: 'ทรายเลื่อน',
    pitch: 'สันทรายลอยข้ามเท็กเซล เกยกระดูกงูอังกฤษลึก',
    hint: 'ตัวเรือตื้นท่านข้ามสัน — ล่อนักล่าลึกขึ้นสัน',
  },
  ottoman: {
    name: 'สปรินต์พาย',
    pitch: 'สปรินต์ (T) เข้าชน — แกลลีย์ที่ยึดพายคนอิสระมาหาท่าน',
    hint: 'T: ระเบิดสปรินต์ แล้วพายหมดแรง ยึดเอาคน ไม่เอาทอง',
  },
  predread: {
    name: 'ตัดตัว T',
    pitch: 'ยิงกราดหัวท้าย; เกาะเป้าเดียวเพื่อคร่อมระยะ',
    hint: 'ยิงหัว/ท้าย +50% เกาะเหยื่อเดียวเพื่อแม่นขึ้น',
  },
  falklands: {
    name: 'เตือนโจมตีอากาศ',
    pitch: 'เอ็กโซเซต์พุ่งจากนอกจอ — เลี้ยวตามหรือโดน',
    hint: 'ลูกศรโจมตี? เลี้ยวใส่และเคลื่อนต่อ อุปกรณ์แกลบช่วย',
  },
  somali: {
    name: 'จี้ & ค่าไถ่',
    pitch: 'พ่อค้าที่ยึดเป็นตัวประกัน — ค่าไถ่ขึ้นขณะท่านยึด',
    hint: 'ยึดพ่อค้า แล้วรอด: ค่าไถ่โตทุกวินาที',
  },
};

const vi: TraitsDict = {
  golden: {
    name: 'Cờ Giả & Tiền Thưởng',
    pitch: 'Treo cờ giả tới phát đầu — tiền thưởng làm mọi tàu mồi béo lên.',
    hint: 'Nén bắn để ẩn mình; đánh chìm tàu hải quân để tăng thưởng.',
  },
  exploration: {
    name: 'Vùng Nước Chưa Vẽ',
    pitch: 'Sương che hải đồ — dong tới từng đảo để vẽ lấy vàng.',
    hint: 'Vẽ đảo lấy vàng, trữ trái cây trong hầm chống scorbut.',
  },
  napoleonic: {
    name: 'Lợi Thế Đầu Gió',
    pitch: 'Tàu đầu gió bắn mạnh hơn — giành đầu gió, rồi phát hiệu.',
    hint: 'Đánh từ đầu gió +25% đạn; hiệu lệnh tăng sức mỗi đợt.',
  },
  barbary: {
    name: 'Cống Nạp Hay Chiến Tranh',
    pitch: 'Gọi hàng (F) đòi cống — vàng không cần đánh.',
    hint: 'Nhấn F gần thương thuyền đòi cống. Kẻ nộp được tha sẽ nộp nữa.',
  },
  viking: {
    name: 'Strandhögg',
    pitch: 'Cắm bãi hoang để cướp — chống ra trước khi toán chiến tới.',
    hint: 'Trôi chậm vào bãi để cướp; nhấn buồm (W) để chống ra.',
  },
  ironclad: {
    name: 'Góc Sắt',
    pitch: 'Giáp nghiêng đỡ đạn chính diện; thủy lôi trôi trên luồng.',
    hint: 'Xông mũi vào: nửa sát thương chính diện. Coi chừng lôi trôi.',
  },
  ww1: {
    name: 'U-boat & Thủy Âm',
    pitch: 'U-boat chạy ngầm — tiếng ping thủy âm tìm ra; đâm chúng.',
    hint: 'Nghe tiếng ping: tàu lộ diện trồi lên đánh. Đâm chúng.',
  },
  ww2: {
    name: 'Đánh Đêm',
    pitch: 'Mọi đợt chẵn đánh đêm bằng đạn chiếu sáng — lĩnh phụ cấp hiểm nguy.',
    hint: 'Ban đêm địch bắn nửa tầm. Áp sát lĩnh thưởng.',
  },
  hormuz: {
    name: 'Khóa Tên Lửa',
    pitch: 'Tên lửa tới réo tiếng khóa — bẻ gấp để cắt khóa.',
    hint: 'Nghe KHÓA? Bẻ gấp cắt ngang tên lửa. Tha tàu dầu trung lập.',
  },
  roman: {
    name: 'Cầu Corvus',
    pitch: 'Chạm địch, cầu đinh sập — xung kích ngay.',
    hint: 'Cặp mạn: địch bị móc chậm lại, tàu mồi tự xung kích.',
  },
  greek: {
    name: 'Xuyên Trận Diekplous',
    pitch: 'Chèo xuyên tuyến địch làm thủy thủ hoảng loạn.',
    hint: 'Lướt nhanh ngang mạn địch để phá nạp đạn.',
  },
  arab: {
    name: 'Cưỡi Gió Mùa',
    pitch: 'Gió mùa đảo theo lịch — thân buồm latin bay xuôi gió.',
    hint: 'Dong xuôi gió mùa (+tốc độ); phục kích tuyến buôn dưới gió.',
  },
  chinese: {
    name: 'Pháo Đài Nổi',
    pitch: 'Thả neo (T hoặc buồm trần) thành pháo đài — hay đòi tàu cống nạp.',
    hint: 'T: thả neo +sát thương. F gần thương thuyền: ước cống thay cướp.',
  },
  japanese: {
    name: 'Móc & Súng Teppo',
    pitch: 'Địch móc kéo bạn — đáp bằng loạt teppo mũi (T).',
    hint: 'T: loạt teppo phía trước. Diệt tàu móc nhanh kẻo bị lôi chìm.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Mỗi lần đánh chìm chỉ mặt kẻ báo thù — diệt kẻ bị đánh dấu để chồng Mana.',
    hint: 'Họ hàng bị đánh dấu săn bạn; diệt chúng chồng Mana (sát thương) — nuôi liên tục.',
  },
  hawaii: {
    name: 'Thống Nhất Quần Đảo',
    pitch: 'Đánh bại xuồng từng đảo bắt chư hầu nộp cống mỗi đợt.',
    hint: 'Chìm 3 thuyền một đảo để bắt thần phục. Thống nhất tất cả.',
  },
  macedon: {
    name: 'Tháp Công Thành Nổi',
    pitch: 'Máy bắn công thành tầm xa vô đối — nhưng muỗi bu đầy.',
    hint: 'Tầm bạn bao la; tép riu chết ở mạn. Xoay liên tục.',
  },
  maya: {
    name: 'Du Kích Rạn San Hô',
    pitch: 'Sống tàu Tây Ban Nha rướm máu trên rạn; xuồng bạn qua tự do.',
    hint: 'Đánh trong vòng rạn. Gọi người lạ đầu tiên xin quà.',
  },
  inca: {
    name: 'Humboldt & Spondylus',
    pitch: 'Cưỡi luồng hải lưu; lặn bãi sò lấy vàng.',
    hint: 'Hải lưu đẩy mọi thân. Lững thững trên bãi hồng để lặn.',
  },
  lepanto: {
    name: 'Hỗn Chiến Lớn',
    pitch: 'Xung kích bất tận trong hỗn chiến — xâu tàu mồi nối nhau.',
    hint: 'Tầm xung kích xa; mỗi tàu mồi chèo người tự do về đội bạn.',
  },
  korea: {
    name: 'Thủy Triều Myeongnyang',
    pitch: 'Dòng eo đảo chiều — thuyền rùa của bạn hầu như không cảm.',
    hint: 'Dụ địch nhẹ vào triều; triều quét chúng lên đá và họng pháo.',
  },
  byzantium: {
    name: 'Xích & Biển Lửa',
    pitch: 'Xích dồn địch vào một cửa; lửa Hy Lạp trôi lan.',
    hint: 'Giữ cửa xích; váng dầu của bạn trôi theo gió và đọng lâu.',
  },
  egypt: {
    name: 'Cung Thủ Bờ Của Pharaoh',
    pitch: 'Bờ bạn trút mưa tên giúp bạn; lau sậy giấu quân phục.',
    hint: 'Đánh gần bờ bạn để có cung yểm trợ. Quét bãi sậy.',
  },
  chola: {
    name: 'Vượt Vịnh',
    pitch: 'Xa nhà: hao lương gấp đôi, vàng đền gấp đôi, bão gió mùa.',
    hint: 'Lương cháy nhanh gấp đôi — nhưng jackpot trả gấp đôi.',
  },
  vietnam: {
    name: 'Cọc Bạch Đằng',
    pitch: 'Nước ròng, bãi cọc nhe nanh với sống sâu.',
    hint: 'Coi đồng hồ thủy triều: dụ thân sâu lên cọc lúc NƯỚC RÒNG.',
  },
  aztec: {
    name: 'Đường Đắp Texcoco',
    pitch: 'Mê cung đường đắp — xuồng luồn khe mà brigantine chịu.',
    hint: 'Đánh từ khe; thân sâu Tây Ban Nha mắc cạn bò lết.',
  },
  phoenicia: {
    name: 'Tuyến Tím',
    pitch: 'Chở hàng giữa cảng bạn để lãi theo đợt.',
    hint: 'Chạm đồn bạn để chất hàng, đồn khác để bán. Tha đối tác.',
  },
  hanse: {
    name: 'Thuế Pfundgeld',
    pitch: 'Gọi thương thuyền đoàn (F) thu thuế Liên minh — hoặc đánh tất.',
    hint: 'F gần thương thuyền: đòi thuế. Kẻ từ chối gọi cả đoàn.',
  },
  portugal: {
    name: 'Gió Mùa & Feitoria',
    pitch: 'Gió đảo mỗi 3 đợt; đồn feitoria sửa và nuôi bạn.',
    hint: 'Coi lịch gió mùa; lảng vảng gần đồn bạn để hồi.',
  },
  armada: {
    name: 'Bão & Tàu Lửa',
    pitch: 'Bão phá mọi đội hình; vành trăng khuyết giữ kho báu.',
    hint: 'Bão đẩy mọi thân xuống gió. Xé vành trăng lấy jackpot.',
  },
  dutch: {
    name: 'Cát Trôi',
    pitch: 'Bãi cát trôi qua Texel, mắc cạn sống sâu Anh.',
    hint: 'Thân cạn của bạn lướt bãi — dụ thợ săn sâu lên bãi.',
  },
  ottoman: {
    name: 'Bứt Tốc Chèo',
    pitch: 'Bứt tốc (T) vào cú đâm — thuyền chèo bị xung kích chèo người tự do về bạn.',
    hint: 'T: bứt tốc bùng nổ, rồi tay chèo kiệt sức. Xung kích lấy người, không lấy vàng.',
  },
  predread: {
    name: 'Cắt Chữ T',
    pitch: 'Quét dọc mũi lái; bám một mục tiêu để kẹp tầm.',
    hint: 'Bắn mũi/lái +50%. Bám một con mồi để ngắm chuẩn dần.',
  },
  falklands: {
    name: 'Báo Động Không Kích',
    pitch: 'Exocet xé từ ngoài màn hình — ngoặt theo hoặc trúng đạn.',
    hint: 'Thấy mũi tên đột kích? Ngoặt đón và di chuyển liên tục. Đồ chaff đỡ được.',
  },
  somali: {
    name: 'Cướp & Tiền Chuộc',
    pitch: 'Thương thuyền bị xung kích thành con tin — tiền chuộc nhích lên trong lúc bạn giữ.',
    hint: 'Xung kích thương thuyền, rồi sống sót: tiền chuộc tăng mỗi giây.',
  },
};

const ar: TraitsDict = {
  golden: {
    name: 'أعلام زائفة وجائزة',
    pitch: 'ارفع أعلامًا زائفة حتى أول طلقة — جائزتك تُسمّن كل غنيمة.',
    hint: 'احبس النار لتبقى خفيًا؛ أغرق أبدان البحرية لترفع جائزتك.',
  },
  exploration: {
    name: 'مياه مجهولة',
    pitch: 'الضباب يخفي الخريطة — أبحر إلى كل جزيرة لرسمها مقابل ذهب.',
    hint: 'ارسم الجزر مقابل ذهب، واحتفظ بالفاكهة في العنابر ضد الإسقربوط.',
  },
  napoleonic: {
    name: 'جهة الريح',
    pitch: 'السفينة في مهب الريح تضرب أقوى — ناور للجهة ثم أشر.',
    hint: 'قاتل من مهب الريح لـ+25% قذف؛ إشارة تعزز كل موجة.',
  },
  barbary: {
    name: 'جزية أو حرب',
    pitch: 'نادِ التجار (F) مطالبًا بالجزية — ذهب دون قتال.',
    hint: 'اضغط F قرب تاجر لطلب الجزية. من يدفع وتعفو عنه يدفع مجددًا.',
  },
  viking: {
    name: 'الغارة الساحلية',
    pitch: 'ارشُ على شاطئ برّي لنهبه — وادفع عن الشاطئ قبل فرقة الحرب.',
    hint: 'انجرف ببطء إلى الشاطئ للنهب؛ اضغط الشراع (W) للدفع.',
  },
  ironclad: {
    name: 'زوايا الحديد',
    pitch: 'الدروع المائلة تصدّ القذف من الأمام؛ والألغام تنجرف في القنوات.',
    hint: 'اهجم بالمقدمة: نصف الضرر من الأمام. واحذر الألغام المنجرفة.',
  },
  ww1: {
    name: 'غواصات وسماعات مائية',
    pitch: 'الغواصات تسير مغمورة — رنين السماعة يجدها؛ اصدمها.',
    hint: 'راقب الرنين: الزوارق المكشوفة تطفو للهجوم. اصدمها.',
  },
  ww2: {
    name: 'معارك ليلية',
    pitch: 'كل موجة زوجية تُخاض ليلًا على ضوء القذائف النجمية — مقابل أجر الخطر.',
    hint: 'ليلًا يطلق العدو نصف المدى. اقترب واكسب المكافأة.',
  },
  hormuz: {
    name: 'قفل الصواريخ',
    pitch: 'الصواريخ القادمة تصرخ بنغمة قفل — استدر بحدة لكسر القفل.',
    hint: 'نغمة القفل؟ استدر بحدة عبر الصاروخ. واعفُ عن الناقلات المحايدة.',
  },
  roman: {
    name: 'الغراب',
    pitch: 'المس عدوًا فيسقط الجسر المشوك — واستولِ عليها فورًا.',
    hint: 'اصدم جنبًا: الأعداء المقيدون يتباطؤون، والغنائم تستولي على نفسها.',
  },
  greek: {
    name: 'العبور المزدوج',
    pitch: 'جِدّف مخترقًا خط العدو لتصعق طاقمه.',
    hint: 'مرّ بسرعة بمحاذاة بدن العدو من جانب لآخر لتصعق تلقيمه.',
  },
  arab: {
    name: 'امتطِ الموسم',
    pitch: 'الموسم ينعكس حسب التقويم — والأبدان اللاتينية تطير مع الريح.',
    hint: 'أبحر مع الموسم (+سرعة)؛ واكمن لطرق التجارة في مهب الريح.',
  },
  chinese: {
    name: 'القلعة العائمة',
    pitch: 'ألقِ المرساة (T أو أشرعة مطوية) لتصبح قلعة — أو نادِ سفن الجزية.',
    hint: 'T: ألقِ المرساة لـ+ضرر. F قرب تاجر: ميثاق جزية بدل النهب.',
  },
  japanese: {
    name: 'خطاطيف وتيبو',
    pitch: 'الأعداء يتشبثون بك ويجرّونك — فأجب بوابل تيبو (T).',
    hint: 'T: وابل تيبو للأمام. اقتل المتشبثين سريعًا وإلا جرّوك للأسفل.',
  },
  maori: {
    name: 'الثأر',
    pitch: 'كل إغراق يسمّي منتقمين — اقتل المعلَّمين لتكدّس المانا.',
    hint: 'الأقارب المعلَّمون يطاردونك؛ قتلهم يكدّس المانا (ضرر) — استمر في إطعامه.',
  },
  hawaii: {
    name: 'وحّد الجزر',
    pitch: 'اهزم زوارق كل جزيرة لتجعلها تابعة بجزية كل موجة.',
    hint: 'أغرق 3 زوارق لجزيرة واحدة لتتبعك. وحّدها كلها.',
  },
  macedon: {
    name: 'برج حصار عائم',
    pitch: 'مقاليع الحصار أطول مدى من كل شيء — لكن البعوض يحتشد.',
    hint: 'مداك شاسع؛ والصغار يموتون على بدنك. استمر في الالتفاف.',
  },
  maya: {
    name: 'حرب الشعاب',
    pitch: 'العوارض الإسبانية تنزف على الشعاب؛ وزوارقك تمرّ حرّة.',
    hint: 'قاتل داخل حلقة الشعاب. نادِ أول غريب لهدية.',
  },
  inca: {
    name: 'همبولت والإسبونديلوس',
    pitch: 'امتطِ ممرات التيار؛ واغُص في مراقد الأصداف لذهب.',
    hint: 'التيارات تدفع كل الأبدان. تمهّل ببطء فوق المراقد الوردية للغوص.',
  },
  lepanto: {
    name: 'الملحمة الكبرى',
    pitch: 'لا نهاية للاستيلاء في الملحمة — سلسل غنيمة إلى غنيمة.',
    hint: 'مدى الاستيلاء طويل؛ وكل غنيمة تجدّف برجال محررين إلى طاقمك.',
  },
  korea: {
    name: 'مدّ ميونغنيانغ',
    pitch: 'تيار المضيق ينعكس — وسفينة السلحفاة بالكاد تشعر به.',
    hint: 'أغوِ الأعداء الخفاف إلى المدّ؛ يجرفهم إلى الصخور والمدافع.',
  },
  byzantium: {
    name: 'السلسلة والبحر المحترق',
    pitch: 'السلسلة توجّه العدو إلى فجوة واحدة؛ والنار الإغريقية تنجرف وتنتشر.',
    hint: 'امسك فجوة السلسلة؛ بقعك تنجرف مع الريح وتبقى.',
  },
  egypt: {
    name: 'رماة شاطئ فرعون',
    pitch: 'الشواطئ الصديقة تمطر وابلًا لأجلك؛ والقصب يخفي الكمائن.',
    hint: 'قاتل قرب الشواطئ الصديقة لدعم الرماة. وامسح القصب.',
  },
  chola: {
    name: 'عبر الخليج',
    pitch: 'بعيدًا عن الديار: استنزاف مضاعف للمؤن، وذهب معابد مضاعف، وعواصف موسمية.',
    hint: 'المخازن تحترق بسرعة مضاعفة — لكن الجوائز الكبرى تدفع ضعفًا.',
  },
  vietnam: {
    name: 'أوتاد باك دانغ',
    pitch: 'عند الجزر تكشّر حواجز الأوتاد عن أنيابها للعوارض العميقة.',
    hint: 'راقب ساعة المدّ: أغوِ الأبدان العميقة فوق الأوتاد عند الجزر.',
  },
  aztec: {
    name: 'جسور تيسكوكو',
    pitch: 'متاهة جسور — الزوارق تنسلّ من الفجوات التي لا تسع البريغانتينات.',
    hint: 'قاتل من الفجوات؛ الأبدان الإسبانية العميقة تعلق وتزحف.',
  },
  phoenicia: {
    name: 'رحلة الأرجوان',
    pitch: 'انقل البضائع بين المرافئ الصديقة لربح يتصاعد مع الموج.',
    hint: 'المس حصنًا صديقًا للتحميل، وآخر للبيع. واعفُ عن شركائك.',
  },
  hanse: {
    name: 'ضريبة الرابطة',
    pitch: 'نادِ تجار القوافل (F) لضريبة الرابطة — أو قاتلهم جميعًا.',
    hint: 'F قرب تاجر: اطلب الضريبة. الرافضون يستدعون القافلة كلها.',
  },
  portugal: {
    name: 'الموسم والفيتوريا',
    pitch: 'الريح تنعكس كل 3 أمواج؛ وحصون الفيتوريا تصلحك وتطعمك.',
    hint: 'انتبه لتقويم الموسم؛ وتمهّل قرب الحصون الصديقة للتعافي.',
  },
  armada: {
    name: 'عواصف وسفن نار',
    pitch: 'العواصف تبعثر كل تشكيل؛ والهلال يحرس كنزه.',
    hint: 'العواصف تدفع كل الأبدان مع الريح. اكسر الهلال للجائزة الكبرى.',
  },
  dutch: {
    name: 'رمال متحركة',
    pitch: 'الضحالة الرملية تنجرف عبر التكسل وتُعلِق العوارض الإنجليزية العميقة.',
    hint: 'بدنك الضحل ينزلق فوق الضحالة — أغوِ الصيادين العميقين إليها.',
  },
  ottoman: {
    name: 'اندفاع المجاديف',
    pitch: 'اندفع (T) نحو الصدم — والقوادس المستولى عليها تجدّف برجال محررين إليك.',
    hint: 'T: دفعة اندفاع، ثم مجاديف منهكة. استولِ للأيدي لا للذهب.',
  },
  predread: {
    name: 'اعبر الـT',
    pitch: 'امسح المقدمات والمؤخرات؛ وثبّت على هدف واحد لتحديد المدى.',
    hint: 'أطلق على المقدمة/المؤخرة لـ+50%. والزم ضحية واحدة لتصويب أدق.',
  },
  falklands: {
    name: 'تحذير غارة جوية',
    pitch: 'الإكزوسيه تنطلق من خارج الشاشة — امشط الأثر وإلا أُصبت.',
    hint: 'سهم الغارة؟ استدر نحوه واستمر في الحركة. تجهيزات التشويش تساعد.',
  },
  somali: {
    name: 'خطف وفدية',
    pitch: 'التجار المستولى عليهم يصبحون رهائن — والفدية تتصاعد ما دمت ممسكًا.',
    hint: 'استولِ على التجار ثم انجُ: الفدية تنمو كل ثانية.',
  },
};

const sw: TraitsDict = {
  golden: {
    name: 'Bendera za Uongo na Zawadi',
    pitch: 'Paa bendera za uongo hadi risasi ya kwanza — zawadi yako hunenepesha kila teka.',
    hint: 'Zuia moto ubaki usionekane; zamisha meli za jeshi kuinua zawadi yako.',
  },
  exploration: {
    name: 'Maji Yasiyojulikana',
    pitch: 'Ukungu huficha ramani — safiri hadi kila kisiwa ukichore kwa dhahabu.',
    hint: 'Chora visiwa kwa dhahabu, na uweke matunda galani dhidi ya kiseyeye.',
  },
  napoleonic: {
    name: 'Upande wa Upepo',
    pitch: 'Meli ya juu ya upepo hupiga kwa nguvu — pindua kwa upande, kisha ashiria.',
    hint: 'Pigana kutoka juu ya upepo kwa +25% risasi; ishara huimarisha kila wimbi.',
  },
  barbary: {
    name: 'Kodi au Vita',
    pitch: 'Waita wafanyabiashara (F) kudai kodi — dhahabu bila pigano.',
    hint: 'Bonyeza F karibu na mfanyabiashara kudai kodi. Wanaolipa ukiwaacha watalipa tena.',
  },
  viking: {
    name: 'Uvamizi wa Ufukwe',
    pitch: 'Panda ufukwe wa pori kuuvamia — sukuma kuondoka kabla ya kikosi cha vita.',
    hint: 'Elea polepole ufukwoni kuvamia; bonyeza tanga (W) kusukuma kuondoka.',
  },
  ironclad: {
    name: 'Pembe za Chuma',
    pitch: 'Silaha zilizoinama huzuia risasi kutoka mbele; mabomu huelea kwenye mifereji.',
    hint: 'Shambulia kwa pua: nusu uharibifu kutoka mbele. Jihadhari na mabomu yanayoelea.',
  },
  ww1: {
    name: 'Manowari na Haidrofoni',
    pitch: 'Manowari hukimbia chini ya maji — mlio wa haidrofoni huzipata; zigonge.',
    hint: 'Tazama mlio: boti zilizofichuliwa zinaibuka kushambulia. Zigonge.',
  },
  ww2: {
    name: 'Mapigano ya Usiku',
    pitch: 'Kila wimbi la pili hupiganwa usiku kwa makombora ya nyota — kwa malipo ya hatari.',
    hint: 'Usiku adui hupiga nusu masafa. Karibia na upate bonasi.',
  },
  hormuz: {
    name: 'Kufungwa kwa Roketi',
    pitch: 'Roketi zinazoingia hupiga sauti ya kufungwa — geuka vikali kuvunja kufungwa.',
    hint: 'Sauti ya KUFUNGWA? Geuka vikali kuvuka roketi. Waache meli za mafuta zisizoegemea upande.',
  },
  roman: {
    name: 'Korvus',
    pitch: 'Mguse adui na daraja lenye miiba linaanguka — mteke papo hapo.',
    hint: 'Gonga ubavu: maadui walioshikwa hupungua kasi, na mateka hujiteka.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Vuta moja kwa moja kupitia mstari wa adui kumshitua mabaharia wake.',
    hint: 'Pita kwa kasi kando ya mwili wa adui kutoka ubavu hadi ubavu kumshitua upakiaji wake.',
  },
  arab: {
    name: 'Panda Musimu',
    pitch: 'Musimu hubadilika kwa kalenda — meli za tanga za lateen huruka na upepo.',
    hint: 'Safiri na musimu (+kasi); wavizie njia za biashara za chini ya upepo.',
  },
  chinese: {
    name: 'Ngome Inayoelea',
    pitch: 'Tia nanga (T au nguzo tupu) uwe ngome — au waita meli za kodi.',
    hint: 'T: tia nanga kwa +uharibifu. F karibu na mfanyabiashara: mkataba wa kodi badala ya nyara.',
  },
  japanese: {
    name: 'Ndoano na Teppo',
    pitch: 'Maadui hukushika na kukuvuta — jibu na mvua ya teppo (T).',
    hint: 'T: mvua ya teppo mbele. Waua wanaokushika haraka au utavutwa chini.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Kila kuzamisha hutaja walipiza kisasi — waua waliowekwa alama kujaza Mana.',
    hint: 'Jamaa waliowekwa alama wanakuwinda; kuwaua hujaza Mana (uharibifu) — endelea kuilisha.',
  },
  hawaii: {
    name: 'Unganisha Visiwa',
    pitch: 'Yashinde mitumbwi ya kila kisiwa ukiyafanya kibaraka kwa kodi ya kila wimbi.',
    hint: 'Zamisha boti 3 za kisiwa kimoja kukifanya kibaraka. Viunganishe vyote.',
  },
  macedon: {
    name: 'Mnara wa Kuzingira Unaowelea',
    pitch: 'Manati ya kuzingira yana masafa kuliko vyote — lakini mbu huzagaa.',
    hint: 'Masafa yako ni makubwa; wadogo hufa kwenye mwili wako. Endelea kugeuka.',
  },
  maya: {
    name: 'Ugaidi wa Miamba',
    pitch: 'Meli za Kihispania hutokwa damu kwenye miamba; mitumbwi yako hupita huru.',
    hint: 'Pigana ndani ya pete ya miamba. Mwaita mgeni wa kwanza kwa zawadi.',
  },
  inca: {
    name: 'Humboldt na Spondylus',
    pitch: 'Panda njia za mikondo; zamia kwenye matanda ya makome kwa dhahabu.',
    hint: 'Mikondo husukuma meli zote. Kaa polepole juu ya matanda ya waridi kuzamia.',
  },
  lepanto: {
    name: 'Mapigano Makuu',
    pitch: 'Hakuna mwisho wa kuteka kwenye mapigano — unganisha teka hadi teka.',
    hint: 'Ufikiaji wa kuteka ni mrefu; kila teka huwavuta watu walioachiliwa kwa mabaharia wako.',
  },
  korea: {
    name: 'Wimbi la Myeongnyang',
    pitch: 'Mkondo wa mlango hubadilika — meli yako ya kobe hauskii.',
    hint: 'Vutia maadui wepesi kwenye wimbi; huwasomba kwenye miamba na mizinga.',
  },
  byzantium: {
    name: 'Mnyororo na Bahari Inayowaka',
    pitch: 'Mnyororo huingiza adui kwenye pengo moja; moto wa Kigiriki huelea na kuenea.',
    hint: 'Shika pengo la mnyororo; mafuta yako huelea na upepo na hudumu.',
  },
  egypt: {
    name: 'Wapiga Mishale wa Ufukwe wa Farao',
    pitch: 'Fukwe za kirafiki hupiga mvua kwa ajili yako; matete huficha wanaovizia.',
    hint: 'Pigana karibu na fukwe za kirafiki kwa msaada wa wapiga mishale. Fagia matete.',
  },
  chola: {
    name: 'Kuvuka Ghuba',
    pitch: 'Mbali na nyumbani: matumizi mara mbili ya akiba, dhahabu mara mbili ya hekalu, dhoruba za musimu.',
    hint: 'Akiba huungua mara mbili haraka — lakini zawadi kubwa hulipa mara mbili.',
  },
  vietnam: {
    name: 'Vigingi vya Bạch Đằng',
    pitch: 'Maji yakishuka vizuizi vya vigingi hufunua meno yake kwa meli za kina kirefu.',
    hint: 'Tazama saa ya wimbi: vutia meli za kina kirefu juu ya vigingi maji YAKISHUKA.',
  },
  aztec: {
    name: 'Madaraja ya Texcoco',
    pitch: 'Mtego wa madaraja — mitumbwi hupenya mapengo ambayo brigantini haziwezi.',
    hint: 'Pigana kutoka mapengo; meli za kina kirefu za Kihispania hukwama na kutambaa.',
  },
  phoenicia: {
    name: 'Mbio za Zambarau',
    pitch: 'Beba mizigo kati ya bandari za kirafiki kwa faida inayoongezeka na wimbi.',
    hint: 'Gusa ngome ya kirafiki kupakia, nyingine kuuza. Waache washirika wako.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Waita wafanyabiashara wa msafara (F) kwa ushuru wa Ligi — au wapigane wote.',
    hint: 'F karibu na mfanyabiashara: dai ushuru. Wanaokataa huita msafara mzima.',
  },
  portugal: {
    name: 'Musimu na Feitoria',
    pitch: 'Upepo hubadilika kila mawimbi 3; ngome za feitoria hukutengeneza na kukulisha.',
    hint: 'Jihadhari na kalenda ya musimu; kaa karibu na ngome za kirafiki kupona.',
  },
  armada: {
    name: 'Dhoruba na Meli za Moto',
    pitch: 'Dhoruba hutawanya kila mpangilio; mwezi mpevu hulinda hazina yake.',
    hint: 'Dhoruba husukuma meli zote chini ya upepo. Vunja mwezi mpevu kwa zawadi kubwa.',
  },
  dutch: {
    name: 'Mchanga Unaoelea',
    pitch: 'Matuta ya mchanga huelea kuvuka Texel na kukwamisha meli za kina kirefu za Kiingereza.',
    hint: 'Mwili wako wa kina kifupi huteleza juu ya matuta — wavutie wawindaji wa kina kirefu humo.',
  },
  ottoman: {
    name: 'Mbio za Makasia',
    pitch: 'Kimbia (T) kwenye kugonga — meli zilizotekwa huwavuta watu walioachiliwa kwako.',
    hint: 'T: mlipuko wa mbio, kisha makasia yaliyochoka. Teka kwa watu, si dhahabu.',
  },
  predread: {
    name: 'Vuka T',
    pitch: 'Piga pua na nyuma; shika shabaha moja kufunga masafa.',
    hint: 'Piga kwenye pua/nyuma kwa +50%. Kaa kwa mwathirika mmoja kulenga vizuri.',
  },
  falklands: {
    name: 'Onyo la Shambulizi la Anga',
    pitch: 'Exocet huingia kutoka nje ya skrini — chanua amka au upigwe.',
    hint: 'Mshale wa shambulizi? Geukia humo na uendelee kusonga. Vifaa vya chaff husaidia.',
  },
  somali: {
    name: 'Tekwa Nyara na Ukombozi',
    pitch: 'Wafanyabiashara waliotekwa huwa mateka — ukombozi huongezeka unapowashika.',
    hint: 'Teka wafanyabiashara, kisha nusurika: ukombozi hukua kila sekunde.',
  },
};

const ha: TraitsDict = {
  golden: {
    name: 'Tuta ta Ƙarya & Lada',
    pitch: 'Ɗaga tutar ƙarya har sai harbi na farko — ladanka tana ƙiba kowace ganima.',
    hint: 'Riƙe harbi don zama ba a gani; nutsar da jiragen runduna don ɗaga ladanka.',
  },
  exploration: {
    name: 'Ruwan da Ba a Sani ba',
    pitch: 'Hazo yana ɓoye taswira — tafi kowane tsibiri don zanawa da zinariya.',
    hint: 'Zana tsibiri da zinariya, ka riƙe ’ya’yan itace a ramuka don scurvy.',
  },
  napoleonic: {
    name: 'Iska ta Sama',
    pitch: 'Jirgin da ke sama da iska yana harbi da ƙarfi — juya don iska, sannan yi alama.',
    hint: 'Yi faɗa daga sama da iska don +25% harbi; alama tana ƙarfafa kowane igiya.',
  },
  barbary: {
    name: 'Haraji ko Yaƙi',
    pitch: 'Kira ’yan kasuwa (F) don neman haraji — zinariya ba tare da faɗa ba.',
    hint: 'Danna F kusa da ɗan kasuwa don neman haraji. Masu biya da ka bar su za su sake biya.',
  },
  viking: {
    name: 'Kai Hari Gaɓa',
    pitch: 'Sauka a gaɓar daji don kai hari — tura kafin rundunar yaƙi.',
    hint: 'Yi tafiya a hankali zuwa gaɓa don kai hari; danna vela (W) don turawa.',
  },
  ironclad: {
    name: 'Kusurwoyin Ƙarfe',
    pitch: 'Sulken da suka karkata suna kawar da harbi daga gaba; nakiyoyi suna yawo a magudana.',
    hint: 'Kai hari da gaba: rabin barna daga gaba. Ka kiyayi nakiyoyin da ke yawo.',
  },
  ww1: {
    name: 'Jiragen Ƙarƙashin Ruwa & Hydrophones',
    pitch: 'Jiragen ƙarƙashin ruwa suna gudu a ƙasa — ƙarar hydrophone tana samun su; ka buge su.',
    hint: 'Kula da ƙara: kwalekwalen da aka bayyana suna fitowa don kai hari. Ka buge su.',
  },
  ww2: {
    name: 'Faɗace-faɗacen Dare',
    pitch: 'Kowane igiya mai lamba biyu ana faɗarta da dare da hasken taurari — don albashin haɗari.',
    hint: 'Da dare maƙiyi yana harbi rabin nisa. Ka matso ka sami kyauta.',
  },
  hormuz: {
    name: 'Kulle na Roka',
    pitch: 'Rokoki masu zuwa suna ihun sautin kullewa — juya sosai don karya kullewa.',
    hint: 'Sautin KULLE? Juya sosai ta roka. Ka bar tankokin tsaka.',
  },
  roman: {
    name: 'Corvus',
    pitch: 'Taɓa maƙiyi sai gadar da ke da ƙaya ta faɗi — kama ta nan take.',
    hint: 'Bugi gefe: maƙiyan da aka kama suna rage gudu, ganimomi suna kama kansu.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Yi tunkara kai tsaye ta layin maƙiyi don firgita ma’aikatansa.',
    hint: 'Wuce da sauri tare da gefen jirgin maƙiyi daga gefe zuwa gefe don firgita lodawarsa.',
  },
  arab: {
    name: 'Hawan Damina',
    pitch: 'Damina tana juyawa bisa kalanda — jiragen lateen suna tashi da iska.',
    hint: 'Tafi da damina (+gudu); yi kwanton ɓauna ga hanyoyin kasuwanci na ƙasa da iska.',
  },
  chinese: {
    name: 'Ganuwa Mai Tafiya',
    pitch: 'Sauke anga (T ko sandunan tsirara) don zama ganuwa — ko kira jiragen haraji.',
    hint: 'T: sauke anga don +barna. F kusa da ɗan kasuwa: yarjejeniyar haraji maimakon ganima.',
  },
  japanese: {
    name: 'Ƙugiyoyi & Teppo',
    pitch: 'Maƙiya suna kama ka suna jan ka — amsa da ruwan teppo (T).',
    hint: 'T: ruwan teppo gaba. Kashe masu kama da sauri ko a jan ka ƙasa.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Kowane nutsarwa tana ambaton masu rama — kashe waɗanda aka yi wa alama don tara Mana.',
    hint: 'Dangin da aka yi wa alama suna farautarka; kashe su yana tara Mana (barna) — ci gaba da ciyar da shi.',
  },
  hawaii: {
    name: 'Haɗa Tsibiri',
    pitch: 'Ci nasara a kan kwalekwalen kowane tsibiri don sanya shi ƙarƙashin ka don harajin kowane igiya.',
    hint: 'Nutsar da kwalekwale 3 na tsibiri ɗaya don sanya shi ƙarƙashin ka. Haɗa su duka.',
  },
  macedon: {
    name: 'Hasumiyar Kewaye Mai Tafiya',
    pitch: 'Catapults na kewaye sun fi komai nisa — amma sauro suna taruwa.',
    hint: 'Nisanka yana da fadi sosai; ƙananan kifaye suna mutuwa a jikinka. Ci gaba da juyawa.',
  },
  maya: {
    name: 'Yaƙin Murjani',
    pitch: 'Jiragen Sipaniya suna zubar da jini a murjani; kwalekwalenka suna wucewa kyauta.',
    hint: 'Yi faɗa a cikin zobe na murjani. Kira baƙon farko don kyauta.',
  },
  inca: {
    name: 'Humboldt & Spondylus',
    pitch: 'Hau hanyoyin igiya; nutsa gadajen harsashi don zinariya.',
    hint: 'Igiyoyi suna tura dukan jiragen. Tsaya a hankali a kan gadaje masu ruwan hoda don nutsewa.',
  },
  lepanto: {
    name: 'Babban Faɗa',
    pitch: 'Babu ƙarshen kamawa a faɗa — haɗa ganima zuwa ganima.',
    hint: 'Nisan kamawa yana da tsawo; kowane ganima tana tunkarar mutanen da aka ’yanta zuwa ma’aikatanka.',
  },
  korea: {
    name: 'Igiyar Myeongnyang',
    pitch: 'Igiyar mashigi tana juyawa — jirginka na kunkuru da kyar yake jin ta.',
    hint: 'Jan maƙiya masu sauƙi cikin igiya; tana share su zuwa duwatsu da bindigogi.',
  },
  byzantium: {
    name: 'Sarƙa & Teku Mai Ƙonewa',
    pitch: 'Sarƙa tana tura maƙiyi zuwa rata ɗaya; wutar Girka tana yawo tana yaɗuwa.',
    hint: 'Riƙe ratar sarƙa; manka yana yawo da iska yana daɗewa.',
  },
  egypt: {
    name: 'Masu Kibiyar Gaɓar Fir’auna',
    pitch: 'Gaɓoɓin abokantaka suna harba ruwan kibiyoyi dominka; ciyawa tana ɓoye masu kwanto.',
    hint: 'Yi faɗa kusa da gaɓoɓin abokantaka don tallafin masu kibiya. Share ciyawa.',
  },
  chola: {
    name: 'Tsallake Kogi',
    pitch: 'Nesa da gida: cin ajiya sau biyu, zinariyan haikali sau biyu, guguwar damina.',
    hint: 'Ajiya suna ƙonewa sau biyu da sauri — amma manyan kyaututtuka suna biya sau biyu.',
  },
  vietnam: {
    name: 'Sandunan Bạch Đằng',
    pitch: 'A lokacin ƙarancin ruwa shingen sanduna suna bayyana haƙoransu ga jiragen zurfi.',
    hint: 'Kula da agogon igiya: jan jiragen zurfi a kan sanduna a lokacin ƘARANCIN ruwa.',
  },
  aztec: {
    name: 'Gadodden Texcoco',
    pitch: 'Rikicin gada — kwalekwale suna zamewa ramukan da brigantines ba za su iya ba.',
    hint: 'Yi faɗa daga ramuka; zurfafan jiragen Sipaniya suna makalewa suna rarrafe.',
  },
  phoenicia: {
    name: 'Gudun Shuni',
    pitch: 'Ɗauki kaya tsakanin tashoshin abokantaka don riba mai ƙaruwa da igiya.',
    hint: 'Taɓa ganuwar aboki don lodawa, wata don sayarwa. Ka bar abokan hulɗarka.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Kira ’yan kasuwar ayari (F) don harajin Ƙungiya — ko ka yi faɗa da su duka.',
    hint: 'F kusa da ɗan kasuwa: nemi haraji. Masu ƙi suna kiran ayarin gaba ɗaya.',
  },
  portugal: {
    name: 'Damina & Feitoria',
    pitch: 'Iska tana juyawa kowane igiyoyi 3; ganuwar feitoria suna gyara ka suna ciyar da kai.',
    hint: 'Kula da kalandar damina; tsaya kusa da ganuwar abokantaka don murmurewa.',
  },
  armada: {
    name: 'Guguwa & Jiragen Wuta',
    pitch: 'Guguwa tana watse kowane tsari; jinjirin wata yana gadin taskarsa.',
    hint: 'Guguwa tana tura dukan jiragen ƙasa da iska. Karya jinjirin wata don babbar kyauta.',
  },
  dutch: {
    name: 'Yashi Mai Matsi',
    pitch: 'Tulun yashi suna yawo ta Texel suna makale zurfafan jiragen Ingila.',
    hint: 'Jirginka mai zurfi kaɗan yana zamewa a kan tuluna — jan mafarauta masu zurfi a kansu.',
  },
  ottoman: {
    name: 'Gudun Filafilai',
    pitch: 'Yi gudu (T) cikin karo — jiragen da aka kama suna tunkarar mutanen da aka ’yanta gare ka.',
    hint: 'T: fashewar gudu, sannan filafilai masu gajiya. Kama don hannaye, ba zinariya ba.',
  },
  predread: {
    name: 'Kewaye T',
    pitch: 'Share gaba da baya; riƙe manufa ɗaya don daidaita nisa.',
    hint: 'Harba cikin gaba/baya don +50%. Tsaya a kan wanda aka azabtar ɗaya don nufi sosai.',
  },
  falklands: {
    name: 'Gargaɗin Kai Harin Sama',
    pitch: 'Exocets suna shigowa daga wajen allo — share hanya ko a buge ka.',
    hint: 'Kibiyar kai hari? Juya cikinta ka ci gaba da motsawa. Kayan chaff suna taimakawa.',
  },
  somali: {
    name: 'Sace & Fansha',
    pitch: '’Yan kasuwar da aka kama sun zama mutanen fansha — fansha tana ƙaruwa yayin da ka riƙe.',
    hint: 'Kama ’yan kasuwa, sannan ka tsira: fansha tana girma a kowane daƙiƙa.',
  },
};

const yo: TraitsDict = {
  golden: {
    name: 'Àsíá Èké & Ẹ̀san',
    pitch: 'Gbé àsíá èké títí di ìbọn àkọ́kọ́ — ẹ̀san rẹ máa ń sọ ìkógun kọ̀ọ̀kan di ọ̀rá.',
    hint: 'Dá ìbọn dúró láti wà ní ìkọ̀kọ̀; rì àwọn ara ọkọ̀ ọmọ-ogun láti gbe ẹ̀san rẹ sókè.',
  },
  exploration: {
    name: 'Omi Àìmọ̀',
    pitch: 'Ìkùukùu bo mànrántí mọ́lẹ̀ — kọ ọkọ̀ sí erékùṣù kọ̀ọ̀kan láti ṣe àwòrán rẹ̀ fún wúrà.',
    hint: 'Ṣe àwòrán àwọn erékùṣù fún wúrà, kí o sì pa èso mọ́ nínú ibi ẹrù lòdì sí scurvy.',
  },
  napoleonic: {
    name: 'Apá Afẹ́fẹ́',
    pitch: 'Ọkọ̀ tó wà lókè afẹ́fẹ́ máa ń yín le — yí sí apá afẹ́fẹ́, lẹ́yìn náà fààmì.',
    hint: 'Jà láti òkè afẹ́fẹ́ fún +25% ìbọn; àmì kan máa ń fún ìgbì kọ̀ọ̀kan ní agbára.',
  },
  barbary: {
    name: 'Owo-orí tàbí Ogun',
    pitch: 'Pè àwọn òṣìṣẹ́ (F) láti bèèrè owo-orí — wúrà láìsí ìjà.',
    hint: 'Tẹ F nítòsí òṣìṣẹ́ láti bèèrè owo-orí. Àwọn tó san tí o bá dá wọ́n sílẹ̀ yóò tún san.',
  },
  viking: {
    name: 'Ìkọlù Etí-òkun',
    pitch: 'Gbé ọkọ̀ sórí etí òkun igbẹ́ láti kó ọ jà — tì í padà ṣáájú ẹgbẹ́ ogun.',
    hint: 'Fẹ́ẹ́rẹ́ lọ sí etí òkun láti kó ọ jà; tẹ aṣọ-ọkọ̀ (W) láti tì í padà.',
  },
  ironclad: {
    name: 'Igun Irin',
    pitch: 'Ihámọ́ra tí ó tẹ̀ máa ń yọ ìbọn kúrò láti iwájú; àwọn maini ń fò lójú ọ̀nà-omi.',
    hint: 'Kọlu pẹ̀lú iwájú: àbọ̀ ìparun láti iwájú. Ṣọ́ra fún àwọn maini tí ń fò.',
  },
  ww1: {
    name: 'Àwọn Ọkọ̀ Abẹ́-omi & Hydrophone',
    pitch: 'Àwọn ọkọ̀ abẹ́-omi ń sáré lábẹ́ omi — ìró hydrophone máa ń rí wọn; kọlu wọ́n.',
    hint: 'Ṣọ́ ìró: àwọn ọkọ̀ tí a ṣípayá máa ń dìde láti kọlu. Kọlu wọ́n.',
  },
  ww2: {
    name: 'Ìjà Alẹ́',
    pitch: 'Gbogbo ìgbì kejì ni a ń jà lálẹ́ pẹ̀lú ìmọ́lẹ̀ ìràwọ̀ — fún owó ewu.',
    hint: 'Lálẹ́ ọ̀tá máa ń yín ní àbọ̀ ìjìnnà. Súnmọ́ kí o sì gba ẹ̀bùn.',
  },
  hormuz: {
    name: 'Títì Rocket',
    pitch: 'Àwọn rocket tí ń bọ̀ máa ń pariwo ohùn títì — yí gidigidi láti ṣí títì náà.',
    hint: 'Ohùn TÍTÌ? Yí gidigidi ká rocket. Dá àwọn tanker aláìṣojú sílẹ̀.',
  },
  roman: {
    name: 'Corvus',
    pitch: 'Fọwọ́kan ọ̀tá kan afárá elẹ́gún yóò sì ṣubú — gbà á lẹ́sẹ̀kẹsẹ̀.',
    hint: 'Kọlu ẹ̀gbẹ́: àwọn ọ̀tá tí a dì máa ń lọ́ra, àwọn ìkógun sì máa ń gbà ara wọn.',
  },
  greek: {
    name: 'Diekplous',
    pitch: 'Fà tààrà ká ìlà ọ̀tá láti dá àwọn atukọ̀ rẹ̀ láàmú.',
    hint: 'Kọjá kíákíá lẹ́bàá ara ọkọ̀ ọ̀tá láti ẹ̀gbẹ́ dé ẹ̀gbẹ́ láti dá títúnṣe rẹ̀ láàmú.',
  },
  arab: {
    name: 'Gùn Ìgbà Ẹ̀rùn',
    pitch: 'Ìgbà ẹ̀rùn máa ń yípadà lórí kàlẹ́ńdà — àwọn ara ọkọ̀ lateen máa ń fò pẹ̀lú afẹ́fẹ́.',
    hint: 'Kọ ọkọ̀ pẹ̀lú ìgbà ẹ̀rùn (+iyára); dẹ́ àwọn ọ̀nà ìṣòwò ìsàlẹ̀ afẹ́fẹ́.',
  },
  chinese: {
    name: 'Odi Òfífó',
    pitch: 'Dubúlẹ̀ (T tàbí òpó ìhòhò) láti di odi — tàbí pè àwọn ọkọ̀ owo-orí.',
    hint: 'T: dubúlẹ̀ fún +ìparun. F nítòsí òṣìṣẹ́: àdéhùn owo-orí dípò ìkógun.',
  },
  japanese: {
    name: 'Ìkọ̀ & Teppo',
    pitch: 'Àwọn ọ̀tá máa ń dì ọ́ wọ́n sì máa ń fà ọ́ — dáhùn pẹ̀lú ìrọ̀ teppo (T).',
    hint: 'T: ìrọ̀ teppo síwájú. Pa àwọn tó dì ọ́ kíákíá tàbí kí wọ́n fà ọ́ sọkalẹ̀.',
  },
  maori: {
    name: 'Utu',
    pitch: 'Gbogbo rírì máa ń dárúkọ àwọn agbẹ̀san — pa àwọn tí a samì láti kó Mana jọ.',
    hint: 'Àwọn ìbátan tí a samì ń ṣọdẹ rẹ; pípà wọ́n máa ń kó Mana jọ (ìparun) — máa fún un.',
  },
  hawaii: {
    name: 'Ṣọ Àwọn Erékùṣù Kan',
    pitch: 'Ṣẹ́gun àwọn ọkọ̀ erékùṣù kọ̀ọ̀kan láti sọ ọ́ di ọmọlẹ́yìn fún owo-orí ìgbì kọ̀ọ̀kan.',
    hint: 'Rì ọkọ̀ 3 erékùṣù kan láti sọ ọ́ di ọmọlẹ́yìn. Ṣọ gbogbo wọn kan.',
  },
  macedon: {
    name: 'Ilé Goga Òfífó',
    pitch: 'Àwọn catapult ìdènà jìn ju gbogbo lọ — ṣùgbọ́n àwọn ẹ̀fọn ń pọ̀.',
    hint: 'Ìjìnnà rẹ gbòòrò; àwọn kékeré máa ń kú lara rẹ. Máa yí.',
  },
  maya: {
    name: 'Ogun Coral',
    pitch: 'Àwọn ọkọ̀ Sípánì máa ń ta ẹ̀jẹ̀ lórí coral; àwọn ọkọ̀ rẹ máa ń kọjá lọ́fẹ̀ẹ́.',
    hint: 'Jà nínú òrùka coral. Pè àlejò àkọ́kọ́ fún ẹ̀bùn.',
  },
  inca: {
    name: 'Humboldt & Spondylus',
    pitch: 'Gùn àwọn ọ̀nà ìṣàn; wọ inú ibù ìkarahun fún wúrà.',
    hint: 'Àwọn ìṣàn máa ń tì gbogbo ara ọkọ̀. Dúró jẹ́ẹ́jẹ́ lórí àwọn ibù pupa láti wọ inú.',
  },
  lepanto: {
    name: 'Ìjà Ńlá',
    pitch: 'Kò sí òpin gbígbà nínú ìjà — so ìkógun mọ́ ìkógun.',
    hint: 'Ìbọ̀wọ́ gbígbà gùn; gbogbo ìkógun máa ń fà àwọn ènìyàn tí a dá sílẹ̀ sí àwọn atukọ̀ rẹ.',
  },
  korea: {
    name: 'Ìgbì Myeongnyang',
    pitch: 'Ìṣàn ọ̀nà-omi máa ń yípadà — ọkọ̀ ìjàpá rẹ kò ní mọ̀ rárá.',
    hint: 'Tàn àwọn ọ̀tá fẹ́ẹ́rẹ́ sínú ìgbì; yóò gbá wọn lọ sí òkúta àti ìbọn.',
  },
  byzantium: {
    name: 'Ẹ̀wọ̀n & Òkun Tí Ńjó',
    pitch: 'Ẹ̀wọ̀n máa ń darí ọ̀tá sí ihò kan; iná Gíríkì máa ń fò ká mà sì ń tàn.',
    hint: 'Dì ihò ẹ̀wọ̀n mú; epo rẹ máa ń fò pẹ̀lú afẹ́fẹ́ yóò sì pẹ́.',
  },
  egypt: {
    name: 'Àwọn Tafàtafà Etí-òkun Farao',
    pitch: 'Àwọn etí òkun ọ̀rẹ́ máa ń rọ̀ fún ọ; koríko máa ń pa àwọn adẹ́tẹ̀ mọ́.',
    hint: 'Jà nítòsí àwọn etí òkun ọ̀rẹ́ fún ìrànlọ́wọ́ àwọn tafàtafà. Gbá koríko kúrò.',
  },
  chola: {
    name: 'Kọjá Kògò',
    pitch: 'Jìnnà sílé: ìlò ìpèsè lẹ́ẹ̀mejì, wúrà tẹ́ńpìlì lẹ́ẹ̀mejì, ìjì ìgbà ẹ̀rùn.',
    hint: 'Àwọn ìpèsè máa ń jó ní ìlọ́po méjì kíákíá — ṣùgbọ́n àwọn ẹ̀bùn ńlá máa ń san ní ìlọ́po méjì.',
  },
  vietnam: {
    name: 'Àwọn Ìkọ̀ Bạch Đằng',
    pitch: 'Nígbà omi bá gbẹ àwọn òdì ìkọ̀ máa ń yọ eyín hàn fún àwọn ọkọ̀ jíjìn.',
    hint: 'Ṣọ́ aago ìgbì: tàn àwọn ara ọkọ̀ jíjìn sórí àwọn ìkọ̀ nígbà omi bá GBẸ.',
  },
  aztec: {
    name: 'Àwọn Ojú-ọ̀nà Texcoco',
    pitch: 'Ìkọ́ ojú-ọ̀nà — àwọn ọkọ̀ kékeré máa ń yọ nínú àwọn ihò tí àwọn brigantine kò lè yọ.',
    hint: 'Jà láti inú àwọn ihò; àwọn ara ọkọ̀ Sípánì jíjìn máa ń dì wọ́n sì máa ń rákò.',
  },
  phoenicia: {
    name: 'Ìsáré Elese',
    pitch: 'Gbé ẹrù láàrín àwọn èbúté ọ̀rẹ́ fún èrè tó ń pọ̀ pẹ̀lú ìgbì.',
    hint: 'Fọwọ́kan odi ọ̀rẹ́ láti dì, òmíràn láti tà. Dá àwọn alábàáṣiṣẹ́pọ̀ rẹ sílẹ̀.',
  },
  hanse: {
    name: 'Pfundgeld',
    pitch: 'Pè àwọn òṣìṣẹ́ ẹgbẹ́ (F) fún owo-orí Ligi — tàbí bá gbogbo wọn jà.',
    hint: 'F nítòsí òṣìṣẹ́: bèèrè owo-orí. Àwọn tó kọ̀ yóò pè gbogbo ẹgbẹ́.',
  },
  portugal: {
    name: 'Ìgbà Ẹ̀rùn & Feitoria',
    pitch: 'Afẹ́fẹ́ máa ń yípadà ní gbogbo ìgbì 3; àwọn odi feitoria máa ń ṣe ọ́ wọ́n sì máa ń bọ́ ọ́.',
    hint: 'Ṣọ́ kàlẹ́ńdà ìgbà ẹ̀rùn; dúró nítòsí àwọn odi ọ̀rẹ́ láti gba ara le.',
  },
  armada: {
    name: 'Ìjì & Àwọn Ọkọ̀ Iná',
    pitch: 'Ìjì máa ń tú gbogbo ìṣètò ká; òṣùpá máa ń ṣọ́ ìṣúra rẹ̀.',
    hint: 'Ìjì máa ń tì gbogbo ara ọkọ̀ sí ìsàlẹ̀ afẹ́fẹ́. Fọ́ òṣùpá fún ẹ̀bùn ńlá.',
  },
  dutch: {
    name: 'Yanrìn Tí Ńyí',
    pitch: 'Àwọn ilẹ̀ yanrìn ń yí ká Texel wọ́n sì máa ń dì àwọn ọkọ̀ Gẹ̀ẹ́sì jíjìn mú.',
    hint: 'Ara ọkọ̀ rẹ tí kò jìn máa ń yọ lórí ilẹ̀ — tàn àwọn ọdẹ jíjìn sórí wọn.',
  },
  ottoman: {
    name: 'Ìsáré Abẹ̀',
    pitch: 'Sáré (T) sínú ìkọlù — àwọn ọkọ̀ tí a gbà máa ń fà àwọn ènìyàn tí a dá sí ọ́dọ̀ rẹ.',
    hint: 'T: ìbú ìsáré, lẹ́yìn náà abẹ̀ tí ó rẹ̀. Gbà fún ọwọ́, kì í ṣe wúrà.',
  },
  predread: {
    name: 'Kọjá T',
    pitch: 'Gbá iwájú àti ẹ̀yìn; dì àfojúsùn kan mú láti dí ìjìnnà.',
    hint: 'Yín sí iwájú/ẹ̀yìn fún +50%. Dúró lórí ẹni kan láti fojú déédéé.',
  },
  falklands: {
    name: 'Ìkìlọ̀ Ìkọlù Afẹ́fẹ́',
    pitch: 'Àwọn Exocet máa ń wọlé láti òde ìbòjú — fẹ́ ìjì tàbí kí wọ́n lù ọ́.',
    hint: 'Ọfà ìkọlù? Yípadà sí inú rẹ̀ kí o sì máa lọ. Àwọn ohun èlò chaff máa ń rànlọ́wọ́.',
  },
  somali: {
    name: 'Jígbè & Owó Ìràpadà',
    pitch: 'Àwọn òṣìṣẹ́ tí a gbà di àwọn ìgbè — owó ìràpadà máa ń pọ̀ sí i nígbà tí o bá dì wọ́n mú.',
    hint: 'Gbà àwọn òṣìṣẹ́, lẹ́yìn náà là á já: owó ìràpadà máa ń dàgbà ní ìṣẹ́jú kọ̀ọ̀kan.',
  },
};

export const traits: Dict<TraitsDict> = { en, es, fr, de, nl, pt, ja, zh, id, th, vi, ar, sw, ha, yo };
