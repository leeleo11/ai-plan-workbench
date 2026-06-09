import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { getExecutionStats } from "@/lib/plan/executionStats";

describe("getExecutionStats", () => {
  it("summarizes task statuses and progress", () => {
    const plan = {
      ...samplePlan,
      tasks: [
        { ...samplePlan.tasks[0], status: "done" as const },
        { ...samplePlan.tasks[1], status: "todo" as const }
      ]
    };

    const stats = getExecutionStats(plan);

    expect(stats.doneCount).toBe(1);
    expect(stats.todoCount).toBe(1);
    expect(stats.progress).toBe(50);
  });

  it("counts consecutive fully completed days from the beginning", () => {
    const plan = {
      ...samplePlan,
      tasks: [
        { ...samplePlan.tasks[0], id: "d1", date: "2026-06-01", status: "done" as const },
        { ...samplePlan.tasks[1], id: "d2", date: "2026-06-02", status: "done" as const }
      ]
    };

    expect(getExecutionStats(plan).currentStreak).toBe(2);
  });
});
