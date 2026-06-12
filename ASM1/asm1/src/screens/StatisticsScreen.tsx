import { palette, shadow } from '@/src/constants/design';
import { TaskContext } from '@/src/context/TaskContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import React, { useContext, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const EMPTY_TASKS: NonNullable<React.ContextType<typeof TaskContext>>['tasks'] = [];

export const StatisticsScreen = () => {
  const context = useContext(TaskContext);
  const { background, foreground, card, muted, border, elevated, shadow: shadowColor } = useAppTheme();
  const tasks = context?.tasks ?? EMPTY_TASKS;
  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const overdue = tasks.filter((task) => task.dueDate && task.dueDate < Date.now() && !task.completed).length;
    const rate = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    const categories = ['work', 'personal', 'shopping', 'health', 'other'].map((name) => ({
      name,
      count: tasks.filter((task) => task.category === name).length,
    }));
    return { completed, overdue, rate, categories };
  }, [tasks]);

  const maxCategory = Math.max(1, ...stats.categories.map((item) => item.count));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>WEEKLY SIGNAL</Text>
          <Text style={styles.title}>Những con số{'\n'}biết nói.</Text>
          <View style={styles.bigScore}>
            <Text style={styles.score}>{stats.rate}</Text>
            <Text style={styles.percent}>%</Text>
            <Text style={styles.scoreLabel}>TỶ LỆ HOÀN THÀNH</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={[styles.metric, { backgroundColor: palette.lime }]}>
            <Text style={styles.metricValue}>{tasks.length}</Text><Text style={styles.metricLabel}>TỔNG VIỆC</Text>
          </View>
          <View style={[styles.metric, { backgroundColor: palette.sky }]}>
            <Text style={styles.metricValue}>{stats.completed}</Text><Text style={styles.metricLabel}>ĐÃ XONG</Text>
          </View>
          <View style={[styles.metric, { backgroundColor: palette.coral }]}>
            <Text style={styles.metricValue}>{stats.overdue}</Text><Text style={styles.metricLabel}>QUÁ HẠN</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: foreground }]}>Bản đồ tập trung</Text>
        <View style={[styles.chart, { backgroundColor: card, borderColor: border, shadowColor }]}>
          {stats.categories.map((item, index) => (
            <View key={item.name} style={styles.barRow}>
              <Text style={[styles.barIndex, { color: muted }]}>0{index + 1}</Text>
              <View style={[styles.barTrack, { backgroundColor: elevated }]}>
                <View style={[styles.barFill, { width: `${item.count / maxCategory * 100}%`, backgroundColor: index % 2 ? palette.violet : palette.lime }]} />
              </View>
              <Text style={[styles.barValue, { color: foreground }]}>{item.count}</Text>
              <Text style={[styles.barName, { color: muted }]}>{item.name.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quote}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>Tiến độ không cần hoàn hảo. Nó chỉ cần tiếp tục.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper },
  content: { paddingBottom: 40 },
  header: { minHeight: 330, backgroundColor: palette.ink, padding: 20, paddingTop: 30 },
  kicker: { color: palette.coral, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: palette.white, fontSize: 40, lineHeight: 44, fontWeight: '900', letterSpacing: -1.7, marginTop: 9 },
  bigScore: { alignSelf: 'flex-end', width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: palette.lime, marginTop: -15, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '7deg' }] },
  score: { color: palette.white, fontSize: 58, fontWeight: '900', letterSpacing: -5 },
  percent: { position: 'absolute', right: 27, top: 40, color: palette.lime, fontWeight: '900' },
  scoreLabel: { color: palette.lime, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  metricRow: { flexDirection: 'row', gap: 9, padding: 16, marginTop: -28 },
  metric: { flex: 1, minHeight: 105, borderRadius: 20, borderWidth: 2, borderColor: palette.ink, padding: 12, justifyContent: 'space-between', ...shadow },
  metricValue: { color: palette.ink, fontSize: 31, fontWeight: '900' },
  metricLabel: { color: palette.ink, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  sectionTitle: { color: palette.ink, fontSize: 25, fontWeight: '900', marginHorizontal: 16, marginTop: 14, marginBottom: 12 },
  chart: { marginHorizontal: 16, padding: 16, borderWidth: 2, borderColor: palette.ink, borderRadius: 22, backgroundColor: palette.card, gap: 16, ...shadow },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  barIndex: { width: 20, color: palette.muted, fontSize: 9, fontWeight: '900' },
  barTrack: { flex: 1, height: 18, borderRadius: 9, backgroundColor: '#DED8CE', overflow: 'hidden' },
  barFill: { height: '100%', minWidth: 4, borderRadius: 9 },
  barValue: { width: 20, color: palette.ink, fontSize: 12, fontWeight: '900', textAlign: 'right' },
  barName: { width: '100%', paddingLeft: 28, marginTop: -5, color: palette.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  quote: { margin: 16, marginTop: 28, padding: 20, borderRadius: 22, backgroundColor: palette.violet, flexDirection: 'row', gap: 10 },
  quoteMark: { color: palette.lime, fontSize: 45, lineHeight: 45, fontWeight: '900' },
  quoteText: { flex: 1, color: palette.white, fontSize: 17, lineHeight: 23, fontWeight: '900' },
});
