import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GameSituation {
  quarter: string;        // 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'OT'
  timeRemaining: string;  // 'full' | 'under2min' | 'under1min' | 'under30sec'
  scoreDiff: number;      // positive = leading, negative = trailing
  possession: 'offense' | 'defense';
  timeoutsLeft: number;
  foulsInBonus: boolean;
  notes: string;
}

export interface SavedPlaySummary {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface SuggestRequest {
  situation: GameSituation;
  savedPlays: SavedPlaySummary[];
}

export interface Suggestion {
  title: string;
  reasoning: string;
  matchedPlayIds: string[];
  generalAdvice: string;
}

function buildPrompt(situation: GameSituation, savedPlays: SavedPlaySummary[]): string {
  const quarterLabel = situation.quarter;
  const timeLabel: Record<string, string> = {
    full: 'まだ時間はある',
    under2min: '残り2分以内',
    under1min: '残り1分以内',
    under30sec: '残り30秒以内',
  };
  const diffLabel = situation.scoreDiff === 0
    ? '同点'
    : situation.scoreDiff > 0
      ? `${situation.scoreDiff}点リード`
      : `${Math.abs(situation.scoreDiff)}点ビハインド`;
  const possLabel = situation.possession === 'offense' ? 'オフェンス' : 'ディフェンス';

  const playsText = savedPlays.length > 0
    ? savedPlays.map((p, i) =>
        `[${i + 1}] ID:${p.id} / 名前:「${p.name}」/ カテゴリ:${p.category}${p.description ? ` / 説明:${p.description}` : ''}`
      ).join('\n')
    : '（登録済みプレイなし）';

  return `あなたはバスケットボールの戦術コーチです。以下の試合状況を分析し、具体的な戦術提案をしてください。

【試合状況】
- クォーター: ${quarterLabel}
- 残り時間: ${timeLabel[situation.timeRemaining] ?? situation.timeRemaining}
- スコア: ${diffLabel}
- 状況: ${possLabel}
- タイムアウト残数: ${situation.timeoutsLeft}本
- ボーナスファウル: ${situation.foulsInBonus ? 'あり' : 'なし'}
${situation.notes ? `- 補足: ${situation.notes}` : ''}

【登録済みプレイブック】
${playsText}

以下のJSON形式で回答してください。余分なテキストは不要です。

{
  "suggestions": [
    {
      "title": "提案タイトル（短く）",
      "reasoning": "この状況でなぜこの戦術が有効か（2〜3文）",
      "matchedPlayIds": ["プレイブックから推薦するプレイのIDを配列で。なければ空配列"],
      "generalAdvice": "具体的な実行ポイント（箇条書き2〜3項目、改行で区切る）"
    }
  ]
}

状況に応じて1〜3つの提案を返してください。`;
}

export async function POST(req: NextRequest) {
  try {
    const body: SuggestRequest = await req.json();
    const { situation, savedPlays } = body;

    if (!situation) {
      return NextResponse.json({ error: '試合状況が必要です' }, { status: 400 });
    }

    const prompt = buildPrompt(situation, savedPlays ?? []);

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI応答の解析に失敗しました', raw: text }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error('AI suggest error:', err);
    return NextResponse.json({ error: 'AI提案に失敗しました', details: String(err) }, { status: 500 });
  }
}
