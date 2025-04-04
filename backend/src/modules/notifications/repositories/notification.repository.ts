import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationQueryDto } from '../dto/notification-query.dto';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {
    super(notificationRepository.target, notificationRepository.manager, notificationRepository.queryRunner);
  }

  async findByQuery(query: NotificationQueryDto) {
    const queryBuilder = this.createQueryBuilder('notification');

    if (query.userId) {
      queryBuilder.andWhere('notification.userId = :userId', { userId: query.userId });
    }

    if (query.type) {
      queryBuilder.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.read !== undefined) {
      queryBuilder.andWhere('notification.read = :read', { read: query.read });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(notification.title LIKE :search OR notification.content LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.startDate) {
      queryBuilder.andWhere('notification.createdAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('notification.createdAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }

    queryBuilder.orderBy('notification.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findUnreadCountByUser(userId: string): Promise<number> {
    return this.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}