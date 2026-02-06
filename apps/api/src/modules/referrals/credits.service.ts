import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Adiciona créditos para um usuário
   */
  async addCredits(
    userId: string,
    amount: number,
    type: string,
    description: string,
    jobId?: string,
    referralId?: string,
  ) {
    // Busca ou cria UserCredit
    let userCredit = await this.prisma.userCredit.findUnique({
      where: { user_id: userId },
    });

    if (!userCredit) {
      userCredit = await this.prisma.userCredit.create({
        data: {
          user_id: userId,
          amount: 0,
        },
      });
    }

    const newBalance = userCredit.amount + amount;

    // Atualiza saldo
    await this.prisma.userCredit.update({
      where: { user_id: userId },
      data: { amount: newBalance },
    });

    // Cria transação
    await this.prisma.creditTransaction.create({
      data: {
        user_id: userId,
        amount,
        type,
        description,
        job_id: jobId,
        referral_id: referralId,
        balance_after: newBalance,
      },
    });

    return { new_balance: newBalance };
  }

  /**
   * Remove créditos (quando usado em job)
   */
  async useCredits(userId: string, amount: number, jobId: string, description: string) {
    const userCredit = await this.prisma.userCredit.findUnique({
      where: { user_id: userId },
    });

    if (!userCredit || userCredit.amount < amount) {
      throw new BadRequestException('Créditos insuficientes');
    }

    const newBalance = userCredit.amount - amount;

    // Atualiza saldo
    await this.prisma.userCredit.update({
      where: { user_id: userId },
      data: { amount: newBalance },
    });

    // Cria transação (negativa)
    await this.prisma.creditTransaction.create({
      data: {
        user_id: userId,
        amount: -amount,
        type: 'CREDIT_USED',
        description,
        job_id: jobId,
        balance_after: newBalance,
      },
    });

    return { new_balance: newBalance };
  }

  /**
   * Busca saldo de créditos do usuário
   */
  async getBalance(userId: string) {
    const userCredit = await this.prisma.userCredit.findUnique({
      where: { user_id: userId },
    });

    return {
      balance: userCredit?.amount || 0,
      balance_formatted: this.formatCurrency(userCredit?.amount || 0),
    };
  }

  /**
   * Histórico de transações
   */
  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.creditTransaction.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      transactions: transactions.map(t => ({
        ...t,
        amount_formatted: this.formatCurrency(t.amount),
        balance_after_formatted: this.formatCurrency(t.balance_after),
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Formata centavos para Real
   */
  private formatCurrency(cents: number): string {
    const reais = cents / 100;
    return `R$ ${reais.toFixed(2).replace('.', ',')}`;
  }

  /**
   * Aplica créditos em um job (desconto)
   */
  async applyCreditsToJob(userId: string, jobId: string, jobAmount: number) {
    const userCredit = await this.prisma.userCredit.findUnique({
      where: { user_id: userId },
    });

    if (!userCredit || userCredit.amount === 0) {
      return {
        credits_applied: 0,
        final_amount: jobAmount,
        remaining_credits: 0,
      };
    }

    // Usa todos os créditos ou apenas o necessário
    const creditsToUse = Math.min(userCredit.amount, jobAmount);
    const finalAmount = jobAmount - creditsToUse;

    if (creditsToUse > 0) {
      await this.useCredits(
        userId,
        creditsToUse,
        jobId,
        `Créditos aplicados no job #${jobId.substring(0, 8)}`,
      );
    }

    return {
      credits_applied: creditsToUse,
      credits_applied_formatted: this.formatCurrency(creditsToUse),
      final_amount: finalAmount,
      final_amount_formatted: this.formatCurrency(finalAmount),
      remaining_credits: userCredit.amount - creditsToUse,
    };
  }
}
