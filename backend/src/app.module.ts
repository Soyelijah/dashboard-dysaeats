import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { I18nModule } from 'nestjs-i18n';
import { join } from 'path';

// Configuración i18n
import { i18nConfig } from './config/i18n.config';

// Módulo compartido
import { SharedModule } from './shared/shared.module';

// Módulos de la aplicación
import { AuthModule } from './modules/auth/auth.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WebsocketsModule } from './websockets/websockets.module';

// Guardias y filtros globales
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

// Configuración
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: false, // Las tablas ya existen
        logging: configService.get('nodeEnv') !== 'production',
      }),
    }),
    
    // GraphQL con Apollo 4 (Deshabilitado temporalmente)
    /*GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      subscriptions: {
        'graphql-ws': true,
      },
      context: ({ req, res }) => ({ req, res }),
    }),*/
    
    // Programación de tareas
    ScheduleModule.forRoot(),
    
    // Event Emitter para eventos
    EventEmitterModule.forRoot(),
    
    // Módulo i18n para internacionalización
    I18nModule.forRoot(i18nConfig),
    
    // Módulo compartido
    SharedModule,
    
    // Módulos de la aplicación
    AuthModule,
    RestaurantsModule,
    OrdersModule,
    PaymentsModule,
    DeliveriesModule,
    NotificationsModule,
    AnalyticsModule,
    WebsocketsModule,
  ],
  controllers: [],
  providers: [
    // Guardias globales
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Filtros de excepción globales
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}