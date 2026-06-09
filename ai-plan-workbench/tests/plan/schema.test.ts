import { describe, expect, it } from "vitest";
import { PlanSchema } from "@/lib/plan/schema";
import { samplePlan } from "@/lib/plan/fixtures";

describe("PlanSchema", () => {
  it("accepts a valid structured plan", () => {
    const parsed = PlanSchema.parse(samplePlan);
    expect(parsed.goal.title).toBe("30天学会 Python 数据分析");
    expect(parsed.brief.summary).toContain("30天");
    expect(parsed.tasks[0].status).toBe("todo");
  });

  it("rejects invalid task status", () => {
    const invalid = {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], status: "unknown" }]
    };

    expect(() => PlanSchema.parse(invalid)).toThrow();
  });

  it("accepts optional source URLs for traceable planning references", () => {
    const parsed = PlanSchema.parse({
      ...samplePlan,
      brief: {
        ...samplePlan.brief,
        sources: [
          {
            type: "retrieval",
            title: "Python official tutorial",
            note: "Used as a planning reference.",
            url: "https://docs.python.org/3/tutorial/",
            verificationStatus: "trusted"
          }
        ]
      }
    });

    expect(parsed.brief.sources[0].url).toBe("https://docs.python.org/3/tutorial/");
    expect(parsed.brief.sources[0].verificationStatus).toBe("trusted");
  });

  it("accepts optional task descriptions", () => {
    const parsed = PlanSchema.parse({
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], description: "Finish the task and write down one blocker." }]
    });

    expect(parsed.tasks[0].description).toContain("blocker");
  });
});
