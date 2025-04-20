import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { addNewOrder, updateOrderInState } from '@/store/slices/ordersSlice';
import { useDispatch } from 'react-redux';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to the WebSocket server
    const socketIo = io(process.env.SOCKET_URL || 'http://localhost:3000', {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      query: {
        role: user.role,
      },
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('WebSocket connected');
    });

    socketIo.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    socketIo.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      console.error('WebSocket connection error:', err);
    });

    // Order events
    socketIo.on('newOrder', (order) => {
      console.log('New order received:', order);
      dispatch(addNewOrder(order));
    });

    socketIo.on('orderUpdated', (order) => {
      console.log('Order updated:', order);
      dispatch(updateOrderInState(order));
    });

    return () => {
      socketIo.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, token, user, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
};
