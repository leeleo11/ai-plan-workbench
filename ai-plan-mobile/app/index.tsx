import React, { useEffect, useState } from 'react';
import {
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
import {
  advisorStyles,
  createDefaultAdvisorProfile,
  granularityLabel,
  pets,
  reminderLabel,
  strictnessLabel,
  type AdvisorGranularity,
  type AdvisorProfile,
  type AdvisorStrictness,
  type PetId,
  type ReminderStyle,
} from '../lib/planIntake';
import { createInitialChatState, createMessage, saveChatState } from '../lib/chatState';
import { mobilePlanStore } from '../lib/store';

export default function HomeScreen() {
  const router = useRouter();
  const [goal, setGoal] = useState('30天考研英语阅读冲刺');
  const [petId, setPetId] = useState<PetId>('owl');
  const [advisorProfile, setAdvisorProfile] = useState<AdvisorProfile>(createDefaultAdvisorProfile('coach'));
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    async function checkPlan() {
      const plan = await mobilePlanStore.getLatestPlan();
      setHasPlan(Boolean(plan));
    }

    checkPlan();
  }, []);

  function updateProfile<K extends keyof AdvisorProfile>(key: K, value: AdvisorProfile[K]) {
    setAdvisorProfile((current) => ({ ...current, [key]: value }));
  }

  function selectPet(nextPetId: PetId) {
    setPetId(nextPetId);
    const defaultStyle = pets[nextPetId].defaultStyle;
    setAdvisorProfile(createDefaultAdvisorProfile(defaultStyle));
  }

  async function start() {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal) return;

    const pet = pets[petId];
    const advisorStyle = pet.defaultStyle;
    const state = createInitialChatState({
      goal: trimmedGoal,
      petId,
      advisorStyle,
      advisorProfile,
      currentStep: 'dailyTime',
      messages: [
        createMessage(`${pet.emoji} ${pet.name}会陪你完成这次计划。`, true),
        createMessage(`我会默认用「${advisorStyles[advisorStyle].name}」方式带你推进。`, true),
        createMessage(`目标先记下：${trimmedGoal}`, true),
        createMessage('接下来只补三件事：每天多久、哪天开始、当前基础。', true),
        createMessage('每天大概能投入多少时间？', true),
      ],
    });

    await saveChatState(state);
    router.push('/chat');
  }

  const activePet = pets[petId];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.kicker}>PlanPal</Text>
          <Text style={styles.title}>创建你的学习伙伴</Text>
          <Text style={styles.subtitle}>
            先选宠物伙伴，再把顾问细节调成你舒服的样子。计划不是一次性领走，而是可以一起协商。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>学习目标</Text>
          <TextInput
            style={styles.goalInput}
            value={goal}
            onChangeText={setGoal}
            multiline
            placeholder="例如：90天雅思从5.5到6.5；30天考研英语阅读冲刺"
            placeholderTextColor="#9A907F"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>选择伙伴</Text>
          <View style={styles.petGrid}>
            {(Object.keys(pets) as PetId[]).map((id) => {
              const pet = pets[id];
              const selected = petId === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.petCard,
                    { borderColor: pet.border, backgroundColor: pet.light },
                    selected && { borderColor: pet.color, borderWidth: 2 },
                  ]}
                  onPress={() => selectPet(id)}
                >
                  <Text style={styles.petEmoji}>{pet.emoji}</Text>
                  <Text style={[styles.petName, { color: pet.color }]}>{pet.name}</Text>
                  <Text style={styles.petSummary}>{pet.summary}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>顾问档案</Text>
            <TouchableOpacity onPress={() => router.push('/personality')}>
              <Text style={styles.inlineLink}>详细设置</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profilePanel}>
            <Text style={styles.profileSummary}>
              {activePet.name}当前会用{advisorStyles[activePet.defaultStyle].name}的底色陪你，
              你可以继续把它调成更松、更细或更会催。
            </Text>

            <Text style={styles.profileLabel}>严格程度</Text>
            <View style={styles.segmentRow}>
              {(['soft', 'balanced', 'strict'] as AdvisorStrictness[]).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.segment,
                    advisorProfile.strictness === value && styles.segmentSelected,
                  ]}
                  onPress={() => updateProfile('strictness', value)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      advisorProfile.strictness === value && styles.segmentTextSelected,
                    ]}
                  >
                    {strictnessLabel(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.profileLabel}>任务颗粒度</Text>
            <View style={styles.segmentRow}>
              {(['light', 'balanced', 'detailed'] as AdvisorGranularity[]).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.segment,
                    advisorProfile.granularity === value && styles.segmentSelected,
                  ]}
                  onPress={() => updateProfile('granularity', value)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      advisorProfile.granularity === value && styles.segmentTextSelected,
                    ]}
                  >
                    {granularityLabel(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.profileLabel}>提醒方式</Text>
            <View style={styles.segmentRow}>
              {(['quiet', 'checkin', 'push'] as ReminderStyle[]).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.segment,
                    advisorProfile.reminderStyle === value && styles.segmentSelected,
                  ]}
                  onPress={() => updateProfile('reminderStyle', value)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      advisorProfile.reminderStyle === value && styles.segmentTextSelected,
                    ]}
                  >
                    {reminderLabel(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !goal.trim() && styles.primaryButtonDisabled]}
          onPress={start}
          disabled={!goal.trim()}
        >
          <Text style={styles.primaryButtonText}>继续制定计划</Text>
        </TouchableOpacity>

        {hasPlan && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/plan')}>
            <Text style={styles.secondaryButtonText}>查看当前计划</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  content: {
    padding: 22,
    paddingTop: 64,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 28,
  },
  kicker: {
    color: '#2F8F7B',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 10,
  },
  title: {
    color: '#1E2A24',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    color: '#625B4D',
    fontSize: 15,
    lineHeight: 23,
  },
  section: {
    marginBottom: 22,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: '#2D332F',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  inlineLink: {
    color: '#2F8F7B',
    fontSize: 13,
    fontWeight: '800',
  },
  goalInput: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderRadius: 8,
    backgroundColor: '#FFFCF4',
    color: '#1E2A24',
    fontSize: 17,
    lineHeight: 24,
    padding: 16,
    textAlignVertical: 'top',
  },
  petGrid: {
    gap: 10,
  },
  petCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  petEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  petSummary: {
    color: '#625B4D',
    fontSize: 13,
    lineHeight: 19,
  },
  profilePanel: {
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderRadius: 8,
    backgroundColor: '#FFFCF4',
    padding: 14,
  },
  profileSummary: {
    color: '#625B4D',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  profileLabel: {
    color: '#1E2A24',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 4,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  segment: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderRadius: 8,
    backgroundColor: '#F5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentSelected: {
    backgroundColor: '#24352F',
    borderColor: '#24352F',
  },
  segmentText: {
    color: '#625B4D',
    fontSize: 13,
    fontWeight: '800',
  },
  segmentTextSelected: {
    color: '#FFF8EA',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderRadius: 8,
    backgroundColor: '#FFFCF4',
    paddingVertical: 14,
    alignItems: 'center',
  },
  modeButtonSelected: {
    backgroundColor: '#24352F',
    borderColor: '#24352F',
  },
  modeText: {
    color: '#625B4D',
    fontSize: 15,
    fontWeight: '800',
  },
  modeTextSelected: {
    color: '#FFF8EA',
  },
  primaryButton: {
    backgroundColor: '#1E2A24',
    borderRadius: 8,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFF8EA',
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#2F8F7B',
    fontSize: 15,
    fontWeight: '800',
  },
});
