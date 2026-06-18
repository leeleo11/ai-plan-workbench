import type { Plan, PlanTask } from "./schema";

export interface PlanStore {
  listPlans(): Plan[] | Promise<Plan[]>;
  savePlan(plan: Plan): void | Promise<void>;
  getLatestPlan(): Plan | null | Promise<Plan | null>;
  toggleTaskStatus?(taskId: string): Plan | null | Promise<Plan | null>;
  updateTaskField?(taskId: string, patch: Partial<PlanTask>): Plan | null | Promise<Plan | null>;
}
