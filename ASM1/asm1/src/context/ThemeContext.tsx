import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = '@taskflow/theme-v1';

interface ThemeContextValue {
  isDark: boolean;
  setDarkMode: (enabled: boolean) => void;
  background: string;
  foreground: string;
  card: string;
  elevated: string;
  muted: string;
  border: string;
  input: string;
  shadow: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => setIsDark(value === 'dark'))
      .catch(() => undefined);
  }, []);

  const setDarkMode = (enabled: boolean) => {
    setIsDark(enabled);
    AsyncStorage.setItem(THEME_STORAGE_KEY, enabled ? 'dark' : 'light').catch(() => undefined);
  };

  const value = useMemo(() => ({
    isDark,
    setDarkMode,
    background: isDark ? '#0D0D0D' : '#F4F0E8',
    foreground: isDark ? '#F4F0E8' : '#171717',
    card: isDark ? '#1A1A1A' : '#FFFDF8',
    elevated: isDark ? '#252525' : '#E9E3D9',
    muted: isDark ? '#AAA49A' : '#746F66',
    border: isDark ? '#F4F0E8' : '#171717',
    input: isDark ? '#121212' : '#F4F0E8',
    shadow: isDark ? '#000000' : '#171717',
  }), [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return context;
};
