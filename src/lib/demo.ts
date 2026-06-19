// デモモード用の決定論的サンプルレポート。
// APIキー未設定でも UI・フローを完全にデモできるよう、トピックを差し込んだ現実的な内容を返す。
import type { AgentStep, ResearchReport, ResearchResult } from "./types";

export function buildDemoResult(topic: string, focus: string, elapsedMs: number): ResearchResult {
  const t = topic.trim() || "サンプル市場";
  const f = focus.trim() || "競合と市場機会";

  const steps: AgentStep[] = [
    { phase: "plan", label: "調査計画を立案", detail: "4件のサブクエリに分解しました（デモ）" },
    { phase: "search", label: "Web検索を実行", query: `${t} 市場規模 トレンド`, hits: 5 },
    { phase: "search", label: "Web検索を実行", query: `${t} 主要企業 競合 比較`, hits: 5 },
    { phase: "search", label: "Web検索を実行", query: `${t} 課題 ニーズ 顧客`, hits: 4 },
    { phase: "synthesize", label: "レポートを合成", detail: "検索結果を統合し構造化しました（デモ）" },
  ];

  const report: ResearchReport = {
    topic: t,
    focus: f,
    summary:
      `これは「${t}」に関するデモ用のサンプルレポートです（実際のWeb検索・LLMは未実行）。` +
      `環境変数に OpenAI / 検索プロバイダのキーを設定すると、本物のWeb調査に基づく出典付きレポートが生成されます。` +
      `本デモでは、エージェントが「計画→検索→合成」の3ステップでレポートを組み立てる流れを体験できます。`,
    competitors: [
      {
        name: "先行大手A社",
        description: `${t} 領域で最大級のシェアを持つ既存プレイヤー（サンプル）。`,
        strengths: "ブランド認知・販売網・資本力",
        weaknesses: "意思決定が遅く、ニッチ・新規層への対応が手薄",
      },
      {
        name: "新興スタートアップB社",
        description: "デジタル/D2C を軸に急成長する新興企業（サンプル）。",
        strengths: "UX・スピード・SNS活用",
        weaknesses: "認知度とサポート体制が発展途上",
      },
      {
        name: "特化型ニッチC社",
        description: "特定セグメントに深く刺さる専門特化型（サンプル）。",
        strengths: "専門性・高いロイヤルティ",
        weaknesses: "スケールしづらく価格競争に弱い",
      },
    ],
    trends: [
      "AI活用による顧客体験のパーソナライズが加速",
      "サブスク/リカーリング型モデルへの移行",
      "サステナビリティ・透明性への要求の高まり",
    ],
    opportunities: [
      `${t} における“未対応の中間層”をAIで安価に満たす余地`,
      "一次データ × LLM による提案精度の差別化",
      "既存大手が手薄なニッチ向け特化プロダクト",
    ],
    swot: {
      strengths: ["小回り・スピード", "AI実装力", "マーケ視点との両立"],
      weaknesses: ["認知度", "実績数", "リソース"],
      opportunities: ["AI需要の急拡大", "中小のDX余地", "ニッチ特化"],
      threats: ["大手のAI参入", "価格競争", "技術の陳腐化スピード"],
    },
    recommendations: [
      { title: "ニッチ起点で参入", detail: "大手が手薄な中間層・特化領域から実績を作る。" },
      { title: "AIで提案を差別化", detail: "一次データとLLMを組み合わせ、提案の精度と速度で勝つ。" },
      { title: "発信で信頼を積む", detail: "調査・知見をコンテンツ化し、リード獲得の導線にする。" },
    ],
    sources: [],
  };

  return {
    mode: "demo",
    modeLabel: "デモモード（APIキー未設定 / サンプル出力）",
    steps,
    report,
    elapsedMs,
  };
}
