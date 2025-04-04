import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { getLocales } from 'react-native-localize';
import { enUS, es, fr, pt } from 'date-fns/locale';

/**
 * Mapa de idiomas soportados
 */
const localesMap: { [key: string]: Locale } = {
  en: enUS,
  es,
  fr,
  pt,
};

/**
 * Obtiene el locale de acuerdo al idioma del dispositivo
 */
const getLocale = (): Locale => {
  const languageTag = getLocales()[0]?.languageTag || 'en-US';
  const lang = languageTag.split('-')[0]; // ej: 'es' de 'es-CL'
  return localesMap[lang] || enUS;
};

/**
 * Formatea una fecha a un formato legible, usando el idioma del dispositivo
 */
export const formatDate = (dateString: string, formatString?: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatString || 'PPp', { locale: getLocale() });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formatea una fecha a tiempo relativo (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = parseISO(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};
