'use client';

import { Tool } from '@/lib/types';

interface ToolbarProps {
  tool: Tool;
  onToolChange: (t: Tool) => void;
  offenseCount: number;
  defenseCount: number;
  onClear: () => void;
  onUndo: () => void;
}

interface ToolDef {
  id: Tool;
  label: string;
  icon: string;
  title: string;
  color?: string;
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: '選択', icon: '↖', title: '選択・移動 (V)' },
  { id: 'offense', label: 'O', icon: '●', title: 'オフェンス選手配置 (O)', color: '#dc2626' },
  { id: 'defense', label: 'X', icon: '✕', title: 'ディフェンス選手配置 (D)', color: '#2563eb' },
];

const DRAW_TOOLS: ToolDef[] = [
  { id: 'cut', label: 'カット', icon: '→', title: 'カット/ランニング (C)', color: '#111827' },
  { id: 'pass', label: 'パス', icon: '- ->', title: 'パス (P)', color: '#3b82f6' },
  { id: 'dribble', label: 'ドリブル', icon: '...→', title: 'ドリブル (B)', color: '#f97316' },
  { id: 'screen', label: 'スクリーン', icon: '⊥', title: 'スクリーン (S)', color: '#ca8a04' },
  { id: 'ghostScreen', label: 'ゴースト', icon: '⊥̣', title: 'ゴーストスクリーン (G)', color: '#d97706' },
  { id: 'eraser', label: '消す', icon: '✕', title: '削除 (E)', color: '#6b7280' },
];

function ToolBtn({
  def,
  active,
  onClick,
  disabled,
}: {
  def: ToolDef;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={def.title}
      className={`
        w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5
        text-xs font-bold transition-all border-2
        ${active
          ? 'border-blue-500 bg-blue-50 text-blue-600'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className="text-lg leading-none"
        style={def.color && !active ? { color: def.color } : undefined}
      >
        {def.icon}
      </span>
      <span className="text-[9px] leading-none opacity-75">{def.label}</span>
    </button>
  );
}

export default function Toolbar({
  tool,
  onToolChange,
  offenseCount,
  defenseCount,
  onClear,
  onUndo,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-white border-r border-gray-200 w-16 items-center overflow-y-auto">
      {/* Basic tools */}
      {TOOLS.map((t) => (
        <ToolBtn
          key={t.id}
          def={t}
          active={tool === t.id}
          onClick={() => onToolChange(t.id)}
          disabled={
            (t.id === 'offense' && offenseCount >= 5) ||
            (t.id === 'defense' && defenseCount >= 5)
          }
        />
      ))}

      {/* Badge showing count */}
      <div className="flex gap-1 text-[10px] w-full justify-around px-1">
        <span className="text-red-500">{offenseCount}/5</span>
        <span className="text-blue-500">{defenseCount}/5</span>
      </div>

      <div className="w-10 border-t border-gray-200 my-1" />

      {/* Draw tools */}
      {DRAW_TOOLS.map((t) => (
        <ToolBtn
          key={t.id}
          def={t}
          active={tool === t.id}
          onClick={() => onToolChange(t.id)}
        />
      ))}

      <div className="w-10 border-t border-gray-200 my-1" />

      {/* Undo */}
      <button
        onClick={onUndo}
        title="元に戻す (Ctrl+Z)"
        className="w-12 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs font-bold border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
      >
        <span className="text-base">↩</span>
        <span className="text-[9px] opacity-75">元に戻す</span>
      </button>

      {/* Clear */}
      <button
        onClick={onClear}
        title="クリア"
        className="w-12 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs font-bold border-2 border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300 transition-all"
      >
        <span className="text-base">🗑</span>
        <span className="text-[9px] opacity-75">クリア</span>
      </button>

      {/* Legend */}
      <div className="mt-auto pt-2 pb-1 flex flex-col gap-1 text-[9px] text-gray-400 leading-tight">
        <div className="flex items-center gap-1">
          <span className="w-4 border-t-2 border-gray-700" />→ カット
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 border-t-2 border-blue-500 border-dashed" />→ パス
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 border-t-2 border-orange-400 border-dotted" />→ ドリブル
        </div>
      </div>
    </div>
  );
}
