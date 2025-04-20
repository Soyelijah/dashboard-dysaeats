import {
  PaymentCreatedEvent,
  PaymentAuthorizedEvent,
  PaymentCapturedEvent,
  PaymentRefundedEvent,
  PaymentFailedEvent,
  PaymentVoidedEvent
} from '../events/paymentEvents';

export async function projectPayments(eventStore: any, supabase: any) {
  // Get all payment events
  const events = await eventStore.getEventsByAggregateType('payment');
  
  // Group events by payment ID
  const eventsByPaymentId: Record<string, any[]> = {};
  
  events.forEach((event: any) => {
    const paymentId = event.aggregate_id;
    if (!eventsByPaymentId[paymentId]) {
      eventsByPaymentId[paymentId] = [];
    }
    eventsByPaymentId[paymentId].push(event);
  });
  
  // Process events for each payment
  for (const paymentId of Object.keys(eventsByPaymentId)) {
    const paymentEvents = eventsByPaymentId[paymentId];
    
    // Sort events by version
    paymentEvents.sort((a, b) => a.version - b.version);
    
    let payment: any = null;
    
    // Process each event
    for (const event of paymentEvents) {
      const eventData = {
        ...event,
        type: event.type,
        aggregateId: event.aggregate_id,
        data: event.data
      };
      
      switch (event.type) {
        case 'PaymentCreatedEvent':
          payment = handlePaymentCreatedEvent(eventData as PaymentCreatedEvent);
          break;
        case 'PaymentAuthorizedEvent':
          payment = handlePaymentAuthorizedEvent(payment, eventData as PaymentAuthorizedEvent);
          break;
        case 'PaymentCapturedEvent':
          payment = handlePaymentCapturedEvent(payment, eventData as PaymentCapturedEvent);
          break;
        case 'PaymentRefundedEvent':
          payment = handlePaymentRefundedEvent(payment, eventData as PaymentRefundedEvent);
          break;
        case 'PaymentFailedEvent':
          payment = handlePaymentFailedEvent(payment, eventData as PaymentFailedEvent);
          break;
        case 'PaymentVoidedEvent':
          payment = handlePaymentVoidedEvent(payment, eventData as PaymentVoidedEvent);
          break;
      }
    }
    
    if (payment) {
      // Update payment in the database
      await updatePaymentInDatabase(supabase, payment);
      
      // Also update order payment status if payment status changed
      await updateOrderPaymentStatus(supabase, payment);
    }
  }
}

function handlePaymentCreatedEvent(event: PaymentCreatedEvent): any {
  return {
    id: event.data.id,
    order_id: event.data.orderId,
    user_id: event.data.userId,
    amount: event.data.amount,
    currency: event.data.currency || 'CLP',
    payment_method: event.data.paymentMethod,
    status: 'pending',
    metadata: event.data.metadata ? JSON.stringify(event.data.metadata) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function handlePaymentAuthorizedEvent(payment: any, event: PaymentAuthorizedEvent): any {
  return {
    ...payment,
    status: 'authorized',
    payment_intent_id: event.data.paymentIntentId,
    updated_at: new Date().toISOString()
  };
}

function handlePaymentCapturedEvent(payment: any, event: PaymentCapturedEvent): any {
  return {
    ...payment,
    status: 'captured',
    charge_id: event.data.chargeId,
    updated_at: new Date().toISOString()
  };
}

function handlePaymentRefundedEvent(payment: any, event: PaymentRefundedEvent): any {
  return {
    ...payment,
    status: 'refunded',
    refund_id: event.data.refundId,
    refund_amount: event.data.amount || payment.amount, // Full or partial refund amount
    updated_at: new Date().toISOString()
  };
}

function handlePaymentFailedEvent(payment: any, event: PaymentFailedEvent): any {
  return {
    ...payment,
    status: 'failed',
    failure_reason: event.data.reason,
    updated_at: new Date().toISOString()
  };
}

function handlePaymentVoidedEvent(payment: any, event: PaymentVoidedEvent): any {
  return {
    ...payment,
    status: 'voided',
    void_reason: event.data.reason,
    updated_at: new Date().toISOString()
  };
}

async function updatePaymentInDatabase(supabase: any, payment: any): Promise<void> {
  try {
    // Update payment record
    const { error } = await supabase
      .from('payments')
      .upsert(payment, { onConflict: 'id' });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating payment in database:', error);
    throw error;
  }
}

async function updateOrderPaymentStatus(supabase: any, payment: any): Promise<void> {
  try {
    let paymentStatus;
    
    // Map payment status to order payment status
    switch (payment.status) {
      case 'captured':
        paymentStatus = 'paid';
        break;
      case 'refunded':
        paymentStatus = 'refunded';
        break;
      case 'failed':
        paymentStatus = 'failed';
        break;
      case 'voided':
        paymentStatus = 'cancelled';
        break;
      default:
        // Don't update order for pending or authorized payments
        return;
    }
    
    // Update the order payment status
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString() 
      })
      .eq('id', payment.order_id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating order payment status:', error);
    throw error;
  }
}
