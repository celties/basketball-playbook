import { Play } from './types';

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
