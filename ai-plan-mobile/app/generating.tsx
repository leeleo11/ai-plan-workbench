import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { generatePlan } from '../lib/api';
import { loadChatState } from '../lib/chatState';
import { createLocalStudyPlan } from '../lib/localPlan';
import { buildStructuredParams, type PlanIntake } from '../lib/planIntake';
import { mobilePlanStore } from '../lib/store';

export default function GeneratingScreen() {
  const router = useRouter();
  const [status, setStatus] = useState('正在整理你的目标和学习节奏...');
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    try {
      const state = await loadChatState();
      if (!state.goal) {
        router.replace('/');
        return;
      }

      const intake: PlanIntake = {
        goal: state.goal,
        petId: state.petId,
        advisorStyle: state.advisorStyle,
        advisorProfile: state.advisorProfile,
        dailyTime: state.dailyTime,
        startDate: state.startDate,
        level: state.level,
        supplement: state.supplement,
      };

      setStatus('正在请求 AI 生成个性化计划...');
      const params = buildStructuredParams(intake);

      try {
        const plan = await generatePlan(params);
        await mobilePlanStore.savePlan(plan);
        router.replace('/plan');
      } catch (apiError) {
        setStatus('后端暂时不可达，先在手机本地生成一版可执行计划...');
        const fallback = createLocalStudyPlan(intake);
        await mobilePlanStore.savePlan(fallback);
        router.replace('/plan');
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '生成计划失败';
      setError(message);
    }
  }

  useEffect(() => {
    run();
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <ActivityIndicator color="#2F8F7B" size="large" />
        <Text style={styles.title}>正在生成学习路线</Text>
        <Text style={styles.status}>{status}</Text>

        {error && (
          <>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity style={styles.button} onPress={run}>
              <Text style={styles.buttonText}>重试</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  panel: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: '#FFFCF4',
    padding: 22,
    alignItems: 'center',
  },
  title: {
    color: '#1E2A24',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 18,
    marginBottom: 10,
  },
  status: {
    color: '#625B4D',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  error: {
    color: '#B9472F',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 22,
    backgroundColor: '#1E2A24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF8EA',
    fontSize: 15,
    fontWeight: '900',
  },
});
