'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    // Clear any legacy theme preference and strictly enforce Dark Mode site-wide
    localStorage.removeItem('ebookvala_theme');
    document.documentElement.classList.add('dark');
  }, []);

  const setTheme = () => {
    document.documentElement.classList.add('dark');
  };

  const toggleTheme = () => {
    document.documentElement.classList.add('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
