import { NextResponse } from "next/server";
import { z } from "zod";

// ── JSON Schema ──────────────────────────────────────────────────────────

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

type DailyPlan = z.infer<typeof DailyPlanSchema>;

// ── Prompt 构建 ─────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `你是一个专业的日常计划生成助手。

你的任务：
根据用户的一句话输入，生成一份合理、具体、可执行的日常计划。

生成规则：
1. 必须输出 JSON，不要输出 Markdown，不要输出解释。
2. schedule 必须是数组，不能为空。
3. 每个任务必须包含 id、start_time、end_time、title、description、type、priority、difficulty、can_skip。
4. 时间格式必须是 HH:mm（如 09:00，不是 9:00）。
5. 时间必须按顺序排列，不能有重叠。
6. 不要把计划排得过满，任务之间要留出休息和缓冲。
7. 高强度任务连续时间不要超过 90 分钟。
8. 如果用户说"不想太累""轻松一点"，降低任务密度，增加休息。
9. 如果用户说"冲刺""高效""ddl"，可以提高任务密度。
10. 必须包含起床、早餐、午餐、晚餐、睡觉等基础生活时间。
11. id 用 "item_1", "item_2" 这样的序号。
12. description 要具体说明这个时间段做什么，至少 10 个字。
13. can_skip: true 表示这个任务可以跳过（如休息、娱乐），false 表示核心任务。

输出格式示例：
{
  "title": "轻松高效的明日计划",
  "summary": "这份计划兼顾学习、运动和休息，整体强度适中。",
  "date_type": "tomorrow",
  "intensity": "standard",
  "schedule": [
    {
      "id": "item_1",
      "start_time": "08:00",
      "end_time": "08:30",
      "title": "起床与早餐",
      "description": "完成洗漱、简单早餐，让自己进入状态。",
      "type": "life",
      "priority": "low",
      "difficulty": "easy",
      "can_skip": false
    }
  ],
  "tips": ["上午优先处理需要专注的任务。"]
}`;
}

function buildUserPrompt(body: {
  input: string;
  intensity?: string;
  date?: string;
  wakeTime?: string;
  sleepTime?: string;
  preferences?: string;
}): string {
  const intensityMap: Record<string, string> = {
    "轻松模式": "relaxed",
    "标准模式": "standard",
    "高效模式": "efficient",
    "冲刺模式": "sprint",
  };

  const dateMap: Record<string, string> = {
    "今天": "today",
    "明天": "tomorrow",
  };

  return `用户偏好：
- 起床时间：${body.wakeTime || "08:00"}
- 睡觉时间：${body.sleepTime || "23:00"}
- 计划强度：${intensityMap[body.intensity || "标准模式"] || "standard"}
- 计划日期：${dateMap[body.date || "今天"] || "today"}
${body.preferences ? `- 额外偏好：${body.preferences}` : ""}

用户输入：
"${body.input}"

请严格按照 JSON Schema 输出，不要添加任何额外文字。`;
}

// ── 后端校验 ─────────────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validatePlan(plan: DailyPlan): ValidationResult {
  const errors: string[] = [];

  // 1. Check schedule not empty
  if (plan.schedule.length === 0) {
    errors.push("schedule 不能为空");
  }

  // 2. Check time ordering and overlaps
  for (let i = 0; i < plan.schedule.length; i++) {
    const item = plan.schedule[i];
    const start = timeToMinutes(item.start_time);
    const end = timeToMinutes(item.end_time);

    if (end <= start) {
      errors.push(`第 ${i + 1} 项 "${item.title}" 的结束时间必须晚于开始时间`);
    }

    if (i > 0) {
      const prevEnd = timeToMinutes(plan.schedule[i - 1].end_time);
      if (start < prevEnd) {
        errors.push(`第 ${i + 1} 项 "${item.title}" 与前一项时间重叠`);
      }
    }
  }

  // 3. Check has rest/break time
  const hasRest = plan.schedule.some((s) => s.type === "rest");
  if (!hasRest) {
    errors.push("计划中没有安排休息时间");
  }

  // 4. Check has life activities (meals etc)
  const hasLife = plan.schedule.some((s) => s.type === "life" || s.type === "meal");
  if (!hasLife) {
    errors.push("计划中没有包含吃饭等生活时间");
  }

  return { valid: errors.length === 0, errors };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// ── LLM 调用 ─────────────────────────────────────────────────────────────

function stripCodeFence(content: string): string {
  return content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.MIMO_API_KEY ?? process.env.AI_API_KEY;
  const baseUrl = (process.env.MIMO_API_BASE_URL ?? "https://token-plan-cn.xiaomimimo.com/v1").replace(/\/$/, "");
  const model = process.env.MIMO_MODEL ?? process.env.AI_MODEL ?? "mimo-v2.5";

  if (!apiKey) throw new Error("API key not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
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
    const err = await response.text().catch(() => "");
    throw new Error(`LLM API error: ${response.status} ${err}`);
  }

  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM returned empty content");
  return content;
}

async function generateWithRetry(systemPrompt: string, userPrompt: string): Promise<DailyPlan> {
  // First attempt
  const raw = await callLLM(systemPrompt, userPrompt);
  const parsed = JSON.parse(stripCodeFence(raw));
  let plan = DailyPlanSchema.parse(parsed);

  // Validate
  const validation = validatePlan(plan);
  if (validation.valid) return plan;

  // Auto-repair: ask LLM to fix
  const repairPrompt = `你刚才输出的 JSON 不符合要求。
问题：
${validation.errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}

原计划：
${JSON.stringify(plan, null, 2)}

请在不改变用户意图的前提下，修复为合法 JSON。只输出 JSON。`;

  const repaired = await callLLM(systemPrompt, repairPrompt);
  const repairedParsed = JSON.parse(stripCodeFence(repaired));
  plan = DailyPlanSchema.parse(repairedParsed);

  return plan;
}

// ── API Route ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.input || typeof body.input !== "string") {
    return NextResponse.json({ success: false, error: "input is required" }, { status: 400 });
  }

  try {
    const plan = await generateWithRetry(
      buildSystemPrompt(),
      buildUserPrompt(body),
    );

    const result = NextResponse.json({ success: true, data: plan });
    result.headers.set("Access-Control-Allow-Origin", "*");
    result.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    result.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plan generation failed";
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
