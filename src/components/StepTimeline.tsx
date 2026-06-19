// エージェントの実行ステップ（計画→検索→合成）を「調査プロトコル」として表示する。
import type { AgentStep } from "@/lib/types";

const PHASE_LABEL: Record<AgentStep["phase"], string> = {
  plan: "PLAN",
  search: "SEARCH",
  synthesize: "SYNTHESIZE",
};

export default function StepTimeline({ steps }: { steps: AgentStep[] }) {
  if (!steps.length) return null;
  return (
    <section className="border border-stone-200 bg-white p-6">
      <p className="label-mono mb-4">Research Protocol</p>
      <ol className="divide-y divide-stone-100 border-t border-stone-100">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4 py-3">
            <span className="index-serif mt-0.5 text-base font-semibold tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="text-sm font-medium text-stone-900">{s.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                  {PHASE_LABEL[s.phase]}
                </span>
                {typeof s.hits === "number" && (
                  <span className="font-mono text-[10px] text-stone-400">{s.hits} hits</span>
                )}
              </div>
              {s.query && <p className="mt-0.5 font-mono text-xs text-stone-500">&ldquo;{s.query}&rdquo;</p>}
              {s.detail && <p className="mt-0.5 text-xs text-stone-400">{s.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
