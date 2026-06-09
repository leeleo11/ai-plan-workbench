import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { mobilePlanStore } from '../lib/store';
import { getExecutionStats } from '../lib/shared/executionStats';
import { theme, categoryLabel, statusLabel } from '../lib/theme';
import type { Plan, PlanTask } from '../lib/shared/schema';

type TaskFilter = 'all' | 'todo' | 'done' | 'delayed';

export default function PlanScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    const latest = await mobilePlanStore.getLatestPlan();
    setPlan(latest);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>还没有计划</Text>
        <TouchableOpacity onPress={() => router.push('/generate')}>
          <Text style={styles.link}>去生成</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredTasks = plan.tasks.filter((t) => filter === 'all' || t.status === filter);
  const tasksByDate = filteredTasks.reduce<Record<string, PlanTask[]>>((acc, task) => {
    acc[task.date] = [...(acc[task.date] ?? []), task];
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'todo', 'done', 'delayed'] as TaskFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? '全部' : statusLabel[f] ?? f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Phases */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>路线关卡</Text>
        {plan.phases.map((phase, index) => (
          <View key={phase.id} style={styles.phaseCard}>
            <View style={styles.phaseNumber}>
              <Text style={styles.phaseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.phaseContent}>
              <Text style={styles.phaseTitle}>{phase.title}</Text>
              <Text style={styles.phaseDate}>{phase.startDate} 到 {phase.endDate}</Text>
              <Text style={styles.phaseObjective}>{phase.objective}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Tasks by Date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          任务时间线 ({filteredTasks.length})
        </Text>
        {Object.entries(tasksByDate).map(([date, tasks]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateLabel}>{date}</Text>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, task.status === 'done' && styles.taskItemDone]}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.durationMinutes} 分钟 · {categoryLabel[task.category] ?? task.category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.cream },
  loadingText: { fontSize: 16, color: '#666' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: theme.ink, marginBottom: 12 },
  link: { fontSize: 16, color: theme.berry, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: theme.paper, borderWidth: 2, borderColor: theme.line },
  filterTabActive: { backgroundColor: theme.sky },
  filterText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  filterTextActive: { color: theme.ink },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.ink, marginBottom: 12 },
  phaseCard: { flexDirection: 'row', backgroundColor: theme.paper, borderRadius: 12, borderWidth: 2, borderColor: theme.line, padding: 12, marginBottom: 8 },
  phaseNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.sun, borderWidth: 2, borderColor: theme.line, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  phaseNumberText: { fontSize: 14, fontWeight: 'bold', color: theme.ink },
  phaseContent: { flex: 1 },
  phaseTitle: { fontSize: 14, fontWeight: 'bold', color: theme.ink },
  phaseDate: { fontSize: 11, color: '#666', marginTop: 2 },
  phaseObjective: { fontSize: 12, color: '#666', marginTop: 4 },
  dateGroup: { marginBottom: 16 },
  dateLabel: { fontSize: 12, fontWeight: 'bold', color: theme.ink, backgroundColor: theme.sky, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  taskItem: { backgroundColor: theme.paper, borderRadius: 8, borderWidth: 1, borderColor: theme.line, padding: 12, marginBottom: 6 },
  taskItemDone: { backgroundColor: theme.mint },
  taskTitle: { fontSize: 14, fontWeight: 'bold', color: theme.ink },
  taskMeta: { fontSize: 11, color: '#666', marginTop: 4 },
});
