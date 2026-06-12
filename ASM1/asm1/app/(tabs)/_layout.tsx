import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const { isDark } = useAppTheme();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#C8FF3D',
      tabBarInactiveTintColor: '#8B8B8B',
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarStyle: { height: 76, paddingTop: 9, paddingBottom: 11, borderTopWidth: isDark ? 1 : 0, borderTopColor: '#3B3B3B', backgroundColor: isDark ? '#050505' : '#171717' },
      tabBarLabelStyle: { fontSize: 9, fontWeight: '900' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Công việc', tabBarIcon: ({ color }) => <IconSymbol size={26} name="checkmark.circle.fill" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Lịch', tabBarIcon: ({ color }) => <IconSymbol size={25} name="calendar" color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Tìm kiếm', tabBarIcon: ({ color }) => <IconSymbol size={26} name="magnifyingglass" color={color} /> }} />
      <Tabs.Screen name="statistics" options={{ title: 'Thống kê', tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.bar.fill" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Cài đặt', tabBarIcon: ({ color }) => <IconSymbol size={26} name="gear" color={color} /> }} />
    </Tabs>
  );
}
