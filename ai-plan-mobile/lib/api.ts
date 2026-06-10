import type { Plan } from './shared/schema';

// 生产环境使用 Vercel 部署的 URL
// 开发环境使用本地地址
const API_BASE = __DEV__
  ? 'http://localhost:3000'  // 开发环境
  : 'https://ai-plan-workbench-production.up.railway.app';  // 生产环境（Railway）

export async function generatePlan(input: string): Promise<Plan> {
  const response = await fetch(`${API_BASE}/api/plans/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? '计划生成失败');
  }

  const data = await response.json();
  return data.plan as Plan;
}

export async function optimizePlan(
  plan: Plan,
  selectedTaskIds: string[],
  instruction: string
): Promise<Plan> {
  const response = await fetch(`${API_BASE}/api/plans/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, selectedTaskIds, instruction }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? '优化失败');
  }

  const data = await response.json();
  return data.plan as Plan;
}
