import type { Plan } from "./schema";

export const samplePlan: Plan = {
  id: "plan_ielts_90",
  version: 1,
  validationStatus: "valid",
  goal: {
    title: "90-day IELTS plan to reach 7.0",
    type: "exam",
    targetDate: "2026-09-01",
    currentLevel: "5.5",
    targetLevel: "7.0",
    dailyAvailableMinutes: 120
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
