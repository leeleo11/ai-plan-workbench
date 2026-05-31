import { addDays, formatISO, parseISO } from "date-fns";
import type { AiProvider, GeneratePlanRequest, OptimizePlanRequest } from "./provider";
import type { Phase, Plan, PlanTask } from "@/lib/plan/schema";

function ymd(date: Date): string {
  return formatISO(date, { representation: "date" });
}

const ieltsTasks: Record<string, string[]> = {
  vocabulary: [
    "背诵雅思核心词汇50个（教育类）",
    "复习昨日词汇并完成词汇测试",
    "学习同义词替换20组",
    "整理阅读中的生词并背诵",
    "听力场景词汇专项记忆"
  ],
  listening: [
    "精听剑桥雅思听力Section 1-2",
    "练习听力笔记速记技巧",
    "做一套听力真题并分析错题",
    "练习地图题和流程图题",
    "泛听BBC纪录片30分钟"
  ],
  reading: [
    "完成一篇阅读真题（限时20分钟）",
    "精读一篇学术文章并总结段落大意",
    "练习判断题（T/F/NG）技巧",
    "做一篇阅读匹配题专项训练",
    "分析阅读错题并整理错题本"
  ],
  writing: [
    "练习小作文（图表描述）一篇",
    "背诵大作文高分句型10个",
    "写一篇大作文并对照范文修改",
    "练习流程图和地图题写作",
    "整理写作常用连接词和短语"
  ],
  speaking: [
    "练习Part 1话题（家乡、学习、工作）",
    "录音练习Part 2独白2分钟",
    "练习Part 3深度讨论回答",
    "背诵10个高分口语表达",
    "模拟口语考试全流程"
  ],
  mock_test: [
    "完成一套完整雅思模考（听力+阅读）",
    "完成写作+口语模考",
    "分析模考成绩并制定改进计划",
    "针对弱项进行专项训练",
    "第二次全真模考"
  ],
  review: [
    "复习本周所有错题",
    "整理并复习高频考点",
    "回顾学习笔记和重点标注",
    "制定下周学习计划",
    "总结本周学习成果和不足"
  ]
};

const genericTasks: Record<string, string[]> = {
  concept: [
    "学习基础概念并做笔记",
    "阅读入门教程第一章",
    "观看教学视频并记录要点",
    "完成概念测试题",
    "整理知识框架图"
  ],
  practice: [
    "完成配套练习题20道",
    "动手实践课堂示例",
    "独立完成一个小练习项目",
    "做一组专项训练题",
    "练习并巩固核心技能"
  ],
  project: [
    "完成项目需求分析",
    "搭建项目基础框架",
    "实现核心功能模块",
    "测试并修复bug",
    "项目总结和代码复盘"
  ],
  review: [
    "复习本周学习内容",
    "整理学习笔记",
    "完成知识测验",
    "查漏补缺重点难点",
    "制定下周学习计划"
  ]
};

function getTaskTitle(category: string, phaseIndex: number, dayIndex: number, template: string): string {
  const taskMap = template.includes("IELTS") ? ieltsTasks : genericTasks;
  const categoryTasks = taskMap[category] ?? taskMap.concept ?? genericTasks.concept;
  return categoryTasks[(phaseIndex * 5 + dayIndex) % categoryTasks.length];
}

export function createMockAiProvider(): AiProvider {
  return {
    async generatePlan({ parsed, template }: GeneratePlanRequest): Promise<Plan> {
      const start = parseISO("2026-06-01");
      const phaseLength = Math.max(7, Math.floor(parsed.durationDays / template.phaseTitles.length));

      const phases: Phase[] = template.phaseTitles.map((title, index) => {
        const phaseStart = addDays(start, index * phaseLength);
        const phaseEnd = addDays(phaseStart, phaseLength - 1);
        return {
          id: `phase_${index + 1}`,
          title,
          startDate: ymd(phaseStart),
          endDate: ymd(phaseEnd),
          objective: `${title}阶段：专注${template.categories[index % template.categories.length]}训练`,
          tasks: []
        };
      });

      const tasks: PlanTask[] = [];
      phases.forEach((phase, phaseIndex) => {
        for (let day = 0; day < 5; day += 1) {
          const category = template.categories[(phaseIndex + day) % template.categories.length];
          const task: PlanTask = {
            id: `task_${phaseIndex + 1}_${day + 1}`,
            title: getTaskTitle(category, phaseIndex, day, template.name),
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
          targetDate: ymd(addDays(start, parsed.durationDays)),
          currentLevel: parsed.currentLevel,
          targetLevel: parsed.targetLevel,
          dailyAvailableMinutes: parsed.dailyAvailableMinutes
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
                title: `${task.title}（已优化：${instruction}）`,
                source: "ai_optimized"
              }
            : task
        )
      };
    }
  };
}
