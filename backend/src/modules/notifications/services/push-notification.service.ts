import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { NotificationPreferenceRepository } from '../repositories/notification-preference.repository';
import { NotificationType } from '../enums/notification-type.enum';

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private configService: ConfigService,
    private readonly notificationPreferenceRepository: NotificationPreferenceRepository,
  ) {
    // Set VAPID keys for web push
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    
    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        'mailto:' + this.configService.get<string>('ADMIN_EMAIL', 'admin@dysaeats.com'),
        publicKey,
        privateKey
      );
    } else {
      this.logger.warn('VAPID keys not set. Push notifications will not work.');
    }
  }

  /**
   * Send push notification to a user
   */
  async sendPushNotification(
    userId: string,
    notificationType: NotificationType,
    payload: PushNotificationPayload,
  ): Promise<boolean> {
    try {
      // Get user preferences
      const preferences = await this.notificationPreferenceRepository.getUserPreference(userId);
      
      // Check if user has enabled push notifications
      if (!preferences.enablePushNotifications) {
        return false;
      }
      
      // Check if user has subscription data
      if (!preferences.pushSubscription) {
        return false;
      }
      
      // Check if specific notification type is enabled
      if (!this.isNotificationTypeEnabled(preferences, notificationType)) {
        return false;
      }
      
      // Send push notification
      const subscription = JSON.parse(preferences.pushSubscription);
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          ...payload,
          // Add additional data for service worker
          notificationType,
          timestamp: new Date().toISOString(),
        })
      );
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${userId}:`, error);
      
      // Handle invalid subscription error
      if (error.statusCode === 410) {
        // Subscription is no longer valid, remove it from user preferences
        this.removeInvalidSubscription(userId);
      }
      
      return false;
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendPushNotificationToUsers(
    userIds: string[],
    notificationType: NotificationType,
    payload: PushNotificationPayload,
  ): Promise<number> {
    const results = await Promise.all(
      userIds.map(userId => this.sendPushNotification(userId, notificationType, payload))
    );
    
    // Return the number of successful notifications
    return results.filter(success => success).length;
  }

  /**
   * Remove invalid subscription
   */
  private async removeInvalidSubscription(userId: string): Promise<void> {
    try {
      const preferences = await this.notificationPreferenceRepository.findByUser(userId);
      if (preferences) {
        preferences.pushSubscription = null;
        await this.notificationPreferenceRepository.save(preferences);
      }
    } catch (error) {
      this.logger.error(`Failed to remove invalid subscription for user ${userId}:`, error);
    }
  }

  /**
   * Check if notification type is enabled in user preferences
   */
  private isNotificationTypeEnabled(
    preferences: any,
    type: NotificationType,
  ): boolean {
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
}