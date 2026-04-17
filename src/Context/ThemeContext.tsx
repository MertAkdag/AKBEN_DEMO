import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { ThemeMode, ThemeColors, DarkTheme, LightTheme } from '../Constants/Theme';

/* ─── Context tipi ─── */
interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = '@akben_theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  isDark: true,
  colors: DarkTheme,
  toggleTheme: () => {},
  setTheme: () => {},
});

/* ─── Provider ─── */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isReady, setIsReady] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);

  /* Kalıcı temayı oku */
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setThemeState(stored);
          setIsManualOverride(true);
        } else {
          const systemScheme = Appearance.getColorScheme();
          setThemeState(systemScheme === 'light' ? 'light' : 'dark');
        }
      } catch {}
      setIsReady(true);
    })();
  }, []);

  /* Manuel seçim yoksa sistem temasını canlı takip et */
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (isManualOverride) return;
      setThemeState(colorScheme === 'light' ? 'light' : 'dark');
    });

    return () => subscription.remove();
  }, [isManualOverride]);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setIsManualOverride(true);
    setThemeState(mode);
    try { await AsyncStorage.setItem(STORAGE_KEY, mode); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    isDark: theme === 'dark',
    colors: theme === 'dark' ? DarkTheme : LightTheme,
    toggleTheme,
    setTheme,
  }), [theme, toggleTheme, setTheme]);

  /* AsyncStorage okunana kadar bekle */
  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/* ─── Hook ─── */
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
