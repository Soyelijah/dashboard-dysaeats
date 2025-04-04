export enum PaymentStatus {
  PENDING = 'pending',           // Pago pendiente
  PROCESSING = 'processing',     // Procesando pago
  COMPLETED = 'completed',       // Pago completado
  FAILED = 'failed',             // Pago fallido
  REFUNDED = 'refunded',         // Reembolsado
}