import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase/client';

interface EventSourcedEntity {
  id: string;
  version: number;
  [key: string]: any;
}

interface UseEventSourcingOptions<T extends EventSourcedEntity> {
  aggregateType: string;
  aggregateId?: string;
  initialState?: T;
  onEvents?: (events: any[]) => T;
}

/**
 * React hook for working with Event Sourced entities in DysaEats2
 * 
 * This hook helps in:
 * 1. Loading an entity by fetching its events
 * 2. Subscribing to new events via Supabase realtime
 * 3. Issuing commands to modify the entity
 * 4. Automatically updating local state when new events occur
 */
export function useEventSourcing<T extends EventSourcedEntity>({
  aggregateType,
  aggregateId,
  initialState,
  onEvents
}: UseEventSourcingOptions<T>) {
  const [entity, setEntity] = useState<T | null>(initialState || null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch events from the event store
      const { data, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('aggregate_type', aggregateType)
        .eq('aggregate_id', id)
        .order('version', { ascending: true });

      if (eventsError) {
        throw new eventsError;
      }

      if (data) {
        setEvents(data);
        
        // If a custom event handler is provided, use it
        if (onEvents) {
          const updatedEntity = onEvents(data);
          setEntity(updatedEntity);
        } else {
          // Basic event processing
          const entityState = data.reduce((acc, event) => {
            return {
              ...acc,
              ...event.data,
              id: event.aggregate_id,
              version: event.version
            };
          }, {} as T);
          
          setEntity(entityState as T);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [aggregateType, onEvents]);

  // Load entity when aggregateId changes
  useEffect(() => {
    if (aggregateId) {
      fetchEvents(aggregateId);
    }
  }, [aggregateId, fetchEvents]);

  // Subscribe to realtime events
  useEffect(() => {
    if (!aggregateId) return;

    // Subscribe to new events for this aggregate
    const subscription = supabase
      .channel(`events-${aggregateType}-${aggregateId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'events',
        filter: `aggregate_id=eq.${aggregateId}`
      }, (payload) => {
        // Update local events array
        setEvents(prev => [...prev, payload.new]);
        
        // Update entity state
        if (onEvents) {
          setEntity(prev => onEvents([...events, payload.new]));
        } else {
          setEntity(prev => ({
            ...prev,
            ...payload.new.data,
            version: payload.new.version
          } as T));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [aggregateId, aggregateType, events, onEvents]);

  // Generic command function
  const executeCommand = async (commandName: string, payload: any): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/commands/${commandName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Command execution failed');
      }

      const result = await response.json();
      
      // Immediately update client state without waiting for subscription
      if (result.entity) {
        setEntity(result.entity);
      }
      
      return result.entity;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Command execution failed'));
      console.error(`Error executing command ${commandName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    entity,
    events,
    loading,
    error,
    refresh: aggregateId ? () => fetchEvents(aggregateId) : null,
    executeCommand
  };
}

/**
 * Order-specific Event Sourcing hook with pre-configured commands
 */
export function useEventSourcedOrder(orderId?: string) {
  const { 
    entity: order, 
    events, 
    loading, 
    error, 
    refresh,
    executeCommand 
  } = useEventSourcing({
    aggregateType: 'order',
    aggregateId: orderId
  });
  
  // Order-specific commands
  const createOrder = useCallback((userId: string, restaurantId: string, items: any[]) => {
    return executeCommand('create-order', { userId, restaurantId, items });
  }, [executeCommand]);
  
  const addOrderItem = useCallback((itemData: any) => {
    if (!orderId) throw new Error('Order ID is required');
    return executeCommand('add-order-item', { orderId, item: itemData });
  }, [executeCommand, orderId]);
  
  const removeOrderItem = useCallback((itemId: string) => {
    if (!orderId) throw new Error('Order ID is required');
    return executeCommand('remove-order-item', { orderId, itemId });
  }, [executeCommand, orderId]);
  
  const updateOrderStatus = useCallback((status: string) => {
    if (!orderId) throw new Error('Order ID is required');
    return executeCommand('update-order-status', { orderId, status });
  }, [executeCommand, orderId]);
  
  const cancelOrder = useCallback((reason?: string) => {
    if (!orderId) throw new Error('Order ID is required');
    return executeCommand('cancel-order', { orderId, reason });
  }, [executeCommand, orderId]);
  
  return {
    order,
    events,
    loading,
    error,
    refresh,
    createOrder,
    addOrderItem,
    removeOrderItem,
    updateOrderStatus,
    cancelOrder
  };
}

/**
 * Restaurant-specific Event Sourcing hook with pre-configured commands
 */
export function useEventSourcedRestaurant(restaurantId?: string) {
  const { 
    entity: restaurant, 
    events, 
    loading, 
    error, 
    refresh,
    executeCommand 
  } = useEventSourcing({
    aggregateType: 'restaurant',
    aggregateId: restaurantId
  });
  
  // Restaurant-specific commands
  const createRestaurant = useCallback((data: { 
    name: string; 
    address: string; 
    phone: string; 
    email: string;
    logo?: string;
    description?: string;
  }) => {
    return executeCommand('create-restaurant', data);
  }, [executeCommand]);
  
  const updateRestaurant = useCallback((updates: any) => {
    if (!restaurantId) throw new Error('Restaurant ID is required');
    return executeCommand('update-restaurant', { restaurantId, ...updates });
  }, [executeCommand, restaurantId]);
  
  const addMenuCategory = useCallback((name: string, description?: string) => {
    if (!restaurantId) throw new Error('Restaurant ID is required');
    return executeCommand('add-menu-category', { restaurantId, name, description });
  }, [executeCommand, restaurantId]);
  
  const updateMenuCategory = useCallback((categoryId: string, updates: any) => {
    if (!restaurantId) throw new Error('Restaurant ID is required');
    return executeCommand('update-menu-category', { restaurantId, categoryId, ...updates });
  }, [executeCommand, restaurantId]);
  
  const removeMenuCategory = useCallback((categoryId: string) => {
    if (!restaurantId) throw new Error('Restaurant ID is required');
    return executeCommand('remove-menu-category', { restaurantId, categoryId });
  }, [executeCommand, restaurantId]);
  
  const addMenuItem = useCallback((
    categoryId: string, 
    name: string, 
    price: number, 
    description?: string, 
    image?: string
  ) => {
    if (!restaurantId) throw new Error('Restaurant ID is required');
    return executeCommand('add-menu-item', { 
      restaurantId, 
      categoryId, 
      name, 
      price, 
      description, 
      image 
    });
  }, [executeCommand, restaurantId]);
  
  const updateMenuItem = useCallback((categoryId: string, itemId: string, updates: any) => {
    if (!restaurantId) throw new Error('Restaurant ID is required');
    return executeCommand('update-menu-item', { 
      restaurantId, 
      categoryId, 
      itemId, 
      ...updates 
    });
  }, [executeCommand, restaurantId]);
  
  const removeMenuItem = useCallback((categoryId: string, itemId: string) => {
    if (!restaurantId) throw new Error('Restaurant ID is required');
    return executeCommand('remove-menu-item', { restaurantId, categoryId, itemId });
  }, [executeCommand, restaurantId]);
  
  return {
    restaurant,
    events,
    loading,
    error,
    refresh,
    createRestaurant,
    updateRestaurant,
    addMenuCategory,
    updateMenuCategory,
    removeMenuCategory,
    addMenuItem,
    updateMenuItem,
    removeMenuItem
  };
}

/**
 * Delivery-specific Event Sourcing hook with pre-configured commands
 */
export function useEventSourcedDelivery(deliveryId?: string) {
  const { 
    entity: delivery, 
    events, 
    loading, 
    error, 
    refresh,
    executeCommand 
  } = useEventSourcing({
    aggregateType: 'delivery',
    aggregateId: deliveryId
  });
  
  // Delivery-specific commands
  const createDelivery = useCallback((data: {
    orderId: string;
    pickupAddress: string;
    deliveryAddress: string;
    estimatedDeliveryTime?: Date;
    notes?: string;
  }) => {
    return executeCommand('create-delivery', data);
  }, [executeCommand]);
  
  const assignDelivery = useCallback((deliveryPersonId: string) => {
    if (!deliveryId) throw new Error('Delivery ID is required');
    return executeCommand('assign-delivery', { deliveryId, deliveryPersonId });
  }, [executeCommand, deliveryId]);
  
  const updateDeliveryStatus = useCallback((status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled') => {
    if (!deliveryId) throw new Error('Delivery ID is required');
    return executeCommand('update-delivery-status', { deliveryId, status });
  }, [executeCommand, deliveryId]);
  
  const updateDeliveryLocation = useCallback((latitude: number, longitude: number) => {
    if (!deliveryId) throw new Error('Delivery ID is required');
    return executeCommand('update-delivery-location', { deliveryId, latitude, longitude });
  }, [executeCommand, deliveryId]);
  
  const completeDelivery = useCallback((actualDeliveryTime?: Date) => {
    if (!deliveryId) throw new Error('Delivery ID is required');
    return executeCommand('complete-delivery', { 
      deliveryId, 
      actualDeliveryTime: actualDeliveryTime?.toISOString() 
    });
  }, [executeCommand, deliveryId]);
  
  const cancelDelivery = useCallback((reason?: string) => {
    if (!deliveryId) throw new Error('Delivery ID is required');
    return executeCommand('cancel-delivery', { deliveryId, reason });
  }, [executeCommand, deliveryId]);
  
  return {
    delivery,
    events,
    loading,
    error,
    refresh,
    createDelivery,
    assignDelivery,
    updateDeliveryStatus,
    updateDeliveryLocation,
    completeDelivery,
    cancelDelivery
  };
}

/**
 * Payment-specific Event Sourcing hook with pre-configured commands
 */
export function useEventSourcedPayment(paymentId?: string) {
  const { 
    entity: payment, 
    events, 
    loading, 
    error, 
    refresh,
    executeCommand 
  } = useEventSourcing({
    aggregateType: 'payment',
    aggregateId: paymentId
  });
  
  // Payment-specific commands
  const createPayment = useCallback((data: {
    orderId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    currency?: string;
    metadata?: Record<string, any>;
  }) => {
    return executeCommand('create-payment', data);
  }, [executeCommand]);
  
  const authorizePayment = useCallback((paymentIntentId: string) => {
    if (!paymentId) throw new Error('Payment ID is required');
    return executeCommand('authorize-payment', { paymentId, paymentIntentId });
  }, [executeCommand, paymentId]);
  
  const capturePayment = useCallback((chargeId: string) => {
    if (!paymentId) throw new Error('Payment ID is required');
    return executeCommand('capture-payment', { paymentId, chargeId });
  }, [executeCommand, paymentId]);
  
  const refundPayment = useCallback((refundId: string, amount?: number) => {
    if (!paymentId) throw new Error('Payment ID is required');
    return executeCommand('refund-payment', { paymentId, refundId, amount });
  }, [executeCommand, paymentId]);
  
  const failPayment = useCallback((reason: string) => {
    if (!paymentId) throw new Error('Payment ID is required');
    return executeCommand('fail-payment', { paymentId, reason });
  }, [executeCommand, paymentId]);
  
  const voidPayment = useCallback((reason?: string) => {
    if (!paymentId) throw new Error('Payment ID is required');
    return executeCommand('void-payment', { paymentId, reason });
  }, [executeCommand, paymentId]);
  
  return {
    payment,
    events,
    loading,
    error,
    refresh,
    createPayment,
    authorizePayment,
    capturePayment,
    refundPayment,
    failPayment,
    voidPayment
  };
}