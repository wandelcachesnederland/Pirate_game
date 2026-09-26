/** Armaments: cannon/somali/archery-era names, shot names, summary suffix, picker bar labels. */
import type { Dict } from './meta';

const en = {
  cannon: {
    heavyName: 'Gunpowder broadsides',
    lightName: 'Deck guns',
    summary: 'Gunpowder broadsides, exploding shell and shot',
    volleyName: 'GRAPE!',
    weaponWord: 'guns',
  },
  somali: {
    heavyName: 'RPG-7s & DShK heavy machine guns',
    lightName: 'AK-47s & PKM machine guns',
    summary: 'RPG-7 rockets, AK-47s and belt-fed PKMs from skiffs and mothership',
    volleyName: 'FULL AUTO!',
    weaponWord: 'RPGs & rifles',
  },
  archeryVolley: 'ARROW STORM!',
  archery: {
    viking: {
      heavyName: 'Winch-drawn bolt launchers', lightName: 'Bow crews',
      summary: 'Archery, hand-thrown spears and winch-drawn bolt launchers',
      weaponWord: 'bows & winch-launchers',
    },
    roman: {
      heavyName: 'Stone-throwing ballistae', lightName: 'Archer ranks',
      summary: 'Ballista stones, torsion engines and archery',
      weaponWord: 'ballistae & archery',
    },
    greek: {
      heavyName: 'Oxybeles bolt launchers', lightName: 'Archer ranks',
      summary: 'Archery and oxybeles bolt launchers — ram first, board after',
      weaponWord: 'bows & winch-launchers',
    },
    macedon: {
      heavyName: 'Torsion stone-throwers', lightName: 'Bolt launchers',
      summary: 'Stone-throwing catapults and bolt engines off the great decks',
      weaponWord: 'catapults & bolt engines',
    },
    egypt: {
      heavyName: 'Winch-drawn bolt launchers', lightName: 'Archer ranks',
      summary: 'Archery and winch-drawn bolts along the Nile mouths',
      weaponWord: 'bows & winch-launchers',
    },
    arab: {
      heavyName: 'Naphtha fire siphons', lightName: 'Archer ranks',
      summary: 'Naphtha fire siphons, fire pots and archery',
      weaponWord: 'fire siphons & bows',
    },
    byzantium: {
      heavyName: 'Bronze fire siphons', lightName: 'Fire-arrow crews',
      summary: 'Greek fire from the bow siphons, with fire arrows along the decks',
      weaponWord: 'Greek fire siphons',
    },
    chola: {
      heavyName: 'Winch-drawn bolt launchers', lightName: 'Archer ranks',
      summary: 'Archery and winch-drawn bolts from the big Coromandel hulls',
      weaponWord: 'bows & winch-launchers',
    },
    vietnam: {
      heavyName: 'Winch-drawn bolt launchers', lightName: 'Fire-arrow crews',
      summary: 'Winch-drawn bolts and fire arrows over the stake barrages',
      weaponWord: 'bolts & fire arrows',
    },
    inca: {
      heavyName: 'Sling-thrown stones', lightName: 'Atlatl darts',
      summary: 'Sling stones and atlatl darts from the balsa rafts',
      weaponWord: 'sling stones & darts',
    },
    phoenicia: {
      heavyName: 'Winch-drawn bolt launchers', lightName: 'Archer ranks',
      summary: 'Archery and bolts from the cedar galleys of Tyre',
      weaponWord: 'bows & winch-launchers',
    },
    hanse: {
      heavyName: 'Crossbows and springalds', lightName: 'Bow crews',
      summary: 'Crossbows, springalds and hand-thrown stones from the castle cogs',
      weaponWord: 'crossbows & springalds',
    },
  },
  shots: {
    arrow: 'Arrow', bolt: 'Winch bolt', fireArrow: 'Fire arrow', greekFire: 'Greek fire',
    stone: 'Stone', cannonball: 'Shot', missile: 'Missile',
  },
  suffix: '— no powder: hulls burn, they do not explode',
  bar: { guns: 'Guns', fire: 'Fire', stones: 'Stones', bows: 'Bows' },
};

export type ArmamentsDict = typeof en;

const es: ArmamentsDict = {
  cannon: {
    heavyName: 'Andanadas de pólvora',
    lightName: 'Artillería de cubierta',
    summary: 'Andanadas de pólvora, granadas y bala explosiva',
    volleyName: '¡METRALLA!',
    weaponWord: 'cañones',
  },
  somali: {
    heavyName: 'RPG-7 y ametralladoras pesadas DShK',
    lightName: 'AK-47 y ametralladoras PKM',
    summary: 'Cohetes RPG-7, AK-47 y PKM de cinta desde esquifes y nodriza',
    volleyName: '¡AUTOMÁTICO TOTAL!',
    weaponWord: 'RPG y fusiles',
  },
  archeryVolley: '¡LLUVIA DE FLECHAS!',
  archery: {
    viking: {
      heavyName: 'Lanzavirotes de torno', lightName: 'Dotaciones de arco',
      summary: 'Arquería, lanzas arrojadizas y lanzavirotes de torno',
      weaponWord: 'arcos y lanzavirotes',
    },
    roman: {
      heavyName: 'Balistas lapidarias', lightName: 'Filas de arqueros',
      summary: 'Piedras de balista, ingenios de torsión y arquería',
      weaponWord: 'balistas y arquería',
    },
    greek: {
      heavyName: 'Lanzavirotes oxybeles', lightName: 'Filas de arqueros',
      summary: 'Arquería y lanzavirotes oxybeles — embiste primero, aborda después',
      weaponWord: 'arcos y lanzavirotes',
    },
    macedon: {
      heavyName: 'Pedreros de torsión', lightName: 'Lanzavirotes',
      summary: 'Catapultas lapidarias e ingenios de virotes desde las grandes cubiertas',
      weaponWord: 'catapultas e ingenios',
    },
    egypt: {
      heavyName: 'Lanzavirotes de torno', lightName: 'Filas de arqueros',
      summary: 'Arquería y virotes de torno en las bocas del Nilo',
      weaponWord: 'arcos y lanzavirotes',
    },
    arab: {
      heavyName: 'Sifones de fuego de nafta', lightName: 'Filas de arqueros',
      summary: 'Sifones de fuego de nafta, ollas ígneas y arquería',
      weaponWord: 'sifones de fuego y arcos',
    },
    byzantium: {
      heavyName: 'Sifones de fuego de bronce', lightName: 'Dotaciones de flechas ígneas',
      summary: 'Fuego griego desde los sifones de proa, con flechas ígneas en cubierta',
      weaponWord: 'sifones de fuego griego',
    },
    chola: {
      heavyName: 'Lanzavirotes de torno', lightName: 'Filas de arqueros',
      summary: 'Arquería y virotes de torno desde los grandes cascos de Coromandel',
      weaponWord: 'arcos y lanzavirotes',
    },
    vietnam: {
      heavyName: 'Lanzavirotes de torno', lightName: 'Dotaciones de flechas ígneas',
      summary: 'Virotes de torno y flechas ígneas sobre las barreras de estacas',
      weaponWord: 'virotes y flechas ígneas',
    },
    inca: {
      heavyName: 'Piedras de honda', lightName: 'Dardos de átlatl',
      summary: 'Piedras de honda y dardos de átlatl desde las balsas',
      weaponWord: 'hondas y dardos',
    },
    phoenicia: {
      heavyName: 'Lanzavirotes de torno', lightName: 'Filas de arqueros',
      summary: 'Arquería y virotes desde las galeras de cedro de Tiro',
      weaponWord: 'arcos y lanzavirotes',
    },
    hanse: {
      heavyName: 'Ballestas y springalds', lightName: 'Dotaciones de arco',
      summary: 'Ballestas, springalds y piedras a mano desde las cocas encastilladas',
      weaponWord: 'ballestas y springalds',
    },
  },
  shots: {
    arrow: 'Flecha', bolt: 'Virote de torno', fireArrow: 'Flecha ígnea', greekFire: 'Fuego griego',
    stone: 'Piedra', cannonball: 'Bala', missile: 'Misil',
  },
  suffix: '— sin pólvora: los cascos arden, no explotan',
  bar: { guns: 'Cañones', fire: 'Fuego', stones: 'Piedras', bows: 'Arcos' },
};

const fr: ArmamentsDict = {
  cannon: {
    heavyName: 'Bordées à poudre',
    lightName: 'Artillerie de pont',
    summary: 'Bordées à poudre, obus et boulets explosifs',
    volleyName: 'MITRAILLE !',
    weaponWord: 'canons',
  },
  somali: {
    heavyName: 'RPG-7 et mitrailleuses lourdes DShK',
    lightName: 'AK-47 et mitrailleuses PKM',
    summary: 'Roquettes RPG-7, AK-47 et PKM à bande depuis esquifs et navire-mère',
    volleyName: 'FULL AUTO !',
    weaponWord: 'RPG et fusils',
  },
  archeryVolley: 'PLUIE DE FLÈCHES !',
  archery: {
    viking: {
      heavyName: 'Lance-carreaux à treuil', lightName: 'Équipages d’archers',
      summary: 'Archerie, lances à main et lance-carreaux à treuil',
      weaponWord: 'arcs et lance-carreaux',
    },
    roman: {
      heavyName: 'Balistes lance-pierres', lightName: 'Rangs d’archers',
      summary: 'Pierres de baliste, engins de torsion et archerie',
      weaponWord: 'balistes et archerie',
    },
    greek: {
      heavyName: 'Lance-carreaux oxybèles', lightName: 'Rangs d’archers',
      summary: 'Archerie et lance-carreaux oxybèles — éperonnez d’abord, abordez après',
      weaponWord: 'arcs et lance-carreaux',
    },
    macedon: {
      heavyName: 'Lance-pierres à torsion', lightName: 'Lance-carreaux',
      summary: 'Catapultes lance-pierres et engins à carreaux depuis les grands ponts',
      weaponWord: 'catapultes et engins',
    },
    egypt: {
      heavyName: 'Lance-carreaux à treuil', lightName: 'Rangs d’archers',
      summary: 'Archerie et carreaux à treuil aux bouches du Nil',
      weaponWord: 'arcs et lance-carreaux',
    },
    arab: {
      heavyName: 'Siphons à feu au naphte', lightName: 'Rangs d’archers',
      summary: 'Siphons à feu au naphte, pots à feu et archerie',
      weaponWord: 'siphons à feu et arcs',
    },
    byzantium: {
      heavyName: 'Siphons à feu en bronze', lightName: 'Équipages de flèches incendiaires',
      summary: 'Feu grégeois des siphons de proue, flèches incendiaires sur les ponts',
      weaponWord: 'siphons à feu grégeois',
    },
    chola: {
      heavyName: 'Lance-carreaux à treuil', lightName: 'Rangs d’archers',
      summary: 'Archerie et carreaux à treuil depuis les grandes coques de Coromandel',
      weaponWord: 'arcs et lance-carreaux',
    },
    vietnam: {
      heavyName: 'Lance-carreaux à treuil', lightName: 'Équipages de flèches incendiaires',
      summary: 'Carreaux à treuil et flèches incendiaires sur les barrages de pieux',
      weaponWord: 'carreaux et flèches incendiaires',
    },
    inca: {
      heavyName: 'Pierres de fronde', lightName: 'Sagaies d’atlatl',
      summary: 'Pierres de fronde et sagaies d’atlatl depuis les radeaux',
      weaponWord: 'frondes et sagaies',
    },
    phoenicia: {
      heavyName: 'Lance-carreaux à treuil', lightName: 'Rangs d’archers',
      summary: 'Archerie et carreaux depuis les galères de cèdre de Tyr',
      weaponWord: 'arcs et lance-carreaux',
    },
    hanse: {
      heavyName: 'Arbalètes et springalds', lightName: 'Équipages d’archers',
      summary: 'Arbalètes, springalds et pierres à main depuis les cogues encastillées',
      weaponWord: 'arbalètes et springalds',
    },
  },
  shots: {
    arrow: 'Flèche', bolt: 'Carreau à treuil', fireArrow: 'Flèche incendiaire', greekFire: 'Feu grégeois',
    stone: 'Pierre', cannonball: 'Boulet', missile: 'Missile',
  },
  suffix: '— sans poudre : les coques brûlent, elles n’explosent pas',
  bar: { guns: 'Canons', fire: 'Feu', stones: 'Pierres', bows: 'Arcs' },
};

const de: ArmamentsDict = {
  cannon: {
    heavyName: 'Pulverbreitseiten',
    lightName: 'Decksgeschütze',
    summary: 'Pulverbreitseiten, Sprenggranaten und Kugeln',
    volleyName: 'KARTÄTSCHEN!',
    weaponWord: 'Kanonen',
  },
  somali: {
    heavyName: 'RPG-7 & schwere DShK-MGs',
    lightName: 'AK-47 & PKM-MGs',
    summary: 'RPG-7-Raketen, AK-47 und gegurtete PKMs von Skiffs und Mutterschiff',
    volleyName: 'DAUERFEUER!',
    weaponWord: 'RPGs & Gewehre',
  },
  archeryVolley: 'PFEILSTURM!',
  archery: {
    viking: {
      heavyName: 'Winden-Bolzenschleudern', lightName: 'Bogenmannschaften',
      summary: 'Bogenschützen, Wurfspeere und Winden-Bolzenschleudern',
      weaponWord: 'Bögen & Bolzenschleudern',
    },
    roman: {
      heavyName: 'Stein-Ballisten', lightName: 'Bogenschützenreihen',
      summary: 'Ballistensteine, Torsionsgeschütze und Bogenschützen',
      weaponWord: 'Ballisten & Bogenschützen',
    },
    greek: {
      heavyName: 'Oxybeles-Bolzenschleudern', lightName: 'Bogenschützenreihen',
      summary: 'Bogenschützen und Oxybeles-Bolzenschleudern — erst rammen, dann entern',
      weaponWord: 'Bögen & Bolzenschleudern',
    },
    macedon: {
      heavyName: 'Torsions-Steinwerfer', lightName: 'Bolzenschleudern',
      summary: 'Steinkatapulte und Bolzengeschütze von den großen Decks',
      weaponWord: 'Katapulte & Bolzengeschütze',
    },
    egypt: {
      heavyName: 'Winden-Bolzenschleudern', lightName: 'Bogenschützenreihen',
      summary: 'Bogenschützen und Windenbolzen an den Nilmündungen',
      weaponWord: 'Bögen & Bolzenschleudern',
    },
    arab: {
      heavyName: 'Naphtha-Feuersiphone', lightName: 'Bogenschützenreihen',
      summary: 'Naphtha-Feuersiphone, Feuertöpfe und Bogenschützen',
      weaponWord: 'Feuersiphone & Bögen',
    },
    byzantium: {
      heavyName: 'Bronze-Feuersiphone', lightName: 'Brandpfeil-Mannschaften',
      summary: 'Griechisches Feuer aus den Bugsiphonen, dazu Brandpfeile auf den Decks',
      weaponWord: 'Griechisch-Feuer-Siphone',
    },
    chola: {
      heavyName: 'Winden-Bolzenschleudern', lightName: 'Bogenschützenreihen',
      summary: 'Bogenschützen und Windenbolzen von den großen Koromandel-Rümpfen',
      weaponWord: 'Bögen & Bolzenschleudern',
    },
    vietnam: {
      heavyName: 'Winden-Bolzenschleudern', lightName: 'Brandpfeil-Mannschaften',
      summary: 'Windenbolzen und Brandpfeile über den Pfahlsperren',
      weaponWord: 'Bolzen & Brandpfeile',
    },
    inca: {
      heavyName: 'Schleudersteine', lightName: 'Atlatl-Speere',
      summary: 'Schleudersteine und Atlatl-Speere von den Balsaflößen',
      weaponWord: 'Schleudersteine & Speere',
    },
    phoenicia: {
      heavyName: 'Winden-Bolzenschleudern', lightName: 'Bogenschützenreihen',
      summary: 'Bogenschützen und Bolzen von den Zederngaleeren von Tyros',
      weaponWord: 'Bögen & Bolzenschleudern',
    },
    hanse: {
      heavyName: 'Armbrüste und Springalds', lightName: 'Bogenmannschaften',
      summary: 'Armbrüste, Springalds und Handsteine von den Kastellkoggen',
      weaponWord: 'Armbrüste & Springalden',
    },
  },
  shots: {
    arrow: 'Pfeil', bolt: 'Windenbolzen', fireArrow: 'Brandpfeil', greekFire: 'Griechisches Feuer',
    stone: 'Stein', cannonball: 'Kugel', missile: 'Rakete',
  },
  suffix: '— kein Pulver: Rümpfe brennen, sie explodieren nicht',
  bar: { guns: 'Kanonen', fire: 'Feuer', stones: 'Steine', bows: 'Bögen' },
};

const nl: ArmamentsDict = {
  cannon: {
    heavyName: 'Kruitbreedzijden',
    lightName: 'Dekgeschut',
    summary: 'Kruitbreedzijden, springgranaten en kogels',
    volleyName: 'KARTETS!',
    weaponWord: 'kanonnen',
  },
  somali: {
    heavyName: 'RPG-7’s & zware DShK-mitrailleurs',
    lightName: 'AK-47’s & PKM-mitrailleurs',
    summary: 'RPG-7-raketten, AK-47’s en gebande PKM’s vanaf skiffs en moederschip',
    volleyName: 'VOLAUTOMATISCH!',
    weaponWord: 'RPG’s & geweren',
  },
  archeryVolley: 'PIJLENSTORM!',
  archery: {
    viking: {
      heavyName: 'Lierboutwerpers', lightName: 'Boogploegen',
      summary: 'Boogschutters, werpsperen en lierboutwerpers',
      weaponWord: 'bogen & boutwerpers',
    },
    roman: {
      heavyName: 'Steenballistae', lightName: 'Boogschuttersrijen',
      summary: 'Ballistastenen, torsiewerktuigen en boogschutters',
      weaponWord: 'ballistae & boogschutters',
    },
    greek: {
      heavyName: 'Oxybeles-boutwerpers', lightName: 'Boogschuttersrijen',
      summary: 'Boogschutters en oxybeles-boutwerpers — ram eerst, enter daarna',
      weaponWord: 'bogen & boutwerpers',
    },
    macedon: {
      heavyName: 'Torsie-steenwerpers', lightName: 'Boutwerpers',
      summary: 'Steenkatapulten en boutwerktuigen vanaf de grote dekken',
      weaponWord: 'katapulten & boutwerktuigen',
    },
    egypt: {
      heavyName: 'Lierboutwerpers', lightName: 'Boogschuttersrijen',
      summary: 'Boogschutters en lierbouten bij de Nijlmonden',
      weaponWord: 'bogen & boutwerpers',
    },
    arab: {
      heavyName: 'Nafta-vuursifons', lightName: 'Boogschuttersrijen',
      summary: 'Nafta-vuursifons, vuurpotten en boogschutters',
      weaponWord: 'vuursifons & bogen',
    },
    byzantium: {
      heavyName: 'Bronzen vuursifons', lightName: 'Brandpijlploegen',
      summary: 'Grieks vuur uit de boegsifons, met brandpijlen langs de dekken',
      weaponWord: 'Grieks-vuursifons',
    },
    chola: {
      heavyName: 'Lierboutwerpers', lightName: 'Boogschuttersrijen',
      summary: 'Boogschutters en lierbouten vanaf de grote Coromandel-rompen',
      weaponWord: 'bogen & boutwerpers',
    },
    vietnam: {
      heavyName: 'Lierboutwerpers', lightName: 'Brandpijlploegen',
      summary: 'Lierbouten en brandpijlen over de paalversperringen',
      weaponWord: 'bouten & brandpijlen',
    },
    inca: {
      heavyName: 'Slingerstenen', lightName: 'Atlatl-werpsperen',
      summary: 'Slingerstenen en atlatl-speren vanaf de balsavlotten',
      weaponWord: 'slingerstenen & speren',
    },
    phoenicia: {
      heavyName: 'Lierboutwerpers', lightName: 'Boogschuttersrijen',
      summary: 'Boogschutters en bouten vanaf de cederen galeien van Tyrus',
      weaponWord: 'bogen & boutwerpers',
    },
    hanse: {
      heavyName: 'Kruisbogen en springalds', lightName: 'Boogploegen',
      summary: 'Kruisbogen, springalds en handstenen vanaf de kasteelkoggen',
      weaponWord: 'kruisbogen & springalds',
    },
  },
  shots: {
    arrow: 'Pijl', bolt: 'Lierbout', fireArrow: 'Brandpijl', greekFire: 'Grieks vuur',
    stone: 'Steen', cannonball: 'Kogel', missile: 'Raket',
  },
  suffix: '— geen kruit: rompen branden, ze ontploffen niet',
  bar: { guns: 'Geschut', fire: 'Vuur', stones: 'Stenen', bows: 'Bogen' },
};

const pt: ArmamentsDict = {
  cannon: {
    heavyName: 'Bandas de pólvora',
    lightName: 'Artilharia de convés',
    summary: 'Bandas de pólvora, granadas e bala explosiva',
    volleyName: 'METRALHA!',
    weaponWord: 'canhões',
  },
  somali: {
    heavyName: 'RPG-7 e metralhadoras pesadas DShK',
    lightName: 'AK-47 e metralhadoras PKM',
    summary: 'Foguetes RPG-7, AK-47 e PKMs de fita desde esquifes e nave-mãe',
    volleyName: 'AUTOMÁTICO TOTAL!',
    weaponWord: 'RPGs e espingardas',
  },
  archeryVolley: 'CHUVA DE FLECHAS!',
  archery: {
    viking: {
      heavyName: 'Lança-virotes de torno', lightName: 'Guarnições de arco',
      summary: 'Arquearia, lanças de arremesso e lança-virotes de torno',
      weaponWord: 'arcos e lança-virotes',
    },
    roman: {
      heavyName: 'Balistas de pedra', lightName: 'Fileiras de archeiros',
      summary: 'Pedras de balista, engenhos de torção e arquearia',
      weaponWord: 'balistas e arquearia',
    },
    greek: {
      heavyName: 'Lança-virotes oxíbeles', lightName: 'Fileiras de archeiros',
      summary: 'Arquearia e lança-virotes oxíbeles — abalroa primeiro, aborda depois',
      weaponWord: 'arcos e lança-virotes',
    },
    macedon: {
      heavyName: 'Pedreiras de torção', lightName: 'Lança-virotes',
      summary: 'Catapultas de pedra e engenhos de virotes desde os grandes conveses',
      weaponWord: 'catapultas e engenhos',
    },
    egypt: {
      heavyName: 'Lança-virotes de torno', lightName: 'Fileiras de archeiros',
      summary: 'Arquearia e virotes de torno nas bocas do Nilo',
      weaponWord: 'arcos e lança-virotes',
    },
    arab: {
      heavyName: 'Sifões de fogo de nafta', lightName: 'Fileiras de archeiros',
      summary: 'Sifões de fogo de nafta, potes de fogo e arquearia',
      weaponWord: 'sifões de fogo e arcos',
    },
    byzantium: {
      heavyName: 'Sifões de fogo de bronze', lightName: 'Guarnições de flechas incendiárias',
      summary: 'Fogo grego dos sifões de proa, com flechas incendiárias nos conveses',
      weaponWord: 'sifões de fogo grego',
    },
    chola: {
      heavyName: 'Lança-virotes de torno', lightName: 'Fileiras de archeiros',
      summary: 'Arquearia e virotes de torno desde os grandes cascos de Coromandel',
      weaponWord: 'arcos e lança-virotes',
    },
    vietnam: {
      heavyName: 'Lança-virotes de torno', lightName: 'Guarnições de flechas incendiárias',
      summary: 'Virotes de torno e flechas incendiárias sobre as barragens de estacas',
      weaponWord: 'virotes e flechas incendiárias',
    },
    inca: {
      heavyName: 'Pedras de funda', lightName: 'Dardos de átlatl',
      summary: 'Pedras de funda e dardos de átlatl desde as jangadas',
      weaponWord: 'fundas e dardos',
    },
    phoenicia: {
      heavyName: 'Lança-virotes de torno', lightName: 'Fileiras de archeiros',
      summary: 'Arquearia e virotes desde as galés de cedro de Tiro',
      weaponWord: 'arcos e lança-virotes',
    },
    hanse: {
      heavyName: 'Bestas e springalds', lightName: 'Guarnições de arco',
      summary: 'Bestas, springalds e pedras de mão desde as cocas encasteladas',
      weaponWord: 'bestas e springalds',
    },
  },
  shots: {
    arrow: 'Flecha', bolt: 'Virote de torno', fireArrow: 'Flecha incendiária', greekFire: 'Fogo grego',
    stone: 'Pedra', cannonball: 'Bala', missile: 'Míssil',
  },
  suffix: '— sem pólvora: os cascos ardem, não explodem',
  bar: { guns: 'Canhões', fire: 'Fogo', stones: 'Pedras', bows: 'Arcos' },
};

const ja: ArmamentsDict = {
  cannon: {
    heavyName: '火薬舷側砲',
    lightName: '甲板砲',
    summary: '火薬舷側砲、炸裂弾と砲弾',
    volleyName: 'グレープ!',
    weaponWord: '火砲',
  },
  somali: {
    heavyName: 'RPG-7とDShK重機関銃',
    lightName: 'AK-47とPKM機関銃',
    summary: 'スキッフと母船からのRPG-7ロケット、AK-47、ベルト給弾PKM',
    volleyName: 'フルオート!',
    weaponWord: 'RPGと小銃',
  },
  archeryVolley: 'アローストーム!',
  archery: {
    viking: {
      heavyName: '巻上げ式ボルト発射機', lightName: '弓兵隊',
      summary: '弓術、手投げ槍、巻上げ式ボルト発射機',
      weaponWord: '弓と発射機',
    },
    roman: {
      heavyName: '投石バリスタ', lightName: '弓兵列',
      summary: 'バリスタ投石、捻力兵器と弓術',
      weaponWord: 'バリスタと弓術',
    },
    greek: {
      heavyName: 'オクシュベレス発射機', lightName: '弓兵列',
      summary: '弓術とオクシュベレス発射機 — まず体当たり、次に接舷',
      weaponWord: '弓と発射機',
    },
    macedon: {
      heavyName: '捻力投石機', lightName: 'ボルト発射機',
      summary: '大甲板からの投石カタパルトとボルト兵器',
      weaponWord: 'カタパルトと発射機',
    },
    egypt: {
      heavyName: '巻上げ式ボルト発射機', lightName: '弓兵列',
      summary: 'ナイル河口沿いの弓術と巻上げボルト',
      weaponWord: '弓と発射機',
    },
    arab: {
      heavyName: 'ナフサ火炎サイフォン', lightName: '弓兵列',
      summary: 'ナフサ火炎サイフォン、火炎壺と弓術',
      weaponWord: '火炎サイフォンと弓',
    },
    byzantium: {
      heavyName: '青銅火炎サイフォン', lightName: '火矢隊',
      summary: '艦首サイフォンからのギリシア火、甲板沿いの火矢',
      weaponWord: 'ギリシア火サイフォン',
    },
    chola: {
      heavyName: '巻上げ式ボルト発射機', lightName: '弓兵列',
      summary: 'コロマンデルの大船体からの弓術と巻上げボルト',
      weaponWord: '弓と発射機',
    },
    vietnam: {
      heavyName: '巻上げ式ボルト発射機', lightName: '火矢隊',
      summary: '杭堰越しの巻上げボルトと火矢',
      weaponWord: 'ボルトと火矢',
    },
    inca: {
      heavyName: '投石', lightName: 'アトラトル投槍',
      summary: '筏からの投石とアトラトル投槍',
      weaponWord: '投石と投槍',
    },
    phoenicia: {
      heavyName: '巻上げ式ボルト発射機', lightName: '弓兵列',
      summary: 'ティルスの杉ガレーからの弓術とボルト',
      weaponWord: '弓と発射機',
    },
    hanse: {
      heavyName: '弩とスプリンガルド', lightName: '弓兵隊',
      summary: '城郭コグからの弩、スプリンガルド、手投げ石',
      weaponWord: '弩とスプリンガルド',
    },
  },
  shots: {
    arrow: '矢', bolt: '巻上げボルト', fireArrow: '火矢', greekFire: 'ギリシア火',
    stone: '石', cannonball: '砲弾', missile: 'ミサイル',
  },
  suffix: '— 火薬なし:船体は燃える、爆発はしない',
  bar: { guns: '火砲', fire: '火炎', stones: '投石', bows: '弓' },
};

const zh: ArmamentsDict = {
  cannon: {
    heavyName: '火药舷炮',
    lightName: '甲板炮',
    summary: '火药舷炮、爆破弹与实心弹',
    volleyName: '霰弹！',
    weaponWord: '火炮',
  },
  somali: {
    heavyName: 'RPG-7 与 DShK 重机枪',
    lightName: 'AK-47 与 PKM 机枪',
    summary: '小艇与母船上的 RPG-7 火箭、AK-47 与弹链供弹 PKM',
    volleyName: '全自动！',
    weaponWord: 'RPG 与步枪',
  },
  archeryVolley: '箭雨！',
  archery: {
    viking: {
      heavyName: '绞盘弩炮', lightName: '弓手队',
      summary: '弓箭、手掷标枪与绞盘弩炮',
      weaponWord: '弓与绞盘弩',
    },
    roman: {
      heavyName: '掷石弩炮', lightName: '弓手列阵',
      summary: '弩炮石弹、扭力机械与弓箭',
      weaponWord: '弩炮与弓箭',
    },
    greek: {
      heavyName: '腹弓弩炮', lightName: '弓手列阵',
      summary: '弓箭与腹弓弩炮——先撞后接舷',
      weaponWord: '弓与绞盘弩',
    },
    macedon: {
      heavyName: '扭力掷石器', lightName: '弩炮',
      summary: '大战船甲板上的掷石机与弩炮',
      weaponWord: '掷石机与弩炮',
    },
    egypt: {
      heavyName: '绞盘弩炮', lightName: '弓手列阵',
      summary: '尼罗河口沿岸的弓箭与绞盘弩',
      weaponWord: '弓与绞盘弩',
    },
    arab: {
      heavyName: '火油喷管', lightName: '弓手列阵',
      summary: '火油喷管、火罐与弓箭',
      weaponWord: '喷火管与弓',
    },
    byzantium: {
      heavyName: '青铜喷火管', lightName: '火箭队',
      summary: '艏喷管射出希腊火，甲板两侧辅以火箭',
      weaponWord: '希腊火喷管',
    },
    chola: {
      heavyName: '绞盘弩炮', lightName: '弓手列阵',
      summary: '科罗曼德大战船上的弓箭与绞盘弩',
      weaponWord: '弓与绞盘弩',
    },
    vietnam: {
      heavyName: '绞盘弩炮', lightName: '火箭队',
      summary: '暗桩阵上空的绞盘弩与火箭',
      weaponWord: '弩矢与火箭',
    },
    inca: {
      heavyName: '投石索飞石', lightName: '梭标器短标',
      summary: '轻木筏上的投石与梭标',
      weaponWord: '飞石与短标',
    },
    phoenicia: {
      heavyName: '绞盘弩炮', lightName: '弓手列阵',
      summary: '推罗雪松战船上的弓箭与弩矢',
      weaponWord: '弓与绞盘弩',
    },
    hanse: {
      heavyName: '弩与床弩', lightName: '弓手队',
      summary: '城堡柯克船上的弩、床弩与手掷石块',
      weaponWord: '弩与床弩',
    },
  },
  shots: {
    arrow: '箭', bolt: '绞盘弩矢', fireArrow: '火箭', greekFire: '希腊火',
    stone: '石弹', cannonball: '炮弹', missile: '导弹',
  },
  suffix: '——无火药：船体燃烧，不会爆炸',
  bar: { guns: '炮', fire: '火', stones: '石', bows: '弓' },
};

const id: ArmamentsDict = {
  cannon: {
    heavyName: 'Broadside mesiu',
    lightName: 'Meriam dek',
    summary: 'Broadside mesiu, peluru peledak dan peluru padat',
    volleyName: 'ANGGUR!',
    weaponWord: 'meriam',
  },
  somali: {
    heavyName: 'RPG-7 & senapan mesin berat DShK',
    lightName: 'AK-47 & senapan mesin PKM',
    summary: 'Roket RPG-7, AK-47, dan PKM sabuk dari skiff dan kapal induk',
    volleyName: 'OTOMATIS PENUH!',
    weaponWord: 'RPG & senapan',
  },
  archeryVolley: 'HUJAN PANAH!',
  archery: {
    viking: {
      heavyName: 'Peluncur baut katrol', lightName: 'Awak busur',
      summary: 'Panahan, lembing tangan, dan peluncur baut katrol',
      weaponWord: 'busur & peluncur katrol',
    },
    roman: {
      heavyName: 'Balista pelempar batu', lightName: 'Barisan pemanah',
      summary: 'Batu balista, mesin torsi, dan panahan',
      weaponWord: 'balista & panahan',
    },
    greek: {
      heavyName: 'Peluncur baut oxybeles', lightName: 'Barisan pemanah',
      summary: 'Panahan dan peluncur baut oxybeles — dobrak dulu, serbu kemudian',
      weaponWord: 'busur & peluncur katrol',
    },
    macedon: {
      heavyName: 'Pelempar batu torsi', lightName: 'Peluncur baut',
      summary: 'Katapel pelempar batu dan mesin baut dari dek-dek besar',
      weaponWord: 'katapel & mesin baut',
    },
    egypt: {
      heavyName: 'Peluncur baut katrol', lightName: 'Barisan pemanah',
      summary: 'Panahan dan baut katrol di sepanjang muara Nil',
      weaponWord: 'busur & peluncur katrol',
    },
    arab: {
      heavyName: 'Sifon api nafta', lightName: 'Barisan pemanah',
      summary: 'Sifon api nafta, panci api, dan panahan',
      weaponWord: 'sifon api & busur',
    },
    byzantium: {
      heavyName: 'Sifon api perunggu', lightName: 'Awak panah api',
      summary: 'Api Yunani dari sifon haluan, dengan panah api di sepanjang dek',
      weaponWord: 'sifon api Yunani',
    },
    chola: {
      heavyName: 'Peluncur baut katrol', lightName: 'Barisan pemanah',
      summary: 'Panahan dan baut katrol dari lambung besar Coromandel',
      weaponWord: 'busur & peluncur katrol',
    },
    vietnam: {
      heavyName: 'Peluncur baut katrol', lightName: 'Awak panah api',
      summary: 'Baut katrol dan panah api di atas rintangan pancang',
      weaponWord: 'baut & panah api',
    },
    inca: {
      heavyName: 'Batu umban', lightName: 'Lembing atlatl',
      summary: 'Batu umban dan lembing atlatl dari rakit balsa',
      weaponWord: 'batu umban & lembing',
    },
    phoenicia: {
      heavyName: 'Peluncur baut katrol', lightName: 'Barisan pemanah',
      summary: 'Panahan dan baut dari galai cedar Tirus',
      weaponWord: 'busur & peluncur katrol',
    },
    hanse: {
      heavyName: 'Busur silang dan springald', lightName: 'Awak busur',
      summary: 'Busur silang, springald, dan batu tangan dari kog kastel',
      weaponWord: 'busur silang & springald',
    },
  },
  shots: {
    arrow: 'Panah', bolt: 'Baut katrol', fireArrow: 'Panah api', greekFire: 'Api Yunani',
    stone: 'Batu', cannonball: 'Peluru', missile: 'Rudal',
  },
  suffix: '— tanpa mesiu: lambung terbakar, tidak meledak',
  bar: { guns: 'Meriam', fire: 'Api', stones: 'Batu', bows: 'Busur' },
};

const th: ArmamentsDict = {
  cannon: {
    heavyName: 'กราบดินปืน',
    lightName: 'ปืนดาดฟ้า',
    summary: 'กราบดินปืน กระสุนระเบิดและลูกเหล็ก',
    volleyName: 'ลูกองุ่น!',
    weaponWord: 'ปืน',
  },
  somali: {
    heavyName: 'RPG-7 & ปืนกลหนัก DShK',
    lightName: 'AK-47 & ปืนกล PKM',
    summary: 'จรวด RPG-7 AK-47 และ PKM สายกระสุนจากเรือสกิฟฟ์และเรือแม่',
    volleyName: 'อัตโนมัติเต็มขั้น!',
    weaponWord: 'RPG & ปืนเล็ก',
  },
  archeryVolley: 'พายุธนู!',
  archery: {
    viking: {
      heavyName: 'เครื่องยิงลูกดอกกว้าน', lightName: 'ทีมธนู',
      summary: 'ธนู หอกขว้างมือ และเครื่องยิงลูกดอกกว้าน',
      weaponWord: 'ธนู & เครื่องยิงกว้าน',
    },
    roman: {
      heavyName: 'บาลิสตาขว้างหิน', lightName: 'แถวพลธนู',
      summary: 'หินบาลิสตา เครื่องบิด และธนู',
      weaponWord: 'บาลิสตา & ธนู',
    },
    greek: {
      heavyName: 'เครื่องยิงลูกดอกอ็อกซีเบเลส', lightName: 'แถวพลธนู',
      summary: 'ธนูและเครื่องยิงอ็อกซีเบเลส — ชนก่อน ยึดทีหลัง',
      weaponWord: 'ธนู & เครื่องยิงกว้าน',
    },
    macedon: {
      heavyName: 'เครื่องขว้างหินบิด', lightName: 'เครื่องยิงลูกดอก',
      summary: 'เครื่องยิงหินและเครื่องลูกดอกบนดาดฟ้ายักษ์',
      weaponWord: 'เครื่องยิงหิน & ลูกดอก',
    },
    egypt: {
      heavyName: 'เครื่องยิงลูกดอกกว้าน', lightName: 'แถวพลธนู',
      summary: 'ธนูและลูกดอกกว้านตลอดปากแม่น้ำไนล์',
      weaponWord: 'ธนู & เครื่องยิงกว้าน',
    },
    arab: {
      heavyName: 'ไซฟอนไฟแนฟทา', lightName: 'แถวพลธนู',
      summary: 'ไซฟอนไฟแนฟทา หม้อไฟ และธนู',
      weaponWord: 'ไซฟอนไฟ & ธนู',
    },
    byzantium: {
      heavyName: 'ไซฟอนทองสัมฤทธิ์', lightName: 'ทีมธนูไฟ',
      summary: 'กรีกไฟจากไซฟอนหัวเรือ พร้อมธนูไฟตลอดดาดฟ้า',
      weaponWord: 'ไซฟอนกรีกไฟ',
    },
    chola: {
      heavyName: 'เครื่องยิงลูกดอกกว้าน', lightName: 'แถวพลธนู',
      summary: 'ธนูและลูกดอกกว้านจากตัวเรือโคโรมันเดลยักษ์',
      weaponWord: 'ธนู & เครื่องยิงกว้าน',
    },
    vietnam: {
      heavyName: 'เครื่องยิงลูกดอกกว้าน', lightName: 'ทีมธนูไฟ',
      summary: 'ลูกดอกกว้านและธนูไฟเหนือแนวกั้นหลักไม้',
      weaponWord: 'ลูกดอก & ธนูไฟ',
    },
    inca: {
      heavyName: 'หินสลิง', lightName: 'ลูกดอกแอตแลเทิล',
      summary: 'หินสลิงและลูกดอกแอตแลเทิลจากแพไม้บัลซา',
      weaponWord: 'หินสลิง & ลูกดอก',
    },
    phoenicia: {
      heavyName: 'เครื่องยิงลูกดอกกว้าน', lightName: 'แถวพลธนู',
      summary: 'ธนูและลูกอกจากแกลลีย์ซีดาร์แห่งไทร์',
      weaponWord: 'ธนู & เครื่องยิงกว้าน',
    },
    hanse: {
      heavyName: 'หน้าไม้และสปริงกัลด์', lightName: 'ทีมธนู',
      summary: 'หน้าไม้ สปริงกัลด์ และหินขว้างมือจากเรือค็อกก์ปราสาท',
      weaponWord: 'หน้าไม้ & สปริงกัลด์',
    },
  },
  shots: {
    arrow: 'ธนู', bolt: 'ลูกดอกกว้าน', fireArrow: 'ธนูไฟ', greekFire: 'กรีกไฟ',
    stone: 'หิน', cannonball: 'ลูกปืน', missile: 'ขีปนาวุธ',
  },
  suffix: '— ไม่มีดินปืน: ตัวเรือไหม้ ไม่ระเบิด',
  bar: { guns: 'ปืน', fire: 'ไฟ', stones: 'หิน', bows: 'ธนู' },
};

const vi: ArmamentsDict = {
  cannon: {
    heavyName: 'Mạn thuốc súng',
    lightName: 'Pháo boong',
    summary: 'Mạn thuốc súng, đạn nổ và đạn đặc',
    volleyName: 'ĐẠN CHÙM!',
    weaponWord: 'pháo',
  },
  somali: {
    heavyName: 'RPG-7 & trọng liên DShK',
    lightName: 'AK-47 & trung liên PKM',
    summary: 'Tên lửa RPG-7, AK-47 và PKM dây đạn từ xuồng và tàu mẹ',
    volleyName: 'TỰ ĐỘNG HOÀN TOÀN!',
    weaponWord: 'RPG & súng trường',
  },
  archeryVolley: 'BÃO TÊN!',
  archery: {
    viking: {
      heavyName: 'Máy bắn tên ròng rọc', lightName: 'Đội cung',
      summary: 'Bắn cung, lao ném tay và máy bắn tên ròng rọc',
      weaponWord: 'cung & máy ròng rọc',
    },
    roman: {
      heavyName: 'Máy bắn đá ballista', lightName: 'Hàng cung thủ',
      summary: 'Đá ballista, máy xoắn và bắn cung',
      weaponWord: 'ballista & cung',
    },
    greek: {
      heavyName: 'Máy bắn tên oxybeles', lightName: 'Hàng cung thủ',
      summary: 'Bắn cung và máy bắn tên oxybeles — đâm trước, chiếm sau',
      weaponWord: 'cung & máy ròng rọc',
    },
    macedon: {
      heavyName: 'Máy ném đá xoắn', lightName: 'Máy bắn tên',
      summary: 'Máy ném đá và máy bắn tên trên boong lớn',
      weaponWord: 'máy ném đá & máy bắn tên',
    },
    egypt: {
      heavyName: 'Máy bắn tên ròng rọc', lightName: 'Hàng cung thủ',
      summary: 'Bắn cung và tên ròng rọc dọc cửa sông Nile',
      weaponWord: 'cung & máy ròng rọc',
    },
    arab: {
      heavyName: 'Ống phun lửa naphtha', lightName: 'Hàng cung thủ',
      summary: 'Ống phun lửa naphtha, bình lửa và bắn cung',
      weaponWord: 'ống phun lửa & cung',
    },
    byzantium: {
      heavyName: 'Ống phun đồng', lightName: 'Đội tên lửa',
      summary: 'Lửa Hy Lạp từ ống phun mũi, tên lửa dọc boong',
      weaponWord: 'ống phun lửa Hy Lạp',
    },
    chola: {
      heavyName: 'Máy bắn tên ròng rọc', lightName: 'Hàng cung thủ',
      summary: 'Bắn cung và tên ròng rọc từ thân lớn Coromandel',
      weaponWord: 'cung & máy ròng rọc',
    },
    vietnam: {
      heavyName: 'Máy bắn tên ròng rọc', lightName: 'Đội tên lửa',
      summary: 'Tên ròng rọc và tên lửa trên bãi cọc',
      weaponWord: 'tên & tên lửa',
    },
    inca: {
      heavyName: 'Đá ná', lightName: 'Lao atlatl',
      summary: 'Đá ná và lao atlatl từ bè balsa',
      weaponWord: 'đá ná & lao',
    },
    phoenicia: {
      heavyName: 'Máy bắn tên ròng rọc', lightName: 'Hàng cung thủ',
      summary: 'Bắn cung và tên từ thuyền tuyết tùng Tyre',
      weaponWord: 'cung & máy ròng rọc',
    },
    hanse: {
      heavyName: 'Nỏ và máy springald', lightName: 'Đội cung',
      summary: 'Nỏ, springald và đá ném tay từ tàu cog thành',
      weaponWord: 'nỏ & springald',
    },
  },
  shots: {
    arrow: 'Tên', bolt: 'Tên ròng rọc', fireArrow: 'Tên lửa', greekFire: 'Lửa Hy Lạp',
    stone: 'Đá', cannonball: 'Đạn', missile: 'Tên lửa',
  },
  suffix: '— không thuốc súng: thân cháy, không nổ',
  bar: { guns: 'Pháo', fire: 'Lửa', stones: 'Đá', bows: 'Cung' },
};

const ar: ArmamentsDict = {
  cannon: {
    heavyName: 'قصف البارود',
    lightName: 'مدافع السطح',
    summary: 'قصف البارود والقذائف المتفجرة والطلقات',
    volleyName: 'عنب!',
    weaponWord: 'مدافع',
  },
  somali: {
    heavyName: 'RPG-7 ورشاشات دوشكا الثقيلة',
    lightName: 'كلاشنكوف ورشاشات PKM',
    summary: 'صواريخ RPG-7 وكلاشنكوف وPKM بالحزام من الزوارق والسفينة الأم',
    volleyName: 'رش كامل!',
    weaponWord: 'RPG وبنادق',
  },
  archeryVolley: 'عاصفة سهام!',
  archery: {
    viking: {
      heavyName: 'قاذفات مسامير بالروافع', lightName: 'أطقم الأقواس',
      summary: 'رماية ورماح مرمية باليد وقاذفات مسامير بالروافع',
      weaponWord: 'أقواس وقاذفات',
    },
    roman: {
      heavyName: 'قاذفات حجارة', lightName: 'صفوف الرماة',
      summary: 'حجارة القاذفات وآلات الفتل والرماية',
      weaponWord: 'قاذفات ورماية',
    },
    greek: {
      heavyName: 'قاذفات مسامير أوكسيبيليس', lightName: 'صفوف الرماة',
      summary: 'رماية وقاذفات مسامير أوكسيبيليس — اصدم أولًا ثم استولِ',
      weaponWord: 'أقواس وقاذفات',
    },
    macedon: {
      heavyName: 'راميات حجارة فتلية', lightName: 'قاذفات مسامير',
      summary: 'مقاليع حجارة وآلات مسامير من السطوح العظيمة',
      weaponWord: 'مقاليع وآلات مسامير',
    },
    egypt: {
      heavyName: 'قاذفات مسامير بالروافع', lightName: 'صفوف الرماة',
      summary: 'رماية ومسامير بالروافع على مصابّ النيل',
      weaponWord: 'أقواس وقاذفات',
    },
    arab: {
      heavyName: 'سيفونات نار النفط', lightName: 'صفوف الرماة',
      summary: 'سيفونات نار النفط وقدور النار والرماية',
      weaponWord: 'سيفونات نار وأقواس',
    },
    byzantium: {
      heavyName: 'سيفونات برونزية', lightName: 'أطقم السهام النارية',
      summary: 'نار إغريقية من سيفونات المقدمة، مع سهام نارية على السطوح',
      weaponWord: 'سيفونات النار الإغريقية',
    },
    chola: {
      heavyName: 'قاذفات مسامير بالروافع', lightName: 'صفوف الرماة',
      summary: 'رماية ومسامير بالروافع من أبدان كوروماندل الكبيرة',
      weaponWord: 'أقواس وقاذفات',
    },
    vietnam: {
      heavyName: 'قاذفات مسامير بالروافع', lightName: 'أطقم السهام النارية',
      summary: 'مسامير بالروافع وسهام نارية فوق حواجز الأوتاد',
      weaponWord: 'مسامير وسهام نارية',
    },
    inca: {
      heavyName: 'حجارة مقاليع', lightName: 'سهام الأتلاتل',
      summary: 'حجارة مقاليع وسهام أتلاتل من أطواف البالسا',
      weaponWord: 'حجارة مقاليع وسهام',
    },
    phoenicia: {
      heavyName: 'قاذفات مسامير بالروافع', lightName: 'صفوف الرماة',
      summary: 'رماية ومسامير من قوادس أرز صور',
      weaponWord: 'أقواس وقاذفات',
    },
    hanse: {
      heavyName: 'نشاشيب ومنجنيقات صغيرة', lightName: 'أطقم الأقواس',
      summary: 'نشاشيب ومنجنيقات وحجارة مرمية باليد من قوادس القلاع',
      weaponWord: 'نشاشيب ومنجنيقات',
    },
  },
  shots: {
    arrow: 'سهم', bolt: 'مسمار رافعة', fireArrow: 'سهم ناري', greekFire: 'نار إغريقية',
    stone: 'حجر', cannonball: 'قذيفة', missile: 'صاروخ',
  },
  suffix: '— لا بارود: الأبدان تحترق ولا تنفجر',
  bar: { guns: 'مدافع', fire: 'نار', stones: 'حجارة', bows: 'أقواس' },
};

const sw: ArmamentsDict = {
  cannon: {
    heavyName: 'Mashambulizi ya baruti',
    lightName: 'Mizinga ya staha',
    summary: 'Mashambulizi ya baruti, makombora na risasi zinazolipuka',
    volleyName: 'MZABIBU!',
    weaponWord: 'mizinga',
  },
  somali: {
    heavyName: 'RPG-7 na mashine-guni mazito za DShK',
    lightName: 'AK-47 na mashine-guni za PKM',
    summary: 'Roketi za RPG-7, AK-47 na PKM zenye mikanda kutoka skifu na meli mama',
    volleyName: 'MOTO KAMILI!',
    weaponWord: 'RPG na bunduki',
  },
  archeryVolley: 'DHORUBA YA MISHALE!',
  archery: {
    viking: {
      heavyName: 'Vizindua boli vinavyovutwa kwa kapi', lightName: 'Vikosi vya pinde',
      summary: 'Upiga mishale, mikuki ya kutupa kwa mkono na vizindua boli vya kapi',
      weaponWord: 'pinde na vizindua',
    },
    roman: {
      heavyName: 'Balista zitupazo mawe', lightName: 'Safu za wapiga mishale',
      summary: 'Mawe ya balista, injini za msokoto na upiga mishale',
      weaponWord: 'balista na mishale',
    },
    greek: {
      heavyName: 'Vizindua boli vya Oxybeles', lightName: 'Safu za wapiga mishale',
      summary: 'Upiga mishale na vizindua boli vya oxybeles — gonga kwanza, teka baadaye',
      weaponWord: 'pinde na vizindua',
    },
    macedon: {
      heavyName: 'Vitupa mawe vya msokoto', lightName: 'Vizindua boli',
      summary: 'Manati yanayotupa mawe na injini za boli kutoka staha kubwa',
      weaponWord: 'manati na injini za boli',
    },
    egypt: {
      heavyName: 'Vizindua boli vinavyovutwa kwa kapi', lightName: 'Safu za wapiga mishale',
      summary: 'Upiga mishale na boli za kapi kando ya midomo ya Nile',
      weaponWord: 'pinde na vizindua',
    },
    arab: {
      heavyName: 'Mirija ya moto ya mafuta', lightName: 'Safu za wapiga mishale',
      summary: 'Mirija ya moto ya mafuta, chungu za moto na upiga mishale',
      weaponWord: 'mirija ya moto na pinde',
    },
    byzantium: {
      heavyName: 'Mirija ya shaba ya moto', lightName: 'Vikosi vya mishale ya moto',
      summary: 'Moto wa Kigiriki kutoka mirija ya mbele, na mishale ya moto stahani',
      weaponWord: 'mirija ya moto wa Kigiriki',
    },
    chola: {
      heavyName: 'Vizindua boli vinavyovutwa kwa kapi', lightName: 'Safu za wapiga mishale',
      summary: 'Upiga mishale na boli za kapi kutoka meli kubwa za Coromandel',
      weaponWord: 'pinde na vizindua',
    },
    vietnam: {
      heavyName: 'Vizindua boli vinavyovutwa kwa kapi', lightName: 'Vikosi vya mishale ya moto',
      summary: 'Boli za kapi na mishale ya moto juu ya vizuizi vya vigingi',
      weaponWord: 'boli na mishale ya moto',
    },
    inca: {
      heavyName: 'Mawe ya kombeo', lightName: 'Mishale ya atlatl',
      summary: 'Mawe ya kombeo na mishale ya atlatl kutoka matenga ya balsa',
      weaponWord: 'mawe ya kombeo na mishale',
    },
    phoenicia: {
      heavyName: 'Vizindua boli vinavyovutwa kwa kapi', lightName: 'Safu za wapiga mishale',
      summary: 'Upiga mishale na boli kutoka meli za mwerezi za Tiro',
      weaponWord: 'pinde na vizindua',
    },
    hanse: {
      heavyName: 'Pinde za msalaba na springaldi', lightName: 'Vikosi vya pinde',
      summary: 'Pinde za msalaba, springaldi na mawe ya kutupa kwa mkono kutoka meli za ngome',
      weaponWord: 'pinde za msalaba na springaldi',
    },
  },
  shots: {
    arrow: 'Mshale', bolt: 'Boli ya kapi', fireArrow: 'Mshale wa moto', greekFire: 'Moto wa Kigiriki',
    stone: 'Jiwe', cannonball: 'Risasi', missile: 'Roketi',
  },
  suffix: '— hakuna baruti: miili huwaka, hailipuki',
  bar: { guns: 'Mizinga', fire: 'Moto', stones: 'Mawe', bows: 'Pinde' },
};

const ha: ArmamentsDict = {
  cannon: {
    heavyName: 'Harbin bindiga',
    lightName: 'Bindigogin bene',
    summary: 'Harbin bindiga, harsashin da ke fashewa da harbi',
    volleyName: 'INABI!',
    weaponWord: 'bindigogi',
  },
  somali: {
    heavyName: 'RPG-7 & manyan bindigogin DShK',
    lightName: 'AK-47 & bindigogin PKM',
    summary: 'Rokokin RPG-7, AK-47 da PKMs masu bel daga skiffs da jirgin uwa',
    volleyName: 'CIKAKKEN AUTO!',
    weaponWord: 'RPGs & bindigogi',
  },
  archeryVolley: 'GUGUWAR KIBIYOYI!',
  archery: {
    viking: {
      heavyName: 'Masu harba bolts da igiya', lightName: 'Rundunar baka',
      summary: 'Kibiyoyi, mashi da hannu da masu harba bolts da igiya',
      weaponWord: 'baka & masu ja',
    },
    roman: {
      heavyName: 'Ballistae masu jifar duwatsu', lightName: 'Sahunan masu kibiya',
      summary: 'Duwatsun ballista, injin torsion da kibiyoyi',
      weaponWord: 'ballistae & kibiyoyi',
    },
    greek: {
      heavyName: 'Masu harba bolts na Oxybeles', lightName: 'Sahunan masu kibiya',
      summary: 'Kibiyoyi da masu harba bolts na oxybeles — karo da farko, kama daga baya',
      weaponWord: 'baka & masu ja',
    },
    macedon: {
      heavyName: 'Masu jifar duwatsu na torsion', lightName: 'Masu harba bolts',
      summary: 'Catapults masu jifar duwatsu da injin bolts daga manyan benaye',
      weaponWord: 'catapults & injin bolts',
    },
    egypt: {
      heavyName: 'Masu harba bolts da igiya', lightName: 'Sahunan masu kibiya',
      summary: 'Kibiyoyi da bolts da igiya a bakunan Nile',
      weaponWord: 'baka & masu ja',
    },
    arab: {
      heavyName: 'Siphons na wutar man', lightName: 'Sahunan masu kibiya',
      summary: 'Siphons na wutar man, tukunyar wuta da kibiyoyi',
      weaponWord: 'siphons na wuta & baka',
    },
    byzantium: {
      heavyName: 'Siphons na tagulla', lightName: 'Rundunar kibiyoyin wuta',
      summary: 'Wutar Girka daga siphons na gaba, da kibiyoyin wuta a benaye',
      weaponWord: 'siphons na wutar Girka',
    },
    chola: {
      heavyName: 'Masu harba bolts da igiya', lightName: 'Sahunan masu kibiya',
      summary: 'Kibiyoyi da bolts da igiya daga manyan jiragen Coromandel',
      weaponWord: 'baka & masu ja',
    },
    vietnam: {
      heavyName: 'Masu harba bolts da igiya', lightName: 'Rundunar kibiyoyin wuta',
      summary: 'Bolts da igiya da kibiyoyin wuta a kan shingen sanduna',
      weaponWord: 'bolts & kibiyoyin wuta',
    },
    inca: {
      heavyName: 'Duwatsun majajjawa', lightName: 'Kibiyoyin atlatl',
      summary: 'Duwatsun majajjawa da kibiyoyin atlatl daga kwalekwalen balsa',
      weaponWord: 'duwatsun majajjawa & kibiyoyi',
    },
    phoenicia: {
      heavyName: 'Masu harba bolts da igiya', lightName: 'Sahunan masu kibiya',
      summary: 'Kibiyoyi da bolts daga jiragen itacen alarz na Taya',
      weaponWord: 'baka & masu ja',
    },
    hanse: {
      heavyName: 'Crossbows da springalds', lightName: 'Rundunar baka',
      summary: 'Crossbows, springalds da duwatsu da hannu daga jiragen ganuwa',
      weaponWord: 'crossbows & springalds',
    },
  },
  shots: {
    arrow: 'Kibiya', bolt: 'Bolt na igiya', fireArrow: 'Kibiyar wuta', greekFire: 'Wutar Girka',
    stone: 'Dutse', cannonball: 'Harbi', missile: 'Roka',
  },
  suffix: '— babu bindiga: jiragen suna ƙonewa, ba sa fashewa',
  bar: { guns: 'Bindigogi', fire: 'Wuta', stones: 'Duwatsu', bows: 'Baka' },
};

const yo: ArmamentsDict = {
  cannon: {
    heavyName: 'Ìbọn etu ìbọn',
    lightName: 'Ìbọn pẹpẹ',
    summary: 'Ìbọn etu ìbọn, ọta ìbú àti ìbọn',
    volleyName: 'ÈSO ÀJÀRÀ!',
    weaponWord: 'ìbọn',
  },
  somali: {
    heavyName: 'RPG-7 & ìbọn ẹ̀rọ líle DShK',
    lightName: 'AK-47 & ìbọn ẹ̀rọ PKM',
    summary: 'Roketi RPG-7, AK-47 àti PKM abẹ́gàn láti inú skiffs àti ọkọ̀ ìyá',
    volleyName: 'AUTO KÍKÚN!',
    weaponWord: 'RPG & ìbọn',
  },
  archeryVolley: 'ÌJÌ ỌFÀ!',
  archery: {
    viking: {
      heavyName: 'Àwọn ẹ̀rọ ìbọn bolts kẹ̀kẹ́', lightName: 'Àwọn ẹgbẹ́ ọrun',
      summary: 'Títàfàtà, ọ̀kọ̀ ọwọ́ àti àwọn ẹ̀rọ ìbọn bolts kẹ̀kẹ́',
      weaponWord: 'ọrun & ẹ̀rọ kẹ̀kẹ́',
    },
    roman: {
      heavyName: 'Balistae ajù òkúta', lightName: 'Ẹ̀sẹ̀ àwọn tafàtafà',
      summary: 'Òkúta balista, ẹ̀rọ ìyípo àti títàfàtà',
      weaponWord: 'balistae & ọfà',
    },
    greek: {
      heavyName: 'Àwọn ẹ̀rọ ìbọn bolts Oxybeles', lightName: 'Ẹ̀sẹ̀ àwọn tafàtafà',
      summary: 'Títàfàtà àti àwọn ẹ̀rọ ìbọn bolts oxybeles — kọlu niṣáájú, gbà lẹ́yìn',
      weaponWord: 'ọrun & ẹ̀rọ kẹ̀kẹ́',
    },
    macedon: {
      heavyName: 'Àwọn ajù òkúta ìyípo', lightName: 'Àwọn ẹ̀rọ ìbọn bolts',
      summary: 'Àwọn catapult ajù òkúta àti ẹ̀rọ bolts láti orí pẹpẹ ńlá',
      weaponWord: 'catapult & ẹ̀rọ bolts',
    },
    egypt: {
      heavyName: 'Àwọn ẹ̀rọ ìbọn bolts kẹ̀kẹ́', lightName: 'Ẹ̀sẹ̀ àwọn tafàtafà',
      summary: 'Títàfàtà àti bolts kẹ̀kẹ́ lẹ́bàá ẹnu Nile',
      weaponWord: 'ọrun & ẹ̀rọ kẹ̀kẹ́',
    },
    arab: {
      heavyName: 'Àwọn fèrè iná epo', lightName: 'Ẹ̀sẹ̀ àwọn tafàtafà',
      summary: 'Àwọn fèrè iná epo, ìkòkò iná àti títàfàtà',
      weaponWord: 'fèrè iná & ọrun',
    },
    byzantium: {
      heavyName: 'Àwọn fèrè ìdẹ', lightName: 'Àwọn ẹgbẹ́ ọfà iná',
      summary: 'Iná Gíríkì láti inú àwọn fèrè iwájú, pẹ̀lú ọfà iná lórí pẹpẹ',
      weaponWord: 'àwọn fèrè iná Gíríkì',
    },
    chola: {
      heavyName: 'Àwọn ẹ̀rọ ìbọn bolts kẹ̀kẹ́', lightName: 'Ẹ̀sẹ̀ àwọn tafàtafà',
      summary: 'Títàfàtà àti bolts kẹ̀kẹ́ láti inú àwọn ara ọkọ̀ ńlá Coromandel',
      weaponWord: 'ọrun & ẹ̀rọ kẹ̀kẹ́',
    },
    vietnam: {
      heavyName: 'Àwọn ẹ̀rọ ìbọn bolts kẹ̀kẹ́', lightName: 'Àwọn ẹgbẹ́ ọfà iná',
      summary: 'Bolts kẹ̀kẹ́ àti ọfà iná lórí àwọn òdì ìkọ̀',
      weaponWord: 'bolts & ọfà iná',
    },
    inca: {
      heavyName: 'Òkúta àkàtì', lightName: 'Ọfà atlatl',
      summary: 'Òkúta àkàtì àti ọfà atlatl láti inú àwọn ọkọ̀ balsa',
      weaponWord: 'òkúta àkàtì & ọfà',
    },
    phoenicia: {
      heavyName: 'Àwọn ẹ̀rọ ìbọn bolts kẹ̀kẹ́', lightName: 'Ẹ̀sẹ̀ àwọn tafàtafà',
      summary: 'Títàfàtà àti bolts láti inú àwọn ọkọ̀ kedari Taya',
      weaponWord: 'ọrun & ẹ̀rọ kẹ̀kẹ́',
    },
    hanse: {
      heavyName: 'Crossbows àti springalds', lightName: 'Àwọn ẹgbẹ́ ọrun',
      summary: 'Crossbows, springalds àti òkúta ọwọ́ láti inú àwọn ọkọ̀ odi',
      weaponWord: 'crossbows & springalds',
    },
  },
  shots: {
    arrow: 'Ọfà', bolt: 'Bolt kẹ̀kẹ́', fireArrow: 'Ọfà iná', greekFire: 'Iná Gíríkì',
    stone: 'Òkúta', cannonball: 'Ìbọn', missile: 'Rocket',
  },
  suffix: '— kò sí etu ìbọn: àwọn ara ọkọ̀ ń jó, wọn kì í bú',
  bar: { guns: 'Ìbọn', fire: 'Iná', stones: 'Òkúta', bows: 'Ọrun' },
};

export const armaments: Dict<ArmamentsDict> = { en, es, fr, de, nl, pt, ja, zh, id, th, vi, ar, sw, ha, yo };
