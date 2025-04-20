import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../orders/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'Estado del pedido',
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus, {
    message: 'El estado debe ser uno de los valores válidos de OrderStatus',
  })
  @IsNotEmpty({ message: 'El estado no puede estar vacío' })
  status: OrderStatus;
}

export class AssignDeliveryPersonDto {
  @ApiProperty({
    description: 'ID del repartidor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'El ID del repartidor no puede estar vacío' })
  deliveryPersonId: string;
}