import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
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

export const initSocket = (): Socket => {
  const socket = getSocket();
  
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
  const socket = getSocket();
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

// Socket context state
export interface SocketState {
  isConnected: boolean;
  lastEvent: string | null;
  lastError: Error | null;
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