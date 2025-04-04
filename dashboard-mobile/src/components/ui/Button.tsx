import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  containerStyle,
  textStyle,
}) => {
  const { colors, isDark } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return isDark ? '#3E3E3E' : '#CCCCCC';

    switch (type) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return isDark ? '#8E8E8E' : '#888888';

    switch (type) {
      case 'outline':
        return colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (disabled) return isDark ? '#3E3E3E' : '#CCCCCC';

    switch (type) {
      case 'outline':
        return colors.primary;
      default:
        return 'transparent';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 12,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonSize(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: type === 'outline' ? 1 : 0,
        },
        containerStyle,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: getTextSize() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
});

export default Button;
