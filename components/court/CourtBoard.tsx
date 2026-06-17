'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Tool,
  Player,
  Arrow,
  ScreenMarker,
  PlayStep,
  ArrowType,
} from '@/lib/types';
import {
  COURT_WIDTH,
  COURT_HEIGHT,
  getSVGCoords,
  isNear,
  generateId,
  clamp,
  DEFAULT_BALL,
} from '@/lib/utils';
import CourtSVG from './CourtSVG';

const PLAYER_RADIUS = 18;
const BALL_ID = '__ball__';
const BALL_R = 11;

interface CourtBoardProps {
  step: PlayStep;
  tool: Tool;
  offenseCount: number;
  defenseCount: number;
  onStepChange: (step: PlayStep) => void;
  animating?: boolean;
}

// ---------- Sub-components ----------

function ArrowheadDef({
  id,
  color,
  filled,
}: {
  id: string;
  color: string;
  filled: boolean;
}) {
  return (
    <marker
      id={id}
      markerWidth="10"
      markerHeight="7"
      refX="9"
      refY="3.5"
      orient="auto"
    >
      <polygon
        points="0 0, 10 3.5, 0 7"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1"
      />
    </marker>
  );
}

function ArrowElement({ arrow }: { arrow: Arrow }) {
  const colorMap: Record<ArrowType, string> = {
    pass: '#3b82f6',
    dribble: '#f97316',
    cut: '#111827',
  };
  const dashMap: Record<ArrowType, string> = {
    pass: '10 5',
    dribble: '3 7',
    cut: 'none',
  };
  const color = colorMap[arrow.type];
  const dashArray = dashMap[arrow.type];

  return (
    <line
      x1={arrow.x1}
      y1={arrow.y1}
      x2={arrow.x2}
      y2={arrow.y2}
      stroke={color}
      strokeWidth="2.5"
      strokeDasharray={dashArray === 'none' ? undefined : dashArray}
      strokeLinecap="round"
      markerEnd={`url(#ah-${arrow.type})`}
    />
  );
}

function ScreenElement({ screen }: { screen: ScreenMarker }) {
  const len = 22;
  const color = screen.ghost ? '#fbbf24' : '#facc15';
  const dash = screen.ghost ? '4 4' : undefined;
  const rad = (screen.rotation * Math.PI) / 180;
  const dx = Math.cos(rad) * (len / 2);
  const dy = Math.sin(rad) * (len / 2);
  const px = -Math.sin(rad) * 8;
  const py = Math.cos(rad) * 8;
  return (
    <g>
      <line
        x1={screen.x - dx}
        y1={screen.y - dy}
        x2={screen.x + dx}
        y2={screen.y + dy}
        stroke={color}
        strokeWidth={screen.ghost ? 2.5 : 3}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      <circle cx={screen.x + px} cy={screen.y + py} r="4" fill={color} />
    </g>
  );
}

function PlayerElement({
  player,
  selected,
}: {
  player: Player;
  selected: boolean;
}) {
  const isOffense = player.type === 'offense';
  const bg = isOffense ? '#dc2626' : '#2563eb';
  const border = selected ? '#facc15' : 'white';
  return (
    <g style={{ cursor: 'grab' }}>
      <circle
        cx={player.x}
        cy={player.y}
        r={PLAYER_RADIUS}
        fill={bg}
        stroke={border}
        strokeWidth={selected ? 3 : 2}
      />
      <text
        x={player.x}
        y={player.y + 5}
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {isOffense ? player.number : 'X'}
      </text>
    </g>
  );
}

function BallElement({ x, y, selected }: { x: number; y: number; selected: boolean }) {
  return (
    <g style={{ cursor: 'grab' }}>
      {/* Drop shadow */}
      <circle cx={x + 1} cy={y + 2} r={BALL_R} fill="rgba(0,0,0,0.25)" />
      {/* Body */}
      <circle
        cx={x} cy={y} r={BALL_R}
        fill="#e85d04"
        stroke={selected ? '#facc15' : '#9a3412'}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      {/* Horizontal seam */}
      <line x1={x - BALL_R} y1={y} x2={x + BALL_R} y2={y} stroke="#9a3412" strokeWidth="1" />
      {/* Vertical seam */}
      <line x1={x} y1={y - BALL_R} x2={x} y2={y + BALL_R} stroke="#9a3412" strokeWidth="1" />
      {/* Left arc */}
      <path
        d={`M ${x - BALL_R * 0.65} ${y - BALL_R} A ${BALL_R * 0.5} ${BALL_R} 0 0 0 ${x - BALL_R * 0.65} ${y + BALL_R}`}
        fill="none" stroke="#9a3412" strokeWidth="1"
      />
      {/* Right arc */}
      <path
        d={`M ${x + BALL_R * 0.65} ${y - BALL_R} A ${BALL_R * 0.5} ${BALL_R} 0 0 1 ${x + BALL_R * 0.65} ${y + BALL_R}`}
        fill="none" stroke="#9a3412" strokeWidth="1"
      />
    </g>
  );
}

function PreviewArrow({
  x1, y1, x2, y2, type,
}: {
  x1: number; y1: number; x2: number; y2: number; type: ArrowType;
}) {
  const colorMap: Record<ArrowType, string> = {
    pass: '#3b82f6', dribble: '#f97316', cut: '#111827',
  };
  const dashMap: Record<ArrowType, string> = {
    pass: '10 5', dribble: '3 7', cut: 'none',
  };
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={colorMap[type]}
      strokeWidth="2.5"
      strokeDasharray={dashMap[type] === 'none' ? undefined : dashMap[type]}
      strokeLinecap="round"
      opacity={0.6}
      markerEnd={`url(#ah-${type})`}
    />
  );
}

// ---------- Main component ----------

export default function CourtBoard({
  step,
  tool,
  offenseCount,
  defenseCount,
  onStepChange,
}: CourtBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // BUG FIX: clear selection when tool changes
  useEffect(() => {
    setSelectedId(null);
  }, [tool]);

  // Dragging: track locally to avoid history spam (only commit on mouseUp)
  const [dragging, setDragging] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  // BUG FIX: local position during drag — no parent call until mouseUp
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);

  // Arrow drawing
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Screen rotation drag
  const [screenDrag, setScreenDrag] = useState<{ id: string; cx: number; cy: number } | null>(null);

  const arrowTool = (tool === 'pass' || tool === 'dribble' || tool === 'cut')
    ? (tool as ArrowType)
    : null;

  // Commit the dragged element's position to parent (called on mouseUp / mouseLeave)
  const commitDrag = useCallback(() => {
    if (dragPos) {
      if (dragPos.id === BALL_ID) {
        onStepChange({ ...step, ball: { x: dragPos.x, y: dragPos.y } });
      } else {
        onStepChange({
          ...step,
          players: step.players.map((p) =>
            p.id === dragPos.id ? { ...p, x: dragPos.x, y: dragPos.y } : p
          ),
        });
      }
    }
    setDragging(null);
    setDragPos(null);
  }, [dragPos, step, onStepChange]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;
      const { x, y } = getSVGCoords(e, svgRef.current);

      if (tool === 'select') {
        // Players have priority (rendered on top)
        for (const p of [...step.players].reverse()) {
          if (isNear(x, y, p.x, p.y, PLAYER_RADIUS + 4)) {
            setSelectedId(p.id);
            setDragging({ id: p.id, offsetX: x - p.x, offsetY: y - p.y });
            e.stopPropagation();
            return;
          }
        }
        // Then ball
        const ball = step.ball ?? DEFAULT_BALL;
        if (isNear(x, y, ball.x, ball.y, BALL_R + 6)) {
          setSelectedId(BALL_ID);
          setDragging({ id: BALL_ID, offsetX: x - ball.x, offsetY: y - ball.y });
          e.stopPropagation();
          return;
        }
        setSelectedId(null);
        return;
      }

      if (tool === 'eraser') {
        for (const p of [...step.players].reverse()) {
          if (isNear(x, y, p.x, p.y, PLAYER_RADIUS + 4)) {
            onStepChange({ ...step, players: step.players.filter((pl) => pl.id !== p.id) });
            return;
          }
        }
        for (const a of [...step.arrows].reverse()) {
          const mx = (a.x1 + a.x2) / 2;
          const my = (a.y1 + a.y2) / 2;
          if (isNear(x, y, mx, my, 18)) {
            onStepChange({ ...step, arrows: step.arrows.filter((ar) => ar.id !== a.id) });
            return;
          }
        }
        for (const s of [...step.screens].reverse()) {
          if (isNear(x, y, s.x, s.y, 20)) {
            onStepChange({ ...step, screens: step.screens.filter((sc) => sc.id !== s.id) });
            return;
          }
        }
        return;
      }

      if (tool === 'offense') {
        if (offenseCount >= 5) return;
        const newPlayer: Player = {
          id: generateId(),
          type: 'offense',
          number: offenseCount + 1,
          x, y,
        };
        onStepChange({ ...step, players: [...step.players, newPlayer] });
        return;
      }

      if (tool === 'defense') {
        if (defenseCount >= 5) return;
        const newPlayer: Player = {
          id: generateId(),
          type: 'defense',
          number: defenseCount + 1,
          x, y,
        };
        onStepChange({ ...step, players: [...step.players, newPlayer] });
        return;
      }

      if (arrowTool) {
        setDrawStart({ x, y });
        setDrawCurrent({ x, y });
        return;
      }

      if (tool === 'screen' || tool === 'ghostScreen') {
        const newScreen: ScreenMarker = {
          id: generateId(),
          x, y,
          rotation: 0,
          ghost: tool === 'ghostScreen',
        };
        setSelectedId(newScreen.id);
        setScreenDrag({ id: newScreen.id, cx: x, cy: y });
        onStepChange({ ...step, screens: [...step.screens, newScreen] });
        return;
      }
    },
    [tool, step, arrowTool, offenseCount, defenseCount, onStepChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { x, y } = getSVGCoords(e, svgRef.current);

      if (dragging) {
        const isBall = dragging.id === BALL_ID;
        const margin = isBall ? BALL_R : PLAYER_RADIUS;
        const newX = clamp(x - dragging.offsetX, margin, COURT_WIDTH - margin);
        const newY = clamp(y - dragging.offsetY, margin, COURT_HEIGHT - margin);
        setDragPos({ id: dragging.id, x: newX, y: newY });
        return;
      }

      if (drawStart) {
        setDrawCurrent({ x, y });
        return;
      }

      if (screenDrag) {
        const dx = x - screenDrag.cx;
        const dy = y - screenDrag.cy;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        onStepChange({
          ...step,
          screens: step.screens.map((s) =>
            s.id === screenDrag.id ? { ...s, rotation: angle } : s
          ),
        });
        return;
      }
    },
    [dragging, drawStart, screenDrag, step, onStepChange]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { x, y } = getSVGCoords(e, svgRef.current);

      if (dragging) {
        // BUG FIX: commit drag to history exactly once
        commitDrag();
        return;
      }

      if (screenDrag) {
        setScreenDrag(null);
        return;
      }

      if (drawStart && arrowTool) {
        const dx = x - drawStart.x;
        const dy = y - drawStart.y;
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
          const newArrow: Arrow = {
            id: generateId(),
            type: arrowTool,
            x1: drawStart.x,
            y1: drawStart.y,
            x2: x,
            y2: y,
          };
          onStepChange({ ...step, arrows: [...step.arrows, newArrow] });
        }
        setDrawStart(null);
        setDrawCurrent(null);
        return;
      }
    },
    [dragging, screenDrag, drawStart, arrowTool, step, onStepChange, commitDrag]
  );

  const handleMouseLeave = useCallback(() => {
    if (drawStart) {
      setDrawStart(null);
      setDrawCurrent(null);
    }
    if (dragging) {
      // BUG FIX: commit on mouse leave too so position isn't lost
      commitDrag();
    }
    if (screenDrag) {
      setScreenDrag(null);
    }
  }, [drawStart, dragging, screenDrag, commitDrag]);

  const getCursor = () => {
    if (tool === 'select') return 'default';
    if (tool === 'eraser') return 'cell';
    if (arrowTool || tool === 'screen' || tool === 'ghostScreen') return 'crosshair';
    return 'copy';
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
      width="100%"
      height="100%"
      style={{ cursor: getCursor(), display: 'block', userSelect: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <defs>
        <ArrowheadDef id="ah-cut" color="#111827" filled />
        <ArrowheadDef id="ah-pass" color="#3b82f6" filled={false} />
        <ArrowheadDef id="ah-dribble" color="#f97316" filled />
      </defs>

      <CourtSVG />

      {step.arrows.map((a) => (
        <ArrowElement key={a.id} arrow={a} />
      ))}

      {step.screens.map((s) => (
        <ScreenElement key={s.id} screen={s} />
      ))}

      {/* Ball — rendered above arrows/screens, below players */}
      {(() => {
        const ball = dragPos?.id === BALL_ID
          ? { x: dragPos.x, y: dragPos.y }
          : (step.ball ?? DEFAULT_BALL);
        return (
          <BallElement x={ball.x} y={ball.y} selected={selectedId === BALL_ID} />
        );
      })()}

      {/* BUG FIX: use local dragPos for the currently dragged player */}
      {step.players.map((p) => {
        const isDragged = dragPos?.id === p.id;
        return (
          <PlayerElement
            key={p.id}
            player={isDragged ? { ...p, x: dragPos!.x, y: dragPos!.y } : p}
            selected={p.id === selectedId}
          />
        );
      })}

      {drawStart && drawCurrent && arrowTool && (
        <PreviewArrow
          x1={drawStart.x} y1={drawStart.y}
          x2={drawCurrent.x} y2={drawCurrent.y}
          type={arrowTool}
        />
      )}
    </svg>
  );
}
