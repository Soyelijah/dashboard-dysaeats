import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { GetUser } from '../../shared/decorators/user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query() query: NotificationQueryDto): Promise<Notification[]> {
    return this.notificationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification | Notification[]> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  markAllAsRead(@GetUser('id') userId: string): Promise<void> {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.notificationsService.remove(id);
  }

  @Get('user/me')
  findMyNotifications(@GetUser('id') userId: string): Promise<Notification[]> {
    return this.notificationsService.findByUser(userId);
  }

  @Get('user/:userId')
  @Roles(UserRole.SUPER_ADMIN)
  findByUser(@Param('userId') userId: string): Promise<Notification[]> {
    return this.notificationsService.findByUser(userId);
  }

  @Get('user/:userId/unread-count')
  @Roles(UserRole.SUPER_ADMIN)
  getUnreadCount(@Param('userId') userId: string): Promise<number> {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('user/me/unread-count')
  getMyUnreadCount(@GetUser('id') userId: string): Promise<number> {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('user/me/preferences')
  getMyPreferences(@GetUser('id') userId: string): Promise<NotificationPreference> {
    return this.notificationsService.getUserPreferences(userId);
  }

  @Get('user/:userId/preferences')
  @Roles(UserRole.SUPER_ADMIN)
  getUserPreferences(@Param('userId') userId: string): Promise<NotificationPreference> {
    return this.notificationsService.getUserPreferences(userId);
  }

  @Put('user/me/preferences')
  updateMyPreferences(
    @GetUser('id') userId: string,
    @Body() preferencesDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    return this.notificationsService.updateUserPreferences(userId, preferencesDto);
  }

  @Put('user/:userId/preferences')
  @Roles(UserRole.SUPER_ADMIN)
  updateUserPreferences(
    @Param('userId') userId: string,
    @Body() preferencesDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    return this.notificationsService.updateUserPreferences(userId, preferencesDto);
  }

  @Post('send')
  @Roles(UserRole.SUPER_ADMIN)
  sendNotification(@Body() notificationData: CreateNotificationDto): Promise<Notification | Notification[]> {
    return this.notificationsService.sendNotification(notificationData);
  }
}