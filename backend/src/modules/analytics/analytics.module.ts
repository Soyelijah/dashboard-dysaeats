import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { Order } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menu-item.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Restaurant,
      MenuItem,
      OrderItem,
      User,
    ]),
=======

@Module({
  imports: [
    // Aquí se importarán los módulos necesarios para analíticas
    // TypeOrmModule.forFeature([]),
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}