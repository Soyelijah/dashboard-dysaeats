'use client';

import React from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Switch } from '@/components/common/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/common/alert';
import { BellRing, BellOff, AlertCircle, Bell, Send } from 'lucide-react';

const NotificationSettings = () => {
  const dict = useDictionary();
  const {
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
  } = useNotifications();

  // Handle subscription toggle
  const handleSubscriptionToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  // Handle notification setting toggle
  const handleSettingToggle = async (key: keyof typeof notificationSettings) => {
    await updateSettings({ [key]: !notificationSettings[key] });
  };

  // If push notifications are not supported
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict.notifications.title}</CardTitle>
          <CardDescription>{dict.notifications.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{dict.notifications.notSupported}</AlertTitle>
            <AlertDescription>
              {dict.notifications.notSupportedDescription}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <BellRing className="h-5 w-5 text-green-500" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          {dict.notifications.title}
        </CardTitle>
        <CardDescription>{dict.notifications.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        {!isPermissionGranted && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{dict.notifications.permissionRequired}</AlertTitle>
            <AlertDescription>
              {dict.notifications.permissionRequiredDescription}
              <Button 
                variant="link" 
                onClick={requestPermission} 
                className="px-0"
              >
                {dict.notifications.grantPermission}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{dict.notifications.receiveNotifications}</h3>
            <p className="text-sm text-gray-500">
              {isSubscribed 
                ? dict.notifications.receiveNotificationsOnDescription 
                : dict.notifications.receiveNotificationsOffDescription}
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleSubscriptionToggle}
            disabled={!isPermissionGranted || isSubscribing}
            aria-label={dict.notifications.toggleNotifications}
          />
        </div>

        {/* Notification Categories */}
        {isSubscribed && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">
              {dict.notifications.notificationTypes}
            </h3>
            
            <div className="space-y-4">
              {/* New Orders */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">{dict.notifications.newOrders}</h4>
                    <p className="text-xs text-gray-500">{dict.notifications.newOrdersDescription}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => testNotification('newOrders')}>
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {dict.notifications.test}
                  </Button>
                  <Switch
                    checked={notificationSettings.newOrders}
                    onCheckedChange={() => handleSettingToggle('newOrders')}
                    aria-label={dict.notifications.newOrders}
                  />
                </div>
              </div>

              {/* Order Updates */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">{dict.notifications.orderUpdates}</h4>
                    <p className="text-xs text-gray-500">{dict.notifications.orderUpdatesDescription}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => testNotification('orderUpdates')}>
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {dict.notifications.test}
                  </Button>
                  <Switch
                    checked={notificationSettings.orderUpdates}
                    onCheckedChange={() => handleSettingToggle('orderUpdates')}
                    aria-label={dict.notifications.orderUpdates}
                  />
                </div>
              </div>

              {/* Delivery Updates */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">{dict.notifications.deliveryUpdates}</h4>
                    <p className="text-xs text-gray-500">{dict.notifications.deliveryUpdatesDescription}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => testNotification('deliveryUpdates')}>
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {dict.notifications.test}
                  </Button>
                  <Switch
                    checked={notificationSettings.deliveryUpdates}
                    onCheckedChange={() => handleSettingToggle('deliveryUpdates')}
                    aria-label={dict.notifications.deliveryUpdates}
                  />
                </div>
              </div>

              {/* System Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">{dict.notifications.systemAlerts}</h4>
                    <p className="text-xs text-gray-500">{dict.notifications.systemAlertsDescription}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => testNotification('systemAlerts')}>
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {dict.notifications.test}
                  </Button>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={() => handleSettingToggle('systemAlerts')}
                    aria-label={dict.notifications.systemAlerts}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Browser Notification Info */}
        <div className="pt-4 border-t text-xs text-gray-500">
          <p>{dict.notifications.browserInfo}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;