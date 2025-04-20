export enum DeliveryStatus {
  NOT_ASSIGNED = 'not_assigned', // Sin repartidor asignado
  ASSIGNED = 'assigned',         // Repartidor asignado
  PICKED_UP = 'picked_up',       // Pedido recogido por el repartidor
  IN_TRANSIT = 'in_transit',     // En tránsito hacia el cliente
  COMPLETED = 'completed',       // Entrega completada
  FAILED = 'failed',             // Entrega fallida
}