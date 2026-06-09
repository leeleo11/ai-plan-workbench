import type { ParsedGoalInput } from "./parser";
import type { PlanSource } from "./schema";

const pythonSources: PlanSource[] = [
  {
    type: "retrieval",
    title: "Python official tutorial",
    note: "用于参考 Python 基础学习路线和语法主题。",
    url: "https://docs.python.org/3/tutorial/",
    verificationStatus: "trusted"
  }
];

const dataAnalysisSources: PlanSource[] = [
  {
    type: "retrieval",
    title: "pandas user guide",
    note: "用于参考数据清洗、分析和表格处理任务设计。",
    url: "https://pandas.pydata.org/docs/user_guide/",
    verificationStatus: "trusted"
  }
];

const learningMethodSources: PlanSource[] = [
  {
    type: "retrieval",
    title: "间隔重复学习法",
    note: "用于参考科学记忆和复习节奏设计。",
    url: "https://www.supermemo.com/en/archives1990-2015/english/ol/sm2",
    verificationStatus: "trusted"
  }
];

const healthSources: PlanSource[] = [
  {
    type: "retrieval",
    title: "WHO 身体活动指南",
    note: "用于参考运动强度和频率建议。",
    url: "https://www.who.int/publications/i/item/9789240015128",
    verificationStatus: "trusted"
  }
];

function uniqueByUrl(sources: PlanSource[]): PlanSource[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = source.url ?? `${source.type}:${source.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getReferenceSources(parsed: ParsedGoalInput): PlanSource[] {
  const raw = parsed.raw.toLowerCase();
  const sources: PlanSource[] = [];

  if (raw.includes("python")) sources.push(...pythonSources);
  if (raw.includes("数据分析") || raw.includes("data analysis") || raw.includes("pandas")) {
    sources.push(...dataAnalysisSources);
  }
  if (parsed.goalCategory === "learning") sources.push(...learningMethodSources);
  if (parsed.goalCategory === "health") sources.push(...healthSources);

  return uniqueByUrl(sources);
}

export function mergePlanSources(primary: PlanSource[], extra: PlanSource[]): PlanSource[] {
  return uniqueByUrl([...primary, ...extra]).map((source) => ({
    ...source,
    verificationStatus: source.url ? (source.verificationStatus ?? "unverified") : source.verificationStatus
  }));
}
