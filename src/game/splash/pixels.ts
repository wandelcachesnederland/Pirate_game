// Pixel art for the Bit Squirrel studio logo: a hand-placed 8-bit red
// squirrel and a tiny 5x7 bitmap font, drawn onto a canvas at runtime (no
// image assets, like everything else in the game).

/** Palette: one character per pixel in the sprite rows below. */
export const SQUIRREL_PALETTE: Record<string, string> = {
  K: '#2a0d06', // outline
  D: '#8f2410', // deep shade
  R: '#d2461b', // red fur
  O: '#f07a2c', // orange highlight
  Y: '#ffb46a', // brightest fur glint
  C: '#f6ddb0', // cream belly / cheek
  c: '#d9b684', // belly shade
  E: '#120404', // eye
  W: '#ffffff', // eye glint
  N: '#4a2a12', // acorn cap
  n: '#6e4220', // acorn cap light
  A: '#a8642a', // acorn
  a: '#d08a42', // acorn light
  P: '#e86a7a', // nose
};

/**
 * 33 x 32, facing right: a sitting red squirrel with the signature ear tufts,
 * clutching an acorn, its great plume of a tail curled up behind it.
 */
export const SQUIRREL: string[] = [
  '.................................',
  '.......KKKKK.....................',
  '.....KKOOOOOKK...................',
  '....KOOYYOOORRK..................',
  '...KOYYOORRRRRRK........K...K....',
  '..KOYOORRRRRRRRRK......KDK.KDK...',
  '..KOYORRRRDDRRRRK.....KDRKKDRK...',
  '.KOYORRRDKKKDRRRRK....KRRRKRRK...',
  '.KOYORRDK...KDRRRK...KORRRRRRRK..',
  '.KOOORRK.....KRRRK..KORRRRRRRRRK.',
  '.KOORRDK.....KRRK..KOORRRRKKRRRK.',
  '.KOORRRK......KK...KORRRRRKEWRRRK',
  '.KOORRRDK.........KORRRRRRKEERRPK',
  '..KORRRRK.........KORCCRRRRRRRRK.',
  '..KOORRRDK.......KORCCCCRRRRRKK..',
  '...KORRRRDK......KORCCCCRRRKK....',
  '...KOORRRRDK....KORRCCCRRRRK.....',
  '....KORRRRRDK..KORRRCCCCKKKK.....',
  '....KOORRRRRDKKORRRCCKNNNK.K.....',
  '.....KORRRRRRDKORRCCKnnnNNKDK....',
  '.....KOORRRRRRKORRCCKaAAAAKRK....',
  '......KORRRRRRKORRCCKaaAAAKRK....',
  '......KOORRRRKORRRCCCKaAAKRRK....',
  '.......KORRRRKORRRCCCCKKKRRDK....',
  '.......KOORRKORRRRCCCCCcRRRDK....',
  '........KORRKORRRRRCCCccRRDK.....',
  '........KOORKORRRRRRCcRRRRDK.....',
  '.........KORKOORRRRRRRRRRDDK.....',
  '..........KKKOORRRDDRRRDDDK......',
  '...........KKRRRDKKKRRRDKK.......',
  '............KKKKK...KKKKK........',
  '.................................',
];

/** 5 x 7 capitals for the studio name. */
export const FONT: Record<string, string[]> = {
  B: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.'],
  I: ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', 'XXXXX'],
  T: ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', '..X..'],
  S: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  Q: ['.XXX.', 'X...X', 'X...X', 'X...X', 'X.X.X', 'X..X.', '.XX.X'],
  U: ['X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  R: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X.X..', 'X..X.', 'X...X'],
  E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  L: ['X....', 'X....', 'X....', 'X....', 'X....', 'X....', 'XXXXX'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
};

/** Width in font pixels of a line of text (1px gap between glyphs). */
export function textWidth(text: string): number {
  let w = 0;
  for (const ch of text) w += (FONT[ch]?.[0].length ?? 3) + 1;
  return Math.max(0, w - 1);
}
