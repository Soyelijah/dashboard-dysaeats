import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...restProps
}) => {
  const { colors, isDark } = useTheme();
  
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {
      ...styles.button,
      ...sizeStyles[size],
    };

    if (fullWidth) {
      buttonStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: colors.primary,
        };
        break;
      case 'secondary':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: colors.primaryLight,
        };
        break;
      case 'outline':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
        break;
      case 'text':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        };
        break;
    }

    return { ...buttonStyle, ...style };
  };

  const getTextStyle = () => {
    let style: TextStyle = {
      ...styles.text,
      ...textSizeStyles[size],
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        style = {
          ...style,
          color: '#FFFFFF',
        };
        break;
      case 'outline':
      case 'text':
        style = {
          ...style,
          color: colors.primary,
        };
        break;
    }

    return { ...style, ...textStyle };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.primary}
        />
      );
    }

    const textComponent = <Text style={getTextStyle()}>{title}</Text>;

    if (!icon) {
      return textComponent;
    }

    return (
      <>
        {iconPosition === 'left' && icon}
        {textComponent}
        {iconPosition === 'right' && icon}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      disabled={loading || restProps.disabled}
      activeOpacity={0.7}
      {...restProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

const sizeStyles = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
};

const textSizeStyles = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
};

export default Button;