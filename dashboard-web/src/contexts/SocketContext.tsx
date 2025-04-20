import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket, SocketState, SocketEvent } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';

interface SocketContextType {
  socket: Socket | null;
  state: SocketState;
  connect: () => void;
  disconnect: () => void;
}

const initialState: SocketState = {
  isConnected: false,
  lastEvent: null,
  lastError: null,
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  state: initialState,
  connect: () => {},
  disconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>(initialState);
  const { isAuthenticated } = useAuth();

  const connect = () => {
    if (!isAuthenticated) return;
    
    try {
      const newSocket = initSocket();
      setSocket(newSocket);
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  };

  const disconnect = () => {
    disconnectSocket();
    setSocket(null);
    setState({
      ...state,
      isConnected: false,
    });
  };

  useEffect(() => {
    if (isAuthenticated && !socket) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    // Set up event listeners
    const onConnect = () => {
      setState({
        ...state,
        isConnected: true,
        lastError: null,
      });
      console.log('Socket connected');
    };

    const onDisconnect = (reason: string) => {
      setState({
        ...state,
        isConnected: false,
        lastEvent: reason,
      });
      console.log('Socket disconnected:', reason);
    };

    const onConnectError = (error: Error) => {
      setState({
        ...state,
        lastError: error,
      });
      console.error('Socket connection error:', error);
    };

    // Subscribe to connection events
    socket.on(SocketEvent.CONNECT, onConnect);
    socket.on(SocketEvent.DISCONNECT, onDisconnect);
    socket.on(SocketEvent.CONNECT_ERROR, onConnectError);

    // Clean up event listeners
    return () => {
      socket.off(SocketEvent.CONNECT, onConnect);
      socket.off(SocketEvent.DISCONNECT, onDisconnect);
      socket.off(SocketEvent.CONNECT_ERROR, onConnectError);
    };
  }, [socket, state]);

  const value = {
    socket,
    state,
    connect,
    disconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};