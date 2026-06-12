import { Ionicons } from '@expo/vector-icons';
import { categoryLabels, palette, shadow } from '@/src/constants/design';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Priority, Task } from '@/src/types/Task';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  task: Task;
  onToggleComplete: () => void;
  onDeleteTask: () => void;
  onEditTask: (title: string) => void;
}

const colors: Record<Priority, string> = { low: palette.sky, medium: palette.lime, high: palette.coral };
const labels: Record<Priority, string> = { low: 'THƯ THẢ', medium: 'VỪA', high: 'KHẨN' };

export default function TaskItem({ task, onToggleComplete, onDeleteTask, onEditTask }: Props) {
  const { card, foreground, muted, border, input, shadow: shadowColor } = useAppTheme();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const overdue = Boolean(task.dueDate && task.dueDate < Date.now() && !task.completed);
  const color = colors[task.priority];

  const save = () => {
    if (!title.trim()) return;
    onEditTask(title.trim());
    setEditing(false);
  };

  const remove = () => Alert.alert('Xóa công việc?', 'Thao tác này không thể hoàn tác.', [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Xóa', style: 'destructive', onPress: onDeleteTask },
  ]);

  if (editing) {
    return (
      <View style={styles.wrap}>
        <View style={[styles.editCard, { backgroundColor: card, borderColor: border, shadowColor }]}>
          <TextInput value={title} onChangeText={setTitle} autoFocus multiline style={[styles.editInput, { color: foreground }]} />
          <View style={styles.editActions}>
            <Pressable onPress={() => setEditing(false)} style={styles.cancel}><Text style={styles.cancelText}>HỦY</Text></Pressable>
            <Pressable onPress={save} style={styles.save}><Text style={styles.saveText}>LƯU THAY ĐỔI</Text></Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: card, borderColor: border, shadowColor }, task.completed && styles.completed]}>
        <View style={[styles.flag, { backgroundColor: color }]}>
          <Text style={styles.flagText}>{labels[task.priority]}</Text>
        </View>
        <Pressable onPress={onToggleComplete} style={[styles.check, { backgroundColor: input, borderColor: border }, task.completed && styles.checked]}>
          <Ionicons name={task.completed ? 'checkmark' : 'arrow-forward'} size={18} color={task.completed ? palette.lime : foreground} />
        </Pressable>
        <View style={styles.content}>
          <Text numberOfLines={2} style={[styles.title, { color: foreground }, task.completed && styles.doneTitle]}>{task.title}</Text>
          {!!task.description && <Text numberOfLines={1} style={[styles.description, { color: muted }]}>{task.description}</Text>}
          <View style={styles.metaRow}>
            <Text style={styles.category}>{categoryLabels[task.category]}</Text>
            <Text style={[styles.date, { color: muted }, overdue && styles.overdue]}>
              {task.dueDate
                ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(task.dueDate)
                : 'Không đặt hạn'}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => setEditing(true)} style={[styles.iconButton, { backgroundColor: input, borderColor: border }]}><Ionicons name="pencil" size={15} color={foreground} /></Pressable>
          <Pressable onPress={remove} style={[styles.iconButton, { backgroundColor: input, borderColor: border }]}><Ionicons name="trash" size={15} color={palette.danger} /></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginVertical: 7 },
  card: { minHeight: 112, padding: 15, paddingTop: 36, borderRadius: 22, borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.card, flexDirection: 'row', alignItems: 'flex-start', gap: 11, overflow: 'hidden', ...shadow },
  completed: { opacity: 0.58, shadowOpacity: 0 },
  flag: { position: 'absolute', left: -2, top: -2, height: 27, paddingHorizontal: 13, borderRightWidth: 2, borderBottomWidth: 2, borderColor: palette.ink, justifyContent: 'center' },
  flagText: { color: palette.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  check: { width: 36, height: 36, borderRadius: 12, borderWidth: 2, borderColor: palette.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper },
  checked: { backgroundColor: palette.ink },
  content: { flex: 1, gap: 5 },
  title: { color: palette.ink, fontSize: 16, lineHeight: 21, fontWeight: '900' },
  doneTitle: { textDecorationLine: 'line-through' },
  description: { color: palette.muted, fontSize: 12, lineHeight: 17 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 3 },
  category: { color: palette.violet, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  date: { color: palette.muted, fontSize: 10, fontWeight: '800' },
  overdue: { color: palette.danger },
  actions: { gap: 7 },
  iconButton: { width: 31, height: 31, borderRadius: 10, borderWidth: 1.5, borderColor: palette.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper },
  editCard: { padding: 15, borderRadius: 22, borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.card, ...shadow },
  editInput: { minHeight: 70, color: palette.ink, fontSize: 18, fontWeight: '900', textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancel: { paddingHorizontal: 14, height: 38, justifyContent: 'center' },
  cancelText: { color: palette.muted, fontSize: 10, fontWeight: '900' },
  save: { paddingHorizontal: 14, height: 38, borderRadius: 10, backgroundColor: palette.ink, justifyContent: 'center' },
  saveText: { color: palette.lime, fontSize: 10, fontWeight: '900' },
});
