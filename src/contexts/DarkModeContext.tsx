import React, { useCallback, useLayoutEffect, useState } from 'react';
import { DarkModeContext } from './darkModeContextValue';

const STORAGE_KEY = 'darkMode';
const THEME_TRANSITION_MS = 650;

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'true') return true;
  if (saved === 'false') return false;

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDarkMode: boolean) => {
  const root = document.documentElement;
  root.classList.toggle('dark', isDarkMode);
  root.style.colorScheme = isDarkMode ? 'dark' : 'light';
};

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useLayoutEffect(() => {
    applyTheme(isDarkMode);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev: boolean) => {
      const next = !prev;
      const root = document.documentElement;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion) {
        root.classList.add('theme-transitioning');
        root.dataset.themeTransition = next ? 'to-dark' : 'to-light';

        window.setTimeout(() => {
          root.classList.remove('theme-transitioning');
          delete root.dataset.themeTransition;
        }, THEME_TRANSITION_MS);
      }

      return next;
    });
  }, []);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};