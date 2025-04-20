// Tipos de eventos para pedidos
export enum OrderEventTypes {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_ITEM_ADDED = 'ORDER_ITEM_ADDED',
  ORDER_ITEM_REMOVED = 'ORDER_ITEM_REMOVED',
  ORDER_SUBMITTED = 'ORDER_SUBMITTED',
  ORDER_ACCEPTED = 'ORDER_ACCEPTED',
  ORDER_REJECTED = 'ORDER_REJECTED',
  ORDER_PREPARING = 'ORDER_PREPARING',
  ORDER_READY_FOR_PICKUP = 'ORDER_READY_FOR_PICKUP',
  ORDER_ASSIGNED_TO_DELIVERY = 'ORDER_ASSIGNED_TO_DELIVERY',
  ORDER_PICKED_UP = 'ORDER_PICKED_UP',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  DELIVERY_LOCATION_UPDATED = 'DELIVERY_LOCATION_UPDATED'
}

// Interfaces para cada tipo de evento

export interface OrderCreatedEvent {
  orderId: string;
  restaurantId: string;
  userId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  deliveryAddress: string;
  deliveryNotes?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface OrderItemAddedEvent {
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface OrderItemRemovedEvent {
  menuItemId: string;
  quantity: number;
}

export interface OrderSubmittedEvent {
  paymentMethod: string;
  paymentIntentId?: string;
}

export interface OrderAcceptedEvent {
  estimatedPrepTime: number; // minutos
  note?: string;
}

export interface OrderRejectedEvent {
  reason: string;
}

export interface OrderPreparingEvent {
  startedAt: string;
}

export interface OrderReadyForPickupEvent {
  readyAt: string;
}

export interface OrderAssignedToDeliveryEvent {
  deliveryPersonId: string;
  assignedAt: string;
}

export interface OrderPickedUpEvent {
  pickedUpAt: string;
}

export interface OrderDeliveredEvent {
  deliveredAt: string;
  deliveryProofImageUrl?: string;
}

export interface OrderCancelledEvent {
  reason: string;
  cancelledBy: string; // ID del usuario que canceló
  refundAmount?: number;
}

export interface PaymentReceivedEvent {
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentStatus: string;
}

export interface DeliveryLocationUpdatedEvent {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}