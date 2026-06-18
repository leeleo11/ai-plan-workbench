import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChatBubble } from '../components/ChatBubble';
import {
  ChatState,
  ChatStep,
  createInitialChatState,
  createMessage,
  loadChatState,
  saveChatState,
} from '../lib/chatState';
import { advisorStyles, pets } from '../lib/planIntake';

const stepQuestion: Record<Exclude<ChatStep, 'complete'>, string> = {
  goal: '你想达成什么学习目标？',
  dailyTime: '每天大概能投入多少时间？',
  startDate: '计划从哪天开始？',
  level: '你现在的基础大概怎样？',
  supplement: '还有什么要提醒我的？比如薄弱项、可学习时段、考试日期。',
};

export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [state, setState] = useState<ChatState | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatState().then((loaded) => {
      const next = loaded.goal ? loaded : createInitialChatState();
      setState(next);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [state?.messages.length]);

  async function commitState(next: ChatState) {
    setState(next);
    await saveChatState(next);
  }

  function nextStep(step: ChatStep): ChatStep {
    switch (step) {
      case 'goal':
        return 'dailyTime';
      case 'dailyTime':
        return 'startDate';
      case 'startDate':
        return 'level';
      case 'level':
        return 'supplement';
      case 'supplement':
      case 'complete':
        return 'complete';
    }
  }

  async function answer(text: string, patch: Partial<ChatState>) {
    if (!state) return;

    const currentStep = state.currentStep;
    const upcomingStep = nextStep(currentStep);
    const messages = [...state.messages, createMessage(text, false)];

    if (upcomingStep === 'complete') {
      messages.push(createMessage('信息够了。我现在把路线图和每日任务排出来。', true));
    } else {
      messages.push(createMessage(stepQuestion[upcomingStep], true));
    }

    const next = {
      ...state,
      ...patch,
      currentStep: upcomingStep,
      messages,
    };

    await commitState(next);

    if (upcomingStep === 'complete') {
      router.push('/generating');
    }
  }

  async function sendText() {
    if (!state || !input.trim()) return;
    const text = input.trim();
    setInput('');

    if (state.currentStep === 'goal') {
      await answer(text, { goal: text });
      return;
    }

    if (state.currentStep === 'level') {
      await answer(text, { level: text });
      return;
    }

    if (state.currentStep === 'supplement') {
      await answer(text, { supplement: text });
    }
  }

  if (loading || !state) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2F8F7B" />
        <Text style={styles.centerText}>整理对话中...</Text>
      </View>
    );
  }

  const style = advisorStyles[state.advisorStyle];
  const pet = pets[state.petId];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{pet.emoji} {pet.name}</Text>
          <Text style={styles.subtitle}>{advisorStyles[state.advisorStyle].name} · {state.goal}</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {state.messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isAI={message.isAI}
            advisorStyle={state.advisorStyle}
            petId={state.petId}
          />
        ))}
      </ScrollView>

      <View style={styles.inputPanel}>
        {state.currentStep === 'dailyTime' && (
          <View style={styles.quickGrid}>
            {[1, 1.5, 2, 3].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[styles.quickButton, { borderColor: style.border }]}
                onPress={() => answer(`${hours} 小时`, { dailyTime: hours })}
              >
                <Text style={styles.quickText}>{hours} 小时</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {state.currentStep === 'startDate' && (
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickButton, { borderColor: style.border }]}
              onPress={() => answer('今天开始', { startDate: new Date().toISOString().split('T')[0] })}
            >
              <Text style={styles.quickText}>今天开始</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { borderColor: style.border }]}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                answer('明天开始', { startDate: tomorrow.toISOString().split('T')[0] });
              }}
            >
              <Text style={styles.quickText}>明天开始</Text>
            </TouchableOpacity>
          </View>
        )}

        {state.currentStep === 'level' && (
          <View style={styles.quickGrid}>
            {['零基础', '有基础', '冲刺提分'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.quickButton, { borderColor: style.border }]}
                onPress={() => answer(level, { level })}
              >
                <Text style={styles.quickText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {(state.currentStep === 'goal' || state.currentStep === 'level' || state.currentStep === 'supplement') && (
          <View style={styles.textRow}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={state.currentStep === 'supplement' ? '可不填，直接发送“无”' : stepQuestion[state.currentStep]}
              placeholderTextColor="#9A907F"
              returnKeyType="send"
              onSubmitEditing={sendText}
            />
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: style.color }]} onPress={sendText}>
              <Text style={styles.sendText}>发送</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F1E8',
  },
  centerText: {
    color: '#625B4D',
    marginTop: 10,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#FFFCF4',
    borderBottomWidth: 1,
    borderBottomColor: '#D8CEBC',
    gap: 10,
  },
  backText: {
    color: '#2F8F7B',
    fontSize: 15,
    fontWeight: '800',
  },
  title: {
    color: '#1E2A24',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#625B4D',
    fontSize: 13,
    marginTop: 4,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 18,
  },
  inputPanel: {
    backgroundColor: '#FFFCF4',
    borderTopWidth: 1,
    borderTopColor: '#D8CEBC',
    padding: 14,
    paddingBottom: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickButton: {
    minWidth: '47%',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F1E8',
  },
  quickText: {
    color: '#1E2A24',
    fontSize: 15,
    fontWeight: '800',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderRadius: 8,
    backgroundColor: '#F5F1E8',
    color: '#1E2A24',
    paddingHorizontal: 12,
    fontSize: 15,
  },
  sendButton: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#FFF8EA',
    fontWeight: '900',
  },
});
