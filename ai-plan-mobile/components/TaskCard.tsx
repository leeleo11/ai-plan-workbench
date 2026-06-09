import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PlanTask } from '../lib/shared/schema';
import { theme, categoryLabel, priorityLabel, statusLabel } from '../lib/theme';

type TaskCardProps = {
  task: PlanTask;
  onPress: (task: PlanTask) => void;
  onToggleStatus: (task: PlanTask) => void;
};

export function TaskCard({ task, onPress, onToggleStatus }: TaskCardProps) {
  const isDone = task.status === 'done';

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      <TouchableOpacity style={styles.content} onPress={() => onPress(task)}>
        <Text style={styles.title}>{task.title}</Text>
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {task.durationMinutes} 分钟 · {categoryLabel[task.category] ?? task.category}
          </Text>
          <View style={[styles.badge, isDone ? styles.badgeDone : styles.badgeTodo]}>
            <Text style={styles.badgeText}>
              {isDone ? '已打卡' : priorityLabel[task.priority] ?? task.priority}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, isDone ? styles.undoButton : styles.checkinButton]}
        onPress={() => onToggleStatus(task)}
      >
        <Text style={styles.actionText}>
          {isDone ? '撤销打卡' : '打卡通关'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.paper,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.line,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardDone: {
    backgroundColor: theme.mint,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.ink,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.line,
  },
  badgeDone: {
    backgroundColor: theme.sun,
  },
  badgeTodo: {
    backgroundColor: theme.sky,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.ink,
  },
  actionButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: theme.line,
  },
  checkinButton: {
    backgroundColor: theme.sun,
  },
  undoButton: {
    backgroundColor: theme.peach,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.ink,
  },
});
