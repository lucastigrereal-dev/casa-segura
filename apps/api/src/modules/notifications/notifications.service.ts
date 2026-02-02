import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { ChatGateway } from '../chat/chat.gateway';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string;
  quoteId?: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  /**
   * Create a notification and emit via WebSocket
   */
  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        user_id: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        job_id: dto.jobId,
        quote_id: dto.quoteId,
        data: dto.data,
      },
    });

    // Emit via WebSocket if user is connected
    await this.chatGateway.emitToUser(dto.userId, 'new_notification', notification);

    return notification;
  }

  /**
   * Find notifications for a user (paginated)
   */
  async findByUser(
    userId: string,
    limit = 20,
    offset = 0,
    unreadOnly = false,
  ) {
    const where: any = { user_id: userId };

    if (unreadOnly) {
      where.read_at = null;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      limit,
      offset,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this notification');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read_at: new Date() },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Mark notification as clicked
   */
  async markAsClicked(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this notification');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        clicked_at: new Date(),
        read_at: notification.read_at || new Date(), // Mark as read if not already
      },
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        user_id: userId,
        read_at: null,
      },
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this notification');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  // ============================================
  // NOTIFICATION TRIGGERS (Event Handlers)
  // ============================================

  /**
   * Notify professionals when a new job is created
   */
  async notifyNewJob(jobId: string, professionalIds: string[]) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        mission: true,
        address: true,
      },
    });

    if (!job) return;

    // Create notification for each professional
    const notifications = professionalIds.map((professionalId) =>
      this.create({
        userId: professionalId,
        type: NotificationType.NEW_JOB,
        title: 'Novo Chamado Disponível',
        message: `Novo chamado para ${job.mission.name} em ${job.address.city}`,
        jobId: job.id,
        data: {
          jobCode: job.code,
          missionName: job.mission.name,
          city: job.address.city,
        },
      }),
    );

    await Promise.all(notifications);
  }

  /**
   * Notify client when a new quote is received
   */
  async notifyNewQuote(quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        job: true,
        professional: true,
      },
    });

    if (!quote) return;

    await this.create({
      userId: quote.job.client_id,
      type: NotificationType.NEW_QUOTE,
      title: 'Nova Proposta Recebida',
      message: `${quote.professional.name} enviou uma proposta de R$ ${(quote.amount / 100).toFixed(2)}`,
      jobId: quote.job_id,
      quoteId: quote.id,
      data: {
        professionalName: quote.professional.name,
        amount: quote.amount,
        jobCode: quote.job.code,
      },
    });
  }

  /**
   * Notify professional when quote is accepted
   */
  async notifyQuoteAccepted(quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        job: true,
        professional: true,
      },
    });

    if (!quote) return;

    await this.create({
      userId: quote.professional_id,
      type: NotificationType.QUOTE_ACCEPTED,
      title: 'Proposta Aceita',
      message: `Sua proposta para o chamado #${quote.job.code} foi aceita!`,
      jobId: quote.job_id,
      quoteId: quote.id,
      data: {
        jobCode: quote.job.code,
        amount: quote.amount,
      },
    });
  }

  /**
   * Notify professional when quote is rejected
   */
  async notifyQuoteRejected(quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        job: true,
      },
    });

    if (!quote) return;

    await this.create({
      userId: quote.professional_id,
      type: NotificationType.QUOTE_REJECTED,
      title: 'Proposta Não Aceita',
      message: `Sua proposta para o chamado #${quote.job.code} não foi aceita`,
      jobId: quote.job_id,
      quoteId: quote.id,
      data: {
        jobCode: quote.job.code,
      },
    });
  }

  /**
   * Notify client when job is started
   */
  async notifyJobStarted(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        pro: true,
      },
    });

    if (!job || !job.pro) return;

    await this.create({
      userId: job.client_id,
      type: NotificationType.JOB_STARTED,
      title: 'Serviço Iniciado',
      message: `${job.pro.name} iniciou o atendimento do chamado #${job.code}`,
      jobId: job.id,
      data: {
        jobCode: job.code,
        professionalName: job.pro.name,
      },
    });
  }

  /**
   * Notify client when job is completed
   */
  async notifyJobCompleted(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        pro: true,
      },
    });

    if (!job || !job.pro) return;

    await this.create({
      userId: job.client_id,
      type: NotificationType.JOB_COMPLETED,
      title: 'Serviço Concluído',
      message: `${job.pro.name} concluiu o atendimento. Por favor, avalie o serviço.`,
      jobId: job.id,
      data: {
        jobCode: job.code,
        professionalName: job.pro.name,
      },
    });
  }

  /**
   * Notify professional when payment is received
   */
  async notifyPaymentReceived(jobId: string, amount: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || !job.pro_id) return;

    await this.create({
      userId: job.pro_id,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Pagamento Recebido',
      message: `Você recebeu R$ ${(amount / 100).toFixed(2)} pelo chamado #${job.code}`,
      jobId: job.id,
      data: {
        jobCode: job.code,
        amount,
      },
    });
  }

  /**
   * Notify when a new message is received (handled by ChatGateway)
   */
  async notifyNewMessage(userId: string, senderName: string, message: string, conversationId: string) {
    await this.create({
      userId,
      type: NotificationType.NEW_MESSAGE,
      title: 'Nova Mensagem',
      message: `${senderName}: ${message.substring(0, 50)}`,
      data: {
        conversationId,
        senderName,
      },
    });
  }

  /**
   * Notify when a new review is received
   */
  async notifyNewReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        reviewer: true,
        job: true,
      },
    });

    if (!review) return;

    await this.create({
      userId: review.reviewed_id,
      type: NotificationType.NEW_REVIEW,
      title: 'Nova Avaliação',
      message: `${review.reviewer.name} avaliou seu atendimento com ${review.rating_overall} estrelas`,
      jobId: review.job_id,
      data: {
        reviewerName: review.reviewer.name,
        rating: review.rating_overall,
        jobCode: review.job.code,
      },
    });
  }
}
