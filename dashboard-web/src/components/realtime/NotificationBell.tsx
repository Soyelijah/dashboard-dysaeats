import React, { useState } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type NotificationBellProps = {
  userId: string;
};

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications({
    userId,
    limit: 10,
  });

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    // You could navigate to the relevant page based on notification type
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        {notifications.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col gap-1 p-1">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex flex-col p-3 cursor-pointer hover:bg-accent rounded-md ${!notification.is_read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="font-medium text-sm">{notification.title}</h5>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at || ''), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No notifications</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
