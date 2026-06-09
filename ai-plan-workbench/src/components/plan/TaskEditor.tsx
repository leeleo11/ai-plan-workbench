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
  review: "复盘",
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
      <aside className="comic-border-soft rounded-lg p-4">
        <h2 className="text-base font-black text-[var(--ink)]">任务小纸条</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          点左边任意一张任务卡或者日历上的日期，这里就能改标题、日期、时长和状态。
        </p>
      </aside>
    );
  }

  return (
    <aside className="comic-border-soft rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-[var(--ink)]">改这张任务卡</h2>
        <button className="text-sm font-black text-stone-500 hover:text-[var(--berry)]" onClick={onClose}>
          收起
        </button>
      </div>

      <label className="mt-4 block text-xs font-black text-stone-600">关卡名称</label>
      <input
        className="mt-1 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-bold text-[var(--ink)] outline-none focus:bg-white"
        value={task.title}
        onChange={(event) => onChange({ ...task, title: event.target.value, source: "user_edited" })}
      />

      <label className="mt-3 block text-xs font-black text-stone-600">任务说明</label>
      <textarea
        className="mt-1 min-h-24 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-bold text-[var(--ink)] outline-none focus:bg-white"
        value={task.description ?? ""}
        onChange={(event) => onChange({ ...task, description: event.target.value || undefined, source: "user_edited" })}
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-stone-600">挑战日期</label>
          <input
            className="mt-1 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-bold outline-none focus:bg-white"
            type="date"
            value={task.date}
            onChange={(event) => onChange({ ...task, date: event.target.value, source: "user_edited" })}
          />
        </div>
        <div>
          <label className="block text-xs font-black text-stone-600">预计用时</label>
          <input
            className="mt-1 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-bold outline-none focus:bg-white"
            type="number"
            value={task.durationMinutes}
            onChange={(event) => onChange({ ...task, durationMinutes: Number(event.target.value), source: "user_edited" })}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-stone-600">任务类型</label>
          <span className="mt-1 inline-flex rounded-full border-2 border-[var(--line)] bg-[var(--mint)] px-3 py-1 text-xs font-black">
            {categoryLabel[task.category] ?? task.category}
          </span>
        </div>
        <div>
          <label className="block text-xs font-black text-stone-600">当前状态</label>
          <select
            className="mt-1 w-full rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-bold outline-none focus:bg-white"
            value={task.status}
            onChange={(event) => onChange({ ...task, status: event.target.value as PlanTask["status"], source: "user_edited" })}
          >
            <option value="todo">待挑战</option>
            <option value="done">已通关</option>
            <option value="skipped">先跳过</option>
            <option value="delayed">延期中</option>
          </select>
        </div>
      </div>

      <Button className="mt-4 w-full" onClick={onClose}>
        保存这张卡
      </Button>
    </aside>
  );
}
