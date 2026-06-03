export type Tool =
  | 'select'
  | 'offense'
  | 'defense'
  | 'pass'
  | 'dribble'
  | 'cut'
  | 'screen'
  | 'ghostScreen'
  | 'eraser';

export type PlayerType = 'offense' | 'defense';
export type ArrowType = 'pass' | 'dribble' | 'cut';
export type PlayCategory = 'halfcourt' | 'sideline' | 'endline';

export interface Player {
  id: string;
  type: PlayerType;
  number: number;
  x: number;
  y: number;
}

export interface Arrow {
  id: string;
  type: ArrowType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  curved?: boolean;
  cx?: number;
  cy?: number;
}

export interface ScreenMarker {
  id: string;
  x: number;
  y: number;
  rotation: number;
  ghost: boolean;
}

export interface BallPosition {
  x: number;
  y: number;
}

export interface PlayStep {
  id: string;
  players: Player[];
  arrows: Arrow[];
  screens: ScreenMarker[];
  ball?: BallPosition;
  note?: string;
}

export interface Play {
  id: string;
  name: string;
  category: PlayCategory;
  description?: string;
  steps: PlayStep[];
  youtubeUrl?: string;
  youtubeTimestamp?: number;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}
