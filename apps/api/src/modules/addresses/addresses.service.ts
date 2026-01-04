import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAddressData {
  user_id: string;
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state?: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAddressData) {
    // If this is the first address or is_default is true, set as default
    if (data.is_default) {
      await this.prisma.address.updateMany({
        where: { user_id: data.user_id },
        data: { is_default: false },
      });
    }

    const addressCount = await this.prisma.address.count({
      where: { user_id: data.user_id },
    });

    return this.prisma.address.create({
      data: {
        ...data,
        is_default: addressCount === 0 ? true : data.is_default,
        state: data.state || 'RS',
      },
    });
  }

  async findById(id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return address;
  }

  async findByUserId(userId: string) {
    return this.prisma.address.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<CreateAddressData, 'user_id'>>,
  ) {
    const address = await this.findById(id);

    if (address.user_id !== userId) {
      throw new ForbiddenException('Sem permissão para editar este endereço');
    }

    if (data.is_default) {
      await this.prisma.address.updateMany({
        where: { user_id: userId, id: { not: id } },
        data: { is_default: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data,
    });
  }

  async setDefault(id: string, userId: string) {
    const address = await this.findById(id);

    if (address.user_id !== userId) {
      throw new ForbiddenException('Sem permissão para editar este endereço');
    }

    await this.prisma.address.updateMany({
      where: { user_id: userId },
      data: { is_default: false },
    });

    return this.prisma.address.update({
      where: { id },
      data: { is_default: true },
    });
  }

  async delete(id: string, userId: string) {
    const address = await this.findById(id);

    if (address.user_id !== userId) {
      throw new ForbiddenException('Sem permissão para excluir este endereço');
    }

    await this.prisma.address.delete({
      where: { id },
    });

    // If deleted address was default, set another as default
    if (address.is_default) {
      const firstAddress = await this.prisma.address.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      if (firstAddress) {
        await this.prisma.address.update({
          where: { id: firstAddress.id },
          data: { is_default: true },
        });
      }
    }

    return { success: true };
  }
}
