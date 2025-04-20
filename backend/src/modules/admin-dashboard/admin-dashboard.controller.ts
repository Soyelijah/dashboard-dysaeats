import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Order } from '../orders/entities/order.entity';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminDashboardController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  async getDashboardStats() {
    try {
      console.log('AdminDashboardController: getDashboardStats llamado');
      const usersCount = await this.userRepository.count();
      const restaurantsCount = await this.restaurantRepository.count();
      const ordersCount = await this.orderRepository.count();
      
      // Calcular ingresos totales
      const totalRevenue = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalAmount)', 'total')
        .getRawOne()
        .then(result => result.total || 0);

      const result = {
        usersCount,
        restaurantsCount,
        ordersCount,
        totalRevenue,
      };
      
      console.log('AdminDashboardController: Retornando estadísticas:', result);
      return result;
    } catch (error) {
      console.error('AdminDashboardController: Error en getDashboardStats:', error);
      throw error;
    }
  }
  
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Verificar estado del dashboard administrativo' })
  @UseGuards() // Anula cualquier guard a nivel de controlador
  async checkHealth() {
    return {
      status: 'ok',
      service: 'admin-dashboard',
      timestamp: new Date().toISOString(),
    };
  }
}