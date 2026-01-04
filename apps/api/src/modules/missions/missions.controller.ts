import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, Public } from '../../common/decorators';
import { Role, RiskLevel } from '@casa-segura/database';

@ApiTags('missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar missões' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'includeInactive', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('includeInactive') includeInactive?: boolean,
    @Query('search') search?: string,
  ) {
    return this.missionsService.findAll({ categoryId, includeInactive, search });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estatísticas de missões (Admin)' })
  getStats() {
    return this.missionsService.getStats();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obter missão por ID' })
  findOne(@Param('id') id: string) {
    return this.missionsService.findById(id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obter missão por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.missionsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar missão (Admin)' })
  create(
    @Body()
    data: {
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
    },
  ) {
    return this.missionsService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar missão (Admin)' })
  update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      slug?: string;
      description?: string;
      category_id?: string;
      price_min?: number;
      price_max?: number;
      price_default?: number;
      duration_min?: number;
      duration_max?: number;
      requires_photo?: boolean;
      risk_level?: RiskLevel;
      is_active?: boolean;
    },
  ) {
    return this.missionsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir missão (Admin)' })
  delete(@Param('id') id: string) {
    return this.missionsService.delete(id);
  }
}
