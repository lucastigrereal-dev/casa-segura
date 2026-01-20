import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, QuoteStatus } from '@casa-segura/database';

export interface CreateQuoteDto {
  job_id: string;
  professional_id: string;
  amount: number;
  notes?: string;
  available_dates: string[];
}

export interface UpdateQuoteDto {
  amount?: number;
  notes?: string;
  available_dates?: string[];
}

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateQuoteDto) {
    // Verify job exists
    const job = await this.prisma.job.findUnique({
      where: { id: data.job_id },
    });

    if (!job) {
      throw new NotFoundException(`Job ${data.job_id} not found`);
    }

    // Create quote
    const quote = await this.prisma.quote.create({
      data: {
        job_id: data.job_id,
        professional_id: data.professional_id,
        amount: data.amount,
        notes: data.notes,
        available_dates: data.available_dates,
        status: QuoteStatus.PENDING,
      },
      include: {
        job: true,
        professional: true,
      },
    });

    // Update job status if it's not already
    if (job.status === JobStatus.PENDING_QUOTE) {
      await this.prisma.job.update({
        where: { id: data.job_id },
        data: { status: JobStatus.QUOTE_SENT },
      });
    }

    return quote;
  }

  async findByJobId(jobId: string, userId: string) {
    // Get the job
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    // Check permission: only client or professionals with quotes on this job can see
    const quotes = await this.prisma.quote.findMany({
      where: { job_id: jobId },
      include: {
        professional: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar_url: true,
          },
        },
        job: true,
      },
    });

    return quotes;
  }

  async findMyQuotes(professionalId: string) {
    const quotes = await this.prisma.quote.findMany({
      where: { professional_id: professionalId },
      include: {
        job: {
          include: {
            mission: true,
            address: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
        professional: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return quotes;
  }

  async acceptQuote(quoteId: string, userId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { job: true },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    // Verify user is the client
    if (quote.job.client_id !== userId) {
      throw new ForbiddenException('You can only accept quotes for your own jobs');
    }

    // Update quote status
    await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.ACCEPTED,
        responded_at: new Date(),
      },
    });

    // Update job status and assign professional
    await this.prisma.job.update({
      where: { id: quote.job_id },
      data: {
        status: JobStatus.QUOTE_ACCEPTED,
        pro_id: quote.professional_id,
        price_final: quote.amount,
      },
    });

    // Reject all other quotes for this job
    await this.prisma.quote.updateMany({
      where: {
        job_id: quote.job_id,
        id: { not: quoteId },
      },
      data: {
        status: QuoteStatus.REJECTED,
        responded_at: new Date(),
      },
    });

    return quote;
  }

  async rejectQuote(quoteId: string, userId: string, reason?: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { job: true },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    // Verify user is the client
    if (quote.job.client_id !== userId) {
      throw new ForbiddenException('You can only reject quotes for your own jobs');
    }

    // Update quote status
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.REJECTED,
        responded_at: new Date(),
      },
      include: {
        job: true,
        professional: true,
      },
    });

    return updatedQuote;
  }

  async findById(quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        job: true,
        professional: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    return quote;
  }
}
