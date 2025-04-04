import { StyleSheet } from 'react-native';
import { lightColors, darkColors } from './index';

// Proporciona estilos comunes para toda la aplicación
export const createStyles = (isDark: boolean) => {
  const colors = isDark ? darkColors : lightColors;
  
  return StyleSheet.create({
    // Contenedores
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    // Espaciado
    padding: {
      padding: 16,
    },
    paddingHorizontal: {
      paddingHorizontal: 16,
    },
    paddingVertical: {
      paddingVertical: 16,
    },
    margin: {
      margin: 16,
    },
    marginHorizontal: {
      marginHorizontal: 16,
    },
    marginVertical: {
      marginVertical: 16,
    },
    
    // Tipografía
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    body: {
      fontSize: 16,
      color: colors.text,
    },
    caption: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    
    // Botones
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 16,
    },
    
    // Inputs
    input: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.disabled,
      padding: 12,
      color: colors.text,
      fontSize: 16,
    },
    
    // Divisores
    divider: {
      height: 1,
      backgroundColor: colors.disabled,
      marginVertical: 16,
    },
    
    // Layouts
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spaceBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });
};

// Constantes de espaciado
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Bordes redondeados
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Sombras
export const shadows = {
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
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};