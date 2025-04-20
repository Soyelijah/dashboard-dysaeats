import { I18nOptions } from 'nestjs-i18n';
import * as path from 'path';

export const i18nConfig: I18nOptions = {
  fallbackLanguage: 'es',
  loaderOptions: {
    path: path.join(__dirname, '../shared/i18n/'),
    watch: true,
  },
};

// Supported languages
export enum SupportedLanguages {
  EN = 'en',
  ES = 'es',
}

export const DEFAULT_LANGUAGE = SupportedLanguages.ES;