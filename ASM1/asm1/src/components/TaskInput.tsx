import { Ionicons } from '@expo/vector-icons';
import DateTimeSelector from '@/src/components/DateTimeSelector';
import { palette, shadow } from '@/src/constants/design';
import { TaskContext } from '@/src/context/TaskContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Category, Priority } from '@/src/types/Task';
import { validateTaskTitle } from '@/src/utils/validation';
import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'THƯ THẢ', color: palette.sky },
  { value: 'medium', label: 'BÌNH THƯỜNG', color: palette.lime },
  { value: 'high', label: 'KHẨN', color: palette.coral },
];

const categories: { value: Category; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'work', label: 'Việc', icon: 'briefcase-outline' },
  { value: 'personal', label: 'Cá nhân', icon: 'person-outline' },
  { value: 'shopping', label: 'Mua sắm', icon: 'cart-outline' },
  { value: 'health', label: 'Sức khỏe', icon: 'fitness-outline' },
  { value: 'other', label: 'Khác', icon: 'shapes-outline' },
];

export default function TaskInput() {
  const context = useContext(TaskContext);
  const { card, foreground, muted, border, input, elevated, shadow: shadowColor } = useAppTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('personal');
  const [dueDate, setDueDate] = useState<number | undefined>();
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  if (!context) return null;

  const submit = () => {
    const validation = validateTaskTitle(title);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    context.addTask(title.trim(), description.trim() || undefined, priority, category, dueDate);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('personal');
    setDueDate(undefined);
    setExpanded(false);
    setError('');
  };

  return (
    <View style={[styles.container, { backgroundColor: card, borderColor: border, shadowColor }]}>
      <View style={styles.topLabel}>
        <View style={styles.liveDot} />
        <Text style={styles.kicker}>QUICK CAPTURE</Text>
        <Text style={styles.counter}>{title.length}/200</Text>
      </View>
      <TextInput
        value={title}
        onChangeText={(value) => { setTitle(value); setError(''); }}
        placeholder="Bạn cần hoàn thành điều gì?"
        placeholderTextColor="#8B857B"
        style={[styles.titleInput, { color: foreground }]}
        maxLength={200}
        multiline
      />

      <View style={styles.actionRow}>
        <Pressable onPress={() => setExpanded(!expanded)} style={[styles.detailButton, { backgroundColor: elevated }]}>
          <Ionicons name={expanded ? 'remove' : 'add'} size={18} color={foreground} />
          <Text style={[styles.detailText, { color: foreground }]}>{expanded ? 'Thu gọn' : 'Thêm chi tiết'}</Text>
        </Pressable>
        <Pressable onPress={submit} style={[styles.submit, !title.trim() && styles.submitDisabled]}>
          <Text style={styles.submitText}>TẠO VIỆC</Text>
          <Ionicons name="arrow-forward" size={18} color={palette.lime} />
        </Pressable>
      </View>

      {expanded && (
        <View style={[styles.detailPanel, { borderTopColor: border }]}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ghi chú hoặc bối cảnh..."
            placeholderTextColor="#8B857B"
            multiline
            style={[styles.description, { backgroundColor: input, borderColor: border, color: foreground }]}
          />

          <Text style={[styles.label, { color: muted }]}>NGÀY VÀ GIỜ THỰC HIỆN</Text>
          <DateTimeSelector value={dueDate} onChange={setDueDate} />

          <Text style={[styles.label, { color: muted }]}>CƯỜNG ĐỘ</Text>
          <View style={styles.priorityRow}>
            {priorities.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setPriority(item.value)}
                style={[styles.priority, { backgroundColor: item.color }, priority !== item.value && styles.priorityInactive]}
              >
                <Text style={styles.priorityText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: muted }]}>KHÔNG GIAN</Text>
          <View style={styles.categoryRow}>
            {categories.map((item) => (
              <Pressable key={item.value} onPress={() => setCategory(item.value)} style={[styles.category, { borderColor: border }, category === item.value && styles.categoryActive]}>
                <Ionicons name={item.icon} size={15} color={category === item.value ? palette.lime : foreground} />
                <Text style={[styles.categoryText, { color: foreground }, category === item.value && styles.categoryTextActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 22, padding: 17, borderWidth: 2, borderColor: palette.ink, borderRadius: 25, backgroundColor: palette.card, ...shadow },
  topLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.coral },
  kicker: { color: palette.ink, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, flex: 1 },
  counter: { color: palette.muted, fontSize: 10, fontWeight: '800' },
  titleInput: { minHeight: 70, color: palette.ink, fontSize: 23, lineHeight: 29, fontWeight: '900', paddingVertical: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  detailButton: { height: 42, paddingHorizontal: 12, borderRadius: 13, backgroundColor: '#E9E3D9', flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  submit: { height: 46, paddingHorizontal: 17, borderRadius: 14, backgroundColor: palette.ink, flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: palette.white, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  detailPanel: { borderTopWidth: 2, borderTopColor: palette.ink, marginTop: 16, paddingTop: 15, gap: 10 },
  description: { minHeight: 72, borderWidth: 2, borderColor: palette.ink, borderRadius: 14, padding: 12, color: palette.ink, textAlignVertical: 'top', backgroundColor: palette.paper },
  label: { color: palette.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginTop: 3 },
  priorityRow: { flexDirection: 'row', gap: 7 },
  priority: { flex: 1, minHeight: 38, borderRadius: 10, borderWidth: 1.5, borderColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  priorityInactive: { opacity: 0.35 },
  priorityText: { color: palette.ink, fontSize: 9, fontWeight: '900' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  category: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 10, minHeight: 34, borderRadius: 10, borderWidth: 1.5, borderColor: palette.ink },
  categoryActive: { backgroundColor: palette.ink },
  categoryText: { color: palette.ink, fontSize: 10, fontWeight: '800' },
  categoryTextActive: { color: palette.lime },
  error: { color: palette.danger, fontSize: 11, fontWeight: '800', marginTop: 10 },
});
