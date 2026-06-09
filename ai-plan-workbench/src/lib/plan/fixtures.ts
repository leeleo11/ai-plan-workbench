import type { Plan } from "./schema";

export const samplePlan: Plan = {
  id: "plan_ielts_90",
  version: 1,
  validationStatus: "valid",
  goal: {
    title: "90-day IELTS plan to reach 7.0",
    type: "exam",
    startDate: "2026-06-01",
    targetDate: "2026-09-01",
    currentLevel: "5.5",
    targetLevel: "7.0",
    dailyAvailableMinutes: 120
  },
  brief: {
    summary: "文字版规划：这是一份90天雅思备考计划，先打基础，再进入专项训练，最后用模考和复盘收尾。",
    assumptions: ["默认用户每天可学习2小时。", "默认先使用内部雅思备考模板，不联网查询考试政策。"],
    sources: [
      {
        type: "template",
        title: "雅思备考内部模板",
        note: "用于生成阶段结构、任务类别和默认节奏。"
      }
    ]
  },
  phases: [
    {
      id: "phase_foundation",
      title: "Foundation",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      objective: "Build vocabulary, grammar, listening, and reading foundations.",
      tasks: ["task_vocab_1", "task_reading_1"]
    }
  ],
  tasks: [
    {
      id: "task_vocab_1",
      title: "Memorize 80 core vocabulary words",
      date: "2026-06-01",
      durationMinutes: 40,
      category: "vocabulary",
      priority: "high",
      status: "todo",
      dependsOn: [],
      source: "ai_generated"
    },
    {
      id: "task_reading_1",
      title: "Complete one IELTS reading passage and review mistakes",
      date: "2026-06-01",
      durationMinutes: 60,
      category: "reading",
      priority: "high",
      status: "todo",
      dependsOn: [],
      source: "ai_generated"
    }
  ],
  risks: [],
  history: []
};
