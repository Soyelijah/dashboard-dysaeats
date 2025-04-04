import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro para manejar todas las excepciones en la aplicación
 * Centraliza el formato de las respuestas de error
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let details = null;
    let code = 'INTERNAL_SERVER_ERROR';
    
    // Manejar excepciones HTTP
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Extraer mensaje y detalles de la excepción
      if (typeof exceptionResponse === 'object') {
        const exceptionObj = exceptionResponse as any;
        message = exceptionObj.message || message;
        details = exceptionObj.details || null;
        code = exceptionObj.code || this.getErrorCodeFromStatus(status);
      } else {
        message = exceptionResponse as string;
        code = this.getErrorCodeFromStatus(status);
      }
    } else if (exception instanceof Error) {
      // Manejar excepciones de Error estándar
      message = exception.message;
      details = exception.stack;
    }
    
    // Registrar el error
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception instanceof Error ? exception.stack : '',
    );
    
    // Respuesta estructurada
    response.status(status).json({
      statusCode: status,
      message,
      code,
      details: process.env.NODE_ENV === 'production' ? null : details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
  
  /**
   * Obtener un código de error a partir del código de estado HTTP
   */
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return `HTTP_ERROR_${status}`;
    }
  }
}