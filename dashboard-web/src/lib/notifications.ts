/**
 * Notification utility functions for web push notifications
 */

// Check if push notifications are supported
export const isPushNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request permission for push notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (userId: string): Promise<boolean> => {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    // Make sure service worker is registered
    const registration = await navigator.serviceWorker.ready;
    
    // Get push subscription
    let subscription = await registration.pushManager.getSubscription();
    
    // If no subscription exists, create one
    if (!subscription) {
      // Get VAPID public key from backend
      const response = await fetch('/api/notifications/vapid-public-key');
      const vapidPublicKey = await response.text();
      
      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // Subscribe
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }
    
    // Send subscription to server
    await fetch('/api/notifications/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        subscription
      })
    });
    
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (userId: string): Promise<boolean> => {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Unsubscribe on the client
      await subscription.unsubscribe();
      
      // Notify server
      await fetch('/api/notifications/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

// Display notification using the Notification API
export const showNotification = (title: string, options: NotificationOptions = {}) => {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};

// Helper function to convert URL-safe base64 to Uint8Array
// Required for the applicationServerKey
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};