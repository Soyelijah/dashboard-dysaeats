import { EventStore, eventStore } from '../services/supabase/eventStore';
import { OrderEventTypes } from '../events/orderEvents';

export interface OrderState {
  id: string;
  restaurantId: string;
  userId: string;
  status: string;
  items: Array<{
    id?: string;
    menuItemId: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryNotes?: string;
  deliveryPersonId?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentIntentId?: string;
  estimatedPrepTime?: number;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export class OrderAggregate {
  private state: OrderState;
  private eventStore: EventStore;
  private isDirty: boolean = false;

  constructor(eventStore = eventStore) {
    this.eventStore = eventStore;
    this.state = this.getInitialState();
  }

  private getInitialState(): OrderState {
    return {
      id: '',
      restaurantId: '',
      userId: '',
      status: 'draft',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      deliveryAddress: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 0
    };
  }

  async loadFromHistory(orderId: string): Promise<void> {
    // 1. Try to load from snapshot first
    const snapshot = await this.eventStore.getLatestSnapshot('order', orderId);
    
    let fromVersion = 0;
    if (snapshot) {
      this.state = snapshot.state;
      fromVersion = snapshot.version;
    } else {
      // Si no hay snapshot, reiniciar el estado
      this.state = this.getInitialState();
      this.state.id = orderId;
    }
    
    // 2. Load events after the snapshot version
    const events = await this.eventStore.getEvents('order', orderId, {
      afterVersion: fromVersion
    });
    
    // 3. Apply events to rebuild state
    for (const event of events) {
      this.applyEvent(event.type, event.payload, false);
      this.state.version = event.version || 0;
    }
  }

  getId(): string {
    return this.state.id;
  }
  
  getState(): OrderState {
    return { ...this.state };
  }

  // Métodos de comando - Acciones que generan eventos
  async createOrder(payload: {
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
    deliveryFee: number;
  }, metadata?: any): Promise<void> {
    // Validar que el estado esté vacío
    if (this.state.id) {
      throw new Error('Cannot create an order that already exists');
    }
    
    // Calcular totales
    const subtotal = payload.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    const total = subtotal + payload.deliveryFee;
    
    return this.applyEvent(OrderEventTypes.ORDER_CREATED, {
      ...payload,
      subtotal,
      total
    }, true, metadata);
  }

  async addItem(payload: {
    menuItemId: string;
    quantity: number;
    price: number;
    notes?: string;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot add items to a non-existent order');
    }
    
    if (this.state.status !== 'draft') {
      throw new Error('Cannot add items to an order that is not in draft status');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_ITEM_ADDED, payload, true, metadata);
  }

  async removeItem(payload: {
    menuItemId: string;
    quantity: number;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot remove items from a non-existent order');
    }
    
    if (this.state.status !== 'draft') {
      throw new Error('Cannot remove items from an order that is not in draft status');
    }
    
    // Verificar que el item exista
    const existingItem = this.state.items.find(item => item.menuItemId === payload.menuItemId);
    if (!existingItem) {
      throw new Error(`Item with id ${payload.menuItemId} not found in order`);
    }
    
    // Verificar que la cantidad a remover no exceda la existente
    if (payload.quantity > existingItem.quantity) {
      throw new Error(`Cannot remove ${payload.quantity} items, only ${existingItem.quantity} available`);
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_ITEM_REMOVED, payload, true, metadata);
  }

  async submitOrder(payload: {
    paymentMethod: string;
    paymentIntentId?: string;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot submit a non-existent order');
    }
    
    if (this.state.status !== 'draft') {
      throw new Error('Only draft orders can be submitted');
    }
    
    if (this.state.items.length === 0) {
      throw new Error('Cannot submit an empty order');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_SUBMITTED, payload, true, metadata);
  }

  async acceptOrder(payload: {
    estimatedPrepTime: number;
    note?: string;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot accept a non-existent order');
    }
    
    if (this.state.status !== 'pending') {
      throw new Error('Only pending orders can be accepted');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_ACCEPTED, payload, true, metadata);
  }

  async rejectOrder(payload: {
    reason: string;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot reject a non-existent order');
    }
    
    if (this.state.status !== 'pending') {
      throw new Error('Only pending orders can be rejected');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_REJECTED, payload, true, metadata);
  }

  async startPreparation(metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot start preparation for a non-existent order');
    }
    
    if (this.state.status !== 'accepted') {
      throw new Error('Only accepted orders can start preparation');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_PREPARING, {
      startedAt: new Date().toISOString()
    }, true, metadata);
  }

  async markAsReady(metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot mark as ready a non-existent order');
    }
    
    if (this.state.status !== 'preparing') {
      throw new Error('Only orders in preparation can be marked as ready');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_READY_FOR_PICKUP, {
      readyAt: new Date().toISOString()
    }, true, metadata);
  }

  async assignToDelivery(payload: {
    deliveryPersonId: string;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot assign a non-existent order');
    }
    
    if (this.state.status !== 'ready_for_pickup') {
      throw new Error('Only orders ready for pickup can be assigned to delivery');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_ASSIGNED_TO_DELIVERY, {
      deliveryPersonId: payload.deliveryPersonId,
      assignedAt: new Date().toISOString()
    }, true, metadata);
  }

  async markAsPickedUp(metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot mark as picked up a non-existent order');
    }
    
    if (this.state.status !== 'assigned_for_delivery') {
      throw new Error('Only assigned orders can be marked as picked up');
    }
    
    if (!this.state.deliveryPersonId) {
      throw new Error('Order has no assigned delivery person');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_PICKED_UP, {
      pickedUpAt: new Date().toISOString()
    }, true, metadata);
  }

  async markAsDelivered(payload: {
    deliveryProofImageUrl?: string;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot mark as delivered a non-existent order');
    }
    
    if (this.state.status !== 'in_transit') {
      throw new Error('Only orders in transit can be marked as delivered');
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_DELIVERED, {
      deliveredAt: new Date().toISOString(),
      deliveryProofImageUrl: payload.deliveryProofImageUrl
    }, true, metadata);
  }

  async cancelOrder(payload: {
    reason: string;
    cancelledBy: string;
    refundAmount?: number;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot cancel a non-existent order');
    }
    
    // Solo se pueden cancelar pedidos en ciertos estados
    const cancelableStates = ['draft', 'pending', 'accepted', 'preparing'];
    if (!cancelableStates.includes(this.state.status)) {
      throw new Error(`Cannot cancel an order in ${this.state.status} status`);
    }
    
    return this.applyEvent(OrderEventTypes.ORDER_CANCELLED, payload, true, metadata);
  }

  async recordPayment(payload: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paymentStatus: string;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot record payment for a non-existent order');
    }
    
    if (this.state.paymentStatus === 'completed') {
      throw new Error('Payment has already been completed for this order');
    }
    
    return this.applyEvent(OrderEventTypes.PAYMENT_RECEIVED, payload, true, metadata);
  }

  async updateDeliveryLocation(payload: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  }, metadata?: any): Promise<void> {
    if (!this.state.id) {
      throw new Error('Cannot update delivery location for a non-existent order');
    }
    
    if (!this.state.deliveryPersonId) {
      throw new Error('Cannot update location for an order without delivery person');
    }
    
    const deliveryStates = ['assigned_for_delivery', 'in_transit'];
    if (!deliveryStates.includes(this.state.status)) {
      throw new Error(`Cannot update location for an order in ${this.state.status} status`);
    }
    
    return this.applyEvent(OrderEventTypes.DELIVERY_LOCATION_UPDATED, {
      ...payload,
      timestamp: new Date().toISOString()
    }, true, metadata);
  }

  // Método privado para aplicar eventos al estado y opcionalmente guardarlos
  private async applyEvent(
    type: string, 
    payload: any, 
    persist: boolean = false,
    metadata?: any
  ): Promise<void> {
    // Actualizar el estado basado en el tipo de evento
    switch (type) {
      case OrderEventTypes.ORDER_CREATED:
        this.state.id = payload.orderId;
        this.state.restaurantId = payload.restaurantId;
        this.state.userId = payload.userId;
        this.state.items = [...payload.items];
        this.state.deliveryAddress = payload.deliveryAddress;
        this.state.deliveryNotes = payload.deliveryNotes;
        this.state.deliveryFee = payload.deliveryFee;
        this.state.subtotal = payload.subtotal;
        this.state.total = payload.total;
        this.state.status = 'draft';
        this.state.createdAt = new Date().toISOString();
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_ITEM_ADDED:
        this.state.items.push({
          menuItemId: payload.menuItemId,
          quantity: payload.quantity,
          price: payload.price,
          notes: payload.notes
        });
        // Recalcular totales
        this.recalculateTotals();
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_ITEM_REMOVED:
        // Buscar el ítem
        const itemIndex = this.state.items.findIndex(item => 
          item.menuItemId === payload.menuItemId
        );
        
        if (itemIndex >= 0) {
          const item = this.state.items[itemIndex];
          
          if (item.quantity <= payload.quantity) {
            // Eliminar el ítem completamente
            this.state.items.splice(itemIndex, 1);
          } else {
            // Reducir la cantidad
            item.quantity -= payload.quantity;
          }
          
          // Recalcular totales
          this.recalculateTotals();
        }
        
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_SUBMITTED:
        this.state.status = 'pending';
        this.state.paymentMethod = payload.paymentMethod;
        this.state.paymentIntentId = payload.paymentIntentId;
        this.state.paymentStatus = 'pending';
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_ACCEPTED:
        this.state.status = 'accepted';
        this.state.estimatedPrepTime = payload.estimatedPrepTime;
        
        // Calcular tiempo estimado de entrega (prep time + tiempo de entrega estimado)
        const estimatedDeliveryTime = new Date();
        estimatedDeliveryTime.setMinutes(
          estimatedDeliveryTime.getMinutes() + payload.estimatedPrepTime + 30
        );
        this.state.estimatedDeliveryTime = estimatedDeliveryTime.toISOString();
        
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_REJECTED:
        this.state.status = 'rejected';
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_PREPARING:
        this.state.status = 'preparing';
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_READY_FOR_PICKUP:
        this.state.status = 'ready_for_pickup';
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_ASSIGNED_TO_DELIVERY:
        this.state.status = 'assigned_for_delivery';
        this.state.deliveryPersonId = payload.deliveryPersonId;
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_PICKED_UP:
        this.state.status = 'in_transit';
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_DELIVERED:
        this.state.status = 'delivered';
        this.state.actualDeliveryTime = payload.deliveredAt;
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.ORDER_CANCELLED:
        this.state.status = 'cancelled';
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.PAYMENT_RECEIVED:
        this.state.paymentStatus = payload.paymentStatus;
        this.state.updatedAt = new Date().toISOString();
        break;
        
      case OrderEventTypes.DELIVERY_LOCATION_UPDATED:
        // Actualizaría la ubicación del repartidor en otra estructura
        // No cambia el estado del pedido directamente
        break;
      
      default:
        console.warn(`Unknown event type: ${type}`);
    }
    
    this.isDirty = true;
    
    // Si se debe persistir, guardar el evento
    if (persist) {
      await this.eventStore.saveEvent({
        aggregateType: 'order',
        aggregateId: this.state.id,
        type,
        payload,
        metadata: {
          ...metadata,
          userId: metadata?.userId || this.state.userId,
          timestamp: new Date().toISOString()
        }
      });
      
      // Crear snapshot cada 10 eventos o según necesidad
      if (this.state.version % 10 === 0) {
        await this.eventStore.saveSnapshot(
          'order',
          this.state.id,
          this.state,
          this.state.version
        );
      }
    }
  }
  
  // Método auxiliar para recalcular totales
  private recalculateTotals(): void {
    this.state.subtotal = this.state.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    this.state.total = this.state.subtotal + this.state.deliveryFee;
  }
}