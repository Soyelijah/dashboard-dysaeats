import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DEFAULT_LANGUAGE, SupportedLanguages } from '../../config/i18n.config';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Primero, intentamos obtener el idioma de la cabecera Accept-Language
    let language = req.headers['accept-language'] as string;
    
    // Si no tenemos idioma en la cabecera, buscamos en los query params
    if (!language || !this.isValidLanguage(language)) {
      language = req.query.lang as string;
    }
    
    // Si aún no tenemos idioma, buscamos en las cookies
    if (!language || !this.isValidLanguage(language)) {
      language = req.cookies?.lang;
    }
    
    // Si no tenemos idioma válido, usamos el predeterminado
    if (!language || !this.isValidLanguage(language)) {
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
  
  private isValidLanguage(lang: string): boolean {
    return Object.values(SupportedLanguages).includes(lang as SupportedLanguages);
  }
}