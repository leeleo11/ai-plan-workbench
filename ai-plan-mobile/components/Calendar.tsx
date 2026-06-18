import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Plan, PlanTask } from '../lib/shared/schema';

interface CalendarProps {
  plan: Plan;
  selectedDate: string | null;
  onDayPress: (date: string) => void;
}

export function Calendar({ plan, selectedDate, onDayPress }: CalendarProps) {
  const today = new Date().toISOString().split('T')[0];

  // Initialize to the month of the selected date or today
  const initialDate = selectedDate ?? today;
  const [viewYear, setViewYear] = useState(() => Number(initialDate.split('-')[0]));
  const [viewMonth, setViewMonth] = useState(() => Number(initialDate.split('-')[1]) - 1);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday-first
  const cells: Array<number | null> = Array.from({ length: startOffset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  // Build a quick lookup: date -> { total, done }
  const taskMap = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    for (const task of plan.tasks) {
      if (!map[task.date]) map[task.date] = { total: 0, done: 0 };
      map[task.date].total += 1;
      if (task.status === 'done') map[task.date].done += 1;
    }
    return map;
  }, [plan.tasks]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function formatDate(day: number): string {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{viewYear} 年 {viewMonth + 1} 月</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekRow}>
        {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.cell} />;

          const date = formatDate(day);
          const info = taskMap[date];
          const selected = selectedDate === date;
          const isToday = today === date;
          const hasTasks = info && info.total > 0;
          const allDone = hasTasks && info.done === info.total;

          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.cell,
                hasTasks && styles.hasTask,
                allDone && styles.allDone,
                isToday && styles.today,
                selected && styles.selected,
              ]}
              onPress={() => onDayPress(date)}
            >
              <Text style={[styles.dayText, selected && styles.selectedText, allDone && !selected && styles.allDoneText]}>
                {day}
              </Text>
              {hasTasks && (
                <View style={[styles.dotRow, selected && styles.dotRowSelected]}>
                  <View style={[styles.dot, allDone && styles.dotDone]} />
                  <Text style={[styles.count, selected && styles.selectedText]}>
                    {info.done}/{info.total}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderRadius: 8,
    backgroundColor: '#FFFCF4',
    padding: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    color: '#1E2A24',
    fontSize: 22,
    fontWeight: '900',
  },
  title: {
    color: '#1E2A24',
    fontSize: 17,
    fontWeight: '900',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    width: '14.28%',
    textAlign: 'center',
    color: '#817767',
    fontSize: 12,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  hasTask: {
    backgroundColor: '#F2E7D4',
  },
  allDone: {
    backgroundColor: '#EAF7F3',
  },
  today: {
    borderColor: '#2F8F7B',
  },
  selected: {
    backgroundColor: '#24352F',
  },
  dayText: {
    color: '#1E2A24',
    fontSize: 13,
    fontWeight: '800',
  },
  allDoneText: {
    color: '#2F8F7B',
  },
  count: {
    color: '#625B4D',
    fontSize: 9,
    marginTop: 1,
  },
  selectedText: {
    color: '#FFF8EA',
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  dotRowSelected: {},
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C8A050',
  },
  dotDone: {
    backgroundColor: '#2F8F7B',
  },
});
