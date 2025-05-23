import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignDeliveryPersonDto {
  @ApiProperty({
    description: 'ID del repartidor a asignar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  deliveryPersonId: string;
}