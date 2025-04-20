import { Module } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
// import { HttpModule } from '@nestjs/axios';
=======
import { HttpModule } from '@nestjs/axios';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
import { ConfigModule } from '@nestjs/config';
import { MapsService } from './services/maps.service';

@Module({
  imports: [
    // Aquí se importarán las entidades relacionadas
    // TypeOrmModule.forFeature([Delivery, DeliveryStatus]),
<<<<<<< HEAD
    // HttpModule,
=======
    HttpModule,
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
    ConfigModule,
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService, MapsService],
  exports: [DeliveriesService, MapsService],
})
export class DeliveriesModule {}