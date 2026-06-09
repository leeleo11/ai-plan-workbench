import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { mobilePlanStore } from '../lib/store';
import { getExecutionStats } from '../lib/shared/executionStats';
import { TaskCard } from '../components/TaskCard';
import { theme, statusLabel } from '../lib/theme';
import type { Plan, PlanTask } from '../lib/shared/schema';
import { applyPlanUpdate } from '../lib/shared/versioning';

export default function TodayScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    const latest = await mobilePlanStore.getLatestPlan();
    setPlan(latest);
    setLoading(false);
  }

  function toggleTaskStatus(task: PlanTask) {
    if (!plan) return;
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    const updated: PlanTask = { ...task, status: nextStatus, source: 'user_edited' };
    const nextPlan = {
      ...plan,
      tasks: plan.tasks.map((t) => (t.id === task.id ? updated : t)),
    };
    const versioned = applyPlanUpdate(plan, nextStatus === 'done' ? '打卡通关' : '撤销打卡', nextPlan);
    setPlan(versioned);
    mobilePlanStore.savePlan(versioned);
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
        <Text style={styles.emptySubtitle}>点击下方"生成"创建你的第一个计划</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => router.push('/generate')}
        >
          <Text style={styles.generateButtonText}>去生成计划</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = plan.tasks.filter((t) => t.date === today);
  const stats = getExecutionStats(plan);
  const nextTask = plan.tasks.find((t) => t.status !== 'done');

  return (
    <ScrollView style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.doneCount}</Text>
            <Text style={styles.statLabel}>已完成</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.todoCount}</Text>
            <Text style={styles.statLabel}>待挑战</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>连续天数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.progress}%</Text>
            <Text style={styles.statLabel}>进度</Text>
          </View>
        </View>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${stats.progress}%` }]} />
        </View>
      </View>

      {/* Next Task */}
      {nextTask ? (
        <View style={styles.nextTaskCard}>
          <Text style={styles.nextTaskLabel}>下一张任务卡</Text>
          <Text style={styles.nextTaskTitle}>{nextTask.title}</Text>
        </View>
      ) : null}

      {/* Today's Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          今日任务 ({todayTasks.length})
        </Text>
        {todayTasks.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>今天没有任务，可以休息或查看计划总览。</Text>
          </View>
        ) : (
          todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={(t) => router.push(`/task/${t.id}`)}
              onToggleStatus={toggleTaskStatus}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.cream,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.cream,
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.ink,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: theme.sun,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.line,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.ink,
  },
  statsCard: {
    backgroundColor: theme.paper,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.line,
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.ink,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.cream,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.berry,
    borderRadius: 4,
  },
  nextTaskCard: {
    backgroundColor: theme.sky,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.line,
    padding: 16,
    marginBottom: 16,
  },
  nextTaskLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.ink,
    marginBottom: 4,
  },
  nextTaskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.ink,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.ink,
    marginBottom: 12,
  },
  emptySection: {
    backgroundColor: theme.paper,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.line,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
