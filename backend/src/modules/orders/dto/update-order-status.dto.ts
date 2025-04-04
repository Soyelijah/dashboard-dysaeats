import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del pedido',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Notas o razón del cambio de estado (obligatorio para cancelaciones y rechazos)',
    example: 'Restaurante cerrado por mantenimiento',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}