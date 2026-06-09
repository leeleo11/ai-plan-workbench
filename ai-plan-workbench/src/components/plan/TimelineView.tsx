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
    <div className="comic-border-soft rounded-lg bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)]">闯关时间线</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]">每天不是表格行，是一组小关卡。</p>
        </div>
        <span className="rounded-lg border border-[var(--peach)]/30 bg-[var(--peach)]/80 px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
          点卡片可编辑
        </span>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 ${
              filter === option.value
                ? "border-[var(--color-info)]/30 bg-[var(--color-info)] text-[var(--ink)] shadow-md"
                : "border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--color-info)]/20 hover:bg-[var(--color-info)]/10"
            }`}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="grid gap-6">
        {Object.entries(tasksByDate).length === 0 ? (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--cream)] p-6 text-center text-sm font-medium text-[var(--foreground)]">
            这个筛选里暂时没有任务卡。
          </div>
        ) : null}
        {Object.entries(tasksByDate).map(([date, tasks]) => (
          <div key={date} className="relative pl-6">
            <div className="absolute bottom-0 left-2 top-7 w-px bg-gradient-to-b from-[var(--line)] to-transparent" />
            <h3 className="mb-4 inline-flex rounded-full border border-[var(--color-info)]/30 bg-[var(--color-info)]/90 px-3.5 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-sm">
              {date}
            </h3>
            <div className="grid gap-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`group relative rounded-lg border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                    task.status === "done"
                      ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/20"
                      : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--color-info)]/30"
                  }`}
                >
                  <span className="absolute -left-5 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/90 text-xs font-semibold text-[var(--ink)] shadow-sm">
                    {index + 1}
                  </span>
                  <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                    <button className="min-w-0 flex-1 text-left" onClick={() => onSelectTask(task)}>
                      <p className="text-sm font-semibold text-[var(--ink)]">{task.title}</p>
                      {task.description ? (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--foreground)]">
                          {task.description}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs font-medium text-[var(--foreground)]/80">
                        {task.durationMinutes} 分钟 · {categoryLabel[task.category] ?? task.category}
                      </p>
                    </button>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge>{task.status === "done" ? "已打卡" : priorityLabel[task.priority] ?? task.priority}</Badge>
                      <span className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--foreground)]">
                        {statusLabel[task.status] ?? task.status}
                      </span>
                      <button
                        className="rounded-full border border-black/10 bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-sm transition-all duration-200 hover:brightness-95 hover:shadow-md"
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
