<<<<<<< HEAD
// Dictionaries for internationalization
import enDict from '../dictionaries/en.json';
import esDict from '../dictionaries/es.json';

const dictionaries = {
  en: enDict,
  es: esDict
};

type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: string) => {
  // Check if the locale exists in our dictionaries
  if (locale in dictionaries) {
    return dictionaries[locale as Locale];
  }
  
  // Return Spanish (default) if locale not found
  return dictionaries.es;
=======
import 'server-only';

const dictionaries = {
  en: () => import('../dictionaries/en.json').then(module => module.default),
  es: () => import('../dictionaries/es.json').then(module => module.default)
};

export const getDictionary = async (locale: string) => {
  return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.es();
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
};