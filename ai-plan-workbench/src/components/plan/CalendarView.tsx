import type { Plan, PlanTask } from "@/lib/plan/schema";

export function CalendarView({ plan, onSelectTask }: { plan: Plan; onSelectTask: (task: PlanTask) => void }) {
  const tasksByDate = plan.tasks.reduce<Record<string, PlanTask[]>>((acc, task) => {
    acc[task.date] = [...(acc[task.date] ?? []), task];
    return acc;
  }, {});

  const dates = Object.keys(tasksByDate).sort();

  // Find the Monday of the first week
  const firstDate = new Date(dates[0] ?? Date.now());
  const dayOfWeek = firstDate.getDay();
  const startDate = new Date(firstDate);
  startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  // Generate 12 weeks of dates
  const weeks: string[][] = [];
  const current = new Date(startDate);
  for (let w = 0; w < 12; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split("T")[0];
      week.push(dateStr);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-slate-500 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="py-1">周{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-px mb-1">
          {week.map((date) => {
            const tasks = tasksByDate[date] ?? [];
            const isInRange = dates.includes(date);
            return (
              <div
                key={date}
                className={`min-h-20 rounded-lg border p-1.5 ${
                  isInRange ? "border-slate-200 bg-white" : "border-transparent bg-slate-50/50"
                }`}
              >
                <div className={`text-xs ${isInRange ? "text-slate-700 font-medium" : "text-slate-300"}`}>
                  {date.split("-")[2]}
                </div>
                <div className="mt-1 grid gap-0.5">
                  {tasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="rounded bg-teal-50 px-1 py-0.5 text-left text-[10px] text-teal-800 hover:bg-teal-100 truncate"
                    >
                      {task.title.slice(0, 10)}
                    </button>
                  ))}
                  {tasks.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{tasks.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
