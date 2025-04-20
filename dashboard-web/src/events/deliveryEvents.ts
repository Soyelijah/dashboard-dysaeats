// Delivery Event Types
export interface BaseEvent {
  type: string;
  aggregateId: string;
  version: number;
  timestamp: number;
  data: any;
}

export interface DeliveryCreatedEvent extends BaseEvent {
  type: 'DeliveryCreatedEvent';
  data: {
    id: string;
    orderId: string;
    pickupAddress: string;
    deliveryAddress: string;
    estimatedDeliveryTime?: string; // ISO Date String
    notes?: string;
  };
}

export interface DeliveryAssignedEvent extends BaseEvent {
  type: 'DeliveryAssignedEvent';
  data: {
    deliveryPersonId: string;
  };
}

export interface DeliveryStatusChangedEvent extends BaseEvent {
  type: 'DeliveryStatusChangedEvent';
  data: {
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  };
}

export interface DeliveryLocationUpdatedEvent extends BaseEvent {
  type: 'DeliveryLocationUpdatedEvent';
  data: {
    latitude: number;
    longitude: number;
    timestamp: string; // ISO Date String
  };
}

export interface DeliveryCompletedEvent extends BaseEvent {
  type: 'DeliveryCompletedEvent';
  data: {
    actualDeliveryTime: string; // ISO Date String
  };
}

export interface DeliveryCancelledEvent extends BaseEvent {
  type: 'DeliveryCancelledEvent';
  data: {
    reason?: string;
  };
}

// Factory functions to create delivery events
export function createDeliveryCreatedEvent(
  aggregateId: string,
  version: number,
  data: DeliveryCreatedEvent['data']
): DeliveryCreatedEvent {
  return {
    type: 'DeliveryCreatedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createDeliveryAssignedEvent(
  aggregateId: string,
  version: number,
  data: DeliveryAssignedEvent['data']
): DeliveryAssignedEvent {
  return {
    type: 'DeliveryAssignedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createDeliveryStatusChangedEvent(
  aggregateId: string,
  version: number,
  data: DeliveryStatusChangedEvent['data']
): DeliveryStatusChangedEvent {
  return {
    type: 'DeliveryStatusChangedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createDeliveryLocationUpdatedEvent(
  aggregateId: string,
  version: number,
  data: DeliveryLocationUpdatedEvent['data']
): DeliveryLocationUpdatedEvent {
  return {
    type: 'DeliveryLocationUpdatedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createDeliveryCompletedEvent(
  aggregateId: string,
  version: number,
  data: DeliveryCompletedEvent['data']
): DeliveryCompletedEvent {
  return {
    type: 'DeliveryCompletedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createDeliveryCancelledEvent(
  aggregateId: string,
  version: number,
  data: DeliveryCancelledEvent['data']
): DeliveryCancelledEvent {
  return {
    type: 'DeliveryCancelledEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}
