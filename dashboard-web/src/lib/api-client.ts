// api-client.ts - A replacement for axios-based API client with Supabase
import { 
  authService, 
  restaurantService, 
  orderService, 
  notificationService, 
  paymentService, 
  analyticsService, 
  userService,
  OrderStatus
} from '@/services/supabase';

// The API client acts as a drop-in replacement for axios API calls
// It maps REST-style calls to Supabase service methods
const apiClient = {
  // Authentication endpoints
  auth: {
    login: async (email: string, password: string) => {
      return await authService.login(email, password);
    },
    
    register: async (userData: any) => {
      return await authService.register(userData);
    },
    
    logout: async () => {
      return await authService.logout();
    },
    
    getCurrentUser: async () => {
      return await authService.getCurrentUser();
    },
    
    refreshToken: async () => {
      return await authService.refreshToken();
    }
  },
  
  // Restaurant endpoints
  restaurants: {
    getAll: async () => {
      return await restaurantService.getRestaurants();
    },
    
    getById: async (id: string) => {
      return await restaurantService.getRestaurantById(id);
    },
    
    create: async (data: any) => {
      return await restaurantService.createRestaurant(data);
    },
    
    update: async (id: string, data: any) => {
      return await restaurantService.updateRestaurant(id, data);
    },
    
    delete: async (id: string) => {
      return await restaurantService.deleteRestaurant(id);
    },
    
    getMenuCategories: async (restaurantId: string) => {
      return await restaurantService.getMenuCategories(restaurantId);
    },
    
    createMenuCategory: async (data: any) => {
      return await restaurantService.createMenuCategory(data);
    },
    
    updateMenuCategory: async (id: string, data: any) => {
      return await restaurantService.updateMenuCategory(id, data);
    },
    
    deleteMenuCategory: async (id: string) => {
      return await restaurantService.deleteMenuCategory(id);
    },
    
    getMenuItems: async (params: { categoryId?: string; restaurantId?: string }) => {
      return await restaurantService.getMenuItems(params);
    },
    
    createMenuItem: async (data: any) => {
      return await restaurantService.createMenuItem(data);
    },
    
    updateMenuItem: async (id: string, data: any) => {
      return await restaurantService.updateMenuItem(id, data);
    },
    
    deleteMenuItem: async (id: string) => {
      return await restaurantService.deleteMenuItem(id);
    }
  },
  
  // Order endpoints
  orders: {
    getAll: async (params: any = {}) => {
      const { data, count } = await orderService.getOrders(params);
      return {
        orders: data,
        count,
        totalPages: Math.ceil(count / (params.limit || 10))
      };
    },
    
    getById: async (id: string) => {
      return await orderService.getOrderById(id);
    },
    
    create: async (data: any) => {
      return await orderService.createOrder(data);
    },
    
    updateStatus: async (id: string, status: OrderStatus) => {
      return await orderService.updateOrderStatus(id, status);
    },
    
    cancel: async (id: string, cancellationReason: string) => {
      return await orderService.cancelOrder(id, cancellationReason);
    },
    
    assignDeliveryPerson: async (orderId: string, deliveryPersonId: string) => {
      return await orderService.assignDeliveryPerson(orderId, deliveryPersonId);
    },
    
    updateDeliveryStatus: async (assignmentId: string, status: string, location?: any) => {
      return await orderService.updateDeliveryStatus(assignmentId, status as any, location);
    },
    
    getStatistics: async (restaurantId?: string, timeRange?: string) => {
      return await orderService.getOrderStatistics(restaurantId, timeRange as any);
    },
    
    getTimeline: async (orderId: string) => {
      return await orderService.getOrderTimeline(orderId);
    }
  },
  
  // Payment endpoints
  payments: {
    getAll: async (params: any = {}) => {
      const { data, count } = await paymentService.getPayments(params);
      return {
        payments: data,
        count,
        totalPages: Math.ceil(count / (params.limit || 10))
      };
    },
    
    getById: async (id: string) => {
      return await paymentService.getPaymentById(id);
    },
    
    getByOrderId: async (orderId: string) => {
      return await paymentService.getPaymentByOrderId(orderId);
    },
    
    process: async (paymentData: any) => {
      return await paymentService.processPayment(paymentData);
    },
    
    refund: async (paymentId: string, amount?: number) => {
      return await paymentService.refundPayment(paymentId, amount);
    },
    
    getStatistics: async (params: any = {}) => {
      return await paymentService.getPaymentStatistics(params);
    }
  },
  
  // Notification endpoints
  notifications: {
    getAll: async (userId: string, params: any = {}) => {
      return await notificationService.getNotifications(userId, params);
    },
    
    getById: async (id: string) => {
      return await notificationService.getNotificationById(id);
    },
    
    create: async (notification: any) => {
      return await notificationService.createNotification(notification);
    },
    
    markAsRead: async (id: string) => {
      return await notificationService.markAsRead(id);
    },
    
    markAllAsRead: async (userId: string) => {
      return await notificationService.markAllAsRead(userId);
    },
    
    delete: async (id: string) => {
      return await notificationService.deleteNotification(id);
    },
    
    getCount: async (userId: string, unreadOnly = true) => {
      return await notificationService.getNotificationCount(userId, unreadOnly);
    }
  },
  
  // Analytics endpoints
  analytics: {
    getDashboardData: async (restaurantId: string, timeRange?: string) => {
      return await analyticsService.getDashboardData(restaurantId, timeRange as any);
    },
    
    getTopMenuItems: async (restaurantId: string, startDate: string, limit?: number) => {
      return await analyticsService.getTopMenuItems(restaurantId, startDate, limit);
    },
    
    getDeliveryPerformance: async (restaurantId: string, startDate: string) => {
      return await analyticsService.getDeliveryPerformance(restaurantId, startDate);
    },
    
    getRestaurantStatistics: async (timeRange?: string, topCount?: number) => {
      return await analyticsService.getRestaurantStatistics(timeRange as any, topCount);
    },
    
    exportData: async (restaurantId: string, exportOptions: any) => {
      return await analyticsService.exportData(restaurantId, exportOptions);
    }
  },
  
  // User endpoints
  users: {
    getById: async (id: string) => {
      return await userService.getUserById(id);
    },
    
    getByEmail: async (email: string) => {
      return await userService.getUserByEmail(email);
    },
    
    updateProfile: async (userId: string, userData: any) => {
      return await userService.updateUserProfile(userId, userData);
    },
    
    getByRole: async (role: string, params: any = {}) => {
      return await userService.getUsersByRole(role as any, params);
    },
    
    create: async (userData: any) => {
      return await userService.createUser(userData);
    },
    
    delete: async (userId: string) => {
      return await userService.deleteUser(userId);
    },
    
    changePassword: async (newPassword: string) => {
      return await userService.changePassword(newPassword);
    },
    
    requestPasswordReset: async (email: string) => {
      return await userService.requestPasswordReset(email);
    }
  }
};

export default apiClient;