import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../modules/auth/auth.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { RestaurantsModule } from '../modules/restaurants/restaurants.module';
import { PaymentsModule } from '../modules/payments/payments.module';
import { DeliveriesModule } from '../modules/deliveries/deliveries.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_SERVICE_HOST', 'localhost'),
            port: configService.get('AUTH_SERVICE_PORT', 3001),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'RESTAURANT_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('RESTAURANT_SERVICE_HOST', 'localhost'),
            port: configService.get('RESTAURANT_SERVICE_PORT', 3002),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'ORDER_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('ORDER_SERVICE_HOST', 'localhost'),
            port: configService.get('ORDER_SERVICE_PORT', 3003),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'PAYMENT_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('PAYMENT_SERVICE_HOST', 'localhost'),
            port: configService.get('PAYMENT_SERVICE_PORT', 3004),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'DELIVERY_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('DELIVERY_SERVICE_HOST', 'localhost'),
            port: configService.get('DELIVERY_SERVICE_PORT', 3005),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('NOTIFICATION_SERVICE_HOST', 'localhost'),
            port: configService.get('NOTIFICATION_SERVICE_PORT', 3006),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'ANALYTICS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('ANALYTICS_SERVICE_HOST', 'localhost'),
            port: configService.get('ANALYTICS_SERVICE_PORT', 3007),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    // Import modules to be exposed through the API Gateway
    AuthModule,
    OrdersModule,
    RestaurantsModule,
    PaymentsModule,
    DeliveriesModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}