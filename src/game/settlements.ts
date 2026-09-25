// Island peoples: who lives where, how glad they are to see a strange sail, and
// what it takes to turn a village into an enemy.
//
// Every island on the chart is either wild (nobody home: no canoes, no grudges)
// or inhabited. An inhabited island rolls a `friendliness` — the welcome it
// starts with — and that sets its `patience`: the number of grievances it will
// swallow before it fights. A welcome island shrugs off a great deal (and will
// only turn on you after you have shelled it several times); a sour one needs no
// reason at all and sets upon a pirate sail the moment it sees one.
//
// A few inhabited islands carry a fort. The garrison keeps the same books as the
// village — same anger, same patience — but soldiers are quicker to take offence
// (see the patience penalty below). The gentlest villages (friendliness 85+) will
// not fight over their boats at all; only a bombardment of the village does it.

import type { Fortress, PeopleSpec, Settlement } from './types';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Fortresses are landmarks, not wallpaper: at most this many per chart. */
export const FORT_CAP = 4;
export const FORT_RANGE = 440;
export const FORT_RELOAD = 3.8;
export const FORT_GUNS = 3;
export const FORT_DAMAGE = 15;
export const FORT_BALL_SPEED = 300;

const FORT_HP_BASE = 200;
const FORT_HP_PER_WAVE = 14;

/** How long they stay up in arms before the elders start talking them down. */
const HOSTILE_GRACE = 40;
/** Grievances forgotten per second, once angry (and once calm again). */
const HOSTILE_COOL = 0.12;
const CALM_FADE = 0.05;

/** What the player has to do to an island to earn its anger. */
export const PROVOKE = {
  /** A round into one of their boats. */
  boatHit: 0.1,
  /** One of their boats sent to the bottom. */
  boatSunk: 2,
  /** A shell landing on the island itself. */
  shelling: 1,
} as const;

/**
 * Grievances an island swallows before it fights, by how friendly it starts.
 * 0 = they attack a pirate sail on sight; 5 = only a sustained bombardment of
 * their own village will turn them.
 */
export function patienceFor(friendliness: number): number {
  if (friendliness >= 85) return 5;
  if (friendliness >= 65) return 4;
  if (friendliness >= 40) return 3;
  if (friendliness >= 20) return 2;
  if (friendliness >= 8) return 1;
  return 0; // they were never going to like you
}

/**
 * The gentlest villages (the top of the friendliness range) will not take up
 * arms over a fishing boat, however many of them are sunk — only over shells
 * falling on their own homes.
 */
export const BOAT_SENSITIVE_BELOW = 85;

/** A grievance over one of their boats: lost on the gentlest of villages. */
export function provokeBoats(st: Settlement, points: number): boolean {
  if (st.inhabited && st.friendliness >= BOAT_SENSITIVE_BELOW) return false;
  return provoke(st, points);
}

/** No one home: jungle, birds and nobody to offend. */
export function wildIsland(): Settlement {
  return { inhabited: false, friendliness: 0, anger: 0, patience: 0, name: '', hostile: false, calm: 0 };
}

function rollFort(wave: number): Fortress {
  const hp = FORT_HP_BASE + FORT_HP_PER_WAVE * Math.min(8, Math.max(0, wave - 1));
  return {
    hp,
    maxHp: hp,
    guns: FORT_GUNS,
    range: FORT_RANGE,
    reload: FORT_RELOAD,
    timer: rand(1.2, 3.5),
    damage: FORT_DAMAGE,
    ballSpeed: FORT_BALL_SPEED,
    // the battery faces one stretch of water, whichever way it was built
    angle: rand(0, Math.PI * 2),
    ruined: false,
  };
}

/**
 * Roll the people of one island. `fortsSoFar` keeps the chart's fort count down;
 * `wave` lets late-game forts stand a little more pounding.
 */
export function rollSettlement(people: PeopleSpec, fortsSoFar: number, wave: number): Settlement {
  if (Math.random() >= people.inhabited) return wildIsland();
  const [lo, hi] = people.friendliness;
  const friendliness = Math.round(rand(Math.min(lo, hi), Math.max(lo, hi)));
  const fortress = fortsSoFar < FORT_CAP && Math.random() < people.fort ? rollFort(wave) : undefined;
  // a garrison is jumpy: an island with a fort takes offence one grievance sooner
  const patience = Math.max(0, patienceFor(friendliness) - (fortress ? 1 : 0));
  const name = people.names.length ? people.names[Math.floor(Math.random() * people.names.length)] : 'Landfall';
  return {
    inhabited: true,
    friendliness,
    anger: 0,
    patience,
    name,
    fortress,
    // patience 0 means no reason needed at all: they attack on sight
    hostile: patience === 0,
    calm: 0,
  };
}

/** Add grievances. Returns true when this is what tips them into a fight. */
export function provoke(st: Settlement, points: number): boolean {
  if (!st.inhabited || points <= 0) return false;
  st.anger += points;
  st.calm = 0;
  if (!st.hostile && st.anger >= st.patience) {
    st.hostile = true;
    return true;
  }
  return false;
}

/** Let tempers cool. Returns true when they have stood down. */
export function coolOff(st: Settlement, dt: number): boolean {
  if (!st.inhabited) return false;
  if (st.hostile) {
    st.calm += dt;
    if (st.calm < HOSTILE_GRACE) return false;
    st.anger = Math.max(0, st.anger - dt * HOSTILE_COOL);
    if (st.anger < st.patience) {
      st.hostile = false;
      return true;
    }
    return false;
  }
  if (st.anger > 0) st.anger = Math.max(0, st.anger - dt * CALM_FADE);
  return false;
}

export type Mood = 'welcoming' | 'friendly' | 'wary' | 'enemy';

/** The village's temper, for the log and for tests. */
export function moodOf(st: Settlement): Mood {
  if (!st.inhabited) return 'welcoming';
  if (st.hostile) return 'enemy';
  if (st.friendliness >= 70) return 'welcoming';
  if (st.friendliness >= 35) return 'friendly';
  return 'wary';
}

/** Flag flown over the village: red if these people start out hostile. */
export function flagOf(st: Settlement): 'white' | 'red' {
  return st.hostile ? 'red' : 'white';
}
