// AI Research Agent — 共通型定義

/** 実行モード（どこまで本格的に動いたか） */
export type RunMode = "demo" | "llm-only" | "web-agent";

/** エージェントの実行ステップ（UIのタイムライン表示用） */
export interface AgentStep {
  phase: "plan" | "search" | "synthesize";
  label: string;
  detail?: string;
  /** 検索フェーズで実際に投げたクエリ */
  query?: string;
  /** 取得した結果件数 */
  hits?: number;
}

/** Web検索の1件 */
export interface SearchHit {
  title: string;
  url: string;
  snippet: string;
}

/** 競合1社 */
export interface Competitor {
  name: string;
  description: string;
  strengths: string;
  weaknesses: string;
}

/** SWOT */
export interface Swot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

/** 推奨アクション */
export interface Recommendation {
  title: string;
  detail: string;
}

/** 出典 */
export interface Source {
  title: string;
  url: string;
}

/** 最終レポート */
export interface ResearchReport {
  topic: string;
  /** 調査の観点（ユーザー指定） */
  focus: string;
  summary: string;
  competitors: Competitor[];
  trends: string[];
  opportunities: string[];
  swot: Swot;
  recommendations: Recommendation[];
  sources: Source[];
}

/** API レスポンス */
export interface ResearchResult {
  mode: RunMode;
  modeLabel: string;
  steps: AgentStep[];
  report: ResearchReport;
  elapsedMs: number;
  provider?: string;
  model?: string;
}
