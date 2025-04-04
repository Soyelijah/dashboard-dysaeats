import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DEFAULT_LANGUAGE, SupportedLanguages } from '../../config/i18n.config';

/**
 * Extracts language from request headers, query parameters, or cookies
 * Falls back to default language if not found or not supported
 */
export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // Check headers
    const headerLang = request.headers['accept-language'];
    if (headerLang && isValidLanguage(headerLang)) {
      return headerLang;
    }
    
    // Check query params
    const queryLang = request.query.lang;
    if (queryLang && isValidLanguage(queryLang)) {
      return queryLang;
    }
    
    // Check cookies
    const cookieLang = request.cookies?.lang;
    if (cookieLang && isValidLanguage(cookieLang)) {
      return cookieLang;
    }
    
    // Default language
    return DEFAULT_LANGUAGE;
  },
);

/**
 * Validates if the language is supported
 */
function isValidLanguage(lang: string): boolean {
  return Object.values(SupportedLanguages).includes(lang as SupportedLanguages);
}