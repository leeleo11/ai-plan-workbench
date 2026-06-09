import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { mobilePlanStore } from '../lib/store';
import { assessPlanQuality } from '../lib/shared/quality';
import { getExecutionStats } from '../lib/shared/executionStats';
import { theme } from '../lib/theme';
import type { Plan } from '../lib/shared/schema';

export default function ReviewScreen() {
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

  const quality = assessPlanQuality(plan);
  const stats = getExecutionStats(plan);
  const completionRate = stats.progress;

  return (
    <ScrollView style={styles.container}>
      {/* Quality Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreNumber}>{quality.score}</Text>
        <Text style={styles.scoreLabel}>{quality.label}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: theme.sun }]}>
          <Text style={styles.statNumber}>{plan.tasks.length}</Text>
          <Text style={styles.statLabel}>任务卡</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.sky }]}>
          <Text style={styles.statNumber}>{quality.averageDailyMinutes}</Text>
          <Text style={styles.statLabel}>日均分钟</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.mint }]}>
          <Text style={styles.statNumber}>{completionRate}%</Text>
          <Text style={styles.statLabel}>通关率</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.peach }]}>
          <Text style={styles.statNumber}>{Math.round(quality.aiTaskRatio * 100)}%</Text>
          <Text style={styles.statLabel}>AI任务</Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>执行建议</Text>
        {quality.recommendations.map((item, index) => (
          <View key={index} style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>下一步动作</Text>
        {quality.actions.map((action, index) => (
          <View key={index} style={styles.actionCard}>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionInstruction}>{action.instruction}</Text>
          </View>
        ))}
      </View>

      {/* Risks */}
      {plan.risks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>风险提示</Text>
          {plan.risks.map((risk, index) => (
            <View key={index} style={styles.riskCard}>
              <Text style={styles.riskType}>{risk.type}</Text>
              <Text style={styles.riskMessage}>{risk.message}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.cream },
  loadingText: { fontSize: 16, color: '#666' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: theme.ink, marginBottom: 12 },
  link: { fontSize: 16, color: theme.berry, fontWeight: 'bold' },
  scoreCard: { backgroundColor: theme.sun, borderRadius: 12, borderWidth: 2, borderColor: theme.line, padding: 24, alignItems: 'center', marginBottom: 16 },
  scoreNumber: { fontSize: 48, fontWeight: 'bold', color: theme.ink },
  scoreLabel: { fontSize: 16, fontWeight: 'bold', color: theme.ink, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statBox: { width: '48%', borderRadius: 12, borderWidth: 2, borderColor: theme.line, padding: 16, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: theme.ink },
  statLabel: { fontSize: 12, fontWeight: 'bold', color: theme.ink, marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.ink, marginBottom: 12 },
  recommendationCard: { backgroundColor: theme.paper, borderRadius: 8, borderWidth: 2, borderColor: theme.line, padding: 12, marginBottom: 8 },
  recommendationText: { fontSize: 14, color: theme.ink, lineHeight: 20 },
  actionCard: { backgroundColor: theme.cream, borderRadius: 8, borderWidth: 2, borderColor: theme.line, padding: 12, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: 'bold', color: theme.berry, marginBottom: 4 },
  actionInstruction: { fontSize: 12, color: '#666', lineHeight: 18 },
  riskCard: { backgroundColor: '#fff3f3', borderRadius: 8, borderWidth: 2, borderColor: '#ffcccc', padding: 12, marginBottom: 8 },
  riskType: { fontSize: 12, fontWeight: 'bold', color: '#cc0000', marginBottom: 4 },
  riskMessage: { fontSize: 14, color: '#cc0000' },
});
