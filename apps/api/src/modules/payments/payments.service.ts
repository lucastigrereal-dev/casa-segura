import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { PaymentStatus, JobStatus, Role, WithdrawalStatus, TransactionType } from '@casa-segura/database';
import { PAYMENT_CONFIG } from '@casa-segura/shared';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: PaymentGatewayService,
  ) {}

  async createPayment(data: CreatePaymentDto, userId: string) {
    // Validate job exists and user is the client
    const job = await this.prisma.job.findUnique({
      where: { id: data.job_id },
      include: {
        client: true,
        mission: true,
        payment: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job não encontrado');
    }

    if (job.client_id !== userId) {
      throw new ForbiddenException('Você não pode pagar por este job');
    }

    if (job.payment) {
      throw new BadRequestException('Job já possui um pagamento');
    }

    if (!job.price_final) {
      throw new BadRequestException('Job não possui valor final definido');
    }

    // Validate job status
    if (job.status !== JobStatus.QUOTE_ACCEPTED) {
      throw new BadRequestException('Job deve estar com orçamento aceito para pagamento');
    }

    // Create payment with gateway
    const gatewayResponse = await this.gateway.createPayment({
      amount: job.price_final,
      method: data.method,
      description: `${job.mission.name} - ${job.code}`,
      payer_email: job.client.email,
      installments: data.installments,
      job_code: job.code,
    });

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        job_id: data.job_id,
        amount: job.price_final,
        method: data.method,
        status: gatewayResponse.status === 'approved' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        gateway_payment_id: gatewayResponse.payment_id,
        gateway_provider: (this.gateway as any).useMock ? 'MOCK' : 'MERCADOPAGO',
        gateway_response: gatewayResponse as any,
        qr_code: gatewayResponse.qr_code,
        qr_code_base64: gatewayResponse.qr_code_base64,
        expires_at: gatewayResponse.expires_at,
        installments: data.installments || 1,
        installment_amount: data.installments ? Math.floor(job.price_final / data.installments) : null,
        paid_at: gatewayResponse.status === 'approved' ? new Date() : null,
      },
      include: {
        job: {
          include: {
            mission: true,
            client: true,
            pro: true,
          },
        },
      },
    });

    // If payment approved immediately, process split
    if (gatewayResponse.status === 'approved') {
      await this.processPaidPayment(payment.id);
    }

    // Update job status
    await this.prisma.job.update({
      where: { id: data.job_id },
      data: {
        status: gatewayResponse.status === 'approved' ? JobStatus.PAID : JobStatus.PENDING_PAYMENT,
      },
    });

    this.logger.log(`Payment created: ${payment.id} for job ${job.code} - Status: ${payment.status}`);

    return payment;
  }

  async findById(id: string, userId: string, userRole: Role) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            client: true,
            pro: true,
            mission: true,
          },
        },
        splits: true,
        refunds: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Check permissions
    if (userRole !== Role.ADMIN) {
      if (payment.job.client_id !== userId && payment.job.pro_id !== userId) {
        throw new ForbiddenException('Acesso negado');
      }
    }

    return payment;
  }

  async handleWebhook(gatewayPaymentId: string, newStatus: string) {
    this.logger.log(`Webhook received for payment ${gatewayPaymentId}: ${newStatus}`);

    const payment = await this.prisma.payment.findUnique({
      where: { gateway_payment_id: gatewayPaymentId },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for gateway ID: ${gatewayPaymentId}`);
      return;
    }

    // Map gateway status to our status
    const mappedStatus = this.mapGatewayStatus(newStatus);

    if (payment.status === mappedStatus) {
      this.logger.log('Status unchanged, skipping update');
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: mappedStatus,
        paid_at: mappedStatus === PaymentStatus.COMPLETED ? new Date() : payment.paid_at,
      },
    });

    // Process payment if completed
    if (mappedStatus === PaymentStatus.COMPLETED) {
      await this.processPaidPayment(payment.id);

      // Update job status
      await this.prisma.job.update({
        where: { id: payment.job_id },
        data: { status: JobStatus.PAID },
      });
    }
  }

  private async processPaidPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        job: {
          include: { pro: true },
        },
      },
    });

    if (!payment) return;

    // Calculate splits
    const platformAmount = Math.floor(payment.amount * PAYMENT_CONFIG.platformFeePercentage);
    const professionalAmount = payment.amount - platformAmount;

    // Create payment splits
    await this.prisma.paymentSplit.createMany({
      data: [
        {
          payment_id: payment.id,
          recipient_type: 'PROFESSIONAL',
          recipient_id: payment.job.pro_id,
          amount: professionalAmount,
          percentage: PAYMENT_CONFIG.professionalPercentage,
          status: 'HELD', // Held in escrow initially
          held_until: new Date(Date.now() + PAYMENT_CONFIG.escrowHoldHours * 60 * 60 * 1000),
        },
        {
          payment_id: payment.id,
          recipient_type: 'PLATFORM',
          recipient_id: null,
          amount: platformAmount,
          percentage: PAYMENT_CONFIG.platformFeePercentage,
          status: 'RELEASED', // Platform fee released immediately
          released_at: new Date(),
        },
      ],
    });

    this.logger.log(
      `Payment ${payment.id} split created: Professional R$${professionalAmount / 100} (HELD), Platform R$${platformAmount / 100} (RELEASED)`
    );
  }

  async releaseEscrow(jobId: string) {
    // Called when job is completed and approved by client
    const payment = await this.prisma.payment.findUnique({
      where: { job_id: jobId },
      include: { splits: true, job: true },
    });

    if (!payment) {
      this.logger.warn(`No payment found for job ${jobId}`);
      return;
    }

    const professionalSplit = payment.splits.find((s) => s.recipient_type === 'PROFESSIONAL');

    if (!professionalSplit || professionalSplit.status === 'RELEASED') {
      this.logger.log(`Escrow already released or no professional split for job ${jobId}`);
      return;
    }

    // Release the escrow
    await this.prisma.paymentSplit.update({
      where: { id: professionalSplit.id },
      data: {
        status: 'RELEASED',
        released_at: new Date(),
      },
    });

    // Create or update balance
    await this.prisma.balance.upsert({
      where: { user_id: professionalSplit.recipient_id! },
      create: {
        user_id: professionalSplit.recipient_id!,
        available: professionalSplit.amount,
        held: 0,
        total_earned: professionalSplit.amount,
        total_withdrawn: 0,
      },
      update: {
        available: { increment: professionalSplit.amount },
        held: { decrement: professionalSplit.amount },
        total_earned: { increment: professionalSplit.amount },
      },
    });

    // Create transaction record
    const balance = await this.prisma.balance.findUnique({
      where: { user_id: professionalSplit.recipient_id! },
    });

    await this.prisma.transaction.create({
      data: {
        user_id: professionalSplit.recipient_id!,
        type: TransactionType.SPLIT_PROFESSIONAL,
        amount: professionalSplit.amount,
        balance_before: (balance?.available || 0) - professionalSplit.amount,
        balance_after: balance?.available || 0,
        payment_id: payment.id,
        job_id: jobId,
        description: `Pagamento recebido - Job ${payment.job.code}`,
      },
    });

    this.logger.log(`Escrow released for job ${jobId}: R$${professionalSplit.amount / 100} to professional`);
  }

  private mapGatewayStatus(gatewayStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      pending: PaymentStatus.PENDING,
      in_process: PaymentStatus.PROCESSING,
      approved: PaymentStatus.COMPLETED,
      rejected: PaymentStatus.FAILED,
      cancelled: PaymentStatus.CANCELLED,
      refunded: PaymentStatus.REFUNDED,
    };

    return statusMap[gatewayStatus] || PaymentStatus.PENDING;
  }

  async createRefund(data: CreateRefundDto, userId: string, userRole: Role) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: data.payment_id },
      include: {
        job: true,
        refunds: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Check permissions
    if (userRole !== Role.ADMIN && payment.job.client_id !== userId) {
      throw new ForbiddenException('Apenas o cliente ou admin pode solicitar reembolso');
    }

    // Check if payment is refundable
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Apenas pagamentos concluídos podem ser reembolsados');
    }

    // Check total refunded amount
    const totalRefunded = payment.refunds
      .filter((r) => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded + data.amount > payment.amount) {
      throw new BadRequestException('Valor do reembolso excede o valor disponível');
    }

    // Create refund request
    const refund = await this.prisma.refund.create({
      data: {
        payment_id: data.payment_id,
        amount: data.amount,
        reason: data.reason,
        requested_by_id: userId,
        status: userRole === Role.ADMIN ? 'APPROVED' : 'PENDING',
        approved_by_id: userRole === Role.ADMIN ? userId : undefined,
        approved_at: userRole === Role.ADMIN ? new Date() : undefined,
      },
    });

    // If admin, process immediately
    if (userRole === Role.ADMIN) {
      await this.processRefund(refund.id);
    }

    return refund;
  }

  async approveRefund(refundId: string, adminId: string) {
    const refund = await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'APPROVED',
        approved_by_id: adminId,
        approved_at: new Date(),
      },
    });

    await this.processRefund(refundId);

    return refund;
  }

  private async processRefund(refundId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: { payment: true },
    });

    if (!refund) return;

    try {
      // Process with gateway
      const gatewayResponse = await this.gateway.refundPayment(refund.payment.gateway_payment_id!, refund.amount);

      await this.prisma.refund.update({
        where: { id: refundId },
        data: {
          status: 'COMPLETED',
          gateway_refund_id: gatewayResponse.refund_id,
          completed_at: new Date(),
        },
      });

      // Update payment status
      const payment = refund.payment;
      const totalRefunded = await this.prisma.refund.aggregate({
        where: {
          payment_id: payment.id,
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      });

      const newStatus =
        (totalRefunded._sum.amount || 0) >= payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });

      this.logger.log(`Refund completed: ${refundId} - R$${refund.amount / 100}`);
    } catch (error) {
      this.logger.error(`Refund processing failed for ${refundId}`, error instanceof Error ? error.stack : String(error));
      await this.prisma.refund.update({
        where: { id: refundId },
        data: { status: 'REJECTED' },
      });
    }
  }

  async getBalance(userId: string) {
    const balance = await this.prisma.balance.findUnique({
      where: { user_id: userId },
    });

    if (!balance) {
      return {
        available: 0,
        held: 0,
        total_earned: 0,
        total_withdrawn: 0,
      };
    }

    return balance;
  }

  async getTransactions(userId: string, params?: { skip?: number; take?: number }) {
    const { skip = 0, take = 50 } = params || {};

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { user_id: userId },
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          payment: true,
          job: { select: { code: true } },
        },
      }),
      this.prisma.transaction.count({ where: { user_id: userId } }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async createWithdrawal(data: CreateWithdrawalDto, userId: string) {
    // Get professional
    const professional = await this.prisma.professional.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });

    if (!professional) {
      throw new ForbiddenException('Apenas profissionais podem solicitar saques');
    }

    // Check balance
    const balance = await this.getBalance(userId);

    if (balance.available < data.amount) {
      throw new BadRequestException('Saldo insuficiente');
    }

    if (data.amount < PAYMENT_CONFIG.minWithdrawalAmount) {
      throw new BadRequestException(`Valor mínimo de saque: R$ ${PAYMENT_CONFIG.minWithdrawalAmount / 100}`);
    }

    // Create withdrawal request
    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        professional_id: professional.id,
        amount: data.amount,
        pix_key: data.pix_key,
        status: WithdrawalStatus.PENDING,
      },
    });

    // Hold the amount
    await this.prisma.balance.update({
      where: { user_id: userId },
      data: {
        available: { decrement: data.amount },
        held: { increment: data.amount },
      },
    });

    this.logger.log(`Withdrawal requested: ${withdrawal.id} - R$${data.amount / 100} by ${professional.user.name}`);

    return withdrawal;
  }

  async approveWithdrawal(
    withdrawalId: string,
    approve: boolean,
    adminId: string,
    rejectionReason?: string
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { professional: { include: { user: true } } },
    });

    if (!withdrawal) {
      throw new NotFoundException('Saque não encontrado');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Saque já foi processado');
    }

    if (!approve) {
      // Reject withdrawal
      await this.prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.REJECTED,
          approved_by_id: adminId,
          approved_at: new Date(),
          rejection_reason: rejectionReason,
        },
      });

      // Return amount to available balance
      await this.prisma.balance.update({
        where: { user_id: withdrawal.professional.user_id },
        data: {
          available: { increment: withdrawal.amount },
          held: { decrement: withdrawal.amount },
        },
      });

      this.logger.log(`Withdrawal rejected: ${withdrawalId} - Reason: ${rejectionReason}`);

      return withdrawal;
    }

    // Approve withdrawal
    const updated = await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: WithdrawalStatus.APPROVED,
        approved_by_id: adminId,
        approved_at: new Date(),
      },
    });

    // Process withdrawal
    await this.processWithdrawal(withdrawalId);

    return updated;
  }

  private async processWithdrawal(withdrawalId: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { professional: { include: { user: true } } },
    });

    if (!withdrawal) return;

    try {
      // Update status to processing
      await this.prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: WithdrawalStatus.PROCESSING, processed_at: new Date() },
      });

      // Here you would integrate with payment gateway to transfer money
      // For now, we'll mark as completed
      // In production, integrate with Mercado Pago or similar for PIX transfers

      await this.prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.COMPLETED,
          completed_at: new Date(),
          gateway_transfer_id: `transfer_${Date.now()}`,
        },
      });

      // Update balance
      await this.prisma.balance.update({
        where: { user_id: withdrawal.professional.user_id },
        data: {
          held: { decrement: withdrawal.amount },
          total_withdrawn: { increment: withdrawal.amount },
        },
      });

      // Create transaction
      const balance = await this.prisma.balance.findUnique({
        where: { user_id: withdrawal.professional.user_id },
      });

      await this.prisma.transaction.create({
        data: {
          user_id: withdrawal.professional.user_id,
          type: TransactionType.WITHDRAWAL,
          amount: -withdrawal.amount,
          balance_before: (balance?.available || 0) + withdrawal.amount,
          balance_after: balance?.available || 0,
          description: `Saque para ${withdrawal.pix_key}`,
        },
      });

      this.logger.log(`Withdrawal completed: ${withdrawalId} - R$${withdrawal.amount / 100}`);
    } catch (error) {
      this.logger.error(`Withdrawal processing failed: ${withdrawalId}`, error instanceof Error ? error.stack : String(error));
      await this.prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: WithdrawalStatus.FAILED },
      });

      // Return amount to available
      await this.prisma.balance.update({
        where: { user_id: withdrawal.professional.user_id },
        data: {
          available: { increment: withdrawal.amount },
          held: { decrement: withdrawal.amount },
        },
      });
    }
  }

  async listWithdrawals(params?: {
    professionalId?: string;
    status?: WithdrawalStatus;
    skip?: number;
    take?: number;
  }) {
    const { skip = 0, take = 20, professionalId, status } = params || {};

    const where: any = {};

    if (professionalId) {
      where.professional_id = professionalId;
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        skip,
        take,
        orderBy: { requested_at: 'desc' },
        include: {
          professional: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          approved_by: { select: { id: true, name: true } },
        },
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getFinancialStats(userId: string) {
    const balance = await this.getBalance(userId);

    const [pendingWithdrawals, transactionsLast30Days] = await Promise.all([
      this.prisma.withdrawal.count({
        where: {
          professional: { user_id: userId },
          status: WithdrawalStatus.PENDING,
        },
      }),
      this.prisma.transaction.findMany({
        where: {
          user_id: userId,
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { created_at: 'asc' },
      }),
    ]);

    // Group transactions by day
    const transactionsByDay = transactionsLast30Days.reduce((acc, t) => {
      const date = t.created_at.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += t.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...balance,
      pending_withdrawals: pendingWithdrawals,
      transactions_last_30_days: Object.entries(transactionsByDay).map(([date, amount]) => ({
        date,
        amount,
      })),
    };
  }
}
