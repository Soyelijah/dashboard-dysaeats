import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from '@/translations/en.json';
import es from '@/translations/es.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

const getLanguageFromStorage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem('language');
    return storedLanguage || null;
  } catch (error) {
    console.error('Failed to get language from storage', error);
    return null;
  }
};

// Get device language
const getDeviceLanguage = () => {
  const locales = getLocales();
  return locales[0]?.languageCode || 'en';
};

const setupI18n = async () => {
  // Get language from storage or use device language as fallback
  const storedLanguage = await getLanguageFromStorage();
  const deviceLanguage = getDeviceLanguage();
  const initialLanguage = storedLanguage || deviceLanguage;

  // Initialize i18next
  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
};

// Change language function
export const changeLanguage = async (lng: string) => {
  try {
    await AsyncStorage.setItem('language', lng);
    await i18n.changeLanguage(lng);
  } catch (error) {
    console.error('Failed to change language', error);
  }
};

export default setupI18n;
