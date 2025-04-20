// Payment types for Event Sourcing system
export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed' | 'voided';
  paymentIntentId?: string;
  chargeId?: string;
  refundId?: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  version: number;
}

// Payment command types
export interface CreatePaymentCommand {
  orderId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface AuthorizePaymentCommand {
  paymentId: string;
  paymentIntentId: string;
}

export interface CapturePaymentCommand {
  paymentId: string;
  chargeId: string;
}

export interface RefundPaymentCommand {
  paymentId: string;
  refundId: string;
  amount?: number; // For partial refunds
}

export interface FailPaymentCommand {
  paymentId: string;
  reason: string;
}

export interface VoidPaymentCommand {
  paymentId: string;
  reason?: string;
}
