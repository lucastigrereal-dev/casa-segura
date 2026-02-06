import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from './credits.service';

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {}

  /**
   * Gera código único de referral para um usuário
   * Formato: CASA-LUCAS-XYZ
   */
  async createReferralCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se já tem código ativo
    const existingCode = await this.prisma.referralCode.findFirst({
      where: {
        user_id: userId,
        is_active: true,
      },
    });

    if (existingCode) {
      return existingCode;
    }

    // Gera código único
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userName = user.name.split(' ')[0].toUpperCase().substring(0, 10);
    const code = `CASA-${userName}-${randomString}`;

    return this.prisma.referralCode.create({
      data: {
        user_id: userId,
        code,
        bonus_amount: 5000, // R$ 50
        max_uses: 999,
        is_active: true,
      },
    });
  }

  /**
   * Aplica código de referral no cadastro de novo usuário
   */
  async applyReferralCode(code: string, newUserId: string) {
    // Busca código
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code },
      include: { user: true },
    });

    if (!referralCode) {
      throw new BadRequestException('Código de indicação inválido');
    }

    if (!referralCode.is_active) {
      throw new BadRequestException('Código de indicação expirado');
    }

    if (referralCode.times_used >= referralCode.max_uses) {
      throw new BadRequestException('Código de indicação atingiu limite de usos');
    }

    if (referralCode.expires_at && referralCode.expires_at < new Date()) {
      throw new BadRequestException('Código de indicação expirado');
    }

    // Verifica se não está se auto-indicando
    if (referralCode.user_id === newUserId) {
      throw new BadRequestException('Você não pode usar seu próprio código');
    }

    // Verifica se já usou código antes
    const existingUse = await this.prisma.referralUse.findFirst({
      where: {
        referred_id: newUserId,
      },
    });

    if (existingUse) {
      throw new BadRequestException('Você já usou um código de indicação');
    }

    // Cria registro de uso
    const referralUse = await this.prisma.referralUse.create({
      data: {
        code,
        referrer_id: referralCode.user_id,
        referred_id: newUserId,
        bonus_amount: referralCode.bonus_amount,
        status: 'PENDING', // Será COMPLETED quando referred completar 1º job
      },
    });

    // Atualiza contador de usos
    await this.prisma.referralCode.update({
      where: { code },
      data: {
        times_used: { increment: 1 },
      },
    });

    // Dá R$ 50 para o novo usuário IMEDIATAMENTE
    await this.creditsService.addCredits(
      newUserId,
      5000, // R$ 50
      'REFERRAL_SIGNUP',
      `Bônus de boas-vindas - código ${code}`,
    );

    // Dá R$ 50 para quem indicou IMEDIATAMENTE
    await this.creditsService.addCredits(
      referralCode.user_id,
      5000, // R$ 50
      'REFERRAL_BONUS',
      `${referralCode.user.name} usou seu código!`,
    );

    return referralUse;
  }

  /**
   * Quando novo usuário completa 1º job, dá bônus extra para quem indicou
   */
  async completeReferral(referredUserId: string) {
    const referralUse = await this.prisma.referralUse.findFirst({
      where: {
        referred_id: referredUserId,
        status: 'PENDING',
      },
      include: {
        referrer: true,
      },
    });

    if (!referralUse) {
      return; // Usuário não veio por indicação
    }

    // Marca como completo
    await this.prisma.referralUse.update({
      where: { id: referralUse.id },
      data: {
        status: 'COMPLETED',
        completed_at: new Date(),
      },
    });

    // Dá R$ 50 EXTRA para quem indicou
    await this.creditsService.addCredits(
      referralUse.referrer_id,
      5000, // R$ 50
      'REFERRAL_COMPLETED',
      `${referralUse.referrer.name} completou o 1º job! Bônus extra`,
    );

    // Verifica milestones (5 indicações, 10 indicações, etc)
    await this.checkReferralMilestones(referralUse.referrer_id);
  }

  /**
   * Verifica e aplica bônus de milestones
   * 5 indicações = R$ 1.000
   * 10 indicações = R$ 2.500
   */
  private async checkReferralMilestones(userId: string) {
    const completedReferrals = await this.prisma.referralUse.count({
      where: {
        referrer_id: userId,
        status: 'COMPLETED',
      },
    });

    // Milestone de 5 indicações
    if (completedReferrals === 5) {
      await this.creditsService.addCredits(
        userId,
        100000, // R$ 1.000
        'MILESTONE_5',
        '🏆 BÔNUS: 5 indicações completadas! Badge Recrutador Ouro',
      );
    }

    // Milestone de 10 indicações
    if (completedReferrals === 10) {
      await this.creditsService.addCredits(
        userId,
        250000, // R$ 2.500
        'MILESTONE_10',
        '🏆 BÔNUS ÉPICO: 10 indicações! 0% comissão por 30 dias',
      );

      // TODO: Aplicar 0% comissão por 30 dias
      // Pode ser feito criando um registro em uma tabela "user_promotions"
    }
  }

  /**
   * Busca código de referral do usuário
   */
  async getMyReferralCode(userId: string) {
    let code = await this.prisma.referralCode.findFirst({
      where: {
        user_id: userId,
        is_active: true,
      },
    });

    // Se não tem, cria
    if (!code) {
      code = await this.createReferralCode(userId);
    }

    return code;
  }

  /**
   * Estatísticas de indicações do usuário
   */
  async getMyReferralStats(userId: string) {
    const code = await this.getMyReferralCode(userId);

    const referrals = await this.prisma.referralUse.findMany({
      where: { referrer_id: userId },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'COMPLETED').length;
    const pendingReferrals = referrals.filter(r => r.status === 'PENDING').length;

    const totalEarned = referrals.reduce((sum, r) => {
      // R$ 50 inicial + R$ 50 se completou = R$ 100 por referral completo
      if (r.status === 'COMPLETED') {
        return sum + (r.bonus_amount * 2);
      }
      // Apenas R$ 50 inicial se ainda pendente
      return sum + r.bonus_amount;
    }, 0);

    // Próximo milestone
    let nextMilestone = null;
    if (completedReferrals < 5) {
      nextMilestone = {
        count: 5,
        remaining: 5 - completedReferrals,
        bonus: 100000, // R$ 1.000
        message: 'Faltam {remaining} para ganhar R$ 1.000!',
      };
    } else if (completedReferrals < 10) {
      nextMilestone = {
        count: 10,
        remaining: 10 - completedReferrals,
        bonus: 250000, // R$ 2.500
        message: 'Faltam {remaining} para ganhar R$ 2.500 + 0% comissão!',
      };
    }

    return {
      code: code.code,
      total_referrals: totalReferrals,
      completed_referrals: completedReferrals,
      pending_referrals: pendingReferrals,
      total_earned: totalEarned,
      next_milestone: nextMilestone,
      referrals: referrals.map(r => ({
        id: r.id,
        referred_name: r.referred.name,
        referred_email: r.referred.email,
        status: r.status,
        bonus_amount: r.bonus_amount,
        created_at: r.created_at,
        completed_at: r.completed_at,
      })),
    };
  }

  /**
   * Valida se código existe (para UI)
   */
  async validateCode(code: string) {
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!referralCode) {
      return { valid: false, message: 'Código inválido' };
    }

    if (!referralCode.is_active) {
      return { valid: false, message: 'Código expirado' };
    }

    if (referralCode.times_used >= referralCode.max_uses) {
      return { valid: false, message: 'Código atingiu limite de usos' };
    }

    if (referralCode.expires_at && referralCode.expires_at < new Date()) {
      return { valid: false, message: 'Código expirado' };
    }

    return {
      valid: true,
      message: `Você e ${referralCode.user.name} ganharão R$ 50 cada!`,
      referrer_name: referralCode.user.name,
    };
  }
}
