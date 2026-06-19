// 調査レポート本体の表示。
import type { ResearchResult } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-bold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

function Chips({ items, color }: { items: string[]; color: string }) {
  if (!items.length) return <p className="text-xs text-slate-400">—</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2 text-sm text-slate-600">
          <span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${color}`} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReportView({ result }: { result: ResearchResult }) {
  const r = result.report;
  return (
    <div className="animate-fade-up space-y-5">
      {/* 概要 */}
      <Section title="エグゼクティブサマリー">
        <p className="text-sm leading-relaxed text-slate-700">{r.summary}</p>
      </Section>

      {/* 競合 */}
      {r.competitors.length > 0 && (
        <Section title={`競合分析（${r.competitors.length}社）`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                  <th className="py-2 pr-3 font-medium">企業</th>
                  <th className="py-2 pr-3 font-medium">概要</th>
                  <th className="py-2 pr-3 font-medium text-green-600">強み</th>
                  <th className="py-2 font-medium text-red-500">弱み</th>
                </tr>
              </thead>
              <tbody>
                {r.competitors.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-3 font-semibold text-slate-800">{c.name}</td>
                    <td className="py-2 pr-3 text-slate-600">{c.description}</td>
                    <td className="py-2 pr-3 text-slate-600">{c.strengths}</td>
                    <td className="py-2 text-slate-600">{c.weaknesses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* トレンド */}
        <Section title="市場トレンド">
          <Chips items={r.trends} color="bg-blue-500" />
        </Section>
        {/* 機会 */}
        <Section title="参入・成長の機会">
          <Chips items={r.opportunities} color="bg-agent-500" />
        </Section>
      </div>

      {/* SWOT */}
      <Section title="SWOT 分析">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-green-50 p-3">
            <p className="mb-1 text-xs font-bold text-green-700">Strengths（強み）</p>
            <Chips items={r.swot.strengths} color="bg-green-500" />
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="mb-1 text-xs font-bold text-red-600">Weaknesses（弱み）</p>
            <Chips items={r.swot.weaknesses} color="bg-red-400" />
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="mb-1 text-xs font-bold text-blue-700">Opportunities（機会）</p>
            <Chips items={r.swot.opportunities} color="bg-blue-500" />
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="mb-1 text-xs font-bold text-amber-700">Threats（脅威）</p>
            <Chips items={r.swot.threats} color="bg-amber-500" />
          </div>
        </div>
      </Section>

      {/* 推奨アクション */}
      {r.recommendations.length > 0 && (
        <Section title="推奨アクション">
          <ol className="space-y-2">
            {r.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-agent-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{rec.title}</p>
                  <p className="text-xs text-slate-600">{rec.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* 出典 */}
      {r.sources.length > 0 && (
        <Section title={`出典（${r.sources.length}件）`}>
          <ul className="space-y-1.5">
            {r.sources.map((s, i) => (
              <li key={i} className="text-sm">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="break-all text-agent-700 hover:underline"
                >
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
