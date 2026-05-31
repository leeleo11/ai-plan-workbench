import type { Plan } from "@/lib/plan/schema";

export function RiskPanel({ plan }: { plan: Plan }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">Risks</h2>
      {plan.risks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No validation risks detected.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {plan.risks.map((risk) => (
            <div key={`${risk.type}-${risk.message}`} className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              {risk.message}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
