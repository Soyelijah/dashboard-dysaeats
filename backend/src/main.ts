import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<<<<<<< HEAD
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { i18nValidationErrorFactory } from 'nestjs-i18n';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import helmet from 'helmet';
import compression from 'compression';
import { LanguageMiddleware } from './shared/middlewares/language.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import rateLimit from 'express-rate-limit';
// import * as responseTime from 'response-time';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
=======
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { i18nValidationErrorFactory } from 'nestjs-i18n';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import helmet from 'helmet';
import * as compression from 'compression';
import { LanguageMiddleware } from './shared/middlewares/language.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import rateLimit from 'express-rate-limit';
import * as responseTime from 'response-time';
import { NestExpressApplication } from '@nestjs/platform-express';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f

async function bootstrap() {
  // Crear la aplicación NestJS con tipo específico para Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    // Habilitar el buffer de logs para optimizar el manejo de errores
    bufferLogs: true,
  });
  
<<<<<<< HEAD
  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  // Logger
  const logger = new Logger('Bootstrap');
  
  // Obtener la configuración
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const isDevelopment = configService.get<string>('nodeEnv') === 'development';
  
<<<<<<< HEAD
  // Prefijo global para todas las rutas (excepto la raíz y rutas especiales)
  app.setGlobalPrefix('api', { 
    exclude: [
      '/', 
      '/dashboard', 
      '/dashboard/(.*)', 
      { path: 'dashboard/*', method: RequestMethod.ALL },
      '/health'  // Excluir la ruta de health check
    ] 
  });
  
  // Crear controlador específico para la ruta raíz
  app.getHttpAdapter().getInstance().get('/', (req, res) => {
    return res.status(200).json({
      name: 'DysaEats API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/docs',
      admin: '/dashboard',
      timestamp: new Date().toISOString()
    });
  });
  
  // Agregar endpoint de health directamente en Express (sin autenticación)
  app.getHttpAdapter().getInstance().get('/health', (req, res) => {
    return res.status(200).json({
      status: 'ok',
      service: 'dysaeats-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
  
  // Ruta de redirección para admin
  app.getHttpAdapter().getInstance().get('/admin', (req, res) => {
    return res.sendFile(join(__dirname, '..', 'public/admin/index.html'));
  });
=======
  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  
  // Middlewares
  app.use(cookieParser());
  
<<<<<<< HEAD
  // Helmet con configuración optimizada para permitir AdminJS
  app.use(helmet({
    contentSecurityPolicy: false, // Desactivado para AdminJS
    crossOriginEmbedderPolicy: false, // Permitir carga de recursos de AdminJS
=======
  // Helmet con configuración optimizada
  app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
    crossOriginEmbedderPolicy: !isDevelopment,
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }));
  
  // Configuración avanzada de compresión
  app.use(compression({
    threshold: 0, // Comprimir todas las respuestas
    level: 6, // Nivel de compresión (0-9, mayor = más compresión pero más CPU)
  }));
  
<<<<<<< HEAD
  // Middleware de monitoreo de tiempo de respuesta (desactivado temporalmente)
  // app.use(responseTime((req, res, time) => {
  //   if (time > 1000) { // Loguear respuestas lentas (más de 1 segundo)
  //     logger.warn(`Respuesta lenta: ${req.method} ${req.url} - ${time.toFixed(2)}ms`);
  //   }
  // }));
  
  // Limitar velocidad de solicitudes (desactivado temporalmente)
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutos
  //     max: isDevelopment ? 0 : 100, // Límite de solicitudes (desactivado en desarrollo)
  //     standardHeaders: true,
  //     legacyHeaders: false,
  //     message: 'Demasiadas solicitudes, intente de nuevo más tarde',
  //   }),
  // );
=======
  // Añadir middleware de monitoreo de tiempo de respuesta
  app.use(responseTime((req, res, time) => {
    if (time > 1000) { // Loguear respuestas lentas (más de 1 segundo)
      logger.warn(`Respuesta lenta: ${req.method} ${req.url} - ${time.toFixed(2)}ms`);
    }
  }));
  
  // Limitar velocidad de solicitudes para prevenir ataques de fuerza bruta
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: isDevelopment ? 0 : 100, // Límite de solicitudes (desactivado en desarrollo)
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Demasiadas solicitudes, intente de nuevo más tarde',
    }),
  );
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  
  app.use(new LanguageMiddleware().use); // Middleware de idioma
  
  // Habilitar confianza de proxy si está detrás de un balanceador de carga
  if (configService.get<boolean>('trustProxy')) {
    app.set('trust proxy', 1);
  }
  
  // Validación global de DTOs con soporte para i18n
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: i18nValidationErrorFactory,
    }),
  );
  
  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());
  
<<<<<<< HEAD
  // CORS mejorado para permitir conexiones entre contenedores Docker
  app.enableCors({
    origin: true, // Permitir todas las conexiones en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    maxAge: 86400, // Almacenar en caché los resultados de preflight durante 24 horas
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Disposition'],
=======
  // CORS - Configurado con opciones más específicas
  app.enableCors({
    origin: [
      configService.get<string>('dashboardWebUrl'),
      configService.get<string>('dashboardMobileUrl'),
      // Otras URLs permitidas
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    maxAge: 86400, // Almacenar en caché los resultados de preflight durante 24 horas
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  });
  
  // Configurar Swagger para documentación API (solo en desarrollo)
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('DysaEats API')
      .setDescription('API para el ecosistema DysaEats')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    logger.log('Swagger habilitado: http://localhost:' + port + '/api/docs');
  }
  
  // Iniciar servidor
  await app.listen(port);
  
  // Mensajes de inicio
  logger.log(`Aplicación corriendo en: http://localhost:${port}`);
  logger.log(`API disponible en: http://localhost:${port}/api`);
  
  // GraphQL playground solo en desarrollo
  if (isDevelopment) {
    logger.log(`GraphQL Playground: http://localhost:${port}/graphql`);
    logger.warn('Aplicación corriendo en modo DESARROLLO');
  }
}

bootstrap().catch(err => {
  console.error('Error durante el inicio de la aplicación:', err);
  process.exit(1);
});