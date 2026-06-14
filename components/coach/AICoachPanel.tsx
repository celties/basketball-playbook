'use client';

import { useState } from 'react';
import { GameSituation, SavedPlaySummary, Suggestion } from '@/app/api/ai-suggest/route';

interface AICoachPanelProps {
  savedPlays: SavedPlaySummary[];
  onLoadPlay?: (playId: string) => void;
}

const QUARTER_OPTIONS = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];
const TIME_OPTIONS = [
  { value: 'full', label: '余裕あり' },
  { value: 'under2min', label: '残り2分↓' },
  { value: 'under1min', label: '残り1分↓' },
  { value: 'under30sec', label: '残り30秒↓' },
];

export default function AICoachPanel({ savedPlays, onLoadPlay }: AICoachPanelProps) {
  const [situation, setSituation] = useState<GameSituation>({
    quarter: 'Q4',
    timeRemaining: 'under1min',
    scoreDiff: -3,
    possession: 'offense',
    timeoutsLeft: 1,
    foulsInBonus: false,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState('');

  const handleSuggest = async () => {
    setLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, savedPlays }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? '提案の取得に失敗しました');
        return;
      }
      setSuggestions(data.suggestions ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const update = <K extends keyof GameSituation>(key: K, value: GameSituation[K]) =>
    setSituation((s) => ({ ...s, [key]: value }));

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 text-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-orange-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <span className="font-bold text-gray-800">AIコーチ</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">試合状況を入力して戦術提案を受ける</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Situation inputs */}
        <div className="px-4 py-3 space-y-3">
          {/* Quarter + Time */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 block mb-1">クォーター</label>
              <div className="flex gap-1 flex-wrap">
                {QUARTER_OPTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => update('quarter', q)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      situation.quarter === q
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time remaining */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">残り時間</label>
            <div className="flex gap-1 flex-wrap">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => update('timeRemaining', t.value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    situation.timeRemaining === t.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Score diff */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              スコア差:{' '}
              <span className={`font-bold ${situation.scoreDiff > 0 ? 'text-green-600' : situation.scoreDiff < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                {situation.scoreDiff > 0 ? `+${situation.scoreDiff}点リード` : situation.scoreDiff < 0 ? `${situation.scoreDiff}点ビハインド` : '同点'}
              </span>
            </label>
            <input
              type="range"
              min={-20}
              max={20}
              value={situation.scoreDiff}
              onChange={(e) => update('scoreDiff', Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>-20点</span>
              <span>同点</span>
              <span>+20点</span>
            </div>
          </div>

          {/* Possession */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">攻守</label>
            <div className="flex gap-2">
              {(['offense', 'defense'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => update('possession', p)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    situation.possession === p
                      ? p === 'offense' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p === 'offense' ? '⚔️ オフェンス' : '🛡️ ディフェンス'}
                </button>
              ))}
            </div>
          </div>

          {/* Timeouts + Bonus */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 block mb-1">タイムアウト残</label>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => update('timeoutsLeft', n)}
                    className={`w-8 h-7 rounded text-xs font-bold transition-colors ${
                      situation.timeoutsLeft === n
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">ボーナスファウル</label>
              <button
                onClick={() => update('foulsInBonus', !situation.foulsInBonus)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  situation.foulsInBonus
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {situation.foulsInBonus ? 'あり' : 'なし'}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">補足（任意）</label>
            <textarea
              value={situation.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="例: エースが4ファウル、相手のゾーンを崩したい..."
              rows={2}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:border-orange-400"
            />
          </div>

          {/* Saved plays count hint */}
          {savedPlays.length > 0 && (
            <p className="text-[10px] text-gray-400">
              📚 プレイブック {savedPlays.length}件を参照して提案します
            </p>
          )}

          <button
            onClick={handleSuggest}
            disabled={loading}
            className="w-full py-2 rounded bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-colors"
          >
            {loading ? '🤔 分析中...' : '🏀 戦術を提案してもらう'}
          </button>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-2 py-1.5">
              ❌ {error}
            </p>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 space-y-3">
            <p className="text-xs font-bold text-gray-600">💡 AIコーチの提案</p>
            {suggestions.map((s, i) => {
              const matched = savedPlays.filter((p) => s.matchedPlayIds?.includes(p.id));
              return (
                <div key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                  <p className="font-bold text-orange-800 text-xs">{s.title}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{s.reasoning}</p>
                  {s.generalAdvice && (
                    <div className="bg-white border border-orange-100 rounded px-2 py-1.5">
                      {s.generalAdvice.split('\n').filter(Boolean).map((line, j) => (
                        <p key={j} className="text-xs text-gray-600 leading-snug">• {line.replace(/^[•\-\*]\s*/, '')}</p>
                      ))}
                    </div>
                  )}
                  {matched.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-orange-700">プレイブックから:</p>
                      {matched.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onLoadPlay?.(p.id)}
                          className="w-full text-left text-xs px-2 py-1.5 rounded bg-white border border-orange-300 hover:bg-orange-100 text-orange-800 font-medium transition-colors"
                        >
                          📋 {p.name}
                          <span className="ml-1 text-[10px] text-orange-500 font-normal">
                            ({p.category === 'halfcourt' ? 'ハーフコート' : p.category === 'sideline' ? 'サイドライン' : 'エンドライン'})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
