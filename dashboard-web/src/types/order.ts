export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  IN_DELIVERY = 'in_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: Record<string, any>;
  notes?: string;
}

export interface OrderAddress {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip?: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: OrderAddress;
  paymentMethod: string;
  notes?: string;
  restaurant: {
    id: string;
    name: string;
  };
  deliveryPerson?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  inDeliveryAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  rejectedAt?: string;
}

export interface OrderStatistics {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  inDelivery: number;
  delivered: number;
  cancelled: number;
  rejected: number;
  todayTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
}