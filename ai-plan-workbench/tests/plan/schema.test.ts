import { describe, expect, it } from "vitest";
import { PlanSchema } from "@/lib/plan/schema";
import { samplePlan } from "@/lib/plan/fixtures";

describe("PlanSchema", () => {
  it("accepts a valid structured plan", () => {
    const parsed = PlanSchema.parse(samplePlan);
    expect(parsed.goal.title).toBe("90-day IELTS plan to reach 7.0");
    expect(parsed.tasks[0].status).toBe("todo");
  });

  it("rejects invalid task status", () => {
    const invalid = {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], status: "unknown" }]
    };

    expect(() => PlanSchema.parse(invalid)).toThrow();
  });
});
