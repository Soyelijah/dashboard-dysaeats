import { supabase } from './client';

type SubscriptionCallback = (payload: any) => void;
type SubscriptionWithId = { id: string; unsubscribe: () => void };

export const realtimeService = {
  // Subscribe to table changes
  subscribeToTable: (
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: SubscriptionCallback,
    filter?: string
  ): SubscriptionWithId => {
    const id = `${table}:${event}:${Date.now()}`;
    
    const channel = supabase
      .channel(id)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter
        },
        (payload) => callback(payload)
      )
      .subscribe();
    
    return {
      id,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },
  
  // Subscribe to record changes
  subscribeToRecord: (
    table: string,
    recordId: string,
    callback: SubscriptionCallback
  ): SubscriptionWithId => {
    const id = `${table}:${recordId}:${Date.now()}`;
    const filter = `id=eq.${recordId}`;
    
    const channel = supabase
      .channel(id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter
        },
        (payload) => callback(payload)
      )
      .subscribe();
    
    return {
      id,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },
  
  // Subscribe to new orders for a restaurant
  subscribeToRestaurantOrders: (
    restaurantId: string,
    callback: SubscriptionCallback
  ): SubscriptionWithId => {
    const id = `restaurant:${restaurantId}:orders:${Date.now()}`;
    const filter = `restaurant_id=eq.${restaurantId}`;
    
    const channel = supabase
      .channel(id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter
        },
        (payload) => callback(payload)
      )
      .subscribe();
    
    return {
      id,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },
  
  // Subscribe to order status changes
  subscribeToOrderStatusChanges: (
    orderId: string,
    callback: SubscriptionCallback
  ): SubscriptionWithId => {
    const id = `order:${orderId}:status:${Date.now()}`;
    const filter = `id=eq.${orderId}`;
    
    const channel = supabase
      .channel(id)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter
        },
        (payload) => callback(payload)
      )
      .subscribe();
    
    return {
      id,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },
  
  // Subscribe to delivery location updates
  subscribeToDeliveryLocation: (
    deliveryPersonId: string,
    callback: SubscriptionCallback
  ): SubscriptionWithId => {
    const id = `delivery_person:${deliveryPersonId}:location:${Date.now()}`;
    const filter = `id=eq.${deliveryPersonId}`;
    
    const channel = supabase
      .channel(id)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_people',
          filter
        },
        (payload) => callback(payload)
      )
      .subscribe();
    
    return {
      id,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },
  
  // Subscribe to user notifications
  subscribeToUserNotifications: (
    userId: string,
    callback: SubscriptionCallback
  ): SubscriptionWithId => {
    const id = `user:${userId}:notifications:${Date.now()}`;
    const filter = `user_id=eq.${userId}`;
    
    const channel = supabase
      .channel(id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter
        },
        (payload) => callback(payload)
      )
      .subscribe();
    
    return {
      id,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },
  
  // Unsubscribe from all channels
  unsubscribeAll: () => {
    supabase.removeAllChannels();
  }
};