import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../modules/auth/enums/user-role.enum';

@Controller('api')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  // Auth endpoints
  @Post('auth/login')
  async login(@Body() loginData: any) {
    return this.gatewayService.login(loginData);
  }

  @Post('auth/register')
  async register(@Body() registerData: any) {
    return this.gatewayService.register(registerData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  async getProfile(@Request() req) {
    return req.user;
  }

  // Restaurant endpoints
  @Get('restaurants')
  async getRestaurants(@Query() query: any) {
    return this.gatewayService.getRestaurants(query);
  }

  @Get('restaurants/:id')
  async getRestaurantById(@Param('id') id: string) {
    return this.gatewayService.getRestaurantById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('restaurants')
  async createRestaurant(@Body() data: any) {
    return this.gatewayService.createRestaurant(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER)
  @Patch('restaurants/:id')
  async updateRestaurant(@Param('id') id: string, @Body() data: any) {
    return this.gatewayService.updateRestaurant(id, data);
  }

  // Menu endpoints
  @Get('restaurants/:restaurantId/menu')
  async getMenuItems(@Param('restaurantId') restaurantId: string) {
    return this.gatewayService.getMenuItems(restaurantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER, UserRole.RESTAURANT_STAFF)
  @Post('restaurants/:restaurantId/menu')
  async createMenuItem(@Param('restaurantId') restaurantId: string, @Body() data: any) {
    return this.gatewayService.createMenuItem({ ...data, restaurantId });
  }

  // Order endpoints
  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrders(@Query() query: any, @Request() req) {
    // Filter orders based on user role
    if (req.user.role === UserRole.CUSTOMER) {
      query.customerId = req.user.id;
    } else if (req.user.role === UserRole.RESTAURANT_OWNER || req.user.role === UserRole.RESTAURANT_STAFF) {
      query.restaurantId = req.user.restaurantId;
    } else if (req.user.role === UserRole.DELIVERY_PERSON) {
      query.deliveryPersonId = req.user.id;
    }
    return this.gatewayService.getOrders(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.gatewayService.getOrderById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async createOrder(@Body() data: any, @Request() req) {
    // Set the customer ID from the authenticated user
    return this.gatewayService.createOrder({ ...data, customerId: req.user.id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER, UserRole.RESTAURANT_STAFF)
  @Patch('orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() data: any) {
    return this.gatewayService.updateOrderStatus(id, data.status);
  }

  // Payment endpoints
  @UseGuards(JwtAuthGuard)
  @Post('payments')
  async processPayment(@Body() data: any) {
    return this.gatewayService.processPayment(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('payments/:id/status')
  async getPaymentStatus(@Param('id') id: string) {
    return this.gatewayService.getPaymentStatus(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER)
  @Post('payments/:id/refund')
  async refundPayment(@Param('id') id: string, @Body() data: any) {
    return this.gatewayService.refundPayment(id, data.amount);
  }

  // Delivery endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER, UserRole.RESTAURANT_STAFF)
  @Post('deliveries/assign')
  async assignDeliveryPerson(@Body() data: any) {
    return this.gatewayService.assignDeliveryPerson(data.orderId, data.deliveryPersonId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DELIVERY_PERSON)
  @Patch('deliveries/:orderId/status')
  async updateDeliveryStatus(@Param('orderId') orderId: string, @Body() data: any) {
    return this.gatewayService.updateDeliveryStatus(orderId, data.status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('deliveries/:id/location')
  async getDeliveryLocation(@Param('id') id: string) {
    return this.gatewayService.getDeliveryLocation(id);
  }

  // Notification endpoints
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getNotifications(@Request() req) {
    return this.gatewayService.getNotifications(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Param('id') id: string) {
    return this.gatewayService.markNotificationAsRead(id);
  }

  // Analytics endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER)
  @Get('analytics/restaurant/:id')
  async getRestaurantStatistics(@Param('id') id: string, @Query('timeRange') timeRange: string) {
    return this.gatewayService.getRestaurantStatistics(id, timeRange || 'week');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER)
  @Get('analytics/dashboard/:id')
  async getDashboardData(@Param('id') id: string, @Query() query: any) {
    return this.gatewayService.getDashboardData(id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT_OWNER)
  @Post('analytics/export')
  async exportData(@Body() data: any) {
    return this.gatewayService.exportData(data.restaurantId, data.exportOptions);
  }
}