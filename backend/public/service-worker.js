/**
 * DysaEats Service Worker for Push Notifications
 */

// Cache name for stored assets
const CACHE_NAME = 'dysaeats-cache-v1';
const DASHBOARD_URL = '/dashboard';

// URLs to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard',
  '/images/logo.png',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
];

// Install event - pre-cache critical assets
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Helper for getting notification icon based on notification type
function getNotificationIcon(type) {
  switch (type) {
    case 'order_created':
      return '/images/notification-icons/order-created.png';
    case 'order_status_changed':
      return '/images/notification-icons/order-status.png';
    case 'order_assigned':
      return '/images/notification-icons/assign.png';
    case 'delivery_status_changed':
      return '/images/notification-icons/delivery.png';
    case 'payment_received':
      return '/images/notification-icons/payment.png';
    case 'system_alert':
      return '/images/notification-icons/alert.png';
    case 'promotion':
      return '/images/notification-icons/promotion.png';
    default:
      return '/images/logo.png';
  }
}

// Helper for getting notification click URL
function getNotificationUrl(notification) {
  const baseUrl = self.registration.scope;
  const { notificationType, data } = notification;
  
  switch (notificationType) {
    case 'order_created':
    case 'order_status_changed':
    case 'order_assigned':
      if (data && data.orderId) {
        return `${baseUrl}dashboard/orders/${data.orderId}`;
      }
      return `${baseUrl}dashboard/orders`;
    
    case 'delivery_status_changed':
      if (data && data.deliveryId) {
        return `${baseUrl}dashboard/deliveries/${data.deliveryId}`;
      }
      return `${baseUrl}dashboard/deliveries`;
    
    case 'payment_received':
      if (data && data.paymentId) {
        return `${baseUrl}dashboard/payments/${data.paymentId}`;
      }
      return `${baseUrl}dashboard/payments`;
    
    case 'system_alert':
      return `${baseUrl}dashboard/notifications`;
    
    case 'promotion':
      if (data && data.promotionId) {
        return `${baseUrl}dashboard/promotions/${data.promotionId}`;
      }
      return `${baseUrl}dashboard/promotions`;
    
    default:
      return `${baseUrl}dashboard`;
  }
}

// Push event - show notification when push message is received
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  try {
    const data = event.data.json();
    const title = data.title || 'DysaEats Notification';
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || getNotificationIcon(data.notificationType),
      badge: '/images/badge.png',
      data: {
        ...data,
        openUrl: getNotificationUrl(data),
        timestamp: data.timestamp || new Date().toISOString(),
      },
      vibrate: [100, 50, 100],
      requireInteraction: data.requireInteraction || false,
    };
    
    // Add actions if provided
    if (data.actions && Array.isArray(data.actions)) {
      options.actions = data.actions;
    }
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error displaying push notification:', error);
    
    // Fallback for invalid JSON
    event.waitUntil(
      self.registration.showNotification('DysaEats Notification', {
        body: 'You have a new notification',
        icon: '/images/logo.png',
        badge: '/images/badge.png',
      })
    );
  }
});

// Notification click event - handle user interaction with notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle notification click based on data
  const notification = event.notification;
  let targetUrl = DASHBOARD_URL;
  
  if (notification.data && notification.data.openUrl) {
    targetUrl = notification.data.openUrl;
  }
  
  // Handle action buttons if clicked
  if (event.action) {
    switch (event.action) {
      case 'view_details':
        // Use the URL from the notification
        break;
        
      case 'dismiss':
        // Just close the notification (already done above)
        return;
        
      default:
        // Custom action handling can be added here
        break;
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window open with the target URL
        for (let client of windowClients) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open with the URL, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  // Analytics or logging can be added here
  console.log('Notification closed', event.notification);
});

// Handle subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  const newSubscription = event.newSubscription;
  
  if (newSubscription) {
    // Send updated subscription to the server
    // This would typically use a fetch call to update the subscription
    console.log('Subscription changed', newSubscription);
  }
});