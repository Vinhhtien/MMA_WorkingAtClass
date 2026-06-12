import { Ionicons } from '@expo/vector-icons';
import { palette, shadow } from '@/src/constants/design';
import { TaskContext } from '@/src/context/TaskContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import {
  getReminderPreferences,
  scheduleTestReminder,
  updateReminderPreferences,
} from '@/src/services/notificationService';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

export const SettingsScreen = () => {
  const context = useContext(TaskContext);
  const { isDark, setDarkMode, background, foreground } = useAppTheme();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getReminderPreferences().then((preferences) => {
      setNotifications(preferences.enabled);
      setSound(preferences.soundEnabled);
    });
  }, []);

  const setNotificationsEnabled = async (enabled: boolean) => {
    setNotifications(enabled);
    await updateReminderPreferences({ enabled }, context?.tasks ?? []);
  };

  const setSoundEnabled = async (enabled: boolean) => {
    setSound(enabled);
    await updateReminderPreferences({ soundEnabled: enabled }, context?.tasks ?? []);
  };

  const testReminder = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Cần điện thoại thật', 'Chuông nhắc việc chỉ hoạt động trên Android hoặc iPhone.');
      return;
    }

    setTesting(true);
    const scheduled = await scheduleTestReminder();
    setTesting(false);
    Alert.alert(
      scheduled ? 'Đã đặt chuông thử' : 'Không thể đặt chuông',
      scheduled
        ? 'Chuông sẽ phát sau khoảng 3 giây. Hãy khóa màn hình hoặc chuyển app xuống nền để kiểm tra.'
        : 'Hãy bật Nhắc việc và cấp quyền thông báo trong cài đặt điện thoại.',
    );
  };

  const exportData = async () => Share.share({
    title: 'TaskFlow',
    message: JSON.stringify({
      exportedAt: new Date().toISOString(),
      tasks: context?.tasks ?? [],
    }, null, 2),
  });

  const clear = () => Alert.alert('Xóa toàn bộ dữ liệu?', 'Mọi công việc sẽ bị xóa khỏi thiết bị.', [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Xóa', style: 'destructive', onPress: context?.clearAllTasks },
  ]);

  const Toggle = ({
    title,
    note,
    value,
    onChange,
    color,
    disabled,
  }: {
    title: string;
    note: string;
    value: boolean;
    onChange: (value: boolean) => void;
    color: string;
    disabled?: boolean;
  }) => {
    const darkSurface = color === '#2A2A2A';
    return (
    <View style={[styles.setting, { backgroundColor: color, borderColor: darkSurface ? '#F4F0E8' : palette.ink }, disabled && styles.disabled]}>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, darkSurface && styles.lightText]}>{title}</Text>
        <Text style={[styles.settingNote, darkSurface && styles.lightNote]}>{note}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: '#AFA89E', true: palette.ink }}
        thumbColor={value ? palette.lime : palette.card}
      />
    </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}><Text style={styles.avatarText}>TF</Text></View>
          <Text style={styles.kicker}>CONTROL ROOM</Text>
          <Text style={styles.title}>Chỉnh app theo{'\n'}nhịp của bạn.</Text>
        </View>

        <Text style={[styles.section, { color: foreground }]}>GIAO DIỆN</Text>
        <Toggle
          title="Dark mode"
          note="Dùng nền tối, giảm ánh sáng khi làm việc ban đêm"
          value={isDark}
          onChange={setDarkMode}
          color={isDark ? '#2A2A2A' : palette.card}
        />

        <Text style={[styles.section, { color: foreground }]}>NHẮC VIỆC</Text>
        <Toggle
          title="Nhắc việc"
          note="Đặt chuông đúng thời gian deadline"
          value={notifications}
          onChange={setNotificationsEnabled}
          color={palette.lime}
        />
        <Toggle
          title="Âm thanh chuông"
          note="Phát âm thanh và rung khi đến giờ"
          value={sound}
          onChange={setSoundEnabled}
          color={palette.sky}
          disabled={!notifications}
        />
        <Pressable
          onPress={testReminder}
          disabled={testing || !notifications}
          style={[styles.testButton, (testing || !notifications) && styles.disabled]}
        >
          <View style={styles.testIcon}>
            <Ionicons name="notifications" size={23} color={palette.lime} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.testTitle}>{testing ? 'ĐANG ĐẶT CHUÔNG...' : 'THỬ CHUÔNG SAU 3 GIÂY'}</Text>
            <Text style={styles.testNote}>Kiểm tra quyền, âm thanh và độ rung trên máy</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={palette.lime} />
        </Pressable>

        <Text style={[styles.section, { color: foreground }]}>DỮ LIỆU CỦA BẠN</Text>
        <Pressable onPress={exportData} style={[styles.action, { backgroundColor: palette.violet }]}>
          <View style={styles.actionIcon}><Ionicons name="share-outline" size={22} color={palette.ink} /></View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Xuất bản sao</Text>
            <Text style={styles.actionNote}>{context?.tasks.length ?? 0} công việc · định dạng JSON</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={palette.white} />
        </Pressable>
        <Pressable onPress={clear} style={[styles.action, { backgroundColor: palette.coral }]}>
          <View style={styles.actionIcon}><Ionicons name="trash-outline" size={22} color={palette.ink} /></View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Xóa dữ liệu</Text>
            <Text style={styles.actionNote}>Không thể hoàn tác</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={palette.ink} />
        </Pressable>

        <View style={styles.about}>
          <Text style={styles.aboutLogo}>TASK{'\n'}FLOW</Text>
          <View>
            <Text style={styles.version}>LOCAL REMINDERS</Text>
            <Text style={styles.aboutText}>
              Chuông phụ thuộc vào quyền thông báo, chế độ im lặng và Focus của điện thoại.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper },
  content: { paddingBottom: 40 },
  header: { minHeight: 280, backgroundColor: palette.ink, padding: 20, paddingTop: 28 },
  avatar: { width: 48, height: 48, borderRadius: 15, backgroundColor: palette.coral, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '7deg' }] },
  avatarText: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  kicker: { color: palette.lime, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 28 },
  title: { color: palette.white, fontSize: 38, lineHeight: 42, fontWeight: '900', letterSpacing: -1.5, marginTop: 8 },
  section: { color: palette.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1.7, marginHorizontal: 16, marginTop: 25, marginBottom: 10 },
  setting: { marginHorizontal: 16, marginBottom: 11, minHeight: 82, borderRadius: 20, borderWidth: 2, borderColor: palette.ink, padding: 14, flexDirection: 'row', alignItems: 'center', ...shadow },
  settingText: { flex: 1 },
  settingTitle: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  settingNote: { color: palette.muted, fontSize: 11, fontWeight: '700', marginTop: 4 },
  lightText: { color: palette.white },
  lightNote: { color: '#BDB8AF' },
  disabled: { opacity: 0.45 },
  testButton: { marginHorizontal: 16, minHeight: 84, borderRadius: 20, backgroundColor: palette.ink, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow },
  testIcon: { width: 45, height: 45, borderRadius: 14, borderWidth: 2, borderColor: palette.lime, alignItems: 'center', justifyContent: 'center' },
  testTitle: { color: palette.white, fontSize: 12, fontWeight: '900', letterSpacing: 0.6 },
  testNote: { color: '#A8A8A8', fontSize: 9, fontWeight: '700', marginTop: 4 },
  action: { marginHorizontal: 16, marginBottom: 11, minHeight: 84, borderRadius: 20, borderWidth: 2, borderColor: palette.ink, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow },
  actionIcon: { width: 45, height: 45, borderRadius: 14, backgroundColor: palette.card, borderWidth: 2, borderColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  actionContent: { flex: 1 },
  actionTitle: { color: palette.ink, fontSize: 16, fontWeight: '900' },
  actionNote: { color: palette.ink, opacity: 0.7, fontSize: 10, fontWeight: '800', marginTop: 4 },
  about: { margin: 16, marginTop: 30, padding: 18, borderRadius: 22, backgroundColor: palette.ink, flexDirection: 'row', alignItems: 'center', gap: 18 },
  aboutLogo: { color: palette.lime, fontSize: 22, lineHeight: 21, fontWeight: '900' },
  version: { color: palette.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  aboutText: { maxWidth: 220, color: palette.white, fontSize: 11, lineHeight: 17, fontWeight: '700', marginTop: 5 },
});
