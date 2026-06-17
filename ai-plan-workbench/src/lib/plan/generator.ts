import { parseGoalInput } from "./parser";
import { getReferenceSources, mergePlanSources } from "./referenceSources";
import { selectTemplate } from "./templates";
import { validatePlan } from "./validator";
import type { Plan } from "./schema";
import type { AiProvider } from "@/server/ai/provider";
import { generateStructuredPlan, type StructuredPlanParams } from "@/server/ai/mimoProvider";

export type GeneratePlanInput = {
  input: string;
  provider: AiProvider;
};

export async function generatePlanFromGoal({ input, provider }: GeneratePlanInput): Promise<{ plan: Plan }> {
  const parsed = parseGoalInput(input);
  const template = selectTemplate(parsed.goalCategory);
  const draft = await provider.generatePlan({ parsed, template });
  const planWithSources = {
    ...draft,
    brief: {
      ...draft.brief,
      sources: mergePlanSources(draft.brief.sources, getReferenceSources(parsed))
    }
  };
  const validation = validatePlan(planWithSources);

  return {
    plan: {
      ...planWithSources,
      validationStatus: validation.status,
      risks: validation.risks
    }
  };
}

export async function generatePlanFromStructured(params: StructuredPlanParams): Promise<{ plan: Plan }> {
  const aiContent = await generateStructuredPlan(params);

  // Build plan structure from LLM response
  const durationMatch = params.goal.match(/(\d+)\s*(?:天|日|day)/i);
  const durationDays = durationMatch ? parseInt(durationMatch[1]) : 30;
  const start = new Date(`${params.startDate}T00:00:00`);

  function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
  function ymd(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  // Calculate phase date ranges
  const phaseCount = aiContent.phases.length;
  const phaseLength = Math.ceil(durationDays / phaseCount);

  const phases = aiContent.phases.map((phase, i) => {
    const phaseStart = addDays(start, i * phaseLength);
    const phaseEnd = addDays(phaseStart, phaseLength - 1);
    return {
      id: `phase_${i + 1}`,
      title: phase.title,
      startDate: ymd(phaseStart),
      endDate: ymd(phaseEnd),
      objective: phase.objective,
      tasks: phase.tasks.map((_, j) => `task_${i * phaseLength + j + 1}`),
    };
  });

  // Build tasks with dates
  const tasks = aiContent.phases.flatMap((phase, phaseIndex) =>
    phase.tasks.map((task, taskIndex) => {
      const globalIndex = phaseIndex * phaseLength + taskIndex;
      return {
        id: `task_${globalIndex + 1}`,
        title: task.title,
        description: task.description,
        date: ymd(addDays(start, globalIndex)),
        durationMinutes: task.durationMinutes,
        category: task.category,
        priority: task.priority,
        status: "todo" as const,
        dependsOn: [],
        source: "ai_generated" as const,
      };
    })
  );

  const plan: Plan = {
    id: `plan_${Date.now()}`,
    version: 1,
    validationStatus: "valid",
    goal: {
      title: params.goal,
      type: "learning",
      startDate: params.startDate,
      targetDate: ymd(addDays(start, durationDays)),
      currentLevel: params.level || undefined,
      dailyAvailableMinutes: Math.round(params.dailyTime * 60),
    },
    brief: {
      summary: aiContent.summary,
      assumptions: aiContent.assumptions,
      sources: [
        { type: "model", title: "AI 计划教练", note: "基于用户目标和参数由 LLM 生成。" },
        { type: "user_input", title: "用户目标", note: params.goal },
      ],
    },
    phases,
    tasks,
    risks: [],
    history: [],
  };

  const validation = validatePlan(plan);
  return {
    plan: {
      ...plan,
      validationStatus: validation.status,
      risks: validation.risks,
    },
  };
}
