import { PlanSchema, type Plan } from "./schema";

export function createPlanVersion(plan: Plan, reason: string) {
  return {
    id: `version_${Date.now()}`,
    createdAt: new Date().toISOString(),
    reason,
    plan
  };
}

export function applyPlanUpdate(previous: Plan, reason: string, nextPlan: Plan): Plan {
  return {
    ...nextPlan,
    version: previous.version + 1,
    history: [createPlanVersion(previous, reason), ...previous.history]
  };
}

export function undoLastChange(plan: Plan): Plan {
  const [latest, ...rest] = plan.history;
  if (!latest) return plan;

  const previousPlan = PlanSchema.parse(latest.plan);
  return {
    ...previousPlan,
    history: rest
  };
}
