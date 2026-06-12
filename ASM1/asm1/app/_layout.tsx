import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { TaskProvider } from '@/src/context/TaskContext';
import { AppThemeProvider, useAppTheme } from '@/src/context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

const openTaskFromNotification = (notification: Notifications.Notification) => {
  const taskId = notification.request.content.data?.taskId;
  if (typeof taskId !== 'string') return;

  router.push({
    pathname: '/task-detail/[taskId]',
    params: { taskId },
  });
};

function RootNavigator() {
  const { isDark } = useAppTheme();

  useEffect(() => {
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      openTaskFromNotification(lastResponse.notification);
      Notifications.clearLastNotificationResponse();
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openTaskFromNotification(response.notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <TaskProvider>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="task-detail/[taskId]" 
            options={{ 
              headerShown: false,
              presentation: 'card',
            }} 
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </TaskProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootNavigator />
    </AppThemeProvider>
  );
}
