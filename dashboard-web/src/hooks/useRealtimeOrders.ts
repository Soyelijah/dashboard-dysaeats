import { useState, useEffect } from 'react';
import { useSupabaseRealtime } from './useSupabaseRealtime';
import { orderService } from '@/services/supabase/orderService';
import { Tables } from '@/services/supabase/client';

type OrderWithItems = Tables['orders'] & {
  items: Tables['order_items'][];
  restaurant: Tables['restaurants'];
};

type UseRealtimeOrdersOptions = {
  restaurantId?: string;
  userId?: string;
  status?: string[];
  enabled?: boolean;
  includeItems?: boolean;
};

/**
 * Hook for real-time order management
 * 
 * @param options Configuration options
 * @returns Orders data and state
 */
export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const {
    restaurantId,
    userId,
    status,
    enabled = true,
    includeItems = true,
  } = options;
  
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Filter construction
  const getFilter = () => {
    const filters = [];
    if (restaurantId) filters.push(`restaurant_id=eq.${restaurantId}`);
    if (userId) filters.push(`user_id=eq.${userId}`);
    if (status && status.length) {
      const statusFilter = status.map(s => `'${s}'`).join(',');
      filters.push(`status=in.(${statusFilter})`);
    }
    return filters.length ? filters.join(',') : undefined;
  };

  // Initial data fetch
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        let fetchedOrders;
        
        if (restaurantId) {
          fetchedOrders = await orderService.getOrdersByRestaurant(restaurantId, includeItems);
        } else if (userId) {
          fetchedOrders = await orderService.getOrdersByUser(userId, includeItems);
        } else {
          fetchedOrders = await orderService.getAllOrders(includeItems);
        }
        
        // Apply status filter if needed
        if (status && status.length) {
          fetchedOrders = fetchedOrders.filter(order => status.includes(order.status));
        }
        
        setOrders(fetchedOrders);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [enabled, restaurantId, userId, status?.join(','), includeItems]);

  // Subscribe to order inserts
  useSupabaseRealtime(
    {
      table: 'orders',
      event: 'INSERT',
      filter: getFilter()
    },
    async (payload) => {
      try {
        const newOrder = payload.new as Tables['orders'];
        
        // Fetch complete order with items if needed
        if (includeItems) {
          const completeOrder = await orderService.getOrderById(newOrder.id, true);
          if (completeOrder) {
            setOrders(prevOrders => [...prevOrders, completeOrder as OrderWithItems]);
          }
        } else {
          // Just add the basic order
          setOrders(prevOrders => [...prevOrders, newOrder as OrderWithItems]);
        }
      } catch (err) {
        console.error('Error processing new order:', err);
      }
    },
    { enabled }
  );

  // Subscribe to order updates
  useSupabaseRealtime(
    {
      table: 'orders',
      event: 'UPDATE',
      filter: getFilter()
    },
    (payload) => {
      try {
        const updatedOrder = payload.new as Tables['orders'];
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === updatedOrder.id 
              ? { ...order, ...updatedOrder } 
              : order
          )
        );
      } catch (err) {
        console.error('Error processing order update:', err);
      }
    },
    { enabled }
  );

  // Subscribe to order deletions
  useSupabaseRealtime(
    {
      table: 'orders',
      event: 'DELETE',
      filter: getFilter()
    },
    (payload) => {
      try {
        const deletedOrder = payload.old as Tables['orders'];
        setOrders(prevOrders => prevOrders.filter(order => order.id !== deletedOrder.id));
      } catch (err) {
        console.error('Error processing order deletion:', err);
      }
    },
    { enabled }
  );

  return {
    orders,
    isLoading,
    error,
    refresh: async () => {
      setIsLoading(true);
      try {
        let refreshedOrders;
        if (restaurantId) {
          refreshedOrders = await orderService.getOrdersByRestaurant(restaurantId, includeItems);
        } else if (userId) {
          refreshedOrders = await orderService.getOrdersByUser(userId, includeItems);
        } else {
          refreshedOrders = await orderService.getAllOrders(includeItems);
        }
        
        if (status && status.length) {
          refreshedOrders = refreshedOrders.filter(order => status.includes(order.status));
        }
        
        setOrders(refreshedOrders);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to refresh orders'));
      } finally {
        setIsLoading(false);
      }
    }
  };
}
