import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/src/constants/design';
import { useAppTheme } from '@/src/context/ThemeContext';
import { FilterType, SortType } from '@/src/types/Task';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  activeFilter: FilterType;
  activeSortType: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'incomplete', label: 'Đang làm' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'completed', label: 'Đã xong' },
];

const sorts: { value: SortType; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'priority', label: 'Ưu tiên' },
  { value: 'dueDate', label: 'Hạn chót' },
];

export default function FilterBar({ activeFilter, activeSortType, onFilterChange, onSortChange }: Props) {
  const { foreground, card, border, muted, elevated } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: foreground }]}>BỘ LỌC NHANH</Text>
        <Ionicons name="options-outline" size={18} color={foreground} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {filters.map((item) => {
          const active = item.value === activeFilter;
          return (
            <Pressable key={item.value} onPress={() => onFilterChange(item.value)} style={[styles.chip, { backgroundColor: card, borderColor: border }, active && styles.activeChip]}>
              <Text style={[styles.chipText, { color: foreground }, active && styles.activeText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
        <Text style={[styles.sortLabel, { color: muted }]}>Sắp xếp:</Text>
        {sorts.map((item) => {
          const active = item.value === activeSortType;
          return (
            <Pressable key={item.value} onPress={() => onSortChange(item.value)} style={[styles.sortChip, { backgroundColor: elevated }, active && styles.activeSort]}>
              <Text style={[styles.sortText, { color: foreground }, active && styles.activeSortText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 18, gap: 10 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: palette.ink, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  row: { gap: 8, paddingRight: 16 },
  chip: { height: 39, paddingHorizontal: 15, borderRadius: 20, borderWidth: 2, borderColor: palette.ink, justifyContent: 'center', backgroundColor: palette.card },
  activeChip: { backgroundColor: palette.ink },
  chipText: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  activeText: { color: palette.lime },
  sortRow: { alignItems: 'center', gap: 7, paddingRight: 16 },
  sortLabel: { color: palette.muted, fontSize: 11, fontWeight: '800' },
  sortChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E7E1D7' },
  activeSort: { backgroundColor: palette.violet },
  sortText: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  activeSortText: { color: palette.white },
});
