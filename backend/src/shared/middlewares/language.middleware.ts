import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
<<<<<<< HEAD

// Definir los idiomas soportados directamente aquí para evitar problemas si i18n está desactivado
enum SupportedLanguages {
  EN = 'en',
  ES = 'es',
}
const DEFAULT_LANGUAGE = SupportedLanguages.ES;

// Función de validación de idioma fuera de la clase para evitar problemas con 'this'
function isValidLanguage(lang: string): boolean {
  return Object.values(SupportedLanguages).includes(lang as SupportedLanguages);
}

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use = (req: Request, res: Response, next: NextFunction) => {
=======
import { DEFAULT_LANGUAGE, SupportedLanguages } from '../../config/i18n.config';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    // Primero, intentamos obtener el idioma de la cabecera Accept-Language
    let language = req.headers['accept-language'] as string;
    
    // Si no tenemos idioma en la cabecera, buscamos en los query params
<<<<<<< HEAD
    if (!language || !isValidLanguage(language)) {
=======
    if (!language || !this.isValidLanguage(language)) {
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
      language = req.query.lang as string;
    }
    
    // Si aún no tenemos idioma, buscamos en las cookies
<<<<<<< HEAD
    if (!language || !isValidLanguage(language)) {
=======
    if (!language || !this.isValidLanguage(language)) {
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
      language = req.cookies?.lang;
    }
    
    // Si no tenemos idioma válido, usamos el predeterminado
<<<<<<< HEAD
    if (!language || !isValidLanguage(language)) {
=======
    if (!language || !this.isValidLanguage(language)) {
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
      language = DEFAULT_LANGUAGE;
    }
    
    // Guardar el idioma en el objeto Request para acceso posterior
    req['lang'] = language;
    
    // También establecer una cookie con el idioma seleccionado
    res.cookie('lang', language, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      httpOnly: false, // Permitir que se acceda desde JS en el cliente
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
    
    next();
  }
<<<<<<< HEAD
=======
  
  private isValidLanguage(lang: string): boolean {
    return Object.values(SupportedLanguages).includes(lang as SupportedLanguages);
  }
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
}