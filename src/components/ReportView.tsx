// 調査レポート本体を「ドキュメント／レポート」体裁で表示する。
import type { ResearchResult } from "@/lib/types";

let sectionNo = 0;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  sectionNo += 1;
  const no = String(sectionNo).padStart(2, "0");
  return (
    <section className="border border-stone-200 bg-white p-6 sm:p-7">
      <h3 className="mb-4 flex items-baseline gap-3 border-b border-stone-100 pb-3 font-display text-lg font-semibold text-stone-900">
        <span className="index-serif text-base">{no}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-xs text-stone-400">—</p>;
  return (
    <ul className="space-y-2">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-stone-700">
          <span className="mt-2 h-px w-3 flex-none bg-wine/60" />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReportView({ result }: { result: ResearchResult }) {
  const r = result.report;
  sectionNo = 0; // レンダリングごとに採番リセット
  return (
    <div className="animate-fade-up space-y-px bg-stone-200">
      <Section title="エグゼクティブサマリー">
        <p className="font-display text-[15px] leading-relaxed text-stone-700">{r.summary}</p>
      </Section>

      {r.competitors.length > 0 && (
        <Section title={`競合分析　—　${r.competitors.length} 社`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-stone-200 text-left align-bottom">
                  <th className="label-mono py-2 pr-4 font-normal">企業</th>
                  <th className="label-mono py-2 pr-4 font-normal">概要</th>
                  <th className="label-mono py-2 pr-4 font-normal">強み</th>
                  <th className="label-mono py-2 font-normal">弱み</th>
                </tr>
              </thead>
              <tbody>
                {r.competitors.map((c, i) => (
                  <tr key={i} className="border-b border-stone-100 align-top">
                    <td className="py-3 pr-4 font-medium text-stone-900">{c.name}</td>
                    <td className="py-3 pr-4 text-stone-600">{c.description}</td>
                    <td className="py-3 pr-4 text-stone-600">{c.strengths}</td>
                    <td className="py-3 text-stone-600">{c.weaknesses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <div className="grid gap-px bg-stone-200 md:grid-cols-2">
        <Section title="市場トレンド">
          <List items={r.trends} />
        </Section>
        <Section title="参入・成長の機会">
          <List items={r.opportunities} />
        </Section>
      </div>

      <Section title="SWOT 分析">
        <div className="grid grid-cols-1 gap-px bg-stone-200 sm:grid-cols-2">
          {[
            { k: "Strengths", jp: "強み", items: r.swot.strengths },
            { k: "Weaknesses", jp: "弱み", items: r.swot.weaknesses },
            { k: "Opportunities", jp: "機会", items: r.swot.opportunities },
            { k: "Threats", jp: "脅威", items: r.swot.threats },
          ].map((q) => (
            <div key={q.k} className="bg-white p-4">
              <p className="mb-2 font-display text-sm font-semibold text-stone-900">
                {q.k} <span className="text-xs font-normal text-stone-400">／ {q.jp}</span>
              </p>
              <List items={q.items} />
            </div>
          ))}
        </div>
      </Section>

      {r.recommendations.length > 0 && (
        <Section title="推奨アクション">
          <ol className="divide-y divide-stone-100 border-t border-stone-100">
            {r.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-4 py-3">
                <span className="index-serif text-base font-semibold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-sm font-medium text-stone-900">{rec.title}</p>
                  <p className="text-xs leading-relaxed text-stone-500">{rec.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {r.sources.length > 0 && (
        <Section title={`出典　—　${r.sources.length} 件`}>
          <ol className="space-y-1.5">
            {r.sources.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="font-mono text-[11px] text-stone-400">[{i + 1}]</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="break-all text-wine underline-offset-2 hover:underline"
                >
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
