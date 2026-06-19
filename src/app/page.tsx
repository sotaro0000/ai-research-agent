"use client";

import { useState } from "react";
import type { ResearchResult } from "@/lib/types";
import StepTimeline from "@/components/StepTimeline";
import ReportView from "@/components/ReportView";

const EXAMPLES = ["クラフトビールのD2Cブランド", "中小企業向けAIチャットボット", "サブスク型フィットネス"];

const FOCUS_OPTIONS = ["競合と市場機会", "新規参入の戦略", "ターゲット顧客の分析", "価格・収益モデル"];

const MODE_BADGE: Record<string, string> = {
  demo: "bg-slate-200 text-slate-600",
  "llm-only": "bg-amber-100 text-amber-700",
  "web-agent": "bg-agent-600 text-white",
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [focus, setFocus] = useState(FOCUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);

  async function runResearch(t: string, f: string) {
    const target = t.trim();
    if (!target) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: target, focus: f }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "調査に失敗しました。");
      else setResult(data as ResearchResult);
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runResearch(topic, focus);
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-agent-200 bg-agent-50 px-3 py-1 text-xs font-medium text-agent-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-agent-500" />
          AI Agent ・ 自律型リサーチ
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          AI Research <span className="text-agent-600">Agent</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          企業名やキーワードを入力するだけで、AIエージェントが
          <strong className="text-slate-800">「調査計画 → Web検索 → レポート合成」</strong>
          を自動実行。競合・市場分析レポートを出典付きで生成します。
        </p>
      </header>

      {/* 入力フォーム */}
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="調査したい企業名・キーワード（例: 中小企業向けAIチャットボット）"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-agent-500 focus:ring-2 focus:ring-agent-100"
          disabled={loading}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-agent-500 focus:ring-2 focus:ring-agent-100"
          >
            {FOCUS_OPTIONS.map((f) => (
              <option key={f} value={f}>
                観点：{f}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="rounded-xl bg-agent-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-agent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "調査中…" : "調査を開始"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>例:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setTopic(ex);
                runResearch(ex, focus);
              }}
              disabled={loading}
              className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      <div className="mt-10">
        {error && (
          <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200/60" />
            <p className="text-center text-xs text-slate-400">
              エージェントが計画 → 検索 → 合成を実行しています…
            </p>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
            <p className="mb-4 text-sm font-medium text-slate-500">エージェントの3ステップ</p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span className="rounded-lg bg-agent-50 px-3 py-2 font-semibold text-agent-700">① 調査計画</span>
              <span className="text-slate-300">→</span>
              <span className="rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-700">② Web検索</span>
              <span className="text-slate-300">→</span>
              <span className="rounded-lg bg-purple-50 px-3 py-2 font-semibold text-purple-700">③ レポート合成</span>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            {/* モード表示 */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-xs text-slate-400">調査トピック</p>
                <p className="font-bold text-slate-800">
                  {result.report.topic}
                  <span className="ml-2 text-xs font-normal text-slate-400">／ 観点：{result.report.focus}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${MODE_BADGE[result.mode] ?? "bg-slate-200"}`}>
                  {result.modeLabel}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">{result.elapsedMs}ms</span>
              </div>
            </div>

            {result.mode === "demo" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                現在はデモモードです。環境変数に OpenAI / 検索プロバイダ（Tavily 等）のキーを設定すると、本物のWeb調査に基づく出典付きレポートが生成されます。
              </div>
            )}

            <StepTimeline steps={result.steps} />
            <ReportView result={result} />
          </div>
        )}
      </div>

      <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        <p>AI Research Agent — 計画→検索→合成を自動実行する自律型リサーチエージェント / Next.js · TypeScript · LLM</p>
        <p className="mt-1">APIキー未設定でもデモが動作します。LLM＋検索キー設定で本物のWeb調査が有効化されます。</p>
      </footer>
    </main>
  );
}
