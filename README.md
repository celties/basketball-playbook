# 🏀 バスケ作戦版

バスケットボールのプレイブック作成・管理Webアプリ。
ハーフコートオフェンス、サイドライン/エンドラインのインバウンズプレイを登録・管理できます。

## 機能

- 🎨 **コート描画** — オフェンス/ディフェンス選手の配置、カット・パス・ドリブルの矢印、スクリーン記号
- 📋 **ステップ管理** — プレイをステップ分割してアニメーション再生
- 💾 **プレイ保存** — LocalStorageに保存してプレイ一覧で管理（ハーフコート/サイドライン/エンドライン）
- 🎬 **YouTube連携** — 動画URLを横に表示しながら作図、タイムスタンプ記録
- 🤖 **AI解析** — バスケのプレイ写真/スクショをアップロードするとClaudeが選手位置を自動配置

## キーボードショートカット

| キー | ツール |
|------|--------|
| V | 選択・移動 |
| O | オフェンス選手配置 |
| D | ディフェンス選手配置 |
| C | カット（ランニング）矢印 |
| P | パス矢印（破線） |
| B | ドリブル矢印（点線） |
| S | スクリーン記号 |
| G | ゴーストスクリーン |
| E | 削除 |
| Ctrl+Z | 元に戻す |

## セットアップ

```bash
npm install
```

`.env.local` を作成してAnthropicのAPIキーを設定：
```
ANTHROPIC_API_KEY=your_api_key_here
```

APIキーは https://console.anthropic.com で取得できます。

```bash
npm run dev
```

http://localhost:3000 で開きます。

## Vercelデプロイ

1. GitHubにリポジトリをpush
2. [Vercel](https://vercel.com) でプロジェクトをimport
3. **Environment Variables** に `ANTHROPIC_API_KEY` を追加
4. Deploy!

> AI解析機能はAnthropicのAPIキーが必要です。キー未設定でもコート描画・プレイ管理は使えます。

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- SVG (コート描画)
- @anthropic-ai/sdk (AI解析)
- localStorage (プレイデータ保存)
