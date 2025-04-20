import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AuthMicroserviceModule } from './auth-microservice.module';

async function bootstrap() {
  const logger = new Logger('Auth Microservice');
  
  const app = await NestFactory.createMicroservice(AuthMicroserviceModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_SERVICE_HOST || 'localhost',
<<<<<<< HEAD
      port: parseInt(process.env.AUTH_SERVICE_PORT || '3002', 10),
=======
      port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    },
  });

  await app.listen();
  
<<<<<<< HEAD
  logger.log(`Auth Microservice is running on ${process.env.AUTH_SERVICE_HOST || 'localhost'}:${process.env.AUTH_SERVICE_PORT || '3002'}`);
=======
  logger.log(`Auth Microservice is running on ${process.env.AUTH_SERVICE_HOST || 'localhost'}:${process.env.AUTH_SERVICE_PORT || '3001'}`);
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
}

bootstrap();