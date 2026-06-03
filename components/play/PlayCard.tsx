'use client';

import { Play, PlayCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<PlayCategory, { label: string; color: string }> = {
  halfcourt: { label: 'ハーフコート', color: 'bg-orange-900/60 text-orange-300' },
  sideline: { label: 'サイドライン', color: 'bg-blue-900/60 text-blue-300' },
  endline: { label: 'エンドライン', color: 'bg-green-900/60 text-green-300' },
};

interface PlayCardProps {
  play: Play;
  onLoad: (play: Play) => void;
  onDelete: (id: string) => void;
}

export default function PlayCard({ play, onLoad, onDelete }: PlayCardProps) {
  const cat = CATEGORY_LABELS[play.category];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-500 transition-colors group">
      {/* Thumbnail / Court preview */}
      <div className="bg-[#c8892a] relative h-36 flex items-center justify-center">
        {play.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={play.thumbnail}
            alt={play.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/30 text-4xl">🏀</div>
        )}
        {/* Steps badge */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
          {play.steps.length} step{play.steps.length !== 1 ? 's' : ''}
        </div>
        {/* YouTube badge */}
        {play.youtubeUrl && (
          <div className="absolute top-2 left-2 bg-red-900/80 text-white text-xs px-2 py-0.5 rounded-full">
            🎬 YT
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-bold text-sm truncate">{play.name}</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>
          {cat.label}
        </span>
        {play.description && (
          <p className="text-gray-400 text-xs mt-2 line-clamp-2">{play.description}</p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onLoad(play)}
            className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            開く
          </button>
          <button
            onClick={() => onDelete(play.id)}
            className="py-1.5 px-3 rounded bg-gray-700 hover:bg-red-900/50 text-gray-400 hover:text-red-400 text-xs transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
