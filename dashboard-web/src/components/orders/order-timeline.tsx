import React from 'react';
import { CheckCircleIcon, ClockIcon, TruckIcon, ShoppingBagIcon, XCircleIcon, FireIcon } from 'lucide-react';
import { useDictionary } from '@/hooks/useDictionary';
import { OrderStatus } from '@/types/order';

interface OrderTimelineProps {
  order: any;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const dict = useDictionary();
  
  const events = [
    {
      id: 'created',
      status: 'pending',
      icon: <ClockIcon className="size-6" />,
      title: dict.orders.status.placed || "Order Placed",
      timestamp: order.createdAt,
      completed: true,
    },
    {
      id: 'accepted',
      status: 'confirmed',
      icon: <CheckCircleIcon className="size-6" />,
      title: dict.orders.status.confirmed || "Order Confirmed",
      timestamp: order.acceptedAt,
      completed: !!order.acceptedAt,
    },
    {
      id: 'preparing',
      status: 'preparing',
      icon: <FireIcon className="size-6" />,
      title: dict.orders.status.preparing || "Preparing",
      timestamp: order.preparingAt,
      completed: !!order.preparingAt,
    },
    {
      id: 'ready',
      status: 'ready',
      icon: <ShoppingBagIcon className="size-6" />,
      title: dict.orders.status.ready || "Ready for Pickup",
      timestamp: order.readyAt,
      completed: !!order.readyAt,
    },
    {
      id: 'delivery',
      status: 'in_delivery',
      icon: <TruckIcon className="size-6" />,
      title: dict.orders.status.in_delivery || "In Delivery",
      timestamp: order.inDeliveryAt,
      completed: !!order.inDeliveryAt,
    },
    {
      id: 'delivered',
      status: 'delivered',
      icon: <CheckCircleIcon className="size-6" />,
      title: dict.orders.status.delivered || "Delivered",
      timestamp: order.deliveredAt,
      completed: !!order.deliveredAt,
    }
  ];

  // Handle cancelled or rejected orders
  if (order.status === 'cancelled' || order.status === 'rejected') {
    events.push({
      id: 'cancelled_or_rejected',
      status: order.status as OrderStatus,
      icon: <XCircleIcon className="size-6" />,
      title: order.status === 'cancelled' 
        ? (dict.orders.status.cancelled || "Cancelled")
        : (dict.orders.status.rejected || "Rejected"),
      timestamp: order.cancelledAt || order.rejectedAt,
      completed: true,
    });
  }

  // Filter events that are relevant to this order's journey
  const relevantEvents = events.filter(event => {
    // Always show created event
    if (event.id === 'created') return true;
    
    // Always show cancelled/rejected if that's the status
    if (event.id === 'cancelled_or_rejected' && (order.status === 'cancelled' || order.status === 'rejected')) return true;
    
    // For other events, only show if we've reached or passed this status
    const statusIndex = events.findIndex(e => e.status === order.status);
    const eventIndex = events.findIndex(e => e.id === event.id);
    
    return eventIndex <= statusIndex;
  });

  return (
    <div className="space-y-4">
      {relevantEvents.map((event, index) => (
        <div key={event.id} className="flex items-start space-x-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${event.completed ? 'border-green-500 bg-green-50 text-green-500' : 'border-gray-300 bg-gray-50 text-gray-400'}`}>
            {event.icon}
          </div>
          <div className="space-y-1">
            <p className="font-medium">{event.title}</p>
            {event.timestamp ? (
              <p className="text-sm text-gray-500">
                {new Date(event.timestamp).toLocaleDateString()} - {new Date(event.timestamp).toLocaleTimeString()}
              </p>
            ) : (
              <p className="text-sm text-gray-400">{dict.orders.pending || "Pending"}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};