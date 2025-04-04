import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoService } from './services/mercadopago.service';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async findAll(query: any) {
    // Implementar lógica de búsqueda con filtros
    const payments = await this.paymentsRepository.find({
      take: query.limit || 10,
      skip: query.offset || 0,
      order: { createdAt: 'DESC' },
    });
    
    const total = await this.paymentsRepository.count();
    
    return { 
      data: payments,
      total,
      limit: query.limit || 10,
      offset: query.offset || 0
    };
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['order']
    });
    
    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    
    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    return this.mercadoPagoService.processPayment(createPaymentDto);
  }

  async processPayment(paymentData: any) {
    try {
      // Si se proporciona un ID de orden, intentar crear una preferencia para esa orden
      if (paymentData.orderId) {
        const order = await this.ordersRepository.findOne({
          where: { id: paymentData.orderId },
          relations: ['items', 'customer', 'restaurant'],
        });
        
        if (order) {
          return await this.mercadoPagoService.createPaymentPreference(order);
        }
      }
      
      // Si no hay orden o no se encontró, crear una preferencia genérica
      const items = [
        {
          title: paymentData.description || 'Pedido en DysaEats',
          quantity: 1,
          unit_price: paymentData.amount,
          description: `Orden #${paymentData.orderId || 'N/A'}`,
          currency_id: 'CLP',
        },
      ];

      // Crear datos para la preferencia
      const preferenceData = {
        items,
        payer: {
          name: paymentData.payer?.name || '',
          email: paymentData.payer?.email || '',
          phone: paymentData.payer?.phone || {},
          identification: paymentData.payer?.identification || {},
          address: paymentData.payer?.address || {},
        },
        externalReference: paymentData.orderId || String(Date.now()),
        backUrls: paymentData.backUrls || undefined,
        notificationUrl: paymentData.notificationUrl || undefined,
      };

      // Crear preferencia en MercadoPago
      const preference = await this.mercadoPagoService.createPreference(preferenceData);
      
      this.logger.log(`Preferencia de pago creada: ${preference.id}`);
      
      return {
        message: 'Preferencia de pago creada correctamente',
        preferenceId: preference.id,
        initPoint: preference.init_point,
        checkoutUrl: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        externalReference: preference.external_reference,
      };
    } catch (error) {
      this.logger.error('Error procesando pago:', error);
      throw error;
    }
  }

  async verifyPayment(verificationData: any) {
    try {
      // Obtener información del pago desde MercadoPago
      const paymentInfo = await this.mercadoPagoService.getPaymentInfo(
        verificationData.paymentId
      );
      
      const isApproved = paymentInfo.status === 'approved';
      
      this.logger.log(`Verificación de pago ${verificationData.paymentId}: ${isApproved ? 'Aprobado' : 'No aprobado'}`);
      
      return {
        message: isApproved ? 'Pago verificado y aprobado' : 'Pago verificado pero no aprobado',
        verified: true,
        approved: isApproved,
        paymentId: paymentInfo.id,
        status: paymentInfo.status,
        statusDetail: paymentInfo.status_detail,
        externalReference: paymentInfo.external_reference,
        paymentInfo,
      };
    } catch (error) {
      this.logger.error('Error verificando pago:', error);
      return {
        message: 'Error al verificar el pago',
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Procesa una notificación de webhook de MercadoPago
   */
  async processWebhook(topic: string, id: string) {
    try {
      const webhookData = await this.mercadoPagoService.processWebhook(topic, id);
      this.logger.log(`Webhook procesado: ${topic}/${id}`);
      
      // Si el webhook es de un pago, actualizar el estado de la orden
      if (topic === 'payment' && webhookData.external_reference) {
        const orderId = webhookData.external_reference;
        
        // Aquí podrías llamar a un servicio de órdenes para actualizar el estado
        this.logger.log(`Actualización de orden ${orderId} pendiente`);
      }
      
      return {
        message: 'Webhook procesado correctamente',
        topic,
        id,
        data: webhookData,
      };
    } catch (error) {
      this.logger.error(`Error procesando webhook ${topic}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Reembolsa un pago
   */
  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundResult = await this.mercadoPagoService.refundPayment(paymentId, amount);
      this.logger.log(`Reembolso procesado para pago ${paymentId}`);
      
      return {
        message: 'Reembolso procesado correctamente',
        paymentId,
        refundId: refundResult.id,
        amount: refundResult.amount,
        status: refundResult.status,
      };
    } catch (error) {
      this.logger.error(`Error reembolsando pago ${paymentId}:`, error);
      throw error;
    }
  }

  async getUserPaymentMethods(userId: string) {
    // Obtener métodos de pago de un usuario
    return { 
      message: `Métodos de pago del usuario ${userId}`,
      methods: [
        { id: '1', type: 'credit_card', lastFour: '4242', expiryDate: '12/25' },
        { id: '2', type: 'paypal', email: 'usuario@example.com' },
      ]
    };
  }

  async addUserPaymentMethod(userId: string, paymentMethodDto: any) {
    // Agregar método de pago a un usuario
    return { 
      message: `Método de pago agregado al usuario ${userId}`,
      data: paymentMethodDto 
    };
  }

  async removeUserPaymentMethod(userId: string, methodId: string) {
    // Eliminar método de pago de un usuario
    return { 
      message: `Método de pago ${methodId} eliminado del usuario ${userId}`
    };
  }
}