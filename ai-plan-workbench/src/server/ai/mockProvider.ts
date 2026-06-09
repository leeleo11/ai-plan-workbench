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
    .replace(/^\s*(学会|学习|掌握|养成|坚持|完成|做好|准备|提升|learn|study|prepare for|prepare|build|finish)\s*/i, "")
    .replace(/\s*(?:in|for)\s*\d+\s*(?:day|days)\s*$/i, "")
    .trim();

  return focus || "这个目标";
}

const taskBank: Record<string, string[]> = {
  learn: [
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
  review: [
    "复盘本周错题和卡住的任务",
    "整理高频知识点小纸条",
    "回看学习笔记并标出下周重点",
    "给下周计划留出缓冲日",
    "总结本周通关奖励和待补关卡"
  ],
  project: [
    "写下项目需求和完成标准",
    "搭建项目基础结构",
    "完成一个核心功能模块",
    "测试并修复一个问题",
    "整理项目总结和展示说明"
  ],
  plan: [
    "列出目标和关键里程碑",
    "拆解第一步任务并写成待办",
    "确认所需资源和工具",
    "设定每日最低执行标准",
    "画出本周执行路线图"
  ],
  build: [
    "完成一个最小可用版本",
    "实现核心功能",
    "处理一个已知问题",
    "添加基本错误处理",
    "写一段使用说明"
  ],
  test: [
    "跑一轮基础测试",
    "记录发现的问题并分级",
    "修复一个高优先级 bug",
    "验证上次修复是否生效",
    "整理测试报告"
  ],
  daily: [
    "完成今天的最小执行单元",
    "记录执行感受和耗时",
    "调整明天的执行计划",
    "给自己一个完成奖励",
    "写下今天的坚持心得"
  ],
  adjust: [
    "回顾本周执行情况",
    "找出最大的阻力点",
    "调整下周的执行节奏",
    "降低一个过高的标准",
    "增加一个正向激励"
  ],
  warmup: [
    "做5分钟热身活动",
    "检查今天的身体状态",
    "准备训练所需的装备",
    "回顾上次训练的感受",
    "设定今天的训练目标"
  ],
  core: [
    "完成今天的核心训练",
    "记录训练数据",
    "注意呼吸和姿势",
    "适当增加一点强度",
    "记录训练后的感受"
  ],
  cooldown: [
    "做5分钟拉伸放松",
    "补充水分和营养",
    "记录今天的训练总结",
    "安排明天的休息计划",
    "给自己的表现打个分"
  ],
  research: [
    "搜集3个相关资料",
    "阅读一篇行业文章",
    "记录关键发现",
    "整理成可分享的笔记",
    "列出下一步行动项"
  ],
  apply: [
    "完成一次实际应用",
    "记录应用过程和结果",
    "收集反馈并整理",
    "改进一个可优化的点",
    "分享你的经验和收获"
  ]
};

const focusTaskBank: Record<string, Array<(focus: string) => string>> = {
  learn: [
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
  daily: [
    (focus) => `完成今天的 ${focus} 最小执行单元`,
    (focus) => `记录 ${focus} 执行感受和耗时`,
    (focus) => `调整明天的 ${focus} 执行计划`,
    (focus) => `给自己一个 ${focus} 完成奖励`,
    (focus) => `写下今天的 ${focus} 坚持心得`
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
  const focusedTasks = focusTaskBank[category];
  if (focusedTasks) {
    return focusedTasks[(phaseIndex * 5 + dayIndex) % focusedTasks.length](goalFocus);
  }

  const tasks = taskBank[category] ?? taskBank.learn;
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
          type: parsed.goalCategory,
          durationUncertain: parsed.durationUncertain,
          startDate: ymd(start),
          targetDate: ymd(addDays(start, parsed.durationDays)),
          currentLevel: parsed.currentLevel,
          targetLevel: parsed.targetLevel,
          dailyAvailableMinutes: parsed.dailyAvailableMinutes
        },
        brief: {
          summary: `文字版规划：这份${parsed.durationDays}天计划会先把目标拆成阶段关卡，再把每个阶段拆成每日任务卡。当前版本基于用户输入和"${template.name}"模板生成，适合先做原型验证；接入真实大模型后，这里会加入联网检索、资料来源和更细的理由说明。`,
          assumptions: [
            `默认从${ymd(start)}开始执行，共${parsed.durationDays}天。`,
            parsed.durationUncertain ? "用户尚未确定总周期，当前先生成30天滚动计划，后续可继续延展。" : "",
            `默认每天可投入${parsed.dailyAvailableMinutes}分钟。`,
            "当前原型使用内部模板生成，不直接保证结果。"
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
