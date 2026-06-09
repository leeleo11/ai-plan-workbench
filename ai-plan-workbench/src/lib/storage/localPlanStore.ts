import type { Plan } from "@/lib/plan/schema";

const key = "ai-plan-workbench.plans";

export function listPlans(): Plan[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Plan[];
  } catch {
    return [];
  }
}

export function savePlan(plan: Plan): void {
  if (typeof window === "undefined") return;
  const existing = listPlans().filter((item) => item.id !== plan.id);
  window.localStorage.setItem(key, JSON.stringify([plan, ...existing]));
}

export function getLatestPlan(): Plan | null {
  return listPlans()[0] ?? null;
}
