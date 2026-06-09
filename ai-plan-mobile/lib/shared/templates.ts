import type { GoalCategory } from "./parser";

export type PlanTemplate = {
  id: string;
  name: string;
  goalCategory: GoalCategory;
  phaseTitles: string[];
  categories: string[];
  defaultTaskMinutes: number;
};

export const planTemplates: PlanTemplate[] = [
  {
    id: "learning",
    name: "学习计划",
    goalCategory: "learning",
    phaseTitles: ["入门补给站", "练习训练场", "进阶挑战区", "复盘总结屋"],
    categories: ["learn", "practice", "review", "project"],
    defaultTaskMinutes: 45
  },
  {
    id: "project",
    name: "项目计划",
    goalCategory: "project",
    phaseTitles: ["规划期", "执行期", "收尾期", "复盘期"],
    categories: ["plan", "build", "test", "review"],
    defaultTaskMinutes: 50
  },
  {
    id: "habit",
    name: "习惯养成",
    goalCategory: "habit",
    phaseTitles: ["启动期", "坚持期", "巩固期", "内化期"],
    categories: ["daily", "practice", "review", "adjust"],
    defaultTaskMinutes: 30
  },
  {
    id: "health",
    name: "健康计划",
    goalCategory: "health",
    phaseTitles: ["适应期", "提升期", "巩固期", "维持期"],
    categories: ["warmup", "core", "cooldown", "review"],
    defaultTaskMinutes: 40
  },
  {
    id: "career",
    name: "职业发展",
    goalCategory: "career",
    phaseTitles: ["调研期", "准备期", "执行期", "复盘期"],
    categories: ["research", "practice", "apply", "review"],
    defaultTaskMinutes: 45
  },
  {
    id: "custom",
    name: "通用计划",
    goalCategory: "custom",
    phaseTitles: ["准备期", "执行期", "调整期", "总结期"],
    categories: ["plan", "execute", "adjust", "review"],
    defaultTaskMinutes: 40
  }
];

export function selectTemplate(goalCategory: GoalCategory): PlanTemplate {
  return planTemplates.find((t) => t.goalCategory === goalCategory) ?? planTemplates[0];
}
