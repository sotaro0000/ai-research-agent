# AI Research Agent 🔭

> **キーワードを入れるだけで、AIエージェントが「調査計画 → Web検索 → レポート合成」を自動実行。**
> 企業名・テーマから、競合分析・市場トレンド・SWOT・推奨アクションを**出典付き**でまとめる自律型リサーチエージェントです。

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

---

## 🎯 なぜ作ったか（課題）

市場調査・競合リサーチは、検索→精読→要約→構造化に多くの時間がかかる定型作業です。
この一連を **AIエージェント（計画・ツール実行・合成の自律ループ）** に任せ、数分で“たたき台レポート”を得られるようにしました。
LLM単発の生成ではなく、**「自分で計画を立て、Webを検索し、結果を統合する」エージェント設計**を実装しています。

## ✨ 主な機能

- **エージェント型パイプライン**：① 調査計画の自動立案 → ② 複数クエリでWeb検索 → ③ 構造化レポート合成
- **実行ステップの可視化**：エージェントが何を計画し、どのクエリで検索したかをタイムライン表示
- **構造化レポート**：エグゼクティブサマリー / 競合比較表 / 市場トレンド / 機会 / SWOT / 推奨アクション / 出典
- **3段グレースフル設計**：APIキーの有無で段階的に動作（下記）

## 🧭 3段階の動作モード

| モード | 条件 | 動作 |
| --- | --- | --- |
| **demo** | キーなし | サンプルレポートを返す（UI・フローを即体験） |
| **llm-only** | LLMキーのみ | LLMの知識ベースでレポート生成（Web未接続・出典なし） |
| **web-agent** | LLM＋検索キー | 本物のWeb検索に基づく**出典付き**レポート |

> AIO Lens と同じ「決定論的フォールバック」の思想で、**APIキーが無くても必ずデモが動く**設計です。

## 🏗 アーキテクチャ

```
[ブラウザ] ──POST /api/research──▶ [Next.js Route Handler (maxDuration=60s)]
                                          │
                                   runResearch()  ← エージェント本体
                                          │
                 ┌────────────────────────┼────────────────────────┐
                 ▼                        ▼                        ▼
            1. planQueries           2. runSearch (×N)        3. synthesize
            LLMが検索クエリを立案     Tavily / Serper で検索     LLMが検索結果を
            （計画フェーズ）          （ツール実行フェーズ）      構造化レポートに統合
                 └────────────────────────┼────────────────────────┘
                                          ▼
                              [ステップ可視化 + レポート UI]
```

**設計上の工夫:**
- **プロバイダ非依存**：LLM は OpenAI / Anthropic、検索は Tavily / Serper を環境変数で切替（SDK非依存の生fetch）。
- **堅牢な正規化**：LLM出力JSONを安全にパースし、欠損フィールドはデフォルト補完。失敗時はデモへ縮退。
- **タイムアウト対策**：検索クエリ数を上限化し、`maxDuration` を延長。

## 🛠 技術スタック

| 領域 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16（App Router / Route Handlers） |
| 言語 | TypeScript 5（strict） |
| UI | React 19 / Tailwind CSS 3（依存ライブラリ追加なし・SVG/CSSのみ） |
| LLM | OpenAI / Anthropic（任意・切替可） |
| 検索 | Tavily / Serper（任意・切替可） |
| デプロイ | Vercel |

## 🚀 セットアップ

```bash
npm install

# （任意）本格モードを使う場合
cp .env.example .env
#   OPENAI_API_KEY を設定 → llm-only モード
#   さらに TAVILY_API_KEY を設定 → web-agent モード（出典付き）

npm run dev      # http://localhost:3000
npm run build && npm start
npm run typecheck
```

### 環境変数（すべて任意）

| 変数 | 説明 |
| --- | --- |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI を使う場合 |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Anthropic を使う場合（`LLM_PROVIDER=anthropic`） |
| `TAVILY_API_KEY` | Tavily 検索（`SEARCH_PROVIDER=tavily`） |
| `SERPER_API_KEY` | Serper 検索（`SEARCH_PROVIDER=serper`） |

## 📁 ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                # 入力フォーム + 結果表示
│   ├── layout.tsx / globals.css
│   └── api/research/route.ts   # 調査API（maxDuration=60）
├── components/
│   ├── StepTimeline.tsx        # エージェント実行ステップの可視化
│   └── ReportView.tsx          # レポート本体の表示
└── lib/
    ├── types.ts                # 共通型
    ├── agent.ts                # エージェント本体（計画→検索→合成）
    ├── llm.ts                  # LLMプロバイダ抽象化
    ├── search.ts               # 検索プロバイダ抽象化
    └── demo.ts                 # デモモードのサンプル生成
```

## 🔭 今後の拡張

- [ ] 検索結果の信頼度スコアリング・重複排除
- [ ] レポートの PDF / Markdown エクスポート
- [ ] 調査履歴の保存（DB連携）と差分比較
- [ ] 反復リサーチ（不足を自己検知して追加検索する深掘りループ）

---

開発: **佐藤 颯太郎**（AIエンジニア / マーケター）
