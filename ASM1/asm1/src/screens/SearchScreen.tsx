import { Ionicons } from '@expo/vector-icons';
import { categoryLabels, palette, shadow } from '@/src/constants/design';
import { TaskContext } from '@/src/context/TaskContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

const EMPTY_TASKS: NonNullable<React.ContextType<typeof TaskContext>>['tasks'] = [];

const suggestions = [
  { label: 'Công việc', query: 'work', color: palette.lime },
  { label: 'Cá nhân', query: 'personal', color: palette.sky },
  { label: 'Mua sắm', query: 'shopping', color: palette.coral },
  { label: 'Sức khỏe', query: 'health', color: palette.violet },
];

export const SearchScreen = () => {
  const context = useContext(TaskContext);
  const { background, foreground, card, border, muted, shadow: shadowColor } = useAppTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const tasks = context?.tasks ?? EMPTY_TASKS;
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(value)
      || task.description?.toLowerCase().includes(value)
      || task.category.includes(value));
  }, [query, tasks]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>FIND YOUR FOCUS</Text>
        <Text style={styles.title}>Tìm đúng việc,{'\n'}đúng lúc.</Text>
        <View style={[styles.searchBox, { backgroundColor: card, borderColor: border, shadowColor }]}>
          <Ionicons name="search" size={22} color={palette.ink} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Nhập từ khóa..." placeholderTextColor={muted} style={[styles.input, { color: foreground }]} autoFocus />
          {!!query && <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={21} color={palette.ink} /></Pressable>}
        </View>
      </View>

      {!query ? (
        <View style={styles.content}>
          <Text style={[styles.sectionLabel, { color: foreground }]}>LỐI TẮT TÌM KIẾM</Text>
          <View style={styles.suggestionGrid}>
            {suggestions.map((item, index) => (
              <Pressable key={item.query} onPress={() => setQuery(item.query)} style={[styles.suggestion, { backgroundColor: item.color }, index % 2 === 1 && styles.offset]}>
                <Text style={styles.suggestionIndex}>0{index + 1}</Text>
                <Text style={styles.suggestionText}>{item.label}</Text>
                <Ionicons name="arrow-up-outline" size={20} color={palette.ink} style={styles.arrow} />
              </Pressable>
            ))}
          </View>
          <View style={styles.tip}>
            <Ionicons name="bulb" size={22} color={palette.lime} />
            <Text style={styles.tipText}>Tìm theo tiêu đề, mô tả hoặc danh mục của công việc.</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.results}
          ListHeaderComponent={<Text style={[styles.resultCount, { color: foreground }]}>{results.length.toString().padStart(2, '0')} KẾT QUẢ</Text>}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyMark}>?</Text><Text style={[styles.emptyTitle, { color: foreground }]}>Không tìm thấy tín hiệu</Text></View>}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => router.push({ pathname: '/task-detail/[taskId]', params: { taskId: item.id } })} style={[styles.resultCard, { borderColor: border, shadowColor }, index % 2 === 0 ? styles.resultLime : { backgroundColor: card }]}>
              <Text style={styles.resultNumber}>{(index + 1).toString().padStart(2, '0')}</Text>
              <View style={styles.resultContent}>
                <Text style={[styles.resultTitle, index % 2 !== 0 && { color: foreground }, item.completed && styles.done]}>{item.title}</Text>
                <Text style={[styles.resultMeta, index % 2 !== 0 && { color: muted }]}>{categoryLabels[item.category]} · {item.completed ? 'Đã xong' : 'Đang thực hiện'}</Text>
              </View>
              <Ionicons name="arrow-forward" size={19} color={palette.ink} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper },
  header: { backgroundColor: palette.violet, padding: 20, paddingTop: 28, paddingBottom: 26, borderBottomWidth: 2, borderColor: palette.ink },
  kicker: { color: palette.lime, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: palette.white, fontSize: 38, lineHeight: 42, fontWeight: '900', letterSpacing: -1.6, marginTop: 8 },
  searchBox: { minHeight: 58, marginTop: 22, borderRadius: 18, borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, ...shadow },
  input: { flex: 1, color: palette.ink, fontSize: 16, fontWeight: '800' },
  content: { padding: 16 },
  sectionLabel: { color: palette.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1.6, marginBottom: 12 },
  suggestionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  suggestion: { width: '48%', height: 128, borderRadius: 22, borderWidth: 2, borderColor: palette.ink, padding: 14, justifyContent: 'space-between', ...shadow },
  offset: { marginTop: 18 },
  suggestionIndex: { color: palette.ink, fontSize: 11, fontWeight: '900' },
  suggestionText: { color: palette.ink, fontSize: 20, fontWeight: '900' },
  arrow: { alignSelf: 'flex-end', transform: [{ rotate: '45deg' }] },
  tip: { marginTop: 28, borderRadius: 18, backgroundColor: palette.ink, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { flex: 1, color: palette.white, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  results: { padding: 16, paddingBottom: 40 },
  resultCount: { color: palette.ink, fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginBottom: 13 },
  resultCard: { minHeight: 88, borderWidth: 2, borderColor: palette.ink, borderRadius: 20, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow },
  resultLime: { backgroundColor: palette.lime },
  resultWhite: { backgroundColor: palette.card },
  resultNumber: { color: palette.muted, fontSize: 11, fontWeight: '900' },
  resultContent: { flex: 1 },
  resultTitle: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  done: { textDecorationLine: 'line-through' },
  resultMeta: { color: palette.muted, fontSize: 10, fontWeight: '800', marginTop: 5, textTransform: 'uppercase' },
  empty: { minHeight: 250, alignItems: 'center', justifyContent: 'center' },
  emptyMark: { color: palette.coral, fontSize: 64, fontWeight: '900' },
  emptyTitle: { color: palette.ink, fontSize: 18, fontWeight: '900' },
});
