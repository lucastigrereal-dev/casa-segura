import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateServiceDto {
  mission_id: string;
  price_min: number;
  price_max: number;
  description?: string;
}

export interface UpdateServiceDto {
  price_min?: number;
  price_max?: number;
  description?: string;
  is_active?: boolean;
}

@Injectable()
export class ProfessionalServicesService {
  constructor(private prisma: PrismaService) {}

  async create(professionalId: string, data: CreateServiceDto) {
    // Verify professional exists
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      throw new NotFoundException(`Professional ${professionalId} not found`);
    }

    // Verify mission exists
    const mission = await this.prisma.mission.findUnique({
      where: { id: data.mission_id },
    });

    if (!mission) {
      throw new NotFoundException(`Mission ${data.mission_id} not found`);
    }

    // Create or update service
    const service = await this.prisma.professionalService.upsert({
      where: {
        professional_id_mission_id: {
          professional_id: professionalId,
          mission_id: data.mission_id,
        },
      },
      update: data,
      create: {
        professional_id: professionalId,
        mission_id: data.mission_id,
        ...data,
      },
      include: {
        mission: true,
      },
    });

    return service;
  }

  async findByProfessionalId(professionalId: string) {
    const services = await this.prisma.professionalService.findMany({
      where: {
        professional_id: professionalId,
        is_active: true,
      },
      include: {
        mission: {
          select: {
            id: true,
            name: true,
            slug: true,
            price_min: true,
            price_max: true,
            description: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return services;
  }

  async update(serviceId: string, professionalId: string, data: UpdateServiceDto) {
    // Get service and verify ownership
    const service = await this.prisma.professionalService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    if (service.professional_id !== professionalId) {
      throw new ForbiddenException('You can only update your own services');
    }

    const updated = await this.prisma.professionalService.update({
      where: { id: serviceId },
      data,
      include: {
        mission: true,
      },
    });

    return updated;
  }

  async delete(serviceId: string, professionalId: string) {
    // Get service and verify ownership
    const service = await this.prisma.professionalService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    if (service.professional_id !== professionalId) {
      throw new ForbiddenException('You can only delete your own services');
    }

    // Soft delete by marking inactive
    const updated = await this.prisma.professionalService.update({
      where: { id: serviceId },
      data: { is_active: false },
      include: {
        mission: true,
      },
    });

    return updated;
  }

  async findById(serviceId: string) {
    const service = await this.prisma.professionalService.findUnique({
      where: { id: serviceId },
      include: {
        mission: true,
        professional: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    return service;
  }
}
