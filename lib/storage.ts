import { Play } from './types';
import { DEFAULT_PLAYS, TEMPLATE_IDS } from './defaultPlays';

const STORAGE_KEY = 'basketball_plays_v1';

export function savePlays(plays: Play[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plays));
  } catch {
    console.error('Failed to save plays');
  }
}

export function loadPlays(): Play[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Play[];
  } catch {
    return [];
  }
}

export function savePlay(play: Play): void {
  const plays = loadPlays();
  const idx = plays.findIndex((p) => p.id === play.id);
  if (idx >= 0) {
    plays[idx] = play;
  } else {
    plays.push(play);
  }
  savePlays(plays);
}

export function deletePlay(id: string): void {
  const plays = loadPlays().filter((p) => p.id !== id);
  savePlays(plays);
}

export function getPlay(id: string): Play | undefined {
  return loadPlays().find((p) => p.id === id);
}

/** Seed default template plays on first visit (no-op if any plays already exist). */
export function seedDefaultPlays(): void {
  if (typeof window === 'undefined') return;
  const existing = loadPlays();
  if (existing.length > 0) return;
  savePlays(DEFAULT_PLAYS);
}

/** Re-add template plays that are missing (e.g. after user deletes them). */
export function resetTemplates(): void {
  if (typeof window === 'undefined') return;
  const existing = loadPlays();
  const existingIds = new Set(existing.map((p) => p.id));
  const missing = DEFAULT_PLAYS.filter((p) => !existingIds.has(p.id));
  if (missing.length === 0) return;
  savePlays([...missing, ...existing]);
}

export { TEMPLATE_IDS };
