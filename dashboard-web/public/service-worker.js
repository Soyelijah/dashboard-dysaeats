/*
 * DysaEats Service Worker for Push Notifications
 */

// Cache name
const CACHE_NAME = 'dysaeats-v1';

// Listen for install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Listen for activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (!event.data) {
    console.log('No data received with push event');
    return;
  }

  try {
    // Parse the notification data
    const data = event.data.json();
    console.log('Push data:', data);

    // Show notification
    const title = data.title || 'DysaEats Notification';
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/app-icon-128x128.png',
      badge: data.badge || '/icons/notification-badge.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      vibrate: data.vibrate || [100, 50, 100],
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Listen for notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  // Check if action was clicked
  if (action) {
    // Handle specific actions
    console.log('Action clicked:', action);
    if (data.actionUrls && data.actionUrls[action]) {
      event.waitUntil(
        clients.openWindow(data.actionUrls[action])
      );
      return;
    }
  }

  // Default behavior - open the relevant URL or main app
  let targetUrl = data.url || '/';
  
  // Special handling for order notifications
  if (data.type === 'order' && data.orderId) {
    targetUrl = `/orders/${data.orderId}`;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open or matching, open a new one
      return clients.openWindow(targetUrl);
    })
  );
});

// Listen for push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');
  
  // Re-subscribe the user
  const applicationServerKey = self.registration.pushManager.getSubscriptionOptions()?.applicationServerKey;
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    }).then((subscription) => {
      // Update subscription on server
      return fetch('/api/notifications/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldEndpoint: event.oldSubscription ? event.oldSubscription.endpoint : null,
          newSubscription: subscription
        })
      });
    })
  );
});