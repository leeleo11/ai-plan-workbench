export type ParsedGoalInput = {
  raw: string;
  goalType: "exam" | "skill";
  examKeyword?: "ielts" | "postgraduate_english";
  durationDays: number;
  durationUncertain?: boolean;
  currentLevel?: string;
  targetLevel?: string;
  startDate?: string;
  dailyAvailableMinutes: number;
};

function extractNumber(text: string, patterns: RegExp[], fallback: number): number {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return Number(match[1]);
  }
  return fallback;
}

function extractLevels(text: string): { currentLevel?: string; targetLevel?: string } {
  const english = text.match(/from\s*(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)/i);
  if (english) return { currentLevel: english[1], targetLevel: english[2] };

  const chinese = text.match(/从\s*(\d+(?:\.\d+)?)\s*(?:分)?\s*(?:到|提到|提高到)\s*(\d+(?:\.\d+)?)/);
  if (chinese) return { currentLevel: chinese[1], targetLevel: chinese[2] };

  return {};
}

function extractStartDate(text: string): string | undefined {
  const match = text.match(/(\d{4}-\d{2}-\d{2})\s*(?:开始|start)?/i);
  return match?.[1];
}

export function parseGoalInput(input: string): ParsedGoalInput {
  const lower = input.toLowerCase();
  const isIelts = lower.includes("ielts") || input.includes("雅思");
  const isPostgraduateEnglish = input.includes("考研英语") || lower.includes("postgraduate english");
  const durationUncertain = /时间.*不确定|时长.*不确定|周期.*不确定|暂不确定|还没定|未知|uncertain|not sure/i.test(input);
  const durationDays = extractNumber(lower, [/(\d+)\s*(?:day|days)/, /(\d+)\s*天/], durationUncertain ? 30 : 90);
  const dailyHours = extractNumber(lower, [/(\d+(?:\.\d+)?)\s*(?:hour|hours)/, /(\d+(?:\.\d+)?)\s*小时/], 2);
  const levels = extractLevels(input);
  const startDate = extractStartDate(input);

  return {
    raw: input,
    goalType: isIelts || isPostgraduateEnglish ? "exam" : "skill",
    examKeyword: isIelts ? "ielts" : isPostgraduateEnglish ? "postgraduate_english" : undefined,
    durationDays,
    durationUncertain,
    currentLevel: levels.currentLevel,
    targetLevel: levels.targetLevel,
    startDate,
    dailyAvailableMinutes: Math.round(dailyHours * 60)
  };
}
