import type { Plan } from "@/lib/plan/schema";

const severityLabel: Record<string, { text: string; color: string }> = {
  high: { text: "严重", color: "bg-red-50 text-red-900 border-red-200" },
  medium: { text: "警告", color: "bg-amber-50 text-amber-900 border-amber-200" },
  low: { text: "提示", color: "bg-blue-50 text-blue-900 border-blue-200" }
};

export function RiskPanel({ plan }: { plan: Plan }) {
  const totalMinutes = plan.tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const avgDaily = plan.tasks.length > 0 ? Math.round(totalMinutes / Math.max(1, new Set(plan.tasks.map(t => t.date)).size)) : 0;
  const completionRate = plan.tasks.filter((t) => t.status === "done").length / Math.max(1, plan.tasks.length);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">计划校验报告</h2>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-2xl font-bold text-slate-950">{plan.tasks.length}</p>
          <p className="text-xs text-slate-500">总任务数</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-2xl font-bold text-slate-950">{avgDaily}</p>
          <p className="text-xs text-slate-500">日均分钟</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-2xl font-bold text-teal-600">{Math.round(completionRate * 100)}%</p>
          <p className="text-xs text-slate-500">完成率</p>
        </div>
      </div>

      {plan.risks.length === 0 ? (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-center">
          <p className="text-sm font-medium text-green-800">计划校验通过，未发现风险。</p>
          <p className="mt-1 text-xs text-green-600">时间安排合理，任务量适中。</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {plan.risks.map((risk) => {
            const severity = severityLabel[risk.severity] ?? severityLabel.medium;
            return (
              <div key={`${risk.type}-${risk.message}`} className={`rounded-lg border p-3 ${severity.color}`}>
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-white/50">
                    {severity.text}
                  </span>
                  <span className="text-xs text-slate-500">{risk.type}</span>
                </div>
                <p className="mt-1 text-sm">{risk.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
