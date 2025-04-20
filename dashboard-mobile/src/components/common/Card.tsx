import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { shadows } from '@/theme/styles';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  contentStyle,
}) => {
  const { colors, isDark } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.card,
      backgroundColor: colors.surface,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.medium,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.disabled,
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});

export default Card;