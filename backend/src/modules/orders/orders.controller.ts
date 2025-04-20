import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { GetUser } from '../../shared/decorators/user.decorator';
import { User } from '../auth/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignDeliveryPersonDto } from './dto/assign-delivery-person.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { Order } from './entities/order.entity';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Pedidos')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente', type: Order })
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User): Promise<Order> {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los pedidos del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos', type: [Order] })
  findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User): Promise<{ data: Order[], total: number }> {
    return this.ordersService.findAll(paginationDto, user);
  }

  @Get('restaurant')
  @Roles(UserRole.RESTAURANT_ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los pedidos del restaurante (para admin de restaurante)' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos del restaurante', type: [Order] })
  findRestaurantOrders(
    @Query() paginationDto: PaginationDto,
    @GetUser() user: User,
  ): Promise<{ data: Order[], total: number }> {
    return this.ordersService.findRestaurantOrders(paginationDto, user);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado', type: Order })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findOne(@Param('id') id: string, @GetUser() user: User): Promise<Order> {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN, UserRole.CUSTOMER)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado del pedido' })
  @ApiResponse({ status: 200, description: 'Estado del pedido actualizado', type: Order })
  @ApiResponse({ status: 400, description: 'Transición de estado no válida' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, user);
  }

  @Patch(':id/assign-delivery')
  @Roles(UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asignar repartidor al pedido' })
  @ApiResponse({ status: 200, description: 'Repartidor asignado', type: Order })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  assignDelivery(
    @Param('id') id: string,
    @Body() assignDeliveryPersonDto: AssignDeliveryPersonDto,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.assignDelivery(id, assignDeliveryPersonDto, user);
  }

  @Patch(':id/delivery-status')
  @Roles(UserRole.DELIVERY_DRIVER, UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de entrega' })
  @ApiResponse({ status: 200, description: 'Estado de entrega actualizado', type: Order })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  updateDeliveryStatus(
    @Param('id') id: string,
    @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.updateDeliveryStatus(id, updateDeliveryStatusDto, user);
  }
}