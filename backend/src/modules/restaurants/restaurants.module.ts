import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from '../auth/repositories/user.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
    AuthModule,
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, RestaurantRepository],
  exports: [RestaurantsService, RestaurantRepository, TypeOrmModule],
})
export class RestaurantsModule {}