import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { applyPlanUpdate, undoLastChange } from "@/lib/plan/versioning";

describe("plan versioning", () => {
  it("increments version and stores previous plan", () => {
    const next = applyPlanUpdate(samplePlan, "rename task", {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], title: "Updated task" }, samplePlan.tasks[1]]
    });

    expect(next.version).toBe(2);
    expect(next.history).toHaveLength(1);
  });

  it("undoes the last change", () => {
    const changed = applyPlanUpdate(samplePlan, "rename task", {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], title: "Updated task" }, samplePlan.tasks[1]]
    });

    const undone = undoLastChange(changed);
    expect(undone.tasks[0].title).toBe(samplePlan.tasks[0].title);
  });
});
