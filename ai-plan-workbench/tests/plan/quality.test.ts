import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { assessPlanQuality } from "@/lib/plan/quality";

describe("assessPlanQuality", () => {
  it("scores a clear plan highly and explains why it can start", () => {
    const report = assessPlanQuality(samplePlan);

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.label).toBe("稳稳开局");
    expect(report.aiTaskRatio).toBe(1);
    expect(report.recommendations[0]).toContain("可以先执行三天");
    expect(report.actions[0].label).toBe("三天后复盘");
  });

  it("lowers the score when daily workload exceeds available time", () => {
    const overloaded = {
      ...samplePlan,
      goal: { ...samplePlan.goal, dailyAvailableMinutes: 30 },
      risks: [
        {
          type: "daily_capacity",
          message: "2026-06-01 超出每日可用时间。",
          severity: "medium" as const,
          relatedTaskIds: samplePlan.tasks.map((task) => task.id)
        }
      ]
    };

    const report = assessPlanQuality(overloaded);

    expect(report.score).toBeLessThan(80);
    expect(report.recommendations[0]).toContain("超过每日可投入时间");
    expect(report.actions[0].label).toBe("生成减压版");
  });

  it("recommends rolling extension when duration is uncertain", () => {
    const report = assessPlanQuality({
      ...samplePlan,
      goal: { ...samplePlan.goal, durationUncertain: true }
    });

    expect(report.recommendations.some((item) => item.includes("30天滚动计划"))).toBe(true);
    expect(report.actions.some((action) => action.label === "滚动延展计划")).toBe(true);
  });
});
