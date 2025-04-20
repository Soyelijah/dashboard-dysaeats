// Export Supabase client
export { supabase } from './client';

// Export services
export { authService } from './authService';
export { restaurantService } from './restaurantService';
export { orderService } from './orderService';
export { notificationService } from './notificationService';
export { paymentService } from './paymentService';
export { analyticsService } from './analyticsService';
export { realtimeService } from './realtimeService';
export { userService } from './userService';
export { storageService } from './storageService';

// Export types
export type { Tables } from './client';
export type { Restaurant, MenuCategory, MenuItem, MenuItemWithFrontendFields } from './restaurantService';
export type { Order, OrderItem, OrderAssignment, OrderStatus, OrderWithItems } from './orderService';
export type { Notification } from './notificationService';
export type { Payment, PaymentMethod, PaymentStatus } from './paymentService';
export type { TimeRange } from './analyticsService';
export type { User, UserRole } from './userService';