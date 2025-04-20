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
import { UseGuards, Logger, Inject, forwardRef } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { CreateNotificationDto } from '../../modules/notifications/dto/create-notification.dto';
import { NotificationType } from '../../modules/notifications/enums/notification-type.enum';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);
  
  @WebSocketServer() server: Server;
  
  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinUserNotifications')
  async handleJoinUserNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ): Promise<void> {
    client.join(`user_notifications_${userId}`);
    this.logger.log(`Client ${client.id} joined room: user_notifications_${userId}`);
    
    // Send unread notification count
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    client.emit('unreadCount', { count: unreadCount });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveUserNotifications')
  handleLeaveUserNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ): Promise<void> {
    client.leave(`user_notifications_${userId}`);
    this.logger.log(`Client ${client.id} left room: user_notifications_${userId}`);
    return;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; notificationId: string },
  ): Promise<void> {
    await this.notificationsService.markAsRead(data.notificationId);
    
    // Notify clients about the status change
    this.notifyNotificationStatusChange(data.userId, data.notificationId, true);
    
    // Send updated unread count
    const unreadCount = await this.notificationsService.getUnreadCount(data.userId);
    client.emit('unreadCount', { count: unreadCount });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ): Promise<void> {
    await this.notificationsService.markAllAsRead(userId);
    
    // Send updated unread count
    client.emit('unreadCount', { count: 0 });
    
    // Notify about status change
    this.server.to(`user_notifications_${userId}`).emit('allNotificationsRead');
  }

  /**
   * Creates and sends a notification to a specific user
   */
  async sendNotificationToUser(userId: string, notification: Omit<CreateNotificationDto, 'userId'>): Promise<void> {
    // Check if user has enabled this notification type
    const shouldSend = await this.notificationsService.shouldSendNotification(
      userId,
      notification.type as NotificationType,
    );
    
    if (!shouldSend) {
      return;
    }
    
    // Create notification in database
    const createdNotification = await this.notificationsService.create({
      ...notification,
      userId,
    });
    
    // Send to websocket clients
    this.server.to(`user_notifications_${userId}`).emit('newNotification', {
      ...(Array.isArray(createdNotification) ? createdNotification[0] : createdNotification),
      timestamp: new Date().toISOString(),
    });
    
    // Update unread count
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`user_notifications_${userId}`).emit('unreadCount', { count: unreadCount });
  }

  /**
   * Sends a notification to multiple users
   */
  async sendNotificationToUsers(userIds: string[], notification: Omit<CreateNotificationDto, 'userId' | 'userIds'>): Promise<void> {
    // Create notification with multiple recipients
    await this.notificationsService.create({
      ...notification,
      userIds,
    });
    
    // Send to each user's websocket clients
    for (const userId of userIds) {
      // Check if user has enabled this notification type
      const shouldSend = await this.notificationsService.shouldSendNotification(
        userId,
        notification.type as NotificationType,
      );
      
      if (shouldSend) {
        this.server.to(`user_notifications_${userId}`).emit('newNotification', {
          ...notification,
          userId,
          timestamp: new Date().toISOString(),
          read: false,
        });
        
        // Update unread count
        const unreadCount = await this.notificationsService.getUnreadCount(userId);
        this.server.to(`user_notifications_${userId}`).emit('unreadCount', { count: unreadCount });
      }
    }
  }

  /**
   * Sends a notification to all connected clients
   */
  async broadcastNotification(notification: Omit<CreateNotificationDto, 'userId' | 'userIds'>): Promise<void> {
    this.server.emit('broadcastNotification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sends an update about notification status change (read/unread)
   */
  notifyNotificationStatusChange(userId: string, notificationId: string, isRead: boolean): void {
    this.server.to(`user_notifications_${userId}`).emit('notificationStatusChanged', {
      notificationId,
      isRead,
      timestamp: new Date().toISOString(),
    });
  }
}