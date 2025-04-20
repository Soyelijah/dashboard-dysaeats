import { useState, useEffect } from 'react';
import { useSupabaseRealtime } from './useSupabaseRealtime';
import { notificationService } from '@/services/supabase/notificationService';
import { Tables } from '@/services/supabase/client';

type UseRealtimeNotificationsOptions = {
  userId: string;
  enabled?: boolean;
  limit?: number;
  markAsRead?: boolean;
};

/**
 * Hook for real-time notifications management
 * 
 * @param options Configuration options
 * @returns Notifications data and state
 */
export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions) {
  const {
    userId,
    enabled = true,
    limit = 20,
    markAsRead = false,
  } = options;
  
  const [notifications, setNotifications] = useState<Tables['notifications'][]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial data fetch
  useEffect(() => {
    if (!enabled || !userId) {
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const results = await notificationService.getUserNotifications(userId, { limit });
        setNotifications(results);
        
        // Count unread notifications
        const unread = results.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [enabled, userId, limit]);

  // Subscribe to new notifications
  useSupabaseRealtime(
    {
      table: 'notifications',
      event: 'INSERT',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      try {
        const newNotification = payload.new as Tables['notifications'];
        setNotifications(prev => [newNotification, ...prev].slice(0, limit));
        setUnreadCount(prev => prev + 1);
        
        // Auto-mark as read if option is enabled
        if (markAsRead) {
          notificationService.markAsRead(newNotification.id);
        }
      } catch (err) {
        console.error('Error processing new notification:', err);
      }
    },
    { enabled: !!userId && enabled }
  );

  // Subscribe to notification updates (mark as read)
  useSupabaseRealtime(
    {
      table: 'notifications',
      event: 'UPDATE',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      try {
        const updatedNotification = payload.new as Tables['notifications'];
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === updatedNotification.id 
              ? updatedNotification 
              : notif
          )
        );
        
        // Update unread count if notification was marked as read
        if (!updatedNotification.is_read === false && payload.old.is_read === true) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Error processing notification update:', err);
      }
    },
    { enabled: !!userId && enabled }
  );

  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true } 
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markNotificationAsRead,
    markAllAsRead,
    refresh: async () => {
      setIsLoading(true);
      try {
        const results = await notificationService.getUserNotifications(userId, { limit });
        setNotifications(results);
        const unread = results.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to refresh notifications'));
      } finally {
        setIsLoading(false);
      }
    }
  };
}
