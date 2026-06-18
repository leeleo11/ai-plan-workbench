import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { mobilePlanStore } from '../lib/store';
import type { Plan, PlanTask } from '../lib/shared/schema';

interface Stats {
  totalTasks: number;
  doneTasks: number;
  completionRate: number;
  totalMinutes: number;
  doneMinutes: number;
  currentStreak: number;
  longestStreak: number;
  weeklyData: { label: string; total: number; done: number }[];
  categoryData: { category: string; count: number; total: number }[];
}

function calculateStats(plan: Plan): Stats {
  const { tasks } = plan;
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const totalMinutes = tasks.reduce((s, t) => s + t.durationMinutes, 0);
  const doneMinutes = doneTasks.reduce((s, t) => s + t.durationMinutes, 0);

  // Build date -> tasks map
  const dateMap: Record<string, PlanTask[]> = {};
  for (const task of tasks) {
    if (!dateMap[task.date]) dateMap[task.date] = [];
    dateMap[task.date].push(task);
  }

  // Calculate streaks
  const sortedDates = Object.keys(dateMap).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (const date of sortedDates) {
    const dayTasks = dateMap[date];
    const anyDone = dayTasks.some((t) => t.status === 'done');
    if (anyDone) {
      tempStreak += 1;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak = count from the last date backward
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const date = sortedDates[i];
    const dayTasks = dateMap[date];
    const anyDone = dayTasks.some((t) => t.status === 'done');
    if (anyDone) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  // Weekly data: group tasks by week (last 4 weeks or all weeks)
  const weekMap: Record<string, { total: number; done: number }> = {};
  for (const task of tasks) {
    const d = new Date(`${task.date}T00:00:00`);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    const key = weekStart.toISOString().split('T')[0];
    if (!weekMap[key]) weekMap[key] = { total: 0, done: 0 };
    weekMap[key].total += 1;
    if (task.status === 'done') weekMap[key].done += 1;
  }

  const weeklyData = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([date, data], index) => ({
      label: `W${index + 1}`,
      total: data.total,
      done: data.done,
    }));

  // Category distribution
  const catMap: Record<string, { count: number; total: number }> = {};
  for (const task of tasks) {
    const cat = task.category || '其他';
    if (!catMap[cat]) catMap[cat] = { count: 0, total: 0 };
    catMap[cat].total += 1;
    if (task.status === 'done') catMap[cat].count += 1;
  }

  const categoryLabels: Record<string, string> = {
    practice: '练习',
    review: '复盘',
    study: '学习',
    test: '测试',
    other: '其他',
  };

  const categoryData = Object.entries(catMap)
    .map(([cat, data]) => ({
      category: categoryLabels[cat] || cat,
      ...data,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalTasks: tasks.length,
    doneTasks: doneTasks.length,
    completionRate: tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0,
    totalMinutes,
    doneMinutes,
    currentStreak,
    longestStreak,
    weeklyData,
    categoryData,
  };
}

const categoryColorMap: Record<string, string> = {
  '练习': '#2F8F7B',
  '复盘': '#C86E24',
  '学习': '#315B9A',
  '测试': '#8A5A28',
  '其他': '#817767',
};

export default function StatsScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        const p = await mobilePlanStore.getLatestPlan();
        if (!active) return;
        setPlan(p);
        if (p) setStats(calculateStats(p));
        setLoading(false);
      }
      load();
      return () => { active = false; };
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2F8F7B" />
        <Text style={styles.centerText}>正在分析数据...</Text>
      </View>
    );
  }

  if (!plan || !stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>还没有计划数据</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.primaryButtonText}>去制定计划</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const maxWeekly = Math.max(...stats.weeklyData.map((w) => w.total), 1);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>数据统计</Text>
        <Text style={styles.subtitle}>{plan.goal.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Completion Ring */}
        <View style={styles.heroCard}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.ringPercent}>{stats.completionRate}%</Text>
              <Text style={styles.ringLabel}>完成率</Text>
            </View>
          </View>
          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>{stats.doneTasks} / {stats.totalTasks} 任务</Text>
            <Text style={styles.heroMetaSub}>{Math.round(stats.doneMinutes / 60)}h / {Math.round(stats.totalMinutes / 60)}h 训练量</Text>
          </View>
        </View>

        {/* Streaks */}
        <View style={styles.streakRow}>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakValue}>{stats.currentStreak}</Text>
            <Text style={styles.streakLabel}>当前连续打卡</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🏆</Text>
            <Text style={styles.streakValue}>{stats.longestStreak}</Text>
            <Text style={styles.streakLabel}>最佳记录</Text>
          </View>
        </View>

        {/* Weekly Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>每周完成趋势</Text>
          <View style={styles.chartArea}>
            {stats.weeklyData.length === 0 ? (
              <Text style={styles.noData}>暂无数据</Text>
            ) : (
              <View style={styles.barChart}>
                {stats.weeklyData.map((week) => {
                  const totalHeight = maxWeekly > 0 ? Math.round((week.total / maxWeekly) * 100) : 0;
                  const doneHeight = maxWeekly > 0 ? Math.round((week.done / maxWeekly) * 100) : 0;
                  return (
                    <View key={week.label} style={styles.barGroup}>
                      <View style={styles.barTrack}>
                        <View style={[styles.barBg, { height: `${totalHeight}%` }]} />
                        <View style={[styles.barFill, { height: `${doneHeight}%` }]} />
                      </View>
                      <Text style={styles.barLabel}>{week.label}</Text>
                      <Text style={styles.barValue}>{week.done}/{week.total}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Category Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>任务类别分布</Text>
          {stats.categoryData.length === 0 ? (
            <Text style={styles.noData}>暂无数据</Text>
          ) : (
            <View style={styles.catList}>
              {stats.categoryData.map((cat) => {
                const pct = stats.totalTasks > 0 ? Math.round((cat.total / stats.totalTasks) * 100) : 0;
                const donePct = cat.total > 0 ? Math.round((cat.count / cat.total) * 100) : 0;
                const color = categoryColorMap[cat.category] || '#817767';
                return (
                  <View key={cat.category} style={styles.catRow}>
                    <View style={styles.catHeader}>
                      <View style={[styles.catDot, { backgroundColor: color }]} />
                      <Text style={styles.catName}>{cat.category}</Text>
                      <Text style={styles.catPct}>{pct}%</Text>
                    </View>
                    <View style={styles.catBar}>
                      <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.catMeta}>{cat.count}/{cat.total} 完成 · 完成率 {donePct}%</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Time Investment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>时间投入</Text>
          <View style={styles.timeCard}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>总计划时长</Text>
              <Text style={styles.timeValue}>{Math.round(stats.totalMinutes / 60)} 小时</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>已完成时长</Text>
              <Text style={styles.timeValue}>{Math.round(stats.doneMinutes / 60)} 小时</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>剩余时长</Text>
              <Text style={styles.timeValue}>{Math.round((stats.totalMinutes - stats.doneMinutes) / 60)} 小时</Text>
            </View>
          </View>
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
    fontSize: 26,
    fontWeight: '900',
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
  // Hero completion
  heroCard: {
    backgroundColor: '#24352F',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  ringOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'rgba(255,248,234,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ringInner: {
    alignItems: 'center',
  },
  ringPercent: {
    color: '#FFF8EA',
    fontSize: 32,
    fontWeight: '900',
  },
  ringLabel: {
    color: '#D8E7D8',
    fontSize: 13,
    marginTop: 2,
  },
  heroMeta: {
    alignItems: 'center',
  },
  heroMetaText: {
    color: '#FFF8EA',
    fontSize: 16,
    fontWeight: '800',
  },
  heroMetaSub: {
    color: '#D8E7D8',
    fontSize: 13,
    marginTop: 4,
  },
  // Streaks
  streakRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  streakCard: {
    flex: 1,
    backgroundColor: '#FFFCF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    padding: 16,
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  streakValue: {
    color: '#1E2A24',
    fontSize: 28,
    fontWeight: '900',
  },
  streakLabel: {
    color: '#817767',
    fontSize: 12,
    marginTop: 4,
  },
  // Sections
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#1E2A24',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  noData: {
    color: '#817767',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Bar chart
  chartArea: {
    backgroundColor: '#FFFCF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    padding: 16,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 24,
    height: 100,
    borderRadius: 4,
    backgroundColor: '#F2E7D4',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barBg: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 4,
    backgroundColor: '#E8D5B8',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: '#2F8F7B',
  },
  barLabel: {
    color: '#817767',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '800',
  },
  barValue: {
    color: '#625B4D',
    fontSize: 10,
    marginTop: 2,
  },
  // Category
  catList: {
    backgroundColor: '#FFFCF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    padding: 14,
    gap: 14,
  },
  catRow: {},
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    color: '#1E2A24',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  catPct: {
    color: '#817767',
    fontSize: 13,
    fontWeight: '800',
  },
  catBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F2E7D4',
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  catMeta: {
    color: '#817767',
    fontSize: 12,
    marginTop: 4,
  },
  // Time
  timeCard: {
    backgroundColor: '#FFFCF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    padding: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timeLabel: {
    color: '#625B4D',
    fontSize: 14,
  },
  timeValue: {
    color: '#1E2A24',
    fontSize: 14,
    fontWeight: '900',
  },
  timeDivider: {
    height: 1,
    backgroundColor: '#EFE5D2',
  },
  // Button
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
