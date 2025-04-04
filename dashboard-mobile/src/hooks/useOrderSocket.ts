import { useEffect, useState } from 'react';
import { getSocket, SocketEvent, OrderUpdatedEvent, DeliveryLocationEvent } from '../services/socket';
import { Order } from '../types/order';

export const useOrderSocket = (orderId: string, initialOrder: Order) => {
  const [socket, setSocket] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [order, setOrder] = useState<Order>(initialOrder);
  const [deliveryLocation, setDeliveryLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Initialize socket
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const socketInstance = await getSocket();
        setSocket(socketInstance);
        
        socketInstance.on('connect', () => {
          setConnected(true);
        });
        
        socketInstance.on('disconnect', () => {
          setConnected(false);
        });
        
        if (!socketInstance.connected) {
          socketInstance.connect();
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };
    
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, []);

  // Update local state when a new order is provided
  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
    }
  }, [initialOrder]);

  // Set up event listeners for the specific order
  useEffect(() => {
    if (!socket || !orderId) return;

    // Start listening for updates
    setIsListening(true);

    // Handler for order status updates
    const handleOrderUpdate = (data: OrderUpdatedEvent) => {
      if (data.orderId === orderId) {
        console.log('Order updated via socket:', data);
        setOrder(prevOrder => ({
          ...prevOrder,
          status: data.status,
          updatedAt: data.updatedAt
        }));
      }
    };

    // Handler for delivery location updates
    const handleLocationUpdate = (data: DeliveryLocationEvent) => {
      if (data.orderId === orderId) {
        console.log('Delivery location updated via socket:', data);
        setDeliveryLocation(data.location);
      }
    };

    // Subscribe to events
    socket.on(SocketEvent.ORDER_UPDATED, handleOrderUpdate);
    socket.on(SocketEvent.ORDER_STATUS_UPDATED, handleOrderUpdate);
    socket.on(SocketEvent.DELIVERY_LOCATION_UPDATED, handleLocationUpdate);

    // Join the order-specific room
    socket.emit('join-order', { orderId });

    // Clean up subscriptions
    return () => {
      socket.off(SocketEvent.ORDER_UPDATED, handleOrderUpdate);
      socket.off(SocketEvent.ORDER_STATUS_UPDATED, handleOrderUpdate);
      socket.off(SocketEvent.DELIVERY_LOCATION_UPDATED, handleLocationUpdate);
      
      // Leave the order-specific room
      socket.emit('leave-order', { orderId });
      setIsListening(false);
    };
  }, [socket, orderId]);

  return {
    order,
    deliveryLocation,
    isListening,
    isConnected: connected
  };
};