// エージェントの実行ステップ（計画→検索→合成）をタイムライン表示する。
import type { AgentStep } from "@/lib/types";

const PHASE_META: Record<AgentStep["phase"], { icon: string; color: string; label: string }> = {
  plan: { icon: "①", color: "bg-agent-500", label: "計画" },
  search: { icon: "②", color: "bg-blue-500", label: "検索" },
  synthesize: { icon: "③", color: "bg-purple-500", label: "合成" },
};

export default function StepTimeline({ steps }: { steps: AgentStep[] }) {
  if (!steps.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">エージェントの実行ステップ</h3>
      <ol className="relative space-y-4 border-l border-slate-200 pl-6">
        {steps.map((s, i) => {
          const meta = PHASE_META[s.phase];
          return (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${meta.color}`}
              >
                {meta.icon}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{s.label}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{meta.label}</span>
                {typeof s.hits === "number" && (
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">{s.hits}件取得</span>
                )}
              </div>
              {s.query && <p className="mt-0.5 text-xs text-slate-500">🔎 「{s.query}」</p>}
              {s.detail && <p className="mt-0.5 text-xs text-slate-400">{s.detail}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
