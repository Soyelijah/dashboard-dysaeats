import { Server, Socket } from 'socket.io';
import http from 'http';
import { supabase } from '../config/supabase';

/**
 * Sets up WebSocket functionality for Event Sourcing
 * @param server HTTP server instance
 */
export const setupEventSocket = (server: http.Server) => {
  // Initialize Socket.io with CORS configuration
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Event Sourcing namespace
  const eventNamespace = io.of('/events');

  // Connection handler
  eventNamespace.on('connection', (socket: Socket) => {
    console.log('Client connected to event-sourcing socket:', socket.id);

    // Set up Supabase realtime subscription for events table
    const subscription = supabase
      .channel('events-channel')
      .on('postgres_changes', { 
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'events' 
      }, (payload) => {
        // Emit the event to all connected clients
        const eventType = payload.eventType; // INSERT, UPDATE, DELETE
        
        if (eventType === 'INSERT') {
          socket.emit('event-created', payload.new);
          eventNamespace.emit('event-created-global', payload.new);
        } 
        else if (eventType === 'UPDATE') {
          socket.emit('event-updated', payload.new);
          eventNamespace.emit('event-updated-global', payload.new);
        }
        else if (eventType === 'DELETE') {
          socket.emit('event-deleted', payload.old);
          eventNamespace.emit('event-deleted-global', payload.old);
        }
      })
      .subscribe();

    // Handle client subscriptions to specific aggregates
    socket.on('subscribe-aggregate', (data: { aggregateType: string, aggregateId: string }) => {
      const room = `${data.aggregateType}:${data.aggregateId}`;
      socket.join(room);
      console.log(`Client ${socket.id} subscribed to ${room}`);
    });

    // Handle client unsubscriptions
    socket.on('unsubscribe-aggregate', (data: { aggregateType: string, aggregateId: string }) => {
      const room = `${data.aggregateType}:${data.aggregateId}`;
      socket.leave(room);
      console.log(`Client ${socket.id} unsubscribed from ${room}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected from event-sourcing socket:', socket.id);
    });
  });

  return io;
};