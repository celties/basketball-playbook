import type { MouseEvent } from 'react';
import { Player, PlayStep } from './types';

export const COURT_WIDTH = 500;
export const COURT_HEIGHT = 470;

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function createEmptyStep(players?: Player[]): PlayStep {
  return {
    id: generateId(),
    players: players ? players.map((p) => ({ ...p })) : [],
    arrows: [],
    screens: [],
  };
}

/** Extract YouTube video ID from various URL formats */
export function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Format seconds to mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Clamp a value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Get SVG coords from a mouse event relative to SVG element */
export function getSVGCoords(
  e: MouseEvent<SVGSVGElement>,
  svgEl: SVGSVGElement | null
): { x: number; y: number } {
  if (!svgEl) return { x: 0, y: 0 };
  const rect = svgEl.getBoundingClientRect();
  const scaleX = COURT_WIDTH / rect.width;
  const scaleY = COURT_HEIGHT / rect.height;
  return {
    x: clamp((e.clientX - rect.left) * scaleX, 0, COURT_WIDTH),
    y: clamp((e.clientY - rect.top) * scaleY, 0, COURT_HEIGHT),
  };
}

/** Build an SVG arrow marker path pointing from (x1,y1) to (x2,y2) */
export function arrowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

/** Distance between two points */
export function dist(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/** Check if a point is near (within radius) of another point */
export function isNear(
  px: number,
  py: number,
  cx: number,
  cy: number,
  r = 20
): boolean {
  return dist(px, py, cx, cy) <= r;
}
