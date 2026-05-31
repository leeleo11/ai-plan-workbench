import type { Plan, PlanTask } from "@/lib/plan/schema";

export function CalendarView({ plan, onSelectTask }: { plan: Plan; onSelectTask: (task: PlanTask) => void }) {
  const tasksByDate = plan.tasks.reduce<Record<string, PlanTask[]>>((acc, task) => {
    acc[task.date] = [...(acc[task.date] ?? []), task];
    return acc;
  }, {});

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Object.entries(tasksByDate).map(([date, tasks]) => (
        <div key={date} className="min-h-36 rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-950">{date}</h3>
          <div className="mt-2 grid gap-2">
            {tasks.map((task) => (
              <button key={task.id} onClick={() => onSelectTask(task)} className="rounded bg-slate-50 p-2 text-left text-xs text-slate-700 hover:bg-teal-50">
                {task.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
