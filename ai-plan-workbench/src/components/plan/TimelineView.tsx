import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Badge } from "@/components/ui/Badge";

export function TimelineView({ plan, onSelectTask }: { plan: Plan; onSelectTask: (task: PlanTask) => void }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="grid gap-3">
        {plan.tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task)}
            className="grid grid-cols-[120px_1fr_80px] items-center gap-3 rounded-md border border-slate-100 p-3 text-left hover:border-teal-400"
          >
            <span className="text-xs text-slate-500">{task.date}</span>
            <div>
              <p className="text-sm font-medium text-slate-950">{task.title}</p>
              <p className="text-xs text-slate-500">{task.durationMinutes} min</p>
            </div>
            <Badge>{task.priority}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
