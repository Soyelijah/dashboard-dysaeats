import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    super(orderRepository.target, orderRepository.manager, orderRepository.queryRunner);
  }

  async generateOrderNumber(): Promise<string> {
    // Obtener el último pedido
    const lastOrder = await this.findOne({
      order: { createdAt: 'DESC' },
    });

    // Generar un nuevo número de pedido basado en el último pedido o empezar desde 1
    const lastNumber = lastOrder 
      ? parseInt(lastOrder.orderNumber.replace('ORD', ''), 10) 
      : 0;
    
    // Formatear con ceros a la izquierda (e.g., ORD000001)
    return `ORD${(lastNumber + 1).toString().padStart(6, '0')}`;
  }
}