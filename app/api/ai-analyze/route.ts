import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mediaType = (file.type || 'image/jpeg') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/gif'
      | 'image/webp';

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `この画像はバスケットボールのコートまたはプレイ図です。
画面内に見える選手（オフェンス・ディフェンス）の位置を読み取り、
以下のJSON形式で返してください。

コート座標系: 幅500px × 高さ470px のハーフコート。
エンドライン(バスケ側)がy=0(上端)、ハーフコートがy=470(下端)。
左サイドラインがx=0、右サイドラインがx=500。
バスケット中心は (250, 55)。

できるだけ多くの選手を検出して返してください。

{
  "players": [
    { "type": "offense", "number": 1, "x": 250, "y": 200 },
    { "type": "offense", "number": 2, "x": 150, "y": 300 },
    { "type": "defense", "number": 1, "x": 260, "y": 180 }
  ],
  "description": "検出した内容の簡単な説明"
}

JSONのみを返してください。余分なテキストは不要です。`,
            },
          ],
        },
      ],
    });

    const text =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Could not parse AI response', raw: text },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error('AI analyze error:', err);
    return NextResponse.json(
      { error: 'AI analysis failed', details: String(err) },
      { status: 500 }
    );
  }
}
