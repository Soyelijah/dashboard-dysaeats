'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/hooks/useDictionary';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { Button } from '@/components/common/button';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationDropdown = () => {
  const router = useRouter();
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale | undefined>(undefined);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationContext();

  // Set locale based on user's language
  React.useEffect(() => {
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang.startsWith('es')) {
      setLocale(es);
    }
  }, []);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <span className="text-blue-500 font-bold">🛒</span>;
      case 'delivery':
        return <span className="text-green-500 font-bold">🚚</span>;
      case 'system':
        return <span className="text-red-500 font-bold">⚠️</span>;
      default:
        return <span className="text-gray-500 font-bold">📌</span>;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notificationId: string, url?: string) => {
    markAsRead(notificationId);
    
    if (url) {
      router.push(url);
    }
    
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2" aria-label={dict.notifications.title}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{dict.notifications.title}</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs font-normal h-7"
            >
              {dict.notifications.markAllAsRead}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {dict.notifications.noNotifications}
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start py-2 px-4 ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-950/10'
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.data?.url)}
                >
                  <div className="flex w-full items-start gap-2">
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            !notification.read ? 'font-semibold' : ''
                          }`}
                        >
                          {notification.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-xs text-gray-400 hover:text-gray-500"
                        >
                          &times;
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.date), {
                          addSuffix: true,
                          locale,
                        })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 flex justify-between">
              {notifications.length > 10 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    router.push('/notifications');
                  }}
                  className="text-xs"
                >
                  {dict.notifications.viewAll}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-600"
              >
                {dict.notifications.clearAll}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;