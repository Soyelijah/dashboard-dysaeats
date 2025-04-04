import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  Headers, 
  Req,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  create(@Body() createPaymentDto: any) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post('process')
  processPayment(@Body() paymentData: any) {
    return this.paymentsService.processPayment(paymentData);
  }

  @Post('verify')
  verifyPayment(@Body() verificationData: any) {
    return this.paymentsService.verifyPayment(verificationData);
  }

  @Get('user/:userId/methods')
  getUserPaymentMethods(@Param('userId') userId: string) {
    return this.paymentsService.getUserPaymentMethods(userId);
  }

  @Post('user/:userId/methods')
  addUserPaymentMethod(@Param('userId') userId: string, @Body() paymentMethodDto: any) {
    return this.paymentsService.addUserPaymentMethod(userId, paymentMethodDto);
  }

  @Delete('user/:userId/methods/:methodId')
  removeUserPaymentMethod(@Param('userId') userId: string, @Param('methodId') methodId: string) {
    return this.paymentsService.removeUserPaymentMethod(userId, methodId);
  }

  @Post('webhook')
  async webhook(@Headers() headers: any, @Body() body: any, @Query() query: any) {
    this.logger.log('Webhook received from MercadoPago');
    
    try {
      // Mercado Pago envía la información en query params o en el body dependiendo de la configuración
      const topic = query.topic || body.topic || body.type;
      const id = query.id || body.id || body.data?.id;
      
      if (!topic || !id) {
        this.logger.warn('Invalid webhook payload', { headers, body, query });
        return { message: 'Invalid webhook payload' };
      }
      
      this.logger.log(`Processing webhook: ${topic}/${id}`);
      return this.paymentsService.processWebhook(topic, id);
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      return { error: error.message };
    }
  }

  @Post(':id/refund')
  async refundPayment(@Param('id') id: string, @Body() refundData: { amount?: number }) {
    return this.paymentsService.refundPayment(id, refundData.amount);
  }

  @Get('config')
  getMercadoPagoConfig() {
    // Esta ruta proporciona la configuración pública de Mercado Pago para el frontend
    return {
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
      environment: process.env.MERCADOPAGO_ENVIRONMENT,
    };
  }
}