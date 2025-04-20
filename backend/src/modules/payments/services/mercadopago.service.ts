import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as MercadoPago from 'mercadopago';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../../orders/enums/payment-status.enum';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { User } from '../../auth/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { PaymentRepository } from '../repositories/payment.repository';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private client: any;
  private payment: any;
  private preference: any;

  constructor(
    private configService: ConfigService,
    private paymentRepository: PaymentRepository,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {
    this.initMercadoPago();
  }

  private initMercadoPago() {
    const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      this.logger.warn('MercadoPago access token no configurado');
      return;
    }

    try {
      // Usar solo la configuración del nuevo SDK
      this.client = new MercadoPago.MercadoPagoConfig({
        accessToken: accessToken,
      });
      this.payment = new MercadoPago.Payment(this.client);
      this.preference = new MercadoPago.Preference(this.client);
      
      this.logger.log('MercadoPago inicializado correctamente');
    } catch (error) {
      this.logger.error('Error inicializando MercadoPago:', error);
      throw error;
    }
  }

  async createPaymentPreference(order: Order): Promise<any> {
    try {
      if (!this.client) {
        this.logger.error('MercadoPago no está inicializado');
        throw new Error('MercadoPago no está inicializado');
      }

      // Obtener información del restaurante
      const restaurant = await this.restaurantRepository.findOneBy({ id: order.restaurant.id });
      if (!restaurant) {
        throw new Error(`Restaurante con ID ${order.restaurant.id} no encontrado`);
      }

      // Obtener información del cliente
      const customer = await this.userRepository.findOneBy({ id: order.customer.id });
      if (!customer) {
        throw new Error(`Cliente con ID ${order.customer.id} no encontrado`);
      }

      // Crear ítems para la preferencia
      const items = order.items.map(item => ({
        id: item.id,
        title: item.name, // Usado name directamente en vez de menuItem
        description: item.description || 'Sin descripción',
        category_id: 'food',
        quantity: item.quantity,
        currency_id: 'CLP',
        unit_price: parseFloat(item.price.toString()),
      }));

      // Agregar costos adicionales como ítems
      if (order.deliveryFee > 0) {
        items.push({
          id: 'delivery_fee',
          title: 'Costo de entrega',
          description: 'Costo por servicio de entrega',
          category_id: 'services',
          quantity: 1,
          currency_id: 'CLP',
          unit_price: parseFloat(order.deliveryFee.toString()),
        });
      }

      if (order.tax > 0) {
        items.push({
          id: 'tax',
          title: 'Impuestos',
          description: 'Impuestos aplicables',
          category_id: 'services',
          quantity: 1,
          currency_id: 'CLP',
          unit_price: parseFloat(order.tax.toString()),
        });
      }

      const preference = {
        items,
        payer: {
          name: customer.firstName,
          surname: customer.lastName,
          email: customer.email,
          phone: {
            area_code: '',
            number: customer.phoneNumber || '', // Cambiado de phone a phoneNumber
          },
          identification: {
            type: 'RUT',
            number: customer.rut || '',
          },
        },
        external_reference: order.id,
        notification_url: `${this.configService.get<string>('API_URL')}/payments/webhook/mercadopago`,
        back_urls: {
          success: `${this.configService.get<string>('FRONTEND_URL')}/orders/${order.id}/success`,
          failure: `${this.configService.get<string>('FRONTEND_URL')}/orders/${order.id}/failure`,
          pending: `${this.configService.get<string>('FRONTEND_URL')}/orders/${order.id}/pending`,
        },
        auto_return: 'approved',
        statement_descriptor: restaurant.name,
        metadata: {
          order_id: order.id,
          customer_id: customer.id,
          restaurant_id: restaurant.id,
        },
      };

      const response = await this.preference.create({ body: preference });

      // Guardar información de la preferencia
      const payment = new Payment();
      payment.order = order;
      payment.method = PaymentMethod.MERCADO_PAGO;
      payment.status = PaymentStatus.PENDING;
      payment.amount = parseFloat(order.total.toString());
      payment.currency = 'CLP';
      payment.externalReference = response.id;
      payment.metadata = {
        preferenceId: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
      };

      await this.paymentRepository.save(payment);

      return {
        preferenceId: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Error creando preferencia de pago en MercadoPago:', error);
      throw error;
    }
  }

  // Método para compatibility con payments.service.ts
  async createPreference(preferenceData: any): Promise<any> {
    try {
      if (!this.preference) {
        this.logger.error('MercadoPago no está inicializado');
        throw new Error('MercadoPago no está inicializado');
      }

      const preference = {
        items: preferenceData.items,
        payer: preferenceData.payer,
        back_urls: preferenceData.backUrls,
        auto_return: 'approved',
        external_reference: preferenceData.externalReference,
        notification_url: preferenceData.notificationUrl,
      };

      const response = await this.preference.create({ body: preference });
      return response;
    } catch (error) {
      this.logger.error('Error creando preferencia de pago:', error);
      throw error;
    }
  }

  async processPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const { orderId, paymentData } = createPaymentDto;

      // Buscar la orden
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['payments'],
      });

      if (!order) {
        throw new Error(`Orden con ID ${orderId} no encontrada`);
      }

      // Verificar si ya hay un pago existente para esta orden
      const existingPayment = order.payments?.find(
        p => p.method === PaymentMethod.MERCADO_PAGO && p.status === PaymentStatus.COMPLETED,
      );

      if (existingPayment) {
        return existingPayment;
      }

      // Validar datos de pago
      if (!paymentData || !paymentData.id) {
        throw new Error('Datos de pago inválidos');
      }

      // Verificar el estado del pago en MercadoPago
      const paymentInfo = await this.payment.get({ id: paymentData.id });

      // Crear registro de pago
      const payment = new Payment();
      payment.order = order;
      payment.method = PaymentMethod.MERCADO_PAGO;
      payment.externalId = paymentData.id;
      payment.amount = parseFloat(order.total.toString());
      payment.currency = 'CLP';
      payment.metadata = paymentInfo;

      // Actualizar estado según respuesta de MercadoPago
      switch (paymentInfo.status) {
        case 'approved':
          payment.status = PaymentStatus.COMPLETED;
          order.paymentStatus = PaymentStatus.COMPLETED;
          break;
        case 'pending':
        case 'in_process':
          payment.status = PaymentStatus.PENDING;
          order.paymentStatus = PaymentStatus.PENDING;
          break;
        case 'rejected':
          payment.status = PaymentStatus.FAILED;
          order.paymentStatus = PaymentStatus.FAILED;
          break;
        default:
          payment.status = PaymentStatus.PENDING;
          order.paymentStatus = PaymentStatus.PENDING;
      }

      // Guardar el pago y actualizar la orden
      await this.paymentRepository.save(payment);
      await this.orderRepository.save(order);

      return payment;
    } catch (error) {
      this.logger.error('Error procesando pago:', error);
      throw error;
    }
  }

  async processWebhook(topic: string, id: string): Promise<any> {
    try {
      let paymentInfo;
      
      if (topic === 'payment') {
        paymentInfo = await this.payment.get({ id });
      } else if (topic === 'merchant_order') {
        // Implementar lógica para merchant_order si es necesario
        return { message: 'Merchant order webhook no implementado aún' };
      } else {
        throw new Error(`Tipo de notificación no soportada: ${topic}`);
      }
      
      return paymentInfo;
    } catch (error) {
      this.logger.error(`Error procesando webhook ${topic}/${id}:`, error);
      throw error;
    }
  }

  async handleWebhook(body: any): Promise<any> {
    try {
      this.logger.debug('Webhook recibido de MercadoPago:', body);

      // Verificar tipo de notificación
      if (body.type !== 'payment') {
        this.logger.log(`Tipo de notificación no manejada: ${body.type}`);
        return { message: 'Webhook recibido pero no procesado' };
      }

      // Obtener información del pago
      const paymentId = body.data.id;
      const paymentInfo = await this.payment.get({ id: paymentId });

      this.logger.debug('Información del pago:', paymentInfo);

      // Buscar orden por referencia externa
      const orderId = paymentInfo.external_reference;
      if (!orderId) {
        throw new Error('ID de orden no encontrado en la referencia externa');
      }

      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['payments'],
      });

      if (!order) {
        throw new Error(`Orden con ID ${orderId} no encontrada`);
      }

      // Verificar si ya existe un pago procesado
      const existingPayment = order.payments?.find(
        p => p.externalId === paymentId.toString(),
      );

      let payment: Payment;

      if (existingPayment) {
        // Actualizar pago existente
        payment = existingPayment;
        payment.metadata = paymentInfo;
      } else {
        // Crear nuevo registro de pago
        payment = new Payment();
        payment.order = order;
        payment.method = PaymentMethod.MERCADO_PAGO;
        payment.externalId = paymentId.toString();
        payment.amount = parseFloat(order.total.toString());
        payment.currency = 'CLP';
        payment.metadata = paymentInfo;
      }

      // Actualizar estado según respuesta de MercadoPago
      switch (paymentInfo.status) {
        case 'approved':
          payment.status = PaymentStatus.COMPLETED;
          order.paymentStatus = PaymentStatus.COMPLETED;
          break;
        case 'pending':
        case 'in_process':
          payment.status = PaymentStatus.PENDING;
          order.paymentStatus = PaymentStatus.PENDING;
          break;
        case 'rejected':
          payment.status = PaymentStatus.FAILED;
          order.paymentStatus = PaymentStatus.FAILED;
          break;
        default:
          payment.status = PaymentStatus.PENDING;
          order.paymentStatus = PaymentStatus.PENDING;
      }

      // Guardar el pago y actualizar la orden
      await this.paymentRepository.save(payment);
      await this.orderRepository.save(order);

      return { success: true, message: 'Webhook procesado correctamente' };
    } catch (error) {
      this.logger.error('Error procesando webhook de MercadoPago:', error);
      throw error;
    }
  }

  async getPaymentInfo(paymentId: string): Promise<any> {
    try {
      const paymentInfo = await this.payment.get({ id: paymentId });
      return paymentInfo;
    } catch (error) {
      this.logger.error(`Error obteniendo información del pago ${paymentId}:`, error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      if (amount) {
        // Reembolso parcial
        const response = await this.payment.refund({
          payment_id: paymentId,
          amount: amount
        });
        return response;
      } else {
        // Reembolso total
        const response = await this.payment.refund({
          payment_id: paymentId
        });
        return response;
      }
    } catch (error) {
      this.logger.error(`Error reembolsando pago ${paymentId}:`, error);
      throw error;
    }
  }
}