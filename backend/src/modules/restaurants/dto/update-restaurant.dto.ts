import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { IsOptional } from 'class-validator';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @IsOptional()
  adminId?: string;
}