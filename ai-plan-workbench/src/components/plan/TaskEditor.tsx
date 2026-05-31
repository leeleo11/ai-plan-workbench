import type { PlanTask } from "@/lib/plan/schema";
import { Button } from "@/components/ui/Button";

type TaskEditorProps = {
  task: PlanTask | null;
  onChange: (task: PlanTask) => void;
  onClose: () => void;
};

export function TaskEditor({ task, onChange, onClose }: TaskEditorProps) {
  if (!task) {
    return (
      <aside className="rounded-md border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">Select a task to edit.</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-950">Task editor</h2>
        <button className="text-sm text-slate-500" onClick={onClose}>Close</button>
      </div>
      <label className="mt-4 block text-xs font-medium text-slate-500">Title</label>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={task.title}
        onChange={(event) => onChange({ ...task, title: event.target.value, source: "user_edited" })}
      />
      <label className="mt-4 block text-xs font-medium text-slate-500">Date</label>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        type="date"
        value={task.date}
        onChange={(event) => onChange({ ...task, date: event.target.value, source: "user_edited" })}
      />
      <label className="mt-4 block text-xs font-medium text-slate-500">Duration</label>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        type="number"
        value={task.durationMinutes}
        onChange={(event) => onChange({ ...task, durationMinutes: Number(event.target.value), source: "user_edited" })}
      />
      <Button className="mt-4 w-full" onClick={onClose}>Done</Button>
    </aside>
  );
}
