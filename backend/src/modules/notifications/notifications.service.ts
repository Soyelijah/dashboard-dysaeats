import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationsGateway } from '../../websockets/gateways/notifications.gateway';
import { PushNotificationService } from './services/push-notification.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationRepository)
    private notificationRepository: NotificationRepository,
    @InjectRepository(NotificationPreferenceRepository)
    private notificationPreferenceRepository: NotificationPreferenceRepository,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
    private pushNotificationService: PushNotificationService,
  ) {}

  async findAll(query: NotificationQueryDto): Promise<Notification[]> {
    return this.notificationRepository.findByQuery(query);
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return notification;
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification | Notification[]> {
    if (createNotificationDto.userId) {
      // Single user notification
      const notification = this.notificationRepository.create({
        ...createNotificationDto,
        userId: createNotificationDto.userId,
      });
      return this.notificationRepository.save(notification);
    } else if (createNotificationDto.userIds && createNotificationDto.userIds.length > 0) {
      // Multiple users notification
      const notifications = createNotificationDto.userIds.map(userId =>
        this.notificationRepository.create({
          ...createNotificationDto,
          userId,
        }),
      );
      return this.notificationRepository.save(notifications);
    } else {
      throw new BadRequestException('Either userId or userIds must be provided');
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.read = true;
    const updatedNotification = await this.notificationRepository.save(notification);
    
    // Notify via WebSocket about status change
    this.notificationsGateway.notifyNotificationStatusChange(
      notification.userId, 
      notification.id, 
      true
    );
    
    return updatedNotification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );
    
    // Notify via WebSocket
    const socket = this.notificationsGateway.server;
    socket.to(`user_notifications_${userId}`).emit('allNotificationsRead');
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserPreferences(userId: string): Promise<NotificationPreference> {
    return this.notificationPreferenceRepository.getUserPreference(userId);
  }

  async updateUserPreferences(
    userId: string,
    preferencesDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    let preferences = await this.notificationPreferenceRepository.findByUser(userId);
    
    if (!preferences) {
      preferences = await this.notificationPreferenceRepository.createDefaultPreferences(userId);
    }
    
    Object.assign(preferences, preferencesDto);
    return this.notificationPreferenceRepository.save(preferences);
  }

  async sendNotification(notificationData: CreateNotificationDto): Promise<Notification | Notification[]> {
    const result = await this.create(notificationData);
    
    // Send real-time notification via WebSocket
    if (notificationData.userId) {
      // Single user notification
      await this.notificationsGateway.sendNotificationToUser(
        notificationData.userId,
        notificationData
      );
      
      // Send push notification if applicable
      await this.sendPushNotification(
        notificationData.userId,
        notificationData.type as NotificationType,
        notificationData
      );
    } else if (notificationData.userIds && notificationData.userIds.length > 0) {
      // Multiple users notification
      await this.notificationsGateway.sendNotificationToUsers(
        notificationData.userIds,
        notificationData
      );
      
      // Send push notifications if applicable
      await this.sendPushNotificationToUsers(
        notificationData.userIds,
        notificationData.type as NotificationType,
        notificationData
      );
    }
    
    return result;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.findUnreadCountByUser(userId);
  }

  async shouldSendNotification(userId: string, type: NotificationType): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    
    // Check user's general notification settings
    if (!preferences.enableInAppNotifications) {
      return false;
    }
    
    // Check specific notification type preference
    switch (type) {
      case NotificationType.ORDER_CREATED:
        return preferences.orderCreated;
      case NotificationType.ORDER_STATUS_CHANGED:
        return preferences.orderStatusChanged;
      case NotificationType.ORDER_ASSIGNED:
        return preferences.orderAssigned;
      case NotificationType.DELIVERY_STATUS_CHANGED:
        return preferences.deliveryStatusChanged;
      case NotificationType.PAYMENT_RECEIVED:
        return preferences.paymentReceived;
      case NotificationType.SYSTEM_ALERT:
        return preferences.systemAlert;
      case NotificationType.PROMOTION:
        return preferences.promotion;
      default:
        return true;
    }
  }

  /**
   * Send push notification to a user
   */
  private async sendPushNotification(
    userId: string,
    type: NotificationType,
    notification: CreateNotificationDto,
  ): Promise<boolean> {
    return this.pushNotificationService.sendPushNotification(
      userId,
      type,
      {
        title: notification.title,
        body: notification.content,
        data: notification.data || {},
        icon: '/images/logo.png', // Default notification icon
      },
    );
  }

  /**
   * Send push notification to multiple users
   */
  private async sendPushNotificationToUsers(
    userIds: string[],
    type: NotificationType,
    notification: CreateNotificationDto,
  ): Promise<number> {
    return this.pushNotificationService.sendPushNotificationToUsers(
      userIds,
      type,
      {
        title: notification.title,
        body: notification.content,
        data: notification.data || {},
        icon: '/images/logo.png', // Default notification icon
      },
    );
  }
}