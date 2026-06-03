'use client';

import { useRef, useState, useCallback } from 'react';
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
} from '@/lib/utils';
import CourtSVG from './CourtSVG';

const PLAYER_RADIUS = 18;

interface CourtBoardProps {
  step: PlayStep;
  tool: Tool;
  offenseCount: number;
  defenseCount: number;
  onStepChange: (step: PlayStep) => void;
  onOffenseCountChange: (n: number) => void;
  onDefenseCountChange: (n: number) => void;
  animating?: boolean;
}

// ---------- Arrow rendering helpers ----------

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
  const color = colorMap[arrow.type];
  const markerId = `ah-${arrow.type}`;
  const dashMap: Record<ArrowType, string> = {
    pass: '10 5',
    dribble: '3 7',
    cut: 'none',
  };
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
      markerEnd={`url(#${markerId})`}
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
  // Perpendicular tick for the ⊥ shape
  const px = -Math.sin(rad) * 8;
  const py = Math.cos(rad) * 8;
  return (
    <g>
      {/* main bar */}
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
      {/* setter indicator dot */}
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
      {isOffense ? (
        <text
          x={player.x}
          y={player.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          {player.number}
        </text>
      ) : (
        <text
          x={player.x}
          y={player.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          X
        </text>
      )}
    </g>
  );
}

function PreviewArrow({
  x1,
  y1,
  x2,
  y2,
  type,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: ArrowType;
}) {
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
  const color = colorMap[type];
  const dash = dashMap[type];
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth="2.5"
      strokeDasharray={dash === 'none' ? undefined : dash}
      strokeLinecap="round"
      opacity={0.6}
      markerEnd={`url(#ah-${type})`}
    />
  );
}

export default function CourtBoard({
  step,
  tool,
  offenseCount,
  defenseCount,
  onStepChange,
  onOffenseCountChange,
  onDefenseCountChange,
}: CourtBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
    type: 'player';
  } | null>(null);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [drawCurrent, setDrawCurrent] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [screenDrag, setScreenDrag] = useState<{
    id: string;
    cx: number;
    cy: number;
  } | null>(null);

  const arrowTool = (tool === 'pass' || tool === 'dribble' || tool === 'cut')
    ? (tool as ArrowType)
    : null;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;
      const { x, y } = getSVGCoords(e, svgRef.current);

      if (tool === 'select') {
        // Check players
        for (const p of [...step.players].reverse()) {
          if (isNear(x, y, p.x, p.y, PLAYER_RADIUS + 4)) {
            setSelectedId(p.id);
            setDragging({
              id: p.id,
              offsetX: x - p.x,
              offsetY: y - p.y,
              type: 'player',
            });
            e.stopPropagation();
            return;
          }
        }
        setSelectedId(null);
        return;
      }

      if (tool === 'eraser') {
        // Delete players
        for (const p of [...step.players].reverse()) {
          if (isNear(x, y, p.x, p.y, PLAYER_RADIUS + 4)) {
            onStepChange({
              ...step,
              players: step.players.filter((pl) => pl.id !== p.id),
            });
            return;
          }
        }
        // Delete arrows (click near midpoint)
        for (const a of [...step.arrows].reverse()) {
          const mx = (a.x1 + a.x2) / 2;
          const my = (a.y1 + a.y2) / 2;
          if (isNear(x, y, mx, my, 16)) {
            onStepChange({
              ...step,
              arrows: step.arrows.filter((ar) => ar.id !== a.id),
            });
            return;
          }
        }
        // Delete screens
        for (const s of [...step.screens].reverse()) {
          if (isNear(x, y, s.x, s.y, 20)) {
            onStepChange({
              ...step,
              screens: step.screens.filter((sc) => sc.id !== s.id),
            });
            return;
          }
        }
        return;
      }

      if (tool === 'offense') {
        if (offenseCount >= 5) return;
        const num = offenseCount + 1;
        const newPlayer: Player = {
          id: generateId(),
          type: 'offense',
          number: num,
          x,
          y,
        };
        onStepChange({ ...step, players: [...step.players, newPlayer] });
        onOffenseCountChange(num);
        return;
      }

      if (tool === 'defense') {
        if (defenseCount >= 5) return;
        const num = defenseCount + 1;
        const newPlayer: Player = {
          id: generateId(),
          type: 'defense',
          number: num,
          x,
          y,
        };
        onStepChange({ ...step, players: [...step.players, newPlayer] });
        onDefenseCountChange(num);
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
          x,
          y,
          rotation: 0,
          ghost: tool === 'ghostScreen',
        };
        setSelectedId(newScreen.id);
        setScreenDrag({ id: newScreen.id, cx: x, cy: y });
        onStepChange({ ...step, screens: [...step.screens, newScreen] });
        return;
      }
    },
    [
      tool,
      step,
      arrowTool,
      offenseCount,
      defenseCount,
      onStepChange,
      onOffenseCountChange,
      onDefenseCountChange,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { x, y } = getSVGCoords(e, svgRef.current);

      if (dragging) {
        const newX = clamp(x - dragging.offsetX, PLAYER_RADIUS, COURT_WIDTH - PLAYER_RADIUS);
        const newY = clamp(y - dragging.offsetY, PLAYER_RADIUS, COURT_HEIGHT - PLAYER_RADIUS);
        onStepChange({
          ...step,
          players: step.players.map((p) =>
            p.id === dragging.id ? { ...p, x: newX, y: newY } : p
          ),
        });
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
        setDragging(null);
        return;
      }

      if (screenDrag) {
        setScreenDrag(null);
        return;
      }

      if (drawStart && arrowTool) {
        const dx = x - drawStart.x;
        const dy = y - drawStart.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 10) {
          const newArrow: Arrow = {
            id: generateId(),
            type: arrowTool,
            x1: drawStart.x,
            y1: drawStart.y,
            x2: x,
            y2: y,
          };
          onStepChange({
            ...step,
            arrows: [...step.arrows, newArrow],
          });
        }
        setDrawStart(null);
        setDrawCurrent(null);
        return;
      }
    },
    [dragging, screenDrag, drawStart, arrowTool, step, onStepChange]
  );

  const handleMouseLeave = useCallback(() => {
    if (drawStart) {
      setDrawStart(null);
      setDrawCurrent(null);
    }
    if (dragging) setDragging(null);
    if (screenDrag) setScreenDrag(null);
  }, [drawStart, dragging, screenDrag]);

  const getCursor = () => {
    if (tool === 'select') return 'default';
    if (tool === 'eraser') return 'cell';
    if (arrowTool || tool === 'screen' || tool === 'ghostScreen')
      return 'crosshair';
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
      {/* Arrow marker defs */}
      <defs>
        <ArrowheadDef id="ah-cut" color="#111827" filled />
        <ArrowheadDef id="ah-pass" color="#3b82f6" filled={false} />
        <ArrowheadDef id="ah-dribble" color="#f97316" filled />
      </defs>

      {/* Court background */}
      <CourtSVG />

      {/* Arrows */}
      {step.arrows.map((a) => (
        <ArrowElement key={a.id} arrow={a} />
      ))}

      {/* Screens */}
      {step.screens.map((s) => (
        <ScreenElement key={s.id} screen={s} />
      ))}

      {/* Players */}
      {step.players.map((p) => (
        <PlayerElement key={p.id} player={p} selected={p.id === selectedId} />
      ))}

      {/* Drawing preview */}
      {drawStart && drawCurrent && arrowTool && (
        <PreviewArrow
          x1={drawStart.x}
          y1={drawStart.y}
          x2={drawCurrent.x}
          y2={drawCurrent.y}
          type={arrowTool}
        />
      )}
    </svg>
  );
}
