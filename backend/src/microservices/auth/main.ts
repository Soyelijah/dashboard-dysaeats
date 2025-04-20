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
      port: parseInt(process.env.AUTH_SERVICE_PORT || '3002', 10),
    },
  });

  await app.listen();
  
  logger.log(`Auth Microservice is running on ${process.env.AUTH_SERVICE_HOST || 'localhost'}:${process.env.AUTH_SERVICE_PORT || '3002'}`);
}

bootstrap();