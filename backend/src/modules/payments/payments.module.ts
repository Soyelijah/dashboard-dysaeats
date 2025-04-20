import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoService } from './services/mercadopago.service';
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
})
export class PaymentsModule {}