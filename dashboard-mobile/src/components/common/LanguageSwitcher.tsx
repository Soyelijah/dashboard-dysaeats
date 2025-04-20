import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import i18n, { changeLanguage, getCurrentLocale } from '../../lib/i18n';

interface LanguageSwitcherProps {
  style?: object;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
  const currentLocale = getCurrentLocale();
  
  const toggleLanguage = () => {
    const newLocale = currentLocale === 'es' ? 'en' : 'es';
    changeLanguage(newLocale);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: currentLocale === 'en' ? '#3b82f6' : '#e5e7eb' }
        ]}
        onPress={() => changeLanguage('en')}
      >
        <Text
          style={[
            styles.buttonText,
            { color: currentLocale === 'en' ? '#ffffff' : '#374151' }
          ]}
        >
          English
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: currentLocale === 'es' ? '#3b82f6' : '#e5e7eb' }
        ]}
        onPress={() => changeLanguage('es')}
      >
        <Text
          style={[
            styles.buttonText,
            { color: currentLocale === 'es' ? '#ffffff' : '#374151' }
          ]}
        >
          Español
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LanguageSwitcher;