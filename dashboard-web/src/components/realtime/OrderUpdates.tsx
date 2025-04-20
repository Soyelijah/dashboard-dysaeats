import React, { useEffect } from 'react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

type OrderUpdatesProps = {
  restaurantId: string;
  onOrderSelect?: (orderId: string) => void;
  showToasts?: boolean;
};

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-500',
  'confirmed': 'bg-blue-500',
  'in_preparation': 'bg-purple-500',
  'ready_for_pickup': 'bg-indigo-500',
  'out_for_delivery': 'bg-orange-500',
  'delivered': 'bg-green-500',
  'cancelled': 'bg-red-500',
  'default': 'bg-gray-500'
};

const OrderUpdates: React.FC<OrderUpdatesProps> = ({
  restaurantId,
  onOrderSelect,
  showToasts = true
}) => {
  const { orders, isLoading, error } = useRealtimeOrders({
    restaurantId,
    status: ['pending', 'confirmed', 'in_preparation', 'ready_for_pickup', 'out_for_delivery'],
  });
  
  const { toast } = useToast();
  
  // Show toast notifications for new orders
  useEffect(() => {
    if (showToasts && orders.length > 0) {
      // Find the most recent pending order
      const pendingOrders = orders.filter(order => order.status === 'pending');
      
      if (pendingOrders.length > 0) {
        // Sort by created_at to find the most recent
        const mostRecent = pendingOrders.sort((a, b) => {
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        })[0];
        
        // Only show toast for orders created in the last minute
        const orderTime = new Date(mostRecent.created_at || '');
        const currentTime = new Date();
        const diffTime = Math.abs(currentTime.getTime() - orderTime.getTime());
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        
        if (diffMinutes <= 1) {
          toast({
            title: 'New Order!',
            description: `Order #${mostRecent.id.slice(-4)} has been received.`,
            duration: 5000,
          });
        }
      }
    }
  }, [orders, showToasts, toast]);

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>Error loading orders: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onOrderSelect?.(order.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Order #{order.id.slice(-4)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at || ''), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status] || statusColors.default}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Items: {order.items?.length || 0}</p>
                  <p className="text-sm font-medium">Total: ${order.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active orders</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderUpdates;
