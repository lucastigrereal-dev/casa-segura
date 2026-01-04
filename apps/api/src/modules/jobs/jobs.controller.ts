import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role, JobStatus, Prisma } from '@casa-segura/database';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar chamados' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'status', required: false, enum: JobStatus })
  @ApiQuery({ name: 'missionId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(
    @CurrentUser() user: { sub: string; role: Role },
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: JobStatus,
    @Query('missionId') missionId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    // Clients see only their jobs, professionals see assigned jobs, admins see all
    const params: {
      skip?: number;
      take?: number;
      status?: JobStatus;
      missionId?: string;
      categoryId?: string;
      clientId?: string;
      proId?: string;
    } = { skip, take, status, missionId, categoryId };

    if (user.role === Role.CLIENT) {
      params.clientId = user.sub;
    } else if (user.role === Role.PROFESSIONAL) {
      params.proId = user.sub;
    }

    return this.jobsService.findAll(params);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Estatísticas de chamados (Admin)' })
  getStats() {
    return this.jobsService.getStats();
  }

  @Get('my')
  @ApiOperation({ summary: 'Meus chamados' })
  getMyJobs(
    @CurrentUser() user: { sub: string; role: Role },
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: JobStatus,
  ) {
    if (user.role === Role.PROFESSIONAL) {
      return this.jobsService.findAll({ proId: user.sub, skip, take, status });
    }
    return this.jobsService.findAll({ clientId: user.sub, skip, take, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter chamado por ID' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Obter chamado por código' })
  findByCode(@Param('code') code: string) {
    return this.jobsService.findByCode(code);
  }

  @Post()
  @ApiOperation({ summary: 'Criar chamado' })
  create(
    @CurrentUser('sub') userId: string,
    @Body()
    data: {
      mission_id: string;
      address_id: string;
      scheduled_date?: Date;
      scheduled_window?: string;
      diagnosis_answers?: Prisma.InputJsonValue;
      photos_before?: string[];
    },
  ) {
    return this.jobsService.create({
      client_id: userId,
      ...data,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do chamado' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: JobStatus,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.jobsService.updateStatus(id, status, user.sub, user.role);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Atribuir profissional ao chamado (Admin)' })
  assignPro(@Param('id') id: string, @Body('proId') proId: string) {
    return this.jobsService.assignPro(id, proId);
  }

  @Patch(':id/photos-after')
  @ApiOperation({ summary: 'Adicionar fotos após o serviço' })
  addPhotosAfter(@Param('id') id: string, @Body('photos') photos: string[]) {
    return this.jobsService.addPhotosAfter(id, photos);
  }

  @Patch(':id/price')
  @Roles(Role.ADMIN, Role.PROFESSIONAL)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Atualizar preço do chamado' })
  updatePrice(
    @Param('id') id: string,
    @Body() data: { priceFinal: number; priceAdditional?: number },
  ) {
    return this.jobsService.updatePrice(id, data.priceFinal, data.priceAdditional);
  }
}
