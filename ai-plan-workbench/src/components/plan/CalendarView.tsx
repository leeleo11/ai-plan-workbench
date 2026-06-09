import type { Plan, PlanTask } from "@/lib/plan/schema";

export function CalendarView({
  plan,
  onSelectTask,
  onAddTask,
  onMoveTask
}: {
  plan: Plan;
  onSelectTask: (task: PlanTask) => void;
  onAddTask?: (date: string) => void;
  onMoveTask?: (taskId: string, newDate: string) => void;
}) {
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
    <div className="comic-border-soft rounded-lg p-5">
      <h2 className="text-lg font-bold text-[var(--ink)]">打卡日历</h2>
      <p className="mb-5 mt-1 text-sm text-[var(--foreground)]">点击日期可添加规划，按住卡片可自由拖动到其他日期！</p>
      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[var(--foreground)]">
        {weekDays.map((day) => (
          <div key={day} className="rounded-md bg-[var(--paper)] py-2">
            周{day}
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((date) => {
              const tasks = tasksByDate[date] ?? [];
              const isInRange = dates.includes(date) || (date >= startDate.toISOString().split("T")[0] && date <= plan.goal.targetDate);
              
              return (
                <div
                  key={date}
                  onClick={() => onAddTask && onAddTask(date)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("ring-2", "ring-[var(--color-primary)]", "ring-opacity-50");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("ring-2", "ring-[var(--color-primary)]", "ring-opacity-50");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("ring-2", "ring-[var(--color-primary)]", "ring-opacity-50");
                    const taskId = e.dataTransfer.getData("text/plain");
                    if (taskId && onMoveTask) {
                      onMoveTask(taskId, date);
                    }
                  }}
                  className={`min-h-28 cursor-pointer rounded-lg border p-2.5 transition-all hover:shadow-sm ${
                    isInRange
                      ? "border-[var(--line)] bg-[var(--paper)]"
                      : "border-transparent bg-[var(--paper)]/30 opacity-50"
                  }`}
                >
                  <div className={`mb-2 text-xs font-semibold ${isInRange ? "text-[var(--ink)]" : "text-[var(--foreground)]/40"}`}>
                    {date.split("-")[2]}
                  </div>
                  <div className="grid gap-1.5">
                    {tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", task.id);
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        className="cursor-move truncate rounded-md border border-[var(--color-success)]/30 bg-[var(--color-success)]/80 px-2 py-1 text-left text-[10px] font-medium text-[var(--ink)] shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:cursor-grabbing"
                      >
                        {task.title}
                      </div>
                    ))}
                    {tasks.length > 3 ? (
                      <span className="text-[10px] font-medium text-[var(--foreground)]/60">还有 {tasks.length - 3} 张</span>
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
