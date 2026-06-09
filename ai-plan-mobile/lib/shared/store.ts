import type { Plan } from "./schema";

export interface PlanStore {
  listPlans(): Plan[] | Promise<Plan[]>;
  savePlan(plan: Plan): void | Promise<void>;
  getLatestPlan(): Plan | null | Promise<Plan | null>;
}
