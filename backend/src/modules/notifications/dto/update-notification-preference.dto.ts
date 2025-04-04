import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  orderCreated?: boolean;

  @IsOptional()
  @IsBoolean()
  orderStatusChanged?: boolean;

  @IsOptional()
  @IsBoolean()
  orderAssigned?: boolean;

  @IsOptional()
  @IsBoolean()
  deliveryStatusChanged?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentReceived?: boolean;

  @IsOptional()
  @IsBoolean()
  systemAlert?: boolean;

  @IsOptional()
  @IsBoolean()
  promotion?: boolean;

  @IsOptional()
  @IsBoolean()
  enablePushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  enableEmailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  enableInAppNotifications?: boolean;

  @IsOptional()
  @IsString()
  pushSubscription?: string;
}