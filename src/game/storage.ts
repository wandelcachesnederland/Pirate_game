/** Local high-score table + settings persisted in localStorage. */
import type { DifficultyId, EraId } from './types';
import { DIFFICULTIES } from './difficulty';
import { ERA_REGION } from './ships/era';

export interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  sunk: number;
  date: number;
  /** The peril this legend was sailed under (older entries have none). */
  difficulty?: DifficultyId;
}

export interface Settings {
  sfx: boolean;
  music: boolean;
}

const SCORES_KEY = 'broadside.scores.v1';
const NAME_KEY = 'broadside.captain.v1';
const SETTINGS_KEY = 'broadside.settings.v1';
export const MAX_SCORES = 10;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — ignore */
  }
}

export function loadScores(): ScoreEntry[] {
  const raw = safeGet(SCORES_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as ScoreEntry[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e) => e && typeof e.score === 'number' && typeof e.name === 'string')
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES);
  } catch {
    return [];
  }
}

export function addScore(entry: ScoreEntry): { scores: ScoreEntry[]; rank: number } {
  const scores = loadScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score || a.date - b.date);
  const trimmed = scores.slice(0, MAX_SCORES);
  const rank = trimmed.indexOf(entry);
  safeSet(SCORES_KEY, JSON.stringify(trimmed));
  return { scores: trimmed, rank };
}

export function qualifies(score: number): boolean {
  if (score <= 0) return false;
  const scores = loadScores();
  return scores.length < MAX_SCORES || score > scores[scores.length - 1].score;
}

export function clearScores() {
  safeSet(SCORES_KEY, JSON.stringify([]));
}

export function loadName(): string {
  return (safeGet(NAME_KEY) || '').slice(0, 14);
}

export function saveName(name: string) {
  safeSet(NAME_KEY, name.slice(0, 14));
}

export function loadSettings(): Settings {
  const raw = safeGet(SETTINGS_KEY);
  if (!raw) return { sfx: true, music: true };
  try {
    const s = JSON.parse(raw) as Partial<Settings>;
    return { sfx: s.sfx !== false, music: s.music !== false };
  } catch {
    return { sfx: true, music: true };
  }
}

export function saveSettings(s: Settings) {
  safeSet(SETTINGS_KEY, JSON.stringify(s));
}

const ERA_KEY = 'broadside.era.v1';

/** Remember the last era sailed — the pick a captain makes first every time. */
export function loadEra(): EraId | null {
  const raw = safeGet(ERA_KEY);
  return raw && Object.prototype.hasOwnProperty.call(ERA_REGION, raw) ? (raw as EraId) : null;
}

export function saveEra(id: EraId) {
  safeSet(ERA_KEY, id);
}

const DIFFICULTY_KEY = 'broadside.difficulty.v1';

/** Remember the peril a captain last chose for the voyage. */
export function loadDifficulty(): DifficultyId | null {
  const raw = safeGet(DIFFICULTY_KEY);
  return raw && DIFFICULTIES.some((d) => d.id === raw) ? (raw as DifficultyId) : null;
}

export function saveDifficulty(id: DifficultyId) {
  safeSet(DIFFICULTY_KEY, id);
}
