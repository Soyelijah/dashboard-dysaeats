import { v4 as uuidv4 } from 'uuid';
import { DeliveryAggregate } from '../aggregates/deliveryAggregate';
import {
  createDeliveryCreatedEvent,
  createDeliveryAssignedEvent,
  createDeliveryStatusChangedEvent,
  createDeliveryLocationUpdatedEvent,
  createDeliveryCompletedEvent,
  createDeliveryCancelledEvent
} from '../events/deliveryEvents';

export async function createDelivery(
  eventStore: any,
  orderId: string,
  pickupAddress: string,
  deliveryAddress: string,
  estimatedDeliveryTime?: Date,
  notes?: string
) {
  const deliveryId = uuidv4();
  const deliveryAggregate = new DeliveryAggregate();
  
  const event = createDeliveryCreatedEvent(
    deliveryId,
    0, // Initial version
    {
      id: deliveryId,
      orderId,
      pickupAddress,
      deliveryAddress,
      estimatedDeliveryTime: estimatedDeliveryTime?.toISOString(),
      notes
    }
  );

  deliveryAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: deliveryId,
    aggregate_type: 'delivery',
    version: 0,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return deliveryAggregate.getState();
}

export async function assignDelivery(
  eventStore: any,
  deliveryId: string,
  deliveryPersonId: string
) {
  // Get all events for this delivery from the event store
  const events = await eventStore.getEventsForAggregate('delivery', deliveryId);
  
  // Reconstruct the current state of the delivery
  const deliveryAggregate = new DeliveryAggregate();
  events.forEach((event: any) => {
    deliveryAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the assign event
  const event = createDeliveryAssignedEvent(
    deliveryId,
    events.length, // Next version
    {
      deliveryPersonId
    }
  );

  deliveryAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: deliveryId,
    aggregate_type: 'delivery',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return deliveryAggregate.getState();
}

export async function updateDeliveryStatus(
  eventStore: any,
  deliveryId: string,
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
) {
  // Get all events for this delivery from the event store
  const events = await eventStore.getEventsForAggregate('delivery', deliveryId);
  
  // Reconstruct the current state of the delivery
  const deliveryAggregate = new DeliveryAggregate();
  events.forEach((event: any) => {
    deliveryAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the status change event
  const event = createDeliveryStatusChangedEvent(
    deliveryId,
    events.length, // Next version
    {
      status
    }
  );

  deliveryAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: deliveryId,
    aggregate_type: 'delivery',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return deliveryAggregate.getState();
}

export async function updateDeliveryLocation(
  eventStore: any,
  deliveryId: string,
  latitude: number,
  longitude: number
) {
  // Get all events for this delivery from the event store
  const events = await eventStore.getEventsForAggregate('delivery', deliveryId);
  
  // Reconstruct the current state of the delivery
  const deliveryAggregate = new DeliveryAggregate();
  events.forEach((event: any) => {
    deliveryAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the location update event
  const event = createDeliveryLocationUpdatedEvent(
    deliveryId,
    events.length, // Next version
    {
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    }
  );

  deliveryAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: deliveryId,
    aggregate_type: 'delivery',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return deliveryAggregate.getState();
}

export async function completeDelivery(
  eventStore: any,
  deliveryId: string,
  actualDeliveryTime: Date = new Date()
) {
  // Get all events for this delivery from the event store
  const events = await eventStore.getEventsForAggregate('delivery', deliveryId);
  
  // Reconstruct the current state of the delivery
  const deliveryAggregate = new DeliveryAggregate();
  events.forEach((event: any) => {
    deliveryAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the completion event
  const event = createDeliveryCompletedEvent(
    deliveryId,
    events.length, // Next version
    {
      actualDeliveryTime: actualDeliveryTime.toISOString()
    }
  );

  deliveryAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: deliveryId,
    aggregate_type: 'delivery',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return deliveryAggregate.getState();
}

export async function cancelDelivery(
  eventStore: any,
  deliveryId: string,
  reason?: string
) {
  // Get all events for this delivery from the event store
  const events = await eventStore.getEventsForAggregate('delivery', deliveryId);
  
  // Reconstruct the current state of the delivery
  const deliveryAggregate = new DeliveryAggregate();
  events.forEach((event: any) => {
    deliveryAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the cancellation event
  const event = createDeliveryCancelledEvent(
    deliveryId,
    events.length, // Next version
    {
      reason
    }
  );

  deliveryAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: deliveryId,
    aggregate_type: 'delivery',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return deliveryAggregate.getState();
}
