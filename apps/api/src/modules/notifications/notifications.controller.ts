import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Get all notifications for current user
   */
  @Get()
  async getNotifications(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Query('unreadOnly') unreadOnly: string,
    @Request() req,
  ) {
    return this.notificationsService.findByUser(
      req.user.userId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
      unreadOnly === 'true',
    );
  }

  /**
   * Get unread count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId);
    return { count };
  }

  /**
   * Mark notification as read
   */
  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  /**
   * Mark all notifications as read
   */
  @Post('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  /**
   * Mark notification as clicked
   */
  @Post(':id/click')
  async markAsClicked(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsClicked(id, req.user.userId);
  }

  /**
   * Delete a notification
   */
  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    return this.notificationsService.deleteNotification(id, req.user.userId);
  }
}
