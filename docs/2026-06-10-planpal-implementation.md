# PlanPal - AI 计划伙伴系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建有亲和力的 AI 宠物伙伴系统，通过聊天式交互和5种可选性格，提升用户体验和参与度

**Architecture:** 使用 React Native + Expo 实现分步向导流程，5种 AI 宠物性格（狐狸、猫咪、狗狗、猫头鹰、龙），通过聊天界面收集用户信息，生成计划后展示日历表

**Tech Stack:** React Native, Expo, expo-router, TypeScript, React Native Reanimated, StyleSheet

---

## 📋 Phase 1: 基础框架 (1周)

### Task 1: 创建项目结构

**Files:**
- Create: `ai-plan-mobile/lib/personality.ts`
- Create: `ai-plan-mobile/lib/theme.ts`
- Create: `ai-plan-mobile/components/ChatBubble.tsx`
- Create: `ai-plan-mobile/components/PersonalityCard.tsx`
- Create: `ai-plan-mobile/components/Calendar.tsx`

- [ ] **Step 1: 创建性格配置文件**

```typescript
// ai-plan-mobile/lib/personality.ts
export interface Personality {
  id: string;
  name: string;
  emoji: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  greetings: string[];
  encouragements: string[];
  questions: {
    goal: string;
    dailyTime: string;
    startDate: string;
    level: string;
    supplement: string;
  };
}

export const personalities: Record<string, Personality> = {
  fox: {
    id: 'fox',
    name: '聪明狐狸',
    emoji: '🦊',
    color: '#F97316',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    greetings: [
      '嗨！我是你的 PlanPal！🦊',
      '让我们一起制定计划吧！',
      '告诉我你想达成什么目标？'
    ],
    encouragements: [
      '哇！这个目标很棒呢！🎉',
      '你今天超棒的！✨',
      '让我想想...有了！'
    ],
    questions: {
      goal: '你想达成什么目标？（比如：30天学英语）',
      dailyTime: '每天能投入多少时间？',
      startDate: '打算什么时候开始？',
      level: '你现在的水平是？',
      supplement: '还有什么想补充的吗？（选填）'
    }
  },
  cat: {
    id: 'cat',
    name: '慵懒猫咪',
    emoji: '🐱',
    color: '#8B5CF6',
    backgroundColor: '#FAF5FF',
    borderColor: '#EDE9FE',
    greetings: [
      '喵~ 你好！我是你的 PlanPal 🐱',
      '让我们慢慢来，制定计划~',
      '你想做什么呢？'
    ],
    encouragements: [
      '你已经做得很好了喵~',
      '慢慢来，不着急~',
      '休息一下也可以哦~'
    ],
    questions: {
      goal: '你的目标是什么呢~？',
      dailyTime: '每天打算花多少时间~？',
      startDate: '什么时候开始~？',
      level: '目前的水平是~？',
      supplement: '还有想说的吗~？（选填）'
    }
  },
  dog: {
    id: 'dog',
    name: '忠诚狗狗',
    emoji: '🐕',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    greetings: [
      '嗨！我是你的 PlanPal！🐕',
      '让我们一起冲！',
      '你的目标是什么？汪！'
    ],
    encouragements: [
      '太棒了！继续加油！汪！',
      '我相信你一定能做到！',
      '让我们一起冲！'
    ],
    questions: {
      goal: '你的目标是什么？汪！',
      dailyTime: '每天能投入多少时间？',
      startDate: '什么时候开始冲？',
      level: '目前水平怎么样？',
      supplement: '还有什么想说的？'
    }
  },
  owl: {
    id: 'owl',
    name: '智慧猫头鹰',
    emoji: '🦉',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
    greetings: [
      '你好！我是你的 PlanPal 🦉',
      '让我帮你分析一下...',
      '你的目标是什么？'
    ],
    encouragements: [
      '根据我的分析...',
      '这是一个很好的策略',
      '让我们优化这个计划'
    ],
    questions: {
      goal: '你的目标是什么？让我分析一下...',
      dailyTime: '每天能投入多少时间？',
      startDate: '计划什么时候开始？',
      level: '你目前的基础如何？',
      supplement: '还有什么需要考虑的？（选填）'
    }
  },
  dragon: {
    id: 'dragon',
    name: '勇敢小龙',
    emoji: '🐲',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    greetings: [
      '准备好接受挑战了吗？🐲',
      '这是你的冒险！',
      '告诉我你的目标！'
    ],
    encouragements: [
      '太棒了！让我们征服这个目标！',
      '这是你的冒险！',
      '加油！你一定能做到！'
    ],
    questions: {
      goal: '准备好接受挑战了吗？告诉我你的目标！',
      dailyTime: '每天能战斗多长时间？',
      startDate: '什么时候开始冒险？',
      level: '你现在的实力如何？',
      supplement: '还有什么战略需要考虑？（选填）'
    }
  }
};
```

- [ ] **Step 2: 运行测试验证导入**

Run: `cd ai-plan-mobile && npm run build`
Expected: 无错误，成功编译

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/lib/personality.ts
git commit -m "feat: add personality configuration system"
```

---

### Task 2: 创建主题配置

**Files:**
- Create: `ai-plan-mobile/lib/theme.ts`

- [ ] **Step 1: 创建主题配置文件**

```typescript
// ai-plan-mobile/lib/theme.ts
import { Personality } from './personality';

export interface Theme {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  primary: string;
  primaryLight: string;
  primaryBorder: string;
}

export function getThemeByPersonality(personality: Personality): Theme {
  return {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1F2937',
    secondaryText: '#6B7280',
    primary: personality.color,
    primaryLight: personality.backgroundColor,
    primaryBorder: personality.borderColor,
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
```

- [ ] **Step 2: 运行测试验证导入**

Run: `cd ai-plan-mobile && npm run build`
Expected: 无错误，成功编译

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/lib/theme.ts
git commit -m "feat: add theme configuration system"
```

---

### Task 3: 创建 ChatBubble 组件

**Files:**
- Create: `ai-plan-mobile/components/ChatBubble.tsx`

- [ ] **Step 1: 创建聊天气泡组件**

```typescript
// ai-plan-mobile/components/ChatBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Personality } from '../lib/personality';

interface ChatBubbleProps {
  message: string;
  isAI: boolean;
  personality: Personality;
}

export function ChatBubble({ message, isAI, personality }: ChatBubbleProps) {
  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      {isAI && (
        <View style={[styles.avatar, { backgroundColor: personality.backgroundColor }]}>
          <Text style={styles.avatarEmoji}>{personality.emoji}</Text>
        </View>
      )}
      <View style={[
        styles.bubble,
        isAI 
          ? [styles.aiBubble, { backgroundColor: personality.backgroundColor, borderColor: personality.borderColor }]
          : styles.userBubble
      ]}>
        <Text style={[styles.message, isAI && { color: personality.color }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#E5E7EB',
    borderBottomRightRadius: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
```

- [ ] **Step 2: 运行测试验证导入**

Run: `cd ai-plan-mobile && npm run build`
Expected: 无错误，成功编译

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/components/ChatBubble.tsx
git commit -m "feat: add ChatBubble component"
```

---

### Task 4: 创建 PersonalityCard 组件

**Files:**
- Create: `ai-plan-mobile/components/PersonalityCard.tsx`

- [ ] **Step 1: 创建性格卡片组件**

```typescript
// ai-plan-mobile/components/PersonalityCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Personality } from '../lib/personality';

interface PersonalityCardProps {
  personality: Personality;
  isSelected: boolean;
  onSelect: (personality: Personality) => void;
}

export function PersonalityCard({ personality, isSelected, onSelect }: PersonalityCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: personality.backgroundColor,
          borderColor: isSelected ? personality.color : personality.borderColor,
          borderWidth: isSelected ? 3 : 2,
        }
      ]}
      onPress={() => onSelect(personality)}
    >
      <View style={[styles.emojiContainer, { backgroundColor: personality.color }]}>
        <Text style={styles.emoji}>{personality.emoji}</Text>
      </View>
      <Text style={[styles.name, { color: personality.color }]}>{personality.name}</Text>
      <Text style={styles.description}>{personality.greetings[0]}</Text>
      {isSelected && (
        <View style={[styles.selectedBadge, { backgroundColor: personality.color }]}>
          <Text style={styles.selectedText}>✓ 已选择</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 40,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: 运行测试验证导入**

Run: `cd ai-plan-mobile && npm run build`
Expected: 无错误，成功编译

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/components/PersonalityCard.tsx
git commit -m "feat: add PersonalityCard component"
```

---

## 🎯 Phase 2: 核心功能 (2周)

### Task 5: 实现欢迎页

**Files:**
- Modify: `ai-plan-mobile/app/index.tsx`

- [ ] **Step 1: 重写欢迎页**

```typescript
// ai-plan-mobile/app/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { mobilePlanStore } from '../lib/store';
import { defaultTheme } from '../lib/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    checkExistingPlan();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function checkExistingPlan() {
    const plan = await mobilePlanStore.getLatestPlan();
    setHasPlan(!!plan);
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>🦊</Text>
        <Text style={styles.title}>PlanPal</Text>
        <Text style={styles.subtitle}>你的 AI 计划伙伴</Text>
        <Text style={styles.description}>
          让可爱的 AI 宠物帮你制定计划，达成目标！
        </Text>
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/personality')}
        >
          <Text style={styles.startButtonText}>开始制定计划 →</Text>
        </TouchableOpacity>

        {hasPlan && (
          <TouchableOpacity
            style={styles.viewPlanButton}
            onPress={() => router.push('/plan')}
          >
            <Text style={styles.viewPlanButtonText}>查看我的计划</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: defaultTheme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: defaultTheme.secondaryText,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: defaultTheme.secondaryText,
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: defaultTheme.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewPlanButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: defaultTheme.primary,
  },
  viewPlanButtonText: {
    color: defaultTheme.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: 运行测试验证**

Run: `cd ai-plan-mobile && npm start`
Expected: 欢迎页显示正确，有动画效果

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/app/index.tsx
git commit -m "feat: implement welcome screen with animations"
```

---

### Task 6: 实现性格选择页

**Files:**
- Create: `ai-plan-mobile/app/personality.tsx`

- [ ] **Step 1: 创建性格选择页面**

```typescript
// ai-plan-mobile/app/personality.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { personalities, Personality } from '../lib/personality';
import { PersonalityCard } from '../components/PersonalityCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PersonalityScreen() {
  const router = useRouter();
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);

  async function handleConfirm() {
    if (!selectedPersonality) {
      Alert.alert('请选择', '请先选择一个 AI 宠物性格');
      return;
    }
    
    await AsyncStorage.setItem('selectedPersonality', selectedPersonality.id);
    router.push('/chat');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>选择你的 PlanPal</Text>
      </View>

      <ScrollView style={styles.content}>
        {Object.values(personalities).map((personality) => (
          <PersonalityCard
            key={personality.id}
            personality={personality}
            isSelected={selectedPersonality?.id === personality.id}
            onSelect={setSelectedPersonality}
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          !selectedPersonality && styles.confirmButtonDisabled
        ]}
        onPress={handleConfirm}
        disabled={!selectedPersonality}
      >
        <Text style={styles.confirmButtonText}>确认选择</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  confirmButton: {
    backgroundColor: '#F97316',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: 运行测试验证**

Run: `cd ai-plan-mobile && npm start`
Expected: 性格选择页显示正确，可选择性格

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/app/personality.tsx
git commit -m "feat: implement personality selection screen"
```

---

### Task 7: 实现聊天输入页

**Files:**
- Create: `ai-plan-mobile/app/chat.tsx`
- Create: `ai-plan-mobile/lib/chatState.ts`

- [ ] **Step 1: 创建聊天状态管理**

```typescript
// ai-plan-mobile/lib/chatState.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Personality } from './personality';

export interface ChatMessage {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
}

export interface ChatState {
  personality: Personality | null;
  messages: ChatMessage[];
  currentStep: 'goal' | 'dailyTime' | 'startDate' | 'level' | 'supplement' | 'complete';
  goal: string;
  dailyTime: number;
  startDate: string;
  level: string;
  supplement: string;
}

export async function loadChatState(): Promise<ChatState> {
  const personalityId = await AsyncStorage.getItem('selectedPersonality');
  const personality = personalityId ? (await import('./personality')).personalities[personalityId] : null;
  
  return {
    personality,
    messages: [],
    currentStep: 'goal',
    goal: '',
    dailyTime: 1,
    startDate: new Date().toISOString().split('T')[0],
    level: '',
    supplement: '',
  };
}

export async function saveChatState(state: ChatState): Promise<void> {
  await AsyncStorage.setItem('chatState', JSON.stringify(state));
}
```

- [ ] **Step 2: 创建聊天页面**

```typescript
// ai-plan-mobile/app/chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChatBubble } from '../components/ChatBubble';
import { loadChatState, saveChatState, ChatMessage, ChatState } from '../lib/chatState';
import { getThemeByPersonality } from '../lib/theme';

export default function ChatScreen() {
  const router = useRouter();
  const [state, setState] = useState<ChatState | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initChat();
  }, []);

  async function initChat() {
    const chatState = await loadChatState();
    setState(chatState);
    
    if (chatState.personality) {
      addAIMessage(chatState.personality.greetings[0]);
      setTimeout(() => {
        addAIMessage(chatState.personality!.questions.goal);
      }, 1000);
    }
  }

  function addAIMessage(text: string) {
    if (!state) return;
    
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text,
        isAI: true,
        timestamp: new Date(),
      };
      setState(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);
      setIsTyping(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 500);
  }

  function addUserMessage(text: string) {
    if (!state) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isAI: false,
      timestamp: new Date(),
    };
    setState(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }

  async function handleSend() {
    if (!inputText.trim() || !state || !state.personality) return;
    
    addUserMessage(inputText);
    setInputText('');
    
    const newState = { ...state };
    
    switch (state.currentStep) {
      case 'goal':
        newState.goal = inputText;
        newState.currentStep = 'dailyTime';
        addAIMessage('很棒！' + state.personality.encouragements[0]);
        setTimeout(() => {
          addAIMessage(state.personality!.questions.dailyTime);
        }, 1000);
        break;
      case 'supplement':
        newState.supplement = inputText;
        newState.currentStep = 'complete';
        addAIMessage('好的！让我为你生成计划...');
        await saveChatState(newState);
        setTimeout(() => {
          router.push('/generating');
        }, 1500);
        return;
    }
    
    setState(newState);
    await saveChatState(newState);
  }

  async function handleSliderChange(value: number) {
    if (!state || !state.personality) return;
    
    addUserMessage(`${value} 小时`);
    
    const newState = { ...state, dailyTime: value, currentStep: 'startDate' as const };
    setState(newState);
    await saveChatState(newState);
    
    addAIMessage(state.personality.encouragements[0]);
    setTimeout(() => {
      addAIMessage(state.personality!.questions.startDate);
    }, 1000);
  }

  async function handleDateChange(date: string) {
    if (!state || !state.personality) return;
    
    addUserMessage(date);
    
    const newState = { ...state, startDate: date, currentStep: 'level' as const };
    setState(newState);
    await saveChatState(newState);
    
    addAIMessage(state.personality.encouragements[0]);
    setTimeout(() => {
      addAIMessage(state.personality!.questions.level);
    }, 1000);
  }

  async function handleLevelSelect(level: string) {
    if (!state || !state.personality) return;
    
    addUserMessage(level);
    
    const newState = { ...state, level, currentStep: 'supplement' as const };
    setState(newState);
    await saveChatState(newState);
    
    addAIMessage(state.personality.encouragements[0]);
    setTimeout(() => {
      addAIMessage(state.personality!.questions.supplement);
    }, 1000);
  }

  if (!state || !state.personality) {
    return <View style={styles.loading}><Text>加载中...</Text></View>;
  }

  const theme = getThemeByPersonality(state.personality);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: theme.primaryLight }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {state.personality.emoji} {state.personality.name}
        </Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {state.messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isAI={message.isAI}
            personality={state.personality!}
          />
        ))}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text>正在输入...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        {state.currentStep === 'dailyTime' ? (
          <View style={styles.sliderContainer}>
            <Text>每天 {state.dailyTime} 小时</Text>
            <TouchableOpacity 
              style={[styles.quickButton, { backgroundColor: theme.primary }]}
              onPress={() => handleSliderChange(1)}
            >
              <Text style={styles.quickButtonText}>1小时</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickButton, { backgroundColor: theme.primary }]}
              onPress={() => handleSliderChange(2)}
            >
              <Text style={styles.quickButtonText}>2小时</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickButton, { backgroundColor: theme.primary }]}
              onPress={() => handleSliderChange(3)}
            >
              <Text style={styles.quickButtonText}>3小时</Text>
            </TouchableOpacity>
          </View>
        ) : state.currentStep === 'startDate' ? (
          <View style={styles.dateContainer}>
            <TouchableOpacity 
              style={[styles.quickButton, { backgroundColor: theme.primary }]}
              onPress={() => handleDateChange('今天')}
            >
              <Text style={styles.quickButtonText}>今天开始</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickButton, { backgroundColor: theme.primary }]}
              onPress={() => handleDateChange('明天')}
            >
              <Text style={styles.quickButtonText}>明天开始</Text>
            </TouchableOpacity>
          </View>
        ) : state.currentStep === 'level' ? (
          <View style={styles.levelContainer}>
            {['零基础', '初学者', '有基础', '熟练'].map((level) => (
              <TouchableOpacity 
                key={level}
                style={[styles.quickButton, { backgroundColor: theme.primary }]}
                onPress={() => handleLevelSelect(level)}
              >
                <Text style={styles.quickButtonText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="输入消息..."
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: theme.primary }]}
              onPress={handleSend}
            >
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.6,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 3: 运行测试验证**

Run: `cd ai-plan-mobile && npm start`
Expected: 聊天页面显示正确，可输入消息

- [ ] **Step 4: 提交代码**

```bash
git add ai-plan-mobile/app/chat.tsx ai-plan-mobile/lib/chatState.ts
git commit -m "feat: implement chat interface with step-by-step guidance"
```

---

## 📅 Phase 3: 日历表 (1周)

### Task 8: 创建日历组件

**Files:**
- Create: `ai-plan-mobile/components/Calendar.tsx`

- [ ] **Step 1: 创建日历组件**

```typescript
// ai-plan-mobile/components/Calendar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plan } from '../lib/shared/schema';
import { getThemeByPersonality } from '../lib/theme';
import { Personality } from '../lib/personality';

interface CalendarProps {
  plan: Plan;
  personality: Personality;
  onDayPress: (date: string) => void;
}

export function Calendar({ plan, personality, onDayPress }: CalendarProps) {
  const theme = getThemeByPersonality(personality);
  const today = new Date().toISOString().split('T')[0];
  
  const getTasksForDate = (date: string) => {
    return plan.tasks.filter(t => t.date === date);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.monthTitle, { color: theme.primary }]}>
        {year}年 {month + 1}月
      </Text>
      
      <View style={styles.weekdayHeader}>
        {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayContainer} />;
          }
          
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const tasks = getTasksForDate(dateStr);
          const isToday = dateStr === today;
          
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayContainer,
                isToday && { backgroundColor: theme.primaryLight, borderColor: theme.primary }
              ]}
              onPress={() => onDayPress(dateStr)}
            >
              <Text style={[styles.dayNumber, isToday && { color: theme.primary, fontWeight: 'bold' }]}>
                {day}
              </Text>
              {tasks.length > 0 && (
                <View style={[styles.taskBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.taskCount}>{tasks.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekday: {
    fontSize: 12,
    color: '#6B7280',
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 14,
    color: '#1F2937',
  },
  taskBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCount: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: 运行测试验证**

Run: `cd ai-plan-mobile && npm run build`
Expected: 日历组件无错误

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/components/Calendar.tsx
git commit -m "feat: add Calendar component with task indicators"
```

---

### Task 9: 实现计划日历页

**Files:**
- Create: `ai-plan-mobile/app/plan.tsx`

- [ ] **Step 1: 创建计划日历页面**

```typescript
// ai-plan-mobile/app/plan.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from '../components/Calendar';
import { mobilePlanStore } from '../lib/store';
import { loadChatState } from '../lib/chatState';
import { getThemeByPersonality } from '../lib/theme';
import { Plan, PlanTask } from '../lib/shared/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PlanScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [personality, setPersonality] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    const latestPlan = await mobilePlanStore.getLatestPlan();
    setPlan(latestPlan);
    
    const chatState = await loadChatState();
    setPersonality(chatState.personality);
  }

  function handleDayPress(date: string) {
    setSelectedDate(date);
  }

  function getTasksForDate(date: string): PlanTask[] {
    if (!plan) return [];
    return plan.tasks.filter(t => t.date === date);
  }

  if (!plan || !personality) {
    return (
      <View style={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const theme = getThemeByPersonality(personality);
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primaryLight }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {personality.emoji} 我的计划
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeMessage}>
          <Text style={styles.welcomeText}>
            {personality.emoji} {personality.name}说：{plan.brief.summary}
          </Text>
        </View>

        <Calendar
          plan={plan}
          personality={personality}
          onDayPress={handleDayPress}
        />

        {selectedDate && (
          <View style={styles.taskList}>
            <Text style={[styles.taskListTitle, { color: theme.primary }]}>
              {selectedDate} 的任务
            </Text>
            {selectedTasks.length === 0 ? (
              <Text style={styles.noTasks}>今天没有任务</Text>
            ) : (
              selectedTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskItem, { borderColor: theme.primaryBorder }]}
                  onPress={() => router.push(`/task/${task.id}`)}
                >
                  <View style={[styles.taskStatus, { backgroundColor: task.status === 'done' ? theme.primary : '#E5E7EB' }]}>
                    {task.status === 'done' && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDuration}>{task.durationMinutes}分钟</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.generateNewButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/chat')}
        >
          <Text style={styles.generateNewButtonText}>生成新计划</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeMessage: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  taskList: {
    marginTop: 16,
  },
  taskListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noTasks: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 24,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  taskStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  taskDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  generateNewButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  generateNewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: 运行测试验证**

Run: `cd ai-plan-mobile && npm start`
Expected: 计划日历页显示正确，可查看任务

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/app/plan.tsx
git commit -m "feat: implement plan calendar screen"
```

---

## 🎭 Phase 4: 扩展性格 (1周)

### Task 10: 更新配置支持所有性格

**Files:**
- Modify: `ai-plan-mobile/lib/personality.ts`
- Modify: `ai-plan-mobile/app/personality.tsx`

- [ ] **Step 1: 验证所有性格配置已添加**

Run: `cd ai-plan-mobile && grep -c "id:" lib/personality.ts`
Expected: 5（狐狸、猫咪、狗狗、猫头鹰、龙）

- [ ] **Step 2: 测试所有性格选择**

Run: `cd ai-plan-mobile && npm start`
Expected: 所有5种性格可正常选择

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/lib/personality.ts ai-plan-mobile/app/personality.tsx
git commit -m "feat: enable all 5 personality types"
```

---

## ✨ Phase 5: 优化 (1周)

### Task 11: 添加动画效果

**Files:**
- Modify: `ai-plan-mobile/components/ChatBubble.tsx`
- Modify: `ai-plan-mobile/components/PersonalityCard.tsx`

- [ ] **Step 1: 添加聊天气泡动画**

```typescript
// 在 ChatBubble.tsx 中添加
import { Animated } from 'react-native';

// 添加动画逻辑
const fadeAnim = new Animated.Value(0);

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, []);

// 在返回中添加动画样式
<Animated.View style={{ opacity: fadeAnim }}>
  {/* 原有内容 */}
</Animated.View>
```

- [ ] **Step 2: 运行测试验证动画效果**

Run: `cd ai-plan-mobile && npm start`
Expected: 聊天气泡有淡入动画

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/components/ChatBubble.tsx ai-plan-mobile/components/PersonalityCard.tsx
git commit -m "feat: add animations to chat and personality components"
```

---

### Task 12: 性能优化

**Files:**
- Modify: `ai-plan-mobile/app/chat.tsx`
- Modify: `ai-plan-mobile/app/plan.tsx`

- [ ] **Step 1: 添加加载状态**

```typescript
// 在页面中添加
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData().then(() => setIsLoading(false));
}, []);

if (isLoading) {
  return <LoadingSpinner />;
}
```

- [ ] **Step 2: 测试性能**

Run: `cd ai-plan-mobile && npm start`
Expected: 页面加载时间 < 500ms

- [ ] **Step 3: 提交代码**

```bash
git add ai-plan-mobile/app/chat.tsx ai-plan-mobile/app/plan.tsx
git commit -m "feat: optimize loading performance"
```

---

## 📊 实施计划总结

### 时间表

| 阶段 | 任务 | 工作量 | 累计时间 |
|------|------|--------|----------|
| Phase 1 | 基础框架 | 4个任务 | 1周 |
| Phase 2 | 核心功能 | 5个任务 | 3周 |
| Phase 3 | 日历表 | 2个任务 | 4周 |
| Phase 4 | 扩展性格 | 1个任务 | 5周 |
| Phase 5 | 优化 | 2个任务 | 6周 |

### 依赖关系

```
Task 1 (项目结构) → Task 5 (欢迎页)
Task 1 (项目结构) → Task 6 (性格选择)
Task 6 (性格选择) → Task 7 (聊天输入)
Task 7 (聊天输入) → Task 8 (日历组件)
Task 8 (日历组件) → Task 9 (计划日历页)
Task 9 (计划日历页) → Task 10 (扩展性格)
```

### 验收标准

#### Phase 1
- ✅ 所有文件创建成功
- ✅ 代码无编译错误
- ✅ 基础组件可正常导入

#### Phase 2
- ✅ 欢迎页有动画效果
- ✅ 性格选择页可选择所有5种性格
- ✅ 聊天界面可正常输入和显示消息
- ✅ 分步向导流程完整

#### Phase 3
- ✅ 日历组件显示正确
- ✅ 可点击日期查看任务
- ✅ 任务列表显示正确

#### Phase 4
- ✅ 所有5种性格可正常切换
- ✅ 每种性格的主题颜色正确应用
- ✅ 对话风格符合性格设定

#### Phase 5
- ✅ 动画效果流畅
- ✅ 加载时间 < 500ms
- ✅ 无崩溃

---

## 📝 下一步行动

### 立即开始

1. **执行 Phase 1** - 创建项目结构和基础组件
2. **每日提交** - 每完成一个任务就提交
3. **每周评审** - 每周结束时评审进度

### 跟踪进度

使用 todo list 跟踪：
- [ ] Task 1-4: 基础框架
- [ ] Task 5-9: 核心功能
- [ ] Task 10: 扩展性格
- [ ] Task 11-12: 优化

---

**计划完成** ✅

请审阅此计划，确认后开始实施。
