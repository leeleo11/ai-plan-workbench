import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Plan } from './shared/schema';

function getApiBase(): string {
  const configured = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof configured === 'string' && configured.trim()) {
    return configured.replace(/\/$/, '');
  }

  if (Platform.OS === 'web') {
    return 'https://ai-plan-workbench.vercel.app';
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoClient?.hostUri;
  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : null;

  return host ? `http://${host}:3000` : 'http://localhost:3000';
}

const API_BASE = getApiBase();

async function readError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  return typeof data?.error === 'string' ? data.error : fallback;
}

export type GeneratePlanParams = {
  goal: string;
  dailyTime: number;
  startDate: string;
  level: string;
  supplement: string;
};

export async function generatePlan(params: GeneratePlanParams | string): Promise<Plan> {
  const body = typeof params === 'string'
    ? { input: params }
    : {
        goal: params.goal,
        dailyTime: params.dailyTime,
        startDate: params.startDate,
        level: params.level,
        supplement: params.supplement,
      };

  const response = await fetch(`${API_BASE}/api/plans/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readError(response, '计划生成失败'));
  }

  const data = await response.json();
  return data.plan as Plan;
}

export async function optimizePlan(
  plan: Plan,
  selectedTaskIds: string[],
  instruction: string,
): Promise<Plan> {
  const response = await fetch(`${API_BASE}/api/plans/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, selectedTaskIds, instruction }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, '优化失败'));
  }

  const data = await response.json();
  return data.plan as Plan;
}

export function getCurrentApiBase(): string {
  return API_BASE;
}
