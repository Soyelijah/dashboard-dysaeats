import { supabase, Tables } from './client';
import { orderService } from './orderService';

export type Payment = Tables['payments'];
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'transfer' | 'mercadopago';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export const paymentService = {
  // Get all payments with filters
  getPayments: async (params: {
    orderId?: string;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    userId?: string;
    restaurantId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: Payment[];
    count: number;
  }> => {
    const { 
      orderId,
      status,
      paymentMethod,
      userId,
      restaurantId,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = params;
    
    // Calculate range for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Build query
    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }
    
    // For filters that require joining with orders table, use RPC
    if (userId || restaurantId) {
      // This would need a stored procedure in Supabase
      // For now, we'll fetch the order IDs separately and then filter payments
      
      if (userId) {
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', userId);
        
        if (orders && orders.length > 0) {
          const orderIds = orders.map(order => order.id);
          query = query.in('order_id', orderIds);
        } else {
          // No orders for this user
          return { data: [], count: 0 };
        }
      }
      
      if (restaurantId) {
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('restaurant_id', restaurantId);
        
        if (orders && orders.length > 0) {
          const orderIds = orders.map(order => order.id);
          query = query.in('order_id', orderIds);
        } else {
          // No orders for this restaurant
          return { data: [], count: 0 };
        }
      }
    }
    
    // Date filtering
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error getting payments:', error);
      throw error;
    }
    
    return {
      data: data as Payment[],
      count: count || 0
    };
  },
  
  // Get a payment by ID
  getPaymentById: async (id: string): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
    
    return data as Payment;
  },
  
  // Get payment details for an order
  getPaymentByOrderId: async (orderId: string): Promise<Payment | null> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting payment for order:', error);
      throw error;
    }
    
    return data as Payment | null;
  },
  
  // Process a payment
  processPayment: async (paymentData: {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDetails?: any;
  }): Promise<Payment> => {
    // In a real app, you'd integrate with a payment gateway here
    // For now, we'll simulate payment processing
    
    // Get the order to validate the amount
    const order = await orderService.getOrderById(paymentData.orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Validate payment amount matches order total
    if (Number(order.total) !== Number(paymentData.amount)) {
      throw new Error('Payment amount does not match order total');
    }
    
    // Check if payment already exists for this order
    const existingPayment = await this.getPaymentByOrderId(paymentData.orderId);
    
    if (existingPayment) {
      // If payment exists and is completed, return it
      if (existingPayment.status === 'completed') {
        return existingPayment;
      }
      
      // If payment exists but is not completed, update it
      const { data, error } = await supabase
        .from('payments')
        .update({
          amount: paymentData.amount,
          payment_method: paymentData.paymentMethod,
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPayment.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating payment:', error);
        throw error;
      }
      
      // Simulate payment processing
      // In a real app, this would be handled by a payment gateway
      const processedPayment = await this.simulatePaymentProcessing(data.id);
      
      // If payment was successful, update order status
      if (processedPayment.status === 'completed') {
        await orderService.updateOrderStatus(paymentData.orderId, 'preparing');
      }
      
      return processedPayment;
    }
    
    // Create new payment record
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: paymentData.orderId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        transaction_id: `txn_${Date.now()}`,
        status: 'processing'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
    
    // Simulate payment processing
    const processedPayment = await this.simulatePaymentProcessing(data.id);
    
    // If payment was successful, update order status
    if (processedPayment.status === 'completed') {
      await orderService.updateOrderStatus(paymentData.orderId, 'preparing');
    }
    
    return processedPayment;
  },
  
  // Helper method to simulate payment processing
  simulatePaymentProcessing: async (paymentId: string): Promise<Payment> => {
    // Wait for a short delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    const isSuccessful = Math.random() < 0.95;
    
    const status: PaymentStatus = isSuccessful ? 'completed' : 'failed';
    
    // Update payment status
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
    
    return data as Payment;
  },
  
  // Refund a payment
  refundPayment: async (
    paymentId: string,
    amount?: number
  ): Promise<Payment> => {
    // Get the payment to validate it
    const payment = await this.getPaymentById(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }
    
    // Validate refund amount
    const refundAmount = amount || Number(payment.amount);
    
    if (refundAmount <= 0 || refundAmount > Number(payment.amount)) {
      throw new Error('Invalid refund amount');
    }
    
    // In a real app, you would call the payment gateway to process the refund
    // Here we'll just update the payment status
    
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
    
    // If this was a full refund, update the order status to cancelled
    if (refundAmount === Number(payment.amount)) {
      await orderService.updateOrderStatus(payment.order_id, 'cancelled');
    }
    
    return data as Payment;
  },
  
  // Calculate payment statistics
  getPaymentStatistics: async (
    params: {
      restaurantId?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    totalPayments: number;
    totalAmount: number;
    byMethod: Record<PaymentMethod, { count: number; amount: number }>;
    byStatus: Record<PaymentStatus, { count: number; amount: number }>;
  }> => {
    const { restaurantId, startDate, endDate } = params;
    
    // Build base query
    let query = supabase
      .from('payments')
      .select(`
        *,
        order:order_id(
          restaurant_id
        )
      `);
    
    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Get all payments that match the criteria
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting payment statistics:', error);
      throw error;
    }
    
    // Filter by restaurant if needed
    let filteredData = data;
    if (restaurantId) {
      filteredData = data.filter(
        payment => payment.order?.restaurant_id === restaurantId
      );
    }
    
    // Initialize statistics objects
    const byMethod: Record<PaymentMethod, { count: number; amount: number }> = {
      credit_card: { count: 0, amount: 0 },
      debit_card: { count: 0, amount: 0 },
      cash: { count: 0, amount: 0 },
      transfer: { count: 0, amount: 0 },
      mercadopago: { count: 0, amount: 0 }
    };
    
    const byStatus: Record<PaymentStatus, { count: number; amount: number }> = {
      pending: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 },
      refunded: { count: 0, amount: 0 }
    };
    
    let totalAmount = 0;
    
    // Calculate statistics
    filteredData.forEach(payment => {
      const method = payment.payment_method as PaymentMethod;
      const status = payment.status as PaymentStatus;
      const amount = Number(payment.amount);
      
      // Update by method
      if (method && byMethod[method]) {
        byMethod[method].count += 1;
        byMethod[method].amount += amount;
      }
      
      // Update by status
      if (status && byStatus[status]) {
        byStatus[status].count += 1;
        byStatus[status].amount += amount;
      }
      
      // Update total (only count completed payments)
      if (status === 'completed') {
        totalAmount += amount;
      }
    });
    
    return {
      totalPayments: filteredData.length,
      totalAmount,
      byMethod,
      byStatus
    };
  }
};