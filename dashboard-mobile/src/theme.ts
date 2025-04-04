import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007BFF',
    accent: '#2EC4B6',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceVariant: '#EFF1F5',
    text: '#333333',
    textSecondary: '#757575',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    info: '#17A2B8',
    grey: '#6C757D',
    divider: '#E1E4E8',
    placeholder: '#AAAAAA',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};