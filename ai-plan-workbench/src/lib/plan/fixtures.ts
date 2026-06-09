import type { Plan } from "./schema";

export const samplePlan: Plan = {
  id: "plan_python_30",
  version: 1,
  validationStatus: "valid",
  goal: {
    title: "30天学会 Python 数据分析",
    type: "learning",
    startDate: "2026-06-01",
    targetDate: "2026-07-01",
    currentLevel: "会一点基础语法",
    targetLevel: "能独立完成一个小项目",
    dailyAvailableMinutes: 60
  },
  brief: {
    summary: "文字版规划：这是一份30天Python数据分析学习计划，先打基础，再练实操，最后做项目收尾。",
    assumptions: ["默认用户每天可学习1小时。", "默认先使用内部学习模板，不联网查询资料。"],
    sources: [
      {
        type: "template",
        title: "学习计划模板",
        note: "用于生成阶段结构、任务类别和默认节奏。"
      }
    ]
  },
  phases: [
    {
      id: "phase_basics",
      title: "入门补给站",
      startDate: "2026-06-01",
      endDate: "2026-06-08",
      objective: "学习 Python 数据分析基础概念和工具。",
      tasks: ["task_learn_1", "task_practice_1"]
    }
  ],
  tasks: [
    {
      id: "task_learn_1",
      title: "学习 Python 数据分析的一个核心概念",
      description: "了解 pandas DataFrame 的基本操作。",
      date: "2026-06-01",
      durationMinutes: 45,
      category: "learn",
      priority: "high",
      status: "todo",
      dependsOn: [],
      source: "ai_generated"
    },
    {
      id: "task_practice_1",
      title: "完成一组 Python 数据分析配套练习",
      description: "用 pandas 处理一个 CSV 文件。",
      date: "2026-06-02",
      durationMinutes: 45,
      category: "practice",
      priority: "high",
      status: "todo",
      dependsOn: [],
      source: "ai_generated"
    }
  ],
  risks: [],
  history: []
};
