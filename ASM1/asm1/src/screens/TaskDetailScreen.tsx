import { Ionicons } from '@expo/vector-icons';
import DateTimeSelector from '@/src/components/DateTimeSelector';
import { categoryLabels, palette, shadow } from '@/src/constants/design';
import { TaskContext } from '@/src/context/TaskContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Priority } from '@/src/types/Task';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const priorityColor: Record<Priority, string> = { low: palette.sky, medium: palette.lime, high: palette.coral };
const priorityLabel: Record<Priority, string> = { low: 'Thư thả', medium: 'Bình thường', high: 'Khẩn cấp' };

export const TaskDetailScreen = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const context = useContext(TaskContext);
  const { background, foreground, card, muted, border } = useAppTheme();
  const task = context?.tasks.find((item) => item.id === taskId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<number | undefined>();

  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setDueDate(task?.dueDate);
  }, [task]);

  if (!context || !task) {
    return <SafeAreaView style={[styles.container, { backgroundColor: background }]}><View style={styles.missing}><Text style={styles.missingTitle}>Công việc không tồn tại</Text><Pressable onPress={() => router.back()}><Text style={styles.backLink}>Quay lại</Text></Pressable></View></SafeAreaView>;
  }

  const save = () => {
    if (!title.trim()) return Alert.alert('Thiếu tiêu đề', 'Hãy nhập tên công việc.');
    context.updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
    });
    Alert.alert('Đã lưu', 'Thay đổi đã được cập nhật.');
  };
  const remove = () => Alert.alert('Xóa công việc?', 'Thao tác này không thể hoàn tác.', [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Xóa', style: 'destructive', onPress: () => { context.deleteTask(task.id); router.back(); } },
  ]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, { backgroundColor: priorityColor[task.priority] }]}>
            <View style={styles.topRow}>
              <Pressable onPress={() => router.back()} style={styles.roundButton}><Ionicons name="arrow-back" size={20} color={palette.ink} /></Pressable>
              <Text style={styles.heroIndex}>#{task.id.slice(-4).toUpperCase()}</Text>
              <Pressable onPress={remove} style={styles.roundButton}><Ionicons name="trash-outline" size={19} color={palette.danger} /></Pressable>
            </View>
            <Text style={styles.kicker}>TASK DOCUMENT</Text>
            <Text style={styles.heroTitle}>{task.completed ? 'Đã khép lại.' : 'Đang chuyển động.'}</Text>
            <Pressable onPress={() => context.toggleComplete(task.id)} style={[styles.statusButton, task.completed && styles.statusDone]}>
              <Ionicons name={task.completed ? 'refresh' : 'checkmark'} size={19} color={task.completed ? palette.ink : palette.lime} />
              <Text style={[styles.statusText, task.completed && styles.statusDoneText]}>{task.completed ? 'MỞ LẠI' : 'ĐÁNH DẤU HOÀN THÀNH'}</Text>
            </Pressable>
          </View>

          <View style={[styles.sheet, { backgroundColor: card }]}>
            <Text style={[styles.label, { color: muted }]}>TIÊU ĐỀ</Text>
            <TextInput value={title} onChangeText={setTitle} multiline style={[styles.titleInput, { color: foreground }]} />
            <View style={[styles.rule, { backgroundColor: border }]} />
            <Text style={[styles.label, { color: muted }]}>GHI CHÚ</Text>
            <TextInput value={description} onChangeText={setDescription} multiline placeholder="Thêm bối cảnh cho công việc..." placeholderTextColor={muted} style={[styles.description, { color: foreground }]} />
            <Text style={[styles.scheduleLabel, { color: muted }]}>NGÀY VÀ GIỜ THỰC HIỆN</Text>
            <DateTimeSelector value={dueDate} onChange={setDueDate} />
            <View style={styles.metaGrid}>
              <View style={[styles.meta, { backgroundColor: priorityColor[task.priority] }]}><Text style={styles.metaLabel}>CƯỜNG ĐỘ</Text><Text style={styles.metaValue}>{priorityLabel[task.priority]}</Text></View>
              <View style={[styles.meta, { backgroundColor: palette.violet }]}><Text style={[styles.metaLabel, styles.white]}>KHÔNG GIAN</Text><Text style={[styles.metaValue, styles.white]}>{categoryLabels[task.category]}</Text></View>
              <View style={[styles.meta, { backgroundColor: palette.card }]}><Text style={styles.metaLabel}>HẠN XỬ LÝ</Text><Text style={styles.metaValue}>{task.dueDate ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(task.dueDate) : 'Không có'}</Text></View>
              <View style={[styles.meta, { backgroundColor: palette.sky }]}><Text style={styles.metaLabel}>CẬP NHẬT</Text><Text style={styles.metaValue}>{new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(task.updatedAt)}</Text></View>
            </View>
            <Pressable onPress={save} style={styles.save}><Text style={styles.saveText}>LƯU TÀI LIỆU</Text><Ionicons name="arrow-forward" size={20} color={palette.lime} /></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper }, flex: { flex: 1 }, content: { paddingBottom: 35 },
  hero: { minHeight: 285, padding: 20, borderBottomWidth: 2, borderColor: palette.ink },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roundButton: { width: 43, height: 43, borderRadius: 14, backgroundColor: palette.card, borderWidth: 2, borderColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  heroIndex: { color: palette.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  kicker: { color: palette.ink, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 36 },
  heroTitle: { color: palette.ink, fontSize: 38, fontWeight: '900', letterSpacing: -1.5, marginTop: 7 },
  statusButton: { alignSelf: 'flex-start', marginTop: 22, height: 47, borderRadius: 14, backgroundColor: palette.ink, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDone: { backgroundColor: palette.card, borderWidth: 2, borderColor: palette.ink },
  statusText: { color: palette.white, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 }, statusDoneText: { color: palette.ink },
  sheet: { padding: 16, paddingTop: 24, backgroundColor: palette.card }, label: { color: palette.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  titleInput: { color: palette.ink, fontSize: 27, lineHeight: 33, fontWeight: '900', paddingVertical: 10 },
  rule: { height: 2, backgroundColor: palette.ink, marginBottom: 18 },
  description: { minHeight: 120, color: palette.ink, fontSize: 15, lineHeight: 22, fontWeight: '600', textAlignVertical: 'top', paddingTop: 10 },
  scheduleLabel: { color: palette.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 18, marginBottom: 9 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  meta: { width: '48%', minHeight: 92, borderRadius: 18, borderWidth: 2, borderColor: palette.ink, padding: 13, justifyContent: 'space-between', ...shadow },
  metaLabel: { color: palette.ink, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, metaValue: { color: palette.ink, fontSize: 14, fontWeight: '900' }, white: { color: palette.white },
  save: { height: 58, borderRadius: 18, marginTop: 25, backgroundColor: palette.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveText: { color: palette.white, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' }, missingTitle: { color: palette.ink, fontSize: 20, fontWeight: '900' }, backLink: { color: palette.violet, fontWeight: '900', marginTop: 10 },
});
