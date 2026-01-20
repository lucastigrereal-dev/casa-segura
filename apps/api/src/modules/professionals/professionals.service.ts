import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProLevel, Role } from '@casa-segura/database';

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.professional) {
      throw new BadRequestException('Usuário já é um profissional');
    }

    // Update user role to PROFESSIONAL
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.PROFESSIONAL },
    });

    return this.prisma.professional.create({
      data: {
        user_id: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        specialties: true,
      },
    });
  }

  async findById(id: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar_url: true,
            status: true,
          },
        },
        specialties: {
          include: { category: true },
        },
      },
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    return professional;
  }

  async findByUserId(userId: string) {
    return this.prisma.professional.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        specialties: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    level?: ProLevel;
    isAvailable?: boolean;
    categoryId?: string;
    search?: string;
  }) {
    const { skip = 0, take = 20, level, isAvailable, categoryId, search } = params;

    const where = {
      ...(level && { level }),
      ...(isAvailable !== undefined && { is_available: isAvailable }),
      ...(categoryId && {
        specialties: { some: { category_id: categoryId } },
      }),
      ...(search && {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.professional.findMany({
        where,
        skip: skip || 0,
        take: take || 20,
        orderBy: { rating_avg: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar_url: true,
              status: true,
            },
          },
          specialties: {
            include: { category: true },
          },
        },
      }),
      this.prisma.professional.count({ where }),
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

  async update(
    id: string,
    data: {
      pix_key?: string;
      is_available?: boolean;
      work_radius_km?: number;
    },
  ) {
    return this.prisma.professional.update({
      where: { id },
      data,
    });
  }

  async updateVerification(
    id: string,
    data: {
      cpf_verified?: boolean;
      selfie_verified?: boolean;
      address_verified?: boolean;
    },
  ) {
    return this.prisma.professional.update({
      where: { id },
      data,
    });
  }

  async updateLevel(id: string, level: ProLevel) {
    return this.prisma.professional.update({
      where: { id },
      data: { level },
    });
  }

  async addSpecialty(professionalId: string, specialtyId: string) {
    return this.prisma.professional.update({
      where: { id: professionalId },
      data: {
        specialties: {
          connect: { id: specialtyId },
        },
      },
      include: { specialties: true },
    });
  }

  async removeSpecialty(professionalId: string, specialtyId: string) {
    return this.prisma.professional.update({
      where: { id: professionalId },
      data: {
        specialties: {
          disconnect: { id: specialtyId },
        },
      },
      include: { specialties: true },
    });
  }

  async getStats() {
    const [total, available, verified] = await Promise.all([
      this.prisma.professional.count(),
      this.prisma.professional.count({ where: { is_available: true } }),
      this.prisma.professional.count({
        where: {
          cpf_verified: true,
          selfie_verified: true,
          address_verified: true,
        },
      }),
    ]);

    const byLevel = await this.prisma.professional.groupBy({
      by: ['level'],
      _count: true,
    });

    return {
      total,
      available,
      verified,
      byLevel: byLevel.reduce(
        (acc, item) => {
          acc[item.level] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async getMyStats(userId: string) {
    // Get professional by user_id
    const professional = await this.findByUserId(userId);

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    // Get earnings this month
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const [jobsMonth, jobsWeek, pendingQuotes, totalJobs, avgRating] = await Promise.all([
      this.prisma.job.aggregate({
        where: {
          pro_id: userId,
          completed_at: { gte: thisMonth },
          status: { in: ['COMPLETED', 'CLOSED'] },
        },
        _sum: { price_final: true },
      }),
      this.prisma.job.aggregate({
        where: {
          pro_id: userId,
          completed_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { in: ['COMPLETED', 'CLOSED'] },
        },
        _sum: { price_final: true },
      }),
      this.prisma.quote.count({
        where: { professional_id: userId, status: 'PENDING' },
      }),
      this.prisma.job.count({
        where: { pro_id: userId, status: { in: ['COMPLETED', 'CLOSED'] } },
      }),
      this.prisma.review.aggregate({
        where: { reviewed_id: userId },
        _avg: { rating_overall: true },
      }),
    ]);

    // Calculate acceptance rate
    const totalQuotes = await this.prisma.quote.count({
      where: { professional_id: userId },
    });
    const acceptedQuotes = await this.prisma.quote.count({
      where: { professional_id: userId, status: 'ACCEPTED' },
    });
    const acceptanceRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

    // Get earnings for last 7 days
    const earnings_last_7_days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayEarnings = await this.prisma.job.aggregate({
        where: {
          pro_id: userId,
          completed_at: { gte: day, lt: nextDay },
          status: { in: ['COMPLETED', 'CLOSED'] },
        },
        _sum: { price_final: true },
      });

      earnings_last_7_days.push({
        date: day.toISOString().split('T')[0],
        amount: (dayEarnings._sum.price_final || 0) * 0.8, // 20% commission
      });
    }

    return {
      earnings_month: (jobsMonth._sum.price_final || 0) * 0.8,
      earnings_week: (jobsWeek._sum.price_final || 0) * 0.8,
      pending_quotes: pendingQuotes,
      acceptance_rate: Math.round(acceptanceRate),
      rating_avg: avgRating._avg.rating_overall || 0,
      total_jobs: totalJobs,
      earnings_last_7_days,
    };
  }

  async getMyEarnings(userId: string, params?: {
    skip?: number;
    take?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const professional = await this.findByUserId(userId);

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    // Calculate available balance (earned money minus fees)
    const completedJobs = await this.prisma.job.findMany({
      where: {
        pro_id: userId,
        status: { in: ['COMPLETED', 'CLOSED'] },
      },
      select: { price_final: true },
    });

    const totalEarned = completedJobs.reduce((sum, job) => sum + (job.price_final || 0), 0);
    const platformFee = totalEarned * 0.2; // 20%
    const available_balance = totalEarned - platformFee;

    // Get earnings this month
    const thisMonth = new Date();
    thisMonth.setDate(1);

    const monthEarnings = await this.prisma.job.aggregate({
      where: {
        pro_id: userId,
        completed_at: { gte: thisMonth },
        status: { in: ['COMPLETED', 'CLOSED'] },
      },
      _sum: { price_final: true },
    });

    // Build transactions
    const transactions = [];

    // Add earning transactions
    const jobs = await this.prisma.job.findMany({
      where: { pro_id: userId, status: { in: ['COMPLETED', 'CLOSED'] } },
      select: { id: true, code: true, price_final: true, completed_at: true },
      orderBy: { completed_at: 'desc' },
      take: params?.take || 50,
      skip: params?.skip || 0,
    });

    for (const job of jobs) {
      // Earning
      transactions.push({
        id: `${job.id}-earning`,
        type: 'EARNING',
        amount: job.price_final || 0,
        job_code: job.code,
        date: job.completed_at,
        description: `Recebimento - ${job.code}`,
      });

      // Fee
      transactions.push({
        id: `${job.id}-fee`,
        type: 'FEE',
        amount: -(job.price_final || 0) * 0.2,
        job_code: job.code,
        date: job.completed_at,
        description: `Comissão (20%) - ${job.code}`,
      });
    }

    return {
      available_balance,
      total_earnings_month: (monthEarnings._sum.price_final || 0) * 0.8,
      platform_fee_rate: 0.2,
      transactions: transactions.sort((a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      ),
    };
  }

  async toggleAvailability(userId: string, isAvailable: boolean) {
    const professional = await this.findByUserId(userId);

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    return this.prisma.professional.update({
      where: { id: professional.id },
      data: { is_available: isAvailable },
    });
  }

  async updateRadius(userId: string, work_radius_km: number) {
    if (work_radius_km < 5 || work_radius_km > 100) {
      throw new BadRequestException('Raio deve estar entre 5 e 100 km');
    }

    const professional = await this.findByUserId(userId);

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    return this.prisma.professional.update({
      where: { id: professional.id },
      data: { work_radius_km },
    });
  }
}
