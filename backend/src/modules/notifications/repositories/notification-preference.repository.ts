import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationPreference } from '../entities/notification-preference.entity';

@Injectable()
export class NotificationPreferenceRepository extends Repository<NotificationPreference> {
  constructor(
    @InjectRepository(NotificationPreference)
    private notificationPreferenceRepository: Repository<NotificationPreference>,
  ) {
    super(notificationPreferenceRepository.target, notificationPreferenceRepository.manager, notificationPreferenceRepository.queryRunner);
  }

  async findByUser(userId: string): Promise<NotificationPreference> {
    return this.findOne({ where: { userId } });
  }

  async createDefaultPreferences(userId: string): Promise<NotificationPreference> {
    const preferences = this.create({
      userId,
      orderCreated: true,
      orderStatusChanged: true,
      orderAssigned: true,
      deliveryStatusChanged: true,
      paymentReceived: true,
      systemAlert: true,
      promotion: true,
      enablePushNotifications: true,
      enableEmailNotifications: true,
      enableInAppNotifications: true,
    });

    return this.save(preferences);
  }

  async getUserPreference(userId: string): Promise<NotificationPreference> {
    let preferences = await this.findByUser(userId);
    
    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }
    
    return preferences;
  }
}