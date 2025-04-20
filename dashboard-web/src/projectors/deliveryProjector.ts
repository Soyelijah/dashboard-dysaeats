import {
  DeliveryCreatedEvent,
  DeliveryAssignedEvent,
  DeliveryStatusChangedEvent,
  DeliveryLocationUpdatedEvent,
  DeliveryCompletedEvent,
  DeliveryCancelledEvent
} from '../events/deliveryEvents';

export async function projectDeliveries(eventStore: any, supabase: any) {
  // Get all delivery events
  const events = await eventStore.getEventsByAggregateType('delivery');
  
  // Group events by delivery ID
  const eventsByDeliveryId: Record<string, any[]> = {};
  
  events.forEach((event: any) => {
    const deliveryId = event.aggregate_id;
    if (!eventsByDeliveryId[deliveryId]) {
      eventsByDeliveryId[deliveryId] = [];
    }
    eventsByDeliveryId[deliveryId].push(event);
  });
  
  // Process events for each delivery
  for (const deliveryId of Object.keys(eventsByDeliveryId)) {
    const deliveryEvents = eventsByDeliveryId[deliveryId];
    
    // Sort events by version
    deliveryEvents.sort((a, b) => a.version - b.version);
    
    let delivery: any = null;
    let locationHistory: any[] = [];
    
    // Process each event
    for (const event of deliveryEvents) {
      const eventData = {
        ...event,
        type: event.type,
        aggregateId: event.aggregate_id,
        data: event.data
      };
      
      switch (event.type) {
        case 'DeliveryCreatedEvent':
          delivery = handleDeliveryCreatedEvent(eventData as DeliveryCreatedEvent);
          break;
        case 'DeliveryAssignedEvent':
          delivery = handleDeliveryAssignedEvent(delivery, eventData as DeliveryAssignedEvent);
          break;
        case 'DeliveryStatusChangedEvent':
          delivery = handleDeliveryStatusChangedEvent(delivery, eventData as DeliveryStatusChangedEvent);
          break;
        case 'DeliveryLocationUpdatedEvent':
          const locationUpdate = handleDeliveryLocationUpdatedEvent(delivery, eventData as DeliveryLocationUpdatedEvent);
          delivery = locationUpdate.delivery;
          locationHistory.push(locationUpdate.locationData);
          break;
        case 'DeliveryCompletedEvent':
          delivery = handleDeliveryCompletedEvent(delivery, eventData as DeliveryCompletedEvent);
          break;
        case 'DeliveryCancelledEvent':
          delivery = handleDeliveryCancelledEvent(delivery, eventData as DeliveryCancelledEvent);
          break;
      }
    }
    
    if (delivery) {
      // Update delivery in the database
      await updateDeliveryInDatabase(supabase, delivery, locationHistory);
    }
  }
}

function handleDeliveryCreatedEvent(event: DeliveryCreatedEvent): any {
  return {
    id: event.data.id,
    order_id: event.data.orderId,
    status: 'pending',
    pickup_address: event.data.pickupAddress,
    delivery_address: event.data.deliveryAddress,
    estimated_delivery_time: event.data.estimatedDeliveryTime,
    notes: event.data.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function handleDeliveryAssignedEvent(delivery: any, event: DeliveryAssignedEvent): any {
  return {
    ...delivery,
    delivery_person_id: event.data.deliveryPersonId,
    status: 'assigned',
    updated_at: new Date().toISOString()
  };
}

function handleDeliveryStatusChangedEvent(delivery: any, event: DeliveryStatusChangedEvent): any {
  return {
    ...delivery,
    status: event.data.status,
    updated_at: new Date().toISOString()
  };
}

function handleDeliveryLocationUpdatedEvent(
  delivery: any,
  event: DeliveryLocationUpdatedEvent
): { delivery: any; locationData: any } {
  // Update current location in delivery record
  const updatedDelivery = {
    ...delivery,
    current_latitude: event.data.latitude,
    current_longitude: event.data.longitude,
    status: delivery.status === 'assigned' ? 'in_progress' : delivery.status,
    updated_at: new Date().toISOString()
  };
  
  // Create location history record
  const locationData = {
    id: `${event.aggregateId}_${event.version}`, // Create a unique ID
    delivery_id: event.aggregateId,
    latitude: event.data.latitude,
    longitude: event.data.longitude,
    timestamp: event.data.timestamp,
    created_at: new Date().toISOString()
  };
  
  return { delivery: updatedDelivery, locationData };
}

function handleDeliveryCompletedEvent(delivery: any, event: DeliveryCompletedEvent): any {
  return {
    ...delivery,
    status: 'completed',
    actual_delivery_time: event.data.actualDeliveryTime,
    updated_at: new Date().toISOString()
  };
}

function handleDeliveryCancelledEvent(delivery: any, event: DeliveryCancelledEvent): any {
  return {
    ...delivery,
    status: 'cancelled',
    cancellation_reason: event.data.reason,
    updated_at: new Date().toISOString()
  };
}

async function updateDeliveryInDatabase(
  supabase: any,
  delivery: any,
  locationHistory: any[]
): Promise<void> {
  try {
    // Update delivery record
    const { error: deliveryError } = await supabase
      .from('deliveries')
      .upsert(delivery, { onConflict: 'id' });
    
    if (deliveryError) throw deliveryError;
    
    // Insert location history records
    if (locationHistory.length > 0) {
      const { error: locationError } = await supabase
        .from('delivery_locations')
        .upsert(locationHistory, { onConflict: 'id' });
      
      if (locationError) throw locationError;
    }
    
    // Also update related order status if delivery status changed
    if (delivery.status === 'completed' || delivery.status === 'cancelled') {
      const orderStatus = delivery.status === 'completed' ? 'delivered' : 'cancelled';
      
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: orderStatus, updated_at: new Date().toISOString() })
        .eq('id', delivery.order_id);
      
      if (orderError) throw orderError;
    }
  } catch (error) {
    console.error('Error updating delivery in database:', error);
    throw error;
  }
}
