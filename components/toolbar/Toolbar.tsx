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
  desc: string;
  color?: string;
}

const TOOLS: ToolDef[] = [
  { id: 'select',  label: '選択',       icon: '↖',   title: '選択・移動 (V)',        desc: '選手をドラッグして移動' },
  { id: 'offense', label: 'オフェンス', icon: '●',   title: 'オフェンス選手 (O)',    desc: '攻撃選手をコートに配置', color: '#dc2626' },
  { id: 'defense', label: 'ディフェンス', icon: '✕', title: 'ディフェンス選手 (D)', desc: '守備選手をコートに配置', color: '#2563eb' },
];

const DRAW_TOOLS: ToolDef[] = [
  { id: 'cut',        label: 'カット',       icon: '→',   title: 'カット (C)',           desc: '選手の走るコースを引く',   color: '#111827' },
  { id: 'pass',       label: 'パス',         icon: '- ->', title: 'パス (P)',             desc: 'パスの軌道を引く',         color: '#3b82f6' },
  { id: 'dribble',    label: 'ドリブル',     icon: '...→', title: 'ドリブル (B)',         desc: 'ドリブルのコースを引く',   color: '#f97316' },
  { id: 'screen',     label: 'スクリーン',   icon: '⊥',   title: 'スクリーン (S)',       desc: 'スクリーンの位置を置く',   color: '#ca8a04' },
  { id: 'ghostScreen', label: 'ゴースト⊥',  icon: '⊥̣',  title: 'ゴーストスクリーン (G)', desc: 'フェイクのスクリーン',   color: '#d97706' },
  { id: 'eraser',     label: '消去',         icon: '✕',   title: '削除 (E)',             desc: '選手・矢印・⊥を消す',     color: '#6b7280' },
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
        w-full rounded-lg flex flex-col items-center justify-center gap-0.5 py-1.5 px-1
        font-bold transition-all border-2
        ${active
          ? 'border-blue-500 bg-blue-50 text-blue-600'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className="text-base leading-none"
        style={def.color && !active ? { color: def.color } : undefined}
      >
        {def.icon}
      </span>
      <span className="text-[10px] leading-none font-bold">{def.label}</span>
      <span className="text-[8px] leading-tight opacity-55 text-center whitespace-normal">{def.desc}</span>
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
    <div className="flex flex-col gap-1 p-2 bg-white border-r border-gray-200 w-20 items-center overflow-y-auto">
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
        className="w-full rounded-lg flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 font-bold border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
      >
        <span className="text-base">↩</span>
        <span className="text-[10px] leading-none font-bold">元に戻す</span>
        <span className="text-[8px] leading-tight opacity-55 text-center">直前の操作を取消</span>
      </button>

      {/* Clear */}
      <button
        onClick={onClear}
        title="クリア"
        className="w-full rounded-lg flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 font-bold border-2 border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300 transition-all"
      >
        <span className="text-base">🗑</span>
        <span className="text-[10px] leading-none font-bold">クリア</span>
        <span className="text-[8px] leading-tight opacity-55 text-center">現ステップを全消去</span>
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
