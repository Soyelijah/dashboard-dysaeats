import { Delivery } from '../types/delivery';
import {
  DeliveryCreatedEvent,
  DeliveryAssignedEvent,
  DeliveryStatusChangedEvent,
  DeliveryLocationUpdatedEvent,
  DeliveryCompletedEvent,
  DeliveryCancelledEvent
} from '../events/deliveryEvents';

export class DeliveryAggregate {
  private id: string;
  private orderId: string;
  private deliveryPersonId?: string;
  private status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  private pickupAddress: string;
  private deliveryAddress: string;
  private currentLocation?: {
    latitude: number;
    longitude: number;
  };
  private estimatedDeliveryTime?: Date;
  private actualDeliveryTime?: Date;
  private notes?: string;
  private version: number;

  constructor() {
    this.id = '';
    this.orderId = '';
    this.status = 'pending';
    this.pickupAddress = '';
    this.deliveryAddress = '';
    this.version = 0;
  }

  public applyEvent(event: any): void {
    if (event.type === 'DeliveryCreatedEvent') {
      this.applyDeliveryCreatedEvent(event);
    } else if (event.type === 'DeliveryAssignedEvent') {
      this.applyDeliveryAssignedEvent(event);
    } else if (event.type === 'DeliveryStatusChangedEvent') {
      this.applyDeliveryStatusChangedEvent(event);
    } else if (event.type === 'DeliveryLocationUpdatedEvent') {
      this.applyDeliveryLocationUpdatedEvent(event);
    } else if (event.type === 'DeliveryCompletedEvent') {
      this.applyDeliveryCompletedEvent(event);
    } else if (event.type === 'DeliveryCancelledEvent') {
      this.applyDeliveryCancelledEvent(event);
    }
    this.version++;
  }

  private applyDeliveryCreatedEvent(event: DeliveryCreatedEvent): void {
    this.id = event.data.id;
    this.orderId = event.data.orderId;
    this.pickupAddress = event.data.pickupAddress;
    this.deliveryAddress = event.data.deliveryAddress;
    this.estimatedDeliveryTime = event.data.estimatedDeliveryTime ? new Date(event.data.estimatedDeliveryTime) : undefined;
    this.notes = event.data.notes;
    this.status = 'pending';
  }

  private applyDeliveryAssignedEvent(event: DeliveryAssignedEvent): void {
    this.deliveryPersonId = event.data.deliveryPersonId;
    this.status = 'assigned';
  }

  private applyDeliveryStatusChangedEvent(event: DeliveryStatusChangedEvent): void {
    this.status = event.data.status;
  }

  private applyDeliveryLocationUpdatedEvent(event: DeliveryLocationUpdatedEvent): void {
    this.currentLocation = {
      latitude: event.data.latitude,
      longitude: event.data.longitude
    };
    
    // If in progress and location updated, ensure status is updated
    if (this.status === 'assigned') {
      this.status = 'in_progress';
    }
  }

  private applyDeliveryCompletedEvent(event: DeliveryCompletedEvent): void {
    this.status = 'completed';
    this.actualDeliveryTime = new Date(event.data.actualDeliveryTime);
  }

  private applyDeliveryCancelledEvent(event: DeliveryCancelledEvent): void {
    this.status = 'cancelled';
  }

  public getState(): Delivery {
    return {
      id: this.id,
      orderId: this.orderId,
      deliveryPersonId: this.deliveryPersonId,
      status: this.status,
      pickupAddress: this.pickupAddress,
      deliveryAddress: this.deliveryAddress,
      currentLocation: this.currentLocation,
      estimatedDeliveryTime: this.estimatedDeliveryTime,
      actualDeliveryTime: this.actualDeliveryTime,
      notes: this.notes,
      version: this.version
    };
  }
}
