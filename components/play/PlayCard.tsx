'use client';

import { Play, PlayCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<PlayCategory, { label: string; color: string }> = {
  halfcourt: { label: 'ハーフコート', color: 'bg-orange-100 text-orange-700' },
  sideline: { label: 'サイドライン', color: 'bg-blue-100 text-blue-700' },
  endline: { label: 'エンドライン', color: 'bg-green-100 text-green-700' },
};

interface PlayCardProps {
  play: Play;
  onLoad: (play: Play) => void;
  onDelete: (id: string) => void;
}

export default function PlayCard({ play, onLoad, onDelete }: PlayCardProps) {
  const cat = CATEGORY_LABELS[play.category];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 hover:shadow-md transition-all group">
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
          <div className="text-white/40 text-4xl">🏀</div>
        )}
        {/* Steps badge */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          {play.steps.length} step{play.steps.length !== 1 ? 's' : ''}
        </div>
        {/* YouTube badge */}
        {play.youtubeUrl && (
          <div className="absolute top-2 left-2 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded-full">
            🎬 YT
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-gray-900 font-bold text-sm truncate mb-1">{play.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>
          {cat.label}
        </span>
        {play.description && (
          <p className="text-gray-500 text-xs mt-2 line-clamp-2">{play.description}</p>
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
            className="py-1.5 px-3 rounded bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 text-xs transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
