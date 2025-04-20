import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../shared/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19000'], // Frontends permitidos
    credentials: true,
  },
  namespace: 'orders',
})
export class OrdersGateway {
  @WebSocketServer() server: Server;

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinOrderRoom')
  handleJoinOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ): void {
    client.join(`order_${orderId}`);
    console.log(`Client ${client.id} joined room: order_${orderId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveOrderRoom')
  handleLeaveOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ): void {
    client.leave(`order_${orderId}`);
    console.log(`Client ${client.id} left room: order_${orderId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRestaurantOrders')
  handleJoinRestaurantOrders(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ): void {
    client.join(`restaurant_orders_${restaurantId}`);
    console.log(`Client ${client.id} joined room: restaurant_orders_${restaurantId}`);
  }

  /**
   * Envía una actualización de estado de orden a todos los clientes en la sala de la orden
   */
  notifyOrderStatusChange(orderId: string, status: string, additionalData: any = {}): void {
    this.server.to(`order_${orderId}`).emit('orderStatusChanged', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData,
    });
  }

  /**
   * Notifica a un restaurante sobre una nueva orden
   */
  notifyNewOrder(restaurantId: string, orderData: any): void {
    this.server.to(`restaurant_orders_${restaurantId}`).emit('newOrder', {
      ...orderData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Envía actualizaciones en tiempo real sobre la preparación de una orden
   */
  notifyOrderPreparationUpdate(orderId: string, updateData: any): void {
    this.server.to(`order_${orderId}`).emit('orderPreparationUpdate', {
      orderId,
      ...updateData,
      timestamp: new Date().toISOString(),
    });
  }
}