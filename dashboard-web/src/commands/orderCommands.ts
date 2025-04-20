import { OrderAggregate } from '../aggregates/orderAggregate';
import { eventStore } from '../services/supabase/eventStore';

// Comando para crear una nueva orden
export class CreateOrderCommand {
  async execute(payload: {
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
    deliveryFee: number;
  }, metadata?: any): Promise<string> {
    try {
      // Validar datos de entrada
      if (!payload.restaurantId) throw new Error('Restaurant ID is required');
      if (!payload.userId) throw new Error('User ID is required');
      if (!payload.items || !payload.items.length) throw new Error('Order must contain at least one item');
      if (!payload.deliveryAddress) throw new Error('Delivery address is required');
      
      // Generar ID único para la orden
      const orderId = crypto.randomUUID();
      
      // Crear y aplicar el evento
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.createOrder({
        ...payload,
        orderId
      }, metadata);
      
      return orderId;
    } catch (error: any) {
      console.error('Error in CreateOrderCommand:', error);
      throw error;
    }
  }
}

// Comando para añadir un ítem a una orden
export class AddOrderItemCommand {
  async execute(orderId: string, payload: {
    menuItemId: string;
    quantity: number;
    price: number;
    notes?: string;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (!payload.menuItemId) throw new Error('Menu item ID is required');
      if (!payload.quantity || payload.quantity <= 0) throw new Error('Quantity must be greater than 0');
      if (!payload.price || payload.price <= 0) throw new Error('Price must be greater than 0');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.addItem(payload, metadata);
    } catch (error: any) {
      console.error('Error in AddOrderItemCommand:', error);
      throw error;
    }
  }
}

// Comando para eliminar un ítem de una orden
export class RemoveOrderItemCommand {
  async execute(orderId: string, payload: {
    menuItemId: string;
    quantity: number;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (!payload.menuItemId) throw new Error('Menu item ID is required');
      if (!payload.quantity || payload.quantity <= 0) throw new Error('Quantity must be greater than 0');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.removeItem(payload, metadata);
    } catch (error: any) {
      console.error('Error in RemoveOrderItemCommand:', error);
      throw error;
    }
  }
}

// Comando para enviar una orden
export class SubmitOrderCommand {
  async execute(orderId: string, payload: {
    paymentMethod: string;
    paymentIntentId?: string;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (!payload.paymentMethod) throw new Error('Payment method is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.submitOrder(payload, metadata);
    } catch (error: any) {
      console.error('Error in SubmitOrderCommand:', error);
      throw error;
    }
  }
}

// Comando para aceptar una orden
export class AcceptOrderCommand {
  async execute(orderId: string, payload: {
    estimatedPrepTime: number;
    note?: string;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (!payload.estimatedPrepTime || payload.estimatedPrepTime <= 0) {
        throw new Error('Estimated preparation time must be greater than 0');
      }
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.acceptOrder(payload, metadata);
    } catch (error: any) {
      console.error('Error in AcceptOrderCommand:', error);
      throw error;
    }
  }
}

// Comando para rechazar una orden
export class RejectOrderCommand {
  async execute(orderId: string, payload: {
    reason: string;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (!payload.reason) throw new Error('Rejection reason is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.rejectOrder(payload, metadata);
    } catch (error: any) {
      console.error('Error in RejectOrderCommand:', error);
      throw error;
    }
  }
}

// Comando para iniciar la preparación de una orden
export class StartPreparationCommand {
  async execute(orderId: string, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.startPreparation(metadata);
    } catch (error: any) {
      console.error('Error in StartPreparationCommand:', error);
      throw error;
    }
  }
}

// Comando para marcar una orden como lista para recogida
export class MarkOrderReadyCommand {
  async execute(orderId: string, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.markAsReady(metadata);
    } catch (error: any) {
      console.error('Error in MarkOrderReadyCommand:', error);
      throw error;
    }
  }
}

// Comando para asignar una orden a un repartidor
export class AssignOrderToDeliveryCommand {
  async execute(orderId: string, payload: {
    deliveryPersonId: string;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (!payload.deliveryPersonId) throw new Error('Delivery person ID is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.assignToDelivery(payload, metadata);
    } catch (error: any) {
      console.error('Error in AssignOrderToDeliveryCommand:', error);
      throw error;
    }
  }
}

// Comando para marcar una orden como recogida por el repartidor
export class MarkOrderPickedUpCommand {
  async execute(orderId: string, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.markAsPickedUp(metadata);
    } catch (error: any) {
      console.error('Error in MarkOrderPickedUpCommand:', error);
      throw error;
    }
  }
}

// Comando para marcar una orden como entregada
export class MarkOrderDeliveredCommand {
  async execute(orderId: string, payload: {
    deliveryProofImageUrl?: string;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.markAsDelivered(payload, metadata);
    } catch (error: any) {
      console.error('Error in MarkOrderDeliveredCommand:', error);
      throw error;
    }
  }
}

// Comando para cancelar una orden
export class CancelOrderCommand {
  async execute(orderId: string, payload: {
    reason: string;
    cancelledBy: string;
    refundAmount?: number;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (!payload.reason) throw new Error('Cancellation reason is required');
      if (!payload.cancelledBy) throw new Error('Cancellation initiator is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.cancelOrder(payload, metadata);
    } catch (error: any) {
      console.error('Error in CancelOrderCommand:', error);
      throw error;
    }
  }
}

// Comando para registrar un pago
export class RecordPaymentCommand {
  async execute(orderId: string, payload: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paymentStatus: string;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (!payload.amount || payload.amount <= 0) throw new Error('Payment amount must be greater than 0');
      if (!payload.paymentMethod) throw new Error('Payment method is required');
      if (!payload.transactionId) throw new Error('Transaction ID is required');
      if (!payload.paymentStatus) throw new Error('Payment status is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.recordPayment(payload, metadata);
    } catch (error: any) {
      console.error('Error in RecordPaymentCommand:', error);
      throw error;
    }
  }
}

// Comando para actualizar la ubicación de entrega
export class UpdateDeliveryLocationCommand {
  async execute(orderId: string, payload: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  }, metadata?: any): Promise<void> {
    try {
      // Validar datos de entrada
      if (!orderId) throw new Error('Order ID is required');
      if (payload.latitude === undefined) throw new Error('Latitude is required');
      if (payload.longitude === undefined) throw new Error('Longitude is required');
      
      // Cargar el agregado con su historia
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Aplicar el comando
      await orderAggregate.updateDeliveryLocation(payload, metadata);
    } catch (error: any) {
      console.error('Error in UpdateDeliveryLocationCommand:', error);
      throw error;
    }
  }
}