import { z } from "zod";
import { PlanBriefSchema, TaskPrioritySchema } from "@/lib/plan/schema";
import { mergePlanSources } from "@/lib/plan/referenceSources";
import type { AiProvider, GeneratePlanRequest, OptimizePlanRequest } from "./provider";
import { createMockAiProvider } from "./mockProvider";

// ── Structured plan generation (new) ─────────────────────────────────────

export type StructuredPlanParams = {
  goal: string;
  dailyTime: number;       // hours
  startDate: string;       // YYYY-MM-DD
  level: string;
  supplement: string;
};

const StructuredTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  priority: TaskPrioritySchema,
  durationMinutes: z.number().int().positive(),
});

const StructuredPhaseSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  tasks: z.array(StructuredTaskSchema),
});

const StructuredPlanResponseSchema = z.object({
  summary: z.string().min(1),
  assumptions: z.array(z.string()),
  phases: z.array(StructuredPhaseSchema).min(1),
});

type StructuredPlanResponse = z.infer<typeof StructuredPlanResponseSchema>;

function buildStructuredSystemPrompt(): string {
  return [
    "你是一位专业的计划教练，擅长根据用户目标制定个性化、可执行的学习/训练/项目计划。",
    "你必须只输出 JSON，不要输出 Markdown，不要输出解释性前后缀。",
    "",
    "## 输出格式",
    "JSON 必须包含以下字段：",
    "- summary: 一句话说明这个计划的核心思路（给用户看的，20字以内）",
    "- assumptions: 计划的默认假设（数组）",
    "- phases: 阶段数组，每个阶段包含 title、objective、tasks",
    "",
    "## 阶段设计规则",
    "- 根据总天数自动拆分为 3-5 个阶段",
    "- 每个阶段有明确的目标和递进关系",
    "- 阶段名称要生动有画面感，不要用'第一阶段'这种编号",
    "",
    "## 任务标题规则",
    "- 每天 1 个任务，每个任务标题必须**独特**，绝不允许重复",
    "- 标题必须包含**具体动作 + 具体对象 + 具体量**",
    "- 好例子：'平板支撑3组×30秒，组间休息30秒'、'做2023年考研英语真题Text 1并逐句翻译'、'学会用Python写一个猜数字游戏'",
    "- 坏例子：'上肢训练'、'阅读练习'、'学习Python'、'健康饮食'",
    "- 每个任务的 durationMinutes 必须在用户每天可用时间范围内",
    "",
    "## 任务描述规则（极其重要）",
    "- 描述是用户执行任务的**完整指南**，必须包含以下所有内容：",
    "  1. 具体做什么（动作拆解，如'先做5分钟热身，然后做3组深蹲每组15个'）",
    "  2. 用什么材料/工具/App（如'打开Keep App搜索HIIT训练'、'用百词斩背单词'）",
    "  3. 预期产出或衡量标准（如'目标心率130-150之间'、'至少写100字的短文'）",
    "  4. 小贴士或注意事项（如'如果膝盖不适就换成靠墙静蹲'）",
    "- 描述至少 50 字，越具体越好",
    "",
    "## 任务递进规则",
    "- 任务之间要有**递进关系**，后面的建立在前面的基础上",
    "- 根据用户的基础水平调整难度：零基础从简单开始，有基础可以跳过入门",
    "",
    "## 绝对不要",
    "- 不要输出'上肢''下肢''健康饮食'这种只有名词没有动作的标题",
    "- 不要输出'复习昨天内容''完成练习题'这种泛泛的任务",
    "- 不要出现两个相同的任务标题",
    "- 不要输出与用户目标无关的通用任务"
  ].join("\n");
}

function buildStructuredUserPrompt(params: StructuredPlanParams): string {
  const durationMatch = params.goal.match(/(\d+)\s*(?:天|日|day)/i);
  const durationDays = durationMatch ? parseInt(durationMatch[1]) : 30;

  return JSON.stringify({
    task: "根据用户的详细需求生成一份个性化计划。每个任务都必须独特且递进。",
    userNeeds: {
      goal: params.goal,
      totalDays: durationDays,
      dailyTimeHours: params.dailyTime,
      startDate: params.startDate,
      currentLevel: params.level || "未说明",
      supplement: params.supplement || "无",
    },
    outputRequirements: {
      language: "zh-CN",
      taskCount: durationDays,
      phaseCount: durationDays <= 14 ? 3 : 4,
      taskDurationRange: `每个任务 ${Math.round(params.dailyTime * 60 * 0.5)}-${Math.round(params.dailyTime * 60 * 0.9)} 分钟`,
      outputShape: {
        summary: "string (20字以内)",
        assumptions: ["string"],
        phases: [{
          title: "string (阶段名称，要有画面感)",
          objective: "string (阶段目标，具体说明这个阶段要达成什么)",
          tasks: [{
            title: "string (具体可执行的任务标题)",
            description: "string (具体做法和预期产出)",
            category: "string (practice/review/study/test 中选一个)",
            priority: "'high' 或 'medium'",
            durationMinutes: "number"
          }]
        }]
      }
    }
  }, null, 2);
}

export function generateStructuredPlan(params: StructuredPlanParams, options: MimoProviderOptions = {}): Promise<StructuredPlanResponse> {
  const apiKey = options.apiKey ?? process.env.MIMO_API_KEY ?? process.env.AI_API_KEY;
  const baseUrl = (options.baseUrl ?? process.env.MIMO_API_BASE_URL ?? defaultBaseUrl).replace(/\/$/, "");
  const model = options.model ?? process.env.MIMO_MODEL ?? process.env.AI_MODEL ?? defaultModel;
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 90000;

  if (!apiKey) {
    throw new Error("MIMO_API_KEY or AI_API_KEY is required.");
  }

  return callMimoStructured(fetcher, baseUrl, apiKey, model, timeoutMs, params);
}

async function callMimoStructured(
  fetcher: typeof fetch,
  baseUrl: string,
  apiKey: string,
  model: string,
  timeoutMs: number,
  params: StructuredPlanParams,
): Promise<StructuredPlanResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetcher(`${baseUrl}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildStructuredSystemPrompt() },
        { role: "user", content: buildStructuredUserPrompt(params) },
      ],
      max_completion_tokens: 8192,
      temperature: 0.7,
      top_p: 0.9,
      thinking: { type: "disabled" },
      response_format: { type: "json_object" },
      stream: false,
    }),
  }).catch((error) => {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`请求超过 ${Math.round(timeoutMs / 1000)} 秒未返回，请稍后重试。`);
    }
    throw error;
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as ChatCompletionResponse;
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("API response did not include message content.");
  }

  const parsed = JSON.parse(stripCodeFence(content));
  return StructuredPlanResponseSchema.parse(parsed);
}

type MimoProviderOptions = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const defaultBaseUrl = "https://token-plan-cn.xiaomimimo.com/v1";
const defaultModel = "mimo-v2.5";
const MimoPlanContentSchema = PlanBriefSchema.extend({
  phaseObjectives: z.array(z.string().min(1)).optional(),
  taskTitles: z.array(z.string().min(1)).optional(),
  taskDescriptions: z.array(z.string().min(1)).optional()
});

type MimoPlanContent = z.infer<typeof MimoPlanContentSchema>;

const MimoOptimizeContentSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional()
    })
  )
});

type MimoOptimizeContent = z.infer<typeof MimoOptimizeContentSchema>;

function stripCodeFence(content: string): string {
  return content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function buildSystemPrompt(): string {
  return [
    "你是 MiMo，一个负责生成计划的 Plan Agent。",
    "你必须只输出 JSON，不要输出 Markdown，不要输出解释性前后缀。",
    "JSON 需要包含 summary、assumptions、sources、phaseObjectives、taskTitles。",
    "summary 是给用户阅读的文字版规划说明。",
    "assumptions 是这份计划使用的默认假设。",
    "sources 是规划依据，至少包含一个 model 来源。",
    "如果你使用了可公开访问的参考资料，sources 中要写入 url；不确定的网址不要编造。",
    "phaseObjectives 是每个阶段的具体目标，必须贴合用户目标。",
    "taskTitles 是每日任务标题，必须具体、可执行、能直接显示在计划图表里。",
    "taskDescriptions 是每日任务说明，说明具体做法、材料或产出。",
    "不要输出泛泛的模板任务；要写清楚对象、动作和产出。",
    "只描述计划假设和执行建议，不要承诺结果。"
  ].join("\n");
}

function buildOptimizeSystemPrompt(): string {
  return [
    "你是 MiMo，一个负责微调任务卡的 Plan Agent。",
    "你必须只输出 JSON，不要输出 Markdown。",
    "JSON 只包含 updates。",
    "updates 中每一项包含 id、title、description。",
    "只能更新用户 selectedTaskIds 指定的任务，不要改其他任务。",
    "title 要短而具体，description 要说明做法、材料或产出。"
  ].join("\n");
}

function buildTaskSlots(request: GeneratePlanRequest) {
  return request.template.phaseTitles.flatMap((phaseTitle, phaseIndex) =>
    Array.from({ length: 5 }, (_, dayIndex) => ({
      phase: phaseIndex + 1,
      phaseTitle,
      dayInPhase: dayIndex + 1,
      category: request.template.categories[(phaseIndex + dayIndex) % request.template.categories.length]
    }))
  );
}

function buildGenerateUserPrompt(request: GeneratePlanRequest): string {
  const taskSlots = buildTaskSlots(request);

  return JSON.stringify(
    {
      task: "根据用户目标和模板生成一份可编辑、可校验的计划内容。应用会负责日期、校验和图表结构，你负责生成真正贴合目标的阶段目标和每日任务标题。",
      parsedGoal: request.parsed,
      template: request.template,
      taskSlots,
      outputRequirements: {
        language: "zh-CN",
        planStyle: "可爱闯关计划",
        phaseObjectiveCount: request.template.phaseTitles.length,
        taskTitleCount: taskSlots.length,
        taskTitleRules: [
          "每个 taskTitle 对应 taskSlots 同一顺序的一个任务。",
          "每个标题必须包含用户目标中的关键对象，或清楚指向该目标的具体模块。",
          "每个标题要能在 30-90 分钟内执行。",
          "不要给出空泛标题。"
        ],
        outputShape: {
          summary: "string",
          assumptions: ["string"],
          sources: [{ type: "model | retrieval", title: "string", note: "string", url: "optional URL string" }],
          phaseObjectives: ["string"],
          taskTitles: ["string"],
          taskDescriptions: ["string"]
        },
        sourceTypes: ["model"]
      }
    },
    null,
    2
  );
}

function buildOptimizeUserPrompt(request: OptimizePlanRequest): string {
  return JSON.stringify(
    {
      task: "根据用户指令优化选中的任务卡。",
      instruction: request.instruction,
      selectedTaskIds: request.selectedTaskIds,
      selectedTasks: request.plan.tasks.filter((task) => request.selectedTaskIds.includes(task.id)),
      goal: request.plan.goal,
      outputShape: {
        updates: [{ id: "task id", title: "string", description: "string" }]
      }
    },
    null,
    2
  );
}

export function createMimoAiProvider(options: MimoProviderOptions = {}): AiProvider {
  const apiKey = options.apiKey ?? process.env.MIMO_API_KEY ?? process.env.AI_API_KEY;
  const baseUrl = (options.baseUrl ?? process.env.MIMO_API_BASE_URL ?? defaultBaseUrl).replace(/\/$/, "");
  const model = options.model ?? process.env.MIMO_MODEL ?? process.env.AI_MODEL ?? defaultModel;
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 45000;

  if (!apiKey) {
    throw new Error("MIMO_API_KEY or AI_API_KEY is required when AI_PROVIDER=mimo.");
  }
  const resolvedApiKey = apiKey;

  async function callMimoJson<T>(systemPrompt: string, userPrompt: string, schema: z.ZodType<T>): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetcher(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-key": resolvedApiKey
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 8192,
        temperature: 0.4,
        top_p: 0.9,
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        stream: false
      })
    }).catch((error) => {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`MiMo 请求超过 ${Math.round(timeoutMs / 1000)} 秒未返回，请检查 base URL、API key 或稍后重试。`);
      }
      throw error;
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`MiMo API request failed: ${response.status} ${errorText}`);
    }

    const json = (await response.json()) as ChatCompletionResponse;
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("MiMo API response did not include message content.");
    }

    const parsed = JSON.parse(stripCodeFence(content));
    return schema.parse(parsed);
  }

  async function callMimoPlanContent(userPrompt: string): Promise<MimoPlanContent> {
    return callMimoJson(buildSystemPrompt(), userPrompt, MimoPlanContentSchema);
  }

  async function callMimoOptimizeContent(userPrompt: string): Promise<MimoOptimizeContent> {
    return callMimoJson(buildOptimizeSystemPrompt(), userPrompt, MimoOptimizeContentSchema);
  }

  return {
    async generatePlan(request) {
      const basePlan = await createMockAiProvider().generatePlan(request);
      const aiContent = await callMimoPlanContent(buildGenerateUserPrompt(request));
      return {
        ...basePlan,
        phases: basePlan.phases.map((phase, index) => ({
          ...phase,
          objective: aiContent.phaseObjectives?.[index]?.trim() || phase.objective
        })),
        tasks: basePlan.tasks.map((task, index) => ({
          ...task,
          title: aiContent.taskTitles?.[index]?.trim() || task.title,
          description: aiContent.taskDescriptions?.[index]?.trim() || task.description,
          source: aiContent.taskTitles?.[index]?.trim() ? "ai_generated" : task.source
        })),
        brief: {
          summary: aiContent.summary,
          assumptions: aiContent.assumptions,
          sources: mergePlanSources([
            {
              type: "user_input",
              title: "用户目标",
              note: request.parsed.raw
            },
            {
              type: "template",
              title: request.template.name,
              note: "本地模板用于生成阶段、任务卡和计划图表。"
            },
            ...aiContent.sources
          ], [])
        }
      };
    },
    async optimizePlan(request) {
      const content = await callMimoOptimizeContent(buildOptimizeUserPrompt(request));
      const selected = new Set(request.selectedTaskIds);
      const updates = new Map(content.updates.map((update) => [update.id, update]));

      return {
        ...request.plan,
        tasks: request.plan.tasks.map((task) => {
          const update = updates.get(task.id);
          if (!selected.has(task.id) || !update) return task;
          return {
            ...task,
            title: update.title ?? task.title,
            description: update.description ?? task.description,
            source: "ai_optimized"
          };
        })
      };
    }
  };
}
