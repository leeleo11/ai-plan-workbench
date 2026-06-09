import type { Plan } from "@/lib/plan/schema";

export function PhaseOutline({ plan }: { plan: Plan }) {
  return (
    <aside className="comic-border-soft rounded-lg bg-white p-4">
      <h2 className="text-base font-black text-[var(--ink)]">路线关卡</h2>
      <p className="mt-1 text-xs font-semibold text-stone-600">先看大地图，再打小任务。</p>
      <div className="mt-4 grid gap-3">
        {plan.phases.map((phase, index) => (
          <div key={phase.id} className="relative rounded-lg border-2 border-[var(--line)] bg-[var(--cream)] p-3">
            <span className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--line)] bg-[var(--sun)] text-xs font-black">
              {index + 1}
            </span>
            <h3 className="pl-5 text-sm font-black text-[var(--ink)]">{phase.title}</h3>
            <p className="mt-2 rounded-md bg-white px-2 py-1 text-xs font-bold text-stone-600">
              {phase.startDate} 到 {phase.endDate}
            </p>
            <p className="mt-2 text-xs font-semibold leading-5 text-stone-700">{phase.objective}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
