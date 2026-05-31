import { NextResponse } from "next/server";
import { generatePlanFromGoal } from "@/lib/plan/generator";
import { createAiProvider } from "@/server/ai/providerFactory";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.input || typeof body.input !== "string") {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  const result = await generatePlanFromGoal({
    input: body.input,
    provider: createAiProvider()
  });

  return NextResponse.json(result);
}
