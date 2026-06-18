import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createDefaultAdvisorProfile,
  type AdvisorProfile,
  type AdvisorStyleId,
  type PetId,
} from './planIntake';

export interface ChatMessage {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: string;
}

export type ChatStep = 'goal' | 'dailyTime' | 'startDate' | 'level' | 'supplement' | 'complete';

export interface ChatState {
  petId: PetId;
  advisorStyle: AdvisorStyleId;
  advisorProfile: AdvisorProfile;
  messages: ChatMessage[];
  currentStep: ChatStep;
  goal: string;
  dailyTime: number;
  startDate: string;
  level: string;
  supplement: string;
}

const STORAGE_KEY_CHAT_STATE = 'planpal.chatState.v2';

export function createMessage(text: string, isAI: boolean): ChatMessage {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text,
    isAI,
    timestamp: new Date().toISOString(),
  };
}

export function createInitialChatState(overrides: Partial<ChatState> = {}): ChatState {
  return {
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
    ...overrides,
  };
}

export async function loadChatState(): Promise<ChatState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_CHAT_STATE);
  if (!raw) return createInitialChatState();

  try {
    const parsed = JSON.parse(raw) as Partial<ChatState>;
    return createInitialChatState(parsed);
  } catch {
    return createInitialChatState();
  }
}

export async function saveChatState(state: ChatState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_CHAT_STATE, JSON.stringify(state));
}

export async function resetChatState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY_CHAT_STATE);
}
