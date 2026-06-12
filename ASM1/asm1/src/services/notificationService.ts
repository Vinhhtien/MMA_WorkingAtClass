import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '@/src/types/Task';

const CHANNEL_ID = 'task-reminders';
const SILENT_CHANNEL_ID = 'task-reminders-silent';
const REMINDER_MAP_KEY = '@taskflow/reminder-map-v1';
const REMINDER_PREFERENCES_KEY = '@taskflow/reminder-preferences-v1';

export interface ReminderPreferences {
  enabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: ReminderPreferences = {
  enabled: true,
  soundEnabled: true,
};

interface ReminderEntry {
  notificationId: string;
  fingerprint: string;
}

type ReminderMap = Record<string, ReminderEntry>;

let syncQueue: Promise<void> = Promise.resolve();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getFingerprint = (task: Task, soundEnabled: boolean) =>
  `${task.title}|${task.dueDate ?? ''}|${task.completed}|${soundEnabled}`;

const readReminderMap = async (): Promise<ReminderMap> => {
  try {
    const value = await AsyncStorage.getItem(REMINDER_MAP_KEY);
    return value ? JSON.parse(value) as ReminderMap : {};
  } catch {
    return {};
  }
};

export const getReminderPreferences = async (): Promise<ReminderPreferences> => {
  try {
    const value = await AsyncStorage.getItem(REMINDER_PREFERENCES_KEY);
    return value
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(value) as Partial<ReminderPreferences> }
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const ensureNotificationPermission = async () => {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Nhắc việc TaskFlow',
      description: 'Chuông báo khi công việc đến thời gian thực hiện',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 400, 200, 400, 200, 700],
      lightColor: '#C8FF3D',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
    await Notifications.setNotificationChannelAsync(SILENT_CHANNEL_ID, {
      name: 'Nhắc việc không âm thanh',
      description: 'Thông báo công việc chỉ rung, không phát chuông',
      importance: Notifications.AndroidImportance.HIGH,
      sound: null,
      vibrationPattern: [0, 300, 150, 300],
      lightColor: '#C8FF3D',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return requested.granted;
};

const cancelReminder = async (notificationId?: string) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // The operating system may already have delivered or removed this notification.
  }
};

const scheduleReminder = async (task: Task, soundEnabled: boolean) => {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Đến giờ làm việc',
      body: task.title,
      sound: soundEnabled ? 'default' : undefined,
      color: '#C8FF3D',
      data: {
        taskId: task.id,
        url: `/task-detail/${task.id}`,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(task.dueDate as number),
      channelId: soundEnabled ? CHANNEL_ID : SILENT_CHANNEL_ID,
    },
  });
};

const performSync = async (tasks: Task[]) => {
  if (Platform.OS === 'web') return;

  const preferences = await getReminderPreferences();
  if (!preferences.enabled) {
    const existingMap = await readReminderMap();
    await Promise.all(Object.values(existingMap).map((entry) => cancelReminder(entry.notificationId)));
    await AsyncStorage.setItem(REMINDER_MAP_KEY, JSON.stringify({}));
    return;
  }

  const hasFutureReminder = tasks.some(
    (task) => !task.completed && task.dueDate && task.dueDate > Date.now() + 1000,
  );
  if (!hasFutureReminder) {
    const existingMap = await readReminderMap();
    await Promise.all(Object.values(existingMap).map((entry) => cancelReminder(entry.notificationId)));
    await AsyncStorage.setItem(REMINDER_MAP_KEY, JSON.stringify({}));
    return;
  }

  const permitted = await ensureNotificationPermission();
  if (!permitted) return;

  const reminderMap = await readReminderMap();
  const nextMap: ReminderMap = {};

  for (const task of tasks) {
    const existing = reminderMap[task.id];
    const eligible = !task.completed && Boolean(task.dueDate && task.dueDate > Date.now() + 1000);
    const fingerprint = getFingerprint(task, preferences.soundEnabled);

    if (!eligible) {
      await cancelReminder(existing?.notificationId);
      continue;
    }

    if (existing?.fingerprint === fingerprint) {
      nextMap[task.id] = existing;
      continue;
    }

    await cancelReminder(existing?.notificationId);
    const notificationId = await scheduleReminder(task, preferences.soundEnabled);
    nextMap[task.id] = { notificationId, fingerprint };
  }

  for (const [taskId, entry] of Object.entries(reminderMap)) {
    if (!nextMap[taskId]) {
      await cancelReminder(entry.notificationId);
    }
  }

  await AsyncStorage.setItem(REMINDER_MAP_KEY, JSON.stringify(nextMap));
};

export const syncTaskReminders = (tasks: Task[]) => {
  syncQueue = syncQueue
    .catch(() => undefined)
    .then(() => performSync(tasks))
    .catch((error) => {
      console.warn('Không thể đồng bộ lịch nhắc việc:', error);
    });

  return syncQueue;
};

export const updateReminderPreferences = async (
  updates: Partial<ReminderPreferences>,
  tasks: Task[],
) => {
  const current = await getReminderPreferences();
  const next = { ...current, ...updates };
  await AsyncStorage.setItem(REMINDER_PREFERENCES_KEY, JSON.stringify(next));
  await syncTaskReminders(tasks);
  return next;
};

export const scheduleTestReminder = async () => {
  if (Platform.OS === 'web') return false;

  const preferences = await getReminderPreferences();
  if (!preferences.enabled) return false;

  const permitted = await ensureNotificationPermission();
  if (!permitted) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Chuông thử TaskFlow',
      body: 'Thông báo nhắc việc và âm thanh đang hoạt động.',
      sound: preferences.soundEnabled ? 'default' : undefined,
      color: '#C8FF3D',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: preferences.soundEnabled ? CHANNEL_ID : SILENT_CHANNEL_ID,
    },
  });
  return true;
};
