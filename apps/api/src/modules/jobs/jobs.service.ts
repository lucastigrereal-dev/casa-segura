import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, Role, Prisma } from '@casa-segura/database';
import { generateJobCode } from '@casa-segura/shared';

interface CreateJobData {
  client_id: string;
  mission_id: string;
  address_id: string;
  scheduled_date?: Date;
  scheduled_window?: string;
  diagnosis_answers?: Prisma.InputJsonValue;
  photos_before?: string[];
}

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateJobData) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: data.mission_id },
    });

    if (!mission) {
      throw new NotFoundException('Missão não encontrada');
    }

    return this.prisma.job.create({
      data: {
        code: generateJobCode(),
        client_id: data.client_id,
        mission_id: data.mission_id,
        address_id: data.address_id,
        scheduled_date: data.scheduled_date,
        scheduled_window: data.scheduled_window,
        diagnosis_answers: data.diagnosis_answers,
        photos_before: data.photos_before || [],
        price_estimated: mission.price_default,
        status: JobStatus.CREATED,
      },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        mission: { include: { category: true } },
        address: true,
      },
    });
  }

  async findById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true, avatar_url: true } },
        pro: { select: { id: true, name: true, email: true, phone: true, avatar_url: true } },
        mission: { include: { category: true } },
        address: true,
        review: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Chamado não encontrado');
    }

    return job;
  }

  async findByCode(code: string) {
    const job = await this.prisma.job.findUnique({
      where: { code },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        pro: { select: { id: true, name: true, email: true, phone: true } },
        mission: { include: { category: true } },
        address: true,
        review: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Chamado não encontrado');
    }

    return job;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    clientId?: string;
    proId?: string;
    status?: JobStatus;
    missionId?: string;
    categoryId?: string;
  }) {
    const { skip = 0, take = 20, clientId, proId, status, missionId, categoryId } = params;

    const where = {
      ...(clientId && { client_id: clientId }),
      ...(proId && { pro_id: proId }),
      ...(status && { status }),
      ...(missionId && { mission_id: missionId }),
      ...(categoryId && { mission: { category_id: categoryId } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          client: { select: { id: true, name: true, avatar_url: true } },
          pro: { select: { id: true, name: true, avatar_url: true } },
          mission: { include: { category: true } },
          address: { select: { city: true, neighborhood: true } },
        },
      }),
      this.prisma.job.count({ where }),
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

  async updateStatus(id: string, status: JobStatus, userId: string, userRole: Role) {
    const job = await this.findById(id);

    // Validate status transition
    if (!this.isValidStatusTransition(job.status, status, userRole)) {
      throw new ForbiddenException('Transição de status inválida');
    }

    const updateData: Record<string, unknown> = { status };

    // Add timestamps based on status
    if (status === JobStatus.IN_PROGRESS) {
      updateData.started_at = new Date();
    } else if (status === JobStatus.COMPLETED) {
      updateData.completed_at = new Date();
      updateData.guarantee_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    return this.prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, email: true } },
        pro: { select: { id: true, name: true, email: true } },
        mission: true,
      },
    });
  }

  async assignPro(jobId: string, proId: string) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        pro_id: proId,
        status: JobStatus.ASSIGNED,
      },
    });
  }

  async addPhotosAfter(id: string, photos: string[]) {
    const job = await this.findById(id);

    return this.prisma.job.update({
      where: { id },
      data: {
        photos_after: [...job.photos_after, ...photos],
      },
    });
  }

  async updatePrice(id: string, priceFinal: number, priceAdditional?: number) {
    return this.prisma.job.update({
      where: { id },
      data: {
        price_final: priceFinal,
        price_additional: priceAdditional,
      },
    });
  }

  async getStats() {
    const [total, byStatus, revenue] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.job.aggregate({
        where: { status: { in: [JobStatus.COMPLETED, JobStatus.CLOSED] } },
        _sum: { price_final: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      totalRevenue: revenue._sum.price_final || 0,
    };
  }

  private isValidStatusTransition(
    current: JobStatus,
    next: JobStatus,
    role: Role,
  ): boolean {
    const transitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.CREATED]: [JobStatus.QUOTED, JobStatus.CANCELLED],
      [JobStatus.QUOTED]: [JobStatus.PENDING_PAYMENT, JobStatus.CANCELLED],
      [JobStatus.PENDING_PAYMENT]: [JobStatus.PAID, JobStatus.CANCELLED],
      [JobStatus.PAID]: [JobStatus.ASSIGNED, JobStatus.CANCELLED],
      [JobStatus.ASSIGNED]: [JobStatus.PRO_ACCEPTED, JobStatus.CANCELLED],
      [JobStatus.PRO_ACCEPTED]: [JobStatus.PRO_ON_WAY, JobStatus.CANCELLED],
      [JobStatus.PRO_ON_WAY]: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
      [JobStatus.IN_PROGRESS]: [JobStatus.PENDING_APPROVAL, JobStatus.DISPUTED],
      [JobStatus.PENDING_APPROVAL]: [JobStatus.COMPLETED, JobStatus.DISPUTED],
      [JobStatus.COMPLETED]: [JobStatus.IN_GUARANTEE, JobStatus.CLOSED],
      [JobStatus.IN_GUARANTEE]: [JobStatus.CLOSED, JobStatus.DISPUTED],
      [JobStatus.CLOSED]: [],
      [JobStatus.CANCELLED]: [],
      [JobStatus.DISPUTED]: [JobStatus.CLOSED],
    };

    // Admins can do any transition
    if (role === Role.ADMIN) {
      return true;
    }

    return transitions[current]?.includes(next) || false;
  }
}
