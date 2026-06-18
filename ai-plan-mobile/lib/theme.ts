export interface Theme {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  primary: string;
  primaryLight: string;
  primaryBorder: string;
}

export function getThemeByColors(color: string, backgroundColor: string, borderColor: string): Theme {
  return {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1F2937',
    secondaryText: '#6B7280',
    primary: color,
    primaryLight: backgroundColor,
    primaryBorder: borderColor,
  };
}

export const defaultTheme: Theme = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1F2937',
  secondaryText: '#6B7280',
  primary: '#F97316',
  primaryLight: '#FFF7ED',
  primaryBorder: '#FED7AA',
};

// Backward compatibility - Legacy theme structure
export const legacyTheme = {
  background: '#f8f9fa',
  foreground: '#334155',
  ink: '#1e293b',
  paper: 'rgba(255, 255, 255, 0.95)',
  cream: 'rgba(255, 255, 255, 0.85)',
  sun: 'rgba(245, 158, 11, 1)',
  orange: 'rgba(249, 115, 22, 1)',
  peach: 'rgba(254, 215, 170, 1)',
  mint: 'rgba(134, 239, 172, 1)',
  sky: 'rgba(125, 211, 252, 1)',
  berry: 'rgba(244, 114, 182, 1)',
  line: 'rgba(203, 213, 225, 0.5)',

  primary: 'rgba(245, 158, 11, 1)',
  success: 'rgba(134, 239, 172, 1)',
  warning: 'rgba(249, 115, 22, 1)',
  info: 'rgba(125, 211, 252, 1)',
  accent: 'rgba(244, 114, 182, 1)',
};

// Backward compatibility - Use legacy theme as default
export const theme = legacyTheme;

export const categoryLabel: Record<string, string> = {
  learn: '学习',
  practice: '练习',
  review: '复盘',
  project: '项目',
  plan: '规划',
  build: '执行',
  test: '测试',
  daily: '日常',
  adjust: '调整',
  warmup: '热身',
  core: '核心',
  cooldown: '放松',
  research: '调研',
  apply: '应用',
};

export const priorityLabel: Record<string, string> = {
  high: '主线',
  medium: '支线',
  low: '轻松',
};

export const statusLabel: Record<string, string> = {
  todo: '待挑战',
  done: '已通关',
  skipped: '先跳过',
  delayed: '延期中',
};

