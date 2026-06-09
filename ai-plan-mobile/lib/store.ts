import * as SecureStore from 'expo-secure-store';
import type { Plan } from './shared/schema';
import type { PlanStore } from './shared/store';

const PLAN_KEY = 'ai-plan-workbench.plans';

export const mobilePlanStore: PlanStore = {
  async listPlans(): Promise<Plan[]> {
    const raw = await SecureStore.getItemAsync(PLAN_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Plan[];
    } catch {
      return [];
    }
  },

  async savePlan(plan: Plan): Promise<void> {
    const existing = await mobilePlanStore.listPlans();
    const filtered = existing.filter((item) => item.id !== plan.id);
    await SecureStore.setItemAsync(PLAN_KEY, JSON.stringify([plan, ...filtered]));
  },

  async getLatestPlan(): Promise<Plan | null> {
    const plans = await mobilePlanStore.listPlans();
    return plans[0] ?? null;
  },
};
