// エージェントのオーケストレーション：計画 → 検索 → 合成。
// LLM/検索キーの有無に応じて demo / llm-only / web-agent に段階的に縮退する。
import type {
  AgentStep,
  Competitor,
  Credentials,
  Recommendation,
  ResearchReport,
  ResearchResult,
  SearchHit,
  Source,
  Swot,
} from "./types";
import { resolveLlmConfig, llmJson, extractJson, type LlmConfig } from "./llm";
import { resolveSearchConfig, runSearch } from "./search";
import { buildDemoResult } from "./demo";

const MAX_QUERIES = 4;

const REPORT_SCHEMA = `{
  "summary": "全体の要約（200〜300字）",
  "competitors": [{ "name": "競合名", "description": "概要", "strengths": "強み", "weaknesses": "弱み" }],
  "trends": ["市場トレンド"],
  "opportunities": ["参入・成長の機会"],
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "recommendations": [{ "title": "推奨アクション", "detail": "具体的な根拠・内容" }]
}`;

/** 調査クエリを LLM に立案させる。失敗時はトピックから機械的に生成。 */
async function planQueries(cfg: LlmConfig, topic: string, focus: string): Promise<string[]> {
  const system =
    "あなたは熟練の市場調査アナリストです。与えられたトピックと観点について、Web検索すべき具体的なクエリを日本語で立案します。";
  const user =
    `トピック: ${topic}\n観点: ${focus}\n\n` +
    `このトピックを多角的に調べるための検索クエリを ${MAX_QUERIES} 個、JSON で返してください。\n` +
    `形式: {"queries": ["クエリ1", "クエリ2", ...]}`;
  try {
    const raw = await llmJson(cfg, system, user);
    const parsed = extractJson(raw);
    const qs = Array.isArray(parsed.queries) ? parsed.queries : [];
    const cleaned = qs.map((q) => String(q).trim()).filter(Boolean).slice(0, MAX_QUERIES);
    if (cleaned.length) return cleaned;
  } catch {
    /* fallthrough */
  }
  return [
    `${topic} 市場規模 トレンド`,
    `${topic} 主要企業 競合 比較`,
    `${topic} 課題 ニーズ`,
  ];
}

/** 検索結果（or 知識ベース）から構造化レポートを合成する。 */
async function synthesize(
  cfg: LlmConfig,
  topic: string,
  focus: string,
  context: string,
  hasWeb: boolean,
): Promise<Record<string, unknown>> {
  const system =
    "あなたは市場調査レポートを作成するアナリストです。" +
    (hasWeb
      ? "提供された検索結果のみを根拠に、事実に基づいて記述してください。推測は避けます。"
      : "あなたの一般知識に基づき記述してください。ただし不確実な点は断定を避けてください。");
  const user =
    `トピック: ${topic}\n観点: ${focus}\n\n` +
    (hasWeb ? `# 検索結果\n${context}\n\n` : "") +
    `上記を踏まえ、市場・競合レポートを次の JSON スキーマで返してください。\n${REPORT_SCHEMA}`;
  const raw = await llmJson(cfg, system, user);
  return extractJson(raw);
}

/** LLM の生 JSON を ResearchReport に正規化（安全なデフォルト付き）。 */
function normalizeReport(
  raw: Record<string, unknown>,
  topic: string,
  focus: string,
  sources: Source[],
): ResearchReport {
  const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const strArr = (v: unknown): string[] => arr(v).map((x) => String(x)).filter(Boolean);

  const competitors: Competitor[] = arr(raw.competitors)
    .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
    .map((c) => ({
      name: str(c.name) || "(名称不明)",
      description: str(c.description),
      strengths: str(c.strengths),
      weaknesses: str(c.weaknesses),
    }))
    .slice(0, 8);

  const swotRaw = (raw.swot && typeof raw.swot === "object" ? raw.swot : {}) as Record<string, unknown>;
  const swot: Swot = {
    strengths: strArr(swotRaw.strengths),
    weaknesses: strArr(swotRaw.weaknesses),
    opportunities: strArr(swotRaw.opportunities),
    threats: strArr(swotRaw.threats),
  };

  const recommendations: Recommendation[] = arr(raw.recommendations)
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => ({ title: str(r.title) || "提案", detail: str(r.detail) }))
    .slice(0, 6);

  return {
    topic,
    focus,
    summary: str(raw.summary) || "（要約を取得できませんでした）",
    competitors,
    trends: strArr(raw.trends).slice(0, 8),
    opportunities: strArr(raw.opportunities).slice(0, 8),
    swot,
    recommendations,
    sources,
  };
}

/** メインのエージェント実行。creds は利用者が持ち込んだ API キー（BYOK）。 */
export async function runResearch(
  topic: string,
  focus: string,
  creds?: Credentials,
): Promise<ResearchResult> {
  const startedAt = Date.now();
  const llm = resolveLlmConfig(creds);

  // Tier 1: LLM キーなし → デモ
  if (!llm) {
    return buildDemoResult(topic, focus, Date.now() - startedAt);
  }

  const search = resolveSearchConfig(creds);
  const steps: AgentStep[] = [];

  // 1) 計画
  const queries = await planQueries(llm, topic, focus);
  steps.push({
    phase: "plan",
    label: "調査計画を立案",
    detail: `${queries.length} 件のサブクエリに分解`,
  });

  // 2) 検索（検索キーがある場合のみ）
  const sources: Source[] = [];
  let context = "";
  if (search) {
    for (const q of queries) {
      const hits: SearchHit[] = await runSearch(search, q);
      steps.push({ phase: "search", label: "Web検索を実行", query: q, hits: hits.length });
      for (const h of hits) {
        context += `\n## ${h.title}\nURL: ${h.url}\n${h.snippet}\n`;
        if (h.url && !sources.some((s) => s.url === h.url)) {
          sources.push({ title: h.title, url: h.url });
        }
      }
    }
  }

  const hasWeb = Boolean(search) && context.trim().length > 0;

  // 3) 合成
  let rawReport: Record<string, unknown>;
  try {
    rawReport = await synthesize(llm, topic, focus, context, hasWeb);
  } catch {
    // LLM 合成に失敗したらデモにフォールバック
    return buildDemoResult(topic, focus, Date.now() - startedAt);
  }
  steps.push({
    phase: "synthesize",
    label: "レポートを合成",
    detail: hasWeb ? "検索結果を統合し構造化" : "知識ベースから構造化",
  });

  const report = normalizeReport(rawReport, topic, focus, sources.slice(0, 12));

  const mode = hasWeb ? "web-agent" : "llm-only";
  const modeLabel = hasWeb
    ? "Webエージェント（実検索＋出典付き）"
    : "LLM知識ベース（Web未接続 / 出典なし）";

  return {
    mode,
    modeLabel,
    steps,
    report,
    elapsedMs: Date.now() - startedAt,
    provider: llm.provider,
    model: llm.model,
  };
}
