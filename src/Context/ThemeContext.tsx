import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  /* Kalıcı temayı oku */
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') setThemeState(stored);
      } catch {}
      setIsReady(true);
    })();
  }, []);

  const setTheme = useCallback(async (mode: ThemeMode) => {
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
