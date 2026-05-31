import type { Plan, PlanRisk, ValidationStatus } from "./schema";

const vagueTaskTitles = new Set([
  "study english",
  "learn english",
  "review",
  "practice",
  "study"
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
      message: `${date} exceeds available study time by ${value.total - plan.goal.dailyAvailableMinutes} minutes.`,
      severity: "medium" as const,
      relatedTaskIds: value.taskIds
    }));
}

function validateTaskGranularity(plan: Plan): PlanRisk[] {
  return plan.tasks
    .filter((task) => vagueTaskTitles.has(task.title.trim().toLowerCase()))
    .map((task) => ({
      type: "task_granularity",
      message: `"${task.title}" is too broad to execute reliably.`,
      severity: "low" as const,
      relatedTaskIds: [task.id]
    }));
}

function validatePhaseDates(plan: Plan): PlanRisk[] {
  return plan.phases
    .filter((phase) => phase.startDate > phase.endDate)
    .map((phase) => ({
      type: "phase_order",
      message: `${phase.title} starts after it ends.`,
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
