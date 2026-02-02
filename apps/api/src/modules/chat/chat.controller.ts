import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { MessageType } from '@prisma/client';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * Get all conversations for current user
   */
  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.findMyConversations(req.user.userId);
  }

  /**
   * Get a specific conversation
   */
  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Request() req: any) {
    return this.chatService.findConversationById(id, req.user.userId);
  }

  /**
   * Get conversation by job ID
   */
  @Get('conversations/job/:jobId')
  async getConversationByJob(@Param('jobId') jobId: string, @Request() req: any) {
    return this.chatService.findConversationByJobId(jobId, req.user.userId);
  }

  /**
   * Get messages for a conversation
   */
  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Query('limit') limit: string,
    @Query('before') before: string,
    @Request() req: any,
  ) {
    return this.chatService.getMessages(
      conversationId,
      req.user.userId,
      limit ? parseInt(limit, 10) : 50,
      before,
    );
  }

  /**
   * Send a message (REST fallback)
   */
  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() body: {
      content: string;
      type?: MessageType;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    },
    @Request() req: any,
  ) {
    return this.chatService.createMessage({
      conversationId,
      senderId: req.user.userId,
      ...body,
    });
  }

  /**
   * Mark messages as read
   */
  @Post('conversations/:id/read')
  async markAsRead(@Param('id') conversationId: string, @Request() req: any) {
    return this.chatService.markAsRead(conversationId, req.user.userId);
  }

  /**
   * Get unread count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.chatService.getUnreadCount(req.user.userId);
    return { count };
  }
}
