import api from './api';
import { OrderStatus } from '../types/order';

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

// Get all orders with pagination and filters
export const getOrders = async (params: OrdersQueryParams) => {
  const { data } = await api.get('/orders', { params });
  return data;
};

// Get an order by ID
export const getOrderById = async (id: string) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

// Update order status
export const updateOrderStatus = async (id: string, payload: { status: OrderStatus }) => {
  const { data } = await api.patch(`/orders/${id}/status`, payload);
  return data;
};

// Assign delivery person to an order
export const assignDeliveryPerson = async (id: string, payload: { deliveryPersonId: string }) => {
  const { data } = await api.patch(`/orders/${id}/assign-delivery`, payload);
  return data;
};

// Cancel an order
export const cancelOrder = async (id: string, payload: { cancellationReason: string }) => {
  const { data } = await api.patch(`/orders/${id}/cancel`, payload);
  return data;
};

// Get order statistics
export const getOrderStatistics = async (restaurantId?: string) => {
  const params = restaurantId ? { restaurantId } : {};
  const { data } = await api.get('/orders/statistics', { params });
  return data;
};