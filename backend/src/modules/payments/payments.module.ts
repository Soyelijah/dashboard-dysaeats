import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoService } from './services/mercadopago.service';
<<<<<<< HEAD
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { AuthModule } from '../auth/auth.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [
    // Importamos las entidades necesarias
    TypeOrmModule.forFeature([Payment, Order]),
    // Importamos los módulos que contienen los repositorios que necesitamos
    AuthModule, // Para acceder a UserRepository
    RestaurantsModule, // Para acceder a RestaurantRepository
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService, PaymentRepository],
  exports: [PaymentsService, MercadoPagoService, PaymentRepository, TypeOrmModule],
=======

@Module({
  imports: [
    // Aquí se importarán las entidades relacionadas
    // TypeOrmModule.forFeature([Payment, PaymentMethod]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService],
  exports: [PaymentsService, MercadoPagoService],
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
})
export class PaymentsModule {}