import { describe, expect, it } from "vitest";
import { PlanSchema } from "@/lib/plan/schema";
import { samplePlan } from "@/lib/plan/fixtures";

describe("PlanSchema", () => {
  it("accepts a valid structured plan", () => {
    const parsed = PlanSchema.parse(samplePlan);
    expect(parsed.goal.title).toBe("90-day IELTS plan to reach 7.0");
    expect(parsed.brief.summary).toContain("90天");
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
            title: "Official IELTS preparation page",
            note: "Used as a planning reference.",
            url: "https://ielts.org/",
            verificationStatus: "trusted"
          }
        ]
      }
    });

    expect(parsed.brief.sources[0].url).toBe("https://ielts.org/");
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
