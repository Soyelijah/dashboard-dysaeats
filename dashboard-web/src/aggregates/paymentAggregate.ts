import { Payment } from '../types/payment';
import {
  PaymentCreatedEvent,
  PaymentAuthorizedEvent,
  PaymentCapturedEvent,
  PaymentRefundedEvent,
  PaymentFailedEvent,
  PaymentVoidedEvent
} from '../events/paymentEvents';

export class PaymentAggregate {
  private id: string;
  private orderId: string;
  private userId: string;
  private amount: number;
  private currency: string;
  private paymentMethod: string;
  private status: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed' | 'voided';
  private paymentIntentId?: string;
  private chargeId?: string;
  private refundId?: string;
  private metadata?: Record<string, any>;
  private failureReason?: string;
  private version: number;

  constructor() {
    this.id = '';
    this.orderId = '';
    this.userId = '';
    this.amount = 0;
    this.currency = 'CLP';
    this.paymentMethod = '';
    this.status = 'pending';
    this.version = 0;
  }

  public applyEvent(event: any): void {
    if (event.type === 'PaymentCreatedEvent') {
      this.applyPaymentCreatedEvent(event);
    } else if (event.type === 'PaymentAuthorizedEvent') {
      this.applyPaymentAuthorizedEvent(event);
    } else if (event.type === 'PaymentCapturedEvent') {
      this.applyPaymentCapturedEvent(event);
    } else if (event.type === 'PaymentRefundedEvent') {
      this.applyPaymentRefundedEvent(event);
    } else if (event.type === 'PaymentFailedEvent') {
      this.applyPaymentFailedEvent(event);
    } else if (event.type === 'PaymentVoidedEvent') {
      this.applyPaymentVoidedEvent(event);
    }
    this.version++;
  }

  private applyPaymentCreatedEvent(event: PaymentCreatedEvent): void {
    this.id = event.data.id;
    this.orderId = event.data.orderId;
    this.userId = event.data.userId;
    this.amount = event.data.amount;
    this.currency = event.data.currency || 'CLP';
    this.paymentMethod = event.data.paymentMethod;
    this.status = 'pending';
    this.metadata = event.data.metadata;
  }

  private applyPaymentAuthorizedEvent(event: PaymentAuthorizedEvent): void {
    this.status = 'authorized';
    this.paymentIntentId = event.data.paymentIntentId;
  }

  private applyPaymentCapturedEvent(event: PaymentCapturedEvent): void {
    this.status = 'captured';
    this.chargeId = event.data.chargeId;
  }

  private applyPaymentRefundedEvent(event: PaymentRefundedEvent): void {
    this.status = 'refunded';
    this.refundId = event.data.refundId;
  }

  private applyPaymentFailedEvent(event: PaymentFailedEvent): void {
    this.status = 'failed';
    this.failureReason = event.data.reason;
  }

  private applyPaymentVoidedEvent(event: PaymentVoidedEvent): void {
    this.status = 'voided';
  }

  public getState(): Payment {
    return {
      id: this.id,
      orderId: this.orderId,
      userId: this.userId,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      status: this.status,
      paymentIntentId: this.paymentIntentId,
      chargeId: this.chargeId,
      refundId: this.refundId,
      metadata: this.metadata,
      failureReason: this.failureReason,
      version: this.version
    };
  }
}
