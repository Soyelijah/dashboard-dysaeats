import { Module } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MapsService } from './services/maps.service';

@Module({
  imports: [
    // Aquí se importarán las entidades relacionadas
    // TypeOrmModule.forFeature([Delivery, DeliveryStatus]),
    // HttpModule,
    ConfigModule,
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService, MapsService],
  exports: [DeliveriesService, MapsService],
})
export class DeliveriesModule {}