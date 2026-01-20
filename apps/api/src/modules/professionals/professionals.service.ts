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
}
