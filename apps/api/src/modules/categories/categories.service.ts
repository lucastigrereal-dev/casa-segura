import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    icon?: string;
    color?: string;
    order?: number;
  }) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('Categoria com esse slug já existe');
    }

    return this.prisma.category.create({
      data,
      include: {
        missions: true,
        specialties: true,
      },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { is_active: true },
      orderBy: { order: 'asc' },
      include: {
        missions: {
          where: { is_active: true },
        },
        _count: {
          select: {
            missions: true,
            specialties: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        missions: true,
        specialties: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        missions: {
          where: { is_active: true },
        },
        specialties: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      icon?: string;
      color?: string;
      is_active?: boolean;
      order?: number;
    },
  ) {
    const category = await this.findById(id);

    if (data.slug && data.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new ConflictException('Categoria com esse slug já existe');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
