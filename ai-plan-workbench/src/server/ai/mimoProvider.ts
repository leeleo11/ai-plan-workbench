import { z } from "zod";
import { PlanBriefSchema } from "@/lib/plan/schema";
import { mergePlanSources } from "@/lib/plan/referenceSources";
import type { AiProvider, GeneratePlanRequest, OptimizePlanRequest } from "./provider";
import { createMockAiProvider } from "./mockProvider";

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
    "你是 MiMo，一个负责生成学习计划的 Plan Agent。",
    "你必须只输出 JSON，不要输出 Markdown，不要输出解释性前后缀。",
    "JSON 需要包含 summary、assumptions、sources、phaseObjectives、taskTitles。",
    "summary 是给用户阅读的文字版规划说明。",
    "assumptions 是这份计划使用的默认假设。",
    "sources 是规划依据，至少包含一个 model 来源。",
    "如果你使用了可公开访问的参考资料，sources 中要写入 url；不确定的网址不要编造。",
    "phaseObjectives 是每个阶段的具体目标，必须贴合用户目标、当前水平和目标水平。",
    "taskTitles 是每日任务标题，必须具体、可执行、能直接显示在计划图表里。",
    "taskDescriptions 是每日任务说明，说明具体做法、材料或产出。",
    "不要输出泛泛的模板任务，例如“学习一个核心概念”；要写清楚学习对象、动作和产出。",
    "不要承诺考试结果，只描述计划假设和执行建议。"
  ].join("\n");
}

function buildOptimizeSystemPrompt(): string {
  return [
    "你是 MiMo，一个负责微调学习任务卡的 Plan Agent。",
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
      task: "根据用户目标和模板生成一份可编辑、可校验的学习计划内容。应用会负责日期、校验和图表结构，你负责生成真正贴合目标的阶段目标和每日任务标题。",
      parsedGoal: request.parsed,
      template: request.template,
      taskSlots,
      outputRequirements: {
        language: "zh-CN",
        planStyle: "可爱学习闯关计划",
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
        max_completion_tokens: 2048,
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
