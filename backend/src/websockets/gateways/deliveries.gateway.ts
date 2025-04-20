import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
// import { WsJwtGuard } from '../../shared/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  },
  namespace: 'deliveries',
})
export class DeliveriesGateway {
  @WebSocketServer() server: Server;

  // @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinDeliveryTracking')
  handleJoinDeliveryTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() deliveryId: string,
  ): void {
    client.join(`delivery_tracking_${deliveryId}`);
    console.log(`Client ${client.id} joined room: delivery_tracking_${deliveryId}`);
  }

  // @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveDeliveryTracking')
  handleLeaveDeliveryTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() deliveryId: string,
  ): void {
    client.leave(`delivery_tracking_${deliveryId}`);
    console.log(`Client ${client.id} left room: delivery_tracking_${deliveryId}`);
  }

  // @UseGuards(WsJwtGuard)
  @SubscribeMessage('updateDriverLocation')
  handleUpdateDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() locationData: any,
  ): void {
    const { deliveryId, latitude, longitude } = locationData;
    
    // Actualizar y transmitir la nueva ubicación a todos los clientes siguiendo esta entrega
    this.updateDeliveryLocation(deliveryId, latitude, longitude);
  }

  /**
   * Actualiza y transmite la ubicación del repartidor a todos los clientes siguiendo esta entrega
   */
  updateDeliveryLocation(deliveryId: string, latitude: number, longitude: number): void {
    this.server.to(`delivery_tracking_${deliveryId}`).emit('locationUpdate', {
      deliveryId,
      location: { latitude, longitude },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notifica a los clientes sobre un cambio en el estado de la entrega
   */
  notifyDeliveryStatusChange(deliveryId: string, status: string, additionalData: any = {}): void {
    this.server.to(`delivery_tracking_${deliveryId}`).emit('deliveryStatusChanged', {
      deliveryId,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData,
    });
  }

  /**
   * Actualiza el tiempo estimado de llegada
   */
  updateEstimatedArrival(deliveryId: string, estimatedMinutes: number): void {
    this.server.to(`delivery_tracking_${deliveryId}`).emit('estimatedArrivalUpdate', {
      deliveryId,
      estimatedMinutes,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notifica que el repartidor ha llegado al destino
   */
  notifyDriverArrival(deliveryId: string): void {
    this.server.to(`delivery_tracking_${deliveryId}`).emit('driverArrival', {
      deliveryId,
      timestamp: new Date().toISOString(),
    });
  }
}