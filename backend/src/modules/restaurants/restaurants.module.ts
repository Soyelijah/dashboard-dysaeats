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
<<<<<<< HEAD
  exports: [RestaurantsService, RestaurantRepository, TypeOrmModule],
=======
  exports: [RestaurantsService, RestaurantRepository],
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
})
export class RestaurantsModule {}