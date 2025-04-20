import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menu-item.entity';
import { MenuCategory } from '../restaurants/entities/menu-category.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { AdminDashboardController } from './admin-dashboard.controller';

// Nota: Hemos eliminado la integración directa con AdminJS para mayor estabilidad

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Restaurant,
      MenuItem,
      MenuCategory,
      Order,
      OrderItem,
      Payment
    ]),
  ],
  controllers: [AdminDashboardController],
})
export class AdminDashboardModule {}