import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageType } from '@prisma/client';

interface CreateConversationDto {
  jobId: string;
  clientId: string;
  professionalId?: string;
}

interface CreateMessageDto {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a conversation for a job
   */
  async createConversation(dto: CreateConversationDto) {
    // Check if conversation already exists
    const existing = await this.prisma.conversation.findUnique({
      where: { job_id: dto.jobId },
    });

    if (existing) {
      return existing;
    }

    // Verify job exists and belongs to client
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.client_id !== dto.clientId) {
      throw new ForbiddenException('Not authorized to create conversation for this job');
    }

    return this.prisma.conversation.create({
      data: {
        job_id: dto.jobId,
        client_id: dto.clientId,
        professional_id: dto.professionalId,
      },
      include: {
        client: {
          select: { id: true, name: true, avatar_url: true },
        },
        professional: {
          select: { id: true, name: true, avatar_url: true },
        },
        job: {
          select: { id: true, code: true, status: true },
        },
      },
    });
  }

  /**
   * Find conversation by ID with access validation
   */
  async findConversationById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        client: {
          select: { id: true, name: true, avatar_url: true },
        },
        professional: {
          select: { id: true, name: true, avatar_url: true },
        },
        job: {
          select: { id: true, code: true, status: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user has access to this conversation
    if (
      conversation.client_id !== userId &&
      conversation.professional_id !== userId
    ) {
      throw new ForbiddenException('Not authorized to access this conversation');
    }

    return conversation;
  }

  /**
   * Find conversation by job ID
   */
  async findConversationByJobId(jobId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { job_id: jobId },
      include: {
        client: {
          select: { id: true, name: true, avatar_url: true },
        },
        professional: {
          select: { id: true, name: true, avatar_url: true },
        },
        job: {
          select: { id: true, code: true, status: true },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    // Check if user has access to this conversation
    if (
      conversation.client_id !== userId &&
      conversation.professional_id !== userId
    ) {
      throw new ForbiddenException('Not authorized to access this conversation');
    }

    return conversation;
  }

  /**
   * List user's conversations
   */
  async findMyConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [
          { client_id: userId },
          { professional_id: userId },
        ],
      },
      include: {
        client: {
          select: { id: true, name: true, avatar_url: true },
        },
        professional: {
          select: { id: true, name: true, avatar_url: true },
        },
        job: {
          select: { id: true, code: true, status: true },
        },
      },
      orderBy: {
        last_message_at: 'desc',
      },
    });
  }

  /**
   * Create a message
   */
  async createMessage(dto: CreateMessageDto) {
    // Verify conversation exists and user has access
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.client_id !== dto.senderId &&
      conversation.professional_id !== dto.senderId
    ) {
      throw new ForbiddenException('Not authorized to send messages in this conversation');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversation_id: dto.conversationId,
        sender_id: dto.senderId,
        content: dto.content,
        type: dto.type || MessageType.TEXT,
        file_url: dto.fileUrl,
        file_name: dto.fileName,
        file_size: dto.fileSize,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
    });

    // Update conversation's last message
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: {
        last_message_at: new Date(),
        last_message_preview: dto.content.substring(0, 100),
      },
    });

    return message;
  }

  /**
   * Get messages for a conversation (paginated)
   */
  async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    before?: string,
  ) {
    // Verify access
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.client_id !== userId &&
      conversation.professional_id !== userId
    ) {
      throw new ForbiddenException('Not authorized to access this conversation');
    }

    // Build query
    const whereClause: any = {
      conversation_id: conversationId,
    };

    if (before) {
      const beforeMessage = await this.prisma.message.findUnique({
        where: { id: before },
      });
      if (beforeMessage) {
        whereClause.created_at = {
          lt: beforeMessage.created_at,
        };
      }
    }

    return this.prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string) {
    // Verify access
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.client_id !== userId &&
      conversation.professional_id !== userId
    ) {
      throw new ForbiddenException('Not authorized to access this conversation');
    }

    // Mark all unread messages from other users as read
    await this.prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string) {
    // Get all conversations for user
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { client_id: userId },
          { professional_id: userId },
        ],
      },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages in those conversations
    const count = await this.prisma.message.count({
      where: {
        conversation_id: { in: conversationIds },
        sender_id: { not: userId },
        read_at: null,
      },
    });

    return count;
  }

  /**
   * Assign professional to conversation
   */
  async assignProfessionalToConversation(jobId: string, professionalId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { job_id: jobId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found for this job');
    }

    return this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { professional_id: professionalId },
      include: {
        client: {
          select: { id: true, name: true, avatar_url: true },
        },
        professional: {
          select: { id: true, name: true, avatar_url: true },
        },
        job: {
          select: { id: true, code: true, status: true },
        },
      },
    });
  }
}
