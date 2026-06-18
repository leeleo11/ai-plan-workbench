import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { createInitialChatState, loadChatState, saveChatState } from '../lib/chatState';

export default function PartnerProfileScreen() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [goal, setGoal] = useState('');
  const [petId, setPetId] = useState<PetId>('fox');
  const [dailyTime, setDailyTime] = useState(2);
  const [advisorProfile, setAdvisorProfile] = useState<AdvisorProfile>(createDefaultAdvisorProfile('hybrid'));

  useEffect(() => {
    loadChatState().then((state) => {
      setGoal(state.goal);
      setPetId(state.petId);
      setDailyTime(state.dailyTime);
      setAdvisorProfile(state.advisorProfile);
      setLoaded(true);
    });
  }, []);

  function updateProfile<K extends keyof AdvisorProfile>(key: K, value: AdvisorProfile[K]) {
    setAdvisorProfile((current) => ({ ...current, [key]: value }));
  }

  async function saveOnly() {
    const current = await loadChatState();
    await saveChatState({
      ...current,
      petId,
      advisorStyle: pets[petId].defaultStyle,
      advisorProfile,
      dailyTime,
    });
    router.back();
  }

  async function regenerate() {
    const current = await loadChatState();
    const next = createInitialChatState({
      ...current,
      goal,
      petId,
      advisorStyle: pets[petId].defaultStyle,
      advisorProfile,
      dailyTime,
      currentStep: 'complete',
    });
    await saveChatState(next);
    router.replace('/generating');
  }

  if (!loaded) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>伙伴档案</Text>
        <Text style={styles.subtitle}>在这里调宠物、顾问方式和计划强度，然后重新生成一版更贴合你的计划。</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>当前目标</Text>
        <Text style={styles.goalText}>{goal || '还没有填写目标'}</Text>

        <Text style={styles.label}>宠物伙伴</Text>
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
                onPress={() => setPetId(id)}
              >
                <Text style={styles.petEmoji}>{pet.emoji}</Text>
                <Text style={[styles.petName, { color: pet.color }]}>{pet.name}</Text>
                <Text style={styles.petSummary}>{pet.summary}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>每天学习时间</Text>
        <View style={styles.segmentRow}>
          {[1, 1.5, 2, 3].map((hours) => (
            <TouchableOpacity
              key={hours}
              style={[styles.segment, dailyTime === hours && styles.segmentSelected]}
              onPress={() => setDailyTime(hours)}
            >
              <Text style={[styles.segmentText, dailyTime === hours && styles.segmentTextSelected]}>
                {hours} 小时
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>严格程度</Text>
        <View style={styles.segmentRow}>
          {(['soft', 'balanced', 'strict'] as AdvisorStrictness[]).map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.segment, advisorProfile.strictness === value && styles.segmentSelected]}
              onPress={() => updateProfile('strictness', value)}
            >
              <Text style={[styles.segmentText, advisorProfile.strictness === value && styles.segmentTextSelected]}>
                {strictnessLabel(value)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>任务颗粒度</Text>
        <View style={styles.segmentRow}>
          {(['light', 'balanced', 'detailed'] as AdvisorGranularity[]).map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.segment, advisorProfile.granularity === value && styles.segmentSelected]}
              onPress={() => updateProfile('granularity', value)}
            >
              <Text style={[styles.segmentText, advisorProfile.granularity === value && styles.segmentTextSelected]}>
                {granularityLabel(value)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>提醒方式</Text>
        <View style={styles.segmentRow}>
          {(['quiet', 'checkin', 'push'] as ReminderStyle[]).map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.segment, advisorProfile.reminderStyle === value && styles.segmentSelected]}
              onPress={() => updateProfile('reminderStyle', value)}
            >
              <Text style={[styles.segmentText, advisorProfile.reminderStyle === value && styles.segmentTextSelected]}>
                {reminderLabel(value)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={regenerate}>
          <Text style={styles.primaryButtonText}>应用并重新生成计划</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={saveOnly}>
          <Text style={styles.secondaryButtonText}>只保存档案</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: '#FFFCF4',
    borderBottomWidth: 1,
    borderBottomColor: '#D8CEBC',
  },
  backText: {
    color: '#2F8F7B',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  title: {
    color: '#1E2A24',
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: '#625B4D',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  label: {
    color: '#1E2A24',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 14,
  },
  goalText: {
    color: '#625B4D',
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 24,
    marginBottom: 6,
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
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFCF4',
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
  primaryButton: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: '#1E2A24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF8EA',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFCF4',
  },
  secondaryButtonText: {
    color: '#1E2A24',
    fontSize: 15,
    fontWeight: '800',
  },
});
