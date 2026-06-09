import type { ParsedGoalInput } from "./parser";
import type { PlanSource } from "./schema";

const ieltsSources: PlanSource[] = [
  {
    type: "retrieval",
    title: "IELTS official preparation resources",
    note: "用于参考雅思备考资源、样题和练习材料。",
    url: "https://ielts.org/take-a-test/preparation-resources",
    verificationStatus: "trusted"
  }
];

const postgraduateEnglishSources: PlanSource[] = [
  {
    type: "retrieval",
    title: "中国研究生招生信息网",
    note: "用于参考考研相关官方信息入口，具体考试大纲仍需以当年发布为准。",
    url: "https://yz.chsi.com.cn/",
    verificationStatus: "trusted"
  }
];

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

  if (parsed.examKeyword === "ielts") sources.push(...ieltsSources);
  if (parsed.examKeyword === "postgraduate_english") sources.push(...postgraduateEnglishSources);
  if (raw.includes("python")) sources.push(...pythonSources);
  if (raw.includes("数据分析") || raw.includes("data analysis") || raw.includes("pandas")) {
    sources.push(...dataAnalysisSources);
  }

  return uniqueByUrl(sources);
}

export function mergePlanSources(primary: PlanSource[], extra: PlanSource[]): PlanSource[] {
  return uniqueByUrl([...primary, ...extra]).map((source) => ({
    ...source,
    verificationStatus: source.url ? (source.verificationStatus ?? "unverified") : source.verificationStatus
  }));
}
