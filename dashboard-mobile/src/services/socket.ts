import { io, Socket } from 'socket.io-client';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket> => {
  if (!socket) {
    const token = await AsyncStorage.getItem('token');
    
    socket = io(Config.SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token,
      },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }

  return socket;
};

export const initSocket = async (): Promise<Socket> => {
  const socket = await getSocket();
  
  if (!socket.connected) {
    socket.connect();
  }
  
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
};

export const subscribeToEvent = <T>(event: string, callback: (data: T) => void): () => void => {
  if (!socket) return () => {};
  
  socket.on(event, callback);
  
  return () => {
    socket.off(event, callback);
  };
};

// Event types
export enum SocketEvent {
  // Order events
  ORDER_CREATED = 'order:created',
  ORDER_UPDATED = 'order:updated',
  ORDER_STATUS_UPDATED = 'order:statusUpdated',
  ORDER_ASSIGNED = 'order:assigned',
  
  // Delivery events
  DELIVERY_LOCATION_UPDATED = 'delivery:locationUpdated',
  DELIVERY_STATUS_UPDATED = 'delivery:statusUpdated',
  
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
}

// Example event payload types
export interface OrderCreatedEvent {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  createdAt: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: string;
  updatedAt: string;
}

export interface DeliveryLocationEvent {
  orderId: string;
  deliveryPersonId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
}