import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class SaveEventDto {
  @IsString()
  @IsNotEmpty()
  aggregate_type: string;

  @IsString()
  @IsNotEmpty()
  aggregate_id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsNotEmpty()
  payload: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsNumber()
  @IsNotEmpty()
  version: number;

  @IsString()
  @IsOptional()
  created_by?: string;
}