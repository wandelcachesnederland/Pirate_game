/** Shared locale plumbing types + document metadata strings. */

export type LocaleId = 'en' | 'es' | 'fr' | 'de' | 'nl' | 'pt' | 'ja' | 'zh' | 'id' | 'th' | 'vi';

/** One dictionary per supported locale; every non-English dict must match EN exactly. */
export type Dict<T> = Record<LocaleId, T>;

const en = {
  title: 'Broadside! — Scourge of the Spanish Main',
  description:
    'Broadside! — a swashbuckling pirate naval-combat arcade game. Sail the Spanish Main, unleash broadsides and plunder gold.',
  language: 'Language',
};

export type MetaDict = typeof en;

const es: MetaDict = {
  title: '¡Andanada! — Azote del Caribe español',
  description:
    '¡Andanada! — un arcade pirata de combate naval. Navega el Caribe español, desata andanadas y saquea oro.',
  language: 'Idioma',
};

const fr: MetaDict = {
  title: 'Broadside ! — Fléau de la mer des Caraïbes',
  description:
    'Broadside ! — un jeu d’arcade pirate de combat naval. Naviguez sur la mer des Caraïbes, déchaînez des bordées et pillez de l’or.',
  language: 'Langue',
};

const de: MetaDict = {
  title: 'Broadside! — Schrecken der Spanischen Main',
  description:
    'Broadside! — ein Piraten-Arcade-Seekampfspiel. Befahrt die Spanische Main, feuert Breitseiten und erbeutet Gold.',
  language: 'Sprache',
};

const nl: MetaDict = {
  title: 'Broadside! — Gesel van de Spaanse Main',
  description:
    'Broadside! — een piraten-arcadegame met zeegevechten. Bevaar de Spaanse Main, vuur breedzijden en roof goud.',
  language: 'Taal',
};

const pt: MetaDict = {
  title: 'Broadside! — Flagelo do Caribe espanhol',
  description:
    'Broadside! — um arcade pirata de combate naval. Navega o Caribe espanhol, desfere bandas e pilha ouro.',
  language: 'Idioma',
};

const ja: MetaDict = {
  title: 'ブロードサイド! — スパニッシュ・メインの脅威',
  description:
    'ブロードサイド! — 海賊海戦アーケードゲーム。スパニッシュ・メインを航海し、舷側砲を放ち、財宝を略奪せよ。',
  language: '言語',
};

const zh: MetaDict = {
  title: '舷侧炮火！——西班牙大洋的灾星',
  description:
    '舷侧炮火！——一款海盗海战街机游戏。驰骋西班牙大洋，万炮齐鸣，掠夺黄金。',
  language: '语言',
};

const id: MetaDict = {
  title: 'Broadside! — Momok Main Spanyol',
  description:
    'Broadside! — gim arcade pertempuran laut bajak laut. Layari Main Spanyol, muntahkan tembakan sisi lambung dan jarah emas.',
  language: 'Bahasa',
};

const th: MetaDict = {
  title: 'Broadside! — ภัยร้ายแห่งสแปนิชเมน',
  description:
    'Broadside! — เกมอาร์เคดรบทางเรือโจรสลัด แล่นเรือในสแปนิชเมน ระดมยิงกราบเรือ และปล้นทอง',
  language: 'ภาษา',
};

const vi: MetaDict = {
  title: 'Broadside! — Nỗi Kinh Hoàng Vùng Biển Tây Ban Nha',
  description:
    'Broadside! — game arcade hải chiến cướp biển. Dong buồm vùng biển Tây Ban Nha, nã pháo mạn tàu và cướp vàng.',
  language: 'Ngôn ngữ',
};

export const meta: Dict<MetaDict> = { en, es, fr, de, nl, pt, ja, zh, id, th, vi };
