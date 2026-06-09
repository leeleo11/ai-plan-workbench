import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mobilePlanStore } from '../../lib/store';
import { applyPlanUpdate } from '../../lib/shared/versioning';
import { optimizePlan } from '../../lib/api';
import { theme, categoryLabel, statusLabel } from '../../lib/theme';
import type { Plan, PlanTask } from '../../lib/shared/schema';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [task, setTask] = useState<PlanTask | null>(null);
  const [instruction, setInstruction] = useState('把这张任务卡改得更具体一点');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [id]);

  async function loadTask() {
    const latest = await mobilePlanStore.getLatestPlan();
    if (latest) {
      setPlan(latest);
      const found = latest.tasks.find((t) => t.id === id);
      setTask(found ?? null);
    }
    setLoading(false);
  }

  function saveTask(updated: PlanTask) {
    if (!plan) return;
    const nextPlan = {
      ...plan,
      tasks: plan.tasks.map((t) => (t.id === updated.id ? updated : t)),
    };
    const versioned = applyPlanUpdate(plan, '编辑任务卡', nextPlan);
    setPlan(versioned);
    setTask(updated);
    mobilePlanStore.savePlan(versioned);
  }

  async function handleOptimize() {
    if (!plan || !task || !instruction.trim()) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizePlan(plan, [task.id], instruction);
      setPlan(optimized);
      const found = optimized.tasks.find((t) => t.id === id);
      if (found) setTask(found);
      await mobilePlanStore.savePlan(optimized);
    } catch (err) {
      console.error('Optimize failed:', err);
    } finally {
      setIsOptimizing(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>任务不存在</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>关卡名称</Text>
        <TextInput
          style={styles.input}
          value={task.title}
          onChangeText={(text) => saveTask({ ...task, title: text, source: 'user_edited' })}
        />

        <Text style={styles.label}>任务说明</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={task.description ?? ''}
          onChangeText={(text) => saveTask({ ...task, description: text || undefined, source: 'user_edited' })}
          multiline
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>挑战日期</Text>
            <TextInput
              style={styles.input}
              value={task.date}
              onChangeText={(text) => saveTask({ ...task, date: text, source: 'user_edited' })}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>预计用时</Text>
            <TextInput
              style={styles.input}
              value={String(task.durationMinutes)}
              onChangeText={(text) => saveTask({ ...task, durationMinutes: Number(text) || 0, source: 'user_edited' })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>任务类型</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{categoryLabel[task.category] ?? task.category}</Text>
            </View>
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>当前状态</Text>
            <View style={styles.statusRow}>
              {(['todo', 'done', 'skipped', 'delayed'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusTab, task.status === s && styles.statusTabActive]}
                  onPress={() => saveTask({ ...task, status: s, source: 'user_edited' })}
                >
                  <Text style={[styles.statusText, task.status === s && styles.statusTextActive]}>
                    {statusLabel[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* AI Optimization */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>AI 优化</Text>
        <Text style={styles.hint}>告诉 AI 你想怎么改这张任务卡。</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={instruction}
          onChangeText={setInstruction}
          multiline
        />
        <TouchableOpacity
          style={[styles.optimizeButton, isOptimizing && styles.optimizeButtonDisabled]}
          onPress={handleOptimize}
          disabled={isOptimizing || !instruction.trim()}
        >
          <Text style={styles.optimizeButtonText}>
            {isOptimizing ? '正在优化...' : '预览修改'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.cream },
  link: { fontSize: 16, color: theme.berry, fontWeight: 'bold', marginTop: 12 },
  card: { backgroundColor: theme.paper, borderRadius: 12, borderWidth: 2, borderColor: theme.line, padding: 16, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.ink, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.cream, borderRadius: 8, borderWidth: 2, borderColor: theme.line, padding: 12, fontSize: 16, color: theme.ink },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  badge: { backgroundColor: theme.mint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 2, borderColor: theme.line, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: theme.ink },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusTab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.cream, borderWidth: 2, borderColor: theme.line },
  statusTabActive: { backgroundColor: theme.sky },
  statusText: { fontSize: 11, fontWeight: 'bold', color: '#666' },
  statusTextActive: { color: theme.ink },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.ink, marginBottom: 4 },
  hint: { fontSize: 12, color: '#666', marginBottom: 12 },
  optimizeButton: { backgroundColor: theme.peach, borderRadius: 12, borderWidth: 2, borderColor: theme.line, padding: 14, alignItems: 'center', marginTop: 12 },
  optimizeButtonDisabled: { opacity: 0.5 },
  optimizeButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.ink },
});
