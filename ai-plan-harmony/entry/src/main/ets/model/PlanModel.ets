export interface Goal {
  title: string;
  type: string;  // 'learning' | 'project' | 'habit' | 'health' | 'career' | 'custom'
  startDate: string;
  targetDate: string;
  currentLevel?: string;
  targetLevel?: string;
  dailyAvailableMinutes: number;
  durationUncertain?: boolean;
}

export interface Phase {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  objective: string;
  tasks: string[];
}

export interface PlanTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  durationMinutes: number;
  category: string;
  priority: string;  // 'high' | 'medium' | 'low'
  status: string;    // 'todo' | 'done' | 'skipped' | 'delayed'
  dependsOn: string[];
  source: string;    // 'template' | 'ai_generated' | 'user_edited' | 'ai_optimized'
}

export interface PlanRisk {
  type: string;
  message: string;
  severity: string;  // 'high' | 'medium' | 'low'
  relatedTaskIds: string[];
}

export interface PlanSource {
  type: string;      // 'user_input' | 'template' | 'model' | 'retrieval'
  title: string;
  note: string;
  url?: string;
  verificationStatus?: string;  // 'trusted' | 'unverified'
}

export interface PlanBrief {
  summary: string;
  assumptions: string[];
  sources: PlanSource[];
}

export interface PlanVersion {
  id: string;
  createdAt: string;
  reason: string;
  plan: Plan;
}

export interface Plan {
  id: string;
  version: number;
  validationStatus: string;  // 'valid' | 'valid_with_warnings' | 'invalid'
  goal: Goal;
  brief: PlanBrief;
  phases: Phase[];
  tasks: PlanTask[];
  risks: PlanRisk[];
  history: PlanVersion[];
}

export interface ExecutionStats {
  doneCount: number;
  todoCount: number;
  delayedCount: number;
  skippedCount: number;
  progress: number;
  completedDays: number;
  currentStreak: number;
}

export interface PlanQualityReport {
  score: number;
  label: string;
  aiTaskRatio: number;
  averageDailyMinutes: number;
  maxDailyMinutes: number;
  activeDays: number;
  recommendations: string[];
  actions: Array<{ label: string; instruction: string }>;
}
