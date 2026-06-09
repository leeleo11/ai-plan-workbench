import { preferences } from '@kit.ArkData';
import type { Plan } from '../model/PlanModel';

const STORE_NAME = 'ai_plan_store';
const PLAN_KEY = 'latest_plan';

export class StorageService {
  private static instance: StorageService;
  private context: Context | null = null;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  init(context: Context): void {
    this.context = context;
  }

  async savePlan(plan: Plan): Promise<void> {
    if (!this.context) return;
    const prefs = await preferences.getPreferences(this.context, STORE_NAME);
    await prefs.put(PLAN_KEY, JSON.stringify(plan));
    await prefs.flush();
  }

  async getLatestPlan(): Promise<Plan | null> {
    if (!this.context) return null;
    const prefs = await preferences.getPreferences(this.context, STORE_NAME);
    const value = await prefs.get(PLAN_KEY, '');
    if (!value || typeof value !== 'string') return null;
    try {
      return JSON.parse(value) as Plan;
    } catch {
      return null;
    }
  }

  async clearPlan(): Promise<void> {
    if (!this.context) return;
    const prefs = await preferences.getPreferences(this.context, STORE_NAME);
    await prefs.delete(PLAN_KEY);
    await prefs.flush();
  }
}
