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
  namespace: 'analytics',
})
export class AnalyticsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AnalyticsGateway.name);
  
  @WebSocketServer() server: Server;
  
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected to analytics gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected from analytics gateway: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinDashboard')
  handleJoinDashboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() dashboardType: string, // 'admin', 'restaurant', 'delivery'
  ): void {
    client.join(`dashboard_${dashboardType}`);
    this.logger.log(`Client ${client.id} joined dashboard: ${dashboardType}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRestaurantAnalytics')
  handleJoinRestaurantAnalytics(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ): void {
    client.join(`restaurant_analytics_${restaurantId}`);
    this.logger.log(`Client ${client.id} joined restaurant analytics: ${restaurantId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveDashboard')
  handleLeaveDashboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() dashboardType: string,
  ): void {
    client.leave(`dashboard_${dashboardType}`);
    this.logger.log(`Client ${client.id} left dashboard: ${dashboardType}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveRestaurantAnalytics')
  handleLeaveRestaurantAnalytics(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ): void {
    client.leave(`restaurant_analytics_${restaurantId}`);
    this.logger.log(`Client ${client.id} left restaurant analytics: ${restaurantId}`);
  }

  /**
   * Broadcasts updated order statistics to all admin dashboards
   */
  broadcastOrderStats(stats: any): void {
    this.server.to('dashboard_admin').emit('orderStatsUpdate', {
      ...stats,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sends updated sales metrics to a specific restaurant
   */
  updateRestaurantSalesMetrics(restaurantId: string, metrics: any): void {
    this.server.to(`restaurant_analytics_${restaurantId}`).emit('salesMetricsUpdate', {
      restaurantId,
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Updates delivery performance metrics
   */
  updateDeliveryMetrics(metrics: any): void {
    this.server.to('dashboard_delivery').emit('deliveryMetricsUpdate', {
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcasts real-time system health metrics
   */
  broadcastSystemHealth(metrics: any): void {
    this.server.to('dashboard_admin').emit('systemHealthUpdate', {
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notifies about a significant analytics event
   */
  notifyAnalyticsEvent(eventType: string, eventData: any, targetDashboards: string[] = ['admin']): void {
    for (const dashboard of targetDashboards) {
      this.server.to(`dashboard_${dashboard}`).emit('analyticsEvent', {
        type: eventType,
        ...eventData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Updates a restaurant's real-time customer feedback
   */
  updateRealtimeFeedback(restaurantId: string, feedbackData: any): void {
    this.server.to(`restaurant_analytics_${restaurantId}`).emit('realtimeFeedback', {
      restaurantId,
      ...feedbackData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sends platform-wide traffic and usage metrics to admin dashboards
   */
  updatePlatformMetrics(metrics: any): void {
    this.server.to('dashboard_admin').emit('platformMetricsUpdate', {
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }
}