import { describe, expect, it } from "vitest";
import { generatePlanFromGoal } from "@/lib/plan/generator";
import { createMockAiProvider } from "@/server/ai/mockProvider";

describe("generatePlanFromGoal", () => {
  it("generates a validated IELTS plan", async () => {
    const result = await generatePlanFromGoal({
      input: "I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day.",
      provider: createMockAiProvider()
    });

    expect(result.plan.goal.type).toBe("exam");
    expect(result.plan.phases.length).toBeGreaterThan(0);
    expect(result.plan.tasks.length).toBeGreaterThan(0);
    expect(result.plan.validationStatus).toBe("valid");
  });
});
