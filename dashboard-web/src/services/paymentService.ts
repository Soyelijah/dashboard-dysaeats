import api from '@/lib/api';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';
  name: string;
  description: string;
  isDefault: boolean;
  details: {
    lastFour?: string;
    brand?: string;
    expiryMonth?: string;
    expiryYear?: string;
    accountNumber?: string;
    bankName?: string;
    walletName?: string;
  };
  createdAt: string;
}

export interface CreatePaymentMethodDto {
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';
  token?: string;
  isDefault?: boolean;
  details?: {
    lastFour?: string;
    brand?: string;
    expiryMonth?: string;
    expiryYear?: string;
    accountNumber?: string;
    bankName?: string;
    walletName?: string;
  };
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  restaurantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionFee: number;
  platformFee: number;
  netAmount: number;
  reference: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  netAmount: number;
  pendingAmount: number;
  lastTransactions: PaymentTransaction[];
}

// Get all payment methods
export const getPaymentMethods = async () => {
  const { data } = await api.get('/payments/methods');
  return data;
};

// Create a new payment method
export const createPaymentMethod = async (paymentMethod: CreatePaymentMethodDto) => {
  const { data } = await api.post('/payments/methods', paymentMethod);
  return data;
};

// Update a payment method
export const updatePaymentMethod = async (id: string, updates: Partial<CreatePaymentMethodDto>) => {
  const { data } = await api.patch(`/payments/methods/${id}`, updates);
  return data;
};

// Delete a payment method
export const deletePaymentMethod = async (id: string) => {
  const { data } = await api.delete(`/payments/methods/${id}`);
  return data;
};

// Get all payment transactions
export const getPaymentTransactions = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
}) => {
  const { data } = await api.get('/payments/transactions', { params });
  return data;
};

// Get a specific payment transaction
export const getPaymentTransaction = async (id: string) => {
  const { data } = await api.get(`/payments/transactions/${id}`);
  return data;
};

// Refund a payment
export const refundPayment = async (id: string, amount?: number) => {
  const { data } = await api.post(`/payments/transactions/${id}/refund`, { amount });
  return data;
};

// Get payment statistics
export const getPaymentStats = async (params: {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  restaurantId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { data } = await api.get('/payments/stats', { params });
  return data;
};

// Process a payment for an order
export const processPayment = async (orderId: string, paymentInfo: {
  paymentMethodId: string;
  amount: number;
  currency?: string;
  customerId?: string;
}) => {
  const { data } = await api.post(`/payments/process/${orderId}`, paymentInfo);
  return data;
};

// Stripe utilities

// Generate a payment intent
export const createPaymentIntent = async (amount: number, currency = 'usd', paymentMethodId?: string) => {
  const { data } = await api.post('/payments/stripe/create-intent', {
    amount,
    currency,
    paymentMethodId
  });
  return data;
};

// Confirm a payment intent
export const confirmPaymentIntent = async (paymentIntentId: string, paymentMethodId: string) => {
  const { data } = await api.post('/payments/stripe/confirm-intent', {
    paymentIntentId,
    paymentMethodId
  });
  return data;
};

// Get Stripe publishable key
export const getStripePublishableKey = async () => {
  const { data } = await api.get('/payments/stripe/config');
  return data.publishableKey;
};