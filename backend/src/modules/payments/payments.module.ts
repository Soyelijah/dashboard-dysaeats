import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoService } from './services/mercadopago.service';

@Module({
  imports: [
    // Aquí se importarán las entidades relacionadas
    // TypeOrmModule.forFeature([Payment, PaymentMethod]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService],
  exports: [PaymentsService, MercadoPagoService],
})
export class PaymentsModule {}