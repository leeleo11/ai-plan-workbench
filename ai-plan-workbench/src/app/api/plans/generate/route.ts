import { NextResponse } from "next/server";
import { generatePlanFromGoal, generatePlanFromStructured } from "@/lib/plan/generator";
import { createAiProvider } from "@/server/ai/providerFactory";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    let result;

    // New structured format
    if (body.goal && typeof body.goal === "string") {
      result = await generatePlanFromStructured({
        goal: body.goal,
        dailyTime: typeof body.dailyTime === "number" ? body.dailyTime : 2,
        startDate: typeof body.startDate === "string" ? body.startDate : new Date().toISOString().split("T")[0],
        level: typeof body.level === "string" ? body.level : "",
        supplement: typeof body.supplement === "string" ? body.supplement : "",
      });
    }
    // Legacy format
    else if (body.input && typeof body.input === "string") {
      result = await generatePlanFromGoal({
        input: body.input,
        provider: createAiProvider(),
      });
    } else {
      return NextResponse.json({ error: "goal or input is required" }, { status: 400 });
    }

    const response = NextResponse.json(result);
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plan generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
