import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel } from '@casa-segura/database';

interface CreateMissionData {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  price_min: number;
  price_max: number;
  price_default: number;
  duration_min: number;
  duration_max: number;
  requires_photo?: boolean;
  risk_level?: RiskLevel;
}

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMissionData) {
    const existing = await this.prisma.mission.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('Missão com esse slug já existe');
    }

    return this.prisma.mission.create({
      data,
      include: { category: true },
    });
  }

  async findAll(params: {
    categoryId?: string;
    includeInactive?: boolean;
    search?: string;
  }) {
    const { categoryId, includeInactive = false, search } = params;

    return this.prisma.mission.findMany({
      where: {
        ...(categoryId && { category_id: categoryId }),
        ...(!includeInactive && { is_active: true }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
      include: {
        category: true,
        _count: { select: { jobs: true } },
      },
    });
  }

  async findById(id: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!mission) {
      throw new NotFoundException('Missão não encontrada');
    }

    return mission;
  }

  async findBySlug(slug: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!mission) {
      throw new NotFoundException('Missão não encontrada');
    }

    return mission;
  }

  async update(
    id: string,
    data: Partial<CreateMissionData> & { is_active?: boolean },
  ) {
    await this.findById(id);

    if (data.slug) {
      const existing = await this.prisma.mission.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });

      if (existing) {
        throw new ConflictException('Missão com esse slug já existe');
      }
    }

    return this.prisma.mission.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.mission.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, active, byCategory] = await Promise.all([
      this.prisma.mission.count(),
      this.prisma.mission.count({ where: { is_active: true } }),
      this.prisma.mission.groupBy({
        by: ['category_id'],
        _count: true,
      }),
    ]);

    return { total, active, byCategory };
  }
}
