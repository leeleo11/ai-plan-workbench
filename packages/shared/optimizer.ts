import type { Plan } from "./schema";

export type PlanDiffSummary = {
  changedTasks: number;
  addedTasks: number;
  removedTasks: number;
  summary: string;
};

export function summarizePlanDiff(previous: Plan, next: Plan): PlanDiffSummary {
  const previousById = new Map(previous.tasks.map((task) => [task.id, task]));
  const nextById = new Map(next.tasks.map((task) => [task.id, task]));

  const changedTasks = next.tasks.filter((task) => {
    const before = previousById.get(task.id);
    return before && JSON.stringify(before) !== JSON.stringify(task);
  }).length;

  const addedTasks = next.tasks.filter((task) => !previousById.has(task.id)).length;
  const removedTasks = previous.tasks.filter((task) => !nextById.has(task.id)).length;

  return {
    changedTasks,
    addedTasks,
    removedTasks,
    summary: `改动 ${changedTasks} 张任务卡，新增 ${addedTasks} 张，移除 ${removedTasks} 张。`
  };
}
