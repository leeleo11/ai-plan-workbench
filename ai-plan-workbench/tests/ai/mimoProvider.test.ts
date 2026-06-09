import { describe, expect, it, vi } from "vitest";
import { parseGoalInput } from "@/lib/plan/parser";
import { samplePlan } from "@/lib/plan/fixtures";
import { selectTemplate } from "@/lib/plan/templates";
import { createMimoAiProvider } from "@/server/ai/mimoProvider";

describe("createMimoAiProvider", () => {
  it("calls MiMo chat completions with api-key auth and parses plan JSON", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "文字版规划：MiMo 已经根据目标生成了一份更细的备考说明。",
                assumptions: ["默认每天学习2小时。"],
                sources: [
                  {
                    type: "model",
                    title: "MiMo 规划建议",
                    note: "由 MiMo 根据用户目标生成。",
                    url: "https://ielts.org/"
                  }
                ]
              })
            }
          }
        ]
      })
    })) as unknown as typeof fetch;

    const parsed = parseGoalInput("90天备考雅思，从5.5到7.0，每天学习2小时");
    const provider = createMimoAiProvider({
      apiKey: "test-key",
      baseUrl: "https://token-plan-cn.xiaomimimo.com/v1",
      model: "mimo-v2.5",
      fetcher
    });

    const plan = await provider.generatePlan({
      parsed,
      template: selectTemplate(parsed)
    });

    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.brief.summary).toContain("MiMo");
    expect(plan.brief.sources.some((source) => source.url === "https://ielts.org/")).toBe(true);
    expect(plan.brief.sources.find((source) => source.url === "https://ielts.org/")?.verificationStatus).toBe("unverified");
    expect(fetcher).toHaveBeenCalledWith(
      "https://token-plan-cn.xiaomimimo.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "api-key": "test-key"
        })
      })
    );
    const requestInit = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    const requestBody = JSON.parse(String(requestInit.body));
    expect(requestBody.model).toBe("mimo-v2.5");
    expect(requestBody.thinking).toEqual({ type: "disabled" });
    expect(requestBody.messages[1].content).toContain("url");
  });

  it("uses MiMo generated phase objectives and daily task titles when available", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "文字版规划：按用户目标生成。",
                assumptions: ["默认每天学习1小时。"],
                sources: [
                  {
                    type: "model",
                    title: "MiMo 任务设计",
                    note: "由 MiMo 生成阶段目标和每日任务。"
                  }
                ],
                phaseObjectives: [
                  "建立 Python 数据分析环境并掌握 Pandas 基础",
                  "用真实数据练习清洗、统计和可视化",
                  "完成一个可展示的数据分析小项目",
                  "复盘项目并整理作品集说明"
                ],
                taskTitles: Array.from({ length: 20 }, (_, index) => `Python 数据分析 AI任务 ${index + 1}`),
                taskDescriptions: Array.from({ length: 20 }, (_, index) => `完成第 ${index + 1} 个数据分析练习并记录产出。`)
              })
            }
          }
        ]
      })
    })) as unknown as typeof fetch;

    const parsed = parseGoalInput("30天学会 Python 数据分析，从会一点基础语法到能独立完成一个小项目，每天学习1小时");
    const provider = createMimoAiProvider({
      apiKey: "test-key",
      fetcher
    });

    const plan = await provider.generatePlan({
      parsed,
      template: selectTemplate(parsed)
    });

    expect(plan.phases[0].objective).toBe("建立 Python 数据分析环境并掌握 Pandas 基础");
    expect(plan.tasks[0].title).toBe("Python 数据分析 AI任务 1");
    expect(plan.tasks[0].description).toBe("完成第 1 个数据分析练习并记录产出。");
    expect(plan.tasks[19].title).toBe("Python 数据分析 AI任务 20");
  });

  it("uses MiMo to optimize selected task cards", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                updates: [
                  {
                    id: samplePlan.tasks[0].id,
                    title: "AI 改写后的词汇任务",
                    description: "把 80 个词拆成 4 组，并用错题本记录薄弱词。"
                  }
                ]
              })
            }
          }
        ]
      })
    })) as unknown as typeof fetch;
    const provider = createMimoAiProvider({ apiKey: "test-key", fetcher });

    const optimized = await provider.optimizePlan({
      plan: samplePlan,
      selectedTaskIds: [samplePlan.tasks[0].id],
      instruction: "改得更具体一点"
    });

    expect(optimized.tasks[0].title).toBe("AI 改写后的词汇任务");
    expect(optimized.tasks[0].description).toContain("4 组");
    expect(optimized.tasks[0].source).toBe("ai_optimized");
    expect(optimized.tasks[1].title).toBe(samplePlan.tasks[1].title);
  });
});
