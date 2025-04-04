import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors as newLightColors, darkColors as newDarkColors } from '@/theme';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    disabled: string;
    placeholder: string;
    backdrop: string;
    notification: string;
    success: string;
    warning: string;
    info: string;
  };
}

const lightColors = newLightColors;
const darkColors = newDarkColors;

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [colors, setColors] = useState(colorScheme === 'dark' ? darkColors : lightColors);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) {
          setThemeState(storedTheme as Theme);
        }
      } catch (error) {
        console.error('Failed to load theme', error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const isDarkMode =
      theme === 'system' ? colorScheme === 'dark' : theme === 'dark';
    setColors(isDarkMode ? darkColors : lightColors);
  }, [theme, colorScheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  const isDark = theme === 'system' ? colorScheme === 'dark' : theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
