import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, darkTheme } from './index';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeType: ThemeType;
  theme: typeof theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeType: 'system',
  theme,
  isDarkMode: false,
  toggleTheme: () => {},
  setThemeType: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_PREFERENCE_KEY = '@theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');
  
  // Determine if dark mode is active based on theme type and device theme
  const isDarkMode = 
    themeType === 'dark' || (themeType === 'system' && deviceTheme === 'dark');
  
  // Set the actual theme based on dark mode status
  const currentTheme = isDarkMode ? darkTheme : theme;

  // Load the saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedTheme) {
          setThemeType(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Save the theme preference when it changes
  const saveThemePreference = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newThemeType = isDarkMode ? 'light' : 'dark';
    setThemeType(newThemeType);
    saveThemePreference(newThemeType);
  };

  // Set a specific theme type
  const handleSetThemeType = (type: ThemeType) => {
    setThemeType(type);
    saveThemePreference(type);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeType,
        theme: currentTheme,
        isDarkMode,
        toggleTheme,
        setThemeType: handleSetThemeType,
      }}
    >
      <PaperProvider theme={currentTheme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;