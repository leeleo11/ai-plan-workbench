import type { Plan, PlanRisk, ValidationStatus } from "./schema";

const vagueTaskTitles = new Set([
  "review",
  "practice",
  "study",
  "learn",
  "work",
  "do",
  "make"
]);

export type ValidationResult = {
  status: ValidationStatus;
  risks: PlanRisk[];
};

function validateDailyCapacity(plan: Plan): PlanRisk[] {
  const minutesByDate = new Map<string, { total: number; taskIds: string[] }>();

  for (const task of plan.tasks) {
    const current = minutesByDate.get(task.date) ?? { total: 0, taskIds: [] };
    current.total += task.durationMinutes;
    current.taskIds.push(task.id);
    minutesByDate.set(task.date, current);
  }

  return [...minutesByDate.entries()]
    .filter(([, value]) => value.total > plan.goal.dailyAvailableMinutes)
    .map(([date, value]) => ({
      type: "daily_capacity",
      message: `${date} 超出每日可用时间 ${value.total - plan.goal.dailyAvailableMinutes} 分钟。`,
      severity: "medium" as const,
      relatedTaskIds: value.taskIds
    }));
}

function validateTaskGranularity(plan: Plan): PlanRisk[] {
  return plan.tasks
    .filter((task) => vagueTaskTitles.has(task.title.trim().toLowerCase()))
    .map((task) => ({
      type: "task_granularity",
      message: `"${task.title}" 太笼统，不好执行。`,
      severity: "low" as const,
      relatedTaskIds: [task.id]
    }));
}

function validatePhaseDates(plan: Plan): PlanRisk[] {
  return plan.phases
    .filter((phase) => phase.startDate > phase.endDate)
    .map((phase) => ({
      type: "phase_order",
      message: `${phase.title} 的开始日期晚于结束日期。`,
      severity: "high" as const,
      relatedTaskIds: phase.tasks
    }));
}

export function validatePlan(plan: Plan): ValidationResult {
  const risks = [
    ...validateDailyCapacity(plan),
    ...validateTaskGranularity(plan),
    ...validatePhaseDates(plan)
  ];

  const hasBlocking = risks.some((risk) => risk.severity === "high");
  const status: ValidationStatus = hasBlocking
    ? "invalid"
    : risks.length > 0
      ? "valid_with_warnings"
      : "valid";

  return { status, risks };
}
