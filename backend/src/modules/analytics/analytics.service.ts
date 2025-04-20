import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In, Not, IsNull } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menu-item.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../auth/entities/user.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { PaymentStatus } from '../orders/enums/payment-status.enum';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getRestaurantStatistics(restaurantId: string, timeRange: 'today' | 'week' | 'month') {
    try {
      const restaurant = await this.restaurantRepository.findOneBy({ id: restaurantId });
      if (!restaurant) {
        throw new Error(`Restaurant with ID "${restaurantId}" not found`);
      }

      // Determinar rango de fechas
      const { startDate, endDate } = this.getDateRange(timeRange);
      
      // Contar pedidos por estado
      const pendingOrders = await this.countOrdersByStatus(
        restaurantId, 
        [OrderStatus.PENDING], 
        startDate, 
        endDate
      );
      
      const confirmedOrders = await this.countOrdersByStatus(
        restaurantId, 
        [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY], 
        startDate, 
        endDate
      );
      
      const inDeliveryOrders = await this.countOrdersByStatus(
        restaurantId, 
        [OrderStatus.IN_DELIVERY], 
        startDate, 
        endDate
      );
      
      const completedOrders = await this.countOrdersByStatus(
        restaurantId, 
        [OrderStatus.DELIVERED], 
        startDate, 
        endDate
      );
      
      const cancelledOrders = await this.countOrdersByStatus(
        restaurantId, 
        [OrderStatus.CANCELLED, OrderStatus.REJECTED], 
        startDate, 
        endDate
      );
      
      // Calcular ingresos totales de pedidos entregados
      const totalRevenue = await this.calculateTotalRevenue(
        restaurantId, 
        startDate, 
        endDate
      );
      
      // Obtener datos para gráficos según el rango de tiempo
      const revenueData = await this.getRevenueData(
        restaurantId, 
        timeRange
      );
      
      // Obtener productos más vendidos
      const topProducts = await this.getTopProducts(
        restaurantId, 
        startDate, 
        endDate
      );

      // Calcular tiempos promedio
      const averagePreparationTime = await this.calculateAveragePreparationTime(
        restaurantId, 
        startDate, 
        endDate
      );
      
      const averageDeliveryTime = await this.calculateAverageDeliveryTime(
        restaurantId, 
        startDate, 
        endDate
      );

      // Obtener valoración promedio
      const averageRating = await this.calculateAverageRating(
        restaurantId, 
        startDate, 
        endDate
      );

      return {
        totalOrders: pendingOrders + confirmedOrders + inDeliveryOrders + completedOrders + cancelledOrders,
        pendingOrders,
        confirmedOrders,
        inDeliveryOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        averagePreparationTime,
        averageDeliveryTime,
        averageRating,
        revenueData,
        topProducts,
        timeRange,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting restaurant statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getDateRange(timeRange: 'today' | 'week' | 'month'): { startDate: Date, endDate: Date } {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'week':
        // Hace 7 días
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        // Hace 30 días
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'today':
      default:
        // Hoy desde medianoche
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    return { startDate, endDate: new Date() };
  }

  private async countOrdersByStatus(
    restaurantId: string, 
    statuses: OrderStatus[], 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    return this.orderRepository.count({
      where: {
        restaurant: { id: restaurantId },
        status: statuses.length === 1 ? statuses[0] : In(statuses),
        createdAt: Between(startDate, endDate)
      }
    });
  }

  private async calculateTotalRevenue(
    restaurantId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.restaurant.id = :restaurantId', { restaurantId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.COMPLETED })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();
    
    return Number(result.total) || 0;
  }

  private async getRevenueData(
    restaurantId: string,
    timeRange: 'today' | 'week' | 'month'
  ) {
    // Implementación específica para el rango de tiempo seleccionado
    switch (timeRange) {
      case 'today':
        return this.getHourlyRevenueData(restaurantId);
      case 'week':
        return this.getDailyRevenueData(restaurantId, 7);
      case 'month':
      default:
        return this.getDailyRevenueData(restaurantId, 30);
    }
  }

  private async getHourlyRevenueData(restaurantId: string): Promise<any[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const orders = await this.orderRepository.find({
      where: {
        restaurant: { id: restaurantId },
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.COMPLETED,
        createdAt: Between(startOfDay, endOfDay)
      },
      select: ['createdAt', 'total']
    });
    
    // Agrupar por hora
    const hourlyData = Array(24).fill(0).map((_, index) => ({
      hour: index,
      label: `${index.toString().padStart(2, '0')}:00`,
      revenue: 0,
      orders: 0
    }));
    
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].revenue += Number(order.total);
      hourlyData[hour].orders += 1;
    });
    
    return hourlyData;
  }

  private async getDailyRevenueData(restaurantId: string, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const orders = await this.orderRepository.find({
      where: {
        restaurant: { id: restaurantId },
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.COMPLETED,
        createdAt: Between(startDate, endDate)
      },
      select: ['createdAt', 'total']
    });
    
    // Crear array con los últimos "days" días
    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      dailyData.push({
        date: dateString,
        day: new Intl.DateTimeFormat('es', { weekday: 'short' }).format(date),
        revenue: 0,
        orders: 0
      });
    }
    
    // Rellenar datos
    orders.forEach(order => {
      const dateString = new Date(order.createdAt).toISOString().split('T')[0];
      const dayIndex = dailyData.findIndex(d => d.date === dateString);
      
      if (dayIndex !== -1) {
        dailyData[dayIndex].revenue += Number(order.total);
        dailyData[dayIndex].orders += 1;
      }
    });
    
    return dailyData;
  }

  private async getTopProducts(
    restaurantId: string, 
    startDate: Date, 
    endDate: Date,
    limit: number = 5
  ): Promise<any[]> {
    // Obtener órdenes del restaurante en el período
    const orders = await this.orderRepository.find({
      where: {
        restaurant: { id: restaurantId },
        createdAt: Between(startDate, endDate),
        status: OrderStatus.DELIVERED
      },
      relations: ['items'],
    });
    
    if (orders.length === 0) {
      return [];
    }
    
    // Agrupar items por nombre
    const productMap: Record<string, { name: string, quantity: number, revenue: number }> = {};
    
    // Procesar cada orden y sus ítems
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.name;
        
        if (!productMap[itemName]) {
          productMap[itemName] = {
            name: itemName,
            quantity: 0,
            revenue: 0
          };
        }
        
        productMap[itemName].quantity += item.quantity;
        productMap[itemName].revenue += item.quantity * Number(item.price);
      });
    });
    
    // Convertir a array y ordenar
    const products = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
    
    return products.map((product, index) => ({
      id: index.toString(), // Generamos un ID sintético
      name: product.name,
      quantity: product.quantity,
      revenue: product.revenue
    }));
  }

  private async calculateAveragePreparationTime(
    restaurantId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    // Calcular tiempo promedio entre confirmación y listo para entrega
    const orders = await this.orderRepository.find({
      where: {
        restaurant: { id: restaurantId },
        status: In([OrderStatus.READY, OrderStatus.IN_DELIVERY, OrderStatus.DELIVERED]),
        createdAt: Between(startDate, endDate),
        acceptedAt: Not(IsNull()),
        preparedAt: Not(IsNull())
      },
      select: ['acceptedAt', 'preparedAt']
    });
    
    if (orders.length === 0) {
      return 0;
    }
    
    // Calcular diferencia en minutos entre acceptedAt y preparedAt
    const totalMinutes = orders.reduce((sum, order) => {
      const acceptedTime = new Date(order.acceptedAt).getTime();
      const preparedTime = new Date(order.preparedAt).getTime();
      
      // Diferencia en minutos
      const diffMinutes = (preparedTime - acceptedTime) / (1000 * 60);
      return sum + diffMinutes;
    }, 0);
    
    return Math.round(totalMinutes / orders.length);
  }

  private async calculateAverageDeliveryTime(
    restaurantId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    // Calcular tiempo promedio entre listo y entregado
    const orders = await this.orderRepository.find({
      where: {
        restaurant: { id: restaurantId },
        status: OrderStatus.DELIVERED,
        createdAt: Between(startDate, endDate),
        preparedAt: Not(IsNull()),
        deliveredAt: Not(IsNull())
      },
      select: ['preparedAt', 'deliveredAt']
    });
    
    if (orders.length === 0) {
      return 0;
    }
    
    // Calcular diferencia en minutos entre preparedAt y deliveredAt
    const totalMinutes = orders.reduce((sum, order) => {
      const preparedTime = new Date(order.preparedAt).getTime();
      const deliveredTime = new Date(order.deliveredAt).getTime();
      
      // Diferencia en minutos
      const diffMinutes = (deliveredTime - preparedTime) / (1000 * 60);
      return sum + diffMinutes;
    }, 0);
    
    return Math.round(totalMinutes / orders.length);
  }

  private async calculateAverageRating(
    restaurantId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    // Implementación depende de cómo estén modeladas las valoraciones
    // Este es un ejemplo asumiendo que hay un campo rating en la entidad Order
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('AVG(order.rating)', 'averageRating')
      .where('order.restaurant.id = :restaurantId', { restaurantId })
      .andWhere('order.rating IS NOT NULL')
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();
    
    return result.averageRating ? Number(result.averageRating) : 0;
  }

  // Métodos para el controlador principal
  async getDashboardData(query: any) {
    try {
      const { startDate, endDate } = this.parseDateRange(query);
      
      // Estadísticas generales
      const totalOrders = await this.countOrdersByDateRange(null, startDate, endDate);
      const totalSales = await this.calculateTotalRevenue(null, startDate, endDate);
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Estadísticas de clientes
      const totalCustomers = await this.countUniqueCustomers(null, startDate, endDate);
      
      // Datos para gráficos
      const salesByDay = await this.getSalesByDay(null, startDate, endDate);
      const ordersByStatus = await this.getOrdersByStatus(null, startDate, endDate);
      
      return {
        summary: {
          totalOrders,
          totalSales,
          averageOrderValue,
          totalCustomers,
        },
        charts: {
          salesByDay,
          ordersByStatus,
        },
        query: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      };
    } catch (error) {
      this.logger.error(`Error getting dashboard data: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Métodos para dar soporte a los endpoints requeridos por el controlador
  async getSalesData(query: any) {
    const { startDate, endDate } = this.parseDateRange(query);
    return this.getSalesByDay(null, startDate, endDate);
  }

  async getOrdersData(query: any) {
    const { startDate, endDate } = this.parseDateRange(query);
    return this.getOrdersByStatus(null, startDate, endDate);
  }

  async getCustomersData(query: any) {
    try {
      const { startDate, endDate } = this.parseDateRange(query);
      const totalCustomers = await this.countUniqueCustomers(null, startDate, endDate);
      const newCustomers = await this.countNewCustomers(startDate, endDate);
      const returningCustomers = totalCustomers - newCustomers;
      
      return {
        totalCustomers,
        newCustomers,
        returningCustomers,
        period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      };
    } catch (error) {
      this.logger.error(`Error getting customers data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getProductsData(query: any) {
    try {
      const { startDate, endDate } = this.parseDateRange(query);
      const topProducts = await this.getTopProducts(null, startDate, endDate, 10);
      
      return {
        topProducts,
        period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      };
    } catch (error) {
      this.logger.error(`Error getting products data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRestaurantStats(restaurantId: string, query: any) {
    const timeRange = query.timeRange || 'week';
    return this.getRestaurantStatistics(restaurantId, timeRange);
  }

  async exportData(exportOptions: any) {
    try {
      const { format, type, filters, restaurantId } = exportOptions;
      const { startDate, endDate } = this.parseDateRange(filters || {});
      
      // Validar que el restaurante existe si se especifica uno
      if (restaurantId) {
        const restaurant = await this.restaurantRepository.findOneBy({ id: restaurantId });
        if (!restaurant) {
          throw new Error(`Restaurant with ID "${restaurantId}" not found`);
        }
      }
      
      // Obtener datos según el tipo solicitado
      let exportData;
      switch (type) {
        case 'orders':
          exportData = await this.getOrdersDataForExport(restaurantId, startDate, endDate);
          break;
        case 'sales':
          exportData = await this.getSalesDataForExport(restaurantId, startDate, endDate);
          break;
        case 'products':
          exportData = await this.getProductsDataForExport(restaurantId, startDate, endDate);
          break;
        case 'customers':
          exportData = await this.getCustomersDataForExport(restaurantId, startDate, endDate);
          break;
        default:
          throw new Error(`Export type "${type}" not supported`);
      }
      
      // En una implementación real, aquí procesaríamos los datos al formato deseado
      // y los guardaríamos en un almacenamiento (S3, sistema de archivos, etc.)
      
      // Por ahora, simulamos el proceso
      const fileName = `${restaurantId ? `restaurant_${restaurantId}_` : ''}${type}_${new Date().toISOString().split('T')[0]}.${format}`;
      
      return {
        success: true,
        message: `Data exported successfully in ${format} format`,
        fileName,
        downloadUrl: `/api/exports/${fileName}`,
        recordCount: exportData.length,
        exportOptions: {
          type,
          format,
          restaurantId,
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }
        }
      };
    } catch (error) {
      this.logger.error(`Error exporting data: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Métodos para reportes periódicos
  async getDailyReport(query: any) {
    try {
      const date = query.date ? new Date(query.date) : new Date();
      date.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      return this.generatePeriodReport(date, endDate, 'daily');
    } catch (error) {
      this.logger.error(`Error getting daily report: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getWeeklyReport(query: any) {
    try {
      // Calcular fecha de inicio (primer día de la semana)
      const date = query.date ? new Date(query.date) : new Date();
      const startDate = new Date(date);
      startDate.setDate(date.getDate() - date.getDay()); // Domingo como primer día
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      
      return this.generatePeriodReport(startDate, endDate, 'weekly');
    } catch (error) {
      this.logger.error(`Error getting weekly report: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMonthlyReport(query: any) {
    try {
      // Calcular fecha de inicio (primer día del mes)
      let year = new Date().getFullYear();
      let month = new Date().getMonth();
      
      if (query.year) year = parseInt(query.year);
      if (query.month) month = parseInt(query.month) - 1; // Ajustar para formato 0-11
      
      const startDate = new Date(year, month, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Último día del mes
      
      return this.generatePeriodReport(startDate, endDate, 'monthly');
    } catch (error) {
      this.logger.error(`Error getting monthly report: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Métodos auxiliares privados
  private async generatePeriodReport(startDate: Date, endDate: Date, periodType: string) {
    // Estadísticas generales
    const totalOrders = await this.countOrdersByDateRange(null, startDate, endDate);
    const totalSales = await this.calculateTotalRevenue(null, startDate, endDate);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Estadísticas por restaurante (top 5)
    const topRestaurants = await this.getTopRestaurants(startDate, endDate, 5);
    
    // Estadísticas por producto (top 10)
    const topProducts = await this.getTopProducts(null, startDate, endDate, 10);
    
    return {
      periodType,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalOrders,
        totalSales,
        averageOrderValue,
      },
      details: {
        topRestaurants,
        topProducts,
      }
    };
  }

  private async getTopRestaurants(startDate: Date, endDate: Date, limit: number = 5) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.restaurant.id', 'restaurantId')
      .addSelect('restaurant.name', 'name')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total)', 'revenue')
      .innerJoin('order.restaurant', 'restaurant')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.COMPLETED })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('order.restaurant.id')
      .addGroupBy('restaurant.name')
      .orderBy('revenue', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return result.map(item => ({
      id: item.restaurantId,
      name: item.name,
      orderCount: parseInt(item.orderCount, 10),
      revenue: parseFloat(item.revenue),
    }));
  }

  private parseDateRange(query: any): { startDate: Date, endDate: Date } {
    let startDate: Date;
    let endDate: Date = new Date();
    
    if (query.startDate) {
      startDate = new Date(query.startDate);
    } else {
      // Por defecto, último mes
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    if (query.endDate) {
      endDate = new Date(query.endDate);
    }
    
    // Ajustar horas para abarcar el día completo
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }

  private async countOrdersByDateRange(
    restaurantId: string | null, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    const whereCondition: any = {
      createdAt: Between(startDate, endDate)
    };
    
    if (restaurantId) {
      whereCondition.restaurant = { id: restaurantId };
    }
    
    return this.orderRepository.count({ where: whereCondition });
  }

  private async countUniqueCustomers(
    restaurantId: string | null, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.customer.id)', 'count')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    
    if (restaurantId) {
      queryBuilder.andWhere('order.restaurant.id = :restaurantId', { restaurantId });
    }
    
    const result = await queryBuilder.getRawOne();
    return parseInt(result.count, 10);
  }

  private async countNewCustomers(startDate: Date, endDate: Date): Promise<number> {
    // Clientes cuya primera orden fue en este período
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(user.id)', 'count')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MIN(order.createdAt)')
          .from('Order', 'order')
          .where('order.customer.id = user.id')
          .getQuery();
        return `${subQuery} BETWEEN :startDate AND :endDate`;
      })
      .setParameters({ startDate, endDate })
      .getRawOne();
      
    return parseInt(result.count, 10);
  }

  private async getSalesByDay(
    restaurantId: string | null, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    const whereCondition: any = {
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.COMPLETED,
      createdAt: Between(startDate, endDate)
    };
    
    if (restaurantId) {
      whereCondition.restaurant = { id: restaurantId };
    }
    
    const orders = await this.orderRepository.find({
      where: whereCondition,
      select: ['createdAt', 'total']
    });
    
    // Agrupar por día
    const salesByDay = {};
    
    orders.forEach(order => {
      const dateString = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!salesByDay[dateString]) {
        salesByDay[dateString] = 0;
      }
      
      salesByDay[dateString] += Number(order.total);
    });
    
    // Convertir a array
    return Object.entries(salesByDay).map(([date, amount]) => ({
      date,
      amount: Number(amount)
    }));
  }

  private async getOrdersByStatus(
    restaurantId: string | null, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('order.status');
    
    if (restaurantId) {
      queryBuilder.andWhere('order.restaurant.id = :restaurantId', { restaurantId });
    }
    
    const result = await queryBuilder.getRawMany();
    
    return result.map(item => ({
      status: item.status,
      count: parseInt(item.count, 10)
    }));
  }

  private async getOrdersDataForExport(
    restaurantId: string | null, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    const whereCondition: any = {
      createdAt: Between(startDate, endDate)
    };
    
    if (restaurantId) {
      whereCondition.restaurant = { id: restaurantId };
    }
    
    return this.orderRepository.find({
      where: whereCondition,
      relations: ['customer', 'deliveryPerson', 'items', 'restaurant'],
      order: { createdAt: 'DESC' }
    });
  }

  private async getSalesDataForExport(
    restaurantId: string | null, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    const whereCondition: any = {
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.COMPLETED,
      createdAt: Between(startDate, endDate)
    };
    
    if (restaurantId) {
      whereCondition.restaurant = { id: restaurantId };
    }
    
    const orders = await this.orderRepository.find({
      where: whereCondition,
      select: ['id', 'orderNumber', 'createdAt', 'total', 'subtotal', 'tax', 'deliveryFee', 'tip', 'paymentMethod'],
      relations: ['customer', 'restaurant'],
      order: { createdAt: 'DESC' }
    });
    
    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      restaurant: order.restaurant ? order.restaurant.name : 'Unknown',
      customer: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest',
      subtotal: order.subtotal,
      tax: order.tax,
      deliveryFee: order.deliveryFee,
      tip: order.tip,
      total: order.total,
      paymentMethod: order.paymentMethod
    }));
  }

  private async getProductsDataForExport(
    restaurantId: string | null, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    // Obtener órdenes en el período
    const ordersWhereCondition: any = {
      status: OrderStatus.DELIVERED,
      createdAt: Between(startDate, endDate)
    };
    
    if (restaurantId) {
      ordersWhereCondition.restaurant = { id: restaurantId };
    }
    
    const orders = await this.orderRepository.find({
      where: ordersWhereCondition,
      relations: ['items', 'restaurant']
    });
    
    // Agrupar por producto (usando el nombre como identificador)
    const productMap: Record<string, {
      name: string,
      restaurant: string,
      price: number,
      orders: number,
      quantity: number,
      revenue: number
    }> = {};
    
    // Calcular estadísticas
    orders.forEach(order => {
      const restaurantName = order.restaurant ? order.restaurant.name : 'Unknown';
      
      order.items.forEach(item => {
        const itemName = item.name;
        
        if (!productMap[itemName]) {
          productMap[itemName] = {
            name: itemName,
            restaurant: restaurantName,
            price: Number(item.price),
            orders: 0,
            quantity: 0,
            revenue: 0
          };
        }
        
        productMap[itemName].orders += 1;
        productMap[itemName].quantity += item.quantity;
        productMap[itemName].revenue += item.quantity * Number(item.price);
      });
    });
    
    return Object.values(productMap);
  }

  private async getCustomersDataForExport(
    restaurantId: string | null, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    // Obtener órdenes agrupadas por cliente
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .select('order.customer.id', 'customerId')
      .addSelect('customer.firstName', 'firstName')
      .addSelect('customer.lastName', 'lastName')
      .addSelect('customer.email', 'email')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total)', 'totalSpent')
      .addSelect('MIN(order.createdAt)', 'firstOrderDate')
      .addSelect('MAX(order.createdAt)', 'lastOrderDate')
      .innerJoin('order.customer', 'customer')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('order.customer.id')
      .addGroupBy('customer.firstName')
      .addGroupBy('customer.lastName')
      .addGroupBy('customer.email')
      .orderBy('orderCount', 'DESC');
    
    if (restaurantId) {
      queryBuilder.andWhere('order.restaurant.id = :restaurantId', { restaurantId });
    }
    
    const customerOrders = await queryBuilder.getRawMany();
    
    return customerOrders.map(customer => ({
      id: customer.customerId,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      orderCount: parseInt(customer.orderCount, 10),
      totalSpent: parseFloat(customer.totalSpent),
      firstOrderDate: customer.firstOrderDate,
      lastOrderDate: customer.lastOrderDate
    }));
  }
}