// Payment Event Types
export interface BaseEvent {
  type: string;
  aggregateId: string;
  version: number;
  timestamp: number;
  data: any;
}

export interface PaymentCreatedEvent extends BaseEvent {
  type: 'PaymentCreatedEvent';
  data: {
    id: string;
    orderId: string;
    userId: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
    metadata?: Record<string, any>;
  };
}

export interface PaymentAuthorizedEvent extends BaseEvent {
  type: 'PaymentAuthorizedEvent';
  data: {
    paymentIntentId: string;
  };
}

export interface PaymentCapturedEvent extends BaseEvent {
  type: 'PaymentCapturedEvent';
  data: {
    chargeId: string;
  };
}

export interface PaymentRefundedEvent extends BaseEvent {
  type: 'PaymentRefundedEvent';
  data: {
    refundId: string;
    amount?: number; // Partial refund amount if applicable
  };
}

export interface PaymentFailedEvent extends BaseEvent {
  type: 'PaymentFailedEvent';
  data: {
    reason: string;
  };
}

export interface PaymentVoidedEvent extends BaseEvent {
  type: 'PaymentVoidedEvent';
  data: {
    reason?: string;
  };
}

// Factory functions to create payment events
export function createPaymentCreatedEvent(
  aggregateId: string,
  version: number,
  data: PaymentCreatedEvent['data']
): PaymentCreatedEvent {
  return {
    type: 'PaymentCreatedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createPaymentAuthorizedEvent(
  aggregateId: string,
  version: number,
  data: PaymentAuthorizedEvent['data']
): PaymentAuthorizedEvent {
  return {
    type: 'PaymentAuthorizedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createPaymentCapturedEvent(
  aggregateId: string,
  version: number,
  data: PaymentCapturedEvent['data']
): PaymentCapturedEvent {
  return {
    type: 'PaymentCapturedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createPaymentRefundedEvent(
  aggregateId: string,
  version: number,
  data: PaymentRefundedEvent['data']
): PaymentRefundedEvent {
  return {
    type: 'PaymentRefundedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createPaymentFailedEvent(
  aggregateId: string,
  version: number,
  data: PaymentFailedEvent['data']
): PaymentFailedEvent {
  return {
    type: 'PaymentFailedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createPaymentVoidedEvent(
  aggregateId: string,
  version: number,
  data: PaymentVoidedEvent['data']
): PaymentVoidedEvent {
  return {
    type: 'PaymentVoidedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}
