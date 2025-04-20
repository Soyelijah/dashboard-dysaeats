import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { eventStore } from '@/services/supabase/eventStore';
import { OrderAggregate } from '@/aggregates/orderAggregate';
import { OrderEventTypes } from '@/events/orderEvents';
import { useAuth } from './useAuth';

interface Order {
  id: string;
  status: string;
  total: number;
  items: any[];
  restaurant?: any;
  user?: any;
  // otros campos de orden
}

interface UseEventSourcedOrdersOptions {
  restaurantId?: string;
  status?: string[];
  enabled?: boolean;
  includeDetails?: boolean;
}

/**
 * Hook para gestión de pedidos basado en Event Sourcing
 * 
 * @param options Opciones de configuración
 * @returns Estado y operaciones sobre órdenes
 */
export function useEventSourcedOrders(options: UseEventSourcedOrdersOptions = {}) {
  const { user } = useAuth();
  const { restaurantId, status, enabled = true, includeDetails = true } = options;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Cargar pedidos iniciales desde la vista materializada (tabla)
  useEffect(() => {
    if (!enabled || !user) return;
    
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let query = supabase
          .from('orders')
          .select(includeDetails 
            ? 'id, status, total, delivery_address, delivery_fee, delivery_notes, estimated_delivery_time, actual_delivery_time, created_at, updated_at, restaurant:restaurant_id(*), user:user_id(*)' 
            : 'id, status, total, created_at, updated_at')
          .order('created_at', { ascending: false });
        
        // Filtrar por restaurante o usuario según el contexto
        if (restaurantId) {
          query = query.eq('restaurant_id', restaurantId);
        } else if (user) {
          query = query.eq('user_id', user.id);
        }
        
        // Filtrar por estado si se especifica
        if (status && status.length > 0) {
          query = query.in('status', status);
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        // Si se requieren los ítems, cargarlos
        if (includeDetails && data && data.length > 0) {
          const orderIds = data.map(o => o.id);
          
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);
            
          if (itemsError) throw itemsError;
          
          // Agrupar items por orden
          const itemsByOrderId = items.reduce((acc, item) => {
            acc[item.order_id] = acc[item.order_id] || [];
            acc[item.order_id].push(item);
            return acc;
          }, {});
          
          // Añadir items a cada orden
          const ordersWithItems = data.map(order => ({
            ...order,
            items: itemsByOrderId[order.id] || []
          }));
          
          setOrders(ordersWithItems);
        } else {
          setOrders(data || []);
        }
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [enabled, restaurantId, user, includeDetails, status]);
  
  // Suscribirse a eventos de órdenes
  useEffect(() => {
    if (!enabled || !user) return;
    
    const handleOrderEvent = async (event: any) => {
      console.log('Order event received:', event.type, event.aggregateId);
      
      // Verificar si la orden es relevante para este usuario/restaurante
      const isRelevant = await isOrderRelevantToContext(event.aggregateId, restaurantId, user?.id);
      if (!isRelevant) return;
      
      // Refrescar los datos de la orden modificada
      try {
        let query = supabase
          .from('orders')
          .select(includeDetails 
            ? 'id, status, total, delivery_address, delivery_fee, delivery_notes, estimated_delivery_time, actual_delivery_time, created_at, updated_at, restaurant:restaurant_id(*), user:user_id(*)' 
            : 'id, status, total, created_at, updated_at')
          .eq('id', event.aggregateId)
          .single();
        
        const { data: updatedOrder, error: orderError } = await query;
        
        if (orderError) {
          // Si hay error, puede ser porque la orden fue eliminada
          if (orderError.code === 'PGRST116') { // No data found
            // Eliminar la orden de la lista si existe
            setOrders(prev => prev.filter(o => o.id !== event.aggregateId));
          }
          return;
        }
        
        // Verificar si esta orden debe mostrarse según los filtros
        if (status && status.length > 0 && !status.includes(updatedOrder.status)) {
          // La orden ya no cumple con los filtros, removerla
          setOrders(prev => prev.filter(o => o.id !== event.aggregateId));
          return;
        }
        
        // Si se requieren los ítems, cargarlos
        if (includeDetails) {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', updatedOrder.id);
            
          if (itemsError) throw itemsError;
          
          updatedOrder.items = items || [];
        }
        
        // Actualizar la orden en la lista
        setOrders(prev => {
          const orderIndex = prev.findIndex(o => o.id === updatedOrder.id);
          
          if (orderIndex >= 0) {
            // Actualizar orden existente
            const updated = [...prev];
            updated[orderIndex] = updatedOrder;
            return updated;
          } else {
            // Añadir nueva orden
            return [updatedOrder, ...prev];
          }
        });
      } catch (err) {
        console.error('Error handling order event:', err);
      }
    };
    
    // Suscribirse a diferentes tipos de eventos
    // Si es restaurante, eventos de sus órdenes
    // Si es cliente, eventos de sus órdenes
    const relevantEvents = [
      OrderEventTypes.ORDER_CREATED,
      OrderEventTypes.ORDER_SUBMITTED,
      OrderEventTypes.ORDER_ACCEPTED,
      OrderEventTypes.ORDER_REJECTED,
      OrderEventTypes.ORDER_PREPARING,
      OrderEventTypes.ORDER_READY_FOR_PICKUP,
      OrderEventTypes.ORDER_ASSIGNED_TO_DELIVERY,
      OrderEventTypes.ORDER_PICKED_UP,
      OrderEventTypes.ORDER_DELIVERED,
      OrderEventTypes.ORDER_CANCELLED
    ];
    
    // Suscribirse a los eventos
    relevantEvents.forEach(eventType => {
      eventStore.on(eventType, handleOrderEvent);
    });
    
    // Limpieza al desmontar
    return () => {
      relevantEvents.forEach(eventType => {
        eventStore.off(eventType, handleOrderEvent);
      });
    };
  }, [enabled, restaurantId, user, includeDetails, status]);
  
  // Verificar si una orden es relevante para el contexto actual
  const isOrderRelevantToContext = async (
    orderId: string, 
    contextRestaurantId?: string, 
    contextUserId?: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('restaurant_id, user_id')
        .eq('id', orderId)
        .single();
        
      if (error) return false;
      
      if (contextRestaurantId) {
        return data.restaurant_id === contextRestaurantId;
      }
      
      if (contextUserId) {
        return data.user_id === contextUserId;
      }
      
      return true; // Sin filtros, todas las órdenes son relevantes
    } catch (err) {
      console.error('Error checking order relevance:', err);
      return false;
    }
  };
  
  // Cargar una orden específica con su historial de eventos
  const loadOrderWithHistory = async (orderId: string) => {
    try {
      // Cargar el agregado
      const orderAggregate = new OrderAggregate(eventStore);
      await orderAggregate.loadFromHistory(orderId);
      
      // Obtener todos los eventos
      const events = await eventStore.getEvents('order', orderId);
      
      // Reconstruir el estado actual
      return {
        order: orderAggregate.getState(),
        events
      };
    } catch (error) {
      console.error('Error loading order with history:', error);
      throw error;
    }
  };
  
  // Crear una nueva orden
  const createOrder = async (orderData: {
    restaurantId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      price: number;
      notes?: string;
    }>;
    deliveryAddress: string;
    deliveryNotes?: string;
    deliveryFee: number;
  }) => {
    try {
      if (!user) throw new Error('User must be authenticated to create orders');
      
      // Usar el comando para crear la orden
      const { CreateOrderCommand } = await import('@/commands/orderCommands');
      const command = new CreateOrderCommand();
      
      const orderId = await command.execute({
        ...orderData,
        userId: user.id
      }, {
        userId: user.id,
        source: 'web_app'
      });
      
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };
  
  // Añadir item a una orden
  const addOrderItem = async (
    orderId: string, 
    item: {
      menuItemId: string;
      quantity: number;
      price: number;
      notes?: string;
    }
  ) => {
    try {
      // Usar el comando para añadir item
      const { AddOrderItemCommand } = await import('@/commands/orderCommands');
      const command = new AddOrderItemCommand();
      
      await command.execute(orderId, item, {
        userId: user?.id,
        source: 'web_app'
      });
    } catch (error) {
      console.error('Error adding order item:', error);
      throw error;
    }
  };
  
  // Enviar orden
  const submitOrder = async (
    orderId: string,
    paymentData: {
      paymentMethod: string;
      paymentIntentId?: string;
    }
  ) => {
    try {
      // Usar el comando para enviar orden
      const { SubmitOrderCommand } = await import('@/commands/orderCommands');
      const command = new SubmitOrderCommand();
      
      await command.execute(orderId, paymentData, {
        userId: user?.id,
        source: 'web_app'
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  };
  
  // Permitir a restaurantes aceptar órdenes
  const acceptOrder = async (
    orderId: string,
    data: {
      estimatedPrepTime: number;
      note?: string;
    }
  ) => {
    try {
      // Verificar que el usuario sea dueño del restaurante
      if (!restaurantId) throw new Error('Restaurant ID is required to accept orders');
      
      // Usar el comando para aceptar orden
      const { AcceptOrderCommand } = await import('@/commands/orderCommands');
      const command = new AcceptOrderCommand();
      
      await command.execute(orderId, data, {
        userId: user?.id,
        restaurantId,
        source: 'web_app'
      });
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  };
  
  // Varios métodos más para cada operación posible del agregado
  
  // Método para refrescar manualmente la lista de órdenes
  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('orders')
        .select(includeDetails 
          ? 'id, status, total, delivery_address, delivery_fee, delivery_notes, estimated_delivery_time, actual_delivery_time, created_at, updated_at, restaurant:restaurant_id(*), user:user_id(*)' 
          : 'id, status, total, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      // Filtrar por restaurante o usuario según el contexto
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      } else if (user) {
        query = query.eq('user_id', user.id);
      }
      
      // Filtrar por estado si se especifica
      if (status && status.length > 0) {
        query = query.in('status', status);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Si se requieren los ítems, cargarlos
      if (includeDetails && data && data.length > 0) {
        const orderIds = data.map(o => o.id);
        
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
          
        if (itemsError) throw itemsError;
        
        // Agrupar items por orden
        const itemsByOrderId = items.reduce((acc, item) => {
          acc[item.order_id] = acc[item.order_id] || [];
          acc[item.order_id].push(item);
          return acc;
        }, {});
        
        // Añadir items a cada orden
        const ordersWithItems = data.map(order => ({
          ...order,
          items: itemsByOrderId[order.id] || []
        }));
        
        setOrders(ordersWithItems);
      } else {
        setOrders(data || []);
      }
    } catch (err: any) {
      console.error('Error refreshing orders:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    isLoading,
    error,
    loadOrderWithHistory,
    createOrder,
    addOrderItem,
    submitOrder,
    acceptOrder,
    refresh,
    // otros métodos del hook
  };
}