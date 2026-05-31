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
    name: "IELTS Preparation",
    goalType: "exam",
    phaseTitles: ["Foundation", "Skill Strengthening", "Mock Tests", "Final Review"],
    categories: ["vocabulary", "listening", "reading", "writing", "speaking", "mock_test", "review"],
    defaultTaskMinutes: 45
  },
  {
    id: "postgraduate_english",
    name: "Postgraduate English Preparation",
    goalType: "exam",
    phaseTitles: ["Vocabulary and Grammar", "Reading Intensive", "Writing and Translation", "Past Papers"],
    categories: ["vocabulary", "grammar", "reading", "writing", "translation", "past_paper", "review"],
    defaultTaskMinutes: 45
  },
  {
    id: "generic_skill",
    name: "Generic Skill Learning",
    goalType: "skill",
    phaseTitles: ["Basics", "Guided Practice", "Project Practice", "Review and Polish"],
    categories: ["concept", "practice", "project", "review"],
    defaultTaskMinutes: 50
  }
];

export function selectTemplate(parsed: ParsedGoalInput): PlanTemplate {
  if (parsed.examKeyword === "ielts") return planTemplates[0];
  if (parsed.examKeyword === "postgraduate_english") return planTemplates[1];
  return planTemplates[2];
}
