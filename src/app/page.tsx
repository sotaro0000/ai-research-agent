"use client";

import { useEffect, useState } from "react";
import type { ResearchResult } from "@/lib/types";
import StepTimeline from "@/components/StepTimeline";
import ReportView from "@/components/ReportView";

const EXAMPLES = ["クラフトビールのD2Cブランド", "中小企業向けAIチャットボット", "サブスク型フィットネス"];
const FOCUS_OPTIONS = ["競合と市場機会", "新規参入の戦略", "ターゲット顧客の分析", "価格・収益モデル"];

const MODE_BADGE: Record<string, string> = {
  demo: "text-slate-400",
  "llm-only": "text-amber-700",
  "web-agent": "text-accent",
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
  const [copied, setCopied] = useState(false);

  const [openaiKey, setOpenaiKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");
  const [remember, setRemember] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_REMEMBER) === "true") {
        setRemember(true);
        setOpenaiKey(localStorage.getItem(LS_OPENAI) ?? "");
        setTavilyKey(localStorage.getItem(LS_TAVILY) ?? "");
      }
    } catch {
      /* noop */
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
  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-teal-100";

  return (
    <div className="min-h-screen">
      {/* ===== ダークグラデのヒーロー（ナビ内包）===== */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900/80"></div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"></div>

        <div className="relative mx-auto max-w-5xl px-5">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-base font-bold tracking-tight text-white">AI Research Agent</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal-300">dossier</span>
            </div>
            <a href="https://github.com/sotaro0000/ai-research-agent" target="_blank" rel="noreferrer noopener" className="font-mono text-xs text-slate-300 underline-offset-4 transition hover:text-white hover:underline">GitHub ↗</a>
          </div>

          <div className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
            {/* 左：コピー＋入力 */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-200">Autonomous Market Research</span>
              <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.18] tracking-tight sm:text-[2.6rem]">
                市場を、エージェントが<br className="hidden sm:block" />
                調べて、<span className="text-teal-400">まとめる。</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
                市場・競合リサーチの“たたき台”が、数分で。企業名やキーワードを与えると、エージェントが「調査計画 → Web検索 → レポート合成」を自律実行し、競合・SWOT・推奨アクションを出典付きで一枚にまとめます。
              </p>

              <form onSubmit={onSubmit} className="mt-7 space-y-2.5">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="調査したい企業名・キーワード（例: 中小企業向けAIチャットボット）"
              className={inputCls}
              disabled={loading}
            />
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                disabled={loading}
                className={`${inputCls} flex-1`}
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
                className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "調査中…" : "調査を開始"}
              </button>
            </div>

            {/* APIキー（BYOK） */}
            <div className="rounded-xl border border-white/15 bg-white/5">
              <button
                type="button"
                onClick={() => setKeysOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
              >
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">API Keys</span>
                  <span className="text-slate-300">·</span>
                  各自で入力（任意）
                  <span className={`font-mono text-[10px] uppercase ${hasKeys ? "text-accent" : "text-slate-400"}`}>
                    {hasKeys ? "live" : "demo"}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">{keysOpen ? "− close" : "+ open"}</span>
              </button>
              {keysOpen && (
                <div className="space-y-3 border-t border-slate-100 p-3.5">
                  <p className="border-l-2 border-slate-300 bg-slate-50 py-1.5 pl-2.5 text-xs leading-relaxed text-slate-500">
                    ご自身の API キーを入力すると本物のWeb調査が有効になります。
                    <strong className="text-slate-700">キーはこのリクエストの実行にのみ使用し、サーバーには保存しません。</strong>
                  </p>
                  <label className="block">
                    <span className="label-mono">OpenAI API Key</span>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      autoComplete="off"
                      className={`mt-1 font-mono ${inputCls}`}
                    />
                  </label>
                  <label className="block">
                    <span className="label-mono">Tavily API Key（Web検索・任意）</span>
                    <input
                      type="password"
                      value={tavilyKey}
                      onChange={(e) => setTavilyKey(e.target.value)}
                      placeholder="tvly-..."
                      autoComplete="off"
                      className={`mt-1 font-mono ${inputCls}`}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    このブラウザに保存する
                  </label>
                  <p className="font-mono text-[10px] text-slate-400">
                    OpenAIのみ → 知識ベース生成 ／ OpenAI + Tavily → 実Web検索＋出典付き
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="font-mono text-[11px] text-slate-400">e.g.</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setTopic(ex);
                    runResearch(ex, focus);
                  }}
                  disabled={loading}
                  className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-slate-300 transition hover:border-teal-400 hover:text-white disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </form>

              <div className="mt-5 flex flex-wrap gap-2">
                {["登録不要", "デモは即動作", "出典付き（実検索時）"].map((b) => (
                  <span key={b} className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-white/10">{b}</span>
                ))}
              </div>
            </div>

            {/* 右：出力プレビュー（レポート） */}
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-teal-700">Report</span>
                  <span className="font-mono text-[10px] text-slate-400">中小企業向けAIチャットボット</span>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-600">市場は拡大基調。大手は機能網羅型、新興はUX特化型。中間層の“手軽さ×日本語精度”に参入機会。</p>
                <div className="mt-3">
                  <p className="font-display text-[11px] font-semibold text-slate-900">競合比較</p>
                  <div className="mt-1 space-y-1">
                    {[["大手A", "網羅 / 高価"], ["新興B", "UX / 実績薄"], ["特化C", "専門 / 小規模"]].map(([n, d]) => (
                      <div key={n} className="flex justify-between rounded bg-slate-50 px-2 py-1 text-[10px]"><span className="font-medium text-slate-700">{n}</span><span className="text-slate-500">{d}</span></div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1">
                  {[["S", "小回り"], ["W", "認知"], ["O", "AI需要"], ["T", "価格競争"]].map(([k, v]) => (
                    <div key={k} className="rounded bg-teal-50 px-2 py-1 text-[10px] text-teal-800"><span className="font-mono font-bold">{k}</span> {v}</div>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[9px] text-slate-400">出典 [1] [2] [3] ・ demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 本体（ライト）===== */}
      <main className="mx-auto max-w-5xl px-5 py-14">
        <div>
          {error && (
            <div className="border-l-2 border-accent bg-white px-4 py-3 text-sm text-accent">{error}</div>
          )}

          {loading && (
            <div className="space-y-4">
              <div className="h-28 animate-pulse bg-white" />
              <div className="h-48 animate-pulse bg-white" />
              <p className="bg-paper pt-3 text-center font-mono text-[11px] text-slate-400">
                planning → searching → synthesizing…
              </p>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="space-y-10">
              {/* メリット（「なぜ使うか」を先出し） */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ["自律実行で数分", "計画→検索→合成をエージェントが一気通貫。手作業の調査工数を圧縮"],
                  ["出典付きで検証可能", "実Web検索モードでは根拠URLを併記。結論を裏取りできる"],
                  ["登録不要・デモ即動作", "キー無しでデモ稼働。自分の OpenAI / Tavily キーで本物のWeb調査も"],
                ].map(([t, d]) => (
                  <div key={t} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="font-display text-sm font-semibold text-slate-900">{t}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{d}</p>
                  </div>
                ))}
              </div>

              {/* 使い方（プロトコル） */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="label-mono mb-4">使い方 — 3-step protocol</p>
                <ol className="divide-y divide-slate-100 border-t border-slate-100">
                  {[
                    ["01", "調査計画", "トピックを複数のサブクエリへ分解"],
                    ["02", "Web検索", "各クエリをツール実行で検索・収集"],
                    ["03", "レポート合成", "結果を統合し構造化レポートに"],
                  ].map(([n, t, d]) => (
                    <li key={n} className="flex gap-4 py-3">
                      <span className="index-serif text-base font-semibold">{n}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t}</p>
                        <p className="text-xs text-slate-500">{d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* レポートに含まれるもの */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="label-mono mb-4">レポートに含まれるもの</p>
                <div className="flex flex-wrap gap-2">
                  {["エグゼクティブサマリー", "競合比較表", "市場トレンド", "参入・成長の機会", "SWOT 分析", "推奨アクション", "出典リンク"].map((x) => (
                    <span key={x} className="border border-slate-200 px-2.5 py-1 text-xs text-slate-600">{x}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* 再実行・共有動線 */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setResult(null);
                    setTopic("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  ← 別のテーマで調査
                </button>
                <button
                  onClick={() => {
                    const r = result.report;
                    const text = [
                      `【市場リサーチ】${r.topic} ／ ${r.focus}`,
                      "",
                      r.summary,
                      "",
                      "■ 推奨アクション",
                      ...r.recommendations.map((x, i) => `${i + 1}. ${x.title}`),
                      "",
                      "— AI Research Agent (https://sotaro0000-research-agent.vercel.app)",
                    ].join("\n");
                    navigator.clipboard?.writeText(text).then(
                      () => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 2000);
                      },
                      () => {},
                    );
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {copied ? "コピーしました" : "要点をコピー"}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-5 py-3">
                <div>
                  <p className="label-mono">Subject</p>
                  <p className="font-display text-base font-semibold text-slate-900">
                    {result.report.topic}
                    <span className="ml-2 font-sans text-xs font-normal text-slate-400">／ {result.report.focus}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-[11px] uppercase ${MODE_BADGE[result.mode] ?? "text-slate-400"}`}>
                    {result.modeLabel}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400">{result.elapsedMs}ms</p>
                </div>
              </div>

              {result.mode === "demo" && (
                <div className="border-l-2 border-amber-300 bg-white px-4 py-3 text-xs text-amber-700">
                  デモモードです。上の「API Keys」にご自身の OpenAI / Tavily キーを入力すると、本物のWeb調査＋出典付きレポートになります。
                </div>
              )}

              <StepTimeline steps={result.steps} />
              <ReportView result={result} />
            </div>
          )}
        </div>
      </main>

      <footer className="mx-auto max-w-4xl px-5 pb-12 pt-6">
        <div className="border-t border-slate-300/70 pt-5 font-mono text-[11px] leading-relaxed text-slate-400">
          <p>AI Research Agent — autonomous market-research agent · Next.js / TypeScript / LLM</p>
          <p className="mt-1">APIキーは利用者が各自入力（BYOK）。未入力でもデモが動作します。</p>
        </div>
      </footer>
    </div>
  );
}
