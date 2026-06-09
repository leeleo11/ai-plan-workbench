import type { ParsedGoalInput } from "./parser";

export type PlanTemplate = {
  id: "ielts_foundation" | "postgraduate_english" | "generic_skill";
  name: string;
  goalType: "exam" | "skill";
  phaseTitles: string[];
  categories: string[];
  defaultTaskMinutes: number;
};

export const planTemplates: PlanTemplate[] = [
  {
    id: "ielts_foundation",
    name: "雅思备考",
    goalType: "exam",
    phaseTitles: ["基础补给站", "技能训练场", "模考挑战区", "考前回血屋"],
    categories: ["vocabulary", "listening", "reading", "writing", "speaking", "mock_test", "review"],
    defaultTaskMinutes: 45
  },
  {
    id: "postgraduate_english",
    name: "考研英语备考",
    goalType: "exam",
    phaseTitles: ["词汇语法打底", "阅读真题训练", "写作翻译强化", "套卷冲刺复盘"],
    categories: ["vocabulary", "grammar", "reading", "writing", "translation", "past_paper", "review"],
    defaultTaskMinutes: 45
  },
  {
    id: "generic_skill",
    name: "技能学习",
    goalType: "skill",
    phaseTitles: ["入门补给站", "练习训练场", "作品挑战区", "复盘升级屋"],
    categories: ["concept", "practice", "project", "review"],
    defaultTaskMinutes: 50
  }
];

export function selectTemplate(parsed: ParsedGoalInput): PlanTemplate {
  if (parsed.examKeyword === "ielts") return planTemplates[0];
  if (parsed.examKeyword === "postgraduate_english") return planTemplates[1];
  return planTemplates[2];
}
