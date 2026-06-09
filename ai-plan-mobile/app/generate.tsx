import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { generatePlan } from '../lib/api';
import { mobilePlanStore } from '../lib/store';
import { theme } from '../lib/theme';

export default function GenerateScreen() {
  const router = useRouter();
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationDays, setDurationDays] = useState('30');
  const [dailyHours, setDailyHours] = useState('1');
  const [currentLevel, setCurrentLevel] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [isDurationUncertain, setIsDurationUncertain] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (goal.trim().length < 2) return;

    setIsGenerating(true);
    setError(null);

    try {
      const parts = [
        startDate.trim() ? `${startDate.trim()}开始` : '',
        isDurationUncertain
          ? `${goal.trim()}，计划时长暂不确定，先生成30天滚动计划`
          : `${durationDays.trim()}天${goal.trim()}`,
        currentLevel.trim() || targetLevel.trim()
          ? `从${currentLevel.trim() || '未说明'}到${targetLevel.trim() || '未说明'}`
          : '',
        dailyHours.trim() ? `每天投入${dailyHours.trim()}小时` : '',
      ].filter(Boolean);
      const input = parts.join('，');

      const plan = await generatePlan(input);
      await mobilePlanStore.savePlan(plan);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后再试');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>创建新计划</Text>
        <Text style={styles.subtitle}>告诉 AI 你的目标，它会帮你拆解成每日任务。</Text>

        <Text style={styles.label}>大目标</Text>
        <TextInput
          style={styles.input}
          value={goal}
          onChangeText={setGoal}
          placeholder="例如：30天养成晨跑习惯"
          multiline
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>开始日期</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2026-06-02"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>计划天数</Text>
            <TextInput
              style={styles.input}
              value={isDurationUncertain ? '' : durationDays}
              onChangeText={setDurationDays}
              placeholder="30"
              keyboardType="numeric"
              editable={!isDurationUncertain}
            />
          </View>
        </View>

        <Text style={styles.label}>每天投入（小时）</Text>
        <TextInput
          style={styles.input}
          value={dailyHours}
          onChangeText={setDailyHours}
          placeholder="1"
          keyboardType="decimal-pad"
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>时间不确定，先做 30 天滚动计划</Text>
          <Switch
            value={isDurationUncertain}
            onValueChange={setIsDurationUncertain}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>当前水平</Text>
            <TextInput
              style={styles.input}
              value={currentLevel}
              onChangeText={setCurrentLevel}
              placeholder="例如：零基础"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>目标水平</Text>
            <TextInput
              style={styles.input}
              value={targetLevel}
              onChangeText={setTargetLevel}
              placeholder="例如：能独立做项目"
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={isGenerating || goal.trim().length < 2}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? '正在生成...' : '生成我的闯关计划'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream, padding: 16 },
  card: { backgroundColor: theme.paper, borderRadius: 12, borderWidth: 2, borderColor: theme.line, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.ink, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.ink, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.cream, borderRadius: 8, borderWidth: 2, borderColor: theme.line, padding: 12, fontSize: 16, color: theme.ink },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  error: { fontSize: 14, color: 'red', marginTop: 12 },
  generateButton: { backgroundColor: theme.sun, borderRadius: 12, borderWidth: 2, borderColor: theme.line, padding: 16, alignItems: 'center', marginTop: 20 },
  generateButtonDisabled: { opacity: 0.5 },
  generateButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.ink },
});
