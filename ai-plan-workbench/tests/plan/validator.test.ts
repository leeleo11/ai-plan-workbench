import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { validatePlan } from "@/lib/plan/validator";

describe("validatePlan", () => {
  it("marks sample plan as valid", () => {
    const result = validatePlan(samplePlan);
    expect(result.status).toBe("valid");
    expect(result.risks).toHaveLength(0);
  });

  it("warns when a day exceeds available minutes", () => {
    const overloaded = {
      ...samplePlan,
      goal: { ...samplePlan.goal, dailyAvailableMinutes: 30 }
    };

    const result = validatePlan(overloaded);

    expect(result.status).toBe("valid_with_warnings");
    expect(result.risks.some((risk) => risk.type === "daily_capacity")).toBe(true);
  });

  it("warns when a task title is too broad", () => {
    const vague = {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], title: "practice" }]
    };

    const result = validatePlan(vague);

    expect(result.risks.some((risk) => risk.type === "task_granularity")).toBe(true);
  });
});
