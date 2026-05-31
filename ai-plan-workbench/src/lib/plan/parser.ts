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
