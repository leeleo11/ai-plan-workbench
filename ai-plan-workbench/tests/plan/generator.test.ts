import { describe, expect, it } from "vitest";
import { generatePlanFromGoal } from "@/lib/plan/generator";
import { createMockAiProvider } from "@/server/ai/mockProvider";

describe("generatePlanFromGoal", () => {
  it("generates a validated learning plan", async () => {
    const result = await generatePlanFromGoal({
      input: "30天学会 Python 数据分析，从会一点基础语法到能独立完成一个小项目，每天学习1小时",
      provider: createMockAiProvider()
    });

    expect(result.plan.goal.type).toBe("learning");
    expect(result.plan.phases.length).toBeGreaterThan(0);
    expect(result.plan.tasks.length).toBeGreaterThan(0);
    expect(result.plan.brief.summary).toContain("文字版规划");
    expect(result.plan.brief.assumptions.length).toBeGreaterThan(0);
    expect(result.plan.brief.sources[0].type).toBe("template");
    expect(result.plan.validationStatus).toBe("valid");
  });

  it("tailors daily tasks to the user's specific goal", async () => {
    const pythonPlan = await generatePlanFromGoal({
      input: "30天学会 Python 数据分析，从会一点基础语法到能独立完成一个小项目，每天学习1小时",
      provider: createMockAiProvider()
    });
    const photoPlan = await generatePlanFromGoal({
      input: "30天学会 摄影构图，从只会自动模式到能拍一组作品，每天学习1小时",
      provider: createMockAiProvider()
    });

    const pythonTitles = pythonPlan.plan.tasks.map((task) => task.title).join("\n");
    const photoTitles = photoPlan.plan.tasks.map((task) => task.title).join("\n");

    expect(pythonTitles).toContain("Python 数据分析");
    expect(photoTitles).toContain("摄影构图");
    expect(pythonTitles).not.toEqual(photoTitles);
  });

  it("adds traceable reference sources based on the goal", async () => {
    const result = await generatePlanFromGoal({
      input: "30天学会 Python 数据分析，从会一点基础语法到能独立完成一个小项目，每天学习1小时",
      provider: createMockAiProvider()
    });

    const sourceUrls = result.plan.brief.sources.map((source) => source.url).filter(Boolean);
    const pythonSource = result.plan.brief.sources.find((source) => source.url === "https://docs.python.org/3/tutorial/");

    expect(sourceUrls).toContain("https://docs.python.org/3/tutorial/");
    expect(sourceUrls).toContain("https://pandas.pydata.org/docs/user_guide/");
    expect(pythonSource?.verificationStatus).toBe("trusted");
  });

  it("uses the user's start date when building the timeline", async () => {
    const result = await generatePlanFromGoal({
      input: "2026-06-08开始，30天学会 Python 数据分析，从零基础到能做项目，每天学习1小时",
      provider: createMockAiProvider()
    });

    expect(result.plan.goal.startDate).toBe("2026-06-08");
    expect(result.plan.tasks[0].date).toBe("2026-06-08");
  });

  it("keeps uncertain duration visible in the generated plan", async () => {
    const result = await generatePlanFromGoal({
      input: "养成晨跑习惯，时间不确定，每天投入1小时",
      provider: createMockAiProvider()
    });

    expect(result.plan.goal.durationUncertain).toBe(true);
    expect(result.plan.brief.assumptions.some((item) => item.includes("30天滚动计划"))).toBe(true);
  });
});
