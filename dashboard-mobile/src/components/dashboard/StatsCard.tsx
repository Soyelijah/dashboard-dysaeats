import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@/contexts/ThemeContext';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  backgroundColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  backgroundColor,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.card,
          shadowColor: isDark ? 'transparent' : '#000',
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: backgroundColor || colors.primary },
        ]}
      >
        <Icon name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.text + 'AA' }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StatsCard;
