export enum OrderStatus {
  PENDING = 'pending',      // Pendiente (recién creado)
  CONFIRMED = 'confirmed',  // Confirmado por el restaurante
  PREPARING = 'preparing',  // En preparación
  READY = 'ready',          // Listo para entrega/recogida
  IN_DELIVERY = 'in_delivery', // En proceso de entrega
  DELIVERED = 'delivered',  // Entregado al cliente
  CANCELLED = 'cancelled',  // Cancelado
  REJECTED = 'rejected',    // Rechazado por el restaurante
}