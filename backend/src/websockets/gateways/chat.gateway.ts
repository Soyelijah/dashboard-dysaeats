import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  WebSocketServer, 
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';

interface ChatMessage {
  text: string;
  from: string;
  to: string;
  timestamp?: string;
  orderId?: string;
  restaurantId?: string;
  isSystemMessage?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  private userSocketMap = new Map<string, string[]>(); // userId -> socketIds[]
  
  @WebSocketServer() server: Server;
  
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected to chat gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected from chat gateway: ${client.id}`);
    // Remove socket from userSocketMap
    if (client['user']?.sub) {
      const userId = client['user'].sub;
      const socketIds = this.userSocketMap.get(userId) || [];
      const updatedSocketIds = socketIds.filter(id => id !== client.id);
      
      if (updatedSocketIds.length === 0) {
        this.userSocketMap.delete(userId);
        this.logger.log(`User ${userId} is now offline`);
      } else {
        this.userSocketMap.set(userId, updatedSocketIds);
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('registerUser')
  handleRegisterUser(
    @ConnectedSocket() client: Socket,
  ): void {
    if (!client['user']?.sub) {
      return;
    }
    
    const userId = client['user'].sub;
    const socketIds = this.userSocketMap.get(userId) || [];
    if (!socketIds.includes(client.id)) {
      socketIds.push(client.id);
      this.userSocketMap.set(userId, socketIds);
      this.logger.log(`User ${userId} registered with socket ${client.id}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinOrderChat')
  handleJoinOrderChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ): void {
    client.join(`order_chat_${orderId}`);
    this.logger.log(`Client ${client.id} joined room: order_chat_${orderId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveOrderChat')
  handleLeaveOrderChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ): void {
    client.leave(`order_chat_${orderId}`);
    this.logger.log(`Client ${client.id} left room: order_chat_${orderId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendOrderMessage')
  handleSendOrderMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageData: ChatMessage,
  ): void {
    if (!messageData.orderId) {
      return;
    }
    
    const message = {
      ...messageData,
      timestamp: new Date().toISOString(),
    };
    
    // Send to everyone in the order chat room
    this.server.to(`order_chat_${messageData.orderId}`).emit('orderMessage', message);
    
    // Save message to database (would normally be implemented)
    // this.chatService.saveOrderMessage(message);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinDirectChat')
  handleJoinDirectChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() targetUserId: string,
  ): void {
    if (!client['user']?.sub) {
      return;
    }
    
    const userId = client['user'].sub;
    // Create a unique room for these two users (sorted for consistency)
    const participants = [userId, targetUserId].sort();
    const roomName = `direct_chat_${participants.join('_')}`;
    
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined direct chat: ${roomName}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendDirectMessage')
  handleSendDirectMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageData: ChatMessage,
  ): void {
    if (!client['user']?.sub || !messageData.to) {
      return;
    }
    
    const fromUserId = client['user'].sub;
    const toUserId = messageData.to;
    
    // Create a unique room for these two users (sorted for consistency)
    const participants = [fromUserId, toUserId].sort();
    const roomName = `direct_chat_${participants.join('_')}`;
    
    const message = {
      ...messageData,
      from: fromUserId,
      timestamp: new Date().toISOString(),
    };
    
    // Send to the room (both users if online)
    this.server.to(roomName).emit('directMessage', message);
    
    // Send to specific user sockets if they're not in the room
    const recipientSockets = this.userSocketMap.get(toUserId) || [];
    recipientSockets.forEach(socketId => {
      this.server.to(socketId).emit('directMessage', message);
    });
    
    // Save message to database (would normally be implemented)
    // this.chatService.saveDirectMessage(message);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRestaurantChat')
  handleJoinRestaurantChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ): void {
    client.join(`restaurant_chat_${restaurantId}`);
    this.logger.log(`Client ${client.id} joined room: restaurant_chat_${restaurantId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveRestaurantChat')
  handleLeaveRestaurantChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ): void {
    client.leave(`restaurant_chat_${restaurantId}`);
    this.logger.log(`Client ${client.id} left room: restaurant_chat_${restaurantId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendRestaurantMessage')
  handleSendRestaurantMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageData: ChatMessage,
  ): void {
    if (!client['user']?.sub || !messageData.restaurantId) {
      return;
    }
    
    const fromUserId = client['user'].sub;
    
    const message = {
      ...messageData,
      from: fromUserId,
      timestamp: new Date().toISOString(),
    };
    
    // Send to everyone in the restaurant chat room
    this.server.to(`restaurant_chat_${messageData.restaurantId}`).emit('restaurantMessage', message);
    
    // Save message to database (would normally be implemented)
    // this.chatService.saveRestaurantMessage(message);
  }

  /**
   * Sends a system message to an order chat
   */
  sendSystemMessageToOrder(orderId: string, text: string, additionalData: any = {}): void {
    const message: ChatMessage = {
      text,
      from: 'system',
      to: 'all',
      orderId,
      isSystemMessage: true,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };
    
    this.server.to(`order_chat_${orderId}`).emit('orderMessage', message);
  }

  /**
   * Checks if a user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId) && this.userSocketMap.get(userId).length > 0;
  }

  /**
   * Gets list of online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userSocketMap.keys());
  }
}