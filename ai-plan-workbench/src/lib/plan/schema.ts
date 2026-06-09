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
  durationUncertain: z.boolean().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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
  description: z.string().min(1).optional(),
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

export const PlanSourceSchema = z.object({
  type: z.enum(["template", "retrieval", "user_input", "model"]),
  title: z.string().min(1),
  note: z.string().min(1),
  url: z.string().url().optional(),
  verificationStatus: z.enum(["trusted", "unverified", "failed"]).optional()
});

export const PlanBriefSchema = z.object({
  summary: z.string().min(1),
  assumptions: z.array(z.string().min(1)),
  sources: z.array(PlanSourceSchema)
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
  brief: PlanBriefSchema,
  phases: z.array(PhaseSchema).min(1),
  tasks: z.array(TaskSchema).min(1),
  risks: z.array(RiskSchema),
  history: z.array(PlanVersionSchema)
});

export type Goal = z.infer<typeof GoalSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type PlanTask = z.infer<typeof TaskSchema>;
export type PlanRisk = z.infer<typeof RiskSchema>;
export type PlanSource = z.infer<typeof PlanSourceSchema>;
export type PlanBrief = z.infer<typeof PlanBriefSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;
