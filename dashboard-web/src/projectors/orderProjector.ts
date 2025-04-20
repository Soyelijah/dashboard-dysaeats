import { eventStore, Event } from '../services/supabase/eventStore';
import { OrderEventTypes } from '../events/orderEvents';
import { supabase } from '../services/supabase/client';

export class OrderProjector {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Suscribirse a todos los eventos de orden
    eventStore.on(OrderEventTypes.ORDER_CREATED, this.handleOrderCreated.bind(this));
    eventStore.on(OrderEventTypes.ORDER_ITEM_ADDED, this.handleOrderItemAdded.bind(this));
    eventStore.on(OrderEventTypes.ORDER_ITEM_REMOVED, this.handleOrderItemRemoved.bind(this));
    eventStore.on(OrderEventTypes.ORDER_SUBMITTED, this.handleOrderSubmitted.bind(this));
    eventStore.on(OrderEventTypes.ORDER_ACCEPTED, this.handleOrderAccepted.bind(this));
    eventStore.on(OrderEventTypes.ORDER_REJECTED, this.handleOrderRejected.bind(this));
    eventStore.on(OrderEventTypes.ORDER_PREPARING, this.handleOrderPreparing.bind(this));
    eventStore.on(OrderEventTypes.ORDER_READY_FOR_PICKUP, this.handleOrderReadyForPickup.bind(this));
    eventStore.on(OrderEventTypes.ORDER_ASSIGNED_TO_DELIVERY, this.handleOrderAssignedToDelivery.bind(this));
    eventStore.on(OrderEventTypes.ORDER_PICKED_UP, this.handleOrderPickedUp.bind(this));
    eventStore.on(OrderEventTypes.ORDER_DELIVERED, this.handleOrderDelivered.bind(this));
    eventStore.on(OrderEventTypes.ORDER_CANCELLED, this.handleOrderCancelled.bind(this));
    eventStore.on(OrderEventTypes.PAYMENT_RECEIVED, this.handlePaymentReceived.bind(this));
  }

  private async handleOrderCreated(event: Event): Promise<void> {
    const { payload } = event;
    
    try {
      // Insertar orden en la tabla orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          id: payload.orderId,
          user_id: payload.userId,
          restaurant_id: payload.restaurantId,
          status: 'draft',
          total: payload.total,
          delivery_address: payload.deliveryAddress,
          delivery_notes: payload.deliveryNotes,
          delivery_fee: payload.deliveryFee,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (orderError) {
        console.error('Error projecting ORDER_CREATED to orders table:', orderError);
        return;
      }
      
      // Insertar items en la tabla order_items
      const orderItems = payload.items.map(item => ({
        order_id: payload.orderId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes
      }));
      
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
          
        if (itemsError) {
          console.error('Error projecting ORDER_CREATED items to order_items table:', itemsError);
        }
      }
      
      console.log(`Projected ORDER_CREATED for order ${payload.orderId}`);
    } catch (error) {
      console.error('Exception in handleOrderCreated projector:', error);
    }
  }

  private async handleOrderItemAdded(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Insertar nuevo item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([{
          order_id: aggregateId,
          menu_item_id: payload.menuItemId,
          quantity: payload.quantity,
          price: payload.price,
          notes: payload.notes
        }]);
        
      if (itemError) {
        console.error('Error projecting ORDER_ITEM_ADDED to order_items table:', itemError);
        return;
      }
      
      // Actualizar el total de la orden
      await this.updateOrderTotal(aggregateId);
      
      console.log(`Projected ORDER_ITEM_ADDED for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderItemAdded projector:', error);
    }
  }

  private async handleOrderItemRemoved(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Buscar el item existente
      const { data: items, error: fetchError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', aggregateId)
        .eq('menu_item_id', payload.menuItemId);
        
      if (fetchError) {
        console.error('Error fetching order item for removal:', fetchError);
        return;
      }
      
      if (!items || items.length === 0) {
        console.error(`Item ${payload.menuItemId} not found in order ${aggregateId}`);
        return;
      }
      
      // Ordenar por ID para asegurar consistencia
      const sortedItems = [...items].sort((a, b) => a.id - b.id);
      const item = sortedItems[0];
      
      if (item.quantity <= payload.quantity) {
        // Eliminar el item completamente
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('id', item.id);
          
        if (deleteError) {
          console.error('Error deleting order item:', deleteError);
          return;
        }
      } else {
        // Reducir la cantidad
        const { error: updateError } = await supabase
          .from('order_items')
          .update({ quantity: item.quantity - payload.quantity })
          .eq('id', item.id);
          
        if (updateError) {
          console.error('Error updating order item quantity:', updateError);
          return;
        }
      }
      
      // Actualizar el total de la orden
      await this.updateOrderTotal(aggregateId);
      
      console.log(`Projected ORDER_ITEM_REMOVED for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderItemRemoved projector:', error);
    }
  }

  private async handleOrderSubmitted(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Actualizar el estado de la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_SUBMITTED to orders table:', error);
        return;
      }
      
      // Crear registro de pago si es necesario
      if (payload.paymentMethod) {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('total')
          .eq('id', aggregateId)
          .single();
          
        if (orderError) {
          console.error('Error fetching order for payment creation:', orderError);
          return;
        }
        
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            order_id: aggregateId,
            amount: orderData.total,
            payment_method: payload.paymentMethod,
            transaction_id: payload.paymentIntentId,
            status: 'pending',
            created_at: new Date().toISOString()
          }]);
          
        if (paymentError) {
          console.error('Error creating payment record:', paymentError);
        }
      }
      
      console.log(`Projected ORDER_SUBMITTED for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderSubmitted projector:', error);
    }
  }

  private async handleOrderAccepted(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Calcular tiempo estimado de entrega
      const estimatedDeliveryTime = new Date();
      estimatedDeliveryTime.setMinutes(
        estimatedDeliveryTime.getMinutes() + payload.estimatedPrepTime + 30
      );
      
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'accepted',
          estimated_delivery_time: estimatedDeliveryTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_ACCEPTED to orders table:', error);
        return;
      }
      
      // Crear notificación para el usuario
      await this.createNotificationForOrderUpdate(
        aggregateId,
        'Tu pedido ha sido aceptado',
        `El restaurante ha aceptado tu pedido. Tiempo de preparación estimado: ${payload.estimatedPrepTime} minutos.`
      );
      
      console.log(`Projected ORDER_ACCEPTED for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderAccepted projector:', error);
    }
  }

  private async handleOrderRejected(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_REJECTED to orders table:', error);
        return;
      }
      
      // Crear notificación para el usuario
      await this.createNotificationForOrderUpdate(
        aggregateId,
        'Tu pedido ha sido rechazado',
        `Lo sentimos, el restaurante ha rechazado tu pedido. Motivo: ${payload.reason}`
      );
      
      console.log(`Projected ORDER_REJECTED for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderRejected projector:', error);
    }
  }

  private async handleOrderPreparing(event: Event): Promise<void> {
    const { aggregateId } = event;
    
    try {
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'preparing',
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_PREPARING to orders table:', error);
        return;
      }
      
      // Crear notificación para el usuario
      await this.createNotificationForOrderUpdate(
        aggregateId,
        'Tu pedido está en preparación',
        'El restaurante ha comenzado a preparar tu pedido.'
      );
      
      console.log(`Projected ORDER_PREPARING for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderPreparing projector:', error);
    }
  }

  private async handleOrderReadyForPickup(event: Event): Promise<void> {
    const { aggregateId } = event;
    
    try {
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'ready_for_pickup',
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_READY_FOR_PICKUP to orders table:', error);
        return;
      }
      
      console.log(`Projected ORDER_READY_FOR_PICKUP for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderReadyForPickup projector:', error);
    }
  }

  private async handleOrderAssignedToDelivery(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'assigned_for_delivery',
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_ASSIGNED_TO_DELIVERY to orders table:', error);
        return;
      }
      
      // Crear asignación de entrega
      const { error: assignmentError } = await supabase
        .from('order_assignments')
        .insert([{
          order_id: aggregateId,
          delivery_person_id: payload.deliveryPersonId,
          assigned_at: payload.assignedAt,
          status: 'assigned',
          created_at: new Date().toISOString()
        }]);
        
      if (assignmentError) {
        console.error('Error creating delivery assignment:', assignmentError);
        return;
      }
      
      // Crear notificación para el usuario
      await this.createNotificationForOrderUpdate(
        aggregateId,
        'Repartidor asignado a tu pedido',
        'Tu pedido ha sido asignado a un repartidor y será recogido pronto.'
      );
      
      console.log(`Projected ORDER_ASSIGNED_TO_DELIVERY for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderAssignedToDelivery projector:', error);
    }
  }

  private async handleOrderPickedUp(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'in_transit',
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_PICKED_UP to orders table:', error);
        return;
      }
      
      // Actualizar la asignación de entrega
      const { error: assignmentError } = await supabase
        .from('order_assignments')
        .update({ 
          status: 'in_progress',
          picked_up_at: payload.pickedUpAt
        })
        .eq('order_id', aggregateId);
        
      if (assignmentError) {
        console.error('Error updating delivery assignment for pickup:', assignmentError);
        return;
      }
      
      // Crear notificación para el usuario
      await this.createNotificationForOrderUpdate(
        aggregateId,
        'Tu pedido está en camino',
        'El repartidor ha recogido tu pedido y está en camino a tu dirección.'
      );
      
      console.log(`Projected ORDER_PICKED_UP for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderPickedUp projector:', error);
    }
  }

  private async handleOrderDelivered(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          actual_delivery_time: payload.deliveredAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_DELIVERED to orders table:', error);
        return;
      }
      
      // Actualizar la asignación de entrega
      const { error: assignmentError } = await supabase
        .from('order_assignments')
        .update({ 
          status: 'completed',
          delivered_at: payload.deliveredAt
        })
        .eq('order_id', aggregateId);
        
      if (assignmentError) {
        console.error('Error updating delivery assignment for delivery:', assignmentError);
        return;
      }
      
      // Actualizar pago si existe
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('order_id', aggregateId)
        .eq('status', 'pending');
        
      if (paymentError) {
        console.error('Error updating payment status:', paymentError);
      }
      
      // Crear notificación para el usuario
      await this.createNotificationForOrderUpdate(
        aggregateId,
        'Tu pedido ha sido entregado',
        '¡Tu pedido ha sido entregado exitosamente! Gracias por usar DysaEats.'
      );
      
      console.log(`Projected ORDER_DELIVERED for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderDelivered projector:', error);
    }
  }

  private async handleOrderCancelled(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', aggregateId);
        
      if (error) {
        console.error('Error projecting ORDER_CANCELLED to orders table:', error);
        return;
      }
      
      // Actualizar pagos si hay reembolso
      if (payload.refundAmount) {
        // Crear registro de reembolso
        const { error: refundError } = await supabase
          .from('payments')
          .insert([{
            order_id: aggregateId,
            amount: -payload.refundAmount, // Negativo para indicar reembolso
            payment_method: 'refund',
            status: 'completed',
            created_at: new Date().toISOString()
          }]);
          
        if (refundError) {
          console.error('Error creating refund record:', refundError);
        }
      }
      
      // Crear notificación para el usuario
      await this.createNotificationForOrderUpdate(
        aggregateId,
        'Tu pedido ha sido cancelado',
        `Tu pedido ha sido cancelado. Motivo: ${payload.reason}`
      );
      
      console.log(`Projected ORDER_CANCELLED for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handleOrderCancelled projector:', error);
    }
  }

  private async handlePaymentReceived(event: Event): Promise<void> {
    const { payload, aggregateId } = event;
    
    try {
      // Actualizar o crear registro de pago
      const { data: existingPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', aggregateId)
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error fetching payment record:', fetchError);
        return;
      }
      
      if (existingPayment) {
        // Actualizar pago existente
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: payload.paymentStatus,
            transaction_id: payload.transactionId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPayment.id);
          
        if (updateError) {
          console.error('Error updating payment record:', updateError);
        }
      } else {
        // Crear nuevo pago
        const { error: insertError } = await supabase
          .from('payments')
          .insert([{
            order_id: aggregateId,
            amount: payload.amount,
            payment_method: payload.paymentMethod,
            transaction_id: payload.transactionId,
            status: payload.paymentStatus,
            created_at: new Date().toISOString()
          }]);
          
        if (insertError) {
          console.error('Error creating payment record:', insertError);
        }
      }
      
      console.log(`Projected PAYMENT_RECEIVED for order ${aggregateId}`);
    } catch (error) {
      console.error('Exception in handlePaymentReceived projector:', error);
    }
  }

  // Métodos auxiliares

  // Actualizar el total de la orden basado en items
  private async updateOrderTotal(orderId: string): Promise<void> {
    try {
      // Calcular subtotal basado en items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('price, quantity')
        .eq('order_id', orderId);
        
      if (itemsError) {
        console.error('Error fetching order items for total calculation:', itemsError);
        return;
      }
      
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Obtener delivery_fee
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('delivery_fee')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        console.error('Error fetching order for fee:', orderError);
        return;
      }
      
      const total = subtotal + (order.delivery_fee || 0);
      
      // Actualizar el total
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          total,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('Error updating order total:', updateError);
      }
    } catch (error) {
      console.error('Exception in updateOrderTotal:', error);
    }
  }

  // Crear notificación para el usuario del pedido
  private async createNotificationForOrderUpdate(
    orderId: string, 
    title: string, 
    message: string
  ): Promise<void> {
    try {
      // Obtener usuario del pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        console.error('Error fetching order for notification:', orderError);
        return;
      }
      
      // Crear notificación
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: order.user_id,
          title,
          message,
          is_read: false,
          type: 'order_update',
          reference_id: orderId,
          created_at: new Date().toISOString()
        }]);
        
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    } catch (error) {
      console.error('Exception in createNotificationForOrderUpdate:', error);
    }
  }
}

// Inicializar el proyector al importar este módulo
export const orderProjector = new OrderProjector();