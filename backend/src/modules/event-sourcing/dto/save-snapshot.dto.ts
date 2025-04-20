import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class SaveSnapshotDto {
  @IsString()
  @IsNotEmpty()
  aggregate_type: string;

  @IsString()
  @IsNotEmpty()
  aggregate_id: string;

  @IsObject()
  @IsNotEmpty()
  state: Record<string, any>;

  @IsNumber()
  @IsNotEmpty()
  version: number;
}