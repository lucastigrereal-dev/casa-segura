import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfessionalServicesService, CreateServiceDto, UpdateServiceDto } from './professional-services.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser, Public } from '../../common/decorators';
import { Role } from '@casa-segura/database';

@ApiTags('professional-services')
@Controller('professionals')
export class ProfessionalServicesController {
  constructor(private readonly servicesService: ProfessionalServicesService) {}

  @Get(':id/services')
  @Public()
  @ApiOperation({ summary: 'Listar serviços que um profissional oferece' })
  async findProfessionalServices(@Param('id') id: string) {
    return this.servicesService.findByProfessionalId(id);
  }

  @Post('me/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSIONAL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profissional: adicionar serviço ao cardápio' })
  async createService(
    @CurrentUser('sub') userId: string,
    @Body() data: CreateServiceDto,
  ) {
    // Get professional by user_id
    const professional = await this.servicesService['prisma'].professional.findUnique({
      where: { user_id: userId },
    });

    if (!professional) {
      throw new Error('Professional profile not found');
    }

    return this.servicesService.create(professional.id, data);
  }

  @Patch('me/services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSIONAL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar serviço' })
  async updateService(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() data: UpdateServiceDto,
  ) {
    // Get professional by user_id
    const professional = await this.servicesService['prisma'].professional.findUnique({
      where: { user_id: userId },
    });

    if (!professional) {
      throw new Error('Professional profile not found');
    }

    return this.servicesService.update(id, professional.id, data);
  }

  @Delete('me/services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSIONAL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover serviço' })
  async deleteService(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    // Get professional by user_id
    const professional = await this.servicesService['prisma'].professional.findUnique({
      where: { user_id: userId },
    });

    if (!professional) {
      throw new Error('Professional profile not found');
    }

    return this.servicesService.delete(id, professional.id);
  }
}
