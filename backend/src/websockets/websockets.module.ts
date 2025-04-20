import { Module, forwardRef } from '@nestjs/common';
import { OrdersGateway } from './gateways/orders.gateway';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { DeliveriesGateway } from './gateways/deliveries.gateway';
import { RestaurantsGateway } from './gateways/restaurants.gateway';
import { ChatGateway } from './gateways/chat.gateway';
import { AnalyticsGateway } from './gateways/analytics.gateway';
import { WebsocketEventsService } from './services/websocket-events.service';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { AuthModule } from '../modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '1d'),
        },
      }),
    }),
  ],
  providers: [
    OrdersGateway,
    NotificationsGateway,
    DeliveriesGateway,
    RestaurantsGateway,
    ChatGateway,
    AnalyticsGateway,
    WebsocketEventsService,
  ],
  exports: [
    OrdersGateway,
    NotificationsGateway,
    DeliveriesGateway,
    RestaurantsGateway,
    ChatGateway,
    AnalyticsGateway,
    WebsocketEventsService,
  ],
})
export class WebsocketsModule {}