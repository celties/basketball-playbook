'use client';

import { useState } from 'react';
import { parseYouTubeId, formatTime } from '@/lib/utils';

interface YouTubePanelProps {
  youtubeUrl: string;
  youtubeTimestamp: number;
  onUrlChange: (url: string) => void;
  onTimestampChange: (ts: number) => void;
  onAIAnalyze: (imageFile: File) => void;
  aiLoading: boolean;
}

export default function YouTubePanel({
  youtubeUrl,
  youtubeTimestamp,
  onUrlChange,
  onTimestampChange,
  onAIAnalyze,
  aiLoading,
}: YouTubePanelProps) {
  const [inputUrl, setInputUrl] = useState(youtubeUrl || '');
  const [tsInput, setTsInput] = useState('');

  const videoId = parseYouTubeId(youtubeUrl);
  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?start=${Math.floor(youtubeTimestamp)}&rel=0&modestbranding=1`
    : null;

  const handleUrlSubmit = () => {
    onUrlChange(inputUrl.trim());
  };

  const handleTsCapture = () => {
    const sec = parseFloat(tsInput);
    if (!isNaN(sec) && sec >= 0) {
      onTimestampChange(sec);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-3 border-b border-gray-700">
        <p className="text-xs font-bold text-yellow-400 mb-2">
          🎬 YouTube参照
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="YouTube URL を貼り付け..."
            className="flex-1 bg-gray-800 text-white text-xs px-2 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-blue-400 placeholder-gray-500"
          />
          <button
            onClick={handleUrlSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded transition-colors"
          >
            読込
          </button>
        </div>
      </div>

      {/* Video embed */}
      {embedSrc ? (
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 text-gray-600 text-sm p-4 text-center min-h-[160px]">
          URLを入力すると<br />ここに動画が表示されます
        </div>
      )}

      {/* Timestamp capture */}
      {videoId && (
        <div className="p-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">タイムスタンプ記録</p>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder="秒数 (例: 125)"
              className="flex-1 bg-gray-800 text-white text-xs px-2 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-blue-400 placeholder-gray-500"
            />
            <button
              onClick={handleTsCapture}
              className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              保存
            </button>
          </div>
          {youtubeTimestamp > 0 && (
            <p className="text-xs text-green-400 mt-1">
              記録済み: {formatTime(youtubeTimestamp)} ({Math.floor(youtubeTimestamp)}秒)
            </p>
          )}
        </div>
      )}

      {/* AI Analyze */}
      <div className="p-3 border-t border-gray-700">
        <p className="text-xs font-bold text-purple-400 mb-1">
          🤖 AI解析（スクリーンショット→コート自動配置）
        </p>
        <p className="text-[10px] text-gray-500 mb-2">
          動画の一場面をスクショして画像をアップロード → AIが選手配置を読み取ります
        </p>
        <label className="block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAIAnalyze(file);
              e.target.value = '';
            }}
          />
          <span
            className={`
              block text-center text-xs px-3 py-2 rounded border border-dashed cursor-pointer transition-colors
              ${aiLoading
                ? 'bg-purple-900/30 border-purple-600 text-purple-400 cursor-wait'
                : 'bg-purple-900/20 border-purple-700 text-purple-300 hover:bg-purple-900/40 hover:border-purple-500'}
            `}
          >
            {aiLoading ? '🔄 解析中...' : '📸 画像をアップロード'}
          </span>
        </label>
      </div>
    </div>
  );
}
