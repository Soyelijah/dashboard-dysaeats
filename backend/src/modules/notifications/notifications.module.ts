import { Module, forwardRef } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { WebsocketsModule } from '../../websockets/websockets.module';
import { PushNotificationService } from './services/push-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationPreference,
    ]),
    forwardRef(() => WebsocketsModule),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    NotificationPreferenceRepository,
    PushNotificationService,
  ],
  exports: [NotificationsService, PushNotificationService],
})
export class NotificationsModule {}