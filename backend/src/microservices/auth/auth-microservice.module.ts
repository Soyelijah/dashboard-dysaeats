import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMicroserviceController } from './auth-microservice.controller';
import { AuthService } from '../../modules/auth/auth.service';
import { User } from '../../modules/auth/entities/user.entity';
import { UserRepository } from '../../modules/auth/repositories/user.repository';
import { LocalStrategy } from '../../modules/auth/strategies/local.strategy';
import { JwtStrategy } from '../../modules/auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'dysaeats'),
        entities: [User],
        synchronize: configService.get('DB_SYNC', false),
      }),
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'secretKey'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '1d'),
        },
      }),
    }),
  ],
  controllers: [AuthMicroserviceController],
  providers: [
    AuthService,
    UserRepository,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AuthMicroserviceModule {}