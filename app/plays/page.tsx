'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, PlayCategory } from '@/lib/types';
import { loadPlays, deletePlay } from '@/lib/storage';
import PlayCard from '@/components/play/PlayCard';

const FILTERS: { id: PlayCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'すべて', icon: '📋' },
  { id: 'halfcourt', label: 'ハーフコート', icon: '🏀' },
  { id: 'sideline', label: 'サイドライン', icon: '📐' },
  { id: 'endline', label: 'エンドライン', icon: '🎯' },
];

export default function PlaysPage() {
  const router = useRouter();
  const [plays, setPlays] = useState<Play[]>([]);
  const [filter, setFilter] = useState<PlayCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPlays(loadPlays());
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('このプレイを削除しますか？')) return;
    deletePlay(id);
    setPlays(loadPlays());
  };

  const handleLoad = (play: Play) => {
    router.push(`/?load=${play.id}`);
  };

  const filtered = plays.filter((p) => {
    if (filter !== 'all' && p.category !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-700">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← 戻る
        </button>
        <span className="text-xl">📚</span>
        <h1 className="font-bold text-white">プレイ一覧</h1>
        <span className="text-gray-500 text-sm ml-1">({plays.length}件)</span>
        <div className="ml-auto">
          <button
            onClick={() => router.push('/')}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
          >
            ＋ 新しいプレイ
          </button>
        </div>
      </header>

      <div className="flex-1 p-4">
        {/* Search + filter bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="プレイ名で検索..."
            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-400 placeholder-gray-500 text-sm w-64"
          />
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded border transition-colors ${
                  filter === f.id
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-white'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Play grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            {plays.length === 0 ? (
              <>
                <div className="text-5xl mb-4">🏀</div>
                <p className="text-lg font-medium mb-2">プレイがまだありません</p>
                <p className="text-sm mb-6">作戦版でプレイを作成して保存してみましょう</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
                >
                  プレイを作成する
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-base">該当するプレイが見つかりません</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((play) => (
              <PlayCard
                key={play.id}
                play={play}
                onLoad={handleLoad}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
