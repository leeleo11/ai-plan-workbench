import type { PlanTemplate } from "@/lib/plan/templates";
import type { ParsedGoalInput } from "@/lib/plan/parser";
import type { Plan } from "@/lib/plan/schema";

export type GeneratePlanRequest = {
  parsed: ParsedGoalInput;
  template: PlanTemplate;
};

export type OptimizePlanRequest = {
  plan: Plan;
  selectedTaskIds: string[];
  instruction: string;
};

export interface AiProvider {
  generatePlan(request: GeneratePlanRequest): Promise<Plan>;
  optimizePlan(request: OptimizePlanRequest): Promise<Plan>;
}
