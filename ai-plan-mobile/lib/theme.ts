// 默认主题 - 自然暖色系
export const defaultTheme = {
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

  // 语义化颜色
  primary: 'rgba(245, 158, 11, 1)',
  success: 'rgba(134, 239, 172, 1)',
  warning: 'rgba(249, 115, 22, 1)',
  info: 'rgba(125, 211, 252, 1)',
  accent: 'rgba(244, 114, 182, 1)',
};

// Mecha 主题 - 冷色商务风
export const mechaTheme = {
  background: '#0f172a',
  foreground: '#d1d5db',
  ink: '#f9fafb',
  paper: 'rgba(31, 41, 55, 0.95)',
  cream: 'rgba(55, 65, 81, 0.85)',
  sun: 'rgba(59, 130, 246, 1)',
  orange: 'rgba(139, 92, 246, 1)',
  peach: 'rgba(99, 102, 241, 1)',
  mint: 'rgba(16, 185, 129, 1)',
  sky: 'rgba(14, 165, 233, 1)',
  berry: 'rgba(6, 182, 212, 1)',
  line: 'rgba(148, 163, 184, 0.3)',

  primary: 'rgba(59, 130, 246, 1)',
  success: 'rgba(16, 185, 129, 1)',
  warning: 'rgba(139, 92, 246, 1)',
  info: 'rgba(14, 165, 233, 1)',
  accent: 'rgba(6, 182, 212, 1)',
};

// Galaxy 主题 - 深邃星空风
export const galaxyTheme = {
  background: '#09090b',
  foreground: '#e2e8f0',
  ink: '#ffffff',
  paper: 'rgba(15, 23, 42, 0.95)',
  cream: 'rgba(30, 41, 59, 0.85)',
  sun: 'rgba(129, 140, 248, 1)',
  orange: 'rgba(167, 139, 250, 1)',
  peach: 'rgba(192, 132, 252, 1)',
  mint: 'rgba(52, 211, 153, 1)',
  sky: 'rgba(96, 165, 250, 1)',
  berry: 'rgba(244, 114, 182, 1)',
  line: 'rgba(148, 163, 184, 0.25)',

  primary: 'rgba(129, 140, 248, 1)',
  success: 'rgba(52, 211, 153, 1)',
  warning: 'rgba(167, 139, 250, 1)',
  info: 'rgba(96, 165, 250, 1)',
  accent: 'rgba(244, 114, 182, 1)',
};

// 默认使用 default 主题
export const theme = defaultTheme;

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
