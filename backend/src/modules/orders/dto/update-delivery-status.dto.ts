import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { DeliveryStatus } from '../enums/delivery-status.enum';

export class UpdateDeliveryStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la entrega',
    enum: DeliveryStatus,
    example: DeliveryStatus.PICKED_UP,
  })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty({
    description: 'Notas o comentarios sobre la actualización del estado de entrega',
    example: 'Ya recogí el pedido y estoy en camino',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}