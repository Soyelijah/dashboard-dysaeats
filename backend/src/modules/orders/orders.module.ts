import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderRepository } from './repositories/order.repository';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from '../auth/repositories/user.repository';
import { RestaurantRepository } from '../restaurants/repositories/restaurant.repository';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    AuthModule,
    RestaurantsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository],
  exports: [OrdersService],
})
export class OrdersModule {}