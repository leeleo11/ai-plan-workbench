import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";

const priorityLabel: Record<string, string> = {
  high: "主线",
  medium: "支线",
  low: "轻松"
};

const statusLabel: Record<string, string> = {
  todo: "待挑战",
  done: "已通关",
  skipped: "先跳过",
  delayed: "延期中"
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

type TaskFilter = "all" | "todo" | "done" | "delayed";

const filterOptions: Array<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "todo", label: "待挑战" },
  { value: "done", label: "已通关" },
  { value: "delayed", label: "延期" }
];

export function TimelineView({
  plan,
  onSelectTask,
  onToggleTaskStatus
}: {
  plan: Plan;
  onSelectTask: (task: PlanTask) => void;
  onToggleTaskStatus: (task: PlanTask) => void;
}) {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const filteredTasks = plan.tasks.filter((task) => filter === "all" || task.status === filter);
  const tasksByDate = filteredTasks.reduce<Record<string, PlanTask[]>>((acc, task) => {
    acc[task.date] = [...(acc[task.date] ?? []), task];
    return acc;
  }, {});

  return (
    <div className="comic-border-soft rounded-lg bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[var(--ink)]">闯关时间线</h2>
          <p className="text-xs font-semibold text-stone-600">每天不是表格行，是一组小关卡。</p>
        </div>
        <span className="rounded-lg border-2 border-[var(--line)] bg-[var(--peach)] px-3 py-1 text-xs font-black">
          点卡片可编辑
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            className={`rounded-full border-2 border-[var(--line)] px-3 py-1 text-xs font-black shadow-[2px_2px_0_var(--line)] ${
              filter === option.value ? "bg-[var(--sky)] text-[var(--ink)]" : "bg-white text-stone-600"
            }`}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="grid gap-5">
        {Object.entries(tasksByDate).length === 0 ? (
          <div className="rounded-lg border-2 border-[var(--line)] bg-[var(--cream)] p-4 text-center text-sm font-black text-[var(--ink)]">
            这个筛选里暂时没有任务卡。
          </div>
        ) : null}
        {Object.entries(tasksByDate).map(([date, tasks]) => (
          <div key={date} className="relative pl-5">
            <div className="absolute bottom-0 left-1 top-6 w-0.5 bg-[var(--line)]" />
            <h3 className="mb-3 inline-flex rounded-full border-2 border-[var(--line)] bg-[var(--sky)] px-3 py-1 text-xs font-black">
              {date}
            </h3>
            <div className="grid gap-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`group relative rounded-lg border-2 border-[var(--line)] p-4 text-left shadow-[3px_3px_0_var(--line)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[5px_5px_0_var(--line)] ${
                    task.status === "done" ? "bg-[var(--mint)]" : "bg-[var(--paper)]"
                  }`}
                >
                  <span className="absolute -left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--line)] bg-[var(--sun)] text-xs font-black">
                    {index + 1}
                  </span>
                  <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                    <button className="min-w-0 flex-1 text-left" onClick={() => onSelectTask(task)}>
                      <p className="text-sm font-black text-[var(--ink)]">{task.title}</p>
                      {task.description ? (
                        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-stone-600">
                          {task.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs font-bold text-stone-600">
                        {task.durationMinutes} 分钟 · {categoryLabel[task.category] ?? task.category}
                      </p>
                    </button>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge>{task.status === "done" ? "已打卡" : priorityLabel[task.priority] ?? task.priority}</Badge>
                      <span className="rounded-full border-2 border-[var(--line)] bg-white px-2 py-0.5 text-xs font-black">
                        {statusLabel[task.status] ?? task.status}
                      </span>
                      <button
                        className="rounded-full border-2 border-[var(--line)] bg-[var(--sun)] px-3 py-1 text-xs font-black text-[var(--ink)] shadow-[2px_2px_0_var(--line)] transition hover:bg-[var(--orange)]"
                        onClick={() => onToggleTaskStatus(task)}
                      >
                        {task.status === "done" ? "撤销打卡" : "打卡通关"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
