import { Ionicons } from '@expo/vector-icons';
import FilterBar from '@/src/components/FilterBar';
import StatsCard from '@/src/components/StatsCard';
import TaskInput from '@/src/components/TaskInput';
import TaskItem from '@/src/components/TaskItem';
import { palette } from '@/src/constants/design';
import { TaskContext } from '@/src/context/TaskContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Task } from '@/src/types/Task';
import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const sameDay = (timestamp: number, date: Date) => {
  const value = new Date(timestamp);
  return value.getFullYear() === date.getFullYear()
    && value.getMonth() === date.getMonth()
    && value.getDate() === date.getDate();
};

export default function HomeScreen() {
  const context = useContext(TaskContext);
  const { background, foreground, card, muted, border } = useAppTheme();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => Array.from({ length: 10 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  }), []);

  if (!context) return null;

  const {
    tasks, filter, sortType, setFilter, setSortType,
    toggleComplete, deleteTask, updateTask, getFilteredAndSortedTasks,
  } = context;
  const completed = tasks.filter((task) => task.completed).length;
  const remaining = tasks.length - completed;
  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < Date.now() && !task.completed).length;
  const filtered = getFilteredAndSortedTasks();
  const shown = selectedDate
    ? filtered.filter((task) => task.dueDate && sameDay(task.dueDate, selectedDate))
    : filtered;

  const renderTask: ListRenderItem<Task> = ({ item }) => (
    <Pressable onPress={() => router.push({ pathname: '/task-detail/[taskId]', params: { taskId: item.id } })}>
      <TaskItem
        task={item}
        onToggleComplete={() => toggleComplete(item.id)}
        onDeleteTask={() => deleteTask(item.id)}
        onEditTask={(title) => updateTask(item.id, { title })}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <FlatList
        data={shown}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <>
            <View style={styles.hero}>
              <View style={styles.heroShapeOne} />
              <View style={styles.heroShapeTwo} />
              <View style={styles.brandRow}>
                <View style={styles.monogram}><Text style={styles.monogramText}>TF</Text></View>
                <View style={styles.datePill}>
                  <Text style={styles.dateText}>{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(new Date())}</Text>
                </View>
              </View>
              <Text style={styles.kicker}>YOUR DAY, REMIXED</Text>
              <Text style={styles.heroTitle}>Làm ít hơn.{'\n'}Đúng việc hơn.</Text>
              <View style={styles.heroFooter}>
                <View>
                  <Text style={styles.heroMetric}>{remaining}</Text>
                  <Text style={styles.heroMetricLabel}>ĐANG CHỜ</Text>
                </View>
                <View style={styles.heroDivider} />
                <View>
                  <Text style={[styles.heroMetric, overdue > 0 && styles.danger]}>{overdue}</Text>
                  <Text style={styles.heroMetricLabel}>TRỄ HẸN</Text>
                </View>
                <Ionicons name="flash" size={34} color={palette.lime} style={styles.flash} />
              </View>
            </View>

            <StatsCard total={tasks.length} completed={completed} remaining={remaining} />

            <View style={styles.timelineHeader}>
              <View>
                <Text style={styles.sectionKicker}>10 NGÀY TỚI</Text>
                <Text style={[styles.sectionTitle, { color: foreground }]}>Chọn một nhịp</Text>
              </View>
              {!!selectedDate && (
                <Pressable onPress={() => setSelectedDate(null)} style={[styles.reset, { borderColor: border }]}>
                  <Text style={[styles.resetText, { color: foreground }]}>XEM TẤT CẢ</Text>
                </Pressable>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
              {days.map((date, index) => {
                const active = selectedDate ? sameDay(selectedDate.getTime(), date) : false;
                const count = tasks.filter((task) => task.dueDate && sameDay(task.dueDate, date)).length;
                return (
                  <Pressable key={date.toISOString()} onPress={() => setSelectedDate(date)} style={[styles.day, { backgroundColor: card, borderColor: border }, active && styles.activeDay]}>
                    <Text style={[styles.dayName, { color: muted }, active && styles.activeDayText]}>{index === 0 ? 'NAY' : new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date).toUpperCase()}</Text>
                    <Text style={[styles.dayNumber, { color: foreground }, active && styles.activeDayText]}>{date.getDate()}</Text>
                    <View style={[styles.dayCount, active && styles.activeCount]}><Text style={styles.dayCountText}>{count}</Text></View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <TaskInput />
            <FilterBar activeFilter={filter} activeSortType={sortType} onFilterChange={setFilter} onSortChange={setSortType} />

            <View style={styles.listHeading}>
              <Text style={[styles.listTitle, { color: foreground }]}>{selectedDate ? 'Việc trong ngày' : 'Danh sách phát'}</Text>
              <Text style={[styles.listCount, { color: muted }]}>{shown.length.toString().padStart(2, '0')}</Text>
            </View>
          </>
        )}
        ListEmptyComponent={(
          <View style={[styles.empty, { borderColor: border }]}>
            <Text style={styles.emptySymbol}>∅</Text>
            <Text style={[styles.emptyTitle, { color: foreground }]}>Khoảng trống quý giá</Text>
            <Text style={[styles.emptyText, { color: muted }]}>Không có công việc nào khớp với lựa chọn hiện tại.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper },
  list: { paddingBottom: 35 },
  hero: { minHeight: 330, padding: 20, paddingBottom: 67, backgroundColor: palette.ink, overflow: 'hidden' },
  heroShapeOne: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -70, top: 45, borderWidth: 35, borderColor: palette.violet },
  heroShapeTwo: { position: 'absolute', width: 80, height: 180, backgroundColor: palette.coral, right: 26, bottom: -80, transform: [{ rotate: '35deg' }] },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monogram: { width: 45, height: 45, borderRadius: 14, backgroundColor: palette.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  monogramText: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  datePill: { borderWidth: 1, borderColor: '#4B4B4B', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
  dateText: { color: palette.white, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  kicker: { color: palette.lime, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 34 },
  heroTitle: { color: palette.white, fontSize: 43, lineHeight: 47, letterSpacing: -2, fontWeight: '900', marginTop: 8 },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 25 },
  heroMetric: { color: palette.white, fontSize: 24, fontWeight: '900' },
  danger: { color: palette.coral },
  heroMetricLabel: { color: '#8E8E8E', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  heroDivider: { width: 1, height: 34, backgroundColor: '#4B4B4B' },
  flash: { marginLeft: 'auto', transform: [{ rotate: '12deg' }] },
  timelineHeader: { marginHorizontal: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 11 },
  sectionKicker: { color: palette.coral, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  sectionTitle: { color: palette.ink, fontSize: 22, fontWeight: '900', letterSpacing: -0.6, marginTop: 2 },
  reset: { paddingBottom: 3, borderBottomWidth: 2, borderColor: palette.ink },
  resetText: { color: palette.ink, fontSize: 9, fontWeight: '900' },
  dayRow: { gap: 8, paddingHorizontal: 16, paddingBottom: 22 },
  day: { width: 65, height: 92, borderRadius: 20, borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.card, alignItems: 'center', justifyContent: 'center' },
  activeDay: { backgroundColor: palette.violet },
  dayName: { color: palette.muted, fontSize: 9, fontWeight: '900' },
  dayNumber: { color: palette.ink, fontSize: 23, fontWeight: '900', marginVertical: 4 },
  activeDayText: { color: palette.white },
  dayCount: { minWidth: 22, height: 18, borderRadius: 9, backgroundColor: palette.lime, alignItems: 'center', justifyContent: 'center' },
  activeCount: { backgroundColor: palette.coral },
  dayCountText: { color: palette.ink, fontSize: 9, fontWeight: '900' },
  listHeading: { marginHorizontal: 16, marginTop: 2, marginBottom: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { color: palette.ink, fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
  listCount: { color: palette.muted, fontSize: 28, fontWeight: '300' },
  empty: { margin: 16, minHeight: 190, borderWidth: 2, borderColor: palette.ink, borderStyle: 'dashed', borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptySymbol: { color: palette.violet, fontSize: 42, fontWeight: '900' },
  emptyTitle: { color: palette.ink, fontSize: 18, fontWeight: '900', marginTop: 4 },
  emptyText: { color: palette.muted, fontSize: 12, textAlign: 'center', marginTop: 5 },
});
