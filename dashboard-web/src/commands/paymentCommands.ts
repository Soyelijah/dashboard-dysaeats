import { v4 as uuidv4 } from 'uuid';
import { PaymentAggregate } from '../aggregates/paymentAggregate';
import {
  createPaymentCreatedEvent,
  createPaymentAuthorizedEvent,
  createPaymentCapturedEvent,
  createPaymentRefundedEvent,
  createPaymentFailedEvent,
  createPaymentVoidedEvent
} from '../events/paymentEvents';

export async function createPayment(
  eventStore: any,
  orderId: string,
  userId: string,
  amount: number,
  paymentMethod: string,
  currency: string = 'CLP',
  metadata?: Record<string, any>
) {
  const paymentId = uuidv4();
  const paymentAggregate = new PaymentAggregate();
  
  const event = createPaymentCreatedEvent(
    paymentId,
    0, // Initial version
    {
      id: paymentId,
      orderId,
      userId,
      amount,
      currency,
      paymentMethod,
      metadata
    }
  );

  paymentAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: paymentId,
    aggregate_type: 'payment',
    version: 0,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return paymentAggregate.getState();
}

export async function authorizePayment(
  eventStore: any,
  paymentId: string,
  paymentIntentId: string
) {
  // Get all events for this payment from the event store
  const events = await eventStore.getEventsForAggregate('payment', paymentId);
  
  // Reconstruct the current state of the payment
  const paymentAggregate = new PaymentAggregate();
  events.forEach((event: any) => {
    paymentAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the authorization event
  const event = createPaymentAuthorizedEvent(
    paymentId,
    events.length, // Next version
    {
      paymentIntentId
    }
  );

  paymentAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: paymentId,
    aggregate_type: 'payment',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return paymentAggregate.getState();
}

export async function capturePayment(
  eventStore: any,
  paymentId: string,
  chargeId: string
) {
  // Get all events for this payment from the event store
  const events = await eventStore.getEventsForAggregate('payment', paymentId);
  
  // Reconstruct the current state of the payment
  const paymentAggregate = new PaymentAggregate();
  events.forEach((event: any) => {
    paymentAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the capture event
  const event = createPaymentCapturedEvent(
    paymentId,
    events.length, // Next version
    {
      chargeId
    }
  );

  paymentAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: paymentId,
    aggregate_type: 'payment',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return paymentAggregate.getState();
}

export async function refundPayment(
  eventStore: any,
  paymentId: string,
  refundId: string,
  amount?: number // Partial refund amount if applicable
) {
  // Get all events for this payment from the event store
  const events = await eventStore.getEventsForAggregate('payment', paymentId);
  
  // Reconstruct the current state of the payment
  const paymentAggregate = new PaymentAggregate();
  events.forEach((event: any) => {
    paymentAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the refund event
  const event = createPaymentRefundedEvent(
    paymentId,
    events.length, // Next version
    {
      refundId,
      amount
    }
  );

  paymentAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: paymentId,
    aggregate_type: 'payment',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return paymentAggregate.getState();
}

export async function failPayment(
  eventStore: any,
  paymentId: string,
  reason: string
) {
  // Get all events for this payment from the event store
  const events = await eventStore.getEventsForAggregate('payment', paymentId);
  
  // Reconstruct the current state of the payment
  const paymentAggregate = new PaymentAggregate();
  events.forEach((event: any) => {
    paymentAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the failure event
  const event = createPaymentFailedEvent(
    paymentId,
    events.length, // Next version
    {
      reason
    }
  );

  paymentAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: paymentId,
    aggregate_type: 'payment',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return paymentAggregate.getState();
}

export async function voidPayment(
  eventStore: any,
  paymentId: string,
  reason?: string
) {
  // Get all events for this payment from the event store
  const events = await eventStore.getEventsForAggregate('payment', paymentId);
  
  // Reconstruct the current state of the payment
  const paymentAggregate = new PaymentAggregate();
  events.forEach((event: any) => {
    paymentAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the void event
  const event = createPaymentVoidedEvent(
    paymentId,
    events.length, // Next version
    {
      reason
    }
  );

  paymentAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: paymentId,
    aggregate_type: 'payment',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return paymentAggregate.getState();
}
