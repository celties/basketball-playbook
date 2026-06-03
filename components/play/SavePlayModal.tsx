'use client';

import { useState } from 'react';
import { PlayCategory } from '@/lib/types';

interface SavePlayModalProps {
  initialName?: string;
  initialCategory?: PlayCategory;
  onSave: (name: string, category: PlayCategory, description: string) => void;
  onClose: () => void;
}

const CATEGORIES: { id: PlayCategory; label: string; icon: string }[] = [
  { id: 'halfcourt', label: 'ハーフコートオフェンス', icon: '🏀' },
  { id: 'sideline', label: 'サイドラインインバウンズ', icon: '📐' },
  { id: 'endline', label: 'エンドラインインバウンズ', icon: '🎯' },
];

export default function SavePlayModal({
  initialName = '',
  initialCategory = 'halfcourt',
  onSave,
  onClose,
}: SavePlayModalProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<PlayCategory>(initialCategory);
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-xl p-6 w-[400px] shadow-2xl">
        <h2 className="text-gray-900 font-bold text-lg mb-4">プレイを保存</h2>

        <div className="mb-4">
          <label className="text-gray-500 text-xs block mb-1">プレイ名 (コール)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 41 MOTION, HORNS SET..."
            autoFocus
            className="w-full bg-gray-50 text-gray-900 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-400 placeholder-gray-400"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-500 text-xs block mb-2">カテゴリ</label>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded border transition-colors text-sm
                  ${category === c.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'}
                `}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-gray-500 text-xs block mb-1">メモ（任意）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="プレイの説明・ポイントなど..."
            rows={3}
            className="w-full bg-gray-50 text-gray-900 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-400 placeholder-gray-400 resize-none text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim(), category, description)}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
