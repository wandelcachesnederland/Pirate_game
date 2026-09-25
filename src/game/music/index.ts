// The cassette box. To add a song, create a cassette file in ./cassettes
// (copy drunkenSailor.ts for a hand-written song, or write a `song({...})`
// spec from ./arrange for a period tape) and add it to the box below.
import type { EraId } from '../types';
import type { Cassette } from './cassette';
import { dread, type BuiltSong } from './arrange';
import { blowTheManDown } from './cassettes/blowTheManDown';
import { cursedDeep } from './cassettes/cursedDeep';
import { drunkenSailor } from './cassettes/drunkenSailor';
import { haulAwayJoe } from './cassettes/haulAwayJoe';
import { sailorsHornpipe } from './cassettes/sailorsHornpipe';
import { shenandoah } from './cassettes/shenandoah';
import { spanishLadies } from './cassettes/spanishLadies';
import { wellerman } from './cassettes/wellerman';
// era tapes — one for every sea the game sails
import { alohaOe } from './cassettes/alohaOe';
import { arirang } from './cassettes/arirang';
import { balsaDeTumbes } from './cassettes/balsaDeTumbes';
import { cantusRemigum } from './cassettes/cantusRemigum';
import { cocNgam } from './cassettes/cocNgam';
import { greatGreen } from './cassettes/greatGreen';
import { greekFire } from './cassettes/greekFire';
import { hoeaWaka } from './cassettes/hoeaWaka';
import { ironcladMarch } from './cassettes/ironcladMarch';
import { jasmineFlower } from './cassettes/jasmineFlower';
import { kadaram } from './cassettes/kadaram';
import { kadirga } from './cassettes/kadirga';
import { lammaBada } from './cassettes/lammaBada';
import { naoDeLasIndias } from './cassettes/naoDeLasIndias';
import { rodr } from './cassettes/rodr';
import { sakuraSakura } from './cassettes/sakuraSakura';
import { seikilosEpitaph } from './cassettes/seikilosEpitaph';
import { teponaztli } from './cassettes/teponaztli';
import { theSixteen } from './cassettes/theSixteen';
import { tulumCanoes } from './cassettes/tulumCanoes';

export type { Cassette, Deck, MusicMode } from './cassette';
export { VOICE_NAMES, FEEL_NAMES } from './arrange';

/** The shanties — the Age of Sail rotation, and the fallback for every era. */
export const CASSETTES: Cassette[] = [
  drunkenSailor,
  wellerman,
  blowTheManDown,
  spanishLadies,
  sailorsHornpipe,
  haulAwayJoe,
  shenandoah,
];

/** The generic boss-wave theme — used by eras with no tape of their own. */
export const BOSS_CASSETTE: Cassette = cursedDeep;

/** The cassette in the player before the first wave starts. */
export const INSERTED_CASSETTE: Cassette = drunkenSailor;

/** Pick a random cassette, avoiding `current` so the song always changes between waves. */
export function randomCassette(current?: Cassette): Cassette {
  const pool = CASSETTES.length > 1 ? CASSETTES.filter((c) => c !== current) : CASSETTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * The songs of each sea. Every era has music that belongs to its waters and
 * its years: the shanties for the Atlantic and the Channel, an oar-song for
 * the North Sea, and for the Heritage Seas a tape written in that sea's own
 * scales and instruments — the in scale on the Seto Inland Sea, maqam Nahawand
 * off Arabia, the oldest surviving song for the Aegean. Boss waves get their
 * own dirge, cut from the era's own tape (see `bossCassette`).
 */
const ERA_SONGS: Record<EraId, Cassette[]> = {
  // ── Age of Sail ──────────────────────────────────────────────────────────
  golden: CASSETTES,
  exploration: [spanishLadies, shenandoah, naoDeLasIndias, blowTheManDown],
  napoleonic: [sailorsHornpipe, spanishLadies, blowTheManDown, haulAwayJoe, drunkenSailor],
  viking: [rodr],
  ironclad: [ironcladMarch, shenandoah],
  // ── The ancient sea ──────────────────────────────────────────────────────
  roman: [cantusRemigum],
  greek: [seikilosEpitaph],
  byzantium: [greekFire],
  macedon: [theSixteen],
  egypt: [greatGreen],
  // ── The Indian Ocean and the East ────────────────────────────────────────
  arab: [lammaBada],
  lepanto: [kadirga],
  chola: [kadaram],
  chinese: [jasmineFlower],
  japanese: [sakuraSakura],
  korea: [arirang],
  vietnam: [cocNgam],
  // ── The Americas ─────────────────────────────────────────────────────────
  maya: [tulumCanoes],
  inca: [balsaDeTumbes],
  aztec: [teponaztli],
  // ── Polynesia ────────────────────────────────────────────────────────────
  maori: [hoeaWaka],
  hawaii: [alohaOe],
};

/** The songs sailing this era's waters. */
export function cassettesForEra(era: EraId): Cassette[] {
  return ERA_SONGS[era] ?? CASSETTES;
}

/** Pick one of the era's songs, avoiding the one already playing when it can. */
export function randomCassetteForEra(era: EraId, current?: Cassette): Cassette {
  const pool = cassettesForEra(era);
  const fresh = current && pool.length > 1 ? pool.filter((c) => c !== current) : pool;
  return fresh[Math.floor(Math.random() * fresh.length)];
}

const isBuilt = (c: Cassette): c is BuiltSong => 'spec' in c;

/**
 * The boss theme of each sea: a dirge cut from one of the era's own tapes —
 * half speed, an octave down, with only a heartbeat left of the drums. Eras
 * still on the shanties (the Atlantic ones) get the Cursed Deep instead.
 */
export const ERA_BOSS: Record<EraId, Cassette> = Object.fromEntries(
  (Object.keys(ERA_SONGS) as EraId[]).map((era) => {
    const songs = ERA_SONGS[era];
    const src = songs.find(isBuilt);
    return [era, src ? dread(src) : BOSS_CASSETTE];
  }),
) as Record<EraId, Cassette>;

/** The tape that plays when a warship comes for you in this era's waters. */
export function bossCassette(era: EraId): Cassette {
  return ERA_BOSS[era] ?? BOSS_CASSETTE;
}

/** Every cassette the game knows about, era tapes and dirges included. */
export function allCassettes(): Cassette[] {
  const all = new Set<Cassette>(CASSETTES);
  for (const songs of Object.values(ERA_SONGS)) for (const song of songs) all.add(song);
  for (const boss of Object.values(ERA_BOSS)) all.add(boss);
  return [...all];
}
