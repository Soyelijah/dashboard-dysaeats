import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDictionary } from '@/hooks/useDictionary';
import { useToast } from '@/hooks/useToast';
import {
  isPushNotificationSupported,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  showNotification
} from '@/lib/notifications';

type NotificationSettings = {
  orderUpdates: boolean;
  newOrders: boolean;
  deliveryUpdates: boolean;
  systemAlerts: boolean;
};

type NotificationType = keyof NotificationSettings;

export const useNotifications = () => {
  const { user } = useAuth();
  const dict = useDictionary();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    newOrders: true,
    deliveryUpdates: true,
    systemAlerts: true
  });

  // Initialize notification capabilities on component mount
  useEffect(() => {
    const checkNotificationCapabilities = async () => {
      const supported = isPushNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const permissionStatus = Notification.permission === 'granted';
        setIsPermissionGranted(permissionStatus);

        // If user is logged in, check subscription status and settings
        if (user && permissionStatus) {
          fetchSubscriptionStatus();
          fetchNotificationSettings();
        }
      }
    };

    checkNotificationCapabilities();
  }, [user]);

  // Fetch the user's subscription status from the server
  const fetchSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications/status?userId=${user.id}`);
      const data = await response.json();
      setIsSubscribed(data.isSubscribed);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  // Fetch the user's notification settings from the server
  const fetchNotificationSettings = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications/settings?userId=${user.id}`);
      const data = await response.json();
      setNotificationSettings(data.settings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  // Request permission for notifications
  const requestPermission = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: dict.notifications.error,
        description: dict.notifications.loginRequired,
        variant: 'destructive'
      });
      return false;
    }

    try {
      const granted = await requestNotificationPermission();
      setIsPermissionGranted(granted);
      
      if (granted) {
        toast({
          title: dict.notifications.permissionGranted,
          description: dict.notifications.permissionGrantedDescription
        });
      } else {
        toast({
          title: dict.notifications.permissionDenied,
          description: dict.notifications.permissionDeniedDescription,
          variant: 'destructive'
        });
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: dict.notifications.error,
        description: dict.notifications.errorRequestingPermission,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribe = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: dict.notifications.error,
        description: dict.notifications.loginRequired,
        variant: 'destructive'
      });
      return false;
    }

    setIsSubscribing(true);

    try {
      // Check permission first
      if (Notification.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsSubscribing(false);
          return false;
        }
      }

      // Subscribe
      const success = await subscribeToPushNotifications(user.id);
      
      if (success) {
        setIsSubscribed(true);
        toast({
          title: dict.notifications.subscriptionSuccess,
          description: dict.notifications.subscriptionSuccessDescription
        });
      } else {
        toast({
          title: dict.notifications.error,
          description: dict.notifications.subscriptionError,
          variant: 'destructive'
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: dict.notifications.error,
        description: dict.notifications.subscriptionError,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSubscribing(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await unsubscribeFromPushNotifications(user.id);
      
      if (success) {
        setIsSubscribed(false);
        toast({
          title: dict.notifications.unsubscribeSuccess,
          description: dict.notifications.unsubscribeSuccessDescription
        });
      } else {
        toast({
          title: dict.notifications.error,
          description: dict.notifications.unsubscribeError,
          variant: 'destructive'
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: dict.notifications.error,
        description: dict.notifications.unsubscribeError,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Update notification settings
  const updateSettings = async (settings: Partial<NotificationSettings>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedSettings = { ...notificationSettings, ...settings };
      
      // Send updated settings to the server
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          settings: updatedSettings
        })
      });
      
      if (response.ok) {
        setNotificationSettings(updatedSettings);
        toast({
          title: dict.notifications.settingsUpdated,
          description: dict.notifications.settingsUpdatedDescription
        });
        return true;
      } else {
        toast({
          title: dict.notifications.error,
          description: dict.notifications.settingsUpdateError,
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: dict.notifications.error,
        description: dict.notifications.settingsUpdateError,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Test a notification
  const testNotification = (type: NotificationType) => {
    let title = '';
    let body = '';
    let icon = '/icons/app-icon-128x128.png';
    
    switch (type) {
      case 'newOrders':
        title = dict.notifications.newOrderTitle;
        body = dict.notifications.newOrderBody;
        icon = '/icons/new-order-icon.png';
        break;
      case 'orderUpdates':
        title = dict.notifications.orderUpdateTitle;
        body = dict.notifications.orderUpdateBody;
        icon = '/icons/order-update-icon.png';
        break;
      case 'deliveryUpdates':
        title = dict.notifications.deliveryUpdateTitle;
        body = dict.notifications.deliveryUpdateBody;
        icon = '/icons/delivery-icon.png';
        break;
      case 'systemAlerts':
        title = dict.notifications.systemAlertTitle;
        body = dict.notifications.systemAlertBody;
        icon = '/icons/alert-icon.png';
        break;
    }
    
    showNotification(title, {
      body,
      icon,
      tag: `test-${type}`,
      data: {
        type: 'test',
        testType: type
      }
    });
    
    toast({
      title: dict.notifications.testSent,
      description: dict.notifications.testSentDescription
    });
  };

  return {
    isSupported,
    isPermissionGranted,
    isSubscribed,
    isSubscribing,
    notificationSettings,
    requestPermission,
    subscribe,
    unsubscribe,
    updateSettings,
    testNotification
  };
};