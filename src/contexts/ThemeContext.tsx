"use client";

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';
import { createBrowserPreference } from '@/lib/browserPreference';

type Theme = 'light' | 'dark';

const themePreference = createBrowserPreference(
  'agri_theme',
  'light',
  (value): value is Theme => value === 'light' || value === 'dark',
  () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
);

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore(
    themePreference.subscribe,
    themePreference.getSnapshot,
    themePreference.getServerSnapshot
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    // Add transition class for smooth animation
    document.documentElement.classList.add('theme-transitioning');
    themePreference.set(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 350);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
