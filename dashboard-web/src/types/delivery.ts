// Delivery types for Event Sourcing system
export interface Delivery {
  id: string;
  orderId: string;
  deliveryPersonId?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  version: number;
}

// Delivery command types
export interface CreateDeliveryCommand {
  orderId: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDeliveryTime?: Date;
  notes?: string;
}

export interface AssignDeliveryCommand {
  deliveryId: string;
  deliveryPersonId: string;
}

export interface UpdateDeliveryStatusCommand {
  deliveryId: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
}

export interface UpdateDeliveryLocationCommand {
  deliveryId: string;
  latitude: number;
  longitude: number;
}

export interface CompleteDeliveryCommand {
  deliveryId: string;
  actualDeliveryTime?: Date;
}

export interface CancelDeliveryCommand {
  deliveryId: string;
  reason?: string;
}
