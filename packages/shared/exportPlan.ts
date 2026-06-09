import type { Plan } from "./schema";

function lineForTask(task: Plan["tasks"][number]) {
  const description = task.description ? `\n  - 说明：${task.description}` : "";
  return `- [${task.status === "done" ? "x" : " "}] ${task.date} · ${task.title} (${task.durationMinutes}分钟, ${task.category})${description}`;
}

export function planToMarkdown(plan: Plan): string {
  const sources = plan.brief.sources
    .map((source) => `- ${source.title}${source.url ? `: ${source.url}` : ""} — ${source.note}`)
    .join("\n");

  const phases = plan.phases
    .map((phase) => {
      const tasks = phase.tasks
        .map((taskId) => plan.tasks.find((task) => task.id === taskId))
        .filter((task): task is Plan["tasks"][number] => Boolean(task))
        .map(lineForTask)
        .join("\n");

      return [`## ${phase.title}`, `${phase.startDate} 到 ${phase.endDate}`, phase.objective, "", tasks].join("\n");
    })
    .join("\n\n");

  return [
    `# ${plan.goal.title}`,
    "",
    `- 开始日期：${plan.goal.startDate ?? "未设置"}`,
    `- 目标日期：${plan.goal.targetDate}`,
    `- 每日可投入：${plan.goal.dailyAvailableMinutes} 分钟`,
    `- 当前状态：${plan.goal.currentLevel ?? "未说明"}`,
    `- 目标状态：${plan.goal.targetLevel ?? "未说明"}`,
    "",
    "## AI 文字版规划",
    plan.brief.summary,
    "",
    "## 规划来源",
    sources || "- 暂无来源",
    "",
    phases
  ].join("\n");
}
