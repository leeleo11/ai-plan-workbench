import type { PlanTask } from "@/lib/plan/schema";
import { Button } from "@/components/ui/Button";

type TaskEditorProps = {
  task: PlanTask | null;
  onChange: (task: PlanTask) => void;
  onClose: () => void;
};

const categoryLabel: Record<string, string> = {
  vocabulary: "词汇",
  listening: "听力",
  reading: "阅读",
  writing: "写作",
  speaking: "口语",
  mock_test: "模考",
  review: "复习",
  grammar: "语法",
  translation: "翻译",
  past_paper: "真题",
  concept: "概念",
  practice: "练习",
  project: "项目"
};

export function TaskEditor({ task, onChange, onClose }: TaskEditorProps) {
  if (!task) {
    return (
      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-400">点击任务卡片进行编辑</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-950">编辑任务</h2>
        <button className="text-sm text-slate-400 hover:text-slate-600" onClick={onClose}>关闭</button>
      </div>

      <label className="mt-4 block text-xs font-medium text-slate-500">任务名称</label>
      <input
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
        value={task.title}
        onChange={(event) => onChange({ ...task, title: event.target.value, source: "user_edited" })}
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500">日期</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            type="date"
            value={task.date}
            onChange={(event) => onChange({ ...task, date: event.target.value, source: "user_edited" })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">时长（分钟）</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            type="number"
            value={task.durationMinutes}
            onChange={(event) => onChange({ ...task, durationMinutes: Number(event.target.value), source: "user_edited" })}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500">类别</label>
          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {categoryLabel[task.category] ?? task.category}
          </span>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">状态</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            value={task.status}
            onChange={(event) => onChange({ ...task, status: event.target.value as PlanTask["status"], source: "user_edited" })}
          >
            <option value="todo">待完成</option>
            <option value="done">已完成</option>
            <option value="skipped">已跳过</option>
            <option value="delayed">已延期</option>
          </select>
        </div>
      </div>

      <Button className="mt-4 w-full" onClick={onClose}>完成编辑</Button>
    </aside>
  );
}
