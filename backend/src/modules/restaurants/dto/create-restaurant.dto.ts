import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsBoolean, IsArray, IsUrl } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'Nombre del restaurante',
    example: 'Restaurante El Chileno',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descripción del restaurante',
    example: 'El mejor restaurante de comida chilena',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Dirección del restaurante',
    example: 'Av. Providencia 1234, Santiago, Chile',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Teléfono del restaurante',
    example: '+56 2 2123 4567',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Correo electrónico del restaurante',
    example: 'info@restauranteelchileno.cl',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Sitio web del restaurante',
    example: 'https://www.restauranteelchileno.cl',
    required: false,
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'URL del logo del restaurante',
    example: 'https://www.restauranteelchileno.cl/logo.png',
    required: false,
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    description: 'Estado activo/inactivo del restaurante',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Horarios de apertura del restaurante',
    example: ['Lun-Vie: 12:00-22:00', 'Sáb-Dom: 12:00-23:00'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  openingHours?: string[];

  @ApiProperty({
    description: 'ID del administrador del restaurante',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  adminId: string;
}