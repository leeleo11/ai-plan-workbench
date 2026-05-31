# AI Plan Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Web prototype of AI Plan Workbench: one-sentence plan creation, structured plan generation, validation, editable timeline/calendar workbench, risk display, and local AI-style optimization with version history.

**Architecture:** Use a Next.js TypeScript app with a clear separation between UI, domain logic, server-side plan generation, templates, validation, and persistence. The first prototype uses local browser persistence and a mock/provider-based AI service so the product can run without exposing model API keys in the frontend.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Zod, Vitest, Testing Library, date-fns, dnd-kit.

---

## Scope

This plan implements the Web prototype plus MVP foundation. It does not implement mobile apps, user accounts, Postgres persistence, paid subscriptions, social sharing, full exam template coverage, or a production model vendor integration.

The AI integration is intentionally provider-based:

- Frontend calls Next.js API routes.
- API routes call server-side generation services.
- The default provider is deterministic and mockable.
- A real model provider can be added later behind the same interface without changing the UI or mobile clients.

## File Structure

Create this structure:

```text
ai-plan-workbench/
  package.json
  next.config.ts
  tsconfig.json
  vitest.config.ts
  tailwind.config.ts
  postcss.config.mjs
  src/
    app/
      api/
        plans/
          generate/route.ts
          optimize/route.ts
      globals.css
      layout.tsx
      page.tsx
      plans/[planId]/page.tsx
    components/
      plan/
        GoalInput.tsx
        GenerationProgress.tsx
        PlanWorkbench.tsx
        PhaseOutline.tsx
        TimelineView.tsx
        CalendarView.tsx
        TaskEditor.tsx
        RiskPanel.tsx
        OptimizationPanel.tsx
      ui/
        Button.tsx
        Input.tsx
        Textarea.tsx
        Badge.tsx
        Tabs.tsx
    lib/
      plan/
        schema.ts
        templates.ts
        parser.ts
        generator.ts
        validator.ts
        optimizer.ts
        versioning.ts
        fixtures.ts
      storage/
        localPlanStore.ts
      utils/
        dates.ts
        ids.ts
    server/
      ai/
        provider.ts
        mockProvider.ts
        providerFactory.ts
    test/
      setup.ts
  tests/
    plan/
      parser.test.ts
      validator.test.ts
      generator.test.ts
      optimizer.test.ts
      versioning.test.ts
    api/
      generateRoute.test.ts
```

Responsibility map:

- `src/lib/plan/schema.ts`: all domain types and Zod schemas.
- `src/lib/plan/templates.ts`: IELTS/postgraduate-English style template plus generic learning fallback.
- `src/lib/plan/parser.ts`: deterministic extraction from the user's one-sentence goal.
- `src/lib/plan/generator.ts`: orchestration for parse, template match, provider generation, validation, and repair.
- `src/lib/plan/validator.ts`: deterministic correctness checks.
- `src/lib/plan/optimizer.ts`: local range adjustment and diff generation.
- `src/lib/plan/versioning.ts`: snapshots and undo data.
- `src/server/ai/*`: server-only model provider interface and mock provider.
- `src/components/plan/*`: UI components for the workbench.
- `src/storage/localPlanStore.ts`: prototype persistence.

## Task 0: Initialize Project

**Files:**
- Create: `ai-plan-workbench/package.json`
- Create: `ai-plan-workbench/tsconfig.json`
- Create: `ai-plan-workbench/vitest.config.ts`
- Create: `ai-plan-workbench/src/test/setup.ts`

- [ ] **Step 1: Initialize git only if the workspace has no `.git` directory**

Run from `E:\Claudeprojects\AI_PLAN`:

```powershell
git rev-parse --is-inside-work-tree
```

Expected if not initialized:

```text
fatal: not a git repository
```

Then run:

```powershell
git init
```

Expected:

```text
Initialized empty Git repository
```

- [ ] **Step 2: Scaffold the Next.js app**

Run:

```powershell
npx create-next-app@latest ai-plan-workbench --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Expected: `ai-plan-workbench` directory exists with `src/app/page.tsx`.

- [ ] **Step 3: Install prototype dependencies**

Run:

```powershell
cd ai-plan-workbench
npm install zod date-fns @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: dependencies are added to `package.json`.

- [ ] **Step 4: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Add test scripts**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 6: Verify project boots**

Run:

```powershell
npm test
npm run build
```

Expected: tests pass with no tests found or empty suite behavior accepted by Vitest; build completes.

- [ ] **Step 7: Commit**

```powershell
git add ai-plan-workbench
git commit -m "chore: scaffold ai plan workbench"
```

## Task 1: Define Plan Domain Schema

**Files:**
- Create: `ai-plan-workbench/src/lib/plan/schema.ts`
- Test: `ai-plan-workbench/tests/plan/schema.test.ts`

- [ ] **Step 1: Write schema tests**

Create `tests/plan/schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PlanSchema } from "@/lib/plan/schema";
import { samplePlan } from "@/lib/plan/fixtures";

describe("PlanSchema", () => {
  it("accepts a valid structured plan", () => {
    const parsed = PlanSchema.parse(samplePlan);
    expect(parsed.goal.title).toBe("90-day IELTS plan to reach 7.0");
    expect(parsed.tasks[0].status).toBe("todo");
  });

  it("rejects invalid task status", () => {
    const invalid = {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], status: "unknown" }]
    };

    expect(() => PlanSchema.parse(invalid)).toThrow();
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
npm test -- tests/plan/schema.test.ts
```

Expected: fail because `schema.ts` and `fixtures.ts` do not exist.

- [ ] **Step 3: Implement schema**

Create `src/lib/plan/schema.ts`:

```ts
import { z } from "zod";

export const GoalTypeSchema = z.enum(["exam", "skill"]);
export const TaskStatusSchema = z.enum(["todo", "done", "skipped", "delayed"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export const TaskSourceSchema = z.enum([
  "template",
  "ai_generated",
  "user_edited",
  "ai_optimized"
]);
export const RiskSeveritySchema = z.enum(["low", "medium", "high"]);
export const ValidationStatusSchema = z.enum(["valid", "valid_with_warnings", "invalid"]);

export const GoalSchema = z.object({
  title: z.string().min(1),
  type: GoalTypeSchema,
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currentLevel: z.string().optional(),
  targetLevel: z.string().optional(),
  dailyAvailableMinutes: z.number().int().positive()
});

export const PhaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  objective: z.string().min(1),
  tasks: z.array(z.string())
});

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().int().positive(),
  category: z.string().min(1),
  priority: TaskPrioritySchema,
  status: TaskStatusSchema,
  dependsOn: z.array(z.string()),
  source: TaskSourceSchema
});

export const RiskSchema = z.object({
  type: z.string().min(1),
  message: z.string().min(1),
  severity: RiskSeveritySchema,
  relatedTaskIds: z.array(z.string())
});

export const PlanVersionSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  reason: z.string().min(1),
  plan: z.unknown()
});

export const PlanSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  validationStatus: ValidationStatusSchema,
  goal: GoalSchema,
  phases: z.array(PhaseSchema).min(1),
  tasks: z.array(TaskSchema).min(1),
  risks: z.array(RiskSchema),
  history: z.array(PlanVersionSchema)
});

export type Goal = z.infer<typeof GoalSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type PlanTask = z.infer<typeof TaskSchema>;
export type PlanRisk = z.infer<typeof RiskSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;
```

- [ ] **Step 4: Add fixture**

Create `src/lib/plan/fixtures.ts`:

```ts
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
```

- [ ] **Step 5: Run tests**

Run:

```powershell
npm test -- tests/plan/schema.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/plan/schema.ts src/lib/plan/fixtures.ts tests/plan/schema.test.ts
git commit -m "feat: define plan domain schema"
```

## Task 2: Implement Goal Parser and Templates

**Files:**
- Create: `ai-plan-workbench/src/lib/plan/parser.ts`
- Create: `ai-plan-workbench/src/lib/plan/templates.ts`
- Test: `ai-plan-workbench/tests/plan/parser.test.ts`

- [ ] **Step 1: Write parser tests**

Create `tests/plan/parser.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseGoalInput } from "@/lib/plan/parser";
import { selectTemplate } from "@/lib/plan/templates";

describe("parseGoalInput", () => {
  it("extracts IELTS, target score, current score, duration, and daily time", () => {
    const parsed = parseGoalInput("I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day.");

    expect(parsed.goalType).toBe("exam");
    expect(parsed.examKeyword).toBe("ielts");
    expect(parsed.durationDays).toBe(90);
    expect(parsed.currentLevel).toBe("5.5");
    expect(parsed.targetLevel).toBe("7.0");
    expect(parsed.dailyAvailableMinutes).toBe(120);
  });

  it("falls back to skill learning when no exam keyword is present", () => {
    const parsed = parseGoalInput("Learn Python data analysis in 30 days, one hour every day.");
    const template = selectTemplate(parsed);

    expect(parsed.goalType).toBe("skill");
    expect(template.id).toBe("generic_skill");
  });
});
```

- [ ] **Step 2: Run failing test**

```powershell
npm test -- tests/plan/parser.test.ts
```

Expected: fail because parser and templates do not exist.

- [ ] **Step 3: Implement parser**

Create `src/lib/plan/parser.ts`:

```ts
export type ParsedGoalInput = {
  raw: string;
  goalType: "exam" | "skill";
  examKeyword?: "ielts" | "postgraduate_english";
  durationDays: number;
  currentLevel?: string;
  targetLevel?: string;
  dailyAvailableMinutes: number;
};

function extractFirstNumberBefore(text: string, unitPattern: RegExp): number | undefined {
  const match = text.match(unitPattern);
  if (!match?.[1]) return undefined;
  return Number(match[1]);
}

export function parseGoalInput(input: string): ParsedGoalInput {
  const lower = input.toLowerCase();
  const isIelts = lower.includes("ielts") || input.includes("雅思");
  const isPostgraduateEnglish = input.includes("考研英语") || lower.includes("postgraduate english");
  const durationDays =
    extractFirstNumberBefore(lower, /(\d+)\s*(day|days|天)/) ?? 90;
  const dailyHours =
    extractFirstNumberBefore(lower, /(\d+(?:\.\d+)?)\s*(hour|hours|小时)/) ?? 2;
  const scoreMatch = lower.match(/from\s*(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)/);

  return {
    raw: input,
    goalType: isIelts || isPostgraduateEnglish ? "exam" : "skill",
    examKeyword: isIelts ? "ielts" : isPostgraduateEnglish ? "postgraduate_english" : undefined,
    durationDays,
    currentLevel: scoreMatch?.[1],
    targetLevel: scoreMatch?.[2],
    dailyAvailableMinutes: Math.round(dailyHours * 60)
  };
}
```

- [ ] **Step 4: Implement templates**

Create `src/lib/plan/templates.ts`:

```ts
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
```

- [ ] **Step 5: Run tests**

```powershell
npm test -- tests/plan/parser.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/plan/parser.ts src/lib/plan/templates.ts tests/plan/parser.test.ts
git commit -m "feat: parse goal input and select templates"
```

## Task 3: Implement Validation Engine

**Files:**
- Create: `ai-plan-workbench/src/lib/plan/validator.ts`
- Test: `ai-plan-workbench/tests/plan/validator.test.ts`

- [ ] **Step 1: Write validation tests**

Create `tests/plan/validator.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { validatePlan } from "@/lib/plan/validator";

describe("validatePlan", () => {
  it("marks sample plan as valid", () => {
    const result = validatePlan(samplePlan);
    expect(result.status).toBe("valid");
    expect(result.risks).toHaveLength(0);
  });

  it("warns when a day exceeds available minutes", () => {
    const overloaded = {
      ...samplePlan,
      goal: { ...samplePlan.goal, dailyAvailableMinutes: 60 }
    };

    const result = validatePlan(overloaded);

    expect(result.status).toBe("valid_with_warnings");
    expect(result.risks.some((risk) => risk.type === "daily_capacity")).toBe(true);
  });

  it("warns when a task title is too broad", () => {
    const vague = {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], title: "Study English" }]
    };

    const result = validatePlan(vague);

    expect(result.risks.some((risk) => risk.type === "task_granularity")).toBe(true);
  });
});
```

- [ ] **Step 2: Run failing test**

```powershell
npm test -- tests/plan/validator.test.ts
```

Expected: fail because `validator.ts` does not exist.

- [ ] **Step 3: Implement validation**

Create `src/lib/plan/validator.ts`:

```ts
import type { Plan, PlanRisk, ValidationStatus } from "./schema";

const vagueTaskTitles = new Set([
  "study english",
  "learn english",
  "review",
  "practice",
  "study"
]);

export type ValidationResult = {
  status: ValidationStatus;
  risks: PlanRisk[];
};

function validateDailyCapacity(plan: Plan): PlanRisk[] {
  const minutesByDate = new Map<string, { total: number; taskIds: string[] }>();

  for (const task of plan.tasks) {
    const current = minutesByDate.get(task.date) ?? { total: 0, taskIds: [] };
    current.total += task.durationMinutes;
    current.taskIds.push(task.id);
    minutesByDate.set(task.date, current);
  }

  return [...minutesByDate.entries()]
    .filter(([, value]) => value.total > plan.goal.dailyAvailableMinutes)
    .map(([date, value]) => ({
      type: "daily_capacity",
      message: `${date} exceeds available study time by ${value.total - plan.goal.dailyAvailableMinutes} minutes.`,
      severity: "medium" as const,
      relatedTaskIds: value.taskIds
    }));
}

function validateTaskGranularity(plan: Plan): PlanRisk[] {
  return plan.tasks
    .filter((task) => vagueTaskTitles.has(task.title.trim().toLowerCase()))
    .map((task) => ({
      type: "task_granularity",
      message: `"${task.title}" is too broad to execute reliably.`,
      severity: "low" as const,
      relatedTaskIds: [task.id]
    }));
}

function validatePhaseDates(plan: Plan): PlanRisk[] {
  return plan.phases
    .filter((phase) => phase.startDate > phase.endDate)
    .map((phase) => ({
      type: "phase_order",
      message: `${phase.title} starts after it ends.`,
      severity: "high" as const,
      relatedTaskIds: phase.tasks
    }));
}

export function validatePlan(plan: Plan): ValidationResult {
  const risks = [
    ...validateDailyCapacity(plan),
    ...validateTaskGranularity(plan),
    ...validatePhaseDates(plan)
  ];

  const hasBlocking = risks.some((risk) => risk.severity === "high");
  const status: ValidationStatus = hasBlocking
    ? "invalid"
    : risks.length > 0
      ? "valid_with_warnings"
      : "valid";

  return { status, risks };
}
```

- [ ] **Step 4: Run tests**

```powershell
npm test -- tests/plan/validator.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/plan/validator.ts tests/plan/validator.test.ts
git commit -m "feat: validate plan correctness rules"
```

## Task 4: Implement Generation Service and AI Provider Interface

**Files:**
- Create: `ai-plan-workbench/src/server/ai/provider.ts`
- Create: `ai-plan-workbench/src/server/ai/mockProvider.ts`
- Create: `ai-plan-workbench/src/server/ai/providerFactory.ts`
- Create: `ai-plan-workbench/src/lib/plan/generator.ts`
- Test: `ai-plan-workbench/tests/plan/generator.test.ts`

- [ ] **Step 1: Write generator tests**

Create `tests/plan/generator.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generatePlanFromGoal } from "@/lib/plan/generator";
import { createMockAiProvider } from "@/server/ai/mockProvider";

describe("generatePlanFromGoal", () => {
  it("generates a validated IELTS plan", async () => {
    const result = await generatePlanFromGoal({
      input: "I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day.",
      provider: createMockAiProvider()
    });

    expect(result.plan.goal.type).toBe("exam");
    expect(result.plan.phases.length).toBeGreaterThan(0);
    expect(result.plan.tasks.length).toBeGreaterThan(0);
    expect(result.plan.validationStatus).toBe("valid");
  });
});
```

- [ ] **Step 2: Run failing test**

```powershell
npm test -- tests/plan/generator.test.ts
```

Expected: fail because provider and generator files do not exist.

- [ ] **Step 3: Implement provider interface**

Create `src/server/ai/provider.ts`:

```ts
import type { PlanTemplate } from "@/lib/plan/templates";
import type { ParsedGoalInput } from "@/lib/plan/parser";
import type { Plan } from "@/lib/plan/schema";

export type GeneratePlanRequest = {
  parsed: ParsedGoalInput;
  template: PlanTemplate;
};

export type OptimizePlanRequest = {
  plan: Plan;
  selectedTaskIds: string[];
  instruction: string;
};

export interface AiProvider {
  generatePlan(request: GeneratePlanRequest): Promise<Plan>;
  optimizePlan(request: OptimizePlanRequest): Promise<Plan>;
}
```

- [ ] **Step 4: Implement mock provider**

Create `src/server/ai/mockProvider.ts`:

```ts
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
```

- [ ] **Step 5: Implement provider factory**

Create `src/server/ai/providerFactory.ts`:

```ts
import type { AiProvider } from "./provider";
import { createMockAiProvider } from "./mockProvider";

export function createAiProvider(): AiProvider {
  return createMockAiProvider();
}
```

- [ ] **Step 6: Implement generation orchestrator**

Create `src/lib/plan/generator.ts`:

```ts
import { parseGoalInput } from "./parser";
import { selectTemplate } from "./templates";
import { validatePlan } from "./validator";
import type { Plan } from "./schema";
import type { AiProvider } from "@/server/ai/provider";

export type GeneratePlanInput = {
  input: string;
  provider: AiProvider;
};

export async function generatePlanFromGoal({ input, provider }: GeneratePlanInput): Promise<{ plan: Plan }> {
  const parsed = parseGoalInput(input);
  const template = selectTemplate(parsed);
  const draft = await provider.generatePlan({ parsed, template });
  const validation = validatePlan(draft);

  return {
    plan: {
      ...draft,
      validationStatus: validation.status,
      risks: validation.risks
    }
  };
}
```

- [ ] **Step 7: Run tests**

```powershell
npm test -- tests/plan/generator.test.ts
```

Expected: pass.

- [ ] **Step 8: Commit**

```powershell
git add src/server/ai src/lib/plan/generator.ts tests/plan/generator.test.ts
git commit -m "feat: generate validated plans through ai provider"
```

## Task 5: Add API Routes

**Files:**
- Create: `ai-plan-workbench/src/app/api/plans/generate/route.ts`
- Create: `ai-plan-workbench/src/app/api/plans/optimize/route.ts`
- Test: `ai-plan-workbench/tests/api/generateRoute.test.ts`

- [ ] **Step 1: Write route test**

Create `tests/api/generateRoute.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/plans/generate/route";

describe("POST /api/plans/generate", () => {
  it("returns a structured plan", async () => {
    const request = new Request("http://localhost/api/plans/generate", {
      method: "POST",
      body: JSON.stringify({
        input: "I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day."
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.plan.goal.type).toBe("exam");
    expect(json.plan.tasks.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run failing route test**

```powershell
npm test -- tests/api/generateRoute.test.ts
```

Expected: fail because route does not exist.

- [ ] **Step 3: Implement generate route**

Create `src/app/api/plans/generate/route.ts`:

```ts
import { NextResponse } from "next/server";
import { generatePlanFromGoal } from "@/lib/plan/generator";
import { createAiProvider } from "@/server/ai/providerFactory";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.input || typeof body.input !== "string") {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  const result = await generatePlanFromGoal({
    input: body.input,
    provider: createAiProvider()
  });

  return NextResponse.json(result);
}
```

- [ ] **Step 4: Implement optimize route**

Create `src/app/api/plans/optimize/route.ts`:

```ts
import { NextResponse } from "next/server";
import { PlanSchema } from "@/lib/plan/schema";
import { createAiProvider } from "@/server/ai/providerFactory";
import { createPlanVersion } from "@/lib/plan/versioning";
import { validatePlan } from "@/lib/plan/validator";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = PlanSchema.safeParse(body?.plan);

  if (!parsed.success) {
    return NextResponse.json({ error: "valid plan is required" }, { status: 400 });
  }

  if (!Array.isArray(body.selectedTaskIds) || typeof body.instruction !== "string") {
    return NextResponse.json({ error: "selectedTaskIds and instruction are required" }, { status: 400 });
  }

  const provider = createAiProvider();
  const before = createPlanVersion(parsed.data, body.instruction);
  const optimized = await provider.optimizePlan({
    plan: parsed.data,
    selectedTaskIds: body.selectedTaskIds,
    instruction: body.instruction
  });
  const validation = validatePlan(optimized);

  return NextResponse.json({
    plan: {
      ...optimized,
      version: parsed.data.version + 1,
      validationStatus: validation.status,
      risks: validation.risks,
      history: [before, ...parsed.data.history]
    }
  });
}
```

- [ ] **Step 5: Add temporary versioning helper required by optimize route**

Create `src/lib/plan/versioning.ts`:

```ts
import type { Plan } from "./schema";

export function createPlanVersion(plan: Plan, reason: string) {
  return {
    id: `version_${Date.now()}`,
    createdAt: new Date().toISOString(),
    reason,
    plan
  };
}
```

- [ ] **Step 6: Run route tests**

```powershell
npm test -- tests/api/generateRoute.test.ts
```

Expected: pass.

- [ ] **Step 7: Commit**

```powershell
git add src/app/api/plans src/lib/plan/versioning.ts tests/api/generateRoute.test.ts
git commit -m "feat: expose plan generation api"
```

## Task 6: Build New Plan UI

**Files:**
- Create: `ai-plan-workbench/src/components/ui/Button.tsx`
- Create: `ai-plan-workbench/src/components/ui/Textarea.tsx`
- Create: `ai-plan-workbench/src/components/plan/GoalInput.tsx`
- Create: `ai-plan-workbench/src/components/plan/GenerationProgress.tsx`
- Modify: `ai-plan-workbench/src/app/page.tsx`
- Modify: `ai-plan-workbench/src/app/globals.css`

- [ ] **Step 1: Add UI primitives**

Create `src/components/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

Create `src/components/ui/Textarea.tsx`:

```tsx
import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-32 w-full resize-none rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-slate-950 ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Add goal input component**

Create `src/components/plan/GoalInput.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import type { Plan } from "@/lib/plan/schema";

type GoalInputProps = {
  onGenerated: (plan: Plan) => void;
};

export function GoalInput({ onGenerated }: GoalInputProps) {
  const [input, setInput] = useState("I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day.");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan() {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/plans/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input })
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Failed to generate plan.");
      return;
    }

    onGenerated(data.plan);
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">AI Plan Workbench</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Turn one goal into a validated study plan.</h1>
        <p className="mt-3 text-base text-slate-600">
          Start with one sentence. The prototype generates a structured plan you can inspect, edit, and rebalance.
        </p>
      </div>
      <Textarea value={input} onChange={(event) => setInput(event.target.value)} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button onClick={generatePlan} disabled={isLoading || input.trim().length < 8}>
        {isLoading ? "Generating..." : "Generate plan"}
      </Button>
    </section>
  );
}
```

- [ ] **Step 3: Add generation progress component**

Create `src/components/plan/GenerationProgress.tsx`:

```tsx
export function GenerationProgress() {
  const steps = ["Analyzing goal", "Matching template", "Splitting phases", "Validating feasibility", "Creating plan view"];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">Generation steps</h2>
      <div className="mt-3 grid gap-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire home page**

Replace `src/app/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { GoalInput } from "@/components/plan/GoalInput";
import { PlanWorkbench } from "@/components/plan/PlanWorkbench";
import type { Plan } from "@/lib/plan/schema";
import { savePlan } from "@/lib/storage/localPlanStore";

export default function Home() {
  const [plan, setPlan] = useState<Plan | null>(null);

  function handleGenerated(nextPlan: Plan) {
    savePlan(nextPlan);
    setPlan(nextPlan);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      {plan ? <PlanWorkbench initialPlan={plan} /> : <GoalInput onGenerated={handleGenerated} />}
    </main>
  );
}
```

- [ ] **Step 5: Add temporary missing files for compile**

Create `src/lib/storage/localPlanStore.ts`:

```ts
import type { Plan } from "@/lib/plan/schema";

const key = "ai-plan-workbench.plans";

export function savePlan(plan: Plan): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify([plan]));
}
```

Create `src/components/plan/PlanWorkbench.tsx`:

```tsx
import type { Plan } from "@/lib/plan/schema";

type PlanWorkbenchProps = {
  initialPlan: Plan;
};

export function PlanWorkbench({ initialPlan }: PlanWorkbenchProps) {
  return (
    <section className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold text-slate-950">{initialPlan.goal.title}</h1>
      <p className="mt-2 text-sm text-slate-600">{initialPlan.tasks.length} tasks generated.</p>
    </section>
  );
}
```

- [ ] **Step 6: Run build**

```powershell
npm run build
```

Expected: build passes.

- [ ] **Step 7: Commit**

```powershell
git add src/app src/components src/lib/storage
git commit -m "feat: add new plan generation ui"
```

## Task 7: Build Plan Workbench Views

**Files:**
- Modify: `ai-plan-workbench/src/components/plan/PlanWorkbench.tsx`
- Create: `ai-plan-workbench/src/components/plan/PhaseOutline.tsx`
- Create: `ai-plan-workbench/src/components/plan/TimelineView.tsx`
- Create: `ai-plan-workbench/src/components/plan/CalendarView.tsx`
- Create: `ai-plan-workbench/src/components/plan/RiskPanel.tsx`
- Create: `ai-plan-workbench/src/components/ui/Tabs.tsx`
- Create: `ai-plan-workbench/src/components/ui/Badge.tsx`

- [ ] **Step 1: Create badge and tabs**

Create `src/components/ui/Badge.tsx`:

```tsx
import type { PropsWithChildren } from "react";

export function Badge({ children }: PropsWithChildren) {
  return <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">{children}</span>;
}
```

Create `src/components/ui/Tabs.tsx`:

```tsx
type TabsProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ value, options, onChange }: TabsProps<T>) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          className={`rounded px-3 py-1.5 text-sm ${value === option.value ? "bg-slate-950 text-white" : "text-slate-600"}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create outline**

Create `src/components/plan/PhaseOutline.tsx`:

```tsx
import type { Plan } from "@/lib/plan/schema";

export function PhaseOutline({ plan }: { plan: Plan }) {
  return (
    <aside className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">Phases</h2>
      <div className="mt-4 grid gap-3">
        {plan.phases.map((phase) => (
          <div key={phase.id} className="border-l-2 border-teal-500 pl-3">
            <h3 className="text-sm font-medium text-slate-950">{phase.title}</h3>
            <p className="text-xs text-slate-500">{phase.startDate} to {phase.endDate}</p>
            <p className="mt-1 text-xs text-slate-600">{phase.objective}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create timeline**

Create `src/components/plan/TimelineView.tsx`:

```tsx
import type { Plan } from "@/lib/plan/schema";
import { Badge } from "@/components/ui/Badge";

export function TimelineView({ plan }: { plan: Plan }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="grid gap-3">
        {plan.tasks.map((task) => (
          <div key={task.id} className="grid grid-cols-[120px_1fr_80px] items-center gap-3 rounded-md border border-slate-100 p-3">
            <span className="text-xs text-slate-500">{task.date}</span>
            <div>
              <p className="text-sm font-medium text-slate-950">{task.title}</p>
              <p className="text-xs text-slate-500">{task.durationMinutes} min</p>
            </div>
            <Badge>{task.priority}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create calendar**

Create `src/components/plan/CalendarView.tsx`:

```tsx
import type { Plan } from "@/lib/plan/schema";

export function CalendarView({ plan }: { plan: Plan }) {
  const tasksByDate = plan.tasks.reduce<Record<string, typeof plan.tasks>>((acc, task) => {
    acc[task.date] = [...(acc[task.date] ?? []), task];
    return acc;
  }, {});

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Object.entries(tasksByDate).map(([date, tasks]) => (
        <div key={date} className="min-h-36 rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-950">{date}</h3>
          <div className="mt-2 grid gap-2">
            {tasks.map((task) => (
              <div key={task.id} className="rounded bg-slate-50 p-2 text-xs text-slate-700">
                {task.title}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create risk panel**

Create `src/components/plan/RiskPanel.tsx`:

```tsx
import type { Plan } from "@/lib/plan/schema";

export function RiskPanel({ plan }: { plan: Plan }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">Risks</h2>
      {plan.risks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No validation risks detected.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {plan.risks.map((risk) => (
            <div key={`${risk.type}-${risk.message}`} className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              {risk.message}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 6: Replace workbench**

Replace `src/components/plan/PlanWorkbench.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Plan } from "@/lib/plan/schema";
import { Tabs } from "@/components/ui/Tabs";
import { PhaseOutline } from "./PhaseOutline";
import { TimelineView } from "./TimelineView";
import { CalendarView } from "./CalendarView";
import { RiskPanel } from "./RiskPanel";

type PlanWorkbenchProps = {
  initialPlan: Plan;
};

type WorkbenchTab = "timeline" | "calendar" | "risks";

export function PlanWorkbench({ initialPlan }: PlanWorkbenchProps) {
  const [plan] = useState(initialPlan);
  const [tab, setTab] = useState<WorkbenchTab>("timeline");

  return (
    <section className="mx-auto grid max-w-7xl gap-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">Validated Plan</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{plan.goal.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{plan.tasks.length} tasks · {plan.validationStatus}</p>
        </div>
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "timeline", label: "Timeline" },
            { value: "calendar", label: "Calendar" },
            { value: "risks", label: "Risks" }
          ]}
        />
      </header>
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <PhaseOutline plan={plan} />
        {tab === "timeline" ? <TimelineView plan={plan} /> : null}
        {tab === "calendar" ? <CalendarView plan={plan} /> : null}
        {tab === "risks" ? <RiskPanel plan={plan} /> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Build**

```powershell
npm run build
```

Expected: build passes and workbench renders after generating a plan.

- [ ] **Step 8: Commit**

```powershell
git add src/components
git commit -m "feat: add plan workbench views"
```

## Task 8: Add Editing, Persistence, and Version History

**Files:**
- Modify: `ai-plan-workbench/src/lib/storage/localPlanStore.ts`
- Modify: `ai-plan-workbench/src/lib/plan/versioning.ts`
- Create: `ai-plan-workbench/src/components/plan/TaskEditor.tsx`
- Modify: `ai-plan-workbench/src/components/plan/PlanWorkbench.tsx`
- Test: `ai-plan-workbench/tests/plan/versioning.test.ts`

- [ ] **Step 1: Write versioning tests**

Create `tests/plan/versioning.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { applyPlanUpdate, undoLastChange } from "@/lib/plan/versioning";

describe("plan versioning", () => {
  it("increments version and stores previous plan", () => {
    const next = applyPlanUpdate(samplePlan, "rename task", {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], title: "Updated task" }, samplePlan.tasks[1]]
    });

    expect(next.version).toBe(2);
    expect(next.history).toHaveLength(1);
  });

  it("undoes the last change", () => {
    const changed = applyPlanUpdate(samplePlan, "rename task", {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], title: "Updated task" }, samplePlan.tasks[1]]
    });

    const undone = undoLastChange(changed);
    expect(undone.tasks[0].title).toBe(samplePlan.tasks[0].title);
  });
});
```

- [ ] **Step 2: Run failing test**

```powershell
npm test -- tests/plan/versioning.test.ts
```

Expected: fail because functions are missing.

- [ ] **Step 3: Implement versioning**

Replace `src/lib/plan/versioning.ts`:

```ts
import { PlanSchema, type Plan } from "./schema";

export function createPlanVersion(plan: Plan, reason: string) {
  return {
    id: `version_${Date.now()}`,
    createdAt: new Date().toISOString(),
    reason,
    plan
  };
}

export function applyPlanUpdate(previous: Plan, reason: string, nextPlan: Plan): Plan {
  return {
    ...nextPlan,
    version: previous.version + 1,
    history: [createPlanVersion(previous, reason), ...previous.history]
  };
}

export function undoLastChange(plan: Plan): Plan {
  const [latest, ...rest] = plan.history;
  if (!latest) return plan;

  const previousPlan = PlanSchema.parse(latest.plan);
  return {
    ...previousPlan,
    history: rest
  };
}
```

- [ ] **Step 4: Improve local storage**

Replace `src/lib/storage/localPlanStore.ts`:

```ts
import type { Plan } from "@/lib/plan/schema";

const key = "ai-plan-workbench.plans";

export function listPlans(): Plan[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Plan[];
  } catch {
    return [];
  }
}

export function savePlan(plan: Plan): void {
  if (typeof window === "undefined") return;
  const existing = listPlans().filter((item) => item.id !== plan.id);
  window.localStorage.setItem(key, JSON.stringify([plan, ...existing]));
}
```

- [ ] **Step 5: Add task editor**

Create `src/components/plan/TaskEditor.tsx`:

```tsx
import type { PlanTask } from "@/lib/plan/schema";
import { Button } from "@/components/ui/Button";

type TaskEditorProps = {
  task: PlanTask | null;
  onChange: (task: PlanTask) => void;
  onClose: () => void;
};

export function TaskEditor({ task, onChange, onClose }: TaskEditorProps) {
  if (!task) {
    return (
      <aside className="rounded-md border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">Select a task to edit.</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-950">Task editor</h2>
        <button className="text-sm text-slate-500" onClick={onClose}>Close</button>
      </div>
      <label className="mt-4 block text-xs font-medium text-slate-500">Title</label>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={task.title}
        onChange={(event) => onChange({ ...task, title: event.target.value, source: "user_edited" })}
      />
      <label className="mt-4 block text-xs font-medium text-slate-500">Date</label>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        type="date"
        value={task.date}
        onChange={(event) => onChange({ ...task, date: event.target.value, source: "user_edited" })}
      />
      <label className="mt-4 block text-xs font-medium text-slate-500">Duration</label>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        type="number"
        value={task.durationMinutes}
        onChange={(event) => onChange({ ...task, durationMinutes: Number(event.target.value), source: "user_edited" })}
      />
      <Button className="mt-4 w-full" onClick={onClose}>Done</Button>
    </aside>
  );
}
```

- [ ] **Step 6: Update workbench to edit tasks**

Modify `PlanWorkbench.tsx` so task changes update state, save to local storage, and keep version history:

```tsx
"use client";

import { useState } from "react";
import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Tabs } from "@/components/ui/Tabs";
import { savePlan } from "@/lib/storage/localPlanStore";
import { applyPlanUpdate, undoLastChange } from "@/lib/plan/versioning";
import { PhaseOutline } from "./PhaseOutline";
import { TimelineView } from "./TimelineView";
import { CalendarView } from "./CalendarView";
import { RiskPanel } from "./RiskPanel";
import { TaskEditor } from "./TaskEditor";
import { Button } from "@/components/ui/Button";

type PlanWorkbenchProps = {
  initialPlan: Plan;
};

type WorkbenchTab = "timeline" | "calendar" | "risks";

export function PlanWorkbench({ initialPlan }: PlanWorkbenchProps) {
  const [plan, setPlan] = useState(initialPlan);
  const [tab, setTab] = useState<WorkbenchTab>("timeline");
  const [selectedTask, setSelectedTask] = useState<PlanTask | null>(null);

  function commitPlan(reason: string, nextPlan: Plan) {
    const versioned = applyPlanUpdate(plan, reason, nextPlan);
    setPlan(versioned);
    savePlan(versioned);
  }

  function updateTask(task: PlanTask) {
    const nextPlan = {
      ...plan,
      tasks: plan.tasks.map((item) => (item.id === task.id ? task : item))
    };
    commitPlan("edit task", nextPlan);
    setSelectedTask(task);
  }

  function undo() {
    const undone = undoLastChange(plan);
    setPlan(undone);
    savePlan(undone);
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">Validated Plan</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{plan.goal.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{plan.tasks.length} tasks · version {plan.version}</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-white text-slate-950 ring-1 ring-slate-200 hover:bg-slate-100" onClick={undo} disabled={plan.history.length === 0}>
            Undo
          </Button>
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "timeline", label: "Timeline" },
              { value: "calendar", label: "Calendar" },
              { value: "risks", label: "Risks" }
            ]}
          />
        </div>
      </header>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr_320px]">
        <PhaseOutline plan={plan} />
        <div>
          {tab === "timeline" ? <TimelineView plan={plan} onSelectTask={setSelectedTask} /> : null}
          {tab === "calendar" ? <CalendarView plan={plan} onSelectTask={setSelectedTask} /> : null}
          {tab === "risks" ? <RiskPanel plan={plan} /> : null}
        </div>
        <TaskEditor task={selectedTask} onChange={updateTask} onClose={() => setSelectedTask(null)} />
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Update `TimelineView` and `CalendarView` props**

Modify both components to accept `onSelectTask`.

In `TimelineView.tsx`:

```tsx
import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Badge } from "@/components/ui/Badge";

export function TimelineView({ plan, onSelectTask }: { plan: Plan; onSelectTask: (task: PlanTask) => void }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="grid gap-3">
        {plan.tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task)}
            className="grid grid-cols-[120px_1fr_80px] items-center gap-3 rounded-md border border-slate-100 p-3 text-left hover:border-teal-400"
          >
            <span className="text-xs text-slate-500">{task.date}</span>
            <div>
              <p className="text-sm font-medium text-slate-950">{task.title}</p>
              <p className="text-xs text-slate-500">{task.durationMinutes} min</p>
            </div>
            <Badge>{task.priority}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
```

In `CalendarView.tsx`:

```tsx
import type { Plan, PlanTask } from "@/lib/plan/schema";

export function CalendarView({ plan, onSelectTask }: { plan: Plan; onSelectTask: (task: PlanTask) => void }) {
  const tasksByDate = plan.tasks.reduce<Record<string, PlanTask[]>>((acc, task) => {
    acc[task.date] = [...(acc[task.date] ?? []), task];
    return acc;
  }, {});

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Object.entries(tasksByDate).map(([date, tasks]) => (
        <div key={date} className="min-h-36 rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-950">{date}</h3>
          <div className="mt-2 grid gap-2">
            {tasks.map((task) => (
              <button key={task.id} onClick={() => onSelectTask(task)} className="rounded bg-slate-50 p-2 text-left text-xs text-slate-700 hover:bg-teal-50">
                {task.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run tests and build**

```powershell
npm test -- tests/plan/versioning.test.ts
npm run build
```

Expected: pass.

- [ ] **Step 9: Commit**

```powershell
git add src/lib/plan/versioning.ts src/lib/storage/localPlanStore.ts src/components/plan tests/plan/versioning.test.ts
git commit -m "feat: add plan editing and version history"
```

## Task 9: Add Local AI Optimization UI

**Files:**
- Create: `ai-plan-workbench/src/components/plan/OptimizationPanel.tsx`
- Modify: `ai-plan-workbench/src/components/plan/PlanWorkbench.tsx`
- Test: `ai-plan-workbench/tests/plan/optimizer.test.ts`

- [ ] **Step 1: Write optimizer test**

Create `tests/plan/optimizer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { samplePlan } from "@/lib/plan/fixtures";
import { summarizePlanDiff } from "@/lib/plan/optimizer";

describe("summarizePlanDiff", () => {
  it("summarizes changed task titles", () => {
    const next = {
      ...samplePlan,
      tasks: [{ ...samplePlan.tasks[0], title: "New title" }, samplePlan.tasks[1]]
    };

    const diff = summarizePlanDiff(samplePlan, next);

    expect(diff.changedTasks).toBe(1);
    expect(diff.summary).toContain("1 task changed");
  });
});
```

- [ ] **Step 2: Implement diff helper**

Create `src/lib/plan/optimizer.ts`:

```ts
import type { Plan } from "./schema";

export type PlanDiffSummary = {
  changedTasks: number;
  addedTasks: number;
  removedTasks: number;
  summary: string;
};

export function summarizePlanDiff(previous: Plan, next: Plan): PlanDiffSummary {
  const previousById = new Map(previous.tasks.map((task) => [task.id, task]));
  const nextById = new Map(next.tasks.map((task) => [task.id, task]));

  const changedTasks = next.tasks.filter((task) => {
    const before = previousById.get(task.id);
    return before && JSON.stringify(before) !== JSON.stringify(task);
  }).length;

  const addedTasks = next.tasks.filter((task) => !previousById.has(task.id)).length;
  const removedTasks = previous.tasks.filter((task) => !nextById.has(task.id)).length;

  return {
    changedTasks,
    addedTasks,
    removedTasks,
    summary: `${changedTasks} task changed, ${addedTasks} added, ${removedTasks} removed.`
  };
}
```

- [ ] **Step 3: Run optimizer test**

```powershell
npm test -- tests/plan/optimizer.test.ts
```

Expected: pass.

- [ ] **Step 4: Create optimization panel**

Create `src/components/plan/OptimizationPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Plan, PlanTask } from "@/lib/plan/schema";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { summarizePlanDiff } from "@/lib/plan/optimizer";

type OptimizationPanelProps = {
  plan: Plan;
  selectedTask: PlanTask | null;
  onApply: (plan: Plan) => void;
};

export function OptimizationPanel({ plan, selectedTask, onApply }: OptimizationPanelProps) {
  const [instruction, setInstruction] = useState("Make this task more specific and easier to execute.");
  const [previewPlan, setPreviewPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function preview() {
    if (!selectedTask) return;
    setIsLoading(true);
    const response = await fetch("/api/plans/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        selectedTaskIds: [selectedTask.id],
        instruction
      })
    });
    const data = await response.json();
    setPreviewPlan(data.plan);
    setIsLoading(false);
  }

  const diff = previewPlan ? summarizePlanDiff(plan, previewPlan) : null;

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">AI local optimization</h2>
      <p className="mt-2 text-xs text-slate-500">
        Select a task, preview AI changes, then apply only after review.
      </p>
      <Textarea className="mt-3 min-h-20 text-sm" value={instruction} onChange={(event) => setInstruction(event.target.value)} />
      <Button className="mt-3 w-full" onClick={preview} disabled={!selectedTask || isLoading}>
        {isLoading ? "Previewing..." : "Preview change"}
      </Button>
      {diff ? (
        <div className="mt-3 rounded-md bg-teal-50 p-3 text-sm text-teal-900">
          <p>{diff.summary}</p>
          <Button className="mt-3 w-full" onClick={() => previewPlan && onApply(previewPlan)}>
            Apply change
          </Button>
        </div>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 5: Wire optimization into workbench**

In `PlanWorkbench.tsx`, import `OptimizationPanel` and render it below `TaskEditor`. Add this function:

```tsx
function applyOptimizedPlan(nextPlan: Plan) {
  setPlan(nextPlan);
  savePlan(nextPlan);
}
```

Then replace the right column contents with:

```tsx
<div className="grid gap-4">
  <TaskEditor task={selectedTask} onChange={updateTask} onClose={() => setSelectedTask(null)} />
  <OptimizationPanel plan={plan} selectedTask={selectedTask} onApply={applyOptimizedPlan} />
</div>
```

- [ ] **Step 6: Run tests and build**

```powershell
npm test -- tests/plan/optimizer.test.ts
npm run build
```

Expected: pass.

- [ ] **Step 7: Commit**

```powershell
git add src/lib/plan/optimizer.ts src/components/plan/OptimizationPanel.tsx src/components/plan/PlanWorkbench.tsx tests/plan/optimizer.test.ts
git commit -m "feat: preview and apply local ai optimization"
```

## Task 10: Final Verification and UX Pass

**Files:**
- Modify only files needed to fix build, test, or obvious UI issues.

- [ ] **Step 1: Run full test suite**

```powershell
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

```powershell
npm run build
```

Expected: build passes.

- [ ] **Step 3: Start dev server**

```powershell
npm run dev
```

Expected: app starts on `http://localhost:3000`.

- [ ] **Step 4: Manual smoke test**

Open `http://localhost:3000` and verify:

- Goal input appears.
- Default IELTS prompt generates a plan.
- Timeline view shows generated tasks.
- Calendar view groups tasks by date.
- Risk view renders.
- Clicking a task opens the editor.
- Editing a task changes title/date/duration.
- Undo restores the previous plan state.
- AI local optimization preview shows a diff.
- Applying optimization updates the selected task and increments the version.

- [ ] **Step 5: Commit final fixes**

```powershell
git add ai-plan-workbench
git commit -m "chore: verify ai plan workbench prototype"
```

## Self-Review

Spec coverage:

- One-sentence creation: Task 6.
- Structured generation: Tasks 1, 2, 4, 5.
- Domain templates: Task 2.
- Correctness validation: Task 3.
- Web workbench: Tasks 7 and 8.
- Manual editing: Task 8.
- Local AI optimization: Task 9.
- Version history and undo: Task 8.
- Mobile-safe model architecture: Tasks 4 and 5, because model access is server-side only.

Known intentional gaps:

- Real model provider integration is not implemented in this prototype plan.
- Database persistence is not implemented in this prototype plan.
- Full mobile app is not implemented in this prototype plan.
- Payment and subscription are not implemented in this prototype plan.

These gaps match the approved scope: Web prototype first, mobile and full production backend later.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-31-ai-plan-workbench-implementation.md`. Two execution options:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks, and keep iteration fast.

2. Inline Execution - execute tasks in this session using executing-plans, with checkpoints after major task groups.

Which approach?
