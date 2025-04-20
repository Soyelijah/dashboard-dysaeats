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
};