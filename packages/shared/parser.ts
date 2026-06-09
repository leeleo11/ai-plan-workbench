export type GoalCategory = "learning" | "project" | "habit" | "health" | "career" | "custom";

export type ParsedGoalInput = {
  raw: string;
  goalCategory: GoalCategory;
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

  const chinese = text.match(/从\s*(.+?)\s*(?:到|提到|提高到|变成)\s*(.+?)(?:[，,。!！?？\s]|$)/);
  if (chinese) return { currentLevel: chinese[1].trim(), targetLevel: chinese[2].trim() };

  return {};
}

function extractStartDate(text: string): string | undefined {
  const match = text.match(/(\d{4}-\d{2}-\d{2})\s*(?:开始|start)?/i);
  return match?.[1];
}

function detectCategory(text: string): GoalCategory {
  const lower = text.toLowerCase();

  if (/习惯|坚持|每日|每天.*做|养成|打卡|routine|habit/i.test(text)) return "habit";
  if (/健康|减重|增肌|跑步|健身|运动|减肥|health|fitness|workout|run/i.test(text)) return "health";
  if (/职业|升职|面试|跳槽|求职|简历|career|job|interview/i.test(text)) return "career";
  if (/学|读|背|练|备考|考试|learn|study|prepare|read|practice/i.test(text)) return "learning";
  if (/项目|做完|完成.*作品|开发|上线|product|project|side.?project/i.test(text)) return "project";

  return "custom";
}

export function parseGoalInput(input: string): ParsedGoalInput {
  const lower = input.toLowerCase();
  const durationUncertain = /时间.*不确定|时长.*不确定|周期.*不确定|暂不确定|还没定|未知|uncertain|not sure/i.test(input);
  const durationDays = extractNumber(lower, [/(\d+)\s*(?:day|days)/, /(\d+)\s*天/], durationUncertain ? 30 : 30);
  const dailyHours = extractNumber(lower, [/(\d+(?:\.\d+)?)\s*(?:hour|hours)/, /(\d+(?:\.\d+)?)\s*小时/], 1);
  const levels = extractLevels(input);
  const startDate = extractStartDate(input);

  return {
    raw: input,
    goalCategory: detectCategory(input),
    durationDays,
    durationUncertain,
    currentLevel: levels.currentLevel,
    targetLevel: levels.targetLevel,
    startDate,
    dailyAvailableMinutes: Math.round(dailyHours * 60)
  };
}
