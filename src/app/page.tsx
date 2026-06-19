"use client";

import { useEffect, useState } from "react";
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

const LS_OPENAI = "ai-research-agent:openai";
const LS_TAVILY = "ai-research-agent:tavily";
const LS_REMEMBER = "ai-research-agent:remember";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [focus, setFocus] = useState(FOCUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);

  // BYOK: 利用者が各自入力する API キー
  const [openaiKey, setOpenaiKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");
  const [remember, setRemember] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);

  // 任意：前回ブラウザに保存したキーを復元
  useEffect(() => {
    try {
      const r = localStorage.getItem(LS_REMEMBER) === "true";
      if (r) {
        setRemember(true);
        setOpenaiKey(localStorage.getItem(LS_OPENAI) ?? "");
        setTavilyKey(localStorage.getItem(LS_TAVILY) ?? "");
      }
    } catch {
      /* localStorage 不可環境は無視 */
    }
  }, []);

  function persistKeys() {
    try {
      if (remember) {
        localStorage.setItem(LS_REMEMBER, "true");
        localStorage.setItem(LS_OPENAI, openaiKey.trim());
        localStorage.setItem(LS_TAVILY, tavilyKey.trim());
      } else {
        localStorage.removeItem(LS_REMEMBER);
        localStorage.removeItem(LS_OPENAI);
        localStorage.removeItem(LS_TAVILY);
      }
    } catch {
      /* noop */
    }
  }

  async function runResearch(t: string, f: string) {
    const target = t.trim();
    if (!target) return;
    persistKeys();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: target,
          focus: f,
          // 入力されたキーはこのリクエストでのみ使用される（サーバーには保存しない）
          openaiApiKey: openaiKey.trim() || undefined,
          tavilyApiKey: tavilyKey.trim() || undefined,
        }),
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

  const hasKeys = openaiKey.trim().length > 0;

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

        {/* APIキー設定（各自で入力・BYOK） */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setKeysOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
          >
            <span className="flex items-center gap-2 font-medium text-slate-700">
              🔑 APIキー設定（各自で入力・任意）
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  hasKeys ? "bg-agent-100 text-agent-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {hasKeys ? "本格モード有効" : "未設定＝デモ"}
              </span>
            </span>
            <span className="text-xs text-slate-400">{keysOpen ? "閉じる ▲" : "開く ▼"}</span>
          </button>

          {keysOpen && (
            <div className="space-y-3 border-t border-slate-100 p-4">
              <p className="rounded-lg bg-slate-50 p-2 text-xs leading-relaxed text-slate-500">
                ご自身の API キーを入力すると、本物のWeb調査が有効になります。
                <strong className="text-slate-700">入力したキーはこのリクエストの実行にのみ使用し、サーバーには保存・記録しません。</strong>
                （「このブラウザに保存」を選んだ場合のみ、お使いのブラウザ内にのみ保存されます）
              </p>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  OpenAI API キー
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer noopener" className="ml-2 text-agent-600 hover:underline">
                    取得 ↗
                  </a>
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  autoComplete="off"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-agent-500 focus:ring-2 focus:ring-agent-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Tavily API キー（Web検索・任意）
                  <a href="https://tavily.com" target="_blank" rel="noreferrer noopener" className="ml-2 text-agent-600 hover:underline">
                    取得 ↗
                  </a>
                </label>
                <input
                  type="password"
                  value={tavilyKey}
                  onChange={(e) => setTavilyKey(e.target.value)}
                  placeholder="tvly-..."
                  autoComplete="off"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-agent-500 focus:ring-2 focus:ring-agent-100"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
                このブラウザに保存する（次回も使う場合）
              </label>
              <p className="text-[11px] text-slate-400">
                ※ OpenAI キーのみ → LLMの知識ベースで生成（Web未接続）。OpenAI＋Tavily の両方 → 実Web検索＋出典付き。
              </p>
            </div>
          )}
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
                現在はデモモードです。上の「🔑 APIキー設定」にご自身の OpenAI / Tavily キーを入力すると、本物のWeb調査に基づく出典付きレポートが生成されます。
              </div>
            )}

            <StepTimeline steps={result.steps} />
            <ReportView result={result} />
          </div>
        )}
      </div>

      <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        <p>AI Research Agent — 計画→検索→合成を自動実行する自律型リサーチエージェント / Next.js · TypeScript · LLM</p>
        <p className="mt-1">
          APIキーは利用者が各自で入力する方式（BYOK）。未入力でもデモが動作し、キー入力で本物のWeb調査が有効化されます。
        </p>
      </footer>
    </main>
  );
}
