import { NextResponse } from "next/server";
import { PlanSchema } from "@/lib/plan/schema";
import { createAiProvider } from "@/server/ai/providerFactory";
import { createPlanVersion } from "@/lib/plan/versioning";
import { validatePlan } from "@/lib/plan/validator";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = PlanSchema.safeParse(body?.plan);

  if (!parsed.success) {
    return NextResponse.json({ error: "valid plan is required" }, { status: 400 });
  }

  if (!Array.isArray(body.selectedTaskIds) || typeof body.instruction !== "string") {
    return NextResponse.json({ error: "selectedTaskIds and instruction are required" }, { status: 400 });
  }

  const provider = createAiProvider();
  const before = createPlanVersion(parsed.data, body.instruction);
  const optimized = await provider.optimizePlan({
    plan: parsed.data,
    selectedTaskIds: body.selectedTaskIds,
    instruction: body.instruction
  });
  const validation = validatePlan(optimized);

  return NextResponse.json({
    plan: {
      ...optimized,
      version: parsed.data.version + 1,
      validationStatus: validation.status,
      risks: validation.risks,
      history: [before, ...parsed.data.history]
    }
  });
}
