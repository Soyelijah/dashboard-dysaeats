import { Injectable } from '@nestjs/common';
import { OrdersGateway } from '../gateways/orders.gateway';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { DeliveriesGateway } from '../gateways/deliveries.gateway';
import { RestaurantsGateway } from '../gateways/restaurants.gateway';
import { ChatGateway } from '../gateways/chat.gateway';
import { AnalyticsGateway } from '../gateways/analytics.gateway';
import { CreateNotificationDto } from '../../modules/notifications/dto/create-notification.dto';
import { NotificationType } from '../../modules/notifications/enums/notification-type.enum';

/**
 * Central service to manage and dispatch WebSocket events across the application
 */
@Injectable()
export class WebsocketEventsService {
  constructor(
    private readonly ordersGateway: OrdersGateway,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly deliveriesGateway: DeliveriesGateway,
    private readonly restaurantsGateway: RestaurantsGateway,
    private readonly chatGateway: ChatGateway,
    private readonly analyticsGateway: AnalyticsGateway,
  ) {}

  /**
   * Order-related events
   */
  notifyOrderStatusChange(orderId: string, status: string, additionalData: any = {}): void {
    this.ordersGateway.notifyOrderStatusChange(orderId, status, additionalData);
  }

  notifyNewOrder(restaurantId: string, orderData: any): void {
    this.ordersGateway.notifyNewOrder(restaurantId, orderData);
    
    // Also send notification to restaurant
    const notification = {
      title: 'New Order Received',
      content: `Order #${orderData.orderNumber || orderData.id} has been received and is waiting for confirmation`,
      type: NotificationType.ORDER_CREATED,
      data: { orderId: orderData.id },
    };
    
    this.notificationsGateway.sendNotificationToUser(restaurantId, notification);
    
    // Update analytics
    this.analyticsGateway.broadcastOrderStats({
      newOrderCount: 1,
      restaurantId,
      orderId: orderData.id,
      amount: orderData.totalAmount,
    });
  }

  notifyOrderPreparationUpdate(orderId: string, updateData: any): void {
    this.ordersGateway.notifyOrderPreparationUpdate(orderId, updateData);
  }

  /**
   * Delivery-related events
   */
  updateDeliveryLocation(deliveryId: string, latitude: number, longitude: number): void {
    this.deliveriesGateway.updateDeliveryLocation(deliveryId, latitude, longitude);
  }

  notifyDeliveryStatusChange(deliveryId: string, status: string, additionalData: any = {}): void {
    this.deliveriesGateway.notifyDeliveryStatusChange(deliveryId, status, additionalData);
    
    // If delivery is completed, update analytics
    if (status === 'completed' && additionalData.orderId) {
      this.analyticsGateway.updateDeliveryMetrics({
        completedDeliveryCount: 1,
        orderId: additionalData.orderId,
        deliveryTime: additionalData.deliveryTime,
      });
    }
  }

  updateEstimatedArrival(deliveryId: string, estimatedMinutes: number): void {
    this.deliveriesGateway.updateEstimatedArrival(deliveryId, estimatedMinutes);
  }

  notifyDriverArrival(deliveryId: string): void {
    this.deliveriesGateway.notifyDriverArrival(deliveryId);
  }

  /**
   * Restaurant-related events
   */
  notifyMenuItemAvailabilityChanged(
    restaurantId: string, 
    menuItemId: string, 
    isAvailable: boolean,
    categoryId?: string
  ): void {
    this.restaurantsGateway.notifyMenuItemAvailabilityChanged(
      restaurantId, 
      menuItemId, 
      isAvailable,
      categoryId
    );
  }

  notifyMenuItemUpdated(restaurantId: string, menuItemId: string, updatedData: any): void {
    this.restaurantsGateway.notifyMenuItemUpdated(restaurantId, menuItemId, updatedData);
  }

  notifyRestaurantStatusChange(restaurantId: string, isOpen: boolean, message?: string): void {
    this.restaurantsGateway.notifyRestaurantStatusChange(restaurantId, isOpen, message);
  }

  notifyScheduleChange(restaurantId: string, scheduleData: any): void {
    this.restaurantsGateway.notifyScheduleChange(restaurantId, scheduleData);
  }

  notifyPromotionCreated(restaurantId: string, promotionData: any): void {
    this.restaurantsGateway.notifyPromotionCreated(restaurantId, promotionData);
  }

  notifyBusyStatusUpdate(restaurantId: string, busyData: { waitTimeMinutes: number, capacityPercent: number }): void {
    this.restaurantsGateway.notifyBusyStatusUpdate(restaurantId, busyData);
  }

  /**
   * Notification-related events
   */
  async sendNotificationToUser(userId: string, notification: any): Promise<void> {
    await this.notificationsGateway.sendNotificationToUser(userId, notification);
  }

  async sendNotificationToUsers(userIds: string[], notification: any): Promise<void> {
    await this.notificationsGateway.sendNotificationToUsers(userIds, notification);
  }

  async broadcastNotification(notification: any): Promise<void> {
    await this.notificationsGateway.broadcastNotification(notification);
  }

  notifyNotificationStatusChange(userId: string, notificationId: string, isRead: boolean): void {
    this.notificationsGateway.notifyNotificationStatusChange(userId, notificationId, isRead);
  }

  /**
   * Chat-related events
   */
  sendSystemMessageToOrder(orderId: string, text: string, additionalData: any = {}): void {
    this.chatGateway.sendSystemMessageToOrder(orderId, text, additionalData);
  }

  isUserOnline(userId: string): boolean {
    return this.chatGateway.isUserOnline(userId);
  }

  getOnlineUsers(): string[] {
    return this.chatGateway.getOnlineUsers();
  }

  /**
   * Analytics-related events
   */
  broadcastOrderStats(stats: any): void {
    this.analyticsGateway.broadcastOrderStats(stats);
  }

  updateRestaurantSalesMetrics(restaurantId: string, metrics: any): void {
    this.analyticsGateway.updateRestaurantSalesMetrics(restaurantId, metrics);
  }

  updateDeliveryMetrics(metrics: any): void {
    this.analyticsGateway.updateDeliveryMetrics(metrics);
  }

  broadcastSystemHealth(metrics: any): void {
    this.analyticsGateway.broadcastSystemHealth(metrics);
  }

  notifyAnalyticsEvent(eventType: string, eventData: any, targetDashboards: string[] = ['admin']): void {
    this.analyticsGateway.notifyAnalyticsEvent(eventType, eventData, targetDashboards);
  }

  updateRealtimeFeedback(restaurantId: string, feedbackData: any): void {
    this.analyticsGateway.updateRealtimeFeedback(restaurantId, feedbackData);
  }

  updatePlatformMetrics(metrics: any): void {
    this.analyticsGateway.updatePlatformMetrics(metrics);
  }
}