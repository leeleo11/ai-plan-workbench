import type { Plan, PlanRisk } from "./schema";

export type PlanQualityReport = {
  score: number;
  label: string;
  aiTaskRatio: number;
  averageDailyMinutes: number;
  maxDailyMinutes: number;
  activeDays: number;
  recommendations: string[];
  actions: Array<{
    label: string;
    instruction: string;
  }>;
};

const severityPenalty: Record<PlanRisk["severity"], number> = {
  high: 30,
  medium: 14,
  low: 7
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getQualityLabel(score: number) {
  if (score >= 88) return "稳稳开局";
  if (score >= 72) return "基本靠谱";
  if (score >= 55) return "需要减压";
  return "先别硬冲";
}

export function assessPlanQuality(plan: Plan): PlanQualityReport {
  const minutesByDate = new Map<string, number>();
  for (const task of plan.tasks) {
    minutesByDate.set(task.date, (minutesByDate.get(task.date) ?? 0) + task.durationMinutes);
  }

  const dailyLoads = [...minutesByDate.values()];
  const totalMinutes = dailyLoads.reduce((sum, minutes) => sum + minutes, 0);
  const activeDays = dailyLoads.length;
  const averageDailyMinutes = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;
  const maxDailyMinutes = activeDays > 0 ? Math.max(...dailyLoads) : 0;
  const aiTaskRatio =
    plan.tasks.filter((task) => task.source === "ai_generated" || task.source === "ai_optimized").length /
    Math.max(1, plan.tasks.length);

  const riskPenalty = plan.risks.reduce((sum, risk) => sum + severityPenalty[risk.severity], 0);
  const overloadPenalty = maxDailyMinutes > plan.goal.dailyAvailableMinutes ? 12 : 0;
  const missingLevelPenalty = plan.goal.currentLevel && plan.goal.targetLevel ? 0 : 8;
  const aiCoveragePenalty = aiTaskRatio < 0.8 ? 8 : 0;
  const score = clampScore(100 - riskPenalty - overloadPenalty - missingLevelPenalty - aiCoveragePenalty);

  const recommendations: string[] = [];
  const actions: PlanQualityReport["actions"] = [];
  if (maxDailyMinutes > plan.goal.dailyAvailableMinutes) {
    recommendations.push("有些日期超过每日可投入时间，建议把任务拆到缓冲日。");
    actions.push({
      label: "生成减压版",
      instruction: "请把超过每日可投入时间的任务拆分到缓冲日，并把单日学习负荷控制在用户可投入时间内。"
    });
  }
  if (plan.risks.some((risk) => risk.type === "task_granularity")) {
    recommendations.push("部分任务还偏泛，建议改成有明确材料、动作和产出的任务卡。");
    actions.push({
      label: "细化泛任务",
      instruction: "请把泛泛的任务标题改成包含学习材料、具体动作和明确产出的任务卡。"
    });
  }
  if (!plan.goal.currentLevel || !plan.goal.targetLevel) {
    recommendations.push("补充当前水平和目标水平后，AI 能更准确安排阶段坡度。");
    actions.push({
      label: "补充水平后重生成",
      instruction: "请先补充当前水平和目标水平，再重新生成阶段坡度更准确的计划。"
    });
  }
  if (plan.goal.durationUncertain) {
    recommendations.push("总周期还不确定，建议把当前版本当作30天滚动计划，每周根据进展延展。");
    actions.push({
      label: "滚动延展计划",
      instruction: "请基于前30天执行情况，继续延展下一阶段计划，并保留每周复盘缓冲。"
    });
  }
  if (aiTaskRatio < 0.8) {
    recommendations.push("AI 生成任务占比偏低，建议重新生成以获得更贴合目标的任务内容。");
    actions.push({
      label: "重新生成 AI 任务",
      instruction: "请重新生成每日任务标题，确保每张任务卡都贴合用户目标和当前水平。"
    });
  }
  if (recommendations.length === 0) {
    recommendations.push("计划负荷、任务颗粒度和 AI 生成覆盖率都比较稳定，可以先执行三天再复盘。");
    actions.push({
      label: "三天后复盘",
      instruction: "执行前三天后，根据实际完成情况微调任务时长和优先级。"
    });
  }

  return {
    score,
    label: getQualityLabel(score),
    aiTaskRatio,
    averageDailyMinutes,
    maxDailyMinutes,
    activeDays,
    recommendations,
    actions
  };
}
