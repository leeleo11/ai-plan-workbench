import { parseGoalInput } from "./parser";
import { getReferenceSources, mergePlanSources } from "./referenceSources";
import { selectTemplate } from "./templates";
import { validatePlan } from "./validator";
import type { Plan } from "./schema";
import type { AiProvider } from "@/server/ai/provider";

export type GeneratePlanInput = {
  input: string;
  provider: AiProvider;
};

export async function generatePlanFromGoal({ input, provider }: GeneratePlanInput): Promise<{ plan: Plan }> {
  const parsed = parseGoalInput(input);
  const template = selectTemplate(parsed);
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
