import { supabase, Tables } from './client';

export type Notification = Tables['notifications'];

export const notificationService = {
  // Get notifications for a user
  getNotifications: async (
    userId: string,
    params: {
      limit?: number;
      isRead?: boolean;
      type?: string;
    } = {}
  ): Promise<Notification[]> => {
    const { limit = 20, isRead, type } = params;
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Add filters if specified
    if (isRead !== undefined) {
      query = query.eq('is_read', isRead);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
    
    return data as Notification[];
  },
  
  // Get a single notification by ID
  getNotificationById: async (id: string): Promise<Notification> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting notification:', error);
      throw error;
    }
    
    return data as Notification;
  },
  
  // Create a notification
  createNotification: async (
    notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Notification> => {
    // Ensure required fields are present
    if (!notification.user_id || !notification.title || !notification.message) {
      throw new Error('Missing required fields for notification');
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        is_read: notification.is_read ?? false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    return data as Notification;
  },
  
  // Mark notification as read
  markAsRead: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
    
    return true;
  },
  
  // Mark all notifications for a user as read
  markAllAsRead: async (userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
    
    return true;
  },
  
  // Delete a notification
  deleteNotification: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
    
    return true;
  },
  
  // Subscribe to notifications in real-time for a user
  subscribeToNotifications: (
    userId: string,
    callback: (notification: Notification) => void
  ) => {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
      }
    };
  },
  
  // Get notification count
  getNotificationCount: async (
    userId: string,
    unreadOnly = true
  ): Promise<number> => {
    let query = supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.error('Error getting notification count:', error);
      throw error;
    }
    
    return count || 0;
  },
  
  // Create system notification for order status change
  createOrderStatusNotification: async (
    userId: string,
    orderId: string,
    status: string,
    restaurantName?: string
  ): Promise<Notification> => {
    let title: string;
    let message: string;
    
    // Generate appropriate message based on status
    switch (status) {
      case 'pending':
        title = 'Order Received';
        message = `Your order${restaurantName ? ` from ${restaurantName}` : ''} has been received and is waiting for confirmation.`;
        break;
      case 'preparing':
        title = 'Order Confirmed';
        message = `Your order${restaurantName ? ` from ${restaurantName}` : ''} has been confirmed and is being prepared.`;
        break;
      case 'ready':
        title = 'Order Ready';
        message = `Your order${restaurantName ? ` from ${restaurantName}` : ''} is ready for pickup.`;
        break;
      case 'in_transit':
        title = 'Order In Transit';
        message = `Your order${restaurantName ? ` from ${restaurantName}` : ''} is on the way!`;
        break;
      case 'delivered':
        title = 'Order Delivered';
        message = `Your order${restaurantName ? ` from ${restaurantName}` : ''} has been delivered. Enjoy!`;
        break;
      case 'cancelled':
        title = 'Order Cancelled';
        message = `Your order${restaurantName ? ` from ${restaurantName}` : ''} has been cancelled.`;
        break;
      default:
        title = 'Order Update';
        message = `Your order${restaurantName ? ` from ${restaurantName}` : ''} has been updated.`;
    }
    
    // Create notification
    return await this.createNotification({
      user_id: userId,
      title,
      message,
      is_read: false,
      type: 'order_status',
      reference_id: orderId
    });
  }
};