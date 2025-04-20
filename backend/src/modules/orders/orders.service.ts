import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderRepository } from './repositories/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignDeliveryPersonDto } from './dto/assign-delivery-person.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../auth/enums/user-role.enum';
import { UserRepository } from '../auth/repositories/user.repository';
import { RestaurantRepository } from '../restaurants/repositories/restaurant.repository';
import { OrderStatus } from './enums/order-status.enum';
import { DeliveryStatus } from './enums/delivery-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const { restaurantId, items, deliveryAddress, ...orderData } = createOrderDto;

    // Verificar que el restaurante existe
    const restaurant = await this.restaurantRepository.findOneBy({ id: restaurantId });
    if (!restaurant) {
      throw new NotFoundException(`Restaurante con ID "${restaurantId}" no encontrado`);
    }

    // Crear el pedido
    const order = this.orderRepository.create({
      ...orderData,
      customer: user,
      restaurant,
      delivery_address: deliveryAddress.address,
      delivery_coordinates: deliveryAddress.coordinates,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    // Generar número de pedido único
    order.orderNumber = await this.orderRepository.generateOrderNumber();

    // Crear los items del pedido
    order.items = items.map(item => {
      const orderItem = new OrderItem();
      orderItem.name = item.name;
      orderItem.description = item.description;
      // Usar price o unitPrice si price no está disponible (compatibilidad)
      orderItem.price = item.price || item.unitPrice || 0;
      orderItem.quantity = item.quantity;
      orderItem.subtotal = orderItem.price * item.quantity;
      orderItem.options = item.options;
      orderItem.additionalInfo = item.additionalInfo;
      return orderItem;
    });

    // Calcular totales
    order.calculateTotal();

    // Guardar el pedido
    const savedOrder = await this.orderRepository.save(order);

    // Emitir evento de nuevo pedido
    this.eventEmitter.emit('order.created', savedOrder);

    return savedOrder;
  }

  async findAll(paginationDto: PaginationDto, user: User): Promise<{ data: Order[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
    
    let queryOptions: any = {
      relations: ['customer', 'restaurant', 'deliveryPerson', 'items'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    };

    // Filtrar por rol de usuario
    if (user.role === UserRole.CUSTOMER) {
      // Cliente solo ve sus propios pedidos
      queryOptions.where = { customer: { id: user.id } };
    } else if (user.role === UserRole.RESTAURANT_ADMIN) {
      // Admin de restaurante solo ve pedidos de su restaurante
      const restaurant = await this.restaurantRepository.findOne({
        where: { admin: { id: user.id } },
      });
      
      if (!restaurant) {
        throw new NotFoundException('No se encontró restaurante asociado al usuario');
      }
      
      queryOptions.where = { restaurant: { id: restaurant.id } };
    } else if (user.role === UserRole.DELIVERY_DRIVER) {
      // Repartidor solo ve pedidos asignados a él
      queryOptions.where = { deliveryPerson: { id: user.id } };
    }
    // Superadmin ve todos los pedidos (sin filtro adicional)
    
    // Ejecutar la consulta con los filtros correspondientes
    const [data, total] = await this.orderRepository.findAndCount(queryOptions);
    
    return { data, total };
  }

  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'restaurant', 'restaurant.admin', 'deliveryPerson', 'items'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID "${id}" no encontrado`);
    }
    
    // Verificar permisos de acceso
    this.checkOrderAccess(order, user);

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, user: User): Promise<Order> {
    const order = await this.findOne(id, user);
    
    // Si el estado es cancelado o rechazado, se requiere una razón
    if (
      (updateOrderStatusDto.status === OrderStatus.CANCELLED || 
      updateOrderStatusDto.status === OrderStatus.REJECTED) && 
      !updateOrderStatusDto.notes
    ) {
      throw new BadRequestException('Se requiere una razón para cancelar o rechazar el pedido');
    }
    
    // Guardar la razón de cancelación o rechazo si aplica
    if (updateOrderStatusDto.status === OrderStatus.CANCELLED || updateOrderStatusDto.status === OrderStatus.REJECTED) {
      order.cancellationReason = updateOrderStatusDto.notes;
      order.cancelledAt = new Date();
    }
    
    // Verificar si el estado es válido para la transición
    this.validateStatusTransition(order.status, updateOrderStatusDto.status);

    // Actualizar estado
    order.status = updateOrderStatusDto.status;
    
    // Actualizar timestamps según el estado
    if (updateOrderStatusDto.status === OrderStatus.CONFIRMED && !order.acceptedAt) {
      order.acceptedAt = new Date();
    } else if (updateOrderStatusDto.status === OrderStatus.READY && !order.preparedAt) {
      order.preparedAt = new Date();
    } else if (updateOrderStatusDto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    // Guardar cambios
    const updatedOrder = await this.orderRepository.save(order);
    
    // Emitir evento de actualización de estado
    this.eventEmitter.emit('order.status.updated', updatedOrder);
    
    return updatedOrder;
  }

  async assignDelivery(id: string, assignDeliveryPersonDto: AssignDeliveryPersonDto, user: User): Promise<Order> {
    const { deliveryPersonId } = assignDeliveryPersonDto;
    
    const order = await this.findOne(id, user);
    
    // Verificar que el repartidor existe
    const deliveryPerson = await this.userRepository.findOneBy({ id: deliveryPersonId });
    if (!deliveryPerson) {
      throw new NotFoundException(`Repartidor con ID "${deliveryPersonId}" no encontrado`);
    }
    
    // Verificar que el usuario es un repartidor
    if (deliveryPerson.role !== UserRole.DELIVERY_DRIVER) {
      throw new BadRequestException('El usuario asignado debe ser un repartidor');
    }
    
    // Asignar repartidor
    order.deliveryPerson = deliveryPerson;
    order.deliveryStatus = DeliveryStatus.ASSIGNED;
    
    // Si el pedido estaba en estado READY, actualizarlo a IN_DELIVERY
    if (order.status === OrderStatus.READY) {
      order.status = OrderStatus.IN_DELIVERY;
    }
    
    // Guardar cambios
    const updatedOrder = await this.orderRepository.save(order);
    
    // Emitir evento de asignación de repartidor
    this.eventEmitter.emit('order.delivery.assigned', updatedOrder);
    
    return updatedOrder;
  }

  async findRestaurantOrders(paginationDto: PaginationDto, user: User): Promise<{ data: Order[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
    
    // Encontrar el restaurante del admin
    const restaurant = await this.restaurantRepository.findOne({
      where: { admin: { id: user.id } },
    });
    
    if (!restaurant) {
      throw new NotFoundException('No se encontró restaurante asociado al usuario');
    }
    
    // Buscar pedidos del restaurante
    const [data, total] = await this.orderRepository.findAndCount({
      where: { restaurant: { id: restaurant.id } },
      relations: ['customer', 'deliveryPerson', 'items'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });
    
    return { data, total };
  }

  async updateDeliveryStatus(id: string, updateDeliveryStatusDto: UpdateDeliveryStatusDto, user: User): Promise<Order> {
    const order = await this.findOne(id, user);
    
    // Verificar que el repartidor está asignado al pedido
    if (user.role === UserRole.DELIVERY_DRIVER && order.deliveryPerson?.id !== user.id) {
      throw new ForbiddenException('No estás asignado a este pedido');
    }
    
    // Actualizar estado de entrega
    order.deliveryStatus = updateDeliveryStatusDto.status;
    
    // Actualizar timestamps según el estado
    if (updateDeliveryStatusDto.status === DeliveryStatus.PICKED_UP) {
      order.pickedUpAt = new Date();
    } else if (updateDeliveryStatusDto.status === DeliveryStatus.COMPLETED) {
      order.status = OrderStatus.DELIVERED;
      order.deliveredAt = new Date();
    }
    
    // Guardar cambios
    const updatedOrder = await this.orderRepository.save(order);
    
    // Emitir evento de actualización de estado de entrega
    this.eventEmitter.emit('order.delivery.updated', updatedOrder);
    
    return updatedOrder;
  }

  // Método privado para verificar acceso al pedido
  private checkOrderAccess(order: Order, user: User): void {
    // Superadmin puede acceder a todos los pedidos
    if (user.role === UserRole.SUPER_ADMIN) return;
    
    // Cliente solo puede acceder a sus propios pedidos
    if (user.role === UserRole.CUSTOMER && order.customer?.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para acceder a este pedido');
    }
    
    // Admin de restaurante solo puede acceder a pedidos de su restaurante
    if (user.role === UserRole.RESTAURANT_ADMIN && order.restaurant.admin.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para acceder a este pedido');
    }
    
    // Repartidor solo puede acceder a pedidos asignados a él
    if (user.role === UserRole.DELIVERY_DRIVER && order.deliveryPerson?.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para acceder a este pedido');
    }
  }

  // Método privado para validar transiciones de estado
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    // Definir transiciones válidas
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.IN_DELIVERY, OrderStatus.CANCELLED],
      [OrderStatus.IN_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REJECTED]: [],
    };
    
    // Verificar si la transición es válida
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`No se puede cambiar el estado de "${currentStatus}" a "${newStatus}"`);
    }
  }
}