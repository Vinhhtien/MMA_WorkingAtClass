import { Ionicons } from '@expo/vector-icons';
import { categoryLabels, palette, shadow } from '@/src/constants/design';
import { TaskContext } from '@/src/context/TaskContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const sameDay = (timestamp: number, date: Date) => {
  const value = new Date(timestamp);
  return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth() && value.getDate() === date.getDate();
};

export const CalendarScreen = () => {
  const context = useContext(TaskContext);
  const { background, foreground, card, muted, border, shadow: shadowColor } = useAppTheme();
  const router = useRouter();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const tasks = context?.tasks ?? [];
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(month.getFullYear(), month.getMonth(), index - offset + 1);
      return { date, current: date.getMonth() === month.getMonth() };
    });
  }, [month]);
  const agenda = tasks.filter((task) => task.dueDate && sameDay(task.dueDate, selected));

  const move = (value: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + value, 1);
    setMonth(next);
    setSelected(next);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>TIME CANVAS</Text>
          <Text style={styles.title}>Nhìn rộng hơn.{'\n'}Đi xa hơn.</Text>
          <View style={styles.monthNav}>
            <Pressable onPress={() => move(-1)} style={styles.nav}><Ionicons name="arrow-back" size={19} color={palette.ink} /></Pressable>
            <Text style={styles.month}>{new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(month)}</Text>
            <Pressable onPress={() => move(1)} style={styles.nav}><Ionicons name="arrow-forward" size={19} color={palette.ink} /></Pressable>
          </View>
        </View>

        <View style={[styles.calendar, { backgroundColor: card, borderColor: border, shadowColor }]}>
          <View style={styles.weekRow}>{weekdays.map((day) => <Text key={day} style={[styles.weekday, { color: muted }]}>{day}</Text>)}</View>
          <View style={styles.grid}>
            {cells.map(({ date, current }) => {
              const active = sameDay(selected.getTime(), date);
              const count = tasks.filter((task) => task.dueDate && sameDay(task.dueDate, date)).length;
              return (
                <Pressable key={date.toISOString()} onPress={() => current && setSelected(date)} style={[styles.cell, active && styles.activeCell]}>
                  <Text style={[styles.day, { color: foreground }, !current && styles.mutedDay, active && styles.activeDay]}>{date.getDate()}</Text>
                  {current && count > 0 && <View style={[styles.dot, active && styles.activeDot]}><Text style={styles.dotText}>{count}</Text></View>}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.agendaHead}>
          <View><Text style={styles.agendaKicker}>AGENDA</Text><Text style={[styles.agendaTitle, { color: foreground }]}>{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(selected)}</Text></View>
          <Text style={[styles.agendaCount, { color: muted }]}>{agenda.length.toString().padStart(2, '0')}</Text>
        </View>
        {agenda.length ? agenda.map((task, index) => (
          <Pressable key={task.id} onPress={() => router.push({ pathname: '/task-detail/[taskId]', params: { taskId: task.id } })} style={[styles.agendaCard, index % 2 ? styles.agendaViolet : styles.agendaLime]}>
            <Text style={styles.time}>{new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(task.dueDate)}</Text>
            <View style={styles.agendaContent}><Text style={[styles.taskTitle, task.completed && styles.done]}>{task.title}</Text><Text style={styles.taskMeta}>{categoryLabels[task.category]}</Text></View>
            <Ionicons name="arrow-forward-circle" size={25} color={palette.ink} />
          </Pressable>
        )) : (
          <View style={[styles.empty, { borderColor: border }]}><Text style={styles.emptyMark}>FREE</Text><Text style={[styles.emptyText, { color: muted }]}>Ngày này hoàn toàn thuộc về bạn.</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper },
  content: { paddingBottom: 40 },
  header: { padding: 20, paddingTop: 28, backgroundColor: palette.coral, borderBottomWidth: 2, borderColor: palette.ink },
  kicker: { color: palette.ink, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: palette.ink, fontSize: 38, lineHeight: 42, fontWeight: '900', letterSpacing: -1.5, marginTop: 8 },
  monthNav: { marginTop: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nav: { width: 42, height: 42, borderRadius: 14, borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.card, alignItems: 'center', justifyContent: 'center' },
  month: { color: palette.ink, fontSize: 16, fontWeight: '900', textTransform: 'capitalize' },
  calendar: { margin: 16, padding: 12, borderRadius: 24, borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.card, ...shadow },
  weekRow: { flexDirection: 'row', marginBottom: 5 },
  weekday: { width: '14.2857%', textAlign: 'center', color: palette.muted, fontSize: 9, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', height: 55, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activeCell: { backgroundColor: palette.ink },
  day: { color: palette.ink, fontSize: 14, fontWeight: '900' },
  mutedDay: { color: '#D3CDC3' },
  activeDay: { color: palette.white },
  dot: { minWidth: 17, height: 17, borderRadius: 9, backgroundColor: palette.lime, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  activeDot: { backgroundColor: palette.coral },
  dotText: { color: palette.ink, fontSize: 8, fontWeight: '900' },
  agendaHead: { marginHorizontal: 16, marginTop: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  agendaKicker: { color: palette.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  agendaTitle: { color: palette.ink, fontSize: 20, fontWeight: '900', textTransform: 'capitalize', marginTop: 2 },
  agendaCount: { color: palette.muted, fontSize: 30, fontWeight: '300' },
  agendaCard: { marginHorizontal: 16, marginBottom: 11, minHeight: 82, borderWidth: 2, borderColor: palette.ink, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 13, ...shadow },
  agendaLime: { backgroundColor: palette.lime },
  agendaViolet: { backgroundColor: palette.violet },
  time: { color: palette.ink, fontSize: 12, fontWeight: '900' },
  agendaContent: { flex: 1 },
  taskTitle: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  done: { textDecorationLine: 'line-through' },
  taskMeta: { color: palette.ink, fontSize: 9, fontWeight: '900', textTransform: 'uppercase', marginTop: 4 },
  empty: { margin: 16, minHeight: 150, borderWidth: 2, borderColor: palette.ink, borderStyle: 'dashed', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emptyMark: { color: palette.violet, fontSize: 30, fontWeight: '900', letterSpacing: 3 },
  emptyText: { color: palette.muted, fontSize: 12, fontWeight: '700', marginTop: 5 },
});
