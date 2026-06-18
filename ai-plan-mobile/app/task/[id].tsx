import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mobilePlanStore } from '../../lib/store';
import type { PlanTask } from '../../lib/shared/schema';

function addDaysStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const DURATION_OPTIONS = [30, 45, 60, 90];

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<PlanTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDuration, setEditDuration] = useState(60);

  useEffect(() => {
    async function loadTask() {
      const plan = await mobilePlanStore.getLatestPlan();
      const found = plan?.tasks.find((item) => item.id === id) ?? null;
      setTask(found);
      if (found) {
        setEditTitle(found.title);
        setEditDescription(found.description ?? '');
        setEditDate(found.date);
        setEditDuration(found.durationMinutes);
      }
      setLoading(false);
    }
    loadTask();
  }, [id]);

  const toggleStatus = useCallback(async () => {
    if (!id || !mobilePlanStore.toggleTaskStatus) return;
    const updated = await mobilePlanStore.toggleTaskStatus(id);
    if (updated) {
      const fresh = updated.tasks.find((t: PlanTask) => t.id === id);
      if (fresh) setTask({ ...fresh });
    }
  }, [id]);

  function startEdit() {
    if (!task) return;
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditDate(task.date);
    setEditDuration(task.durationMinutes);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function saveEdit() {
    if (!id || !mobilePlanStore.updateTaskField) return;
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const validDate = dateRegex.test(editDate) ? editDate : task?.date ?? editDate;

    const updated = await mobilePlanStore.updateTaskField(id, {
      title: trimmedTitle,
      description: editDescription.trim() || undefined,
      date: validDate,
      durationMinutes: editDuration,
    });

    if (updated) {
      const fresh = updated.tasks.find((t: PlanTask) => t.id === id);
      if (fresh) setTask({ ...fresh });
    }
    setEditing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2F8F7B" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>任务不存在</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/plan')}>
          <Text style={styles.buttonText}>返回计划</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isDone = task.status === 'done';
  const priorityLabel = task.priority === 'high' ? '主线任务' : '支线任务';
  const categoryLabel: Record<string, string> = {
    practice: '练习',
    review: '复盘',
    study: '学习',
    test: '测试',
  };
  const catText = categoryLabel[task.category] || task.category || '任务';

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>返回计划</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{task.date} · {task.durationMinutes} 分钟</Text>
          <View style={[styles.badge, isDone ? styles.badgeDone : styles.badgeTodo]}>
            <Text style={[styles.badgeText, isDone && styles.badgeTextDone]}>
              {isDone ? '已完成' : '待完成'}
            </Text>
          </View>
        </View>
        <Text style={styles.tagLine}>{priorityLabel} · {catText}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Toggle status */}
        <TouchableOpacity
          style={[styles.toggleButton, isDone ? styles.toggleDone : styles.toggleTodo]}
          onPress={toggleStatus}
        >
          <Text style={styles.toggleEmoji}>{isDone ? '✅' : '⬜'}</Text>
          <Text style={[styles.toggleText, isDone && styles.toggleTextDone]}>
            {isDone ? '已完成 — 点击取消' : '标记为完成'}
          </Text>
        </TouchableOpacity>

        {!editing ? (
          <>
            {/* View mode */}
            <Text style={styles.label}>执行说明</Text>
            <Text style={styles.description}>
              {task.description ?? '完成这项任务后，记录一个收获和一个卡点。'}
            </Text>

            <Text style={styles.label}>顾问提醒</Text>
            <Text style={styles.description}>
              {isDone
                ? '这一步已经完成了，好好休息，明天继续推进。'
                : '今天只需要把这一步做扎实。完成后回到计划页打卡。'}
            </Text>

            <TouchableOpacity style={styles.editButton} onPress={startEdit}>
              <Text style={styles.editButtonText}>✏️ 编辑任务</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Edit mode */}
            <Text style={styles.label}>任务标题</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="任务标题"
              placeholderTextColor="#9A907F"
            />

            <Text style={styles.label}>执行说明</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="描述这项任务的具体做法"
              placeholderTextColor="#9A907F"
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>任务日期</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={editDate}
                onChangeText={setEditDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9A907F"
              />
            </View>
            <View style={styles.quickDateRow}>
              {[
                { label: '今天', days: 0 },
                { label: '明天', days: 1 },
                { label: '后天', days: 2 },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.quickDateBtn, editDate === addDaysStr(opt.days) && styles.quickDateBtnActive]}
                  onPress={() => setEditDate(addDaysStr(opt.days))}
                >
                  <Text style={[styles.quickDateText, editDate === addDaysStr(opt.days) && styles.quickDateTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>时长（分钟）</Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[styles.durationBtn, editDuration === min && styles.durationBtnActive]}
                  onPress={() => setEditDuration(min)}
                >
                  <Text style={[styles.durationText, editDuration === min && styles.durationTextActive]}>
                    {min}分
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveText}>保存修改</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  meta: {
    color: '#625B4D',
    fontSize: 13,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTodo: {
    backgroundColor: '#F2E7D4',
  },
  badgeDone: {
    backgroundColor: '#EAF7F3',
  },
  badgeText: {
    color: '#817767',
    fontSize: 12,
    fontWeight: '800',
  },
  badgeTextDone: {
    color: '#2F8F7B',
  },
  tagLine: {
    color: '#817767',
    fontSize: 12,
    marginTop: 6,
  },
  body: {
    padding: 18,
    paddingBottom: 40,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 18,
  },
  toggleTodo: {
    backgroundColor: '#FFFCF4',
    borderColor: '#2F8F7B',
  },
  toggleDone: {
    backgroundColor: '#EAF7F3',
    borderColor: '#2F8F7B',
  },
  toggleEmoji: {
    fontSize: 22,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2F8F7B',
  },
  toggleTextDone: {
    color: '#625B4D',
  },
  label: {
    color: '#2F8F7B',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 8,
  },
  description: {
    color: '#1E2A24',
    fontSize: 16,
    lineHeight: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: '#FFFCF4',
    padding: 14,
  },
  editButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: '#FFFCF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#1E2A24',
    fontSize: 15,
    fontWeight: '800',
  },
  // Edit mode
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderRadius: 8,
    backgroundColor: '#FFFCF4',
    color: '#1E2A24',
    fontSize: 16,
    paddingHorizontal: 14,
  },
  inputMultiline: {
    minHeight: 100,
    paddingVertical: 12,
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateInput: {
    flex: 1,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickDateBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: '#F5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickDateBtnActive: {
    backgroundColor: '#24352F',
    borderColor: '#24352F',
  },
  quickDateText: {
    color: '#625B4D',
    fontSize: 13,
    fontWeight: '800',
  },
  quickDateTextActive: {
    color: '#FFF8EA',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: '#F5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBtnActive: {
    backgroundColor: '#24352F',
    borderColor: '#24352F',
  },
  durationText: {
    color: '#625B4D',
    fontSize: 14,
    fontWeight: '800',
  },
  durationTextActive: {
    color: '#FFF8EA',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: '#FFFCF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#625B4D',
    fontSize: 15,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 2,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#1E2A24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFF8EA',
    fontSize: 16,
    fontWeight: '900',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#1E2A24',
    borderRadius: 8,
    minHeight: 50,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF8EA',
    fontWeight: '900',
  },
});
