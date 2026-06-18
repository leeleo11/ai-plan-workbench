import { NextResponse } from "next/server";
import { z } from "zod";

const ScheduleItemSchema = z.object({
  time: z.string().min(1),
  task: z.string().min(1),
  type: z.enum(["work", "study", "exercise", "life", "rest", "social"]),
  priority: z.enum(["high", "medium", "low"]),
});

const DailyPlanSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  schedule: z.array(ScheduleItemSchema).min(1),
  tips: z.array(z.string()),
});

type DailyPlan = z.infer<typeof DailyPlanSchema>;

function stripCodeFence(content: string): string {
  return content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function buildSystemPrompt(): string {
  return `你是一个日常计划安排助手。用户会用一句话描述今天/明天想完成的事情。
你需要把用户的模糊想法拆解成清晰、合理、可执行的日程。

## 输出要求
只输出 JSON，不要输出 Markdown 或解释。

## 计划规则
1. 每个时间段必须具体到 "HH:MM - HH:MM" 格式
2. 不要安排得过满，要留出休息和缓冲时间
3. 优先安排重要任务在精力最好的时段
4. 同类任务不要连续超过 2 小时，避免疲劳
5. 必须包含起床、三餐、午休、睡觉等生活时间
6. 根据用户选择的强度调整任务密度：
   - 轻松模式：任务间隔长，留白多，每个任务后有休息
   - 标准模式：平衡安排，合理间隔
   - 高效模式：时间利用率高，休息时间短
   - 冲刺模式：最大化学习/工作时间，最少休息
7. 如果用户说"不要太累"，降低任务密度
8. 如果用户有具体限制（如"10点起床""下午有课"），严格遵守

## 输出格式
{
  "title": "计划标题（简短有画面感）",
  "summary": "一句话说明整体安排思路",
  "schedule": [
    { "time": "08:00 - 08:30", "task": "起床、洗漱、早餐", "type": "life", "priority": "low" },
    { "time": "09:00 - 10:30", "task": "具体任务描述", "type": "study", "priority": "high" }
  ],
  "tips": ["给用户的 2-3 条建议"]
}

type 可选: work(工作), study(学习), exercise(运动), life(生活), rest(休息), social(社交)
priority 可选: high(重要), medium(一般), low(轻松)`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.input || typeof body.input !== "string") {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  const apiKey = process.env.MIMO_API_KEY ?? process.env.AI_API_KEY;
  const baseUrl = (process.env.MIMO_API_BASE_URL ?? "https://token-plan-cn.xiaomimimo.com/v1").replace(/\/$/, "");
  const model = process.env.MIMO_MODEL ?? process.env.AI_MODEL ?? "mimo-v2.5";

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const intensity = body.intensity || "标准模式";
  const wakeTime = body.wakeTime || "08:00";
  const sleepTime = body.sleepTime || "23:00";

  const userPrompt = JSON.stringify({
    userInput: body.input,
    intensity: intensity,
    wakeTime: wakeTime,
    sleepTime: sleepTime,
    date: body.date || "今天",
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 4096,
        temperature: 0.7,
        top_p: 0.9,
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        stream: false,
      }),
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`API error: ${response.status} ${errorText}`);
    }

    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in response");

    const parsed = JSON.parse(stripCodeFence(content));
    const plan = DailyPlanSchema.parse(parsed);

    const result = NextResponse.json({ plan });
    result.headers.set("Access-Control-Allow-Origin", "*");
    result.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    result.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daily plan generation failed";
    const result = NextResponse.json({ error: message }, { status: 502 });
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
