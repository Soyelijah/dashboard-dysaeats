import { DefaultTheme, DarkTheme } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export const lightColors = {
  primary: '#1E90FF',
  primaryLight: '#55B3FF',
  primaryDark: '#0076CE',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  error: '#EF4444',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  disabled: '#9CA3AF',
  placeholder: '#9CA3AF',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const darkColors = {
  primary: '#55B3FF',
  primaryLight: '#84C2FF',
  primaryDark: '#1E90FF',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#EF4444',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  disabled: '#6B7280',
  placeholder: '#6B7280',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...lightColors,
  },
  roundness: 8,
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...darkColors,
  },
  roundness: 8,
};