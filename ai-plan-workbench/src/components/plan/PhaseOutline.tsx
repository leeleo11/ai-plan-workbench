import type { Plan } from "@/lib/plan/schema";

export function PhaseOutline({ plan }: { plan: Plan }) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">学习阶段</h2>
      <div className="mt-4 grid gap-3">
        {plan.phases.map((phase, index) => (
          <div key={phase.id} className="border-l-2 border-teal-500 pl-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-xs font-medium text-teal-700">
                {index + 1}
              </span>
              <h3 className="text-sm font-medium text-slate-950">{phase.title}</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">{phase.startDate} 至 {phase.endDate}</p>
            <p className="mt-1 text-xs text-slate-600">{phase.objective}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
