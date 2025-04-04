import { IsString, IsUUID, IsEnum, IsOptional, IsObject, IsArray, ValidateIf } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  userIds?: string[];

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ValidateIf(o => !o.userId && !o.userIds)
  @IsString()
  roleFilter?: string;
}