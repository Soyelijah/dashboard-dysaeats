import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class GatewayService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('RESTAURANT_SERVICE') private readonly restaurantService: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly orderService: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentService: ClientProxy,
    @Inject('DELIVERY_SERVICE') private readonly deliveryService: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationService: ClientProxy,
    @Inject('ANALYTICS_SERVICE') private readonly analyticsService: ClientProxy,
  ) {}

  // Auth Service Methods
  async login(loginData: any): Promise<Observable<any>> {
    return this.authService.send({ cmd: 'login' }, loginData);
  }

  async register(registerData: any): Promise<Observable<any>> {
    return this.authService.send({ cmd: 'register' }, registerData);
  }

  async validateToken(token: string): Promise<Observable<any>> {
    return this.authService.send({ cmd: 'validate_token' }, { token });
  }

  // Restaurant Service Methods
  async getRestaurants(query: any): Promise<Observable<any>> {
    return this.restaurantService.send({ cmd: 'get_restaurants' }, query);
  }

  async getRestaurantById(id: string): Promise<Observable<any>> {
    return this.restaurantService.send({ cmd: 'get_restaurant_by_id' }, { id });
  }

  async createRestaurant(data: any): Promise<Observable<any>> {
    return this.restaurantService.send({ cmd: 'create_restaurant' }, data);
  }

  async updateRestaurant(id: string, data: any): Promise<Observable<any>> {
    return this.restaurantService.send({ cmd: 'update_restaurant' }, { id, ...data });
  }

  // Menu Service Methods (part of Restaurant Service)
  async getMenuItems(restaurantId: string): Promise<Observable<any>> {
    return this.restaurantService.send({ cmd: 'get_menu_items' }, { restaurantId });
  }

  async createMenuItem(data: any): Promise<Observable<any>> {
    return this.restaurantService.send({ cmd: 'create_menu_item' }, data);
  }

  // Order Service Methods
  async getOrders(query: any): Promise<Observable<any>> {
    return this.orderService.send({ cmd: 'get_orders' }, query);
  }

  async getOrderById(id: string): Promise<Observable<any>> {
    return this.orderService.send({ cmd: 'get_order_by_id' }, { id });
  }

  async createOrder(data: any): Promise<Observable<any>> {
    return this.orderService.send({ cmd: 'create_order' }, data);
  }

  async updateOrderStatus(id: string, status: string): Promise<Observable<any>> {
    return this.orderService.send({ cmd: 'update_order_status' }, { id, status });
  }

  // Payment Service Methods
  async processPayment(data: any): Promise<Observable<any>> {
    return this.paymentService.send({ cmd: 'process_payment' }, data);
  }

  async getPaymentStatus(paymentId: string): Promise<Observable<any>> {
    return this.paymentService.send({ cmd: 'get_payment_status' }, { paymentId });
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Observable<any>> {
    return this.paymentService.send({ cmd: 'refund_payment' }, { paymentId, amount });
  }

  // Delivery Service Methods
  async assignDeliveryPerson(orderId: string, deliveryPersonId: string): Promise<Observable<any>> {
    return this.deliveryService.send({ cmd: 'assign_delivery_person' }, { orderId, deliveryPersonId });
  }

  async updateDeliveryStatus(orderId: string, status: string): Promise<Observable<any>> {
    return this.deliveryService.send({ cmd: 'update_delivery_status' }, { orderId, status });
  }

  async getDeliveryLocation(deliveryId: string): Promise<Observable<any>> {
    return this.deliveryService.send({ cmd: 'get_delivery_location' }, { deliveryId });
  }

  // Notification Service Methods
  async sendNotification(data: any): Promise<Observable<any>> {
    return this.notificationService.send({ cmd: 'send_notification' }, data);
  }

  async getNotifications(userId: string): Promise<Observable<any>> {
    return this.notificationService.send({ cmd: 'get_notifications' }, { userId });
  }

  async markNotificationAsRead(notificationId: string): Promise<Observable<any>> {
    return this.notificationService.send({ cmd: 'mark_as_read' }, { notificationId });
  }

  // Analytics Service Methods
  async getRestaurantStatistics(restaurantId: string, timeRange: string): Promise<Observable<any>> {
    return this.analyticsService.send({ cmd: 'get_restaurant_statistics' }, { restaurantId, timeRange });
  }

  async getDashboardData(restaurantId: string, query: any): Promise<Observable<any>> {
    return this.analyticsService.send({ cmd: 'get_dashboard_data' }, { restaurantId, ...query });
  }

  async exportData(restaurantId: string, exportOptions: any): Promise<Observable<any>> {
    return this.analyticsService.send({ cmd: 'export_data' }, { restaurantId, exportOptions });
  }
}