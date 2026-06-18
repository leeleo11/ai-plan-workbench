import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Plan, PlanTask } from './shared/schema';
import type { PlanStore } from './shared/store';

const PLAN_KEY = 'planpal.plans.v2';

export const mobilePlanStore: PlanStore = {
  async listPlans(): Promise<Plan[]> {
    const raw = await AsyncStorage.getItem(PLAN_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as Plan[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async savePlan(plan: Plan): Promise<void> {
    const existing = await mobilePlanStore.listPlans();
    const filtered = existing.filter((item) => item.id !== plan.id);
    await AsyncStorage.setItem(PLAN_KEY, JSON.stringify([plan, ...filtered]));
  },

  async getLatestPlan(): Promise<Plan | null> {
    const plans = await mobilePlanStore.listPlans();
    return plans[0] ?? null;
  },

  async toggleTaskStatus(taskId: string): Promise<Plan | null> {
    const plan = await mobilePlanStore.getLatestPlan();
    if (!plan) return null;

    const task = plan.tasks.find((t) => t.id === taskId);
    if (!task) return plan;

    task.status = task.status === 'done' ? 'todo' : 'done';
    await mobilePlanStore.savePlan(plan);
    return plan;
  },

  async updateTaskField(taskId: string, patch: Partial<PlanTask>): Promise<Plan | null> {
    const plan = await mobilePlanStore.getLatestPlan();
    if (!plan) return null;

    const task = plan.tasks.find((t) => t.id === taskId);
    if (!task) return plan;

    Object.assign(task, patch);
    await mobilePlanStore.savePlan(plan);
    return plan;
  },
};
