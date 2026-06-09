import { http } from '@kit.NetworkKit';
import type { Plan } from '../model/PlanModel';

const BASE_URL = 'http://172.16.108.170:3000';

export class ApiService {
  static async generatePlan(input: string): Promise<Plan> {
    const httpRequest = http.createHttp();
    try {
      const response = await httpRequest.request(
        `${BASE_URL}/api/plans/generate`,
        {
          method: http.RequestMethod.POST,
          header: {
            'Content-Type': 'application/json'
          },
          extraData: JSON.stringify({ input }),
          connectTimeout: 60000,
          readTimeout: 60000
        }
      );

      if (response.responseCode !== 200) {
        throw new Error(`HTTP ${response.responseCode}`);
      }

      const data = JSON.parse(response.result as string) as Record<string, Object>;
      return data['plan'] as Plan;
    } finally {
      httpRequest.destroy();
    }
  }

  static async optimizePlan(
    plan: Plan,
    selectedTaskIds: string[],
    instruction: string
  ): Promise<Plan> {
    const httpRequest = http.createHttp();
    try {
      const response = await httpRequest.request(
        `${BASE_URL}/api/plans/optimize`,
        {
          method: http.RequestMethod.POST,
          header: {
            'Content-Type': 'application/json'
          },
          extraData: JSON.stringify({
            plan,
            selectedTaskIds,
            instruction
          }),
          connectTimeout: 60000,
          readTimeout: 60000
        }
      );

      if (response.responseCode !== 200) {
        throw new Error(`HTTP ${response.responseCode}`);
      }

      const data = JSON.parse(response.result as string) as Record<string, Object>;
      return data['plan'] as Plan;
    } finally {
      httpRequest.destroy();
    }
  }
}
