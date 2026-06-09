import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/plans/generate/route";

describe("POST /api/plans/generate", () => {
  it("returns a structured plan", async () => {
    const request = new Request("http://localhost/api/plans/generate", {
      method: "POST",
      body: JSON.stringify({
        input: "I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day."
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.plan.goal.type).toBe("exam");
    expect(json.plan.brief.summary).toContain("文字版规划");
    expect(json.plan.tasks.length).toBeGreaterThan(0);
  });
});
