import { afterEach, describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { getLatestPlan, savePlan } from "@/lib/storage/localPlanStore";

describe("localPlanStore", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("returns the most recently saved plan", () => {
    const older = { ...samplePlan, id: "older" };
    const newer = { ...samplePlan, id: "newer", version: 2 };

    savePlan(older);
    savePlan(newer);

    expect(getLatestPlan()?.id).toBe("newer");
  });
});
