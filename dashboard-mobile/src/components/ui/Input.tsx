import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry = false,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType,
  autoCapitalize = 'sentences',
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={error ? colors.error : colors.text}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              height: multiline ? 100 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.text + '80'} // 50% opacity
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={toggleShowPassword} style={styles.rightIcon}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Icon name={rightIcon} size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
