import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/plans/generate/route";

describe("POST /api/plans/generate", () => {
  it("returns a structured plan", async () => {
    const request = new Request("http://localhost/api/plans/generate", {
      method: "POST",
      body: JSON.stringify({
        input: "30天学会 Python 数据分析，从会一点基础语法到能独立完成一个小项目，每天学习1小时"
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.plan.goal.type).toBe("learning");
    expect(json.plan.brief.summary).toContain("文字版规划");
    expect(json.plan.tasks.length).toBeGreaterThan(0);
  });
});
