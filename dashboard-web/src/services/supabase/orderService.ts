import { supabase, Tables } from './client';

export type Order = Tables['orders'];
export type OrderItem = Tables['order_items'];
export type OrderAssignment = Tables['order_assignments'];

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';

export type OrderWithItems = Order & {
  items?: OrderItem[];
  restaurant?: Tables['restaurants'];
  customer?: Partial<Tables['users']>;
  payment?: Tables['payments'];
  delivery_assignment?: OrderAssignment & {
    delivery_person?: Tables['delivery_people'] & {
      user?: Partial<Tables['users']>;
    };
  };
};

export const orderService = {
  // Get all orders with filters
  getOrders: async (params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    restaurantId?: string;
    userId?: string;
    searchQuery?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    data: OrderWithItems[];
    count: number;
  }> => {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      restaurantId, 
      userId,
      searchQuery,
      startDate,
      endDate
    } = params;
    
    // Calculate range for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Start building query
    let query = supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurant_id(*),
        customer:user_id(id, email, first_name, last_name, phone),
        items:order_items(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Date range filtering
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Text search (this is limited in Supabase, consider RPC for more complex searches)
    if (searchQuery) {
      query = query.or(`customer.first_name.ilike.%${searchQuery}%,customer.last_name.ilike.%${searchQuery}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data as OrderWithItems[],
      count: count || 0
    };
  },
  
  // Get a single order by ID with all related data
  getOrderById: async (id: string): Promise<OrderWithItems> => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurant_id(*),
        customer:user_id(id, email, first_name, last_name, phone, address),
        items:order_items(*),
        payment:payments(*),
        delivery_assignment:order_assignments(
          *,
          delivery_person:delivery_person_id(
            *,
            user:user_id(id, email, first_name, last_name, phone)
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data as OrderWithItems;
  },
  
  // Create a new order
  createOrder: async (orderData: {
    userId: string;
    restaurantId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      price: number;
      notes?: string;
    }>;
    deliveryAddress?: string;
    deliveryNotes?: string;
    deliveryFee?: number;
  }): Promise<OrderWithItems> => {
    // Start a transaction
    const { data, error } = await supabase.rpc('create_order', {
      p_user_id: orderData.userId,
      p_restaurant_id: orderData.restaurantId,
      p_status: 'pending',
      p_delivery_address: orderData.deliveryAddress || null,
      p_delivery_notes: orderData.deliveryNotes || null,
      p_delivery_fee: orderData.deliveryFee || 0,
      p_items: JSON.stringify(orderData.items.map(item => ({
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || null
      })))
    });
    
    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    
    // Get the newly created order with full details
    return await this.getOrderById(data.id);
  },
  
  // Update order status
  updateOrderStatus: async (
    id: string, 
    status: OrderStatus,
    additionalData: {
      estimatedDeliveryTime?: string;
      actualDeliveryTime?: string;
    } = {}
  ): Promise<OrderWithItems> => {
    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // Add additional fields if provided
    if (additionalData.estimatedDeliveryTime) {
      updateData.estimated_delivery_time = additionalData.estimatedDeliveryTime;
    }
    
    if (additionalData.actualDeliveryTime) {
      updateData.actual_delivery_time = additionalData.actualDeliveryTime;
    }
    
    // If order is being marked as delivered, set actual delivery time to now
    if (status === 'delivered' && !additionalData.actualDeliveryTime) {
      updateData.actual_delivery_time = new Date().toISOString();
    }
    
    // Update the order
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
    
    // Return updated order with full details
    return await this.getOrderById(id);
  },
  
  // Cancel an order
  cancelOrder: async (
    id: string, 
    cancellationReason: string
  ): Promise<OrderWithItems> => {
    // Update the order
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        delivery_notes: `Cancelled: ${cancellationReason}`, // Store reason in delivery notes
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
    
    // Return updated order with full details
    return await this.getOrderById(id);
  },
  
  // Assign delivery person to an order
  assignDeliveryPerson: async (
    orderId: string,
    deliveryPersonId: string
  ): Promise<OrderAssignment> => {
    // First check if order already has an assignment
    const { data: existingAssignments, error: checkError } = await supabase
      .from('order_assignments')
      .select('*')
      .eq('order_id', orderId);
    
    if (checkError) {
      console.error('Error checking existing assignments:', checkError);
      throw checkError;
    }
    
    // If there's an existing assignment, update it
    if (existingAssignments && existingAssignments.length > 0) {
      const { data, error } = await supabase
        .from('order_assignments')
        .update({
          delivery_person_id: deliveryPersonId,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating delivery assignment:', error);
        throw error;
      }
      
      return data as OrderAssignment;
    }
    
    // Otherwise, create a new assignment
    const { data, error } = await supabase
      .from('order_assignments')
      .insert({
        order_id: orderId,
        delivery_person_id: deliveryPersonId,
        assigned_at: new Date().toISOString(),
        status: 'assigned'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating delivery assignment:', error);
      throw error;
    }
    
    // Update order status to reflect assignment
    await this.updateOrderStatus(orderId, 'preparing');
    
    return data as OrderAssignment;
  },
  
  // Update delivery status
  updateDeliveryStatus: async (
    assignmentId: string,
    status: 'assigned' | 'accepted' | 'picked_up' | 'delivered' | 'rejected',
    location?: { lat: number; lng: number }
  ): Promise<OrderAssignment> => {
    // Start building update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // Add timestamp based on status
    if (status === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
    } else if (status === 'picked_up') {
      updateData.picked_up_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
    
    // Update the assignment
    const { data, error } = await supabase
      .from('order_assignments')
      .update(updateData)
      .eq('id', assignmentId)
      .select(`
        *,
        order:order_id(*)
      `)
      .single();
    
    if (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
    
    // If location provided, update delivery person's location
    if (location && data.delivery_person_id) {
      await supabase
        .from('delivery_people')
        .update({
          last_known_location: `POINT(${location.lng} ${location.lat})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.delivery_person_id);
    }
    
    // Update order status based on delivery status
    if (status === 'picked_up' && data.order?.id) {
      await this.updateOrderStatus(data.order.id, 'in_transit');
    } else if (status === 'delivered' && data.order?.id) {
      await this.updateOrderStatus(data.order.id, 'delivered');
    }
    
    return data as OrderAssignment;
  },
  
  // Get order statistics
  getOrderStatistics: async (
    restaurantId?: string,
    timeRange?: 'today' | 'week' | 'month' | 'year'
  ): Promise<{
    total: number;
    byStatus: Record<OrderStatus, number>;
    totalSales: number;
    averageOrderValue: number;
  }> => {
    // Define date range based on timeRange
    let startDate: string | null = null;
    const now = new Date();
    
    if (timeRange === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    } else if (timeRange === 'week') {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff)).toISOString();
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    }
    
    // Build query
    let query = supabase
      .from('orders')
      .select('id, status, total');
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting order statistics:', error);
      throw error;
    }
    
    // Calculate statistics
    const byStatus: Record<OrderStatus, number> = {
      pending: 0,
      preparing: 0,
      ready: 0,
      in_transit: 0,
      delivered: 0,
      cancelled: 0
    };
    
    let totalSales = 0;
    
    data.forEach(order => {
      // Count by status
      const status = order.status as OrderStatus;
      byStatus[status] = (byStatus[status] || 0) + 1;
      
      // Calculate sales (exclude cancelled orders)
      if (status !== 'cancelled') {
        totalSales += Number(order.total) || 0;
      }
    });
    
    // Calculate averages
    const completedOrders = data.filter(order => 
      order.status !== 'cancelled' && Number(order.total) > 0
    );
    
    const averageOrderValue = completedOrders.length > 0
      ? totalSales / completedOrders.length
      : 0;
    
    return {
      total: data.length,
      byStatus,
      totalSales,
      averageOrderValue
    };
  },
  
  // Get order timeline
  getOrderTimeline: async (
    orderId: string
  ): Promise<Array<{
    status: string;
    timestamp: string;
    description: string;
  }>> => {
    // Get order with assignment
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        delivery_assignment:order_assignments(*)
      `)
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error getting order timeline:', error);
      throw error;
    }
    
    const timeline = [];
    
    // Created
    timeline.push({
      status: 'created',
      timestamp: data.created_at,
      description: 'Order created'
    });
    
    // If order has gone through status changes
    if (data.status !== 'pending') {
      // Add intermediate statuses based on update timestamps and current status
      const assignment = Array.isArray(data.delivery_assignment) 
        ? data.delivery_assignment[0] 
        : data.delivery_assignment;
      
      if (data.status === 'preparing' || data.status === 'ready' || 
          data.status === 'in_transit' || data.status === 'delivered') {
        timeline.push({
          status: 'preparing',
          timestamp: data.updated_at,
          description: 'Restaurant is preparing your order'
        });
      }
      
      if (data.status === 'ready' || data.status === 'in_transit' || data.status === 'delivered') {
        timeline.push({
          status: 'ready',
          timestamp: data.updated_at,
          description: 'Order is ready for pickup'
        });
      }
      
      if (data.status === 'in_transit' || data.status === 'delivered') {
        timeline.push({
          status: 'in_transit',
          timestamp: assignment?.picked_up_at || data.updated_at,
          description: 'Order is on the way'
        });
      }
      
      if (data.status === 'delivered') {
        timeline.push({
          status: 'delivered',
          timestamp: data.actual_delivery_time || assignment?.delivered_at || data.updated_at,
          description: 'Order delivered'
        });
      }
      
      if (data.status === 'cancelled') {
        timeline.push({
          status: 'cancelled',
          timestamp: data.updated_at,
          description: 'Order cancelled'
        });
      }
    }
    
    // Sort by timestamp
    return timeline.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
};