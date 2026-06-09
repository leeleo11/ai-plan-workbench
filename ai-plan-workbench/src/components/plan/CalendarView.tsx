import type { Plan, PlanTask } from "@/lib/plan/schema";

export function CalendarView({ plan, onSelectTask }: { plan: Plan; onSelectTask: (task: PlanTask) => void }) {
  const tasksByDate = plan.tasks.reduce<Record<string, PlanTask[]>>((acc, task) => {
    acc[task.date] = [...(acc[task.date] ?? []), task];
    return acc;
  }, {});

  const dates = Object.keys(tasksByDate).sort();
  const firstDate = new Date(dates[0] ?? plan.goal.targetDate);
  const dayOfWeek = firstDate.getDay();
  const startDate = new Date(firstDate);
  startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const weeks: string[][] = [];
  const current = new Date(startDate);
  for (let w = 0; w < 12; w += 1) {
    const week: string[] = [];
    for (let d = 0; d < 7; d += 1) {
      week.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  return (
    <div className="comic-border-soft rounded-lg bg-white p-4">
      <h2 className="text-base font-black text-[var(--ink)]">打卡日历</h2>
      <p className="mb-4 mt-1 text-xs font-semibold text-stone-600">把每天的小关卡贴到日历上，完成感会更强。</p>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-black text-[var(--ink)]">
        {weekDays.map((day) => (
          <div key={day} className="rounded-md border-2 border-[var(--line)] bg-[var(--sun)] py-1">
            周{day}
          </div>
        ))}
      </div>
      <div className="grid gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date) => {
              const tasks = tasksByDate[date] ?? [];
              const isInRange = dates.includes(date);
              return (
                <div
                  key={date}
                  className={`min-h-24 rounded-lg border-2 p-1.5 ${
                    isInRange ? "border-[var(--line)] bg-[var(--paper)]" : "border-stone-200 bg-white/50"
                  }`}
                >
                  <div className={`text-xs font-black ${isInRange ? "text-[var(--ink)]" : "text-stone-300"}`}>
                    {date.split("-")[2]}
                  </div>
                  <div className="mt-1 grid gap-1">
                    {tasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="truncate rounded-md border border-[var(--line)] bg-[var(--mint)] px-1 py-0.5 text-left text-[10px] font-black text-[var(--ink)] hover:bg-[var(--sky)]"
                      >
                        {task.title}
                      </button>
                    ))}
                    {tasks.length > 3 ? (
                      <span className="text-[10px] font-black text-stone-500">还有 {tasks.length - 3} 张</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
