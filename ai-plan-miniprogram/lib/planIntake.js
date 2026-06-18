// lib/planIntake.js - 领域模型

const pets = {
  fox: {
    id: 'fox', name: '聪明狐狸', emoji: '🦊',
    summary: '会帮你拆题、找规律，适合需要思路和节奏的人。',
    defaultStyle: 'hybrid',
    color: '#C86E24', light: '#FFF2E8', border: '#E8B58A',
  },
  owl: {
    id: 'owl', name: '猫头鹰导师', emoji: '🦉',
    summary: '擅长分析薄弱点和复盘，适合备考和提分。',
    defaultStyle: 'coach',
    color: '#3B547A', light: '#EEF3FA', border: '#C1D0E2',
  },
  dog: {
    id: 'dog', name: '热心小狗', emoji: '🐶',
    summary: '很会鼓劲和陪跑，适合容易拖延或想先稳住节奏的人。',
    defaultStyle: 'gentle',
    color: '#9B6134', light: '#FFF4EA', border: '#E7C6A7',
  },
};

const advisorStyles = {
  gentle: {
    id: 'gentle', name: '温柔陪跑', shortName: '温柔',
    color: '#2F8F7B', light: '#EAF7F3', border: '#BFE7DA',
  },
  coach: {
    id: 'coach', name: '理性教练', shortName: '教练',
    color: '#315B9A', light: '#EDF3FF', border: '#C7D8F8',
  },
  hybrid: {
    id: 'hybrid', name: '混合顾问', shortName: '混合',
    color: '#8A5A28', light: '#FFF4E6', border: '#F1D2A8',
  },
};

function createDefaultAdvisorProfile(style) {
  switch (style) {
    case 'gentle':
      return { strictness: 'soft', granularity: 'balanced', reminderStyle: 'quiet' };
    case 'coach':
      return { strictness: 'strict', granularity: 'detailed', reminderStyle: 'checkin' };
    default:
      return { strictness: 'balanced', granularity: 'balanced', reminderStyle: 'checkin' };
  }
}

function createInitialChatState(overrides) {
  return Object.assign({
    petId: 'fox',
    advisorStyle: 'hybrid',
    advisorProfile: createDefaultAdvisorProfile('hybrid'),
    messages: [],
    currentStep: 'goal',
    goal: '',
    dailyTime: 2,
    startDate: new Date().toISOString().split('T')[0],
    level: '',
    supplement: '',
  }, overrides || {});
}

function createMessage(text, isAI) {
  return {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    text: text,
    isAI: isAI,
    timestamp: new Date().toISOString(),
  };
}

function strictnessLabel(v) {
  return v === 'soft' ? '轻提醒' : v === 'strict' ? '盯得紧' : '适中';
}

function granularityLabel(v) {
  return v === 'light' ? '留白多' : v === 'detailed' ? '拆得细' : '平衡';
}

function reminderLabel(v) {
  return v === 'quiet' ? '安静型' : v === 'push' ? '推进型' : '复盘型';
}

module.exports = {
  pets, advisorStyles,
  createDefaultAdvisorProfile, createInitialChatState, createMessage,
  strictnessLabel, granularityLabel, reminderLabel,
};
