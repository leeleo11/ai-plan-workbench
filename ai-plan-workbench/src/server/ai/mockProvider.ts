import { addDays, formatISO, parseISO } from "date-fns";
import type { AiProvider, GeneratePlanRequest, OptimizePlanRequest } from "./provider";
import type { Phase, Plan, PlanTask } from "@/lib/plan/schema";

function ymd(date: Date): string {
  return formatISO(date, { representation: "date" });
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
          objective: `Focus on ${title.toLowerCase()} for ${template.name}.`,
          tasks: []
        };
      });

      const tasks: PlanTask[] = [];
      phases.forEach((phase, phaseIndex) => {
        for (let day = 0; day < 5; day += 1) {
          const category = template.categories[(phaseIndex + day) % template.categories.length];
          const task: PlanTask = {
            id: `task_${phaseIndex + 1}_${day + 1}`,
            title: `${category.replace("_", " ")} practice for ${template.name}`,
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
                title: `${task.title} (${instruction})`,
                source: "ai_optimized"
              }
            : task
        )
      };
    }
  };
}
