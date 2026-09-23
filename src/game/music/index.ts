// The cassette box. To add a song, create a cassette file in ./cassettes
// (copy drunkenSailor.ts as a template) and add it to CASSETTES below.
import type { Cassette } from './cassette';
import { blowTheManDown } from './cassettes/blowTheManDown';
import { drunkenSailor } from './cassettes/drunkenSailor';
import { haulAwayJoe } from './cassettes/haulAwayJoe';
import { sailorsHornpipe } from './cassettes/sailorsHornpipe';
import { spanishLadies } from './cassettes/spanishLadies';
import { wellerman } from './cassettes/wellerman';

export type { Cassette, Deck } from './cassette';

/** All cassettes the game can pick from. A random one is inserted at the start of every wave. */
export const CASSETTES: Cassette[] = [
  drunkenSailor,
  wellerman,
  blowTheManDown,
  spanishLadies,
  sailorsHornpipe,
  haulAwayJoe,
];

/** The cassette in the player before the first wave starts. */
export const INSERTED_CASSETTE: Cassette = drunkenSailor;

/** Pick a random cassette, avoiding `current` so the song always changes between waves. */
export function randomCassette(current?: Cassette): Cassette {
  const pool = CASSETTES.length > 1 ? CASSETTES.filter((c) => c !== current) : CASSETTES;
  return pool[Math.floor(Math.random() * pool.length)];
}
