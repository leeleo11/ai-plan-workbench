export type AdvisorStyleId = 'gentle' | 'coach' | 'hybrid';
export type PetId = 'fox' | 'owl' | 'dog';
export type AdvisorStrictness = 'soft' | 'balanced' | 'strict';
export type AdvisorGranularity = 'light' | 'balanced' | 'detailed';
export type ReminderStyle = 'quiet' | 'checkin' | 'push';

export type AdvisorProfile = {
  strictness: AdvisorStrictness;
  granularity: AdvisorGranularity;
  reminderStyle: ReminderStyle;
};

export type PlanIntake = {
  goal: string;
  petId: PetId;
  advisorStyle: AdvisorStyleId;
  advisorProfile: AdvisorProfile;
  dailyTime: number;
  startDate: string;
  level: string;
  supplement: string;
};

export const advisorStyles = {
  gentle: {
    id: 'gentle',
    name: '温柔陪跑',
    shortName: '温柔',
    tone: '多鼓励、少压迫，适合需要稳定坚持的人。',
    color: '#2F8F7B',
    light: '#EAF7F3',
    border: '#BFE7DA',
  },
  coach: {
    id: 'coach',
    name: '理性教练',
    shortName: '教练',
    tone: '会追问目标、基础、时间和风险，建议更专业。',
    color: '#315B9A',
    light: '#EDF3FF',
    border: '#C7D8F8',
  },
  hybrid: {
    id: 'hybrid',
    name: '混合顾问',
    shortName: '混合',
    tone: '平时温和，遇到拖延和失衡时会变得更直接。',
    color: '#8A5A28',
    light: '#FFF4E6',
    border: '#F1D2A8',
  },
} satisfies Record<AdvisorStyleId, {
  id: AdvisorStyleId;
  name: string;
  shortName: string;
  tone: string;
  color: string;
  light: string;
  border: string;
}>;

export const pets = {
  fox: {
    id: 'fox',
    name: '聪明狐狸',
    emoji: '🦊',
    summary: '会帮你拆题、找规律，适合需要思路和节奏的人。',
    defaultStyle: 'hybrid',
    color: '#C86E24',
    light: '#FFF2E8',
    border: '#E8B58A',
  },
  owl: {
    id: 'owl',
    name: '猫头鹰导师',
    emoji: '🦉',
    summary: '擅长分析薄弱点和复盘，适合备考和提分。',
    defaultStyle: 'coach',
    color: '#3B547A',
    light: '#EEF3FA',
    border: '#C1D0E2',
  },
  dog: {
    id: 'dog',
    name: '热心小狗',
    emoji: '🐶',
    summary: '很会鼓劲和陪跑，适合容易拖延或想先稳住节奏的人。',
    defaultStyle: 'gentle',
    color: '#9B6134',
    light: '#FFF4EA',
    border: '#E7C6A7',
  },
} satisfies Record<PetId, {
  id: PetId;
  name: string;
  emoji: string;
  summary: string;
  defaultStyle: AdvisorStyleId;
  color: string;
  light: string;
  border: string;
}>;

const stylePrompt: Record<AdvisorStyleId, string> = {
  gentle: 'Advisor style: gentle accountability partner. Encourage the user and keep tasks sustainable.',
  coach: 'Advisor style: rational study coach. Ask about risks, weak areas, time budget, and measurable progress.',
  hybrid: 'Advisor style: hybrid private advisor. Be warm by default, but become direct when the plan is unrealistic.',
};

export function createDefaultAdvisorProfile(style: AdvisorStyleId): AdvisorProfile {
  switch (style) {
    case 'gentle':
      return { strictness: 'soft', granularity: 'balanced', reminderStyle: 'quiet' };
    case 'coach':
      return { strictness: 'strict', granularity: 'detailed', reminderStyle: 'checkin' };
    case 'hybrid':
    default:
      return { strictness: 'balanced', granularity: 'balanced', reminderStyle: 'checkin' };
  }
}

export function inferDurationDays(goal: string): number {
  const dayMatch = goal.match(/(\d+)\s*(?:天|day|days)/i);
  if (dayMatch?.[1]) return Number(dayMatch[1]);

  const monthMatch = goal.match(/(\d+)\s*(?:个月|月|month|months)/i);
  if (monthMatch?.[1]) return Number(monthMatch[1]) * 30;

  return 30;
}

function strictnessPrompt(value: AdvisorStrictness): string {
  switch (value) {
    case 'soft':
      return 'soft';
    case 'strict':
      return 'strict';
    default:
      return 'balanced';
  }
}

function granularityPrompt(value: AdvisorGranularity): string {
  switch (value) {
    case 'light':
      return 'light';
    case 'detailed':
      return 'detailed';
    default:
      return 'balanced';
  }
}

function reminderPrompt(value: ReminderStyle): string {
  switch (value) {
    case 'quiet':
      return 'quiet';
    case 'push':
      return 'push';
    default:
      return 'checkin';
  }
}

export function buildStructuredParams(intake: PlanIntake) {
  return {
    goal: intake.goal,
    dailyTime: intake.dailyTime,
    startDate: intake.startDate,
    level: intake.level,
    supplement: intake.supplement,
  };
}

export function buildPlanPrompt(intake: PlanIntake): string {
  const durationDays = inferDurationDays(intake.goal);
  const pet = pets[intake.petId];
  const level = intake.level.trim() || '未说明';
  const supplement = intake.supplement.trim() || '无补充信息';

  return [
    `plan for ${durationDays} days`,
    `Goal: ${intake.goal}`,
    `Pet companion: ${pet.id} ${pet.name}`,
    `Start: ${intake.startDate} start`,
    `Daily time: ${intake.dailyTime} hours; 每天 ${intake.dailyTime} 小时`,
    `Current level: ${level}`,
    `User notes: ${supplement}`,
    stylePrompt[intake.advisorStyle],
    `Advisor profile: strictness=${strictnessPrompt(intake.advisorProfile.strictness)}, granularity=${granularityPrompt(intake.advisorProfile.granularity)}, reminder=${reminderPrompt(intake.advisorProfile.reminderStyle)}.`,
    'Output requirement: 双层结构，先给阶段路线，再展开每日任务。',
  ].join('\n');
}

export function buildAdvisorSummary(intake: PlanIntake): string {
  const pet = pets[intake.petId];
  const days = inferDurationDays(intake.goal);
  return `${pet.name}已经帮你把「${intake.goal}」拆成了 ${days} 天的计划。每天大约 ${intake.dailyTime} 小时，按阶段推进，完成一项就打卡一项。`;
}

export function strictnessLabel(value: AdvisorStrictness): string {
  return value === 'soft' ? '轻提醒' : value === 'strict' ? '盯得紧' : '适中';
}

export function granularityLabel(value: AdvisorGranularity): string {
  return value === 'light' ? '留白多' : value === 'detailed' ? '拆得细' : '平衡';
}

export function reminderLabel(value: ReminderStyle): string {
  return value === 'quiet' ? '安静型' : value === 'push' ? '推进型' : '复盘型';
}
