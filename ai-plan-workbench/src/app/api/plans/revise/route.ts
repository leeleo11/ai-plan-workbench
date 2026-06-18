import { NextResponse } from "next/server";
import { z } from "zod";

const ScheduleItemSchema = z.object({
  id: z.string().min(1),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["study", "work", "life", "exercise", "rest", "meal", "commute", "other"]),
  priority: z.enum(["low", "medium", "high"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  can_skip: z.boolean(),
});

const DailyPlanSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  date_type: z.enum(["today", "tomorrow", "custom"]),
  intensity: z.enum(["relaxed", "standard", "efficient", "sprint"]),
  schedule: z.array(ScheduleItemSchema).min(1),
  tips: z.array(z.string()),
});

function stripCodeFence(content: string): string {
  return content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

function buildReviseSystemPrompt(): string {
  return `你需要根据用户的修改意见，调整已有的日常计划。

要求：
1. 保留用户最重要的目标和任务。
2. 根据修改意见调整时间安排、任务密度或顺序。
3. 不要删除所有核心任务。
4. 时间格式必须是 HH:mm，时间必须按顺序排列，不能重叠。
5. 必须包含起床、吃饭、睡觉等基础生活时间。
6. 输出完整 JSON，格式与原计划相同。
7. 只输出 JSON，不要输出任何解释。`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.original_plan || !body?.adjust_instruction) {
    return NextResponse.json(
      { success: false, error: "original_plan and adjust_instruction are required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.MIMO_API_KEY ?? process.env.AI_API_KEY;
  const baseUrl = (process.env.MIMO_API_BASE_URL ?? "https://token-plan-cn.xiaomimimo.com/v1").replace(/\/$/, "");
  const model = process.env.MIMO_MODEL ?? process.env.AI_MODEL ?? "mimo-v2.5";

  if (!apiKey) {
    return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 });
  }

  const userPrompt = `原计划：
${JSON.stringify(body.original_plan, null, 2)}

用户修改意见：
${body.adjust_instruction}

请调整后输出完整 JSON。`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildReviseSystemPrompt() },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 4096,
        temperature: 0.5,
        top_p: 0.9,
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        stream: false,
      }),
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      throw new Error(`LLM API error: ${response.status} ${err}`);
    }

    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLM returned empty content");

    const parsed = JSON.parse(stripCodeFence(content));
    const plan = DailyPlanSchema.parse(parsed);

    const result = NextResponse.json({ success: true, data: plan });
    result.headers.set("Access-Control-Allow-Origin", "*");
    result.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    result.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plan revision failed";
    const result = NextResponse.json({ success: false, error: message }, { status: 502 });
    result.headers.set("Access-Control-Allow-Origin", "*");
    return result;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
