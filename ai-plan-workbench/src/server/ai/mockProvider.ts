import { addDays, formatISO, parseISO } from "date-fns";
import type { AiProvider, GeneratePlanRequest, OptimizePlanRequest } from "./provider";
import type { Phase, Plan, PlanTask } from "@/lib/plan/schema";

function ymd(date: Date): string {
  return formatISO(date, { representation: "date" });
}

function getGoalFocus(raw: string): string {
  const firstClause = raw.split(/[，,。.!！?？]/)[0] ?? raw;
  const focus = firstClause
    .replace(/^\s*(我想|我要|想要|想用|用)?\s*\d+\s*(?:天|day|days)\s*/i, "")
    .replace(/^\s*(学会|学习|掌握|备考|准备|提升|learn|study|prepare for|prepare)\s*/i, "")
    .replace(/\s*(?:in|for)\s*\d+\s*(?:day|days)\s*$/i, "")
    .trim();

  return focus || "这个目标";
}

const taskBank: Record<string, string[]> = {
  vocabulary: [
    "背诵核心词汇80个，并用3句话造句",
    "复习昨日词汇，完成一轮小测",
    "整理阅读生词，贴进错题本",
    "听力场景词汇专项记忆",
    "同义替换词组训练20组"
  ],
  listening: [
    "精听一段Section 1-2，标出听丢的词",
    "完成一套听力练习并复盘错题",
    "地图题和流程图题专项训练",
    "听写10分钟材料，检查连读弱点",
    "泛听英文材料20分钟，记录关键词"
  ],
  reading: [
    "限时完成一篇阅读，并标出定位词",
    "精读一篇文章，总结每段主旨",
    "判断题专项训练，复盘错误原因",
    "匹配题专项训练，整理解题步骤",
    "把阅读错题整理成一张复盘卡"
  ],
  writing: [
    "写一篇小作文，并用范文修改",
    "整理大作文高分句型10个",
    "完成一篇大作文提纲训练",
    "流程图/地图题写作专项训练",
    "整理连接词和替换表达"
  ],
  speaking: [
    "录一段Part 1回答并听回放",
    "Part 2独白练习2分钟",
    "Part 3深度问题回答训练",
    "整理10个口语高频表达",
    "模拟一次完整口语流程"
  ],
  mock_test: [
    "完成一次限时模考小套卷",
    "完成写作和口语模拟任务",
    "分析模考结果，标出最弱模块",
    "针对弱项做一次专项补救",
    "完成第二轮全真模拟"
  ],
  review: [
    "复盘本周错题和卡住的任务",
    "整理高频考点小纸条",
    "回看学习笔记并标出下周重点",
    "给下周计划留出缓冲日",
    "总结本周通关奖励和待补关卡"
  ],
  grammar: [
    "拆解5个长难句并标出主干",
    "完成语法专项练习20题",
    "整理今日长难句错因",
    "复习从句和非谓语用法",
    "把长难句翻译成自然中文"
  ],
  translation: [
    "翻译一段真题句子并对照答案",
    "整理5个常见翻译失分点",
    "完成段落翻译限时练习",
    "复盘翻译中的词义选择",
    "把错句改写一遍"
  ],
  past_paper: [
    "完成一组真题阅读并复盘",
    "整理真题高频词和固定搭配",
    "限时做一套真题小模块",
    "分析真题错题类型",
    "重做上周错过的真题"
  ],
  concept: [
    "学习一个核心概念并写成便签",
    "看完一节入门教程并记录步骤",
    "画出今天知识点的小地图",
    "完成概念自测题",
    "整理本阶段知识框架"
  ],
  practice: [
    "完成配套练习10题",
    "动手复现一个课堂示例",
    "独立完成一个小练习",
    "做一组专项训练题",
    "巩固一个核心技能"
  ],
  project: [
    "写下项目需求和完成标准",
    "搭建项目基础结构",
    "完成一个核心功能模块",
    "测试并修复一个问题",
    "整理项目总结和展示说明"
  ]
};

const skillTaskBank: Record<string, Array<(focus: string) => string>> = {
  concept: [
    (focus) => `学习 ${focus} 的一个核心概念，并写成自己的小纸条`,
    (focus) => `看完一节 ${focus} 入门教程，记录关键步骤`,
    (focus) => `画出 ${focus} 今天知识点的小地图`,
    (focus) => `完成 ${focus} 概念自测题`,
    (focus) => `整理 ${focus} 本阶段知识框架`
  ],
  practice: [
    (focus) => `完成一组 ${focus} 配套练习`,
    (focus) => `动手复现一个 ${focus} 课堂示例`,
    (focus) => `独立完成一个 ${focus} 小练习`,
    (focus) => `做一组 ${focus} 专项训练题`,
    (focus) => `巩固一个 ${focus} 核心技能`
  ],
  project: [
    (focus) => `写下 ${focus} 小项目需求和完成标准`,
    (focus) => `搭建 ${focus} 项目基础结构`,
    (focus) => `完成一个 ${focus} 核心功能模块`,
    (focus) => `测试并修复一个 ${focus} 练习问题`,
    (focus) => `整理 ${focus} 项目总结和展示说明`
  ],
  review: [
    (focus) => `复盘本周 ${focus} 错题和卡住的任务`,
    (focus) => `整理 ${focus} 高频知识点小纸条`,
    (focus) => `回看 ${focus} 学习笔记并标出下周重点`,
    (focus) => `给 ${focus} 下周计划留出缓冲日`,
    (focus) => `总结 ${focus} 本周通关奖励和待补关卡`
  ]
};

function getTaskTitle(category: string, phaseIndex: number, dayIndex: number, goalFocus: string): string {
  const focusedTasks = skillTaskBank[category];
  if (focusedTasks) {
    return focusedTasks[(phaseIndex * 5 + dayIndex) % focusedTasks.length](goalFocus);
  }

  const tasks = taskBank[category] ?? taskBank.practice;
  return tasks[(phaseIndex * 5 + dayIndex) % tasks.length];
}

export function createMockAiProvider(): AiProvider {
  return {
    async generatePlan({ parsed, template }: GeneratePlanRequest): Promise<Plan> {
      const start = parseISO(parsed.startDate ?? "2026-06-02");
      const phaseLength = Math.max(7, Math.floor(parsed.durationDays / template.phaseTitles.length));
      const goalFocus = getGoalFocus(parsed.raw);

      const phases: Phase[] = template.phaseTitles.map((title, index) => {
        const phaseStart = addDays(start, index * phaseLength);
        const phaseEnd = addDays(phaseStart, phaseLength - 1);
        return {
          id: `phase_${index + 1}`,
          title,
          startDate: ymd(phaseStart),
          endDate: ymd(phaseEnd),
          objective: `这一关围绕 ${goalFocus} 训练 ${template.categories[index % template.categories.length]}，先稳住节奏，再慢慢加速。`,
          tasks: []
        };
      });

      const tasks: PlanTask[] = [];
      phases.forEach((phase, phaseIndex) => {
        for (let day = 0; day < 5; day += 1) {
          const category = template.categories[(phaseIndex + day) % template.categories.length];
          const task: PlanTask = {
            id: `task_${phaseIndex + 1}_${day + 1}`,
            title: getTaskTitle(category, phaseIndex, day, goalFocus),
            description: `围绕 ${goalFocus} 完成 ${category} 小关卡，结束前写下一个收获和一个卡点。`,
            date: ymd(addDays(parseISO(phase.startDate), day)),
            durationMinutes: Math.min(template.defaultTaskMinutes, parsed.dailyAvailableMinutes),
            category,
            priority: day < 3 ? "high" : "medium",
            status: "todo",
            dependsOn: [],
            source: "ai_generated"
          };
          tasks.push(task);
          phase.tasks.push(task.id);
        }
      });

      return {
        id: `plan_${Date.now()}`,
        version: 1,
        validationStatus: "valid",
        goal: {
          title: parsed.raw,
          type: parsed.goalType,
          durationUncertain: parsed.durationUncertain,
          startDate: ymd(start),
          targetDate: ymd(addDays(start, parsed.durationDays)),
          currentLevel: parsed.currentLevel,
          targetLevel: parsed.targetLevel,
          dailyAvailableMinutes: parsed.dailyAvailableMinutes
        },
        brief: {
          summary: `文字版规划：这份${parsed.durationDays}天计划会先把目标拆成阶段关卡，再把每个阶段拆成每日任务卡。当前版本基于用户输入和“${template.name}”模板生成，适合先做原型验证；接入真实大模型后，这里会加入联网检索、资料来源和更细的理由说明。`,
          assumptions: [
            `默认从${ymd(start)}开始执行，共${parsed.durationDays}天。`,
            parsed.durationUncertain ? "用户尚未确定总备考周期，当前先生成30天滚动计划，后续可继续延展。" : "",
            `默认每天可投入${parsed.dailyAvailableMinutes}分钟。`,
            "当前原型使用内部模板生成，不直接保证考试结果。"
          ].filter(Boolean),
          sources: [
            {
              type: "template",
              title: template.name,
              note: "提供阶段结构、任务类别和默认任务时长。"
            },
            {
              type: "user_input",
              title: "用户目标",
              note: parsed.raw
            }
          ]
        },
        phases,
        tasks,
        risks: [],
        history: []
      };
    },

    async optimizePlan({ plan, selectedTaskIds, instruction }: OptimizePlanRequest): Promise<Plan> {
      const selected = new Set(selectedTaskIds);
      return {
        ...plan,
        tasks: plan.tasks.map((task) =>
          selected.has(task.id)
            ? {
                ...task,
                title: `${task.title}（同桌改过：${instruction}）`,
                source: "ai_optimized"
              }
            : task
        )
      };
    }
  };
}
