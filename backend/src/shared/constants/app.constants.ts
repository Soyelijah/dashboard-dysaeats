/**
 * Constantes globales de la aplicación
 */
export const APP_CONSTANTS = {
  // Tiempos de expiración
  JWT_EXPIRATION: {
    ACCESS_TOKEN: '1d',
    REFRESH_TOKEN: '7d',
  },
  
  // Estados de pedidos
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    IN_DELIVERY: 'in_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },
  
  // Estados de entregas
  DELIVERY_STATUS: {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    PICKED_UP: 'picked_up',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  
  // Estados de pagos
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
  
  // Métodos de pago
  PAYMENT_METHODS: {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    CASH: 'cash',
    TRANSFER: 'transfer',
  },
  
  // Roles de usuario
  USER_ROLES: {
    ADMIN: 'admin',
    RESTAURANT_OWNER: 'restaurant_owner',
    RESTAURANT_STAFF: 'restaurant_staff',
    DELIVERY_DRIVER: 'delivery_driver',
    CUSTOMER: 'customer',
  },
  
  // Tipos de notificaciones
  NOTIFICATION_TYPES: {
    ORDER_STATUS: 'order_status',
    DELIVERY_STATUS: 'delivery_status',
    PAYMENT_STATUS: 'payment_status',
    PROMOTION: 'promotion',
    SYSTEM: 'system',
  },
};