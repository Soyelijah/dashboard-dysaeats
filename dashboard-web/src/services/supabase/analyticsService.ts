import { supabase } from './client';
import { orderService } from './orderService';
import { paymentService } from './paymentService';
import { restaurantService } from './restaurantService';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { calculatePercentChange } from '@/lib/utils';

export type TimeRange = 'today' | 'week' | 'month' | 'year';
export type DateRange = 'day' | 'week' | 'month' | 'year';

export type RestaurantStats = {
  revenue: number;
  orders: number;
  customers: number;
  menuItems: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
};

export const analyticsService = {
  /**
   * Get restaurant statistics
   */
  getRestaurantStats: async (restaurantId: string): Promise<RestaurantStats> => {
    try {
      // Get current period data
      const currentPeriodStart = startOfMonth(new Date());
      const currentPeriodFormatted = format(currentPeriodStart, 'yyyy-MM-dd');
      
      // Get previous period data
      const previousPeriodStart = startOfMonth(new Date(currentPeriodStart));
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
      const previousPeriodFormatted = format(previousPeriodStart, 'yyyy-MM-dd');

      // Get revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', currentPeriodFormatted);

      // Get previous period revenue
      const { data: prevRevenueData, error: prevRevenueError } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', previousPeriodFormatted)
        .lt('created_at', currentPeriodFormatted);

      // Get orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .gte('created_at', currentPeriodFormatted);

      // Get previous period orders count
      const { count: prevOrdersCount, error: prevOrdersError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .gte('created_at', previousPeriodFormatted)
        .lt('created_at', currentPeriodFormatted);

      // Get unique customers
      const { data: customersData, error: customersError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', currentPeriodFormatted);

      // Get previous period unique customers
      const { data: prevCustomersData, error: prevCustomersError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', previousPeriodFormatted)
        .lt('created_at', currentPeriodFormatted);

      // Get menu items count
      const { count: menuItemsCount, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('id', { count: 'exact' })
        .eq('restaurant_id', restaurantId);

      // Calculate revenue
      const revenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const prevRevenue = prevRevenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      // Count unique customers
      const uniqueCustomers = new Set(customersData?.map(order => order.user_id) || []).size;
      const prevUniqueCustomers = new Set(prevCustomersData?.map(order => order.user_id) || []).size;

      // Calculate percent changes
      const revenueChange = calculatePercentChange(revenue, prevRevenue);
      const ordersChange = calculatePercentChange(ordersCount || 0, prevOrdersCount || 0);
      const customersChange = calculatePercentChange(uniqueCustomers, prevUniqueCustomers);

      return {
        revenue,
        orders: ordersCount || 0,
        customers: uniqueCustomers,
        menuItems: menuItemsCount || 0,
        revenueChange,
        ordersChange,
        customersChange,
      };
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
      throw new Error('Failed to fetch restaurant statistics');
    }
  },

  /**
   * Get restaurant performance metrics
   */
  getRestaurantPerformance: async (restaurantId?: string, period: DateRange = 'week') => {
    try {
      const now = new Date();
      let startDate;

      // Determine start date based on period
      switch (period) {
        case 'day':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        case 'year':
          startDate = startOfYear(now);
          break;
        default:
          startDate = startOfWeek(now, { weekStartsOn: 1 });
      }

      const formattedStartDate = format(startDate, 'yyyy-MM-dd');

      // Get sales data
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('created_at, total, restaurant_id')
        .gte('created_at', formattedStartDate)
        .order('created_at', { ascending: true });
      
      let filteredSalesData = salesData || [];
      if (restaurantId && filteredSalesData.length > 0) {
        // Add restaurant filter if provided
        filteredSalesData = filteredSalesData.filter(order => order.restaurant_id === restaurantId);
      }

      // Get orders data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('created_at, restaurant_id')
        .gte('created_at', formattedStartDate)
        .order('created_at', { ascending: true });
      
      let filteredOrdersData = ordersData || [];
      if (restaurantId && filteredOrdersData.length > 0) {
        // Add restaurant filter if provided
        filteredOrdersData = filteredOrdersData.filter(order => order.restaurant_id === restaurantId);
      }

      // Get customers data
      const { data: customersData, error: customersError } = await supabase
        .from('orders')
        .select('created_at, user_id, restaurant_id')
        .gte('created_at', formattedStartDate)
        .order('created_at', { ascending: true });
      
      let filteredCustomersData = customersData || [];
      if (restaurantId && filteredCustomersData.length > 0) {
        // Add restaurant filter if provided
        filteredCustomersData = filteredCustomersData.filter(order => order.restaurant_id === restaurantId);
      }

      // Get top menu items
      const { data: menuItemData, error: menuItemError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          menu_item_id,
          order_id,
          orders!inner(restaurant_id, created_at)
        `)
        .gte('orders.created_at', formattedStartDate);
      
      let filteredMenuItemData = menuItemData || [];
      if (restaurantId && filteredMenuItemData.length > 0) {
        // Add restaurant filter if provided
        filteredMenuItemData = filteredMenuItemData.filter(item => item.orders?.restaurant_id === restaurantId);
      }
      
      // Get menu item names
      const menuItemIds = filteredMenuItemData.map(item => item.menu_item_id);
      const { data: menuItems, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('id, name')
        .in('id', menuItemIds);
      
      // Create a mapping of menu item IDs to names
      const menuItemNames: Record<string, string> = {};
      if (menuItems) {
        menuItems.forEach(item => {
          menuItemNames[item.id] = item.name;
        });
      }

      // Process data for charts
      // Group sales by date
      const salesByDate = groupByDate(filteredSalesData, period);
      const salesChartData = Object.entries(salesByDate).map(([date, orders]) => ({
        date,
        amount: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      }));

      // Group orders by date
      const ordersByDate = groupByDate(filteredOrdersData, period);
      const ordersChartData = Object.entries(ordersByDate).map(([date, orders]) => ({
        date,
        count: orders.length,
      }));

      // Group customers by date
      const customersByDate = groupByDate(filteredCustomersData, period);
      const customersChartData = Object.entries(customersByDate).map(([date, orders]) => {
        const uniqueUsers = new Set(orders.map(order => order.user_id)).size;
        return {
          date,
          count: uniqueUsers,
        };
      });

      // Process top items
      const itemCounts: Record<string, { count: number; name: string }> = {};
      filteredMenuItemData.forEach(item => {
        const id = item.menu_item_id;
        const name = menuItemNames[id] || 'Unknown Item';
        const quantity = item.quantity || 0;
        
        if (!itemCounts[id]) {
          itemCounts[id] = { count: 0, name };
        }
        itemCounts[id].count += quantity;
      });

      // Get top 5 items
      const topItems = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => ({ name: item.name, count: item.count }));

      return {
        sales: salesChartData,
        orders: ordersChartData,
        customers: customersChartData,
        topItems,
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw new Error('Failed to fetch performance metrics');
    }
  },
  
  // Helper function for grouping data by date
  _groupByDate: (data: any[], period: DateRange) => {
    return groupByDate(data, period);
  },
  
  //
  // Get dashboard data for a restaurant
  getDashboardData: async (
    restaurantId: string,
    timeRange: TimeRange = 'month'
  ): Promise<{
    orderStats: {
      total: number;
      byStatus: Record<string, number>;
      averageOrderValue: number;
      totalSales: number;
    };
    paymentStats: {
      totalPayments: number;
      totalAmount: number;
      byMethod: Record<string, { count: number; amount: number }>;
    };
    topMenuItems: Array<{
      id: string;
      name: string;
      totalOrders: number;
      totalAmount: number;
    }>;
    deliveryPerformance: {
      averageDeliveryTime: number;
      onTimeDeliveryRate: number;
    };
  }> => {
    // Get date range based on timeRange
    const now = new Date();
    let startDate: string;
    
    if (timeRange === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    } else if (timeRange === 'week') {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff)).toISOString();
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    }
    
    // Get all data in parallel
    const [orderStats, paymentStats, topMenuItems, deliveryPerformance] = await Promise.all([
      // Order statistics
      orderService.getOrderStatistics(restaurantId, timeRange),
      
      // Payment statistics
      paymentService.getPaymentStatistics({
        restaurantId,
        startDate
      }),
      
      // Top menu items
      this.getTopMenuItems(restaurantId, startDate),
      
      // Delivery performance
      this.getDeliveryPerformance(restaurantId, startDate)
    ]);
    
    return {
      orderStats,
      paymentStats,
      topMenuItems,
      deliveryPerformance
    };
  },
  
  // Get top menu items by orders and revenue
  getTopMenuItems: async (
    restaurantId: string,
    startDate: string,
    limit: number = 5
  ): Promise<Array<{
    id: string;
    name: string;
    totalOrders: number;
    totalAmount: number;
  }>> => {
    // We need to:
    // 1. Get all orders for this restaurant in the time range
    // 2. For each order, get its items
    // 3. Count occurrences of each menu item and sum up revenue
    
    // Get orders for the restaurant in the time range
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDate)
      .not('status', 'eq', 'cancelled');
    
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // Get all order items for these orders
    const orderIds = orders.map(order => order.id);
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        menu_item_id,
        quantity,
        price
      `)
      .in('order_id', orderIds);
    
    if (!orderItems || orderItems.length === 0) {
      return [];
    }
    
    // Count occurrences and sum amounts by menu item
    const menuItemStats: Record<string, { count: number; amount: number }> = {};
    
    orderItems.forEach(item => {
      const menuItemId = item.menu_item_id;
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      
      if (!menuItemStats[menuItemId]) {
        menuItemStats[menuItemId] = { count: 0, amount: 0 };
      }
      
      menuItemStats[menuItemId].count += quantity;
      menuItemStats[menuItemId].amount += price * quantity;
    });
    
    // Get menu item details for the IDs we have
    const menuItemIds = Object.keys(menuItemStats);
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name')
      .in('id', menuItemIds);
    
    if (!menuItems) {
      return [];
    }
    
    // Create result array with names and stats
    const result = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      totalOrders: menuItemStats[item.id]?.count || 0,
      totalAmount: menuItemStats[item.id]?.amount || 0
    }));
    
    // Sort by order count descending and take top N
    return result
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, limit);
  },
  
  // Get delivery performance metrics
  getDeliveryPerformance: async (
    restaurantId: string,
    startDate: string
  ): Promise<{
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
  }> => {
    // Get completed orders with delivery times
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        estimated_delivery_time,
        actual_delivery_time
      `)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'delivered')
      .gte('created_at', startDate);
    
    if (!orders || orders.length === 0) {
      return {
        averageDeliveryTime: 0,
        onTimeDeliveryRate: 0
      };
    }
    
    // Calculate delivery times and on-time rate
    let totalDeliveryTime = 0;
    let onTimeCount = 0;
    let ordersWithDeliveryTimes = 0;
    
    orders.forEach(order => {
      if (order.actual_delivery_time && order.created_at) {
        // Calculate delivery time in minutes
        const orderTime = new Date(order.created_at).getTime();
        const deliveryTime = new Date(order.actual_delivery_time).getTime();
        const deliveryTimeMinutes = Math.round((deliveryTime - orderTime) / (1000 * 60));
        
        totalDeliveryTime += deliveryTimeMinutes;
        ordersWithDeliveryTimes++;
        
        // Check if delivered on time
        if (order.estimated_delivery_time) {
          const estimatedTime = new Date(order.estimated_delivery_time).getTime();
          if (deliveryTime <= estimatedTime) {
            onTimeCount++;
          }
        }
      }
    });
    
    // Calculate averages
    const averageDeliveryTime = ordersWithDeliveryTimes > 0
      ? Math.round(totalDeliveryTime / ordersWithDeliveryTimes)
      : 0;
    
    const ordersWithEstimates = orders.filter(o => o.estimated_delivery_time && o.actual_delivery_time).length;
    const onTimeDeliveryRate = ordersWithEstimates > 0
      ? onTimeCount / ordersWithEstimates
      : 0;
    
    return {
      averageDeliveryTime,
      onTimeDeliveryRate
    };
  },
  
  // Get restaurant statistics (revenue, orders, etc.)
  getRestaurantStatistics: async (
    timeRange: TimeRange = 'month',
    topCount: number = 10
  ): Promise<{
    totalRestaurants: number;
    totalOrders: number;
    totalRevenue: number;
    topRestaurants: Array<{
      id: string;
      name: string;
      totalOrders: number;
      totalRevenue: number;
    }>;
  }> => {
    // Get date range
    const now = new Date();
    let startDate: string;
    
    if (timeRange === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    } else if (timeRange === 'week') {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff)).toISOString();
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    }
    
    // Get all restaurants
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name');
    
    if (!restaurants || restaurants.length === 0) {
      return {
        totalRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        topRestaurants: []
      };
    }
    
    // Get all orders in the time range
    const { data: orders } = await supabase
      .from('orders')
      .select('id, restaurant_id, total, status')
      .gte('created_at', startDate)
      .not('status', 'eq', 'cancelled');
    
    if (!orders || orders.length === 0) {
      return {
        totalRestaurants: restaurants.length,
        totalOrders: 0,
        totalRevenue: 0,
        topRestaurants: []
      };
    }
    
    // Calculate statistics by restaurant
    const restaurantStats: Record<string, { orders: number; revenue: number }> = {};
    let totalOrders = 0;
    let totalRevenue = 0;
    
    orders.forEach(order => {
      const restaurantId = order.restaurant_id;
      const orderTotal = Number(order.total) || 0;
      
      if (!restaurantStats[restaurantId]) {
        restaurantStats[restaurantId] = { orders: 0, revenue: 0 };
      }
      
      restaurantStats[restaurantId].orders += 1;
      restaurantStats[restaurantId].revenue += orderTotal;
      
      totalOrders += 1;
      totalRevenue += orderTotal;
    });
    
    // Create top restaurants array
    const topRestaurants = restaurants
      .map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        totalOrders: restaurantStats[restaurant.id]?.orders || 0,
        totalRevenue: restaurantStats[restaurant.id]?.revenue || 0
      }))
      .filter(restaurant => restaurant.totalOrders > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, topCount);
    
    return {
      totalRestaurants: restaurants.length,
      totalOrders,
      totalRevenue,
      topRestaurants
    };
  },
  
  // Export data for a restaurant
  exportData: async (
    restaurantId: string,
    exportOptions: {
      startDate?: string;
      endDate?: string;
      dataType: 'orders' | 'payments' | 'menu' | 'all';
    }
  ): Promise<any> => {
    const { startDate, endDate, dataType } = exportOptions;
    const result: any = {};
    
    // Get restaurant details
    const restaurant = await restaurantService.getRestaurantById(restaurantId);
    
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    
    result.restaurantName = restaurant.name;
    result.exportDate = new Date().toISOString();
    result.dateRange = {
      from: startDate || 'all',
      to: endDate || 'present'
    };
    
    // Export orders
    if (dataType === 'orders' || dataType === 'all') {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          customer:user_id(id, email, first_name, last_name)
        `)
        .eq('restaurant_id', restaurantId);
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data: orders, error } = await query;
      
      if (error) {
        console.error('Error exporting orders:', error);
        throw error;
      }
      
      result.orders = orders;
    }
    
    // Export payments
    if (dataType === 'payments' || dataType === 'all') {
      // First get order IDs for this restaurant
      let orderQuery = supabase
        .from('orders')
        .select('id')
        .eq('restaurant_id', restaurantId);
      
      if (startDate) {
        orderQuery = orderQuery.gte('created_at', startDate);
      }
      
      if (endDate) {
        orderQuery = orderQuery.lte('created_at', endDate);
      }
      
      const { data: orders, error: orderError } = await orderQuery;
      
      if (orderError) {
        console.error('Error getting orders for payment export:', orderError);
        throw orderError;
      }
      
      if (orders && orders.length > 0) {
        const orderIds = orders.map(order => order.id);
        
        const { data: payments, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .in('order_id', orderIds);
        
        if (paymentError) {
          console.error('Error exporting payments:', paymentError);
          throw paymentError;
        }
        
        result.payments = payments;
      } else {
        result.payments = [];
      }
    }
    
    // Export menu
    if (dataType === 'menu' || dataType === 'all') {
      const [categories, items] = await Promise.all([
        restaurantService.getMenuCategories(restaurantId),
        restaurantService.getMenuItems({ restaurantId })
      ]);
      
      result.menu = {
        categories,
        items
      };
    }
    
    return result;
  }
};