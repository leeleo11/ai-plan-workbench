import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Calendar } from '../components/Calendar';
import { loadChatState } from '../lib/chatState';
import {
  pets,
} from '../lib/planIntake';
import { mobilePlanStore } from '../lib/store';
import type { Plan, PlanTask } from '../lib/shared/schema';

export default function PlanScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadAll() {
        const [latestPlan, chat] = await Promise.all([mobilePlanStore.getLatestPlan(), loadChatState()]);
        if (!active) return;
        setPlan(latestPlan);
        setSelectedDate((prev) => prev ?? new Date().toISOString().split('T')[0]);
        setPartnerName(`${pets[chat.petId].emoji} ${pets[chat.petId].name}`);
        setLoading(false);
      }

      loadAll();
      return () => { active = false; };
    }, []),
  );

  const selectedTasks = useMemo<PlanTask[]>(() => {
    if (!plan || !selectedDate) return [];
    return plan.tasks.filter((task) => task.date === selectedDate);
  }, [plan, selectedDate]);

  const toggleTask = useCallback(async (taskId: string) => {
    if (!mobilePlanStore.toggleTaskStatus) return;
    const updated = await mobilePlanStore.toggleTaskStatus(taskId);
    if (updated) setPlan(updated);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2F8F7B" />
        <Text style={styles.centerText}>读取计划中...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>还没有计划</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.primaryButtonText}>去制定计划</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const done = plan.tasks.filter((task) => task.status === 'done').length;
  const totalMinutes = plan.tasks.reduce((sum, task) => sum + task.durationMinutes, 0);
  const completionPercent = plan.tasks.length > 0 ? Math.round((done / plan.tasks.length) * 100) : 0;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.backText}>重新制定</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{plan.goal.title}</Text>
        <Text style={styles.subtitle}>{partnerName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryBand}>
          <Text style={styles.summaryTitle}>计划概览</Text>
          <Text style={styles.summaryText}>{plan.brief.summary}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/personality')}>
              <Text style={styles.inlineLink}>调整伙伴与计划</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/stats')}>
              <Text style={styles.inlineLink}>📊 数据统计</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{completionPercent}% 完成</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{plan.phases.length}</Text>
              <Text style={styles.statLabel}>阶段</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{plan.tasks.length}</Text>
              <Text style={styles.statLabel}>任务</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{Math.round(totalMinutes / 60)}h</Text>
              <Text style={styles.statLabel}>训练量</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{done}</Text>
              <Text style={styles.statLabel}>完成</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>阶段路线</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phaseRail}>
          {plan.phases.map((phase, index) => (
            <View key={phase.id} style={styles.phaseCard}>
              <Text style={styles.phaseIndex}>阶段 {index + 1}</Text>
              <Text style={styles.phaseTitle}>{phase.title}</Text>
              <Text style={styles.phaseDate}>{phase.startDate} - {phase.endDate}</Text>
              <Text style={styles.phaseObjective}>{phase.objective}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.calendarHeader}>
          <Text style={styles.sectionTitle}>每日任务</Text>
          <TouchableOpacity onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
            <Text style={styles.todayLink}>📅 今天</Text>
          </TouchableOpacity>
        </View>
        <Calendar plan={plan} selectedDate={selectedDate} onDayPress={setSelectedDate} />

        <View style={styles.taskPanel}>
          <Text style={styles.taskDate}>{selectedDate}</Text>
          {selectedTasks.length === 0 ? (
            <Text style={styles.noTask}>这天没有任务，可以当作缓冲日。</Text>
          ) : (
            selectedTasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <View key={task.id} style={styles.taskItem}>
                  <TouchableOpacity
                    style={[styles.checkbox, isDone && styles.checkboxDone]}
                    onPress={() => toggleTask(task.id)}
                  >
                    {isDone && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.taskCopy}
                    onPress={() => router.push(`/task/${task.id}`)}
                  >
                    <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{task.title}</Text>
                    <Text style={styles.taskMeta}>
                      {task.durationMinutes} 分钟 · {task.priority === 'high' ? '主线' : '支线'}
                      {isDone ? ' · ✅ 已完成' : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  center: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  centerText: {
    color: '#625B4D',
    marginTop: 10,
  },
  emptyTitle: {
    color: '#1E2A24',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 16,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFCF4',
    borderBottomWidth: 1,
    borderBottomColor: '#D8CEBC',
  },
  backText: {
    color: '#2F8F7B',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  title: {
    color: '#1E2A24',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  subtitle: {
    color: '#625B4D',
    fontSize: 13,
    marginTop: 6,
  },
  content: {
    padding: 16,
    paddingBottom: 34,
  },
  summaryBand: {
    borderRadius: 8,
    backgroundColor: '#24352F',
    padding: 16,
    marginBottom: 22,
  },
  summaryTitle: {
    color: '#D8E7D8',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  summaryText: {
    color: '#FFF8EA',
    fontSize: 15,
    lineHeight: 23,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  inlineLink: {
    color: '#D8E7D8',
    fontSize: 14,
    fontWeight: '800',
  },
  progressRow: {
    marginTop: 14,
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 248, 234, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4CAF8B',
  },
  progressLabel: {
    color: '#D8E7D8',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  stat: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 248, 234, 0.12)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF8EA',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: '#D8E7D8',
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#1E2A24',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  todayLink: {
    color: '#2F8F7B',
    fontSize: 14,
    fontWeight: '800',
  },
  phaseRail: {
    gap: 10,
    paddingRight: 16,
    marginBottom: 22,
  },
  phaseCard: {
    width: 250,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: '#FFFCF4',
    padding: 14,
  },
  phaseIndex: {
    color: '#2F8F7B',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  phaseTitle: {
    color: '#1E2A24',
    fontSize: 17,
    fontWeight: '900',
  },
  phaseDate: {
    color: '#817767',
    fontSize: 12,
    marginTop: 6,
  },
  phaseObjective: {
    color: '#625B4D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  taskPanel: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: '#FFFCF4',
    padding: 14,
  },
  taskDate: {
    color: '#1E2A24',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  noTask: {
    color: '#625B4D',
    fontSize: 14,
    lineHeight: 21,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFE5D2',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#B8B0A0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFCF4',
  },
  checkboxDone: {
    backgroundColor: '#2F8F7B',
    borderColor: '#2F8F7B',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  taskCopy: {
    flex: 1,
  },
  taskTitle: {
    color: '#1E2A24',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  taskTitleDone: {
    color: '#817767',
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    color: '#817767',
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#1E2A24',
    borderRadius: 8,
    minHeight: 52,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF8EA',
    fontWeight: '900',
  },
});
