import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { summarizePlanDiff } from "@/lib/plan/optimizer";

describe("summarizePlanDiff", () => {
  it("summarizes changed task titles", () => {
    const next = {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], title: "New title" }, samplePlan.tasks[1]]
    };

    const diff = summarizePlanDiff(samplePlan, next);

    expect(diff.changedTasks).toBe(1);
    expect(diff.summary).toContain("1 task changed");
  });
});
