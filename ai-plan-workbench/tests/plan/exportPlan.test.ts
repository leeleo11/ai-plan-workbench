import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { planToMarkdown } from "@/lib/plan/exportPlan";

describe("planToMarkdown", () => {
  it("exports goal, sources, phases, and tasks", () => {
    const markdown = planToMarkdown({
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], description: "Review mistakes after finishing." }, samplePlan.tasks[1]],
      brief: {
        ...samplePlan.brief,
        sources: [
          {
            type: "retrieval",
            title: "Python official tutorial",
            note: "Reference",
            url: "https://docs.python.org/3/tutorial/"
          }
        ]
      }
    });

    expect(markdown).toContain("# 90-day IELTS plan to reach 7.0");
    expect(markdown).toContain("https://docs.python.org/3/tutorial/");
    expect(markdown).toContain("## Foundation");
    expect(markdown).toContain("Memorize 80 core vocabulary words");
    expect(markdown).toContain("Review mistakes after finishing.");
  });
});
