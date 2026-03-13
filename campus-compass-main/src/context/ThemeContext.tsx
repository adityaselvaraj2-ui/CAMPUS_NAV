import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ThemeContextValue {
  theme: 'dark' | 'light';
  accentColor: string;
  toggleTheme: () => void;
  setAccent: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  accentColor: '#00D2FF',
  toggleTheme: () => {},
  setAccent: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('campus_theme') as 'dark' | 'light') ?? 'dark';
  });

  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('campus_accent') ?? '#00D2FF';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('campus_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-user', accentColor);
    localStorage.setItem('campus_accent', accentColor);
  }, [accentColor]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setAccent = useCallback((color: string) => {
    setAccentColor(color);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};
