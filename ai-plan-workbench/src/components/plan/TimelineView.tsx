import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Badge } from "@/components/ui/Badge";

const priorityLabel: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低"
};

const statusIcon: Record<string, string> = {
  todo: "○",
  done: "✓",
  skipped: "→",
  delayed: "⏱"
};

export function TimelineView({ plan, onSelectTask }: { plan: Plan; onSelectTask: (task: PlanTask) => void }) {
  const tasksByDate = plan.tasks.reduce<Record<string, PlanTask[]>>((acc, task) => {
    acc[task.date] = [...(acc[task.date] ?? []), task];
    return acc;
  }, {});

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4">
        {Object.entries(tasksByDate).map(([date, tasks]) => (
          <div key={date}>
            <h3 className="mb-2 text-xs font-semibold text-slate-500">{date}</h3>
            <div className="grid gap-2">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="grid grid-cols-[20px_1fr_60px_40px] items-center gap-3 rounded-lg border border-slate-100 p-3 text-left transition hover:border-teal-400 hover:bg-teal-50/50"
                >
                  <span className="text-sm text-slate-400">{statusIcon[task.status] ?? "○"}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-950">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.durationMinutes} 分钟 · {task.category}</p>
                  </div>
                  <Badge>{priorityLabel[task.priority] ?? task.priority}</Badge>
                  <span className="text-xs text-slate-400">{task.source === "user_edited" ? "已编辑" : ""}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
