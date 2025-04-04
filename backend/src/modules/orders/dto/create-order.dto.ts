import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsObject,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

class OrderItemDto {
  @ApiProperty({
    description: 'Nombre del ítem',
    example: 'Hamburguesa Clásica',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descripción del ítem',
    example: 'Carne de res, queso, lechuga, tomate y mayonesa',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Precio unitario del ítem',
    example: 5990,
  })
  @IsNumber()
  @Min(0)
  price: number;

  // Para mantener compatibilidad con API existente
  @ApiProperty({
    description: 'Precio unitario del ítem (obsoleto, usar price)',
    example: 5990,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @ApiProperty({
    description: 'Cantidad del ítem',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Opciones adicionales del ítem (tamaño, ingredientes extras, etc)',
    example: { size: 'grande', extras: ['queso', 'tocino'] },
    required: false,
  })
  @IsObject()
  @IsOptional()
  options?: Record<string, any>;

  @ApiProperty({
    description: 'Información adicional del ítem',
    example: { instructions: 'Sin cebolla, por favor' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;
}

class DeliveryAddressDto {
  @ApiProperty({
    description: 'Dirección de entrega',
    example: 'Av. Providencia 1234, Santiago',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Coordenadas de entrega',
    example: { lat: -33.432, lng: -70.634 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  coordinates?: { lat: number; lng: number };
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID del restaurante',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Ítems del pedido',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Método de pago',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Propina',
    example: 1000,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tip?: number;

  @ApiProperty({
    description: 'Notas del cliente',
    example: 'Por favor llamar al llegar',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerNotes?: string;

  @ApiProperty({
    description: 'Dirección de entrega',
    type: DeliveryAddressDto,
  })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;
}