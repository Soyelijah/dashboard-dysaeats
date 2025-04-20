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

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  },
  namespace: 'restaurants',
})
export class RestaurantsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RestaurantsGateway.name);
  
  @WebSocketServer() server: Server;
  
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected to restaurants gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected from restaurants gateway: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRestaurantRoom')
  handleJoinRestaurantRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ): void {
    client.join(`restaurant_${restaurantId}`);
    this.logger.log(`Client ${client.id} joined room: restaurant_${restaurantId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveRestaurantRoom')
  handleLeaveRestaurantRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ): void {
    client.leave(`restaurant_${restaurantId}`);
    this.logger.log(`Client ${client.id} left room: restaurant_${restaurantId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinMenuUpdates')
  handleJoinMenuUpdates(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { restaurantId: string, categoryId?: string },
  ): void {
    const roomName = data.categoryId
      ? `menu_category_${data.categoryId}`
      : `restaurant_menu_${data.restaurantId}`;
    
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined room: ${roomName}`);
  }

  /**
   * Notify about a menu item becoming available or unavailable
   */
  notifyMenuItemAvailabilityChanged(
    restaurantId: string, 
    menuItemId: string, 
    isAvailable: boolean,
    categoryId?: string
  ): void {
    // Notify all clients watching the restaurant menu
    this.server.to(`restaurant_menu_${restaurantId}`).emit('menuItemAvailabilityChanged', {
      restaurantId,
      menuItemId,
      isAvailable,
      timestamp: new Date().toISOString(),
    });

    // If categoryId is provided, also notify clients watching that specific category
    if (categoryId) {
      this.server.to(`menu_category_${categoryId}`).emit('menuItemAvailabilityChanged', {
        restaurantId,
        categoryId,
        menuItemId,
        isAvailable,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Notify about a menu item update (price, description, etc.)
   */
  notifyMenuItemUpdated(restaurantId: string, menuItemId: string, updatedData: any): void {
    this.server.to(`restaurant_menu_${restaurantId}`).emit('menuItemUpdated', {
      restaurantId,
      menuItemId,
      ...updatedData,
      timestamp: new Date().toISOString(),
    });

    // If category ID is in the updated data, also notify that category room
    if (updatedData.categoryId) {
      this.server.to(`menu_category_${updatedData.categoryId}`).emit('menuItemUpdated', {
        restaurantId,
        menuItemId,
        ...updatedData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Notify about a restaurant's operational status change (open/closed)
   */
  notifyRestaurantStatusChange(restaurantId: string, isOpen: boolean, message?: string): void {
    this.server.to(`restaurant_${restaurantId}`).emit('restaurantStatusChanged', {
      restaurantId,
      isOpen,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about a change in operating hours or special schedules
   */
  notifyScheduleChange(restaurantId: string, scheduleData: any): void {
    this.server.to(`restaurant_${restaurantId}`).emit('scheduleChanged', {
      restaurantId,
      ...scheduleData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about a new promotion or special offer
   */
  notifyPromotionCreated(restaurantId: string, promotionData: any): void {
    this.server.to(`restaurant_${restaurantId}`).emit('promotionCreated', {
      restaurantId,
      ...promotionData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about a busy status update (wait times, capacity)
   */
  notifyBusyStatusUpdate(restaurantId: string, busyData: { waitTimeMinutes: number, capacityPercent: number }): void {
    this.server.to(`restaurant_${restaurantId}`).emit('busyStatusUpdate', {
      restaurantId,
      ...busyData,
      timestamp: new Date().toISOString(),
    });
  }
}