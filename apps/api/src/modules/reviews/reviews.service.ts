import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from '@casa-segura/database';

interface CreateReviewData {
  job_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating_overall: number;
  rating_punctuality?: number;
  rating_quality?: number;
  rating_friendliness?: number;
  comment?: string;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReviewData) {
    const job = await this.prisma.job.findUnique({
      where: { id: data.job_id },
      include: { review: true },
    });

    if (!job) {
      throw new NotFoundException('Chamado não encontrado');
    }

    if (job.review) {
      throw new BadRequestException('Este chamado já foi avaliado');
    }

    const allowedStatuses = [JobStatus.COMPLETED, JobStatus.IN_GUARANTEE, JobStatus.CLOSED];
    if (!allowedStatuses.includes(job.status as typeof allowedStatuses[number])) {
      throw new BadRequestException('Chamado não pode ser avaliado neste status');
    }

    if (job.client_id !== data.reviewer_id) {
      throw new ForbiddenException('Apenas o cliente pode avaliar o serviço');
    }

    const review = await this.prisma.review.create({
      data,
      include: {
        reviewer: { select: { id: true, name: true, avatar_url: true } },
        reviewed: { select: { id: true, name: true, avatar_url: true } },
        job: { select: { id: true, code: true } },
      },
    });

    // Update professional rating
    await this.updateProfessionalRating(data.reviewed_id);

    return review;
  }

  async findByJobId(jobId: string) {
    return this.prisma.review.findUnique({
      where: { job_id: jobId },
      include: {
        reviewer: { select: { id: true, name: true, avatar_url: true } },
        reviewed: { select: { id: true, name: true, avatar_url: true } },
      },
    });
  }

  async findByUserId(userId: string, type: 'given' | 'received') {
    const where =
      type === 'given' ? { reviewer_id: userId } : { reviewed_id: userId };

    return this.prisma.review.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        reviewer: { select: { id: true, name: true, avatar_url: true } },
        reviewed: { select: { id: true, name: true, avatar_url: true } },
        job: {
          select: {
            id: true,
            code: true,
            mission: { select: { name: true } },
          },
        },
      },
    });
  }

  async getProfessionalReviews(professionalUserId: string, params: { skip?: number; take?: number }) {
    const { skip = 0, take = 20 } = params;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { reviewed_id: professionalUserId },
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          reviewer: { select: { id: true, name: true, avatar_url: true } },
          job: {
            select: {
              id: true,
              code: true,
              mission: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.review.count({ where: { reviewed_id: professionalUserId } }),
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

  private async updateProfessionalRating(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { reviewed_id: userId },
      select: { rating_overall: true },
    });

    if (reviews.length === 0) return;

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating_overall, 0) / reviews.length;

    await this.prisma.professional.updateMany({
      where: { user_id: userId },
      data: {
        rating_avg: Math.round(avgRating * 10) / 10,
        total_jobs: { increment: 1 },
      },
    });
  }
}
