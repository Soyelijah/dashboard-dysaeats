'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDictionary } from '@/hooks/useDictionary';
import { useSocket } from '@/contexts/SocketContext';

interface NotificationBadge {
  count: number;
  type: 'order' | 'delivery' | 'system' | 'generic';
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'delivery' | 'system' | 'generic';
  date: Date;
  read: boolean;
  data?: {
    orderId?: string;
    url?: string;
  };
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  badges: Record<string, NotificationBadge>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const dict = useDictionary();
  const { isConnected, socket } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [badges, setBadges] = useState<Record<string, NotificationBadge>>({
    order: { count: 0, type: 'order' },
    delivery: { count: 0, type: 'delivery' },
    system: { count: 0, type: 'system' },
  });
  
  const {
    isSupported,
    isPermissionGranted,
    notificationSettings,
  } = useNotifications();
  
  // Calculate unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
    
    // Calculate badges
    const newBadges: Record<string, NotificationBadge> = {
      order: { count: 0, type: 'order' },
      delivery: { count: 0, type: 'delivery' },
      system: { count: 0, type: 'system' },
    };
    
    notifications.forEach(n => {
      if (!n.read && newBadges[n.type]) {
        newBadges[n.type].count += 1;
      }
    });
    
    setBadges(newBadges);
  }, [notifications]);
  
  // Fetch notifications from API when the user logs in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        
        if (response.ok) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    const handleNewNotification = (data: any) => {
      console.log('New notification received:', data);
      
      // Check user notification settings
      if (
        (data.type === 'order' && !notificationSettings.newOrders) ||
        (data.type === 'order_update' && !notificationSettings.orderUpdates) ||
        (data.type === 'delivery' && !notificationSettings.deliveryUpdates) ||
        (data.type === 'system' && !notificationSettings.systemAlerts)
      ) {
        console.log('Notification blocked by user settings');
        return;
      }
      
      // Add the notification to state
      const notification: NotificationItem = {
        id: data.id || Date.now().toString(),
        title: data.title,
        message: data.message,
        type: data.type === 'order_update' ? 'order' : data.type,
        date: new Date(),
        read: false,
        data: data.data || {},
      };
      
      setNotifications(prev => [notification, ...prev]);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: 'default',
      });
    };
    
    // Socket events to listen for
    socket.on('notification:new', handleNewNotification);
    socket.on('order:created', (data) => handleNewNotification({
      id: `order_${data.id}_created`,
      title: dict.notifications.newOrderTitle,
      message: `${dict.notifications.newOrderMessage} #${data.orderNumber}`,
      type: 'order',
      data: {
        orderId: data.id,
        url: `/orders/${data.id}`,
      },
    }));
    socket.on('order:updated', (data) => handleNewNotification({
      id: `order_${data.id}_updated`,
      title: dict.notifications.orderUpdateTitle,
      message: `${dict.notifications.orderUpdateMessage} #${data.orderNumber}`,
      type: 'order_update',
      data: {
        orderId: data.id,
        url: `/orders/${data.id}`,
      },
    }));
    socket.on('delivery:locationUpdated', (data) => handleNewNotification({
      id: `delivery_${data.orderId}_location`,
      title: dict.notifications.deliveryUpdateTitle,
      message: dict.notifications.deliveryLocationMessage,
      type: 'delivery',
      data: {
        orderId: data.orderId,
        url: `/orders/${data.orderId}`,
      },
    }));
    
    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('order:created');
      socket.off('order:updated');
      socket.off('delivery:locationUpdated');
    };
  }, [socket, isConnected, toast, dict, notificationSettings]);
  
  // Mark notification as read
  const markAsRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    
    // Update on server
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    
    // Update on server
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Delete a notification
  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Update on server
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Clear all notifications
  const clearAll = async () => {
    setNotifications([]);
    
    // Update on server
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };
  
  const value = {
    notifications,
    unreadCount,
    badges,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};