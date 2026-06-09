import type { Plan } from "@/lib/plan/schema";
import { assessPlanQuality } from "@/lib/plan/quality";

const severityLabel: Record<string, { text: string; color: string }> = {
  high: { text: "重点批注", color: "bg-red-50 text-red-900" },
  medium: { text: "小心超载", color: "bg-amber-50 text-amber-900" },
  low: { text: "温柔提醒", color: "bg-blue-50 text-blue-900" }
};

export function RiskPanel({ plan, onUseAction }: { plan: Plan; onUseAction?: (instruction: string) => void }) {
  const quality = assessPlanQuality(plan);
  const completionRate = plan.tasks.filter((task) => task.status === "done").length / Math.max(1, plan.tasks.length);
  const aiTaskPercent = Math.round(quality.aiTaskRatio * 100);

  return (
    <section className="comic-border-soft rounded-lg bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--ink)]">老师批注报告</h2>
          <p className="mt-1 text-xs font-semibold text-stone-600">不是吓你，是帮你判断这份计划能不能真的执行。</p>
        </div>
        <div className="rounded-lg border-2 border-[var(--line)] bg-[var(--sun)] px-4 py-2 text-center shadow-[2px_2px_0_var(--line)]">
          <p className="text-2xl font-black text-[var(--ink)]">{quality.score}</p>
          <p className="text-xs font-black text-stone-700">{quality.label}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border-2 border-[var(--line)] bg-[var(--sun)] p-3 text-center">
          <p className="text-2xl font-black text-[var(--ink)]">{plan.tasks.length}</p>
          <p className="text-xs font-black text-stone-700">任务卡</p>
        </div>
        <div className="rounded-lg border-2 border-[var(--line)] bg-[var(--sky)] p-3 text-center">
          <p className="text-2xl font-black text-[var(--ink)]">{quality.averageDailyMinutes}</p>
          <p className="text-xs font-black text-stone-700">日均分钟</p>
        </div>
        <div className="rounded-lg border-2 border-[var(--line)] bg-[var(--mint)] p-3 text-center">
          <p className="text-2xl font-black text-[var(--ink)]">{Math.round(completionRate * 100)}%</p>
          <p className="text-xs font-black text-stone-700">通关率</p>
        </div>
        <div className="rounded-lg border-2 border-[var(--line)] bg-[var(--peach)] p-3 text-center">
          <p className="text-2xl font-black text-[var(--ink)]">{aiTaskPercent}%</p>
          <p className="text-xs font-black text-stone-700">AI任务</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-black text-[var(--ink)]">执行建议</h3>
          <span className="rounded-full border-2 border-[var(--line)] bg-white px-2 py-0.5 text-xs font-black">
            峰值 {quality.maxDailyMinutes} 分钟 / {quality.activeDays} 天
          </span>
        </div>
        <ul className="mt-3 grid gap-2 text-sm font-bold leading-6 text-stone-700">
          {quality.recommendations.map((item) => (
            <li key={item} className="rounded-md bg-white px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-lg border-2 border-[var(--line)] bg-white p-4">
        <h3 className="text-sm font-black text-[var(--ink)]">下一步动作</h3>
        <div className="mt-3 grid gap-2">
          {quality.actions.map((action) => (
            <div key={action.label} className="rounded-lg bg-[var(--cream)] p-3">
              <p className="text-xs font-black text-[var(--berry)]">{action.label}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-stone-700">{action.instruction}</p>
              {onUseAction ? (
                <button
                  className="mt-2 rounded-full border-2 border-[var(--line)] bg-white px-3 py-1 text-xs font-black shadow-[2px_2px_0_var(--line)]"
                  onClick={() => onUseAction(action.instruction)}
                >
                  使用动作
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {plan.risks.length === 0 ? (
        <div className="mt-4 rounded-lg border-2 border-[var(--line)] bg-[var(--mint)] p-4 text-center">
          <p className="text-sm font-black text-[var(--ink)]">这份计划暂时没有明显风险。</p>
          <p className="mt-1 text-xs font-bold text-stone-700">时间安排和任务量看起来都能扛住。</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {plan.risks.map((risk) => {
            const severity = severityLabel[risk.severity] ?? severityLabel.medium;
            return (
              <div key={`${risk.type}-${risk.message}`} className={`rounded-lg border-2 border-[var(--line)] p-3 ${severity.color}`}>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--line)] bg-white px-2 py-0.5 text-[10px] font-black">
                    {severity.text}
                  </span>
                  <span className="text-xs font-black text-stone-500">{risk.type}</span>
                </div>
                <p className="mt-2 text-sm font-bold">{risk.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
