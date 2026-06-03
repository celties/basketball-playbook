'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tool, PlayStep, PlayCategory, Player } from '@/lib/types';
import { generateId, createEmptyStep, COURT_WIDTH, COURT_HEIGHT } from '@/lib/utils';
import { savePlay, loadPlays } from '@/lib/storage';
import CourtBoard from '@/components/court/CourtBoard';
import Toolbar from '@/components/toolbar/Toolbar';
import SavePlayModal from '@/components/play/SavePlayModal';
import YouTubePanel from '@/components/youtube/YouTubePanel';

export default function HomePage() {
  const router = useRouter();
  const courtContainerRef = useRef<HTMLDivElement>(null);

  // ---- Tool state ----
  const [tool, setTool] = useState<Tool>('select');

  // ---- Step state ----
  const [steps, setSteps] = useState<PlayStep[]>([createEmptyStep()]);
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState<PlayStep[][]>([[createEmptyStep()]]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // ---- Player counts ----
  const [offenseCount, setOffenseCount] = useState(0);
  const [defenseCount, setDefenseCount] = useState(0);

  // ---- Play metadata ----
  const [playName, setPlayName] = useState('');
  const [editingPlayId, setEditingPlayId] = useState<string | null>(null);

  // ---- YouTube / AI ----
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTimestamp, setYoutubeTimestamp] = useState(0);
  const [ytPanelOpen, setYtPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  // ---- Modals ----
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  // ---- Animation ----
  const [animating, setAnimating] = useState(false);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex] ?? createEmptyStep();

  // ---------- History helpers ----------
  const pushHistory = useCallback(
    (newSteps: PlayStep[]) => {
      const newHistory = history.slice(0, historyIdx + 1);
      newHistory.push(newSteps.map((s) => ({ ...s })));
      setHistory(newHistory);
      setHistoryIdx(newHistory.length - 1);
    },
    [history, historyIdx]
  );

  const handleStepChange = useCallback(
    (updated: PlayStep) => {
      const newSteps = steps.map((s, i) => (i === stepIndex ? updated : s));
      setSteps(newSteps);
      pushHistory(newSteps);
    },
    [steps, stepIndex, pushHistory]
  );

  const handleUndo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prev = historyIdx - 1;
    setHistoryIdx(prev);
    setSteps(history[prev]);
  }, [historyIdx, history]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      const keyMap: Record<string, Tool> = {
        v: 'select', V: 'select',
        o: 'offense', O: 'offense',
        d: 'defense', D: 'defense',
        c: 'cut', C: 'cut',
        p: 'pass', P: 'pass',
        b: 'dribble', B: 'dribble',
        s: 'screen', S: 'screen',
        g: 'ghostScreen', G: 'ghostScreen',
        e: 'eraser', E: 'eraser',
      };
      if (keyMap[e.key]) setTool(keyMap[e.key]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo]);

  // Sync player counts when switching steps
  useEffect(() => {
    const players = steps[stepIndex]?.players ?? [];
    const offPlayers = players.filter((p) => p.type === 'offense');
    const defPlayers = players.filter((p) => p.type === 'defense');
    const maxOff = offPlayers.length > 0 ? Math.max(...offPlayers.map((p) => p.number)) : 0;
    const maxDef = defPlayers.length > 0 ? Math.max(...defPlayers.map((p) => p.number)) : 0;
    setOffenseCount(maxOff);
    setDefenseCount(maxDef);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  // ---------- Step management ----------
  const addStep = () => {
    const newStep = createEmptyStep(currentStep.players);
    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    pushHistory(newSteps);
    setStepIndex(newSteps.length - 1);
  };

  const removeStep = (idx: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== idx);
    setSteps(newSteps);
    pushHistory(newSteps);
    setStepIndex(Math.min(stepIndex, newSteps.length - 1));
  };

  const handleClear = () => {
    const empty = createEmptyStep();
    const newSteps = steps.map((s, i) => (i === stepIndex ? empty : s));
    setSteps(newSteps);
    pushHistory(newSteps);
    setOffenseCount(0);
    setDefenseCount(0);
  };

  // ---------- Animation ----------
  const playAnimation = () => {
    if (animating) {
      setAnimating(false);
      if (animRef.current) clearTimeout(animRef.current);
      return;
    }
    if (steps.length <= 1) return;
    setAnimating(true);
    setStepIndex(0);
    let idx = 0;
    const next = () => {
      idx++;
      if (idx >= steps.length) {
        setAnimating(false);
        setStepIndex(0);
        return;
      }
      setStepIndex(idx);
      animRef.current = setTimeout(next, 1500);
    };
    animRef.current = setTimeout(next, 1500);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, []);

  // ---------- Save ----------
  const handleSave = (name: string, category: PlayCategory, description: string) => {
    const id = editingPlayId || generateId();
    savePlay({
      id,
      name,
      category,
      description,
      steps,
      youtubeUrl: youtubeUrl || undefined,
      youtubeTimestamp: youtubeTimestamp || undefined,
      thumbnail: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setPlayName(name);
    setEditingPlayId(id);
    setSaveModalOpen(false);
    setAiMessage(`✅ "${name}" を保存しました`);
    setTimeout(() => setAiMessage(''), 3000);
  };

  // ---------- AI Analyze ----------
  const handleAIAnalyze = async (file: File) => {
    setAiLoading(true);
    setAiMessage('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/ai-analyze', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAiMessage(`❌ ${data.error || '解析失敗'}`);
        return;
      }
      const players: Player[] = (data.players || []).map(
        (p: { type: string; number?: number; x: number; y: number }, idx: number) => ({
          id: generateId(),
          type: p.type === 'defense' ? 'defense' : ('offense' as const),
          number: p.number ?? idx + 1,
          x: Math.max(20, Math.min(COURT_WIDTH - 20, p.x)),
          y: Math.max(20, Math.min(COURT_HEIGHT - 20, p.y)),
        })
      );
      const updated: PlayStep = { ...currentStep, players };
      handleStepChange(updated);
      const offCnt = players.filter((p) => p.type === 'offense').length;
      const defCnt = players.filter((p) => p.type === 'defense').length;
      setOffenseCount(offCnt);
      setDefenseCount(defCnt);
      setAiMessage(`🤖 ${data.description || `${players.length}人の選手を検出しました`}`);
    } catch (e) {
      setAiMessage(`❌ エラー: ${String(e)}`);
    } finally {
      setAiLoading(false);
    }
  };

  // ---------- Load a saved play ----------
  const loadSavedPlay = useCallback((playId: string) => {
    const plays = loadPlays();
    const play = plays.find((p) => p.id === playId);
    if (!play) return;
    setSteps(play.steps);
    setStepIndex(0);
    setPlayName(play.name);
    setEditingPlayId(play.id);
    setYoutubeUrl(play.youtubeUrl || '');
    setYoutubeTimestamp(play.youtubeTimestamp || 0);
    setHistory([play.steps.map((s) => ({ ...s }))]);
    setHistoryIdx(0);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('load');
      if (id) {
        loadSavedPlay(id);
        window.history.replaceState({}, '', '/');
      }
    }
  }, [loadSavedPlay]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 overflow-hidden">
      {/* ---- Header ---- */}
      <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shrink-0 shadow-sm">
        <span className="text-xl">🏀</span>
        <h1 className="font-bold text-gray-900 text-sm">バスケ作戦版</h1>
        {playName && (
          <span className="text-blue-600 text-sm font-medium truncate max-w-[200px]">
            — {playName}
          </span>
        )}
        {aiMessage && (
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 ml-2">
            {aiMessage}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setYtPanelOpen((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${
              ytPanelOpen
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            🎬 YouTube
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
          >
            💾 保存
          </button>
          <button
            onClick={() => router.push('/plays')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            📚 プレイ一覧
          </button>
        </div>
      </header>

      {/* ---- Main area ---- */}
      <div className="flex flex-1 min-h-0">
        {/* Toolbar */}
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          offenseCount={offenseCount}
          defenseCount={defenseCount}
          onClear={handleClear}
          onUndo={handleUndo}
        />

        {/* Court area */}
        <div
          ref={courtContainerRef}
          className="flex-1 flex items-center justify-center bg-gray-100 min-w-0 court-svg-container overflow-hidden p-2"
        >
          <div
            className="shadow-2xl rounded-lg overflow-hidden"
            style={{
              aspectRatio: `${COURT_WIDTH} / ${COURT_HEIGHT}`,
              maxWidth: '100%',
              maxHeight: '100%',
              width: `min(100%, calc(100vh * ${COURT_WIDTH / COURT_HEIGHT} - 120px))`,
            }}
          >
            <CourtBoard
              step={currentStep}
              tool={tool}
              offenseCount={offenseCount}
              defenseCount={defenseCount}
              onStepChange={handleStepChange}
              onOffenseCountChange={setOffenseCount}
              onDefenseCountChange={setDefenseCount}
            />
          </div>
        </div>

        {/* YouTube side panel */}
        {ytPanelOpen && (
          <div className="w-80 shrink-0 overflow-y-auto">
            <YouTubePanel
              youtubeUrl={youtubeUrl}
              youtubeTimestamp={youtubeTimestamp}
              onUrlChange={setYoutubeUrl}
              onTimestampChange={setYoutubeTimestamp}
              onAIAnalyze={handleAIAnalyze}
              aiLoading={aiLoading}
            />
          </div>
        )}
      </div>

      {/* ---- Steps bar ---- */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-gray-200 shrink-0 overflow-x-auto shadow-sm">
        <button
          onClick={playAnimation}
          title={animating ? '停止' : 'ステップ再生'}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
            animating
              ? 'bg-red-500 text-white'
              : steps.length > 1
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={steps.length <= 1 && !animating}
        >
          {animating ? '■' : '▶'}
        </button>

        <div className="flex items-center gap-1.5 flex-1">
          {steps.map((s, i) => (
            <div key={s.id} className="relative group shrink-0">
              <button
                onClick={() => !animating && setStepIndex(i)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  i === stepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                Step {i + 1}
                <span className="ml-1 text-[10px] opacity-60">
                  {s.players.length}人
                </span>
              </button>
              {steps.length > 1 && (
                <button
                  onClick={() => removeStep(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] hidden group-hover:flex items-center justify-center leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addStep}
            disabled={animating}
            className="shrink-0 px-3 py-1.5 rounded text-xs font-medium bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-dashed border-gray-300 transition-colors disabled:opacity-40"
          >
            + 追加
          </button>
        </div>

        <div className="shrink-0 text-[10px] text-gray-400 text-right leading-tight hidden xl:block">
          <div>V:選択 O:攻撃 D:守備 C:カット P:パス</div>
          <div>B:ドリブル S:スクリーン G:ゴースト E:消去</div>
        </div>
      </div>

      {/* ---- Save Modal ---- */}
      {saveModalOpen && (
        <SavePlayModal
          initialName={playName}
          onSave={handleSave}
          onClose={() => setSaveModalOpen(false)}
        />
      )}
    </div>
  );
}
