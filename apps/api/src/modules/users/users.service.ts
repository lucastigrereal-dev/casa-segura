import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus } from '@casa-segura/database';

interface CreateUserData {
  email: string;
  phone: string;
  password: string;
  name: string;
  role?: Role;
}

interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar_url?: string;
  status?: UserStatus;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: data.password,
        name: data.name,
        role: data.role || Role.CLIENT,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        professional: true,
        addresses: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    role?: Role;
    status?: UserStatus;
    search?: string;
  }) {
    const { skip = 0, take = 20, role, status, search } = params;

    const where = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          status: true,
          avatar_url: true,
          created_at: true,
        },
      }),
      this.prisma.user.count({ where }),
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

  async update(id: string, data: UpdateUserData) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    return this.update(id, { status });
  }

  async delete(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, clients, professionals, pending] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.CLIENT } }),
      this.prisma.user.count({ where: { role: Role.PROFESSIONAL } }),
      this.prisma.user.count({ where: { status: UserStatus.PENDING } }),
    ]);

    return { total, clients, professionals, pending };
  }
}
