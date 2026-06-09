import type { Plan } from "./schema";

export type ExecutionStats = {
  doneCount: number;
  todoCount: number;
  delayedCount: number;
  skippedCount: number;
  progress: number;
  completedDays: number;
  currentStreak: number;
};

export function getExecutionStats(plan: Plan): ExecutionStats {
  const doneCount = plan.tasks.filter((task) => task.status === "done").length;
  const todoCount = plan.tasks.filter((task) => task.status === "todo").length;
  const delayedCount = plan.tasks.filter((task) => task.status === "delayed").length;
  const skippedCount = plan.tasks.filter((task) => task.status === "skipped").length;
  const progress = Math.round((doneCount / Math.max(1, plan.tasks.length)) * 100);

  const tasksByDate = new Map<string, typeof plan.tasks>();
  for (const task of plan.tasks) {
    tasksByDate.set(task.date, [...(tasksByDate.get(task.date) ?? []), task]);
  }

  const orderedDates = [...tasksByDate.keys()].sort();
  const completedDays = orderedDates.filter((date) => tasksByDate.get(date)?.every((task) => task.status === "done")).length;
  let currentStreak = 0;
  for (const date of orderedDates) {
    const tasks = tasksByDate.get(date) ?? [];
    if (tasks.length > 0 && tasks.every((task) => task.status === "done")) currentStreak += 1;
    else break;
  }

  return {
    doneCount,
    todoCount,
    delayedCount,
    skippedCount,
    progress,
    completedDays,
    currentStreak
  };
}
